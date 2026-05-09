import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard.jsx';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export function Dashboard() {
  const { user, token } = useAuth();
  const [lobby, setLobby] = useState({ rooms: [] });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.lobby();
        if (!cancelled) setLobby(res);
        const hist = await api.history(token);
        if (!cancelled) setHistory(hist.matches || []);
      } catch {
        /** non-fatal */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const wins = user?.wins ?? 0;
  const losses = user?.losses ?? 0;
  const pct = wins + losses ? Math.round((wins / (wins + losses)) * 1000) / 10 : 0;

  return (
    <div className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
        <GlassCard className="glass-card p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">Welcome back</p>
              <h1 className="mt-3 text-4xl font-black tracking-[0.18em] text-white sm:text-5xl">
                {user?.username || 'Ludo Champion'}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                A premium Ludo arena with real-time rooms, glowing board effects, and smooth mobile gameplay.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="stat-pill">Wins {wins}</div>
              <div className="stat-pill">Win rate {pct}%</div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="mode-card bg-gradient-to-br from-slate-900 to-slate-950 text-white">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Level</p>
              <p className="mt-3 text-3xl font-black text-white">{Math.min(25, Math.max(1, Math.floor((wins + losses) / 3) + 1))}</p>
            </div>
            <div className="mode-card bg-gradient-to-br from-slate-900 to-slate-950 text-white">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Coins</p>
              <p className="mt-3 text-3xl font-black text-white">2.8K</p>
            </div>
            <div className="mode-card bg-gradient-to-br from-slate-900 to-slate-950 text-white">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Gems</p>
              <p className="mt-3 text-3xl font-black text-white">75</p>
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-4">
          <GlassCard className="glass-card overflow-hidden p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Daily event</p>
                <h2 className="mt-2 text-2xl font-black text-white">Champion quest</h2>
              </div>
              <span className="banner-chip">Live</span>
            </div>
            <div className="mt-5 rounded-[1.75rem] bg-slate-950/80 p-4 text-sm text-slate-300 shadow-[inset_0_0_35px_rgba(0,0,0,.15)]">
              Win 2 matches today to unlock a Dice Booster and extra rewards.
            </div>
            <button className="btn-glow mt-5 w-full">Play now</button>
          </GlassCard>

          <GlassCard className="glass-card p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Match status</p>
            <div className="mt-4 grid gap-3">
              <div className="mode-card bg-slate-900/95">
                <p className="text-sm text-slate-400">Current lobby</p>
                <p className="mt-2 text-xl font-black text-white">{lobby.rooms?.length ?? 0} rooms</p>
              </div>
              <div className="mode-card bg-slate-900/95">
                <p className="text-sm text-slate-400">Recent plays</p>
                <p className="mt-2 text-xl font-black text-white">{history.length} matches</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <GlassCard className="glass-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Live rooms</h3>
              <p className="text-sm text-slate-400">Open games you can join instantly.</p>
            </div>
            <Link to="/room/create" className="text-sm font-semibold text-cyan-200 hover:text-white">
              New room
            </Link>
          </div>
          <div className="space-y-4">
            {(lobby.rooms || []).slice(0, 4).map((r) => (
              <div key={r.roomId} className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-semibold text-white">{r.roomId}</p>
                  <p className="text-sm text-slate-400">{r.status}</p>
                </div>
                <Link className="stat-pill" to={`/game/${r.roomId}`}>
                  Join
                </Link>
              </div>
            ))}
            {!(lobby.rooms || []).length && (
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-400">
                No rooms yet — create one and invite friends.
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="glass-card p-5">
          <h3 className="text-xl font-bold text-white">Recent matches</h3>
          <div className="mt-4 space-y-3">
            {(history || []).slice(0, 5).map((m, i) => (
              <div key={`${m.roomId}-${i}`} className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-4">
                <p className="font-semibold text-white">Room {m.roomId}</p>
                <p className="text-sm text-slate-400">Winner seat {m.winner}</p>
              </div>
            ))}
            {!history.length && <p className="text-sm text-slate-500">Play a match to start showing results.</p>}
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
