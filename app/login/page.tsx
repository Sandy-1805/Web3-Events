'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const startTime = Date.now();
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Une erreur est survenue');
      await refreshUser();
      const remaining = Math.max(0, 600 - (Date.now() - startTime));
      setTimeout(() => { router.push(data.role === 'admin' ? '/admin' : '/'); }, remaining);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fillCredentials = (email: string, password: string) => {
    setFormData({ ...formData, email, password });
  };

  const handleSwitch = () => {
    setSwitching(true);
    setTimeout(() => { setIsLogin(!isLogin); setError(''); setSwitching(false); }, 400);
  };

  return (
    <>
      <style>{`
        /* ✅ Page login thématisée — fond décoratif garde les couleurs accent (non-thématiques)
           mais tout le contenu du formulaire utilise les variables CSS */
        .lg-page {
          min-height: 100vh;
          background: var(--es-bg-1);           /* remplace #0a0a0f hardcodé */
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden; padding: 2rem 1rem;
          transition: background 0.25s ease;
        }
        /* Fond décoratif — couleurs accent = non-thématiques, conservées */
        .lg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px);
          background-size: 60px 60px; pointer-events: none;
        }
        .lg-glow-1 { position:absolute; width:700px; height:700px; border-radius:50%; background:radial-gradient(circle,rgba(99,102,241,0.14) 0%,transparent 65%); top:-200px; right:-150px; pointer-events:none; }
        .lg-glow-2 { position:absolute; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(236,72,153,0.10) 0%,transparent 65%); bottom:-150px; left:-100px; pointer-events:none; }
        .lg-glow-3 { position:absolute; width:300px; height:300px; border-radius:50%; background:radial-gradient(circle,rgba(34,211,238,0.06) 0%,transparent 65%); top:40%; left:20%; pointer-events:none; }
        .lg-inner { position:relative; z-index:1; width:100%; max-width:420px; }
        /* Carte formulaire */
        .lg-card {
          background: var(--es-surface);          /* remplace rgba(255,255,255,0.03) */
          border: 1px solid var(--es-border);     /* remplace rgba(255,255,255,0.08) */
          border-radius: 24px; padding: 2rem;
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          transition: opacity 0.3s;
        }
        .lg-card.fading { opacity: 0; }
        .lg-card-title {
          font-size: 1.4rem; font-weight: 800;
          color: var(--es-text-1);               /* remplace #f1f5f9 hardcodé */
          margin: 0 0 0.35rem; letter-spacing: -0.02em;
        }
        .lg-card-sub {
          font-size: 0.85rem;
          color: var(--es-text-2);               /* remplace #475569 hardcodé */
          margin: 0 0 1.75rem;
        }
        /* Champs */
        .lg-form-group { margin-bottom: 1rem; }
        .lg-label {
          display: block; font-size: 0.8rem; font-weight: 600;
          color: var(--es-text-3);               /* remplace #64748b */
          letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 0.45rem;
        }
        .lg-input {
          width: 100%; background: var(--es-input-bg);  /* remplace rgba(255,255,255,0.04) */
          border: 1px solid var(--es-border);           /* remplace rgba(255,255,255,0.1) */
          border-radius: 10px; padding: 10px 14px;
          font-size: 0.92rem; color: var(--es-text-1);  /* remplace #f1f5f9 */
          outline: none; transition: border-color 0.2s, background 0.2s; box-sizing: border-box;
        }
        .lg-input::placeholder { color: var(--es-text-3); }
        .lg-input:focus { border-color: var(--es-accent); background: var(--es-input-bg-focus); }
        /* Bouton submit */
        .lg-submit {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; font-size: 0.92rem; font-weight: 700;
          padding: 12px 24px; border-radius: 11px; border: none; cursor: pointer;
          transition: opacity 0.2s, transform 0.2s; margin-top: 0.5rem;
        }
        .lg-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .lg-submit:disabled { opacity: 0.55; cursor: not-allowed; }
        .lg-spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,0.25); border-top-color:#fff; border-radius:50%; animation:lg-spin 0.7s linear infinite; flex-shrink:0; }
        @keyframes lg-spin { to { transform: rotate(360deg); } }
        /* Erreur */
        .lg-error {
          display: flex; align-items: center; gap: 8px;
          background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.2);
          border-radius: 10px; padding: 10px 14px; margin-bottom: 1rem;
          font-size: 0.85rem; color: #fb7185;
        }
        /* Séparateur */
        .lg-divider { display:flex; align-items:center; gap:12px; margin:1.25rem 0; }
        .lg-divider-line { flex:1; height:1px; background:var(--es-border); }
        .lg-divider-text { font-size:0.75rem; color:var(--es-text-3); text-transform:uppercase; letter-spacing:0.08em; }
        /* Comptes test */
        .lg-test-accounts { display:flex; flex-direction:column; gap:6px; }
        .lg-test-btn {
          width:100%; text-align:left;
          background: var(--es-surface);         /* remplace rgba(255,255,255,0.03) */
          border: 1px solid var(--es-border);    /* remplace rgba(255,255,255,0.07) */
          border-radius:10px; padding:10px 14px; cursor:pointer;
          transition:background 0.2s, border-color 0.2s;
          display:flex; align-items:center; gap:10px;
        }
        .lg-test-btn:hover { background:var(--es-surface-hover); border-color:var(--es-border-hover); }
        .lg-test-badge { font-size:0.7rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; padding:3px 8px; border-radius:6px; flex-shrink:0; }
        .lg-test-badge.admin { background:rgba(245,158,11,0.12); color:#fbbf24; border:1px solid rgba(245,158,11,0.2); }
        .lg-test-badge.participant { background:rgba(99,102,241,0.12); color:#a5b4fc; border:1px solid rgba(99,102,241,0.2); }
        .lg-test-email { font-size:0.8rem; color:var(--es-text-2); }
        /* Switch */
        .lg-switch { text-align:center; margin-top:1.25rem; }
        .lg-switch-btn { background:none; border:none; font-size:0.85rem; color:var(--es-accent); cursor:pointer; transition:opacity 0.2s; }
        .lg-switch-btn:hover { opacity:0.8; }
      `}</style>

      <div className="lg-page">
        <div className="lg-grid" />
        <div className="lg-glow-1" />
        <div className="lg-glow-2" />
        <div className="lg-glow-3" />

        <div className="lg-inner">
          <div className={`lg-card${switching ? ' fading' : ''}`}>
            <h2 className="lg-card-title">{isLogin ? 'Connexion' : 'Créer un compte'}</h2>
            <p className="lg-card-sub">
              {isLogin ? 'Accédez à votre espace EventSync' : 'Rejoignez la plateforme gratuitement'}
            </p>

            {error && (
              <div className="lg-error"><span>⚠</span>{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="lg-form-group">
                  <label className="lg-label">Nom complet</label>
                  <input type="text" required placeholder="Votre nom" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })} className="lg-input" />
                </div>
              )}
              <div className="lg-form-group">
                <label className="lg-label">Adresse email</label>
                <input type="email" required placeholder="vous@exemple.com" value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })} className="lg-input" />
              </div>
              <div className="lg-form-group">
                <label className="lg-label">Mot de passe</label>
                <input type="password" required placeholder="••••••••" value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })} className="lg-input" />
              </div>
              <button type="submit" disabled={loading} className="lg-submit">
                {loading ? (
                  <><span className="lg-spinner" />{isLogin ? 'Connexion...' : 'Création...'}</>
                ) : (
                  isLogin ? 'Se connecter →' : 'Créer mon compte →'
                )}
              </button>
            </form>

            {isLogin && (
              <>
                <div className="lg-divider">
                  <div className="lg-divider-line" />
                  <span className="lg-divider-text">Comptes de test</span>
                  <div className="lg-divider-line" />
                </div>
                <div className="lg-test-accounts">
                  <button type="button" className="lg-test-btn" onClick={() => fillCredentials('admin@eventsync.com', 'admin123')}>
                    <span className="lg-test-badge admin">Admin</span>
                    <span className="lg-test-email">admin@eventsync.com</span>
                  </button>
                  <button type="button" className="lg-test-btn" onClick={() => fillCredentials('participant@eventsync.com', 'participant123')}>
                    <span className="lg-test-badge participant">Participant</span>
                    <span className="lg-test-email">participant@eventsync.com</span>
                  </button>
                </div>
              </>
            )}

            <div className="lg-switch">
              <button className="lg-switch-btn" onClick={handleSwitch}>
                {isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà inscrit ? Se connecter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
