import { QuestionController } from '@/server/controllers/questionController';
import { NextRequest } from 'next/server';

const questionController = new QuestionController();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await questionController.upvote(request, id);
}