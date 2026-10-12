import { BOND_STAGES, bondWith } from '@/systems/bonds';
import { act, ctx, newGame, veteran } from '@/test/gameFixtures';

import { requirePerson } from './people/cast';
import { companionCombatant } from './people/companions';
import {
  CARD_ORDERS_STAGE,
  defaultStance,
  LEADER_STAGE,
  ordersFor,
  STANCE_ORDERS_STAGE,
} from './people/teamOrders';
import type { GameState } from './state';
import { combatScene } from './views/scene';

const FIRST = 'genin-1';

function withBond(state: GameState, personId: string, stage: number): GameState {
  const points = BOND_STAGES[stage]?.min ?? 0;
  const bonds = { ...state.people.bonds, [personId]: bondWith(points) };
  return { ...state, people: { ...state.people, bonds } };
}

function toRiverFight(start: GameState): GameState {
  let state = act(veteran(start, 2), { type: 'startMission', missionId: 'river-road-bandits' });
  state = act(state, { type: 'missionContinue' });
  state = act(state, { type: 'missionChoose', approachIndex: 0 });
  return act(state, { type: 'missionContinue' });
}

const stanceOptions = (state: GameState, allyId: string) =>
  combatScene(state, ctx)!.options.filter((o) => o.setting === 'Stance' && o.adjusts === allyId);

describe('team orders: control grows with bonds', () => {
  it('a teammate takes the stance their specialty suggests', () => {
    const person = requirePerson(newGame(), ctx, FIRST);
    expect(defaultStance({ ...person, specialty: 'kenjutsu' }, 'player')).toEqual({
      kind: 'cover',
      covers: 'player',
    });
    expect(defaultStance({ ...person, specialty: 'genjutsu' }, 'player')).toEqual({
      kind: 'support',
    });
    expect(defaultStance({ ...person, specialty: 'taijutsu' }, 'player')).toEqual({
      kind: 'press',
    });
  });

  it('at first you have no say; a friend takes a stance; a close friend lets you set cards', () => {
    const state = newGame();
    const person = requirePerson(state, ctx, FIRST);
    const stranger = ordersFor(state, person);
    expect(stranger.stanceLocked).toBe(
      `${person.name} won't take orders from you yet. Become friends first.`,
    );
    expect(stranger.cardsLocked).toBeDefined();
    const friend = ordersFor(withBond(state, FIRST, STANCE_ORDERS_STAGE), person);
    expect(friend.stanceLocked).toBeUndefined();
    expect(friend.cardsLocked).toBeDefined();
    expect(ordersFor(withBond(state, FIRST, CARD_ORDERS_STAGE), person)).toEqual({});
  });

  it('once your sensei sees you as the leader, every teammate follows your lead', () => {
    const state = newGame();
    const senseiId = state.people.team?.senseiId;
    expect(senseiId).toBeTruthy();
    const led = withBond(state, senseiId!, LEADER_STAGE);
    expect(ordersFor(led, requirePerson(state, ctx, FIRST))).toEqual({});
  });
});

describe('team orders in a team fight', () => {
  it('teammates fight in their stance, and say why they won’t take your orders yet', () => {
    const fight = toRiverFight(newGame());
    const allyId = `person:${FIRST}`;
    const ally = combatScene(fight, ctx)!.combatants.find((c) => c.id === allyId);
    expect(ally?.statuses.some((s) => ['Pressing', 'Supporting', 'Covering you'].includes(s))).toBe(
      true,
    );
    const locked = stanceOptions(fight, allyId);
    expect(locked.length).toBeGreaterThan(0);
    expect(locked.every((o) => o.disabledReason?.includes("won't take orders"))).toBe(true);
    expect(combatScene(fight, ctx)!.options.some((o) => o.id.startsWith('mark:'))).toBe(true);
  });

  it('a friend takes a new stance from you', () => {
    const fight = toRiverFight(withBond(newGame(), FIRST, STANCE_ORDERS_STAGE));
    const allyId = `person:${FIRST}`;
    const hold = stanceOptions(fight, allyId).find((o) => o.label === 'Hold');
    expect(hold?.disabledReason).toBeUndefined();
    const after = act(fight, { type: 'combatAct', optionId: hold!.id });
    const ally = combatScene(after, ctx)!.combatants.find((c) => c.id === allyId);
    expect(ally?.statuses).toContain('Holding');
  });

  it('a teammate knows the half of a combination in their specialty', () => {
    const state = newGame();
    const blade = { ...requirePerson(state, ctx, FIRST), specialty: 'kenjutsu' as const };
    const ids = companionCombatant(blade, state, ctx, 'Teammate').techniques.map((t) => t.id);
    expect(ids).toContain('anvil-fall');
    expect(ids).not.toContain('shrine-snare');
  });
});
