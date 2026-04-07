import { AnimatePresence, motion } from 'framer-motion';

export default function TrafficStatusBadge({ status }) {
  const isHighTraffic = status.id === 'high';

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-lg backdrop-blur">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
        Current Status
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={status.id}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-4 shadow-md ${status.badgeClass}`}
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] opacity-75">
              Traffic Status
            </span>
            <h2 className="mt-1 text-2xl font-black">{status.label}</h2>
            <p className="mt-1 text-sm opacity-80">{status.statusText}</p>
          </div>
          <motion.span
            className={`h-5 w-5 rounded-full ${status.dotClass}`}
            animate={isHighTraffic ? { scale: [1, 1.45, 1], opacity: [1, 0.65, 1] } : { scale: 1, opacity: 1 }}
            transition={isHighTraffic ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
