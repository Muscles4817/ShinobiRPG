import { writeFileSync } from 'node:fs';

import { contextForPack, createVersus, versusRoster } from '@/game';
import { createRng } from '@/core';
import { createPlanEngine, type CombatState } from '@/systems/combat';

/**
 * The teleport on trial: Minato and Tobirama, each against every jōnin and Kage of the roster,
 * watched, with the rule off and on. Win rates, and how often a blink is told.
 */

const naruto = contextForPack('naruto')!;
const OUT = process.env.WALK_OUT ?? '.';
const SEEDS = Number(process.env.SEEDS ?? 4);

function bout(side: string, foe: string, seed: number, teleport: boolean) {
  const made = createVersus(naruto, { side: [side], foes: [foe], seed, watch: true, teleport });
  if (!made.ok || !made.value.combat) return null;
  const engine = createPlanEngine();
  const rng = createRng(seed);
  let state: CombatState = made.value.combat;
  for (let n = 0; n < 120 && !engine.outcome(state); n++) {
    const next = engine.act(state, { optionId: 'next' }, rng);
    if (!next.ok) break;
    state = next.value;
  }
  const blinks = engine.view(state).log.filter((l) => l.includes('vanish')).length;
  return { won: engine.outcome(state)?.result === 'victory', blinks };
}

it('teleport', () => {
  const roster = versusRoster(naruto);
  const foes = roster.filter(
    (f) => f.id.startsWith('person:') && /Jōnin|Kage|Sannin|Akatsuki/i.test(f.group),
  );
  const lines: string[] = ['| Fighter | Rule | Bouts | Won | Blinks a bout |', '| --- | --- | --- | --- | --- |'];
  for (const me of ['person:minato', 'person:tobirama']) {
    for (const on of [false, true]) {
      let n = 0;
      let won = 0;
      let blinks = 0;
      for (const f of foes) {
        if (f.id === me) continue;
        for (let s = 1; s <= SEEDS; s++) {
          const r = bout(me, f.id, s, on);
          if (!r) continue;
          n += 1;
          won += r.won ? 1 : 0;
          blinks += r.blinks;
        }
      }
      lines.push(`| ${me} | ${on ? 'on' : 'off'} | ${n} | ${((100 * won) / n).toFixed(1)}% | ${(blinks / n).toFixed(2)} |`);
    }
  }
  writeFileSync(`${OUT}/teleport.md`, lines.join('\n'));
  console.warn(lines.join('\n'));
});
