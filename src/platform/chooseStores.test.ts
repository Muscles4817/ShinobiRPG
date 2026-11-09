// @vitest-environment jsdom
import { chooseStores } from './chooseStores';
import type { StorageBackend } from './storageBackend';

const memory: StorageBackend = {
  read: (slot) => Promise.resolve(slot === 'save' ? 'from the shell' : null),
  write: () => Promise.resolve(),
  remove: () => Promise.resolve(),
};

describe('choosing where the game keeps its files', () => {
  it('uses a shell’s files when the game runs inside it', async () => {
    const chosen = await chooseStores([
      { name: 'elsewhere', detect: () => null },
      { name: 'desktop', detect: () => memory },
    ]);
    expect(chosen.shell).toBe('desktop');
    expect(chosen.stores.save.load()).toBe('from the shell');
  });

  it('falls back to the browser’s storage outside any shell', async () => {
    localStorage.setItem('shinobi-rpg/save', 'from the browser');
    const chosen = await chooseStores([{ name: 'desktop', detect: () => null }]);
    expect(chosen.shell).toBeNull();
    expect(chosen.stores.save.load()).toBe('from the browser');
    localStorage.clear();
  });
});
