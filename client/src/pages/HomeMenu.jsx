import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const item = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, type: 'spring', stiffness: 280, damping: 24 },
  }),
};

/** Mobile-first hub — mirrors reference “LUDO” menu stack */
export function HomeMenu() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="ludo-pattern-bg relative flex min-h-dvh flex-col px-5 pb-8 pt-6">
      <div className="pointer-events-none absolute inset-x-0 top-12 h-40 bg-gradient-to-b from-sky-500/10 to-transparent blur-3xl" />

      {isAuthenticated && (
        <div className="relative z-[1] mx-auto mb-6 flex items-center gap-3 rounded-full border border-sky-500/40 bg-[#071630]/85 px-3 py-1.5 pr-5 shadow-[0_0_24px_rgba(33,150,243,0.25)] backdrop-blur-md">
          <img
            src={user?.avatar}
            alt=""
            className="h-11 w-11 rounded-full border-2 border-amber-200/60 object-cover shadow-md"
          />
          <span className="truncate text-sm font-semibold text-white">{user?.email || user?.mobile}</span>
        </div>
      )}

      <div className="relative z-[1] flex flex-1 flex-col items-center justify-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ludo-game-title mb-10 text-center text-5xl font-black tracking-[0.2em] text-white sm:text-6xl"
        >
          LUDO
        </motion.h1>

        <nav className="flex w-full max-w-[320px] flex-col gap-[14px]" aria-label="Main menu">
          <MenuBtn
            i={1}
            title="SUGGESTED GAMES"
            subtitle="Quick picks • lobby"
            onClick={() => navigate('/lobby')}
          />
          <MenuBtn i={2} title="PLAY VS COMPUTER" onClick={() => navigate(isAuthenticated ? '/game/quick' : '/login')} />
          <MenuBtn i={3} title="ONLINE MULTIPLAYER" onClick={() => navigate(isAuthenticated ? '/lobby' : '/login')} />
          <MenuBtn i={4} title="GAME HISTORY" onClick={() => navigate(isAuthenticated ? '/lobby' : '/login')} />
          <MenuBtn i={5} variant="muted" title="SETTINGS" onClick={() => navigate('/settings')} />
        </nav>
      </div>

      {!isAuthenticated && (
        <p className="relative z-[1] mt-auto pb-6 text-center text-sm text-slate-400">
          <Link to="/login" className="font-semibold text-sky-300 underline-offset-4 hover:underline">
            Sign in
          </Link>
          {' · '}
          <Link to="/register" className="font-semibold text-sky-300 underline-offset-4 hover:underline">
            Register
          </Link>
        </p>
      )}
      {isAuthenticated && (
        <p className="relative z-[1] mt-auto pb-6 text-center text-xs text-slate-500">
          <Link to="/lobby" className="text-sky-300 hover:underline">
            Open lobby
          </Link>
        </p>
      )}
    </div>
  );
}

function MenuBtn({ title, subtitle, onClick, variant = 'bold', i = 0 }) {
  return (
    <motion.button
      type="button"
      custom={i}
      variants={item}
      initial="hidden"
      animate="show"
      onClick={onClick}
      className={
        variant === 'muted'
          ? 'menu-pyramid-btn menu-pyramid-btn--muted py-3'
          : 'menu-pyramid-btn py-4'
      }
    >
      <span className="block text-[15px] font-extrabold tracking-wide text-white drop-shadow">{title}</span>
      {subtitle ? <span className="mt-1 block text-[11px] font-normal text-blue-100/80">{subtitle}</span> : null}
    </motion.button>
  );
}
