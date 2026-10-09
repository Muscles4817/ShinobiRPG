import { duplicateIds } from './catalog';
import { validatePeople } from './validatePeople';
import { validateWorld } from './validateWorld';
import type { ContentPack, Identified } from './types';

/**
 * Integrity checks for a content pack: unique ids, resolvable cross-references and sane
 * numbers. Runs in the test suite for every pack, so broken content fails CI instead of
 * crashing in play. Returns human-readable problems (empty = valid).
 */
export function validateContent(pack: ContentPack): string[] {
  return [
    ...uniqueIdProblems(pack),
    ...techniqueReferenceProblems(pack),
    ...missionProblems(pack),
    ...numberProblems(pack),
    ...validateWorld(pack),
    ...profileProblems(pack),
    ...validatePeople(pack),
  ];
}

/** Clans, traits and clan techniques must fit together. */
function profileProblems(pack: ContentPack): string[] {
  const clanIds = new Set(pack.clans.map((c) => c.id));
  const problems: string[] = [];
  if (!clanIds.has('none')) problems.push('pack needs a "none" clan for clanless characters');
  if (pack.traits.length < 2) problems.push('pack needs at least two traits');
  for (const t of pack.techniques) {
    if (t.clan !== undefined && !clanIds.has(t.clan)) {
      problems.push(`technique "${t.id}" belongs to unknown clan "${t.clan}"`);
    }
  }
  for (const t of pack.traits) {
    if (t.opposite === undefined) continue;
    const opposite = pack.traits.find((o) => o.id === t.opposite);
    if (!opposite) problems.push(`trait "${t.id}" has unknown opposite "${t.opposite}"`);
    else if (opposite.opposite !== t.id)
      problems.push(`traits "${t.id}" and "${opposite.id}" are not mutual opposites`);
  }
  return problems;
}

function uniqueIdProblems(pack: ContentPack): string[] {
  const collections: [string, readonly Identified[]][] = [
    ['location', pack.locations],
    ['technique', pack.techniques],
    ['mission', pack.missions],
    ['enemy', pack.enemies],
    ['training', pack.training],
    ['food', pack.foods],
    ['clan', pack.clans],
    ['talent', pack.talents],
    ['trait', pack.traits],
    ['nindo', pack.nindos],
    ['person', pack.people],
    ['conversation', pack.conversations],
  ];
  return collections.flatMap(([kind, items]) =>
    duplicateIds(items).map((id) => `duplicate ${kind} id "${id}"`),
  );
}

function techniqueReferenceProblems(pack: ContentPack): string[] {
  const known = new Set(pack.techniques.map((t) => t.id));
  const owners: [string, readonly string[]][] = [
    ['academyTechniques', pack.academyTechniques],
    ['disciplineStarters', Object.values(pack.disciplineStarters)],
    ...pack.clans.map((c): [string, readonly string[]] => [
      `clan "${c.id}"`,
      c.startingTechniqueIds,
    ]),
    ...pack.enemies.map((e): [string, readonly string[]] => [`enemy "${e.id}"`, e.techniqueIds]),
  ];
  return owners.flatMap(([owner, ids]) =>
    ids.filter((id) => !known.has(id)).map((id) => `${owner} references unknown technique "${id}"`),
  );
}

function missionProblems(pack: ContentPack): string[] {
  const enemyIds = new Set(pack.enemies.map((e) => e.id));
  return pack.missions.flatMap((m) => {
    const problems = m.stages.length === 0 ? [`mission "${m.id}" has no stages`] : [];
    for (const stage of m.stages) {
      if (stage.kind === 'check' && stage.approaches.length === 0) {
        problems.push(`mission "${m.id}" has a check with no approaches`);
      }
      if (stage.kind === 'combat' && stage.enemyIds.length === 0) {
        problems.push(`mission "${m.id}" has a combat with no enemies`);
      }
      if (stage.kind === 'combat') {
        const unknown = stage.enemyIds.filter((id) => !enemyIds.has(id));
        problems.push(...unknown.map((id) => `mission "${m.id}" references unknown enemy "${id}"`));
      }
    }
    return problems;
  });
}

function numberProblems(pack: ContentPack): string[] {
  return [
    ...pack.techniques
      .filter((t) => t.chakraCost < 0 || t.power <= 0 || t.difficulty <= 0)
      .map((t) => `technique "${t.id}" has non-positive numbers`),
    ...pack.foods.filter((f) => f.cost <= 0).map((f) => `food "${f.id}" must cost something`),
    ...pack.training
      .filter((t) => Object.keys(t.gains).length === 0)
      .map((t) => `training "${t.id}" grants no gains`),
  ];
}
