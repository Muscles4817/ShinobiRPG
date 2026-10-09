import type { ContentSource } from './db';
import type { Identified } from './types';

/**
 * Integrity checks for content data: unique ids, resolvable cross-references and sane
 * numbers. Runs in the test suite, so broken content fails CI instead of crashing in play.
 * Returns a list of human-readable problems (empty = valid).
 */
export function validateContent(source: ContentSource): string[] {
  return [
    ...uniqueIdProblems(source),
    ...techniqueReferenceProblems(source),
    ...missionProblems(source),
    ...numberProblems(source),
  ];
}

function uniqueIdProblems(source: ContentSource): string[] {
  const collections: [string, readonly Identified[]][] = [
    ['technique', source.techniques],
    ['mission', source.missions],
    ['enemy', source.enemies],
    ['training', source.training],
    ['food', source.foods],
    ['aptitude', source.aptitudes],
  ];
  return collections.flatMap(([kind, items]) => {
    const seen = new Set<string>();
    return items.flatMap(({ id }) => {
      const duplicate = seen.has(id);
      seen.add(id);
      return duplicate ? [`duplicate ${kind} id "${id}"`] : [];
    });
  });
}

function techniqueReferenceProblems(source: ContentSource): string[] {
  const known = new Set(source.techniques.map((t) => t.id));
  const owners: [string, readonly string[]][] = [
    ['academyTechniques', source.academyTechniques],
    ...source.aptitudes.map((a): [string, readonly string[]] => [
      `aptitude "${a.id}"`,
      a.techniqueIds,
    ]),
    ...source.enemies.map((e): [string, readonly string[]] => [`enemy "${e.id}"`, e.techniqueIds]),
  ];
  return owners.flatMap(([owner, ids]) =>
    ids.filter((id) => !known.has(id)).map((id) => `${owner} references unknown technique "${id}"`),
  );
}

function missionProblems(source: ContentSource): string[] {
  const enemyIds = new Set(source.enemies.map((e) => e.id));
  return source.missions.flatMap((m) => {
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

function numberProblems(source: ContentSource): string[] {
  return [
    ...source.techniques
      .filter((t) => t.chakraCost < 0 || t.power <= 0 || t.difficulty <= 0)
      .map((t) => `technique "${t.id}" has non-positive numbers`),
    ...source.foods.filter((f) => f.cost <= 0).map((f) => `food "${f.id}" must cost something`),
    ...source.training
      .filter((t) => Object.keys(t.gains).length === 0)
      .map((t) => `training "${t.id}" grants no gains`),
  ];
}
