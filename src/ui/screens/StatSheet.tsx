import type { ShinobiView, StatLine } from '@/game';

import { GradeBadge, GradeBar } from '../components/Grade';

const GROUP_TITLES = { discipline: 'Disciplines', body: 'Body', mind: 'Mind' } as const;

/** The overall fighting grade as a big seal, with the road to the next letter. */
function FightingGrade({ overall }: { readonly overall: ShinobiView['overall'] }) {
  return (
    <section className="overall" aria-label="Fighting grade">
      <GradeBadge grade={overall.grade} large />
      <div className="overall-body">
        <span className="label">Fighting grade</span>
        <b>
          {overall.rank} <span className="num muted">{overall.power}</span>
        </b>
        <GradeBar tier={overall} />
        <small className="muted">
          {overall.next ? `Next: ${overall.next.label} at ${overall.next.at}` : 'The very top'}
        </small>
      </div>
    </section>
  );
}

function growthText(growth: number): string {
  return growth > 0 ? `+${growth}` : '';
}

function DisciplineTile({ stat }: { readonly stat: StatLine }) {
  const css = stat.label.toLowerCase().replace('ū', 'uu');
  return (
    <div className={`disc d-${css}`}>
      <small>{stat.label}</small>
      <span className="disc-value">
        <b className="num">{stat.value.toFixed(1)}</b>
        <GradeBadge grade={stat.tier.grade} />
      </span>
      <GradeBar tier={stat.tier} />
      <small className="num">{growthText(stat.growth) || ' '}</small>
    </div>
  );
}

function StatRow({ stat }: { readonly stat: StatLine }) {
  return (
    <div className="stat-row">
      <GradeBadge grade={stat.tier.grade} />
      <span>{stat.label}</span>
      <span className="num">{stat.value.toFixed(1)}</span>
      <span className="growth num">{growthText(stat.growth)}</span>
      <GradeBar tier={stat.tier} />
    </div>
  );
}

/** Your stats, each with its grade letter and how close the next one is. */
export function StatSheet({ view }: { readonly view: ShinobiView }) {
  const [disciplines, ...rest] = view.groups;
  return (
    <>
      <FightingGrade overall={view.overall} />
      {disciplines && (
        <section className="disc-tiles" aria-label="Disciplines">
          {disciplines.stats.map((s) => (
            <DisciplineTile key={s.label} stat={s} />
          ))}
        </section>
      )}
      <section className="stat-cols">
        {rest.map((g) => (
          <div key={g.group}>
            <h2 className="label">{GROUP_TITLES[g.group]}</h2>
            {g.stats.map((s) => (
              <StatRow key={s.label} stat={s} />
            ))}
          </div>
        ))}
      </section>
      <p className="grade-key muted">
        Grades: E–D genin · C chūnin · B–A jōnin · S kage. Bars show the way to the next letter.
      </p>
    </>
  );
}
