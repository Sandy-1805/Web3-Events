import { EventController } from '@/server/controllers/eventController';
import { NextRequest } from 'next/server';

const eventController = new EventController();

export async function GET() {
  return await eventController.getAll();
}

export async function POST(request: NextRequest) {
  return await eventController.create(request);
}