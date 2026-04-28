'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const { user, loading, logout, fetchUser } = useAuth();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [pathname, fetchUser]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const startTime = Date.now();
    await logout();
    const elapsed = Date.now() - startTime;
    setTimeout(() => setIsLoggingOut(false), Math.max(0, 500 - elapsed));
  };

  const navLinks = [
    { href: '/events', label: 'Événements' },
    { href: '/speakers', label: 'Speakers' },
    { href: '/favorites', label: 'Favoris' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <style>{`
        .es-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
          border-bottom: 1px solid transparent;
        }
        .es-header.scrolled {
          background: rgba(10,10,15,0.85);
          border-color: rgba(255,255,255,0.07);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .es-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }
        .es-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .es-logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }
        .es-logo-text {
          font-size: 1.15rem;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.02em;
        }
        .es-nav {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .es-nav-link {
          font-size: 0.88rem;
          font-weight: 500;
          color: #64748b;
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
          position: relative;
        }
        .es-nav-link:hover {
          color: #e2e8f0;
          background: rgba(255,255,255,0.06);
        }
        .es-nav-link.active {
          color: #a5b4fc;
          background: rgba(99,102,241,0.1);
        }
        .es-nav-admin {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #f59e0b;
          text-decoration: none;
          padding: 5px 10px;
          border-radius: 7px;
          border: 1px solid rgba(245,158,11,0.25);
          background: rgba(245,158,11,0.08);
          transition: background 0.2s, border-color 0.2s;
        }
        .es-nav-admin:hover {
          background: rgba(245,158,11,0.15);
          border-color: rgba(245,158,11,0.4);
        }
        .es-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .es-user-greeting {
          font-size: 0.82rem;
          color: #475569;
          white-space: nowrap;
        }
        .es-user-greeting strong {
          color: #94a3b8;
          font-weight: 600;
        }
        .es-btn-logout {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #fb7185;
          background: rgba(244,63,94,0.1);
          border: 1px solid rgba(244,63,94,0.2);
          padding: 7px 14px;
          border-radius: 9px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .es-btn-logout:hover:not(:disabled) {
          background: rgba(244,63,94,0.18);
          border-color: rgba(244,63,94,0.35);
        }
        .es-btn-logout:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .es-btn-login {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          padding: 8px 18px;
          border-radius: 10px;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s;
          white-space: nowrap;
        }
        .es-btn-login:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .es-spinner {
          width: 13px;
          height: 13px;
          border: 2px solid rgba(251,113,133,0.3);
          border-top-color: #fb7185;
          border-radius: 50%;
          animation: es-spin 0.7s linear infinite;
        }
        @keyframes es-spin { to { transform: rotate(360deg); } }
        .es-skeleton {
          width: 80px;
          height: 32px;
          background: rgba(255,255,255,0.05);
          border-radius: 9px;
          animation: es-shimmer 1.5s ease-in-out infinite;
        }
        @keyframes es-shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        /* Mobile menu button */
        .es-menu-btn {
          display: none;
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 6px 8px;
          cursor: pointer;
          color: #94a3b8;
          font-size: 1.1rem;
          line-height: 1;
        }
        .es-mobile-menu {
          display: none;
          position: fixed;
          top: 64px;
          left: 0;
          right: 0;
          background: rgba(10,10,15,0.97);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          padding: 1rem 2rem 1.5rem;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 99;
        }
        .es-mobile-menu.open { display: flex; }
        .es-mobile-link {
          font-size: 0.95rem;
          font-weight: 500;
          color: #64748b;
          text-decoration: none;
          padding: 10px 12px;
          border-radius: 10px;
          transition: color 0.2s, background 0.2s;
        }
        .es-mobile-link:hover, .es-mobile-link.active {
          color: #e2e8f0;
          background: rgba(255,255,255,0.06);
        }
        .es-mobile-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 0.5rem 0;
        }
        /* Spacer so content isn't hidden under fixed header */
        .es-header-spacer { height: 64px; }
        @media (max-width: 768px) {
          .es-nav { display: none; }
          .es-menu-btn { display: flex; align-items: center; }
          .es-user-greeting { display: none; }
        }
      `}</style>

      <header className={`es-header${scrolled ? ' scrolled' : ''}`}>
        <div className="es-header-inner">
          {/* Logo */}
          <Link href="/" className="es-logo">
            <span className="es-logo-icon">⚡</span>
            <span className="es-logo-text">EventSync</span>
          </Link>

          {/* Desktop nav */}
          <nav className="es-nav">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`es-nav-link${isActive(href) ? ' active' : ''}`}
              >
                {label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link href="/admin" className="es-nav-admin">
                ⚙ Admin
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="es-header-actions">
            {loading ? (
              <div className="es-skeleton" />
            ) : user ? (
              <>
                <span className="es-user-greeting">
                  Bonjour, <strong>{user.name}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="es-btn-logout"
                >
                  {isLoggingOut ? (
                    <>
                      <span className="es-spinner" />
                      Déconnexion...
                    </>
                  ) : (
                    <>⎋ Déconnexion</>
                  )}
                </button>
              </>
            ) : (
              <Link href="/login" className="es-btn-login">
                Connexion →
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="es-menu-btn"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown */}
      <div className={`es-mobile-menu${menuOpen ? ' open' : ''}`}>
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`es-mobile-link${isActive(href) ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
        {user?.role === 'admin' && (
          <Link href="/admin" className="es-mobile-link" onClick={() => setMenuOpen(false)}>
            ⚙ Administration
          </Link>
        )}
        <div className="es-mobile-divider" />
        {user ? (
          <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="es-btn-logout" style={{ width: '100%', justifyContent: 'center' }}>
            {isLoggingOut ? <><span className="es-spinner" /> Déconnexion...</> : '⎋ Déconnexion'}
          </button>
        ) : (
          <Link href="/login" className="es-btn-login" style={{ justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>
            Connexion →
          </Link>
        )}
      </div>

      <div className="es-header-spacer" />
    </>
  );
}
