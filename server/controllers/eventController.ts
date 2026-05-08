import { EventService } from '../services/eventService';
import { verifyToken } from '../utils/jwt';
import { COOKIE_NAME } from '../utils/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const eventService = new EventService();

async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === 'admin';
}

export class EventController {
  async getAll() {
    try {
      const events = await eventService.getAll();
      return Response.json(events);
    } catch (error) {
      console.error('Get events error:', error);
      return Response.json(
        { error: 'Erreur lors de la récupération des événements' },
        { status: 500 }
      );
    }
  }

  async getById(request: NextRequest, id: string) {
    try {
      const eventId = parseInt(id);
      if (isNaN(eventId)) {
        return Response.json({ error: 'ID invalide' }, { status: 400 });
      }

      const event = await eventService.getById(eventId);
      if (!event) {
        return Response.json({ error: 'Événement non trouvé' }, { status: 404 });
      }

      return Response.json(event);
    } catch (error) {
      console.error('Get event error:', error);
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
      const { title, description, startDate, endDate, location } = body;

      if (!title || !startDate || !endDate) {
        return Response.json(
          { error: 'Titre, date début et date fin sont requis' },
          { status: 400 }
        );
      }

      const newEvent = await eventService.create({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
      });

      return Response.json(newEvent, { status: 201 });
    } catch (error) {
      console.error('Create event error:', error);
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
      const eventId = parseInt(id);
      if (isNaN(eventId)) {
        return Response.json({ error: 'ID invalide' }, { status: 400 });
      }

      const body = await request.json();
      const { title, description, startDate, endDate, location } = body;

      const updatedEvent = await eventService.update(eventId, {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        location,
      });

      if (!updatedEvent) {
        return Response.json({ error: 'Événement non trouvé' }, { status: 404 });
      }

      return Response.json(updatedEvent);
    } catch (error) {
      console.error('Update event error:', error);
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
      const eventId = parseInt(id);
      if (isNaN(eventId)) {
        return Response.json({ error: 'ID invalide' }, { status: 400 });
      }

      await eventService.delete(eventId);
      return Response.json({ success: true });
    } catch (error) {
      console.error('Delete event error:', error);
      return Response.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }
  }
}