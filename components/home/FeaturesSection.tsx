export default function FeaturesSection() {
  const features = [
    {
      icon: '🔴',
      color: '#f43f5e',
      bg: 'rgba(244,63,94,0.1)',
      title: 'Sessions Live',
      desc: 'Identifiez instantanément les sessions en cours grâce aux badges Live automatiques. Ne manquez plus rien.',
    },
    {
      icon: '💬',
      color: '#6366f1',
      bg: 'rgba(99,102,241,0.1)',
      title: 'Q&R en temps réel',
      desc: 'Posez vos questions pendant les sessions live et votez pour celles qui vous intéressent le plus.',
    },
    {
      icon: '⭐',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
      title: 'Favoris personnels',
      desc: 'Construisez votre planning sur-mesure en ajoutant les sessions qui vous correspondent.',
    },
    {
      icon: '📅',
      color: '#22d3ee',
      bg: 'rgba(34,211,238,0.1)',
      title: 'Planning multi-track',
      desc: 'Visualisez toutes les sessions en parallèle selon les salles. Navigation fluide et intuitive.',
    },
    {
      icon: '🎤',
      color: '#a78bfa',
      bg: 'rgba(167,139,250,0.1)',
      title: 'Pages Speakers',
      desc: 'Chaque intervenant dispose d\'une page publique professionnelle avec bio et sessions associées.',
    },
    {
      icon: '🛡️',
      color: '#34d399',
      bg: 'rgba(52,211,153,0.1)',
      title: 'Espace Admin',
      desc: 'Les organisateurs gèrent tout depuis un tableau de bord dédié : événements, sessions, speakers.',
    },
  ];

  return (
    <>
      <style>{`
        .es-features {
          background: #0d0d14;
          padding: 6rem 2rem;
        }
        .es-features-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .es-section-tag {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6366f1;
          margin-bottom: 1rem;
        }
        .es-section-title {
          font-size: clamp(1.8rem, 3vw, 2.8rem);
          font-weight: 800;
          color: #f1f5f9;
          margin: 0 0 1rem;
          letter-spacing: -0.02em;
        }
        .es-section-sub {
          font-size: 1rem;
          color: #64748b;
          max-width: 500px;
          line-height: 1.7;
          margin: 0 0 3.5rem;
        }
        .es-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.25rem;
        }
        .es-feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.75rem;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .es-feature-card:hover {
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          transform: translateY(-3px);
        }
        .es-feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          margin-bottom: 1.2rem;
        }
        .es-feature-title {
          font-size: 1rem;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0 0 0.5rem;
        }
        .es-feature-desc {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.65;
          margin: 0;
        }
      `}</style>

      <section className="es-features">
        <div className="es-features-inner">
          <span className="es-section-tag">Fonctionnalités</span>
          <h2 className="es-section-title">Tout ce dont vous avez besoin</h2>
          <p className="es-section-sub">
            Une plateforme pensée pour maximiser l'engagement lors de vos événements.
          </p>

          <div className="es-features-grid">
            {features.map((f, i) => (
              <div key={i} className="es-feature-card">
                <div className="es-feature-icon" style={{ background: f.bg }}>
                  {f.icon}
                </div>
                <div className="es-feature-title">{f.title}</div>
                <p className="es-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
