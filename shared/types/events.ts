// shared/types/events.ts
export interface Event {
  id: number;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  location: string | null;
  createdAt?: Date | null;  // ← Modifier: permettre null
}

export interface CreateEventDto {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}