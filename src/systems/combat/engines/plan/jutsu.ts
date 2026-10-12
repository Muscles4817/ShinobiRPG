import type { CombatTechnique } from '../../contract';
import { alive, chakraCost, holdTurns } from '../../rules/body';
import { healAmount, techniqueDamage } from '../../rules/damage';
import { resistChance } from '../../rules/defence';
import { matchup, matchupLine } from '../../rules/elements';
import { attackKindOf } from '../../rules/kit';
import { healLine } from '../../rules/narration';
import { isHarmful, profileOf, type EffectUse } from '../../rules/verbs';
import { react, type Blow } from './react';
import type { Turn } from './senses';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';

/**
 * Using a technique in a planned fight: pay its chakra, see whether the target saw it coming,
 * then apply its effects in order (damage, then daze…), each on the fighters as the effects
 * before it left them.
 */

function withChakraSpent(round: Round, actor: PlanFighter, t: CombatTechnique): Round {
  const chakra = Math.max(0, actor.chakra - chakraCost(actor, t));
  return say(
    { ...round, fighters: patch(round.fighters, actor.id, { chakra }) },
    `${actor.name} uses ${t.name}!`,
  );
}

function physical(t: CombatTechnique): boolean {
  return t.discipline === 'taijutsu' || t.discipline === 'kenjutsu';
}

/**
 * A daze costs one exchange and doesn't stack: rounds play out on their own, so a chain of
 * dazes would leave the player watching themselves lose.
 */
function daze(round: Round, target: PlanFighter): Round {
  return say(
    {
      ...round,
      fighters: patch(round.fighters, target.id, { stunned: 1, openUntil: round.number + 1 }),
    },
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

function heal(round: Round, actor: PlanFighter, use: EffectUse<'heal'>): Round {
  const health = Math.min(actor.maxHealth, actor.health + healAmount(actor, use));
  const healed = { ...round, fighters: patch(round.fighters, actor.id, { health }) };
  return say(healed, healLine(`${actor.name} recovers.`, health - actor.health));
}

function damage(round: Round, { actor, target, rng }: Turn, use: EffectUse<'damage'>): Round {
  if (!target) return round;
  const t = use.technique;
  const blow: Blow = {
    raw: techniqueDamage(actor, target, use, rng.next()),
    what: t.name,
    dodgeable: t.discipline !== 'genjutsu',
    physical: physical(t),
    kind: attackKindOf(t),
  };
  const hit = react(round, { attacker: actor, target, blow, rng });
  const element = matchupLine(matchup(t.element, target.nature), target.name);
  return element ? say(hit, element) : hit;
}

/** One effect, on the fighters as they stand now. Foe-aimed effects need a foe still up. */
function apply(round: Round, turn: Turn, { technique, effect }: EffectUse): Round {
  const actor = fighterIn(round, turn.actor.id) ?? turn.actor;
  if (effect.verb === 'heal') return heal(round, actor, { technique, effect });
  const target = turn.target && fighterIn(round, turn.target.id);
  if (!target || !alive(target)) return round;
  switch (effect.verb) {
    case 'damage':
      return damage(round, { ...turn, actor, target }, { technique, effect });
    case 'daze':
      return daze(round, target);
    case 'seal':
      return seal(round, target, { technique, effect });
  }
}

/** A damaging effect the target slipped (their health untouched): the rest of it misses. */
function slipped(before: Round, after: Round, use: EffectUse, targetId: string): boolean {
  if (use.effect.verb !== 'damage') return false;
  return fighterIn(before, targetId)?.health === fighterIn(after, targetId)?.health;
}

export function useJutsu(round: Round, turn: Turn, t: CombatTechnique): Round {
  const { actor, target, rng } = turn;
  const paid = withChakraSpent(round, actor, t);
  if (isHarmful(t)) {
    if (!target) return paid;
    if (rng.chance(resistChance(actor, target, t)))
      return say(paid, `${target.name} sees it coming.`);
  }
  let now = paid;
  let missed = false;
  for (const effect of t.effects) {
    const use: EffectUse = { technique: t, effect };
    if (missed && profileOf(effect).aim === 'foe') continue;
    const next = apply(now, turn, use);
    missed ||= target !== undefined && slipped(now, next, use, target.id);
    now = next;
  }
  return now;
}
