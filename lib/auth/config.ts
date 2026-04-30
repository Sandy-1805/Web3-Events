// lib/auth/config.ts
// ⚙️ Configuration centralisée de l'authentification
// Pourquoi centraliser ? Pour éviter de répéter process.env.JWT_SECRET
// partout dans les API routes — DRY principle (Don't Repeat Yourself)

import { TextEncoder } from 'util';

// La clé secrète utilisée pour signer et vérifier les tokens JWT
// En production, JWT_SECRET doit être une longue chaîne aléatoire dans .env
export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

// Durée de vie du token : 24 heures
// Après ça, l'utilisateur devra se reconnecter
export const JWT_EXPIRATION = '24h';

// Durée en secondes pour le cookie (24h = 86400s)
export const COOKIE_MAX_AGE = 60 * 60 * 24;

// Nom du cookie qui stocke le token JWT
export const COOKIE_NAME = 'token';

// Email réservé pour l'admin (ne peut pas s'inscrire via le formulaire public)
export const ADMIN_EMAIL = 'admin@eventsync.com';