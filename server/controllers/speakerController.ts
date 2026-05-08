import { SpeakerService } from '../services/speakerService';
import { verifyToken } from '../utils/jwt';
import { COOKIE_NAME } from '../utils/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const speakerService = new SpeakerService();

async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === 'admin';
}

export class SpeakerController {
  async getAll() {
    try {
      const speakers = await speakerService.getAll();
      return Response.json(speakers);
    } catch (error) {
      console.error('Get speakers error:', error);
      return Response.json(
        { error: 'Erreur lors de la récupération des intervenants' },
        { status: 500 }
      );
    }
  }

  async getById(request: NextRequest, id: string) {
    try {
      const speakerId = parseInt(id);
      if (isNaN(speakerId)) {
        return Response.json({ error: 'ID invalide' }, { status: 400 });
      }

      const speaker = await speakerService.getById(speakerId);
      if (!speaker) {
        return Response.json({ error: 'Intervenant non trouvé' }, { status: 404 });
      }

      return Response.json(speaker);
    } catch (error) {
      console.error('Get speaker error:', error);
      return Response.json(
        { error: 'Erreur lors de la récupération' },
        { status: 500 }
      );
    }
  }

  async getSessions(request: NextRequest, id: string) {
    try {
      const speakerId = parseInt(id);
      if (isNaN(speakerId)) {
        return Response.json({ error: 'ID invalide' }, { status: 400 });
      }

      const sessions = await speakerService.getSessions(speakerId);
      return Response.json(sessions);
    } catch (error) {
      console.error('Get speaker sessions error:', error);
      return Response.json(
        { error: 'Erreur lors de la récupération des sessions' },
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
      const { name, bio, photo, socialLinks } = body;

      if (!name) {
        return Response.json(
          { error: 'Le nom est requis' },
          { status: 400 }
        );
      }

      const newSpeaker = await speakerService.create({
        name,
        bio,
        photo,
        socialLinks,
      });

      return Response.json(newSpeaker, { status: 201 });
    } catch (error) {
      console.error('Create speaker error:', error);
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
      const speakerId = parseInt(id);
      if (isNaN(speakerId)) {
        return Response.json({ error: 'ID invalide' }, { status: 400 });
      }

      const body = await request.json();
      const { name, bio, photo, socialLinks } = body;

      const updatedSpeaker = await speakerService.update(speakerId, {
        name,
        bio,
        photo,
        socialLinks,
      });

      if (!updatedSpeaker) {
        return Response.json({ error: 'Intervenant non trouvé' }, { status: 404 });
      }

      return Response.json(updatedSpeaker);
    } catch (error) {
      console.error('Update speaker error:', error);
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
      const speakerId = parseInt(id);
      if (isNaN(speakerId)) {
        return Response.json({ error: 'ID invalide' }, { status: 400 });
      }

      await speakerService.delete(speakerId);
      return Response.json({ success: true });
    } catch (error) {
      console.error('Delete speaker error:', error);
      return Response.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }
  }
}