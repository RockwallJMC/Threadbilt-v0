import { NextResponse } from 'next/server';

export function middleware(request) {
  // Middleware placeholder for future auth checks
  // Currently no routes are protected (matcher is empty)
  return NextResponse.next();
}

export const config = { matcher: [] };
