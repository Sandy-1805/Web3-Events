import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { speakers } from '@/lib/db/schema';
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

// Ajoutez GET au début du fichier
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const speaker = await db.select().from(speakers).where(eq(speakers.id, parseInt(params.id)));

    if (speaker.length === 0) {
      return NextResponse.json({ error: 'Intervenant non trouvé' }, { status: 404 });
    }

    return NextResponse.json(speaker[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Ajoutez PUT avant le DELETE
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
    const { name, bio, photo, socialLinks } = body;

    const [updatedSpeaker] = await db.update(speakers)
      .set({ name, bio, photo, socialLinks })
      .where(eq(speakers.id, parseInt(params.id)))
      .returning();

    return NextResponse.json(updatedSpeaker);
  } catch (error) {
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
    await db.delete(speakers).where(eq(speakers.id, parseInt(params.id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}