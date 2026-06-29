// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/server/utils/jwt';
import { COOKIE_NAME } from '@/server/utils/jwt';
import type { NextRequest } from 'next/server';

async function isAdmin(request: NextRequest): Promise<boolean> {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const payload = await verifyToken(token);
    return payload?.role === 'admin';
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await isAdmin(request);
    if (!admin) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
        }

        const result = await db.select().from(users).where(eq(users.id, userId));

        if (result.length === 0) {
            return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
        }

        const { password, ...user } = result[0];
        return NextResponse.json(user);
    } catch (error) {
        console.error('Erreur GET /api/users/[id]:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération' },
            { status: 500 }
        );
    }
}