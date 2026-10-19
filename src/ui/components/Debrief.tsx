import type { DebriefCrew, DebriefLine, Report } from '@/game';

/**
 * A job's debrief, beyond the pay: the road it took as a short paragraph (with the pay each
 * moment moved beside it), the people who went (how much closer you came, and the last thing they said), and on
 * a failure what would have helped.
 */

type JobReport = Extract<Report, { kind: 'mission-complete' | 'mission-failed' | 'defeat' }>;

/** A fragment as it runs on in the paragraph: older reports kept whole lines with no spacing. */
function spaced(text: string, index: number): string {
  return index === 0 || /^[\s,]/.test(text) ? text : ` ${text}`;
}

/** The road a job took, as a short paragraph with the pay each moment moved. */
export function DebriefRoad({
  lines,
  title = 'The road',
}: {
  readonly lines: readonly DebriefLine[];
  readonly title?: string;
}) {
  if (lines.length === 0) return null;
  return (
    <section className="debrief-road" aria-label={title}>
      <h3 className="report-list-title">{title}</h3>
      <p>
        {lines.map((l, i) => (
          <span key={i} className={`road-${l.tone}`}>
            {spaced(l.text, i)}
            {l.noted && (
              <span className="badge noted" role="img" aria-label="Worth remembering">
                記
              </span>
            )}
            {l.pay && (
              <span className={`chip ${l.pay.startsWith('+') ? 'gain' : 'cost'}`}>{l.pay}</span>
            )}
          </span>
        ))}
      </p>
    </section>
  );
}

/** The people who went: how much closer you came, and the last thing they said. */
export function DebriefCrewList({
  crew,
  title = 'Who went with you',
}: {
  readonly crew: readonly DebriefCrew[];
  readonly title?: string;
}) {
  if (crew.length === 0) return null;
  return (
    <section className="debrief-crew" aria-label={title}>
      <h3 className="report-list-title">{title}</h3>
      <ul>
        {crew.map((c) => (
          <li key={c.name}>
            <b>{c.name}</b>
            {c.bond !== 0 && (
              <span className={`chip ${c.bond > 0 ? 'gain' : 'harm'}`}>
                {c.bond > 0 ? '+' : '−'}
                {Math.abs(c.bond)} bond
              </span>
            )}
            {c.quote && <q>{c.quote}</q>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DebriefSections({ report }: { readonly report: JobReport }) {
  const road = report.kind === 'defeat' ? [] : (report.road ?? []);
  const crew = report.kind === 'mission-complete' ? (report.crew ?? []) : [];
  const helped = report.kind === 'mission-complete' ? undefined : report.helped;
  return (
    <>
      <DebriefRoad lines={road} />
      <DebriefCrewList crew={crew} />
      {helped && (
        <section className="debrief-helped" aria-label="What would have helped">
          <h3 className="report-list-title">What would have helped</h3>
          <p>{helped}</p>
        </section>
      )}
    </>
  );
}
