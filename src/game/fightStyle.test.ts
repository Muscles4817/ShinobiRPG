import { act, ctx, newGame, veteran, withAllStats } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { engineFor } from './fightStyle';
import { deserialize } from './persistence/save';
import type { GameState } from './state';
import { combatScene } from './views/scene';
import { fightStyles } from './views/fightStyle';

const STYLES = ['duel-v1', 'plan-v1', 'deck-v1', 'mind-v1'] as const;

/** Picks something sensible every turn, whatever the engine, until the fight ends. */
function fightOut(start: GameState): GameState {
  let state = start;
  for (let i = 0; i < 300 && state.combat; i++) {
    const options = combatScene(state, ctx)!.options.filter((o) => !o.disabledReason);
    const pick =
      options.find((o) => o.id === 'begin' || o.id === 'round') ??
      options.find((o) => o.targeted) ??
      options.find((o) => o.kind === 'end') ??
      options.find((o) => o.kind === 'move') ??
      options[0]!;
    state = act(state, { type: 'combatAct', optionId: pick.id });
  }
  return state;
}

function withStyle(style: string, state: GameState = newGame()): GameState {
  return style === state.settings.combatStyle
    ? state
    : act(state, { type: 'setCombatStyle', style });
}

describe('fight styles', () => {
  it('offers every engine and starts on the classic one', () => {
    const styles = fightStyles(newGame(), ctx);
    expect(styles.map((s) => s.id)).toEqual([...STYLES]);
    expect(styles.find((s) => s.active)?.label).toBe('Classic');
  });

  it('refuses unknown styles and the one already chosen', () => {
    const state = newGame();
    expect(blockerFor(state, { type: 'setCombatStyle', style: 'nope' }, ctx)).toBe(
      'Unknown fight style.',
    );
    expect(blockerFor(state, { type: 'setCombatStyle', style: 'duel-v1' }, ctx)).toBe(
      'This is already your fight style.',
    );
  });

  it.each(STYLES)('a spar plays to the end in %s', (style) => {
    const strong = withAllStats(withStyle(style), 40);
    const fight = act(strong, { type: 'spar', personId: 'kaen' });
    expect(fight.combat?.engineId).toBe(style);
    const done = fightOut(fight);
    expect(done.combat).toBeNull();
    expect(done.reports.at(-1)).toMatchObject({ kind: 'spar' });
  });

  it.each(STYLES)('a team mission fight plays to the end in %s', (style) => {
    let state = act(veteran(withAllStats(withStyle(style), 40), 2), {
      type: 'startMission',
      missionId: 'river-road-bandits',
    });
    state = act(state, { type: 'missionContinue' });
    state = act(state, { type: 'missionChoose', approachIndex: 0 });
    state = act(state, { type: 'missionContinue' });
    expect(combatScene(state, ctx)?.combatants.filter((c) => c.side === 'player')).toHaveLength(3);
    const done = fightOut(state);
    expect(done.mission).toBeNull();
    expect(done.standing.missionsCompleted).toBe(3);
  });

  it('a fight in progress finishes in the style it started in', () => {
    const fight = act(withAllStats(withStyle('deck-v1'), 40), { type: 'spar', personId: 'kaen' });
    const switched = act(fight, { type: 'setCombatStyle', style: 'mind-v1' });
    expect(engineFor(switched, ctx).id).toBe('deck-v1');
    expect(fightOut(switched).settings.combatStyle).toBe('mind-v1');
  });

  it('a version 5 save starts on the classic style', () => {
    const { settings: _settings, ...v5state } = newGame();
    const loaded = deserialize(JSON.stringify({ version: 5, state: v5state }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.settings).toEqual({ combatStyle: 'duel-v1' });
  });
});
