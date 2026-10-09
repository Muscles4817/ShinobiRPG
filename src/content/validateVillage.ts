import { DAYS_PER_SEASON, SEASONS } from '@/systems/time';

import { duplicateIds } from './catalog';
import type { ContentPack, OpeningHours } from './types';

/**
 * Village life must hang together: rumours point at real jobs and people, sights reward
 * something, festivals fall on real days with sane prices, and opening hours aren't empty.
 */
export function validateVillage(pack: ContentPack): string[] {
  const { rumours, sights, festivals } = pack.village;
  return [
    ...duplicateIds(rumours).map((id) => `duplicate rumour id "${id}"`),
    ...duplicateIds(sights).map((id) => `duplicate sight id "${id}"`),
    ...duplicateIds(festivals).map((id) => `duplicate festival id "${id}"`),
    ...rumourProblems(pack),
    ...sights
      .filter((s) => Object.keys(s.reward).length === 0)
      .map((s) => `sight "${s.id}" rewards nothing`),
    ...festivals.flatMap((f) => festivalProblems(f)),
    ...hoursProblems(pack),
  ];
}

function rumourProblems(pack: ContentPack): string[] {
  const missions = new Set(pack.missions.map((m) => m.id));
  const people = new Set(pack.people.map((p) => p.id));
  const standing = new Set(pack.missions.filter((m) => m.standing).map((m) => m.id));
  return pack.village.rumours.flatMap((r) => [
    ...(r.missionId !== undefined && !missions.has(r.missionId)
      ? [`rumour "${r.id}" is about unknown mission "${r.missionId}"`]
      : []),
    ...(r.missionId !== undefined && standing.has(r.missionId)
      ? [`rumour "${r.id}" foreshadows a standing job, which is never posted`]
      : []),
    ...(r.personId !== undefined && !people.has(r.personId)
      ? [`rumour "${r.id}" is about unknown person "${r.personId}"`]
      : []),
  ]);
}

function festivalProblems(f: ContentPack['village']['festivals'][number]): string[] {
  return [
    ...(f.season < 0 || f.season >= SEASONS.length || f.day < 1 || f.day > DAYS_PER_SEASON
      ? [`festival "${f.id}" falls on a day that doesn't exist`]
      : []),
    ...(f.marketPrices <= 0 || f.marketPrices > 1
      ? [`festival "${f.id}" must keep market prices between free and full price`]
      : []),
  ];
}

function hoursProblems(pack: ContentPack): string[] {
  const empty = (hours: OpeningHours | undefined) => hours?.length === 0;
  const festivalStalls = pack.village.festivals
    .flatMap((f) => f.stalls ?? [])
    .filter((s) => empty(s.hours))
    .map((s) => `stall "${s.name}" is never open`);
  const places = pack.locations.flatMap((l) =>
    l.places.flatMap((p) => [
      ...(empty(p.hours) ? [`place "${p.id}" is never open`] : []),
      ...(p.kind === 'market'
        ? p.stalls.filter((s) => empty(s.hours)).map((s) => `stall "${s.name}" is never open`)
        : []),
    ]),
  );
  return [...festivalStalls, ...places];
}
