import type { CombatantSetup, CombatTechnique } from '../../contract';
import { seenDefence } from './adapt';
import { empowerSelf } from './empower';
import { initialFighters, type PlanFighter, type Round } from './state';
import { survivalPlay, survivalWarning, threatFrom } from './survival';

/** Survival, as judgement: a mind that reads the fight plays for time against a killer. */

const attributes = {
  strength: 30,
  speed: 30,
  stamina: 30,
  chakraControl: 30,
  intellect: 30,
  perception: 30,
  willpower: 30,
  taijutsu: 30,
  ninjutsu: 30,
  genjutsu: 15,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const gate = (id: string, step: number): CombatTechnique => ({
  id,
  name: id,
  discipline: 'taijutsu',
  effects: [
    { verb: 'empower', power: 10, boosts: ['strength', 'speed'], opens: { ladder: 'gates', step } },
  ],
  chakraCost: 8,
});
const life = gate('life', 3);
const view = gate('view', 6);
const wonder = gate('wonder', 7);
const kick: CombatTechnique = {
  id: 'kick',
  name: 'Kick',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 18 }],
  chakraCost: 0,
};
const blade: CombatTechnique = {
  id: 'blade',
  name: 'Lightning Blade',
  discipline: 'ninjutsu',
  lethal: true,
  effects: [{ verb: 'damage', power: 30 }],
  chakraCost: 20,
};
const flash: CombatTechnique = {
  id: 'flash',
  name: 'Flash',
  discipline: 'ninjutsu',
  reach: ['close', 'mid'],
  effects: [{ verb: 'daze', power: 10 }],
  chakraCost: 10,
};

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 120,
    maxChakra: 120,
    techniques: [],
    ...overrides,
  };
}

function fight(me: Partial<CombatantSetup> = {}, them: Partial<CombatantSetup> = {}): Round {
  const fighters = initialFighters({
    player: setup('me', me),
    allies: [],
    enemies: [setup('guy', { techniques: [life, view, wonder, kick], ...them })],
    canFlee: false,
  });
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const fighter = (r: Round, id: string): PlanFighter => r.fighters.find((f) => f.id === id)!;

/** The round with the foe's gates climbed to the seventh. */
function seventh(r: Round): Round {
  return [life, view, wonder].reduce(
    (at, t) => empowerSelf(at, fighter(at, 'guy'), { technique: t, effect: t.effects[0] as never }),
    r,
  );
}

/** Seen from a teammate's seat: the player's own plan is theirs to keep. */
const watched = (r: Round): Round => ({ ...r, watching: true });

describe('seeing a killer', () => {
  it('a gate open whose heaviest blow could end you makes a killer; shut, it does not', () => {
    const r = fight();
    expect(threatFrom(fighter(r, 'me'), fighter(r, 'guy'), {})).toBeUndefined();
    const deep = seventh(r);
    expect(threatFrom(fighter(deep, 'me'), fighter(deep, 'guy'), {})?.kind).toBe('gate');
  });

  it('a killing blow announced that would end you makes a killer', () => {
    const r = fight({}, { techniques: [blade] });
    const announced = { guy: 'jutsu:blade' };
    expect(threatFrom(fighter(r, 'me'), fighter(r, 'guy'), announced)?.kind).toBe('lethal');
  });
});

describe('playing for time', () => {
  it('only a mind that reads the fight does it, and never in the player’s own plan', () => {
    const dull = seventh(fight({ attributes: { ...attributes, intellect: 3 } }));
    expect(survivalPlay(fighter(dull, 'me'), watched(dull))).toBeUndefined();
    const own = seventh(fight());
    expect(survivalPlay(fighter(own, 'me'), own)).toBeUndefined();
    expect(survivalPlay(fighter(own, 'me'), watched(own))).toBeDefined();
  });

  it('holds the killer first, when the kit has a hold', () => {
    const r = watched(seventh(fight({ techniques: [flash] })));
    const play = survivalPlay(fighter(r, 'me'), r);
    expect(play?.card).toMatchObject({ kind: 'jutsu', technique: { id: 'flash' } });
    expect(play?.target?.id).toBe('guy');
  });

  it('a body that outpaces them can’t be slipped or outrun: they Brace, if it would save them', () => {
    const r = watched(seventh(fight()));
    expect(survivalPlay(fighter(r, 'me'), r)?.card).toEqual({ kind: 'brace' });
    const hurt = {
      ...r,
      fighters: r.fighters.map((f) => (f.id === 'me' ? { ...f, health: 30 } : f)),
    };
    expect(survivalPlay(fighter(hurt, 'me'), hurt)).toBeUndefined();
  });

  it('Evades a killer they keep pace with', () => {
    const quick = { ...attributes, speed: 60, perception: 60 };
    const r = watched(seventh(fight({ attributes: quick })));
    expect(survivalPlay(fighter(r, 'me'), r)?.card).toEqual({ kind: 'evade' });
  });

  it('fights on when they would fell the killer first', () => {
    const r = watched(seventh(fight()));
    const spent = {
      ...r,
      fighters: r.fighters.map((f) => (f.id === 'guy' ? { ...f, health: 5 } : f)),
    };
    expect(survivalPlay(fighter(spent, 'me'), spent)).toBeUndefined();
  });

  it('a Brace or an Evade shows as plainly as a defence kept', () => {
    const me = { ...fighter(fight(), 'me'), committed: 'brace' as const };
    expect(seenDefence(undefined, me, 'close')).toBe('guard');
    expect(seenDefence(undefined, { ...me, committed: 'evade' }, 'close')).toBe('dodge');
  });
});

describe('the plan screen', () => {
  it('says plainly when a killer faces you', () => {
    const r = fight();
    expect(survivalWarning(fighter(r, 'me'), r)).toBeNull();
    const deep = seventh(r);
    expect(survivalWarning(fighter(deep, 'me'), deep)).toBe(
      'Guy has the seventh gate open: one blow from them could end you.',
    );
  });
});
