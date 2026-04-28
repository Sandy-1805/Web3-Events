import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users } from '../lib/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

// Charger les variables d'environnement
config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seed() {
  console.log('🌱 Début du seed...');
  console.log('📁 Connexion à:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'));

  const accounts = [
    {
      name: 'Admin Principal',
      email: 'admin@eventsync.com',
      password: 'admin123',
      role: 'admin',
    },
    {
      name: 'Jean Participant',
      email: 'participant@eventsync.com',
      password: 'participant123',
      role: 'participant',
    },
  ];

  for (const account of accounts) {
    try {
      const existingUser = await db.select().from(users).where(eq(users.email, account.email));

      if (existingUser.length === 0) {
        const hashedPassword = await bcrypt.hash(account.password, 10);
        await db.insert(users).values({
          name: account.name,
          email: account.email,
          password: hashedPassword,
          role: account.role,
        });
        console.log(`✅ Compte créé : ${account.email} (${account.role})`);
      } else {
        console.log(`⚠️ Compte existe déjà : ${account.email}`);
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${account.email}:`, error);
    }
  }

  console.log('🎉 Seed terminé !');
  await pool.end();
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});