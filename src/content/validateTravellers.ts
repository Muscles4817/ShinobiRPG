import type { TravellerDef, TravellerGift } from '@/systems/missions';

import { TONES } from './people';
import type { ContentPack } from './types';

/**
 * People of the road (`docs/design/journeys-plan.md` 3.6): each walks roads that roads or jobs
 * cross, has a meeting to begin with that needs nothing, needs only what an earlier meeting may
 * leave them remembering, speaks in real tones, and gives only what the pack holds.
 */
export function validateTravellers(pack: ContentPack): string[] {
  const crossed = new Set([
    ...pack.routes.flatMap((r) => r.legs.map((l) => l.region)),
    ...pack.missions.flatMap((m) =>
      m.stages.flatMap((s) => (s.kind === 'leg' && s.region ? [s.region] : [])),
    ),
  ]);
  return pack.travellers.flatMap((t) => [
    ...t.regions
      .filter((r) => !crossed.has(r))
      .map((r) => `traveller "${t.id}" walks region "${r}", which no road crosses`),
    ...meetingProblems(t),
    ...t.meetings.flatMap((m) =>
      m.options.flatMap((o) => [
        ...(o.tone && !(TONES as readonly string[]).includes(o.tone)
          ? [`traveller "${t.id}" option "${o.label}" has unknown tone "${o.tone}"`]
          : []),
        ...(o.gift ? giftProblems(pack, t.id, o.gift) : []),
      ]),
    ),
  ]);
}

function meetingProblems(t: TravellerDef): string[] {
  const first = t.meetings[0];
  if (!first) return [`traveller "${t.id}" has no meetings`];
  const problems = first.needs
    ? [`traveller "${t.id}" can never be met: the first meeting needs "${first.needs}"`]
    : [];
  return t.meetings.reduce(
    ({ left, problems }, m, i) => ({
      left: [...left, ...m.options.flatMap((o) => (o.remember ? [o.remember] : []))],
      problems:
        m.needs && !left.includes(m.needs) && i > 0
          ? [
              ...problems,
              `traveller "${t.id}" meeting ${i + 1} needs "${m.needs}", which no earlier meeting leaves`,
            ]
          : problems,
    }),
    { left: [] as string[], problems },
  ).problems;
}

function giftProblems(pack: ContentPack, id: string, gift: TravellerGift): string[] {
  switch (gift.kind) {
    case 'recipe':
      return pack.recipes.some((r) => r.id === gift.recipeId)
        ? []
        : [`traveller "${id}" teaches unknown recipe "${gift.recipeId}"`];
    case 'ingredient':
      return pack.ingredients.some((i) => i.id === gift.ingredientId)
        ? []
        : [`traveller "${id}" gives unknown ingredient "${gift.ingredientId}"`];
    case 'place':
      return [];
  }
}
