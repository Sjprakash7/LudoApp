import { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export function Admin() {
  const { token, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    (async () => {
      try {
        const [roomsRes, onlineRes, usersRes, logsRes] = await Promise.all([
          api.adminRooms(token),
          api.adminOnline(token),
          api.adminUsers(token),
          api.adminLogs(token),
        ]);
        if (!cancelled)
          setData({
            rooms: roomsRes.rooms,
            online: onlineRes.online,
            users: usersRes.users,
            logs: logsRes,
          });
      } catch (e) {
        if (!cancelled) setErr(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, isAdmin]);

  if (!isAdmin) {
    return <p className="text-center text-rose-300">Admin routes are hidden for standard accounts.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-white">Operator console</h1>
      {err && <p className="text-sm text-rose-300">{err}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="font-semibold text-slate-100">Online sockets</h2>
          <p className="mt-2 text-3xl font-bold text-cyan-200">{data?.online?.length ?? '…'}</p>
        </GlassCard>
        <GlassCard>
          <h2 className="font-semibold text-slate-100">Registered users</h2>
          <p className="mt-2 text-3xl font-bold text-emerald-200">{data?.users?.users?.length ?? '…'}</p>
        </GlassCard>
      </div>
      <GlassCard>
        <h2 className="font-semibold text-slate-100">Live room payloads (tail)</h2>
        <pre className="mt-3 max-h-72 overflow-auto text-xs text-slate-300">
          {JSON.stringify(data?.rooms?.slice?.(0, 2) ?? [], null, 2)}
        </pre>
      </GlassCard>
      <GlassCard>
        <h2 className="font-semibold text-slate-100">Audit / gameplay logs (last 50)</h2>
        <pre className="mt-3 max-h-72 overflow-auto text-xs text-slate-300">
          {JSON.stringify(
            {
              audit: data?.logs?.audit?.slice?.(-25),
              gameplay: data?.logs?.gameplay?.slice?.(-25),
            },
            null,
            2
          )}
        </pre>
      </GlassCard>
    </div>
  );
}
