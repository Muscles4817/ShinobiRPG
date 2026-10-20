import type { ContentPack } from './types';

/**
 * Dust kinds: none is scattered by the same thing twice or held by the same ground twice
 * (grades and gift strengths are held to their range by type); and every clan born commanding
 * dust names a real kind and teaches techniques that use it.
 */
function clanDustProblems(pack: ContentPack): string[] {
  const kinds = new Set(pack.dusts.map((d) => d.id));
  return pack.clans.flatMap((c) => {
    if (!c.dust) return [];
    const uses = pack.techniques.some(
      (t) => t.clan === c.id && ((t.dustCost ?? 0) > 0 || (t.dustDraw ?? 0) > 0),
    );
    return [
      ...(kinds.has(c.dust.dustId) ? [] : [`clan "${c.id}" commands an unknown dust`]),
      ...(uses ? [] : [`clan "${c.id}" commands dust but no technique uses it`]),
    ];
  });
}

/** Every arsenal that commands dust names a real kind. */
function arsenalDustProblems(pack: ContentPack): string[] {
  const kinds = new Set(pack.dusts.map((d) => d.id));
  return [...pack.people, ...(pack.duelists ?? [])].flatMap((p) => {
    const dustId = p.arsenal?.dust;
    return dustId && !kinds.has(dustId) ? [`person "${p.id}" commands an unknown dust`] : [];
  });
}

export function validateDusts(pack: ContentPack): string[] {
  return [...kindProblems(pack), ...clanDustProblems(pack), ...arsenalDustProblems(pack)];
}

function kindProblems(pack: ContentPack): string[] {
  return pack.dusts.flatMap((d) => [
    ...(new Set(d.banes).size === d.banes.length ? [] : [`dust "${d.id}" names a bane twice`]),
    ...(new Set(d.drawnOn).size === d.drawnOn.length
      ? []
      : [`dust "${d.id}" names a ground twice`]),
  ]);
}
