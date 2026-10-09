import { createStats } from '@/systems/stats';

import { adjustVitals, fullVitals, maxHealth, passTime, sleepRecovery } from './vitals';

const stats = createStats(5);

describe('vitals', () => {
  it('clamps meters to their ranges', () => {
    const v = adjustVitals(fullVitals(stats), { health: 1000, energy: -1000 }, stats);
    expect(v.health).toBe(maxHealth(stats));
    expect(v.energy).toBe(0);
  });

  it('gets hungrier as time passes', () => {
    const v = passTime({ ...fullVitals(stats), satiety: 50 }, 2, stats);
    expect(v.satiety).toBe(40);
  });

  it('drains health when starving', () => {
    const start = { ...fullVitals(stats), satiety: 0 };
    expect(passTime(start, 2, stats).health).toBeLessThan(start.health);
  });

  it('recovers less overnight when hungry', () => {
    const fed = sleepRecovery({ ...fullVitals(stats), satiety: 80 }, stats);
    const hungry = sleepRecovery({ ...fullVitals(stats), satiety: 5 }, stats);
    expect(fed.health ?? 0).toBeGreaterThan(hungry.health ?? 0);
  });
});
