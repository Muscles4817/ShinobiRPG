import { NUMBERED_CHOICES } from './useChoiceKeys';
import { useKeys } from './useKeys';

/**
 * Number keys and Enter for a story scene's choice bar on the desktop layout: the scenes that
 * keep one column (an encounter, a talk, an exam, team assignment, a ceremony…) all lay their
 * choices out as buttons in a `.choices` bar, so the keys press those buttons in the order they
 * are shown, whatever drew them. 1 is the first, a disabled one keeps its number and does
 * nothing, and Enter presses the primary choice. Rendered in place of nothing: it only listens.
 */

const BAR = 'nav.choices';

function press(button: Element | null | undefined): void {
  if (button instanceof HTMLButtonElement && !button.disabled) button.click();
}

function pressNumber(n: number): () => void {
  return () => {
    press(document.querySelectorAll(`${BAR} button`)[n]);
  };
}

const BINDINGS = {
  ...Object.fromEntries(
    Array.from({ length: NUMBERED_CHOICES }, (_, i) => [String(i + 1), pressNumber(i)]),
  ),
  Enter: () => {
    press(document.querySelector(`${BAR} .choice.primary`));
  },
};

export function ChoiceBarKeys() {
  useKeys(BINDINGS, true);
  return null;
}
