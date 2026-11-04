import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppRoutes from './routes/AppRoutes';
import './styles/global.css';

// Remove registrations left by the former installable site, including its root worker.
if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      void registration.unregister();
    }
  });
}
if ('caches' in window) {
  void caches.keys().then((keys) => {
    for (const key of keys) {
      if (key.startsWith('catrion-')) void caches.delete(key);
    }
  });
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <AppRoutes />
  </StrictMode>
);
