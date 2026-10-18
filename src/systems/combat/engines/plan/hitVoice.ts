import type { Discipline, Element } from '@/systems/techniques';

import type { AttackKind } from '../../rules/kit';
import { reactionLine, voiceLine, type NarrationReaction } from '../../rules/narration';
import { tell, type Told } from '../../rules/telling';
import { choose, freshWord, pick, within, type Bank, type Moment } from './fresh';
import { FORM_VERBS, hitScenes } from './hitScenes';
import type { SceneTag } from './scene';

/**
 * Telling a hit by how hard it landed. The share of the target's health it took sets its
 * weight (a graze, solid, heavy, crushing), and the weight, the art and the element choose the
 * verb ("−7" catches, "−30" slams) and the sentence around it. Verbs and sentences are picked
 * fresh (`fresh.ts`), so two hits in a row don't land the same way; a beast's bite, a swarm's
 * sting and a spirit's touch have verbs of their own, and the scene may choose the sentence
 * (`hitScenes.ts`: a wall in a room, a spar, the last of someone's strength).
 */

/** Below these shares of the target's health a hit reads as a graze, solid, or heavy. */
export const GRAZE_BELOW = 0.08;
export const SOLID_BELOW = 0.2;
export const HEAVY_BELOW = 0.35;

export const HIT_WEIGHTS = ['graze', 'solid', 'heavy', 'crushing'] as const;
export type HitWeight = (typeof HIT_WEIGHTS)[number];

/** How heavy a hit reads, by the share of the target's health it took. */
export function weightOf(damage: number, maxHealth: number): HitWeight {
  const share = damage / Math.max(1, maxHealth);
  if (share < GRAZE_BELOW) return 'graze';
  if (share < SOLID_BELOW) return 'solid';
  return share < HEAVY_BELOW ? 'heavy' : 'crushing';
}

type Verbs = Readonly<Record<HitWeight, readonly string[]>>;

const BLOW: Verbs = {
  graze: ['clips', 'grazes', 'glances off'],
  solid: ['hits', 'catches', 'lands on'],
  heavy: ['slams into', 'crashes into', 'hammers'],
  crushing: ['smashes into', 'drives through', 'flattens'],
};
const CUT: Verbs = {
  graze: ['nicks', 'grazes', 'scores'],
  solid: ['cuts', 'bites into', 'slashes'],
  heavy: ['slashes deep into', 'carves into', 'hacks into'],
  crushing: ['cleaves into', 'opens up', 'tears through'],
};
const THROWN: Verbs = {
  graze: ['grazes', 'skims', 'nicks'],
  solid: ['hits', 'finds', 'catches'],
  heavy: ['sinks into', 'buries itself in', 'punches into'],
  crushing: ['punches deep into', 'drives deep into', 'buries itself deep in'],
};
const SEAL: Verbs = {
  graze: ['singes', 'brushes', 'nips at'],
  solid: ['binds', 'locks onto', 'burns into'],
  heavy: ['clamps down on', 'burns deep into', 'wraps around'],
  crushing: ['sears through', 'crushes down on', 'locks tight around'],
};
const JUTSU: Verbs = {
  graze: ['grazes', 'clips', 'catches the edge of'],
  solid: ['hits', 'strikes', 'catches'],
  heavy: ['slams into', 'batters', 'hammers'],
  crushing: ['blasts', 'tears into', 'smashes into'],
};
const ILLUSION: Verbs = {
  graze: ['brushes', 'unsettles', 'plucks at'],
  solid: ['takes hold of', 'grips', 'sinks into'],
  heavy: ['sinks deep into', 'floods', 'closes around'],
  crushing: ['swallows', 'drowns', 'buries'],
};

const BY_ELEMENT: Readonly<Record<Element, Verbs>> = {
  fire: {
    graze: ['singes', 'licks at', 'scorches the edge of'],
    solid: ['scorches', 'burns', 'sears'],
    heavy: ['sears', 'engulfs', 'blazes over'],
    crushing: ['engulfs', 'consumes', 'roars over'],
  },
  water: {
    graze: ['splashes', 'spatters', 'sprays'],
    solid: ['batters', 'crashes over', 'pounds'],
    heavy: ['slams into', 'pounds', 'crashes down on'],
    crushing: ['smashes into', 'sweeps over', 'buries'],
  },
  lightning: {
    graze: ['stings', 'sparks across', 'nips'],
    solid: ['jolts', 'lances into', 'shocks'],
    heavy: ['tears through', 'lances through', 'rattles'],
    crushing: ['rips through', 'blasts through', 'convulses'],
  },
  wind: {
    graze: ['nicks', 'whips across', 'flicks'],
    solid: ['slices across', 'rips into', 'cuts into'],
    heavy: ['hammers', 'tears into', 'batters'],
    crushing: ['shreds', 'flays', 'hurls aside'],
  },
  earth: {
    graze: ['clips', 'scrapes', 'grazes'],
    solid: ['batters', 'pounds', 'thumps'],
    heavy: ['crushes', 'slams into', 'hammers'],
    crushing: ['flattens', 'buries', 'pulverises'],
  },
};

/** What a hit lands as, for the verb that tells it (a blow, as `react.ts` lands it). */
export interface Landing {
  readonly what: string;
  readonly kind: AttackKind;
  readonly discipline?: Discipline;
  readonly element?: Element;
  /** Hand-to-hand and blades in hand; thrown steel isn't. */
  readonly physical: boolean;
  /** A later blow of a flurry. */
  readonly followUp?: true;
}

const FORM_TAGS = ['beast', 'swarm', 'spirit'] as const;
type FormTag = (typeof FORM_TAGS)[number];
const isForm = (tag: SceneTag): tag is FormTag => (FORM_TAGS as readonly SceneTag[]).includes(tag);

/** The verbs for a hit, and a name for them (so a used one rests a while). */
function verbsFor(
  landing: Landing,
  moment: Moment,
): { readonly id: string; readonly verbs: Verbs } {
  const form = moment.tags?.find(isForm);
  if (form && landing.kind === 'blow' && !landing.discipline) {
    return { id: form, verbs: FORM_VERBS[form] };
  }
  if (landing.discipline === 'genjutsu') return { id: 'illusion', verbs: ILLUSION };
  if (landing.element) return { id: landing.element, verbs: BY_ELEMENT[landing.element] };
  switch (landing.kind) {
    case 'blow':
      return { id: 'blow', verbs: BLOW };
    case 'weapon':
      return landing.physical ? { id: 'cut', verbs: CUT } : { id: 'thrown', verbs: THROWN };
    case 'seal':
      return { id: 'seal', verbs: SEAL };
    case 'jutsu':
      return { id: 'jutsu', verbs: JUTSU };
  }
}

/** The sentence around the verb, by weight. */
const SENTENCES: Readonly<Record<HitWeight, readonly string[]>> = {
  graze: [
    '{a.poss} {what} {verb} {t}{again}{guard}.',
    '{t} {t.is} a shade too slow, and {a.poss} {what} {verb} {t.them}{again}{guard}.',
    '{a.poss} {what} only just {verb} {t}{again}{guard}.',
  ],
  solid: [
    '{a.poss} {what} {verb} {t}{again}{guard}.',
    '{a.poss} {what} {verb} {t} cleanly{again}{guard}.',
    '{a} land{a.s} {a.their} {what} on {t}{again}{guard}.',
  ],
  heavy: [
    '{a.poss} {what} {verb} {t}{again}{guard}.',
    '{a.poss} {what} {verb} {t}{again}{guard}, and {t.they} feel{t.ps} it.',
    '{a.poss} {what} {verb} {t}{again}{guard}, and it hurts.',
  ],
  crushing: [
    '{a.poss} {what} {verb} {t}{again} with everything behind it{guard}.',
    "{a.poss} {what} {verb} {t}{again}{guard}, and {t.they}{t.'s} nearly knocked off {t.their} feet.",
    'There is nothing {t} can do as {a.poss} {what} {verb} {t.them}{again}{guard}.',
  ],
};

const AGAIN = [' again', ' once more', ' a second time'];
/** A guard that held is the Guarded stamp's to say; one smashed is news, so the line says it. */
const SMASHED = [', smashing through the guard', ', battering the guard aside'];

export interface HitTold {
  readonly attacker: Told;
  readonly target: Told;
  readonly blow: Landing;
  /** What it took, and of how much: its weight. */
  readonly damage: number;
  readonly maxHealth: number;
  readonly guarded: boolean;
  readonly smashed: boolean;
  /** A Dodge was ready and tried for this blow. */
  readonly dodgeTried: boolean;
}

/** Which ready defence reacted to a blow that landed anyway, for the fight screen. */
function reactionsTo({ dodgeTried, guarded, smashed }: HitTold): NarrationReaction[] {
  return [
    ...(dodgeTried ? (['dodge-missed'] as const) : []),
    ...(guarded ? (['guarded'] as const) : []),
    ...(smashed ? (['guard-broken'] as const) : []),
  ];
}

/**
 * A hit landing: the attacker's attack, a verb for what it is and how hard it landed, and a
 * smashed guard if it was, tagged with the defences that reacted.
 */
export function hitLine(moment: Moment, hit: HitTold): string {
  const weight = weightOf(hit.damage, hit.maxHealth);
  const { id, verbs } = verbsFor(hit.blow, moment);
  const verbBank: Bank = { id: `verb-${id}-${weight}`, lines: verbs[weight] };
  const verb = freshWord(within(moment, 'verb'), verbBank);
  const sentences = {
    id: `hit-${weight}`,
    lines: SENTENCES[weight],
    scene: hitScenes(weight, hit.blow.discipline === 'genjutsu'),
  };
  const sentence = choose(moment, sentences);
  const again = hit.blow.followUp ? pick(within(moment, 'again'), AGAIN) : '';
  const guard = hit.smashed ? pick(within(moment, 'guard'), SMASHED) : '';
  const words = { what: hit.blow.what, verb: verb.word, again, guard };
  const text = tell(sentence.template, { a: hit.attacker, t: hit.target, ...words });
  const line = voiceLine(text, `${sentence.id}.${sentence.index}`, verb.mark);
  return reactionLine(line, ...reactionsTo(hit));
}
