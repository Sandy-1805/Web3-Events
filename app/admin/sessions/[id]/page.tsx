// app/sessions/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

// Interface Speaker
interface Speaker {
  id: number;
  name: string;
  bio: string;
  photo: string;
  socialLinks: string;
}

interface Session {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  room: string;
  capacity: number | null;
  eventId: number;
}

interface Question {
  id: number;
  content: string;
  authorName: string;
  upvotes: number;
  createdAt: string;
  sessionId: number;
}

export default function SessionDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voting, setVoting] = useState<number | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
      fetchQuestions();
      fetchSpeakers();
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}`);
      if (!response.ok) throw new Error('Session non trouvée');
      const data = await response.json();
      setSession(data);
    } catch (err) {
      setError('Impossible de charger la session');
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/questions/${sessionId}`);
      const data = await response.json();
      setQuestions(data.sort((a: Question, b: Question) => b.upvotes - a.upvotes));
    } catch (err) {
      console.error('Erreur chargement questions:', err);
    }
  };

  const fetchSpeakers = async () => {
    try {
      const response = await fetch(`/api/session-speakers?sessionId=${sessionId}`);
      const data = await response.json();
      setSpeakers(data);
    } catch (err) {
      console.error('Erreur chargement speakers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/questions/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newQuestion,
          authorName: authorName.trim() || 'Anonyme',
        }),
      });

      if (response.ok) {
        setNewQuestion('');
        fetchQuestions();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (questionId: number) => {
    setVoting(questionId);
    try {
      const response = await fetch(`/api/questions/${questionId}/upvote`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchQuestions();
      }
    } catch (error) {
      console.error('Erreur vote:', error);
    } finally {
      setVoting(null);
    }
  };

  const isLive = () => {
    if (!session) return false;
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    return now >= start && now <= end;
  };

  const getTimeAgo = (date: string) => {
    const diffSeconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    const absDiff = Math.abs(diffSeconds);

    if (absDiff < 60) return diffSeconds < 0 ? "dans quelques secondes" : "à l'instant";
    if (absDiff < 3600) {
      const mins = Math.floor(absDiff / 60);
      return diffSeconds < 0 ? `dans ${mins} min` : `il y a ${mins} min`;
    }
    if (absDiff < 86400) {
      const hours = Math.floor(absDiff / 3600);
      return diffSeconds < 0 ? `dans ${hours}h` : `il y a ${hours}h`;
    }
    const days = Math.floor(absDiff / 86400);
    return diffSeconds < 0 ? `dans ${days}j` : `il y a ${days}j`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12">
        <div className="text-center text-gray-400">Chargement de la session...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12">
        <div className="text-center">
          <p className="text-red-400">{error || 'Session non trouvée'}</p>
          <Link href="/events" className="mt-4 inline-block text-[#6366f1] hover:underline">
            ← Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  const live = isLive();

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href={`/events/${session.eventId}`} className="text-[#6366f1] hover:underline">
            ← Retour à l'événement
          </Link>
        </div>

        {/* Infos session */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-white">{session.title}</h1>
            {live && (
              <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
                🔴 LIVE
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-gray-400">
            <span>📅 {new Date(session.startTime).toLocaleString('fr-FR')}</span>
            <span>🚪 {session.room}</span>
            {session.capacity && <span>👥 {session.capacity} places</span>}
          </div>
          {session.description && <p className="text-gray-300 mt-4">{session.description}</p>}
          
          {/* Speakers - AJOUTÉ */}
          {speakers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-gray-400 mb-2">🎤 Intervenants</h3>
              <div className="flex flex-wrap gap-2">
                {speakers.map((speaker) => (
                  <Link
                    key={speaker.id}
                    href={`/speakers/${speaker.id}`}
                    className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-sm text-[#a5b4fc] hover:bg-white/10 transition"
                  >
                    {speaker.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Q&R - seulement en LIVE */}
        {live ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">💬 Poser une question</h2>
                <form onSubmit={handleSubmitQuestion} className="space-y-4">
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Votre nom (optionnel)"
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white"
                  />
                  <textarea
                    rows={4}
                    required
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Votre question..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white py-2 rounded-lg"
                  >
                    {submitting ? 'Envoi...' : '📤 Envoyer'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-white mb-4">📢 Questions ({questions.length})</h2>
              {questions.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-gray-400">
                  Aucune question pour l'instant
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-sm font-medium text-[#a5b4fc]">{q.authorName}</span>
                            <span className="text-xs text-gray-500">• {getTimeAgo(q.createdAt)}</span>
                            {idx === 0 && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">🔥 Top</span>}
                          </div>
                          <p className="text-white">{q.content}</p>
                        </div>
                        <button
                          onClick={() => handleUpvote(q.id)}
                          disabled={voting === q.id}
                          className="flex flex-col items-center px-3 py-2 bg-white/10 rounded-lg min-w-[60px]"
                        >
                          <span className="text-lg">👍</span>
                          <span className="text-sm font-bold text-white">{q.upvotes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <p className="text-gray-400">Cette session n'est pas en direct. Revenez pendant la session pour participer au Q&R !</p>
          </div>
        )}
      </div>
    </div>
  );
}