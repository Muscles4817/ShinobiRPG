import { pronounForms } from '@/core';
import { stepWords, type LadderStep } from '@/systems/techniques';

import type { CombatTechnique, RangeBand } from '../../contract';
import { avoidRating } from '../../rules/avoidance';
import { alive } from '../../rules/body';
import { BRACE_LETS, DANGER_SHARE } from '../../rules/commitment';
import { strikeDamage, techniqueDamage } from '../../rules/damage';
import { LETHAL_SCALE } from '../../rules/lethal';
import { paceLeft } from '../../rules/pace';
import { calledOf } from '../../rules/telling';
import { hasVerb, isPinned } from '../../rules/verbs';
import { findCard, fitsBand, playable, type Card } from './cards';
import { canDaze } from './daze';
import { readsInTheMoment } from './judgement';
import { opponentsOf } from './senses';
import type { PlanFighter, Round } from './state';

/**
 * Survival, as judgement (`docs/design/defence-plan.md` 3.7). A fighter who reads the fight sees
 * a killer coming: a foe with a gate open whose heaviest blow would end them, or a killing blow
 * announced (`lethal`) that would. Both burn out (a gate's toll, a killing blow's chakra), so
 * unless they would fell the killer first, they play for time rather than trade: a hold on the killer to cost them a turn, Evade where
 * and a step back can still get clear (a body that outpaces them can't be slipped or outrun; a
 * killer who only kills up close must spend a turn coming in), or else Brace, where what gets
 * through a Brace would no longer end it. A dull fighter
 * keeps trading, and the player chooses for themself; the plan screen says why it matters.
 */

/** A blow that takes this share of what health is left could end the fight. */
export const ONE_BLOW_SHARE = 0.75;
/** A blow that takes this share of a body's whole health is a killer's however fresh they are. */
export const KILLING_SHARE = 0.5;
/** Evade is worth its breath only while this much of the slip is left against the killer's pace. */
export const EVADE_WORTH_PACE = 0.5;

/** A killer, and what makes them one. */
export type Threat =
  | { readonly kind: 'gate'; readonly foe: PlanFighter; readonly step: LadderStep }
  | { readonly kind: 'lethal'; readonly foe: PlanFighter; readonly technique: CombatTechnique };

/** What a fighter sees of the exchange when judging whether to fight for time. */
export interface SurvivalMoment extends Pick<Round, 'range' | 'intents' | 'number' | 'watching'> {
  readonly fighters: readonly PlanFighter[];
}

/** A survival play, and whom it is aimed at. */
export interface SurvivalPlay {
  readonly card: Card;
  readonly target: PlanFighter | undefined;
}

const MID_ROLL = 0.5;

/** Health one use of a technique would take, mid-roll: every wounding effect summed. */
function wounds(attacker: PlanFighter, target: PlanFighter, technique: CombatTechnique): number {
  return technique.effects.reduce((sum, effect) => {
    if (effect.verb !== 'damage' && effect.verb !== 'area' && effect.verb !== 'break') return sum;
    return sum + techniqueDamage(attacker, target, { technique, effect }, MID_ROLL);
  }, 0);
}

/** The heaviest blow a fighter could land on a target from a distance (any, when absent). */
function heaviest(attacker: PlanFighter, target: PlanFighter, band?: RangeBand): number {
  const blow =
    band === undefined || band === 'close' ? strikeDamage(attacker, target, MID_ROLL) : 0;
  const techniques = attacker.techniques
    .map((technique): Card => ({ kind: 'jutsu', technique }))
    .filter((c) => playable(attacker, c) && (band === undefined || fitsBand(c, band)))
    .map((c) => (c.kind === 'jutsu' ? wounds(attacker, target, c.technique) : 0));
  return Math.max(blow, ...techniques);
}

/**
 * Whether a blow this heavy could end the fight: most of what is left (and a heavy hit at all),
 * or half of a fresh body.
 */
function ends(target: PlanFighter, damage: number): boolean {
  const left = Math.min(target.health * ONE_BLOW_SHARE, target.maxHealth * KILLING_SHARE);
  return damage >= left && damage >= target.maxHealth * DANGER_SHARE;
}

/** What makes a foe a killer to this fighter now, if anything does. */
export function threatFrom(
  self: PlanFighter,
  foe: PlanFighter,
  intents: SurvivalMoment['intents'],
): Threat | undefined {
  if (!alive(foe) || foe.hidden) return undefined;
  const announced = intents[foe.id];
  const card = announced ? findCard(foe, announced) : null;
  if (card?.kind === 'jutsu' && card.technique.lethal === true) {
    const blow = wounds(foe, self, card.technique) * LETHAL_SCALE;
    if (ends(self, blow)) return { kind: 'lethal', foe, technique: card.technique };
  }
  const opened = foe.empowered?.opened;
  return opened && ends(self, heaviest(foe, self))
    ? { kind: 'gate', foe, step: opened }
    : undefined;
}

/** The first killer among a fighter's foes. */
export function killerOf(self: PlanFighter, moment: SurvivalMoment): Threat | undefined {
  for (const foe of opponentsOf(moment.fighters, self)) {
    const threat = threatFrom(self, foe, moment.intents);
    if (threat) return threat;
  }
  return undefined;
}

/**
 * Whether a fighter would win the race against a killer: felling them in no more blows than the
 * killer needs to fell the fighter. Then there is nothing to wait out, and they fight on.
 */
function outraces(self: PlanFighter, { foe }: Threat, band: RangeBand): boolean {
  const toFell = Math.ceil(foe.health / Math.max(1, heaviest(self, foe, band)));
  const toFall = Math.ceil(self.health / Math.max(1, heaviest(foe, self)));
  return toFell <= toFall;
}

/** A hold from the kit that would cost the killer a turn or keep them off: a daze or a pin. */
function holdOn(self: PlanFighter, killer: PlanFighter, moment: SurvivalMoment): Card | undefined {
  const holds = (t: CombatTechnique) =>
    t.lethal !== true &&
    ((hasVerb(t, 'daze') && canDaze(killer, moment.number)) ||
      (hasVerb(t, 'pin') && !isPinned(killer)));
  return self.techniques
    .filter(holds)
    .map((technique): Card => ({ kind: 'jutsu', technique }))
    .find((c) => fitsBand(c, moment.range) && playable(self, c));
}

/**
 * Whether the fighter can still get clear of this killer: a body far faster can't be slipped by
 * Evade, nor stepped away from (a step is a race), so only Brace is left against it.
 */
function keepsPace({ kind, foe }: Threat, self: PlanFighter): boolean {
  return kind === 'lethal' || paceLeft(foe.attributes.speed, avoidRating(self)) >= EVADE_WORTH_PACE;
}

/** A step back up close, when the killer couldn't end it from a step away. */
function backOff(self: PlanFighter, { foe }: Threat, band: RangeBand): Card | undefined {
  if (band !== 'close' || isPinned(self) || ends(self, heaviest(foe, self, 'mid')))
    return undefined;
  return { kind: 'step', direction: 'back' };
}

/** Getting clear of a killer this fighter keeps pace with: Evade, or a step out of reach. */
function getClear(self: PlanFighter, threat: Threat, band: RangeBand): Card | undefined {
  const evade: Card = { kind: 'evade' };
  return playable(self, evade) ? evade : backOff(self, threat, band);
}

/** How a fighter plays for time against a killer this turn, if their judgement sees one. */
export function survivalPlay(self: PlanFighter, moment: SurvivalMoment): SurvivalPlay | undefined {
  // The player's own plan is theirs, unless the fight is only watched.
  if ((self.isPlayer && moment.watching !== true) || !readsInTheMoment(self)) return undefined;
  const threat = killerOf(self, moment);
  if (!threat || outraces(self, threat, moment.range)) return undefined;
  const hold = holdOn(self, threat.foe, moment);
  if (hold) return { card: hold, target: threat.foe };
  const clear = keepsPace(threat, self) ? getClear(self, threat, moment.range) : undefined;
  if (clear) return { card: clear, target: undefined };
  return braces(self, threat) ? { card: { kind: 'brace' }, target: undefined } : undefined;
}

/**
 * Whether Brace would see a fighter through the killer's heaviest blow: it guards a body's
 * attacks only, and only if what gets through no longer ends the fight. Otherwise their own plan
 * does better than standing there.
 */
function braces(self: PlanFighter, { kind, foe }: Threat): boolean {
  if (kind !== 'gate' || !playable(self, { kind: 'brace' })) return false;
  return !ends(self, heaviest(foe, self) * BRACE_LETS);
}

/** The plan screen's warning to the player about a killer, if one is facing them. */
export function survivalWarning(
  player: PlanFighter,
  moment: Pick<SurvivalMoment, 'fighters' | 'intents'>,
): string | null {
  const threat = killerOf(player, { ...moment, range: 'close', number: 0 });
  if (!threat) return null;
  const name = calledOf(threat.foe);
  const who = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  // A name takes "has" whatever its pronouns.
  const them = pronounForms(threat.foe.grammar ?? 'they').them;
  return threat.kind === 'gate'
    ? `${who} has ${stepWords(threat.step)} open: one blow from ${them} could end you.`
    : `${who} is readying ${threat.technique.name}: if it lands, it could end you.`;
}
