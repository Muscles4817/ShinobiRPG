import { CONTENT_PACKS } from '@/content';
import { arcPlayer } from '@/test/arcPlay';
import { ctx } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { arcNote, arcsView } from './views/arcs';
import { missionBoardView } from './views/boards';
import { missionScene } from './views/missionScene';

/**
 * What the player is told about a long story's rules where they decide: the card's rule and
 * leads, what a job's notice says it will close, and a closed choice that says why.
 */

const naruto = createGameContext(CONTENT_PACKS.find((p) => p.id === 'naruto')!);

describe('leads on the board', () => {
  const { ready, play } = arcPlayer(ctx);

  it('keeps the act before’s leads, done or not, and says what closes them', () => {
    const vats = play(ready(), 'arc-brewer-sour-vats');
    const card = arcsView(vats, ctx).find((a) => a.id === 'the-brewers-ghost')!;
    expect(card.rule).toMatchObject({ stamp: '手', label: 'Any lead will do' });
    expect(card.leads).toEqual([]);

    const oneLead = play(vats, 'arc-brewer-old-hands', ['Ask what the first wife was like']);
    const next = arcsView(oneLead, ctx).find((a) => a.id === 'the-brewers-ghost')!;
    expect(next.jobs.map((j) => j.title)).toEqual(['The Night of the Ghost']);
    expect(next.leads.filter((l) => l.done).map((l) => l.title)).toEqual([
      'The Brewery’s Old Hands',
    ]);
    expect(next.leadsNote).toBe('These close once you finish The Night of the Ghost.');
    expect(arcNote(oneLead, ctx, 'arc-brewer-ghost-night')).toBe(
      'Finishing this closes the leads you haven’t followed: The Boarded Well and The Gravedigger.',
    );
    const notice = missionBoardView(oneLead, ctx)!.notices.find(
      (n) => n.id === 'arc-brewer-ghost-night',
    );
    expect(notice?.arcNote).toMatch(/closes the leads/);
  });

  it('shows a choice you can’t take, closed, with the reason', () => {
    const { upTo } = arcPlayer(ctx);
    const vats = play(ready(), 'arc-brewer-sour-vats');
    const oneLead = play(vats, 'arc-brewer-old-hands', ['Ask what the first wife was like']);
    const night = upTo(oneLead, 'arc-brewer-ghost-night', 'Lay her');
    const closed = missionScene(night, ctx)!.choices.filter((c) => c.closed);
    expect(closed).toEqual([
      expect.objectContaining({
        label: 'Call her Oharu, and tell her what is known now',
        closed: 'You never learned enough about who she was.',
      }),
    ]);
  });
});

describe('a fork on the board', () => {
  const { ready, play } = arcPlayer(naruto);

  it('warns on each road’s notice that finishing it closes the others', () => {
    const taken = play(ready(), 'arc-silk-daughter-taken');
    const room = play(taken, 'arc-silk-her-room');
    const temple = play(room, 'arc-silk-pilgrim-road');
    expect(arcNote(temple, naruto, 'arc-silk-word-of-death')).toBe(
      'One road only. Finishing this closes Bring Her Home and Before the Magistrate.',
    );
    const card = arcsView(temple, naruto).find((a) => a.id === 'the-silk-merchants-daughter');
    expect(card?.base).toBe('Based in the Fire Temple');
  });
});
