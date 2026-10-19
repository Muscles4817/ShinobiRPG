// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { createNewGame, creationView } from '@/game';
import { ctx, draft } from '@/test/gameFixtures';

import { HiveCard } from './components/HiveCard';
import { UpbringingStep } from './screens/creation/FrameSteps';

/** The hive on the Shinobi tab (smoke test). */
describe('the hive card (smoke test)', () => {
  it('shows the strain, what it took and how full it is', () => {
    const state = createNewGame(
      { draft: draft({ clanId: 'toga', hiveShare: 'most' }), seed: 1 },
      ctx,
    );
    render(<HiveCard ctx={ctx} state={state} />);
    expect(screen.getByRole('heading', { name: 'Lantern Moths' })).toBeTruthy();
    expect(screen.getByText('It took most of your chakra.')).toBeTruthy();
    expect(screen.getByText('Full')).toBeTruthy();
  });

  it('shows nothing without a hive', () => {
    const state = createNewGame({ draft: draft(), seed: 1 }, ctx);
    const { container } = render(<HiveCard ctx={ctx} state={state} />);
    expect(container.textContent).toBe('');
  });
});

describe('the hive share at creation (smoke test)', () => {
  it('offers a child of a hive clan three shares, and none to anyone else', async () => {
    const user = userEvent.setup();
    const picked: unknown[] = [];
    const view = creationView(ctx);
    const { unmount } = render(
      <UpbringingStep
        view={view}
        draft={draft({ clanId: 'toga' })}
        update={(p) => picked.push(p)}
      />,
    );
    await user.click(screen.getByRole('button', { name: /^Most/ }));
    expect(picked).toContainEqual({ hiveShare: 'most' });
    unmount();
    render(<UpbringingStep view={view} draft={draft()} update={() => undefined} />);
    expect(screen.queryByRole('heading', { name: 'The hive' })).toBeNull();
  });
});
