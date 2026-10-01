import { Buffer } from 'buffer';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// Midnight.js expects Node's Buffer in the browser.
(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
setNetworkId(import.meta.env.VITE_NETWORK_ID as string);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
