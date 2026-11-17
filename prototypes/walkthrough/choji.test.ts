import { writeFileSync } from 'node:fs';

import { contextForPack, createVersus, versusRoster } from '@/game';
import { createRng } from '@/core';
import { createPlanEngine, decisionsOf, type CombatState } from '@/systems/combat';
import { decode } from '@/systems/combat/engines/plan/state';

/** Chōji against every genin of the roster, watched: wins, and what he plays. */

const naruto = contextForPack('naruto')!;
const OUT = process.env.WALK_OUT ?? '.';
const SEEDS = Number(process.env.SEEDS ?? 6);

it('choji', () => {
  const foes = versusRoster(naruto).filter(
    (f) => f.id.startsWith('person:') && f.group === 'Genin' && f.id !== 'person:choji',
  );
  let n = 0;
  let won = 0;
  const plays = new Map<string, number>();
  for (const f of foes) {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const made = createVersus(naruto, {
        side: ['person:choji'],
        foes: [f.id],
        seed,
        watch: true,
      });
      if (!made.ok || !made.value.combat) continue;
      const start = decode(made.value.combat);
      const engine = createPlanEngine();
      const rng = createRng(seed);
      let state: CombatState = { ...made.value.combat, data: { ...start, decisions: [] } };
      for (let i = 0; i < 120 && !engine.outcome(state); i++) {
        const next = engine.act(state, { optionId: 'next' }, rng);
        if (!next.ok) break;
        state = next.value;
      }
      n += 1;
      if (engine.outcome(state)?.result === 'victory') won += 1;
      for (const d of decisionsOf(state).filter(
        (x) => x.phase === 'turn' && x.fighterId === 'player',
      ))
        plays.set(d.card, (plays.get(d.card) ?? 0) + 1);
    }
  }
  const top = [...plays]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([c, k]) => `${c} ${k}`);
  const report = `${n} bouts, Chōji won ${((100 * won) / n).toFixed(1)}%\n${top.join('\n')}`;
  writeFileSync(`${OUT}/choji-${process.env.TAG ?? 'now'}.md`, report);
  console.warn(report);
});
