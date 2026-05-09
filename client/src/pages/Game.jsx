import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard.jsx';
import { LudoBoard } from '../game/LudoBoard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useSoundscape } from '../hooks/useSoundscape.js';

export function Game() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, emit, connected } = useSocket();
  const [room, setRoom] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [log, setLog] = useState([]);
  const { playDice, playMove, playWin, muted, setMuted } = useSoundscape();

  useEffect(() => {
    if (!socket) return undefined;
    const onPatch = (payload) => {
      setRoom(payload);
      setLog((l) => [
        ...l.slice(-40),
        `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} state:${payload.status}`,
      ]);
    };
    const onChat = (m) => setLog((l) => [...l.slice(-60), `${m.from}: ${m.text}`]);
    const onLobby = () => {};
    socket.on('room:patch', onPatch);
    socket.on('chat:message', onChat);
    socket.on('lobby:refresh', onLobby);
    return () => {
      socket.off('room:patch', onPatch);
      socket.off('chat:message', onChat);
      socket.off('lobby:refresh', onLobby);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !roomId || !connected) return;
    emit('room:join', { roomId }).catch(() => {});
  }, [socket, roomId, connected, emit]);

  useEffect(() => {
    if (room?.status === 'done') {
      playWin();
      const t = setTimeout(() => navigate(`/match/${room.roomId}`, { state: { room } }), 1600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [room, navigate, playWin]);

  const mySeat = useMemo(
    () => room?.players?.find((p) => p.userId === user?.id)?.seat,
    [room, user]
  );
  const isHost = room?.hostId === user?.id;
  const g = room?.game;

  async function roll() {
    try {
      playDice();
      await emit('game:roll', { roomId });
    } catch {
      /** toast */
    }
  }

  async function move(tokenIndex) {
    try {
      playMove();
      await emit('game:move', { roomId, tokenIndex });
    } catch {
      /** */
    }
  }

  async function start() {
    try {
      await emit('game:start', { roomId });
    } catch (e) {
      setLog((l) => [...l, `Start failed: ${e.message}`]);
    }
  }

  function sendChat(e) {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    socket.emit('chat:send', { roomId, text: chatInput.trim() });
    setChatInput('');
  }

  const myTurn =
    typeof mySeat === 'number' && g?.turnSeat === mySeat && !room?.players?.find((p) => p.seat === mySeat)?.isBot;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">
              Room{' '}
              <span className="font-mono text-cyan-200 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]">
                {roomId}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Socket {connected ? 'live' : 'reconnecting…'} · seat {mySeat ?? '—'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isHost && room?.status === 'waiting' && (
              <button type="button" className="btn-neon px-4 py-2 text-sm" onClick={start}>
                Start match
              </button>
            )}
            <button type="button" className="btn-outline text-xs" onClick={() => setMuted(!muted)}>
              Sound {muted ? 'off' : 'on'}
            </button>
          </div>
        </div>

        <LudoBoard
          tokens={g?.tokens ?? []}
          turnSeat={g?.turnSeat}
          onPickToken={move}
          legalTokenIndices={
            myTurn && g?.awaitingMove && typeof mySeat === 'number' && g?.turnSeat === mySeat
              ? g.legalTokenIndices || []
              : []
          }
        />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {g?.awaitingDice && myTurn && (
            <motion.button
              type="button"
              className="btn-neon px-8 py-3 text-lg"
              onClick={roll}
              whileTap={{ scale: 0.97 }}
            >
              Roll dice
            </motion.button>
          )}
          {g?.dice != null && (
            <motion.div
              key={g.dice}
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-slate-900 to-slate-950 text-3xl font-black text-white shadow-[0_0_40px_rgba(34,211,238,0.25)]"
            >
              {g.dice}
            </motion.div>
          )}
          {room?.paused && <span className="text-amber-200">Paused by admin</span>}
        </div>
      </div>

      <GlassCard className="h-full max-h-[560px] overflow-hidden p-0">
        <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-slate-200">
          Table chat &amp; feed
        </div>
        <div className="flex h-64 flex-col gap-2 overflow-y-auto px-3 py-2 font-mono text-xs text-slate-300">
          {log.map((line, i) => (
            <div key={`${i}-${line}`}>{line}</div>
          ))}
        </div>
        <form className="flex gap-2 border-t border-white/10 p-3" onSubmit={sendChat}>
          <input
            className="flex-1 rounded-lg border border-white/10 bg-slate-950/50 px-2 py-1 text-sm text-white"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Taunt politely…"
          />
          <button type="submit" className="btn-outline px-3 py-1 text-xs">
            Send
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
