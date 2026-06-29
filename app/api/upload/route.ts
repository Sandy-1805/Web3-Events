// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyToken } from '@/server/utils/jwt';
import { COOKIE_NAME } from '@/server/utils/jwt';

// Vérifier que l'utilisateur est admin
async function isAdmin(request: NextRequest): Promise<boolean> {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const payload = await verifyToken(token);
    return payload?.role === 'admin';
}

export async function POST(request: NextRequest) {
    // Vérifier les droits admin
    const admin = await isAdmin(request);
    if (!admin) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'Aucun fichier fourni' },
                { status: 400 }
            );
        }

        // Vérifier le type de fichier
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Format de fichier non supporté. Utilisez JPEG, PNG, WebP ou GIF.' },
                { status: 400 }
            );
        }

        // Vérifier la taille du fichier (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Le fichier est trop volumineux. Maximum 5MB.' },
                { status: 400 }
            );
        }

        // Créer le dossier uploads s'il n'existe pas
        const uploadDir = path.join(process.cwd(), 'public/uploads/speakers');
        await mkdir(uploadDir, { recursive: true });

        // Générer un nom de fichier unique
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `${timestamp}.${extension}`;
        const filePath = path.join(uploadDir, filename);

        // Convertir le fichier en buffer et le sauvegarder
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Retourner l'URL publique du fichier
        const publicUrl = `/uploads/speakers/${filename}`;
        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error('Erreur upload:', error);
        return NextResponse.json(
            { error: "Erreur lors de l'upload du fichier" },
            { status: 500 }
        );
    }
}