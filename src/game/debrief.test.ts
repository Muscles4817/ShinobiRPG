import { applyOutcome, SOLO, startRun, writtenOptions } from '@/systems/missions';
import { act, ctx, newGame, veteran } from '@/test/gameFixtures';

import { gradeOf, helpedOf } from './debrief';

describe('grading a job', () => {
  const def = ctx.content.missions.require('lantern-patrol');
  const run = startRun(def, SOLO);

  it('is clean with nothing lost, rough with a setback, botched with too much lost', () => {
    expect(gradeOf(run)).toBe('clean');
    const line = { stageIndex: 0, text: 'x', tone: 'cost' as const };
    const setback = { ...run, ledger: [{ ...line, setback: true as const }] };
    expect(gradeOf(setback)).toBe('rough');
    // A line that only reads as a cost (a hurt taken on purpose) is no setback.
    expect(gradeOf({ ...run, ledger: [line] })).toBe('clean');
    expect(gradeOf({ ...run, rewardMultiplier: 0.5 })).toBe('botched');
  });
});

describe('setbacks, declared', () => {
  it('across every written choice of the road, only docked pay is a setback', () => {
    // A road choice is chosen, not failed: a hurt taken on it reads as a cost but sets nothing back.
    const def = ctx.content.missions.require('lantern-patrol');
    const run = startRun(def, SOLO);
    const lines = ctx.content.roadEvents.all
      .flatMap((e) => writtenOptions(e))
      .flatMap((o) => applyOutcome(run, def, o).run.ledger);
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) expect(line.setback === true).toBe((line.pay ?? 0) < 0);
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
