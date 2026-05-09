import { GlassCard } from '../components/GlassCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function Profile() {
  const { user } = useAuth();
  const wins = user?.wins ?? 0;
  const losses = user?.losses ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <GlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <img
          src={user?.avatar}
          alt=""
          className="h-28 w-28 rounded-3xl border border-white/10 bg-slate-900 object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">{user?.email || user?.mobile}</h1>
          <p className="text-sm text-slate-400">Role {user?.role}</p>
          <p className="mt-2 text-lg text-cyan-200">
            {wins} wins · {losses} losses
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
