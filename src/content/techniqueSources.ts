import { CHAKRA_BEAST_ARTS } from './shared/bestiary';
import { shelves } from './shelves';
import type { ContentPack } from './types';

/** Techniques a person may learn or hold. */
export function learnableIds(pack: ContentPack): Set<string> {
  return new Set([
    ...shelves(pack.locations).flatMap((p) => p.techniqueIds),
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
    // A contract's summoning techniques and what its summons fight with (`validateContracts.ts`).
    ...pack.contracts.flatMap((c) => c.summons.flatMap((s) => [s.techniqueId, ...s.techniqueIds])),
    // A puppet's unsealing and its mechanisms come with the puppet (`validatePuppets.ts`).
    ...(pack.puppets ?? []).flatMap((p) => [p.techniqueId, ...p.techniqueIds]),
  ]);
}

/**
 * Techniques companion kinds open by the bond (`validateCompanions.ts` checks them): theirs, and
 * never a person's, so a changed kind may hold a chakra beast's arts.
 */
export function kindArtIds(pack: ContentPack): Set<string> {
  return new Set(
    pack.companionKinds.flatMap((k) => (k.techniques ?? []).map((t) => t.techniqueId)),
  );
}

/** The pack's chakra beast arts: techniques only chakra beasts fight with. */
export function beastArtIds(pack: ContentPack): Set<string> {
  const arts = new Set(CHAKRA_BEAST_ARTS.map((t) => t.id));
  return new Set(pack.techniques.filter((t) => arts.has(t.id)).map((t) => t.id));
}
