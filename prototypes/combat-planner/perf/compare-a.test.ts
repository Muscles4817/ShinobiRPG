import { APPROACHES } from './approaches';
import { runAndSave } from './compare';

/** Part a of the comparison (parts run side by side): `out/results-a.json`. */
it('compares approaches, part a', () => {
  runAndSave('a', APPROACHES.slice(0, 13));
});
