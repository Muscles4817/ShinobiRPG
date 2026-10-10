import { createRng } from '@/core';

import type { CombatantSetup, CombatItem, CombatItemEffect, CombatTrait } from '../contract';
import { bodyFrom, type Body } from './body';
import { blastDamage, itemBlocker, itemsLeft, revealOnAttack, useItem } from './items';

const tool = (effect: CombatItemEffect, count = 2): CombatItem => ({
  id: effect,
  name: effect,
  effect,
  count,
});

function fighter(id: string, over: Partial<CombatantSetup> = {}): Body {
  const five = 5;
  return bodyFrom(
    {
      id,
      name: id,
      attributes: {
        strength: five,
        speed: five,
        stamina: five,
        chakraControl: five,
        intellect: five,
        perception: five,
        willpower: five,
        taijutsu: five,
        ninjutsu: five,
        genjutsu: five,
        kenjutsu: five,
        fuuinjutsu: five,
      },
      health: 50,
      maxHealth: 60,
      chakra: 10,
      maxChakra: 40,
      techniques: [],
      ...over,
    },
    'player',
    true,
  );
}

const foe = (traits: CombatTrait[] = []): Body => ({
  ...fighter('foe', { traits }),
  side: 'enemy',
  isPlayer: false,
});

describe('fight tools', () => {
  it('say why they would be wasted', () => {
    const full = { ...fighter('me'), health: 60, chakra: 40 };
    expect(itemBlocker(full, tool('heal'), [])).toBe('You are unhurt.');
    expect(itemBlocker(full, tool('chakra'), [])).toBe('Your chakra is full.');
    expect(itemBlocker(full, tool('clarity'), [])).toBe('Your head is clear.');
    expect(itemBlocker(full, tool('flash'), [foe()])).toBe('No one is hiding.');
    expect(itemBlocker(full, tool('flash'), [foe(['illusionist'])])).toBeNull();
    expect(itemBlocker(full, { ...tool('blast'), count: 0 }, [foe()])).toBe('No blast left.');
  });

  it('are spent when used, and the pouch reports what is left', () => {
    const me = fighter('me', { items: [tool('heal'), tool('smoke', 1)] });
    const used = useItem({ user: me, item: tool('heal'), foes: [] }, createRng(1));
    expect(used.user.health).toBe(60);
    expect(itemsLeft(used.user)).toEqual({ heal: 1, smoke: 1 });
  });

  it('smoke hides you until you attack; illusionists stay hidden', () => {
    const me = fighter('me', { items: [tool('smoke')] });
    const hidden = useItem({ user: me, item: tool('smoke'), foes: [] }, createRng(1)).user;
    expect(hidden.hidden).toBe(true);
    expect(revealOnAttack(hidden).hidden).toBe(false);
    expect(revealOnAttack(foe(['illusionist'])).hidden).toBe(true);
  });

  it('a flash reveals every hidden foe', () => {
    const me = fighter('me', { items: [tool('flash')] });
    const used = useItem(
      { user: me, item: tool('flash'), foes: [foe(['illusionist'])] },
      createRng(1),
    );
    expect(used.foes.every((f) => !f.hidden)).toBe(true);
  });

  it('a blast ignores armour and tears into spirits', () => {
    expect(blastDamage(foe(['armoured']), 0.5)).toBe(blastDamage(foe(), 0.5));
    expect(blastDamage(foe(['spirit']), 0.5)).toBeGreaterThan(blastDamage(foe(), 0.5));
    const me = fighter('me', { items: [tool('blast')] });
    const used = useItem(
      { user: me, item: tool('blast'), foes: [foe()], targetId: 'foe' },
      createRng(1),
    );
    expect(used.foes[0]!.health).toBeLessThan(50);
  });
});
