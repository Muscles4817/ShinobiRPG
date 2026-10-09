import { deduct, earn, spend } from './wallet';

describe('wallet', () => {
  it('earns and spends', () => {
    const w = earn({ ryo: 10 }, 15);
    expect(w.ryo).toBe(25);
    const spent = spend(w, 20);
    expect(spent.ok && spent.value.ryo).toBe(5);
  });

  it('refuses to overspend', () => {
    expect(spend({ ryo: 5 }, 6).ok).toBe(false);
  });

  it('deducts without going negative', () => {
    expect(deduct({ ryo: 5 }, 50).ryo).toBe(0);
  });
});
