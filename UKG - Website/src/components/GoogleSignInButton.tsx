import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = '930096798748-0prheaa69sbjltnh9o6na13eub75qsv2.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInButtonProps {
  mode?: 'login' | 'register';
  isHindi?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  mode = 'login',
  isHindi = false,
  onSuccess,
  onError,
  className = '',
}) => {
  const { loginWithGoogle } = useAuth();
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);

  useEffect(() => {
    let checkInterval: any = null;

    const initializeGis = () => {
      if (typeof window === 'undefined' || !window.google?.accounts?.id) {
        return false;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response?.credential) {
              setIsLoading(true);
              const result = await loginWithGoogle(response.credential);
              setIsLoading(false);

              if (result.success) {
                if (onSuccess) onSuccess();
              } else {
                if (onError) onError(result.error || 'Google login failed.');
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (buttonContainerRef.current) {
          buttonContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(buttonContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: mode === 'register' ? 'signup_with' : 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 320,
          });
        }

        setGisLoaded(true);
        return true;
      } catch (err) {
        console.warn('[Google Auth] GIS initialization note:', err);
        return false;
      }
    };

    if (!initializeGis()) {
      checkInterval = setInterval(() => {
        if (initializeGis()) {
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [mode, loginWithGoogle, onSuccess, onError]);

  const handleManualPrompt = () => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (e) {
        console.warn('Google prompt trigger:', e);
      }
    } else {
      if (onError) {
        onError(isHindi ? 'Google सेवाएं लोड हो रही हैं, कृपया कुछ क्षण प्रतीक्षा करें।' : 'Google services are loading. Please wait a moment.');
      }
    }
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      {isLoading ? (
        <div className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>{isHindi ? 'Google से साइन इन हो रहा है...' : 'Signing in with Google...'}</span>
        </div>
      ) : (
        <div className="w-full flex justify-center">
          {/* Official Google Identity Button rendered by Google SDK */}
          <div ref={buttonContainerRef} className="min-h-[44px] flex justify-center w-full" />

          {/* Fallback button if GIS script hasn't mounted yet or is blocked */}
          {!gisLoaded && (
            <button
              type="button"
              onClick={handleManualPrompt}
              className="w-full max-w-[320px] py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{mode === 'register' ? (isHindi ? 'Google से साइन अप करें' : 'Sign up with Google') : (isHindi ? 'Google से साइन इन करें' : 'Sign in with Google')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
