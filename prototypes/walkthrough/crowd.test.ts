import { writeFileSync } from 'node:fs';

import { tracedSkirmish } from '../../src/test/bench/runner';
import { castMember, type CastId } from '../../src/test/bench/matrixCast';

/**
 * Casters against close fighters, as the matrix sets them (chūnin, watched), read move by move:
 * how often each caster wins, how often they back off or switch to something signless
 * (`crowded`), and what they play up close. The bench sets no rules on trial, so this means
 * something only with the close-quarters rules forced on in every fight (the probe on the
 * `combat/adopt` branch).
 */

const OUT = process.env.WALK_OUT ?? '.';
const SEEDS = Number(process.env.SEEDS ?? 100);
const CASTERS: CastId[] = ['trapper', 'medic', 'sensor', 'illusionist', 'sealer'];
const CLOSERS: CastId[] = ['rusher', 'powerhouse', 'gates'];

it('crowd', () => {
  const lines = [
    '| Caster | Against | Won | Crowded turns a fight | Top plays |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const a of CASTERS) {
    for (const b of CLOSERS) {
      let won = 0;
      let crowded = 0;
      const plays = new Map<string, number>();
      for (let seed = 1; seed <= SEEDS; seed++) {
        const fight = tracedSkirmish(
          {
            player: castMember(a, 'chunin'),
            allies: [],
            foes: [castMember(b, 'chunin')],
            watch: true,
          },
          seed,
        );
        if (fight.record.result === 'victory') won += 1;
        for (const d of fight.decisions.filter(
          (x) => x.phase === 'turn' && x.fighterId === 'player',
        )) {
          if (d.why === 'crowded') crowded += 1;
          plays.set(d.card, (plays.get(d.card) ?? 0) + 1);
        }
      }
      const top = [...plays]
        .sort((x, y) => y[1] - x[1])
        .slice(0, 4)
        .map(([c, k]) => `${c} ${k}`);
      lines.push(`| ${a} | ${b} | ${won}% | ${(crowded / SEEDS).toFixed(1)} | ${top.join(', ')} |`);
    }
  }
  writeFileSync(`${OUT}/crowd-${process.env.TAG ?? 'now'}.md`, lines.join('\n'));
  console.warn(lines.join('\n'));
});
