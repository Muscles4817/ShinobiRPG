import type { ContractDef, SummonDef } from './contracts';
import type { ContentPack } from './types';

/**
 * Summoning contracts: each summon is called by a real technique whose `summon` effect names it,
 * fights with real techniques, answers at a real standing and asks a sane price (a real
 * offering, some blood); every contract can be signed (a job or a teacher offers it) or is a
 * foe's own, and every contract a job, teacher or foe names is real. One you can sign has
 * tastes (real ingredients) for offerings and parting words for when it is broken. A summoning
 * technique belongs to some contract.
 */

/** The deepest bond stage. */
const MOST_STAGE = 4;

function summonProblems(pack: ContentPack, contract: ContractDef, summon: SummonDef): string[] {
  const at = `summon "${summon.id}" of contract "${contract.id}"`;
  const technique = pack.techniques.find((t) => t.id === summon.techniqueId);
  const calls = technique?.effects.some((e) => e.verb === 'summon' && e.call === summon.id);
  const known = new Set(pack.techniques.map((t) => t.id));
  const offering = summon.price?.offeringId;
  return [
    ...(calls ? [] : [`${at} isn't called by its technique "${summon.techniqueId}"`]),
    ...summon.techniqueIds
      .filter((id) => !known.has(id))
      .map((id) => `${at} fights with unknown "${id}"`),
    ...(summon.standing >= 0 && summon.standing <= MOST_STAGE
      ? []
      : [`${at} answers at no real standing`]),
    ...(summon.healthScale > 0 && summon.upkeep > 0
      ? []
      : [`${at} has no body or costs nothing to keep`]),
    ...(offering && !pack.ingredients.some((i) => i.id === offering)
      ? [`${at} asks an offering of unknown "${offering}"`]
      : []),
    ...((summon.price?.blood ?? 1) > 0 ? [] : [`${at} asks no blood`]),
  ];
}

function offeredIds(pack: ContentPack): string[] {
  return [
    ...pack.missions.flatMap((m) => (m.reward.contractId ? [m.reward.contractId] : [])),
    ...pack.people.flatMap((p) => (p.teacher?.contract ? [p.teacher.contract.contractId] : [])),
  ];
}

/** Contracts some foe calls from. */
function foeHeld(pack: ContentPack): Set<string> {
  const called = new Set(pack.enemies.flatMap((e) => (e.summons ?? []).map((s) => s.summonId)));
  return new Set(
    pack.contracts.filter((c) => c.summons.some((s) => called.has(s.id))).map((c) => c.id),
  );
}

/** What a contract you can sign needs besides its summons. */
function signableProblems(pack: ContentPack, contract: ContractDef): string[] {
  const at = `contract "${contract.id}"`;
  const known = new Set(pack.ingredients.map((i) => i.id));
  const tastes = contract.tastes ?? [];
  return [
    ...(tastes.length > 0 ? [] : [`${at} has no tastes for offerings`]),
    ...tastes.filter((id) => !known.has(id)).map((id) => `${at} likes unknown "${id}"`),
    ...(contract.parting ? [] : [`${at} has no parting words`]),
  ];
}

function signingProblems(pack: ContentPack): string[] {
  const offered = offeredIds(pack);
  const foes = foeHeld(pack);
  const known = new Set(pack.contracts.map((c) => c.id));
  return [
    ...offered
      .filter((id) => !known.has(id))
      .map((id) => `a job or teacher offers unknown contract "${id}"`),
    ...pack.contracts
      .filter((c) => !offered.includes(c.id) && !foes.has(c.id))
      .map((c) => `contract "${c.id}" can't be signed anywhere`),
    ...pack.contracts
      .filter((c) => offered.includes(c.id))
      .flatMap((c) => signableProblems(pack, c)),
  ];
}

/** Every summon a foe calls is one some contract holds. */
function foeCalls(pack: ContentPack): string[] {
  const held = new Set(pack.contracts.flatMap((c) => c.summons.map((s) => s.id)));
  return pack.enemies.flatMap((e) =>
    (e.summons ?? [])
      .filter((s) => !held.has(s.summonId))
      .map((s) => `enemy "${e.id}" calls "${s.summonId}", which no contract holds`),
  );
}

/** Every summoning technique calls a summon some contract holds. */
function strayCalls(pack: ContentPack): string[] {
  const held = new Set(pack.contracts.flatMap((c) => c.summons.map((s) => s.id)));
  return pack.techniques.flatMap((t) =>
    t.effects.flatMap((e) =>
      e.verb === 'summon' && !held.has(e.call)
        ? [`technique "${t.id}" calls "${e.call}", which no contract holds`]
        : [],
    ),
  );
}

export function validateContracts(pack: ContentPack): string[] {
  return [
    ...pack.contracts.flatMap((c) => c.summons.map((s) => summonProblems(pack, c, s)).flat()),
    ...signingProblems(pack),
    ...strayCalls(pack),
    ...foeCalls(pack),
  ];
}
