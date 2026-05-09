import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createGameSocket } from '../services/socket.js';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      setSocket((prev) => {
        prev?.disconnect();
        return null;
      });
      setConnected(false);
      return undefined;
    }
    const s = createGameSocket(token);
    setSocket(s);
    s.connect();
    const onConnect = () => setConnected(true);
    const onDisc = () => setConnected(false);
    s.on('connect', onConnect);
    s.on('disconnect', onDisc);
    s.on('connect_error', onDisc);
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisc);
      s.disconnect();
    };
  }, [token]);

  const emit = useCallback((event, payload) => {
    return new Promise((resolve, reject) => {
      const s = socket;
      if (!s?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }
      s.emit(event, payload, (ack) => {
        if (ack && ack.ok === false) reject(new Error(ack.msg || 'Request failed'));
        else resolve(ack);
      });
    });
  }, [socket]);

  const value = useMemo(
    () => ({
      socket,
      connected,
      emit,
    }),
    [socket, connected, emit]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket requires SocketProvider');
  return ctx;
}
