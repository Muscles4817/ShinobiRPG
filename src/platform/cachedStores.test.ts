import { cachedStore, openCachedStores } from './cachedStores';
import type { SlotName, StorageBackend } from './storageBackend';

/** A backend in memory whose writes wait to be let go, so a test can see what queues up. */
function slowBackend(initial: Partial<Record<SlotName, string>> = {}) {
  const files = new Map<SlotName, string>(Object.entries(initial) as [SlotName, string][]);
  const writes: string[] = [];
  let release: (() => void) | null = null;
  let failNext = false;
  const backend: StorageBackend = {
    read: (slot) => Promise.resolve(files.get(slot) ?? null),
    write: (slot, data) =>
      new Promise<void>((resolve, reject) => {
        release = () => {
          release = null;
          if (failNext) {
            failNext = false;
            reject(new Error('disk full'));
            return;
          }
          writes.push(data);
          files.set(slot, data);
          resolve();
        };
      }),
    remove: (slot) => {
      files.delete(slot);
      return Promise.resolve();
    },
  };
  const letGo = async () => {
    await Promise.resolve();
    release?.();
    await new Promise((r) => setTimeout(r, 0));
  };
  return {
    backend,
    files,
    writes,
    letGo,
    failNextWrite: () => {
      failNext = true;
    },
  };
}

describe('stores in front of a native backend', () => {
  it('reads every slot once at the start, so loading is instant', async () => {
    const { backend } = slowBackend({ save: 'the save', prefs: 'loud' });
    const { stores } = await openCachedStores(backend);
    expect(stores.save.load()).toBe('the save');
    expect(stores.prefs.load()).toBe('loud');
    expect(stores.edits.load()).toBeNull();
  });

  it('keeps a save at once and writes it behind, the newest winning', async () => {
    const disk = slowBackend();
    const store = cachedStore(disk.backend, 'save', null);
    store.save('one');
    store.save('two');
    store.save('three');
    expect(store.load()).toBe('three');
    await disk.letGo();
    await disk.letGo();
    await store.flushed();
    expect(disk.writes).toEqual(['one', 'three']);
    expect(disk.files.get('save')).toBe('three');
  });

  it('says a write failed on the next save, and recovers once one lands', async () => {
    const disk = slowBackend();
    const store = cachedStore(disk.backend, 'save', null);
    disk.failNextWrite();
    store.save('one');
    await disk.letGo();
    await store.flushed();
    expect(() => {
      store.save('two');
    }).toThrow('disk full');
    await disk.letGo();
    await store.flushed();
    expect(() => {
      store.save('three');
    }).not.toThrow();
    await disk.letGo();
    await store.flushed();
    expect(disk.files.get('save')).toBe('three');
  });

  it('empties the slot after a write under way, so a cleared save stays gone', async () => {
    const disk = slowBackend();
    const store = cachedStore(disk.backend, 'save', null);
    store.save('one');
    store.clear();
    expect(store.load()).toBeNull();
    await disk.letGo();
    await store.flushed();
    expect(disk.files.has('save')).toBe(false);
  });
});
