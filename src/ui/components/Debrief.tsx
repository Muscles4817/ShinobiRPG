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

function Road({ lines }: { readonly lines: readonly DebriefLine[] }) {
  if (lines.length === 0) return null;
  return (
    <section className="debrief-road" aria-label="The road">
      <h3 className="report-list-title">The road</h3>
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

function Crew({ crew }: { readonly crew: readonly DebriefCrew[] }) {
  if (crew.length === 0) return null;
  return (
    <section className="debrief-crew" aria-label="Who went with you">
      <h3 className="report-list-title">Who went with you</h3>
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
      <Road lines={road} />
      <Crew crew={crew} />
      {helped && (
        <section className="debrief-helped" aria-label="What would have helped">
          <h3 className="report-list-title">What would have helped</h3>
          <p>{helped}</p>
        </section>
      )}
    </>
  );
}
