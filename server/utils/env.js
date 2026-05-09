import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const PORT = Number(process.env.PORT) || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const isProduction = NODE_ENV === 'production';

/** Admin/debug tools blocked unless explicitly enabled in production */
export const adminToolsEnabled = process.env.ADMIN_TOOLS_ENABLED === 'true' || !isProduction;

/**
 * Browser + Vercel frontend origins allowed for CORS / Socket.IO.
 * Override with CLIENT_ORIGINS="https://a.com,https://b.com" on Render.
 */
export function allowedCorsOrigins() {
  const defaults = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://ludo-app-nine.vercel.app',
    'https://ludoapp.onrender.com',
    'http://ludoapp.onrender.com',
  ];
  const extra = (process.env.CLIENT_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...defaults, ...extra])];
}
