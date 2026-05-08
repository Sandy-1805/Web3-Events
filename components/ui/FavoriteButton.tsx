'use client';

import { useEffect, useState } from 'react';
import { toggleFavorite, isFavorite } from '@/lib/favorites';  // ← Changer le chemin

interface FavoriteButtonProps {
  sessionId: number;
  className?: string;
}

export default function FavoriteButton({ sessionId, className = '' }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(sessionId));
  }, [sessionId]);

  const handleClick = (e: React.MouseEvent) => {
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