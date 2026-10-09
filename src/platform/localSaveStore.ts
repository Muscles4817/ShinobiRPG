import type { SaveStore } from '@/game';

const KEY = 'shinobi-rpg/save';

/** Persists the save in the browser's localStorage. Survives offline use and app restarts. */
export function createLocalSaveStore(storage: Storage = window.localStorage): SaveStore {
  return {
    load: () => storage.getItem(KEY),
    save: (data) => {
      storage.setItem(KEY, data);
    },
    clear: () => {
      storage.removeItem(KEY);
    },
  };
}
