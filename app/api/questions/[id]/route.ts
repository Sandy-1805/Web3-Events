import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { questions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Récupérer une question spécifique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questionId = parseInt(id);

    if (isNaN(questionId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const question = await db.select().from(questions).where(eq(questions.id, questionId));

    if (question.length === 0) {
      return NextResponse.json({ error: 'Question non trouvée' }, { status: 404 });
    }

    return NextResponse.json(question[0]);
  } catch (error) {
    console.error('Erreur GET question:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une question (admin uniquement)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questionId = parseInt(id);

    if (isNaN(questionId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    // Vérifier si la question existe
    const existingQuestion = await db.select().from(questions).where(eq(questions.id, questionId));

    if (existingQuestion.length === 0) {
      return NextResponse.json({ error: 'Question non trouvée' }, { status: 404 });
    }

    // Supprimer la question
    await db.delete(questions).where(eq(questions.id, questionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE question:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}