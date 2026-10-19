import { useEffect } from 'react';

/**
 * Keyboard shortcuts for the desktop layout: a key (as `KeyboardEvent.key`, ' ' for Space)
 * mapped to what it does. Keys typed into a field, pressed with a modifier (the browser's own
 * shortcuts), or Enter and Space on a focused control (which already press it) are left alone.
 */

export type KeyBindings = Readonly<Record<string, (() => void) | undefined>>;

const FIELDS = ['INPUT', 'TEXTAREA', 'SELECT'];
const CONTROLS = ['BUTTON', 'A', 'SUMMARY'];

/** Whether a key press belongs to the page rather than to what has focus. */
function forThePage(event: KeyboardEvent): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  const target = event.target;
  if (!(target instanceof HTMLElement)) return true;
  if (target.isContentEditable || FIELDS.includes(target.tagName)) return false;
  const presses = event.key === 'Enter' || event.key === ' ';
  return !(presses && CONTROLS.includes(target.tagName));
}

/** Listens for the bound keys while `enabled`. */
export function useKeys(bindings: KeyBindings, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = (event: KeyboardEvent) => {
      const run = bindings[event.key];
      if (!run || !forThePage(event)) return;
      event.preventDefault();
      run();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [bindings, enabled]);
}
