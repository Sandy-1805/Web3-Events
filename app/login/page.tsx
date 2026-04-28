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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Une erreur est survenue');

      await refreshUser();

      const remaining = Math.max(0, 600 - (Date.now() - startTime));
      setTimeout(() => {
        router.push(data.role === 'admin' ? '/admin' : '/');
      }, remaining);
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
    setTimeout(() => {
      setIsLogin(!isLogin);
      setError('');
      setSwitching(false);
    }, 400);
  };

  return (
    <>
      <style>{`
        .es-login-page {
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 2rem 1rem;
        }

        /* Grille de fond identique au Hero */
        .es-login-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* Glows ambiants */
        .es-login-glow-1 {
          position: absolute;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%);
          top: -200px;
          right: -150px;
          pointer-events: none;
        }
        .es-login-glow-2 {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 65%);
          bottom: -150px;
          left: -100px;
          pointer-events: none;
        }
        .es-login-glow-3 {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 65%);
          top: 40%;
          left: 20%;
          pointer-events: none;
        }

        /* Layout deux colonnes */
        .es-login-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px; /* largeur du card */
  display: flex;
  justify-content: center;
  align-items: center;
}

        /* Colonne gauche — branding */
        .es-login-brand {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .es-login-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .es-login-logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        .es-login-logo-text {
          font-size: 1.3rem;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.02em;
        }
        .es-login-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.25);
          color: #a5b4fc;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 100px;
          width: fit-content;
        }
        .es-live-dot {
          width: 6px;
          height: 6px;
          background: #f43f5e;
          border-radius: 50%;
          animation: es-pulse 1.5s ease-in-out infinite;
        }
        @keyframes es-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .es-login-brand-title {
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 800;
          line-height: 1.1;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.03em;
        }
        .es-login-brand-title span {
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .es-login-brand-desc {
          font-size: 0.95rem;
          color: #64748b;
          line-height: 1.7;
          margin: 0;
        }

        /* Mini stats sous le texte */
        .es-login-stats {
          display: flex;
          gap: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .es-login-stat-num {
          font-size: 1.4rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
        }
        .es-login-stat-label {
          font-size: 0.75rem;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 2px;
        }

        /* Colonne droite — formulaire */
        .es-login-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 2rem;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: opacity 0.3s;
        }
        .es-login-card.fading { opacity: 0; }

        .es-login-card-header {
          margin-bottom: 1.75rem;
        }
        .es-login-card-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: #f1f5f9;
          margin: 0 0 0.35rem;
          letter-spacing: -0.02em;
        }
        .es-login-card-sub {
          font-size: 0.85rem;
          color: #475569;
          margin: 0;
        }

        /* Champs du formulaire */
        .es-form-group {
          margin-bottom: 1rem;
        }
        .es-form-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 0.45rem;
        }
        .es-form-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.92rem;
          color: #f1f5f9;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .es-form-input::placeholder { color: #334155; }
        .es-form-input:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.05);
        }

        /* Bouton principal */
        .es-login-submit {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-size: 0.92rem;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 11px;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          margin-top: 0.5rem;
          letter-spacing: 0.01em;
        }
        .es-login-submit:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .es-login-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .es-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: es-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes es-spin { to { transform: rotate(360deg); } }

        /* Message d'erreur */
        .es-login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(244,63,94,0.1);
          border: 1px solid rgba(244,63,94,0.2);
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 1rem;
          font-size: 0.85rem;
          color: #fb7185;
        }

        /* Séparateur */
        .es-login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 1.25rem 0;
        }
        .es-login-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .es-login-divider-text {
          font-size: 0.75rem;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* Comptes de test */
        .es-test-accounts {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .es-test-btn {
          width: 100%;
          text-align: left;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 10px 14px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .es-test-btn:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.13);
        }
        .es-test-badge {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .es-test-badge.admin {
          background: rgba(245,158,11,0.12);
          color: #fbbf24;
          border: 1px solid rgba(245,158,11,0.2);
        }
        .es-test-badge.participant {
          background: rgba(99,102,241,0.12);
          color: #a5b4fc;
          border: 1px solid rgba(99,102,241,0.2);
        }
        .es-test-email {
          font-size: 0.8rem;
          color: #475569;
        }

        /* Lien switch */
        .es-login-switch {
          text-align: center;
          margin-top: 1.25rem;
        }
        .es-login-switch-btn {
          background: none;
          border: none;
          font-size: 0.85rem;
          color: #6366f1;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }
        .es-login-switch-btn:hover { color: #a5b4fc; }

      `}</style>

      <div className="es-login-page">
        {/* Fond décoratif identique au Hero */}
        <div className="es-login-grid" />
        <div className="es-login-glow-1" />
        <div className="es-login-glow-2" />
        <div className="es-login-glow-3" />

        <div className="es-login-inner">

          <div className={`es-login-card${switching ? ' fading' : ''}`}>
            <div className="es-login-card-header">
              <h2 className="es-login-card-title">
                {isLogin ? 'Connexion' : 'Créer un compte'}
              </h2>
              <p className="es-login-card-sub">
                {isLogin
                  ? 'Accédez à votre espace EventSync'
                  : 'Rejoignez la plateforme gratuitement'}
              </p>
            </div>

            {/* Erreur */}
            {error && (
              <div className="es-login-error">
                <span>⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Nom (inscription uniquement) */}
              {!isLogin && (
                <div className="es-form-group">
                  <label className="es-form-label">Nom complet</label>
                  <input
                    type="text"
                    required
                    placeholder="Votre nom"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="es-form-input"
                  />
                </div>
              )}

              <div className="es-form-group">
                <label className="es-form-label">Adresse email</label>
                <input
                  type="email"
                  required
                  placeholder="vous@exemple.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="es-form-input"
                />
              </div>

              <div className="es-form-group">
                <label className="es-form-label">Mot de passe</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="es-form-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="es-login-submit"
              >
                {loading ? (
                  <>
                    <span className="es-spinner" />
                    {isLogin ? 'Connexion...' : 'Création...'}
                  </>
                ) : (
                  isLogin ? 'Se connecter →' : 'Créer mon compte →'
                )}
              </button>
            </form>

            {/* Comptes de test (connexion uniquement) */}
            {isLogin && (
              <>
                <div className="es-login-divider">
                  <div className="es-login-divider-line" />
                  <span className="es-login-divider-text">Comptes de test</span>
                  <div className="es-login-divider-line" />
                </div>

                <div className="es-test-accounts">
                  <button
                    type="button"
                    className="es-test-btn"
                    onClick={() => fillCredentials('admin@eventsync.com', 'admin123')}
                  >
                    <span className="es-test-badge admin">Admin</span>
                    <span className="es-test-email">admin@eventsync.com</span>
                  </button>
                  <button
                    type="button"
                    className="es-test-btn"
                    onClick={() => fillCredentials('participant@eventsync.com', 'participant123')}
                  >
                    <span className="es-test-badge participant">Participant</span>
                    <span className="es-test-email">participant@eventsync.com</span>
                  </button>
                </div>
              </>
            )}

            {/* Switch login / inscription */}
            <div className="es-login-switch">
              <button className="es-login-switch-btn" onClick={handleSwitch}>
                {isLogin
                  ? "Pas encore de compte ? S'inscrire"
                  : 'Déjà inscrit ? Se connecter'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}