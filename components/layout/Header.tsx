'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      setIsAdmin(false);
    };
    checkAdmin();
  }, []);

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          EventSync
        </Link>
        <div className="space-x-4">
          <Link href="/events" className="hover:text-blue-600 transition">
            Événements
          </Link>
          {isAdmin && (
            <Link href="/admin" className="hover:text-blue-600 transition">
              Admin
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}