// app/api/speakers/[id]/route.ts
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

// GET - Détail d'un speaker (public) - CORRIGÉ
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← Promise
) {
  try {
    const { id } = await params;  // ← await params
    const speakerId = parseInt(id);
    
    if (isNaN(speakerId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }
    
    const speaker = await db.select().from(speakers).where(eq(speakers.id, speakerId));

    if (speaker.length === 0) {
      return NextResponse.json({ error: 'Intervenant non trouvé' }, { status: 404 });
    }

    return NextResponse.json(speaker[0]);
  } catch (error) {
    console.error('Erreur GET speaker:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Modifier un speaker (admin uniquement)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← Promise
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id } = await params;  // ← await params
    const speakerId = parseInt(id);
    
    if (isNaN(speakerId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }
    
    const body = await request.json();
    const { name, bio, photo, socialLinks } = body;

    const [updatedSpeaker] = await db.update(speakers)
      .set({ name, bio, photo, socialLinks })
      .where(eq(speakers.id, speakerId))
      .returning();

    if (!updatedSpeaker) {
      return NextResponse.json({ error: 'Intervenant non trouvé' }, { status: 404 });
    }

    return NextResponse.json(updatedSpeaker);
  } catch (error) {
    console.error('Erreur PUT speaker:', error);
    return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 });
  }
}

// DELETE - Supprimer un speaker (admin uniquement)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← Promise
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id } = await params;  // ← await params
    const speakerId = parseInt(id);
    
    if (isNaN(speakerId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }
    
    await db.delete(speakers).where(eq(speakers.id, speakerId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE speaker:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}