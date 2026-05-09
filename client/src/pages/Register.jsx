import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', mobile: '', password: '', confirm: '' });
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setErr('Passwords do not match');
      return;
    }
    if (!form.email && !form.mobile) {
      setErr('Enter email or mobile');
      return;
    }
    setErr('');
    try {
      await register({ email: form.email, mobile: form.mobile, password: form.password });
      navigate('/lobby', { replace: true });
    } catch (ex) {
      setErr(ex.message || 'Registration failed');
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard>
          <h1 className="mb-6 text-2xl font-bold text-white">Create profile</h1>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-300">Email</span>
              <input
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none ring-cyan-400/40 focus:ring-2"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                type="email"
                placeholder="you@mail.com"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-300">Mobile</span>
              <input
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none ring-cyan-400/40 focus:ring-2"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })}
                inputMode="numeric"
                placeholder="Digits only"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-300">Password</span>
              <input
                type="password"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none ring-cyan-400/40 focus:ring-2"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={6}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-300">Confirm password</span>
              <input
                type="password"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none ring-cyan-400/40 focus:ring-2"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                minLength={6}
                required
              />
            </label>
            {err && <p className="text-sm text-rose-300">{err}</p>}
            <button type="submit" className="btn-neon mt-2 w-full">
              Join the ladder
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            Already registered?{' '}
            <Link className="text-cyan-300 hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
