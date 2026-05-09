import { Router } from 'express';
import { listLobby } from '../controllers/roomRestController.js';

const r = Router();
r.get('/', listLobby);

export default r;
