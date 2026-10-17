import { useState } from 'react';

import { headerView, hubView, trainingView, type DrillGroup, type StatPreview } from '@/game';

import { Icon } from '../../art/Icon';
import { Chips } from '../../components/Chips';
import { Banner } from '../../components/Banner';
import { ControlExercises } from './ControlExercises';
import { PeopleHere } from './PeopleHere';
import { TeamCorner } from './TeamCorner';
import { TrainTogether } from './TrainTogether';
import type { PlaceProps } from '../types';

const FILTERS: readonly { id: DrillGroup | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'taijutsu', label: 'Taijutsu' },
  { id: 'ninjutsu', label: 'Ninjutsu' },
  { id: 'genjutsu', label: 'Genjutsu' },
  { id: 'kenjutsu', label: 'Kenjutsu' },
  { id: 'fuuinjutsu', label: 'Fūinjutsu' },
  { id: 'body', label: 'Body' },
  { id: 'mind', label: 'Mind' },
];

/** "+0.04": a session adds hundredths once a stat is past its first grade. */
function gainText(preview: StatPreview): string {
  return `+${(preview.after - preview.now).toFixed(2)}`;
}

/**
 * Training Grounds as a rack of ema (wooden shrine plaques): each drill headlines the stat it
 * grows most, with the rest beneath, under an energy budget.
 */
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
        <PeopleHere teachers={view.teachers} perform={perform} />
        <TeamCorner sparring={view.sparring} perform={perform} />
        <TrainTogether view={view.companion} perform={perform} />
        <ControlExercises exercises={view.exercises} perform={perform} />
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
          {drills.map((d) => {
            const [main, ...also] = d.previews;
            return (
              <article key={d.id} className={`drill d-${d.group}${d.blocker ? ' off' : ''}`}>
                <div className="drill-head">
                  <Icon id={d.icon} />
                  <div>
                    <b>{d.name}</b>
                    <small>{d.spot}</small>
                  </div>
                </div>
                {main && (
                  <p className="drill-main">
                    <b className="num">{gainText(main)}</b>
                    <span>
                      {main.label}
                      <small className="num">
                        {main.now.toFixed(2)} → {main.after.toFixed(2)}
                      </small>
                    </span>
                  </p>
                )}
                {also.length > 0 && (
                  <p className="drill-also">
                    Also {also.map((p) => `${p.label} ${gainText(p)}`).join(', ')}
                  </p>
                )}
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
            );
          })}
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
