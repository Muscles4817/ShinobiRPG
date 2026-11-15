import { ORIGINAL_FOE_KIT } from '@/content/packs/original/bestiaryKit';
import { bestiary } from '@/content/shared/bestiary';
import { ctx } from '@/test/gameFixtures';

import { SCALE_OF } from '../../src/test/bench/bestiaryFights';
import { CAST_IDS } from '../../src/test/bench/matrixCast';
import { bestiarySides, castSide, compare, HEADER, row, teams } from './wide';

/**
 * Thinking foes against today's, beyond one against one at chūnin (`docs/design/research/
 * planner-foes.md`): the cast at genin and jōnin, teams of two and three at chūnin, and the
 * bestiary at the scale each foe's danger means. Each line is enough fights to read a few points.
 */

const which = process.env.WIDE ?? 'all';

it('wide', () => {
  const lines = [...HEADER];
  const out = (l: string) => {
    lines.push(l);
    console.warn(l);
  };
  if (which === 'all' || which === 'grades') {
    for (const scale of ['genin', 'jonin'] as const) {
      const fights = CAST_IDS.flatMap((a) =>
        CAST_IDS.map((b) => ({
          side: castSide([a], scale, 'p'),
          foes: castSide([b], scale, 'foe'),
        })),
      );
      out(row(`one against one, ${scale}`, compare(fights, [1])));
    }
  }
  if (which === 'all' || which === 'teams') {
    for (const size of [2, 3]) {
      const sides = teams(CAST_IDS, size, 120, size * 31);
      const foes = teams(CAST_IDS, size, 120, size * 97);
      const fights = sides.map((s, i) => ({
        side: castSide(s, 'chunin', 'p'),
        foes: castSide(foes[i]!, 'chunin', 'foe'),
      }));
      out(row(`${size} against ${size}, chūnin`, compare(fights, [1, 2])));
    }
  }
  if (which === 'all' || which === 'bestiary') {
    const defs = bestiary(ORIGINAL_FOE_KIT).map((e) => ctx.content.enemies.require(e.id));
    const fights = defs.flatMap((def) => bestiarySides(def, SCALE_OF[def.danger]));
    out(row('bestiary, each at its own scale', compare(fights, [1, 2])));
  }
  console.warn(lines.join('\n'));
});
