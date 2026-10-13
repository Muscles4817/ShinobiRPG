import { STAT_GRADES } from '@/systems/stats';
import {
  ACCURACIES,
  DISCIPLINES,
  ELEMENTS,
  NEEDED_WEAPONS,
  type TechniqueDef,
} from '@/systems/techniques';

import type { ContentPack } from './types';

/**
 * Technique ranks and hard needs: every technique has a real rank, its needs are sane, a fresh
 * graduate starts with nothing unstable, and the academy has a scroll in each discipline that a
 * fresh graduate can study at the normal pace.
 */
export function validateTechniques(pack: ContentPack): string[] {
  return [
    ...pack.techniques.flatMap(rankProblems),
    ...pack.techniques.flatMap(shapeProblems),
    ...starterProblems(pack),
    ...beginnerProblems(pack),
  ];
}

const grades: readonly string[] = STAT_GRADES;
const elements: readonly string[] = ELEMENTS;
const weapons: readonly string[] = NEEDED_WEAPONS;
const accuracies: readonly string[] = ACCURACIES;
const BANDS: readonly string[] = ['close', 'mid', 'far'];

/** A reach of real, distinct bands, and a known accuracy. */
function shapeProblems(t: TechniqueDef): string[] {
  const reach = t.reach;
  const badReach =
    reach !== undefined &&
    (reach.length === 0 ||
      new Set(reach).size !== reach.length ||
      reach.some((b) => !BANDS.includes(b)));
  return [
    ...(badReach ? [`technique "${t.id}" has a reach that isn't distinct, real bands`] : []),
    ...(t.accuracy !== undefined && !accuracies.includes(t.accuracy)
      ? [`technique "${t.id}" has unknown accuracy "${t.accuracy}"`]
      : []),
  ];
}

function rankProblems(t: TechniqueDef): string[] {
  const problems: string[] = [];
  if (!grades.includes(t.rank)) problems.push(`technique "${t.id}" has unknown rank "${t.rank}"`);
  const needs = t.needs;
  if (t.discipline === 'kenjutsu' && needs?.weapon !== 'blade') {
    problems.push(`technique "${t.id}" is a blade art and must need a blade`);
  }
  if (!needs) return problems;
  if (needs.minReserves !== undefined && needs.minReserves <= 0) {
    problems.push(`technique "${t.id}" needs a positive minimum of reserves`);
  }
  if (needs.control !== undefined && !grades.includes(needs.control)) {
    problems.push(`technique "${t.id}" needs an unknown control grade "${needs.control}"`);
  }
  if (needs.nature !== undefined && !elements.includes(needs.nature)) {
    problems.push(`technique "${t.id}" needs an unknown nature "${needs.nature}"`);
  }
  if (needs.weapon !== undefined && !weapons.includes(needs.weapon)) {
    problems.push(`technique "${t.id}" needs an unknown weapon "${needs.weapon}"`);
  }
  if (Object.keys(needs).length === 0) problems.push(`technique "${t.id}" has empty needs`);
  return problems;
}

/**
 * A technique anyone at grade E learns at the normal pace, with nothing else required but a
 * weapon (a genin who starts with a blade art is issued a blade, and the shops sell D blades).
 */
function forBeginners(t: TechniqueDef): boolean {
  const { weapon: _weapon, ...bodily } = t.needs ?? {};
  return t.rank === 'E' && Object.keys(bodily).length === 0;
}

/** Techniques a character can start with are rank E, so nobody begins with an unstable one. */
function starterProblems(pack: ContentPack): string[] {
  const starters = [
    ...pack.academyTechniques,
    ...Object.values(pack.disciplineStarters),
    ...pack.clans.flatMap((c) => c.startingTechniqueIds),
  ];
  return [...new Set(starters)].flatMap((id) => {
    const t = pack.techniques.find((d) => d.id === id);
    return t && !forBeginners(t) ? [`starting technique "${id}" must be rank E with no needs`] : [];
  });
}

/** A fresh graduate must be able to study a scroll in each discipline at the academy. */
function beginnerProblems(pack: ContentPack): string[] {
  const start = pack.locations.find((l) => l.id === pack.startLocationId);
  const offered = new Set(
    start?.places.flatMap((p) => (p.kind === 'academy' ? p.techniqueIds : [])) ?? [],
  );
  const beginner = pack.techniques.filter(
    (t) => offered.has(t.id) && t.clan === undefined && forBeginners(t),
  );
  return DISCIPLINES.filter((d) => !beginner.some((t) => t.discipline === d)).map(
    (d) => `academy needs a ${d} scroll a fresh graduate can study`,
  );
}
