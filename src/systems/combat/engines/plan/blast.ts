import type { AreaSize } from '@/systems/techniques';

import type { CombatTechnique } from '../../contract';
import {
  afterBlast,
  AREA_RULES,
  areaSize,
  driveOf,
  effectsOf,
  FIELD_RULES,
  potencyOf,
  raiseField,
} from '../../rules/verbs';
import { distanceBetween } from './distance';
import { movedTo, pairsMoved } from './groundPlay';
import type { Turn } from './senses';
import { fighterIn, say, type PlanFighter, type Round } from './state';

/**
 * What a wide or vast technique leaves behind once it has gone off (`rules/verbs/area.ts`): the
 * blast throws everyone apart, and a vast one leaves dust over the field that blinds both sides.
 * It happens whether or not anyone was hurt: the ground still went up.
 */

const SIZE_ORDER: readonly AreaSize[] = ['small', 'wide', 'vast'];

/** The widest area a technique covers, if it has one. */
function widest(t: CombatTechnique): AreaSize | null {
  const sizes = effectsOf(t, 'area').map(areaSize);
  if (sizes.length === 0) return null;
  return sizes.reduce((a, b) => (SIZE_ORDER.indexOf(b) > SIZE_ORDER.indexOf(a) ? b : a));
}

/** The field after a vast technique: dust of its user's making, which blinds everyone. */
function dusted(round: Round, turn: Turn, t: CombatTechnique): Round {
  const actor = fighterIn(round, turn.actor.id) ?? turn.actor;
  const [area] = effectsOf(t, 'area');
  if (!area) return round;
  const potency = potencyOf(driveOf(actor, { technique: t, effect: area }), area.power);
  const field = raiseField({ id: 'dust', side: actor.side, potency }, round.number);
  return say({ ...round, field }, FIELD_RULES.dust.rises);
}

/** A wide blast throws back only those it caught, from its maker. */
function thrownBack(round: Round, maker: PlanFighter, caught: readonly PlanFighter[]): Round {
  const moves = caught.map((foe) => ({
    a: maker.id,
    b: foe.id,
    to: afterBlast(distanceBetween(round, maker.id, foe.id), 'wide'),
  }));
  const moving = moves.filter((m) => m.to !== distanceBetween(round, m.a, m.b));
  return moving.length === 0 ? round : pairsMoved(round, moving, THROWN_BACK);
}

const THROWN_BACK = 'The blast throws back everyone it caught.';

/**
 * The ground after a technique has gone off: a wide one throws back those it `caught`, a vast
 * one throws everyone apart and leaves dust.
 */
export function aftermath(round: Round, turn: Turn, used: Blast): Round {
  const size = widest(used.t);
  if (!size) return round;
  if (size === 'wide') return thrownBack(round, turn.actor, used.caught);
  const range = afterBlast(round.range, size);
  const apart = round.distances === undefined && range === round.range;
  const thrown = apart ? round : movedTo(round, range, 'The blast throws everyone apart.');
  return AREA_RULES[size].dust ? dusted(thrown, turn, used.t) : thrown;
}

/** A technique gone off, and whom its area caught. */
export interface Blast {
  readonly t: CombatTechnique;
  readonly caught: readonly PlanFighter[];
}
