import { Capacitor } from '@capacitor/core';

/**
 * Single Source of Truth for Uttarakhand Gateways Backend URL
 */
export const PRODUCTION_API_ORIGIN = 'https://uttarakhandgateways.com';

/**
 * Check if the application is running in an Android / Capacitor environment
 */
export function isNativeAndroidApp(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Capacitor native platform check
    if (Capacitor.isNativePlatform()) {
      return true;
    }

    const platform = Capacitor.getPlatform();
    if (platform === 'android' || platform === 'ios') {
      return true;
    }

    // 2. Origin / protocol checks for Android WebView
    const origin = window.location.origin || '';
    const protocol = window.location.protocol || '';
    const hostname = window.location.hostname || '';

    if (
      protocol === 'capacitor:' ||
      protocol === 'file:' ||
      origin.startsWith('capacitor://') ||
      origin.startsWith('ionic://') ||
      (hostname === 'localhost' && !window.location.port) ||
      (typeof window !== 'undefined' && window.location.search.includes('view=mobile-app'))
    ) {
      return true;
    }
  } catch {}

  return false;
}

/**
 * Returns the base URL for API requests.
 * - On Native Android (Capacitor): ALWAYS returns 'https://uttarakhandgateways.com'
 * - If VITE_API_URL environment variable is set: returns that override
 * - Node.js testing environment (typeof window === 'undefined'): returns 'https://uttarakhandgateways.com'
 * - On Web: returns '' (relative to current origin, which proxies or hits the server directly)
 */
export function getApiBaseUrl(): string {
  // 1. Explicit environment variable override if provided
  try {
    const envUrl = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_API_URL)
      || (typeof process !== 'undefined' && process.env?.VITE_API_URL);
    if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
      return envUrl.trim().replace(/\/+$/, '');
    }
  } catch {}

  // 2. Native Android App (Capacitor)
  if (isNativeAndroidApp()) {
    return PRODUCTION_API_ORIGIN;
  }

  // 3. Node.js environment or tests
  if (typeof window === 'undefined') {
    return PRODUCTION_API_ORIGIN;
  }

  // 4. Localhost in development when developer explicitly sets VITE_USE_LIVE_API=true
  try {
    const liveApi = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_USE_LIVE_API)
      || (typeof process !== 'undefined' && process.env?.VITE_USE_LIVE_API);
    if (liveApi === 'true') {
      return PRODUCTION_API_ORIGIN;
    }
  } catch {}

  // 5. Same-origin for web production deployment
  return '';
}

/**
 * Resolves an API path (e.g. '/api/properties') to an absolute URL when needed
 */
export function resolveApiUrl(path: string): string {
  if (!path) return '';

  // If path is a localhost / capacitor URL in native app, redirect to live production origin
  if (
    path.startsWith('http://localhost/api/') || 
    path.startsWith('https://localhost/api/') || 
    path.startsWith('capacitor://localhost/api/')
  ) {
    const apiPath = path.replace(/^https?:\/\/[^\/]+/, '').replace(/^capacitor:\/\/[^\/]+/, '');
    return `${PRODUCTION_API_ORIGIN}${apiPath}`;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return base ? `${base}${cleanPath}` : cleanPath;
}

/**
 * Resolves a property image URL:
 * - If it's already an absolute URL (Supabase CDN, Unsplash, HTTPS), returns as is.
 * - If it's a relative path (e.g. '/uploads/...'), prepends the production website origin.
 * - If it's a base64 data URL, returns as is.
 */
export function resolveImageUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '/logo.png';
  const trimmed = url.trim();
  if (!trimmed) return '/logo.png';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Relative path (like /uploads/ukg_123.jpg or /logo.png)
  if (trimmed.startsWith('/uploads/')) {
    return `${PRODUCTION_API_ORIGIN}${trimmed}`;
  }

  return trimmed;
}

/**
 * Global Network Interceptor:
 * Ensures all network fetch calls to /api/... from any part of the app
 * are automatically directed to the live backend with auth headers.
 */
export function setupNetworkInterceptor(): void {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;
  if (!originalFetch) return;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    try {
      let url = typeof input === 'string'
        ? input
        : input instanceof URL
        ? input.toString()
        : (input as Request).url;

      const isApiRequest = 
        url.startsWith('/api/') || 
        url.startsWith('api/') || 
        url.includes('localhost/api/') || 
        url.includes('capacitor://localhost/api/');

      if (isApiRequest) {
        const resolvedUrl = resolveApiUrl(url);
        const newInit: RequestInit = { ...(init || {}) };
        const headers = new Headers(
          newInit.headers ||
          (typeof input === 'object' && 'headers' in input ? (input as Request).headers : undefined) ||
          {}
        );

        // Auto-inject auth session token if present
        try {
          const token = localStorage.getItem('ukg_session_token') || sessionStorage.getItem('ukg_session_token');
          if (token) {
            if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
            if (!headers.has('X-Session-Token')) headers.set('X-Session-Token', token);
          }
        } catch {}

        newInit.headers = headers;

        // In native Android WebView, avoid credentials: 'include' on cross-origin requests
        // because backend returns Access-Control-Allow-Origin: * which breaks CORS with credentials
        if (isNativeAndroidApp()) {
          newInit.credentials = 'omit';
        } else if (!newInit.credentials) {
          newInit.credentials = 'include';
        }

        return originalFetch.call(this, resolvedUrl, newInit);
      }
    } catch {}

    return originalFetch.call(this, input, init);
  };
}

// Automatically setup interceptor on module evaluation in browser
if (typeof window !== 'undefined') {
  setupNetworkInterceptor();
}
