import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export function Splash() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => {
      navigate(isAuthenticated ? '/lobby' : '/login', { replace: true });
    }, 2200);
    return () => clearTimeout(t);
  }, [navigate, isAuthenticated]);

  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-black tracking-[0.25em] text-white sm:text-6xl"
      >
        LUDO
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="neon-text text-xl font-semibold"
      >
        Neon multiplayer arena
      </motion.p>
      <motion.div
        className="mt-8 h-1 w-40 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </div>
  );
}
