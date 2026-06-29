'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Speaker {
  id: number;
  name: string;
  bio: string;
  photo: string;
}

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchSpeakers(); }, []);

  const fetchSpeakers = async () => {
    try {
      const response = await fetch('/api/speakers');
      if (!response.ok) throw new Error('Erreur chargement');
      const data = await response.json();
      setSpeakers(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les intervenants');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh', background:'var(--es-bg-1)' }}>
      <div style={{ color:'var(--es-text-2)' }}>Chargement des intervenants...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:'100vh', background:'var(--es-bg-1)', padding:'3rem', textAlign:'center' }}>
      <p style={{ color:'var(--es-live)' }}>{error}</p>
      <button onClick={fetchSpeakers} style={{ marginTop:'1rem', color:'var(--es-accent)', background:'none', border:'none', cursor:'pointer' }}>Réessayer</button>
    </div>
  );

  return (
    <>
      <style>{`
        .sp-page { min-height:100vh; background:var(--es-bg-1); padding:3rem 0; transition:background 0.25s ease; }
        .sp-container { max-width:1280px; margin:0 auto; padding:0 1.5rem; }
        .sp-header { text-align:center; margin-bottom:3rem; }
        .sp-tag { display:inline-block; font-size:0.75rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--es-accent); margin-bottom:0.75rem; }
        .sp-title { font-size:clamp(2rem,5vw,3rem); font-weight:800; background:linear-gradient(135deg,var(--es-text-1) 0%,var(--es-text-2) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin-bottom:1rem; }
        .sp-subtitle { color:var(--es-text-2); max-width:40rem; margin:0 auto; }
        .sp-empty { text-align:center; padding:4rem 0; background:var(--es-surface); border:1px solid var(--es-border); border-radius:1rem; }
        .sp-empty p { color:var(--es-text-2); }
        .sp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1.5rem; }
        .sp-card { background:var(--es-surface); border:1px solid var(--es-border); border-radius:0.75rem; padding:1.5rem; transition:background 0.2s,border-color 0.2s,transform 0.2s; text-decoration:none; display:block; cursor:pointer; }
        .sp-card:hover { background:var(--es-surface-hover); border-color:var(--es-border-hover); transform:translateY(-4px); }
        .sp-avatar { width:5rem; height:5rem; margin:0 auto 1rem; border-radius:50%; background:linear-gradient(135deg,var(--es-accent),var(--es-accent-2)); display:flex; align-items:center; justify-content:center; font-size:2rem; overflow:hidden; }
        .sp-name { font-size:1.15rem; font-weight:600; color:var(--es-text-1); margin-bottom:0.5rem; text-align:center; transition:color 0.2s; }
        .sp-card:hover .sp-name { color:var(--es-accent); }
        .sp-bio { color:var(--es-text-2); font-size:0.875rem; text-align:center; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>

      <div className="sp-page">
        <div className="sp-container">
          <div className="sp-header">
            <span className="sp-tag">Conférenciers</span>
            <h1 className="sp-title">Nos intervenants</h1>
            <p className="sp-subtitle">Des experts passionnés qui partagent leurs connaissances et leur expérience.</p>
          </div>

          {speakers.length === 0 ? (
            <div className="sp-empty"><p>Aucun intervenant pour le moment</p></div>
          ) : (
            <div className="sp-grid">
              {speakers.map((speaker) => (
                <Link href={`/speakers/${speaker.id}`} key={speaker.id} className="sp-card">
                  <div className="sp-avatar">
                    {speaker.photo ? (
                      <img src={speaker.photo} alt={speaker.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : '🎤'}
                  </div>
                  <h2 className="sp-name">{speaker.name}</h2>
                  <p className="sp-bio">{speaker.bio || 'Bio à venir'}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
