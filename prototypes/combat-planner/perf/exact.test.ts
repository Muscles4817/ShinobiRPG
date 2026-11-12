import { plan } from '../beam';
import { beamPlanner } from './planners';
import { decisionStates } from './states';

/**
 * The exact optimisations must not change a single decision: the perf harness's beam (with and
 * without prefix sharing) against the prototype's own `beam.plan`, on every decision state.
 */
it('prefix sharing gives the prototype beam’s values exactly, for fewer exchanges', () => {
  const states = decisionStates();
  console.log(`${states.length} decision states`);
  const o = { depth: 2, width: 4, rollouts: 16 };
  let same = 0;
  let plain = 0;
  let shared = 0;
  let msPlain = 0;
  let msShared = 0;
  for (const d of states) {
    const proto = plan(d.state, d.selfId, { ...o, ownHurt: 1 });
    const a = beamPlanner({ ...o, share: false })(d.state, d.selfId);
    const b = beamPlanner({ ...o, share: true })(d.state, d.selfId);
    const agrees =
      proto.best.sequence.join() === a.sequence!.join() &&
      a.sequence!.join() === b.sequence!.join() &&
      proto.best.value === a.value &&
      a.value === b.value;
    if (agrees) same++;
    else console.log('DIFFERS', d.id, proto.best, a.sequence, a.value, b.sequence, b.value);
    plain += a.exchanges;
    shared += b.exchanges;
    msPlain += a.ms;
    msShared += b.ms;
  }
  console.log(
    `identical ${same}/${states.length}; exchanges ${plain} → ${shared}; ms/decision ${(msPlain / states.length).toFixed(0)} → ${(msShared / states.length).toFixed(0)}`,
  );
  expect(same).toBe(states.length);
});
