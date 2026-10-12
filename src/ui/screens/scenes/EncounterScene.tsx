import { encounterScene, headerView } from '@/game';

import { Backdrop } from '../../art/Backdrop';
import { Vitals } from '../../components/Vitals';
import type { ScreenProps } from '../types';
import { FieldNotes } from './encounter/FieldNotes';
import { ScoutFirst, WaysIn } from './encounter/WaysIn';

/**
 * Foes ahead on a mission: what you've learned, ways to learn more, and how to go in. Head-on
 * and withdrawing are always there, at the thumb; the cleverer ways sit with what you know.
 */
export function EncounterScene({ ctx, state, perform }: ScreenProps) {
  const scene = encounterScene(state, ctx);
  const header = headerView(state, ctx);
  if (!scene) return null;
  const always = scene.approaches.filter((a) => a.id === 'head-on' || a.id === 'withdraw');
  return (
    <>
      <header
        className="scene-head vignette sky"
        data-slot={header.slot}
        data-land={header.backdrop}
      >
        <Backdrop id={header.backdrop} />
        <div className="vignette-text">
          <p className="label">
            {scene.kind} ahead, on a {scene.rank}-rank mission for {scene.client}
          </p>
          <h1>{scene.title}</h1>
        </div>
        <Vitals meters={header.meters} />
      </header>
      <main className="page encounter">
        <div className="feed">
          {scene.lines.map((line, i) =>
            line.kind === 'roll' ? (
              <p key={i} className={`roll ${line.success ? 'pass' : 'fail'}`}>
                <i aria-hidden="true">{line.success ? '✓' : '✗'}</i>
                {line.text}
              </p>
            ) : (
              <p key={i} className={line.kind === 'choice' ? 'you' : 'story'}>
                {line.text}
              </p>
            ),
          )}
        </div>
        <FieldNotes scene={scene} />
        <ScoutFirst scene={scene} perform={perform} />
        <WaysIn scene={scene} perform={perform} />
      </main>
      <nav className="choices" aria-label="Choices">
        {always.map((a) => (
          <button
            key={a.id}
            type="button"
            className={a.id === 'head-on' ? 'choice primary' : 'choice'}
            onClick={() => {
              perform(a.action);
            }}
          >
            <b>{a.label}</b>
            <small>{a.detail}</small>
          </button>
        ))}
      </nav>
    </>
  );
}
