import { costIsSane, effectProblem } from '@/systems/techniques';
import { canGoWithCrew, daysAway, MIN_RYO_PER_DAY_AWAY } from '@/systems/missions';

import { duplicateIds } from './catalog';
import { validateArsenals } from './validateArsenals';
import { validateGear } from './validateGear';
import { validateEncounters } from './validateEncounters';
import { validateExams } from './validateExams';
import { validateInjuries } from './validateInjuries';
import { validatePeople } from './validatePeople';
import { validateTechniques } from './validateTechniques';
import { validateRanks } from './validateRanks';
import { validateRecipes } from './validateRecipes';
import { validateSeasons } from './validateSeasons';
import { validateSources } from './validateSources';
import { validateTeachers } from './validateTeachers';
import { validateVillage } from './validateVillage';
import { validateWorld } from './validateWorld';
import { validateRoutes } from './validateRoutes';
import { validateCrews } from './validateCrews';
import { validateStory } from './validateStory';
import { jobProfile } from './jobProfile';
import { placeholdersIn } from './missionTemplates';
import type { ContentPack, Identified } from './types';
import { DEFAULT_BUILD_ID, DEFAULT_UPBRINGING } from './upbringing';

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
    ...validateCrews(pack),
    ...validateStory(pack),
    ...placeholderProblems(pack),
    ...numberProblems(pack),
    ...validateWorld(pack),
    ...validateRoutes(pack),
    ...profileProblems(pack),
    ...validateTechniques(pack),
    ...validateSources(pack),
    ...validateRecipes(pack),
    ...validatePeople(pack),
    ...validateArsenals(pack),
    ...validateRanks(pack),
    ...validateTeachers(pack),
    ...validateVillage(pack),
    ...validateSeasons(pack),
    ...validateInjuries(pack),
    ...validateGear(pack),
    ...validateEncounters(pack),
    ...validateExams(pack),
  ];
}

/** Clans declare the arts their members are talented in; the clanless have none. */
function clanArtProblems(pack: ContentPack): string[] {
  return pack.clans.flatMap((c) => {
    if (c.id === 'none') return c.arts.length > 0 ? ['the "none" clan can’t have arts'] : [];
    if (c.arts.length === 0) return [`clan "${c.id}" declares no arts`];
    return new Set(c.arts).size < c.arts.length ? [`clan "${c.id}" lists an art twice`] : [];
  });
}

/** The default build and upbringings old saves are given, and a way to raise everyone. */
function upbringingProblems(pack: ContentPack): string[] {
  const has = (id: string) => pack.upbringings.some((u) => u.id === id);
  const families = ['clan', 'clanless'] as const;
  return [
    !pack.builds.some((b) => b.id === DEFAULT_BUILD_ID) &&
      `pack needs the "${DEFAULT_BUILD_ID}" build`,
    ...families.map(
      (f) => !has(DEFAULT_UPBRINGING[f]) && `pack needs the "${DEFAULT_UPBRINGING[f]}" upbringing`,
    ),
    ...pack.upbringings.map(
      (u) =>
        (u.focus?.points ?? 0) > u.earlyTraining &&
        `upbringing "${u.id}" asks for more focused training than it gives`,
    ),
  ].filter((p): p is string => typeof p === 'string');
}

/** Clans, traits and clan techniques must fit together. */
function profileProblems(pack: ContentPack): string[] {
  const clanIds = new Set(pack.clans.map((c) => c.id));
  const problems: string[] = [];
  if (!clanIds.has('none')) problems.push('pack needs a "none" clan for clanless characters');
  if (pack.traits.length < 2) problems.push('pack needs at least two traits');
  problems.push(...upbringingProblems(pack));
  problems.push(...clanArtProblems(pack));
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
    ['encounter', pack.encounters],
    ['enemy', pack.enemies],
    ['training', pack.training],
    ['food', pack.foods],
    ['clan', pack.clans],
    ['build', pack.builds],
    ['upbringing', pack.upbringings],
    ['talent', pack.talents],
    ['trait', pack.traits],
    ['nindo', pack.nindos],
    ['gear', pack.gear],
    ['tool', pack.tools],
    ['injury', pack.injuries],
    ['ingredient', pack.ingredients],
    ['recipe', pack.recipes],
    ['cookbook', pack.cookbooks],
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
    ...pack.techniques.map((t): [string, readonly string[]] => [
      `combination technique "${t.id}"`,
      t.combo ? [t.combo.partnerTechniqueId] : [],
    ]),
  ];
  return owners.flatMap(([owner, ids]) =>
    ids.filter((id) => !known.has(id)).map((id) => `${owner} references unknown technique "${id}"`),
  );
}

function missionProblems(pack: ContentPack): string[] {
  const enemyIds = new Set(pack.enemies.map((e) => e.id));
  const enemies = new Map(pack.enemies.map((e) => [e.id, e]));
  const always = pack.missions.some((m) => m.standing && m.minMissionsCompleted === 0);
  const board = always ? [] : ['pack needs a standing job a fresh genin can always take'];
  return pack.missions
    .flatMap((m) => {
      const problems = m.stages.length === 0 ? [`mission "${m.id}" has no stages`] : [];
      const teamable = m.examOnly === true || canGoWithCrew(jobProfile(m, (id) => enemies.get(id)));
      for (const stage of m.stages) {
        if (stage.kind === 'check' && stage.approaches.length === 0) {
          problems.push(`mission "${m.id}" has a check with no approaches`);
        }
        if (stage.kind === 'check' && !teamable && stage.approaches.some((a) => a.role)) {
          problems.push(`mission "${m.id}" gives a check a team role but always goes alone`);
        }
        if (stage.kind === 'combat' && stage.enemyIds.length === 0) {
          problems.push(`mission "${m.id}" has a combat with no enemies`);
        }
        if (stage.kind === 'combat') {
          const unknown = stage.enemyIds.filter((id) => !enemyIds.has(id));
          problems.push(
            ...unknown.map((id) => `mission "${m.id}" references unknown enemy "${id}"`),
          );
        }
      }
      return problems;
    })
    .concat(board);
}

/** A mission filled from a template must have every `{slot}` filled. */
function placeholderProblems(pack: ContentPack): string[] {
  return pack.missions.flatMap((m) =>
    [...new Set(placeholdersIn(JSON.stringify(m)))].map(
      (name) => `mission "${m.id}" leaves placeholder "{${name}}" unfilled`,
    ),
  );
}

/**
 * Days on the road come in whole days, and a job that keeps you away pays for them: at least
 * `MIN_RYO_PER_DAY_AWAY` a day, so a week out competes with a week at home.
 */
function roadProblems(pack: ContentPack): string[] {
  return pack.missions.flatMap((m) => {
    const legs = m.stages.flatMap((s) => (s.kind === 'leg' ? [s] : []));
    const days = daysAway(m);
    return [
      ...(legs.some((l) => !Number.isInteger(l.days) || l.days < 1)
        ? [`mission "${m.id}" has a leg that isn’t a whole number of days`]
        : []),
      ...(m.reward.ryo < days * MIN_RYO_PER_DAY_AWAY
        ? [`mission "${m.id}" pays too little for ${days} days away`]
        : []),
    ];
  });
}

function numberProblems(pack: ContentPack): string[] {
  return [
    ...pack.techniques
      .filter((t) => t.effects.length === 0)
      .map((t) => `technique "${t.id}" has no effects`),
    ...pack.techniques
      .filter((t) => t.chakraCost < 0 || t.difficulty <= 0 || t.effects.some((e) => e.power <= 0))
      .map((t) => `technique "${t.id}" has non-positive numbers`),
    ...pack.techniques.flatMap((t) =>
      t.effects.flatMap((e) => {
        const problem = effectProblem(e);
        return problem ? [`technique "${t.id}" has ${problem}`] : [];
      }),
    ),
    ...pack.techniques
      .filter((t) => t.afterCost && (!t.oncePerFight || !costIsSane(t.afterCost)))
      .map(
        (t) =>
          `technique "${t.id}" has an after-cost but is not once per fight, or its cost is not positive`,
      ),
    ...pack.enemies
      .filter((e) => e.healthScale !== undefined && e.healthScale <= 0)
      .map((e) => `enemy "${e.id}" needs a positive health scale`),
    ...pack.foods.filter((f) => f.cost <= 0).map((f) => `food "${f.id}" must cost something`),
    ...roadProblems(pack),
    ...pack.training
      .filter((t) => Object.keys(t.gains).length === 0)
      .map((t) => `training "${t.id}" grants no gains`),
    ...pack.training
      .filter((t) => t.gains.reserves !== undefined)
      .map((t) => `training "${t.id}" drills reserves, which only grow with stamina and jutsu use`),
  ];
}
