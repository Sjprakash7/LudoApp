import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import {
  adminRoomSnapshot,
  adminOnline,
  adminBroadcast,
  adminPause,
  adminReset,
  adminBan,
  adminUsers,
  adminLogs,
  adminKick,
  adminRoomFlags,
} from '../controllers/adminController.js';

const r = Router();
r.use(requireAuth, requireAdmin);

r.get('/rooms', adminRoomSnapshot);
r.get('/online', adminOnline);
r.get('/users', adminUsers);
r.get('/logs', adminLogs);
r.post('/broadcast', adminBroadcast);
r.post('/pause', adminPause);
r.post('/reset', adminReset);
r.post('/ban', adminBan);
r.post('/kick', adminKick);
r.post('/room-flags', adminRoomFlags);

export default r;
