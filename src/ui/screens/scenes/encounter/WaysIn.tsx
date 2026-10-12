import { useState } from 'react';

import type { ApproachCard, EncounterScene, GameAction, RangeBand } from '@/game';

interface Props {
  readonly scene: EncounterScene;
  readonly perform: (action: GameAction) => void;
}

/** The ways to scout before committing: each says its odds, what it costs, or why not. */
export function ScoutFirst({ scene, perform }: Props) {
  return (
    <section className="scout" aria-label="Scout first">
      <h2 className="label">Scout first</h2>
      <p className="label">
        {scene.reconLeft > 0
          ? `You can risk ${scene.reconLeft === 1 ? 'one more look' : `${scene.reconLeft} more looks`} before they’d surely notice.`
          : 'You’ve looked all you can without being seen.'}
      </p>
      <div className="scout-grid">
        {scene.recon.map((r) => (
          <button
            key={r.id}
            type="button"
            className="scout-card"
            disabled={r.blocker !== null}
            onClick={() => {
              perform(r.action);
            }}
          >
            <b>{r.label}</b>
            <small>{r.odds}</small>
            <span className="chip cost">{r.cost}</span>
            {r.blocker && <small className="blocker">{r.blocker}</small>}
          </button>
        ))}
      </div>
    </section>
  );
}

const SPECIAL = (a: ApproachCard) => a.id !== 'head-on' && a.id !== 'withdraw';

/** The ways in besides head-on and withdraw, with a starting distance for those that choose one. */
export function WaysIn({ scene, perform }: Props) {
  const [range, setRange] = useState<RangeBand>('close');
  const ways = scene.approaches.filter(SPECIAL);
  const ranged = ways.some((a) => a.needsRange && a.blocker === null);
  if (ways.length === 0) return null;
  return (
    <section className="ways" aria-label="Ways in">
      <h2 className="label">Ways in</h2>
      {ranged && (
        <div className="range-pick" role="group" aria-label="Strike from">
          <span className="label">Strike from</span>
          {scene.ranges.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={range === r.id}
              onClick={() => {
                setRange(r.id);
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
      {ways.map((a) => (
        <button
          key={a.id}
          type="button"
          className="way"
          disabled={a.blocker !== null}
          onClick={() => {
            perform(a.needsRange ? { ...a.action, range } : a.action);
          }}
        >
          <span className="way-head">
            <b>{a.label}</b>
            <small>{a.detail}</small>
          </span>
          {a.pay && <small className="way-pay">{a.pay}</small>}
          {a.blocker && <small className="blocker">{a.blocker}</small>}
        </button>
      ))}
    </section>
  );
}
