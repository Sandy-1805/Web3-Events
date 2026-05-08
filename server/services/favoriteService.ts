import { db } from '@/lib/db/index';
import { favorites, sessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export class FavoriteService {
  async getUserFavorites(userId: number): Promise<any[]> {
    const userFavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId));

    if (userFavorites.length === 0) return [];

    const sessionIds = userFavorites.map(f => f.sessionId);

    const favoriteSessions = await db
      .select()
      .from(sessions)
      .where(sql`id IN (${sessionIds.join(',')})`);

    return favoriteSessions;
  }

  async addFavorite(userId: number, sessionId: number): Promise<void> {
    // Vérifier si le favori existe déjà
    const existing = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.sessionId, sessionId)
        )
      );

    if (existing.length === 0) {
      await db.insert(favorites).values({ userId, sessionId });
    }
  }

  async removeFavorite(userId: number, sessionId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.sessionId, sessionId)
        )
      );
  }
}