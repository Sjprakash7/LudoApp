import { listRooms } from '../services/roomService.js';
import { liveRooms, sanitizeRoom } from '../socket/gameRooms.js';

/** Quick lobby snapshot mixing persisted + runtime */
export async function listLobby(_req, res) {
  const persisted = await listRooms();
  const runtime = [...liveRooms.values()].map((r) => ({
    ...sanitizeRoom(r),
    hydrated: true,
  }));
  res.json({
    persisted,
    live: runtime,
    rooms: persisted.map((doc) => {
      const lv = liveRooms.get(doc.roomId);
      return lv ? sanitizeRoom(lv) : { ...doc, offline: true };
    }),
  });
}
