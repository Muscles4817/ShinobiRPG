import type { DayFind, DayGrowth, DayHurt, DayMoment, DayPerson, PurseLine } from '@/game';

import { Icon } from '../../art/Icon';
import { Avatar } from '../Faces';

/** The end-of-day sheet's rows: one look for each kind of change. */

export function Moment({ m }: { readonly m: DayMoment }) {
  return (
    <div className={m.rival ? 'day-moment rival' : 'day-moment'}>
      <span className="day-moment-seal" aria-hidden="true">
        {m.seal}
      </span>
      <div>
        <b>{m.title}</b>
        {m.tag && (
          <span className="day-tag" data-discipline={m.tag.discipline}>
            {m.tag.label}
          </span>
        )}
      </div>
    </div>
  );
}

export function Hurt({ h }: { readonly h: DayHurt }) {
  return (
    <div className="day-hurt">
      <span className="day-hurt-seal" aria-hidden="true">
        {h.seal}
      </span>
      <div>
        <b>{h.title}</b>
        <small>{h.note}</small>
      </div>
    </div>
  );
}

function pct(share: number): string {
  return `${Math.round(Math.min(1, Math.max(0, share)) * 100)}%`;
}

export function Growth({ g }: { readonly g: DayGrowth }) {
  return (
    <div className={g.up ? 'day-growth up' : 'day-growth'} data-discipline={g.discipline ?? 'body'}>
      <span className="day-grade" aria-label={`Grade ${g.grade}`}>
        {g.grade}
      </span>
      <div>
        <div className="day-growth-top">
          <b>{g.name}</b>
          <span>{g.tier}</span>
        </div>
        <div className="day-growth-bar" aria-hidden="true">
          <i style={{ width: pct(g.from) }} />
          <em style={{ left: pct(g.from), width: pct(g.to - g.from) }} />
        </div>
        <small>{g.words}</small>
      </div>
    </div>
  );
}

export function Person({ p }: { readonly p: DayPerson }) {
  return (
    <div className="day-person">
      <Avatar face={p.face} size={44} />
      <div>
        <div className="day-person-top">
          <b>{p.face.name}</b>
          {p.stamp ? <span className="day-stamp">{p.stamp}</span> : <span>{p.stage}</span>}
        </div>
        <span className="bond-bar" aria-hidden="true">
          <i style={{ width: pct(p.progress) }} />
        </span>
        {p.next && <small>{p.next}</small>}
      </div>
    </div>
  );
}

export function Find({ f }: { readonly f: DayFind }) {
  return (
    <div className={f.fresh ? 'day-find fresh' : 'day-find'}>
      {f.count > 1 && <span className="day-find-count">×{f.count}</span>}
      <Icon id={f.icon} size={30} />
      <span>{f.name}</span>
    </div>
  );
}

export function Purse({
  lines,
  left,
}: {
  readonly lines: readonly PurseLine[];
  readonly left: number;
}) {
  return (
    <dl className="day-purse">
      {lines.map((l) => (
        <div key={l.label}>
          <dt>{l.label}</dt>
          <dd className={l.amount > 0 ? 'in' : 'out'}>
            {l.amount > 0 ? '+' : '−'}
            {Math.abs(l.amount)}
          </dd>
        </div>
      ))}
      <div className="day-purse-left">
        <dt>Left</dt>
        <dd>{left} ryo</dd>
      </div>
    </dl>
  );
}
