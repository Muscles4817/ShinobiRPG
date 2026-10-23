import type { NativeBackend, SlotName, StorageBackend } from './storageBackend';

/**
 * The desktop app's files. Its preload (`electron/preload.cts`) puts `shinobiNative` on the
 * window: three calls the main process answers with a file per slot in the app's data folder.
 * The page can't tell what that bridge really is, so it is checked here, and so is every answer.
 */

/** What the desktop app's preload exposes; anything else on the window is ignored. */
interface ElectronBridge {
  readonly kind: 'electron';
  readonly read: (slot: SlotName) => Promise<unknown>;
  readonly write: (slot: SlotName, data: string) => Promise<unknown>;
  readonly remove: (slot: SlotName) => Promise<unknown>;
}

function isBridge(value: unknown): value is ElectronBridge {
  if (typeof value !== 'object' || value === null) return false;
  const bridge: Partial<Record<keyof ElectronBridge, unknown>> = value;
  return (
    bridge.kind === 'electron' &&
    typeof bridge.read === 'function' &&
    typeof bridge.write === 'function' &&
    typeof bridge.remove === 'function'
  );
}

/** The bridge on a window (or any global scope), if the desktop app put one there. */
function bridgeIn(scope: unknown): ElectronBridge | null {
  if (typeof scope !== 'object' || scope === null || !('shinobiNative' in scope)) return null;
  return isBridge(scope.shinobiNative) ? scope.shinobiNative : null;
}

function backendOver(bridge: ElectronBridge): StorageBackend {
  return {
    read: async (slot) => {
      const data = await bridge.read(slot);
      if (data === null || typeof data === 'string') return data;
      throw new Error(`The desktop app sent something other than text for ${slot}.`);
    },
    write: async (slot, data) => {
      await bridge.write(slot, data);
    },
    remove: async (slot) => {
      await bridge.remove(slot);
    },
  };
}

/** The desktop app's backend in a scope, or null outside the app. */
export function electronBackendIn(scope: unknown): StorageBackend | null {
  const bridge = bridgeIn(scope);
  return bridge ? backendOver(bridge) : null;
}

export const ELECTRON_BACKEND: NativeBackend = {
  name: 'electron',
  detect: () => electronBackendIn(globalThis),
};
