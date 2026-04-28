import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { events } from '@/lib/db/schema';
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

// GET - Public (accessible sans authentification)
export async function GET() {
  try {
    const allEvents = await db.select().from(events);
    return NextResponse.json(allEvents);
  } catch (error) {
    console.error('Erreur:', error);
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
    const { title, description, startDate, endDate, location } = body;

    const [newEvent] = await db.insert(events).values({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
    }).returning();

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}