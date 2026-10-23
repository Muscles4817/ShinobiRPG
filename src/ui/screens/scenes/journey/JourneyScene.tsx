import { headerView, journeyView, missionScene } from '@/game';

import { Vitals } from '../../../components/Vitals';
import { KeyHint } from '../../../layout/KeyHint';
import { Pane } from '../../../layout/Pane';
import { useChoiceKeys } from '../../../layout/useChoiceKeys';
import { useWideScreen } from '../../../layout/useWideScreen';
import type { ScreenProps } from '../../types';
import { MissionStory } from '../MissionStory';
import { Threads } from '../StoryLines';
import { ArrivalCard } from './ArrivalCard';
import { JourneyMap } from './JourneyMap';
import { useSealTravel } from './useSealTravel';

/** The only way on is the primary one: 1 or Enter takes it. */
const ONLY_WAY = [{ primary: true }];

interface OneChoiceProps {
  readonly label: string;
  readonly onChoose: () => void;
  readonly wide: boolean;
}

/** A single way on, for the bar under the story: skipping the walk, or walking in. */
function OneChoice({ label, onChoose, wide }: OneChoiceProps) {
  useChoiceKeys(ONLY_WAY, onChoose, wide);
  return (
    <nav className="choices" aria-label="Choices">
      <button
        type="button"
        className="choice primary"
        aria-keyshortcuts={wide ? '1' : undefined}
        onClick={onChoose}
      >
        {wide && <KeyHint index={0} />}
        <b>{label}</b>
      </button>
    </nav>
  );
}

/**
 * A trip of your own: the road on the map, and beside it (on a phone, under it) where it goes,
 * its stretches, the story of the road and your choices. The map walks your seal on as each leg
 * is done, so going somewhere plays like the montage in an adventure film; what the road brings
 * waits until the seal gets there, and at the end the place you reach is a title card.
 */
export function JourneyScene({ ctx, state, perform }: ScreenProps) {
  const scene = missionScene(state, ctx);
  const view = journeyView(state, ctx);
  const header = headerView(state, ctx);
  const wide = useWideScreen();
  const travel = useSealTravel(view?.seal ?? 0, state.settings.animations);
  if (!view) return null;
  const arrived = view.arrival !== null && !travel.moving ? view.arrival : null;
  return (
    <>
      <Pane name="map">
        <JourneyMap view={view} date={header.date} slot={header.slot} travel={travel}>
          {arrived && <ArrivalCard arrival={arrived} slot={header.slot} />}
        </JourneyMap>
      </Pane>
      <Pane name="story">
        <header className="journey-head">
          {scene && <p className="label">{scene.kicker}</p>}
          <h1>{view.title}</h1>
          <ol className="journey-legs" aria-label="The road's stretches">
            {view.legs.map((leg, i) => (
              <li
                key={i}
                className={i < view.walked ? 'done' : i === view.walked ? 'now' : undefined}
              >
                {leg.caption}
              </li>
            ))}
          </ol>
          <Vitals meters={header.meters} />
        </header>
        {scene && <Threads threads={scene.threads} />}
        {travel.moving ? (
          // What the road brings waits until the seal gets there.
          <OneChoice label="Skip ahead" onChoose={travel.skip} wide={wide} />
        ) : arrived ? (
          <OneChoice
            label={arrived.enter}
            onChoose={() => {
              perform({ type: 'leaveJourney' });
            }}
            wide={wide}
          />
        ) : (
          scene && <MissionStory scene={scene} perform={perform} wide={wide} />
        )}
      </Pane>
    </>
  );
}
