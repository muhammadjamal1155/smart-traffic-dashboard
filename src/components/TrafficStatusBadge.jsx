import { AnimatePresence, motion } from 'framer-motion';

const densityBars = [20, 40, 60, 80, 100];

export default function TrafficStatusBadge({ status, isLightMode = false }) {
  const isHighTraffic = status.id === 'high';
  const panelClass = isLightMode
    ? 'border-slate-200 bg-white/90 text-slate-950'
    : 'border-white/10 bg-slate-950/60 text-slate-100';
  const labelClass = isLightMode ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`rounded-2xl border p-4 shadow-lg backdrop-blur ${panelClass}`}>
      <p className={`mb-3 text-sm font-semibold uppercase tracking-[0.18em] ${labelClass}`}>
        Current Status
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={status.id}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`rounded-xl border px-4 py-4 shadow-md ${status.badgeClass}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] opacity-75">
                Traffic Status
              </span>
              <h2 className="mt-1 text-2xl font-black">{status.label}</h2>
              <p className="mt-1 text-sm opacity-80">{status.statusText}</p>
            </div>
            <motion.span
              className={`mt-1 h-5 w-5 rounded-full ${status.dotClass}`}
              animate={isHighTraffic ? { scale: [1, 1.45, 1], opacity: [1, 0.65, 1] } : { scale: 1, opacity: 1 }}
              transition={isHighTraffic ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-black/15 px-3 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">Estimated Delay</p>
              <p className="mt-1 text-lg font-black">{status.estimatedDelay}</p>
            </div>
            <div className="rounded-xl bg-black/15 px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">Density</p>
                <p className="text-sm font-black">{status.density}%</p>
              </div>
              <div className="mt-3 flex h-10 items-end gap-1.5">
                {densityBars.map((bar, index) => {
                  const isActive = status.density >= bar;

                  return (
                    <motion.span
                      key={bar}
                      className={`w-full rounded-t-md ${isActive ? status.dotClass : 'bg-white/20'}`}
                      initial={{ height: 4, opacity: 0.4 }}
                      animate={{ height: isActive ? `${18 + index * 4}px` : '8px', opacity: isActive ? 1 : 0.45 }}
                      transition={{ duration: 0.35, delay: index * 0.04, ease: 'easeOut' }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
