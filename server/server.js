/**
 * Entry — boots HTTP API + Socket.IO in one process so shared memory rooms stay authoritative.
 */

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import adminRoutes from './routes/admin.js';
import matchRoutes from './routes/match.js';
import { PORT, JWT_SECRET } from './utils/env.js';
import { ensureSeedAdmin } from './services/userService.js';
import { configureDebugDiceFromEnv } from './socket/gameRooms.js';
import { registerSocketHandlers } from './socket/handlers.js';

configureDebugDiceFromEnv();

await ensureSeedAdmin(
  process.env.SEED_ADMIN_EMAIL || '',
  process.env.SEED_ADMIN_PASSWORD || ''
);

if (!process.env.JWT_SECRET) {
  console.warn('[ludo-app] JWT_SECRET missing — default dev secret active. Set JWT_SECRET for production.');
}

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.locals.io = io;
app.locals.jwtSecret = JWT_SECRET;

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '512kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ludo-app-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`[ludo-app] Listening on ${PORT}`);
});
