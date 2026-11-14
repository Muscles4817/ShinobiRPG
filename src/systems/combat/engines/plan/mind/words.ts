import { findCard } from '../cards';
import type { PlanFighter } from '../state';
import { cardLabel } from '../wording';
import { confidence, faded, surenessOf, type Sureness } from './evidence';
import type { Beliefs } from './shape';

/**
 * A mind's beliefs about one fighter, said in words (`docs/design/combat-ai-plan.md` Part 5):
 * the likeliest of each set of rival habits, any capability shown and pools read low, each with
 * how sure the mind is, the surest first. Story text, so no numbers.
 */

/** Beliefs shown at once: the surest. */
const SHOWN = 4;
/** Below this confidence a belief isn't worth saying. */
const SAID_FROM = 0.5;

const PRIORS: Readonly<Record<string, number>> = {
  defence: 1 / 4,
  style: 1 / 6,
  card: 1 / 4,
  can: 0,
  low: 0.2,
};

const DEFENCE_WORDS: Readonly<Record<string, string>> = {
  guard: 'a Guard',
  dodge: 'a Dodge',
  counter: 'a Counter',
  swap: 'a substitution',
};
const BAND_WORDS: Readonly<Record<string, string>> = {
  close: 'up close',
  mid: 'at mid range',
  far: 'at range',
};
const STYLE_WORDS: Readonly<Record<string, string>> = {
  blow: 'Fights mostly hand to hand',
  flurry: 'Leans on flurries of blows',
  break: 'Leans on guard-breakers',
  sure: 'Leans on attacks that seldom miss',
  illusion: 'Leans on illusions',
  jutsu: 'Leans on techniques',
};
const OTHER_WORDS: Readonly<Record<string, string>> = {
  'can:far': 'Can reach you from far off',
  'can:area': 'Has attacks that catch a wide area',
  'can:hold': 'Has holds',
  'can:heal': 'Can heal',
  'low:chakra': 'Running low on chakra',
  'low:breath': 'Out of breath',
};

/** A belief as the mind holds it now. */
export interface Held {
  readonly key: string;
  readonly confidence: number;
  readonly sureness: Sureness;
}

function familyOf(key: string): string {
  return key.split(':')[0] ?? key;
}

/** The group a hypothesis competes in: a distance's defences, the styles, the cards. */
function groupOf(key: string): string {
  const [family, band] = key.split(':');
  return family === 'defence'
    ? `defence:${band}`
    : family === 'style' || family === 'card'
      ? family
      : key;
}

/** Each hypothesis's confidence now, the likeliest of each rival group only. */
export function held(mind: PlanFighter, about: Beliefs | undefined, now: number): Held[] {
  const best = new Map<string, Held>();
  for (const [key, e] of Object.entries(about ?? {})) {
    const c = confidence(mind, faded(mind, e, now), PRIORS[familyOf(key)] ?? 0);
    const group = groupOf(key);
    const was = best.get(group);
    if (e.seen > 0 && (!was || c > was.confidence)) {
      best.set(group, { key, confidence: c, sureness: surenessOf(c) });
    }
  }
  return [...best.values()].sort((a, b) => b.confidence - a.confidence);
}

function wordsFor(key: string, subject: PlanFighter): string {
  const [family, a, b] = key.split(':');
  if (family === 'defence')
    return `Keeps ${DEFENCE_WORDS[b ?? ''] ?? b} ready ${BAND_WORDS[a ?? ''] ?? a}`;
  if (family === 'style') return STYLE_WORDS[a ?? ''] ?? key;
  if (family === 'card') {
    const id = key.slice('card:'.length);
    const card = findCard(subject, id);
    return `Keeps coming back to ${card ? cardLabel(card, subject) : id}`;
  }
  return OTHER_WORDS[key] ?? key;
}

/** What a mind believes of a fighter, in a few lines, surest first. */
export function beliefLines(mind: PlanFighter, subject: PlanFighter, now: number): string[] {
  return held(mind, mind.minds?.[subject.id], now)
    .filter((h) => h.confidence >= SAID_FROM)
    .slice(0, SHOWN)
    .map((h) => `${wordsFor(h.key, subject)}: ${h.sureness}.`);
}
