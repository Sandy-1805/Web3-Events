import { QuestionService } from '../services/questionService';
import { verifyToken } from '../utils/jwt';
import { COOKIE_NAME } from '../utils/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const questionService = new QuestionService();

async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === 'admin';
}

export class QuestionController {
  async getBySessionId(request: NextRequest, sessionId: string) {
    try {
      const id = parseInt(sessionId);
      if (isNaN(id)) {
        return Response.json({ error: 'ID de session invalide' }, { status: 400 });
      }

      const questions = await questionService.getBySessionId(id);
      // Tri par upvotes décroissant
      const sorted = questions.sort((a, b) => b.upvotes - a.upvotes);
      return Response.json(sorted);
    } catch (error) {
      console.error('Get questions error:', error);
      return Response.json(
        { error: 'Erreur lors de la récupération des questions' },
        { status: 500 }
      );
    }
  }

  async create(request: NextRequest, sessionId: string) {
    try {
      const id = parseInt(sessionId);
      if (isNaN(id)) {
        return Response.json({ error: 'ID de session invalide' }, { status: 400 });
      }

      // Vérifier si la session est en cours (live)
      const isLive = await questionService.isSessionLive(id);
      if (!isLive) {
        return Response.json(
          { error: 'Les questions ne sont acceptées que pendant les sessions en direct' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { content, authorName } = body;

      if (!content || content.trim() === '') {
        return Response.json(
          { error: 'La question ne peut pas être vide' },
          { status: 400 }
        );
      }

      const newQuestion = await questionService.create({
        content: content.trim(),
        authorName: authorName?.trim() || 'Anonyme',
        sessionId: id,
      });

      return Response.json(newQuestion, { status: 201 });
    } catch (error) {
      console.error('Create question error:', error);
      return Response.json(
        { error: 'Erreur lors de l\'envoi de la question' },
        { status: 500 }
      );
    }
  }

  async upvote(request: NextRequest, questionId: string) {
    try {
      const id = parseInt(questionId);
      if (isNaN(id)) {
        return Response.json({ error: 'ID de question invalide' }, { status: 400 });
      }

      const updatedQuestion = await questionService.upvote(id);
      if (!updatedQuestion) {
        return Response.json({ error: 'Question non trouvée' }, { status: 404 });
      }

      return Response.json(updatedQuestion);
    } catch (error) {
      console.error('Upvote question error:', error);
      return Response.json(
        { error: 'Erreur lors du vote' },
        { status: 500 }
      );
    }
  }

  async delete(request: NextRequest, questionId: string) {
    const admin = await isAdmin(request);
    if (!admin) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
      const id = parseInt(questionId);
      if (isNaN(id)) {
        return Response.json({ error: 'ID de question invalide' }, { status: 400 });
      }

      await questionService.delete(id);
      return Response.json({ success: true });
    } catch (error) {
      console.error('Delete question error:', error);
      return Response.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }
  }
}