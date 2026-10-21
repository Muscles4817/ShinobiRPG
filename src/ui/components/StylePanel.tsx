import type { Choice, GameAction, JutsuCard, StyleView } from '@/game';

/**
 * Your style on the Jutsu tab: the moves your strike plays from in a fight, with bare hands and
 * with a weapon in hand, and whether you chose them or the fight keeps your best.
 */
export function StylePanel({
  style,
  perform,
}: {
  readonly style: StyleView;
  readonly perform: (action: GameAction) => void;
}) {
  return (
    <section className="style-panel paper-sheet" aria-label="Your style">
      <h2>Your style</h2>
      {style.groups.map((g) => (
        <div key={g.art} className="style-group">
          <p className="story">
            {g.moves.length > 0
              ? `${g.lead} you throw ${g.movesText}, whichever suits the moment.`
              : `${g.lead} you strike plainly: put a move in your style to throw it instead.`}
          </p>
          <p className="muted small">
            {g.moves.length} of {g.room} moves at your {g.art} grade.
          </p>
        </div>
      ))}
      <p className="muted small">
        {style.chosen
          ? 'You chose these.'
          : 'Your best are kept for you. Pick a move to choose your own.'}
      </p>
      {style.chosen && <ChoiceButton label="Keep my best" choice={style.reset} perform={perform} />}
    </section>
  );
}

/** On a body move's detail: put it in your style or take it out, and why not when you can't. */
export function StyleToggle({
  card,
  perform,
}: {
  readonly card: JutsuCard;
  readonly perform: (action: GameAction) => void;
}) {
  if (!card.style) return null;
  const label = card.style.inStyle ? 'Take out of your style' : 'Add to your style';
  return <ChoiceButton label={label} choice={card.style.choice} perform={perform} />;
}

export function ChoiceButton({
  label,
  choice,
  perform,
}: {
  readonly label: string;
  readonly choice: Choice;
  readonly perform: (action: GameAction) => void;
}) {
  return (
    <div className="style-choice">
      <button
        type="button"
        className="btn ghost"
        disabled={choice.blocker !== null}
        onClick={() => {
          perform(choice.action);
        }}
      >
        {label}
      </button>
      {choice.blocker && <p className="blocker">{choice.blocker}</p>}
    </div>
  );
}
