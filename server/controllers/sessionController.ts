import { SessionService } from '../services/sessionService';
import { verifyToken } from '../utils/jwt';
import { COOKIE_NAME } from '../utils/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const sessionService = new SessionService();

async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === 'admin';
}

export class SessionController {
  async getByEventId(request: NextRequest, eventId: string) {
    try {
      const id = parseInt(eventId);
      if (isNaN(id)) {
        return Response.json({ error: 'ID invalide' }, { status: 400 });
      }

      const sessions = await sessionService.getByEventId(id);
      return Response.json(sessions);
    } catch (error) {
      console.error('Get sessions by event error:', error);
      return Response.json(
        { error: 'Erreur lors de la récupération' },
        { status: 500 }
      );
    }
  }

  async getAll() {
      try {
        const sessions = await sessionService.getAll();
        return Response.json(sessions);
      } catch (error) {
        console.error('Get all sessions error:', error);
        return Response.json(
          { error: 'Erreur lors de la récupération des sessions' },
          { status: 500 }
        );
      }
    }

  async getById(request: NextRequest, id: string) {
    try {
      const sessionId = parseInt(id);
      if (isNaN(sessionId)) {
        return Response.json({ error: 'ID invalide' }, { status: 400 });
      }

      const session = await sessionService.getById(sessionId);
      if (!session) {
        return Response.json({ error: 'Session non trouvée' }, { status: 404 });
      }

      return Response.json(session);
    } catch (error) {
      console.error('Get session error:', error);
      return Response.json(
        { error: 'Erreur lors de la récupération' },
        { status: 500 }
      );
    }
  }

  async create(request: NextRequest) {
    const admin = await isAdmin(request);
    if (!admin) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
      const body = await request.json();
      const { title, description, startTime, endTime, room, capacity, eventId } = body;

      if (!title || !startTime || !endTime || !room || !eventId) {
        return Response.json(
          { error: 'Tous les champs obligatoires sont requis' },
          { status: 400 }
        );
      }

      const newSession = await sessionService.create({
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        room,
        capacity,
        eventId,
      });

      return Response.json(newSession, { status: 201 });
    } catch (error) {
      console.error('Create session error:', error);
      return Response.json(
        { error: 'Erreur lors de la création' },
        { status: 500 }
      );
    }
  }

  async update(request: NextRequest, id: string) {
    const admin = await isAdmin(request);
    if (!admin) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
      const sessionId = parseInt(id);
      if (isNaN(sessionId)) {
        return Response.json({ error: 'ID invalide' }, { status: 400 });
      }

      const body = await request.json();
      const { title, description, startTime, endTime, room, capacity, eventId } = body;

      const updatedSession = await sessionService.update(sessionId, {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        room,
        capacity,
        eventId,
      });

      if (!updatedSession) {
        return Response.json({ error: 'Session non trouvée' }, { status: 404 });
      }

      return Response.json(updatedSession);
    } catch (error) {
      console.error('Update session error:', error);
      return Response.json(
        { error: 'Erreur lors de la modification' },
        { status: 500 }
      );
    }
  }

  async delete(request: NextRequest, id: string) {
    const admin = await isAdmin(request);
    if (!admin) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
      const sessionId = parseInt(id);
      if (isNaN(sessionId)) {
        return Response.json({ error: 'ID invalide' }, { status: 400 });
      }

      await sessionService.delete(sessionId);
      return Response.json({ success: true });
    } catch (error) {
      console.error('Delete session error:', error);
      return Response.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }
  }
}