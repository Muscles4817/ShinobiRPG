import { createRng } from '@/core';
import { CLASS_STANDINGS, fateStanding, STANDING_INFO } from '@/systems/profile';
import { fightingPower, STAT_IDS, statTier } from '@/systems/stats';
import { DISCIPLINES } from '@/systems/techniques';
import { ctx, draft } from '@/test/gameFixtures';

import { rollCharacterAptitude } from './aptitude';
import { createNewGame, draftProblems, type CreationDraft } from './creation';
import { deserialize, serialize } from './persistence/save';
import { characterModifiers } from './profile';

/** A steady taijutsu student at this standing, the file filled by the quick pick. */
function standingDraft(standing: CreationDraft['standing']): CreationDraft {
  return draft({ standing });
}

function meanArtAptitude(standing: CreationDraft['standing'], seeds = 200): number {
  const clan = ctx.content.clans.require('none');
  const shape = { band: STANDING_INFO[standing].talent, specialties: [] };
  let sum = 0;
  for (let seed = 1; seed <= seeds; seed++) {
    const aptitude = rollCharacterAptitude(createRng(seed), clan, [], shape);
    sum += DISCIPLINES.reduce((s, d) => s + aptitude[d], 0) / DISCIPLINES.length;
  }
  return sum / seeds;
}

describe('class standing', () => {
  it('every standing’s quick pick fits its own file, and not the one below it', () => {
    for (const standing of CLASS_STANDINGS) {
      expect(draftProblems(standingDraft(standing), ctx)).toEqual([]);
    }
    const geniusFileAtTheBottom = {
      ...standingDraft('dead-last'),
      file: standingDraft('genius').file,
    };
    expect(draftProblems(geniusFileAtTheBottom, ctx)).toEqual([
      'That training costs 20 points; you have 2.',
      'Nobody in your standing graduates with a stat that far along.',
      'Those gifts take 2; your file has room for 0.',
    ]);
  });

  it('runs from dead last to genius: grades, starting arts and talent all rise', () => {
    const states = CLASS_STANDINGS.map((s) =>
      createNewGame({ draft: standingDraft(s), seed: 9 }, ctx),
    );
    const [bottom, below, middle, , genius] = states;
    const power = (s: typeof bottom) => fightingPower(s!.character.stats);
    expect(power(bottom)).toBeLessThan(power(below));
    expect(power(middle)).toBeLessThan(power(genius));
    // A genius graduates with their art at chūnin grade, and the report card says A.
    expect(statTier(genius!.character.stats.taijutsu).grade).toBe('C');
    expect(genius!.character.grades.taijutsu).toBe('A');
    expect(below!.techniques.known).toContain(ctx.content.disciplineStarters.taijutsu);
    expect(meanArtAptitude('dead-last')).toBeLessThan(meanArtAptitude('middle'));
    expect(meanArtAptitude('middle')).toBeLessThan(meanArtAptitude('genius'));
    // The gift on the file is there, whatever the dice.
    expect(genius!.character.aptitude.taijutsu).toBeGreaterThanOrEqual(1.3);
  });

  it('the bottom of the class gets the hard-work route: training alone keeps paying', () => {
    const bottom = createNewGame({ draft: standingDraft('dead-last'), seed: 9 }, ctx);
    // (Raised in a shinobi family, so no upbringing adds a floor of its own.)
    const raised = draft({ standing: 'middle', upbringingId: 'shinobi-family' });
    const middle = createNewGame({ draft: raised, seed: 9 }, ctx);
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
    const state = createNewGame({ draft: draft({ talentIds: ['no-chakra'] }), seed: 9 }, ctx);
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
