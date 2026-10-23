import type { TechniqueDef } from '@/systems/techniques';

import type { CombatantSetup, CombatCall } from '../../contract';
import { avoidOdds, techniqueIncoming } from './avoid';
import { kitCall } from './calling';
import { playable } from './cards';
import { afterEmpowers } from './empower';
import { meditationEnds } from './meditation';
import { carrierOf } from './riding';
import { useJutsu } from './jutsu';
import { callSummon, summonFatesOf, summonsAfter } from './summons';
import { initialFighters, type PlanFighter, type Round } from './state';
import { createRng } from '@/core';

/**
 * A summoner's style (Jiraiya and the toads): summons hurt badly enough are lost, a sharp caller
 * sends them home first, sage toads perch on their caller, a mount carries a meditating rider
 * clear, and Sage Mode is meditated into, held while the toads perch, and called from the kit.
 */

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

function setup(id: string, over: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 600,
    maxChakra: 600,
    techniques: [],
    ...over,
  };
}

const summoning = (id: string, ...calls: string[]): TechniqueDef => ({
  id,
  name: id,
  description: id,
  discipline: 'ninjutsu',
  effects: calls.map((call) => ({ verb: 'summon' as const, power: 1, call })),
  chakraCost: 10,
  rank: 'C',
  difficulty: 60,
});

const CALL_BOSS = summoning('call-boss', 'boss');
const CALL_SAGES = summoning('call-sages', 'elder', 'elder-wife');
const CALL_PUP = summoning('call-pup', 'pup');

const SAGE_MODE: TechniqueDef = {
  id: 'sage-mode',
  name: 'Sage Mode',
  description: 'Stillness.',
  discipline: 'ninjutsu',
  needsCalls: ['elder', 'elder-wife'],
  effects: [
    {
      verb: 'empower',
      power: 1,
      boosts: ['strength', 'ninjutsu'],
      opens: { ladder: 'sage', step: 1 },
      still: true,
    },
  ],
  chakraCost: 20,
  rank: 'S',
  difficulty: 180,
};

const BOLT: TechniqueDef = {
  id: 'bolt',
  name: 'Bolt',
  description: 'A bolt.',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 20 }],
  chakraCost: 5,
  rank: 'C',
  difficulty: 60,
};

const BOSS: CombatCall = {
  id: 'boss',
  body: setup('boss', {
    name: 'The boss toad',
    health: 300,
    maxHealth: 300,
    attributes: { ...attributes, speed: 30 },
  }),
  upkeep: 10,
  mount: true,
};
const PUP: CombatCall = { id: 'pup', body: setup('pup', { name: 'A small toad' }), upkeep: 2 };
const ELDER: CombatCall = { id: 'elder', body: setup('elder'), upkeep: 4, perch: true };
const ELDER_WIFE: CombatCall = {
  id: 'elder-wife',
  body: setup('elder-wife'),
  upkeep: 4,
  perch: true,
};

function round(over: Partial<CombatantSetup> = {}, foe: Partial<CombatantSetup> = {}): Round {
  const fighters = initialFighters({
    player: setup('sage', {
      techniques: [CALL_BOSS, CALL_SAGES, CALL_PUP, SAGE_MODE, BOLT],
      calls: [BOSS, ELDER, ELDER_WIFE, PUP],
      ...over,
    }),
    allies: [],
    enemies: [setup('foe', { techniques: [BOLT], ...foe })],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'mid', lines: [], seen: {}, intents: {} };
}

const who = (r: Round, id: string) => r.fighters.find((f) => f.id === id)!;
const sage = (r: Round) => who(r, 'sage');
const boss = (r: Round) => r.fighters.find((f) => f.callId === 'boss');
const hurt = (r: Round, test: (f: PlanFighter) => boolean, health: number): Round => ({
  ...r,
  fighters: r.fighters.map((f) => (test(f) ? { ...f, health } : f)),
});
const jutsu = (technique: TechniqueDef) => ({ kind: 'jutsu', technique }) as const;

describe('summons hurt in a fight', () => {
  it('go home when hurt badly enough, and won’t answer again that fight', () => {
    const called = callSummon(round(), sage(round()), 'boss');
    const broken = summonsAfter(hurt(called, (f) => f.callId === 'boss', 60));
    expect(boss(broken)).toBeUndefined();
    expect(summonFatesOf(sage(broken))).toEqual({ boss: 'fell' });
    expect(playable(sage(broken), jutsu(CALL_BOSS))).toBe(false);
  });

  it('are sent home hurt by a caller who reads the fight, and stay out with a dull one', () => {
    const called = callSummon(round(), sage(round()), 'boss');
    const saved = summonsAfter(hurt(called, (f) => f.callId === 'boss', 120));
    expect(boss(saved)).toBeUndefined();
    expect(summonFatesOf(sage(saved))).toEqual({ boss: 'sent-home' });
    expect(saved.lines.join(' ')).toMatch(/before .* lost/);
    const dull = round({ attributes: { ...attributes, intellect: 3 } });
    const kept = summonsAfter(
      hurt(callSummon(dull, sage(dull), 'boss'), (f) => f.callId === 'boss', 120),
    );
    expect(boss(kept)).toBeDefined();
  });
});

describe('sage toads', () => {
  it('perch on their caller rather than the field, and are paid for there', () => {
    const called = useJutsu(
      round(),
      { actor: sage(round()), target: undefined, rng: createRng(1) },
      CALL_SAGES,
    );
    expect(called.fighters.some((f) => f.callId === 'elder')).toBe(false);
    expect(sage(called).perched).toEqual(['elder', 'elder-wife']);
    const paid = summonsAfter(called);
    expect(sage(paid).chakra).toBe(sage(called).chakra - 8);
    const broke = summonsAfter(hurt(called, (f) => f.id === 'sage', 100));
    const poor = {
      ...broke,
      fighters: broke.fighters.map((f) => (f.id === 'sage' ? { ...f, chakra: 3 } : f)),
    };
    expect(sage(summonsAfter(poor)).perched).toBeUndefined();
  });
});

/** The sage, toads perched, having just played Sage Mode. */
function meditating(withMount: boolean): Round {
  const start = withMount ? callSummon(round(), sage(round()), 'boss') : round();
  const perched = useJutsu(
    start,
    { actor: sage(start), target: undefined, rng: createRng(1) },
    CALL_SAGES,
  );
  return useJutsu(
    perched,
    { actor: sage(perched), target: undefined, rng: createRng(1) },
    SAGE_MODE,
  );
}

describe('meditating into Sage Mode', () => {
  it('needs the sage toads out to begin', () => {
    expect(playable(sage(round()), jutsu(SAGE_MODE))).toBe(false);
    expect(sage(meditating(false)).meditating).toMatchObject({ techniqueId: 'sage-mode' });
  });

  it('opens as their next turn begins, unless a real hurt broke the stillness', () => {
    const opened = meditationEnds(meditating(false), 'sage');
    expect(sage(opened).empowered?.opened).toEqual({ ladder: 'sage', step: 1 });
    expect(sage(opened).attributes.ninjutsu).toBeGreaterThan(10);
    const grazed = meditationEnds(
      hurt(meditating(false), (f) => f.id === 'sage', 95),
      'sage',
    );
    expect(sage(grazed).empowered).toBeDefined();
    const struck = meditationEnds(
      hurt(meditating(false), (f) => f.id === 'sage', 80),
      'sage',
    );
    expect(sage(struck).empowered).toBeUndefined();
    expect(struck.lines.join(' ')).toMatch(/stillness breaks/);
  });

  it('is carried clear by a mount, slipping far more than sitting open', () => {
    const foe = (r: Round) => who(r, 'foe');
    const odds = (r: Round) => avoidOdds(r, techniqueIncoming(foe(r), sage(r), BOLT, r.range)!);
    expect(carrierOf(meditating(true), sage(meditating(true)))).toBeDefined();
    expect(odds(meditating(true))).toBeGreaterThan(odds(meditating(false)) * 2);
  });

  it('runs out after a few exchanges, unless the toads perched keep it going', () => {
    const opened = meditationEnds(meditating(false), 'sage');
    const later = afterEmpowers(opened, 6);
    expect(sage(later).empowered).toBeDefined();
    const alone = {
      ...opened,
      fighters: opened.fighters.map((f) => (f.id === 'sage' ? { ...f, perched: [] } : f)),
    };
    const faded = afterEmpowers(alone, 6);
    expect(sage(faded).empowered).toBeUndefined();
    expect(faded.lines.join(' ')).toMatch(/sage mode fades/);
  });
});

describe('a summoner calling from the kit', () => {
  const step = (r: Round): Round => {
    const card = kitCall(sage(r), r);
    return card?.kind === 'jutsu'
      ? useJutsu(r, { actor: sage(r), target: undefined, rng: createRng(1) }, card.technique)
      : r;
  };

  it('calls nothing against a foe far weaker', () => {
    const weak = Object.fromEntries(
      Object.keys(attributes).map((k) => [k, 1]),
    ) as typeof attributes;
    expect(
      kitCall(sage(round({}, { attributes: weak })), round({}, { attributes: weak })),
    ).toBeUndefined();
  });

  it('against a match: a mount, then the sage toads, then Sage Mode', () => {
    const first = step(round());
    expect(boss(first)).toBeDefined();
    const second = step(first);
    expect(sage(second).perched).toEqual(['elder', 'elder-wife']);
    const third = step(second);
    expect(sage(third).meditating).toBeDefined();
  });

  it('in Sage Mode calls no more while it holds its own, and calls again once hurt', () => {
    const third = step(step(step(round())));
    const open = meditationEnds(third, 'sage');
    expect(sage(open).empowered?.opened?.ladder).toBe('sage');
    expect(kitCall(sage(open), open)).toBeUndefined();
    const struck = hurt(open, (f) => f.id === 'sage', 40);
    const called = kitCall(sage(struck), struck);
    expect(called?.kind === 'jutsu' && called.technique.id).toBe('call-pup');
  });
});
