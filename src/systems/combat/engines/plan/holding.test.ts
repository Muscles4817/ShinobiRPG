import type { CombatantSetup } from '../../contract';
import { breakHold, keepHolding, startHolding } from './holding';
import { readyDefences } from './readiness';
import { initialFighters, type PlanFighter, type Round } from './state';
import { wound } from './wound';

/** A channelled hold: the caster's turns go on it, they can't defend, and hurting them breaks it. */

function setup(id: string): CombatantSetup {
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
      kenjutsu: 20,
      fuuinjutsu: 20,
    },
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
  };
}

function held(): Round {
  const fighters = initialFighters({
    player: setup('caster'),
    allies: [],
    enemies: [setup('caught')],
    canFlee: true,
  }).map((f): PlanFighter =>
    f.id === 'caught'
      ? { ...f, pinned: 2, sealed: 2 }
      : { ...f, reactions: { close: 'dodge', mid: 'dodge', far: 'dodge' } },
  );
  const round = { number: 1, fighters, range: 'mid' as const, lines: [], seen: {}, intents: {} };
  return startHolding(round, 'caster', 'caught');
}

const who = (r: Round, id: string) => r.fighters.find((f) => f.id === id)!;

describe('channelled holds', () => {
  it('spend the holder’s turn while the target is caught', () => {
    const r = held();
    const kept = keepHolding(r, who(r, 'caster'));
    expect(kept.spent).toBe(true);
    expect(kept.round.lines.at(-1)).toMatch(/caster holds caught fast/i);
  });

  it('leave the holder no hands for a defence', () => {
    const r = held();
    expect(readyDefences(who(r, 'caster'), r)).toEqual([]);
  });

  it('break when the holder is hurt, freeing the target of the hold and its seal', () => {
    const hurt = wound(held(), 'caster', 10);
    expect(who(hurt, 'caster').holding).toBeUndefined();
    expect(who(hurt, 'caught').pinned).toBeUndefined();
    expect(who(hurt, 'caught').sealed).toBe(0);
    expect(hurt.lines.at(-1)).toMatch(/hold breaks/);
  });

  it('let go when there is nothing left to hold', () => {
    const r = breakHold(held(), 'caster');
    const kept = keepHolding(r, who(r, 'caster'));
    expect(kept.spent).toBe(false);
  });
});
