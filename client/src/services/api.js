const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'omit',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || 'Request failed');
    err.status = res.status;
    err.details = json;
    throw err;
  }
  return json;
}

export const api = {
  register(data) {
    return request('/api/auth/register', { method: 'POST', body: data });
  },
  login(data) {
    return request('/api/auth/login', { method: 'POST', body: data });
  },
  logout(token) {
    return request('/api/auth/logout', { method: 'POST', token });
  },
  me(token) {
    return request('/api/auth/me', { token });
  },
  lobby() {
    return request('/api/rooms');
  },
  history(token) {
    return request('/api/match/history', { token });
  },
  adminRooms(token) {
    return request('/api/admin/rooms', { token });
  },
  adminOnline(token) {
    return request('/api/admin/online', { token });
  },
  adminUsers(token) {
    return request('/api/admin/users', { token });
  },
  adminLogs(token) {
    return request('/api/admin/logs', { token });
  },
};
