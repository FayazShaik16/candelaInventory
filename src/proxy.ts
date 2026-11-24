import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let static assets and API routes pass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  let isAuthenticated = false;
  let userRole: string | null = null;
  let accountStatus: string | null = null;

  // 1. Check Supabase session if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-id')) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        isAuthenticated = true;
        const cookieRole = request.cookies.get('candela_role')?.value;
        const cookieStatus = request.cookies.get('candela_status')?.value;
        userRole = cookieRole || user.user_metadata?.role || 'employee';
        accountStatus = cookieStatus || user.user_metadata?.account_status || 'active';
      }
    } catch {
      // Ignore network/auth error during proxy check
    }
  }

  // 2. Check local session cookie fallback
  if (!isAuthenticated) {
    const sessionCookie = request.cookies.get('candela_session')?.value;
    const roleCookie = request.cookies.get('candela_role')?.value;
    const statusCookie = request.cookies.get('candela_status')?.value;

    if (sessionCookie) {
      isAuthenticated = true;
      userRole = roleCookie || 'employee';
      accountStatus = statusCookie || 'active';
    }
  }

  const isAuthPage = 
    pathname === '/login' || 
    pathname === '/forgot-password' || 
    pathname === '/reset-password';

  // If user is deactivated, force logout and redirect to login with error
  if (isAuthenticated && accountStatus === 'inactive') {
    if (!isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'deactivated');
      const res = NextResponse.redirect(url);
      res.cookies.delete('candela_session');
      res.cookies.delete('candela_role');
      res.cookies.delete('candela_status');
      return res;
    }
  }

  // If user explicitly visits /login with logout or switch parameter, clear session cookies
  if (pathname === '/login' && (request.nextUrl.searchParams.get('logout') === 'true' || request.nextUrl.searchParams.get('switch') === 'true')) {
    const res = NextResponse.next();
    res.cookies.delete('candela_session');
    res.cookies.delete('candela_role');
    res.cookies.delete('candela_status');
    return res;
  }

  // Redirect unauthenticated user to login
  if (!isAuthPage && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Enforce Admin-only routes (e.g. /users)
  if (pathname.startsWith('/users')) {
    if (userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'unauthorized_admin_required');
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
