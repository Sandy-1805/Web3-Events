export default function AboutSection() {
  const steps = [
    {
      num: '01',
      color: '#6366f1',
      title: 'Découvrez',
      desc: 'Parcourez les événements disponibles et consultez le planning complet avec toutes les sessions.',
    },
    {
      num: '02',
      color: '#ec4899',
      title: 'Planifiez',
      desc: 'Ajoutez vos sessions favorites pour construire votre programme personnel sur-mesure.',
    },
    {
      num: '03',
      color: '#22d3ee',
      title: 'Participez',
      desc: 'Posez des questions en direct, votez, et interagissez avec les intervenants pendant les sessions live.',
    },
  ];

  return (
    <>
      <style>{`
        .es-about {
          background: var(--es-bg-1);
          padding: 6rem 2rem;
          position: relative;
          overflow: hidden;
        }
        .es-about-accent {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
          bottom: -150px;
          right: -100px;
          pointer-events: none;
        }
        .es-about-inner {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: center;
        }
        .es-about-label {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--es-accent);
          margin-bottom: 1rem;
        }
        .es-about-title {
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          font-weight: 800;
          color: var(--es-text-1);
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin: 0 0 1.5rem;
        }
        .es-about-desc {
          font-size: 0.95rem;
          color: var(--es-text-2);
          line-height: 1.75;
          margin: 0 0 2rem;
        }
        .es-about-quote {
          background: rgba(99,102,241,0.08);
          border-left: 3px solid var(--es-accent);
          border-radius: 0 12px 12px 0;
          padding: 1rem 1.25rem;
          font-size: 0.9rem;
          color: var(--es-accent);
          font-style: italic;
          line-height: 1.6;
        }
        .es-steps {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .es-step {
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
        }
        .es-step-num {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          min-width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .es-step-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--es-text-1);
          margin: 0 0 0.35rem;
        }
        .es-step-desc {
          font-size: 0.85rem;
          color: var(--es-text-3);
          line-height: 1.6;
          margin: 0;
        }
        .es-step-connector {
          width: 1px;
          height: 20px;
          background: var(--es-border);
          margin: 4px 0 4px 17px;
        }
        @media (max-width: 768px) {
          .es-about-inner { grid-template-columns: 1fr; gap: 3rem; }
        }
      `}</style>

      <section id="about" className="es-about">
        <div className="es-about-accent" />
        <div className="es-about-inner">
          {/* Left */}
          <div>
            <span className="es-about-label">À propos</span>
            <h2 className="es-about-title">
              Pourquoi EventSync ?
            </h2>
            <p className="es-about-desc">
              Les événements EventSync réunissent des communautés passionnées autour de sujets
              complexes et en constante évolution. EventSync est né du constat simple que
              les outils traditionnels — programmes PDF, emails, feuilles papier — ne
              suffisent plus.
            </p>
            <p className="es-about-desc">
              Notre plateforme remplace ces supports statiques par une interface dynamique
              qui vit avec votre événement : en temps réel, interactive, et accessible à tous
              sans inscription préalable.
            </p>
            <div className="es-about-quote">
              "Conçu pour la communauté malgache et au-delà — parce que chaque
              participant mérite une expérience à la hauteur de l'événement."
            </div>
          </div>

          {/* Right — steps */}
          <div className="es-steps">
            {steps.map((step, i) => (
              <div key={i}>
                <div className="es-step">
                  <div
                    className="es-step-num"
                    style={{
                      background: `${step.color}18`,
                      color: step.color,
                      border: `1px solid ${step.color}30`,
                    }}
                  >
                    {step.num}
                  </div>
                  <div>
                    <div className="es-step-title">{step.title}</div>
                    <p className="es-step-desc">{step.desc}</p>
                  </div>
                </div>
                {i < steps.length - 1 && <div className="es-step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}