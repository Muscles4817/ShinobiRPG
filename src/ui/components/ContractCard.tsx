import { useState } from 'react';

import {
  contractCard,
  type Choice,
  type GameAction,
  type GameContext,
  type GameState,
} from '@/game';

import { BondMeter } from './BondMeter';

interface ContractCardProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: (action: GameAction) => void;
}

function ChoiceButton({
  label,
  choice,
  perform,
}: {
  readonly label: string;
  readonly choice: Choice;
  readonly perform: (action: GameAction) => void;
}) {
  return (
    <button
      type="button"
      className="btn ghost"
      disabled={choice.blocker !== null}
      title={choice.blocker ?? undefined}
      onClick={() => {
        perform(choice.action);
      }}
    >
      {label}
    </button>
  );
}

/** Breaking takes two taps: the clan won't take your name again. */
function BreakContract({
  name,
  choice,
  perform,
}: {
  readonly name: string;
  readonly choice: Choice;
  readonly perform: (action: GameAction) => void;
}) {
  const [asked, setAsked] = useState(false);
  if (!asked) {
    return (
      <button
        type="button"
        className="btn ghost"
        disabled={choice.blocker !== null}
        onClick={() => {
          setAsked(true);
        }}
      >
        Break the contract
      </button>
    );
  }
  return (
    <div className="break-ask">
      <p className="small">{name} won’t take your name again. You will be free to sign another.</p>
      <div className="row-buttons">
        <ChoiceButton label="Tear it up" choice={choice} perform={perform} />
        <button
          type="button"
          className="btn"
          onClick={() => {
            setAsked(false);
          }}
        >
          Keep it
        </button>
      </div>
    </div>
  );
}

/**
 * Your summoning contract: the clan, your standing with it, each summon, whether it answers you
 * now and what it asks; the offerings it likes, and a way to break it. Nothing shows until you
 * have signed one.
 */
export function ContractCard({ ctx, state, perform }: ContractCardProps) {
  const card = contractCard(state, ctx);
  if (!card) return null;
  const blockers = [
    ...new Set(card.offerings.flatMap((o) => (o.blocker === null ? [] : [o.blocker]))),
  ];
  return (
    <section className="contract-card paper-sheet" aria-label="Summoning contract">
      <h2>{card.name}</h2>
      <p className="muted small">{card.description}</p>
      <BondMeter stageName={card.standing} progress={card.progress} />
      <ul className="summons">
        {card.summons.map((s) => (
          <li key={s.name} className={s.answers ? 'summon answers' : 'summon'}>
            <b>{s.name}</b> <span className="badge">{s.grade}</span>
            <p className="small">{s.description}</p>
            <p className="muted small">{s.note}</p>
          </li>
        ))}
      </ul>
      {card.offerings.length > 0 && (
        <div className="offerings">
          <h3>Leave an offering</h3>
          <div className="row-buttons">
            {card.offerings.map((o) => (
              <ChoiceButton key={o.name} label={o.name} choice={o} perform={perform} />
            ))}
          </div>
          {blockers.map((b) => (
            <p key={b} className="muted small">
              {b}
            </p>
          ))}
        </div>
      )}
      <BreakContract name={card.name} choice={card.breakIt} perform={perform} />
    </section>
  );
}
