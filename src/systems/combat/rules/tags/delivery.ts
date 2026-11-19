import type { Delivery, Verb } from '@/systems/techniques';

import type { CombatTechnique } from '../../contract';
import { reachOf } from '../range';

/**
 * How a technique reaches its target, read from what it already has (`tagsOf`): its art, its
 * verbs, its reach and the words of its description. A reading that had to fall back on a guess
 * says so (`sure: false`), so the guesses can be listed for a person to settle and written by hand.
 */

export interface Read<T> {
  readonly value: T;
  /** False when the reading fell back on a default rather than something the technique says. */
  readonly sure: boolean;
}

type Tech = Pick<CombatTechnique, 'discipline' | 'effects' | 'reach' | 'element' | 'moulded'> & {
  readonly name?: string;
  readonly description?: string;
};

/** Words in a description that say how a technique reaches, checked in this order. */
const WORDS: readonly (readonly [Delivery, RegExp])[] = [
  ['gas', /\b(gas|smoke|poison(ed)? (mist|cloud)|fumes|spores)\b/i],
  ['sound', /\b(sound|flute|bell|song|sing|chime|drum|ring(ing|s)?|hear|ears?)\b/i],
  ['eye-contact', /\b(eyes?|gaze|look|stare|glance|sharingan|mangeky)/i],
  ['threads', /\b(threads?|wires?|strings?|chains?)\b/i],
  [
    'touch',
    /\b(palm on|slap|lays? a hand|touch|struck into|driven into the (belly|body|chest)|fingertips?|press(es)? (a )?seal)\b/i,
  ],
  ['grapple', /\b(caught and lifted|lifts? (him|her|them|the foe)|grab|grapple|suplex|seize)/i],
  ['charge', /\b(charge|rush(es)? (in|forward)|drives? forward|lunge)\b/i],
  ['along-ground', /\bshadow\b/i],
  ['thrown', /\b(throw(s|n)?|hurl|fling|volley|shuriken|kunai|senbon|needles?|arrows?)\b/i],
  ['from-above', /\b(from above|overhead|sky|falls? (on|from)|meteor|rain(s)? down|dropped)\b/i],
  [
    'from-ground',
    /\b(ground|earth|soil|roots?|trees?|trunks?|branches|wood|sand|floor|underfoot|beneath|below)\b/i,
  ],
  [
    'burst',
    /\b(every direction|all directions|around (him|her|them|the user)|repel|push(es)? away)\b/i,
  ],
  ['breath', /\b(breath|breathe|exhale|spit|mouth|blows? out)\b/i],
  ['placed', /\b(tag|mine|trap|planted|laid|set (on|in|into))\b/i],
];

const SELF_VERBS: ReadonlySet<Verb> = new Set([
  'empower',
  'heal',
  'shroud',
  'conceal',
  'sense',
  'substitute',
  'counter',
  'move',
]);

function onlyVerbs(t: Tech, verbs: ReadonlySet<Verb>): boolean {
  return t.effects.length > 0 && t.effects.every((e) => verbs.has(e.verb));
}

function has(t: Tech, verb: Verb): boolean {
  return t.effects.some((e) => e.verb === verb);
}

/** What a technique's verbs alone say about how it reaches, when they say enough. */
function byVerbs(t: Tech): Delivery | null {
  if (onlyVerbs(t, new Set(['summon', 'clone']))) return 'body';
  if (has(t, 'field')) return 'field';
  if (has(t, 'substitute') && t.effects.some((e) => e.verb === 'substitute' && e.spins)) {
    return 'burst';
  }
  if (onlyVerbs(t, SELF_VERBS)) return 'self';
  return null;
}

/** What the description's words say that makes sense for the art, if anything. */
function byWords(t: Tech): Delivery | null {
  const text = `${t.name ?? ''}. ${t.description ?? ''}`;
  return WORDS.find(([delivery, words]) => words.test(text) && fits(t, delivery))?.[0] ?? null;
}

/** What the art and reach suggest when nothing else does: a guess. */
function byArt(t: Tech): Delivery {
  const reach = reachOf({ ...t, id: '', name: '', chakraCost: 0 });
  const closeOnly = reach.length === 1 && reach[0] === 'close';
  switch (t.discipline) {
    case 'taijutsu':
      return reach.includes('close') ? 'strike' : 'thrown';
    case 'kenjutsu':
      return 'weapon';
    case 'genjutsu':
      return 'senses';
    case 'fuuinjutsu':
      return closeOnly ? 'touch' : 'thrown';
    case 'ninjutsu':
      return closeOnly ? 'strike' : 'thrown';
  }
}

/** Keeps a word reading only where it makes sense for the art. */
function fits(t: Tech, delivery: Delivery): boolean {
  if (t.discipline === 'genjutsu') {
    return delivery === 'eye-contact' || delivery === 'sound' || delivery === 'senses';
  }
  if (delivery === 'eye-contact') return false;
  if (delivery === 'grapple' || delivery === 'charge') {
    return t.discipline === 'taijutsu' || t.discipline === 'ninjutsu';
  }
  return true;
}

/** How a technique reaches its target, and whether the reading is sure of it. */
export function readDelivery(t: Tech): Read<Delivery> {
  const verbs = byVerbs(t);
  if (verbs) return { value: verbs, sure: true };
  if (t.discipline === 'kenjutsu') return { value: 'weapon', sure: true };
  const words = byWords(t);
  if (words) return { value: words, sure: true };
  const art = byArt(t);
  // A plain blow is a strike for certain; anything else from the art alone is a guess.
  const plainBlow =
    art === 'strike' &&
    t.discipline === 'taijutsu' &&
    t.moulded !== true &&
    t.element === undefined;
  return { value: art, sure: plainBlow };
}
