// app/admin/sessions/[id]/edit/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Event {
  id: number;
  title: string;
}

interface Speaker {
  id: number;
  name: string;
  bio: string;
  photo: string;
}

export default function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [allSpeakers, setAllSpeakers] = useState<Speaker[]>([]);
  const [assignedSpeakers, setAssignedSpeakers] = useState<Speaker[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    room: '',
    capacity: '',
    eventId: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setSessionId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin' && sessionId) {
      fetchEvents();
      fetchSession();
      fetchAllSpeakers();
      fetchAssignedSpeakers();
    }
  }, [user, sessionId]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    }
  };

  const fetchAllSpeakers = async () => {
    try {
      const response = await fetch('/api/speakers');
      const data = await response.json();
      setAllSpeakers(data);
    } catch (error) {
      console.error('Erreur chargement speakers:', error);
    }
  };

  const fetchAssignedSpeakers = async () => {
    if (!sessionId) return;
    try {
      const response = await fetch(`/api/session-speakers?sessionId=${sessionId}`);
      const data = await response.json();
      setAssignedSpeakers(data);
    } catch (error) {
      console.error('Erreur chargement speakers assignés:', error);
    }
  };

  const fetchSession = async () => {
    if (!sessionId) return;
    try {
      const response = await fetch(`/api/session/${sessionId}`);
      if (!response.ok) throw new Error('Erreur chargement session');
      const data = await response.json();
      setFormData({
        title: data.title,
        description: data.description || '',
        startTime: new Date(data.startTime).toISOString().slice(0, 16),
        endTime: new Date(data.endTime).toISOString().slice(0, 16),
        room: data.room,
        capacity: data.capacity || '',
        eventId: data.eventId.toString(),
      });
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger la session');
    } finally {
      setIsLoading(false);
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

    if (!sessionId) {
      setError('ID de session invalide');
      setIsSubmitting(false);
      return;
    }

    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);

    if (startDate >= endDate) {
      setError('L\'heure de fin doit être postérieure à l\'heure de début');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/session/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          room: formData.room,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          eventId: parseInt(formData.eventId),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la modification');
      }

      router.push('/admin/sessions');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const assignSpeaker = async () => {
    if (!selectedSpeakerId || !sessionId) return;

    try {
      const response = await fetch('/api/session-speakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: parseInt(sessionId),
          speakerId: parseInt(selectedSpeakerId),
        }),
      });

      if (response.ok) {
        setSelectedSpeakerId('');
        fetchAssignedSpeakers();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de l\'assignation');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const removeSpeaker = async (speakerId: number) => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/session-speakers?sessionId=${sessionId}&speakerId=${speakerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAssignedSpeakers();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
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

  const availableSpeakers = allSpeakers.filter(
    (speaker) => !assignedSpeakers.some((assigned) => assigned.id === speaker.id)
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/admin/sessions" className="text-[#6366f1] hover:underline">
            ← Retour à la liste
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de modification */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Modifier la session</h1>

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
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#6366f1]"
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
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#6366f1]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Date et heure de fin *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#6366f1]"
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
                  {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>

          {/* Section Assignation des speakers */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">🎤 Intervenants de la session</h2>

            {/* Liste des speakers déjà assignés */}
            {assignedSpeakers.length === 0 ? (
              <p className="text-gray-400 text-sm mb-4">Aucun intervenant assigné pour le moment.</p>
            ) : (
              <div className="space-y-2 mb-6">
                {assignedSpeakers.map((speaker) => (
                  <div key={speaker.id} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                    <div>
                      <span className="text-white font-medium">{speaker.name}</span>
                    </div>
                    <button
                      onClick={() => removeSpeaker(speaker.id)}
                      className="text-red-400 hover:text-red-300 text-sm transition"
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Ajouter un speaker */}
            {availableSpeakers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Ajouter un intervenant
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedSpeakerId}
                    onChange={(e) => setSelectedSpeakerId(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#6366f1]"
                  >
                    <option value="">Sélectionner un intervenant</option>
                    {availableSpeakers.map((speaker) => (
                      <option key={speaker.id} value={speaker.id}>{speaker.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={assignSpeaker}
                    disabled={!selectedSpeakerId}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            )}

            {availableSpeakers.length === 0 && assignedSpeakers.length > 0 && (
              <p className="text-gray-500 text-sm mt-4">Tous les intervenants sont déjà assignés à cette session.</p>
            )}

            <div className="mt-4 pt-4 border-t border-white/10">
              <Link
                href="/admin/speakers/create"
                className="text-[#6366f1] text-sm hover:underline"
              >
                + Créer un nouvel intervenant
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}