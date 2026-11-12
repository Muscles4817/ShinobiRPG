import { decisionStates } from '../perf/states';
import { mean, quantile } from './fixtures';
import { LADDER_V2, plan } from './mind';

/**
 * What a decision costs outside the exchanges it simulates (candidate listing, priors, beliefs,
 * GOAP chains): the same plans with no rollouts, after a warm-up, on the 42 decision states.
 */
it('measures the fixed cost of a decision', () => {
  const states = decisionStates();
  for (let pass = 0; pass < 3; pass++) {
    for (const g of ['E', 'C', 'S'] as const) {
      const params = { ...LADDER_V2[g], rollouts: 0 };
      const ms: number[] = [];
      for (const d of states)
        ms.push(
          plan({ state: d.state, selfId: d.selfId, params, expertise: true, fightSeed: 7 }).ms,
        );
      console.log(
        `pass ${pass} ${g}: fixed cost median ${quantile(ms, 0.5).toFixed(2)} ms, mean ${mean(ms).toFixed(2)}, p95 ${quantile(ms, 0.95).toFixed(2)}`,
      );
    }
  }
});
