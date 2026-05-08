import { SessionController } from '@/server/controllers/sessionController';
import { NextRequest } from 'next/server';

const sessionController = new SessionController();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await sessionController.getByEventId(request, id);
}