'use client';

// app/admin/speakers/[id]/edit/page.tsx
// CORRECTIONS THÈME :
// - min-h-screen bg-[#0a0a0f] → géré par admin/layout.tsx
// - bg-white/5 border-white/10 → .es-card
// - text-white / text-gray-400/500 → var(--es-text-1) / .es-label / var(--es-text-3)
// - bg-white/10 border-white/20 inputs → .es-input
// - border-white/20 (preview photo) → var(--es-border)
// - bg-red-500/10 → .es-alert-error

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EditSpeakerPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [speakerId, setSpeakerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    photo: '',
    socialLinks: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => setSpeakerId(resolvedParams.id));
  }, [params]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin' && speakerId) fetchSpeaker();
  }, [user, speakerId]);

  const fetchSpeaker = async () => {
    if (!speakerId) return;
    try {
      const res = await fetch(`/api/speakers/${speakerId}`);
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      setFormData({
        name: data.name || '',
        bio: data.bio || '',
        photo: data.photo || '',
        socialLinks: data.socialLinks || '',
      });
    } catch (error) {
      console.error('Erreur:', error);
      setError("Impossible de charger l'intervenant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!formData.name.trim()) {
      setError('Le nom est obligatoire');
      setIsSubmitting(false);
      return;
    }
    if (!speakerId) {
      setError("ID de l'intervenant invalide");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/speakers/${speakerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la modification');
      }

      router.push('/admin/speakers');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isLoading) {
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

        <div className="mb-6">
          <Link href="/admin/speakers" style={{ color: 'var(--es-accent)' }}>
            ← Retour à la liste
          </Link>
        </div>

        <div className="es-card p-6">
          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--es-text-1)' }}>
            Modifier l&apos;intervenant
          </h1>

          {error && <div className="es-alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="es-label">Nom complet *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="es-input"
              />
            </div>

            <div>
              <label className="es-label">Biographie</label>
              <textarea
                rows={5}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="es-input"
                style={{ resize: 'vertical' }}
                placeholder="Présentation de l'intervenant, son parcours, ses expertises..."
              />
              <p className="text-xs mt-1" style={{ color: 'var(--es-text-3)' }}>
                {formData.bio.length} caractères
              </p>
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
              {/* Prévisualisation de la photo avec bordure thémée */}
              {formData.photo && (
                <div className="mt-2">
                  <img
                    src={formData.photo}
                    alt={formData.name}
                    className="w-20 h-20 rounded-full object-cover"
                    style={{ border: '2px solid var(--es-border)' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
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
              <p className="text-xs mt-1" style={{ color: 'var(--es-text-3)' }}>
                {`Format JSON : {"twitter": "url", "linkedin": "url", "github": "url"}`}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Link href="/admin/speakers" className="es-btn-secondary px-4 py-2">
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="es-btn-primary"
                style={{ opacity: isSubmitting ? 0.55 : 1 }}
              >
                {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
