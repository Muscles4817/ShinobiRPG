import { createRng, type Rng } from '@/core';

import type { CombatantSetup, CombatAttributes } from '../../contract';
import type { HoldGrip } from '../../rules/verbs';
import { startHolding } from './holding';
import { initialFighters, type PlanFighter, type Round } from './state';
import { aid, struggleFree } from './struggle';

/** Holds are fought: the held struggle each exchange, and teammates pull them out. */

const attributes: CombatAttributes = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 20,
  intellect: 20,
  perception: 20,
  willpower: 20,
  taijutsu: 20,
  ninjutsu: 20,
  genjutsu: 20,
  kenjutsu: 20,
  fuuinjutsu: 20,
};

function setup(id: string, over: Partial<CombatAttributes> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes: { ...attributes, ...over },
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
  };
}

const wire: HoldGrip = { drive: 20, discipline: 'taijutsu', resist: ['bind'] };

/** Everything comes up. */
const sure: Rng = { ...createRng(1), chance: (p) => p > 0 };
/** Nothing does. */
const never: Rng = { ...createRng(1), chance: () => false };

interface Scene {
  readonly caught: string;
  readonly mate?: Partial<CombatAttributes>;
  readonly foeMate?: Partial<CombatAttributes>;
}

/** The player and a teammate against two foes; `caught` is pinned by wire. */
function scene({ caught, mate = {}, foeMate = {} }: Scene): Round {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [setup('mate', mate)],
    enemies: [setup('foe'), setup('foe-mate', foeMate)],
    canFlee: true,
  }).map((f): PlanFighter => (f.id === caught ? { ...f, pinned: 3, grip: wire } : f));
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const who = (r: Round, id: string) => r.fighters.find((f) => f.id === id)!;

describe('struggling free', () => {
  it('the held break free at the end of an exchange, the pin and its grip gone', () => {
    const after = struggleFree(scene({ caught: 'hero' }), sure);
    expect(who(after, 'hero').pinned).toBeUndefined();
    expect(who(after, 'hero').grip).toBeUndefined();
    expect(after.lines.at(-1)).toMatch(/hero struggles free/i);
  });

  it('a hold that holds stays on', () => {
    const after = struggleFree(scene({ caught: 'hero' }), never);
    expect(who(after, 'hero').pinned).toBe(3);
  });

  it('breaking a channelled hold frees them of its seal and the caster lets go', () => {
    const held = startHolding(scene({ caught: 'hero' }), 'foe', 'hero');
    const sealed = {
      ...held,
      fighters: held.fighters.map((f) => (f.id === 'hero' ? { ...f, sealed: 2 } : f)),
    };
    const after = struggleFree(sealed, sure);
    expect(who(after, 'foe').holding).toBeUndefined();
    expect(who(after, 'hero').sealed).toBe(0);
  });

  it('happens more often for the strong than the weak, over many exchanges', () => {
    const escapes = (strength: number) =>
      Array.from({ length: 200 }, (_, seed) => {
        const round = scene({ caught: 'hero' });
        const weak = {
          ...round,
          fighters: round.fighters.map((f) =>
            f.id === 'hero' ? { ...f, attributes: { ...f.attributes, strength } } : f,
          ),
        };
        return struggleFree(weak, createRng(seed + 1));
      }).filter((r) => who(r, 'hero').pinned === undefined).length;
    expect(escapes(40)).toBeGreaterThan(escapes(5));
  });
});

describe('coming to a teammate’s aid', () => {
  it('a teammate spends their turn pulling the player free', () => {
    const round = scene({ caught: 'hero' });
    const helped = aid(round, { actor: who(round, 'mate'), rng: sure }, { kind: 'strike' });
    expect(helped.kind).toBe('spent');
    if (helped.kind !== 'spent') return;
    expect(who(helped.round, 'hero').pinned).toBeUndefined();
    expect(helped.round.lines.at(-1)).toMatch(/mate pulls hero free/i);
  });

  it('against a channelled hold, they go for its caster instead', () => {
    const round = startHolding(scene({ caught: 'hero' }), 'foe', 'hero');
    const helped = aid(round, { actor: who(round, 'mate'), rng: sure }, { kind: 'strike' });
    expect(helped).toMatchObject({ kind: 'strike', at: { id: 'foe' } });
  });

  it('a dull mind leaves a caught teammate to it; the player plays their own plan', () => {
    const dull = scene({ caught: 'foe', foeMate: { intellect: 2 } });
    expect(aid(dull, { actor: who(dull, 'foe-mate'), rng: sure }, { kind: 'strike' }).kind).toBe(
      'none',
    );
    const mateCaught = scene({ caught: 'mate' });
    const player = who(mateCaught, 'hero');
    expect(aid(mateCaught, { actor: player, rng: sure }, { kind: 'strike' }).kind).toBe('none');
  });

  it('a pin about to lapse is left to lapse', () => {
    const round = scene({ caught: 'hero' });
    const lapsing = {
      ...round,
      fighters: round.fighters.map((f) => (f.id === 'hero' ? { ...f, pinned: 1 } : f)),
    };
    expect(aid(lapsing, { actor: who(lapsing, 'mate'), rng: sure }, { kind: 'strike' }).kind).toBe(
      'none',
    );
  });
});
