import { stock } from '@/systems/inventory';
import { act, ctx, fightOut, newGame, veteran, withAllStats } from '@/test/gameFixtures';

import { availability } from './board';
import type { GameState } from './state';
import { missionBoardView } from './views/boards';
import { missionScene } from './views/missionScene';
import { rumoursToday } from './village';

/** The Lantern Thief: a long story told over weeks, act by act. */

const job = (id: string) => ctx.content.missions.require(id);

function ready(): GameState {
  const s = withAllStats(veteran(newGame(), 5), 60);
  return { ...s, inventory: stock(s.inventory, 'travel-rations', 12) };
}

/** Rested and fed between jobs, as a few quiet days at home would leave you. */
function rested(s: GameState): GameState {
  const fresh = ready().character.vitals;
  return { ...s, character: { ...s.character, vitals: fresh } };
}

function play(start: GameState, id: string, prefer: readonly string[]): GameState {
  let s = act(rested(start), { type: 'startMission', missionId: id });
  for (let i = 0; i < 60 && s.mission; i++) {
    if (s.combat) s = fightOut(s);
    else if (s.mission.encounter) s = act(s, { type: 'encounterApproach', approach: 'head-on' });
    else {
      const choices = missionScene(s, ctx)?.choices ?? [];
      const pick =
        prefer.map((p) => choices.find((c) => c.label === p)).find(Boolean) ?? choices[0];
      s = act(s, pick!.action);
    }
  }
  return { ...s, combatFinale: null, reports: [] };
}

const KIND = [
  'Follow the glitter of glass',
  'Ask about her nets, and wait',
  'Watch the river',
  'Ask where the glass comes from',
  'Get the boy out first',
  'Say he was forced, and vouch for him',
];

describe('a long story', () => {
  it('opens one act at a time, its jobs together, pinned above the notices', () => {
    const start = ready();
    expect(availability(start, ctx, job('arc-lantern-dark-wall'))).toEqual({
      kind: 'arc',
      arc: 'The Lantern Thief',
    });
    expect(availability(start, ctx, job('arc-lantern-night-market')).kind).toBe('absent');
    const card = missionBoardView(start, ctx)!.arcs[0];
    expect(card).toMatchObject({ act: 'Act 1 of 4: The dark stretch' });

    const actTwo = play(start, 'arc-lantern-dark-wall', KIND);
    expect(availability(actTwo, ctx, job('arc-lantern-dark-wall')).kind).toBe('absent');
    expect(availability(actTwo, ctx, job('arc-lantern-river-villages')).kind).toBe('arc');
    expect(availability(actTwo, ctx, job('arc-lantern-night-market')).kind).toBe('arc');
    expect(missionBoardView(actTwo, ctx)!.arcs[0]?.act).toBe('Act 2 of 4: Following the glass');
  });

  it('remembers what earlier acts found, and ends as you chose', () => {
    let s = ready();
    for (const id of [
      'arc-lantern-dark-wall',
      'arc-lantern-river-villages',
      'arc-lantern-night-market',
      'arc-lantern-reed-kiln',
    ]) {
      s = play(s, id, KIND);
    }
    expect(s.village.marks).toEqual(
      expect.arrayContaining(['lantern-thief-named', 'tobi-safe', 'lantern-kiln-burned']),
    );
    let relit = act(rested(s), { type: 'startMission', missionId: 'arc-lantern-relit' });
    for (let i = 0; i < 10 && relit.mission; i++) {
      const choices = missionScene(relit, ctx)!.choices;
      const pick =
        choices.find((c) => c.label === 'Say he was forced, and vouch for him') ?? choices[0];
      relit = act(relit, pick!.action);
    }
    expect(relit.village.marks).toContain('tobi-forgiven');
    const report = relit.reports.find((r) => r.kind === 'mission-complete');
    expect(report?.kind === 'mission-complete' && report.ending).toMatch(/arm round her son/);
    expect(missionBoardView(relit, ctx)!.arcs.map((a) => a.id)).not.toContain('the-lantern-thief');
    expect(rumoursToday(relit, ctx).map((r) => r.id)).toContain('tobi-forgiven');
  });
});
