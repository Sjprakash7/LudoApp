# Ludo App

Production-structured **real-time multiplayer Ludo** with a neon gaming UI (React + Vite + Tailwind + Framer Motion), **Express + Socket.IO** gameplay authority, **JWT** sessions stored in `localStorage` (30-day tokens), and **JSON file** persistence only (`ludo-users.json`, `rooms.json`, `logs.json`).

## Features

- **JWT auth** — register with email **or** mobile + password, login with either identifier, logout clears server `active` state.
- **Socket.IO** — room create/join, host start, roll/move validation, chat, reconnect-friendly JWT handshake.
- **4-seat board engine** — 52-cell outer ring, star safe cells, yard entry on 6, home corridor, team win detection.
- **AI bots** — easy / medium / hard heuristics fill empty seats when enabled.
- **Admin console** (role `admin`) — live rooms, online IDs, audit + gameplay logs, broadcast, pause/reset, kick, room flags, ban. **Destructive tools are gated in production** unless `ADMIN_TOOLS_ENABLED=true`.
- **Sound** — lightweight Web Audio cues (toggle in Settings / in-game).

## Prerequisites

- **Node.js 18+**
- npm 9+

## Installation

```bash
git clone <your-fork> && cd LudoApp
cp .env.example server/.env
cp .env.example client/.env   # optional — see env notes below
npm install --prefix server
npm install --prefix client
```

### Environment variables

| Location | Variables |
|----------|-----------|
| `server/.env` | `PORT`, `JWT_SECRET`, `NODE_ENV`, optional `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, `ADMIN_TOOLS_ENABLED`, `DEBUG_DICE_SEQUENCE` |
| `client/.env` | `VITE_API_URL`, `VITE_SOCKET_URL` (required for production builds targeting a remote API) |

See the root **`.env.example`** for descriptions.

> **First admin user:** if the user database has **no** `role: "admin"` yet, the server will create one from `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD`. Remove those env vars after bootstrap.

## Running — development

Terminal A — API + sockets:

```bash
npm run dev:server
```

Terminal B — Vite dev server (proxies `/api/*` to `http://localhost:5000`):

```bash
npm run dev:client
```

Open `http://localhost:5173`.

- REST base URL for the browser: same origin in dev (empty `VITE_API_URL`), so `fetch('/api/...')` works.
- **Socket.IO** cannot use the Vite proxy; the client defaults to `http://localhost:5000` (override with `VITE_SOCKET_URL`).

## Production build

```bash
cd client && npm run build
```

Serve `client/dist` as static files from Express **or** a CDN, and run the Node server with a strong `JWT_SECRET`, `NODE_ENV=production`, and `ADMIN_TOOLS_ENABLED` explicitly set as needed.

```bash
cd server && npm start
```

## Socket.IO

- Path: `/socket.io` (default)
- Auth: pass JWT as `handshake.auth.token` or `Authorization: Bearer` header (implemented in `server/socket/handlers.js`).
- Main events: `room:create`, `room:join`, `game:start`, `game:roll`, `game:move`, `chat:send`; server pushes `room:patch` updates containing authoritative tokens / turn / dice / legal moves.

## Folder structure (high level)

```
client/src/
  components/   — UI primitives (glass panels, loaders, protected route)
  context/      — Auth + Socket providers
  game/         — Board visualization + layout helpers
  hooks/        — Audio hook
  layouts/      — Shell / nav
  pages/        — Splash, auth, lobby, rooms, game, admin, etc.
  services/     — REST + socket factories

server/
  controllers/  — HTTP handlers
  database/     — JSON files (gitignored from real data in prod ideally)
  middleware/   — JWT, validation, admin guard
  routes/       — REST routers
  services/     — Users, rooms, logs, game engine, bots
  socket/       — Room runtime + Socket.IO glue
  utils/        — FS JSON helpers, JWT, env
  server.js     — bootstrap
```

## JSON database files

| File | Purpose |
|------|---------|
| `server/database/ludo-users.json` | Users + hashed passwords + JWT echo + stats |
| `server/database/rooms.json` | Last-known room docs (runtime also mirrors in RAM) |
| `server/database/logs.json` | `{ audit: [], gameplay: [] }` histories |

## Security notes

- Never ship the default `JWT_SECRET`.
- Admin tooling touches gameplay **structure** (pause, reset, evict) but **never** rigs dice in favour of insiders — deterministic dev dice only apply outside production or via explicit dev tooling flags.
- Player moves are **server-validated**; clients only render state.

## Tech stack

React 19 · Vite 8 · Tailwind CSS 4 (`@tailwindcss/vite`) · Framer Motion · React Router 7 · Context API · Node 18 · Express 4 · Socket.IO 4 · bcryptjs · JWT · express-validator

## License

MIT (project scaffold — adjust as needed).
