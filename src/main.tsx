import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import { createLocalSaveStore } from '@/platform/localSaveStore';
import { App } from '@/ui/App';
import '@/ui/theme/tokens.css';
import '@/ui/theme/base.css';
import '@/ui/styles/shell.css';
import '@/ui/styles/hub.css';
import '@/ui/styles/places.css';
import '@/ui/styles/board.css';
import '@/ui/styles/you.css';
import '@/ui/styles/scenes.css';
import '@/ui/styles/creation.css';

// Composition root for the app: choose the platform adapters here.
const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <App store={createLocalSaveStore()} />
  </StrictMode>,
);

registerSW({ immediate: true });
