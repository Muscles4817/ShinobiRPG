import { promotionNotice } from '@/game';

import type { ScreenProps } from '../types';

/**
 * A promotion the village has set a day for, pinned above the jobs: when it is held, or, if it
 * was held while you were away, the way to take up the rank.
 */
export function PromotionNotice({ ctx, state, perform }: ScreenProps) {
  const notice = promotionNotice(state, ctx);
  if (!notice) return null;
  const { collect } = notice;
  return (
    <section className="exam-notice" aria-label={notice.title}>
      <span className="exam-when badge">{notice.when}</span>
      <h2>{notice.title}</h2>
      <p className="story dark">{notice.words}</p>
      {collect && (
        <div className="exam-entry">
          <button
            type="button"
            className="btn wide"
            disabled={collect.blocker !== null}
            onClick={() => {
              perform(collect.action);
            }}
          >
            {collect.label}
          </button>
          {collect.blocker && <p className="blocker">{collect.blocker}</p>}
        </div>
      )}
    </section>
  );
}
