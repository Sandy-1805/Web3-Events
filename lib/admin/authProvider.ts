/**
 * authProvider.ts
 * React Admin Auth Provider — branché sur l'API JWT (cookie httpOnly) de Web3-Events
 *
 * Flux :
 *   login()    → POST /api/auth/login    (cookie posé par le serveur)
 *   logout()   → POST /api/auth/logout   (cookie supprimé par le serveur)
 *   checkAuth() → GET /api/auth/me       (vérifie si le cookie est encore valide)
 *   checkError() → détecte les 401/403 et déconnecte
 *   getIdentity() → GET /api/auth/me     (prénom + avatar dans la topbar)
 *   getPermissions() → renvoie le rôle ('admin' | 'participant')
 *
 * Usage dans App.tsx :
 *   import authProvider from './authProvider';
 *   <Admin authProvider={authProvider}>...</Admin>
 */

import { AuthProvider } from 'react-admin';

// ─── Configuration ────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'participant';
}

// ─── Helper ───────────────────────────────────────────────────────────────────

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

// ─── Auth Provider ────────────────────────────────────────────────────────────

const authProvider: AuthProvider = {

  /**
   * Appelé à la soumission du formulaire de login React Admin.
   * Le serveur pose le cookie httpOnly — rien à stocker côté client.
   *
   * React Admin passe { username, password } par défaut.
   * Notre API attend { email, password } → on remmappe.
   */
  async login({ username, password }: { username: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.error ?? 'Identifiants incorrects');
    }

    const user: ApiUser = await response.json();

    // Seuls les admins peuvent accéder au back-office
    if (user.role !== 'admin') {
      // On déconnecte immédiatement pour ne pas laisser de cookie orphelin
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      throw new Error('Accès réservé aux administrateurs');
    }

    // Optionnel : stocker le nom en localStorage pour l'affichage immédiat
    localStorage.setItem('ra_user', JSON.stringify(user));
  },

  /**
   * Appelé lors du clic sur "Déconnexion".
   */
  async logout() {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {
      // On ignore les erreurs réseau au logout — on nettoie quand même
    });

    localStorage.removeItem('ra_user');

    // Retourner une URL redirige React Admin vers cette page après logout
    return '/login';
  },

  /**
   * Appelé à chaque navigation pour vérifier que la session est toujours active.
   * Lance une erreur (ou renvoie une Promise rejetée) pour forcer le logout.
   */
  async checkAuth() {
    const user = await fetchMe();
    if (!user || user.role !== 'admin') {
      throw new Error('Session expirée');
    }
  },

  /**
   * Appelé quand une requête API retourne une erreur.
   * On déconnecte sur 401 et 403.
   */
  async checkError(error: { status?: number; message?: string }) {
    const status = error?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('ra_user');
      throw new Error('Non autorisé');
    }
    // Pour toute autre erreur, on laisse React Admin gérer normalement
  },

  /**
   * Renvoie les infos affichées dans la topbar de React Admin
   * (nom, avatar, email).
   */
  async getIdentity() {
    // On tente d'abord le cache local pour éviter un aller-retour réseau
    const cached = localStorage.getItem('ra_user');
    const user: ApiUser | null = cached ? JSON.parse(cached) : await fetchMe();

    if (!user) throw new Error('Utilisateur introuvable');

    return {
      id: user.id,
      fullName: user.name,
      email: user.email,
      // avatar: '/avatar-placeholder.png', // décommenter pour ajouter un avatar
    };
  },

  /**
   * Renvoie le rôle de l'utilisateur courant.
   * Utilisé pour conditionner l'affichage de ressources dans React Admin.
   *
   * Exemple d'usage dans <Resource> :
   *   const permissions = usePermissions();
   *   if (permissions === 'admin') { ... }
   */
  async getPermissions() {
    const cached = localStorage.getItem('ra_user');
    const user: ApiUser | null = cached ? JSON.parse(cached) : await fetchMe();
    return user?.role ?? null;
  },
};

export default authProvider;