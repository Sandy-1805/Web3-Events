'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const startTime = Date.now();

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      await refreshUser();

      // Attendre au moins 500ms pour voir l'animation
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 500;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      setTimeout(() => {
        if (data.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }, remainingTime);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fillCredentials = (email: string, password: string) => {
    setFormData({ ...formData, email, password });
  };

  const handleSwitch = () => {
    setSwitching(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setError('');
      setSwitching(false);
    }, 500);
  };

  if (switching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Connexion' : 'Inscription'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isLogin ? 'Accédez à votre compte' : 'Créez un compte pour commencer'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isLogin ? 'Connexion...' : 'Création...'}
                </>
              ) : (
                isLogin ? 'Se connecter' : 'Créer le compte'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={handleSwitch}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {isLogin ? 'Créer un compte' : 'Déjà inscrit ? Se connecter'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-3">
                Comptes de test
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => fillCredentials('admin@eventsync.com', 'admin123')}
                  className="w-full text-left text-sm px-3 py-2 bg-gray-50 rounded-md hover:bg-gray-100 transition"
                >
                  Administrateur — admin@eventsync.com
                </button>
                <button
                  onClick={() => fillCredentials('participant@eventsync.com', 'participant123')}
                  className="w-full text-left text-sm px-3 py-2 bg-gray-50 rounded-md hover:bg-gray-100 transition"
                >
                  Participant — participant@eventsync.com
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}