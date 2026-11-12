import { CAUSE_LABEL } from '@/game/views/combatLog';

/**
 * Every miss in the golden fights says why (audit P1.1): a [Missed] stamp always comes with a
 * cause stamp beside it.
 */

const GOLDENS: Readonly<Record<string, string>> = import.meta.glob(
  ['./goldens/fights.txt', './goldens/missions.txt'],
  { query: '?raw', import: 'default', eager: true },
);
const CAUSES = Object.values(CAUSE_LABEL).map((label) => `[${label}]`);

describe('causes in the golden transcripts', () => {
  for (const [file, text] of Object.entries(GOLDENS)) {
    it(`every miss in ${file} carries its cause`, () => {
      const misses = text.split('\n').filter((l) => l.includes('[Missed]'));
      const bare = misses.filter((l) => !CAUSES.some((c) => l.includes(c)));
      expect(misses.length).toBeGreaterThan(0);
      expect(bare).toEqual([]);
    });
  }
});
