import { v4 as uuidv4 } from 'uuid';
import { updateJsonFile, readJsonFile } from '../utils/fileDb.js';

const ROOMS_REL = 'rooms.json';

export async function listRooms() {
  return readJsonFile(ROOMS_REL, []);
}

async function mutateRooms(mutator) {
  return updateJsonFile(ROOMS_REL, mutator, []);
}

/**
 * Persisted room record (meta). Live match state stays in memory on GameRoomManager.
 */
export function emptyRoomDoc({
  roomId,
  hostId,
  mode = '4p',
  teamMode = false,
  botsEnabled = true,
  maxPlayers = 4,
}) {
  return {
    roomId,
    hostId,
    players: [],
    status: 'waiting',
    turn: '',
    winner: '',
    createdAt: new Date().toISOString(),
    mode,
    teamMode,
    botsEnabled,
    maxPlayers,
    spectators: [],
    settings: {
      spectatorAllowed: true,
      paused: false,
    },
  };
}

export async function upsertRoomDoc(roomDoc) {
  await mutateRooms((rooms) => {
    const idx = rooms.findIndex((r) => r.roomId === roomDoc.roomId);
    if (idx === -1) return [...rooms, roomDoc];
    const next = [...rooms];
    next[idx] = { ...rooms[idx], ...roomDoc };
    return next;
  });
}

export async function deleteRoomDoc(roomId) {
  await mutateRooms((rooms) => rooms.filter((r) => r.roomId !== roomId));
}

export async function patchRoom(roomId, patch) {
  await mutateRooms((rooms) => {
    const idx = rooms.findIndex((r) => r.roomId === roomId);
    if (idx === -1) return rooms;
    const next = [...rooms];
    next[idx] = { ...next[idx], ...patch };
    return next;
  });
}

export function newRoomId() {
  return uuidv4().slice(0, 8).toUpperCase();
}
