import { headerView, missionScene } from '@/game';

import { Backdrop } from '../../art/Backdrop';
import { Vitals } from '../../components/Vitals';
import { Pane } from '../../layout/Pane';
import { useWideScreen } from '../../layout/useWideScreen';
import type { ScreenProps } from '../types';
import { JobSoFar, RouteStrip } from './JobSoFar';
import { MissionStory } from './MissionStory';
import { Threads } from './StoryLines';

/**
 * A job in the field: the route ahead, the threads it keeps, the latest beat of the story (the
 * rest folded away), the situation now on a card near the thumb, and your choices. On a wide
 * screen the road, the story and the job as it stands sit side by side.
 */
export function MissionScene({ ctx, state, perform }: ScreenProps) {
  const scene = missionScene(state, ctx);
  const header = headerView(state, ctx);
  const wide = useWideScreen();
  if (!scene) return null;
  return (
    <>
      <Pane name="road">
        <header
          className="scene-head vignette sky"
          data-slot={header.slot}
          data-land={header.backdrop}
        >
          <Backdrop id={header.backdrop} />
          <div className="vignette-text">
            <p className="label">{scene.kicker}</p>
            <h1>{scene.title}</h1>
          </div>
          {!wide && <RouteStrip route={scene.route} />}
          {!wide && <Vitals meters={header.meters} />}
        </header>
        {wide && <RouteStrip route={scene.route} />}
        {wide && <Vitals meters={header.meters} />}
      </Pane>
      <Pane name="job">
        <Threads threads={scene.threads} />
        {wide && <JobSoFar ctx={ctx} state={state} />}
      </Pane>
      <Pane name="story">
        <MissionStory scene={scene} perform={perform} wide={wide} />
      </Pane>
    </>
  );
}
