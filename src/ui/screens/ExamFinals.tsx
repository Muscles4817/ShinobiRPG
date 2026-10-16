import type { ExamFinalsView, GameAction } from '@/game';

interface ExamFinalsProps {
  readonly view: ExamFinalsView;
  readonly perform: (action: GameAction) => void;
}

/** The exam for those not sitting it: who told you it is coming, and the finals to watch. */
export function ExamFinals({ view, perform }: ExamFinalsProps) {
  const { watch } = view;
  return (
    <section className="sensei-slip exam-finals" aria-label={view.name}>
      <div className="slip-head">
        <h2>{view.name}</h2>
        <span className="badge">{view.when}</span>
      </div>
      {view.word && <p className="slip-today">{view.word.text}</p>}
      {watch && (
        <div className="slip-row">
          <button
            type="button"
            className="btn small"
            disabled={watch.blocker !== null}
            onClick={() => {
              perform(watch.action);
            }}
          >
            Go and watch the finals
          </button>
          {watch.blocker && <p className="slip-note">{watch.blocker}</p>}
        </div>
      )}
    </section>
  );
}
