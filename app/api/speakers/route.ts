// app/api/speakers/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { speakers } from '@/lib/db/schema';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token.value, secret);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

// GET - Public (accessible sans authentification) - CORRIGÉ
export async function GET() {
  try {
    const allSpeakers = await db.select().from(speakers);
    return NextResponse.json(allSpeakers);
  } catch (error) {
    console.error('Erreur GET speakers:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Admin uniquement
export async function POST(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, bio, photo, socialLinks } = body;

    const [newSpeaker] = await db.insert(speakers).values({
      name,
      bio,
      photo,
      socialLinks,
    }).returning();

    return NextResponse.json(newSpeaker, { status: 201 });
  } catch (error) {
    console.error('Erreur POST speaker:', error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}