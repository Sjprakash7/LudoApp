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
