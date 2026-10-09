import type { BackdropId } from '@/content';
import { RANK_LABELS } from '@/systems/standing';
import { formatDate, slotName, type TimeSlot } from '@/systems/time';
import { isHungry, maxChakra, maxHealth, METER_MAX } from '@/systems/vitals';

import type { GameContext } from '../context';
import { currentLocation } from '../ops';
import type { GameState } from '../state';

export interface Meter {
  readonly label: string;
  readonly value: number;
  readonly max: number;
}

/** Everything the top of a screen shows: who, where, when, and how you're doing. */
export interface HeaderView {
  readonly name: string;
  readonly rank: string;
  readonly ryo: number;
  readonly date: string;
  readonly slot: TimeSlot;
  readonly slotIndex: number;
  readonly location: string;
  readonly epithet: string;
  readonly backdrop: BackdropId;
  /** True when the character is away from the village they live in. */
  readonly visiting: boolean;
  readonly meters: readonly Meter[];
  readonly warnings: readonly string[];
}

export function headerView(state: GameState, ctx: GameContext): HeaderView {
  const { stats, vitals } = state.character;
  const location = currentLocation(state, ctx);
  const warnings: string[] = [];
  if (vitals.health < maxHealth(stats) * 0.3) warnings.push('Badly hurt');
  if (isHungry(vitals)) warnings.push('Hungry');
  if (vitals.energy < 20) warnings.push('Exhausted');
  return {
    name: state.character.name,
    rank: RANK_LABELS[state.standing.rank],
    ryo: state.wallet.ryo,
    date: formatDate(state.time),
    slot: slotName(state.time),
    slotIndex: state.time.slot,
    location: location.name,
    epithet: location.epithet,
    backdrop: location.backdrop,
    visiting: location.id !== ctx.content.startLocationId,
    meters: [
      { label: 'Health', value: Math.round(vitals.health), max: maxHealth(stats) },
      { label: 'Chakra', value: Math.round(vitals.chakra), max: maxChakra(stats) },
      { label: 'Energy', value: Math.round(vitals.energy), max: METER_MAX },
      { label: 'Fed', value: Math.round(vitals.satiety), max: METER_MAX },
    ],
    warnings,
  };
}
