import { useState } from 'react';

import { headerView, hubView, trainingView, type DrillGroup } from '@/game';

import { Icon } from '../../art/Icon';
import { Chips } from '../../components/Chips';
import { Banner } from '../../components/Banner';
import type { PlaceProps } from '../types';

const FILTERS: readonly { id: DrillGroup | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'taijutsu', label: 'Taijutsu' },
  { id: 'ninjutsu', label: 'Ninjutsu' },
  { id: 'genjutsu', label: 'Genjutsu' },
  { id: 'body', label: 'Body' },
  { id: 'mind', label: 'Mind' },
];

/** Bars are drawn against this many stat points so growth is visible. */
const BAR_SCALE = 25;

/** Training Grounds as a drill board: an energy budget and drills that preview their growth. */
export function TrainingPage({ ctx, state, perform, onBack }: PlaceProps) {
  const [filter, setFilter] = useState<DrillGroup | 'all'>('all');
  const view = trainingView(state, ctx);
  const header = headerView(state, ctx);
  const latest = hubView(state, ctx).latest;
  if (!view) return null;
  const drills = view.drills.filter((d) => filter === 'all' || d.group === filter);

  return (
    <>
      <Banner
        title={view.name}
        subtitle="Each drill takes one time slot"
        slot={header.slot}
        onBack={onBack}
        backLabel={header.location}
      />
      <main className="page">
        <section className="budget" aria-label="Energy">
          <div className="budget-top">
            <span>
              Energy <b className="num">{view.energy}</b>
            </span>
            <span className="muted">
              {view.drillsLeft > 0
                ? `Enough for about ${view.drillsLeft} more drills`
                : 'Too tired to train. Eat or rest.'}
            </span>
          </div>
          <span className="budget-bar">
            <i style={{ width: `${view.energy}%` }} />
          </span>
        </section>
        <div className="filters" role="group" aria-label="Filter drills">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filter d-${f.id}${f.id === filter ? ' on' : ''}`}
              onClick={() => {
                setFilter(f.id);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="drills">
          {drills.map((d) => (
            <article key={d.id} className={`drill d-${d.group}${d.blocker ? ' off' : ''}`}>
              <div className="drill-head">
                <Icon id={d.icon} />
                <div>
                  <b>{d.name}</b>
                  <small>{d.spot}</small>
                </div>
              </div>
              <div className="previews">
                {d.previews.map((p) => (
                  <div key={p.label} className="preview">
                    <span>{p.label}</span>
                    <span className="pbar">
                      <i
                        className="after"
                        style={{ width: `${Math.min(100, (p.after / BAR_SCALE) * 100)}%` }}
                      />
                      <i
                        className="now"
                        style={{ width: `${Math.min(100, (p.now / BAR_SCALE) * 100)}%` }}
                      />
                    </span>
                  </div>
                ))}
              </div>
              {d.blocker ? (
                <p className="blocker">{d.blocker}</p>
              ) : (
                <div className="drill-foot">
                  <span className="cost num">{d.energyCost} energy</span>
                  <button
                    type="button"
                    className={d.isLast ? 'btn ghost small' : 'btn small'}
                    onClick={() => {
                      perform(d.action);
                    }}
                  >
                    {d.isLast ? '↻ Again' : 'Train'}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </main>
      {latest && (
        <div className="ticker static">
          <b>{latest.heading}</b>
          <Chips chips={latest.chips} />
        </div>
      )}
    </>
  );
}
