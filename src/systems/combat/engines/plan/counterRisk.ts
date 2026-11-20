import type { CombatOption } from '../../contract';
import { counterOdds, counterWaitsOf } from '../../rules/counters';
import { opponentsOf } from './senses';
import { playerOf, type PlanFighter, type PlanState } from './state';

/**
 * What a counter is worth against these foes, said on its card (`docs/design/defence-plan.md`,
 * the counter system): a misread leaves you open, so the plan screen names the foe too quick for
 * you to read, or says you read them well. In words, never a number.
 */

/** Below this clean-read chance a counter is a guess; from this one it should land. */
const A_GUESS = 0.3;
const SHOULD_LAND = 0.6;

function cleanAgainst(you: PlanFighter, foe: PlanFighter): number {
  const { taijutsu, ninjutsu, kenjutsu } = foe.attributes;
  const skill = Math.max(taijutsu, ninjutsu, kenjutsu);
  return counterOdds({ defender: you, attacker: foe, skill, opens: false }).clean;
}

/** The risk of countering these foes, in a sentence, or nothing between the two. */
export function counterRisk(you: PlanFighter, foes: readonly PlanFighter[]): string | null {
  const rated = foes.map((foe) => ({ foe, clean: cleanAgainst(you, foe) }));
  const hardest = rated.reduce<(typeof rated)[number] | undefined>(
    (worst, r) => (!worst || r.clean < worst.clean ? r : worst),
    undefined,
  );
  if (!hardest) return null;
  if (hardest.clean < A_GUESS) return `${hardest.foe.name} is too quick for you to read: a guess`;
  return hardest.clean >= SHOULD_LAND ? 'You read them well: it should land' : null;
}

/** Counter cards on the plan screen, with what countering these foes risks. */
export function withCounterRisk(
  options: readonly CombatOption[],
  state: PlanState,
): CombatOption[] {
  const you = playerOf(state);
  const risk = counterRisk(you, opponentsOf(state.fighters, you));
  if (!risk) return [...options];
  return options.map((o) => {
    const [kind, , ...rest] = o.id.split(':');
    if (kind !== 'slot' || counterWaitsOf(rest.join(':')) === null) return o;
    return { ...o, detail: `${o.detail}. ${risk}` };
  });
}
