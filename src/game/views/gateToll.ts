import { MAX_HEALTH } from '@/systems/vitals';
import { stepToll } from '@/systems/combat';
import { stepWords, type LadderStep } from '@/systems/techniques';

/**
 * A ladder step's price as the technique sheet tells it (`combat/rules/verbs/tolls.ts`): what it
 * takes while open, and what it leaves once it shuts.
 */

/** What is left of you once the step shuts, in words. */
function afterwards(step: LadderStep): string {
  const toll = stepToll(step);
  if (toll.collapses) return 'and when it shuts you collapse';
  if (toll.spent.body > 0) return 'and leaves you winded, slower and weaker once it shuts';
  return toll.spent.stamina > 0 ? 'and leaves you winded once it shuts' : '';
}

/** The sheet's line for a step: what it raises and its price, with health a turn as a chip. */
export function gateLine(
  step: LadderStep,
  raises: string,
): { readonly text: string; readonly chip: string | null } {
  const health = Math.round(stepToll(step).health * MAX_HEALTH);
  const after = afterwards(step);
  return {
    text: `Opens ${stepWords(step)}: raises ${raises} until the body gives out, draining your breath${after ? ` ${after}` : ''}`,
    chip: health > 0 ? `−${health} health a turn` : null,
  };
}
