import jwt from 'jsonwebtoken';

const THIRTY_DAYS = '30d';

export function signToken(payload, secret) {
  return jwt.sign(payload, secret, { expiresIn: THIRTY_DAYS });
}

export function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}
