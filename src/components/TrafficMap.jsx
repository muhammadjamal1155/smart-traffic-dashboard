import { motion } from 'framer-motion';

const vehiclePaths = {
  low: [
    { x: ['-10%', '115%'], y: ['0%', '0%'], delay: 0, duration: 7 },
    { x: ['102%', '-12%'], y: ['0%', '0%'], delay: 1.6, duration: 8 },
  ],
  medium: [
    { x: ['-10%', '115%'], y: ['0%', '0%'], delay: 0, duration: 5.5 },
    { x: ['102%', '-12%'], y: ['0%', '0%'], delay: 0.9, duration: 6 },
    { x: ['-8%', '105%'], y: ['0%', '0%'], delay: 2, duration: 6.5 },
  ],
  high: [
    { x: ['-10%', '115%'], y: ['0%', '0%'], delay: 0, duration: 4 },
    { x: ['102%', '-12%'], y: ['0%', '0%'], delay: 0.55, duration: 4.5 },
    { x: ['-8%', '105%'], y: ['0%', '0%'], delay: 1.2, duration: 4.2 },
    { x: ['98%', '-15%'], y: ['0%', '0%'], delay: 1.8, duration: 4.8 },
  ],
};

export default function TrafficMap({ status }) {
  const isHighTraffic = status.id === 'high';
  const vehicles = vehiclePaths[status.id];

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-traffic backdrop-blur">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Live Traffic Map
          </p>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Smart City Control Grid</h1>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${status.pillClass}`}>
          {status.label}
        </span>
      </div>

      <div className="map-grid relative min-h-[360px] overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900 shadow-inner sm:min-h-[460px]">
        <motion.div
          key={status.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{
            opacity: status.overlayOpacity,
            boxShadow: status.overlayGlow,
          }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          style={{ backgroundColor: status.overlayColor }}
        />

        {isHighTraffic && (
          <motion.div
            className="absolute inset-8 rounded-full border border-red-400/30"
            animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.55, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div className="absolute left-1/2 top-0 h-full w-16 -translate-x-1/2 bg-slate-800 shadow-2xl">
          <div className="mx-auto h-full w-1 border-l-2 border-dashed border-slate-500/80" />
        </div>
        <div className="absolute left-0 top-1/2 h-16 w-full -translate-y-1/2 bg-slate-800 shadow-2xl">
          <div className="my-auto h-1 w-full border-t-2 border-dashed border-slate-500/80" />
        </div>
        <div className="absolute left-[14%] top-[22%] h-12 w-[72%] rotate-[-12deg] rounded-full bg-slate-800 shadow-xl">
          <div className="mx-auto mt-5 h-1 w-[92%] border-t-2 border-dashed border-slate-500/80" />
        </div>
        <div className="absolute left-[20%] top-[68%] h-12 w-[62%] rotate-[14deg] rounded-full bg-slate-800 shadow-xl">
          <div className="mx-auto mt-5 h-1 w-[90%] border-t-2 border-dashed border-slate-500/80" />
        </div>

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 520" aria-hidden="true">
          <motion.path
            key={`${status.id}-route`}
            d="M92 270 C190 190, 294 178, 382 260 S582 372, 716 246"
            fill="none"
            stroke={status.routeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="14 18"
            initial={{ pathLength: 0, opacity: 0.35 }}
            animate={{ pathLength: 1, opacity: 0.95 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="92"
            cy="270"
            r="10"
            fill="#e2e8f0"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="716"
            cy="246"
            r="10"
            fill={status.routeColor}
            animate={{ scale: [1, 1.35, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>

        <div className="absolute left-[8%] top-[10%] rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 shadow-md">
          North Ring
        </div>
        <div className="absolute bottom-[10%] right-[8%] rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 shadow-md">
          Civic Avenue
        </div>

        {vehicles.map((vehicle, index) => (
          <motion.div
            key={`${status.id}-${index}`}
            className={`absolute h-3 w-7 rounded-full ${status.vehicleClass}`}
            style={{
              left: index % 2 === 0 ? '4%' : '72%',
              top: `${42 + index * 8}%`,
            }}
            animate={{ x: vehicle.x, y: vehicle.y }}
            transition={{
              duration: vehicle.duration,
              delay: vehicle.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}

        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-slate-950/75 p-3 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-100">{status.mapMessage}</p>
            <p className="text-xs text-slate-400">Updated by traffic simulation controls</p>
          </div>
        </div>
      </div>
    </section>
  );
}
