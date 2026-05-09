/**
 * In-memory authoritative match registry + hydration from rooms.json on demand.
 */

import { applyMove, createInitialTokens, detectWinner, legalMoves } from '../services/gameEngine.js';
import { pickBotMove } from '../services/botAI.js';
import { upsertRoomDoc, listRooms as loadRoomDocs } from '../services/roomService.js';
import { appendGameplay, appendAudit } from '../services/logService.js';
import { bumpStats } from '../services/userService.js';
import { isProduction, NODE_ENV } from '../utils/env.js';

/** @typedef {import('socket.io').Server} IOServer */

/** Track multiple tabs per user */
const socketByUser = new Map(); // userId -> Set<socketId>

/** runtime rooms */
export const liveRooms = new Map(); // roomId -> RuntimeRoom

/** Deterministic dice dev queue */
let diceQueue = [];

export function configureDebugDiceFromEnv() {
  const raw = process.env.DEBUG_DICE_SEQUENCE || '';
  diceQueue = raw
    .split(',')
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 6);
}

function rndDice() {
  if (!isProduction && diceQueue.length) {
    const v = diceQueue.shift();
    diceQueue.push(v);
    return v;
  }
  return 1 + Math.floor(Math.random() * 6);
}

function shallowRuntimeFromDoc(doc) {
  return {
    roomId: doc.roomId,
    hostId: doc.hostId,
    mode: doc.mode || '4p',
    maxPlayers: doc.maxPlayers ?? 4,
    teamMode: !!doc.teamMode,
    spectators: [...(doc.spectators || [])],
    botsEnabled: doc.botsEnabled !== false,
    status: doc.status || 'waiting',
    turnSeat: typeof doc.turn === 'string' && doc.turn !== '' ? Number(doc.turn) : 0,
    winnerSeat: '',
    paused: !!(doc.settings && doc.settings.paused),
    spectatorAllowed:
      doc.settings && doc.settings.spectatorAllowed !== undefined ? !!doc.settings.spectatorAllowed : true,
    players: [...(doc.players || [])],
    testingMode: !!(doc.settings && doc.settings.testingMode),
    debugDice: !!(doc.settings && doc.settings.debugDice),
  };
}

async function flushRoomDoc(roomId) {
  const rt = liveRooms.get(roomId);
  if (!rt) return;
  await upsertRoomDoc({
    roomId: rt.roomId,
    hostId: rt.hostId,
    players: rt.players.map((p) => ({
      userId: p.userId,
      seat: p.seat,
      username: p.username,
      isBot: !!p.isBot,
    })),
    status: rt.status === 'playing' ? 'playing' : rt.status === 'done' ? 'done' : 'waiting',
    turn: String(rt.game?.turnSeat ?? rt.turnSeat ?? ''),
    winner: rt.winnerSeat || '',
    createdAt: rt.createdAt || new Date().toISOString(),
    mode: rt.mode,
    teamMode: rt.teamMode,
    botsEnabled: rt.botsEnabled,
    maxPlayers: rt.maxPlayers,
    spectators: rt.spectators || [],
    settings: {
      spectatorAllowed: rt.spectatorAllowed,
      paused: rt.paused,
      botsEnabled: rt.botsEnabled,
      testingMode: rt.testingMode,
      debugDice: rt.debugDice,
    },
  });
}

/**
 * Create runtime room
 */
export async function createRuntimeRoom({
  roomId,
  hostId,
  hostProfile,
  mode,
  teamMode,
  maxPlayers,
  botsEnabled,
}) {
  const rt = {
    roomId,
    hostId,
    mode: mode || '4p',
    maxPlayers: maxPlayers === 2 ? 2 : 4,
    createdAt: new Date().toISOString(),
    teamMode: !!teamMode,
    spectators: [],
    botsEnabled: botsEnabled !== false,
    status: 'waiting',
    turnSeat: 0,
    winnerSeat: '',
    paused: false,
    spectatorAllowed: true,
    testingMode: false,
    debugDice: false,
    players: [
      {
        userId: hostId,
        username: hostProfile.username,
        avatar: hostProfile.avatar,
        seat: 0,
        isBot: false,
        socketId: null,
        botDifficulty: null,
        ready: true,
      },
    ],
    game: null,
    chat: [],
    diceHistory: [],
    eventLog: [],
  };
  liveRooms.set(roomId, rt);
  await upsertRoomDoc({
    roomId,
    hostId,
    players: rt.players.map((p) => ({ userId: p.userId, seat: p.seat, username: p.username, isBot: p.isBot })),
    status: 'waiting',
    turn: '',
    winner: '',
    createdAt: rt.createdAt,
    mode: rt.mode,
    teamMode: rt.teamMode,
    botsEnabled: rt.botsEnabled,
    maxPlayers: rt.maxPlayers,
    spectators: [],
    settings: { spectatorAllowed: true, paused: false, testingMode: false, debugDice: false },
  });
  return rt;
}

export async function ensureRuntime(roomId) {
  if (liveRooms.has(roomId)) return liveRooms.get(roomId);
  const docs = await loadRoomDocs();
  const doc = docs.find((r) => r.roomId === roomId);
  if (!doc) return null;
  const rt = shallowRuntimeFromDoc(doc);
  rt.game = null;
  rt.chat = [];
  rt.diceHistory = [];
  rt.eventLog = [];
  rt.createdAt = doc.createdAt || new Date().toISOString();
  rt.players = (doc.players || []).map((p, i) => ({
    userId: p.userId,
    username: p.username || `Player ${i + 1}`,
    avatar: p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId}`,
    seat: typeof p.seat === 'number' ? p.seat : i,
    isBot: !!p.isBot,
    socketId: null,
    botDifficulty: p.botDifficulty || 'medium',
    ready: true,
  }));
  liveRooms.set(roomId, rt);
  return rt;
}

export function bindUserSocket(userId, socketId) {
  if (!socketByUser.has(userId)) socketByUser.set(userId, new Set());
  socketByUser.get(userId).add(socketId);
}

export function unbindUserSocket(userId, socketId) {
  const s = socketByUser.get(userId);
  if (!s) return;
  s.delete(socketId);
  if (!s.size) socketByUser.delete(userId);
}

export function getOnlineUsers() {
  return Array.from(socketByUser.keys());
}

/** Public snapshot emitted to lobby */
export function serializeRoomForList(rt) {
  return {
    roomId: rt.roomId,
    hostId: rt.hostId,
    status: rt.status,
    players: rt.players?.length ?? 0,
    maxPlayers: rt.maxPlayers,
    mode: rt.mode,
    teamMode: rt.teamMode,
    spectatingAllowed: rt.spectatorAllowed,
  };
}

export function broadcastRoom(io, roomId) {
  const rt = liveRooms.get(roomId);
  if (!rt) return;
  io.to(`room:${roomId}`).emit('room:patch', sanitizeRoom(rt));
}

export function sanitizeRoom(rt) {
  return {
    roomId: rt.roomId,
    hostId: rt.hostId,
    mode: rt.mode,
    maxPlayers: rt.maxPlayers,
    teamMode: rt.teamMode,
    status: rt.status,
    spectatorAllowed: rt.spectatorAllowed,
    botsEnabled: rt.botsEnabled,
    paused: rt.paused,
    players: rt.players.map((p) => ({
      userId: p.userId,
      username: p.username,
      avatar: p.avatar,
      seat: p.seat,
      isBot: p.isBot,
      ready: !!p.ready,
      botDifficulty: p.botDifficulty,
    })),
    spectators: rt.spectators,
    game:
      rt.game && rt.status !== 'waiting'
        ? {
            tokens: rt.game.tokens,
            turnSeat: rt.game.turnSeat,
            dice: rt.game.awaitingDice ? null : rt.game.dice,
            awaitingDice: rt.game.awaitingDice,
            awaitingMove: rt.game.awaitingMove,
            diceHistoryTail: rt.diceHistory.slice(-12),
            legalTokenIndices:
              rt.game.awaitingMove && rt.game.dice != null
                ? legalMoves(rt.game.turnSeat, rt.game.dice, rt.game.tokens, rt.teamMode)
                : [],
          }
        : null,
    winnerSeat: rt.winnerSeat,
  };
}

function logEvent(roomId, evt) {
  const rt = liveRooms.get(roomId);
  const row = { ...evt, t: Date.now(), env: NODE_ENV };
  rt?.eventLog.push(row);
}

export async function startGame(io, roomId, startedByUserId) {
  const rt = liveRooms.get(roomId);
  if (!rt || rt.hostId !== startedByUserId) return { ok: false, msg: 'Only host may start.' };

  const humans = rt.players.filter((p) => !p.isBot);
  if (humans.length < 1) return { ok: false, msg: 'Need at least one human player.' };
  if (humans.length < 4 && !rt.botsEnabled) {
    return { ok: false, msg: 'Enable AI bots to auto-fill seats — or wait until four humans join.' };
  }

  if (!padBotsForRoom(rt)) {
    return { ok: false, msg: 'Not all seats are filled — enable bots to auto-fill empties.' };
  }

  rt.status = 'playing';
  rt.game = {
    tokens: createInitialTokens(4),
    turnSeat: 0,
    dice: null,
    awaitingDice: true,
    awaitingMove: false,
    sixChain: 0,
  };

  rt.diceHistory = [];
  rt.winnerSeat = '';
  rt.eventLog = [];
  broadcastRoom(io, roomId);
  await flushRoomDoc(roomId);

  appendGameplay({
    type: 'match_start',
    roomId,
    players: rt.players.map((p) => p.userId),
  });

  queueBotTurn(io, roomId);
  return { ok: true };
}

/** Ensure seats 0..3 are filled — bots pad missing slots when enabled */
export function padBotsForRoom(rt) {
  for (let seat = 0; seat < 4; seat++) {
    const occ = rt.players.some((p) => p.seat === seat);
    if (occ) continue;
    if (!rt.botsEnabled) return false;
    const idx = rt.players.filter((p) => p.isBot).length;
    rt.players.push({
      userId: `bot-${seat}-${roomIdShort(rt.roomId)}`,
      username: `Bot ${['Neon', 'Pulse', 'Nova', 'Axon'][seat % 4]}`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${rt.roomId}-${seat}`,
      seat,
      isBot: true,
      botDifficulty: ['easy', 'medium', 'hard'][idx % 3],
      socketId: null,
      ready: true,
    });
  }
  rt.players.sort((a, b) => a.seat - b.seat);
  return true;
}

function roomIdShort(id) {
  return id.slice(0, 4);
}

export function attachPlayerSocket(rt, userId, socketId) {
  const p = rt.players.find((x) => x.userId === userId);
  if (p) p.socketId = socketId;
}

/** -- Gameplay actions -- */

export async function rollDice(io, roomId, userId) {
  const rt = liveRooms.get(roomId);
  if (!rt?.game || rt.paused) return { ok: false, msg: 'Paused or not started.' };
  const seat = rt.players.find((p) => p.userId === userId)?.seat;
  if (seat === undefined) return { ok: false, msg: 'Not in room.' };
  if (seat !== rt.game.turnSeat) return { ok: false, msg: 'Not your turn.' };
  if (!rt.game.awaitingDice) return { ok: false, msg: 'Already rolled.' };

  const dice = rndDice();

  rt.game.dice = dice;
  rt.game.awaitingDice = false;
  rt.diceHistory.push({ seat, dice, ts: Date.now() });

  if (dice === 6) rt.game.sixChain += 1;
  else rt.game.sixChain = 0;

  if (rt.game.sixChain >= 3) {
    logEvent(roomId, { type: 'forfeit_triple_six', seat });
    appendGameplay({ type: 'triple_six', roomId, seat });
    rt.game.sixChain = 0;
    advanceTurn(rt);
    rt.game.awaitingDice = true;
    rt.game.awaitingMove = false;
    rt.game.dice = null;
    broadcastRoom(io, roomId);
    queueBotTurn(io, roomId);
    return { ok: true, tripleSix: true };
  }

  const lm = legalMoves(seat, dice, rt.game.tokens, rt.teamMode);
  if (!lm.length) {
    logEvent(roomId, { type: 'no_moves', seat, dice });
    appendGameplay({ type: 'no_moves', roomId, seat, dice });
    maybeExtraTurn(rt, dice, false);
    broadcastRoom(io, roomId);
    queueBotTurn(io, roomId);
    return { ok: true, noMoves: true };
  }

  rt.game.awaitingMove = true;
  logEvent(roomId, { type: 'roll', seat, dice });
  appendGameplay({ type: 'roll', roomId, seat, dice });
  broadcastRoom(io, roomId);
  return { ok: true };
}

function maybeExtraTurn(rt, dice, moved) {
  const extra = dice === 6 && moved;
  if (!extra) advanceTurn(rt);
  rt.game.awaitingDice = true;
  rt.game.awaitingMove = false;
  rt.game.dice = null;
}

function advanceTurn(rt) {
  rt.game.sixChain = 0;
  rt.game.turnSeat = (rt.game.turnSeat + 1) % 4;
}

export async function submitMove(io, roomId, userId, tokenIndex) {
  const rt = liveRooms.get(roomId);
  if (!rt?.game || rt.paused) return { ok: false, msg: 'Invalid state.' };
  const seat = rt.players.find((p) => p.userId === userId)?.seat;
  if (seat === undefined) return { ok: false, msg: 'Not in room.' };
  if (seat !== rt.game.turnSeat) return { ok: false, msg: 'Not your turn.' };
  if (!rt.game.awaitingMove) return { ok: false, msg: 'Roll first.' };
  const dice = rt.game.dice;
  const lm = legalMoves(seat, dice, rt.game.tokens, rt.teamMode);
  if (!lm.includes(tokenIndex)) return { ok: false, msg: 'Illegal move.' };

  const nextBoard = applyMove(rt.game.tokens, seat, tokenIndex, dice, rt.teamMode);
  if (!nextBoard) return { ok: false, msg: 'Illegal move.' };
  rt.game.tokens = nextBoard;

  const win = detectWinner(rt.teamMode, rt.game.tokens, 4);
  if (win) {
    rt.status = 'done';
    rt.winnerSeat = win.type === 'solo' ? String(win.player) : win.team;
    appendGameplay({
      type: 'match_end',
      roomId,
      winner: rt.winnerSeat,
      teamMode: rt.teamMode,
      humans: rt.players.filter((p) => !p.isBot).map((p) => ({ userId: p.userId, seat: p.seat })),
    });
    await resolveStats(rt, win);
    broadcastRoom(io, roomId);
    return { ok: true, finished: true };
  }

  logEvent(roomId, { type: 'move', seat, tokenIndex, dice });
  appendGameplay({ type: 'move', roomId, seat, tokenIndex, dice });
  maybeExtraTurn(rt, dice, true);
  broadcastRoom(io, roomId);
  queueBotTurn(io, roomId);
  return { ok: true };
}

async function resolveStats(rt, win) {
  /** Naive stats: winners human users +1 loss others */
  const humanIds = rt.players.filter((p) => !p.isBot).map((p) => p.userId);
  if (win.type === 'solo') {
    for (const p of rt.players) {
      if (p.isBot) continue;
      if (String(p.seat) === String(win.player)) await bumpStats(p.userId, 'win');
      else await bumpStats(p.userId, 'loss');
    }
    return;
  }
  /** team wins */
  const teamA = new Set([0, 2]);
  const winners = win.team === 'A' ? teamA : new Set([1, 3]);
  for (const p of rt.players) {
    if (p.isBot) continue;
    if (winners.has(p.seat)) await bumpStats(p.userId, 'win');
    else await bumpStats(p.userId, 'loss');
  }
}

export function queueBotTurn(io, roomId) {
  const rt = liveRooms.get(roomId);
  if (!rt?.game || rt.status !== 'playing') return;

  let ps = rt.players.find((p) => p.seat === rt.game.turnSeat && p.isBot);
  if (!ps) return;

  setTimeout(async () => {
    const live = liveRooms.get(roomId);
    if (!live?.game || live.status !== 'playing') return;
    ps = live.players.find((p) => p.seat === live.game.turnSeat && p.isBot);
    if (!ps) return;
    if (live.game.awaitingDice) await rollDice(io, roomId, ps.userId);
    const snap = liveRooms.get(roomId);
    if (!snap?.game) return;
    const botSeat = snap.players.find((p) => p.seat === snap.game.turnSeat && p.isBot);
    if (snap.game.awaitingMove && snap.game.dice && botSeat) {
      const pick = pickBotMove(
        snap.game.tokens,
        snap.game.turnSeat,
        snap.game.dice,
        botSeat.botDifficulty || 'medium',
        snap.teamMode
      );
      if (pick) await submitMove(io, roomId, botSeat.userId, pick.tokenIndex);
    }
  }, 650);
}

export async function kickUser(io, roomId, actorId, targetUserId, reason, log) {
  const rt = liveRooms.get(roomId);
  if (!rt) return { ok: false, msg: 'Room missing.' };
  if (actorId !== rt.hostId) return { ok: false, msg: 'Forbidden.' };
  rt.players = rt.players.filter((p) => p.userId !== targetUserId);
  appendAudit({ action: 'kick', actorId, targetUserId, roomId, reason, log });
  broadcastRoom(io, roomId);
  return { ok: true };
}

/** Host-independent moderation hook — audit-logged, does not manipulate dice outcomes. */
export function adminEvictPlayer(io, roomId, actorAdminId, targetUserId) {
  const rt = liveRooms.get(roomId);
  if (!rt) return { ok: false, msg: 'Room missing.' };
  rt.players = rt.players.filter((p) => p.userId !== targetUserId);
  appendAudit({ action: 'admin_evict', actorAdminId, targetUserId, roomId });
  broadcastRoom(io, roomId);
  return { ok: true };
}

export function pauseMatch(io, roomId, paused) {
  const rt = liveRooms.get(roomId);
  if (!rt) return;
  rt.paused = !!paused;
  broadcastRoom(io, roomId);
}

export function resetMatch(io, roomId) {
  const rt = liveRooms.get(roomId);
  if (!rt) return;
  rt.status = 'waiting';
  rt.game = null;
  rt.winnerSeat = '';
  broadcastRoom(io, roomId);
}
