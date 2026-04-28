import { db } from '@/lib/db/index'
import { events } from '@/lib/db/schema';
import EventList from '@/components/events/EventList';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import Footer from '@/components/layout/Footer';

export default async function Home() {
  const allEvents = await db.select().from(events);

  return (
    <>
      <HeroSection />

      <main>
        {/* Events Section */}
        <section id="events" className="eventsync-events-section">
          <div className="eventsync-container">
            <div className="eventsync-section-header">
              <span className="eventsync-section-tag">Programme</span>
              <h2 className="eventsync-section-title">Événements à venir</h2>
              <p className="eventsync-section-subtitle">
                Rejoignez les prochains événements   et connectez-vous avec la communauté
              </p>
            </div>
            <EventList events={allEvents} />
          </div>
        </section>

        <FeaturesSection />
        <AboutSection />
      </main>

      <Footer />
    </>
  );
}
