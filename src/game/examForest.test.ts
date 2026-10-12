import type { ApproachId } from '@/systems/missions';
import { examDay, scriptedCtx, type Script } from '@/test/examFixtures';
import { act, ctx, withAllStats } from '@/test/gameFixtures';
import { spying } from '@/test/encounterFixtures';

import type { GameContext } from './context';
import type { GameState } from './state';

/** The survival stage: the forest as a team mission of encounters, judged by the examiners. */

const SURE = 60;

/** Through the written test with full marks, staying for the last question. */
function atTheForest(context: GameContext = ctx): GameState {
  let state = act(withAllStats(examDay(context), SURE), { type: 'enterExam' }, context);
  while (state.exams.run?.progress?.kind === 'mind' && !state.exams.run.progress.final) {
    state = act(state, { type: 'examAnswer', approach: 'reason' }, context);
  }
  return act(state, { type: 'examFinal', stay: true }, context);
}

/** Plays the forest through, meeting every encounter the given way. */
function playForest(state: GameState, context: GameContext, approach: ApproachId): GameState {
  let current = act(state, { type: 'examContinue' }, context);
  for (let i = 0; current.mission && i < 40; i++) {
    if (current.combat) current = act(current, { type: 'combatAct', optionId: 'end' }, context);
    else if (current.mission.encounter) {
      current = act(current, { type: 'encounterApproach', approach }, context);
    } else if (current.mission.stageIndex === 2) {
      current = act(current, { type: 'missionChoose', approachIndex: 0 }, context);
    } else current = act(current, { type: 'missionContinue' }, context);
  }
  return current;
}

describe('the survival forest', () => {
  it('goes in with the exam team and no sensei, and runs as a mission', () => {
    const forest = atTheForest();
    const entered = act(forest, { type: 'examContinue' });
    expect(entered.mission?.missionId).toBe('exam-ash-wood');
    expect(entered.exams.run?.progress).toEqual({ kind: 'survival', started: true });
    expect(entered.character.vitals.energy).toBeLessThan(forest.character.vitals.energy);
  });

  it('takes the team, never the sensei, into its fights', () => {
    const { context, setups } = spying(scriptedCtx({ result: 'victory' }));
    const forest = atTheForest(context);
    playForest(forest, context, 'head-on');
    const ids = setups[0]?.allies.map((a) => a.id) ?? [];
    expect(ids).toHaveLength(2);
    for (const id of forest.exams.run?.teamIds ?? []) expect(ids).toContain(`person:${id}`);
  });

  it('brings the token through to the tournament, the team standing, without pay or record', () => {
    const context = scriptedCtx({ result: 'victory' });
    const forest = atTheForest(context);
    const out = playForest(forest, context, 'head-on');
    expect(out.mission).toBeNull();
    expect(out.exams.run?.progress).toMatchObject({ kind: 'tournament', round: 0 });
    expect(out.exams.run?.conduct.filter((m) => m.signal === 'team-standing')).toHaveLength(2);
    expect(out.standing.missionsCompleted).toBe(forest.standing.missionsCompleted);
    expect(out.wallet.ryo).toBe(forest.wallet.ryo);
  });

  it('notes a fight won with a teammate down', () => {
    const context = scriptedCtx({ result: 'victory', allies: 0 });
    const out = playForest(atTheForest(context), context, 'head-on');
    expect(out.exams.run?.conduct.map((m) => m.signal)).toContain('teammate-down');
  });

  it('puts a beaten team out, in hospital but with no reputation lost', () => {
    const context = scriptedCtx({ result: 'defeat', health: 0 });
    const forest = atTheForest(context);
    const out = playForest(forest, context, 'head-on');
    expect(out.exams.run?.verdict).toMatchObject({ promoted: false, exit: 'beaten' });
    expect(out.standing.reputation).toBe(forest.standing.reputation);
    expect(out.standing.missionsFailed).toBe(forest.standing.missionsFailed);
    expect(out.reports.at(-1)).toMatchObject({ kind: 'defeat', reputationLost: 0 });
  });

  it('judges a withdrawal by whether the fight could be won', () => {
    const context = scriptedCtx({ result: 'victory' });
    const strong = playForest(atTheForest(context), context, 'withdraw');
    expect(strong.exams.run?.verdict?.exit).toBe('withdrew');
    expect(strong.exams.run?.conduct.map((m) => m.signal)).toContain('gave-up');
    const weak = atTheForest(context);
    const feeble = {
      ...weak,
      character: { ...weak.character, stats: { ...withAllStats(weak, 1).character.stats } },
    };
    const out = playForest(feeble, context, 'withdraw');
    expect(out.exams.run?.conduct.map((m) => m.signal)).toContain('sensible-withdrawal');
  });

  it('notes rivals got past without a fight', () => {
    const script: Script = { result: 'victory' };
    const context = scriptedCtx(script);
    const out = playForest(atTheForest(context), context, 'sneak');
    expect(out.exams.run?.conduct.map((m) => m.signal)).toContain('avoided-fight');
  });
});
