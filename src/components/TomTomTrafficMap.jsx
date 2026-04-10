import { useEffect, useRef, useState } from 'react';

const DEFAULT_CENTER = [67.0011, 24.8607];
const ROUTE_SOURCE_ID = 'tomtom-live-route';
const ROUTE_LAYER_ID = 'tomtom-live-route-line';

function getNativeMap(tomTomMap) {
  return tomTomMap?.mapLibreMap ?? tomTomMap?.map ?? tomTomMap;
}

function getMapStyle(isLightMode) {
  return {
    type: 'standard',
    id: isLightMode ? 'standardLight' : 'standardDark',
    include: ['trafficFlow'],
  };
}

function formatDistance(meters) {
  if (!Number.isFinite(meters)) {
    return 'Not available';
  }

  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(meters >= 10000 ? 0 : 1)} km`;
  }

  return `${Math.round(meters)} m`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) {
    return 'Not available';
  }

  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}

function buildSearchUrl(query, apiKey) {
  const url = new URL(`https://api.tomtom.com/search/2/search/${encodeURIComponent(query.trim())}.json`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrySet', 'PK');
  return url;
}

function buildRouteUrl(start, destination, apiKey) {
  const url = new URL(
    `https://api.tomtom.com/routing/1/calculateRoute/${start.lat},${start.lon}:${destination.lat},${destination.lon}/json`,
  );
  url.searchParams.set('key', apiKey);
  url.searchParams.set('traffic', 'true');
  url.searchParams.set('routeType', 'fastest');
  url.searchParams.set('computeTravelTimeFor', 'all');
  return url;
}

async function fetchTomTomJson(url, signal) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    let message = `TomTom returned ${response.status}`;

    try {
      const errorBody = await response.json();
      message = errorBody?.detailedError?.message ?? errorBody?.errorText ?? message;
    } catch {
      // Keep the status-only fallback if TomTom does not send JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

function getSearchPosition(searchResponse, locationName) {
  const result = searchResponse?.results?.[0];
  const position = result?.position;

  if (!Number.isFinite(position?.lat) || !Number.isFinite(position?.lon)) {
    throw new Error(`Could not find ${locationName}. Try a more specific Pakistan location name.`);
  }

  return {
    lat: position.lat,
    lon: position.lon,
    label: result?.address?.freeformAddress ?? locationName,
  };
}

function getRouteCoordinates(route) {
  const points = route?.legs?.flatMap((leg) => leg.points ?? []) ?? [];
  return points
    .filter((point) => Number.isFinite(point.longitude) && Number.isFinite(point.latitude))
    .map((point) => [point.longitude, point.latitude]);
}

function fitRouteBounds(map, coordinates) {
  if (!coordinates.length) {
    return;
  }

  const bounds = coordinates.reduce(
    (currentBounds, [longitude, latitude]) => [
      [Math.min(currentBounds[0][0], longitude), Math.min(currentBounds[0][1], latitude)],
      [Math.max(currentBounds[1][0], longitude), Math.max(currentBounds[1][1], latitude)],
    ],
    [
      [coordinates[0][0], coordinates[0][1]],
      [coordinates[0][0], coordinates[0][1]],
    ],
  );

  map.fitBounds(bounds, { padding: 70, duration: 900, maxZoom: 13 });
}

export default function TomTomTrafficMap({
  apiKey,
  isLightMode,
  routeColor = '#22c55e',
  routeStart,
  routeDestination,
  routeRequestId,
  onRouteResult,
  onRouteError,
  onRetryMap,
}) {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const routeGeoJsonRef = useRef(null);
  const [loadError, setLoadError] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);

  const drawRoute = (geoJson, color) => {
    const map = getNativeMap(mapRef.current);

    if (!map || !map.isStyleLoaded?.()) {
      return;
    }

    if (!map.addSource || !map.addLayer || !map.getLayer) {
      return;
    }

    const existingSource = map.getSource?.(ROUTE_SOURCE_ID);
    if (existingSource?.setData) {
      existingSource.setData(geoJson);
    } else {
      map.addSource(ROUTE_SOURCE_ID, {
        type: 'geojson',
        data: geoJson,
      });
    }

    if (!map.getLayer?.(ROUTE_LAYER_ID)) {
      map.addLayer({
        id: ROUTE_LAYER_ID,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        paint: {
          'line-color': color,
          'line-width': 6,
          'line-opacity': 0.95,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });
    } else {
      map.setPaintProperty(ROUTE_LAYER_ID, 'line-color', color);
    }
  };

  useEffect(() => {
    if (!apiKey || !mapNodeRef.current) {
      return undefined;
    }

    let isMounted = true;

    const initializeTomTom = async () => {
      try {
        const [{ TomTomConfig }, { TomTomMap, TrafficFlowModule }] = await Promise.all([
          import('@tomtom-org/maps-sdk/core'),
          import('@tomtom-org/maps-sdk/map'),
        ]);

        if (!isMounted || !mapNodeRef.current) {
          return;
        }

        TomTomConfig.instance.put({ apiKey });

        const map = new TomTomMap({
          apiKey,
          style: getMapStyle(isLightMode),
          mapLibre: {
            container: mapNodeRef.current,
            center: DEFAULT_CENTER,
            zoom: 12,
          },
        });

        mapRef.current = map;

        await TrafficFlowModule.get(map, { visible: true, ensureAddedToStyle: true });

        if (isMounted) {
          setIsMapReady(true);
        }
      } catch {
        if (isMounted) {
          setLoadError('TomTom map could not load. Check your API key, quota, and network.');
        }
      }
    };

    initializeTomTom();

    return () => {
      isMounted = false;
      getNativeMap(mapRef.current)?.remove?.();
      mapRef.current = null;
      routeGeoJsonRef.current = null;
      setIsMapReady(false);
    };
  }, [apiKey]);

  useEffect(() => {
    if (!mapRef.current || !isMapReady) {
      return;
    }

    const map = getNativeMap(mapRef.current);
    const redrawRoute = () => {
      if (routeGeoJsonRef.current) {
        drawRoute(routeGeoJsonRef.current, routeColor);
      }
    };

    mapRef.current.setStyle(getMapStyle(isLightMode), { keepState: true });
    map?.once?.('idle', redrawRoute);
  }, [isLightMode, isMapReady]);

  useEffect(() => {
    if (routeGeoJsonRef.current) {
      drawRoute(routeGeoJsonRef.current, routeColor);
    }
  }, [routeColor]);

  useEffect(() => {
    if (!routeRequestId || !isMapReady || !apiKey) {
      return undefined;
    }

    if (!routeStart.trim() || !routeDestination.trim()) {
      onRouteError('Please enter both start and destination.');
      return undefined;
    }

    const controller = new AbortController();

    const calculateLiveRoute = async () => {
      try {
        const [startSearch, destinationSearch] = await Promise.all([
          fetchTomTomJson(buildSearchUrl(routeStart, apiKey), controller.signal),
          fetchTomTomJson(buildSearchUrl(routeDestination, apiKey), controller.signal),
        ]);

        const start = getSearchPosition(startSearch, routeStart);
        const destination = getSearchPosition(destinationSearch, routeDestination);
        const routeResponse = await fetchTomTomJson(buildRouteUrl(start, destination, apiKey), controller.signal);
        const route = routeResponse?.routes?.[0];
        const summary = route?.summary;
        const coordinates = getRouteCoordinates(route);

        if (!summary || !coordinates.length) {
          onRouteError('TomTom found the places, but did not return a driveable route. Try more specific city names.');
          return;
        }

        const routeGeoJson = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates,
          },
          properties: {},
        };

        routeGeoJsonRef.current = routeGeoJson;
        drawRoute(routeGeoJson, routeColor);
        fitRouteBounds(getNativeMap(mapRef.current), coordinates);

        onRouteResult({
          distance: formatDistance(summary.lengthInMeters),
          duration: formatDuration(summary.noTrafficTravelTimeInSeconds ?? summary.travelTimeInSeconds),
          durationInTraffic: formatDuration(summary.travelTimeInSeconds),
          trafficDelay: formatDuration(summary.trafficDelayInSeconds),
          trafficDelaySeconds: summary.trafficDelayInSeconds ?? 0,
          travelTimeSeconds: summary.travelTimeInSeconds ?? 0,
          noTrafficTravelTimeSeconds: summary.noTrafficTravelTimeInSeconds ?? summary.travelTimeInSeconds ?? 0,
          summary: `${start.label} to ${destination.label}`,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          onRouteError(`TomTom route request failed: ${error.message}`);
        }
      }
    };

    calculateLiveRoute();

    return () => controller.abort();
  }, [apiKey, routeColor, routeRequestId, routeStart, routeDestination, isMapReady, onRouteResult, onRouteError]);

  return (
    <div className="absolute inset-0 z-0">
      <div ref={mapNodeRef} className="h-full w-full" />
      {!isMapReady && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 p-6 text-center text-sm font-semibold text-slate-100">
          Loading live traffic map...
        </div>
      )}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85 p-6 text-center text-sm font-semibold text-red-100">
          <div className="max-w-sm rounded-2xl border border-red-300/30 bg-slate-900/90 p-4 shadow-lg">
            <p>{loadError}</p>
            {onRetryMap && (
              <button type="button" onClick={onRetryMap} className="mt-3 rounded-xl border border-red-200/30 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition hover:bg-red-400/20">
                Retry loading map
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



