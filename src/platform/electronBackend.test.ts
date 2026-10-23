import { chooseStores } from './chooseStores';
import { ELECTRON_BACKEND, electronBackendIn } from './electronBackend';
import type { SlotName } from './storageBackend';

/** A stand-in for the desktop app's preload: slot files kept in a map. */
function fakeBridge(files = new Map<SlotName, string>()) {
  return {
    kind: 'electron',
    read: (slot: SlotName) => Promise.resolve(files.get(slot) ?? null),
    write: (slot: SlotName, data: string) => {
      files.set(slot, data);
      return Promise.resolve();
    },
    remove: (slot: SlotName) => {
      files.delete(slot);
      return Promise.resolve();
    },
  };
}

describe('the desktop app’s backend', () => {
  it('reads, writes and removes slots through the bridge', async () => {
    const files = new Map<SlotName, string>([['save', '{"day":3}']]);
    const backend = electronBackendIn({ shinobiNative: fakeBridge(files) });
    expect(backend).not.toBeNull();
    expect(await backend!.read('save')).toBe('{"day":3}');
    expect(await backend!.read('prefs')).toBeNull();
    await backend!.write('prefs', '{"music":1}');
    expect(files.get('prefs')).toBe('{"music":1}');
    await backend!.remove('save');
    expect(files.has('save')).toBe(false);
  });

  it('is not there outside the app', () => {
    expect(electronBackendIn({})).toBeNull();
    expect(electronBackendIn(null)).toBeNull();
    expect(electronBackendIn(undefined)).toBeNull();
    expect(ELECTRON_BACKEND.detect()).toBeNull();
  });

  it('ignores anything that isn’t the desktop app’s bridge', () => {
    const bridge = fakeBridge();
    expect(electronBackendIn({ shinobiNative: { ...bridge, kind: 'capacitor' } })).toBeNull();
    expect(electronBackendIn({ shinobiNative: { ...bridge, read: 'nope' } })).toBeNull();
    expect(electronBackendIn({ shinobiNative: 'electron' })).toBeNull();
  });

  it('refuses an answer that isn’t text', async () => {
    const odd = { ...fakeBridge(), read: () => Promise.resolve({ day: 3 }) };
    await expect(electronBackendIn({ shinobiNative: odd })!.read('save')).rejects.toThrow();
  });

  it('passes on a failed write, so the game can say its save didn’t keep', async () => {
    const full = { ...fakeBridge(), write: () => Promise.reject(new Error('disk full')) };
    await expect(electronBackendIn({ shinobiNative: full })!.write('save', '{}')).rejects.toThrow(
      'disk full',
    );
  });

  it('is the one the game chooses inside the app', async () => {
    Object.assign(globalThis, {
      shinobiNative: fakeBridge(new Map([['save', 'from the desktop']])),
    });
    try {
      const chosen = await chooseStores();
      expect(chosen.shell).toBe('electron');
      expect(chosen.stores.save.load()).toBe('from the desktop');
    } finally {
      Reflect.deleteProperty(globalThis, 'shinobiNative');
    }
  });
});
