/**
 * Lightweight bot move selection tied to authoritative legal moves.
 */

import { legalMoves, applyMove } from './gameEngine.js';

function scoreSnapshot(tokens, moverId, nextTokens) {
  let score = 0;
  const row = nextTokens[moverId];
  row.forEach((t) => {
    if (!t.yard && t.outer >= 0 && t.home < 0) score += (t.outer + 1); // nearer finish side generally higher index on ring
    if (!t.yard && t.home >= 0) score += 100 + t.home * 10;
    if (t.finished) score += 200;
  });
  /** bonus for kills */
  for (let p = 0; p < nextTokens.length; p++) {
    if (p === moverId) continue;
    const lost = tokens[p].some((bef, ti) => {
      const aft = nextTokens[p][ti];
      return !bef.yard && aft.yard;
    });
    if (lost) score += 80;
  }
  return score;
}

/** @returns {{ tokenIndex: number }} */
export function pickBotMove(tokens, playerId, dice, difficulty, teamMode) {
  const moves = legalMoves(playerId, dice, tokens, teamMode);
  if (!moves.length) return null;
  const d = difficulty || 'medium';
  if (d === 'easy') {
    return { tokenIndex: moves[Math.floor(Math.random() * moves.length)] };
  }

  /** evaluate each legal apply */
  const scored = moves.map((ti) => {
    const nx = applyMove(tokens, playerId, ti, dice, teamMode);
    return { ti, sc: nx ? scoreSnapshot(tokens, playerId, nx) : -1e9 };
  });
  scored.sort((a, b) => b.sc - a.sc);
  if (d === 'hard') return { tokenIndex: scored[0].ti };
  /** medium: pick top 2 sometimes random */
  const top = scored.filter((s) => s.sc === scored[0].sc);
  return { tokenIndex: top[Math.floor(Math.random() * top.length)].ti };
}
