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
    if (user?.role === 'admin') {
      fetchQuestions();
    }
  }, [user]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();
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
      const response = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setQuestions(questions.filter(q => q.id !== id));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/admin" className="text-[#6366f1] hover:underline">
            ← Retour au tableau de bord
          </Link>
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-6">
          💬 Gestion des questions
        </h1>

        {questions.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <p className="text-gray-400">Aucune question posée pour le moment</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-medium">Question</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Auteur</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Votes</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Session</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-white/5 transition">
                    <td className="p-4 text-white">{q.content}</td>
                    <td className="p-4 text-gray-400">{q.authorName || 'Anonyme'}</td>
                    <td className="p-4 text-gray-400">👍 {q.upvotes}</td>
                    <td className="p-4 text-gray-400">Session #{q.sessionId}</td>
                    <td className="p-4">
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="text-red-400 hover:text-red-300 transition"
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