import type { Sighting } from './observe';

/**
 * The owner's choice for a technique seen for the first time: say what is visibly true instead
 * of a name. Only what was seen clearly is said: the element from the chakra flare, the reach
 * from where the weight goes, and seals in the hands. A glimpse is left out (it is misread a
 * fifth of the time).
 */

export interface Description {
  /** An element seen in the flare; null when the flare was raw chakra. */
  readonly element?: string | null;
  readonly reach?: 'close' | 'range';
  readonly seals?: boolean;
}

const ELEMENT_WORDS: Readonly<Record<string, string>> = {
  fire: 'fire',
  water: 'water',
  wind: 'wind',
  earth: 'earth',
  lightning: 'lightning',
};

export function describe(seen: Sighting): Description {
  const clear = (channel: keyof Sighting) =>
    seen[channel]?.quality === 'clear' ? seen[channel]!.value : undefined;
  const flare = clear('chakra');
  const body = clear('body');
  const hands = clear('hands');
  return {
    ...(flare?.startsWith('flare:')
      ? { element: flare === 'flare:raw' ? null : flare.slice(6) }
      : {}),
    ...(body === 'forward'
      ? { reach: 'close' as const }
      : body === 'square'
        ? { reach: 'range' as const }
        : {}),
    ...(hands === 'seals' ? { seals: true } : {}),
  };
}

/** Whether anything at all was described. */
export function saysAnything(d: Description): boolean {
  return d.element !== undefined || d.reach !== undefined || d.seals !== undefined;
}

/** The panel's line: "An unfamiliar fire technique, at range, with seals". No numbers. */
export function describedLine(d: Description, hedge: string): string {
  const element = d.element ? `${ELEMENT_WORDS[d.element] ?? d.element} ` : '';
  const where = d.reach === 'close' ? ', up close' : d.reach === 'range' ? ', at range' : '';
  const seals = d.seals ? ', with seals' : '';
  const said = `${hedge}an unfamiliar ${element}technique${where}${seals}`;
  return `${said.charAt(0).toUpperCase()}${said.slice(1)}.`;
}
