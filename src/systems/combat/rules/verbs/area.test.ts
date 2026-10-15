import { afterBlast, AREA_RULES } from './area';
import { blinds, raiseField } from './field';

const watcher = (side: 'player' | 'enemy') => ({
  side,
  perks: [],
  attributes: {
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
  },
});

describe('area techniques by size', () => {
  it('wider is harder to slip, and only a small one is blunted by a plain Guard', () => {
    expect(AREA_RULES.small).toMatchObject({ dodge: 1, guardHolds: true });
    expect(AREA_RULES.wide.dodge).toBeLessThan(1);
    expect(AREA_RULES.wide.guardHolds).toBe(false);
    expect(AREA_RULES.vast).toMatchObject({ dodge: 0, guardHolds: false, dust: true });
  });

  it('a wide blast throws a close fight apart to mid, a vast one to far', () => {
    expect(afterBlast('close', 'small')).toBe('close');
    expect(afterBlast('close', 'wide')).toBe('mid');
    expect(afterBlast('far', 'wide')).toBe('far');
    expect(afterBlast('close', 'vast')).toBe('far');
  });

  it('dust blinds its maker’s side too, unlike mist', () => {
    const dust = raiseField({ id: 'dust', side: 'player', potency: 30 }, 1);
    const mist = raiseField({ id: 'mist', side: 'player', potency: 30 }, 1);
    expect(blinds(dust, watcher('player'))).toBe(true);
    expect(blinds(dust, watcher('enemy'))).toBe(true);
    expect(blinds(mist, watcher('player'))).toBe(false);
  });
});
