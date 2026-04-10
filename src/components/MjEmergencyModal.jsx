import { AnimatePresence, motion } from 'framer-motion';

const contacts = [
  { id: 'ambulance', label: 'Ambulance', phone: '1122' },
  { id: 'police', label: 'Police', phone: '15' },
  { id: 'helpline', label: 'Helpline', phone: '911' },
];

export default function MjEmergencyModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mj-emergency-modal"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="mj-emergency-card w-full max-w-lg rounded-2xl border border-red-300/40 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Emergency Response</p>
                <h2 className="mt-1 text-2xl font-black text-white">Instant Contact Panel</h2>
                <p className="mt-2 text-sm text-slate-300">All buttons are active. Click to trigger your device dialer with the selected contact.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/20 px-3 py-1 text-xs font-bold text-slate-100 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {contacts.map((contact) => (
                <a
                  key={contact.id}
                  href={`tel:${contact.phone}`}
                  className="mj-emergency-btn rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-4 text-center transition hover:bg-red-500/25"
                >
                  <p className="text-sm font-black text-red-100">{contact.label}</p>
                  <p className="mt-1 text-lg font-black text-white">{contact.phone}</p>
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
