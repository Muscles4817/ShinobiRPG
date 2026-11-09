import { travellerEventId, type RoadEventDef, type TravellerDef } from '@/systems/missions';

/**
 * Each traveller comes on the road as a road event of their own (`docs/design/journeys-plan.md`
 * 3.6), so the draw weighs them among everything else a stretch may bring; which of their
 * meetings it is, the game decides from what you've met of them.
 */
export function travellerRoadEvents(travellers: readonly TravellerDef[]): RoadEventDef[] {
  return travellers.map((t) => ({
    kind: 'traveller',
    id: travellerEventId(t.id),
    regions: t.regions,
    rarity: t.rarity ?? 'uncommon',
    text: t.seen,
    travellerId: t.id,
  }));
}
