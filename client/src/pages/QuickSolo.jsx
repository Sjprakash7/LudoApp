import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard.jsx';
import { useSocket } from '../context/SocketContext.jsx';

/**
 * Creates a private table with AI fill — fastest way to feel gameplay offline-first.
 */
export function QuickSolo() {
  const { emit, connected } = useSocket();
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!connected || started.current) return;
      started.current = true;
      try {
        const ack = await emit('room:create', {
          maxPlayers: 4,
          botsEnabled: true,
          mode: 'solo',
        });
        if (!cancelled && ack?.roomId) {
          await emit('game:start', { roomId: ack.roomId });
          navigate(`/game/${ack.roomId}`, { replace: true });
        }
      } catch {
        started.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connected, emit, navigate]);

  return (
    <div className="mx-auto max-w-md text-center">
      <GlassCard>
        <h1 className="text-xl font-bold text-white">Spawning solo board…</h1>
        <p className="mt-3 text-sm text-slate-400">
          Bringing three neon-tier bots online. If nothing happens, ensure the socket shows connected.
        </p>
      </GlassCard>
    </div>
  );
}
