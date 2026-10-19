import { useState } from 'react';

import {
  hiveCard,
  type Choice,
  type GameAction,
  type GameContext,
  type GameState,
  type HiveCard as Card,
} from '@/game';

interface HiveCardProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: (action: GameAction) => void;
}

function Act({
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

/** Wild insects in jars at home: study them, then cross them in. */
function Jars({
  card,
  perform,
}: {
  readonly card: Card;
  readonly perform: HiveCardProps['perform'];
}) {
  if (card.jars.length === 0) return null;
  return (
    <div className="hive-jars">
      <h3>Jars</h3>
      <ul>
        {card.jars.map((jar) => (
          <li key={jar.strainId}>
            <b>{jar.name}</b>
            <p className="muted small">{jar.stability ?? 'Not understood yet.'}</p>
            <div className="row-buttons">
              {!jar.known && <Act label="Study" choice={jar.study} perform={perform} />}
              {jar.known && <Act label="Cross in" choice={jar.cross} perform={perform} />}
            </div>
            {(jar.known ? jar.cross : jar.study).blocker && (
              <p className="muted small">{(jar.known ? jar.cross : jar.study).blocker}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A strain you bred is yours to name. */
function NameIt({
  current,
  perform,
}: {
  readonly current: string;
  readonly perform: HiveCardProps['perform'];
}) {
  const [name, setName] = useState(current);
  return (
    <form
      className="hive-name"
      onSubmit={(e) => {
        e.preventDefault();
        perform({ type: 'nameStrain', name });
      }}
    >
      <label>
        Their name
        <input
          value={name}
          maxLength={24}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </label>
      <button type="submit" className="btn ghost" disabled={name.trim() === '' || name === current}>
        Name them
      </button>
    </form>
  );
}

/**
 * The hive in your body: its strain, what it took of your chakra, what its insects can do, how
 * full it is and how soon it fills again; the jars waiting at home and any brood breeding.
 * Nothing shows without one.
 */
export function HiveCard({ ctx, state, perform }: HiveCardProps) {
  const card = hiveCard(state, ctx);
  if (!card) return null;
  return (
    <section className="contract-card hive-card paper-sheet" aria-label="Your hive">
      <h2>{card.strain}</h2>
      <p className="muted small">{card.description}</p>
      <p className="small">{card.share}</p>
      {card.gifts.length > 0 && <p className="small">{card.gifts.join('. ')}.</p>}
      <ul className="hive-qualities">
        {card.qualities.map((q) => (
          <li key={q.name}>
            {q.name} <span className="badge">{q.grade}</span>
          </li>
        ))}
      </ul>
      {card.fears.length > 0 && (
        <p className="muted small">Can’t stand {card.fears.join(' or ').toLowerCase()}.</p>
      )}
      <div className="hive-fill">
        <span className="badge">{card.state}</span>
        <span className="hp meter">
          <i style={{ width: `${card.fill * 100}%` }} />
        </span>
      </div>
      <p className="muted small">{card.breeding}</p>
      {card.brood && <p className="small">{card.brood}</p>}
      {card.nameable && <NameIt key={card.strain} current={card.strain} perform={perform} />}
      <Jars card={card} perform={perform} />
    </section>
  );
}
