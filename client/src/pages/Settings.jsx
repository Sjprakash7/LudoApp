import { GlassCard } from '../components/GlassCard.jsx';
import { useSoundscape } from '../hooks/useSoundscape.js';

export function Settings() {
  const { muted, setMuted } = useSoundscape();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <GlassCard>
        <h1 className="text-xl font-bold text-white">Audio</h1>
        <label className="mt-4 flex items-center justify-between text-sm text-slate-200">
          Neon synth SFX
          <button type="button" className="btn-outline px-3 py-1 text-xs" onClick={() => setMuted(!muted)}>
            {muted ? 'Enable' : 'Mute'}
          </button>
        </label>
        <p className="mt-3 text-xs text-slate-500">
          Lightweight Web Audio cues power dice, moves, and win flourishes — no heavy downloads.
        </p>
      </GlassCard>
    </div>
  );
}
