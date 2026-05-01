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
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => { fetchEvents(); }, []);

  useEffect(() => {
    const filtered = allEvents.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredEvents(filtered);
    setCurrentPage(1);
  }, [searchTerm, allEvents]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setAllEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);
  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  if (loading) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh', background:'var(--es-bg-1)' }}>
        <div style={{ color: 'var(--es-text-2)' }}>Chargement des événements...</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .ep-page { min-height:100vh; background:var(--es-bg-1); padding:3rem 0; transition:background 0.25s ease; }
        .ep-container { max-width:1280px; margin:0 auto; padding:0 1.5rem; }
        .ep-header { text-align:center; margin-bottom:3rem; }
        .ep-tag { display:inline-block; font-size:0.75rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--es-accent); margin-bottom:0.75rem; }
        .ep-title { font-size:clamp(2rem,5vw,3rem); font-weight:800; background:linear-gradient(135deg,var(--es-text-1) 0%,var(--es-text-2) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin-bottom:1rem; }
        .ep-subtitle { color:var(--es-text-2); max-width:40rem; margin:0 auto; }
        .ep-search-wrap { max-width:28rem; margin:0 auto 2rem; }
        .ep-search-inner { position:relative; }
        .ep-search-input { width:100%; background:var(--es-input-bg); border:1px solid var(--es-border); border-radius:0.75rem; padding:0.75rem 1rem; color:var(--es-text-1); outline:none; transition:border-color 0.2s,background 0.2s; font-size:0.95rem; box-sizing:border-box; }
        .ep-search-input::placeholder { color:var(--es-text-3); }
        .ep-search-input:focus { border-color:var(--es-accent); background:var(--es-input-bg-focus); }
        .ep-search-clear { position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--es-text-2); cursor:pointer; }
        .ep-search-clear:hover { color:var(--es-text-1); }
        .ep-count { color:var(--es-text-3); font-size:0.85rem; text-align:center; margin-top:0.5rem; }
        .ep-empty { text-align:center; padding:4rem 0; background:var(--es-surface); border:1px solid var(--es-border); border-radius:1rem; }
        .ep-empty p { color:var(--es-text-2); }
        .ep-empty-btn { background:none; border:none; color:var(--es-accent); cursor:pointer; margin-top:1rem; }
        .ep-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.5rem; }
        .ep-card { background:var(--es-surface); border:1px solid var(--es-border); border-radius:0.75rem; padding:1.5rem; transition:background 0.2s,border-color 0.2s,transform 0.2s; text-decoration:none; display:block; }
        .ep-card:hover { background:var(--es-surface-hover); border-color:var(--es-border-hover); transform:translateY(-4px); }
        .ep-card-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; }
        .ep-card-date { font-size:0.78rem; color:var(--es-text-3); }
        .ep-card-title { font-size:1.15rem; font-weight:600; color:var(--es-text-1); margin-bottom:0.5rem; transition:color 0.2s; }
        .ep-card:hover .ep-card-title { color:var(--es-accent); }
        .ep-card-desc { color:var(--es-text-2); font-size:0.875rem; line-height:1.5; margin-bottom:1rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .ep-card-loc { display:flex; align-items:center; gap:0.5rem; font-size:0.875rem; color:var(--es-text-3); }
        .ep-pagination { display:flex; justify-content:center; align-items:center; gap:0.75rem; margin-top:2.5rem; }
        .ep-pag-btn { padding:0.5rem 1rem; background:var(--es-surface); border:1px solid var(--es-border); border-radius:0.5rem; color:var(--es-text-1); cursor:pointer; transition:background 0.2s; }
        .ep-pag-btn:hover:not(:disabled) { background:var(--es-surface-hover); }
        .ep-pag-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .ep-pag-info { color:var(--es-text-2); font-size:0.9rem; }
      `}</style>

      <div className="ep-page">
        <div className="ep-container">
          <div className="ep-header">
            <span className="ep-tag">Découvrir</span>
            <h1 className="ep-title">Tous nos événements</h1>
            <p className="ep-subtitle">Des rencontres uniques pour explorer les technologies émergentes.</p>
          </div>

          <div className="ep-search-wrap">
            <div className="ep-search-inner">
              <input type="text" placeholder="🔍 Rechercher un événement..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} className="ep-search-input" />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="ep-search-clear">✕</button>}
            </div>
            <p className="ep-count">{filteredEvents.length} événement(s) trouvé(s)</p>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="ep-empty">
              <p>Aucun événement trouvé</p>
              {searchTerm && <button className="ep-empty-btn" onClick={() => setSearchTerm('')}>Effacer la recherche</button>}
            </div>
          ) : (
            <>
              <div className="ep-grid">
                {paginatedEvents.map((event) => (
                  <Link href={`/events/${event.id}`} key={event.id} className="ep-card">
                    <div className="ep-card-top">
                      <div style={{ fontSize:'2rem' }}>📅</div>
                      <div className="ep-card-date">{new Date(event.startDate).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <h2 className="ep-card-title">{event.title}</h2>
                    <p className="ep-card-desc">{event.description || 'Aucune description'}</p>
                    <div className="ep-card-loc"><span>📍</span><span>{event.location || 'Lieu non spécifié'}</span></div>
                  </Link>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="ep-pagination">
                  <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="ep-pag-btn">← Précédent</button>
                  <span className="ep-pag-info">Page {currentPage} sur {totalPages}</span>
                  <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="ep-pag-btn">Suivant →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
