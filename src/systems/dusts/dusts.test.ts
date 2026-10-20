import { fullStore, gathered, storeAfterFight, storeCap } from './dusts';

/** A dust store between fights: its cap, what a fight leaves, and what a day gathers back. */
describe('dust stores', () => {
  it('holds more with more chakra, and starts full', () => {
    expect(storeCap(60)).toBeGreaterThan(storeCap(30));
    expect(fullStore('ash', 50).count).toBe(storeCap(50));
  });

  it('keeps what came back from a fight, within the cap', () => {
    const store = fullStore('ash', 50);
    expect(storeAfterFight(store, 12, 100).count).toBe(12);
    expect(storeAfterFight(store, 500, 100).count).toBe(100);
  });

  it('gathers drawable dust back, faster at home; carried dust never comes back alone', () => {
    const thin = { dustId: 'sand', count: 0 };
    const home = gathered(thin, 100, { atHome: true, drawable: true }).count;
    const away = gathered(thin, 100, { atHome: false, drawable: true }).count;
    expect(home).toBeGreaterThan(away);
    expect(away).toBeGreaterThan(0);
    expect(gathered(thin, 100, { atHome: true, drawable: false }).count).toBe(0);
    expect(
      gathered({ dustId: 'sand', count: 100 }, 100, { atHome: true, drawable: true }).count,
    ).toBe(100);
  });
});
