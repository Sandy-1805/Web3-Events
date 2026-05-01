'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [statsData, setStatsData] = useState({ events:0, sessions:0, speakers:0, questions:0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') fetchStats();
  }, [user]);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const [eventsRes, sessionsRes, speakersRes] = await Promise.all([
        fetch('/api/events'), fetch('/api/session'), fetch('/api/speakers'),
      ]);
      const events = await eventsRes.json();
      const sessions = await sessionsRes.json();
      const speakers = await speakersRes.json();
      let questions: any[] = [];
      try {
        const qRes = await fetch('/api/questions');
        const qData = await qRes.json();
        questions = Array.isArray(qData) ? qData : [];
      } catch { questions = []; }
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

  if (loading) return (
    <>
      <style>{`
        .adm-loading { min-height:100vh; background:var(--es-bg-1); display:flex; align-items:center; justify-content:center; }
        .adm-spinner { width:32px; height:32px; border:3px solid rgba(99,102,241,0.2); border-top-color:#6366f1; border-radius:50%; animation:adm-spin 0.7s linear infinite; }
        @keyframes adm-spin { to { transform:rotate(360deg); } }
      `}</style>
      <div className="adm-loading"><div className="adm-spinner" /></div>
    </>
  );

  if (!user || user.role !== 'admin') return null;

  const stats = [
    { name:'Événements', value:isLoadingStats?'...':statsData.events.toString(), href:'/admin/events', icon:'◈', color:'#6366f1', colorBg:'rgba(99,102,241,0.12)', colorBorder:'rgba(99,102,241,0.25)' },
    { name:'Sessions', value:isLoadingStats?'...':statsData.sessions.toString(), href:'/admin/sessions', icon:'◎', color:'#ec4899', colorBg:'rgba(236,72,153,0.12)', colorBorder:'rgba(236,72,153,0.25)' },
    { name:'Intervenants', value:isLoadingStats?'...':statsData.speakers.toString(), href:'/admin/speakers', icon:'◉', color:'#22d3ee', colorBg:'rgba(34,211,238,0.12)', colorBorder:'rgba(34,211,238,0.25)' },
    { name:'Questions', value:isLoadingStats?'...':statsData.questions.toString(), href:'/admin/questions', icon:'◐', color:'#a78bfa', colorBg:'rgba(167,139,250,0.12)', colorBorder:'rgba(167,139,250,0.25)' },
  ];

  const quickActions = [
    { href:'/admin/events/create', label:'Créer un événement', icon:'+', primary:true },
    { href:'/admin/speakers/create', label:'Ajouter un intervenant', icon:'↗', primary:false },
    { href:'/admin/events', label:'Voir tous les événements', icon:'≡', primary:false },
  ];

  return (
    <>
      <style>{`
        /* ✅ Page admin entièrement thématisée — plus aucun #0a0a0f hardcodé */
        .adm-page { min-height:100vh; background:var(--es-bg-1); position:relative; overflow-x:hidden; transition:background 0.25s ease; }
        /* Fond décoratif — couleurs accent = non-thématiques */
        .adm-grid { position:fixed; inset:0; background-image:linear-gradient(rgba(99,102,241,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.07) 1px,transparent 1px); background-size:60px 60px; pointer-events:none; z-index:0; }
        .adm-glow-1 { position:fixed; width:700px; height:700px; border-radius:50%; background:radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 65%); top:-200px; right:-150px; pointer-events:none; z-index:0; }
        .adm-glow-2 { position:fixed; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 65%); bottom:-150px; left:-100px; pointer-events:none; z-index:0; }
        /* Header */
        .adm-header {
          position:relative; z-index:10;
          border-bottom:1px solid var(--es-border);      /* remplace rgba(255,255,255,0.06) */
          background:var(--es-header-bg);                /* remplace rgba(10,10,15,0.85) */
          backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
          padding:0 2rem;
        }
        .adm-header-inner { max-width:1200px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; height:64px; }
        .adm-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.2); color:#fbbf24; font-size:0.7rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; padding:4px 10px; border-radius:100px; }
        .adm-user { display:flex; align-items:center; gap:10px; }
        .adm-avatar { width:34px; height:34px; background:linear-gradient(135deg,#6366f1,#8b5cf6); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:700; color:#fff; }
        .adm-username { font-size:0.85rem; color:var(--es-text-3); }
        /* Contenu */
        .adm-content { position:relative; z-index:1; max-width:1200px; margin:0 auto; padding:2.5rem 2rem; }
        /* Hero */
        .adm-hero { margin-bottom:2.5rem; }
        .adm-eyebrow { display:inline-flex; align-items:center; gap:8px; background:rgba(99,102,241,0.12); border:1px solid rgba(99,102,241,0.25); color:#a5b4fc; font-size:0.72rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; padding:4px 12px; border-radius:100px; margin-bottom:1rem; }
        .adm-hero-title { font-size:clamp(1.6rem,3vw,2.2rem); font-weight:800; color:var(--es-text-1); margin:0 0 0.5rem; letter-spacing:-0.03em; }
        .adm-hero-title span { background:linear-gradient(135deg,#6366f1 0%,#ec4899 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .adm-hero-sub { font-size:0.92rem; color:var(--es-text-2); margin:0; }
        /* Stats */
        .adm-stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; margin-bottom:1.5rem; }
        .adm-stat-card {
          background:var(--es-surface); border:1px solid var(--es-border);
          border-radius:18px; padding:1.5rem; text-decoration:none; display:block;
          transition:background 0.2s,border-color 0.2s,transform 0.2s; position:relative; overflow:hidden;
        }
        .adm-stat-card:hover { background:var(--es-surface-hover); border-color:var(--es-border-hover); transform:translateY(-2px); }
        .adm-stat-icon { width:40px; height:40px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; margin-bottom:1rem; color:var(--stat-color); background:var(--stat-bg); border:1px solid var(--stat-border); font-weight:700; }
        .adm-stat-value { font-size:2rem; font-weight:800; color:var(--es-text-1); letter-spacing:-0.04em; line-height:1; margin-bottom:0.3rem; }
        .adm-stat-label { font-size:0.78rem; color:var(--es-text-3); text-transform:uppercase; letter-spacing:0.07em; font-weight:600; }
        .adm-stat-arrow { position:absolute; top:1.5rem; right:1.5rem; color:var(--es-text-3); font-size:0.9rem; transition:color 0.2s,transform 0.2s; }
        .adm-stat-card:hover .adm-stat-arrow { color:var(--stat-color); transform:translate(2px,-2px); }
        /* Section card */
        .adm-section-card { background:var(--es-surface); border:1px solid var(--es-border); border-radius:20px; padding:1.75rem; margin-bottom:1.5rem; }
        .adm-section-header { display:flex; align-items:center; gap:10px; margin-bottom:1.5rem; }
        .adm-section-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
        .adm-section-title { font-size:0.78rem; font-weight:700; color:var(--es-text-2); letter-spacing:0.07em; text-transform:uppercase; margin:0; }
        /* Actions */
        .adm-actions-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:0.75rem; }
        .adm-action-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 20px; border-radius:11px; font-size:0.875rem; font-weight:600; text-decoration:none; transition:opacity 0.2s,transform 0.2s; border:1px solid transparent; cursor:pointer; }
        .adm-action-btn:hover { opacity:0.88; transform:translateY(-1px); }
        .adm-action-btn.primary { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; }
        .adm-action-btn.secondary { background:var(--es-surface); border:1px solid var(--es-border); color:var(--es-text-2); }
        .adm-action-btn.secondary:hover { background:var(--es-surface-hover); border-color:var(--es-border-hover); color:var(--es-text-1); }
        .adm-action-icon { width:18px; height:18px; border-radius:5px; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; background:rgba(255,255,255,0.15); flex-shrink:0; }
        /* Empty state */
        .adm-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:3rem 1rem; text-align:center; gap:0.75rem; }
        .adm-empty-icon { width:48px; height:48px; border-radius:14px; background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.15); display:flex; align-items:center; justify-content:center; font-size:1.3rem; margin-bottom:0.5rem; }
        .adm-empty-title { font-size:0.95rem; font-weight:600; color:var(--es-text-2); margin:0; }
        .adm-empty-link { font-size:0.85rem; color:var(--es-accent); text-decoration:none; }
        .adm-empty-link:hover { opacity:0.8; }
        .adm-live-dot { width:5px; height:5px; border-radius:50%; animation:adm-pulse 1.5s ease-in-out infinite; }
        @keyframes adm-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        @keyframes adm-spin { to { transform:rotate(360deg); } }
      `}</style>

      <div className="adm-page">
        <div className="adm-grid" />
        <div className="adm-glow-1" />
        <div className="adm-glow-2" />

        <header className="adm-header">
          <div className="adm-header-inner">
            <span className="adm-badge">
              <span className="adm-live-dot" style={{ background:'#fbbf24' }} />
              Admin
            </span>
            <div className="adm-user">
              <div className="adm-avatar">{user.name?.charAt(0).toUpperCase() ?? 'A'}</div>
              <span className="adm-username">{user.name}</span>
            </div>
          </div>
        </header>

        <main className="adm-content">
          <div className="adm-hero">
            <div className="adm-eyebrow">
              <span className="adm-live-dot" style={{ background:'#a5b4fc' }} />
              Tableau de bord
            </div>
            <h1 className="adm-hero-title">Bienvenue, <span>{user.name}</span></h1>
            <p className="adm-hero-sub">Gérez vos événements, sessions et intervenants depuis cet espace.</p>
          </div>

          <div className="adm-stats-grid">
            {stats.map((stat) => (
              <Link key={stat.name} href={stat.href} className="adm-stat-card"
                style={{ ['--stat-color' as any]:stat.color, ['--stat-bg' as any]:stat.colorBg, ['--stat-border' as any]:stat.colorBorder }}>
                <span className="adm-stat-arrow">↗</span>
                <div className="adm-stat-icon">{stat.icon}</div>
                <div className="adm-stat-value">{stat.value}</div>
                <div className="adm-stat-label">{stat.name}</div>
              </Link>
            ))}
          </div>

          <div className="adm-section-card">
            <div className="adm-section-header">
              <span className="adm-section-dot" style={{ background:'#6366f1' }} />
              <h2 className="adm-section-title">Actions rapides</h2>
            </div>
            <div className="adm-actions-grid">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href} className={`adm-action-btn ${action.primary ? 'primary' : 'secondary'}`}>
                  <span className="adm-action-icon">{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="adm-section-card">
            <div className="adm-section-header">
              <span className="adm-section-dot" style={{ background:'#ec4899' }} />
              <h2 className="adm-section-title">Événements récents</h2>
            </div>
            <div className="adm-empty">
              <div className="adm-empty-icon">◈</div>
              <p className="adm-empty-title">Aucun événement pour le moment.</p>
              <Link href="/admin/events/create" className="adm-empty-link">Créez votre premier événement →</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
