import { SpeakerController } from '@/server/controllers/speakerController';
import { NextRequest } from 'next/server';

const speakerController = new SpeakerController();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await speakerController.getSessions(request, id);
}