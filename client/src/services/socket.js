import { io } from 'socket.io-client';

/**
 * Defaults to localhost:5000 during dev — set VITE_SOCKET_URL in .env for other hosts.
 * API calls may still proxy through Vite (see vite.config.js); sockets cannot share that proxy.
 */
export function createGameSocket(token) {
  const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  return io(url, {
    transports: ['websocket', 'polling'],
    path: '/socket.io',
    auth: { token },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 800,
  });
}
