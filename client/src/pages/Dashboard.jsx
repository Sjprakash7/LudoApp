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
      <section className="grid gap-4 md:grid-cols-3">
        <GlassCard className="md:col-span-2">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-white"
          >
            Welcome back,{' '}
            <span className="neon-text">{user?.username || user?.email || user?.mobile || 'player'}</span>
          </motion.h1>
          <p className="mt-2 max-w-prose text-slate-300">
            Neon tables are live — spin up a private code room or queue with friends. Real-time
            sockets keep dice and pawns in lockstep.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/room/create" className="btn-neon">
              Create room
            </Link>
            <Link to="/room/join" className="btn-outline">
              Join with code
            </Link>
            <Link to="/game/quick" className="btn-outline border-cyan-400/40 text-cyan-100">
              Solo vs bots
            </Link>
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Record</h3>
          <p className="mt-4 text-4xl font-black text-white">
            {wins}W — {losses}L
          </p>
          <p className="mt-2 text-sm text-slate-400">Win rate {pct}%</p>
        </GlassCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="mb-4 text-lg font-bold text-white">Live &amp; listed rooms</h2>
          <ul className="space-y-3 text-sm">
            {(lobby.rooms || []).slice(0, 8).map((r) => (
              <li
                key={r.roomId}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2"
              >
                <div>
                  <div className="font-mono text-cyan-200">{r.roomId}</div>
                  <div className="text-xs text-slate-500">{r.status}</div>
                </div>
                <Link to={`/game/${r.roomId}`} className="btn-outline px-2 py-1 text-xs">
                  Open
                </Link>
              </li>
            ))}
            {!(lobby.rooms || []).length && (
              <p className="text-slate-500">No rooms yet — be the first host.</p>
            )}
          </ul>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-lg font-bold text-white">Recent matches</h2>
          <ul className="space-y-3 text-sm text-slate-300">
            {history.map((m, i) => (
              <li key={`${m.roomId}-${i}`} className="rounded-xl border border-white/5 bg-slate-950/30 px-3 py-2">
                Room <span className="font-mono text-cyan-200">{m.roomId}</span> — winner seat{' '}
                <span className="text-white">{m.winner}</span>
              </li>
            ))}
            {!history.length && <li className="text-slate-500">Play a match to populate history.</li>}
          </ul>
        </GlassCard>
      </section>
    </div>
  );
}
