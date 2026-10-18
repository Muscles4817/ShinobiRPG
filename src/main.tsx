import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import { createLocalPrefsStore, createLocalSaveStore } from '@/platform/localSaveStore';
import { App } from '@/ui/App';
import '@/ui/theme/fonts.css';
import '@/ui/theme/tokens.css';
import '@/ui/theme/base.css';
import '@/ui/styles/shell.css';
import '@/ui/styles/hub.css';
import '@/ui/styles/scenery.css';
import '@/ui/styles/places.css';
import '@/ui/styles/compounds.css';
import '@/ui/styles/companions.css';
import '@/ui/styles/leisure.css';
import '@/ui/styles/board.css';
import '@/ui/styles/you.css';
import '@/ui/styles/scenes.css';
import '@/ui/styles/story.css';
import '@/ui/styles/encounter.css';
import '@/ui/styles/exam.css';
import '@/ui/styles/creation.css';
import '@/ui/styles/people.css';
import '@/ui/styles/profile.css';
import '@/ui/styles/teachers.css';
import '@/ui/styles/sensei.css';
import '@/ui/styles/library.css';
import '@/ui/styles/plan.css';
import '@/ui/styles/watch.css';
import '@/ui/styles/cues.css';
import '@/ui/styles/cues-village.css';
import '@/ui/styles/motion.css';
import '@/ui/styles/menu.css';
import '@/ui/styles/settings.css';
import '@/ui/styles/dayend.css';
import '@/ui/styles/honours.css';
import './ui/styles/rival.css';
import '@/ui/styles/notes.css';
import '@/ui/styles/home.css';

// Composition root for the app: choose the platform adapters here.
const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <App store={createLocalSaveStore()} prefs={createLocalPrefsStore()} />
  </StrictMode>,
);

registerSW({ immediate: true });
