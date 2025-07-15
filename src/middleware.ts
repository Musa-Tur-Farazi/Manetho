import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Map of redirect paths
const redirectPaths: Record<string, string> = {
  '/ai-solver': '/tools/doubt-solving',
  '/flashcards': '/tools/flashcards',
  '/progress': '/tools/progress-tracking'
};

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
];

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl;
  const path = url.pathname;

  // Handle redirects
  if (path in redirectPaths) {
    const redirectUrl = new URL(redirectPaths[path], req.url);
    redirectUrl.search = url.search;
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};