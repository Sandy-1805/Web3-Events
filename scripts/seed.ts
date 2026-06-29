// scripts/seed.ts — remplace l'ancien fichier entièrement
import { config } from 'dotenv';
config({ path: '.env' });

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users, events, speakers, sessions, sessionSpeakers, questions } from '../lib/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function seed() {
  console.log('🌱 Début du seed...');
  console.log('📁 Connexion à:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'));

  // 1. Users
  const accounts = [
    { name: 'Admin Principal',  email: 'admin@eventsync.com',      password: 'admin123',       role: 'admin' },
    { name: 'Jean Participant', email: 'participant@eventsync.com', password: 'participant123', role: 'participant' },
  ];
  for (const account of accounts) {
    try {
      const existing = await db.select().from(users).where(eq(users.email, account.email));
      if (existing.length === 0) {
        const hashed = await bcrypt.hash(account.password, 10);
        await db.insert(users).values({ ...account, password: hashed });
        console.log(`✅ Compte créé : ${account.email}`);
      } else {
        console.log(`⚠️  Compte existe déjà : ${account.email}`);
      }
    } catch (e) { console.error(`❌ Erreur user ${account.email}:`, e); }
  }

  // 2. Nettoyage
  console.log('\n🗑  Nettoyage...');
  await db.delete(questions);
  await db.delete(sessionSpeakers);
  await db.delete(sessions);
  await db.delete(speakers);
  await db.delete(events);
  console.log('✅ Tables nettoyées');

  // 3. Événement
  const today = new Date();
  const startOfDay = new Date(today); startOfDay.setHours(8,  0, 0, 0);
  const endOfDay   = new Date(today); endOfDay.setHours(20, 0, 0, 0);

  const [event] = await db.insert(events).values({
    title: 'Web3 Madagascar Summit',
    description: 'La première grande conférence dédiée à la blockchain, la DeFi et les NFTs à Madagascar.',
    startDate: startOfDay,
    endDate:   endOfDay,
    location:  'Antananarivo, Madagascar',
  }).returning();
  console.log(`\n✅ Événement créé : "${event.title}" (id: ${event.id})`);

  // 4. Speakers
  const [andry, sofia, mia, koto, lova, jeanmarc, harena] = await db.insert(speakers).values([
    { name: 'Andry Rakoto',   photo: null, bio: 'Fondateur de MalagasyChain, 8 ans en DeFi.',                            socialLinks: JSON.stringify({ twitter: '#' }) },
    { name: 'Sofia Chen',     photo: null, bio: 'Ingénieure Solidity, contributrice Ethereum Foundation.',                socialLinks: JSON.stringify({ github: '#' }) },
    { name: 'Mia Dupont',     photo: null, bio: 'Artiste numérique, 500+ oeuvres vendues sur OpenSea.',                  socialLinks: JSON.stringify({ instagram: '#' }) },
    { name: 'Koto Rabe',      photo: null, bio: 'Dev full-stack Web3, 3 protocoles DeFi open-source.',                   socialLinks: JSON.stringify({ github: '#' }) },
    { name: 'Lova Ndriana',   photo: null, bio: 'Chercheuse en impact social de la blockchain.',                         socialLinks: JSON.stringify({ linkedin: '#' }) },
    { name: 'Jean-Marc Fidy', photo: null, bio: 'Avocat, droit numérique et régulation crypto Afrique.',                 socialLinks: JSON.stringify({ linkedin: '#' }) },
    { name: 'Harena Solo',    photo: null, bio: 'CEO MadaVentures, investisseur 20+ startups Web3.',                     socialLinks: JSON.stringify({ twitter: '#' }) },
  ]).returning();
  console.log('✅ 7 speakers créés');

  // 5. Sessions
  const now = new Date();
  const liveStart = new Date(now.getTime() - 45 * 60 * 1000);
  const liveEnd   = new Date(now.getTime() + 45 * 60 * 1000);
  const h = (hh: number, mm: number) => { const d = new Date(today); d.setHours(hh, mm, 0, 0); return d; };

  const [keynote, defi, liveSession, panel, nftIntro, nftCreateurs, web3Social, pitches, blockchainDeb, walletHands, tokenomics] =
      await db.insert(sessions).values([
        { title: "Keynote : L'avenir du Web3 en Afrique",          description: "Session d'ouverture sur les grandes tendances du Web3 africain.",                startTime: h(9,0),    endTime: h(10,0),   room: 'Salle A — Amphi',     capacity: 300, eventId: event.id },
        { title: 'DeFi & Finance décentralisée',                   description: "Comment la DeFi peut transformer l'accès aux services financiers à Madagascar.", startTime: h(10,30),  endTime: h(12,0),   room: 'Salle A — Amphi',     capacity: 300, eventId: event.id },
        { title: "Smart Contracts Solidity : de zéro à l'expert", description: 'Workshop pratique pour écrire, tester et déployer des smart contracts.',         startTime: liveStart, endTime: liveEnd,   room: 'Salle A — Amphi',     capacity: 300, eventId: event.id },
        { title: 'Panel : Régulation crypto en Afrique',           description: 'Table ronde sur la régulation des cryptomonnaies.',                              startTime: h(16,0),   endTime: h(17,30),  room: 'Salle A — Amphi',     capacity: 300, eventId: event.id },
        { title: 'Intro aux NFTs : créer et vendre son art',       description: 'Guide pratique pour artistes souhaitant se lancer dans les NFTs.',              startTime: h(9,0),    endTime: h(10,30),  room: 'Salle B — Workshop',  capacity: 80,  eventId: event.id },
        { title: 'NFT & Créateurs numériques malgaches',           description: "Retours d'expérience de créateurs malgaches sur les marchés NFT.",              startTime: h(11,0),   endTime: h(12,30),  room: 'Salle B — Workshop',  capacity: 80,  eventId: event.id },
        { title: 'Web3 & Impact Social',                           description: 'Comment les projets blockchain peuvent avoir un impact réel.',                   startTime: h(14,0),   endTime: h(15,30),  room: 'Salle B — Workshop',  capacity: 80,  eventId: event.id },
        { title: 'Pitches Startups Web3 Madagascar',               description: "6 startups pitchent leur projet devant un jury d'investisseurs.",               startTime: h(16,0),   endTime: h(18,0),   room: 'Salle B — Workshop',  capacity: 80,  eventId: event.id },
        { title: 'Blockchain pour débutants',                      description: 'Session accessible pour comprendre les fondamentaux sans jargon.',               startTime: h(10,0),   endTime: h(11,30),  room: 'Salle C — Formation', capacity: 50,  eventId: event.id },
        { title: 'Hands-on : Créer son premier wallet',            description: 'Atelier pratique. Prérequis : aucun.',                                          startTime: h(13,0),   endTime: h(14,30),  room: 'Salle C — Formation', capacity: 50,  eventId: event.id },
        { title: "Tokenomics : économie d'un protocole",           description: 'Design des tokens : utility, governance, incentives.',                          startTime: h(15,0),   endTime: h(16,30),  room: 'Salle C — Formation', capacity: 50,  eventId: event.id },
      ]).returning();
  console.log('✅ 11 sessions créées');

  // 6. Liens sessions <-> speakers
  await db.insert(sessionSpeakers).values([
    { sessionId: keynote.id,       speakerId: andry.id },
    { sessionId: keynote.id,       speakerId: harena.id },
    { sessionId: defi.id,          speakerId: andry.id },
    { sessionId: defi.id,          speakerId: koto.id },
    { sessionId: liveSession.id,   speakerId: sofia.id },
    { sessionId: liveSession.id,   speakerId: koto.id },
    { sessionId: panel.id,         speakerId: jeanmarc.id },
    { sessionId: panel.id,         speakerId: harena.id },
    { sessionId: panel.id,         speakerId: lova.id },
    { sessionId: nftIntro.id,      speakerId: mia.id },
    { sessionId: nftCreateurs.id,  speakerId: mia.id },
    { sessionId: web3Social.id,    speakerId: lova.id },
    { sessionId: pitches.id,       speakerId: harena.id },
    { sessionId: blockchainDeb.id, speakerId: sofia.id },
    { sessionId: walletHands.id,   speakerId: koto.id },
    { sessionId: tokenomics.id,    speakerId: andry.id },
  ]);
  console.log('✅ Liens speaker créés');

  // 7. Questions live
  await db.insert(questions).values([
    { content: 'Quelle différence entre Solidity et Vyper ?',                            authorName: 'Fara R.', upvotes: 14, sessionId: liveSession.id },
    { content: "Comment auditer un smart contract avant le déploiement ?",               authorName: null,       upvotes: 9,  sessionId: liveSession.id },
    { content: 'Les frais de gas sur Ethereum sont-ils toujours un problème en 2025 ?', authorName: 'Haja M.', upvotes: 6,  sessionId: liveSession.id },
  ]);
  console.log('✅ 3 questions créées');

  console.log('\n🎉 Seed terminé avec succès !');
  console.log('─'.repeat(50));
  console.log(`📌 Événement id  : ${event.id}`);
  console.log(`🔗 Événements    : http://localhost:3000/events`);
  console.log(`🗓  Planning      : http://localhost:3000/events/${event.id}/planning`);
  console.log(`🔴 Session LIVE  : "${liveSession.title}"`);
  console.log('─'.repeat(50));

  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Erreur seed :', err);
  process.exit(1);
});