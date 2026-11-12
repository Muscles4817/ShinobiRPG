import { daze, hide } from '../perf/states';
import { cast, teamFight } from './fixtures';
import { fight } from './loop';
import { LADDER, PERF_GOAP } from './mind';

/** A quick check that the loop runs, before the long experiments. */
it('runs', () => {
  for (const [name, make] of [
    ['daze', daze],
    ['hide', hide],
  ] as const) {
    for (const policy of ['default', 'exchange', 'round'] as const) {
      const out = fight(make(), [{ id: 'me', policy, params: PERF_GOAP }], { seed: 1, cap: 8 });
      const t = out.tallies.me!;
      console.log(
        name,
        policy,
        out.result,
        out.health,
        t.plans,
        t.ms.toFixed(0),
        t.chose.join(' '),
        JSON.stringify(t.invalid),
      );
    }
  }
  const s = teamFight(
    [cast('rusher'), cast('versatile')],
    [cast('powerhouse'), cast('illusionist')],
  );
  console.log(s.fighters.map((f) => `${f.id}:${f.side}:int${f.attributes.intellect}`).join(' '));
  const out = fight(
    s,
    s.fighters.map((f) => ({ id: f.id, policy: 'round' as const, params: LADDER.C })),
    { seed: 1, cap: 12 },
  );
  for (const [id, t] of Object.entries(out.tallies))
    console.log(
      id,
      t.plans,
      t.ms.toFixed(0),
      t.exchanges,
      t.chose.join(' '),
      JSON.stringify(t.invalid),
    );
  console.log(out.result, out.rounds);
});
