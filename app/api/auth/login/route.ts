import { AuthController } from '@/server/controllers/authController';
import { NextRequest } from 'next/server';

const authController = new AuthController();

export async function POST(request: NextRequest) {
  return await authController.login(request);
}