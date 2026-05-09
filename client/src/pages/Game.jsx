import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LudoBoard } from '../game/LudoBoard.jsx';
import { PlayerHud } from '../components/game/PlayerHud.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useSoundscape } from '../hooks/useSoundscape.js';

function playerAtSeat(room, seat) {
  return room?.players?.find((p) => Number(p.seat) === seat) ?? null;
}

export function Game() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, emit, connected } = useSocket();
  const [room, setRoom] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [log, setLog] = useState([]);
  const { playDice, playMove, playWin, muted, setMuted } = useSoundscape();

  useEffect(() => {
    if (!socket) return undefined;
    const onPatch = (payload) => {
      setRoom(payload);
      setLog((l) => [
        ...l.slice(-36),
        `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${payload.status}`,
      ]);
    };
    const onChat = (m) => setLog((l) => [...l.slice(-50), `${m.from}: ${m.text}`]);
    socket.on('room:patch', onPatch);
    socket.on('chat:message', onChat);
    return () => {
      socket.off('room:patch', onPatch);
      socket.off('chat:message', onChat);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !roomId || !connected) return;
    emit('room:join', { roomId }).catch(() => {});
  }, [socket, roomId, connected, emit]);

  useEffect(() => {
    if (room?.status === 'done') {
      playWin();
      const t = setTimeout(() => navigate(`/match/${room.roomId}`, { state: { room } }), 1400);
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
      /**/
    }
  }

  async function move(tokenIndex) {
    try {
      playMove();
      await emit('game:move', { roomId, tokenIndex });
    } catch {
      /**/
    }
  }

  async function start() {
    try {
      await emit('game:start', { roomId });
    } catch (e) {
      setLog((l) => [...l, `Start: ${e.message}`]);
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

  const diceForHud = g?.awaitingDice ? null : g?.dice;

  const hudDice = (seat) =>
    g && Number(g.turnSeat) === seat && g.dice != null && !g.awaitingDice ? g.dice : null;

  return (
    <div className="ludo-pattern-bg min-h-[100dvh] px-2 pb-4 pt-2 sm:px-4">
      <div className="mx-auto mb-2 flex max-w-lg items-center justify-between gap-2 text-[11px] text-sky-200/90">
        <Link to="/lobby" className="rounded-lg border border-sky-500/40 px-3 py-1.5 font-bold text-white hover:bg-sky-500/15">
          ← Lobby
        </Link>
        <span className="rounded-md bg-black/30 px-2 py-1 font-mono text-[10px] text-amber-100">
          {roomId}
        </span>
        <div className="flex gap-1">
          {isHost && room?.status === 'waiting' && (
            <button type="button" className="menu-pyramid-btn !py-1.5 !text-[10px]" onClick={start}>
              Start
            </button>
          )}
          <button
            type="button"
            className="rounded-lg border border-white/20 px-2 py-1 text-white/90"
            onClick={() => setMuted(!muted)}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            type="button"
            className="rounded-lg border border-white/20 px-2 py-1 text-white/90"
            onClick={() => setChatOpen((v) => !v)}
          >
            💬
          </button>
        </div>
      </div>

      <div className="mx-auto mb-3 flex max-w-lg justify-between gap-2 px-1">
        <PlayerHud
          position="tl"
          player={playerAtSeat(room, 1)}
          seatLabel={1}
          isActiveTurn={g?.turnSeat === 1}
          isViewerSeat={Number(mySeat) === 1}
          showDiceSlot
          diceValue={hudDice(1)}
        />
        <PlayerHud
          position="tr"
          player={playerAtSeat(room, 2)}
          seatLabel={2}
          isActiveTurn={g?.turnSeat === 2}
          isViewerSeat={Number(mySeat) === 2}
          showDiceSlot
          diceValue={hudDice(2)}
        />
      </div>

      <div className="mx-auto mb-3 max-w-lg">
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
      </div>

      <div className="mx-auto mb-4 flex max-w-lg justify-between gap-2 px-1">
        <PlayerHud
          position="bl"
          player={playerAtSeat(room, 0)}
          seatLabel={0}
          isActiveTurn={g?.turnSeat === 0}
          isViewerSeat={Number(mySeat) === 0}
          showDiceSlot
          diceValue={hudDice(0)}
        />
        <PlayerHud
          position="br"
          player={playerAtSeat(room, 3)}
          seatLabel={3}
          isActiveTurn={g?.turnSeat === 3}
          isViewerSeat={Number(mySeat) === 3}
          showDiceSlot
          diceValue={hudDice(3)}
        />
      </div>

      <div className="mx-auto flex max-w-lg flex-wrap items-center justify-center gap-3">
        {g?.awaitingDice && myTurn && (
          <motion.button type="button" className="menu-pyramid-btn !px-8 !py-3 text-base" onClick={roll} whileTap={{ scale: 0.97 }}>
            Roll dice
          </motion.button>
        )}
        {!!diceForHud && (
          <motion.div
            key={diceForHud}
            initial={{ scale: 0.6, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            className="flex h-[52px] w-[52px] items-center justify-center rounded-xl border-2 border-white/70 bg-[#1565C0] text-2xl font-black text-white shadow-lg"
          >
            {diceForHud}
          </motion.div>
        )}
      </div>
      <p className="mx-auto mb-6 max-w-lg text-center text-[10px] text-sky-400/75">
        Socket {connected ? 'connected' : 'reconnecting…'} · seat {typeof mySeat === 'number' ? mySeat + 1 : '—'}
      </p>
      {room?.paused && <p className="text-center text-amber-200">Match paused</p>}

      {chatOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 max-h-[45dvh] rounded-t-2xl border border-sky-500/40 bg-[#061028]/96 p-4 shadow-2xl backdrop-blur-xl sm:inset-auto sm:right-4 sm:top-24 sm:max-h-[70dvh] sm:w-[min(340px,calc(100vw-32px))] sm:rounded-2xl">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white">
            <span>Chat</span>
            <button type="button" className="text-sky-300" onClick={() => setChatOpen(false)}>
              Close
            </button>
          </div>
          <div className="mb-3 max-h-[28dvh] space-y-1 overflow-y-auto font-mono text-[11px] text-sky-100/85">
            {log.map((line, i) => (
              <div key={`${i}-${line}`}>{line}</div>
            ))}
          </div>
          <form className="flex gap-2" onSubmit={sendChat}>
            <input
              className="flex-1 rounded-xl border border-white/15 bg-black/35 px-2 py-2 text-sm text-white"
              placeholder="Message…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="menu-pyramid-btn !px-3 !py-2 !text-xs">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
