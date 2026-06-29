// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { users } from '@/lib/db/schema';
import { verifyToken } from '@/server/utils/jwt';
import { COOKIE_NAME } from '@/server/utils/jwt';
import type { NextRequest } from 'next/server';

async function isAdmin(request: NextRequest): Promise<boolean> {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const payload = await verifyToken(token);
    return payload?.role === 'admin';
}

export async function GET(request: NextRequest) {
    const admin = await isAdmin(request);
    if (!admin) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const allUsers = await db.select().from(users);
        // Ne pas retourner les mots de passe
        const safeUsers = allUsers.map(({ password, ...user }) => user);
        return NextResponse.json(safeUsers);
    } catch (error) {
        console.error('Erreur GET /api/users:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des utilisateurs' },
            { status: 500 }
        );
    }
}