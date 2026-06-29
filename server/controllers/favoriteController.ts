import { FavoriteService } from '../services/favoriteService';
import { verifyToken } from '../utils/jwt';
import { COOKIE_NAME } from '../utils/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const favoriteService = new FavoriteService();

async function getUserId(request: NextRequest): Promise<number | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.id || null;
}

export class FavoriteController {
  async getUserFavorites(request: NextRequest) {
    const userId = await getUserId(request);
    if (!userId) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
      const favorites = await favoriteService.getUserFavorites(userId);
      return Response.json(favorites);
    } catch (error) {
      console.error('Get favorites error:', error);
      return Response.json(
        { error: 'Erreur lors de la récupération des favoris' },
        { status: 500 }
      );
    }
  }

  async addFavorite(request: NextRequest) {
    const userId = await getUserId(request);
    if (!userId) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
      const body = await request.json();
      const { sessionId } = body;

      if (!sessionId) {
        return Response.json(
          { error: 'sessionId requis' },
          { status: 400 }
        );
      }

      await favoriteService.addFavorite(userId, sessionId);
      return Response.json({ success: true }, { status: 201 });
    } catch (error) {
      console.error('Add favorite error:', error);
      return Response.json(
        { error: 'Erreur lors de l\'ajout' },
        { status: 500 }
      );
    }
  }

  async removeFavorite(request: NextRequest) {
    const userId = await getUserId(request);
    if (!userId) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
      const body = await request.json();
      const { sessionId } = body;

      if (!sessionId) {
        return Response.json(
          { error: 'sessionId requis' },
          { status: 400 }
        );
      }

      await favoriteService.removeFavorite(userId, sessionId);
      return Response.json({ success: true });
    } catch (error) {
      console.error('Remove favorite error:', error);
      return Response.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }
  }
}