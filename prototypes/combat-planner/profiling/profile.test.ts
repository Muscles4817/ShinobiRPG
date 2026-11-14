import { plan } from '../beam';
import { blade, burst, duel, fighter, flash, spark, veil } from '../scenarios';

/** One run of live-sized decisions, for a CPU profile (see the README's profiling section). */
it('decides, for the profiler', () => {
  const scenarios = [
    duel(fighter('me', [spark, flash, burst], { stats: { taijutsu: 8 } }), fighter('foe', [])),
    duel(
      fighter('me', [spark, veil, blade], { stats: { taijutsu: 8, genjutsu: 28 } }),
      fighter('foe', [spark], { stats: { stamina: 28 } }),
    ),
  ];
  let ms = 0;
  let n = 0;
  for (let i = 0; i < 5; i++) {
    for (const s of scenarios) {
      const p = plan(s, 'me', { depth: 2, width: 4, rollouts: 16, ownHurt: 1 });
      ms += p.ms;
      n++;
      if (i === 0) console.log('exchanges simulated (estimate)', p.exchanges);
    }
  }
  console.log('ms a decision', (ms / n).toFixed(0));
});
