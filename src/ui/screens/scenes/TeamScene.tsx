import { teamScene, type PersonCard, type SenseiOffer } from '@/game';

import { Portrait } from '../../art/Portrait';
import type { ScreenProps } from '../types';

function Teammate({ card }: { readonly card: PersonCard }) {
  return (
    <div className="mate">
      <Portrait appearance={card.appearance} size={56} />
      <b>{card.name}</b>
      {card.specialty && (
        <span className={`badge d-${card.specialty.id}`}>{card.specialty.label}</span>
      )}
    </div>
  );
}

interface SenseiCardProps {
  readonly offer: SenseiOffer;
  readonly onChoose: () => void;
}

function SenseiCard({ offer, onChoose }: SenseiCardProps) {
  const discipline = offer.specialty ? `d-${offer.specialty.id}` : '';
  return (
    <article className={`sensei-card ${discipline}`}>
      <div className="person-top">
        <span className="person-photo">
          <Portrait appearance={offer.appearance} size={64} />
        </span>
        <div>
          <p className="label">{offer.title}</p>
          <h2>{offer.fullName}</h2>
          <p className="person-tags">
            {offer.specialty && <span className="badge">{offer.specialty.label}</span>}
            {offer.nature && <span className="chip">{offer.nature}</span>}
          </p>
        </div>
      </div>
      <p className="story">{offer.style}</p>
      <p className="chips">
        {offer.reasons.map((r) => (
          <span key={r} className="chip gain">
            {r}
          </span>
        ))}
      </p>
      <button type="button" className="btn wide" onClick={onChoose}>
        Train under {offer.name}
      </button>
    </article>
  );
}

/** The morning after graduation: hear your team, then choose between two senseis. */
export function TeamScene({ ctx, state, perform }: ScreenProps) {
  const scene = teamScene(state, ctx);
  if (!scene) return null;
  const { assign } = scene;
  return (
    <>
      <header className="scene-head">
        <p className="label">The morning after graduation</p>
        <h1>Team assignment</h1>
      </header>
      <main className="page feed">
        <p className="story enter">{scene.intro}</p>
        {scene.teammates.length > 0 && (
          <>
            <div className="mates enter">
              {scene.teammates.map((t) => (
                <Teammate key={t.id} card={t} />
              ))}
            </div>
            <p className="story">{scene.choose}</p>
            {scene.senseis.map((s) => (
              <SenseiCard
                key={s.id}
                offer={s}
                onChoose={() => {
                  perform(s.choose);
                }}
              />
            ))}
          </>
        )}
      </main>
      {assign && (
        <nav className="choices" aria-label="Choices">
          <button
            type="button"
            className="choice primary"
            onClick={() => {
              perform(assign);
            }}
          >
            <b>Hear the teams</b>
          </button>
        </nav>
      )}
    </>
  );
}
