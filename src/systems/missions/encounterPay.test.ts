import { stagePay } from './encounterPay';

describe('how getting past foes pays, by job', () => {
  it('an escort that arrives safely is fully paid, however it got there', () => {
    for (const end of ['fought', 'slipped-past', 'talked-down', 'paid-off'] as const) {
      expect(stagePay('escort', end)).toEqual({ ryo: 1, reputation: 1, jobDone: true });
      expect(stagePay('deliver', end).jobDone).toBe(true);
    }
  });

  it('an elimination pays for a fight, never for sneaking past', () => {
    expect(stagePay('eliminate', 'fought')).toEqual({ ryo: 1, reputation: 1, jobDone: true });
    expect(stagePay('eliminate', 'slipped-past')).toEqual({
      ryo: 0,
      reputation: 0,
      jobDone: false,
    });
  });

  it('a negotiated surrender pays more reputation and less ryo; a bribe just less ryo', () => {
    const surrender = stagePay('eliminate', 'talked-down');
    expect(surrender.ryo).toBeLessThan(1);
    expect(surrender.reputation).toBeGreaterThan(1);
    const bought = stagePay('eliminate', 'paid-off');
    expect(bought.ryo).toBeLessThan(1);
    expect(bought.reputation).toBe(1);
  });

  it('a patrol that slips round trouble is paid less', () => {
    expect(stagePay('patrol', 'slipped-past').ryo).toBeLessThan(1);
    expect(stagePay('retrieve', 'slipped-past').ryo).toBe(1);
  });
});
