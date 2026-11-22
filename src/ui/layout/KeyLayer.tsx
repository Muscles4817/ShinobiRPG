import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * Which layer of the screen the keys belong to: a stack in which only the top-most layer is live.
 * Everything laid over the page (a report, the day's sheet, a person's drawer, the fight guide, a
 * notice, the stove) renders inside a `KeyLayer`, which goes on the stack while it is open, and
 * every key handler outside the top layer (`useKeys`, a layer's own Esc) is suspended. So a key
 * reaches only what is on top, wherever the sheet is drawn, and no host has to say what is
 * under it. The page itself is the base layer, live only while nothing is open. A layer opened
 * later sits above one opened earlier (layers are numbered as they are drawn, parents first).
 */

/** The page under every sheet. */
const BASE = 0;

interface KeyStack {
  /** Every open layer's number. */
  readonly open: readonly number[];
  readonly number: () => number;
  readonly add: (layer: number) => void;
  readonly remove: (layer: number) => void;
}

const Stack = createContext<KeyStack | null>(null);
const Layer = createContext(BASE);

/** Keeps the stack of open layers, for the whole app. Without it every key is live (tests). */
export function KeyLayers({ children }: { readonly children: ReactNode }) {
  const [open, setOpen] = useState<readonly number[]>([]);
  const counter = useRef(BASE);
  const number = useCallback(() => (counter.current += 1), []);
  const add = useCallback((layer: number) => {
    setOpen((o) => [...o, layer]);
  }, []);
  const remove = useCallback((layer: number) => {
    setOpen((o) => o.filter((l) => l !== layer));
  }, []);
  const stack = useMemo(() => ({ open, number, add, remove }), [open, number, add, remove]);
  return <Stack.Provider value={stack}>{children}</Stack.Provider>;
}

function topOf(stack: KeyStack): number {
  return stack.open.length > 0 ? Math.max(...stack.open) : BASE;
}

/** Whether `layer` is the top-most one, so its keys reach anything. */
function useIsTop(layer: number): boolean {
  const stack = useContext(Stack);
  return stack === null || topOf(stack) === layer;
}

interface KeyLayerProps {
  /** Esc closes it, while it is on top. */
  readonly onEscape?: () => void;
  readonly children: ReactNode;
}

/** Something laid over the page: on the stack while it is drawn, and Esc closes it when asked. */
export function KeyLayer({ onEscape, children }: KeyLayerProps) {
  const stack = useContext(Stack);
  const [layer] = useState(() => stack?.number() ?? BASE);
  const add = stack?.add;
  const remove = stack?.remove;
  // Before paint, so the page under a sheet is never live for a frame once the sheet is drawn.
  useLayoutEffect(() => {
    add?.(layer);
    return () => {
      remove?.(layer);
    };
  }, [add, remove, layer]);
  const top = useIsTop(layer);
  useEffect(() => {
    if (!top || !onEscape) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [top, onEscape]);
  return <Layer.Provider value={layer}>{children}</Layer.Provider>;
}

/** Whether keys bound here reach anything: false while a layer is open above this one. */
export function useKeysLive(): boolean {
  return useIsTop(useContext(Layer));
}
