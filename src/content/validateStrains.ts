import type { ContentPack } from './types';

/**
 * Hive strains: each carries at least one gift (what makes a species) and fears nothing twice
 * (grades and gift strengths are held to their range by type), and every clan that installs a
 * hive names a real strain and teaches techniques that spend from it.
 */

function strainProblems(pack: ContentPack): string[] {
  return pack.strains.flatMap((s) => [
    ...(Object.values(s.gifts).length > 0 ? [] : [`strain "${s.id}" has no gift`]),
    ...(new Set(s.fears).size === s.fears.length ? [] : [`strain "${s.id}" fears something twice`]),
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
