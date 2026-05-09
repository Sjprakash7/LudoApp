import { Link } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard.jsx';

export function NotFound() {
  return (
    <div className="mx-auto max-w-md text-center">
      <GlassCard>
        <h1 className="text-4xl font-black text-white">404</h1>
        <p className="mt-2 text-slate-400">This lane is empty — maybe a pawn was bluffed off-map.</p>
        <Link className="btn-neon mt-6 inline-block" to="/lobby">
          Return to lobby
        </Link>
      </GlassCard>
    </div>
  );
}
