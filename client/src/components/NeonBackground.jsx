import { motion } from 'framer-motion';

export function NeonBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {[...Array(24)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-cyan-400/40 blur-[1px]"
          initial={{
            x: `${10 + (i * 37) % 90}vw`,
            y: `${(i * 53) % 90}vh`,
            opacity: 0.15,
          }}
          animate={{
            y: ['0vh', '-10vh', '0vh'],
            opacity: [0.1, 0.45, 0.1],
          }}
          transition={{
            duration: 7 + (i % 4),
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
