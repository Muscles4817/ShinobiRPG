import { shelves } from './shelves';
import type { ContentPack } from './types';

/** Techniques someone may learn or hold besides a chakra beast: every source but the beasts. */
export function learnableIds(pack: ContentPack): Set<string> {
  return new Set([
    ...shelves(pack).flatMap((p) => p.techniqueIds),
    ...pack.people.flatMap((p) => p.teacher?.teaches ?? []),
    // A duelist isn't in the world yet, so their own arts are theirs alone until plumbed in.
    ...(pack.duelists ?? []).flatMap((p) => p.arsenal?.techniqueIds ?? []),
    ...pack.missions.flatMap((m) => (m.reward.scrollId ? [m.reward.scrollId] : [])),
    // A dust scroll a job hands over teaches its kind's techniques (`DustDef.techniqueIds`).
    ...pack.missions.flatMap((m) => {
      const kind = pack.dusts.find((d) => d.id === m.reward.dustScroll);
      return kind?.techniqueIds ?? [];
    }),
    ...pack.academyTechniques,
    ...Object.values(pack.disciplineStarters),
    ...pack.clans.flatMap((c) => c.startingTechniqueIds),
    // A companion kind's techniques are its own (`validateCompanions.ts` checks them).
    ...pack.companionKinds.flatMap((k) => (k.techniques ?? []).map((t) => t.techniqueId)),
    // A contract's summoning techniques and what its summons fight with (`validateContracts.ts`).
    ...pack.contracts.flatMap((c) => c.summons.flatMap((s) => [s.techniqueId, ...s.techniqueIds])),
    // A puppet's unsealing and its mechanisms come with the puppet (`validatePuppets.ts`).
    ...(pack.puppets ?? []).flatMap((p) => [p.techniqueId, ...p.techniqueIds]),
  ]);
}
