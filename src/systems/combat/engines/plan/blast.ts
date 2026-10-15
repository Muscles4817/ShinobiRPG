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
import { movedTo } from './groundPlay';
import type { Turn } from './senses';
import { fighterIn, say, type Round } from './state';

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

/** The ground after a technique has gone off: thrown apart, and dust after a vast one. */
export function aftermath(round: Round, turn: Turn, t: CombatTechnique): Round {
  const size = widest(t);
  if (!size) return round;
  const range = afterBlast(round.range, size);
  const thrown =
    range === round.range ? round : movedTo(round, range, 'The blast throws everyone apart.');
  return AREA_RULES[size].dust ? dusted(thrown, turn, t) : thrown;
}
