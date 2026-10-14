import type { BackdropId } from '@/content';
import type { Danger } from '@/systems/missions';

import type { GameContext } from '../context';
import { journeyTo, plannedJourneyTo } from '../journeys';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

export interface Destination extends Choice {
  readonly id: string;
  readonly name: string;
  readonly epithet: string;
  readonly backdrop: BackdropId;
  readonly here: boolean;
  readonly days: number;
  readonly cost: number;
  readonly danger: string;
  /** The places the road passes through, as a phrase ("by way of Kiri Ford"), or null. */
  readonly via: string | null;
  readonly lockedReason: string | null;
}

/** How the worst of the road reads on a destination card. */
const DANGER_WORDS: Readonly<Record<Danger, string>> = {
  petty: 'Safe road',
  armed: 'Bandits about',
  deadly: 'Dangerous road',
  elite: 'Deadly road',
};

export function travelView(state: GameState, ctx: GameContext): readonly Destination[] {
  return ctx.content.locations.all.map((l) => {
    const journey = journeyTo(state, ctx, l.id) ?? plannedJourneyTo(state, ctx, l.id);
    const via = (journey?.via ?? []).map((id) => ctx.content.locations.require(id).name);
    return {
      ...choice(state, ctx, { type: 'travel', locationId: l.id }),
      id: l.id,
      name: l.name,
      epithet: l.epithet,
      backdrop: l.backdrop,
      here: l.id === state.locationId,
      days: journey?.days ?? 0,
      cost: journey?.cost ?? 0,
      danger: DANGER_WORDS[journey?.danger ?? 'petty'],
      via: via.length > 0 ? `By way of ${via.join(' and ')}` : null,
      lockedReason: l.lockedReason ?? null,
    };
  });
}
