import { motion } from 'framer-motion';

export default function MjSidebarLinks({ items, activeSection, isLightMode = false, onNavigate, onEmergencyOpen }) {
  const panelClass = isLightMode ? 'border-slate-200 bg-white/90 text-slate-900' : 'border-white/10 bg-slate-950/70 text-slate-100';

  return (
    <aside id="mj-sidebar-links" className={`mj-sidebar rounded-2xl border p-4 shadow-lg backdrop-blur ${panelClass}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Quick Navigation</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-1">
        {items.map((item) => {
          const isActive = activeSection === item.id;
          const activeClass = isActive
            ? 'border-emerald-300 bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30'
            : 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.09]';

          return (
            <motion.button
              key={item.id}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(item.id)}
              className={`mj-sidebar-link rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${activeClass}`}
            >
              {item.label}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onEmergencyOpen}
        className="mj-emergency-open mt-4 w-full rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-2 text-sm font-black text-red-100 transition hover:bg-red-500/30"
      >
        Open Emergency Contacts
      </motion.button>
    </aside>
  );
}
