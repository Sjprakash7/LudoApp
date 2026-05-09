import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export function JoinRoom() {
  const [code, setCode] = useState('');
  const { emit, connected } = useSocket();
  const navigate = useNavigate();
  const [err, setErr] = useState('');

  async function join() {
    setErr('');
    try {
      await emit('room:join', { roomId: code.trim().toUpperCase() });
      navigate(`/game/${code.trim().toUpperCase()}`, { replace: true });
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <GlassCard>
        <h1 className="text-2xl font-bold text-white">Join with code</h1>
        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Room code
            <input
              className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 font-mono text-lg uppercase tracking-widest text-cyan-100 outline-none ring-cyan-400/40 focus:ring-2"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="AB12CD"
            />
          </label>
          {err && <p className="text-sm text-rose-300">{err}</p>}
          <button type="button" className="btn-neon" disabled={!connected || code.length < 4} onClick={join}>
            Enter room
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
