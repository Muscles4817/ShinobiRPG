import { validateArsenals } from './validateArsenals';
import { validateRanks } from './validateRanks';
import type { ContentPack, PersonDef } from './types';

/**
 * Versus-only fighters (`ContentPack.duelists`): held to the cast's rules for rank, stats and
 * arsenal, and kept out of the world until plumbed in: shinobi of a fighting rank, real traits,
 * clan and village (`homeLocationId`, shown in versus), no schedule, no teaching or sensei profile, and an arsenal of their own (with no
 * academy behind them, it is all they fight with).
 */
export function validateDuelists(pack: ContentPack): string[] {
  const duelists = pack.duelists ?? [];
  const asCast = { ...pack, people: duelists };
  return [
    ...duelists.flatMap((d) => duelistProblems(pack, d)),
    ...validateRanks(asCast),
    ...validateArsenals(asCast),
  ];
}

function duelistProblems(pack: ContentPack, duelist: PersonDef): string[] {
  const who = `duelist "${duelist.id}"`;
  const traits = new Set(pack.traits.map((t) => t.id));
  const clan = duelist.clanId;
  return [
    duelist.role !== 'shinobi' && duelist.role !== 'genin' && `${who} must be a shinobi or a genin`,
    duelist.rank === 'civilian' && `${who} has no fighting rank`,
    Object.values(duelist.schedule).some((at) => at !== null) &&
      `${who} has a schedule, but isn’t in the world yet`,
    (duelist.teacher ?? duelist.sensei ?? duelist.recipes) !== undefined &&
      `${who} teaches, but isn’t in the world yet`,
    !duelist.arsenal && `${who} has no arsenal`,
    clan !== undefined && !pack.clans.some((c) => c.id === clan) && `${who} has unknown clan`,
    duelist.homeLocationId !== undefined &&
      !pack.locations.some((l) => l.id === duelist.homeLocationId) &&
      `${who} lives in unknown location "${duelist.homeLocationId}"`,
    ...duelist.traitIds
      .filter((id) => !traits.has(id))
      .map((id) => `${who} has unknown trait "${id}"`),
  ].filter((p): p is string => typeof p === 'string');
}
