import { db } from '@/lib/db/index';
import { speakers, sessions, sessionSpeakers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { Speaker, CreateSpeakerDto } from '@/shared/types';

export class SpeakerService {
  async getAll(): Promise<Speaker[]> {
    const results = await db.select().from(speakers);
    return results.map((item) => ({
      id: item.id,
      name: item.name,
      photo: item.photo,
      bio: item.bio,
      socialLinks: item.socialLinks,
      createdAt: item.createdAt ?? undefined,
    }));
  }

  async getById(id: number): Promise<Speaker | null> {
    const results = await db.select().from(speakers).where(eq(speakers.id, id));
    if (results.length === 0) return null;
    const item = results[0];
    return {
      id: item.id,
      name: item.name,
      photo: item.photo,
      bio: item.bio,
      socialLinks: item.socialLinks,
      createdAt: item.createdAt ?? undefined,
    };
  }

  async getSessions(speakerId: number): Promise<any[]> {
    return await db
      .select({
        id: sessions.id,
        title: sessions.title,
        description: sessions.description,
        startTime: sessions.startTime,
        endTime: sessions.endTime,
        room: sessions.room,
        capacity: sessions.capacity,
        eventId: sessions.eventId,
      })
      .from(sessionSpeakers)
      .innerJoin(sessions, eq(sessionSpeakers.sessionId, sessions.id))
      .where(eq(sessionSpeakers.speakerId, speakerId))
      .orderBy(sessions.startTime);
  }

  async create(data: CreateSpeakerDto): Promise<Speaker> {
    const [newSpeaker] = await db.insert(speakers).values({
      name: data.name,
      bio: data.bio || null,
      photo: data.photo || null,
      socialLinks: data.socialLinks || null,
    }).returning();

    return {
      id: newSpeaker.id,
      name: newSpeaker.name,
      photo: newSpeaker.photo,
      bio: newSpeaker.bio,
      socialLinks: newSpeaker.socialLinks,
      createdAt: newSpeaker.createdAt ?? undefined,
    };
  }

  async update(id: number, data: Partial<CreateSpeakerDto>): Promise<Speaker | null> {
    const [updatedSpeaker] = await db.update(speakers)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.photo !== undefined && { photo: data.photo }),
        ...(data.socialLinks !== undefined && { socialLinks: data.socialLinks }),
      })
      .where(eq(speakers.id, id))
      .returning();

    if (!updatedSpeaker) return null;

    return {
      id: updatedSpeaker.id,
      name: updatedSpeaker.name,
      photo: updatedSpeaker.photo,
      bio: updatedSpeaker.bio,
      socialLinks: updatedSpeaker.socialLinks,
      createdAt: updatedSpeaker.createdAt ?? undefined,
    };
  }

  async delete(id: number): Promise<boolean> {
    await db.delete(sessionSpeakers).where(eq(sessionSpeakers.speakerId, id));
    await db.delete(speakers).where(eq(speakers.id, id));
    return true;
  }
}