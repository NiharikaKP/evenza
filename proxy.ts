import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import { auth } from '@/lib/auth';

const PUBLIC_ROUTES = ['/', '/events', '/clubs', '/categories', '/sign-in', '/sign-up'];
const ONBOARDING_ROUTE = '/onboarding';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + '/'),
  );
  if (isPublic) return NextResponse.next();

  // Quick cookie check — avoids DB hit for unauthenticated requests
  const cookieSession = getSessionCookie(request);
  if (!cookieSession) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Full session needed for role + onboarding checks
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const { user } = session;

  if (!user.onboardingComplete && pathname !== ONBOARDING_ROUTE) {
    return NextResponse.redirect(new URL(ONBOARDING_ROUTE, request.url));
  }

  if (
    pathname.startsWith('/organizer') &&
    user.role !== 'organizer' &&
    user.role !== 'admin'
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/admin') && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
