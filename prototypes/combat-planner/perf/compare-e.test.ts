import { APPROACHES } from './approaches';
import { runAndSave } from './compare';

/** Part e: approaches added after the first runs: `out/results-e.json`. */
it('compares approaches, part e', () => {
  runAndSave('e', APPROACHES.slice(24, -1));
});
