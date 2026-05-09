import { verifyToken } from '../utils/jwt.js';
import { JWT_SECRET } from '../utils/env.js';
import { findUserById, sanitize } from '../services/userService.js';

/**
 * Express middleware — Authorization: Bearer <jwt>
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = verifyToken(token, JWT_SECRET);
    const user = await findUserById(payload.sub);
    if (!user || user.token !== token || user.banned === 1) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = sanitize(user);
    req.rawUser = user;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}
