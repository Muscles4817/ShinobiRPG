import { APPROACHES } from './approaches';
import { runAndSave } from './compare';

/** Part d: the offline decision table (its training runs first): `out/results-d.json`. */
it('compares approaches, part d', () => {
  runAndSave('d', APPROACHES.slice(-1));
});
