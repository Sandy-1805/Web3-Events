'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fr } from 'date-fns/locale';

interface Event {
  id: number;
  title: string;
}

export default function CreateSessionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    room: '',
    capacity: '',
    eventId: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!formData.eventId) {
      setError('Veuillez sélectionner un événement');
      setIsSubmitting(false);
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('L\'heure de fin doit être postérieure à l\'heure de début');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          startTime: formData.startTime.toISOString(),
          endTime: formData.endTime.toISOString(),
          room: formData.room,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          eventId: parseInt(formData.eventId),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }

      router.push('/admin/sessions');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || loadingEvents) {
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
          <Link href="/admin/sessions" className="text-[#6366f1] hover:underline">
            ← Retour à la liste
          </Link>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Créer une session</h1>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Événement *
              </label>
              <select
                required
                value={formData.eventId}
                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                className="w-full bg-gray-800 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#6366f1]"
              >
                <option value="">Sélectionner un événement</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Titre *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#6366f1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#6366f1]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Date et heure de début *
                </label>
                <DatePicker
                  selected={formData.startTime}
                  onChange={(date) => setFormData({ ...formData, startTime: date || new Date() })}
                  showTimeSelect
                  dateFormat="dd/MM/yyyy HH:mm"
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Heure"
                  locale={fr}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white"
                  wrapperClassName="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Date et heure de fin *
                </label>
                <DatePicker
                  selected={formData.endTime}
                  onChange={(date) => setFormData({ ...formData, endTime: date || new Date() })}
                  showTimeSelect
                  dateFormat="dd/MM/yyyy HH:mm"
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Heure"
                  locale={fr}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white"
                  wrapperClassName="w-full"
                  minDate={formData.startTime}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Salle *
                </label>
                <input
                  type="text"
                  required
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="Amphi A, Salle 101..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Capacité (optionnel)
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="Nombre de places"
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#6366f1]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/admin/sessions"
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
              >
                {isSubmitting ? 'Création...' : 'Créer la session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}