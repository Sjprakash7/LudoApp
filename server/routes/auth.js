import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  me,
  registerValidators,
  loginValidators,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const r = Router();

r.post(
  '/register',
  [
    ...registerValidators,
    body().custom((_, { req }) => {
      const e = String(req.body.email || '').trim();
      const m = String(req.body.mobile || '').trim();
      if (!e && !m) throw new Error('Either email or mobile is required');
      return true;
    }),
  ],
  validate,
  register
);

r.post('/login', loginValidators, validate, login);
r.post('/logout', requireAuth, logout);
r.get('/me', requireAuth, me);

export default r;
