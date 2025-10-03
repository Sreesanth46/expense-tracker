import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from './lib/auth';

export const config = {
  matcher: '/api/:function*'
};

export function middleware(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}
