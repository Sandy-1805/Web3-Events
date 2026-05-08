import { SpeakerController } from '@/server/controllers/speakerController';
import { NextRequest } from 'next/server';

const speakerController = new SpeakerController();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await speakerController.getById(request, id);  // ← getById, pas getSessions
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await speakerController.update(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await speakerController.delete(request, id);
}