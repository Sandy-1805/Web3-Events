'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fr } from 'date-fns/locale';

export default function CreateEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 3600000),
    location: '',
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

    if (formData.startDate >= formData.endDate) {
      setError('La date de fin doit être postérieure à la date de début');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
          location: formData.location,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }

      router.push('/admin/events');
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
          <Link href="/admin/events" style={{ color: 'var(--es-accent)' }}>
            ← Retour à la liste
          </Link>
        </div>

        {/* Carte formulaire */}
        <div className="es-card p-6">
          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--es-text-1)' }}>
            Créer un événement
          </h1>

          {error && (
            <div className="es-alert-error mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="es-label">Titre *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="es-input"
              />
            </div>

            <div>
              <label className="es-label">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="es-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="es-label">Date et heure de début *</label>
                <DatePicker
                  selected={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date || new Date() })}
                  showTimeSelect
                  dateFormat="dd/MM/yyyy HH:mm"
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Heure"
                  locale={fr}
                  className="es-input"
                  wrapperClassName="w-full"
                />
              </div>

              <div>
                <label className="es-label">Date et heure de fin *</label>
                <DatePicker
                  selected={formData.endDate}
                  onChange={(date) => setFormData({ ...formData, endDate: date || new Date() })}
                  showTimeSelect
                  dateFormat="dd/MM/yyyy HH:mm"
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Heure"
                  locale={fr}
                  className="es-input"
                  wrapperClassName="w-full"
                  minDate={formData.startDate}
                />
              </div>
            </div>

            <div>
              <label className="es-label">Lieu</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="es-input"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Link href="/admin/events" className="es-btn-secondary px-4 py-2">
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="es-btn-primary"
                style={{ opacity: isSubmitting ? 0.55 : 1 }}
              >
                {isSubmitting ? 'Création...' : "Créer l'événement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
