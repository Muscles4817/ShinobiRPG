import { tryCombination } from './experiment';
import { amountAt, beatsLanded, buffAt, qualityOf, rightSteps, usualQuality } from './stove';

describe('the stove', () => {
  it('takes the method’s steps, with the recipe’s own changes', () => {
    expect(rightSteps('fry')).toEqual({ cut: 'fine', heat: 'fierce', finish: 'early' });
    expect(rightSteps('fry', { heat: 'gentle' })).toEqual({
      cut: 'fine',
      heat: 'gentle',
      finish: 'early',
    });
  });

  it('counts the beats that land, and skill nudges the quality a step', () => {
    const right = rightSteps('simmer');
    expect(beatsLanded(right, { ...right, heat: 'fierce' })).toEqual(['cut', 'finish']);
    expect(qualityOf(3, 0)).toBe('fine');
    expect(qualityOf(2, 0)).toBe('good');
    expect(qualityOf(0, 0)).toBe('burnt');
    expect(qualityOf(0, 2)).toBe('plain');
    expect(qualityOf(3, -1)).toBe('good');
    expect(usualQuality(false)).toBe('plain');
    expect(usualQuality(true)).toBe('good');
  });

  it('scales what a dish does by its quality', () => {
    const buff = { training: 1.1, injuryNights: 1, checks: { perception: 1.2 } };
    expect(buffAt(buff, 'good')).toEqual(buff);
    expect(buffAt(buff, 'burnt')).toEqual({});
    const plain = buffAt(buff, 'plain');
    expect(plain.training).toBeCloseTo(1.06);
    expect(plain.injuryNights).toBeUndefined();
    expect(buffAt(buff, 'fine').checks?.perception).toBeCloseTo(1.28);
    expect(amountAt(40, 'burnt', true)).toBe(20);
    expect(amountAt(40, 'fine', true)).toBe(40);
    expect(amountAt(20, 'fine')).toBe(28);
    expect(amountAt(20, 'burnt')).toBe(0);
  });
});

describe('experimenting', () => {
  const dishes = [
    { id: 'congee', slots: [['rice'], ['tofu']] },
    { id: 'stew', slots: [['radish'], ['miso'], ['tofu']] },
    { id: 'grilled', slots: [['char', 'trout'], ['salt']] },
  ];

  it('the same set as an unknown dish finds it, whatever the order', () => {
    expect(tryCombination(['tofu', 'rice'], dishes)).toEqual({ kind: 'found', recipeId: 'congee' });
  });

  it('otherwise says how close it came', () => {
    expect(tryCombination(['miso', 'tofu'], dishes)).toEqual({ kind: 'close' });
    expect(tryCombination(['miso', 'tofu', 'eggs'], dishes)).toEqual({ kind: 'warm' });
    expect(tryCombination(['eggs', 'fish'], dishes)).toEqual({ kind: 'nothing' });
  });

  it('a slot that takes any fish of a kind is filled by any one of them, but only once', () => {
    expect(tryCombination(['salt', 'trout'], dishes)).toEqual({
      kind: 'found',
      recipeId: 'grilled',
    });
    expect(tryCombination(['char', 'salt'], dishes)).toEqual({
      kind: 'found',
      recipeId: 'grilled',
    });
    expect(tryCombination(['char', 'trout'], dishes)).not.toEqual(
      expect.objectContaining({ kind: 'found' }),
    );
  });
});
