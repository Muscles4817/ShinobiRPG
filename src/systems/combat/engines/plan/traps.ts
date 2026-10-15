import type { Rng } from '@/core';

import { alive } from '../../rules/body';
import { techniqueDamage } from '../../rules/damage';
import { attackKindOf } from '../../rules/kit';
import { RANGE_LABEL } from '../../rules/range';
import {
  driveOf,
  effectsOf,
  resistOf,
  spotChance,
  springs,
  trapAt,
  type EffectUse,
} from '../../rules/verbs';
import { react } from './react';
import { canDaze, dazeIn } from './daze';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';
import { dazeLine, momentOf } from './voice';

/**
 * Traps in a planned fight. A trap is set at the distance the fight stands at; the first foe of
 * the setter to act there from the next exchange on, or to move the fight into it, springs it
 * as their turn begins or their step lands (`rules/verbs/trap.ts`). It bites like any hit (a
 * guard softens it, a clone may take it), can't be dodged, and may daze: sprung as a turn
 * begins, that turn is lost.
 */

export function setTrap(round: Round, actor: PlanFighter, use: EffectUse<'trap'>): Round {
  const craft = driveOf(actor, use);
  const trap = trapAt(use.technique.id, round.range, { craft, exchange: round.number });
  const fighters = round.fighters.map((f) => (f.id === actor.id ? { ...f, trap } : f));
  const where = RANGE_LABEL[round.range].toLowerCase();
  return say({ ...round, fighters }, `${actor.name} sets a trap at ${where} range.`);
}

function disarmed(round: Round, setterId: string): Round {
  const fighters = round.fighters.map((f) => {
    if (f.id !== setterId) return f;
    const { trap: _gone, ...rest } = f;
    return rest;
  });
  return { ...round, fighters };
}

function trapUse(setter: PlanFighter): EffectUse<'trap'> | null {
  const technique = setter.techniques.find((t) => t.id === setter.trap?.techniqueId);
  const [effect] = technique ? effectsOf(technique, 'trap') : [];
  return technique && effect ? { technique, effect } : null;
}

/** A setter's trap goes off under a foe (or is noticed, and stepped around). */
function spring(start: Round, setter: PlanFighter, victim: PlanFighter, rng: Rng): Round {
  const use = trapUse(setter);
  const trap = setter.trap;
  const round = disarmed(start, setter.id);
  if (!use || !trap) return round;
  if (rng.chance(spotChance(trap, resistOf(victim, use)))) {
    return say(round, `${victim.name} spots ${setter.name}'s trap and steps around it.`);
  }
  const hit = react(round, {
    attacker: setter,
    target: victim,
    blow: {
      raw: techniqueDamage(setter, victim, use, rng.next()),
      what: 'trap',
      dodgeable: false,
      physical: false,
      kind: attackKindOf(use.technique),
    },
    rng,
  });
  const struck = fighterIn(hit, victim.id);
  const shaken = struck !== undefined && struck.health !== victim.health;
  if (!use.effect.dazes || !struck || !alive(struck) || !shaken) return hit;
  if (!canDaze(struck, hit.number)) return hit;
  return say(
    { ...hit, fighters: patch(hit.fighters, victim.id, dazeIn(hit.number)) },
    dazeLine(momentOf(hit, victim.id), victim.name),
  );
}

/**
 * Springs any trap a foe of this fighter has set where the fight stands, as their turn begins
 * (`moved` false) or once their step has moved the fight (`moved` true).
 */
export function springTraps(round: Round, victimId: string, rng: Rng, moved: boolean): Round {
  const at = { band: round.range, exchange: round.number, moved };
  return round.fighters.reduce((r, f) => {
    const setter = fighterIn(r, f.id);
    const victim = fighterIn(r, victimId);
    if (!setter?.trap || !victim || !alive(victim) || setter.side === victim.side) return r;
    return springs(setter.trap, at) ? spring(r, setter, victim, rng) : r;
  }, round);
}
