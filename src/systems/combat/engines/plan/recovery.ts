import type { CombatTechnique } from '../../contract';
import type { TrumpMemory } from '../../rules/trumps';
import { tagsOf } from '../../rules/tags';
import type { PlanFighter, Round } from './state';

/**
 * Techniques that need a breath between uses (`docs/design/technique-tags.md`, execution
 * `recovery`): Almighty Push can't be used two exchanges running. Using one sets how many
 * exchanges it rests; each exchange's end counts them down.
 */

/** Whether a technique is still resting from its last use. */
export function recovering(f: TrumpMemory, t: Pick<CombatTechnique, 'id'>): boolean {
  return (f.recovering?.[t.id] ?? 0) > 0;
}

/** What a fighter's resting techniques are after using this one. */
export function restingAfter(f: TrumpMemory, t: CombatTechnique): TrumpMemory['recovering'] {
  const rest = tagsOf(t).execution.recovery;
  if (rest === undefined || rest <= 0) return f.recovering;
  // It counts down at the end of the exchange it was used in too.
  return { ...f.recovering, [t.id]: rest + 1 };
}

function countedDown(f: PlanFighter): PlanFighter {
  if (!f.recovering) return f;
  const left = Object.entries(f.recovering)
    .map(([id, n]) => [id, n - 1] as const)
    .filter(([, n]) => n > 0);
  const { recovering: _was, ...rest } = f;
  return left.length === 0 ? rest : { ...rest, recovering: Object.fromEntries(left) };
}

/** As an exchange ends: every resting technique is an exchange nearer ready. */
export function recoveredAfter(round: Round): Round {
  return { ...round, fighters: round.fighters.map(countedDown) };
}
