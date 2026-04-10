export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: [
    '/onboarding/:path*',
    '/parent/:path*',
    '/pro/:path*',
    '/explorateurs/:path*',
    '/petits/:path*',
    '/aventuriers/:path*',
    '/lyceens/:path*',
  ],
};
