import type { GameAction, SparOption } from '@/game';

import { Avatar } from '../../components/Faces';
import { ThreatChip } from '../../components/ThreatChip';

/** Partners shown before the rest fold away. */
const SHOWN_PARTNERS = 3;

interface TeamCornerProps {
  readonly sparring: readonly SparOption[];
  readonly perform: (action: GameAction) => void;
}

interface SparRowProps {
  readonly option: SparOption;
  readonly perform: TeamCornerProps['perform'];
}

function SparRow({ option: s, perform }: SparRowProps) {
  return (
    <div className="spar-row">
      <Avatar face={s.person} size={36} />
      <span className="bond-main">
        <b>{s.person.name}</b>
        <small>{s.blocker ?? s.where}</small>
        {s.read && <ThreatChip threat={s.read.threat} label={s.read.threatLabel} />}
        {s.read?.traits.map((t) => (
          <span key={t.trait} className="chip" title={t.counter}>
            {t.label}
          </span>
        ))}
      </span>
      {s.specialty && <span className={`badge d-${s.specialty.id}`}>{s.specialty.label}</span>}
      <button
        type="button"
        className="btn small"
        disabled={s.blocker !== null}
        onClick={() => {
          perform(s.action);
        }}
      >
        Spar
      </button>
    </div>
  );
}

/** Who you could spar with at the training ground. */
export function TeamCorner({ sparring, perform }: TeamCornerProps) {
  const shown = sparring.slice(0, SHOWN_PARTNERS);
  const folded = sparring.slice(SHOWN_PARTNERS);
  return (
    <>
      {sparring.length > 0 && (
        <section className="sparring" aria-label="Sparring">
          <h2 className="label">Spar with someone around</h2>
          {shown.map((s) => (
            <SparRow key={s.person.id} option={s} perform={perform} />
          ))}
          {folded.length > 0 && (
            <details className="fold">
              <summary className="label">{folded.length} more training here</summary>
              {folded.map((s) => (
                <SparRow key={s.person.id} option={s} perform={perform} />
              ))}
            </details>
          )}
        </section>
      )}
    </>
  );
}
