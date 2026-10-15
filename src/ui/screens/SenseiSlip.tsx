import type { GameAction, SenseiWeekView } from '@/game';

interface SenseiSlipProps {
  readonly view: SenseiWeekView;
  readonly perform: (action: GameAction) => void;
}

/** Ink stamps for how a planned meeting went: done, absent, excused. */
const OUTCOME_STAMP = { kept: '済', missed: '欠', excused: '休' } as const;
const OUTCOME_WORD = { kept: 'kept', missed: 'missed', excused: 'excused' } as const;

/** Your sensei's slip for the week: their days, how each went, and today's session. */
export function SenseiSlip({ view, perform }: SenseiSlipProps) {
  const { session } = view;
  return (
    <section className="sensei-slip" aria-label={`${view.sensei}’s week`}>
      <div className="slip-head">
        <h2>{view.sensei}’s week</h2>
        <span className="badge">{view.regard}</span>
      </div>
      <ol className="slip-days">
        {view.days.map((d) => (
          <li
            key={d.day}
            className={`${d.today ? 'today' : ''}${d.meeting ? ' planned' : ''}`}
            aria-label={`Day ${d.label}: ${d.meeting ?? 'free'}${d.outcome ? `, ${OUTCOME_WORD[d.outcome]}` : ''}`}
          >
            <b className="num">{d.label}</b>
            <small>{d.meeting ?? (d.team ? '' : 'Free')}</small>
            {d.team && <small className="slip-team">{d.team}</small>}
            {d.outcome && (
              <span className={`slip-stamp ${d.outcome}`} aria-hidden="true">
                {OUTCOME_STAMP[d.outcome]}
              </span>
            )}
          </li>
        ))}
      </ol>
      {view.todayLine && <p className="slip-today">{view.todayLine}</p>}
      {view.teamDay && (
        <div className="slip-row">
          <p className="slip-today">
            {view.teamDay.what} with the team today, from {view.teamDay.from}.
          </p>
          {view.teamDay.join.blocker === null && (
            <button
              type="button"
              className="btn small"
              onClick={() => {
                if (view.teamDay) perform(view.teamDay.join.action);
              }}
            >
              Join them
            </button>
          )}
        </div>
      )}
      {view.assignment && (
        <p className="slip-today">
          Their assignment: your {view.assignment.stat.toLowerCase()}, {view.assignment.progress}.
        </p>
      )}
      {view.eased && <p className="slip-note">You are close enough that they plan less.</p>}
      {view.lesson && (
        <div className="slip-lesson">
          <h3>{view.lesson.title}</h3>
          <p>{view.lesson.text}</p>
          <button
            type="button"
            className="btn small ghost"
            disabled={view.lesson.heed.blocker !== null}
            onClick={() => {
              if (view.lesson) perform(view.lesson.heed.action);
            }}
          >
            Understood
          </button>
        </div>
      )}
      {session?.blocker === null && (
        <button
          type="button"
          className="btn small"
          onClick={() => {
            perform(session.action);
          }}
        >
          Go to the session
        </button>
      )}
    </section>
  );
}
