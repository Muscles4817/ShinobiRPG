// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { creationView, type CreationDraft } from '@/game';
import { ctx, draft } from '@/test/gameFixtures';

import { NotesStep, QuirksStep, ReadBackStep } from './screens/creation/NotesSteps';

/** The academy file's special notes, habits and read-back pages. */
describe('the file’s notes (smoke test)', () => {
  const view = creationView(ctx);

  it('adds a note you tap, and shuts out one the standing has no room for', async () => {
    const user = userEvent.setup();
    const patches: Partial<CreationDraft>[] = [];
    const file = draft({ standing: 'dead-last', talentIds: [] });
    render(<NotesStep view={view} draft={file} update={(p) => patches.push(p)} ctx={ctx} />);
    expect(screen.getByRole('button', { name: /^Quick study/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /^Night owl/ }));
    expect(patches).toEqual([{ talentIds: ['night-owl'] }]);
  });

  it('takes habits freely, and reads the file back in words', async () => {
    const user = userEvent.setup();
    const patches: Partial<CreationDraft>[] = [];
    const file = draft({ quirkIds: ['hums'] });
    const { unmount } = render(
      <QuirksStep view={view} draft={file} update={(p) => patches.push(p)} ctx={ctx} />,
    );
    await user.click(screen.getByRole('button', { name: /^Terrible jokes/ }));
    expect(patches).toEqual([{ quirkIds: ['hums', 'bad-jokes'] }]);
    unmount();
    render(<ReadBackStep view={view} draft={file} update={() => undefined} ctx={ctx} />);
    expect(screen.getByText('How the road looks')).toBeInTheDocument();
    expect(screen.getByText(/Calm and lazy people will like you sooner/)).toBeInTheDocument();
  });
});
