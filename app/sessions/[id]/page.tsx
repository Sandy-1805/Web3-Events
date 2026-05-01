'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface Session {
  id: number; title: string; description: string;
  startTime: string; endTime: string; room: string;
  capacity: number | null; eventId: number;
}

interface Question {
  id: number; content: string; authorName: string;
  upvotes: number; createdAt: string; sessionId: number;
}

export default function SessionDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voting, setVoting] = useState<number | null>(null);

  useEffect(() => {
    if (sessionId) { fetchSession(); fetchQuestions(); }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}`);
      if (!response.ok) throw new Error('Session non trouvée');
      const data = await response.json();
      setSession(data);
    } catch (err) {
      setError('Impossible de charger la session');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/questions`);
      const data = await response.json();
      setQuestions(data.sort((a: Question, b: Question) => b.upvotes - a.upvotes));
    } catch (err) { console.error('Erreur chargement questions:', err); }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/questions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newQuestion, authorName: authorName.trim() || 'Anonyme' }),
      });
      if (response.ok) { setNewQuestion(''); fetchQuestions(); }
      else { const data = await response.json(); alert(data.error || "Erreur lors de l'envoi"); }
    } catch { alert('Erreur de connexion'); }
    finally { setSubmitting(false); }
  };

  const handleUpvote = async (questionId: number) => {
    setVoting(questionId);
    try {
      const response = await fetch(`/api/questions/${questionId}/upvote`, { method: 'POST' });
      if (response.ok) fetchQuestions();
    } catch (error) { console.error('Erreur vote:', error); }
    finally { setVoting(null); }
  };

  const isLive = () => {
    if (!session) return false;
    const now = new Date();
    return now >= new Date(session.startTime) && now <= new Date(session.endTime);
  };

  const getTimeAgo = (date: string) => {
    const diffSeconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    const absDiff = Math.abs(diffSeconds);
    if (absDiff < 60) return diffSeconds < 0 ? "dans quelques secondes" : "à l'instant";
    if (absDiff < 3600) { const m = Math.floor(absDiff/60); return diffSeconds < 0 ? `dans ${m} min` : `il y a ${m} min`; }
    if (absDiff < 86400) { const h = Math.floor(absDiff/3600); return diffSeconds < 0 ? `dans ${h}h` : `il y a ${h}h`; }
    const d = Math.floor(absDiff/86400); return diffSeconds < 0 ? `dans ${d}j` : `il y a ${d}j`;
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'var(--es-bg-1)', padding:'3rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'var(--es-text-2)' }}>Chargement de la session...</div>
    </div>
  );

  if (error || !session) return (
    <div style={{ minHeight:'100vh', background:'var(--es-bg-1)', padding:'3rem', textAlign:'center' }}>
      <p style={{ color:'var(--es-live)' }}>{error || 'Session non trouvée'}</p>
      <Link href="/events" style={{ marginTop:'1rem', display:'inline-block', color:'var(--es-accent)' }}>← Retour aux événements</Link>
    </div>
  );

  const live = isLive();

  return (
    <>
      <style>{`
        .sd-page { min-height:100vh; background:var(--es-bg-1); padding:2rem 0; transition:background 0.25s ease; }
        .sd-container { max-width:1280px; margin:0 auto; padding:0 1.5rem; }
        .sd-back { color:var(--es-accent); text-decoration:none; display:inline-block; margin-bottom:1.5rem; }
        .sd-back:hover { opacity:0.8; }
        /* Carte info session */
        .sd-info-card { background:var(--es-surface); border:1px solid var(--es-border); border-radius:0.75rem; padding:1.5rem; margin-bottom:2rem; }
        .sd-info-top { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-bottom:1rem; }
        .sd-title { font-size:1.8rem; font-weight:800; color:var(--es-text-1); margin:0; }
        .sd-live-badge { background:rgba(244,63,94,0.15); color:#fb7185; font-size:0.75rem; font-weight:700; padding:0.25rem 0.75rem; border-radius:100px; animation:sd-pulse 1.5s ease-in-out infinite; }
        @keyframes sd-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .sd-meta { display:flex; flex-wrap:wrap; gap:1rem; color:var(--es-text-2); }
        .sd-desc { color:var(--es-text-2); margin-top:1rem; line-height:1.6; }
        /* Zone Q&R */
        .sd-qa-grid { display:grid; grid-template-columns:1fr 2fr; gap:2rem; }
        @media(max-width:768px) { .sd-qa-grid { grid-template-columns:1fr; } }
        .sd-qa-card { background:var(--es-surface); border:1px solid var(--es-border); border-radius:0.75rem; padding:1.5rem; }
        .sd-qa-title { font-size:1.15rem; font-weight:700; color:var(--es-text-1); margin-bottom:1rem; }
        .sd-form-input, .sd-form-textarea {
          width:100%; background:var(--es-input-bg); border:1px solid var(--es-border);
          border-radius:0.5rem; padding:0.5rem 0.75rem; color:var(--es-text-1);
          outline:none; transition:border-color 0.2s; box-sizing:border-box; margin-bottom:0.75rem;
        }
        .sd-form-input::placeholder, .sd-form-textarea::placeholder { color:var(--es-text-3); }
        .sd-form-input:focus, .sd-form-textarea:focus { border-color:var(--es-accent); }
        .sd-form-textarea { resize:vertical; }
        .sd-submit-btn { width:100%; background:linear-gradient(135deg,var(--es-accent),#8b5cf6); color:#fff; padding:0.6rem 1rem; border-radius:0.5rem; border:none; cursor:pointer; font-weight:600; transition:opacity 0.2s; }
        .sd-submit-btn:hover:not(:disabled) { opacity:0.85; }
        .sd-submit-btn:disabled { opacity:0.5; cursor:not-allowed; }
        /* Questions */
        .sd-q-list { display:flex; flex-direction:column; gap:1rem; }
        .sd-q-item { background:var(--es-surface); border:1px solid var(--es-border); border-radius:0.75rem; padding:1.25rem; }
        .sd-q-inner { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; }
        .sd-q-meta { display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.5rem; }
        .sd-q-author { font-size:0.875rem; font-weight:600; color:var(--es-accent); }
        .sd-q-time { font-size:0.75rem; color:var(--es-text-3); }
        .sd-q-top-badge { font-size:0.7rem; background:rgba(245,158,11,0.15); color:#fbbf24; padding:0.1rem 0.5rem; border-radius:100px; }
        .sd-q-content { color:var(--es-text-1); }
        .sd-upvote-btn { display:flex; flex-direction:column; align-items:center; padding:0.5rem 0.75rem; background:var(--es-surface-hover); border:1px solid var(--es-border); border-radius:0.5rem; cursor:pointer; min-width:3.5rem; transition:background 0.2s; }
        .sd-upvote-btn:hover:not(:disabled) { border-color:var(--es-accent); }
        .sd-upvote-count { font-size:0.875rem; font-weight:700; color:var(--es-text-1); margin-top:0.15rem; }
        .sd-not-live { background:var(--es-surface); border:1px solid var(--es-border); border-radius:0.75rem; padding:3rem; text-align:center; }
        .sd-not-live p { color:var(--es-text-2); }
      `}</style>

      <div className="sd-page">
        <div className="sd-container">
          <Link href={`/events/${session.eventId}`} className="sd-back">← Retour à l'événement</Link>

          <div className="sd-info-card">
            <div className="sd-info-top">
              <h1 className="sd-title">{session.title}</h1>
              {live && <span className="sd-live-badge">🔴 LIVE</span>}
            </div>
            <div className="sd-meta">
              <span>📅 {new Date(session.startTime).toLocaleString('fr-FR')}</span>
              <span>🚪 {session.room}</span>
              {session.capacity && <span>👥 {session.capacity} places</span>}
            </div>
            {session.description && <p className="sd-desc">{session.description}</p>}
          </div>

          {live ? (
            <div className="sd-qa-grid">
              <div>
                <div className="sd-qa-card">
                  <h2 className="sd-qa-title">💬 Poser une question</h2>
                  <form onSubmit={handleSubmitQuestion}>
                    <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Votre nom (optionnel)" className="sd-form-input" />
                    <textarea rows={4} required value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Votre question..." className="sd-form-input sd-form-textarea" />
                    <button type="submit" disabled={submitting} className="sd-submit-btn">
                      {submitting ? 'Envoi...' : '📤 Envoyer'}
                    </button>
                  </form>
                </div>
              </div>

              <div>
                <h2 className="sd-qa-title" style={{ color:'var(--es-text-1)' }}>📢 Questions ({questions.length})</h2>
                {questions.length === 0 ? (
                  <div className="sd-not-live"><p>Aucune question pour l'instant</p></div>
                ) : (
                  <div className="sd-q-list">
                    {questions.map((q, idx) => (
                      <div key={q.id} className="sd-q-item">
                        <div className="sd-q-inner">
                          <div style={{ flex:1 }}>
                            <div className="sd-q-meta">
                              <span className="sd-q-author">{q.authorName}</span>
                              <span className="sd-q-time">• {getTimeAgo(q.createdAt)}</span>
                              {idx === 0 && <span className="sd-q-top-badge">🔥 Top</span>}
                            </div>
                            <p className="sd-q-content">{q.content}</p>
                          </div>
                          <button onClick={() => handleUpvote(q.id)} disabled={voting === q.id} className="sd-upvote-btn">
                            <span>👍</span>
                            <span className="sd-upvote-count">{q.upvotes}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="sd-not-live">
              <p>Cette session n'est pas en direct. Revenez pendant la session pour participer au Q&R !</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
