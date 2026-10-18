import { CONTENT_PACKS } from '@/content';
import { arcPlayer, withTally } from '@/test/arcPlay';
import { act } from '@/test/gameFixtures';

import { availability } from './board';
import { createGameContext } from './context';
import { arcsView } from './views/arcs';
import { missionScene } from './views/missionScene';

/**
 * The naruto pack's newer arcs, played by dispatching actions: working for both sides of a
 * quarrel, a client who is the villain and a fork of three roads, and a test whose stated
 * rules are not the test.
 */

const naruto = CONTENT_PACKS.find((p) => p.id === 'naruto')!;
const ctx = createGameContext(naruto);
const job = (id: string) => ctx.content.missions.require(id);
const { ready, play, upTo, labels } = arcPlayer(ctx);

describe('two sides of the water', () => {
  it('wants both sides worked before the third hand shows', () => {
    const there = play(ready(), 'arc-waves-town-apart');
    expect(there.locationId).toBe('land-of-waves');
    const nets = play(there, 'arc-waves-cut-nets');
    expect(availability(nets, ctx, job('arc-waves-third-hand')).kind).toBe('absent');
    const both = play(nets, 'arc-waves-cut-ropes');
    expect(availability(both, ctx, job('arc-waves-third-hand')).kind).toBe('arc');
  });

  it('brings the whole town to face him only when both sides’ clues are found', () => {
    const unite = 'Gather the builders and the fishermen at the market, and show them both';
    const both = play(
      play(play(ready(), 'arc-waves-town-apart'), 'arc-waves-cut-nets'),
      'arc-waves-cut-ropes',
    );
    expect(
      labels(upTo(withTally(both, 'waves-two-sides-clues', 1), 'arc-waves-third-hand', 'Go to')),
    ).not.toContain(unite);
    const done = play(withTally(both, 'waves-two-sides-clues', 2), 'arc-waves-third-hand', [unite]);
    expect(done.village.marks).toEqual(
      expect.arrayContaining(['waves-united', 'waves-two-sides-done']),
    );
    expect(done.locationId).toBe('konohagakure');
  });
});

describe('the silk merchant’s daughter', () => {
  function atTheTemple() {
    const taken = play(ready(), 'arc-silk-daughter-taken');
    expect(taken.locationId).toBe('shukuba-town');
    const room = play(taken, 'arc-silk-her-room');
    // Either lead moves the story on; the other stays open until the next act is done.
    expect(availability(room, ctx, job('arc-silk-bandits')).kind).toBe('arc');
    expect(availability(room, ctx, job('arc-silk-pilgrim-road')).kind).toBe('arc');
    return play(room, 'arc-silk-pilgrim-road', ['Ask her to tell you everything, from the start']);
  }

  it('ends in a fork: taking one road closes the others', () => {
    const temple = atTheTemple();
    expect(temple.locationId).toBe('fire-temple');
    const card = arcsView(temple, ctx).find((a) => a.id === 'the-silk-merchants-daughter');
    expect(card?.rule?.label).toBe('One road only');
    const lied = play(temple, 'arc-silk-word-of-death');
    expect(lied.village.marks).toContain('silk-daughter-done');
    expect(availability(lied, ctx, job('arc-silk-magistrate')).kind).toBe('absent');
    expect(availability(lied, ctx, job('arc-silk-bring-her-home')).kind).toBe('absent');
    expect(arcsView(lied, ctx).some((a) => a.id === 'the-silk-merchants-daughter')).toBe(false);
  });

  it('lets what you found make the case before the magistrate', () => {
    const lay = 'Lay out what you found, piece by piece';
    const thin = withTally(atTheTemple(), 'ocho-clues', 1);
    expect(labels(upTo(thin, 'arc-silk-magistrate', 'Let Ochō speak'))).not.toContain(lay);
    const free = play(withTally(atTheTemple(), 'ocho-clues', 2), 'arc-silk-magistrate', [lay]);
    expect(free.village.marks).toContain('ocho-free');
  });
});

describe('the unwritten rule', () => {
  function carried(choice: string) {
    const interviewed = play(ready(), 'arc-ibiki-interview');
    return play(interviewed, 'arc-ibiki-sealed-message', [choice, 'Leave it sealed']);
  }

  it('passes whoever breaks an order for someone who needs them', () => {
    const broke = play(carried('Leave the road and go after them'), 'arc-ibiki-verdict');
    expect(broke.village.marks).toContain('ibiki-passed');
  });

  it('fails whoever keeps every order and walks on', () => {
    const kept = play(carried('Keep to the road, as ordered'), 'arc-ibiki-verdict');
    expect(kept.village.marks).toContain('ibiki-failed');
    expect(kept.village.marks).not.toContain('ibiki-passed');
  });

  it('fails whoever buys the boy back with the message, and takes no message on', () => {
    const gave = carried('Hold up the message and offer it');
    expect(gave.village.marks).toContain('ibiki-gave-message');
    expect(gave.village.marks).not.toContain('ibiki-opened');
    const verdict = play(gave, 'arc-ibiki-verdict');
    expect(verdict.village.marks).toContain('ibiki-failed');
  });

  it('offers the three orders as one choice on the road', () => {
    let s = upTo(
      play(ready(), 'arc-ibiki-interview'),
      'arc-ibiki-sealed-message',
      'Leave the road',
    );
    expect(labels(s)).toEqual([
      'Leave the road and go after them',
      'Hold up the message and offer it',
      'Keep to the road, as ordered',
    ]);
    s = act(s, missionScene(s, ctx)!.choices[0]!.action, ctx);
    expect(s.mission?.marks).toContain('left-road');
  });
});
