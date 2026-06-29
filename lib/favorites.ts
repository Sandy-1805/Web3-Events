const FAVORITES_KEY = 'eventsync_favorites';

export function getFavoriteIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function isFavorite(sessionId: number): boolean {
  return getFavoriteIds().includes(sessionId);
}

export function toggleFavorite(sessionId: number): boolean {
  const ids = getFavoriteIds();
  const index = ids.indexOf(sessionId);
  if (index === -1) {
    ids.push(sessionId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    return true;
  } else {
    ids.splice(index, 1);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    return false;
  }
}