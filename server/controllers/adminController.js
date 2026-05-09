/**
 * SAFETY: destructive actions require explicit ADMIN_TOOLS_ENABLED=true in production env.
 */

import {
  adminToolsEnabled,
  isProduction,
} from '../utils/env.js';
import { appendAudit } from '../services/logService.js';
import { banUser, sanitize, listUsers as loadUsersDb } from '../services/userService.js';
import {
  liveRooms,
  pauseMatch,
  resetMatch,
  sanitizeRoom,
  adminEvictPlayer,
  broadcastRoom,
} from '../socket/gameRooms.js';

function guard(cb) {
  return async (...args) => {
    const [, res] = args;
    if (isProduction && !adminToolsEnabled) {
      return res.status(403).json({
        message: 'Admin/developer tools disabled in production. Set ADMIN_TOOLS_ENABLED=true to enable intentionally.',
      });
    }
    return cb(...args);
  };
}

export const adminRoomSnapshot = guard(async (_req, res) => {
  res.json({
    rooms: [...liveRooms.values()].map((r) => ({
      detail: sanitizeRoom(r),
      eventTail: r.eventLog?.slice(-25) || [],
    })),
  });
});

export const adminOnline = guard(async (_req, res) => {
  const { getOnlineUsers } = await import('../socket/gameRooms.js');
  res.json({ online: getOnlineUsers() });
});

export const adminBroadcast = guard(async (req, res) => {
  const { text } = req.body;
  const { io } = req.app.locals;
  await appendAudit({ action: 'broadcast', actorId: req.user.id, text });
  io.emit('admin:broadcast', { text, ts: Date.now() });
  res.json({ ok: true });
});

export const adminPause = guard(async (req, res) => {
  const { roomId, paused } = req.body;
  const { io } = req.app.locals;
  await appendAudit({ action: 'pause_match', actorId: req.user.id, roomId, paused });
  pauseMatch(io, roomId, paused);
  res.json({ ok: true });
});

export const adminReset = guard(async (req, res) => {
  const { roomId } = req.body;
  const { io } = req.app.locals;
  await appendAudit({ action: 'reset_match', actorId: req.user.id, roomId });
  resetMatch(io, roomId);
  res.json({ ok: true });
});

export const adminBan = guard(async (req, res) => {
  const { userId } = req.body;
  await appendAudit({ action: 'ban', actorId: req.user.id, target: userId });
  await banUser(userId, true);
  res.json({ ok: true });
});

export const adminUsers = guard(async (_req, res) => {
  const users = await loadUsersDb();
  res.json({ users: users.map((u) => sanitize(u)) });
});

export const adminLogs = guard(async (_req, res) => {
  const { getLogs } = await import('../services/logService.js');
  const logs = await getLogs();
  res.json({
    audit: (logs.audit || []).slice(-200),
    gameplay: (logs.gameplay || []).slice(-200),
  });
});

export const adminKick = guard(async (req, res) => {
  const { roomId, targetUserId } = req.body;
  const { io } = req.app.locals;
  const out = adminEvictPlayer(io, roomId, req.user.id, targetUserId);
  res.json(out);
});

export const adminRoomFlags = guard(async (req, res) => {
  const { roomId, spectatorAllowed, botsEnabled, testingMode, debugDice } = req.body;
  const { io } = req.app.locals;
  const rt = liveRooms.get(roomId);
  if (!rt) return res.status(404).json({ message: 'Room not found in memory' });
  if (spectatorAllowed !== undefined) rt.spectatorAllowed = !!spectatorAllowed;
  if (botsEnabled !== undefined) rt.botsEnabled = !!botsEnabled;
  if (testingMode !== undefined) rt.testingMode = !!testingMode;
  if (debugDice !== undefined) rt.debugDice = !!debugDice && !isProduction;
  await appendAudit({
    action: 'room_flags',
    actorId: req.user.id,
    roomId,
    spectatorAllowed,
    botsEnabled,
    testingMode,
    debugDice,
  });
  broadcastRoom(io, roomId);
  res.json({ ok: true });
});
