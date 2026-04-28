// app/api/questions/[id]/replies/route.ts
import { NextResponse } from 'next/server';

// Stockage temporaire des réponses (en mémoire)
// ⚠️ Ceci sera perdu au redémarrage du serveur
// Pour une vraie app, utilisez une table séparée "replies"
let repliesStore: { [questionId: number]: Array<{
  id: number;
  content: string;
  authorName: string;
  createdAt: string;
}> } = {};

let replyIdCounter = 1;

// GET - Récupérer les réponses d'une question
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questionId = parseInt(id);
    const replies = repliesStore[questionId] || [];
    return NextResponse.json(replies);
  } catch (error) {
    console.error('Erreur GET replies:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Ajouter une réponse à une question
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questionId = parseInt(id);
    const body = await request.json();
    const { content, authorName } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'La réponse ne peut pas être vide' }, { status: 400 });
    }

    if (!repliesStore[questionId]) {
      repliesStore[questionId] = [];
    }

    const newReply = {
      id: replyIdCounter++,
      content,
      authorName: authorName || 'Anonyme',
      createdAt: new Date().toISOString(),
    };

    repliesStore[questionId].push(newReply);

    return NextResponse.json(newReply, { status: 201 });
  } catch (error) {
    console.error('Erreur POST reply:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'ajout de la réponse' }, { status: 500 });
  }
}