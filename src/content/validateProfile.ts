import type { ContentPack } from './types';
import { DEFAULT_BUILD_ID, DEFAULT_UPBRINGING } from './upbringing';

/** Clans declare the arts their members are talented in; the clanless have none. */
function clanArtProblems(pack: ContentPack): string[] {
  return pack.clans.flatMap((c) => {
    if (c.id === 'none') return c.arts.length > 0 ? ['the "none" clan can’t have arts'] : [];
    if (c.arts.length === 0) return [`clan "${c.id}" declares no arts`];
    return new Set(c.arts).size < c.arts.length ? [`clan "${c.id}" lists an art twice`] : [];
  });
}

/** The default build and upbringings old saves are given, and a way to raise everyone. */
function upbringingProblems(pack: ContentPack): string[] {
  const has = (id: string) => pack.upbringings.some((u) => u.id === id);
  const families = ['clan', 'clanless'] as const;
  return [
    !pack.builds.some((b) => b.id === DEFAULT_BUILD_ID) &&
      `pack needs the "${DEFAULT_BUILD_ID}" build`,
    ...families.map(
      (f) => !has(DEFAULT_UPBRINGING[f]) && `pack needs the "${DEFAULT_UPBRINGING[f]}" upbringing`,
    ),
    ...pack.upbringings.map(
      (u) =>
        (u.focus?.points ?? 0) > u.earlyTraining &&
        `upbringing "${u.id}" asks for more focused training than it gives`,
    ),
  ].filter((p): p is string => typeof p === 'string');
}

/** Notes that contradict each other say so of each other. */
function noteProblems(pack: ContentPack): string[] {
  return pack.talents.flatMap((t) => {
    if (t.opposite === undefined) return [];
    const opposite = pack.talents.find((o) => o.id === t.opposite);
    if (!opposite) return [`talent "${t.id}" has unknown opposite "${t.opposite}"`];
    return opposite.opposite === t.id
      ? []
      : [`talents "${t.id}" and "${opposite.id}" are not mutual opposites`];
  });
}

/** A quirk names real traits, and never one on both sides. */
function quirkProblems(pack: ContentPack): string[] {
  const traits = new Set(pack.traits.map((t) => t.id));
  return pack.quirks.flatMap((q) => [
    ...[...q.warms, ...q.cools]
      .filter((id) => !traits.has(id))
      .map((id) => `quirk "${q.id}" names unknown trait "${id}"`),
    ...q.warms
      .filter((id) => q.cools.includes(id))
      .map((id) => `quirk "${q.id}" both warms and cools "${id}"`),
  ]);
}

/** Everything a character is made of, from their clan to their traits, fits together. */
export function validateProfile(pack: ContentPack): string[] {
  const clanIds = new Set(pack.clans.map((c) => c.id));
  const problems: string[] = [];
  if (!clanIds.has('none')) problems.push('pack needs a "none" clan for clanless characters');
  if (pack.traits.length < 2) problems.push('pack needs at least two traits');
  problems.push(...upbringingProblems(pack));
  problems.push(...clanArtProblems(pack));
  for (const t of pack.techniques) {
    if (t.clan !== undefined && !clanIds.has(t.clan)) {
      problems.push(`technique "${t.id}" belongs to unknown clan "${t.clan}"`);
    }
  }
  problems.push(...noteProblems(pack), ...quirkProblems(pack));
  for (const t of pack.traits) {
    if (t.opposite === undefined) continue;
    const opposite = pack.traits.find((o) => o.id === t.opposite);
    if (!opposite) problems.push(`trait "${t.id}" has unknown opposite "${t.opposite}"`);
    else if (opposite.opposite !== t.id)
      problems.push(`traits "${t.id}" and "${opposite.id}" are not mutual opposites`);
  }
  return problems;
}
