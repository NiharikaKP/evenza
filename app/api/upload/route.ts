import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !['admin', 'organizer'].includes(session.user.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get('type') ?? 'clubs';
    if (session.user.role === 'organizer' && type !== 'events') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const folder = type === 'events' ? 'events' : 'clubs';

    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File must be under 2MB' }, { status: 400 });
    }

    // Sanitize filename to avoid path issues in Vercel Blob
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blob = await put(`${folder}/${crypto.randomUUID()}-${safeName}`, file, { access: 'public' });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('[upload]', err);
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}