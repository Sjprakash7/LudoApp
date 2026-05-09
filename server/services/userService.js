import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { updateJsonFile, readJsonFile } from '../utils/fileDb.js';

const USERS_REL = 'ludo-users.json';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeMobile(mobile) {
  return String(mobile || '').replace(/\D/g, '');
}

export async function listUsers() {
  return readJsonFile(USERS_REL, []);
}

async function mutateUsers(mutator) {
  return updateJsonFile(USERS_REL, mutator, []);
}

export async function findUserById(id) {
  const users = await listUsers();
  return users.find((u) => u.id === id) || null;
}

export async function findByEmailOrMobile({ email, mobile }) {
  const e = normalizeEmail(email);
  const m = normalizeMobile(mobile);
  const users = await listUsers();
  return (
    users.find((u) => (e && normalizeEmail(u.email) === e) || (m && normalizeMobile(u.mobile) === m)) ||
    null
  );
}

/** ~100KB ASCII cap keeps JSON users file healthy; rejects huge base64 payloads. */
const MAX_AVATAR_CHARS = 120000;

export function coerceAvatar(raw) {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim();
  if (s.length > MAX_AVATAR_CHARS) {
    const err = new Error('Avatar data too large — use a smaller JPG/PNG.');
    err.status = 400;
    throw err;
  }
  if (
    s.startsWith('data:image/jpeg') ||
    s.startsWith('data:image/jpg') ||
    s.startsWith('data:image/png') ||
    s.startsWith('data:image/webp')
  )
    return s;
  if (/^https:\/\/.{4,4096}$/i.test(s)) return s;
  if (/^http:\/\/localhost(:\d+)?/i.test(s)) return s;
  const err = new Error('Avatar must be a JPG/PNG data URL from upload or https image URL.');
  err.status = 400;
  throw err;
}

export async function registerUser({ username, email, mobile, password, avatar }) {
  const e = normalizeEmail(email);
  const m = normalizeMobile(mobile);
  const name = String(username || '').trim();
  if (!password || password.length < 6) {
    const err = new Error('Password must be at least 6 characters');
    err.status = 400;
    throw err;
  }
  if (!e && !m) {
    const err = new Error('Email or mobile is required');
    err.status = 400;
    throw err;
  }
  const exists = await findByEmailOrMobile({ email: e, mobile: m });
  if (exists) {
    const err = new Error('Account already exists');
    err.status = 409;
    throw err;
  }
  const chosen = coerceAvatar(avatar);
  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    username: name || '',
    email: e || '',
    mobile: m || '',
    password: hash,
    role: 'user',
    banned: 0,
    active: 0,
    createdAt: new Date().toISOString(),
    lastLogin: '',
    token: '',
    avatar: chosen || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(uuidv4())}`,
    wins: 0,
    losses: 0,
  };
  await mutateUsers((users) => [...users, user]);
  return sanitize(user);
}

export function sanitize(user) {
  if (!user) return null;
  const { password, token, ...rest } = user;
  return rest;
}

export async function verifyCredentials({ emailOrMobile, password }) {
  const raw = String(emailOrMobile || '').trim();
  const isEmail = raw.includes('@');
  const candidate = await findByEmailOrMobile(isEmail ? { email: raw } : { mobile: raw });
  if (!candidate) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, candidate.password);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  return candidate;
}

export async function saveUserToken(userId, jwtToken) {
  await mutateUsers((users) =>
    users.map((u) => (u.id === userId ? { ...u, token: jwtToken, lastLogin: new Date().toISOString(), active: 1 } : u))
  );
}

export async function setActive(userId, active) {
  await mutateUsers((users) =>
    users.map((u) => (u.id === userId ? { ...u, active: active ? 1 : 0 } : u))
  );
}

export async function clearToken(userId) {
  await mutateUsers((users) =>
    users.map((u) => (u.id === userId ? { ...u, token: '', active: 0 } : u))
  );
}

export async function bumpStats(userId, result) {
  await mutateUsers((users) =>
    users.map((u) => {
      if (u.id !== userId) return u;
      if (result === 'win') return { ...u, wins: (u.wins || 0) + 1 };
      if (result === 'loss') return { ...u, losses: (u.losses || 0) + 1 };
      return u;
    })
  );
}

export async function banUser(userId, banned = true) {
  await mutateUsers((users) =>
    users.map((u) =>
      u.id === userId
        ? {
            ...u,
            banned: banned ? 1 : 0,
            active: banned ? 0 : u.active,
          }
        : u
    )
  );
}

export async function ensureSeedAdmin(email, password) {
  const e = normalizeEmail(email);
  if (!e || !password) return null;
  const users = await listUsers();
  if (users.some((u) => u.role === 'admin')) return null;
  const hash = await bcrypt.hash(password, 10);
  const admin = {
    id: uuidv4(),
    email: e,
    mobile: '',
    password: hash,
    role: 'admin',
    banned: 0,
    active: 0,
    createdAt: new Date().toISOString(),
    lastLogin: '',
    token: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    wins: 0,
    losses: 0,
  };
  await mutateUsers((u) => [...u, admin]);
  return sanitize(admin);
}
