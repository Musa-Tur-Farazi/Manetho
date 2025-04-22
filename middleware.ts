import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Define public routes - any routes not in this list will require authentication
const publicPaths = [
  "/",
  "/sign-in*",
  "/sign-up*",
  "/api*",
  "/custom-auth/sign-in*",
  "/custom-auth/sign-up*",
  "/custom-auth/reset-password*",
  "/sso-callback*",
  // These paths will be automatically redirected, but need to be public
  "/ai-solver",
  "/flashcards",
  "/mind-maps",
  "/progress",
];

// Map of redirect paths
const redirectPaths = {
  '/ai-solver': '/tools/doubt-solving',
  '/flashcards': '/tools/flashcards',
  '/mind-maps': '/tools/mind-maps',
  '/progress': '/tools/progress-tracking'
};

export default authMiddleware({
  publicRoutes: publicPaths,
  ignoredRoutes: [
    "/(api|trpc)/(.*)",
    "/_next/static/(.*)",
    "/_next/image(.*)",
    "/favicon.ico",
    "/assets/images/(.*)",
  ],
  beforeAuth: (req) => {
    const url = req.nextUrl;
    const path = url.pathname;

    if (path in redirectPaths) {
      const redirectUrl = new URL(redirectPaths[path], req.url);
      redirectUrl.search = url.search;
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  },
  debug: process.env.NODE_ENV !== "production",
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 