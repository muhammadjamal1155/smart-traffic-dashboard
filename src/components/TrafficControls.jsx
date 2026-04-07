import { motion } from 'framer-motion';

const buttonStyles = {
  low: {
    active: 'border-emerald-300 bg-emerald-400 text-slate-950 shadow-emerald-500/40',
    idle: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:border-emerald-300 hover:bg-emerald-400/20',
  },
  medium: {
    active: 'border-yellow-200 bg-yellow-300 text-slate-950 shadow-yellow-400/40',
    idle: 'border-yellow-300/30 bg-yellow-300/10 text-yellow-100 hover:border-yellow-200 hover:bg-yellow-300/20',
  },
  high: {
    active: 'border-red-300 bg-red-500 text-white shadow-red-500/50',
    idle: 'border-red-400/30 bg-red-500/10 text-red-100 hover:border-red-300 hover:bg-red-500/20',
  },
};

export default function TrafficControls({ levels, selectedLevel, onChange }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-lg backdrop-blur">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
        Traffic Controls
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {levels.map((level) => {
          const isActive = selectedLevel === level.id;
          const styles = buttonStyles[level.id];

          return (
            <motion.button
              key={level.id}
              type="button"
              onClick={() => onChange(level.id)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              className={`rounded-xl border px-4 py-3 text-left shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                isActive ? styles.active : styles.idle
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-base font-bold">{level.label}</span>
                  <span className="mt-1 block text-xs opacity-80">{level.controlHint}</span>
                </span>
                <span className={`h-3 w-3 rounded-full ${level.dotClass}`} />
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
