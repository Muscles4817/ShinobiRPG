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

/** Every arsenal and foe that commands dust names a real kind. */
function arsenalDustProblems(pack: ContentPack): string[] {
  const kinds = new Set(pack.dusts.map((d) => d.id));
  const people = [...pack.people, ...(pack.duelists ?? [])].flatMap((p) => {
    const dustId = p.arsenal?.dust;
    return dustId && !kinds.has(dustId) ? [`person "${p.id}" commands an unknown dust`] : [];
  });
  const foes = pack.enemies.flatMap((e) =>
    e.dust && !kinds.has(e.dust.dustId) ? [`enemy "${e.id}" commands an unknown dust`] : [],
  );
  return [...people, ...foes];
}

/**
 * Dust no ground gives back can be made; dust a shop sells has a price; a scroll a job hands
 * over teaches a real kind.
 */
function supplyProblems(pack: ContentPack): string[] {
  const byId = new Map(pack.dusts.map((d) => [d.id, d]));
  const unmade = pack.dusts
    .filter((d) => d.drawnOn.length === 0 && !d.making)
    .map((d) => `dust "${d.id}" comes back from no ground and can't be made`);
  const shelved = pack.locations.flatMap((l) =>
    l.places.flatMap((p) => (p.kind === 'gear' ? (p.dustIds ?? []) : [])),
  );
  const unpriced = shelved
    .filter((id) => byId.get(id)?.price === undefined)
    .map((id) => `dust "${id}" is sold with no price`);
  const scrolls = pack.missions
    .filter((m) => m.reward.dustScroll && !byId.has(m.reward.dustScroll))
    .map((m) => `job "${m.id}" hands over a scroll of an unknown dust`);
  const techniques = new Set(pack.techniques.map((t) => t.id));
  const untaught = pack.dusts.flatMap((d) =>
    (d.techniqueIds ?? [])
      .filter((id) => !techniques.has(id))
      .map((id) => `dust "${d.id}" teaches unknown technique "${id}"`),
  );
  return [...unmade, ...unpriced, ...scrolls, ...untaught];
}

export function validateDusts(pack: ContentPack): string[] {
  return [
    ...kindProblems(pack),
    ...clanDustProblems(pack),
    ...arsenalDustProblems(pack),
    ...supplyProblems(pack),
  ];
}

function kindProblems(pack: ContentPack): string[] {
  return pack.dusts.flatMap((d) => [
    ...(new Set(d.banes).size === d.banes.length ? [] : [`dust "${d.id}" names a bane twice`]),
    ...(new Set(d.drawnOn).size === d.drawnOn.length
      ? []
      : [`dust "${d.id}" names a ground twice`]),
  ]);
}
