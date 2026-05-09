import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCK = {};

/**
 * Minimal async mutex per file path to avoid corrupt JSON under concurrent writes.
 */
async function withLock(filePath, fn) {
  while (LOCK[filePath]) {
    await LOCK[filePath];
  }
  let resolveUnlock;
  const p = new Promise((r) => {
    resolveUnlock = r;
  });
  LOCK[filePath] = p;
  try {
    return await fn();
  } finally {
    resolveUnlock();
    delete LOCK[filePath];
  }
}

export function dbPath(rel) {
  return path.join(__dirname, '..', 'database', rel);
}

export async function readJsonFile(rel, fallback) {
  const filePath = dbPath(rel);
  try {
    const raw = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(rel, data) {
  const filePath = dbPath(rel);
  const tmp = `${filePath}.tmp`;
  const json = JSON.stringify(data, null, 2);
  await fs.promises.writeFile(tmp, json, 'utf8');
  await fs.promises.rename(tmp, filePath);
}

/** Read/write with file-level lock */
export async function updateJsonFile(rel, updater, fallback) {
  const filePath = dbPath(rel);
  return withLock(filePath, async () => {
    let current = await readJsonFile(rel, fallback);
    const next = await updater(current);
    await writeJsonFile(rel, next);
    return next;
  });
}
