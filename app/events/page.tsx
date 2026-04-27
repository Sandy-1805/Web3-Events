'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      console.log('📅 Événements publics:', data);
      setEvents(data);
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-xl text-gray-500">Chargement des événements...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Tous les événements</h1>
      <p className="text-lg text-gray-600 mb-8">Découvrez nos prochains événements</p>

      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">Aucun événement à venir</p>
          <p className="text-gray-400 mt-2">Revenez plus tard pour découvrir nos prochains événements</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link href={`/events/${event.id}`} key={event.id}>
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                    {event.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description || 'Aucune description'}
                  </p>
                  <div className="space-y-1 text-sm text-gray-500">
                    <p className="flex items-center gap-2">
                      📅 {new Date(event.startDate).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="flex items-center gap-2">
                      ⏰ {new Date(event.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {event.location && (
                      <p className="flex items-center gap-2">
                        📍 {event.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}