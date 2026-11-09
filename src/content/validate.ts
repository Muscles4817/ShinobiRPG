import { costIsSane, effectProblem } from '@/systems/techniques';
import { validateTravel } from './validateTravel';
import { canGoWithCrew, daysAway, MIN_RYO_PER_DAY_AWAY } from '@/systems/missions';

import { duplicateIds } from './catalog';
import { validateArsenals } from './validateArsenals';
import { validateFoesCarried } from './validateCarried';
import { validateChakraBeasts } from './validateChakraBeasts';
import { validateDuelists } from './validateDuelists';
import { validateLadders } from './validateLadders';
import { validateGear } from './validateGear';
import { validateEncounters } from './validateEncounters';
import { validateExams } from './validateExams';
import { validateInjuries } from './validateInjuries';
import { validatePeople } from './validatePeople';
import { validateProfile } from './validateProfile';
import { validateTechniques } from './validateTechniques';
import { validateRanks } from './validateRanks';
import { validateRecipes } from './validateRecipes';
import { validateSeasons } from './validateSeasons';
import { validateSenseiParts } from './validateSenseiParts';
import { validateSenseis } from './validateSenseis';
import { validateSources } from './validateSources';
import { validateTeachers } from './validateTeachers';
import { validateVillage } from './validateVillage';
import { validateWorld } from './validateWorld';
import { validateFieldBook } from './validateFieldBook';
import { validateHomes } from './validateHomes';
import { validateLeisure } from './validateLeisure';
import { validateAtlas } from './validateAtlas';
import { validateExercises } from './validateExercises';
import { validateCrews } from './validateCrews';
import { validateRetinues } from './validateRetinues';
import { validateCompanionArts } from './validateCompanionArts';
import { validateContracts } from './validateContracts';
import { validatePuppets } from './validatePuppets';
import { validateGreetings } from './validateGreetings';
import { validateDusts } from './validateDusts';
import { validateRites } from './validateRites';
import { validateStrains } from './validateStrains';
import { validateCompanions } from './validateCompanions';
import { validateCompounds } from './validateCompounds';
import { validateStory } from './validateStory';
import { jobProfile, postedAway } from './jobProfile';
import { placeholdersIn } from './missionTemplates';
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
    ...validateCrews(pack),
    ...validateRetinues(pack),
    ...validateFoesCarried(pack),
    ...validateChakraBeasts(pack),
    ...validateCompanions(pack),
    ...validateCompanionArts(pack),
    ...validateContracts(pack),
    ...validatePuppets(pack),
    ...validateGreetings(pack),
    ...validateStrains(pack),
    ...validateRites(pack),
    ...validateDusts(pack),
    ...validateCompounds(pack),
    ...validateSenseis(pack),
    ...validateSenseiParts(pack),
    ...validateStory(pack),
    ...placeholderProblems(pack),
    ...numberProblems(pack),
    ...validateWorld(pack),
    ...validateLeisure(pack),
    ...validateHomes(pack),
    ...validateFieldBook(pack),
    ...validateTravel(pack),
    ...validateAtlas(pack),
    ...validateExercises(pack),
    ...validateProfile(pack),
    ...validateTechniques(pack),
    ...validateSources(pack),
    ...validateRecipes(pack),
    ...validatePeople(pack),
    ...validateArsenals(pack),
    ...validateDuelists(pack),
    ...validateLadders(pack),
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
    ['quirk', pack.quirks],
    ['home', pack.homes],
    ['furnishing', pack.furnishings],
    ['trait', pack.traits],
    ['nindo', pack.nindos],
    ['gear', pack.gear],
    ['tool', pack.tools],
    ['injury', pack.injuries],
    ['ingredient', pack.ingredients],
    ['recipe', pack.recipes],
    ['cookbook', pack.cookbooks],
    ['person', [...pack.people, ...(pack.duelists ?? [])]],
    ['puppet', pack.puppets ?? []],
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
      const away = postedAway(pack.locations, pack.startLocationId, m.id);
      const job = jobProfile(m, (id) => enemies.get(id), away);
      const teamable = m.examOnly === true || canGoWithCrew(job);
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
      .filter(
        (t) =>
          t.chakraCost < 0 ||
          (t.swarmCost ?? 1) <= 0 ||
          t.difficulty <= 0 ||
          t.effects.some((e) => e.power <= 0),
      )
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
