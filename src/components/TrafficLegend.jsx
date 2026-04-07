export default function TrafficLegend({ levels, isLightMode = false }) {
  const panelClass = isLightMode
    ? 'border-slate-200 bg-white/90 text-slate-950'
    : 'border-white/10 bg-slate-950/60 text-slate-100';
  const titleClass = isLightMode ? 'text-slate-500' : 'text-slate-400';
  const rowClass = isLightMode ? 'bg-slate-100/80' : 'bg-white/[0.03]';
  const detailClass = isLightMode ? 'text-slate-500' : 'text-slate-400';

  return (
    <aside className={`rounded-2xl border p-4 shadow-lg backdrop-blur ${panelClass}`}>
      <p className={`mb-3 text-sm font-semibold uppercase tracking-[0.18em] ${titleClass}`}>
        Legend
      </p>
      <div className="space-y-3">
        {levels.map((level) => (
          <div key={level.id} className={`flex items-center justify-between gap-4 rounded-xl px-3 py-3 ${rowClass}`}>
            <div className="flex items-center gap-3">
              <span className={`h-3.5 w-3.5 rounded-full shadow-lg ${level.dotClass}`} />
              <span className="text-sm font-medium">{level.label}</span>
            </div>
            <span className={`text-xs ${detailClass}`}>{level.description}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
