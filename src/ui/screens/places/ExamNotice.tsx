import { examNotice } from '@/game';

import type { ScreenProps } from '../types';

/**
 * The exam's notice, pinned above the jobs in the week before and on the day: when it is, your
 * sensei's word, where your team stands, and (on the day) the ways to sign up.
 */
export function ExamNotice({ ctx, state, perform }: ScreenProps) {
  const notice = examNotice(state, ctx);
  if (!notice) return null;
  return (
    <section className="exam-notice" aria-label={notice.name}>
      <span className="exam-when badge">{notice.when}</span>
      <h2>{notice.name}</h2>
      {notice.sensei && (
        <p className={notice.sensei.nominated ? 'story dark' : 'exam-not-yet'}>
          {notice.sensei.words}
        </p>
      )}
      <ul className="exam-team">
        {notice.team.map((t) => (
          <li key={t.name}>
            <b>{t.name}</b>
            {t.blocker ? (
              <small className="blocker">{t.blocker}</small>
            ) : (
              <span className="exam-ready">Ready</span>
            )}
          </li>
        ))}
      </ul>
      {notice.replacementRule && <p className="exam-rule">{notice.replacementRule}</p>}
      {notice.entries.map((e) => (
        <div key={e.label} className="exam-entry">
          <button
            type="button"
            className="btn wide"
            disabled={e.blocker !== null}
            onClick={() => {
              perform(e.action);
            }}
          >
            {e.label}
          </button>
          {e.blocker && <p className="blocker">{e.blocker}</p>}
        </div>
      ))}
    </section>
  );
}
