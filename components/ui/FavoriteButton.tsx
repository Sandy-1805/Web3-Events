// components/ui/FavoriteButton.tsx
// ⭐ Bouton favori réutilisable
// Utilise localStorage (spec §4.8 : stockage côté navigateur)
// Peut s'utiliser dans le PlanningGrid, la page session, etc.
//
// 💡 Pourquoi un composant séparé ?
//   Pour éviter de dupliquer la logique localStorage dans chaque page.
//   C'est le principe DRY : Don't Repeat Yourself.

'use client';

import { useEffect, useState } from 'react';
import { toggleFavorite, isFavorite } from '@/app/favorites/page';

interface FavoriteButtonProps {
  sessionId: number;
  className?: string; // permet de customiser le style depuis le parent
}

export default function FavoriteButton({ sessionId, className = '' }: FavoriteButtonProps) {
  // On initialise à false, puis on lit localStorage côté client
  // (localStorage n'est pas disponible côté serveur → Next.js SSR)
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    // Lire l'état depuis localStorage au montage du composant
    setFavorited(isFavorite(sessionId));
  }, [sessionId]);

  const handleClick = (e: React.MouseEvent) => {
    // Empêche le clic de remonter au parent (ex: un <Link>)
    e.preventDefault();
    e.stopPropagation();

    const added = toggleFavorite(sessionId);
    setFavorited(added);
  };

  return (
    <button
      onClick={handleClick}
      className={`transition-all duration-200 ${className}`}
      title={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {favorited ? '⭐' : '☆'}
    </button>
  );
}