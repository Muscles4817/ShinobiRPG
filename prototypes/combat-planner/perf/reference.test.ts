import { buildReference, saveReferences } from './reference';
import { decisionStates } from './states';

/** Builds the reference (slow: a few minutes) into `out/reference.json`. Run once. */
it('builds the reference', () => {
  const refs = decisionStates().map((d) => {
    const r = buildReference(d);
    console.log(
      `${r.id}: ${r.firsts} first × ${r.actions} cards, best ${r.bestSequence.join(' > ')} (${r.q[r.best]!.toFixed(1)}), ${r.exchanges} exchanges, ${(r.ms / 1000).toFixed(1)} s`,
    );
    return r;
  });
  saveReferences(refs);
});
