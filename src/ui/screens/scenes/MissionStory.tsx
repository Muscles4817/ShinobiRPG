import { useEffect, useRef } from 'react';

import type { MissionScene, SceneLine } from '@/game';

import { KeyHint } from '../../layout/KeyHint';
import { useChoiceKeys } from '../../layout/useChoiceKeys';
import type { ScreenProps } from '../types';
import { StoryLines } from './StoryLines';

/** The story split at the last thing you chose: what came before folds away. */
function beats(lines: readonly SceneLine[]): { earlier: SceneLine[]; now: SceneLine[] } {
  const last = lines.findLastIndex((l) => l.kind === 'choice');
  return last <= 0
    ? { earlier: [], now: [...lines] }
    : { earlier: lines.slice(0, last), now: lines.slice(last) };
}

interface MissionStoryProps {
  readonly scene: MissionScene;
  readonly perform: ScreenProps['perform'];
  /** On a desk: choices take number keys. */
  readonly wide: boolean;
}

/**
 * A job's or a journey's story: the latest beat (the rest folded away), the situation now on a
 * card near the thumb, and your choices, numbered for the keys on a desk.
 */
export function MissionStory({ scene, perform, wide }: MissionStoryProps) {
  useChoiceKeys(
    scene.choices,
    (c) => {
      perform(c.action);
    },
    wide,
  );
  const end = useRef<HTMLDivElement>(null);
  const lineCount = scene.lines.length;
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [lineCount]);
  const { earlier, now } = beats(scene.lines);
  return (
    <>
      <main className="page feed scene-feed">
        {earlier.length > 0 && (
          <details className="fold story-so-far">
            <summary>The story so far</summary>
            <StoryLines lines={earlier} />
          </details>
        )}
        <StoryLines lines={now} />
        {scene.prompt && (
          <section className="beat-card enter" aria-label="Now">
            <p className="story">{scene.prompt}</p>
          </section>
        )}
        <div ref={end} />
      </main>
      <nav className="choices" aria-label="Choices">
        {scene.choices.map((c, i) => (
          <button
            key={c.label}
            type="button"
            className={`choice${c.primary ? ' primary' : ''}${c.closed ? ' closed' : ''}`}
            disabled={c.closed !== undefined}
            aria-keyshortcuts={wide ? String(i + 1) : undefined}
            onClick={() => {
              perform(c.action);
            }}
          >
            {wide && <KeyHint index={i} />}
            <b>{c.label}</b>
            {(c.closed ?? c.detail) && <small>{c.closed ?? c.detail}</small>}
          </button>
        ))}
      </nav>
    </>
  );
}
