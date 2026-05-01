'use client';

// app/admin/sessions/[id]/edit/page.tsx
// CORRECTIONS THÈME :
// - min-h-screen bg-[#0a0a0f] → géré par admin/layout.tsx
// - bg-white/5 border-white/10 → .es-card
// - text-white / text-gray-400 → var(--es-text-1) / .es-label
// - bg-white/10 border-white/20 inputs + selects → .es-input
// - bg-red-500/10 → .es-alert-error
// - border-white/10 (séparateur) → var(--es-border)
// - bg-white/5 (speaker chips) → var(--es-surface)

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
    params.then((resolvedParams) => setSessionId(resolvedParams.id));
  }, [params]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
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
      const res = await fetch('/api/events');
      setEvents(await res.json());
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    }
  };

  const fetchAllSpeakers = async () => {
    try {
      const res = await fetch('/api/speakers');
      setAllSpeakers(await res.json());
    } catch (error) {
      console.error('Erreur chargement speakers:', error);
    }
  };

  const fetchAssignedSpeakers = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/session-speakers?sessionId=${sessionId}`);
      setAssignedSpeakers(await res.json());
    } catch (error) {
      console.error('Erreur chargement speakers assignés:', error);
    }
  };

  const fetchSession = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/session/${sessionId}`);
      if (!res.ok) throw new Error('Erreur chargement session');
      const data = await res.json();
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
      setError("L'heure de fin doit être postérieure à l'heure de début");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/session/${sessionId}`, {
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

      if (!res.ok) {
        const data = await res.json();
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
      const res = await fetch('/api/session-speakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: parseInt(sessionId),
          speakerId: parseInt(selectedSpeakerId),
        }),
      });
      if (res.ok) {
        setSelectedSpeakerId('');
        fetchAssignedSpeakers();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'assignation");
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const removeSpeaker = async (speakerId: number) => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/session-speakers?sessionId=${sessionId}&speakerId=${speakerId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
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
      <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div style={{ color: 'var(--es-text-3)' }}>Chargement...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  const availableSpeakers = allSpeakers.filter(
    (s) => !assignedSpeakers.some((a) => a.id === s.id)
  );

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6">
          <Link href="/admin/sessions" style={{ color: 'var(--es-accent)' }}>
            ← Retour à la liste
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Formulaire de modification ── */}
          <div className="es-card p-6">
            <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--es-text-1)' }}>
              Modifier la session
            </h1>

            {error && <div className="es-alert-error mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="es-label">Événement *</label>
                <select
                  required
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  className="es-input"
                >
                  <option value="" style={{ background: 'var(--es-bg-1)', color: 'var(--es-text-1)' }}>
                    Sélectionner un événement
                  </option>
                  {events.map(event => (
                    <option
                      key={event.id}
                      value={event.id}
                      style={{ background: 'var(--es-bg-1)', color: 'var(--es-text-1)' }}
                    >
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>

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
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="es-input"
                  />
                </div>
                <div>
                  <label className="es-label">Date et heure de fin *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="es-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="es-label">Salle *</label>
                  <input
                    type="text"
                    required
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="es-input"
                  />
                </div>
                <div>
                  <label className="es-label">Capacité (optionnel)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="es-input"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Link href="/admin/sessions" className="es-btn-secondary px-4 py-2">
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

          {/* ── Assignation des speakers ── */}
          <div className="es-card p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--es-text-1)' }}>
              🎤 Intervenants de la session
            </h2>

            {/* Speakers assignés */}
            {assignedSpeakers.length === 0 ? (
              <p className="text-sm mb-4" style={{ color: 'var(--es-text-2)' }}>
                Aucun intervenant assigné pour le moment.
              </p>
            ) : (
              <div className="space-y-2 mb-6">
                {assignedSpeakers.map((speaker) => (
                  <div
                    key={speaker.id}
                    className="flex justify-between items-center rounded-lg p-3"
                    style={{ background: 'var(--es-surface)', border: '1px solid var(--es-border)' }}
                  >
                    <span className="font-medium" style={{ color: 'var(--es-text-1)' }}>
                      {speaker.name}
                    </span>
                    <button
                      onClick={() => removeSpeaker(speaker.id)}
                      className="text-sm"
                      style={{ color: 'var(--es-live)' }}
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Ajouter un speaker */}
            {availableSpeakers.length > 0 && (
              <div
                className="mt-4 pt-4"
                style={{ borderTop: '1px solid var(--es-border)' }}
              >
                <label className="es-label">Ajouter un intervenant</label>
                <div className="flex gap-2 mt-2">
                  <select
                    value={selectedSpeakerId}
                    onChange={(e) => setSelectedSpeakerId(e.target.value)}
                    className="es-input"
                    style={{ flex: 1 }}
                  >
                    <option value="" style={{ background: 'var(--es-bg-1)', color: 'var(--es-text-1)' }}>
                      Sélectionner un intervenant
                    </option>
                    {availableSpeakers.map((speaker) => (
                      <option
                        key={speaker.id}
                        value={speaker.id}
                        style={{ background: 'var(--es-bg-1)', color: 'var(--es-text-1)' }}
                      >
                        {speaker.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={assignSpeaker}
                    disabled={!selectedSpeakerId}
                    className="es-btn-primary"
                    style={{ opacity: !selectedSpeakerId ? 0.5 : 1, whiteSpace: 'nowrap' }}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            )}

            {availableSpeakers.length === 0 && assignedSpeakers.length > 0 && (
              <p className="text-sm mt-4" style={{ color: 'var(--es-text-3)' }}>
                Tous les intervenants sont déjà assignés à cette session.
              </p>
            )}

            <div
              className="mt-4 pt-4"
              style={{ borderTop: '1px solid var(--es-border)' }}
            >
              <Link
                href="/admin/speakers/create"
                className="text-sm"
                style={{ color: 'var(--es-accent)' }}
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
