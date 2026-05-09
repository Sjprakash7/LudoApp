import { useCallback, useEffect, useMemo, useState } from 'react';

const mutedKey = 'ludo_audio_muted';

/**
 * Web Audio — simple percussive cues without large assets; works offline.
 */
export function useSoundscape() {
  const [muted, setMuted] = useState(() => localStorage.getItem(mutedKey) === '1');

  useEffect(() => {
    localStorage.setItem(mutedKey, muted ? '1' : '0');
  }, [muted]);

  const ctx = useMemo(() => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    return new AudioCtx();
  }, []);

  const playTone = useCallback(
    (freqPairs, gain = 0.06, dur = 0.14) => {
      if (!ctx || muted) return;
      ctx.resume?.();
      const master = ctx.createGain();
      master.gain.value = gain;
      master.connect(ctx.destination);

      freqPairs.forEach(([freq, t]) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(master);
        const now = ctx.currentTime + t;
        osc.start(now);
        osc.stop(now + dur / freqPairs.length);
      });
    },
    [ctx, muted]
  );

  const playDice = useCallback(() => {
    playTone(
      [
        [240, 0],
        [360, 0.04],
        [520, 0.08],
      ],
      0.08,
      0.18
    );
  }, [playTone]);

  const playMove = useCallback(() => {
    playTone(
      [
        [420, 0],
        [600, 0.03],
      ],
      0.05,
      0.12
    );
  }, [playTone]);

  const playWin = useCallback(() => {
    playTone(
      [
        [520, 0],
        [660, 0.05],
        [720, 0.1],
        [920, 0.15],
      ],
      0.09,
      0.3
    );
  }, [playTone]);

  return { muted, setMuted, playDice, playMove, playWin };
}
