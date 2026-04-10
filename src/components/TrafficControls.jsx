import { motion } from 'framer-motion';

const buttonStyles = {
  low: {
    active: 'border-emerald-300 bg-emerald-400 text-slate-950 shadow-emerald-500/40',
    idle: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:border-emerald-300 hover:bg-emerald-400/20',
    lightIdle: 'border-emerald-300/60 bg-emerald-50 text-emerald-900 hover:border-emerald-500 hover:bg-emerald-100',
  },
  medium: {
    active: 'border-yellow-200 bg-yellow-300 text-slate-950 shadow-yellow-400/40',
    idle: 'border-yellow-300/30 bg-yellow-300/10 text-yellow-100 hover:border-yellow-200 hover:bg-yellow-300/20',
    lightIdle: 'border-yellow-300/70 bg-yellow-50 text-yellow-900 hover:border-yellow-500 hover:bg-yellow-100',
  },
  high: {
    active: 'border-red-300 bg-red-500 text-white shadow-red-500/50',
    idle: 'border-red-400/30 bg-red-500/10 text-red-100 hover:border-red-300 hover:bg-red-500/20',
    lightIdle: 'border-red-300/70 bg-red-50 text-red-900 hover:border-red-500 hover:bg-red-100',
  },
};

export default function TrafficControls({ levels, selectedLevel, onChange, isLightMode = false }) {
  const panelClass = isLightMode
    ? 'border-slate-200 bg-white/95 text-slate-950 shadow-lg shadow-slate-200/30'
    : 'border-emerald-400/15 bg-slate-950/75 text-slate-100 shadow-lg shadow-black/30';
  const titleClass = isLightMode ? 'text-slate-500' : 'text-slate-400';
  const helperClass = isLightMode ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`rounded-2xl border p-4 backdrop-blur ${panelClass}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${titleClass}`}>
            Traffic Controls
          </p>
          <p className={`mt-1 text-xs font-medium ${helperClass}`}>Select traffic condition</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${isLightMode ? 'border-slate-300 bg-slate-100 text-slate-600' : 'border-white/10 bg-white/[0.04] text-slate-300'}`}>
          Live control
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {levels.map((level) => {
          const isActive = selectedLevel === level.id;
          const styles = buttonStyles[level.id];
          const idleStyle = isLightMode ? styles.lightIdle : styles.idle;

          return (
            <motion.button
              key={level.id}
              type="button"
              onClick={() => onChange(level.id)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              className={`rounded-xl border px-4 py-3 text-left shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                isActive ? styles.active : idleStyle
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

