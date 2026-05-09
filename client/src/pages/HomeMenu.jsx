import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { NeonBackground } from '../components/NeonBackground.jsx';

const item = {
  hidden: { opacity: 0, y: 18 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, type: 'spring', stiffness: 220, damping: 24 },
  }),
};

export function HomeMenu() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const wins = user?.wins ?? 0;
  const losses = user?.losses ?? 0;
  const pct = wins + losses ? Math.round((wins / (wins + losses)) * 1000) / 10 : 0;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#050720] text-white">
      <NeonBackground />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="neon-card overflow-hidden"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-cyan-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-300/90" />
                  Live multiplayer
                </div>
                <h1 className="text-5xl font-black tracking-[0.24em] text-white sm:text-6xl">Ludo Legends</h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Premium multiplayer Ludo with glowing boards, real-time rooms, AI bots, and high-energy mobile gameplay.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="stat-pill">Coins 2.4K</span>
                  <span className="stat-pill">Gems 95</span>
                  <span className="stat-pill">Level 14</span>
                </div>
              </div>
              <div className="aspect-[4/3] w-full max-w-[320px] rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/90 to-slate-900/80 p-4 shadow-[0_32px_75px_rgba(0,0,0,.35)]">
                <div className="relative h-full overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.25),transparent_40%)]">
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-sky-500/20 to-transparent" />
                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.25em] text-white/70">Daily reward</span>
                      <span className="banner-chip">Collect</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-5xl font-black text-white">+150</p>
                      <p className="text-sm text-slate-300">Bonus coins and free dice daily.</p>
                    </div>
                    <button
                      type="button"
                      className="btn-glow w-full text-center"
                      onClick={() => navigate('/lobby')}
                    >
                      Claim reward
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass-card relative overflow-hidden"
          >
            <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="absolute left-6 top-6 h-24 w-24 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Welcome back</p>
                  <h2 className="mt-2 text-3xl font-black text-white">{user?.username || 'Champion'}</h2>
                </div>
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2">
                  <div className="h-14 w-14 overflow-hidden rounded-full border border-white/20 bg-slate-900">
                    <img src={user?.avatar} alt="User avatar" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Rank</p>
                    <p className="text-base font-bold text-white">Gold</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="mode-card">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Battle score</p>
                  <p className="mt-4 text-4xl font-black text-white">{user?.wins ?? 0} / {user?.losses ?? 0}</p>
                  <p className="mt-2 text-sm text-slate-300">Live multiplayer wins and losses.</p>
                </div>
                <div className="mode-card">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Active mode</p>
                  <p className="mt-4 text-4xl font-black text-white">{isAuthenticated ? 'Play online' : 'Sign in'}</p>
                  <p className="mt-2 text-sm text-slate-300">Start a new room or join friends.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <motion.button
            type="button"
            className="mode-card bg-gradient-to-br from-indigo-600 to-sky-500 text-white"
            onClick={() => navigate(isAuthenticated ? '/room/create' : '/login')}
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-xs uppercase tracking-[0.32em] text-sky-100/80">Play with friends</span>
            <p className="mt-4 text-2xl font-black">Private room</p>
          </motion.button>
          <motion.button
            type="button"
            className="mode-card bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white"
            onClick={() => navigate(isAuthenticated ? '/game/quick' : '/login')}
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-xs uppercase tracking-[0.32em] text-sky-100/80">Instant match</span>
            <p className="mt-4 text-2xl font-black">Quick duel</p>
          </motion.button>
          <motion.button
            type="button"
            className="mode-card bg-gradient-to-br from-amber-500 to-orange-600 text-white"
            onClick={() => navigate('/settings')}
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-xs uppercase tracking-[0.32em] text-slate-100/80">Customize</span>
            <p className="mt-4 text-2xl font-black">Avatars & sound</p>
          </motion.button>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <motion.div className="glass-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Multiplayer lobby</h3>
                <p className="text-sm text-slate-400">Join a live room or host your own game.</p>
              </div>
              <Link to="/room/create" className="text-sm font-semibold text-cyan-200 hover:text-white">
                Create room
              </Link>
            </div>
            <div className="space-y-3">
              {(Array.isArray([]) ? [] : []).map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                  <div>
                    <p className="font-semibold text-white">Room #{String(i + 1).padStart(4, '0')}</p>
                    <p className="text-sm text-slate-400">Waiting for players</p>
                  </div>
                  <span className="stat-pill">Open</span>
                </div>
              ))}
              {!isAuthenticated && <p className="text-sm text-slate-500">Login to view live rooms and start multiplayer matches.</p>}
            </div>
          </motion.div>
          <motion.div className="glass-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Pro stats</h3>
                <p className="text-sm text-slate-400">Progress, rewards, and performance.</p>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="mode-card bg-slate-950/90">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Win rate</p>
                <p className="mt-3 text-3xl font-black text-white">{pct}%</p>
              </div>
              <div className="mode-card bg-slate-950/90">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Recent matches</p>
                <p className="mt-3 text-sm text-slate-300">Play more to unlock trophies and rewards.</p>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

