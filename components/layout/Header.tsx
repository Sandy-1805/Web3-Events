'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const { user, loading, logout, fetchUser } = useAuth();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [pathname, fetchUser]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const startTime = Date.now();
    
    await logout();
    
    // Attendre au moins 500ms pour voir l'animation
    const elapsedTime = Date.now() - startTime;
    const minLoadingTime = 500;
    const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
    
    setTimeout(() => {
      setIsLoggingOut(false);
    }, remainingTime);
  };

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
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Déconnexion...
                    </>
                  ) : (
                    'Déconnexion'
                  )}
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