import { useEffect, useState, type RefObject } from 'react';

/** The width over the height of an element as laid out, kept up to date as it resizes. */
export function usePaneAspect(pane: RefObject<HTMLElement | null>, fallback: number): number {
  const [aspect, setAspect] = useState(fallback);
  useEffect(() => {
    const element = pane.current;
    if (!element || typeof ResizeObserver !== 'function') return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.contentRect;
      if (box && box.width > 0 && box.height > 0) setAspect(box.width / box.height);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [pane]);
  return aspect;
}
