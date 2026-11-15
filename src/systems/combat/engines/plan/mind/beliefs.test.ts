import type { CombatantSetup } from '../../../contract';
import { initialFighters, type PlanFighter, type Round } from '../state';
import { beliefsAfter, clarity } from './beliefs';
import { witnessDefence } from './observe';
import { beliefLines, held } from './words';

/** What fighters make of what they saw (`beliefs.ts`), bounded by what their minds keep. */

function setup(id: string, attributes: Partial<CombatantSetup['attributes']>): CombatantSetup {
  return {
    id,
    name: id,
    attributes: {
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
      kenjutsu: 10,
      fuuinjutsu: 10,
      ...attributes,
    },
    health: 100,
    maxHealth: 100,
    chakra: 80,
    maxChakra: 80,
    techniques: [],
  };
}

function roundOf(fighters: readonly PlanFighter[], number = 1): Round {
  return { number, fighters: [...fighters], range: 'close', lines: [], seen: {}, intents: {} };
}

function pair(mind: Partial<CombatantSetup['attributes']>, foe = {}): PlanFighter[] {
  return initialFighters({
    player: setup('hero', mind),
    allies: [],
    enemies: [setup('foe', foe)],
    canFlee: false,
  });
}

/** The hero sees the foe's Counter react up close `times` times, an exchange apart. */
function watchCounters(fighters: readonly PlanFighter[], times: number): PlanFighter {
  let round = roundOf(fighters);
  for (let n = 1; n <= times; n++) {
    round = beliefsAfter(
      witnessDefence({ ...round, number: n }, 'foe', { band: 'close', defence: 'counter' }),
    );
  }
  return round.fighters.find((f) => f.id === 'hero')!;
}

describe('beliefs from what was seen', () => {
  it('builds a habit from a defence seen again and again', () => {
    const hero = watchCounters(pair({ intellect: 25 }), 4);
    const foe = hero.minds?.foe;
    const counter = held(hero, foe, 4).find((h) => h.key === 'defence:close:counter');
    expect(counter?.sureness).not.toBe('maybe');
    const [stranger, foeOf] = pair({});
    expect(beliefLines(stranger!, foeOf!, 4)).toEqual([]);
    expect(beliefLines(hero, foeOf!, 4)[0]).toMatch(
      /^Keeps a Counter ready up close: (sure|fairly sure)\.$/,
    );
  });

  it('is surer after more sightings', () => {
    const once = watchCounters(pair({ intellect: 25 }), 1);
    const often = watchCounters(pair({ intellect: 25 }), 5);
    const of = (h: PlanFighter, n: number) => held(h, h.minds?.foe, n)[0]?.confidence ?? 0;
    expect(of(often, 5)).toBeGreaterThan(of(once, 1));
  });

  it('a glimpse counts for less than a clear sight', () => {
    const [keen, stealthy] = pair({ perception: 40 }, { perception: 40 });
    const [dim] = pair({ perception: 5 });
    expect(clarity(keen!, stealthy!)).toBe(1);
    expect(clarity(dim!, stealthy!)).toBeLessThan(1);
  });

  it('a dull mind keeps defences and styles, not what a foe can do', () => {
    const [dull, foe] = pair({ intellect: 5 });
    const round = roundOf([dull!, foe!]);
    const seen: Round = {
      ...round,
      witnessed: [
        {
          kind: 'attack',
          of: 'foe',
          card: 'fireball',
          style: 'jutsu',
          shows: ['area'],
          seenBy: ['hero'],
        },
      ],
    };
    const after = beliefsAfter(seen).fighters.find((f) => f.id === 'hero')!;
    const keys = Object.keys(after.minds?.foe ?? {});
    expect(keys).toContain('style:jutsu');
    expect(keys.some((k) => k.startsWith('can:') || k.startsWith('card:'))).toBe(false);
  });

  it('learns nothing from what it did not see', () => {
    const [hero, foe] = pair({ intellect: 40 });
    const seen: Round = {
      ...roundOf([hero!, foe!]),
      witnessed: [{ kind: 'defence', of: 'foe', band: 'close', defence: 'dodge', seenBy: [] }],
    };
    const after = beliefsAfter(seen);
    expect(
      Object.keys(after.fighters[0]?.minds?.foe ?? {}).some((k) => k.startsWith('defence')),
    ).toBe(false);
    expect(after.witnessed).toBeUndefined();
  });

  it('a sharp mind reads a foe running low on chakra', () => {
    const [hero, foe] = pair({ intellect: 40 });
    const drained = { ...foe!, chakra: 5 };
    let round = roundOf([hero!, drained]);
    for (let n = 1; n <= 3; n++) round = beliefsAfter({ ...round, number: n });
    const lines = beliefLines(round.fighters[0]!, drained, 3);
    expect(lines.some((l) => l.startsWith('Running low on chakra'))).toBe(true);
  });
});
