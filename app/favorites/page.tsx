'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFavoriteIds, toggleFavorite, isFavorite } from '@/lib/favorites';

interface FavoriteSession {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  room: string;
  eventId: number;
}


export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFavorites(); }, []);

  const loadFavorites = async () => {
    const ids = getFavoriteIds();
    if (ids.length === 0) { setFavorites([]); setLoading(false); return; }
    try {
      const results = await Promise.all(
        ids.map((id) => fetch(`/api/session/${id}`).then((r) => (r.ok ? r.json() : null)).catch(() => null))
      );
      setFavorites(results.filter(Boolean) as FavoriteSession[]);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = (sessionId: number) => {
    toggleFavorite(sessionId);
    setFavorites((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const isLive = (startTime: string, endTime: string) => {
    const now = new Date();
    return now >= new Date(startTime) && now <= new Date(endTime);
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh', background:'var(--es-bg-1)' }}>
      <div style={{ color:'var(--es-text-2)' }}>Chargement de vos favoris...</div>
    </div>
  );

  return (
    <>
      <style>{`
        .fav-page { min-height:100vh; background:var(--es-bg-1); padding:3rem 0; transition:background 0.25s ease; }
        .fav-container { max-width:56rem; margin:0 auto; padding:0 1.5rem; }
        .fav-header { text-align:center; margin-bottom:2rem; }
        .fav-title { font-size:1.8rem; font-weight:800; background:linear-gradient(135deg,var(--es-text-1),var(--es-text-2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .fav-subtitle { color:var(--es-text-2); margin-top:0.5rem; }
        .fav-empty { background:var(--es-surface); border:1px solid var(--es-border); border-radius:0.75rem; padding:3rem; text-align:center; }
        .fav-empty p { color:var(--es-text-2); }
        .fav-empty-sub { color:var(--es-text-3); font-size:0.875rem; margin-top:0.5rem; }
        .fav-empty-link { display:inline-block; margin-top:1.5rem; padding:0.5rem 1.5rem; background:var(--es-accent); color:#fff; border-radius:0.5rem; text-decoration:none; transition:opacity 0.2s; }
        .fav-empty-link:hover { opacity:0.85; }
        .fav-count { color:var(--es-text-3); font-size:0.875rem; text-align:center; margin-bottom:1rem; }
        .fav-list { display:flex; flex-direction:column; gap:1rem; }
        .fav-item { background:var(--es-surface); border:1px solid var(--es-border); border-radius:0.75rem; padding:1.25rem; transition:background 0.2s; }
        .fav-item:hover { background:var(--es-surface-hover); }
        .fav-item-inner { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; }
        .fav-item-link { flex:1; text-decoration:none; }
        .fav-item-top { display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem; flex-wrap:wrap; }
        .fav-item-title { font-size:1.1rem; font-weight:600; color:var(--es-text-1); transition:color 0.2s; }
        .fav-item-link:hover .fav-item-title { color:var(--es-accent); }
        .fav-live-badge { background:rgba(244,63,94,0.15); color:#fb7185; font-size:0.7rem; font-weight:700; padding:0.15rem 0.5rem; border-radius:100px; animation:fav-pulse 1.5s ease-in-out infinite; }
        @keyframes fav-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .fav-item-desc { color:var(--es-text-2); font-size:0.875rem; margin-top:0.25rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .fav-item-meta { display:flex; flex-wrap:wrap; gap:1rem; margin-top:0.5rem; font-size:0.875rem; color:var(--es-text-3); }
        .fav-remove-btn { background:none; border:none; color:var(--es-text-3); cursor:pointer; transition:color 0.2s; padding:0.25rem; flex-shrink:0; }
        .fav-remove-btn:hover { color:var(--es-live); }
      `}</style>

      <div className="fav-page">
        <div className="fav-container">
          <div className="fav-header">
            <h1 className="fav-title">⭐ Mes favoris</h1>
            <p className="fav-subtitle">Votre itinéraire personnel — sauvegardé dans votre navigateur</p>
          </div>

          {favorites.length === 0 ? (
            <div className="fav-empty">
              <p>Aucune session favorite</p>
              <p className="fav-empty-sub">Ajoutez des sessions depuis le planning en cliquant sur ⭐</p>
              <Link href="/events" className="fav-empty-link">Découvrir des événements →</Link>
            </div>
          ) : (
            <>
              <p className="fav-count">
                {favorites.length} session{favorites.length > 1 ? 's' : ''} sauvegardée{favorites.length > 1 ? 's' : ''}
              </p>
              <div className="fav-list">
                {favorites.map((session) => {
                  const live = isLive(session.startTime, session.endTime);
                  return (
                    <div key={session.id} className="fav-item">
                      <div className="fav-item-inner">
                        <Link href={`/sessions/${session.id}`} className="fav-item-link">
                          <div className="fav-item-top">
                            <h3 className="fav-item-title">{session.title}</h3>
                            {live && <span className="fav-live-badge">🔴 LIVE</span>}
                          </div>
                          {session.description && <p className="fav-item-desc">{session.description}</p>}
                          <div className="fav-item-meta">
                            <span>📅 {new Date(session.startTime).toLocaleDateString('fr-FR')}</span>
                            <span>⏰ {new Date(session.startTime).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}</span>
                            <span>🚪 {session.room}</span>
                          </div>
                        </Link>
                        <button onClick={() => removeFavorite(session.id)} className="fav-remove-btn" title="Retirer des favoris">✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
