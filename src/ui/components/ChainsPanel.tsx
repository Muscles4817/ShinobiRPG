import { useState } from 'react';

import {
  chainDraft,
  type ChainsView,
  type GameAction,
  type GameContext,
  type GameState,
} from '@/game';

import { ChoiceButton } from './StylePanel';

/**
 * Your chains on the Jutsu tab: the ones your strike may open, and a builder that tells you,
 * before you keep a chain, whether each move follows the last.
 */
export function ChainsPanel({
  chains,
  ctx,
  state,
  perform,
}: {
  readonly chains: ChainsView;
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: (action: GameAction) => void;
}) {
  return (
    <section className="style-panel chains-panel paper-sheet" aria-label="Your chains">
      <h2>Your chains</h2>
      {chains.locked ? (
        <p className="story">
          Chains come at grade C in taijutsu, or in kenjutsu for a weapon’s forms: your moves thrown
          back to back in one turn, each only if the one before it landed.
        </p>
      ) : (
        <>
          <p className="story">
            A chain throws your moves back to back in one turn, each only if the one before it
            landed. A daze, a pin or a throw sets up the next.
          </p>
          <ul className="chain-list">
            {chains.chains.map((c, i) => (
              <li key={`${c.text}-${i}`}>
                <span>{c.text}</span>
                <ChoiceButton label="Drop" choice={c.drop} perform={perform} />
              </li>
            ))}
          </ul>
          {chains.chosen ? (
            <ChoiceButton label="Build them for me" choice={chains.reset} perform={perform} />
          ) : (
            <p className="muted small">Built for you from what you know. Build your own below.</p>
          )}
          <ChainBuilder chains={chains} ctx={ctx} state={state} perform={perform} />
        </>
      )}
    </section>
  );
}

function ChainBuilder({
  chains,
  ctx,
  state,
  perform,
}: {
  readonly chains: ChainsView;
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: (action: GameAction) => void;
}) {
  const [links, setLinks] = useState<readonly string[]>([]);
  const draft = chainDraft(state, ctx, links);
  const full = links.length >= chains.length;
  return (
    <div className="chain-builder">
      <h3>Build a chain</h3>
      <div className="chain-moves" role="group" aria-label="Moves for a chain">
        {chains.moves.map((m) => (
          <button
            key={m.id}
            type="button"
            className="btn ghost"
            disabled={full || links.includes(m.id)}
            onClick={() => {
              setLinks([...links, m.id]);
            }}
          >
            {m.name}
          </button>
        ))}
      </div>
      {links.length > 0 && (
        <>
          <p className="story">{draft.text}</p>
          <div className="row-buttons">
            <ChoiceButton
              label="Keep this chain"
              choice={draft.keep}
              perform={(action) => {
                perform(action);
                setLinks([]);
              }}
            />
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setLinks([]);
              }}
            >
              Start again
            </button>
          </div>
        </>
      )}
    </div>
  );
}
