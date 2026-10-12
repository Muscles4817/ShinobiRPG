import { createRng } from '@/core';
import type { CombatOutcome, CombatView } from '@/systems/combat';
import type { Injury } from '@/systems/injuries';
import { maxChakra } from '@/systems/vitals';
import { act, ctx, lastEntry, newGame } from '@/test/gameFixtures';

import { dispatch } from './dispatch';
import { applyFightToll, beatingOf } from './fightToll';
import { combatStats } from './gear';
import { deserialize } from './persistence/save';
import { trainingScale } from './profile';
import type { GameState } from './state';
import { conditionView } from './views/condition';
import { hospitalView } from './views/home';
import { shinobiView } from './views/shinobi';
import { inflict } from './wounds';

function hurt(state: GameState, ...injuries: Injury[]): GameState {
  return { ...state, character: { ...state.character, injuries } };
}

function withStamina(state: GameState, stamina: number): GameState {
  const stats = { ...state.character.stats, stamina };
  return { ...state, character: { ...state.character, stats } };
}

const ribs = ctx.content.injuries.require('cracked-ribs');

describe('carrying an injury', () => {
  it('slows training and weakens your stats in fights', () => {
    const state = newGame();
    const injured = hurt(state, { injuryId: 'cracked-ribs', until: state.time.day + 3 });
    expect(trainingScale(injured.character, ctx).speed).toBeLessThan(
      trainingScale(state.character, ctx).speed ?? 1,
    );
    expect(combatStats(injured, ctx).stamina).toBeLessThan(combatStats(state, ctx).stamina);
    expect(combatStats(injured, ctx).ninjutsu).toBe(combatStats(state, ctx).ninjutsu);
  });

  it('heals on its morning, with a journal line', () => {
    const state = newGame();
    const injured = hurt(state, { injuryId: 'cracked-ribs', until: state.time.day + 1 });
    const slept = act(injured, { type: 'sleep' });
    expect(slept.character.injuries).toEqual([]);
    const headings = slept.journal.entries.map((e) => e.heading);
    expect(headings).toContain('Cracked ribs healed');
  });

  it('stays until its day comes', () => {
    const state = newGame();
    const injured = hurt(state, { injuryId: 'cracked-ribs', until: state.time.day + 2 });
    expect(act(injured, { type: 'sleep' }).character.injuries).toHaveLength(1);
  });

  it('heals sooner on a high-stamina body', () => {
    const note = { text: 'Ouch.' };
    const weak = inflict(withStamina(newGame(), 0), { def: ribs }, note);
    const tough = inflict(withStamina(newGame(), 40), { def: ribs }, note);
    const day = weak.time.day;
    expect(weak.character.injuries[0]?.until).toBe(day + ribs.days);
    expect(tough.character.injuries[0]?.until).toBeLessThan(day + ribs.days);
    expect(lastEntry(weak)?.chips?.[0]?.label).toBe(`${ribs.days} days to heal`);
  });

  it('shows on the Shinobi screen with where it hurts and the days left', () => {
    const state = newGame();
    const injured = hurt(state, { injuryId: 'cracked-ribs', until: state.time.day + 3 });
    const [line] = shinobiView(injured, ctx).condition.injuries;
    expect(line).toMatchObject({ name: 'Cracked ribs', where: 'Ribs', left: '3 days left' });
    expect(line?.effects.length).toBeGreaterThan(0);
    expect(shinobiView(state, ctx).condition).toEqual({ injuries: [], exhaustion: null });
  });
});

describe('the hospital', () => {
  it('treats injuries even at full health, halving the days left, once', () => {
    const state = newGame();
    const injured = hurt(state, { injuryId: 'cracked-ribs', until: state.time.day + 6 });
    const before = hospitalView(injured, ctx)!;
    expect(before.cost).toBeGreaterThan(hospitalView(state, ctx)!.cost);
    expect(before.injuries).toHaveLength(1);
    const treated = act(injured, { type: 'treat' });
    expect(treated.character.injuries[0]).toMatchObject({
      until: state.time.day + 3,
      treated: true,
    });
    expect(treated.wallet.ryo).toBe(injured.wallet.ryo - before.cost);
    expect(dispatch(treated, { type: 'treat' }, ctx)).toEqual({
      ok: false,
      error: 'You are not hurt.',
    });
  });
});

describe('chakra exhaustion', () => {
  it('a night while exhausted refills only part of your chakra; the next is full', () => {
    const state = newGame();
    const max = maxChakra(state.character.stats);
    const drained: GameState = {
      ...state,
      character: {
        ...state.character,
        vitals: { ...state.character.vitals, chakra: 0 },
        exhaustion: { until: state.time.day + 1, refill: 0.5 },
      },
    };
    const first = act(drained, { type: 'sleep' });
    expect(first.character.vitals.chakra).toBe(Math.round(max * 0.5));
    expect(first.character.exhaustion).toBeNull();
    expect(lastEntry(first)?.chips?.map((c) => c.label)).toContain('Chakra only partly back');
    expect(act(first, { type: 'sleep' }).character.vitals.chakra).toBe(max);
  });

  it('shows on the Shinobi screen', () => {
    const state = newGame();
    const tired = {
      ...state,
      character: { ...state.character, exhaustion: { until: state.time.day + 2, refill: 0.5 } },
    };
    expect(conditionView(tired, ctx).exhaustion?.left).toBe('2 nights left');
  });
});

describe('a fight’s toll', () => {
  const foes = (health: number): CombatView => ({
    round: 3,
    log: [],
    options: [],
    combatants: [
      {
        id: 'p',
        name: 'You',
        side: 'player',
        health: 0,
        maxHealth: 100,
        chakra: 0,
        maxChakra: 50,
        statuses: [],
      },
      {
        id: 'e',
        name: 'Foe',
        side: 'enemy',
        health,
        maxHealth: 100,
        chakra: 0,
        maxChakra: 50,
        statuses: [],
      },
    ],
  });
  const lost: CombatOutcome = { result: 'defeat', rounds: 3, player: { health: 0, chakra: 30 } };

  it('reads how badly you lost from what the foes had left', () => {
    expect(beatingOf(foes(100))).toBe(1);
    expect(beatingOf(foes(25))).toBe(0.25);
  });

  it('a real defeat leaves a defeat injury; a lost spar leaves none', () => {
    const state = newGame();
    const end = { outcome: lost, view: foes(90), sparring: false };
    const injured = applyFightToll(state, end, ctx, createRng(2));
    const [injury] = injured.character.injuries;
    expect(ctx.content.injuries.require(injury!.injuryId).causes).toContain('defeat');
    const spar = applyFightToll(state, { ...end, sparring: true }, ctx, createRng(2));
    expect(spar.character.injuries).toEqual([]);
  });

  it('ending a fight nearly drained leaves you exhausted tonight', () => {
    const state = newGame();
    const won: CombatOutcome = { result: 'victory', rounds: 3, player: { health: 50, chakra: 1 } };
    const end = { outcome: won, view: foes(0), sparring: false };
    const tired = applyFightToll(state, end, ctx, createRng(2));
    expect(tired.character.exhaustion?.until).toBe(state.time.day + 1);
    expect(tired.character.injuries).toEqual([]);
    const fresh = { ...end, outcome: { ...won, player: { health: 50, chakra: 40 } } };
    expect(applyFightToll(state, fresh, ctx, createRng(2)).character.exhaustion).toBeNull();
  });
});

describe('saves from before injuries', () => {
  it('a version 16 save loads unhurt and rested', () => {
    const state = newGame();
    const { injuries: _i, exhaustion: _e, ...character } = state.character;
    const loaded = deserialize(JSON.stringify({ version: 16, state: { ...state, character } }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.character.injuries).toEqual([]);
    expect(loaded.value.character.exhaustion).toBeNull();
  });
});
