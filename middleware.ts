import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Rutas que requieren autenticación
  const isProtectedAdminPath = pathname.startsWith('/admin') && pathname !== '/admin/login';
  
  // Endpoints de la API que mutan el estado y requieren autenticación
  const isProtectedApi = pathname.startsWith('/api/') && 
    !pathname.startsWith('/api/cron') && 
    !pathname.startsWith('/api/auth') && 
    !pathname.startsWith('/api/car-requests') &&
    !pathname.startsWith('/api/test-drives') &&
    !pathname.startsWith('/api/price-alerts') &&
    !pathname.startsWith('/api/trade-in') &&
    // Permitir GET público para consultar catálogo y configuraciones
    !(request.method === 'GET' && (
      pathname.startsWith('/api/vehicles') || 
      pathname.startsWith('/api/spin') || 
      pathname.startsWith('/api/settings') || 
      pathname.startsWith('/api/photos')
    ));

  if (isProtectedAdminPath || isProtectedApi) {
    const sessionCookie = request.cookies.get('rgmotors_session')?.value;
    const adminPassword = process.env.ADMIN_PASSWORD || 'rgmotors2026';

    if (!sessionCookie || sessionCookie !== adminPassword) {
      if (isProtectedApi) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
