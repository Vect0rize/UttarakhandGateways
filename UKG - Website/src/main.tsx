import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Prevent accidental mouse-wheel / trackpad scroll value changes on numeric inputs globally
if (typeof document !== 'undefined') {
  document.addEventListener(
    'wheel',
    () => {
      const active = document.activeElement as HTMLInputElement | null;
      if (active && active.tagName === 'INPUT' && active.type === 'number') {
        active.blur();
      }
    },
    { passive: true, capture: true }
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="Uttarakhand Gateways">
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
);
