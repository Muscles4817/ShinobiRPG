import type { EffectOf, TechniqueEffect, Verb } from '@/systems/techniques';

import type { CombatTechnique } from '../../contract';
import { alive, chakraCost, holdTurns } from '../../rules/body';
import { healAmount } from '../../rules/damage';
import { resistChance } from '../../rules/defence';
import { healLine } from '../../rules/narration';
import { misfireChance } from '../../rules/unstable';
import { breakRating } from '../../rules/conditions';
import {
  confuseTurns,
  driveOf,
  dulled,
  hasVerb,
  isHarmful,
  profileOf,
  type EffectUse,
} from '../../rules/verbs';
import { makeClones } from './clones';
import { combination, comboPartner } from './combo';
import { empowerSelf } from './empower';
import { castField } from './field';
import { move } from './footwork';
import { afflict, drain, knock, pin, readyRiposte } from './lingering';
import { damage, type Aimed } from './wounding';
import { opponentsOf, type Turn } from './senses';
import { conceal, sense } from './sight';
import { canDaze, dazeIn } from './daze';
import { fighterIn, patch, paying, say, type PlanFighter, type Round } from './state';
import { setTrap } from './traps';

/**
 * Using a technique in a planned fight: pay its chakra, see whether the target saw it coming,
 * then apply its effects in order (damage, then daze…), each on the fighters as the effects
 * before it left them. An area technique does this to every foe, each seeing it coming,
 * dodging and guarding on their own; effects aimed at the user happen once.
 */

/** Pays the chakra, and notes the technique and the chakra for the outcome's usage report. */
function withChakraSpent(round: Round, actor: PlanFighter, t: CombatTechnique): Round {
  const known = actor.used ?? [];
  const change = {
    ...paying(actor, chakraCost(actor, t)),
    used: known.includes(t.id) ? known : [...known, t.id],
  };
  return say(
    { ...round, fighters: patch(round.fighters, actor.id, change) },
    `${actor.name} uses ${t.name}!`,
  );
}

function daze(round: Round, target: PlanFighter): Round {
  if (!canDaze(target, round.number)) return say(round, `${target.name} shakes it off.`);
  return say(
    { ...round, fighters: patch(round.fighters, target.id, dazeIn(round.number)) },
    `${target.name} is dazed!`,
  );
}

function seal(round: Round, target: PlanFighter, use: EffectUse<'seal'>): Round {
  const sealed = target.sealed + holdTurns(use.effect) + 1;
  return say(
    { ...round, fighters: patch(round.fighters, target.id, { sealed }) },
    `Seals lock ${target.name}'s chakra!`,
  );
}

function confuse(round: Round, { actor, target }: Aimed, use: EffectUse<'confuse'>): Round {
  const turns = confuseTurns(driveOf(actor, use), use, breakRating(target));
  // The target counts a turn down as their own turn starts, before acting: hold one more.
  const confused = Math.max(target.confused, turns + 1);
  return say(
    { ...round, fighters: patch(round.fighters, target.id, { confused }) },
    `${target.name}'s senses twist in the illusion.`,
  );
}

function heal(round: Round, actor: PlanFighter, use: EffectUse<'heal'>): Round {
  const health = Math.min(actor.maxHealth, actor.health + healAmount(actor, use));
  const healed = { ...round, fighters: patch(round.fighters, actor.id, { health }) };
  return say(healed, healLine(`${actor.name} recovers.`, health - actor.health));
}

/** The verbs that land on a foe; every other verb happens to the user. */
const FOE_VERBS = [
  'damage',
  'area',
  'break',
  'daze',
  'seal',
  'confuse',
  'knock',
  'pin',
  'drain',
  'afflict',
] as const;
type FoeVerb = (typeof FOE_VERBS)[number];
const foeVerbs: readonly Verb[] = FOE_VERBS;

function landsOnFoe(effect: TechniqueEffect): effect is EffectOf<FoeVerb> {
  return foeVerbs.includes(effect.verb);
}

/** One effect landing on a foe who is standing. Effects aimed at the user happen in `onSelf`. */
function landOn(round: Round, aimed: Aimed, { technique, effect }: EffectUse): Round {
  if (!landsOnFoe(effect)) return round;
  switch (effect.verb) {
    case 'damage':
    case 'area':
    case 'break':
      return damage(round, aimed, { technique, effect });
    case 'daze':
      return daze(round, aimed.target);
    case 'seal':
      return seal(round, aimed.target, { technique, effect });
    case 'confuse':
      return confuse(round, aimed, { technique, effect });
    case 'knock':
      return knock(round, aimed.target, { technique, effect });
    case 'pin':
      return pin(round, aimed.target, { technique, effect });
    case 'drain':
      return drain(round, aimed, { technique, effect });
    case 'afflict':
      return afflict(round, aimed, { technique, effect });
  }
}

/** One effect on one foe, as the fighters stand now. Nothing happens to a foe who is down. */
function onFoe(round: Round, turn: Aimed, use: EffectUse): Round {
  const actor = fighterIn(round, turn.actor.id) ?? turn.actor;
  const target = fighterIn(round, turn.target.id);
  if (!target || !alive(target)) return round;
  return landOn(round, { ...turn, actor, target }, use);
}

/** One effect on the user themselves. Effects that land on a foe happen in `landOn`. */
function onSelf(round: Round, turn: Turn, { technique, effect }: EffectUse): Round {
  const actor = fighterIn(round, turn.actor.id) ?? turn.actor;
  if (landsOnFoe(effect)) return round;
  switch (effect.verb) {
    case 'heal':
      return heal(round, actor, { technique, effect });
    case 'conceal':
      return conceal(round, actor, { technique, effect });
    case 'sense':
      return sense(round, { ...turn, actor }, { technique, effect });
    case 'empower':
      return empowerSelf(round, actor, { technique, effect });
    case 'clone':
      return makeClones(round, actor, { technique, effect });
    case 'trap':
      return setTrap(round, actor, { technique, effect });
    case 'field':
      return castField(round, actor, { technique, effect });
    case 'move':
      return move(round, actor, technique);
    case 'counter':
      return readyRiposte(round, actor, { technique, effect });
    // A substitution reacts when hit (`footwork.ts`); it is never played on a turn.
    case 'substitute':
      return round;
  }
}

/** A wounding effect the target slipped (their health untouched): the rest of it misses. */
function slipped(before: Round, after: Round, use: EffectUse, targetId: string): boolean {
  const { verb } = use.effect;
  if (verb !== 'damage' && verb !== 'area' && verb !== 'break') return false;
  return fighterIn(before, targetId)?.health === fighterIn(after, targetId)?.health;
}

/**
 * Who a technique is aimed at: every foe standing for an area technique (the hidden too: it
 * needs no aim), else the turn's target.
 */
function targetsOf(round: Round, turn: Turn, t: CombatTechnique): PlanFighter[] {
  if (!isHarmful(t)) return [];
  if (hasVerb(t, 'area')) return opponentsOf(round.fighters, turn.actor);
  return turn.target ? [turn.target] : [];
}

/** A technique in flight: the round so far, and the foes it still reaches. */
interface Flight {
  readonly round: Round;
  readonly reaching: readonly PlanFighter[];
}

function applyEffect(flight: Flight, turn: Turn, use: EffectUse): Flight {
  if (profileOf(use.effect).aim === 'self') {
    return { ...flight, round: onSelf(flight.round, turn, use) };
  }
  return flight.reaching.reduce<Flight>(({ round, reaching }, foe) => {
    const next = onFoe(round, { ...turn, target: foe }, use);
    const missed = slipped(round, next, use, foe.id);
    return { round: next, reaching: missed ? reaching.filter((f) => f !== foe) : reaching };
  }, flight);
}

/** Uses a technique: with a partner when it's a combination one (see `combo.ts`). */
export function useJutsu(round: Round, turn: Turn, t: CombatTechnique): Round {
  const partner =
    turn.boost === undefined ? comboPartner(round.fighters, turn.actor, t) : undefined;
  return partner ? combination(round, turn, { lead: t, partner }, single) : single(round, turn, t);
}

/** An unstable technique falling apart: the chakra is spent, nothing else happens. */
function misfired(turn: Turn, t: CombatTechnique): boolean {
  const chance = misfireChance(t);
  return chance > 0 && turn.rng.chance(chance);
}

function single(round: Round, turn: Turn, t: CombatTechnique): Round {
  const { actor, rng } = turn;
  const paid = withChakraSpent(round, actor, t);
  if (misfired(turn, t)) {
    return say(paid, `${t.name} comes apart in ${actor.name}'s hands. It isn't steady yet.`);
  }
  const targets = targetsOf(paid, turn, t);
  if (isHarmful(t) && targets.length === 0) return paid;
  // A field dulls the perception of those it blinds: they see techniques coming later.
  const seen = targets.filter((foe) => rng.chance(resistChance(actor, dulled(paid.field, foe), t)));
  const told = seen.reduce((r, foe) => say(r, `${foe.name} sees it coming.`), paid);
  if (isHarmful(t) && seen.length === targets.length) return told;
  const start: Flight = { round: told, reaching: targets.filter((f) => !seen.includes(f)) };
  const end = t.effects.reduce(
    (flight, effect) => applyEffect(flight, turn, { technique: t, effect }),
    start,
  );
  return end.round;
}
