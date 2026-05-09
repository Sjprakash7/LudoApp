import { motion } from 'framer-motion';

export function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className="h-12 w-12 rounded-full border-2 border-cyan-400/30 border-t-cyan-400"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, ease: 'linear', duration: 1 }}
      />
      <span className="text-sm text-slate-300">{label}</span>
    </div>
  );
}
