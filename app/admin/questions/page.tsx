'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Question {
  id: number;
  content: string;
  authorName: string;
  upvotes: number;
  sessionId: number;
  createdAt: string;
}

export default function AdminQuestionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') fetchQuestions();
  }, [user]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuestion = async (id: number) => {
    if (!confirm('Supprimer cette question ?')) return;
    try {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (res.ok) setQuestions(questions.filter(q => q.id !== id));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div style={{ color: 'var(--es-text-3)' }}>Chargement...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Lien retour */}
        <div className="mb-6">
          <Link href="/admin" style={{ color: 'var(--es-accent)', fontSize: '0.875rem' }}>
            ← Retour au tableau de bord
          </Link>
        </div>

        <h1 className="es-page-title mb-6">💬 Gestion des questions</h1>

        {questions.length === 0 ? (
          <div className="es-card p-12 text-center">
            <p style={{ color: 'var(--es-text-2)' }}>Aucune question posée pour le moment</p>
          </div>
        ) : (
          <div className="es-table-container">
            <table className="es-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Auteur</th>
                  <th>Votes</th>
                  <th>Session</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id}>
                    <td>{q.content}</td>
                    <td style={{ color: 'var(--es-text-2)' }}>{q.authorName || 'Anonyme'}</td>
                    <td style={{ color: 'var(--es-text-2)' }}>👍 {q.upvotes}</td>
                    <td style={{ color: 'var(--es-text-2)' }}>Session #{q.sessionId}</td>
                    <td>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        style={{ color: 'var(--es-live)', fontSize: '0.875rem' }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
