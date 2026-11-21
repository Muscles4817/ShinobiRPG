import type { CombatantSetup, CombatTechnique, RangeBand } from '../../contract';
import { afterBlink, blinkInstead, blinksReady, withTeleports } from './blink';
import { distanceBetween } from './distance';
import { initialFighters, type PlanFighter, type Round } from './state';

/** The teleport (`blink.ts`). */

const base: CombatantSetup['attributes'] = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 20,
  intellect: 20,
  perception: 20,
  willpower: 20,
  taijutsu: 20,
  ninjutsu: 20,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const blast: CombatTechnique = {
  id: 'blast',
  name: 'Blast',
  discipline: 'ninjutsu',
  rank: 'B',
  effects: [{ verb: 'damage', power: 20 }],
  chakraCost: 20,
};

function fighters(teleport: boolean): readonly PlanFighter[] {
  const setup = (id: string, perks: CombatantSetup['perks'] = []): CombatantSetup => ({
    id,
    name: id,
    attributes: base,
    health: 100,
    maxHealth: 100,
    chakra: 80,
    maxChakra: 80,
    techniques: [blast],
    perks,
  });
  const all = initialFighters({
    player: setup('hero', teleport ? ['teleport'] : []),
    allies: [],
    enemies: [setup('foe')],
    canFlee: false,
  });
  return withTeleports(all);
}

function at(fs: readonly PlanFighter[], band: RangeBand): Round {
  return { number: 1, fighters: [...fs], range: band, lines: [], seen: {}, intents: {} };
}

const hero = (r: Round) => r.fighters.find((f) => f.id === 'hero')!;
const stepIn = { kind: 'step', direction: 'in' } as const;

describe('the teleport', () => {
  it('turns a step into a blink only for a fighter with the perk', () => {
    expect(blinkInstead(at(fighters(false), 'mid'), hero(at(fighters(false), 'mid')), stepIn)).toBe(
      null,
    );
    const round = at(fighters(true), 'mid');
    const blinked = blinkInstead(round, hero(round), stepIn)!;
    expect(distanceBetween(blinked, 'hero', 'foe')).toBe('close');
    expect(blinked.lines.some((l) => l.includes('vanish'))).toBe(true);
  });

  it('goes straight to the distance a fighter keeps, however far', () => {
    const round = at(
      fighters(true).map((f) => (f.id === 'hero' ? { ...f, keepAt: 'close' as const } : f)),
      'far',
    );
    const blinked = blinkInstead(round, hero(round), stepIn)!;
    expect(distanceBetween(blinked, 'hero', 'foe')).toBe('close');
  });

  it('leaves anything that isn’t footwork alone', () => {
    const round = at(fighters(true), 'mid');
    expect(blinkInstead(round, hero(round), { kind: 'jutsu', technique: blast })).toBe(null);
  });

  it('works once a round, and is ready again as the next opens', () => {
    const round = at(fighters(true), 'mid');
    const blinked = blinkInstead(round, hero(round), stepIn)!;
    const spent = afterBlink(blinked, hero(round));
    expect(blinkInstead(blinked, spent, { kind: 'step', direction: 'back' })).toBe(null);
    expect(blinksReady(blinked.fighters, false).find((f) => f.id === 'hero')?.blinked).toBe(true);
    const fresh = blinksReady(blinked.fighters, true).find((f) => f.id === 'hero')!;
    expect(blinkInstead(blinked, fresh, { kind: 'step', direction: 'back' })).not.toBe(null);
  });
});
