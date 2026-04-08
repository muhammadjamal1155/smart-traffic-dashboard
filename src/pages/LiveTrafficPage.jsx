import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TrafficControls from '../components/TrafficControls.jsx';
import TrafficLegend from '../components/TrafficLegend.jsx';
import TrafficMap from '../components/TrafficMap.jsx';
import TrafficStatusBadge from '../components/TrafficStatusBadge.jsx';

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

const navigationItems = ['Home', 'Live Traffic', 'Route Suggestion', 'Safety Tips', 'Emergency'];

const formatClock = (date) =>
  new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);

export default function LiveTrafficPage() {
  const [selectedTraffic, setSelectedTraffic] = useState('medium');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLightMode, setIsLightMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [showAccidentAlert, setShowAccidentAlert] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const currentStatus = useMemo(
    () => trafficLevels.find((level) => level.id === selectedTraffic) ?? trafficLevels[1],
    [selectedTraffic],
  );

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

  // Traffic changes update the timestamp and trigger the urgent alert state.
  useEffect(() => {
    setLastUpdated(new Date());
    setShowAccidentAlert(selectedTraffic === 'high');
  }, [selectedTraffic]);

  useEffect(() => {
    if (!isVoiceListening) {
      return undefined;
    }

    const voiceTimer = window.setTimeout(() => {
      setIsVoiceListening(false);
    }, 2200);

    return () => window.clearTimeout(voiceTimer);
  }, [isVoiceListening]);

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
        <nav className={`flex flex-nowrap items-center gap-2 overflow-x-auto rounded-2xl border p-3 backdrop-blur sm:flex-wrap ${theme.nav}`}>
          {navigationItems.map((item) => (
            <motion.button
              key={item}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition-colors sm:text-sm ${
                item === 'Live Traffic' ? theme.navActive : 'hover:bg-white/10'
              }`}
            >
              {item}
            </motion.button>
          ))}
        </nav>

        <header className={`rounded-2xl border p-4 backdrop-blur sm:p-6 ${theme.panel}`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
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
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[360px]">
              <div className="grid grid-cols-3 gap-3 rounded-xl bg-white/[0.04] p-3 text-center">
                <div>
                  <p className="text-xl font-black text-emerald-300">24</p>
                  <p className={`text-xs ${theme.muted}`}>Signals</p>
                </div>
                <div>
                  <p className="text-xl font-black text-yellow-300">8</p>
                  <p className={`text-xs ${theme.muted}`}>Zones</p>
                </div>
                <div>
                  <p className="text-xl font-black text-red-300">3</p>
                  <p className={`text-xs ${theme.muted}`}>Levels</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-[1fr_auto_auto]">
                <div className={`rounded-xl border px-4 py-3 ${theme.button}`}>
                  <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${theme.muted}`}>Control Clock</p>
                  <p className="mt-1 text-lg font-black tabular-nums">{formatClock(currentTime)}</p>
                </div>
                <motion.button
                  type="button"
                  onClick={() => setIsVoiceListening(true)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                    isVoiceListening
                      ? 'border-emerald-300 bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30'
                      : theme.button
                  }`}
                >
                  {isVoiceListening ? 'Listening...' : 'Voice Input'}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setIsLightMode((mode) => !mode)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${theme.button}`}
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

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <TrafficMap status={currentStatus} isLightMode={isLightMode} lastUpdated={formatClock(lastUpdated)} />

          <div className="flex flex-col gap-6">
            <TrafficStatusBadge status={currentStatus} isLightMode={isLightMode} />
            <TrafficControls
              levels={trafficLevels}
              selectedLevel={selectedTraffic}
              onChange={setSelectedTraffic}
              isLightMode={isLightMode}
            />
            <TrafficLegend levels={trafficLevels} isLightMode={isLightMode} />
          </div>
        </div>
      </motion.div>
    </main>
  );
}



