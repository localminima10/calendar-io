import { updateSession } from '@/lib/supabase/middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const supabaseResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    
    const cookieHeader = response.headers.get('set-cookie');
    if (cookieHeader) {
      supabaseResponse.headers.set('set-cookie', cookieHeader);
    }
    
    const cookies = request.cookies.getAll();
    const hasSession = cookies.some(cookie => 
      cookie.name.includes('auth-token') || cookie.name.includes('sb-')
    );
    
    if (!hasSession) {
      const redirectUrl = new URL('/auth/sign-in', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};