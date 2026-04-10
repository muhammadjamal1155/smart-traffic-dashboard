import { useEffect, useMemo, useState } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const historyLabels = ['-55s', '-50s', '-45s', '-40s', '-35s', '-30s', '-25s', '-20s', '-15s', '-10s', '-5s', 'Now'];
const zoneLabels = ['Central', 'Highway', 'Commercial', 'School'];

const jitterByLevel = {
  low: 4,
  medium: 6,
  high: 8,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function buildInitialTrend(baseDensity) {
  return historyLabels.map((_, index) => {
    const spread = index < 6 ? 8 : 5;
    const offset = Math.round((Math.random() * spread - spread / 2) * 1.2);
    return clamp(baseDensity + offset, 12, 98);
  });
}

function buildZoneDensity(baseDensity) {
  return zoneLabels.map((_, index) => {
    const offset = (index - 1.5) * 7 + Math.round(Math.random() * 6 - 3);
    return clamp(baseDensity + offset, 15, 98);
  });
}

export default function MjTrafficChartsPanel({ status, isLightMode = false, routeResult, className = '' }) {
  const [trendSeries, setTrendSeries] = useState(() => buildInitialTrend(status.density));
  const [zoneSeries, setZoneSeries] = useState(() => buildZoneDensity(status.density));

  useEffect(() => {
    setTrendSeries(buildInitialTrend(status.density));
    setZoneSeries(buildZoneDensity(status.density));
  }, [status.id, status.density]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      const spread = jitterByLevel[status.id] ?? 5;
      setTrendSeries((previous) => {
        const nextPoint = clamp(status.density + Math.round(Math.random() * spread - spread / 2), 12, 98);
        return [...previous.slice(1), nextPoint];
      });

      setZoneSeries((previous) =>
        previous.map((value) => clamp(value + Math.round(Math.random() * 4 - 2), 12, 98)),
      );
    }, 5000);

    return () => window.clearInterval(tick);
  }, [status.id, status.density]);

  const lineData = useMemo(
    () => ({
      labels: historyLabels,
      datasets: [
        {
          label: 'Congestion %',
          data: trendSeries,
          borderColor: status.routeColor,
          backgroundColor: `${status.routeColor}33`,
          tension: 0.38,
          fill: true,
          pointRadius: 2.5,
          pointHoverRadius: 4,
        },
      ],
    }),
    [status.routeColor, trendSeries],
  );

  const barData = useMemo(
    () => ({
      labels: zoneLabels,
      datasets: [
        {
          label: 'Zone load %',
          data: zoneSeries,
          backgroundColor: [
            `${status.routeColor}cc`,
            `${status.routeColor}99`,
            `${status.routeColor}77`,
            `${status.routeColor}55`,
          ],
          borderRadius: 6,
        },
      ],
    }),
    [status.routeColor, zoneSeries],
  );

  const axisColor = isLightMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(148, 163, 184, 0.55)';
  const gridColor = isLightMode ? 'rgba(100, 116, 139, 0.15)' : 'rgba(148, 163, 184, 0.18)';
  const panelClass = isLightMode ? 'border-slate-200 bg-white/90 text-slate-950' : 'border-white/10 bg-slate-950/70 text-slate-100';
  const cardClass = isLightMode ? 'bg-slate-100/80' : 'bg-white/[0.04]';
  const routeMeta = routeResult?.durationInTraffic ? `Live ETA: ${routeResult.durationInTraffic}` : 'Waiting for live route ETA';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 600,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        labels: {
          color: axisColor,
          boxWidth: 14,
          usePointStyle: true,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: { color: axisColor, maxRotation: 0 },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: axisColor },
        grid: { color: gridColor },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <section id="mj-section-charts" className={`mj-panel-shell rounded-2xl border p-4 shadow-lg backdrop-blur ${panelClass} ${className}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Dynamic Charts</p>
          <h2 className="mt-1 text-xl font-black">Live Traffic Analytics</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${status.pillClass}`}>
          {routeMeta}
        </span>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className={`rounded-xl p-4 ${cardClass}`}>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] opacity-75">Congestion Trend</p>
          <div className="h-56">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        <div className={`rounded-xl p-4 ${cardClass}`}>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] opacity-75">Zone Pressure</p>
          <div className="h-56">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>
    </section>
  );
}
