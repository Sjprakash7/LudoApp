/**
 * Entry — boots HTTP API + Socket.IO in one process so shared memory rooms stay authoritative.
 */

import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import adminRoutes from './routes/admin.js';
import matchRoutes from './routes/match.js';
import { PORT, JWT_SECRET, allowedCorsOrigins } from './utils/env.js';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, '..', 'client', 'dist');

const app = express();
const server = http.createServer(app);

const corsOrigins = allowedCorsOrigins();
const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
  },
});

app.locals.io = io;
app.locals.jwtSecret = JWT_SECRET;

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (corsOrigins.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '512kb' }));

// Static files from built React app (production)
app.use(express.static(clientDist, { maxAge: '1d' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ludo-app-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/admin', adminRoutes);

// SPA fallback: serve index.html for non-API routes (React Router)
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`[ludo-app] Listening on ${PORT}`);
});
