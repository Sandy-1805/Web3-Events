import Link from 'next/link';

interface Event {
  id: number;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  location: string | null;
}

export default function EventList({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun événement à venir</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Link href={`/events/${event.id}`} key={event.id}>
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
            <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
            <p className="text-gray-600 mb-4 line-clamp-2">
              {event.description || 'Aucune description'}
            </p>
            <div className="text-sm text-gray-500">
              <p>📅 Du {new Date(event.startDate).toLocaleDateString('fr-FR')}</p>
              <p>📍 {event.location || 'Lieu non spécifié'}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}