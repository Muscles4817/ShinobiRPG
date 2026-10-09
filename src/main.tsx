import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import { createDefaultContext } from '@/game';
import { createLocalSaveStore } from '@/platform/localSaveStore';
import { App } from '@/ui/App';
import '@/ui/styles.css';

// Composition root for the app: choose the platform adapters and game context here.
const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <App ctx={createDefaultContext()} store={createLocalSaveStore()} />
  </StrictMode>,
);

registerSW({ immediate: true });
