import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getLogs } from '../services/logService.js';

const r = Router();

r.get('/history', requireAuth, async (req, res) => {
  const logs = await getLogs();
  const userId = req.user.id;
  const matches = (logs.gameplay || [])
    .filter((e) => e.type === 'match_end' && (e.humans || []).some((h) => h.userId === userId))
    .slice(-20)
    .reverse();
  res.json({ matches });
});

export default r;
