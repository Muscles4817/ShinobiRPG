import type { Choice, ContestOffer, GameAction, RivalryView } from '@/game';

const pct = (share: number) => `${Math.round(share * 100)}%`;

interface RivalrySectionProps {
  readonly view: RivalryView;
  readonly perform: (action: GameAction) => void;
  readonly onClose: () => void;
}

interface StakeButtonProps {
  readonly label: string;
  readonly choice: Choice;
  readonly go: (action: GameAction) => void;
}

function StakeButton({ label, choice, go }: StakeButtonProps) {
  return (
    <button
      type="button"
      className="btn ghost"
      disabled={choice.blocker !== null}
      title={choice.blocker ?? undefined}
      onClick={() => {
        go(choice.action);
      }}
    >
      {label}
    </button>
  );
}

function Offer({
  offer,
  purse,
  go,
}: {
  readonly offer: ContestOffer;
  readonly purse: number;
  readonly go: (action: GameAction) => void;
}) {
  return (
    <li className="rival-offer">
      <span className="rival-offer-head">
        <b>{offer.name}</b>
        <span className="rival-shape">{offer.edge}</span>
      </span>
      <small>{offer.note}</small>
      <span className="rival-offer-acts">
        <StakeButton label="For pride" choice={offer.pride} go={go} />
        <StakeButton label={`For a purse of ${purse} ryo`} choice={offer.purse} go={go} />
      </span>
    </li>
  );
}

/**
 * The rivalry on your rival's sheet: who they are to you, the tally, side by side, the heat,
 * settling it on your terms, and the ways to close the gap.
 */
export function RivalrySection({ view, perform, onClose }: RivalrySectionProps) {
  const go = (action: GameAction) => {
    perform(action);
    onClose();
  };
  const blocker = view.offers[0]?.pride.blocker ?? view.offers[0]?.purse.blocker ?? null;
  return (
    <section className="rivalry" aria-label="Rivalry">
      <h3>
        Rivalry <span className="rival-shape">{view.shape}</span>
      </h3>
      <p className="story">{view.who}</p>
      <table className="rival-tally">
        <thead>
          <tr>
            <th />
            <th>You</th>
            <th>Them</th>
          </tr>
        </thead>
        <tbody>
          {view.tally.map((t) => (
            <tr key={t.label}>
              <td>{t.label}</td>
              <td className={t.score.you > t.score.them ? 'lead' : undefined}>{t.score.you}</td>
              <td className={t.score.them > t.score.you ? 'lead' : undefined}>{t.score.them}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4>Side by side</h4>
      {view.side.map((s) => (
        <div key={s.name} className="rival-side">
          <span className="rival-grade">{s.yours.grade}</span>
          <span className="rival-bar mine" aria-hidden="true">
            <i style={{ width: pct(s.yours.share) }} />
          </span>
          <span>{s.name}</span>
          <span className="rival-bar theirs" aria-hidden="true">
            <i style={{ width: pct(s.theirs.share) }} />
          </span>
          <span className="rival-grade theirs">{s.theirs.grade}</span>
        </div>
      ))}
      <h4>How hot it runs</h4>
      <ol className="rival-heat">
        {view.heat.stages.map((stage, i) => (
          <li key={stage} className={i === view.heat.at ? 'on' : undefined}>
            {stage}
          </li>
        ))}
      </ol>
      {view.driven && <p className="story">{view.driven}</p>}
      {view.next && <p className="story rival-next">{view.next}</p>}
      <h4>Settle it</h4>
      <ul className="rival-offers">
        {view.offers.map((o) => (
          <Offer key={o.contest} offer={o} purse={view.purse} go={go} />
        ))}
      </ul>
      {blocker && <small className="rival-slip-why">{blocker}</small>}
      <h4>Closing the gap</h4>
      <ul className="rival-ways">
        {view.ways.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </section>
  );
}
