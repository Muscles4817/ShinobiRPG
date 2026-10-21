import { maxBreath } from '../../rules/breath';
import { breathGathered, chakraGathered } from '../../rules/gather';
import { breathOf } from './effort';
import { told, type Bank } from './fresh';
import { patch, say, type PlanFighter, type Round } from './state';
import { momentOf } from './voice';
import type { Turn } from './senses';

/**
 * Gathering in a planned fight (`rules/gather.ts`): the turn goes into drawing chakra and breath
 * back, and the fighter is open until their next turn (`released` in `commitment.ts` ends it):
 * the avoid roll (`avoid.ts`) and their ready defence (`readiness.ts`) read it.
 */

const GATHERING: Bank = {
  id: 'gather',
  lines: [
    '{a} steady{a.s} {a.their} breathing and draw{a.s} {a.their} chakra back in.',
    '{a} drop{a.s} into a stance of stillness and gather{a.s} {a.themself}.',
    '{a} let{a.s} the fight go by for a moment, pulling {a.their} strength together.',
  ],
};

/** Whether gathering would give the fighter anything back. */
export function canGather(
  f: Pick<PlanFighter, 'attributes' | 'breath' | 'chakra' | 'maxChakra'>,
): boolean {
  return f.chakra < f.maxChakra || breathOf(f) < maxBreath(f.attributes);
}

/** Whether a fighter is gathering now, and so open. */
export function isGathering(f: Pick<PlanFighter, 'gathering'>): boolean {
  return f.gathering === true;
}

/** Plays a gather: chakra and breath come back, and the fighter stands open until next turn. */
export function gather(round: Round, { actor }: Turn): Round {
  const chakra = Math.min(actor.maxChakra, actor.chakra + chakraGathered(actor.maxChakra));
  const whole = maxBreath(actor.attributes);
  const breath = Math.min(whole, breathOf(actor) + breathGathered(whole));
  const line = told(momentOf(round, actor.id), GATHERING, { a: actor });
  return say(
    { ...round, fighters: patch(round.fighters, actor.id, { chakra, breath, gathering: true }) },
    line,
  );
}
