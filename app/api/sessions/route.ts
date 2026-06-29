import { SessionController } from '@/server/controllers/sessionController';
import { NextRequest } from 'next/server';

const sessionController = new SessionController();

export async function GET() {
  return await sessionController.getAll();
}

export async function POST(request: NextRequest) {
  return await sessionController.create(request);
}