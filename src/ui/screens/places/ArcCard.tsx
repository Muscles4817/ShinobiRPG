import type { ArcView } from '@/game';

/** A long story pinned to the board: where it stands, and the jobs of this act. */
export function ArcCard({ arc }: { readonly arc: ArcView }) {
  return (
    <section className="arc-card" aria-label={arc.title}>
      <h2>{arc.title}</h2>
      <p className="arc-act">{arc.act}</p>
      <p className="story dark">{arc.text}</p>
      {arc.base && <p className="arc-base">{arc.base}</p>}
      <ul>
        {arc.jobs.map((j) => (
          <li
            key={j.title}
            className={j.done ? 'done' : ''}
            aria-label={j.done ? `${j.title}, done` : j.title}
          >
            <span aria-hidden="true">{j.done ? '済' : '・'}</span>
            {j.title}
          </li>
        ))}
      </ul>
    </section>
  );
}
