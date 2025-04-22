import { NextRequest, NextResponse } from 'next/server';

// Map of redirect paths
const redirects = {
  '/ai-solver': '/tools/doubt-solving',
  '/flashcards': '/tools/flashcards',
  '/mind-maps': '/tools/mind-maps',
  '/progress': '/tools/progress-tracking'
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // If the path matches one of our redirect paths
  if (path in redirects) {
    // Create a new URL with the destination path
    const url = new URL(redirects[path], request.url);

    // Preserve any query parameters
    url.search = request.nextUrl.search;

    // Return a 307 temporary redirect
    return NextResponse.redirect(url);
  }

  // For all other paths, continue the request
  return NextResponse.next();
}

export const config = {
  matcher: ['/ai-solver', '/flashcards', '/mind-maps', '/progress'],
};