import { db } from '@/lib/db/index';
import { sessions, questions, sessionSpeakers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { Session, CreateSessionDto } from '@/shared/types';

export class SessionService {
  async getAll(): Promise<Session[]> {
    const results = await db.select().from(sessions);
    return results.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      startTime: item.startTime,
      endTime: item.endTime,
      room: item.room,
      capacity: item.capacity,
      eventId: item.eventId,
      createdAt: item.createdAt ?? undefined,
    }));
  }

  async getByEventId(eventId: number): Promise<Session[]> {
    const results = await db
      .select()
      .from(sessions)
      .where(eq(sessions.eventId, eventId))
      .orderBy(sessions.startTime);

    return results.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      startTime: item.startTime,
      endTime: item.endTime,
      room: item.room,
      capacity: item.capacity,
      eventId: item.eventId,
      createdAt: item.createdAt ?? undefined,
    }));
  }

  async getById(id: number): Promise<Session | null> {
    const results = await db.select().from(sessions).where(eq(sessions.id, id));
    if (results.length === 0) return null;
    const item = results[0];
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      startTime: item.startTime,
      endTime: item.endTime,
      room: item.room,
      capacity: item.capacity,
      eventId: item.eventId,
      createdAt: item.createdAt ?? undefined,
    };
  }

  async create(data: CreateSessionDto): Promise<Session> {
    const [newSession] = await db.insert(sessions).values({
      title: data.title,
      description: data.description || null,
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room,
      capacity: data.capacity || null,
      eventId: data.eventId,
    }).returning();

    return {
      id: newSession.id,
      title: newSession.title,
      description: newSession.description,
      startTime: newSession.startTime,
      endTime: newSession.endTime,
      room: newSession.room,
      capacity: newSession.capacity,
      eventId: newSession.eventId,
      createdAt: newSession.createdAt ?? undefined,
    };
  }

  async update(id: number, data: Partial<CreateSessionDto>): Promise<Session | null> {
    const [updatedSession] = await db.update(sessions)
      .set({
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.endTime && { endTime: data.endTime }),
        ...(data.room && { room: data.room }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
      })
      .where(eq(sessions.id, id))
      .returning();

    if (!updatedSession) return null;

    return {
      id: updatedSession.id,
      title: updatedSession.title,
      description: updatedSession.description,
      startTime: updatedSession.startTime,
      endTime: updatedSession.endTime,
      room: updatedSession.room,
      capacity: updatedSession.capacity,
      eventId: updatedSession.eventId,
      createdAt: updatedSession.createdAt ?? undefined,
    };
  }

  async delete(id: number): Promise<boolean> {
    await db.delete(questions).where(eq(questions.sessionId, id));
    await db.delete(sessionSpeakers).where(eq(sessionSpeakers.sessionId, id));
    await db.delete(sessions).where(eq(sessions.id, id));
    return true;
  }
}