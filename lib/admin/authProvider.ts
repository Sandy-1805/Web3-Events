// lib/admin/authProvider.ts
import { AuthProvider } from 'react-admin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'participant';
}

async function fetchMe(): Promise<ApiUser | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: 'include',
    });
    if (!response.ok) return null;
    const { user } = await response.json();
    return user ?? null;
  } catch {
    return null;
  }
}

const authProvider: AuthProvider = {

  // ✅ LOGIN : ne fait rien, empêche l'affichage de la page de login
  async login() {
    // Redirige directement vers l'accueil
    window.location.href = '/';
    return Promise.resolve();
  },

  // ✅ LOGOUT : déconnecte et redirige vers l'accueil
  async logout() {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});

    localStorage.removeItem('ra_user');
    window.location.href = '/';
    return Promise.resolve();
  },

  // ✅ CHECK AUTH : vérifie si l'utilisateur est admin
  async checkAuth() {
    const user = await fetchMe();
    if (!user || user.role !== 'admin') {
      // Redirige vers l'accueil
      window.location.href = '/';
      throw new Error('Non autorisé');
    }
    // ✅ Retourne une Promise résolue si connecté
    return Promise.resolve();
  },

  // ✅ CHECK ERROR : déconnecte sur 401/403
  async checkError(error: { status?: number }) {
    const status = error?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('ra_user');
      window.location.href = '/';
      throw new Error('Non autorisé');
    }
    return Promise.resolve();
  },

  // ✅ GET IDENTITY : récupère les infos de l'utilisateur
  async getIdentity() {
    const cached = localStorage.getItem('ra_user');
    const user: ApiUser | null = cached ? JSON.parse(cached) : await fetchMe();

    if (!user) {
      window.location.href = '/';
      throw new Error('Utilisateur non trouvé');
    }

    return {
      id: user.id,
      fullName: user.name,
      email: user.email,
    };
  },

  // ✅ GET PERMISSIONS : retourne le rôle
  async getPermissions() {
    const cached = localStorage.getItem('ra_user');
    const user: ApiUser | null = cached ? JSON.parse(cached) : await fetchMe();
    return user?.role ?? null;
  },
};

export default authProvider;