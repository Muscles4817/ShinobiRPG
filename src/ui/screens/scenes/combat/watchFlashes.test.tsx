// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { combatScene, SEEN_IN_FULL, type FightBeat } from '@/game';
import { act, ctx, newGame, withAllStats } from '@/test/gameFixtures';

import type * as SoundModule from '../../../audio/SoundProvider';
import { WatchScreen } from './WatchScreen';

/** A replay's flashes and sounds come from its beats, and only going on: stepping back is quiet. */

const played = vi.hoisted(() => vi.fn());

vi.mock('../../../audio/SoundProvider', async (importOriginal) => {
  const real = await importOriginal<typeof SoundModule>();
  return { ...real, useSound: () => ({ ...real.useSound(), play: played }) };
});

function beat(over: Partial<FightBeat>): FightBeat {
  return {
    kind: 'line',
    text: 'Something happens.',
    chips: [],
    actorId: null,
    targetId: null,
    range: 'close',
    force: null,
    health: {},
    pools: {},
    statuses: {},
    present: [],
    ...over,
  };
}

function sparView() {
  const sparring = act(withAllStats(newGame(), 7), { type: 'spar', personId: 'kaen' });
  return combatScene(act(sparring, { type: 'combatAct', optionId: 'begin' }), ctx)!;
}

describe('the watch screen’s flashes and sounds', () => {
  it('flashes and sounds a hit going on, and neither going back', async () => {
    const view = sparView();
    const you = view.combatants.find((c) => c.side === 'player')!.id;
    const foe = view.combatants.find((c) => c.side === 'enemy')!.id;
    const beats = [
      beat({ kind: 'divider', text: 'First exchange', health: { [you]: 100, [foe]: 100 } }),
      beat({
        text: 'You hit them.',
        actorId: you,
        targetId: foe,
        health: { [you]: 100, [foe]: 70 },
      }),
      beat({
        text: 'They hit you.',
        actorId: foe,
        targetId: you,
        health: { [you]: 80, [foe]: 70 },
      }),
      beat({ text: 'Both step back.', health: { [you]: 80, [foe]: 70 } }),
    ];
    const user = userEvent.setup();
    const { container } = render(
      <WatchScreen
        view={view}
        beats={beats}
        fresh
        waiting={false}
        reads={{}}
        onPick={() => undefined}
        onWatched={() => undefined}
        onPlan={null}
        onLeave={null}
        before={view.combatants}
        sightOf={() => SEEN_IN_FULL}
      />,
    );
    const flashing = (kind: string) => container.querySelectorAll(`[data-pulse="${kind}"]`).length;
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await user.click(screen.getByRole('button', { name: 'On a beat' }));
    expect(flashing('hurt')).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'On a beat' }));
    expect(flashing('hurt')).toBeGreaterThan(0);
    const sounded = played.mock.calls.length;

    await user.click(screen.getByRole('button', { name: 'Back a beat' }));
    expect(flashing('healed')).toBe(0);
    expect(flashing('hurt')).toBe(0);
    expect(played.mock.calls.length).toBe(sounded);
  });
});
