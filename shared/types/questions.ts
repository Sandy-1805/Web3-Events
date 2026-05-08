export interface Question {
  id: number;
  content: string;
  authorName: string | null;
  upvotes: number;
  sessionId: number;
  createdAt: Date | null;
}

export interface CreateQuestionDto {
  content: string;
  authorName?: string;
  sessionId: number;
}