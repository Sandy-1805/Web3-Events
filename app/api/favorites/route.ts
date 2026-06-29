import { FavoriteController } from '@/server/controllers/favoriteController';
import { NextRequest } from 'next/server';

const favoriteController = new FavoriteController();

export async function GET(request: NextRequest) {
  return await favoriteController.getUserFavorites(request);
}

export async function POST(request: NextRequest) {
  return await favoriteController.addFavorite(request);
}

export async function DELETE(request: NextRequest) {
  return await favoriteController.removeFavorite(request);
}