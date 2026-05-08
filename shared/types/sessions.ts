import type { Speaker } from './speakers';

export interface Session {
  id: number;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  room: string;
  capacity: number | null;
  eventId: number;
  createdAt?: Date | null;
}

export interface CreateSessionDto {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  room: string;
  capacity?: number;
  eventId: number;
}

export interface SessionWithSpeakers extends Session {
  speakers: Speaker[];
}