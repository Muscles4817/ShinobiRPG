import { answers, signed, standingAfter, standingStage } from './contracts';

describe('contracts', () => {
  it('starts as strangers to the clan, so only its smallest answer', () => {
    const contract = signed('toads', 3);
    expect(standingStage(contract)).toBe(0);
    expect(answers(contract, 0)).toBe(true);
    expect(answers(contract, 2)).toBe(false);
  });

  it('rises when its summons are kept to the end, and falls when they are beaten', () => {
    const contract = signed('toads', 3);
    const kept = standingAfter(contract, ['stayed', 'stayed', 'stayed', 'stayed']);
    expect(kept.standing).toBeGreaterThan(contract.standing);
    expect(standingAfter(kept, ['fell']).standing).toBeLessThan(kept.standing);
    expect(standingAfter(contract, ['fell']).standing).toBe(0);
  });
});
