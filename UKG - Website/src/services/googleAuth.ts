import { Capacitor, registerPlugin } from '@capacitor/core';
import { resolveApiUrl, isNativeAndroidApp } from '../config/apiConfig';
import { api } from './api';

export const GOOGLE_WEB_CLIENT_ID = '930096798748-0prheaa69sbjltnh9o6na13eub75qsv2.apps.googleusercontent.com';

export interface GoogleAuthResult {
  success: boolean;
  canceled?: boolean;
  error?: string;
  statusCode?: number;
  user?: any;
  token?: string;
}

export interface NativeGoogleAuthPlugin {
  signIn(options?: { serverClientId?: string }): Promise<{
    success: boolean;
    canceled?: boolean;
    error?: string;
    statusCode?: number;
    idToken?: string;
    email?: string;
    displayName?: string;
    photoUrl?: string;
    id?: string;
    serverAuthCode?: string;
  }>;
  signOut(options?: { serverClientId?: string }): Promise<{ success: boolean }>;
}

export const NativeGoogleAuth = registerPlugin<NativeGoogleAuthPlugin>('GoogleAuth');

export const isNativePlatform = (): boolean => {
  try {
    return Capacitor.isNativePlatform() || isNativeAndroidApp();
  } catch {
    return false;
  }
};

/**
 * Sends a verified Google ID token to the Express backend
 * to authenticate or create the Supabase user session.
 */
export async function authenticateWithBackend(idToken: string): Promise<GoogleAuthResult> {
  if (!idToken || typeof idToken !== 'string') {
    return { success: false, error: 'Google credential token is missing.' };
  }

  try {
    const response = await fetch(resolveApiUrl('/api/auth/google'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: isNativePlatform() ? 'omit' : 'include',
      body: JSON.stringify({ credential: idToken.trim() }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data?.error || 'Google authentication failed on server. Please try again.',
      };
    }

    if (data.token || data.sessionId) {
      api.setSessionToken(data.token || data.sessionId);
    }

    return {
      success: true,
      user: data.user,
      token: data.token || data.sessionId,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Unable to connect to Uttarakhand Gateways authentication server.',
    };
  }
}

/**
 * Initiates Google Sign-In:
 * - On Native Android: Triggers native Google Play Services account chooser bottom-sheet.
 * - On Web: Triggers Google Identity Services prompt.
 */
export async function signInWithGoogle(serverClientId = GOOGLE_WEB_CLIENT_ID): Promise<GoogleAuthResult> {
  if (isNativePlatform()) {
    try {
      const nativeRes = await NativeGoogleAuth.signIn({ serverClientId });

      if (nativeRes.canceled) {
        return { success: false, canceled: true };
      }

      if (!nativeRes.success || !nativeRes.idToken) {
        return {
          success: false,
          canceled: false,
          statusCode: nativeRes.statusCode,
          error: nativeRes.error || 'Google Sign-In was not completed.',
        };
      }

      // Pass ID token to backend for cryptographic verification & session generation
      return await authenticateWithBackend(nativeRes.idToken);
    } catch (err: any) {
      return {
        success: false,
        canceled: false,
        error: err?.message || 'Google Sign-In failed to initialize.',
      };
    }
  }

  // Web Browser fallback
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !(window as any).google?.accounts?.id) {
      resolve({
        success: false,
        error: 'Google Identity Services is loading. Please try again in a moment.',
      });
      return;
    }

    try {
      (window as any).google.accounts.id.initialize({
        client_id: serverClientId,
        callback: async (response: any) => {
          if (response?.credential) {
            const result = await authenticateWithBackend(response.credential);
            resolve(result);
          } else {
            resolve({ success: false, error: 'Google did not return credentials.' });
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If prompt was dismissed or blocked, resolve gracefully
        }
      });
    } catch (e: any) {
      resolve({ success: false, error: e?.message || 'Failed to trigger Google prompt.' });
    }
  });
}
