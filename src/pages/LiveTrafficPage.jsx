import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TrafficControls from '../components/TrafficControls.jsx';
import TrafficLegend from '../components/TrafficLegend.jsx';
import TrafficMap from '../components/TrafficMap.jsx';
import TrafficStatusBadge from '../components/TrafficStatusBadge.jsx';
import MjTrafficChartsPanel from '../components/MjTrafficChartsPanel.jsx';

// Single source of truth for traffic state, colors, and animated UI copy.
const trafficLevels = [
  {
    id: 'low',
    label: 'Low',
    description: 'Smooth flow',
    controlHint: 'Clear route',
    statusText: 'Roads are moving smoothly across the smart grid.',
    mapMessage: 'Low density detected. Suggested route stays open.',
    estimatedDelay: '2 min delay',
    density: 28,
    overlayColor: 'rgba(34, 197, 94, 0.42)',
    overlayOpacity: 0.35,
    overlayGlow: 'inset 0 0 90px rgba(34, 197, 94, 0.45)',
    routeColor: '#22c55e',
    dotClass: 'bg-emerald-400 shadow-emerald-400/80',
    vehicleClass: 'bg-emerald-300 shadow-lg shadow-emerald-400/50',
    pillClass: 'border-emerald-300/50 bg-emerald-400/15 text-emerald-100',
    badgeClass: 'border-emerald-300/40 bg-emerald-400/15 text-emerald-50 shadow-emerald-500/20',
  },
  {
    id: 'medium',
    label: 'Medium',
    description: 'Moderate delay',
    controlHint: 'Watch signals',
    statusText: 'Traffic is building near central crossings.',
    mapMessage: 'Medium density detected. Alternate turns may save time.',
    estimatedDelay: '8 min delay',
    density: 62,
    overlayColor: 'rgba(234, 179, 8, 0.46)',
    overlayOpacity: 0.42,
    overlayGlow: 'inset 0 0 95px rgba(234, 179, 8, 0.42)',
    routeColor: '#facc15',
    dotClass: 'bg-yellow-300 shadow-yellow-300/80',
    vehicleClass: 'bg-yellow-200 shadow-lg shadow-yellow-300/50',
    pillClass: 'border-yellow-200/50 bg-yellow-300/15 text-yellow-100',
    badgeClass: 'border-yellow-200/40 bg-yellow-300/15 text-yellow-50 shadow-yellow-500/20',
  },
  {
    id: 'high',
    label: 'High',
    description: 'Heavy congestion',
    controlHint: 'Reroute now',
    statusText: 'Heavy congestion requires immediate route adjustment.',
    mapMessage: 'High density detected. Emergency rerouting recommended.',
    estimatedDelay: '18 min delay',
    density: 92,
    overlayColor: 'rgba(239, 68, 68, 0.52)',
    overlayOpacity: 0.52,
    overlayGlow: 'inset 0 0 115px rgba(239, 68, 68, 0.56)',
    routeColor: '#f87171',
    dotClass: 'bg-red-500 shadow-red-500/80',
    vehicleClass: 'bg-red-400 shadow-lg shadow-red-500/60',
    pillClass: 'border-red-300/50 bg-red-500/15 text-red-100',
    badgeClass: 'border-red-300/40 bg-red-500/15 text-red-50 shadow-red-500/30',
  },
];

const navigationItems = [
  { id: 'mj-section-map', label: 'Live Traffic' },
];

const formatClock = (date) =>
  new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
const trafficLevelLookup = Object.fromEntries(trafficLevels.map((level) => [level.id, level]));

const signalRecommendations = {
  low: 'Normal signal cycle. Keep green phases balanced across all junctions.',
  medium: 'Extend green light by 10 seconds on the busiest corridor.',
  high: 'Activate congestion control mode and prioritize emergency vehicle lanes.',
};

const zonePattern = {
  low: ['low', 'low', 'medium', 'low'],
  medium: ['medium', 'low', 'medium', 'high'],
  high: ['high', 'medium', 'high', 'high'],
};

const zoneNames = ['Central City', 'Highway Entry', 'Commercial Area', 'School Zone'];

const severityMinutesLookup = {
  low: 2,
  medium: 8,
  high: 18,
};

function getTrafficLevelFromDelaySeconds(delaySeconds) {
  if (!Number.isFinite(delaySeconds)) {
    return 'medium';
  }

  const delayMinutes = delaySeconds / 60;

  if (delayMinutes <= 5) {
    return 'low';
  }

  if (delayMinutes <= 15) {
    return 'medium';
  }

  return 'high';
}

function getDensityFromDelaySeconds(delaySeconds, fallbackDensity) {
  if (!Number.isFinite(delaySeconds)) {
    return fallbackDensity;
  }

  const delayMinutes = delaySeconds / 60;
  return Math.min(96, Math.max(24, Math.round(24 + delayMinutes * 4.5)));
}

function getDelayLabelFromSeconds(delaySeconds, fallbackDelay) {
  if (!Number.isFinite(delaySeconds)) {
    return fallbackDelay;
  }

  const delayMinutes = Math.max(0, Math.round(delaySeconds / 60));
  return `${delayMinutes} min live delay`;
}

function RoutePlannerPanel({
  start,
  destination,
  routeResult,
  routeError,
  isRouteLoading,
  isLiveMapEnabled,
  onStartChange,
  onDestinationChange,
  onSubmit,
  onRetry,
  theme,
}) {
  return (
    <form onSubmit={onSubmit} className={`h-full rounded-2xl border p-4 shadow-lg backdrop-blur ${theme.panel}`}>
      <p className={`mb-3 text-sm font-semibold uppercase tracking-[0.18em] ${theme.muted}`}>Real Route ETA</p>
      <div className="space-y-3">
        <label className="block text-sm font-semibold" htmlFor="mj-route-start">
          Start location
          <input
            id="mj-route-start"
            aria-label="Start location"
            autoComplete="off"
            value={start}
            onChange={(event) => onStartChange(event.target.value)}
            placeholder="Example: Saddar Karachi"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/20"
          />
        </label>
        <label className="block text-sm font-semibold" htmlFor="mj-route-destination">
          Destination
          <input
            id="mj-route-destination"
            aria-label="Destination"
            autoComplete="off"
            value={destination}
            onChange={(event) => onDestinationChange(event.target.value)}
            placeholder="Example: Clifton Karachi"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/20"
          />
        </label>
        <motion.button
          type="submit"
          disabled={!isLiveMapEnabled || isRouteLoading}
          whileHover={isLiveMapEnabled && !isRouteLoading ? { scale: 1.03, y: -1 } : undefined}
          whileTap={isLiveMapEnabled && !isRouteLoading ? { scale: 0.97 } : undefined}
          className={`w-full rounded-xl px-4 py-3 text-sm font-black transition ${
            isLiveMapEnabled && !isRouteLoading
              ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-300'
              : 'cursor-not-allowed bg-slate-700 text-slate-400'
          }`}
        >
          {isRouteLoading ? 'Calculating...' : 'Calculate Live ETA'}
        </motion.button>
      </div>

      {!isLiveMapEnabled && (
        <p className={`mt-3 text-xs leading-5 ${theme.muted}`}>
          Add VITE_TOMTOM_API_KEY in your env file to enable TomTom traffic and directions.
        </p>
      )}

      {routeError && (
        <div className="mt-3 rounded-xl border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-100" role="alert" aria-live="assertive">
          <p>{routeError}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-lg border border-red-200/30 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-red-50 transition hover:bg-red-400/20"
            >
              Retry request
            </button>
          )}
        </div>
      )}

      {routeResult && (
        <div className="mt-3 rounded-xl border border-emerald-300/30 bg-emerald-400/10 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Best route</p>
          <p className="mt-1 text-sm font-semibold">{routeResult.summary}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-black/10 p-2">
              <p className={`text-xs ${theme.muted}`}>Traffic ETA</p>
              <p className="font-black">{routeResult.durationInTraffic}</p>
            </div>
            <div className="rounded-lg bg-black/10 p-2">
              <p className={`text-xs ${theme.muted}`}>Distance</p>
              <p className="font-black">{routeResult.distance}</p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

function TrafficTransitionAlert({ transition, onDismiss }) {
  if (!transition) {
    return null;
  }

  const toneClass = transition.toId === 'high' ? 'border-red-300/40 bg-red-500/15 text-red-50' : 'border-emerald-300/35 bg-emerald-400/10 text-emerald-50';

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      className={`rounded-2xl border p-4 shadow-lg backdrop-blur ${toneClass}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-75">Traffic Level Updated</p>
          <p className="mt-1 text-sm font-semibold">
            Traffic changed from {transition.fromLabel} to {transition.toLabel}. Dashboard colors and route status are now synced.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-xl border border-white/20 px-4 py-2 text-sm font-bold transition hover:bg-white/10"
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}

function TrafficIntelligencePanel({ status, routeResult, trafficHistory, isLightMode, theme }) {
  const liveDelaySeconds = routeResult?.trafficDelaySeconds;
  const hasLiveDelay = Number.isFinite(liveDelaySeconds);
  const delayMinutes = hasLiveDelay ? Math.round(liveDelaySeconds / 60) : null;
  const meterTrack = isLightMode ? 'bg-slate-200' : 'bg-white/10';
  const cardClass = isLightMode ? 'bg-slate-100/80' : 'bg-white/[0.04]';

  return (
    <section className={`mj-panel-shell rounded-2xl border p-4 shadow-lg backdrop-blur ${theme.panel}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${theme.muted}`}>Traffic Intelligence</p>
          <h2 className="mt-1 text-xl font-black">Severity Meter</h2>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${status.pillClass}`}>
          {hasLiveDelay ? 'Live detected' : 'Manual mode'}
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={`rounded-xl p-4 ${cardClass}`}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold">Congestion score</span>
            <span className="text-2xl font-black">{status.density}%</span>
          </div>
          <div className={`mt-4 h-4 overflow-hidden rounded-full ${meterTrack}`}>
            <motion.div
              key={status.id + status.density}
              initial={{ width: 0 }}
              animate={{ width: `${status.density}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: status.routeColor, boxShadow: `0 0 24px ${status.routeColor}` }}
            />
          </div>
          <p className={`mt-3 text-sm leading-6 ${theme.muted}`}>
            {hasLiveDelay
              ? `TomTom live delay is ${delayMinutes} minute(s), so the dashboard classified this route as ${status.label}.`
              : 'Select a route to auto-detect traffic level from live delay, or use the control buttons for manual simulation.'}
          </p>
        </div>

        <div className={`rounded-xl p-4 ${cardClass}`}>
          <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">Smart Signal Recommendation</p>
          <p className="mt-2 text-sm font-semibold leading-6">{signalRecommendations[status.id]}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className={`text-xs font-black uppercase tracking-[0.16em] ${theme.muted}`}>Traffic Level History</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {trafficHistory.map((entry, index) => {
            const level = trafficLevelLookup[entry.id];

            return (
              <motion.div
                key={`${entry.time}-${entry.id}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className={`rounded-xl border px-3 py-3 ${level.pillClass}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-black">{level.label}</span>
                  <span className={`h-3 w-3 rounded-full ${level.dotClass}`} />
                </div>
                <p className="mt-1 text-xs opacity-75">{entry.time}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ZoneTrafficPanel({ status, isLightMode, theme }) {
  const zones = zoneNames.map((name, index) => trafficLevelLookup[zonePattern[status.id][index]]);
  const rowClass = isLightMode ? 'bg-slate-100/80' : 'bg-white/[0.04]';

  return (
    <section id="mj-section-safety" className={`mj-panel-shell rounded-2xl border p-4 shadow-lg backdrop-blur ${theme.panel}`}>
      <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${theme.muted}`}>Area Traffic Levels</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {zones.map((zoneStatus, index) => (
          <motion.div
            key={zoneNames[index]}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.05 }}
            className={`rounded-xl border p-4 ${rowClass}`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black">{zoneNames[index]}</p>
              <span className={`h-3.5 w-3.5 rounded-full ${zoneStatus.dotClass}`} />
            </div>
            <p className={`mt-2 inline-block rounded-full border px-2 py-1 text-xs font-bold uppercase tracking-[0.14em] ${zoneStatus.pillClass}`}>
              {zoneStatus.label}
            </p>
            <p className={`mt-3 text-xs leading-5 ${theme.muted}`}>{zoneStatus.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
export default function LiveTrafficPage() {
  const [selectedTraffic, setSelectedTraffic] = useState('medium');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLightMode, setIsLightMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAccidentAlert, setShowAccidentAlert] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [routeStart, setRouteStart] = useState('Saddar Karachi');
  const [routeDestination, setRouteDestination] = useState('Clifton Karachi');
  const [routeRequestId, setRouteRequestId] = useState(0);
  const [routeResult, setRouteResult] = useState(null);
  const [routeError, setRouteError] = useState('');
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [trafficTransition, setTrafficTransition] = useState(null);
  const [mapReloadKey, setMapReloadKey] = useState(0);
  const [trafficHistory, setTrafficHistory] = useState(() => [
    { id: 'medium', label: 'Medium', time: formatClock(new Date()) },
  ]);
  const previousTrafficRef = useRef('medium');

  const currentStatus = useMemo(() => {
    const baseStatus = trafficLevelLookup[selectedTraffic] ?? trafficLevels[1];
    const liveDelaySeconds = routeResult?.trafficDelaySeconds;

    return {
      ...baseStatus,
      density: getDensityFromDelaySeconds(liveDelaySeconds, baseStatus.density),
      estimatedDelay: getDelayLabelFromSeconds(liveDelaySeconds, baseStatus.estimatedDelay),
      signalRecommendation: signalRecommendations[baseStatus.id],
    };
  }, [selectedTraffic, routeResult]);

  const dashboardAnalytics = useMemo(() => {
    const zoneStatuses = zoneNames.map((_, index) => trafficLevelLookup[zonePattern[currentStatus.id][index]]);
    const peakZoneIndex = zoneStatuses.reduce((bestIndex, zoneStatus, index, list) => {
      return zoneStatus.density > list[bestIndex].density ? index : bestIndex;
    }, 0);
    const averageDelayMinutes = Math.round(
      zoneStatuses.reduce((sum, zoneStatus) => sum + (severityMinutesLookup[zoneStatus.id] ?? 8), 0) /
        zoneStatuses.length,
    );
    const activeAlerts = Number(showAccidentAlert) + Number(Boolean(routeError)) + Number(Boolean(isRouteLoading));

    return {
      averageDelayLabel: `${averageDelayMinutes} min avg`,
      peakZoneLabel: zoneNames[peakZoneIndex],
      activeAlertsLabel: `${activeAlerts} active`,
      activeAlertsCount: activeAlerts,
    };
  }, [currentStatus.id, isRouteLoading, routeError, showAccidentAlert]);

  const isLiveMapEnabled = Boolean(import.meta.env.VITE_TOMTOM_API_KEY);

  const handleRouteSubmit = (event) => {
    event.preventDefault();
    setRouteError('');
    setRouteResult(null);

    if (!isLiveMapEnabled) {
      setRouteError('Add VITE_TOMTOM_API_KEY in .env.local before calculating a live ETA.');
      return;
    }

    setIsRouteLoading(true);
    setRouteRequestId((requestId) => requestId + 1);
  };

  const handleRouteResult = useCallback((result) => {
    const detectedTrafficLevel = getTrafficLevelFromDelaySeconds(result.trafficDelaySeconds);

    setIsRouteLoading(false);
    setRouteError('');
    setRouteResult(result);
    setSelectedTraffic(detectedTrafficLevel);
  }, []);

  const handleRouteError = useCallback((message) => {
    setIsRouteLoading(false);
    setRouteResult(null);
    setRouteError(message);
  }, []);

  const handleTrafficChange = useCallback((levelId) => {
    setRouteResult(null);
    setRouteError('');
    setSelectedTraffic(levelId);
  }, []);

  // Keeps the simulated control room clock and loader synchronized.
  useEffect(() => {
    const clock = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const loader = window.setTimeout(() => {
      setIsLoading(false);
    }, 900);

    return () => {
      window.clearInterval(clock);
      window.clearTimeout(loader);
    };
  }, []);

  // Traffic changes update alerts and keep a compact monitoring history.
  useEffect(() => {
    const updateTime = new Date();
    const previousTrafficId = previousTrafficRef.current;
    const nextLevel = trafficLevelLookup[selectedTraffic] ?? trafficLevels[1];
    const previousLevel = trafficLevelLookup[previousTrafficId] ?? trafficLevels[1];

    setLastUpdated(updateTime);
    setShowAccidentAlert(selectedTraffic === 'high');

    if (previousTrafficId !== selectedTraffic) {
      setTrafficTransition({
        fromLabel: previousLevel.label,
        toLabel: nextLevel.label,
        toId: nextLevel.id,
      });
      setTrafficHistory((history) => [
        { id: nextLevel.id, label: nextLevel.label, time: formatClock(updateTime) },
        ...history,
      ].slice(0, 4));
      previousTrafficRef.current = selectedTraffic;
    }
  }, [selectedTraffic]);


  const theme = isLightMode
    ? {
        page: 'bg-slate-100 text-slate-950',
        panel: 'border-slate-200 bg-white/90 text-slate-950 shadow-lg',
        muted: 'text-slate-600',
        nav: 'border-slate-200 bg-white/80 text-slate-700',
        navActive: 'bg-slate-950 text-white shadow-md',
        button: 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100',
      }
    : {
        page: 'bg-slate-950 text-slate-100',
        panel: 'border-white/10 bg-slate-950/70 text-slate-100 shadow-lg',
        muted: 'text-slate-300',
        nav: 'border-white/10 bg-slate-950/70 text-slate-300',
        navActive: 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20',
        button: 'border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]',
      };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900/90 p-6 text-center shadow-traffic"
        >
          <motion.div
            className="mx-auto h-16 w-16 rounded-full border-4 border-slate-700 border-t-emerald-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <h1 className="mt-5 text-xl font-black text-white">Loading Traffic Control</h1>
          <p className="mt-2 text-sm text-slate-400">Syncing signals, cameras, and city traffic zones.</p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen px-4 py-6 transition-colors duration-500 sm:px-6 lg:px-8 ${theme.page}`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="mx-auto flex w-full max-w-7xl flex-col gap-6"
      >
        <nav className={`flex flex-wrap items-center gap-2 rounded-2xl border p-3 backdrop-blur ${theme.nav}`}>
          {navigationItems.map((item) => (
            <span
              key={item.id}
              className={`rounded-xl px-3 py-2 text-xs font-bold sm:text-sm ${theme.navActive}`}
            >
              {item.label}
            </span>
          ))}
        </nav>

        <header id="mj-section-home" className={`mj-panel-shell rounded-2xl border p-4 backdrop-blur sm:p-6 ${theme.panel}`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Smart Traffic Dashboard
              </p>
              <h1 className="mt-3 text-2xl font-black sm:text-4xl lg:text-5xl">Live Traffic UI Simulation</h1>
              <p className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base ${theme.muted}`}>
                Monitor congestion, switch traffic levels, and watch the smart city map respond with animated overlays and route signals.
              </p>
              <div className={`mt-4 flex flex-wrap gap-2 text-xs font-semibold ${theme.muted}`}>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-300">
                  Monitoring Zone: Central City
                </span>
                <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-sky-300">
                  Last updated: {formatClock(lastUpdated)}
                </span>
                <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-sky-300">
                  {isLiveMapEnabled ? 'TomTom traffic enabled' : 'TomTom traffic key needed'}
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[360px]">
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:grid-cols-4">
                <div className="flex min-h-[92px] flex-col justify-between rounded-xl bg-black/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Average Delay</p>
                  <p className="mt-1 text-2xl font-black text-emerald-300">{dashboardAnalytics.averageDelayLabel}</p>
                </div>
                <div className="flex min-h-[92px] flex-col justify-between rounded-xl bg-black/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Peak Zone</p>
                  <p className="mt-1 text-lg font-black text-yellow-300">{dashboardAnalytics.peakZoneLabel}</p>
                </div>
                <div className="flex min-h-[92px] flex-col justify-between rounded-xl bg-black/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Active Alerts</p>
                  <p className="mt-1 text-2xl font-black text-red-300">{dashboardAnalytics.activeAlertsCount}</p>
                </div>
                <div className="flex min-h-[92px] flex-col justify-between rounded-xl bg-black/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Traffic Mode</p>
                  <p className="mt-1 text-lg font-black text-sky-300">{isLiveMapEnabled ? 'Live' : 'Fallback'}</p>
                </div>
              </div>

              <div className="grid items-stretch gap-3 sm:grid-cols-3 lg:grid-cols-[1fr_auto_auto]">
                <div className={`flex h-full min-h-[88px] flex-col justify-between rounded-xl border px-4 py-3 ${theme.button}`}>
                  <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${theme.muted}`}>Control Clock</p>
                  <p className="mt-1 text-lg font-black tabular-nums">{formatClock(currentTime)}</p>
                </div>

                <motion.button
                  type="button"
                  onClick={() => setIsLightMode((mode) => !mode)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`flex h-full min-h-[88px] items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${theme.button}`}
                >
                  {isLightMode ? 'Dark Mode' : 'Light Mode'}
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {showAccidentAlert && (
            <motion.div
              initial={{ opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.96 }}
              className="rounded-2xl border border-red-300/40 bg-red-500/15 p-4 text-red-50 shadow-lg shadow-red-500/20 backdrop-blur"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-red-200">Accident Alert</p>
                  <p className="mt-1 text-sm text-red-50">
                    Possible incident near Central Junction. Reroute emergency vehicles and reduce lane pressure.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAccidentAlert(false)}
                  className="rounded-xl border border-red-200/40 px-4 py-2 text-sm font-bold text-red-50 transition hover:bg-red-400/20"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          <TrafficTransitionAlert transition={trafficTransition} onDismiss={() => setTrafficTransition(null)} />
        </AnimatePresence>

        <div id="mj-section-controls" className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.9fr)]">
          <TrafficControls
            levels={trafficLevels}
            selectedLevel={selectedTraffic}
            onChange={handleTrafficChange}
            isLightMode={isLightMode}
          />
          <TrafficLegend levels={trafficLevels} isLightMode={isLightMode} />
        </div>

        <MjTrafficChartsPanel
          status={currentStatus}
          isLightMode={isLightMode}
          routeResult={routeResult}
        />
        <TrafficIntelligencePanel
          status={currentStatus}
          routeResult={routeResult}
          trafficHistory={trafficHistory}
          isLightMode={isLightMode}
          theme={theme}
        />

        <ZoneTrafficPanel status={currentStatus} isLightMode={isLightMode} theme={theme} />

        <div id="mj-section-map" className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <TrafficMap
            status={currentStatus}
            isLightMode={isLightMode}
            lastUpdated={formatClock(lastUpdated)}
            routeStart={routeStart}
            routeDestination={routeDestination}
            routeRequestId={routeRequestId}
            onRouteResult={handleRouteResult}
            onRouteError={handleRouteError}
            reloadKey={mapReloadKey}
            onRetryMap={() => setMapReloadKey((value) => value + 1)}
          />

          <div id="mj-section-route" className="flex h-full flex-col gap-6">
            <div className="flex-1">
              <RoutePlannerPanel
                start={routeStart}
                destination={routeDestination}
                routeResult={routeResult}
                routeError={routeError}
                isRouteLoading={isRouteLoading}
                isLiveMapEnabled={isLiveMapEnabled}
                onStartChange={setRouteStart}
                onDestinationChange={setRouteDestination}
                onSubmit={handleRouteSubmit}
                onRetry={handleRouteSubmit}
                theme={theme}
              />
            </div>
            <div className="flex-1">
              <TrafficStatusBadge status={currentStatus} isLightMode={isLightMode} />
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}




























