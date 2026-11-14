import { fightWith } from './fight';
import { burst, duel, fighter, flash, spark } from './scenarios';

/** Experiment 3, closed loop: the planner with its evaluation varied (env: ROLLOUTS, DEPTH, HORIZON, LABEL). */
it('closed-loop daze scenario, fights to the end', () => {
  const env = (k: string, d: number) => Number(process.env[k] ?? d);
  const search = {
    depth: env('DEPTH', 2),
    width: 4,
    rollouts: env('ROLLOUTS', 16),
    horizon: env('HORIZON', 2),
    ownHurt: 1,
  };
  const fights = env('FIGHTS', 20);
  let won = 0,
    taken = 0,
    dealt = 0,
    ms = 0,
    decisions = 0;
  const first = new Map<string, number>();
  const plays = new Map<string, number>();
  for (let seed = 1; seed <= fights; seed++) {
    const r = fightWith(
      duel(fighter('me', [spark, flash, burst], { stats: { taijutsu: 8 } }), fighter('foe', [])),
      'me',
      { seed, cap: 30, search },
    );
    won += r.won ? 1 : 0;
    taken += r.taken;
    dealt += r.dealt;
    ms += r.planMs;
    decisions += r.chose.length;
    first.set(r.chose[0]!, (first.get(r.chose[0]!) ?? 0) + 1);
    for (const c of r.chose) plays.set(c, (plays.get(c) ?? 0) + 1);
  }
  console.log(
    `RESULT ${process.env.LABEL}: ${JSON.stringify(search)} won ${won}/${fights}, dealt ${(dealt / fights).toFixed(0)}, taken ${(taken / fights).toFixed(0)}, ${(ms / decisions).toFixed(0)} ms/decision, first ${JSON.stringify([...first])}, plays ${JSON.stringify([...plays].sort((a, b) => b[1] - a[1]))}`,
  );
});
