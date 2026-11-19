import { ELEMENTS } from '@/systems/techniques';

import { splitNarration } from '../../rules/narration';
import { APPROACHES } from '../../rules/tags';
import { tell, type Told } from '../../rules/telling';
import { DODGES, SLIPS, SWAPS } from './defenceLines';
import { BREAKS, HOLDS, MEETS, TAKES } from './wallLines';

/**
 * Every defence has its own words for every way an attack can come, and every wall for every
 * element: a new delivery or element without them fails here.
 */

const LEAST = 3;
const you: Told = { id: 'p', name: 'You', grammar: 'you' };
const named: Told = { id: 'f', name: 'Itachi', grammar: 'he' };

function filled(template: string, t: Told, a: Told): string {
  const line = tell(template, {
    t,
    a,
    what: 'Great Fireball',
    jutsu: 'Substitution',
    wall: 'Mud Wall',
  });
  return splitNarration(line).text;
}

function checkBank(lines: readonly string[]): void {
  expect(lines.length).toBeGreaterThanOrEqual(LEAST);
  expect(new Set(lines).size).toBe(lines.length);
  for (const template of lines) {
    for (const [t, a] of [
      [you, named],
      [named, you],
    ] as const) {
      const text = filled(template, t, a);
      expect(text).not.toMatch(/[{}]/);
      expect(text).not.toMatch(/\d/);
    }
  }
}

describe('defence lines', () => {
  it.each(APPROACHES)('tell a %s dodged, slipped and swapped out of', (came) => {
    checkBank(DODGES[came]);
    checkBank(SLIPS[came]);
    checkBank(SWAPS[came]);
  });

  it.each(ELEMENTS)('tell a wall of %s holding, breaking, spent, and met by it', (element) => {
    checkBank(HOLDS[element]);
    checkBank(BREAKS[element]);
    checkBank(TAKES[element]);
    checkBank(MEETS[element]);
  });
});
