import { examDay, scriptedCtx } from '@/test/examFixtures';
import { act, ctx, lastEntry } from '@/test/gameFixtures';

import { availability } from './board';
import { blockerFor } from './dispatch';
import { withBreakthrough } from './breakthroughs';
import {
  JONIN_REPUTATION,
  JONIN_SENIOR_MISSIONS,
  joninGap,
  PROMOTION_LIMITS,
} from './exam/promotion';
import { naturalLimits } from './profile';
import type { GameState } from './state';
import { activeScene } from './views/peopleScenes';
import { promotionScene } from './views/promotion';
import { mentorOf } from './sensei/plan';

/** Promotion: the chūnin ceremony after the exam, its real unlocks, and a jōnin's nomination. */

/** A promoted run's verdict, heard: the ceremony waits. */
function promoted(): GameState {
  const entered = act(examDay(), { type: 'enterExam' });
  const run = entered.exams.run;
  if (!run) throw new Error('No run.');
  const verdict = { promoted: true, roundsWon: 2, conduct: 1, score: 5, exit: null };
  const over = {
    ...entered,
    exams: { ...entered.exams, run: { ...run, progress: null, verdict } },
  };
  return act(over, { type: 'examContinue' });
}

describe('the chūnin ceremony', () => {
  it('follows a promoted verdict as its own scene', () => {
    const state = promoted();
    expect(state.exams.run).toBeNull();
    expect(state.exams.ceremony).toEqual({ rank: 'chunin' });
    expect(activeScene(state)).toBe('promotion');
    expect(blockerFor(state, { type: 'rest' }, ctx)).toBe('Your promotion ceremony is waiting.');
  });

  it('speaks the setting’s words and lists what the rank really opens', () => {
    const scene = promotionScene(promoted(), ctx);
    expect(scene?.heading).toBe('Before the Tōrokage');
    expect(scene?.speech).toContain('Kaito');
    expect(scene?.title).toMatch(/^Chūnin Kaito/);
    expect(scene?.gear).toBe('Flak Vest');
    const opens = Object.fromEntries((scene?.unlocks ?? []).map((u) => [u.heading, u.items]));
    expect(opens['The library']).toEqual(['The Lantern Archive: the restricted stacks']);
    expect(opens['Jobs on the board']).toContain('B-rank: Smugglers at the Weir');
    expect(opens['Gear the shops will sell you']).toContain('B-rank Flak Vest');
  });

  it('makes you a chūnin, hands over the vest and opens the B-rank board', () => {
    const before = promoted();
    const job = ctx.content.missions.require('smugglers-at-the-weir');
    expect(availability(before, ctx, job).kind).toBe('absent');
    const after = act(before, { type: 'acceptPromotion' });
    expect(after.standing.rank).toBe('chunin');
    expect(after.inventory.gear).toContain('flak-vest');
    expect(after.inventory.equipped.body).toBe('flak-vest');
    expect(after.exams.ceremony).toBeNull();
    expect(after.journal.entries.at(-1)?.heading).toBe('Promoted to Chūnin');
    const posted = {
      ...after,
      board: { ...after.board, postings: [{ missionId: job.id, postedDay: 1, expiresDay: 9999 }] },
    };
    expect(availability(posted, ctx, job).kind).toBe('posted');
  });

  it('ends the genin years with your sensei’s farewell: their words, a gift, a memory', () => {
    const before = promoted();
    const set = {
      ...before,
      character: {
        ...before.character,
        assignment: { stat: 'speed' as const, from: 1, target: 2 },
      },
    };
    const senseiId = set.people.team!.senseiId!;
    const sensei = ctx.content.people.require(senseiId);
    expect(promotionScene(set, ctx)?.farewell).toMatch(
      new RegExp(`^${sensei.name} finds you after the ceremony`),
    );
    const after = act(set, { type: 'acceptPromotion' });
    const word = after.journal.entries.find((e) => e.heading === `${sensei.name}’s farewell`);
    expect(word?.chips?.length).toBe(2);
    expect(after.character.assignment).toBeNull();
    expect(after.village.memories).toContainEqual(
      expect.objectContaining({ personId: senseiId, text: 'the day you made chūnin' }),
    );
    expect(after.people.bonds[senseiId]!.points).toBeGreaterThan(
      set.people.bonds[senseiId]!.points,
    );
    expect(mentorOf(after, ctx)).toBeNull();
  });

  it('deepens your reserves: a breakthrough that moves the limit, once', () => {
    const before = promoted();
    const after = act(before, { type: 'acceptPromotion' });
    expect(after.character.breakthroughs).toEqual([
      { source: 'promotion:chunin', limits: PROMOTION_LIMITS.chunin },
    ]);
    const reserves = (s: GameState) => naturalLimits(s.character, ctx).reserves;
    expect(reserves(after)).toBe(reserves(before) + (PROMOTION_LIMITS.chunin.reserves ?? 0));
    expect(lastEntry(after)?.chips?.map((c) => c.label)).toContain(
      'Chakra Reserves can go further',
    );
    const twice = withBreakthrough(after.character, after.character.breakthroughs[0]!);
    expect(twice).toBe(after.character);
  });

  it('never posts the exam’s forest', () => {
    const state = examDay();
    const forest = ctx.content.missions.require('exam-ash-wood');
    const posted = {
      ...state,
      board: {
        ...state.board,
        postings: [{ missionId: forest.id, postedDay: 1, expiresDay: 9999 }],
      },
    };
    expect(availability(posted, ctx, forest).kind).toBe('absent');
  });
});

describe('a jōnin’s nomination', () => {
  /** A new chūnin, rent paid well ahead so they can sleep at home. */
  function chunin(): GameState {
    const state = act(promoted(), { type: 'acceptPromotion' });
    return { ...state, housing: { ...state.housing, paidThroughDay: 9999 } };
  }

  it('waits on the record, the specialty and the village’s regard', () => {
    const state = chunin();
    expect(joninGap(state)).toMatch(`${JONIN_SENIOR_MISSIONS} B- or A-rank jobs`);
    const record = { ...state.standing, seniorMissionsCompleted: JONIN_SENIOR_MISSIONS };
    const stats = { ...state.character.stats, taijutsu: 21 };
    const proven = { ...state, standing: record, character: { ...state.character, stats } };
    expect(joninGap(proven)).toMatch(`${JONIN_REPUTATION} reputation`);
    expect(
      joninGap({ ...proven, standing: { ...record, reputation: JONIN_REPUTATION } }),
    ).toBeNull();
  });

  it('arrives as a smaller ceremony once earned, and makes you a jōnin', () => {
    const state = chunin();
    const stats = { ...state.character.stats, taijutsu: 21 };
    const standing = { ...state.standing, seniorMissionsCompleted: 5, reputation: 90 };
    const earned = act(
      { ...state, standing, character: { ...state.character, stats } },
      { type: 'sleep' },
    );
    expect(earned.exams.ceremony).toEqual({ rank: 'jonin' });
    expect(promotionScene(earned, ctx)).toMatchObject({
      scale: 'small',
      gear: null,
      rank: 'Jōnin',
    });
    const jonin = act(earned, { type: 'acceptPromotion' });
    expect(jonin.standing.rank).toBe('jonin');
    expect(act(jonin, { type: 'sleep' }).exams.ceremony).toBeNull();
  });

  it('counts B-rank jobs done towards the record', () => {
    const context = scriptedCtx({ result: 'victory' });
    const state = act(promoted(), { type: 'acceptPromotion' });
    const ready = {
      ...state,
      time: { ...state.time, day: state.time.day + 1, slot: 0 },
      character: {
        ...state.character,
        stats: Object.fromEntries(
          Object.keys(state.character.stats).map((k) => [k, 60]),
        ) as GameState['character']['stats'],
      },
      board: {
        ...state.board,
        refreshedDay: 999,
        postings: [{ missionId: 'ash-wraith-of-kiln-pass', postedDay: 1, expiresDay: 9999 }],
      },
    };
    let current = act(
      ready,
      { type: 'startMission', missionId: 'ash-wraith-of-kiln-pass' },
      context,
    );
    for (let i = 0; current.mission && i < 20; i++) {
      if (current.combat) current = act(current, { type: 'combatAct', optionId: 'end' }, context);
      else if (current.mission.encounter)
        current = act(current, { type: 'encounterApproach', approach: 'head-on' }, context);
      else current = act(current, { type: 'missionContinue' }, context);
    }
    expect(current.standing.seniorMissionsCompleted).toBe(1);
  });
});
