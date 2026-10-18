import type { ArcJob, ArcView } from '@/game';

interface ArcCardProps {
  readonly arc: ArcView;
  /** Opens a job's notice; only jobs posted at this hall can be opened from here. */
  readonly onOpen: (missionId: string) => void;
  readonly postedHere: readonly string[];
}

function JobList({
  jobs,
  onOpen,
  postedHere,
  labelledBy,
}: {
  readonly jobs: readonly ArcJob[];
  readonly onOpen: (missionId: string) => void;
  readonly postedHere: readonly string[];
  readonly labelledBy?: string;
}) {
  return (
    <ul aria-describedby={labelledBy}>
      {jobs.map((j) => (
        <li
          key={j.id}
          className={j.done ? 'done' : ''}
          aria-label={j.done ? `${j.title}, done` : undefined}
        >
          {!j.done && postedHere.includes(j.id) ? (
            <button
              type="button"
              onClick={() => {
                onOpen(j.id);
              }}
            >
              <span aria-hidden="true">・</span>
              {j.title}
            </button>
          ) : (
            <>
              <span aria-hidden="true">{j.done ? '済' : '・'}</span>
              {j.title}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * A long story pinned to the board: its title and act, the rule the act moves on by, and its
 * jobs (each opens its notice), with leads from the act before kept while any is open. The
 * story so far folds away behind a tap.
 */
export function ArcCard({ arc, onOpen, postedHere }: ArcCardProps) {
  const ruleId = `${arc.id}-rule`;
  return (
    <section className="arc-card" aria-labelledby={`${arc.id}-title`}>
      <h2 id={`${arc.id}-title`}>{arc.title}</h2>
      <p className="arc-act">{arc.act}</p>
      <details>
        <summary>The story so far</summary>
        <p className="story dark">{arc.text}</p>
        {arc.base && <p className="arc-base">{arc.base}</p>}
      </details>
      {arc.rule && (
        <p className="arc-rule" id={ruleId}>
          <span className="badge" aria-hidden="true">
            {arc.rule.stamp}
          </span>
          <b>{arc.rule.label}.</b> {arc.rule.text}
        </p>
      )}
      <JobList
        jobs={arc.jobs}
        onOpen={onOpen}
        postedHere={postedHere}
        {...(arc.rule ? { labelledBy: ruleId } : {})}
      />
      {arc.leads.length > 0 && (
        <>
          <h3>Still to look into</h3>
          <JobList jobs={arc.leads} onOpen={onOpen} postedHere={postedHere} />
          {arc.leadsNote && <p className="arc-leads-note">{arc.leadsNote}</p>}
        </>
      )}
    </section>
  );
}
