import {
  furnishView,
  homeRoomsView,
  keepsakeShelf,
  type Choice,
  type GameAction,
  type HomeRoomsView,
  type SpotView,
} from '@/game';

import type { PlaceProps } from '../types';

type Perform = (action: GameAction) => void;

function Act({
  label,
  choice,
  perform,
  ghost = false,
}: {
  readonly label: string;
  readonly choice: Choice;
  readonly perform: Perform;
  readonly ghost?: boolean;
}) {
  return (
    <button
      type="button"
      className={`btn${ghost ? ' ghost' : ''}`}
      disabled={choice.blocker !== null}
      title={choice.blocker ?? undefined}
      onClick={() => {
        perform(choice.action);
      }}
    >
      {label}
    </button>
  );
}

function SpotRow({ spot, perform }: { readonly spot: SpotView; readonly perform: Perform }) {
  const spare = spot.options.filter((o) => !o.placed);
  return (
    <li className="spot-row">
      <span className="spot-head">
        <b>{spot.label}</b>
        <span>{spot.piece ?? 'Empty'}</span>
      </span>
      {spare.map((o) => (
        <span key={o.id} className="spot-option">
          <span>
            {o.name}
            <small>{o.does}</small>
          </span>
          <Act label="Set it here" choice={o.place} perform={perform} ghost />
        </span>
      ))}
    </li>
  );
}

function Furnish({ ctx, state, perform }: PlaceProps) {
  const view = furnishView(state, ctx);
  return (
    <section id="furnish" className="room-slip home-make">
      <h2>Furnishing</h2>
      <ul className="spots">
        {view.spots.map((s) => (
          <SpotRow key={s.spot} spot={s} perform={perform} />
        ))}
      </ul>
      <p className="muted small">
        New pieces come from the joiner by the lettings office, or as gifts.
      </p>
      <h3>How it feels</h3>
      <ol
        className="comfort-steps"
        aria-label={`How it feels: ${view.comfort.steps[view.comfort.at] ?? ''}`}
      >
        {view.comfort.steps.map((step, i) => (
          <li key={step} className={i <= view.comfort.at ? 'on' : undefined} title={step} />
        ))}
      </ol>
      <p className="story">
        <b>{view.comfort.steps[view.comfort.at]}.</b> {view.comfort.line}
      </p>
    </section>
  );
}

function Shelf({ ctx, state }: Pick<PlaceProps, 'ctx' | 'state'>) {
  const shelf = keepsakeShelf(state, ctx);
  return (
    <section id="keepsakes" className="room-slip home-make">
      <h2>The keepsake shelf</h2>
      <p className="muted small">
        Things you didn’t buy. Each one is a day you’d rather not forget.
      </p>
      <ul className="keepsakes">
        {shelf.keepsakes.map((k) => (
          <li key={`${k.name}${k.line}`}>
            <b>{k.name}</b>
            <span>{k.line}</span>
          </li>
        ))}
        {shelf.next && <li className="empty">{shelf.next}</li>}
      </ul>
    </section>
  );
}

function Garden({
  garden,
  perform,
}: {
  readonly garden: NonNullable<HomeRoomsView['garden']>;
  readonly perform: Perform;
}) {
  return (
    <section className="room-slip home-make">
      <h2>The garden</h2>
      <ul className="beds">
        {garden.beds.map((bed, i) => (
          <li key={i} className={bed.ripe ? 'ripe' : bed.crop ? undefined : 'empty'}>
            <b>{bed.crop ?? 'Empty bed'}</b>
            <span>{bed.state ?? 'Plant something'}</span>
            {bed.pick && <Act label="Pick" choice={bed.pick} perform={perform} />}
          </li>
        ))}
      </ul>
      <h3>Seed for this season</h3>
      <ul className="seeds">
        {garden.seeds.map((seed) => (
          <li key={seed.name}>
            <span>{seed.name}</span>
            <span className="chip cost">{seed.cost} ryo</span>
            {seed.plant && <Act label="Plant" choice={seed.plant} perform={perform} ghost />}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Yard({
  yard,
  perform,
}: {
  readonly yard: NonNullable<HomeRoomsView['yard']>;
  readonly perform: Perform;
}) {
  return (
    <section className="room-slip home-make">
      <h2>The yard</h2>
      <p className="muted small">No walk there and back: drills here tire you less.</p>
      <span className="yard-drills">
        {yard.map((d) => (
          <Act key={d.name} label={d.name} choice={d.train} perform={perform} ghost />
        ))}
      </span>
    </section>
  );
}

function Guest({
  guest,
  perform,
}: {
  readonly guest: NonNullable<HomeRoomsView['guest']>;
  readonly perform: Perform;
}) {
  return (
    <section className="room-slip home-make">
      <h2>The guest room</h2>
      {guest.staying ? (
        <>
          <p className="story">{guest.staying} is staying, and is home every evening and night.</p>
          <Act
            label={`Send ${guest.staying} home`}
            choice={guest.sendHome}
            perform={perform}
            ghost
          />
        </>
      ) : (
        <>
          <p className="muted small">A friend can stay: they are home every evening and night.</p>
          <span className="yard-drills">
            {guest.invite.map((g) => (
              <Act key={g.name} label={`Ask ${g.name}`} choice={g.choice} perform={perform} ghost />
            ))}
          </span>
          {guest.invite.length === 0 && (
            <p className="muted small">No friend close enough to ask yet.</p>
          )}
        </>
      )}
    </section>
  );
}

/** What makes the place yours: furniture, keepsakes, and the rooms a bigger home opens. */
export function HomeMaking(props: PlaceProps) {
  const rooms = homeRoomsView(props.state, props.ctx);
  return (
    <>
      <Furnish {...props} />
      {rooms.garden && <Garden garden={rooms.garden} perform={props.perform} />}
      {rooms.yard && <Yard yard={rooms.yard} perform={props.perform} />}
      {rooms.guest && <Guest guest={rooms.guest} perform={props.perform} />}
      <Shelf ctx={props.ctx} state={props.state} />
    </>
  );
}
