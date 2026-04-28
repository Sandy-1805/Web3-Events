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
    return <div className="text-center py-12">Chargement...</div>;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/admin/speakers" className="text-blue-600 hover:underline">
            ← Retour à la liste
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Ajouter un intervenant</h1>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom complet *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Biographie
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Présentation de l'intervenant..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                URL de la photo
              </label>
              <input
                type="url"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Liens sociaux (JSON)
              </label>
              <input
                type="text"
                value={formData.socialLinks}
                onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder='{"twitter": "https://twitter.com/...", "linkedin": "..."}'
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/admin/speakers"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Ajout...' : 'Ajouter l\'intervenant'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}