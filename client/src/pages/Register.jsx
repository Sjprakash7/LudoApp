import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { resizeImageFileToDataUrl } from '../utils/imageResize.js';

export function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', mobile: '', password: '', confirm: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/lobby', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr('');
    try {
      const dataUrl = await resizeImageFileToDataUrl(file);
      setAvatarDataUrl(dataUrl);
      setAvatarPreview(dataUrl);
    } catch (ex) {
      setErr(ex.message || 'Could not use that image');
      setAvatarPreview(null);
      setAvatarDataUrl(null);
    }
  }

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
    setBusy(true);
    try {
      await register({
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        avatar: avatarDataUrl || undefined,
      });
      navigate('/lobby', { replace: true });
    } catch (ex) {
      setErr(ex.message || 'Registration failed');
    } finally {
      setBusy(false);
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
          <h1 className="mb-2 text-center text-2xl font-black tracking-wide text-white">Create profile</h1>
          <p className="mb-6 text-center text-xs text-sky-200/80">Add a photo — it shows in matches on the board.</p>

          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="flex flex-col items-center gap-2">
              <label className="relative block h-24 w-24 cursor-pointer overflow-hidden rounded-2xl border-2 border-amber-200/50 bg-black/30 shadow-inner">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-center text-[10px] text-sky-200/70">
                    Tap to add photo
                  </span>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />
              </label>
              <span className="text-[10px] text-sky-300/70">JPG / PNG, cropped square works best</span>
            </div>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-sky-100/90">Email</span>
              <input
                className="rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-white outline-none ring-sky-400/30 focus:ring-2"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                type="email"
                placeholder="you@mail.com"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-sky-100/90">Mobile</span>
              <input
                className="rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-white outline-none ring-sky-400/30 focus:ring-2"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })}
                inputMode="numeric"
                placeholder="Digits only"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-sky-100/90">Password</span>
              <input
                type="password"
                className="rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-white outline-none ring-sky-400/30 focus:ring-2"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={6}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-sky-100/90">Confirm password</span>
              <input
                type="password"
                className="rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-white outline-none ring-sky-400/30 focus:ring-2"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                minLength={6}
                required
              />
            </label>
            {err && <p className="text-sm text-rose-300">{err}</p>}
            <button type="submit" disabled={busy} className="menu-pyramid-btn mt-1 w-full py-3.5 text-base disabled:opacity-50">
              {busy ? 'Creating…' : 'Join the matchmaking pool'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-sky-300/80">
            Already registered?{' '}
            <Link className="font-bold text-amber-200 underline-offset-4 hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
