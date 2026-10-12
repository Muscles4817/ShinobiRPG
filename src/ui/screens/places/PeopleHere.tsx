import type { GameAction, PricePart, TeacherOffer, TeachStat } from '@/game';

import { Portrait } from '../../art/Portrait';
import { GradeBadge } from '../../components/Grade';

type Perform = (action: GameAction) => void;

/** Teachers shown before the rest fold away. */
const SHOWN_TEACHERS = 3;

/** One stat they could train with you: their grade over yours, tapped to train. */
function StatButton({ stat, perform }: { stat: TeachStat; perform: Perform }) {
  return (
    <button
      type="button"
      className={`teach-stat d-${stat.group}`}
      disabled={stat.blocker !== null}
      aria-label={`Train ${stat.label}`}
      onClick={() => {
        perform(stat.action);
      }}
    >
      <span className="teach-label">{stat.label}</span>
      <span className="teach-grades" aria-hidden="true">
        <GradeBadge grade={stat.theirs} />
        <small>over</small>
        <GradeBadge grade={stat.yours} />
      </span>
    </button>
  );
}

function Price({ parts }: { parts: readonly PricePart[] }) {
  if (parts.length === 0) return null;
  return (
    <ul className="teach-price" aria-label="Their price">
      {parts.map((p) => (
        <li key={`${p.kind}-${p.label}`} className={p.met ? 'met' : 'unmet'}>
          <span className="badge">{p.met ? 'Met' : 'Not yet'}</span>
          <span>
            {p.label}
            {p.line && <q>{p.line}</q>}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Signature({ signature }: { signature: NonNullable<TeacherOffer['signature']> }) {
  const percent = Math.round(signature.progress * 100);
  return (
    <div className="signature">
      <span className="sig-name">
        <small className="muted">Signature technique</small>
        <b>{signature.name}</b>
      </span>
      {signature.locked ? (
        <small className="muted">{signature.locked}</small>
      ) : (
        <span className="bond-bar" aria-label={`${percent}% learned`}>
          <i style={{ width: `${percent}%` }} />
        </span>
      )}
    </div>
  );
}

function TeacherCard({ offer, perform }: { offer: TeacherOffer; perform: Perform }) {
  return (
    <article className="teacher-card" aria-label={offer.person.fullName}>
      <div className="person-top">
        <span className="person-photo">
          <Portrait appearance={offer.person.appearance} size={48} />
        </span>
        <div>
          <h3>{offer.person.fullName}</h3>
          <p className="muted small">
            {offer.isSensei ? 'Your sensei' : offer.person.title}. {offer.manner}
          </p>
        </div>
      </div>
      <Price parts={offer.price} />
      {offer.steering && <p className="small">{offer.steering}</p>}
      <div className="teach-stats">
        {offer.open.map((s) => (
          <StatButton key={s.id} stat={s} perform={perform} />
        ))}
      </div>
      {offer.blocker ? (
        <p className="blocker">{offer.blocker}</p>
      ) : (
        <p className="cost num small">
          {offer.energyCost} energy and {offer.slots} time slots a session. {offer.sessions}.
        </p>
      )}
      {offer.locked.length > 0 && (
        <details className="fold">
          <summary>{`${offer.locked.length} more they could teach later`}</summary>
          <ul className="teach-locked">
            {offer.locked.map((s) => (
              <li key={s.id}>
                <b>{s.label}</b> <small className="muted">{s.blocker}</small>
              </li>
            ))}
          </ul>
        </details>
      )}
      {offer.signature && <Signature signature={offer.signature} />}
    </article>
  );
}

/** The training ground's "People here": who could train with you now, and on what terms. */
export function PeopleHere({
  teachers,
  perform,
}: {
  teachers: readonly TeacherOffer[];
  perform: Perform;
}) {
  if (teachers.length === 0) return null;
  const shown = teachers.slice(0, SHOWN_TEACHERS);
  const folded = teachers.slice(SHOWN_TEACHERS);
  return (
    <section className="teachers" aria-label="People here">
      <h2 className="label">Train with someone here</h2>
      {shown.map((t) => (
        <TeacherCard key={t.person.id} offer={t} perform={perform} />
      ))}
      {folded.length > 0 && (
        <details className="fold">
          <summary>{`${folded.length} more who could train with you`}</summary>
          <div className="teachers">
            {folded.map((t) => (
              <TeacherCard key={t.person.id} offer={t} perform={perform} />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
