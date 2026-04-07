import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import TrafficControls from '../components/TrafficControls.jsx';
import TrafficLegend from '../components/TrafficLegend.jsx';
import TrafficMap from '../components/TrafficMap.jsx';
import TrafficStatusBadge from '../components/TrafficStatusBadge.jsx';

const trafficLevels = [
  {
    id: 'low',
    label: 'Low',
    description: 'Smooth flow',
    controlHint: 'Clear route',
    statusText: 'Roads are moving smoothly across the smart grid.',
    mapMessage: 'Low density detected. Suggested route stays open.',
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

export default function LiveTrafficPage() {
  const [selectedTraffic, setSelectedTraffic] = useState('medium');

  const currentStatus = useMemo(
    () => trafficLevels.find((level) => level.id === selectedTraffic) ?? trafficLevels[1],
    [selectedTraffic],
  );

  return (
    <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="mx-auto flex w-full max-w-7xl flex-col gap-6"
      >
        <header className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Smart Traffic Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
                Live Traffic UI Simulation
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Monitor congestion, switch traffic levels, and watch the smart city map respond with animated overlays and route signals.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-white/[0.04] p-3 text-center">
              <div>
                <p className="text-xl font-black text-emerald-300">24</p>
                <p className="text-xs text-slate-400">Signals</p>
              </div>
              <div>
                <p className="text-xl font-black text-yellow-300">8</p>
                <p className="text-xs text-slate-400">Zones</p>
              </div>
              <div>
                <p className="text-xl font-black text-red-300">3</p>
                <p className="text-xs text-slate-400">Levels</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <TrafficMap status={currentStatus} />

          <div className="flex flex-col gap-6">
            <TrafficStatusBadge status={currentStatus} />
            <TrafficControls
              levels={trafficLevels}
              selectedLevel={selectedTraffic}
              onChange={setSelectedTraffic}
            />
            <TrafficLegend levels={trafficLevels} />
          </div>
        </div>
      </motion.div>
    </main>
  );
}
