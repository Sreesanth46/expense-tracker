import { NextRequest } from 'next/server';

export function isAuthenticated(request: NextRequest): boolean {
  return true;
}
