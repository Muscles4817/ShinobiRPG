import type { SceneLine, ThreadView } from '@/game';

/**
 * A job's story feed: what happened, what you chose, the rolls (an ink stamp, 成 or 失, with the
 * stat), and what the crew said.
 */
export function StoryLines({ lines }: { readonly lines: readonly SceneLine[] }) {
  return (
    <>
      {lines.map((line, i) => {
        switch (line.kind) {
          case 'roll':
            return (
              <p key={i} className={`roll ${line.success ? 'pass' : 'fail'}`}>
                <i role="img" aria-label={line.success ? 'Passed' : 'Failed'}>
                  {line.success ? '成' : '失'}
                </i>
                {line.text}
              </p>
            );
          case 'choice':
            return (
              <p key={i} className="you">
                {line.text}
              </p>
            );
          case 'voice':
            return (
              <p key={i} className="voice">
                <b>{line.speaker}</b>
                <q>{line.text}</q>
              </p>
            );
          case 'story':
          case 'outcome':
            return (
              <p key={i} className={line.kind === 'outcome' ? 'story outcome' : 'story'}>
                {line.text}
              </p>
            );
        }
      })}
    </>
  );
}

/** The threads a job keeps, as words and dots: "Kohaku’s trust: At ease ●●○". */
export function Threads({ threads }: { readonly threads: readonly ThreadView[] }) {
  if (threads.length === 0) return null;
  return (
    <ul className="threads" aria-label="How things stand">
      {threads.map((t) => (
        <li key={t.label}>
          <span>{t.label}</span>
          <b>{t.word}</b>
          <span className="dots" aria-hidden="true">
            {Array.from({ length: t.of }, (_, i) => (i < t.level ? '●' : '○')).join('')}
          </span>
        </li>
      ))}
    </ul>
  );
}
