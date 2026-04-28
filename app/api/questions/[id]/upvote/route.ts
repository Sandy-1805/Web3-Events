// app/api/questions/[id]/upvote/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { questions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST - Upvoter une question
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questionId = parseInt(id);
    
    const question = await db.select().from(questions).where(eq(questions.id, questionId));
    
    if (question.length === 0) {
      return NextResponse.json({ error: 'Question non trouvée' }, { status: 404 });
    }
    
    const [updatedQuestion] = await db.update(questions)
      .set({ upvotes: (question[0].upvotes || 0) + 1 })
      .where(eq(questions.id, questionId))
      .returning();
    
    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Erreur upvote:', error);
    return NextResponse.json({ error: 'Erreur lors du vote' }, { status: 500 });
  }
}