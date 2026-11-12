import { stepWords, type LadderStep } from '@/systems/techniques';

import { tell } from '../../rules/telling';
import type { PlanFighter } from './state';

/**
 * How a ladder is told in a fight: the status mark of the step open, and the lines as a step
 * opens, runs out on its own (stillness) or slams shut when the body gives out.
 */

/** How the fight screen marks an open ladder: "Third gate open". */
export function stepStatus(opened: LadderStep): string {
  const words = stepWords(opened).replace(/^the /, '');
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} open`;
}

const SAGE_OPENS =
  'Natural energy floods into {a} out of the stillness, and a toad’s marks ring {a.their} eyes.';
const KILN_OPENS =
  'Heat soaks into {a} out of the stillness, and {a.poss} skin glows like the mouth of a kiln.';

/** The line as a step opens. */
export function openingLine(actor: PlanFighter, opens: LadderStep): string {
  switch (opens.ladder) {
    case 'gates':
      return tell('{a} force{a.s} open {gate}; chakra roars through {a.their} body.', {
        a: actor,
        gate: stepWords(opens),
      });
    case 'wicks':
      return tell('{a} light{a.s} {wick}, and heat pours through {a.their} body.', {
        a: actor,
        wick: stepWords(opens),
      });
    case 'sage':
      return tell(SAGE_OPENS, { a: actor });
    case 'kiln':
      return tell(KILN_OPENS, { a: actor });
  }
}

/** The line as an empower runs out on its own. */
export function endLine(f: PlanFighter): string {
  const ladder = f.empowered?.opened?.ladder;
  if (ladder === 'sage') {
    return tell('The natural energy runs out of {a}, and {a.poss} sage mode fades.', { a: f });
  }
  if (ladder === 'kiln') {
    return tell('The heat ebbs out of {a}, and {a.poss} kiln calm cools.', { a: f });
  }
  return tell('{a.poss} surge of strength fades.', { a: f });
}

/** The line as a ladder slams shut on a body that gave out: collapsed, or only spent. */
export function shutLine(f: PlanFighter, opened: LadderStep, collapses: boolean): string {
  if (opened.ladder === 'wicks') {
    return collapses
      ? tell('The last wick gutters out, and {a.poss} body gives out under {a.them}.', { a: f })
      : tell('{a.poss} body gives out, and the wicks gutter out.', { a: f });
  }
  return collapses
    ? tell('The gates slam shut, and {a.poss} body gives out under {a.them}.', { a: f })
    : tell('{a.poss} body gives out, and the gates slam shut.', { a: f });
}
