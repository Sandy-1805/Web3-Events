'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CreateSpeakerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    photo: '',
    socialLinks: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/speakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }

      router.push('/admin/speakers');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="es-login-page">
        <div className="es-login-grid" />
        <div className="es-login-glow-1" />
        <div className="es-login-glow-2" />
        <div className="es-login-glow-3" />
        <div className="es-login-inner es-create-speaker-inner">
          <div className="es-login-card" style={{ textAlign: 'center' }}>
            <div className="es-spinner" style={{ margin: '0 auto', width: '24px', height: '24px' }} />
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

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

        /* Grille de fond */
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

        /* Conteneur principal — plus large pour le formulaire d'intervenant */
        .es-login-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 320px; /* fallback */
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .es-create-speaker-inner {
          max-width: 800px;
        }

        /* Carte */
        .es-login-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 2rem;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          width: 100%;
        }

        /* En-tête */
        .es-login-card-header {
          margin-bottom: 1.75rem;
        }
        .es-login-card-title {
          font-size: 1.5rem;
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

        /* Champs */
        .es-form-group {
          margin-bottom: 1.25rem;
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
          font-family: inherit;
        }
        .es-form-input::placeholder { color: #334155; }
        .es-form-input:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.05);
        }
        textarea.es-form-input {
          resize: vertical;
          min-height: 100px;
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

        /* Spinner */
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
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          color: #fb7185;
        }

        /* Lien retour */
        .es-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-size: 0.85rem;
          color: #6366f1;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
          text-decoration: none;
          margin-bottom: 1.5rem;
        }
        .es-back-link:hover {
          color: #a5b4fc;
        }

        /* Séparateur optionnel (non utilisé ici mais gardé pour cohérence) */
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
      `}</style>

      <div className="es-login-page">
        <div className="es-login-grid" />
        <div className="es-login-glow-1" />
        <div className="es-login-glow-2" />
        <div className="es-login-glow-3" />

        <div className="es-login-inner es-create-speaker-inner">
          <div className="es-login-card">
            {/* Lien retour */}
            <Link href="/admin/speakers" className="es-back-link">
              ← Retour à la liste
            </Link>

            <div className="es-login-card-header">
              <h2 className="es-login-card-title">Ajouter un intervenant</h2>
              <p className="es-login-card-sub">
                Remplissez les informations du conférencier ou de l’intervenant
              </p>
            </div>

            {error && (
              <div className="es-login-error">
                <span>⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="es-form-group">
                <label className="es-form-label">Nom complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sarah Dupont"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="es-form-input"
                />
              </div>

              <div className="es-form-group">
                <label className="es-form-label">Biographie</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="es-form-input"
                  placeholder="Présentation de l'intervenant, son parcours, ses domaines d'expertise..."
                />
              </div>

              <div className="es-form-group">
                <label className="es-form-label">URL de la photo</label>
                <input
                  type="url"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="es-form-input"
                  placeholder="https://exemple.com/photo.jpg"
                />
              </div>

              <div className="es-form-group">
                <label className="es-form-label">Liens sociaux (JSON)</label>
                <input
                  type="text"
                  value={formData.socialLinks}
                  onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                  className="es-form-input"
                  placeholder='{"twitter": "https://twitter.com/...", "linkedin": "https://linkedin.com/..."}'
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="es-login-submit"
              >
                {isSubmitting ? (
                  <>
                    <span className="es-spinner" />
                    Ajout en cours...
                  </>
                ) : (
                  'Ajouter l’intervenant →'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}