import type { BackdropId, LocationDef } from '@/content';
import type { Danger } from '@/systems/missions';
import type { Journey } from '@/systems/travel';

import { examClash } from '../awayNotes';
import type { GameContext } from '../context';
import { journeyMission, journeyTo, plannedJourneyTo } from '../journeys';
import { rationDays } from '../road';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/**
 * The Travel tab: every location with the way there (days, passage, the worst of the road,
 * the places passed) and, for a trip you could take, what to know before setting out.
 */

export interface Destination extends Choice {
  readonly id: string;
  readonly name: string;
  readonly epithet: string;
  readonly backdrop: BackdropId;
  readonly here: boolean;
  readonly days: number;
  readonly cost: number;
  readonly danger: string;
  /** The places the road passes through, as a phrase ("By way of Kiri Ford"), or null. */
  readonly via: string | null;
  readonly lockedReason: string | null;
  /** The same trip without stopping to camp. */
  readonly quick: Choice;
  /** Before you go: short food, nowhere to sleep, an exam you'd miss. */
  readonly warnings: readonly string[];
}

/** How the worst of the road reads on a destination card. */
const DANGER_WORDS: Readonly<Record<Danger, string>> = {
  petty: 'Safe road',
  armed: 'Bandits about',
  deadly: 'Dangerous road',
  elite: 'Deadly road',
};

function warningsFor(
  state: GameState,
  ctx: GameContext,
  destination: LocationDef,
  journey: Journey,
): string[] {
  const food = rationDays(state, ctx);
  const plan = { from: state.locationId, to: destination.id, legs: journey.legs, quick: false };
  const clash = examClash(state, ctx, journeyMission(plan, ctx));
  return [
    ...(food < journey.days
      ? [
          food === 0
            ? 'Nothing in your pack that keeps on the road. The grocer sells rations.'
            : `Your pack holds food for ${food} of the ${journey.days} days.`,
        ]
      : []),
    ...(destination.places.some((p) => p.kind === 'home') ? [] : ['Nowhere to sleep there yet.']),
    ...(clash ? [clash.text] : []),
  ];
}

export function travelView(state: GameState, ctx: GameContext): readonly Destination[] {
  return ctx.content.locations.all.map((l) => {
    const open = journeyTo(state, ctx, l.id);
    const journey = open ?? plannedJourneyTo(state, ctx, l.id);
    const via = (journey?.via ?? []).map((id) => ctx.content.locations.require(id).name);
    const here = l.id === state.locationId;
    return {
      ...choice(state, ctx, { type: 'travel', locationId: l.id }),
      id: l.id,
      name: l.name,
      epithet: l.epithet,
      backdrop: l.backdrop,
      here,
      days: journey?.days ?? 0,
      cost: journey?.cost ?? 0,
      danger: DANGER_WORDS[journey?.danger ?? 'petty'],
      via: via.length > 0 ? `By way of ${via.join(' and ')}` : null,
      lockedReason: l.lockedReason ?? null,
      quick: choice(state, ctx, { type: 'travel', locationId: l.id, quick: true }),
      warnings: open && !here ? warningsFor(state, ctx, l, open) : [],
    };
  });
}
