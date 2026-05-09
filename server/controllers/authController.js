import { body } from 'express-validator';
import { signToken } from '../utils/jwt.js';
import { JWT_SECRET } from '../utils/env.js';
import {
  registerUser,
  sanitize,
  verifyCredentials,
  saveUserToken,
  clearToken,
  findUserById,
} from '../services/userService.js';

export const registerValidators = [
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email'),
  body('mobile').optional({ values: 'falsy' }).isString(),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ characters'),
];

export async function register(req, res) {
  const { email, mobile, password, avatar } = req.body;
  const created = await registerUser({
    email: email || '',
    mobile: mobile || '',
    password,
    avatar,
  });
  const token = signToken({ sub: created.id, role: created.role }, JWT_SECRET);
  await saveUserToken(created.id, token);
  const fresh = await findUserById(created.id);
  return res.status(201).json({
    token,
    user: sanitize({ ...fresh, active: 1 }),
    expiresInDays: 30,
  });
}

export const loginValidators = [body('emailOrMobile').isString(), body('password').isLength({ min: 1 })];

export async function login(req, res) {
  const { emailOrMobile, password } = req.body;
  const candidate = await verifyCredentials({ emailOrMobile, password });
  const token = signToken({ sub: candidate.id, role: candidate.role }, JWT_SECRET);
  await saveUserToken(candidate.id, token);
  const fresh = await findUserById(candidate.id);
  res.json({
    token,
    user: sanitize(fresh),
    expiresInDays: 30,
  });
}

export async function logout(req, res) {
  await clearToken(req.user.id);
  res.json({ ok: true });
}

export async function me(req, res) {
  res.json({ user: sanitize(req.rawUser) });
}
