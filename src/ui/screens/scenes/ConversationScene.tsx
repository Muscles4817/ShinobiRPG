import { conversationScene } from '@/game';

import { Portrait } from '../../art/Portrait';
import { BondMeter } from '../../components/BondMeter';
import { Chips } from '../../components/Chips';
import type { ScreenProps } from '../types';

/** A short talk: they speak, you pick a reply (its tone shown), they answer. */
export function ConversationScene({ ctx, state, perform }: ScreenProps) {
  const scene = conversationScene(state, ctx);
  if (!scene) return null;
  const { person, answer } = scene;
  const chips = answer
    ? [
        {
          label: `${answer.delta > 0 ? '+' : ''}${answer.delta} bond`,
          tone: answer.delta > 0 ? 'gain' : 'harm',
        },
        ...(answer.newStage ? [{ label: answer.newStage, tone: 'gain' }] : []),
      ]
    : [];
  return (
    <>
      <header className="scene-head talk-head">
        <span className={person.relation ? 'person-photo team' : 'person-photo'}>
          <Portrait appearance={person.appearance} size={56} />
        </span>
        <div>
          <p className="label">{person.title}</p>
          <h1>{person.fullName}</h1>
          <BondMeter stageName={person.stageName} progress={person.progress} />
        </div>
      </header>
      <main className="page feed">
        <p className="story enter">{scene.opener}</p>
        {answer && (
          <>
            <p className="you">{answer.said}</p>
            <p className="story outcome enter">{answer.reply}</p>
            <Chips chips={chips} />
          </>
        )}
      </main>
      <nav className="choices" aria-label="Replies">
        {answer ? (
          <button
            type="button"
            className="choice primary"
            onClick={() => {
              perform(scene.leave);
            }}
          >
            <b>Say goodbye</b>
          </button>
        ) : (
          scene.choices.map((c) => (
            <button
              key={c.label}
              type="button"
              className="choice"
              onClick={() => {
                perform(c.action);
              }}
            >
              <b>{c.label}</b>
              <small>{c.tone}</small>
            </button>
          ))
        )}
      </nav>
    </>
  );
}
