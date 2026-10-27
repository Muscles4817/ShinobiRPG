import type { CombatGround } from '@/systems/combat';
import type { StatDelta } from '@/systems/stats';
import type { Season } from '@/systems/time';

import type { Danger } from './crew';
import type { EncounterFlavour } from './encounter';
import type { DecisionOption } from './storyStages';

/**
 * What may happen on a stretch of road (`docs/design/journeys-plan.md` 3.5), drawn by the
 * region, the road's danger, the season and the day. Every kind comes up as a choice: a scene
 * with options of its own, foes on the road, something lying by it, the weather turning, or
 * something worth stopping to watch. How each plays is the game layer's (`game/story/`).
 */

/** How often a road event comes up among the others it could be: a rare one is a find. */
export const ROAD_RARITIES = ['common', 'uncommon', 'rare'] as const;
export type RoadRarity = (typeof ROAD_RARITIES)[number];

export const ROAD_EVENT_KINDS = [
  'decision',
  'encounter',
  'find',
  'weather',
  'sight',
  'traveller',
] as const;
export type RoadEventKind = (typeof ROAD_EVENT_KINDS)[number];

interface RoadEventBase {
  readonly id: string;
  /** The kinds of road it happens on ("hill-road", "coast-road"). */
  readonly regions: readonly string[];
  /** The least danger a road must hold for it (bandits never come on a safe road); any by default. */
  readonly danger?: Danger;
  /** The seasons it happens in; every season when absent. */
  readonly seasons?: readonly Season[];
  /** Common when absent. */
  readonly rarity?: RoadRarity;
  /** Met once in a life, never again (`atlas.roadSeen`). */
  readonly once?: true;
  /** Only once the village remembers this (a world mark): what a story has left in the wild. */
  readonly needsWorldMark?: string;
  /** No longer once the village remembers this: a story has moved it on. */
  readonly closedBy?: string;
  readonly text: string;
}

/** A scene and its options, each with a tone the people along take by their tastes. */
export interface DecisionRoadEvent extends RoadEventBase {
  readonly kind?: 'decision';
  readonly options: readonly DecisionOption[];
}

/**
 * Foes on the road. Each party is a band of foes from the bestiary; only those no worse than the
 * road's danger come (`partyDanger`), so a safe road never brings a warband. Facing them is an
 * encounter stage played where you stand; going round them costs the day's strength.
 */
export interface EncounterRoadEvent extends RoadEventBase {
  readonly kind: 'encounter';
  readonly parties: readonly (readonly string[])[];
  /** An `EncounterTemplate` id (validated). */
  readonly template: string;
  readonly ground?: CombatGround;
  /** The template's lines this road tells its own way (a den in the dunes, not the woods). */
  readonly flavour?: Partial<EncounterFlavour>;
  /** Going the long way round them, as the story tells it. */
  readonly around: string;
}

/** Something lying by the road: one of `ingredientIds`, drawn by the day, or nothing if you walk on. */
export interface FindRoadEvent extends RoadEventBase {
  readonly kind: 'find';
  readonly ingredientIds: readonly string[];
  /** Picking it up, as the story tells it. */
  readonly taken: string;
}

/** The weather turns: wait it out and lose part of the day, or push on and pay for it in the body. */
export interface WeatherRoadEvent extends RoadEventBase {
  readonly kind: 'weather';
  readonly wait: { readonly reply: string; readonly slots: number };
  readonly push: { readonly reply: string; readonly energy: number; readonly health: number };
}

/** Something worth stopping to watch, like the village's night sights; it teaches a little. */
export interface SightRoadEvent extends RoadEventBase {
  readonly kind: 'sight';
  /** What watching it shows you. */
  readonly outcome: string;
  readonly reward: StatDelta;
}

/** Someone of the road (`travellers.ts`), at whichever meeting with you comes next. */
export interface TravellerRoadEvent extends RoadEventBase {
  readonly kind: 'traveller';
  readonly travellerId: string;
}

export type RoadEventDef =
  | DecisionRoadEvent
  | EncounterRoadEvent
  | FindRoadEvent
  | WeatherRoadEvent
  | SightRoadEvent
  | TravellerRoadEvent;

/** A road event written as a scene with options (every event before kinds came was one). */
export function isDecisionEvent(event: RoadEventDef): event is DecisionRoadEvent {
  return event.kind === undefined || event.kind === 'decision';
}

/** A road event's own written options; the other kinds' choices are the game's. */
export function writtenOptions(event: RoadEventDef): readonly DecisionOption[] {
  return isDecisionEvent(event) ? event.options : [];
}
