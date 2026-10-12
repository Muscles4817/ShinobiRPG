import type { Verb } from '@/systems/techniques';

import type { CombatTechnique } from '../../contract';

/**
 * Fights saved mid-way before techniques had effect lists hold each technique with a single
 * `effect` and `power`. They are read back as a one-effect list (a stun is a daze now), so the
 * fight carries on as it would have.
 */

const LEGACY_VERB: Readonly<Record<string, Verb>> = {
  damage: 'damage',
  stun: 'daze',
  seal: 'seal',
  heal: 'heal',
};

interface LegacyTechnique extends Omit<CombatTechnique, 'effects'> {
  readonly effects?: CombatTechnique['effects'];
  readonly effect?: string;
  readonly power?: number;
}

export function upgradeTechnique(saved: CombatTechnique): CombatTechnique {
  // Saved fights may predate effect lists; the old fields are checked before use.
  const raw = saved as LegacyTechnique;
  if (raw.effects) return saved;
  const { effect, power, ...rest } = raw;
  const verb = LEGACY_VERB[effect ?? ''] ?? 'damage';
  return { ...rest, effects: [{ verb, power: power ?? 0 }] };
}
