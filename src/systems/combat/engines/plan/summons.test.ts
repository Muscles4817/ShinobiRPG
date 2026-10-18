import { createRng } from '@/core';
import type { TechniqueDef } from '@/systems/techniques';

import type { CombatantSetup, CombatCall } from '../../contract';
import { createPlanEngine } from './engine';
import { playable } from './cards';
import { callSummon, summonFatesOf, summonsAfter } from './summons';
import { plannedSummons } from './summonPlans';
import { decode, initialFighters, type PlanFighter, type Round } from './state';

/** Summons are called mid-fight, kept up with chakra, and go home when they fall or aren't paid. */

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const SUMMONING: TechniqueDef = {
  id: 'summon-toad',
  name: 'Summoning: Toad',
  description: 'A toad answers.',
  discipline: 'ninjutsu',
  effects: [{ verb: 'summon', power: 1, call: 'toad' }],
  chakraCost: 10,
  rank: 'D',
  difficulty: 40,
};

const BLOW: TechniqueDef = {
  id: 'tongue-lash',
  name: 'Tongue Lash',
  description: 'A slap of a long tongue.',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 0,
  rank: 'E',
  difficulty: 10,
};

function setup(id: string, over: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
    ...over,
  };
}

const TOAD: CombatCall = {
  id: 'toad',
  body: setup('toad', { name: 'A great toad', health: 150, maxHealth: 150, techniques: [BLOW] }),
  upkeep: 8,
  bloodPrice: 10,
};

function round(chakra = 60): Round {
  const fighters = initialFighters({
    player: setup('caller', { techniques: [SUMMONING], calls: [TOAD], chakra }),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const who = (r: Round, id: string) => r.fighters.find((f) => f.id === id);
const caller = (r: Round) => who(r, 'caller')!;
const toad = (r: Round) => r.fighters.find((f) => f.summoner === 'caller');
const card = { kind: 'jutsu', technique: SUMMONING } as const;

describe('summons', () => {
  it('answers the call onto its caller’s side, front row, for a blood price', () => {
    const called = callSummon(round(), caller(round()), 'toad');
    expect(toad(called)).toMatchObject({ name: 'A great toad', side: 'player', row: 'front' });
    expect(caller(called).health).toBe(90);
    expect(called.lines.join(' ')).toMatch(/answers the call/);
  });

  it('can’t be called twice while it is out, or by someone who holds no such call', () => {
    const called = callSummon(round(), caller(round()), 'toad');
    expect(playable(caller(round()), card)).toBe(true);
    expect(playable(caller(called), card)).toBe(false);
    const nobody = callSummon(round(), caller(round()), 'dragon');
    expect(toad(nobody)).toBeUndefined();
  });

  it('gets a plan of its own before its first turn', () => {
    const planned = plannedSummons(callSummon(round(), caller(round()), 'toad'));
    const { close, mid, far } = toad(planned)!.loadout;
    expect(close.length + mid.length + far.length).toBeGreaterThan(0);
  });

  it('costs its upkeep each exchange, and goes home when it can’t be paid', () => {
    const called = callSummon(round(), caller(round()), 'toad');
    const kept = summonsAfter(called);
    expect(caller(kept).chakra).toBe(caller(called).chakra - TOAD.upkeep);
    expect(toad(kept)).toBeDefined();
    const broke = {
      ...called,
      fighters: called.fighters.map((f): PlanFighter =>
        f.id === 'caller' ? { ...f, chakra: 2 } : f,
      ),
    };
    const gone = summonsAfter(broke);
    expect(toad(gone)).toBeUndefined();
    expect(summonFatesOf(caller(gone))).toEqual({ toad: 'sent-home' });
  });

  it('goes home when it falls, or when its caller does', () => {
    const called = callSummon(round(), caller(round()), 'toad');
    const beaten = {
      ...called,
      fighters: called.fighters.map((f): PlanFighter => (f.summoner ? { ...f, health: 0 } : f)),
    };
    expect(summonFatesOf(caller(summonsAfter(beaten)))).toEqual({ toad: 'fell' });
    const callerDown = {
      ...called,
      fighters: called.fighters.map((f): PlanFighter =>
        f.id === 'caller' ? { ...f, health: 0 } : f,
      ),
    };
    expect(toad(summonsAfter(callerDown))).toBeUndefined();
  });

  it('is called by a default plan, fights, and is reported in the outcome', () => {
    const engine = createPlanEngine();
    let state = engine.start(
      {
        player: setup('caller', { techniques: [SUMMONING], calls: [TOAD] }),
        allies: [],
        enemies: [setup('foe', { health: 300, maxHealth: 300 })],
        canFlee: false,
        watch: true,
      },
      createRng(4),
    );
    const rng = createRng(5);
    for (let i = 0; i < 3; i++) {
      const next = engine.act(state, { optionId: 'next' }, rng);
      if (next.ok) state = next.value;
    }
    const fighters = decode(state).fighters;
    const called = fighters.find((f) => f.summoner === 'caller');
    expect(called ?? summonFatesOf(fighters.find((f) => f.id === 'caller')!).toad).toBeTruthy();
    const done = engine.act(state, { optionId: 'finish' }, rng);
    if (!done.ok) throw new Error(done.error);
    expect(engine.outcome(done.value)?.summons?.toad).toBeDefined();
  });
});
