/**
 * Authoritative Ludo rules (4 players, clockwise outer ring length 52, quarter starts).
 * Safe stars on outer indices; kills on landing (not on stars); yard entry needs 6; extra rolls on 6;
 * Three consecutive sixes forfeits remainder (handled caller); finishing needs exact corridor steps.
 */

export const TOKENS_PER_PLAYER = 4;
export const OUTER_LEN = 52;
export const SAFE_OUTER = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
export const START_AT = [0, 13, 26, 39];

/** @typedef {{ yard: boolean, outer: number, home: number, finished: boolean }} Token */

/** @returns {Token[][]} */
export function createInitialTokens(numPlayers) {
  const tokens = [];
  for (let p = 0; p < numPlayers; p++) {
    const row = [];
    for (let t = 0; t < TOKENS_PER_PLAYER; t++) {
      row.push({ yard: true, outer: -1, home: -1, finished: false });
    }
    tokens.push(row);
  }
  return tokens;
}

export function cloneTokens(tokens) {
  return tokens.map((row) =>
    row.map((tok) => ({
      yard: !!tok.yard,
      outer: tok.outer ?? -1,
      home: tok.home ?? -1,
      finished: !!tok.finished,
    }))
  );
}

function gatePrev(playerId) {
  return (START_AT[playerId] - 1 + OUTER_LEN) % OUTER_LEN;
}

export function teammateOf(pid, teamMode) {
  if (!teamMode) return null;
  return pid === 0 || pid === 2 ? (pid === 0 ? 2 : 0) : pid === 1 ? 3 : 1;
}

/** Opponent kills at outer cell (excluding teammates); skip stars */
export function killsAtLanding(moverId, outerIdx, tokens, teamMode) {
  if (SAFE_OUTER.has(((outerIdx % OUTER_LEN) + OUTER_LEN) % OUTER_LEN)) return [];
  const mates = teammateOf(moverId, teamMode);
  const kills = [];
  tokens.forEach((row, pid) => {
    if (pid === moverId || (mates !== null && pid === mates)) return;
    row.forEach((tok, ti) => {
      if (tok.finished) return;
      if (!tok.yard && tok.outer >= 0 && tok.home < 0 && tok.outer === outerIdx) kills.push({ player: pid, tokenIndex: ti });
    });
  });
  return kills;
}

/**
 * Simulate from token state → { nextToken, kills } | null
 * Token encoding: yard OR (outer>=0,hom<0) OR (hom>=0) finished
 */
export function simulateFullMove(playerId, tok, dice, allTokens, teamMode) {
  if (tok.finished || dice < 1 || dice > 6) return null;

  if (tok.yard) {
    if (dice !== 6) return null;
    const land = START_AT[playerId];
    const kills = killsAtLanding(playerId, land, allTokens, teamMode);
    return {
      next: { yard: false, outer: land, home: -1, finished: false },
      kills,
    };
  }

  if (tok.home >= 0 && tok.outer < 0) {
    let h = tok.home + dice;
    if (h > 6) return null;
    if (h === 6) return { next: { yard: false, outer: -1, home: 6, finished: true }, kills: [] };
    return { next: { yard: false, outer: -1, home: h, finished: false }, kills: [] };
  }

  /** outer marching */
  if (tok.outer < 0) return null;

  let pos = tok.outer;
  const gp = gatePrev(playerId);
  let zone = tok.home >= 0 ? 'home' : 'outer';
  let h = tok.home >= 0 ? tok.home : -1;
  let rem = dice;

  while (rem > 0) {
    if (zone === 'outer') {
      if (pos === gp) {
        zone = 'home';
        // first pip crosses gate into corridor cell 0
        h = 0;
        rem -= 1;
        if (rem === 0) return { next: { yard: false, outer: -1, home: h, finished: false }, kills: [] };
        continue;
      }
      pos = stepCw(pos);
      rem -= 1;
      continue;
    }

    /** home corridor walking */
    h += 1;
    rem -= 1;
    if (h === 6) return rem === 0 ? { next: { yard: false, outer: -1, home: 6, finished: true }, kills: [] } : null;
    if (h > 6) return null;
  }

  if (zone === 'outer') {
    const kills = killsAtLanding(playerId, pos, allTokens, teamMode);
    return { next: { yard: false, outer: pos, home: -1, finished: false }, kills };
  }

  return { next: { yard: false, outer: -1, home: h, finished: false }, kills: [] };
}

function stepCw(from) {
  return from + 1 >= OUTER_LEN ? from + 1 - OUTER_LEN : from + 1;
}

export function legalMoves(playerId, dice, tokens, teamMode) {
  const idxs = [];
  tokens[playerId].forEach((tok, ti) => {
    if (tok.finished) return;
    const sim = simulateFullMove(playerId, tok, dice, tokens, teamMode);
    if (sim) idxs.push(ti);
  });
  return idxs;
}

export function applyMove(tokens, playerId, tokenIndex, dice, teamMode) {
  const tok = tokens[playerId][tokenIndex];
  const sim = simulateFullMove(playerId, tok, dice, tokens, teamMode);
  if (!sim) return null;
  const next = cloneTokens(tokens);
  sim.kills.forEach(({ player, tokenIndex: ti }) => {
    next[player][ti] = { yard: true, outer: -1, home: -1, finished: false };
  });
  next[playerId][tokenIndex] = { ...sim.next };
  return next;
}

export function playerFinished(tokens, pid) {
  return tokens[pid].every((t) => t.finished);
}

export function detectWinner(teamMode, tokens, numPlayers) {
  if (!teamMode) {
    for (let p = 0; p < numPlayers; p++) {
      if (playerFinished(tokens, p)) return { type: 'solo', player: p };
    }
    return null;
  }
  const a = playerFinished(tokens, 0) && playerFinished(tokens, 2);
  const b = playerFinished(tokens, 1) && playerFinished(tokens, 3);
  if (a && !b) return { type: 'team', team: 'A' };
  if (b && !a) return { type: 'team', team: 'B' };
  return null;
}
