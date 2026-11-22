import { createContext, useContext, type ReactNode } from 'react';

/**
 * Which layer of the screen the keys belong to. Whatever is laid over play (a report, the day's
 * sheet, a drawer) puts what is under it in a layer that isn't live, and every key handler in a
 * layer that isn't live (`useKeys`, `useCloseOnEscape`) is suspended: a key can only ever reach
 * what is on top, whatever drew the layers. The layers nest: one inside a layer that isn't live
 * isn't live either.
 */

const KeysLive = createContext(true);

interface KeyLayerProps {
  /** Nothing is laid over this layer. */
  readonly live: boolean;
  readonly children: ReactNode;
}

export function KeyLayer({ live, children }: KeyLayerProps) {
  const above = useContext(KeysLive);
  return <KeysLive.Provider value={above && live}>{children}</KeysLive.Provider>;
}

/** Whether keys bound here reach anything: false while something is laid over this layer. */
export function useKeysLive(): boolean {
  return useContext(KeysLive);
}
