import { techniquesPage, toggledTechnique, type GameContext, type TaughtCard } from '@/game';

import { TechniqueCard } from '../../components/TechniqueCard';
import type { StepProps } from './types';

interface TechniquesStepProps extends StepProps {
  readonly ctx: GameContext;
}

const ART_LABEL: Readonly<Record<TaughtCard['discipline'], string>> = {
  taijutsu: 'Taijutsu',
  ninjutsu: 'Ninjutsu',
  genjutsu: 'Genjutsu',
  kenjutsu: 'Kenjutsu',
  fuuinjutsu: 'Fūinjutsu',
};

function detailOf(card: TaughtCard): string {
  return card.fromClan ? `Your clan’s art. ${card.description}` : card.description;
}

/** What the academy taught you: the basics, then the techniques you chose at your grades. */
export function TechniquesStep({ draft, update, ctx }: TechniquesStepProps) {
  const page = techniquesPage(draft, ctx);
  return (
    <div className="step taught">
      <section className="opt-list">
        <h3 className="note-group">Every graduate knows</h3>
        <ul className="taught-basics">
          {page.basics.map((card) => (
            <li key={card.id}>
              <TechniqueCard
                name={card.name}
                detail={detailOf(card)}
                discipline={card.discipline}
                rank={card.rank}
              />
            </li>
          ))}
        </ul>
      </section>
      <div className="note-room">
        <p>{page.allowance}</p>
        <small className="num">
          {page.chosen} of {page.picks} chosen
        </small>
      </div>
      {page.groups.map((group) => (
        <section key={group.discipline} className="opt-list">
          <h3 className="note-group">{ART_LABEL[group.discipline]}</h3>
          {group.cards.map((card) => (
            <button
              key={card.id}
              type="button"
              className={`taught-pick${card.selected ? ' selected' : ''}`}
              aria-pressed={card.selected}
              aria-label={`${card.selected ? 'Put back' : 'Choose'} ${card.name}`}
              onClick={() => {
                update({ techniqueIds: toggledTechnique(draft, card.id, ctx) });
              }}
            >
              <TechniqueCard
                name={card.name}
                detail={detailOf(card)}
                discipline={card.discipline}
                rank={card.rank}
                ghost={!card.selected}
              />
            </button>
          ))}
        </section>
      ))}
    </div>
  );
}
