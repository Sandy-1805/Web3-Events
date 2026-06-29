import { AuthController } from '@/server/controllers/authController';

const authController = new AuthController();

export async function POST() {
  return await authController.logout();
}