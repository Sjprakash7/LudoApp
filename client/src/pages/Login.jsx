import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrMobile: '', password: '' });
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      await login(form);
      navigate('/lobby', { replace: true });
    } catch (ex) {
      setErr(ex.message || 'Login failed');
    }
  }

  return (
    <div className="ludo-pattern-bg min-h-dvh px-4 py-8">
      <div className="mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border-2 border-sky-500/45 bg-[#071a33]/90 p-6 shadow-[0_0_40px_rgba(33,150,243,0.2)] backdrop-blur-lg"
        >
          <h1 className="mb-6 text-center text-2xl font-black text-white">Welcome back</h1>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-sky-100/90">Email or mobile</span>
              <input
                className="rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-white outline-none ring-sky-400/30 focus:ring-2"
                value={form.emailOrMobile}
                onChange={(e) => setForm({ ...form, emailOrMobile: e.target.value })}
                placeholder="you@mail.com"
                autoComplete="username"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-sky-100/90">Password</span>
              <input
                type="password"
                className="rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-white outline-none ring-sky-400/30 focus:ring-2"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>
            {err && <p className="text-sm text-rose-300">{err}</p>}
            <button type="submit" className="menu-pyramid-btn w-full py-3.5 text-base">
              Enter arena
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-sky-300/80">
            New player?{' '}
            <Link className="font-bold text-amber-200 underline-offset-4 hover:underline" to="/register">
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
