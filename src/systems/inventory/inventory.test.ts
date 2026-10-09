import {
  addGear,
  EMPTY_INVENTORY,
  equip,
  hasAll,
  owns,
  pantryCount,
  stock,
  unequip,
  useUp,
} from './inventory';

describe('inventory', () => {
  it('owns gear once and equips one piece per slot', () => {
    const inv = addGear(addGear(EMPTY_INVENTORY, 'tanto'), 'tanto');
    expect(inv.gear).toEqual(['tanto']);
    expect(owns(inv, 'tanto')).toBe(true);
    const armed = equip(equip(inv, 'weapon', 'tanto'), 'weapon', 'katana');
    expect(armed.equipped).toEqual({ weapon: 'katana' });
    expect(unequip(armed, 'weapon').equipped).toEqual({});
  });

  it('stocks the pantry and uses ingredients up', () => {
    const inv = stock(stock(EMPTY_INVENTORY, 'rice', 2), 'fish');
    expect(hasAll(inv, [{ id: 'rice', count: 2 }])).toBe(true);
    const cooked = useUp(inv, [
      { id: 'rice', count: 2 },
      { id: 'fish', count: 1 },
    ]);
    if (!cooked.ok) throw new Error(cooked.error);
    expect(cooked.value.pantry).toEqual({});
    expect(pantryCount(cooked.value, 'rice')).toBe(0);
    expect(useUp(inv, [{ id: 'rice', count: 3 }]).ok).toBe(false);
  });
});
