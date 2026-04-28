'use client';

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

  // Récupérer l'ID de manière asynchrone (Next.js 16)
  useEffect(() => {
    params.then((resolvedParams) => {
      setSpeakerId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin' && speakerId) {
      fetchSpeaker();
    }
  }, [user, speakerId]);

  const fetchSpeaker = async () => {
    if (!speakerId) return;

    try {
      const response = await fetch(`/api/speakers/${speakerId}`);
      if (!response.ok) throw new Error('Erreur chargement');
      const data = await response.json();
      setFormData({
        name: data.name || '',
        bio: data.bio || '',
        photo: data.photo || '',
        socialLinks: data.socialLinks || '',
      });
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger l\'intervenant');
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
      setError('ID de l\'intervenant invalide');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/speakers/${speakerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
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
      <div className="flex justify-center items-center min-h-screen bg-[#0a0a0f]">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/admin/speakers" className="text-[#6366f1] hover:underline">
            ← Retour à la liste
          </Link>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Modifier l'intervenant</h1>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Nom complet *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Biographie
              </label>
              <textarea
                rows={5}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1]"
                placeholder="Présentation de l'intervenant, son parcours, ses expertises..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length} caractères
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                URL de la photo
              </label>
              <input
                type="url"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1]"
                placeholder="https://exemple.com/photo.jpg"
              />
              {formData.photo && (
                <div className="mt-2">
                  <img
                    src={formData.photo}
                    alt={formData.name}
                    className="w-20 h-20 rounded-full object-cover border border-white/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Liens sociaux (JSON)
              </label>
              <input
                type="text"
                value={formData.socialLinks}
                onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1]"
                placeholder='{"twitter": "https://twitter.com/...", "linkedin": "https://linkedin.com/..."}'
              />
              <p className="text-xs text-gray-500 mt-1">
                Format JSON : {`{"twitter": "url", "linkedin": "url", "github": "url"}`}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/admin/speakers"
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
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