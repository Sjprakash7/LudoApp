import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext.jsx';
import { NeonBackground } from '../components/NeonBackground.jsx';

export function AppShell() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const hideChrome = pathname === '/' || pathname.startsWith('/game/');

  return (
    <div className="relative min-h-dvh">
      {!hideChrome && <NeonBackground />}
      <header
        className={clsx(
          'sticky top-0 z-30 border-b border-white/10 bg-slate-950/40 backdrop-blur-xl',
          hideChrome && 'hidden'
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-black tracking-wide text-white">
            Ludo<span className="neon-text"> App</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {isAuthenticated && (
              <>
                <NavLink
                  to="/lobby"
                  className={({ isActive }) =>
                    clsx('rounded-lg px-3 py-1', isActive ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-300')
                  }
                >
                  Lobby
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    clsx('rounded-lg px-3 py-1', isActive ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-300')
                  }
                >
                  Profile
                </NavLink>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    clsx('rounded-lg px-3 py-1', isActive ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-300')
                  }
                >
                  Settings
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      clsx(
                        'rounded-lg px-3 py-1 font-semibold text-amber-200',
                        isActive ? 'bg-amber-500/20' : ''
                      )
                    }
                  >
                    Admin
                  </NavLink>
                )}
              </>
            )}
          </nav>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="hidden text-xs text-slate-400 sm:inline">
                  {user?.username || user?.email || user?.mobile}
                </span>
                <button type="button" className="btn-outline px-3 py-1 text-xs" onClick={() => logout()}>
                  Log out
                </button>
              </>
            ) : (
              <Link className="btn-neon px-4 py-1.5 text-sm" to="/login">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      <main
        className={clsx(
          'relative z-10',
          hideChrome ? 'min-h-dvh' : 'mx-auto max-w-6xl px-4 py-8'
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
