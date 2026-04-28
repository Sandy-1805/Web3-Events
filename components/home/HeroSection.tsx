'use client';

export default function HeroSection() {
  return (
    <>
      <style>{`
        .es-hero {
          position: relative;
          min-height: 92vh;
          display: flex;
          align-items: center;
          background: #0a0a0f;
          overflow: hidden;
        }
        .es-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .es-hero-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          top: -100px;
          right: -100px;
          pointer-events: none;
        }
        .es-hero-glow-2 {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%);
          bottom: -50px;
          left: 5%;
          pointer-events: none;
        }
        .es-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          width: 100%;
        }
        .es-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          color: #a5b4fc;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 1.5rem;
        }
        .es-live-dot {
          width: 7px;
          height: 7px;
          background: #f43f5e;
          border-radius: 50%;
          animation: es-pulse 1.5s ease-in-out infinite;
        }
        @keyframes es-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .es-hero-title {
          font-size: clamp(2.8rem, 5vw, 4.5rem);
          font-weight: 800;
          line-height: 1.08;
          color: #ffffff;
          margin: 0 0 1.5rem;
          letter-spacing: -0.03em;
        }
        .es-hero-title span {
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .es-hero-desc {
          font-size: 1.1rem;
          color: #94a3b8;
          line-height: 1.7;
          margin: 0 0 2.5rem;
          max-width: 480px;
        }
        .es-hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .es-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          padding: 14px 28px;
          border-radius: 12px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }
        .es-btn-primary:hover { opacity: 0.9; transform: translateY(-2px); }
        .es-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #e2e8f0;
          font-size: 0.95rem;
          font-weight: 600;
          padding: 14px 28px;
          border-radius: 12px;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.15);
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .es-btn-outline:hover { background: rgba(255,255,255,0.07); transform: translateY(-2px); }
        .es-hero-stats {
          display: flex;
          gap: 2.5rem;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .es-stat-num {
          font-size: 1.8rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
        }
        .es-stat-label {
          font-size: 0.8rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 2px;
        }
        .es-hero-visual {
          position: relative;
        }
        .es-event-card-demo {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 1.5rem;
          backdrop-filter: blur(12px);
        }
        .es-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.2rem;
        }
        .es-live-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(244,63,94,0.15);
          border: 1px solid rgba(244,63,94,0.3);
          color: #fb7185;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
        }
        .es-card-date {
          font-size: 0.8rem;
          color: #64748b;
        }
        .es-card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 0.4rem;
        }
        .es-card-loc {
          font-size: 0.85rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 1.2rem;
        }
        .es-sessions-mini {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .es-session-row {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 10px 12px;
        }
        .es-session-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .es-session-info { flex: 1; }
        .es-session-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: #e2e8f0;
        }
        .es-session-time {
          font-size: 0.75rem;
          color: #475569;
        }
        .es-float-card {
          position: absolute;
          background: rgba(15,15,25,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          backdrop-filter: blur(20px);
        }
        .es-float-1 {
          bottom: -20px;
          left: -30px;
          animation: es-float 3s ease-in-out infinite;
        }
        .es-float-2 {
          top: -15px;
          right: -20px;
          animation: es-float 3.5s ease-in-out infinite reverse;
        }
        @keyframes es-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .es-float-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }
        .es-float-text-main {
          font-size: 0.85rem;
          font-weight: 700;
          color: #f1f5f9;
        }
        .es-float-text-sub {
          font-size: 0.72rem;
          color: #64748b;
        }
        @media (max-width: 768px) {
          .es-hero-inner { grid-template-columns: 1fr; gap: 3rem; }
          .es-hero-visual { display: none; }
        }
      `}</style>

      <section className="es-hero">
        <div className="es-hero-grid" />
        <div className="es-hero-glow" />
        <div className="es-hero-glow-2" />

        <div className="es-hero-inner">
          {/* Left — copy */}
          <div>
            <div className="es-hero-badge">
              <span className="es-live-dot" />
              Événements en direct
            </div>

            <h1 className="es-hero-title">
              L'expérience événementielle{' '}
              <span>réinventée</span>
            </h1>

            <p className="es-hero-desc">
              EventSync connecte participants et organisateurs en temps réel.
              Posez des questions, votez, suivez les sessions live —
              tout en un seul endroit.
            </p>

            <div className="es-hero-actions">
              <a href="#events" className="es-btn-primary">
                Voir les événements →
              </a>
              <a href="#about" className="es-btn-outline">
                En savoir plus
              </a>
            </div>

            <div className="es-hero-stats">
              <div>
                <div className="es-stat-num">12+</div>
                <div className="es-stat-label">Événements</div>
              </div>
              <div>
                <div className="es-stat-num">300+</div>
                <div className="es-stat-label">Participants</div>
              </div>
              <div>
                <div className="es-stat-num">50+</div>
                <div className="es-stat-label">Speakers</div>
              </div>
            </div>
          </div>

          {/* Right — demo card */}
          <div className="es-hero-visual">
            <div className="es-event-card-demo">
              <div className="es-card-header">
                <div className="es-live-badge">
                  <span className="es-live-dot" />
                  Live
                </div>
                <div className="es-card-date">28 Avr 2026</div>
              </div>
              <div className="es-card-title">Web3 Madagascar Summit</div>
              <div className="es-card-loc">📍 Antananarivo, Madagascar</div>
              <div className="es-sessions-mini">
                {[
                  { color: '#6366f1', name: 'DeFi & Finance décentralisée', time: '09:00 – 10:30' },
                  { color: '#ec4899', name: 'NFT & Créateurs numériques', time: '11:00 – 12:00' },
                  { color: '#22d3ee', name: 'Smart Contracts Solidity', time: '14:00 – 15:30' },
                ].map((s, i) => (
                  <div key={i} className="es-session-row">
                    <div className="es-session-dot" style={{ background: s.color }} />
                    <div className="es-session-info">
                      <div className="es-session-name">{s.name}</div>
                      <div className="es-session-time">{s.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating cards */}
            <div className="es-float-card es-float-1">
              <div className="es-float-icon" style={{ background: 'rgba(244,63,94,0.15)' }}>🙋</div>
              <div>
                <div className="es-float-text-main">14 questions posées</div>
                <div className="es-float-text-sub">Session en cours</div>
              </div>
            </div>

            <div className="es-float-card es-float-2">
              <div className="es-float-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>⭐</div>
              <div>
                <div className="es-float-text-main">Session ajoutée</div>
                <div className="es-float-text-sub">Favoris mis à jour</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
