import { APPROACHES } from './approaches';
import { runAndSave } from './compare';

/** Part b of the comparison (parts run side by side): `out/results-b.json`. */
it('compares approaches, part b', () => {
  runAndSave('b', APPROACHES.slice(13, 24));
});
