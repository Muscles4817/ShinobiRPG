import { SOLO, startRun } from '@/systems/missions';
import { act, ctx, newGame, veteran } from '@/test/gameFixtures';

import { gradeOf, helpedOf } from './debrief';

describe('grading a job', () => {
  const def = ctx.content.missions.require('lantern-patrol');
  const run = startRun(def, SOLO);

  it('is clean with nothing lost, rough with a setback, botched with too much lost', () => {
    expect(gradeOf(run)).toBe('clean');
    const setback = { ...run, ledger: [{ stageIndex: 0, text: 'x', tone: 'cost' as const }] };
    expect(gradeOf(setback)).toBe('rough');
    expect(gradeOf({ ...run, rewardMultiplier: 0.5 })).toBe('botched');
  });
});

describe('what would have helped', () => {
  it('names a failed check’s best approach', () => {
    const s = act(veteran(newGame(), 5), { type: 'startMission', missionId: 'lantern-patrol' });
    const on = act(s, { type: 'missionContinue' });
    expect(helpedOf(on, ctx, ctx.content.missions.require('lantern-patrol'))).toMatch(
      /was your best chance: it leans on/,
    );
  });

  it('names the trick of the foes a job ran into', () => {
    const s = act(veteran(newGame(), 5), {
      type: 'startMission',
      missionId: 'tea-merchant-escort',
    });
    const def = ctx.content.missions.require('tea-merchant-escort');
    const atFoes = {
      ...s,
      mission: { ...s.mission!, stageIndex: def.stages.findIndex((st) => st.kind === 'encounter') },
    };
    expect(helpedOf(atFoes, ctx, def)).toMatch(/^Bandit/);
  });
});
