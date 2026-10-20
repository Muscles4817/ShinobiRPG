import type { PuppetDef } from './puppets';
import type { ContentPack } from './types';

/**
 * Puppets (`ContentPack.puppets`): each is unsealed by a real technique whose `summon` effect
 * names it, fights with real techniques, has a body, costs chakra to keep on its threads, and
 * carries only a real dust; its id is no summon's, and every puppet an arsenal names is real.
 */
function puppetProblems(pack: ContentPack, puppet: PuppetDef): string[] {
  const at = `puppet "${puppet.id}"`;
  const technique = pack.techniques.find((t) => t.id === puppet.techniqueId);
  const calls = technique?.effects.some((e) => e.verb === 'summon' && e.call === puppet.id);
  const known = new Set(pack.techniques.map((t) => t.id));
  const summons = new Set(pack.contracts.flatMap((c) => c.summons.map((s) => s.id)));
  return [
    ...(calls ? [] : [`${at} isn't unsealed by its technique "${puppet.techniqueId}"`]),
    ...puppet.techniqueIds
      .filter((id) => !known.has(id))
      .map((id) => `${at} fights with unknown "${id}"`),
    ...(puppet.healthScale > 0 && puppet.upkeep > 0
      ? []
      : [`${at} has no body or costs nothing to keep`]),
    ...(puppet.dust && !pack.dusts.some((d) => d.id === puppet.dust)
      ? [`${at} carries unknown dust "${puppet.dust}"`]
      : []),
    ...(summons.has(puppet.id) ? [`${at} has a summon's id`] : []),
  ];
}

function carriedProblems(pack: ContentPack): string[] {
  const puppets = new Set((pack.puppets ?? []).map((p) => p.id));
  return [...pack.people, ...(pack.duelists ?? [])].flatMap((person) =>
    (person.arsenal?.puppets ?? [])
      .filter((id) => !puppets.has(id))
      .map((id) => `person "${person.id}" works unknown puppet "${id}"`),
  );
}

export function validatePuppets(pack: ContentPack): string[] {
  return [
    ...(pack.puppets ?? []).flatMap((p) => puppetProblems(pack, p)),
    ...carriedProblems(pack),
  ];
}
