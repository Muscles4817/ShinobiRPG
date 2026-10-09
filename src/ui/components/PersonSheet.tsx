import { personSheet, type GameAction, type GameContext, type GameState } from '@/game';

import { Portrait } from '../art/Portrait';
import { BondMeter } from './BondMeter';

interface PersonSheetProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly personId: string;
  readonly perform: (action: GameAction) => void;
  readonly onClose: () => void;
}

const RELATION_LABEL = { sensei: 'Your sensei', teammate: 'Your teammate' } as const;

/** Someone's page: who they are, how close you are, what they're like, and a way to talk. */
export function PersonSheet({ ctx, state, personId, perform, onClose }: PersonSheetProps) {
  const p = personSheet(state, ctx, personId);
  if (!p) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section
        className="sheet person-sheet enter"
        aria-label={p.fullName}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="person-top">
          <span className={p.relation ? 'person-photo team' : 'person-photo'}>
            <Portrait appearance={p.appearance} size={72} />
          </span>
          <div>
            <p className="label">{p.relation ? RELATION_LABEL[p.relation] : p.title}</p>
            <h2>{p.fullName}</h2>
            <p className="person-tags">
              {p.specialty && (
                <span className={`badge d-${p.specialty.id}`}>{p.specialty.label}</span>
              )}
              {p.clan && <span className="chip">{p.clan}</span>}
              <span className="chip">{p.where}</span>
            </p>
          </div>
        </div>
        <BondMeter stageName={p.stageName} progress={p.progress} />
        <p className="story">{p.bio}</p>
        {p.traits && (
          <dl className="person-traits">
            {p.traits.map((t) => (
              <div key={t.name}>
                <dt>{t.name}</dt>
                <dd>{t.note}</dd>
              </div>
            ))}
          </dl>
        )}
        {p.likes && p.dislikes && (
          <p className="chips">
            {p.likes.map((t) => (
              <span key={t} className="chip gain">
                Likes {t.toLowerCase()}
              </span>
            ))}
            {p.dislikes.map((t) => (
              <span key={t} className="chip harm">
                Dislikes {t.toLowerCase()}
              </span>
            ))}
          </p>
        )}
        {p.reveal && <p className="muted small">{p.reveal}</p>}
        {p.talk.blocker && <p className="blocker">{p.talk.blocker}</p>}
        <button
          type="button"
          className="btn wide"
          disabled={p.talk.blocker !== null}
          onClick={() => {
            perform(p.talk.action);
            onClose();
          }}
        >
          Talk to {p.name}
        </button>
      </section>
    </div>
  );
}
