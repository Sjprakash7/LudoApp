import { updateJsonFile, readJsonFile } from '../utils/fileDb.js';

const LOG_REL = 'logs.json';

async function mutateLogs(fn) {
  return updateJsonFile(
    LOG_REL,
    async (doc) => {
      const base = doc && typeof doc === 'object' ? doc : { audit: [], gameplay: [] };
      if (!Array.isArray(base.audit)) base.audit = [];
      if (!Array.isArray(base.gameplay)) base.gameplay = [];
      return fn(base);
    },
    { audit: [], gameplay: [] }
  );
}

/**
 * Persist admin and security-sensitive actions for review.
 */
export async function appendAudit(entry) {
  const row = {
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    ...entry,
  };
  await mutateLogs((doc) => {
    doc.audit.push(row);
    if (doc.audit.length > 5000) doc.audit.splice(0, doc.audit.length - 5000);
    return doc;
  });
  return row;
}

export async function appendGameplay(entry) {
  const row = {
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    ...entry,
  };
  await mutateLogs((doc) => {
    doc.gameplay.push(row);
    if (doc.gameplay.length > 8000) doc.gameplay.splice(0, doc.gameplay.length - 8000);
    return doc;
  });
  return row;
}

export async function getLogs() {
  return readJsonFile(LOG_REL, { audit: [], gameplay: [] });
}
