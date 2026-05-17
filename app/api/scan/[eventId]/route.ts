import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { registrations, events, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !['organizer', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: 'unauthorized', message: 'Unauthorized' }, { status: 401 });
  }

  const { eventId } = await params;
  const body = await req.json();
  const token: string = body?.token;

  if (!token) {
    return NextResponse.json({ success: false, error: 'invalid_token', message: 'QR code not found' });
  }

  try {
    // Find registration by qr token
    const [registration] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.qrToken, token))
      .limit(1);

    if (!registration) {
      return NextResponse.json({ success: false, error: 'invalid_token', message: 'QR code not found' });
    }

    if (registration.eventId !== eventId) {
      return NextResponse.json({ success: false, error: 'wrong_event', message: 'This QR code is for a different event' });
    }

    // Fetch the event
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event || event.isCancelled) {
      return NextResponse.json({ success: false, error: 'invalid_event', message: 'Event not found or cancelled' });
    }

    // Check time window
    const now = new Date();
    if (now < event.startTime || now > event.endTime) {
      return NextResponse.json({ success: false, error: 'outside_window', message: 'Scanning is only allowed during the event' });
    }

    // Atomic update: only marks attended if not yet scanned — race-condition safe
    const updated = await db
      .update(registrations)
      .set({ attended: true, scanned: true })
      .where(and(eq(registrations.id, registration.id), eq(registrations.scanned, false)))
      .returning({ id: registrations.id, userId: registrations.userId });

    if (updated.length === 0) {
      return NextResponse.json({ success: false, error: 'already_scanned', message: 'This ticket has already been scanned' });
    }

    // Get attendee name
    const [user] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, updated[0].userId))
      .limit(1);

    return NextResponse.json({ success: true, message: 'Attendance marked!', attendeeName: user?.name ?? 'Unknown' });
  } catch (err) {
    console.error('[scan] error:', err);
    return NextResponse.json({ success: false, error: 'server_error', message: 'Something went wrong' }, { status: 500 });
  }
}
