import { useLocation, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard.jsx';

export function MatchResult() {
  const { roomId } = useParams();
  const { state } = useLocation();
  const room = state?.room;

  return (
    <div className="mx-auto max-w-lg text-center">
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <GlassCard>
          <p className="text-sm uppercase tracking-[0.4em] text-cyan-300">Match complete</p>
          <h1 className="mt-4 text-4xl font-black text-white">Victory lane</h1>
          <p className="mt-4 text-slate-300">
            Room <span className="font-mono text-cyan-200">{roomId}</span>
          </p>
          <p className="mt-2 text-lg text-white">
            Winner reference: <span className="text-emerald-300">{room?.winnerSeat}</span>
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link to="/lobby" className="btn-neon">
              Back to lobby
            </Link>
            <Link to="/room/create" className="btn-outline">
              Host another
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
