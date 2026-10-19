import { useEffect } from 'react';

import { DOCK_TABS, type DockTab } from '../components/Dock';

/**
 * Number keys switch dock tabs on the desktop layout: 1 is Here, 6 is Record. Keys typed into a
 * field, or pressed with a modifier (the browser's own shortcuts), are left alone.
 */

function typingInto(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/** The tab a key press asks for, or null when it isn't a tab key. */
export function tabForKey(event: KeyboardEvent): DockTab | null {
  if (event.ctrlKey || event.metaKey || event.altKey || typingInto(event.target)) return null;
  const index = Number(event.key) - 1;
  return Number.isInteger(index) ? (DOCK_TABS[index]?.id ?? null) : null;
}

/** Listens for tab keys while `enabled`. */
export function useDockKeys(enabled: boolean, onSelect: (tab: DockTab) => void): void {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = (event: KeyboardEvent) => {
      const tab = tabForKey(event);
      if (!tab) return;
      event.preventDefault();
      onSelect(tab);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [enabled, onSelect]);
}
