import { db } from '@/lib/db/index';
import { events } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { Event, CreateEventDto, UpdateEventDto } from '@/shared/types';

export class EventService {
  async getAll(): Promise<Event[]> {
    const results = await db.select().from(events);
    return results.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location,
      createdAt: item.createdAt ?? undefined,
    }));
  }

  async getById(id: number): Promise<Event | null> {
    const results = await db.select().from(events).where(eq(events.id, id));
    if (results.length === 0) return null;
    const item = results[0];
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location,
      createdAt: item.createdAt ?? undefined,
    };
  }

  async create(data: CreateEventDto): Promise<Event> {
    const [newEvent] = await db.insert(events).values({
      title: data.title,
      description: data.description || null,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location || null,
    }).returning();

    return {
      id: newEvent.id,
      title: newEvent.title,
      description: newEvent.description,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      location: newEvent.location,
      createdAt: newEvent.createdAt ?? undefined,
    };
  }

  async update(id: number, data: UpdateEventDto): Promise<Event | null> {
    const [updatedEvent] = await db.update(events)
      .set({
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate }),
        ...(data.location !== undefined && { location: data.location }),
      })
      .where(eq(events.id, id))
      .returning();

    if (!updatedEvent) return null;

    return {
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      startDate: updatedEvent.startDate,
      endDate: updatedEvent.endDate,
      location: updatedEvent.location,
      createdAt: updatedEvent.createdAt ?? undefined,
    };
  }

  async delete(id: number): Promise<boolean> {
    await db.delete(events).where(eq(events.id, id));
    return true;
  }
}