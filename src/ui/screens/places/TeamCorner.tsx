import type { GameAction, LessonCard, SparOption } from '@/game';

import { Portrait } from '../../art/Portrait';
import { Avatar } from '../../components/Faces';
import { ThreatChip } from '../../components/ThreatChip';

/** Partners shown before the rest fold away. */
const SHOWN_PARTNERS = 3;

interface TeamCornerProps {
  readonly lesson: LessonCard | null;
  readonly sparring: readonly SparOption[];
  readonly perform: (action: GameAction) => void;
}

function Lesson({ lesson, perform }: { lesson: LessonCard; perform: TeamCornerProps['perform'] }) {
  const { signature } = lesson;
  return (
    <article className={`lesson-card d-${lesson.specialty.id}`}>
      <div className="person-top">
        <span className="person-photo team">
          <Portrait appearance={lesson.sensei.appearance} size={52} />
        </span>
        <div>
          <p className="label">Weekly lesson · {lesson.specialty.label}</p>
          <h2>{lesson.sensei.fullName}</h2>
          <p className="muted small">{lesson.style}</p>
        </div>
      </div>
      {signature && (
        <div className="signature">
          <span className="sig-name">
            <small className="label">Signature technique</small>
            <b>{signature.name}</b>
          </span>
          {signature.locked ? (
            <small className="muted">{signature.locked}</small>
          ) : (
            <span
              className="bond-bar"
              aria-label={`${Math.round(signature.progress * 100)}% learned`}
            >
              <i style={{ width: `${Math.round(signature.progress * 100)}%` }} />
            </span>
          )}
        </div>
      )}
      {lesson.blocker ? (
        <p className="blocker">{lesson.blocker}</p>
      ) : (
        <div className="drill-foot">
          <span className="cost num">{lesson.energyCost} energy · 2 slots</span>
          <button
            type="button"
            className="btn small"
            onClick={() => {
              perform(lesson.action);
            }}
          >
            Take the lesson
          </button>
        </div>
      )}
    </article>
  );
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

/** The team side of the training ground: your sensei's lesson and who you could spar with. */
export function TeamCorner({ lesson, sparring, perform }: TeamCornerProps) {
  const shown = sparring.slice(0, SHOWN_PARTNERS);
  const folded = sparring.slice(SHOWN_PARTNERS);
  return (
    <>
      {lesson && <Lesson lesson={lesson} perform={perform} />}
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
