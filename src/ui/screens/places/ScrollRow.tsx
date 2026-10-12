import type { Discipline, Scroll } from '@/game';

import type { PlaceProps } from '../types';

/** The short mark on a scroll's badge, spelled as the rest of the game spells the art. */
const SHORT_NAME: Readonly<Record<Discipline, string>> = {
  taijutsu: 'Tai',
  ninjutsu: 'Nin',
  genjutsu: 'Gen',
  kenjutsu: 'Ken',
  fuuinjutsu: 'Fūi',
};

/** "About one session", "40% studied, about 3 more sessions". */
function sessionsText(scroll: Scroll, pct: number): string {
  const left = scroll.sessionsLeft;
  if (left === null) return 'It won’t take for you';
  const more = scroll.progress > 0 ? ' more' : '';
  const count = left === 1 ? `one${more} session` : `${left}${more} sessions`;
  return scroll.progress > 0 ? `${pct}% studied, about ${count}` : `About ${count}`;
}

/** One scroll, unrolled as far as you've studied it; a folded one says what opens it. */
export function ScrollRow({
  scroll,
  perform,
}: {
  readonly scroll: Scroll;
  readonly perform: PlaceProps['perform'];
}) {
  const locked = scroll.locked !== null;
  const pct = Math.round((scroll.progress / scroll.difficulty) * 100);
  const sessions = sessionsText(scroll, pct);
  return (
    <div className={`scroll d-${scroll.discipline}${locked ? ' locked' : ''}`}>
      <span className="cap" />
      <div className="paper-strip">
        <b>
          {scroll.name} <span className="badge">{SHORT_NAME[scroll.discipline]}</span>{' '}
          <span className="badge rank-stamp" title={`Rank ${scroll.rank}`}>
            {scroll.rank}
          </span>
          {scroll.unstable && !locked && (
            <span
              className="badge unstable"
              title="A rank above you: slow, and it arrives unstable"
            >
              Unstable
            </span>
          )}
        </b>
        <small>{scroll.locked ?? scroll.description}</small>
        {!locked && (
          <>
            <span className="unroll">
              <i style={{ width: `${pct}%` }} />
            </span>
            <span className="scroll-foot">
              <small>{sessions}</small>
              <button
                type="button"
                className="btn small"
                disabled={scroll.blocker !== null}
                title={scroll.blocker ?? undefined}
                onClick={() => {
                  perform(scroll.action);
                }}
              >
                Study
              </button>
            </span>
          </>
        )}
      </div>
      <span className="cap" />
    </div>
  );
}
