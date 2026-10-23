import { headerView, journeyView, missionScene } from '@/game';

import { Vitals } from '../../../components/Vitals';
import { Pane } from '../../../layout/Pane';
import { useWideScreen } from '../../../layout/useWideScreen';
import type { ScreenProps } from '../../types';
import { JobSoFar } from '../JobSoFar';
import { MissionStory } from '../MissionStory';
import { OneChoice } from '../OneChoice';
import { Threads } from '../StoryLines';
import { ArrivalCard } from './ArrivalCard';
import { JourneyMap, legsPassed } from './JourneyMap';
import { useSealTravel } from './useSealTravel';

const SKIP = 'Skip ahead';

/** A job keeps its crew and what has gone on so far in view, as its own scene does. */
function JobBeside({ ctx, state }: Pick<ScreenProps, 'ctx' | 'state'>) {
  if (!state.mission || state.mission.journey) return null;
  return (
    <div className="journey-job">
      <JobSoFar ctx={ctx} state={state} />
    </div>
  );
}

/**
 * A trip of your own, or a job on its road: the road on the map, and beside it (on a phone, under it) where it goes,
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
  const passed = legsPassed(view, travel.shown);
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
              <li key={i} className={i < passed ? 'done' : i === passed ? 'now' : undefined}>
                {leg.caption}
              </li>
            ))}
          </ol>
          <Vitals meters={header.meters} />
        </header>
        {scene && <Threads threads={scene.threads} />}
        {arrived ? (
          <OneChoice
            label={arrived.enter}
            onChoose={() => {
              perform({ type: 'leaveJourney' });
            }}
            wide={wide}
          />
        ) : scene ? (
          // What the road brings waits until the seal gets there.
          <MissionStory
            scene={scene}
            perform={perform}
            wide={wide}
            {...(travel.moving ? { held: { label: SKIP, onSkip: travel.skip } } : {})}
          />
        ) : (
          travel.moving && <OneChoice label={SKIP} onChoose={travel.skip} wide={wide} />
        )}
        {wide && <JobBeside ctx={ctx} state={state} />}
      </Pane>
    </>
  );
}
