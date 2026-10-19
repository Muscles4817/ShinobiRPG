import type { ContentPack } from './types';

/**
 * Hive strains: each has sane numbers (a drain and senses between nothing and strong, hardiness
 * short of shrugging off every loss), and every clan that installs a hive names a real strain
 * and teaches techniques that spend from it.
 */

const MOST_DRAIN = 2;
const MOST_HARDINESS = 0.8;

function strainProblems(pack: ContentPack): string[] {
  return pack.strains.flatMap((s) => [
    ...(s.drain > 0 && s.drain <= MOST_DRAIN ? [] : [`strain "${s.id}" has no sane drain`]),
    ...(s.hardiness >= 0 && s.hardiness <= MOST_HARDINESS
      ? []
      : [`strain "${s.id}" has no sane hardiness`]),
    ...(s.senses >= 0 && s.senses <= 1 ? [] : [`strain "${s.id}" senses beyond 0–1`]),
  ]);
}

function clanHiveProblems(pack: ContentPack): string[] {
  const strains = new Set(pack.strains.map((s) => s.id));
  return pack.clans.flatMap((c) => {
    if (!c.hive) return [];
    const spends = pack.techniques.some((t) => t.clan === c.id && (t.swarmCost ?? 0) > 0);
    return [
      ...(strains.has(c.hive.strainId) ? [] : [`clan "${c.id}" hive has unknown strain`]),
      ...(spends ? [] : [`clan "${c.id}" has a hive but no technique spends from it`]),
    ];
  });
}

export function validateStrains(pack: ContentPack): string[] {
  return [...strainProblems(pack), ...clanHiveProblems(pack)];
}
