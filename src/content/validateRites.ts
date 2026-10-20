import type { ContentPack } from './types';

/**
 * Hive rites (`ClanHive.rite`): every rite can be learned somewhere (the clan's archive, a job's
 * find or someone of the clan), and every source names a clan that has one. Only someone of
 * the clan teaches its rite, and an archive lends it only through the clan's head.
 */

function riteSources(pack: ContentPack): { readonly clanId: string; readonly from: string }[] {
  const archives = pack.locations.flatMap((l) =>
    l.places.flatMap((p) =>
      p.kind === 'compound' && p.keepsRite
        ? [{ clanId: p.clanId, from: `compound "${p.id}"` }]
        : [],
    ),
  );
  const jobs = pack.missions.flatMap((m) =>
    m.reward.hiveRite ? [{ clanId: m.reward.hiveRite, from: `job "${m.id}"` }] : [],
  );
  const teachers = pack.people.flatMap((p) =>
    p.hiveRite ? [{ clanId: p.hiveRite.clanId, from: `person "${p.id}"` }] : [],
  );
  return [...archives, ...jobs, ...teachers];
}

function archiveProblems(pack: ContentPack): string[] {
  return pack.locations.flatMap((l) =>
    l.places.flatMap((p) =>
      p.kind === 'compound' && p.keepsRite && !p.headId
        ? [`compound "${p.id}" keeps a rite but has no head to lend it`]
        : [],
    ),
  );
}

function teacherProblems(pack: ContentPack): string[] {
  return pack.people.flatMap((p) => {
    const offer = p.hiveRite;
    return offer && offer.clanId !== p.clanId
      ? [`person "${p.id}" teaches a hive rite of a clan not their own`]
      : [];
  });
}

export function validateRites(pack: ContentPack): string[] {
  const withRite = new Set(pack.clans.filter((c) => c.hive?.rite).map((c) => c.id));
  const sources = riteSources(pack);
  const unknown = sources
    .filter((s) => !withRite.has(s.clanId))
    .map((s) => `${s.from} gives a hive rite clan "${s.clanId}" doesn't have`);
  const unlearnable = [...withRite]
    .filter((id) => !sources.some((s) => s.clanId === id))
    .map((id) => `clan "${id}" has a hive rite nobody can learn`);
  return [...unknown, ...unlearnable, ...archiveProblems(pack), ...teacherProblems(pack)];
}
