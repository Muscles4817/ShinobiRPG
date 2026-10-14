import type { CombatProvision } from '@/systems/combat';
import type { EffectLine } from '@/systems/modifiers';

/** What a provision does in a fight, in words for a chip (the rules: `rules/provisions.ts`). */
export const PROVISION_WORDS: Readonly<Record<CombatProvision, string>> = {
  fortified: 'In a fight: chakra topped up at the start',
  steady: 'In a fight: no daze takes hold early on',
  antidote: 'In a fight: burns, bleeds and poison wear off sooner',
  'second-wind': 'In a fight: a second wind when badly hurt',
};

export function provisionLine(provision: CombatProvision | undefined): EffectLine[] {
  return provision ? [{ label: PROVISION_WORDS[provision], tone: 'gain' }] : [];
}
