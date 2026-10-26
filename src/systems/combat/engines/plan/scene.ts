import type { CombatForm, CombatGround, CombatOccasion } from '../../contract';
import { alive, type Body } from '../../rules/body';
import { maxBreath } from '../../rules/breath';
import type { PlanFighter, Round } from './state';

/**
 * Where a line is said, as the story's words see it: the ground underfoot, how far into the
 * fight it is, whether the one it is about is near the end, what kind of fight it is (a spar, a
 * teammate, a rival, a bout) and what they are (a beast, a swarm, a spirit). Banks keep lines for
 * some of these (`fresh.ts` prefers them); none of it is ever read by the rules.
 */

/** The ground a line may be about; an open arena has nothing to say. */
type GroundTag = Exclude<CombatGround, 'arena'>;
/** Forms with their own words; a person is the general bank. */
type FormTag = Exclude<CombatForm, 'person'>;

export type SceneTag = 'desperate' | CombatOccasion | FormTag | GroundTag | 'opening' | 'late';

/** Below this share of their health, a fighter's lines read as someone near the end. */
const DESPERATE_BELOW = 0.25;
/** From this exchange on (the third round of four exchanges) the fight reads as a long one. */
const LATE_FROM = 9;
/**
 * Below this share of their health, chakra or breath, a fighter is worn: only then do the long
 * fight's words ("tired now") say so of them. A fresh fighter late in a fight is still fresh.
 */
const WORN_BELOW = 0.4;

/** What a fighter is: as their setup says, else a spirit, a creature ("it") or a person. */
export function formOf(f: Pick<Body, 'form' | 'traits' | 'grammar'>): CombatForm {
  if (f.form) return f.form;
  if (f.traits.includes('spirit')) return 'spirit';
  return f.grammar === 'it' ? 'beast' : 'person';
}

/** What a fighter's plain strike is called in the story. */
const BLOW_WORD: Readonly<Record<CombatForm, string>> = {
  person: 'strike',
  beast: 'bite',
  swarm: 'sting',
  spirit: 'touch',
};

/** The name a plain, bare-handed strike goes by for this fighter. */
export function blowWord(f: Pick<Body, 'form' | 'traits' | 'grammar' | 'blow'>): string {
  return f.blow ?? BLOW_WORD[formOf(f)];
}

/** A spar of any kind falls back on the general spar lines. */
function occasionTags(occasion: CombatOccasion | undefined): SceneTag[] {
  if (!occasion) return [];
  return occasion === 'teammate' || occasion === 'rival' ? [occasion, 'spar'] : [occasion];
}

/** Breath unspent (absent) is all of it. */
function winded(f: PlanFighter): boolean {
  return f.breath !== undefined && f.breath < maxBreath(f.attributes) * WORN_BELOW;
}

function worn(f: PlanFighter): boolean {
  return f.health < f.maxHealth * WORN_BELOW || f.chakra < f.maxChakra * WORN_BELOW || winded(f);
}

function stageTag(exchange: number, f: PlanFighter | undefined): SceneTag[] {
  if (exchange === 1) return ['opening'];
  return exchange >= LATE_FROM && f !== undefined && worn(f) ? ['late'] : [];
}

/** The tags of a moment about `who`, most particular first. */
export function sceneTags(round: Round, who: string): readonly SceneTag[] {
  const f = round.fighters.find((x) => x.id === who);
  const low = f !== undefined && alive(f) && f.health < f.maxHealth * DESPERATE_BELOW;
  const form = f ? formOf(f) : 'person';
  const ground = round.ground;
  return [
    ...(low ? (['desperate'] as const) : []),
    ...occasionTags(round.occasion),
    ...(form === 'person' ? [] : [form]),
    ...(ground && ground !== 'arena' ? [ground] : []),
    ...stageTag(round.number, f),
  ];
}
