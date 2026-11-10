import { useState } from 'react';

import {
  puppetCard,
  type GameAction,
  type GameContext,
  type GameState,
  type PuppetRow,
} from '@/game';

import { BenchPanel, type Rebuilding } from './BenchPanel';

interface Props {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: (action: GameAction) => void;
}

/** A puppet's name, given anew. */
function Rename({ row, perform }: { readonly row: PuppetRow; readonly perform: Props['perform'] }) {
  const [name, setName] = useState(row.name);
  return (
    <form
      className="puppet-rename"
      onSubmit={(e) => {
        e.preventDefault();
        perform({ type: 'renamePuppet', puppetId: row.puppetId, name });
      }}
    >
      <label>
        Name
        <input
          value={name}
          maxLength={24}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </label>
      <button type="submit" className="btn ghost small" disabled={name.trim() === row.name}>
        Rename
      </button>
    </form>
  );
}

/** One puppet: its condition, why it stays home, and mending, rebuilding and naming it. */
function PuppetRowView({
  row,
  perform,
  onRebuild,
}: {
  readonly row: PuppetRow;
  readonly perform: Props['perform'];
  readonly onRebuild: (r: Rebuilding) => void;
}) {
  const { mend, sheet } = row;
  return (
    <article className="puppet-row">
      <h3>{row.name}</h3>
      <p className="muted small">{row.description}</p>
      <div className="hive-fill">
        <span className="badge">{row.state}</span>
        <span className="hp meter">
          <i style={{ width: `${row.condition * 100}%` }} />
        </span>
      </div>
      {row.staysHome && <p className="muted small">{row.staysHome}</p>}
      {mend && (
        <>
          <button
            type="button"
            className="btn ghost"
            disabled={mend.blocker !== null}
            onClick={() => {
              perform(mend.action);
            }}
          >
            Mend at the bench ({mend.cost} ryo)
          </button>
          {mend.blocker && <p className="muted small">{mend.blocker}</p>}
        </>
      )}
      {sheet && (
        <>
          <Rename row={row} perform={perform} />
          <button
            type="button"
            className="btn ghost small"
            onClick={() => {
              onRebuild({ puppetId: row.puppetId, name: row.name, ...sheet });
            }}
          >
            Rebuild
          </button>
        </>
      )}
    </article>
  );
}

/**
 * Your puppets and your bench: your craft in words, each puppet's condition, whether it comes to
 * fights, mending, rebuilding and naming, and the bench for a new build. Nothing shows until you
 * know the art or own a puppet.
 */
export function PuppetCard({ ctx, state, perform }: Props) {
  const [rebuilding, setRebuilding] = useState<Rebuilding | null>(null);
  const card = puppetCard(state, ctx);
  if (!card) return null;
  return (
    <section className="contract-card hive-card paper-sheet" aria-label="Your puppets">
      <h2>Your puppets</h2>
      <p className="muted small">{card.craft} at the bench.</p>
      {card.puppets.map((p) => (
        <PuppetRowView key={p.puppetId} row={p} perform={perform} onRebuild={setRebuilding} />
      ))}
      <BenchPanel
        key={rebuilding?.puppetId ?? 'new'}
        ctx={ctx}
        state={state}
        perform={perform}
        rebuilding={rebuilding}
        onDone={() => {
          setRebuilding(null);
        }}
      />
    </section>
  );
}
