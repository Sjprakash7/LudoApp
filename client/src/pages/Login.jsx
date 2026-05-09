import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard.jsx';
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
    <div className="mx-auto max-w-md">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard>
          <h1 className="mb-6 text-2xl font-bold text-white">Welcome back</h1>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-300">Email or mobile</span>
              <input
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none ring-cyan-400/40 focus:ring-2"
                value={form.emailOrMobile}
                onChange={(e) => setForm({ ...form, emailOrMobile: e.target.value })}
                placeholder="you@mail.com"
                autoComplete="username"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-300">Password</span>
              <input
                type="password"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none ring-cyan-400/40 focus:ring-2"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>
            {err && <p className="text-sm text-rose-300">{err}</p>}
            <button type="submit" className="btn-neon mt-2 w-full">
              Enter arena
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            Need an account?{' '}
            <Link className="text-cyan-300 hover:underline" to="/register">
              Register
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
