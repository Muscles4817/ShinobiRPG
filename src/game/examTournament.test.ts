import { fightingPower } from '@/systems/stats';
import { MAX_HEALTH } from '@/systems/vitals';
import { examDay, scriptedCtx, type Script } from '@/test/examFixtures';
import { act, ctx } from '@/test/gameFixtures';

import type { GameContext } from './context';
import { BOUT_READY_SHARE, rivalNow } from './exam/tournament';
import type { GameState } from './state';
import { examScene } from './views/exam';

/** The tournament: bouts against generated rivals, and a verdict on conduct and results. */

/** A save whose exam has reached the tournament (the earlier stages skipped). */
function atTheRing(context: GameContext = ctx): GameState {
  const entered = act(examDay(context), { type: 'enterExam' }, context);
  const run = entered.exams.run;
  if (!run) throw new Error('No run.');
  const progress = { kind: 'tournament', round: 0, roundsWon: 0, fighting: false } as const;
  return { ...entered, exams: { ...entered.exams, run: { ...run, stageIndex: 2, progress } } };
}

/** Fights every bout as scripted (the script may change per round). */
function bouts(state: GameState, scripts: readonly Script[]): GameState {
  return scripts.reduce((current, script) => {
    if (current.exams.run?.verdict) return current;
    const context = scriptedCtx(script);
    const ready = act(current, { type: 'examContinue' }, context);
    return act(ready, { type: 'combatAct', optionId: 'end' }, context);
  }, state);
}

const WIN: Script = { result: 'victory' };
const CLEVER: Script = { result: 'victory', used: ['palm-strike', 'gale-heel'] };
const LOSS: Script = { result: 'defeat', health: 0 };

describe('the tournament', () => {
  it('brings rivals of the round’s grade, the same for the same sitting', () => {
    const state = atTheRing();
    const first = rivalNow(state, ctx);
    expect(first).toEqual(rivalNow(state, ctx));
    const best = Math.max(...Object.values(first?.stats ?? {}));
    expect(best).toBeCloseTo(11);
    expect(examScene(state, ctx)?.rival?.name).toContain(first?.name ?? '?');
    const won = bouts(state, [WIN]);
    const second = rivalNow(won, ctx);
    expect(fightingPower(second?.stats ?? first!.stats)).toBeGreaterThan(
      fightingPower(first!.stats),
    );
  });

  it('patches you up before a bout, and ends one before you are really hurt', () => {
    const hurt = atTheRing();
    const low = {
      ...hurt,
      character: { ...hurt.character, vitals: { ...hurt.character.vitals, health: 5 } },
    };
    const context = scriptedCtx(LOSS);
    const inRing = act(low, { type: 'examContinue' }, context);
    expect(inRing.character.vitals.health).toBe(Math.round(MAX_HEALTH * BOUT_READY_SHARE));
    const after = act(inRing, { type: 'combatAct', optionId: 'end' }, context);
    expect(after.character.vitals.health).toBeGreaterThan(0);
    expect(after.character.injuries).toEqual([]);
    expect(after.reports.some((r) => r.kind === 'defeat')).toBe(false);
  });

  it('promotes a genin who loses the final with good conduct', () => {
    const out = bouts(atTheRing(), [CLEVER, WIN, LOSS]);
    expect(out.exams.run?.verdict).toMatchObject({ promoted: true, roundsWon: 2, exit: null });
  });

  it('passes over a champion whose conduct the examiners couldn’t stomach', () => {
    const ring = atTheRing();
    const run = ring.exams.run!;
    const caught = { signal: 'caught-cheating', points: -2 } as const;
    const marked = {
      ...ring,
      exams: { ...ring.exams, run: { ...run, conduct: [caught, caught] } },
    };
    const out = bouts(marked, [WIN, WIN, WIN]);
    expect(out.exams.run?.verdict).toMatchObject({ promoted: false, roundsWon: 3 });
    expect(out.exams.run?.notes.at(-1)?.kind).toBe('outcome');
  });

  it('judges a yield by how the bout was going', () => {
    const late = bouts(atTheRing(), [{ result: 'escaped', health: 10 }]);
    expect(late.exams.run?.conduct.map((m) => m.signal)).toEqual(['sensible-yield']);
    const early = bouts(atTheRing(), [{ result: 'escaped', health: 90 }]);
    expect(early.exams.run?.conduct.map((m) => m.signal)).toEqual(['early-yield']);
    expect(early.exams.run?.verdict?.promoted).toBe(false);
  });
});
