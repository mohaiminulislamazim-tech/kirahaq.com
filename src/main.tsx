import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle and suppress benign Vite WebSocket HMR notices and browser extension wallet injector errors (e.g. MetaMask in sandboxed iframes)
if (typeof window !== 'undefined') {
  const isIgnorableError = (msg: string) => {
    const lower = (msg || '').toLowerCase();
    return (
      lower.includes('websocket') ||
      lower.includes('vite') ||
      lower.includes('metamask') ||
      lower.includes('ethereum') ||
      lower.includes('web3') ||
      lower.includes('phantom') ||
      lower.includes('solana') ||
      lower.includes('chrome-extension://') ||
      lower.includes('moz-extension://')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = reason?.message || String(reason || '');
    if (isIgnorableError(msg)) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || event.error?.message || '';
    if (isIgnorableError(msg)) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

