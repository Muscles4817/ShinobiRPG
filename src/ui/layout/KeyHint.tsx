import { NUMBERED_CHOICES } from './useChoiceKeys';

/** The number key that takes a choice, shown on the desktop layout beside its label. */
export function KeyHint({ index }: { readonly index: number }) {
  if (index >= NUMBERED_CHOICES) return null;
  return (
    <kbd className="key-hint" aria-hidden="true">
      {index + 1}
    </kbd>
  );
}
