'use client';

// app/admin/speakers/create/page.tsx
// CORRECTIONS THÈME :
// Cette page avait un GROS bloc de styles inline CSS avec background: #0a0a0f hardcodé.
// On remplace TOUT par :
//   - .es-card pour la carte principale
//   - .es-input pour les champs
//   - .es-label pour les labels
//   - .es-btn-primary pour le bouton submit
//   - .es-alert-error pour les erreurs
//   - var(--es-*) pour tout le reste
// Le fond de page (#0a0a0f) est géré par admin/layout.tsx

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
      <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div style={{ color: 'var(--es-text-3)' }}>Chargement...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Lien retour */}
        <div className="mb-6">
          <Link href="/admin/speakers" style={{ color: 'var(--es-accent)', fontSize: '0.875rem' }}>
            ← Retour à la liste
          </Link>
        </div>

        {/* Carte formulaire */}
        <div className="es-card p-6">

          {/* En-tête */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--es-text-1)', letterSpacing: '-0.02em' }}>
              Ajouter un intervenant
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--es-text-3)' }}>
              Remplissez les informations du conférencier ou de l&apos;intervenant
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="es-alert-error mb-6">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="es-label">Nom complet *</label>
              <input
                type="text"
                required
                placeholder="Ex: Sarah Dupont"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="es-input"
              />
            </div>

            <div>
              <label className="es-label">Biographie</label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="es-input"
                style={{ resize: 'vertical' }}
                placeholder="Présentation de l'intervenant, son parcours, ses domaines d'expertise..."
              />
            </div>

            <div>
              <label className="es-label">URL de la photo</label>
              <input
                type="url"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                className="es-input"
                placeholder="https://exemple.com/photo.jpg"
              />
            </div>

            <div>
              <label className="es-label">Liens sociaux (JSON)</label>
              <input
                type="text"
                value={formData.socialLinks}
                onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                className="es-input"
                placeholder='{"twitter": "https://twitter.com/...", "linkedin": "https://linkedin.com/..."}'
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Link href="/admin/speakers" className="es-btn-secondary px-4 py-2">
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="es-btn-primary"
                style={{ opacity: isSubmitting ? 0.55 : 1 }}
              >
                {isSubmitting ? 'Ajout en cours...' : "Ajouter l'intervenant →"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
