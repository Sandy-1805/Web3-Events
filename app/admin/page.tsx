'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [statsData, setStatsData] = useState({
    events: 0,
    sessions: 0,
    speakers: 0,
    questions: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const [eventsRes, sessionsRes, speakersRes, questionsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/session'),
        fetch('/api/speakers'),
        fetch('/api/questions').catch(() => ({ json: () => [] })),
      ]);

      const events = await eventsRes.json();
      const sessions = await sessionsRes.json();
      const speakers = await speakersRes.json();

      let questions = [];
      try {
        const questionsData = await questionsRes.json();
        questions = Array.isArray(questionsData) ? questionsData : [];
      } catch {
        questions = [];
      }

      setStatsData({
        events: Array.isArray(events) ? events.length : 0,
        sessions: Array.isArray(sessions) ? sessions.length : 0,
        speakers: Array.isArray(speakers) ? speakers.length : 0,
        questions: questions.length,
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{`
          .es-loading {
            min-height: 100vh;
            background: #0a0a0f;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .es-loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(99,102,241,0.2);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: es-spin 0.7s linear infinite;
          }
          @keyframes es-spin { to { transform: rotate(360deg); } }
        `}</style>
        <div className="es-loading">
          <div className="es-loading-spinner" />
        </div>
      </>
    );
  }

  if (!user || user.role !== 'admin') return null;

  const stats = [
    {
      name: 'Événements',
      value: isLoadingStats ? '...' : statsData.events.toString(),
      href: '/admin/events',
      icon: '◈',
      color: '#6366f1',
      colorBg: 'rgba(99,102,241,0.12)',
      colorBorder: 'rgba(99,102,241,0.25)',
    },
    {
      name: 'Sessions',
      value: isLoadingStats ? '...' : statsData.sessions.toString(),
      href: '/admin/sessions',
      icon: '◎',
      color: '#ec4899',
      colorBg: 'rgba(236,72,153,0.12)',
      colorBorder: 'rgba(236,72,153,0.25)',
    },
    {
      name: 'Intervenants',
      value: isLoadingStats ? '...' : statsData.speakers.toString(),
      href: '/admin/speakers',
      icon: '◉',
      color: '#22d3ee',
      colorBg: 'rgba(34,211,238,0.12)',
      colorBorder: 'rgba(34,211,238,0.25)',
    },
    {
      name: 'Questions',
      value: isLoadingStats ? '...' : statsData.questions.toString(),
      href: '/admin/questions',
      icon: '◐',
      color: '#a78bfa',
      colorBg: 'rgba(167,139,250,0.12)',
      colorBorder: 'rgba(167,139,250,0.25)',
    },
  ];

  const quickActions = [
    {
      href: '/admin/events/create',
      label: 'Créer un événement',
      icon: '+',
      primary: true,
    },
    {
      href: '/admin/speakers/create',
      label: 'Ajouter un intervenant',
      icon: '↗',
      primary: false,
    },
    {
      href: '/admin/events',
      label: 'Voir tous les événements',
      icon: '≡',
      primary: false,
    },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .es-admin-page {
          min-height: 100vh;
          background: #0a0a0f;
          position: relative;
          overflow-x: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Fond décoratif — identique au Hero & Login */
        .es-admin-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }
        .es-admin-glow-1 {
          position: fixed;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%);
          top: -200px;
          right: -150px;
          pointer-events: none;
          z-index: 0;
        }
        .es-admin-glow-2 {
          position: fixed;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 65%);
          bottom: -150px;
          left: -100px;
          pointer-events: none;
          z-index: 0;
        }
        .es-admin-glow-3 {
          position: fixed;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 65%);
          top: 40%;
          left: 20%;
          pointer-events: none;
          z-index: 0;
        }

        /* Header */
        .es-admin-header {
          position: relative;
          z-index: 10;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,10,15,0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 0 2rem;
        }
        .es-admin-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          gap: 1rem;
        }
        .es-admin-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .es-admin-logo-icon {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          color: #fff;
          font-weight: 800;
        }
        .es-admin-logo-text {
          font-size: 1.1rem;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.02em;
        }
        .es-admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.2);
          color: #fbbf24;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
        }
        .es-live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          animation: es-pulse 1.5s ease-in-out infinite;
        }
        @keyframes es-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        .es-admin-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .es-admin-avatar {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }
        .es-admin-username {
          font-size: 0.85rem;
          color: #64748b;
        }

        /* Contenu */
        .es-admin-content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2.5rem 2rem;
        }

        /* Hero titre */
        .es-admin-hero { margin-bottom: 2.5rem; }
        .es-admin-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.25);
          color: #a5b4fc;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 100px;
          margin-bottom: 1rem;
        }
        .es-admin-hero-title {
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 0.5rem;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .es-admin-hero-title span {
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .es-admin-hero-sub {
          font-size: 0.92rem;
          color: #475569;
          margin: 0;
        }

        /* Stats grid */
        .es-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .es-stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 1.5rem;
          text-decoration: none;
          display: block;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
          position: relative;
          overflow: hidden;
        }
        .es-stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--stat-color), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .es-stat-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
        }
        .es-stat-card:hover::before { opacity: 1; }
        .es-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          margin-bottom: 1rem;
          color: var(--stat-color);
          background: var(--stat-bg);
          border: 1px solid var(--stat-border);
          font-weight: 700;
        }
        .es-stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 0.3rem;
        }
        .es-stat-label {
          font-size: 0.78rem;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          font-weight: 600;
        }
        .es-stat-arrow {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          color: #334155;
          font-size: 0.9rem;
          transition: color 0.2s, transform 0.2s;
        }
        .es-stat-card:hover .es-stat-arrow {
          color: var(--stat-color);
          transform: translate(2px, -2px);
        }

        /* Section card */
        .es-section-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 1.75rem;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .es-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.5rem;
        }
        .es-section-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .es-section-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin: 0;
        }

        /* Actions rapides */
        .es-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.75rem;
        }
        .es-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 20px;
          border-radius: 11px;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s, background 0.2s, border-color 0.2s;
          border: 1px solid transparent;
          cursor: pointer;
          letter-spacing: 0.01em;
        }
        .es-action-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .es-action-btn.primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
        }
        .es-action-btn.secondary {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8;
        }
        .es-action-btn.secondary:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.15);
          color: #f1f5f9;
        }
        .es-action-icon {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          background: rgba(255,255,255,0.15);
          flex-shrink: 0;
        }

        /* Empty state */
        .es-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          text-align: center;
          gap: 0.75rem;
        }
        .es-empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
        }
        .es-empty-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #475569;
          margin: 0;
        }
        .es-empty-link {
          font-size: 0.85rem;
          color: #6366f1;
          text-decoration: none;
          transition: color 0.2s;
        }
        .es-empty-link:hover { color: #a5b4fc; }

        @keyframes es-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="es-admin-page">
        <div className="es-admin-grid" />
        <div className="es-admin-glow-1" />
        <div className="es-admin-glow-2" />
        <div className="es-admin-glow-3" />

        {/* Header */}
        <header className="es-admin-header">
          <div className="es-admin-header-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="es-admin-badge">
                <span className="es-live-dot" style={{ background: '#fbbf24' }} />
                Admin
              </span>
            </div>
            <div className="es-admin-user">
              <div className="es-admin-avatar">
                {user.name?.charAt(0).toUpperCase() ?? 'A'}
              </div>
              <span className="es-admin-username">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="es-admin-content">

          {/* Hero */}
          <div className="es-admin-hero">
            <div className="es-admin-hero-eyebrow">
              <span className="es-live-dot" style={{ background: '#a5b4fc' }} />
              Tableau de bord
            </div>
            <h1 className="es-admin-hero-title">
              Bienvenue, <span>{user.name}</span>
            </h1>
            <p className="es-admin-hero-sub">
              Gérez vos événements, sessions et intervenants depuis cet espace.
            </p>
          </div>

          {/* Stats */}
          <div className="es-stats-grid">
            {stats.map((stat) => (
              <Link
                key={stat.name}
                href={stat.href}
                className="es-stat-card"
                style={{
                  ['--stat-color' as any]: stat.color,
                  ['--stat-bg' as any]: stat.colorBg,
                  ['--stat-border' as any]: stat.colorBorder,
                }}
              >
                <span className="es-stat-arrow">↗</span>
                <div className="es-stat-icon">{stat.icon}</div>
                <div className="es-stat-value">{stat.value}</div>
                <div className="es-stat-label">{stat.name}</div>
              </Link>
            ))}
          </div>

          {/* Actions rapides */}
          <div className="es-section-card">
            <div className="es-section-header">
              <span className="es-section-dot" style={{ background: '#6366f1' }} />
              <h2 className="es-section-title">Actions rapides</h2>
            </div>
            <div className="es-actions-grid">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`es-action-btn ${action.primary ? 'primary' : 'secondary'}`}
                >
                  <span className="es-action-icon">{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Événements récents */}
          <div className="es-section-card">
            <div className="es-section-header">
              <span className="es-section-dot" style={{ background: '#ec4899' }} />
              <h2 className="es-section-title">Événements récents</h2>
            </div>
            <div className="es-empty-state">
              <div className="es-empty-icon">◈</div>
              <p className="es-empty-title">Aucun événement pour le moment.</p>
              <Link href="/admin/events/create" className="es-empty-link">
                Créez votre premier événement →
              </Link>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}