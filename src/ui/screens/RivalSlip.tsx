import type { GameAction, RivalChallengeView } from '@/game';

import { Portrait } from '../art/Portrait';

interface RivalSlipProps {
  readonly view: RivalChallengeView;
  readonly perform: (action: GameAction) => void;
}

/** A challenge from your rival, standing above the village until you answer or it lapses. */
export function RivalSlip({ view, perform }: RivalSlipProps) {
  const { face, spars } = view;
  return (
    <section className="rival-slip" aria-label={`${face.name}’s challenge`}>
      <div className="rival-slip-top">
        <span className="person-photo rival">
          <Portrait appearance={face.appearance} size={44} framing="face" />
        </span>
        <span>
          <b>{face.name}’s challenge</b>
          <small>A spar, today or tomorrow</small>
        </span>
        <span
          className="rival-score"
          aria-label={`Spars: you ${spars.you}, ${face.name} ${spars.them}`}
        >
          <small>Spars</small>
          <b>
            {spars.you}–{spars.them}
          </b>
        </span>
      </div>
      <p>{view.line}</p>
      <div className="rival-slip-acts">
        <button
          type="button"
          className="btn"
          disabled={view.accept.blocker !== null}
          onClick={() => {
            perform(view.accept.action);
          }}
        >
          Take them on
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            perform(view.decline.action);
          }}
        >
          Not today
        </button>
      </div>
      {view.accept.blocker && <small className="rival-slip-why">{view.accept.blocker}</small>}
    </section>
  );
}
