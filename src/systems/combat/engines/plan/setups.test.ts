import type { CombatantSetup, CombatTechnique } from '../../contract';
import { strikesToKill } from '../../rules/lethal';
import { avoidOdds, techniqueIncoming } from './avoid';
import { initialFighters, type PlanFighter, type Round } from './state';
import { setupPlay, setsUp } from './setups';

/** Hide, hold, finish: a killing blow on a target who can't meet it, and the mind that sets it up. */

const attributes = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 20,
  intellect: 40,
  perception: 20,
  willpower: 20,
  taijutsu: 20,
  ninjutsu: 30,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const mole: CombatTechnique = {
  id: 'mole',
  name: 'Mole',
  discipline: 'ninjutsu',
  effects: [{ verb: 'conceal', power: 12 }],
  chakraCost: 8,
};
const fang: CombatTechnique = {
  id: 'fang',
  name: 'Fang',
  discipline: 'ninjutsu',
  reach: ['close', 'mid', 'far'],
  effects: [{ verb: 'daze', power: 10 }],
  chakraCost: 10,
};
const blade: CombatTechnique = {
  id: 'blade',
  name: 'Blade',
  discipline: 'ninjutsu',
  reach: ['close'],
  lethal: true,
  effects: [{ verb: 'damage', power: 26 }],
  chakraCost: 18,
};

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 100,
    maxChakra: 100,
    techniques: [],
    ...overrides,
  };
}

function round(change: Partial<PlanFighter> = {}, foe: Partial<PlanFighter> = {}): Round {
  const fighters = initialFighters({
    player: setup('kakashi', { techniques: [mole, fang, blade] }),
    allies: [],
    enemies: [setup('guy')],
    canFlee: true,
  }).map((f) => (f.id === 'kakashi' ? { ...f, ...change } : { ...f, ...foe }));
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const one = (r: Round, id: string) => r.fighters.find((f) => f.id === id)!;
const kindOf = (play: ReturnType<typeof setupPlay>) =>
  play?.card.kind === 'jutsu' ? play.card.technique.id : play?.card.kind;

describe('a killing blow', () => {
  it('strikes to kill only a target who can’t see it or can’t move', () => {
    expect(strikesToKill(blade, { unseen: false, open: false })).toBe(false);
    expect(strikesToKill(blade, { unseen: true, open: false })).toBe(true);
    expect(strikesToKill(blade, { unseen: false, open: true })).toBe(true);
    expect(strikesToKill(fang, { unseen: true, open: true })).toBe(false);
  });

  it('can’t be slipped from hiding', () => {
    const seen = round();
    const unseen = round({ hidden: true });
    const odds = (r: Round) =>
      avoidOdds(r, techniqueIncoming(one(r, 'kakashi'), one(r, 'guy'), blade, 'close')!);
    expect(odds(seen)).toBeGreaterThan(0);
    expect(odds(unseen)).toBe(0);
  });
});

describe('a set-up', () => {
  it('needs a mind that reads the fight and a kit to hide, hold and finish', () => {
    expect(setsUp(one(round(), 'kakashi'))).toBe(true);
    expect(setsUp(one(round({ techniques: [mole, blade] }), 'kakashi'))).toBe(false);
    expect(setsUp(one(round({ attributes: { ...attributes, intellect: 4 } }), 'kakashi'))).toBe(
      false,
    );
  });

  it('hides first, holds from hiding, then finishes the held', () => {
    const r = round();
    const play = (state: Round) =>
      kindOf(setupPlay(one(state, 'kakashi'), { band: 'close', foes: [one(state, 'guy')] }));
    expect(play(r)).toBe('mole');
    expect(play(round({ hidden: true }))).toBe('fang');
    expect(play(round({ hidden: true }, { stunned: 1 }))).toBe('blade');
  });
});
