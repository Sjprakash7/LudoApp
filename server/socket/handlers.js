/**
 * Socket.IO domain events — all gameplay mutations flow through gameRooms helpers.
 */

import { verifyToken } from '../utils/jwt.js';
import { JWT_SECRET } from '../utils/env.js';
import { sanitize, findUserById } from '../services/userService.js';
import {
  liveRooms,
  createRuntimeRoom,
  ensureRuntime,
  bindUserSocket,
  unbindUserSocket,
  broadcastRoom,
  startGame,
  rollDice,
  submitMove,
  attachPlayerSocket,
} from './gameRooms.js';
import { newRoomId } from '../services/roomService.js';

function nextFreeSeat(rt) {
  const used = new Set(rt.players.map((p) => p.seat));
  for (let s = 0; s < 4; s++) {
    if (!used.has(s)) return s;
  }
  return null;
}

export function registerSocketHandlers(io) {
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers.authorization || '').replace('Bearer ', '');
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyToken(token, JWT_SECRET);
      const user = await findUserById(payload.sub);
      if (!user || user.token !== token || user.banned) return next(new Error('Unauthorized'));
      socket.data.user = sanitize(user);
      socket.data.rawUser = user;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const me = socket.data.user;
    bindUserSocket(me.id, socket.id);
    socket.join(`user:${me.id}`);

    socket.emit('presence:ack', { ok: true });

    socket.on('disconnect', () => {
      unbindUserSocket(me.id, socket.id);
    });

    socket.on('room:create', async (payload, cb) => {
      const desired = String(payload?.roomCode || '').trim().toUpperCase();
      const roomId = desired.length >= 4 ? desired.slice(0, 12) : newRoomId();
      if (liveRooms.has(roomId)) {
        if (cb) cb({ ok: false, msg: 'Room exists' });
        return;
      }
      const rt = await createRuntimeRoom({
        roomId,
        hostId: me.id,
        hostProfile: { username: me.email || me.mobile || 'Host', avatar: me.avatar },
        mode: payload?.mode || '4p',
        teamMode: !!payload?.teamMode,
        maxPlayers: payload?.maxPlayers === 2 ? 2 : 4,
        botsEnabled: payload?.botsEnabled !== false,
      });
      socket.join(`room:${roomId}`);
      attachPlayerSocket(rt, me.id, socket.id);
      if (cb) cb({ ok: true, roomId });
      broadcastRoom(io, roomId);
      io.emit('lobby:refresh');
    });

    socket.on('room:join', async (payload, cb) => {
      const roomId = String(payload?.roomId || '').trim();
      const rt = await ensureRuntime(roomId);
      if (!rt) {
        if (cb) cb({ ok: false, msg: 'Room not found' });
        return;
      }
      if (rt.players.some((p) => p.userId === me.id)) {
        attachPlayerSocket(rt, me.id, socket.id);
        socket.join(`room:${roomId}`);
        if (cb) cb({ ok: true, roomId });
        broadcastRoom(io, roomId);
        return;
      }
      const humanCount = rt.players.filter((p) => !p.isBot).length;
      if (humanCount >= rt.maxPlayers) {
        if (cb) cb({ ok: false, msg: 'Room is at human capacity' });
        return;
      }
      if (rt.status !== 'waiting') {
        if (rt.spectatorAllowed) {
          rt.spectators = rt.spectators || [];
          rt.spectators.push({ userId: me.id, username: me.email || me.mobile });
          socket.join(`room:${roomId}`);
          if (cb) cb({ ok: true, roomId, spectator: true });
          broadcastRoom(io, roomId);
          return;
        }
        if (cb) cb({ ok: false, msg: 'Match started' });
        return;
      }

      const seat = nextFreeSeat(rt);
      if (seat === null) {
        if (cb) cb({ ok: false, msg: 'No free seat' });
        return;
      }

      rt.players.push({
        userId: me.id,
        username: me.email || me.mobile || 'Guest',
        avatar: me.avatar,
        seat,
        isBot: false,
        socketId: socket.id,
        botDifficulty: null,
        ready: true,
      });

      socket.join(`room:${roomId}`);
      attachPlayerSocket(rt, me.id, socket.id);
      if (cb) cb({ ok: true, roomId });
      broadcastRoom(io, roomId);
      io.emit('lobby:refresh');
    });

    socket.on('room:leave', (payload, cb) => {
      const roomId = String(payload?.roomId || '');
      const rt = liveRooms.get(roomId);
      if (rt) {
        rt.players = rt.players.filter((p) => p.userId !== me.id);
        socket.leave(`room:${roomId}`);
        broadcastRoom(io, roomId);
        io.emit('lobby:refresh');
      }
      if (cb) cb({ ok: true });
    });

    socket.on('game:start', async (payload, cb) => {
      const roomId = String(payload?.roomId || '');
      const res = await startGame(io, roomId, me.id);
      if (cb) cb(res);
      io.emit('lobby:refresh');
    });

    socket.on('game:roll', async (payload, cb) => {
      const roomId = String(payload?.roomId || '');
      const res = await rollDice(io, roomId, me.id);
      if (cb) cb(res);
    });

    socket.on('game:move', async (payload, cb) => {
      const roomId = String(payload?.roomId || '');
      const tokenIndex = Number(payload?.tokenIndex);
      const res = await submitMove(io, roomId, me.id, tokenIndex);
      if (cb) cb(res);
    });

    socket.on('chat:send', async (payload) => {
      const roomId = String(payload?.roomId || '');
      const rt = liveRooms.get(roomId);
      if (!rt) return;
      const text = String(payload?.text || '').slice(0, 400);
      io.to(`room:${roomId}`).emit('chat:message', {
        from: me.email || me.mobile,
        userId: me.id,
        text,
        ts: Date.now(),
      });
    });
  });
}
