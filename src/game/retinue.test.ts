import { act, ctx, newGame, pressOn, veteran } from '@/test/gameFixtures';

import { enemyParty, enemyStatLine } from './combatants';
import { glanceOdds, retinueSeen } from './retinueSight';
import { scout } from './scouting';
import { missionBoardView } from './views/boards';
import { combatScene } from './views/scene';

const JOB = 'watch-over-the-smokehouse';
const poacher = ctx.content.enemies.require('poacher');

describe('a foe’s retinue', () => {
  it('joins the fight beside them, as a fighter of its own', () => {
    const [master, hound, ...rest] = enemyParty(poacher, 0, ctx);
    expect(rest).toEqual([]);
    expect(hound?.name).toBe('Poacher’s Hound');
    expect(hound?.id).not.toBe(master?.id);
  });

  it('stands on the field when the job comes to blows', () => {
    let state = act(veteran(newGame(), 2), { type: 'startMission', missionId: JOB }, ctx);
    for (let i = 0; i < 6 && !state.combat; i++) state = pressOn(state);
    const foes = combatScene(state, ctx)?.combatants.filter((c) => c.side === 'enemy') ?? [];
    expect(foes.map((f) => f.name)).toEqual(['Poacher', 'Poacher’s Hound']);
  });
});

describe('reading a retinue before the fight', () => {
  it('always sees a body at heel, never the kept or the hidden for certain', () => {
    expect(glanceOdds('open', 0)).toBe(1);
    expect(glanceOdds('kept', 4)).toBe(0);
    expect(glanceOdds('kept', 16)).toBeGreaterThan(glanceOdds('kept', 10));
    expect(glanceOdds('kept', 99)).toBeLessThan(1);
    expect(glanceOdds('hidden', 8)).toBe(0);
    expect(glanceOdds('hidden', 99)).toBeLessThan(glanceOdds('kept', 99));
  });

  it('shows everything once you know their kit', () => {
    const kept = { ...poacher, retinue: [{ enemyId: 'poachers-hound', tell: 'hidden' as const }] };
    expect(retinueSeen(newGame(), kept, 'full')).toEqual(kept.retinue);
    expect(retinueSeen(newGame(), poacher, 'glance')).toEqual(poacher.retinue);
  });

  it('counts the companions you can tell are there into the threat', () => {
    const you = enemyStatLine(poacher);
    const hound = ctx.content.enemies.require('poachers-hound');
    const alone = scout({ stats: you }, you, false);
    const pair = scout(
      {
        stats: you,
        companions: [{ name: hound.name, stats: enemyStatLine(hound), healthScale: 0.6 }],
      },
      you,
      false,
    );
    expect(alone.threat).toBe('even');
    expect(pair.threat).not.toBe('even');
    expect(pair.companions.map((c) => c.name)).toEqual(['Poacher’s Hound']);
  });

  it('the notice counts the hound, and the client’s report names it', () => {
    const state = veteran(newGame(), 2);
    const notice = missionBoardView(state, ctx)?.notices.find((n) => n.id === JOB);
    expect(notice?.opposition?.label).toMatch(/\(2 foes\)$/);
    const informed = { ...state, board: { ...state.board, intel: [JOB] } };
    const known = missionBoardView(informed, ctx)?.notices.find((n) => n.id === JOB);
    expect(known?.opposition?.foes?.map((f) => f.name)).toEqual(['Poacher', 'Poacher’s Hound']);
  });
});
