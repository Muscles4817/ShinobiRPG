import { act, ctx, newGame } from '@/test/gameFixtures';

import { playerCombatant } from './combatants';
import { blockerFor } from './dispatch';
import { studyPointsFor } from './learning';
import { nextSignature } from './people/signatures';
import { teachingOf } from './people/teachers';
import type { GameState } from './state';
import { academyView } from './views/academy';
import { trainingView } from './views/training';

/** The same game with one stat set (5 is grade E, 10 grade D, 15 grade C). */
function withStat(state: GameState, id: keyof GameState['character']['stats'], value: number) {
  const { character } = state;
  return { ...state, character: { ...character, stats: { ...character.stats, [id]: value } } };
}

function studyUntilKnown(
  start: GameState,
  techniqueId: string,
): { state: GameState; sessions: number } {
  let state = start;
  let sessions = 0;
  while (!state.techniques.known.includes(techniqueId) && sessions < 40) {
    state = act(act(state, { type: 'study', techniqueId }), { type: 'sleep' });
    sessions++;
  }
  return { state, sessions };
}

describe('learning by rank', () => {
  it('a technique a rank above you is studied at half pace and arrives unstable', () => {
    const atE = withStat(newGame(), 'ninjutsu', 5);
    const atD = withStat(newGame(), 'ninjutsu', 10);
    const def = ctx.content.techniques.require('ember-breath');
    const read = { aptitude: 1, source: 'scroll' } as const;
    const slow = studyPointsFor(atE.character, def, ctx, read);
    const usual = studyPointsFor(
      { ...atE.character, stats: { ...atE.character.stats } },
      {
        ...def,
        rank: 'E',
      },
      ctx,
      read,
    );
    expect(slow).toBeCloseTo(usual / 2, 0);

    const unsteady = studyUntilKnown(atE, 'ember-breath');
    expect(unsteady.state.techniques.unstable).toContain('ember-breath');
    const steady = studyUntilKnown(atD, 'ember-breath');
    expect(steady.state.techniques.unstable).not.toContain('ember-breath');
    expect(unsteady.sessions).toBeGreaterThan(steady.sessions);
  });

  it('a teacher is a better source than a scroll', () => {
    const { character } = newGame();
    const def = ctx.content.techniques.require('gale-heel');
    const scroll = studyPointsFor(character, def, ctx, { aptitude: 1, source: 'scroll' });
    const teacher = studyPointsFor(character, def, ctx, { aptitude: 1, source: 'teacher' });
    expect(teacher).toBeGreaterThan(scroll);
  });

  it('no talent in the art means nothing is learned', () => {
    const state = newGame();
    const void_ = {
      ...state,
      character: { ...state.character, aptitude: { ...state.character.aptitude, genjutsu: 0 } },
    };
    const after = act(void_, { type: 'study', techniqueId: 'lantern-mirage' });
    expect(after.techniques.progress['lantern-mirage'] ?? 0).toBe(0);
  });

  it('hard needs block whatever your grade, and say what fixes them', () => {
    const state = withStat(withStat(newGame(), 'ninjutsu', 10), 'chakraControl', 5);
    expect(blockerFor(state, { type: 'study', techniqueId: 'mending-glow' }, ctx)).toBe(
      "Needs D chakra control; you're E.",
    );
    const reserves = withStat(withStat(newGame(), 'ninjutsu', 10), 'reserves', 6);
    expect(blockerFor(reserves, { type: 'study', techniqueId: 'lantern-shades' }, ctx)).toBe(
      'Needs chakra reserves of 8; yours are 6.0.',
    );
  });

  it('the academy folds away what you can’t study yet, with the reason', () => {
    const view = academyView(withStat(newGame(), 'ninjutsu', 5), ctx)!;
    const sense = view.comingUp.find((s) => s.id === 'mending-glow');
    expect(sense?.locked).toBe("Needs D chakra control; you're E.");
    const ember = view.ready.find((s) => s.id === 'ember-breath');
    expect(ember).toMatchObject({ rank: 'D', unstable: true, locked: null });
  });
});

describe('unstable techniques', () => {
  function knowingUnstable(): GameState {
    const state = withStat(newGame(), 'ninjutsu', 5);
    return {
      ...state,
      techniques: {
        ...state.techniques,
        known: [...state.techniques.known, 'ember-breath'],
        unstable: ['ember-breath'],
      },
    };
  }

  it('go into fights marked unstable', () => {
    const fighter = playerCombatant(knowingUnstable(), ctx);
    expect(fighter.techniques.find((t) => t.id === 'ember-breath')?.unstable).toBe(true);
    expect(fighter.techniques.find((t) => t.id === 'palm-strike')?.unstable).toBeUndefined();
  });

  it('steady once your grade reaches their rank, with a journal line', () => {
    const grown = withStat(knowingUnstable(), 'ninjutsu', 8.5);
    const after = act(grown, { type: 'sleep' });
    expect(after.techniques.unstable).toEqual([]);
    expect(after.techniques.known).toContain('ember-breath');
    expect(after.journal.entries.some((e) => e.heading === 'Ember Breath steadies')).toBe(true);
  });

  it('stay unstable while your grade is short', () => {
    const after = act(knowingUnstable(), { type: 'sleep' });
    expect(after.techniques.unstable).toEqual(['ember-breath']);
  });
});

describe('a teacher’s signature techniques', () => {
  /** A sensei whose signature is rank C, with you as their close student. */
  function withRankCSensei(value: number) {
    const sensei = ctx.content.people.all.find((p) =>
      p.teacher?.teaches.some((id) => ctx.content.techniques.require(id).rank === 'C'),
    )!;
    const def = ctx.content.techniques.require(sensei.teacher!.teaches[0]!);
    const state = withStat(newGame(), def.discipline, value);
    const team = { ...state.people.team!, senseiId: sensei.id };
    const bond = { points: 30, lastTalkDay: null, heard: [] };
    const people = { ...state.people, team, bonds: { ...state.people.bonds, [sensei.id]: bond } };
    const ready: GameState = { ...state, people };
    return { state: ready, teaching: teachingOf(ready, sensei)!, def };
  }

  it('obey the same gate: two ranks above you waits, even with a teacher', () => {
    const low = withRankCSensei(5);
    expect(nextSignature(low.state, low.teaching, ctx)).toBeNull();
    const offer = trainingView(low.state, ctx)?.teachers.find(
      (t) => t.signature?.name === low.def.name,
    );
    expect(offer?.signature?.locked).toMatch(/^Needs D /);
    const ready = withRankCSensei(10);
    expect(nextSignature(ready.state, ready.teaching, ctx)).toBe(ready.def.id);
  });
});
