export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    Plateforme: [
      { label: 'Événements', href: '/events' },
      { label: 'Speakers', href: '/speakers' },
      { label: 'Favoris', href: '/favorites' },
    ],
    Administration: [
      { label: 'Tableau de bord', href: '/admin' },
      { label: 'Gérer les événements', href: '/admin/events' },
      { label: 'Gérer les speakers', href: '/admin/speakers' },
    ],
    Ressources: [
      { label: 'À propos', href: '#about' },
      { label: 'Comment ça marche', href: '#features' },
      { label: 'Connexion', href: '/login' },
    ],
  };

  return (
    <>
      <style>{`
        .es-footer {
          background: #07070e;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 4rem 2rem 2rem;
        }
        .es-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .es-footer-top {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
          padding-bottom: 3rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .es-footer-brand-name {
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #f1f5f9;
          margin: 0 0 0.75rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .es-footer-brand-logo {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }
        .es-footer-brand-desc {
          font-size: 0.85rem;
          color: #475569;
          line-height: 1.65;
          margin: 0 0 1.5rem;
          max-width: 240px;
        }
        .es-footer-socials {
          display: flex;
          gap: 10px;
        }
        .es-social-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          text-decoration: none;
          transition: background 0.2s;
          color: #64748b;
        }
        .es-social-btn:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
        .es-footer-col-title {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #e2e8f0;
          margin: 0 0 1.2rem;
        }
        .es-footer-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .es-footer-links a {
          font-size: 0.85rem;
          color: #475569;
          text-decoration: none;
          transition: color 0.2s;
        }
        .es-footer-links a:hover { color: #a5b4fc; }
        .es-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .es-footer-copy {
          font-size: 0.8rem;
          color: #334155;
        }
        .es-footer-copy span {
          color: #475569;
        }
        .es-footer-live {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: #475569;
        }
        .es-live-indicator {
          width: 6px;
          height: 6px;
          background: #22d3ee;
          border-radius: 50%;
          animation: es-pulse 2s ease-in-out infinite;
        }
        @keyframes es-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 768px) {
          .es-footer-top { grid-template-columns: 1fr 1fr; }
          .es-footer-bottom { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 480px) {
          .es-footer-top { grid-template-columns: 1fr; }
        }
      `}</style>

      <footer className="es-footer">
        <div className="es-footer-inner">
          <div className="es-footer-top">
            {/* Brand */}
            <div>
              <div className="es-footer-brand-name">
                <span className="es-footer-brand-logo">⚡</span>
                EventSync
              </div>
              <p className="es-footer-brand-desc">
                La plateforme d'engagement événementiel pensée pour la communauté Malagasy.
                Sessions live, Q&R interactif, planning personnalisé.
              </p>
              <div className="es-footer-socials">
                {['𝕏', 'in', '🐙'].map((icon, i) => (
                  <a key={i} href="#" className="es-social-btn">{icon}</a>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            {Object.entries(links).map(([title, items]) => (
              <div key={title}>
                <div className="es-footer-col-title">{title}</div>
                <ul className="es-footer-links">
                  {items.map((item) => (
                    <li key={item.label}>
                      <a href={item.href}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="es-footer-bottom">
            <div className="es-footer-copy">
              © {currentYear} EventSync — <span>Plateforme événementielle</span>
            </div>
            <div className="es-footer-live">
              <span className="es-live-indicator" />
              Système opérationnel
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
