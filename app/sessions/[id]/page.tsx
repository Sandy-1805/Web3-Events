// app/sessions/[id]/page.tsx - Version complète
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

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

interface Event {
  id: number;
  title: string;
}

interface Reply {
  id: number;
  content: string;
  authorName: string;
  createdAt: string;
}

interface Question {
  id: number;
  content: string;
  authorName: string;
  upvotes: number;
  sessionId: number;
  createdAt: string;
  replies?: Reply[];
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLive, setIsLive] = useState(false);
  
  // Formulaire question
  const [newQuestion, setNewQuestion] = useState('');
  const [questionAuthor, setQuestionAuthor] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState('');
  
  // Formulaire réponse
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
      fetchQuestions();
    }
  }, [sessionId]);

  useEffect(() => {
    if (session) {
      checkIsLive();
      const interval = setInterval(checkIsLive, 60000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const checkIsLive = () => {
    if (!session) return;
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    setIsLive(now >= start && now <= end);
  };

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}`);
      if (!response.ok) throw new Error('Session non trouvée');
      const data = await response.json();
      setSession(data);
      
      const eventResponse = await fetch(`/api/events/${data.eventId}`);
      const eventData = await eventResponse.json();
      setEvent(eventData);
    } catch (err) {
      setError('Impossible de charger la session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      // Récupérer les questions
      const response = await fetch(`/api/questions/${sessionId}`);
      const questionsData = await response.json();
      
      // Récupérer les réponses pour chaque question
      const questionsWithReplies = await Promise.all(
        questionsData.map(async (q: Question) => {
          const repliesResponse = await fetch(`/api/questions/${q.id}/replies`);
          const replies = await repliesResponse.json();
          return { ...q, replies };
        })
      );
      
      setQuestions(questionsWithReplies.sort((a, b) => b.upvotes - a.upvotes));
    } catch (err) {
      console.error('Erreur chargement questions:', err);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionError('');
    
    if (!newQuestion.trim()) {
      setQuestionError('Veuillez écrire une question');
      return;
    }
    
    if (!isLive) {
      setQuestionError('Les questions ne sont disponibles que pendant la session en direct');
      return;
    }
    
    setSubmittingQuestion(true);
    
    try {
      const response = await fetch(`/api/questions/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newQuestion,
          authorName: questionAuthor.trim() || 'Anonyme',
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }
      
      setNewQuestion('');
      setQuestionAuthor('');
      fetchQuestions();
    } catch (err: any) {
      setQuestionError(err.message);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleUpvote = async (questionId: number) => {
    if (!isLive) return;
    
    try {
      const response = await fetch(`/api/questions/${questionId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        fetchQuestions();
      }
    } catch (err) {
      console.error('Erreur upvote:', err);
    }
  };

  const handleSubmitReply = async (questionId: number) => {
    if (!replyContent.trim()) return;
    if (!isLive) {
      alert('Vous ne pouvez répondre que pendant la session en direct');
      return;
    }
    
    setSubmittingReply(true);
    
    try {
      const response = await fetch(`/api/questions/${questionId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          authorName: replyAuthor.trim() || 'Anonyme',
        }),
      });
      
      if (response.ok) {
        setReplyContent('');
        setReplyAuthor('');
        setReplyingTo(null);
        fetchQuestions(); // Recharge les questions avec les réponses
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de l\'envoi de la réponse');
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12">
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12">
        <div className="text-center py-12">
          <p className="text-red-400">{error || 'Session non trouvée'}</p>
          <Link href="/events" className="mt-4 inline-block text-[#6366f1] hover:underline">
            ← Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Fil d'Ariane */}
        <div className="mb-6 text-sm text-gray-400">
          <Link href="/events" className="hover:text-[#6366f1]">Événements</Link>
          {' > '}
          {event && (
            <Link href={`/events/${event.id}`} className="hover:text-[#6366f1]">
              {event.title}
            </Link>
          )}
          {' > '}
          <span className="text-white">{session.title}</span>
        </div>

        {/* Informations de la session */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-white">{session.title}</h1>
            {isLive ? (
              <span className="bg-red-500/20 text-red-400 text-sm font-semibold px-3 py-1 rounded-full animate-pulse flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                EN DIRECT
              </span>
            ) : new Date(session.startTime) > new Date() ? (
              <span className="bg-blue-500/20 text-blue-400 text-sm font-semibold px-3 py-1 rounded-full">
                À VENIR
              </span>
            ) : (
              <span className="bg-gray-500/20 text-gray-400 text-sm font-semibold px-3 py-1 rounded-full">
                TERMINÉ
              </span>
            )}
          </div>
          
          {session.description && (
            <p className="text-gray-300 mb-6">{session.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
            <div className="flex items-center gap-2">📅 {formatDateTime(session.startTime)}</div>
            <div className="flex items-center gap-2">⏱️ Jusqu'au {formatDateTime(session.endTime)}</div>
            <div className="flex items-center gap-2">🚪 Salle : {session.room}</div>
            {session.capacity && <div className="flex items-center gap-2">👥 Capacité : {session.capacity} places</div>}
          </div>
        </div>

        {/* Section Questions/Réponses */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            💬 Questions des participants
            {questions.length > 0 && (
              <span className="text-sm bg-white/10 px-2 py-0.5 rounded-full text-gray-400">
                {questions.length}
              </span>
            )}
          </h2>
          
          {/* Formulaire de question */}
          {isLive ? (
            <form onSubmit={handleSubmitQuestion} className="mb-8">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Votre question *</label>
                <textarea
                  rows={3}
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Posez votre question à l'intervenant..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1]"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Votre nom (optionnel)</label>
                <input
                  type="text"
                  value={questionAuthor}
                  onChange={(e) => setQuestionAuthor(e.target.value)}
                  placeholder="Laissez vide pour rester anonyme"
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1]"
                />
              </div>
              
              {questionError && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                  {questionError}
                </div>
              )}
              
              <button
                type="submit"
                disabled={submittingQuestion}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
              >
                {submittingQuestion ? 'Envoi...' : '📤 Poser la question'}
              </button>
            </form>
          ) : new Date(session.startTime) > new Date() ? (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center mb-8">
              <p className="text-yellow-400">⏰ Les questions seront disponibles quand la session commencera.</p>
              <p className="text-gray-400 text-sm mt-1">Débute le {new Date(session.startTime).toLocaleString('fr-FR')}</p>
            </div>
          ) : (
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4 text-center mb-8">
              <p className="text-gray-400">📋 Cette session est terminée. Vous ne pouvez plus poser de questions.</p>
            </div>
          )}
          
          {/* Liste des questions avec réponses */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Questions ({questions.length})</h3>
            
            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Aucune question pour le moment.</p>
                {isLive && <p className="text-sm mt-2">Soyez le premier à poser une question !</p>}
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question) => (
                  <div key={question.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    {/* Question */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-[#a5b4fc]">
                            {question.authorName || 'Anonyme'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(question.createdAt)}
                          </span>
                        </div>
                        <p className="text-white">{question.content}</p>
                      </div>
                      <button
                        onClick={() => handleUpvote(question.id)}
                        disabled={!isLive}
                        className={`flex flex-col items-center px-3 py-1 rounded-lg transition ${
                          isLive ? 'hover:bg-white/10 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-xl">👍</span>
                        <span className="text-sm font-semibold text-white">{question.upvotes}</span>
                      </button>
                    </div>
                    
                    {/* Réponses existantes */}
                    {question.replies && question.replies.length > 0 && (
                      <div className="mt-4 ml-6 pl-4 border-l-2 border-white/20">
                        {question.replies.map((reply) => (
                          <div key={reply.id} className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-green-400">↳ Réponse</span>
                              <span className="text-xs font-medium text-[#a5b4fc]">
                                {reply.authorName || 'Anonyme'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Bouton répondre */}
                    {isLive && (
                      <div className="mt-3">
                        {replyingTo === question.id ? (
                          <div className="mt-3 ml-6">
                            <textarea
                              rows={2}
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Votre réponse..."
                              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#6366f1]"
                            />
                            <div className="flex gap-2 mt-2">
                              <input
                                type="text"
                                value={replyAuthor}
                                onChange={(e) => setReplyAuthor(e.target.value)}
                                placeholder="Votre nom (optionnel)"
                                className="flex-1 bg-white/10 border border-white/20 rounded-lg py-1 px-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#6366f1]"
                              />
                              <button
                                onClick={() => handleSubmitReply(question.id)}
                                disabled={submittingReply}
                                className="px-3 py-1 bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50 transition"
                              >
                                {submittingReply ? 'Envoi...' : 'Répondre'}
                              </button>
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyContent('');
                                  setReplyAuthor('');
                                }}
                                className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReplyingTo(question.id)}
                            className="text-sm text-[#6366f1] hover:text-[#a5b4fc] transition ml-6"
                          >
                            💬 Répondre
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}