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

// Decorative markers make the placeholder map feel like a real control grid.
const junctions = [
  { label: 'J1', name: 'Central Junction', left: '49%', top: '46%' },
  { label: 'J2', name: 'North Ring', left: '20%', top: '21%' },
  { label: 'J3', name: 'Civic Avenue', left: '72%', top: '68%' },
  { label: 'J4', name: 'Metro Link', left: '76%', top: '30%' },
];

const cameras = [
  { label: 'CAM 01', left: '14%', top: '39%' },
  { label: 'CAM 02', left: '62%', top: '17%' },
  { label: 'CAM 03', left: '82%', top: '54%' },
];

const signals = [
  { left: '43%', top: '45%' },
  { left: '54%', top: '45%' },
  { left: '49%', top: '36%' },
  { left: '49%', top: '57%' },
];

function SignalMarker({ left, top, status }) {
  return (
    <motion.div
      className="absolute z-20 flex h-8 w-5 flex-col items-center justify-center gap-0.5 rounded-md border border-slate-500/70 bg-slate-950 p-1 shadow-lg"
      style={{ left, top }}
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${status.id === 'high' ? 'bg-red-500' : 'bg-red-900/70'}`} />
      <span className={`h-1.5 w-1.5 rounded-full ${status.id === 'medium' ? 'bg-yellow-300' : 'bg-yellow-900/70'}`} />
      <span className={`h-1.5 w-1.5 rounded-full ${status.id === 'low' ? 'bg-emerald-400' : 'bg-emerald-900/70'}`} />
    </motion.div>
  );
}

export default function TrafficMap({ status, isLightMode = false, lastUpdated }) {
  const isHighTraffic = status.id === 'high';
  const vehicles = vehiclePaths[status.id];
  const panelClass = isLightMode
    ? 'border-slate-200 bg-white/90 text-slate-950'
    : 'border-white/10 bg-slate-950/70 text-slate-100';
  const mapBaseClass = isLightMode
    ? 'border-slate-300 bg-slate-200'
    : 'border-slate-700/80 bg-slate-900';
  const mutedClass = isLightMode ? 'text-slate-600' : 'text-slate-400';
  const roadClass = isLightMode ? 'bg-slate-500' : 'bg-slate-800';
  const laneClass = isLightMode ? 'border-slate-200/90' : 'border-slate-500/80';
  const labelClass = isLightMode
    ? 'border-slate-300 bg-white/85 text-slate-700'
    : 'border-white/10 bg-slate-950/70 text-slate-300';

  return (
    <section className={`overflow-hidden rounded-2xl border p-4 shadow-traffic backdrop-blur sm:p-5 ${panelClass}`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${mutedClass}`}>
            Live Traffic Map
          </p>
          <h1 className="mt-1 text-xl font-black sm:text-2xl lg:text-3xl">Smart City Control Grid</h1>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${status.pillClass}`}>
          {status.label} traffic
        </span>
      </div>

      <div className={`map-grid relative min-h-[360px] overflow-hidden rounded-xl border shadow-inner sm:min-h-[480px] lg:min-h-[560px] ${mapBaseClass}`}>
        <motion.div
          key={status.id}
          className="absolute inset-0 z-10"
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
            className="absolute inset-8 z-20 rounded-full border border-red-400/30"
            animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.55, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div className={`absolute left-1/2 top-0 h-full w-16 -translate-x-1/2 shadow-2xl ${roadClass}`}>
          <div className={`mx-auto h-full w-1 border-l-2 border-dashed ${laneClass}`} />
        </div>
        <div className={`absolute left-0 top-1/2 h-16 w-full -translate-y-1/2 shadow-2xl ${roadClass}`}>
          <div className={`my-auto h-1 w-full border-t-2 border-dashed ${laneClass}`} />
        </div>
        <div className={`absolute left-[14%] top-[22%] h-12 w-[72%] rotate-[-12deg] rounded-full shadow-xl ${roadClass}`}>
          <div className={`mx-auto mt-5 h-1 w-[92%] border-t-2 border-dashed ${laneClass}`} />
        </div>
        <div className={`absolute left-[20%] top-[68%] h-12 w-[62%] rotate-[14deg] rounded-full shadow-xl ${roadClass}`}>
          <div className={`mx-auto mt-5 h-1 w-[90%] border-t-2 border-dashed ${laneClass}`} />
        </div>
        <div className={`absolute left-[7%] top-[78%] h-10 w-[50%] rotate-[-5deg] rounded-full shadow-xl ${roadClass}`}>
          <div className={`mx-auto mt-4 h-1 w-[86%] border-t-2 border-dashed ${laneClass}`} />
        </div>
        <div className={`absolute right-[4%] top-[12%] h-[68%] w-12 rotate-[9deg] rounded-full shadow-xl ${roadClass}`}>
          <div className={`mx-auto h-full w-1 border-l-2 border-dashed ${laneClass}`} />
        </div>

        <svg className="absolute inset-0 z-20 h-full w-full" viewBox="0 0 800 520" aria-hidden="true">
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

        {junctions.map((junction) => (
          <div
            key={junction.label}
            className={`absolute z-30 rounded-xl border px-2 py-1.5 text-[10px] shadow-md sm:px-3 sm:py-2 sm:text-xs ${labelClass}`}
            style={{ left: junction.left, top: junction.top }}
            title={junction.name}
          >
            <span className="font-black">{junction.label}</span> {junction.name}
          </div>
        ))}

        {cameras.map((camera) => (
          <motion.div
            key={camera.label}
            className={`absolute z-30 rounded-xl border px-2 py-1 text-[11px] font-black shadow-md ${labelClass}`}
            style={{ left: camera.left, top: camera.top }}
            animate={{ opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {camera.label}
          </motion.div>
        ))}

        {signals.map((signal) => (
          <SignalMarker key={`${signal.left}-${signal.top}`} left={signal.left} top={signal.top} status={status} />
        ))}

        {vehicles.map((vehicle, index) => (
          <motion.div
            key={`${status.id}-${index}`}
            className={`absolute z-30 h-3 w-7 rounded-full ${status.vehicleClass}`}
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

        <div className={`absolute bottom-3 left-3 right-3 z-40 rounded-xl border p-3 shadow-lg backdrop-blur sm:bottom-4 sm:left-4 sm:right-4 ${labelClass}`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">{status.mapMessage}</p>
              <p className={`mt-1 text-xs ${mutedClass}`}>Monitoring Zone: Central City</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.16em]">{status.estimatedDelay}</p>
              <p className={`text-xs ${mutedClass}`}>Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

