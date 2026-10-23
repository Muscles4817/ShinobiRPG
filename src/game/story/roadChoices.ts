import { hashUnit } from '@/core';
import {
  isDecisionEvent,
  type DecisionOption,
  type EncounterRoadEvent,
  type EncounterStage,
  type RoadEventDef,
  type TravellerGift,
  type TravellerRoadEvent,
} from '@/systems/missions';
import type { StatDelta } from '@/systems/stats';

import type { GameContext } from '../context';
import { activeStage } from '../missionFlow';
import type { GameState } from '../state';
import { partiesFor, stretchDanger } from './roadEvents';
import { nextMeeting } from './travellers';

/**
 * The choices a road event offers, by its kind (`docs/design/journeys-plan.md` 3.5). A
 * decision's are its own options. The other kinds get theirs from the game: foes on the road
 * (go the long way round, or face them where they stand), something by the road (take it or walk
 * on), the weather (wait it out or push on), a sight (stop and watch it or walk on). What each
 * leaves for the game to do after the option's own outcome is its `after`. The choice that meets
 * the road comes first and the one that keeps clear of it second, so the cautious way is always
 * there but never the one the bar leads with.
 */

/** Going round foes on the road costs this much energy. */
export const ROUND_THEM_ENERGY = 15;

/** What a road choice leaves the game to do once the option's own outcome is applied. */
export type RoadAfter =
  | { readonly kind: 'face'; readonly stage: EncounterStage }
  | { readonly kind: 'take'; readonly ingredientId: string }
  | { readonly kind: 'wait'; readonly slots: number }
  | { readonly kind: 'watch'; readonly reward: StatDelta }
  /** A meeting with someone of the road behind you, what they keep of it, and their gift. */
  | {
      readonly kind: 'meet';
      readonly travellerId: string;
      readonly index: number;
      readonly remember?: string;
      readonly gift?: TravellerGift;
    };

export interface RoadChoice {
  readonly option: DecisionOption;
  /** What it costs or brings, as the choice bar says it ("Tiring"). */
  readonly detail?: string;
  readonly after?: RoadAfter;
}

const walkOn = (reply: string): RoadChoice => ({
  option: { label: 'Walk on', tone: 'quiet', reply },
});

function drawKey(state: GameState, ...rest: string[]): number {
  const run = state.mission;
  return hashUnit(
    state.board.seed,
    state.time.day,
    run?.missionId ?? '',
    run?.stageIndex ?? 0,
    ...rest,
  );
}

function pick<T>(items: readonly T[], roll: number): T | undefined {
  return items[Math.min(items.length - 1, Math.floor(roll * items.length))];
}

/** The band of foes met: one the road's danger allows, drawn by the day. */
export function partyMet(
  state: GameState,
  ctx: GameContext,
  event: EncounterRoadEvent,
): readonly string[] {
  // The leg the event came up on, and how dangerous its road is.
  const leg = activeStage(state, ctx);
  const stretch = leg?.kind === 'leg' ? leg : {};
  const parties = partiesFor(event, stretchDanger(state, ctx, stretch), ctx);
  return pick(parties, drawKey(state, event.id, 'party')) ?? event.parties[0] ?? [];
}

function encounterChoices(
  state: GameState,
  ctx: GameContext,
  event: EncounterRoadEvent,
): RoadChoice[] {
  const stage: EncounterStage = {
    kind: 'encounter',
    text: event.text,
    template: event.template,
    enemyIds: partyMet(state, ctx, event),
    // Nothing on the road is anyone's job: however you get past them, nothing is lost by it.
    job: 'deliver',
    canFlee: true,
    ...(event.ground ? { ground: event.ground } : {}),
    ...(event.flavour ? { flavour: event.flavour } : {}),
  };
  return [
    {
      option: { label: 'Face them', tone: 'challenge', reply: 'You walk on to meet them.' },
      detail: 'Size them up first',
      after: { kind: 'face', stage },
    },
    {
      option: {
        label: 'Go the long way round',
        tone: 'quiet',
        reply: event.around,
        effects: [{ kind: 'energy', by: -ROUND_THEM_ENERGY }],
      },
      detail: 'A long, tiring way',
    },
  ];
}

/** The meeting with them that comes next: its options, each leaving the meeting behind you. */
function travellerChoices(
  state: GameState,
  ctx: GameContext,
  event: TravellerRoadEvent,
): RoadChoice[] {
  const next = nextMeeting(state, ctx, event.travellerId);
  if (!next) return [];
  return next.meeting.options.map(({ remember, gift, ...option }) => ({
    option,
    after: {
      kind: 'meet',
      travellerId: event.travellerId,
      index: next.index,
      ...(remember ? { remember } : {}),
      ...(gift ? { gift } : {}),
    },
  }));
}

/** What the road shows of the event: a traveller's next meeting, else the event's own text. */
export function roadEventText(state: GameState, ctx: GameContext, event: RoadEventDef): string {
  if (event.kind !== 'traveller') return event.text;
  return nextMeeting(state, ctx, event.travellerId)?.meeting.text ?? event.text;
}

/** The choices the event offers here and now. */
export function roadChoices(state: GameState, ctx: GameContext, event: RoadEventDef): RoadChoice[] {
  if (isDecisionEvent(event)) return event.options.map((option) => ({ option }));
  switch (event.kind) {
    case 'encounter':
      return encounterChoices(state, ctx, event);
    case 'find': {
      const ingredientId = pick(event.ingredientIds, drawKey(state, event.id, 'find')) ?? '';
      const name = ctx.content.ingredients.require(ingredientId).name.toLowerCase();
      return [
        {
          option: { label: `Take the ${name}`, reply: event.taken },
          after: { kind: 'take', ingredientId },
        },
        walkOn('You leave it where it lies and walk on.'),
      ];
    }
    case 'weather':
      return [
        {
          option: {
            label: 'Push on through it',
            tone: 'challenge',
            reply: event.push.reply,
            effects: [
              { kind: 'energy', by: -event.push.energy },
              { kind: 'harm', health: event.push.health },
            ],
          },
          detail: 'Tiring, and it will hurt',
        },
        {
          option: { label: 'Wait it out', tone: 'quiet', reply: event.wait.reply },
          detail: 'Loses part of the day',
          after: { kind: 'wait', slots: event.wait.slots },
        },
      ];
    case 'sight':
      return [
        {
          option: { label: 'Stop and watch', tone: 'curious', reply: event.outcome },
          detail: 'Teaches a little',
          after: { kind: 'watch', reward: event.reward },
        },
        walkOn('You keep your eyes on the road and walk on.'),
      ];
    case 'traveller':
      return travellerChoices(state, ctx, event);
  }
}
