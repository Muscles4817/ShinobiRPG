import type { CombatAttributes, CombatTechnique } from '../contract';
import { drivenAttributes, handsOnThreads, threadsHeld, threadsSlip } from './puppets';

/** Puppets are driven by their master: the frame's body, the master's skill and mind. */

function line(value: number, over: Partial<CombatAttributes> = {}): CombatAttributes {
  return {
    strength: value,
    speed: value,
    stamina: value,
    chakraControl: value,
    intellect: value,
    perception: value,
    willpower: value,
    taijutsu: value,
    ninjutsu: value,
    genjutsu: value,
    kenjutsu: value,
    fuuinjutsu: value,
    ...over,
  };
}

function technique(over: Partial<CombatTechnique>): CombatTechnique {
  return { id: 't', name: 'T', discipline: 'ninjutsu', effects: [], chakraCost: 5, ...over };
}

describe('a driven puppet', () => {
  it('keeps its own frame, and works its arts and speed only as far as the threads allow', () => {
    const frame = line(10, { strength: 30, kenjutsu: 30, speed: 30, ninjutsu: 4 });
    const master = line(5, { chakraControl: 16, intellect: 28, perception: 22 });
    const driven = drivenAttributes(frame, master);
    expect(driven.strength).toBe(30);
    expect(driven.kenjutsu).toBe(16);
    expect(driven.speed).toBe(16);
    // An art it was never built for stays as low as it was built.
    expect(driven.ninjutsu).toBe(4);
    expect(driven.intellect).toBe(28);
    expect(driven.perception).toBe(22);
  });

  it('lets a master of the threads bring out all a human puppet kept', () => {
    const frame = line(16, { ninjutsu: 44 });
    expect(drivenAttributes(frame, line(44)).ninjutsu).toBe(44);
  });
});

describe('a master’s attention', () => {
  it('works more puppets at once the finer their chakra control', () => {
    expect(threadsHeld(line(16))).toBe(1);
    expect(threadsHeld(line(23))).toBe(2);
    expect(threadsHeld(line(32))).toBe(3);
    expect(threadsHeld(line(44))).toBe(4);
  });

  it('leaves the hands on the threads: no hand signs but the scrolls and the threads', () => {
    expect(handsOnThreads(technique({ discipline: 'ninjutsu' }))).toBe(false);
    expect(handsOnThreads(technique({ discipline: 'genjutsu' }))).toBe(false);
    expect(handsOnThreads(technique({ discipline: 'kenjutsu' }))).toBe(true);
    const unseal = technique({ effects: [{ verb: 'summon', power: 1, call: 'crow' }] });
    const threads = technique({ effects: [{ verb: 'pin', power: 14, channelled: true }] });
    expect(handsOnThreads(unseal)).toBe(true);
    expect(handsOnThreads(threads)).toBe(true);
  });

  it('slips under a hit that takes a quarter of the master’s health', () => {
    expect(threadsSlip(25, 100)).toBe(true);
    expect(threadsSlip(20, 100)).toBe(false);
  });
});
