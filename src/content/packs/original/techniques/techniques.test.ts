import { DISCIPLINES } from '@/systems/techniques';

import { ORIGINAL_PACK } from '../index';

/** The content target (progression plan, "Techniques, agreed"): general techniques per art. */
const TARGET = { E: 2, D: 3, C: 4, B: 3, A: 2, S: 1 } as const;

describe('the original pack’s techniques', () => {
  const general = ORIGINAL_PACK.techniques.filter((t) => t.clan === undefined);

  it.each(DISCIPLINES)('fill every rank of %s to the content target', (discipline) => {
    for (const [rank, count] of Object.entries(TARGET)) {
      const found = general.filter((t) => t.discipline === discipline && t.rank === rank);
      expect(found.length, `${discipline} rank ${rank}`).toBeGreaterThanOrEqual(count);
    }
  });

  it('make every S-rank technique a trump card with a price', () => {
    const top = ORIGINAL_PACK.techniques.filter((t) => t.rank === 'S');
    expect(top.length).toBeGreaterThan(0);
    for (const t of top) {
      expect(t.oncePerFight, t.id).toBe(true);
      expect(t.afterCost, t.id).toBeDefined();
    }
  });

  it('give set-ups a payoff: killing blows and a finisher for an open foe', () => {
    const lethal = ORIGINAL_PACK.techniques.filter((t) => t.lethal).map((t) => t.id);
    expect(lethal).toEqual(
      expect.arrayContaining(['last-moth', 'quenching-thrust', 'pinched-flame']),
    );
    const open = ORIGINAL_PACK.techniques.filter((t) => t.needsTarget === 'open');
    expect(open.map((t) => t.id)).toContain('lantern-fall');
  });

  it('light the Seven Wicks, and keep an art that needs them lit', () => {
    const wicks = ORIGINAL_PACK.techniques.flatMap((t) =>
      t.effects.flatMap((e) =>
        e.verb === 'empower' && e.opens?.ladder === 'wicks' ? [e.opens.step] : [],
      ),
    );
    expect(wicks.sort((a, b) => a - b)).toEqual([3, 6, 7]);
    expect(ORIGINAL_PACK.techniques.some((t) => t.needsOpen?.ladder === 'wicks')).toBe(true);
  });
});
