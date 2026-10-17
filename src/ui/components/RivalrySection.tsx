import type { RivalryView } from '@/game';

const pct = (share: number) => `${Math.round(share * 100)}%`;

/** The rivalry on your rival's sheet: who they are to you, the tally, side by side, the heat. */
export function RivalrySection({ view }: { readonly view: RivalryView }) {
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
      {view.next && <p className="story rival-next">{view.next}</p>}
    </section>
  );
}
