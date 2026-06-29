import { SpeakerController } from '@/server/controllers/speakerController';
import { NextRequest } from 'next/server';

const speakerController = new SpeakerController();

export async function GET() {
  return await speakerController.getAll();
}

export async function POST(request: NextRequest) {
  return await speakerController.create(request);
}