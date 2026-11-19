import type {
  Answer,
  Catches,
  Delivery,
  Landing,
  Shape,
  TargetNeed,
  TechniqueEffect,
} from '@/systems/techniques';

import type { CombatTechnique } from '../../contract';

/**
 * The rest of a technique's tags, read from its delivery and what it does (`tagsOf`): the ground
 * it covers, what the target must be, what it does when it lands, how much of a body it catches
 * and what answers it.
 */

type Tech = Pick<CombatTechnique, 'discipline' | 'effects' | 'element'> & {
  readonly description?: string;
};

const BLAST = /\b(explo|blast|detonat|bomb)/i;

function verbs(t: Tech): ReadonlySet<TechniqueEffect['verb']> {
  return new Set(t.effects.map((e) => e.verb));
}

/** What ground it covers. */
export function readShape(t: Tech, delivery: Delivery): Shape {
  if (delivery === 'self' || delivery === 'body' || delivery === 'field') return 'none';
  if (delivery === 'burst') return 'burst';
  if (verbs(t).has('area')) return 'zone';
  if (/\b(volley|scatter|hail|rain of|spread)\b/i.test(t.description ?? '')) return 'spread';
  return 'one';
}

const NEEDS_BY_DELIVERY: Readonly<Partial<Record<Delivery, readonly TargetNeed[]>>> = {
  grapple: ['liftable'],
  charge: ['straight-line'],
  'eye-contact': ['mind', 'meets-eyes'],
  sound: ['mind'],
  senses: ['mind'],
  'along-ground': ['on-ground', 'casts-shadow'],
  'from-ground': ['on-ground'],
};

/** What the target must be for it to work at all. */
export function readNeeds(t: Tech, delivery: Delivery): TargetNeed[] {
  const needs = [...(NEEDS_BY_DELIVERY[delivery] ?? [])];
  // Strikes at the chakra points (the Gentle Fist) need points to strike.
  if (t.discipline === 'taijutsu' && verbs(t).has('seal')) needs.push('chakra-points');
  return needs;
}

const HARMS: ReadonlySet<TechniqueEffect['verb']> = new Set(['damage', 'area', 'break']);

function holdOf(t: Tech, delivery: Delivery): Landing {
  if (delivery === 'along-ground') return 'mirrored';
  const harms = t.effects.some((e) => HARMS.has(e.verb));
  return harms && (delivery === 'from-ground' || delivery === 'from-above') ? 'crushed' : 'bound';
}

function afflictionOf(e: TechniqueEffect): Landing {
  return e.verb === 'afflict' && e.harm === 'burn' ? 'burning' : 'lingering';
}

/** What each verb does when it lands, where the verb alone decides it. */
const PLAIN: Readonly<Partial<Record<TechniqueEffect['verb'], Landing>>> = {
  knock: 'thrown-back',
  confuse: 'confused',
  seal: 'sealed',
  drain: 'drained',
  heal: 'mended',
  empower: 'strengthened',
  shroud: 'strengthened',
  conceal: 'hidden',
};

function harmOf(t: Tech, delivery: Delivery): Landing {
  if (delivery === 'grapple') return 'slammed';
  return BLAST.test(t.description ?? '') ? 'blast' : 'harmed';
}

/** What one effect does when it lands, for this technique. */
function landingOf(t: Tech, delivery: Delivery, e: TechniqueEffect): Landing | null {
  const illusion = t.discipline === 'genjutsu';
  if (HARMS.has(e.verb)) return harmOf(t, delivery);
  if (e.verb === 'pin' || e.verb === 'trap') return illusion ? 'dreaming' : holdOf(t, delivery);
  if (e.verb === 'daze') return illusion ? 'frozen' : 'stunned';
  if (e.verb === 'afflict') return afflictionOf(e);
  return PLAIN[e.verb] ?? null;
}

/** What it does when it lands, in the order its effects come. */
export function readLandings(t: Tech, delivery: Delivery): Landing[] {
  const all = t.effects.flatMap((e) => landingOf(t, delivery, e) ?? []);
  return all.filter((l, i) => all.indexOf(l) === i);
}

const WHOLE: ReadonlySet<Landing> = new Set(['slammed', 'crushed', 'thrown-back', 'blast']);

/** How much of a body it catches: a point strike, or the whole of it. */
export function readCatches(delivery: Delivery, shape: Shape, lands: readonly Landing[]): Catches {
  if (shape === 'none' || lands.length === 0) return 'none';
  if (shape === 'zone' || shape === 'burst' || delivery === 'from-above') return 'whole';
  return lands.some((l) => WHOLE.has(l)) ? 'whole' : 'point';
}

const ANSWERS_BY_DELIVERY: Readonly<Record<Delivery, readonly Answer[]>> = {
  strike: ['slip', 'guard', 'swap'],
  charge: ['slip', 'swap', 'wall'],
  grapple: ['slip', 'break-free', 'swap'],
  weapon: ['slip', 'guard', 'armour', 'swap'],
  thrown: ['slip', 'deflect', 'armour', 'wall', 'distance'],
  placed: ['slip', 'distance'],
  breath: ['slip', 'wall', 'swap', 'armour'],
  gas: ['hold-breath', 'wind', 'distance'],
  'eye-contact': ['look-away', 'see-through'],
  sound: ['cover-ears', 'see-through'],
  senses: ['see-through'],
  touch: ['slip', 'guard'],
  'along-ground': ['jump', 'distance', 'break-free'],
  'from-ground': ['slip', 'jump', 'swap', 'distance'],
  'from-above': ['distance', 'break-free'],
  burst: ['distance', 'dig-in'],
  field: [],
  threads: ['cut-free', 'see-through'],
  body: [],
  self: [],
};

/** What stops or escapes it. */
export function readAnswers(t: Tech, delivery: Delivery, lands: readonly Landing[]): Answer[] {
  const answers = [...ANSWERS_BY_DELIVERY[delivery]];
  const held = lands.some((l) => l === 'bound' || l === 'crushed' || l === 'mirrored');
  if (held && !answers.includes('break-free')) answers.push('break-free');
  if (held) answers.push('ally-frees');
  // Wood and paper burn.
  if (
    delivery === 'from-ground' &&
    /\b(wood|trees?|roots?|branches|paper)\b/i.test(t.description ?? '')
  ) {
    answers.push('burn');
  }
  return answers;
}
