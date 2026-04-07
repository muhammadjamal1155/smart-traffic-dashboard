export default function TrafficLegend({ levels }) {
  return (
    <aside className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-lg backdrop-blur">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
        Legend
      </p>
      <div className="space-y-3">
        {levels.map((level) => (
          <div key={level.id} className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.03] px-3 py-3">
            <div className="flex items-center gap-3">
              <span className={`h-3.5 w-3.5 rounded-full shadow-lg ${level.dotClass}`} />
              <span className="text-sm font-medium text-slate-100">{level.label}</span>
            </div>
            <span className="text-xs text-slate-400">{level.description}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
