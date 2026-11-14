import type { Card } from '@/systems/combat/engines/plan/cards';
import { cardId } from '@/systems/combat/engines/plan/cards';
import type { PlanFighter } from '@/systems/combat/engines/plan/state';
import { isBodyMove } from '@/systems/combat/rules/breath';
import { reachOf } from '@/systems/combat/rules/range';
import { hasVerb, isHarmful } from '@/systems/combat/rules/verbs';
import { STAT_GRADES } from '@/systems/stats';

/**
 * Step 1 of Part 5's cues: what a readied card gives off, read from what the card is (its kind,
 * art, rank, cost, element, reach, verbs), never tagged by hand and never by name.
 *
 * Every card gives one value on each channel (`none` where it shows nothing there), with a
 * strength: how loudly it shows. The `form` channel is the card's own signature (the seal
 * sequence, the footwork of a named move, the tool drawn): only expertise or having seen it
 * before turns that into a name.
 */

export const CHANNELS = ['body', 'hands', 'chakra', 'stillness', 'eyes', 'form'] as const;
export type Channel = (typeof CHANNELS)[number];

/** The art whose skill hides a cue (and whose expertise reads it); `body` for plain footwork. */
export type CueArt = 'taijutsu' | 'ninjutsu' | 'genjutsu' | 'kenjutsu' | 'fuuinjutsu' | 'body';

export interface Cue {
  readonly channel: Channel;
  readonly value: string;
  /** 0..1: how loudly it shows. */
  readonly strength: number;
}

export interface CueProfile {
  readonly cues: Readonly<Record<Channel, Cue>>;
  /** The art the readying is done in: its skill hides the cues, its expertise reads them. */
  readonly art: CueArt;
  /** The technique's rank (0 = E … 5 = S); 0 for basics. */
  readonly rank: number;
}

/**
 * The classes a prediction is said in. They match what today's telegraph's class lines tell
 * apart, split where the cues themselves split (a body move against a moulded technique).
 */
export const CLASSES = [
  'blow',
  'throw',
  'technique',
  'support',
  'stance',
  'tool',
  'step-in',
  'step-back',
  'evade',
  'brace',
  'gather',
  'search',
  'dispel',
] as const;
export type CueClass = (typeof CLASSES)[number];

/** The class words a player-facing line uses. */
export const CLASS_WORDS: Readonly<Record<CueClass, string>> = {
  blow: 'a blow up close',
  throw: 'a throw',
  technique: 'an attacking technique',
  support: 'a technique on themself',
  stance: 'a counter stance',
  tool: 'a tool from the pouch',
  'step-in': 'closing in',
  'step-back': 'backing off',
  evade: 'getting clear',
  brace: 'digging in',
  gather: 'gathering strength',
  search: 'looking for you',
  dispel: 'breaking an illusion',
};

/** Genjutsu is quiet: every cue of an illusion shows this much less. */
const GENJUTSU_QUIET = 0.55;
/** Chakra cost at which a flare is as loud as a flare gets. */
const FULL_FLARE_COST = 40;
const NONE: Omit<Cue, 'channel'> = { value: 'none', strength: 0 };

export function rankIndex(rank: string | undefined): number {
  const i = STAT_GRADES.indexOf((rank ?? 'E') as (typeof STAT_GRADES)[number]);
  return i < 0 ? 0 : i;
}

export function classOf(card: Card): CueClass {
  switch (card.kind) {
    case 'strike':
      return 'blow';
    case 'throw':
      return 'throw';
    case 'step':
      return card.direction === 'in' ? 'step-in' : 'step-back';
    case 'guard':
    case 'dodge':
    case 'counter':
      return 'stance';
    case 'evade':
      return 'evade';
    case 'brace':
      return 'brace';
    case 'gather':
      return 'gather';
    case 'search':
      return 'search';
    case 'dispel':
      return 'dispel';
    case 'item':
      return 'tool';
    case 'jutsu': {
      const t = card.technique;
      if (hasVerb(t, 'counter')) return 'stance';
      if (isBodyMove(t)) return 'blow';
      return isHarmful(t) ? 'technique' : 'support';
    }
  }
}

/** The broad intent a plan reacts to. */
export type Broad = 'attack' | 'defend' | 'move' | 'recover' | 'other';
export const BROAD: Readonly<Record<CueClass, Broad>> = {
  blow: 'attack',
  throw: 'attack',
  technique: 'attack',
  support: 'other',
  stance: 'defend',
  tool: 'other',
  'step-in': 'move',
  'step-back': 'move',
  evade: 'defend',
  brace: 'defend',
  gather: 'recover',
  search: 'other',
  dispel: 'other',
};

function profile(art: CueArt, rank: number, given: Partial<Record<Channel, [string, number]>>) {
  const cues = Object.fromEntries(
    CHANNELS.map((channel) => {
      const g = given[channel];
      return [channel, g ? { channel, value: g[0], strength: g[1] } : { channel, ...NONE }];
    }),
  ) as Record<Channel, Cue>;
  return { cues, art, rank };
}

function handsFor(art: string): string {
  if (art === 'kenjutsu') return 'blade';
  if (art === 'taijutsu') return 'fist';
  return 'seals';
}

/** Where the body leans as a technique is readied: in for close work, square for range. */
function lean(card: Extract<Card, { kind: 'jutsu' }>): [string, number] {
  const t = card.technique;
  // Coiled: settled and waiting, the weight ready to go the moment a blow comes.
  if (hasVerb(t, 'counter')) return ['coiled', 0.8];
  if (hasVerb(t, 'shroud') || hasVerb(t, 'empower')) return ['settle', 0.5];
  if (hasVerb(t, 'conceal') || hasVerb(t, 'heal')) return ['settle', 0.4];
  if (hasVerb(t, 'move')) return ['forward', 0.6];
  const reach = reachOf(t);
  if (!isHarmful(t)) return ['square', 0.3];
  return reach.includes('close') && !reach.includes('far') ? ['forward', 0.6] : ['square', 0.45];
}

function jutsuProfile(card: Extract<Card, { kind: 'jutsu' }>): CueProfile {
  const t = card.technique;
  const rank = rankIndex(t.rank);
  const art = t.discipline as CueArt;
  const quiet = art === 'genjutsu' ? GENJUTSU_QUIET : 1;
  const body = lean(card);
  if (isBodyMove(t)) {
    return profile(art, rank, {
      body: [body[0], (body[1] + 0.2) * quiet],
      hands: [handsFor(art), 0.45 + 0.05 * rank],
      eyes: ['fixed', 0.3],
      form: [cardId(card), 0.35 + 0.08 * rank],
    });
  }
  const flare = Math.min(1, Math.max(0.2, t.chakraCost / FULL_FLARE_COST));
  return profile(art, rank, {
    body: [body[0], body[1] * quiet],
    hands: [handsFor(art), (0.35 + 0.1 * rank) * quiet],
    chakra: [`flare:${t.element ?? 'raw'}`, flare * quiet],
    eyes: ['fixed', 0.3 * quiet],
    form: [cardId(card), (0.3 + 0.1 * rank) * quiet],
  });
}

/** The art a basic card is readied in, for the actor's concealment of it. */
function basicArt(actor: Pick<PlanFighter, 'gear'>): CueArt {
  return actor.gear?.held ? 'kenjutsu' : 'taijutsu';
}

/** What a card gives off as it is readied (step 1). */
export function cueProfile(card: Card, actor: Pick<PlanFighter, 'gear'>): CueProfile {
  switch (card.kind) {
    case 'strike':
      return profile(basicArt(actor), 0, {
        body: ['forward', 0.75],
        hands: [actor.gear?.held ? 'blade' : 'fist', 0.45],
        eyes: ['fixed', 0.3],
      });
    case 'throw':
      return profile('kenjutsu', 0, {
        body: ['square', 0.45],
        hands: ['pouch', 0.6],
        eyes: ['fixed', 0.35],
      });
    case 'step':
      return profile('body', 0, { body: [card.direction === 'in' ? 'forward' : 'back', 0.85] });
    case 'guard':
    case 'dodge':
      return profile('body', 0, { body: ['settle', 0.55] });
    case 'counter':
      return profile('body', 0, { body: ['coiled', 0.7] });
    case 'evade':
      return profile('body', 0, { body: ['light', 0.7] });
    case 'brace':
      return profile('body', 0, { body: ['settle', 0.75], stillness: ['still', 0.6] });
    case 'gather':
      return profile('ninjutsu', 0, {
        body: ['settle', 0.35],
        stillness: ['still', 0.8],
        chakra: ['draw', 0.6],
      });
    case 'search':
      return profile('body', 0, { eyes: ['scan', 0.8] });
    case 'dispel':
      return profile('ninjutsu', 0, { hands: ['seals', 0.45], chakra: ['flare:raw', 0.5] });
    case 'item':
      return profile('kenjutsu', 0, {
        hands: ['pouch', 0.7],
        form: [cardId(card), 0.45],
      });
    case 'jutsu':
      return jutsuProfile(card);
  }
}

/**
 * Today's telegraph lines, as classes (`intent.ts` `telegraph`): what the line tells apart
 * without naming. Any technique but a counter stance is "readying a technique", with one change
 * for the gate: a body move (a taijutsu or blade technique paid in breath) is counted with the
 * strike, since a styled strike plays one and a plan meets both as a blow up close.
 */
export type TelegraphClass =
  | 'strike'
  | 'throw'
  | 'step-in'
  | 'step-back'
  | 'defending'
  | 'evade'
  | 'brace'
  | 'gather'
  | 'search'
  | 'dispel'
  | 'stance'
  | 'jutsu'
  | 'item';

export function telegraphClassOf(card: Card): TelegraphClass {
  switch (card.kind) {
    case 'guard':
    case 'dodge':
    case 'counter':
      return 'defending';
    case 'step':
      return card.direction === 'in' ? 'step-in' : 'step-back';
    case 'jutsu':
      if (hasVerb(card.technique, 'counter')) return 'stance';
      return isBodyMove(card.technique) ? 'strike' : 'jutsu';
    default:
      return card.kind;
  }
}
