import { db } from '@/lib/db/index';
import { questions, sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { Question, CreateQuestionDto } from '@/shared/types';

export class QuestionService {
  async getBySessionId(sessionId: number): Promise<Question[]> {
    const results = await db
      .select()
      .from(questions)
      .where(eq(questions.sessionId, sessionId));

    return results.map((item) => ({
      id: item.id,
      content: item.content,
      authorName: item.authorName,
      upvotes: item.upvotes ?? 0,
      sessionId: item.sessionId,
      createdAt: item.createdAt ?? null,
    }));
  }

  async isSessionLive(sessionId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId));

    if (result.length === 0) return false;

    const session = result[0];
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    return now >= start && now <= end;
  }

  async create(data: CreateQuestionDto): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values({
      content: data.content,
      authorName: data.authorName || 'Anonyme',
      upvotes: 0,
      sessionId: data.sessionId,
    }).returning();

    return {
      id: newQuestion.id,
      content: newQuestion.content,
      authorName: newQuestion.authorName,
      upvotes: newQuestion.upvotes ?? 0,
      sessionId: newQuestion.sessionId,
      createdAt: newQuestion.createdAt ?? null,
    };
  }

  async upvote(id: number): Promise<Question | null> {
    const question = await db.select().from(questions).where(eq(questions.id, id));
    if (question.length === 0) return null;

    const [updatedQuestion] = await db.update(questions)
      .set({ upvotes: (question[0].upvotes || 0) + 1 })
      .where(eq(questions.id, id))
      .returning();

    if (!updatedQuestion) return null;

    return {
      id: updatedQuestion.id,
      content: updatedQuestion.content,
      authorName: updatedQuestion.authorName,
      upvotes: updatedQuestion.upvotes ?? 0,
      sessionId: updatedQuestion.sessionId,
      createdAt: updatedQuestion.createdAt ?? null,
    };
  }

  async delete(id: number): Promise<boolean> {
    await db.delete(questions).where(eq(questions.id, id));
    return true;
  }
}