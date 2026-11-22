// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { combatScene, fightReplay, SEEN_IN_FULL } from '@/game';
import { act, ctx, newGame, withAllStats } from '@/test/gameFixtures';
import { divider, said, stand } from '@/test/story';

import { WatchScreen } from './WatchScreen';

/** The stage keeps to the story: no one on it before the line that brings them. */

function sparView() {
  const sparring = act(withAllStats(newGame(), 7), { type: 'spar', personId: 'kaen' });
  return combatScene(act(sparring, { type: 'combatAct', optionId: 'begin' }), ctx)!;
}

describe('the watch screen’s stage (smoke test)', () => {
  it('shows a shadow clone only from the line that made it, and the hit only as it lands', async () => {
    const base = sparView();
    const you = base.combatants.find((c) => c.side === 'player')!;
    const clone = { ...you, id: 'clone-1', name: 'Shadow Clone', health: 100 };
    const view = {
      ...base,
      combatants: [...base.combatants, clone],
      story: [
        stand('player', { health: 100 }),
        stand('person:kaen', { health: 100 }),
        divider(),
        said('You step in.', 'player'),
        { kind: 'join' as const, who: 'clone-1', pools: { chakra: 20, health: 100 }, statuses: [] },
        said('You split into shadow clones.', 'player'),
      ],
      storyOffset: 0,
    };
    const user = userEvent.setup();
    render(
      <WatchScreen
        view={view}
        beats={fightReplay(view, 0)}
        fresh
        waiting={false}
        reads={{}}
        onPick={() => undefined}
        onWatched={() => undefined}
        onPlan={null}
        onLeave={null}
        before={base.combatants}
        sightOf={() => SEEN_IN_FULL}
      />,
    );
    const stage = within(screen.getByRole('region', { name: 'Both sides' }));
    expect(stage.queryByLabelText('Shadow Clone')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Skip' }));
    expect(stage.getByLabelText('Shadow Clone')).toBeInTheDocument();
  });
});
