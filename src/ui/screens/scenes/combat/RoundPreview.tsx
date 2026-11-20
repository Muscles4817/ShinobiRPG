import type { CombatView } from '@/game';

/**
 * How the round should go, before it is fought: what your plan plays in each exchange as the fight
 * stands now, which part of the plan chose it and what was passed over (`roundPreview` in the
 * engine). It shows that the order of your cards is a priority, not a sequence.
 */
export function RoundPreview({ view }: { readonly view: CombatView }) {
  const preview = view.preview;
  if (!preview || preview.length === 0) return null;
  return (
    <section className="round-preview" aria-label="How this round should go">
      <h3 className="plan-heading">How this round should go</h3>
      <p className="muted small">
        Each exchange you take one turn: the first of your cards that can work right now. If the
        fight goes as it stands, that is:
      </p>
      <ol className="round-preview-list">
        {preview.map((ex) => (
          <li key={ex.exchange} className="round-preview-slip">
            <span className="round-preview-n">Exchange {ex.exchange}</span>
            <strong className="round-preview-play">{ex.play}</strong>
            <span className="round-preview-from">{ex.from}</span>
            {ex.passedAsBefore && (
              <span className="round-preview-passed">The cards above it wait, as before.</span>
            )}
            {ex.passed?.map((why) => (
              <span key={why} className="round-preview-passed">
                Passed over: {why}
              </span>
            ))}
            {ex.note && <span className="round-preview-note">{ex.note}</span>}
          </li>
        ))}
      </ol>
      <p className="muted small">
        A preview, not a promise: a slip, a daze or their step changes what follows.
      </p>
    </section>
  );
}
