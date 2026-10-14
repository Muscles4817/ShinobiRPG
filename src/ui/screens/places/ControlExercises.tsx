import type { ExerciseCard, GameAction } from '@/game';

interface ExercisesProps {
  readonly exercises: readonly ExerciseCard[];
  readonly perform: (action: GameAction) => void;
}

/**
 * Chakra control exercises on a training page: each as a plaque with how far up the tree (or
 * out over the water) you've got, and a session to try again.
 */
export function ControlExercises({ exercises, perform }: ExercisesProps) {
  if (exercises.length === 0) return null;
  return (
    <section className="exercises" aria-label="Chakra control">
      <h2>Chakra control</h2>
      {exercises.map((e) => (
        <article key={e.id} className="exercise" aria-label={e.name}>
          <h3>{e.name}</h3>
          <p className="muted small">{e.description}</p>
          <span className="budget-bar control" aria-label={e.mastered ? 'Mastered' : 'Progress'}>
            <i style={{ width: `${e.mastered ? 100 : e.progress}%` }} />
          </span>
          {e.mastered ? (
            <p className="exercise-done">Mastered</p>
          ) : (
            <>
              <button
                type="button"
                className="btn small"
                disabled={e.blocker !== null}
                onClick={() => {
                  perform(e.action);
                }}
              >
                Practise ({e.energyCost} energy)
              </button>
              {e.blocker && <p className="muted small">{e.blocker}</p>}
            </>
          )}
        </article>
      ))}
    </section>
  );
}
