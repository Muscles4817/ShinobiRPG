import {
  act,
  classicCtx,
  ctx,
  fightOut,
  intoFight,
  newGame,
  veteran,
  withAllStats,
} from '@/test/gameFixtures';

import type { GameContext } from './context';
import { blockerFor } from './dispatch';
import { engineFor } from './fightStyle';
import { deserialize } from './persistence/save';
import type { GameState } from './state';
import { combatScene } from './views/scene';
import { fightStyles } from './views/fightStyle';

/** Each style with a context that offers it: Classic is shelved, so it is injected. */
const STYLES: readonly (readonly [string, GameContext])[] = [
  ['duel-v1', classicCtx],
  ['plan-v1', ctx],
];

function withStyle(style: string, context: GameContext = ctx): GameState {
  const state = newGame({}, context);
  return style === state.settings.combatStyle
    ? state
    : act(state, { type: 'setCombatStyle', style }, context);
}

function load(version: number, state: unknown): GameState {
  const loaded = deserialize(JSON.stringify({ version, state }));
  if (!loaded.ok) throw new Error(loaded.error);
  return loaded.value;
}

describe('fight styles', () => {
  it('offers Plan & Watch alone, so there is no style to pick', () => {
    const menu = fightStyles(newGame(), ctx);
    expect(menu.options.map((s) => s.id)).toEqual(['plan-v1']);
    expect(menu.options[0]?.active).toBe(true);
    expect(menu.choosable).toBe(false);
  });

  it('does not let you pick the shelved Classic style', () => {
    expect(blockerFor(newGame(), { type: 'setCombatStyle', style: 'duel-v1' }, ctx)).toBe(
      'Unknown fight style.',
    );
  });

  it('offers every engine it is given, starting on the first', () => {
    const menu = fightStyles(newGame({}, classicCtx), classicCtx);
    expect(menu.options.map((s) => s.id)).toEqual(['duel-v1', 'plan-v1']);
    expect(menu.options.find((s) => s.active)?.label).toBe('Classic');
    expect(menu.choosable).toBe(true);
  });

  it('refuses unknown styles and the one already chosen', () => {
    const state = newGame({}, classicCtx);
    expect(blockerFor(state, { type: 'setCombatStyle', style: 'nope' }, classicCtx)).toBe(
      'Unknown fight style.',
    );
    expect(blockerFor(state, { type: 'setCombatStyle', style: 'duel-v1' }, classicCtx)).toBe(
      'This is already your fight style.',
    );
  });

  it.each(STYLES)('a spar plays to the end in %s', (style, context) => {
    const strong = withAllStats(withStyle(style, context), 40);
    const fight = act(strong, { type: 'spar', personId: 'kaen' }, context);
    expect(fight.combat?.engineId).toBe(style);
    const done = fightOut(fight, context);
    expect(done.combat).toBeNull();
    expect(done.reports.at(-1)).toMatchObject({ kind: 'spar' });
  });

  it.each(STYLES)('a team mission fight plays to the end in %s', (style, context) => {
    let state = act(
      veteran(withAllStats(withStyle(style, context), 40), 2),
      { type: 'startMission', missionId: 'river-road-bandits' },
      context,
    );
    state = act(state, { type: 'missionContinue' }, context);
    state = act(state, { type: 'missionChoose', approachIndex: 0 }, context);
    state = intoFight(state, context);
    const yourSide = combatScene(state, context)?.combatants.filter((c) => c.side === 'player');
    expect(yourSide).toHaveLength(4);
    const done = fightOut(state, context);
    expect(done.mission).toBeNull();
    expect(done.standing.missionsCompleted).toBe(3);
  });

  it('a fight in progress finishes in the style it started in', () => {
    const fight = act(
      withAllStats(withStyle('plan-v1', classicCtx), 40),
      { type: 'spar', personId: 'kaen' },
      classicCtx,
    );
    const switched = act(fight, { type: 'setCombatStyle', style: 'duel-v1' }, classicCtx);
    expect(engineFor(switched, classicCtx).id).toBe('plan-v1');
    expect(fightOut(switched, classicCtx).settings.combatStyle).toBe('duel-v1');
  });

  it('a version 13 save mid-fight in Classic finishes it in Classic, then plans', () => {
    const sparring = act(
      withAllStats(newGame({}, classicCtx), 40),
      { type: 'spar', personId: 'kaen' },
      classicCtx,
    );
    const loaded = load(13, sparring);
    expect(loaded.settings.combatStyle).toBe('plan-v1');
    expect(engineFor(loaded, ctx).id).toBe('duel-v1');
    const done = fightOut(loaded, ctx);
    expect(done.reports.at(-1)).toMatchObject({ kind: 'spar' });
    expect(engineFor(done, ctx).id).toBe('plan-v1');
  });

  it.each(['duel-v1', 'mind-v1', 'nope'])('a version 13 save on %s moves to Plan & Watch', (id) => {
    const state = newGame();
    const settings = { combatStyle: id, combatPlans: { 'plan-v1': 2 } };
    expect(load(13, { ...state, settings }).settings).toEqual({
      combatStyle: 'plan-v1',
      combatPlans: { 'plan-v1': 2 },
    });
  });

  it('a version 5 save gets settings, on today’s style', () => {
    const { settings: _settings, ...v5state } = newGame();
    expect(load(5, v5state).settings).toEqual({ combatStyle: 'plan-v1', combatPlans: {} });
  });

  it('a version 8 save remembers no plans yet', () => {
    const v8 = { ...newGame(), settings: { combatStyle: 'plan-v1' } };
    expect(load(8, v8).settings).toEqual({ combatStyle: 'plan-v1', combatPlans: {} });
  });

  it.each(['mind-v1', 'deck-v1'])('a version 12 save on retired %s drops its plans', (style) => {
    const settings = { combatStyle: style, combatPlans: { [style]: 1, 'plan-v1': 2 } };
    expect(load(12, { ...newGame(), settings }).settings).toEqual({
      combatStyle: 'plan-v1',
      combatPlans: { 'plan-v1': 2 },
    });
  });

  it.each(['mind-v1', 'deck-v1'])('a version 12 save mid-fight in %s calls it off', (style) => {
    const sparring = act(newGame(), { type: 'spar', personId: 'kaen' });
    const loaded = load(12, { ...sparring, combat: { engineId: style, data: {} } });
    expect(loaded.combat).toBeNull();
    expect(loaded.people.sparringWith).toBeNull();
    expect(loaded.character.vitals).toEqual(sparring.character.vitals);
  });

  it('Plan & Watch cards carry over to the next fight', () => {
    const strong = withAllStats(newGame(), 40);
    let fight = act(strong, { type: 'spar', personId: 'kaen' });
    const cards = () =>
      combatScene(fight, ctx)!
        .options.filter((o) => o.group === 'Far' && o.selected)
        .map((o) => o.id);
    const [first] = cards();
    fight = act(fight, { type: 'combatAct', optionId: first! });
    fight = act(fight, { type: 'combatAct', optionId: 'slot:far:dodge' });
    const chosen = cards();
    expect(chosen).toContain('slot:far:dodge');
    const done = fightOut(fight);
    expect(done.settings.combatPlans['plan-v1']).toBeDefined();
    const nextDay = { ...done, time: { ...done.time, day: done.time.day + 1, slot: 1 } };
    fight = act(nextDay, { type: 'spar', personId: 'kaen' });
    expect(cards()).toEqual(chosen);
  });
});
