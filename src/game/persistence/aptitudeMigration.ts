import { CONTENT_PACKS } from '@/content';
import type { ModifierSpec } from '@/systems/modifiers';
import { nothingKnown } from '@/systems/stats';

import { derivedAptitude } from '../aptitude';

/** The aptitude step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** The clan's and talent's growth specs, as aptitude takes them over; none for an unknown pack. */
function identitySpecs(state: RawState, character: RawState): ModifierSpec[] {
  const pack = CONTENT_PACKS.find((p) => p.id === state.packId);
  const clan = pack?.clans.find((c) => c.id === character.clanId);
  const talent = pack?.talents.find((t) => t.id === character.talentId);
  return [clan?.modifiers ?? {}, talent?.modifiers ?? {}];
}

/**
 * v17 → v18: hidden aptitude per stat. Characters made before it get exactly the growth their
 * clan and talent used to give them (no dice), and have found nothing out yet. Traits keep
 * acting as modifiers, as before.
 */
export function v17ToV18(state: RawState): RawState {
  const character = asRecord(state.character);
  return {
    ...state,
    character: {
      ...character,
      aptitude: derivedAptitude(identitySpecs(state, character)),
      aptitudeKnown: nothingKnown(),
      aptitudeSessions: {},
    },
  };
}
