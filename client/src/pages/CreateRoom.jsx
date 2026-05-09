import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export function CreateRoom() {
  const { emit, connected } = useSocket();
  const navigate = useNavigate();
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [team, setTeam] = useState(false);
  const [bots, setBots] = useState(true);
  const [err, setErr] = useState('');

  async function create() {
    setErr('');
    try {
      const ack = await emit('room:create', {
        maxPlayers,
        teamMode: team,
        botsEnabled: bots,
        mode: maxPlayers === 2 ? '2p' : '4p',
      });
      if (ack?.roomId) navigate(`/game/${ack.roomId}`, { replace: true });
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <GlassCard>
        <h1 className="text-2xl font-bold text-white">Create neon table</h1>
        <p className="mt-2 text-sm text-slate-400">
          Generates a short room code friends can punch in. Bots can pad empty seats when enabled.
        </p>
        {!connected && (
          <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            Socket offline — wait for connection badge in the lobby or refresh token.
          </p>
        )}
        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Max humans
            <select
              className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
            >
              <option value={2}>2 (diagonal duel + AI)</option>
              <option value={4}>4 (classic)</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={team} onChange={(e) => setTeam(e.target.checked)} />
            Team mode (pairs on opposite corners)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={bots} onChange={(e) => setBots(e.target.checked)} />
            Allow AI seat fillers when lobby is short
          </label>
          {err && <p className="text-sm text-rose-300">{err}</p>}
          <button type="button" className="btn-neon" disabled={!connected} onClick={create}>
            Generate room
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
