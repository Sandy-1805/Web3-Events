'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          EventSync
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/events" className="hover:text-blue-600 transition">
            Événements
          </Link>

          {user?.role === 'admin' && (
            <Link href="/admin" className="hover:text-blue-600 transition">
              Admin
            </Link>
          )}

          {!loading && (
            user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Bonjour, {user.name}
                </span>
                <button
                  onClick={logout}
                  className="text-red-600 hover:text-red-700 transition"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Connexion
              </Link>
            )
          )}
        </div>
      </nav>
    </header>
  );
}