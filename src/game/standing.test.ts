import { createRng } from '@/core';
import { CLASS_STANDINGS, fateStanding, quickGrades, STANDING_INFO } from '@/systems/profile';
import { STAT_IDS } from '@/systems/stats';
import { DISCIPLINES } from '@/systems/techniques';
import { ctx, draft } from '@/test/gameFixtures';

import { rollCharacterAptitude } from './aptitude';
import { createNewGame, draftProblems, type CreationDraft } from './creation';
import { deserialize, serialize } from './persistence/save';
import { characterModifiers } from './profile';

const PICK = { specialty: 'taijutsu', strength: 'ninjutsu', weakness: 'genjutsu' } as const;

function standingDraft(standing: CreationDraft['standing']): CreationDraft {
  return draft({ standing, grades: quickGrades(PICK, standing) });
}

function meanArtAptitude(standing: CreationDraft['standing'], seeds = 200): number {
  const clan = ctx.content.clans.require('none');
  const shape = { band: STANDING_INFO[standing].talent, specialties: [] };
  let sum = 0;
  for (let seed = 1; seed <= seeds; seed++) {
    const aptitude = rollCharacterAptitude(createRng(seed), clan, undefined, shape);
    sum += DISCIPLINES.reduce((s, d) => s + aptitude[d], 0) / DISCIPLINES.length;
  }
  return sum / seeds;
}

describe('class standing', () => {
  it('every standing’s quick pick fits its own budget, and not the one below it', () => {
    for (const standing of CLASS_STANDINGS) {
      expect(draftProblems(standingDraft(standing), ctx)).toEqual([]);
    }
    const middleGradesAtTheBottom = {
      ...standingDraft('dead-last'),
      grades: quickGrades(PICK, 'middle'),
    };
    expect(draftProblems(middleGradesAtTheBottom, ctx)).toContain(
      'Your standing gives back 3 points: take more Ds or fewer Bs.',
    );
  });

  it('runs from dead last to genius: grades, starting arts and talent all rise', () => {
    const states = CLASS_STANDINGS.map((s) =>
      createNewGame({ draft: standingDraft(s), seed: 9 }, ctx),
    );
    const [bottom, below, , , genius] = states;
    expect(bottom!.character.stats.taijutsu).toBeLessThan(genius!.character.stats.taijutsu);
    // The dead last start with the academy's techniques alone; below average, with their B's.
    expect(bottom!.techniques.known).toEqual(ctx.content.academyTechniques);
    expect(below!.techniques.known).toContain(ctx.content.disciplineStarters.taijutsu);
    expect(meanArtAptitude('dead-last')).toBeLessThan(meanArtAptitude('middle'));
    expect(meanArtAptitude('middle')).toBeLessThan(meanArtAptitude('genius'));
    // A genius is gifted in their A-graded arts, whatever the dice.
    expect(genius!.character.aptitude.taijutsu).toBeGreaterThanOrEqual(1.4);
    expect(genius!.character.aptitude.ninjutsu).toBeGreaterThanOrEqual(1.4);
  });

  it('the bottom of the class gets the hard-work route: training alone keeps paying', () => {
    const bottom = createNewGame({ draft: standingDraft('dead-last'), seed: 9 }, ctx);
    const middle = createNewGame({ draft: standingDraft('middle'), seed: 9 }, ctx);
    const floors = characterModifiers(bottom.character, ctx).soloFloors;
    for (const id of STAT_IDS) expect(floors[id]?.length).toBeGreaterThan(0);
    expect(characterModifiers(middle.character, ctx).soloFloors.taijutsu ?? []).toEqual([]);
  });

  it('fate reads the standing from the seed, as often as each is weighted', () => {
    expect(fateStanding(42)).toBe(fateStanding(42));
    const counts = new Map<string, number>();
    for (let seed = 1; seed <= 2000; seed++) {
      const s = fateStanding(seed);
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    for (const standing of CLASS_STANDINGS) {
      expect((counts.get(standing) ?? 0) / 2000).toBeCloseTo(STANDING_INFO[standing].fateWeight, 1);
    }
  });

  it('a one-sided talent can shut an art for good', () => {
    const state = createNewGame({ draft: draft({ talentId: 'no-chakra' }), seed: 9 }, ctx);
    expect(state.character.aptitude.ninjutsu).toBe(0);
    expect(state.character.aptitude.genjutsu).toBe(0);
  });

  it('a save from before standings loads in the middle of the class', () => {
    const now = createNewGame({ draft: standingDraft('genius'), seed: 9 }, ctx);
    const { classStanding: _gone, ...character } = now.character;
    const old = JSON.stringify({ version: 24, state: { ...now, character } });
    const loaded = deserialize(old);
    expect(loaded.ok && loaded.value.character.classStanding).toBe('middle');
    expect(deserialize(serialize(now)).ok).toBe(true);
  });
});
