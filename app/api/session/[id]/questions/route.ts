import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { questions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Liste des questions d'une session
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionQuestions = await db.select()
      .from(questions)
      .where(eq(questions.sessionId, parseInt(params.id)))
      .orderBy(questions.upvotes);

    return NextResponse.json(sessionQuestions);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Poser une question
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { content, authorName } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'La question ne peut pas être vide' }, { status: 400 });
    }

    const [newQuestion] = await db.insert(questions).values({
      content,
      authorName: authorName || 'Anonyme',
      upvotes: 0,
      sessionId: parseInt(params.id),
    }).returning();

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi' }, { status: 500 });
  }
}