import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { events } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const event = await db.select().from(events).where(eq(events.id, parseInt(params.id)));

    if (event.length === 0) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    return NextResponse.json(event[0]);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, startDate, endDate, location } = body;

    const [updatedEvent] = await db.update(events)
      .set({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
      })
      .where(eq(events.id, parseInt(params.id)))
      .returning();

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    await db.delete(events).where(eq(events.id, parseInt(params.id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}