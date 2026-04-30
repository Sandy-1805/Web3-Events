'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Speaker {
    id: number;
    name: string;
    photo: string | null;
    bio: string | null;
    socialLinks: string | null;
}

interface Session {
    id: number;
    title: string;
    description: string | null;
    startTime: Date;
    endTime: Date;
    room: string;
    capacity: number | null;
    eventId: number;
    speakers: Speaker[];
}

interface PlanningGridProps {
    sessions: Session[];
    rooms: string[];
    eventId: number;
}

function isLive(session: Session): boolean {
    const now = new Date();
    return now >= new Date(session.startTime) && now <= new Date(session.endTime);
}

function formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Room color accents
const ROOM_COLORS = [
    { dot: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', text: '#a5b4fc' },
    { dot: '#ec4899', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)', text: '#f9a8d4' },
    { dot: '#14b8a6', bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.25)', text: '#5eead4' },
    { dot: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#fcd34d' },
    { dot: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', text: '#86efac' },
    { dot: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', text: '#c4b5fd' },
];

export default function PlanningGrid({ sessions, rooms, eventId }: PlanningGridProps) {
    const [now, setNow] = useState(new Date());
    const [favorites, setFavorites] = useState<number[]>([]);
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Tick every 30s to update live badges
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(interval);
    }, []);

    // Load favorites from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem('eventsync_favorites');
            if (stored) setFavorites(JSON.parse(stored));
        } catch {}
    }, []);

    function toggleFavorite(e: React.MouseEvent, sessionId: number) {
        e.preventDefault();
        e.stopPropagation();
        setFavorites((prev) => {
            const next = prev.includes(sessionId)
                ? prev.filter((id) => id !== sessionId)
                : [...prev, sessionId];
            try { localStorage.setItem('eventsync_favorites', JSON.stringify(next)); } catch {}
            return next;
        });
    }

    // Build time slots (unique sorted start times)
    const timeSlots = Array.from(
        new Set(sessions.map((s) => new Date(s.startTime).toISOString()))
    ).sort();

    const filteredRooms = activeRoom ? [activeRoom] : rooms;

    // Group sessions by startTime + room for grid lookup
    const sessionMap: Record<string, Session> = {};
    sessions.forEach((s) => {
        const key = `${new Date(s.startTime).toISOString()}__${s.room}`;
        sessionMap[key] = s;
    });

    const liveCount = sessions.filter((s) => {
        const n = now;
        return n >= new Date(s.startTime) && n <= new Date(s.endTime);
    }).length;

    return (
        <div>
            {/* Toolbar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
            }}>
                {/* Live indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {liveCount > 0 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'rgba(244,63,94,0.1)',
                            border: '1px solid rgba(244,63,94,0.25)',
                            borderRadius: '100px',
                            padding: '0.35rem 0.85rem',
                        }}>
              <span style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: '#f43f5e',
                  display: 'inline-block',
                  animation: 'pulse-live 1.5s ease-in-out infinite',
              }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb7185', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {liveCount} session{liveCount > 1 ? 's' : ''} en cours
              </span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* View toggle */}
                    <div style={{
                        display: 'flex',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        padding: '3px',
                    }}>
                        {(['grid', 'list'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                style={{
                                    padding: '0.35rem 0.85rem',
                                    borderRadius: '7px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    background: viewMode === mode ? 'rgba(99,102,241,0.2)' : 'transparent',
                                    color: viewMode === mode ? '#a5b4fc' : '#64748b',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {mode === 'grid' ? '⊞ Grille' : '≡ Liste'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Room filter pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <button
                    key="all-rooms"
                    onClick={() => setActiveRoom(null)}
                    style={{
                        padding: '0.35rem 1rem',
                        borderRadius: '100px',
                        border: `1px solid ${activeRoom === null ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                        background: activeRoom === null ? 'rgba(99,102,241,0.15)' : 'transparent',
                        color: activeRoom === null ? '#a5b4fc' : '#64748b',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                    }}
                >
                    Toutes les salles
                </button>
                {rooms.map((room, i) => {
                    const color = ROOM_COLORS[i % ROOM_COLORS.length];
                    const isActive = activeRoom === room;
                    return (
                        <button
                            key={room}
                            onClick={() => setActiveRoom(isActive ? null : room)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.35rem 1rem',
                                borderRadius: '100px',
                                border: `1px solid ${isActive ? color.border : 'rgba(255,255,255,0.08)'}`,
                                background: isActive ? color.bg : 'transparent',
                                color: isActive ? color.text : '#64748b',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                        >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color.dot, display: 'inline-block' }} />
                            {room}
                        </button>
                    );
                })}
            </div>

            {/* CSS keyframe for live pulse */}
            <style>{`
        @keyframes pulse-live {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes live-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(244,63,94,0.0); }
          50% { box-shadow: 0 0 12px 2px rgba(244,63,94,0.15); }
        }
        .session-card-link:hover .session-inner {
          border-color: rgba(255,255,255,0.18) !important;
          background: rgba(255,255,255,0.07) !important;
          transform: translateY(-2px);
        }
        .fav-btn:hover { opacity: 0.8; }
      `}</style>

            {/* ─── GRID VIEW ─── */}
            {viewMode === 'grid' && (
                <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `80px repeat(${filteredRooms.length}, minmax(220px, 1fr))`,
                        gap: '2px',
                        minWidth: filteredRooms.length > 1 ? `${80 + filteredRooms.length * 220}px` : 'auto',
                    }}>
                        {/* Header row: time col + room cols */}
                        <div style={{ padding: '0.75rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                        {filteredRooms.map((room, i) => {
                            const color = ROOM_COLORS[rooms.indexOf(room) % ROOM_COLORS.length];
                            return (
                                <div
                                    key={room}
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '12px 12px 0 0',
                                        padding: '0.85rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color.dot, flexShrink: 0 }} />
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f1f5f9' }}>{room}</span>
                                </div>
                            );
                        })}

                        {/* Time slot rows */}
                        {timeSlots.map((slot) => {
                            const slotDate = new Date(slot);
                            return (
                                <React.Fragment key={slot}>
                                    {/* Time label */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                            paddingTop: '1rem',
                                            color: '#475569',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            letterSpacing: '0.03em',
                                        }}
                                    >
                                        {formatTime(slotDate)}
                                    </div>

                                    {/* Session cells */}
                                    {filteredRooms.map((room) => {
                                        const key = `${slot}__${room}`;
                                        const session = sessionMap[key];
                                        const roomIdx = rooms.indexOf(room);
                                        const color = ROOM_COLORS[roomIdx % ROOM_COLORS.length];
                                        const live = session ? (now >= new Date(session.startTime) && now <= new Date(session.endTime)) : false;
                                        const isFav = session ? favorites.includes(session.id) : false;

                                        if (!session) {
                                            return (
                                                <div
                                                    key={key}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.015)',
                                                        border: '1px solid rgba(255,255,255,0.04)',
                                                        borderRadius: 12,
                                                        minHeight: 80,
                                                    }}
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={key}
                                                href={`/sessions/${session.id}`}
                                                className="session-card-link"
                                                style={{ textDecoration: 'none', display: 'block' }}
                                            >
                                                <div
                                                    className="session-inner"
                                                    style={{
                                                        background: live ? 'rgba(244,63,94,0.07)' : color.bg,
                                                        border: `1px solid ${live ? 'rgba(244,63,94,0.3)' : color.border}`,
                                                        borderRadius: 12,
                                                        padding: '0.85rem 1rem',
                                                        minHeight: 80,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '0.5rem',
                                                        transition: 'all 0.2s ease',
                                                        animation: live ? 'live-glow 2.5s ease-in-out infinite' : 'none',
                                                        position: 'relative',
                                                    }}
                                                >
                                                    {/* Top row: live badge + fav */}
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            {live && (
                                                                <span className="es-badge-live" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '100px', padding: '0.25rem 0.6rem', fontSize: '0.65rem', fontWeight: 700, color: '#fb7185' }}>
                                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f43f5e', display: 'inline-block', animation: 'pulse-live 1.5s ease-in-out infinite' }} />
                                  Live
                                </span>
                                                            )}
                                                            <span style={{
                                                                fontSize: '0.7rem',
                                                                color: color.text,
                                                                fontWeight: 600,
                                                            }}>
                                {formatTime(new Date(session.startTime))} – {formatTime(new Date(session.endTime))}
                              </span>
                                                        </div>
                                                        <button
                                                            className="fav-btn"
                                                            onClick={(e) => toggleFavorite(e, session.id)}
                                                            title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                fontSize: '0.9rem',
                                                                color: isFav ? '#fbbf24' : '#334155',
                                                                transition: 'color 0.15s',
                                                                padding: '2px',
                                                                lineHeight: 1,
                                                            }}
                                                        >
                                                            {isFav ? '★' : '☆'}
                                                        </button>
                                                    </div>

                                                    {/* Title */}
                                                    <p style={{
                                                        fontWeight: 700,
                                                        fontSize: '0.9rem',
                                                        color: '#f1f5f9',
                                                        lineHeight: 1.35,
                                                        margin: 0,
                                                    }}>
                                                        {session.title}
                                                    </p>

                                                    {/* Speakers */}
                                                    {session.speakers.length > 0 && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                                                            {session.speakers.map((sp) => (
                                                                <span
                                                                    key={sp.id}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.3rem',
                                                                        fontSize: '0.72rem',
                                                                        color: '#64748b',
                                                                    }}
                                                                >
                                  <span style={{
                                      width: 18, height: 18,
                                      borderRadius: '50%',
                                      background: color.bg,
                                      border: `1px solid ${color.border}`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.6rem',
                                      fontWeight: 700,
                                      color: color.text,
                                      flexShrink: 0,
                                  }}>
                                    {sp.name.charAt(0).toUpperCase()}
                                  </span>
                                                                    {sp.name}
                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ─── LIST VIEW ─── */}
            {viewMode === 'list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {timeSlots.map((slot) => {
                        const slotSessions = sessions.filter(
                            (s) =>
                                new Date(s.startTime).toISOString() === slot &&
                                (activeRoom === null || s.room === activeRoom)
                        );
                        if (slotSessions.length === 0) return null;

                        return (
                            <div key={slot}>
                                {/* Time divider */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '0.6rem',
                                    marginTop: '0.5rem',
                                }}>
                  <span style={{
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      color: '#94a3b8',
                      letterSpacing: '0.04em',
                      flexShrink: 0,
                  }}>
                    {formatTime(new Date(slot))}
                  </span>
                                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {slotSessions.map((session) => {
                                        const roomIdx = rooms.indexOf(session.room);
                                        const color = ROOM_COLORS[roomIdx % ROOM_COLORS.length];
                                        const live = now >= new Date(session.startTime) && now <= new Date(session.endTime);
                                        const isFav = favorites.includes(session.id);

                                        return (
                                            <Link
                                                key={session.id}
                                                href={`/sessions/${session.id}`}
                                                className="session-card-link"
                                                style={{ textDecoration: 'none' }}
                                            >
                                                <div
                                                    className="session-inner"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1rem',
                                                        background: live ? 'rgba(244,63,94,0.07)' : 'rgba(255,255,255,0.03)',
                                                        border: `1px solid ${live ? 'rgba(244,63,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
                                                        borderRadius: 12,
                                                        padding: '0.85rem 1.25rem',
                                                        transition: 'all 0.2s ease',
                                                        animation: live ? 'live-glow 2.5s ease-in-out infinite' : 'none',
                                                    }}
                                                >
                                                    {/* Room color bar */}
                                                    <div style={{
                                                        width: 4,
                                                        height: 48,
                                                        borderRadius: 4,
                                                        background: color.dot,
                                                        flexShrink: 0,
                                                    }} />

                                                    {/* Main info */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                                                            {live && (
                                                                <span className="es-badge-live" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '100px', padding: '0.25rem 0.6rem', fontSize: '0.65rem', fontWeight: 700, color: '#fb7185' }}>
                                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f43f5e', display: 'inline-block', animation: 'pulse-live 1.5s ease-in-out infinite' }} />
                                  Live
                                </span>
                                                            )}
                                                            <span style={{ fontSize: '0.72rem', color: color.text, fontWeight: 600 }}>
                                {session.room}
                              </span>
                                                            <span style={{ fontSize: '0.72rem', color: '#475569' }}>
                                {formatTime(new Date(session.startTime))} – {formatTime(new Date(session.endTime))}
                              </span>
                                                        </div>
                                                        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {session.title}
                                                        </p>
                                                        {session.speakers.length > 0 && (
                                                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                                                                {session.speakers.map((sp) => sp.name).join(' · ')}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Fav button */}
                                                    <button
                                                        className="fav-btn"
                                                        onClick={(e) => toggleFavorite(e, session.id)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontSize: '1.1rem',
                                                            color: isFav ? '#fbbf24' : '#334155',
                                                            transition: 'color 0.15s',
                                                            flexShrink: 0,
                                                            padding: '4px',
                                                        }}
                                                    >
                                                        {isFav ? '★' : '☆'}
                                                    </button>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}