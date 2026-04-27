import { db } from '@/lib/db/index'
import { events } from '@/lib/db/schema';
import EventList from '@/components/events/EventList';

export default async function Home() {
  const allEvents = await db.select().from(events);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Bienvenue sur EventSync
        </h1>
        <p className="text-xl text-gray-600">
          Découvrez et participez à des événements interactifs
        </p>
      </div>
      
      <section>
        <h2 className="text-3xl font-semibold mb-6">Événements à venir</h2>
        <EventList events={allEvents} />
      </section>
    </div>
  );
}