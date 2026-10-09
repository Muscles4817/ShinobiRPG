import { academyView, headerView, type Scroll } from '@/game';

import { Banner } from '../../components/Banner';
import type { PlaceProps } from '../types';

function ScrollRow({
  scroll,
  perform,
}: {
  readonly scroll: Scroll;
  readonly perform: PlaceProps['perform'];
}) {
  const locked = scroll.needs.length > 0;
  const pct = Math.round((scroll.progress / scroll.difficulty) * 100);
  return (
    <div className={`scroll d-${scroll.discipline}${locked ? ' locked' : ''}`}>
      <span className="cap" />
      <div className="paper-strip">
        <b>
          {scroll.name} <span className="badge">{scroll.discipline.slice(0, 3)}</span>
        </b>
        <small>{locked ? scroll.needs.join(' · ') : scroll.description}</small>
        {!locked && (
          <>
            <span className="unroll">
              <i style={{ width: `${pct}%` }} />
            </span>
            <span className="scroll-foot">
              <small>
                {scroll.progress > 0
                  ? `${pct}% · about ${scroll.sessionsLeft} more sessions`
                  : `About ${scroll.sessionsLeft} sessions`}
              </small>
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

/** A rack of scrolls: study progress is how far each one is unrolled. */
export function AcademyPage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = academyView(state, ctx);
  const header = headerView(state, ctx);
  if (!view) return null;
  const sections: [string, readonly Scroll[]][] = [
    ['Studying', view.studying],
    ['Ready to study', view.ready],
    ['Coming up', view.comingUp],
  ];
  return (
    <>
      <Banner
        title={view.name}
        subtitle={`Study costs ${view.energyCost} energy and one time slot`}
        slot={header.slot}
        onBack={onBack}
        backLabel={header.location}
      />
      <main className="page">
        {sections
          .filter(([, scrolls]) => scrolls.length > 0)
          .map(([title, scrolls]) => (
            <section key={title} className="rack">
              <h2 className="label">{title}</h2>
              {scrolls.map((s) => (
                <ScrollRow key={s.id} scroll={s} perform={perform} />
              ))}
            </section>
          ))}
        {view.studying.length + view.ready.length + view.comingUp.length === 0 && (
          <p className="story">You have learned every scroll the library keeps.</p>
        )}
      </main>
    </>
  );
}
