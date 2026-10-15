import type { SaveStore } from '@/game';

const SAVE_KEY = 'shinobi-rpg/save';
const PREFS_KEY = 'shinobi-rpg/prefs';

function storeAt(storage: Storage, key: string): SaveStore {
  return {
    load: () => storage.getItem(key),
    save: (data) => {
      storage.setItem(key, data);
    },
    clear: () => {
      storage.removeItem(key);
    },
  };
}

/** Persists the save in the browser's localStorage. Survives offline use and app restarts. */
export function createLocalSaveStore(storage: Storage = window.localStorage): SaveStore {
  return storeAt(storage, SAVE_KEY);
}

/** The device's own settings (sound), kept apart so they outlive any one save. */
export function createLocalPrefsStore(storage: Storage = window.localStorage): SaveStore {
  return storeAt(storage, PREFS_KEY);
}
