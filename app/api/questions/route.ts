import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { questions } from '@/lib/db/schema';

export async function GET() {
  try {
    const allQuestions = await db.select().from(questions);
    return NextResponse.json(allQuestions);
  } catch (error) {
    console.error('Erreur GET questions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}