export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/parent/:path*",
    "/child/:path*",
    "/api/children/:path*",
    "/api/sessions/:path*",
    "/api/ai/:path*",
    "/api/user/:path*",
  ],
};
