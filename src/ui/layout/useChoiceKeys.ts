import { useKeys } from './useKeys';

/** A choice a key can make: one that is closed can't be taken, and the primary one is Enter's. */
interface Keyed {
  readonly closed?: string;
  readonly primary?: boolean;
}

/** The most choices that get a number key. */
export const NUMBERED_CHOICES = 9;

/**
 * Number keys take a scene's choices in order (1 is the first), and Enter takes the primary one,
 * on the desktop layout. A closed choice keeps its number but does nothing.
 */
export function useChoiceKeys<C extends Keyed>(
  choices: readonly C[],
  pick: (choice: C) => void,
  enabled: boolean,
): void {
  const open = (c: C | undefined) =>
    c && c.closed === undefined
      ? () => {
          pick(c);
        }
      : undefined;
  const numbered = choices
    .slice(0, NUMBERED_CHOICES)
    .map((c, i) => [String(i + 1), open(c)] as const);
  useKeys(
    Object.fromEntries([...numbered, ['Enter', open(choices.find((c) => c.primary))]]),
    enabled,
  );
}
