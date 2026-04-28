// app/api/questions/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { questions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Liste des questions d'une session
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionQuestions = await db.select()
      .from(questions)
      .where(eq(questions.sessionId, parseInt(id)))
      .orderBy(questions.upvotes);
    
    return NextResponse.json(sessionQuestions);
  } catch (error) {
    console.error('Erreur GET questions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Poser une question
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, authorName } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'La question ne peut pas être vide' }, { status: 400 });
    }

    const [newQuestion] = await db.insert(questions).values({
      content,
      authorName: authorName || 'Anonyme',
      upvotes: 0,
      sessionId: parseInt(id),
    }).returning();

    return NextResponse.json({ ...newQuestion, replies: [] }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST question:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi' }, { status: 500 });
  }
}