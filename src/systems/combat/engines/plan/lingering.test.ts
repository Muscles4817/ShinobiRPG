import { createRng } from '@/core';
import type { TechniqueEffect } from '@/systems/techniques';

import { SLIPS } from '@/test/fightLines';

import type { CombatantSetup, CombatTechnique, RangeBand } from '../../contract';
import { useJutsu } from './jutsu';
import { lingerAfter, lingeringStatuses } from './lingering';
import { react } from './react';
import { fighterIn, initialFighters, plainSlots, type PlanFighter, type Round } from './state';

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

function technique(effects: readonly TechniqueEffect[]): CombatTechnique {
  return { id: 'move', name: 'Move', discipline: 'taijutsu', effects, chakraCost: 2 };
}

function setup(id: string): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 50,
    maxChakra: 50,
    techniques: [],
  };
}

function roundAt(range: RangeBand = 'close', slots: readonly string[] = []): Round {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('bandit')],
    canFlee: true,
  }).map((f): PlanFighter =>
    f.id === 'bandit' ? { ...f, loadout: { close: plainSlots(slots), mid: [], far: [] } } : f,
  );
  return { number: 1, fighters, range, lines: [], seen: {}, intents: {} };
}

/** Uses the technique with each seed until it lands (the bandit doesn't see it coming). */
function landed(round: Round, t: CombatTechnique, lands: (after: Round) => boolean): Round {
  for (let seed = 1; seed < 100; seed++) {
    const [actor, target] = round.fighters;
    const after = useJutsu(round, { actor: actor!, target, rng: createRng(seed) }, t);
    if (lands(after)) return after;
  }
  throw new Error('it never landed');
}

const bandit = (round: Round) => fighterIn(round, 'bandit')!;

describe('verbs that leave something behind, in plan & watch', () => {
  it('a throw sends the target away, a pull drags them in', () => {
    const shove = technique([
      { verb: 'damage', power: 6 },
      { verb: 'knock', power: 6, to: 'far' },
    ]);
    expect(landed(roundAt('close'), shove, (r) => r.range === 'far').lines.join(' ')).toMatch(
      /thrown back to far range/,
    );
    const pull = technique([{ verb: 'knock', power: 6, to: 'close' }]);
    expect(landed(roundAt('far'), pull, (r) => r.range === 'close').lines.join(' ')).toMatch(
      /dragged in close/,
    );
  });

  it('a pin holds for a few exchanges, and shows on the fight screen', () => {
    const hold = technique([{ verb: 'pin', power: 12 }]);
    let round = landed(roundAt(), hold, (r) => (bandit(r).pinned ?? 0) > 0);
    expect(lingeringStatuses(bandit(round))).toContain('Pinned');
    for (let n = 0; n < 3; n++) round = lingerAfter(round, round.number + n);
    expect(bandit(round).pinned).toBeUndefined();
  });

  it('a pinned fighter slips blows less often', () => {
    const slips = (pinned: boolean) => {
      let n = 0;
      for (let seed = 1; seed <= 300; seed++) {
        const round = roundAt('close', ['dodge']);
        const fighters = round.fighters.map((f) =>
          f.id === 'bandit' && pinned ? { ...f, pinned: 2 } : f,
        );
        const [hero, target] = fighters;
        const blow = {
          raw: 10,
          what: 'strike',
          dodgeable: true,
          physical: true,
          kind: 'blow' as const,
        };
        const after = react(
          { ...round, fighters },
          { attacker: hero!, target: target!, blow, rng: createRng(seed) },
        );
        if (after.lines.some((l) => SLIPS.test(l))) n++;
      }
      return n;
    };
    expect(slips(true)).toBeLessThan(slips(false));
  });

  it('a leech drains chakra and some flows back to its user', () => {
    const leech = technique([{ verb: 'drain', power: 10, absorb: true }]);
    const start = roundAt();
    const hero = start.fighters[0]!;
    const spent = {
      ...start,
      fighters: start.fighters.map((f) => (f.isPlayer ? { ...f, chakra: 20 } : f)),
    };
    const after = landed(spent, leech, (r) => bandit(r).chakra < 50);
    expect(bandit(after).chakra).toBeLessThan(50);
    expect(fighterIn(after, hero.id)!.chakra).toBeGreaterThan(20 - leech.chakraCost);
  });

  it('a burn lingers for a few exchanges and then goes out', () => {
    const fire = technique([{ verb: 'afflict', power: 10, harm: 'burn' }]);
    let round = landed(roundAt(), fire, (r) => (bandit(r).afflictions ?? []).length > 0);
    expect(lingeringStatuses(bandit(round))).toContain('Burning');
    const before = bandit(round).health;
    round = lingerAfter(round, 1);
    expect(bandit(round).health).toBeLessThan(before);
    round = lingerAfter(lingerAfter(round, 2), 3);
    expect(bandit(round).afflictions).toBeUndefined();
  });

  it('bleeds stack; a poison saps strength and speed until it wears off', () => {
    const cut = technique([{ verb: 'afflict', power: 8, harm: 'bleed' }]);
    let round = landed(roundAt(), cut, (r) => (bandit(r).afflictions ?? []).length > 0);
    round = landed(round, cut, (r) => (bandit(r).afflictions ?? []).length > 1);
    expect(bandit(round).afflictions).toHaveLength(2);

    const needle = technique([{ verb: 'afflict', power: 8, harm: 'poison' }]);
    let poisoned = landed(roundAt(), needle, (r) => bandit(r).sapped !== undefined);
    expect(bandit(poisoned).attributes.speed).toBeLessThan(10);
    for (let n = 1; n <= 3; n++) poisoned = lingerAfter(poisoned, n);
    expect(bandit(poisoned).sapped).toBeUndefined();
    expect(bandit(poisoned).attributes.speed).toBe(10);
  });

  it('a readied riposte answers the next blow before it lands, once', () => {
    const stance = technique([{ verb: 'counter', power: 12 }]);
    const start = roundAt();
    const [hero, foe] = start.fighters;
    const ready = useJutsu(start, { actor: hero!, target: foe, rng: createRng(1) }, stance);
    expect(lingeringStatuses(fighterIn(ready, hero!.id)!)).toContain('Ready to answer');
    const blow = {
      raw: 10,
      what: 'strike',
      dodgeable: false,
      physical: true,
      kind: 'blow' as const,
    };
    const struck = react(ready, {
      attacker: bandit(ready),
      target: fighterIn(ready, hero!.id)!,
      blow,
      rng: createRng(2),
    });
    expect(struck.lines.join(' ')).toMatch(/hero answers with Move/);
    expect(bandit(struck).health).toBeLessThan(100);
    expect(fighterIn(struck, hero!.id)!.riposte).toBeUndefined();
  });
});
