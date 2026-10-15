// @vitest-environment jsdom
import { act as settle, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { CombatantView, GameAction } from '@/game';
import { act, ctx, newGame } from '@/test/gameFixtures';

import { CueLayer } from './components/CueLayer';
import { SettingsPanel } from './screens/SettingsPanel';
import { useHealthPulses } from './screens/scenes/combat/useHealthPulses';

/** The settings on the Shinobi tab, and the cue that plays after an action. */

describe('animations (smoke test)', () => {
  it('switches animations off, and offers them back once off', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    const { unmount } = render(
      <SettingsPanel ctx={ctx} state={newGame()} perform={(a) => done.push(a)} />,
    );
    await user.click(screen.getByRole('button', { name: /Animations on/ }));
    expect(done).toEqual([{ type: 'setAnimations', on: false }]);
    unmount();

    const off = act(newGame(), { type: 'setAnimations', on: false });
    render(<SettingsPanel ctx={ctx} state={off} perform={(a) => done.push(a)} />);
    expect(screen.getByRole('button', { name: /Animations off/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('offers the map styles, with the washi chart in use on a fresh game', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    render(<SettingsPanel ctx={ctx} state={newGame()} perform={(a) => done.push(a)} />);
    expect(screen.getByRole('button', { name: /Washi chart/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(screen.getByRole('button', { name: /Lantern night/ }));
    expect(done).toEqual([{ type: 'setMapStyle', style: 'night' }]);
  });

  it('draws the cue for the action and clears it when it has played', () => {
    vi.useFakeTimers();
    const cleared: string[] = [];
    const { container } = render(
      <CueLayer cue={{ kind: 'sleep', id: 1 }} onDone={() => cleared.push('done')} />,
    );
    const layer = container.querySelector('.cue-layer');
    expect(layer).toHaveAttribute('data-cue', 'sleep');
    expect(container.querySelector('.cue-night')).not.toBeNull();
    expect(cleared).toEqual([]);
    settle(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(cleared).toEqual(['done']);
    vi.useRealTimers();
  });

  it('flashes a fighter’s bar each time their health moves in a fight', () => {
    const fighter = (health: number): CombatantView => ({
      id: 'foe',
      name: 'Bandit',
      side: 'enemy',
      health,
      maxHealth: 100,
      chakra: 0,
      maxChakra: 0,
      statuses: [],
    });
    const { result, rerender } = renderHook(({ hp }) => useHealthPulses([fighter(hp)]), {
      initialProps: { hp: 100 },
    });
    expect(result.current).toEqual({});
    rerender({ hp: 80 });
    expect(result.current.foe).toEqual({ kind: 'hurt', n: 1 });
    rerender({ hp: 80 });
    expect(result.current.foe).toEqual({ kind: 'hurt', n: 1 });
    rerender({ hp: 70 });
    expect(result.current.foe).toEqual({ kind: 'hurt', n: 2 });
    rerender({ hp: 85 });
    expect(result.current.foe).toEqual({ kind: 'healed', n: 3 });
  });
});
