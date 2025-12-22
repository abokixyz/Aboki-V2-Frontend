// ============= middleware.ts (Create in root directory) =============
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = request.nextUrl.clone();
  
  // Check if the request is from a PWA
  const isPWA = 
    request.headers.get('sec-fetch-mode') === 'navigate' &&
    request.headers.get('sec-fetch-dest') === 'document' ||
    userAgent.includes('wv'); // WebView indicator
  
  // Check for standalone mode via custom header or query param
  const isStandalone = url.searchParams.has('standalone');
  
  // If accessing from regular browser and not on install page
  if (!isPWA && !isStandalone && url.pathname !== '/install') {
    // Redirect to install page or show gate
    console.log('🚫 Browser access detected, enforcing PWA');
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

// ============= components/PWARedirect.tsx =============
// Add this to your PWAGate component or as a separate component
"use client"

import { useEffect } from 'react';

export function PWARedirect() {
  useEffect(() => {
    // Detect if opened from PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone ||
                  document.referrer.includes('android-app://');

    // If not PWA and there's a PWA URL scheme, redirect to it
    if (!isPWA && window.location.protocol === 'https:') {
      // Try to open the PWA version
      const pwaUrl = `${window.location.origin}${window.location.pathname}?standalone=true`;
      
      // For iOS, we can't force open, but we can suggest
      // For Android, the browser will handle this
      
      console.log('📱 Attempting to open in PWA mode:', pwaUrl);
      
      // Store the current URL to redirect after install
      sessionStorage.setItem('aboki_redirect_after_install', window.location.href);
    }

    // Listen for when user returns from installing PWA
    if (isPWA) {
      const redirectUrl = sessionStorage.getItem('aboki_redirect_after_install');
      if (redirectUrl) {
        sessionStorage.removeItem('aboki_redirect_after_install');
        window.location.href = redirectUrl;
      }
    }
  }, []);

  return null;
}