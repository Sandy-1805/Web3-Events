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
    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'ID de session invalide' }, { status: 400 });
    }

    const sessionQuestions = await db.select()
      .from(questions)
      .where(eq(questions.sessionId, sessionId))
      .orderBy(questions.upvotes);

    // Inverser l'ordre pour avoir les plus votés en premier
    const sortedQuestions = sessionQuestions.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));

    return NextResponse.json(sortedQuestions);
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
    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'ID de session invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { content, authorName } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'La question ne peut pas être vide' }, { status: 400 });
    }

    const [newQuestion] = await db.insert(questions).values({
      content: content.trim(),
      authorName: authorName?.trim() || 'Anonyme',
      upvotes: 0,
      sessionId: sessionId,
    }).returning();

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Erreur POST question:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de la question' }, { status: 500 });
  }
}