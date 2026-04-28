'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    events: 0,
    sessions: 0,
    speakers: 0,
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const [eventsRes, sessionsRes, speakersRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/session'),
        fetch('/api/speakers'),
      ]);
      const events = await eventsRes.json();
      const sessions = await sessionsRes.json();
      const speakers = await speakersRes.json();
      setStats({
        events: events.length,
        sessions: sessions.length,
        speakers: speakers.length,
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a0a0f]">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const statItems = [
    { name: 'Événements', value: stats.events, href: '/admin/events', icon: '📅', color: 'from-blue-500 to-indigo-600' },
    { name: 'Sessions', value: stats.sessions, href: '/admin/sessions', icon: '🎤', color: 'from-purple-500 to-pink-600' },
    { name: 'Intervenants', value: stats.speakers, href: '/admin/speakers', icon: '👥', color: 'from-green-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Tableau de bord
          </h1>
          <p className="text-gray-400 mt-2">
            Bienvenue, <span className="text-white font-medium">{user.name}</span> ! Gérez vos événements depuis cet espace.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {statItems.map((stat) => (
            <Link
              key={stat.name}
              href={stat.href}
              className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center">
                <div className="text-4xl mr-4">{stat.icon}</div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide">{stat.name}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="bg-white/5 border border-white/10 rounded-xl mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Actions rapides</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/admin/events/create"
                className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
              >
                ➕ Créer un événement
              </Link>
              <Link
                href="/admin/sessions/create"
                className="text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
              >
                🎤 Ajouter une session
              </Link>
              <Link
                href="/admin/speakers/create"
                className="text-center bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
              >
                👤 Ajouter un intervenant
              </Link>
            </div>
          </div>
        </div>

        {/* Message si rien */}
        {stats.events === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <p className="text-gray-400">Aucun événement pour le moment.</p>
            <Link href="/admin/events/create" className="mt-4 inline-block text-[#6366f1] hover:underline">
              Créez votre premier événement
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}