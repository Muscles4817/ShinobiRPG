import { useEffect, useRef } from 'react';

import { examScene, headerView, type ExamChoice, type ExamScene as Scene } from '@/game';

import { ThreatChip } from '../../components/ThreatChip';
import { Vitals } from '../../components/Vitals';
import type { ScreenProps } from '../types';

/** The stages as stamps along the top: done, under way, still ahead. */
function StageStrip({ scene }: { readonly scene: Scene }) {
  return (
    <ol className="exam-stages" aria-label="Stages">
      {scene.stages.map((s) => (
        <li key={s.name} className={`exam-stage ${s.status}`}>
          {s.name}
        </li>
      ))}
    </ol>
  );
}

/** The examiners' verdict, written out like a slip from their book. */
function VerdictSlip({ verdict }: { readonly verdict: NonNullable<Scene['verdict']> }) {
  return (
    <section className="exam-verdict enter" aria-label="Verdict">
      <h2>{verdict.promoted ? 'Promoted' : 'Not this time'}</h2>
      <p className="chips">
        <span className="chip gain">
          {verdict.roundsWon === 1 ? 'One bout won' : `${verdict.roundsWon} bouts won`}
        </span>
        <span className={`chip ${verdict.conduct >= 0 ? 'gain' : 'harm'}`}>
          Conduct {verdict.conduct >= 0 ? '+' : ''}
          {verdict.conduct}
        </span>
      </p>
      {verdict.marks.length > 0 && (
        <ul className="exam-marks">
          {verdict.marks.map((m, i) => (
            <li key={i}>
              {m.text}
              <span className={`chip ${m.points >= 0 ? 'gain' : 'harm'}`}>
                {m.points >= 0 ? '+' : ''}
                {m.points}
              </span>
            </li>
          ))}
        </ul>
      )}
      {!verdict.promoted && <p className="exam-note">The examiners weigh conduct with results.</p>}
    </section>
  );
}

function ChoiceButton({ c, perform }: { readonly c: ExamChoice } & Pick<ScreenProps, 'perform'>) {
  return (
    <button
      type="button"
      className={c.primary ? 'choice primary' : 'choice'}
      disabled={c.blocker !== null}
      onClick={() => {
        perform(c.action);
      }}
    >
      <b>{c.label}</b>
      <span className="choice-side">
        {c.detail && <small>{c.detail}</small>}
        {c.risk && <span className="chip harm">{c.risk}</span>}
        {c.blocker && <small className="blocker">{c.blocker}</small>}
      </span>
    </button>
  );
}

/** Ways to answer a question: cards with their odds, the proctors' eye on the cheats. */
function Answers({
  answers,
  perform,
}: { readonly answers: readonly ExamChoice[] } & Pick<ScreenProps, 'perform'>) {
  if (answers.length === 0) return null;
  return (
    <section className="exam-answers" aria-label="Ways to answer">
      <div className="scout-grid">
        {answers.map((c) => (
          <button
            key={c.label}
            type="button"
            className="scout-card"
            disabled={c.blocker !== null}
            onClick={() => {
              perform(c.action);
            }}
          >
            <b>{c.label}</b>
            <small>{c.detail}</small>
            {c.risk && !c.blocker && <span className="chip harm">{c.risk}</span>}
            {c.blocker && <small className="blocker">{c.blocker}</small>}
          </button>
        ))}
      </div>
    </section>
  );
}

/** An exam takes over the screen: a stage strip, the story so far, then your choices. */
export function ExamScene({ ctx, state, perform }: ScreenProps) {
  const scene = examScene(state, ctx);
  const header = headerView(state, ctx);
  const end = useRef<HTMLDivElement>(null);
  const lineCount = scene?.lines.length ?? 0;
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [lineCount]);
  if (!scene) return null;
  const answers = scene.choices.filter((c) => c.action.type === 'examAnswer');
  const others = scene.choices.filter((c) => c.action.type !== 'examAnswer');
  return (
    <>
      <header className="scene-head">
        <h1>{scene.title}</h1>
        <StageStrip scene={scene} />
        <Vitals meters={header.meters} />
      </header>
      <main className="page feed">
        {scene.lines.map((line, i) =>
          line.kind === 'roll' ? (
            <p key={i} className={`roll ${line.success ? 'pass' : 'fail'}`}>
              <i aria-hidden="true">{line.success ? '✓' : '✗'}</i>
              {line.text}
            </p>
          ) : (
            <p
              key={i}
              className={
                line.kind === 'choice' ? 'you' : line.kind === 'outcome' ? 'story outcome' : 'story'
              }
            >
              {line.text}
            </p>
          ),
        )}
        {scene.prompt && <p className="story prompt enter">{scene.prompt}</p>}
        {scene.rival && (
          <p className="exam-rival enter">
            <b>{scene.rival.name}</b> waits in the ring.{' '}
            <ThreatChip threat={scene.rival.threat} label={scene.rival.label} />
          </p>
        )}
        {scene.verdict && <VerdictSlip verdict={scene.verdict} />}
        <Answers answers={answers} perform={perform} />
        <div ref={end} />
      </main>
      {others.length > 0 && (
        <nav className="choices" aria-label="Choices">
          {others.map((c) => (
            <ChoiceButton key={c.label} c={c} perform={perform} />
          ))}
        </nav>
      )}
    </>
  );
}
