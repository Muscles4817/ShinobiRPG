import { useState } from 'react';

import type { ForgeView } from '@/game';

import { TechniqueCard } from '../../components/TechniqueCard';
import { TechniqueSheet } from '../../components/TechniqueSheet';

/**
 * The made technique as the game will show and fight with it: its card, its sheet read in the
 * hands of a fighter of its rank, what stands in the way of keeping it and what a fight will
 * make of it. Keeping it, dropping it and letting changes go are here, beside what they keep.
 */

export interface ForgeActions {
  /** Null when there is nothing new to keep. */
  readonly onKeep: (() => void) | null;
  /** Null for a technique not kept yet. */
  readonly onDrop: (() => void) | null;
  /** Null when nothing has changed since it was kept. */
  readonly onDiscard: (() => void) | null;
  /** Who has been given it, for the drop's question. */
  readonly givenTo: readonly string[];
}

function DropButton({
  name,
  givenTo,
  onDrop,
}: {
  name: string;
  givenTo: readonly string[];
  onDrop: () => void;
}) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button
        type="button"
        className="btn ghost"
        onClick={() => {
          setAsking(true);
        }}
      >
        Drop this technique
      </button>
    );
  }
  const who = givenTo.length > 0 ? ` ${givenTo.join(', ')} will lose it too.` : '';
  return (
    <div className="menu-confirm" role="group" aria-label="Drop this technique?">
      <p>
        Drop {name} for good?{who}
      </p>
      <div className="row-buttons">
        <button type="button" className="btn danger" onClick={onDrop}>
          Drop {name}
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setAsking(false);
          }}
        >
          Keep it
        </button>
      </div>
    </div>
  );
}

export function ForgePreview({
  view,
  actions,
}: {
  readonly view: ForgeView;
  readonly actions: ForgeActions;
}) {
  const ready = view.problems.length === 0;
  return (
    <section className="forge-preview" aria-label="How the game reads it">
      <h3>As the game reads it</h3>
      <TechniqueCard
        name={view.name}
        detail={view.hands}
        discipline={view.discipline}
        rank={view.rank}
        stamp="Made"
      />
      <TechniqueSheet sheet={view.sheet} hands={view.hands} />
      {view.problems.length > 0 && (
        <div className="forge-problems" role="status">
          <h4>Before it can be kept</h4>
          <ul>
            {view.problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      {view.notes.length > 0 && (
        <div className="forge-notes">
          <h4>Worth knowing</h4>
          <ul>
            {view.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="forge-actions">
        <button
          type="button"
          className="btn primary"
          disabled={!ready || !actions.onKeep}
          onClick={actions.onKeep ?? undefined}
        >
          Keep technique
        </button>
        {!ready && <p className="muted">{view.problems[0]}</p>}
        {ready && !actions.onKeep && <p className="muted">Kept as it stands.</p>}
        {actions.onDiscard && (
          <button type="button" className="btn ghost" onClick={actions.onDiscard}>
            Let the changes go
          </button>
        )}
        {actions.onDrop && (
          <DropButton name={view.name} givenTo={actions.givenTo} onDrop={actions.onDrop} />
        )}
      </div>
    </section>
  );
}
