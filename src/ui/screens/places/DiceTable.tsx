import { useState } from 'react';

import type { DiceTableView, GameAction } from '@/game';

interface DiceTableProps {
  readonly view: DiceTableView;
  readonly perform: (action: GameAction) => void;
}

/**
 * Chō-han at the back table: the last cup's dice, what you heard as the next one settled,
 * the stake you'll put down, and a call of even or odd.
 */
export function DiceTable({ view, perform }: DiceTableProps) {
  const [picked, setPicked] = useState(0);
  const stake = view.stakes[Math.min(picked, view.stakes.length - 1)];
  if (!stake) return null;
  const blocker = stake.bets.find((b) => b.blocker !== null)?.blocker ?? null;
  return (
    <div className="dice-table">
      {view.last && (
        <div className="dice-last" aria-label="The last cup">
          <span className="dice-faces">
            {view.last.faces.map((face, i) => (
              <DieFace key={i} face={face} />
            ))}
          </span>
          <b>{view.last.came}</b>
          {view.last.won > 0 ? (
            <span className="chip gain">+{view.last.won} ryo</span>
          ) : (
            <span className="chip cost">−{view.last.stake} ryo</span>
          )}
        </div>
      )}
      {view.heard && <p className="dice-heard">{view.heard}</p>}
      <div className="dice-stakes" role="radiogroup" aria-label="Stake">
        {view.stakes.map((s, i) => (
          <button
            key={s.stake}
            type="button"
            role="radio"
            aria-checked={s === stake}
            className={s === stake ? 'dice-stake on' : 'dice-stake'}
            onClick={() => {
              setPicked(i);
            }}
          >
            {s.stake} ryo
          </button>
        ))}
      </div>
      <div className="dice-calls">
        {stake.bets.map((bet) => (
          <button
            key={bet.call}
            type="button"
            className="btn primary dice-call"
            disabled={bet.blocker !== null}
            onClick={() => {
              perform(bet.action);
            }}
          >
            <b>{bet.name}</b>
            <small>{bet.meaning}</small>
          </button>
        ))}
      </div>
      {blocker && <small className="blocker">{blocker}</small>}
      <p className="dice-rules">
        <span className="chip gain">Win +{stake.win} ryo</span>
        <span className="dice-rounds" aria-label={`${view.roundsLeft} rounds left tonight`}>
          {Array.from({ length: view.roundsPerNight }, (_, i) => (
            <span key={i} className={i < view.roundsLeft ? 'pip on' : 'pip'} />
          ))}
        </span>
      </p>
    </div>
  );
}

/** Where the pips sit on a face, in a three-by-three grid. */
const PIPS: Readonly<Record<number, readonly (readonly [number, number])[]>> = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [2, 0],
    [0, 2],
    [2, 2],
  ],
  5: [
    [0, 0],
    [2, 0],
    [1, 1],
    [0, 2],
    [2, 2],
  ],
  6: [
    [0, 0],
    [2, 0],
    [0, 1],
    [2, 1],
    [0, 2],
    [2, 2],
  ],
};

function DieFace({ face }: { readonly face: number }) {
  return (
    <svg className="die" viewBox="0 0 30 30" role="img" aria-label={`a ${face}`}>
      <rect x="1" y="1" width="28" height="28" rx="4" />
      {(PIPS[face] ?? []).map(([col, row]) => (
        <circle key={`${col}${row}`} cx={7 + col * 8} cy={7 + row * 8} r="2.6" />
      ))}
    </svg>
  );
}
