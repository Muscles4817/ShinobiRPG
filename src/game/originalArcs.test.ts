import { arcPlayer, withTally } from '@/test/arcPlay';
import { act, ctx } from '@/test/gameFixtures';

import { availability } from './board';
import type { GameState } from './state';
import { arcsView } from './views/arcs';
import { missionScene } from './views/missionScene';

/**
 * The original pack's newer arcs, played by dispatching actions: mercy counted across jobs and
 * read as an argument, leads that stay open until the story moves on, clues that decide what
 * you can do on the night, and a favour held back until the first two are done.
 */

const job = (id: string) => ctx.content.missions.require(id);
const { ready, play, upTo, labels } = arcPlayer(ctx);

describe('the chain at Kiri Ford', () => {
  function atTheHearing(): GameState {
    let s = play(ready(), 'arc-ford-pilot-home', ['Who was the youth beside him?']);
    expect(s.locationId).toBe('kiri-ford');
    s = play(s, 'arc-ford-reed-blade', ['Let them go, and tell them never to come back']);
    return play(s, 'arc-ford-barons-bill', ['Fight beside him']);
  }

  it('accounts for Ushio on every road: sent clear, or taken by the Watch', () => {
    const home = play(ready(), 'arc-ford-pilot-home');
    const spared = play(home, 'arc-ford-reed-blade', [
      'Let them go, and tell them never to come back',
    ]);
    const clear = play(spared, 'arc-ford-barons-bill', [
      'Tell him to get Ren clear and stay out of it',
    ]);
    expect(clear.village.marks).toContain('ford-ushio-gone');
    const bound = play(home, 'arc-ford-reed-blade', ['Bind them both for the Watch']);
    const taken = play(bound, 'arc-ford-barons-bill');
    expect(taken.village.marks).toContain('ford-ushio-taken');
    expect(taken.village.marks).not.toContain('ford-ushio-fell');
  });

  it('counts the mercy you show, across jobs', () => {
    const s = atTheHearing();
    expect(s.village.tallies.mercy).toBe(1);
    expect(s.village.marks).toEqual(
      expect.arrayContaining(['ford-rogue-spared', 'ford-ushio-fell']),
    );
  });

  it('lets the mercy you have shown before speak for Ren', () => {
    const plea = 'Remind her of the others you have spared, and how they turned out';
    const once = upTo(atTheHearing(), 'arc-ford-ren-hearing', 'Tell her he had nobody');
    expect(labels(once)).not.toContain(plea);
    const twice = withTally(atTheHearing(), 'mercy', 2);
    const done = play(twice, 'arc-ford-ren-hearing', [plea]);
    expect(done.village.marks).toContain('ren-with-the-watch');
    expect(done.locationId).toBe('torogakure');
    expect(arcsView(done, ctx).some((a) => a.id === 'the-chain-at-kiri-ford')).toBe(false);
  });
});

describe('the brewer’s ghost', () => {
  const LEADS = ['arc-brewer-old-well', 'arc-brewer-old-hands', 'arc-brewer-gravedigger'];

  it('opens three leads at once, and keeps the rest open until you face her', () => {
    const vats = play(ready(), 'arc-brewer-sour-vats');
    for (const id of LEADS) expect(availability(vats, ctx, job(id)).kind).toBe('arc');
    const card = arcsView(vats, ctx).find((a) => a.id === 'the-brewers-ghost');
    expect(card?.pass).toMatch(/Any one/);

    const oneLead = play(vats, 'arc-brewer-old-hands', ['Ask what the first wife was like']);
    expect(availability(oneLead, ctx, job('arc-brewer-ghost-night')).kind).toBe('arc');
    expect(availability(oneLead, ctx, job('arc-brewer-gravedigger')).kind).toBe('arc');
    expect(arcsView(oneLead, ctx).find((a) => a.id === 'the-brewers-ghost')?.jobs).toHaveLength(3);

    const faced = play(oneLead, 'arc-brewer-ghost-night');
    expect(availability(faced, ctx, job('arc-brewer-gravedigger')).kind).toBe('absent');
  });

  it('lets you call her by name only once enough is found, and remembers how it ended', () => {
    const vats = play(ready(), 'arc-brewer-sour-vats');
    const one = play(vats, 'arc-brewer-old-hands', ['Ask what the first wife was like']);
    const name = 'Call her Oharu, and tell her what is known now';
    expect(labels(upTo(one, 'arc-brewer-ghost-night', 'Lay her'))).not.toContain(name);

    const two = play(one, 'arc-brewer-gravedigger', ['Ask why Mori would send anyone']);
    expect(two.village.tallies['brewer-clues']).toBe(2);
    const named = play(two, 'arc-brewer-ghost-night', [name]);
    expect(named.village.marks).toContain('brewer-exposed');
    expect(named.village.marks).not.toContain('brewer-hushed');
  });

  it('punishes the hasty answer: the wrong man hauled in makes her angrier', () => {
    const vats = play(ready(), 'arc-brewer-sour-vats');
    const hasty = play(vats, 'arc-brewer-gravedigger', ['Accuse him of cursing the brewery']);
    expect(hasty.village.marks).toContain('brewer-wrong-man');
    let s = upTo(hasty, 'arc-brewer-ghost-night', 'Lay her');
    s = act(s, missionScene(s, ctx)!.choices.find((c) => c.label.startsWith('Lay her'))!.action);
    for (let k = 0; k < 5 && !s.mission?.encounter; k++) {
      s = act(s, missionScene(s, ctx)!.choices[0]!.action);
    }
    expect(s.mission?.encounter).toBeDefined();
    const stage = job('arc-brewer-ghost-night').stages[s.mission!.stageIndex];
    expect(stage?.kind === 'encounter' && stage.enemyIds).toHaveLength(2);
  });
});

describe('Kōun’s three favours', () => {
  it('names the third favour only once the first two are done', () => {
    const bargained = play(ready(), 'arc-koun-bargain');
    const card = () => arcsView(bargained, ctx).find((a) => a.id === 'kouns-three-favours');
    expect(card()?.act).toBe('Act 2 of 3: Two favours');
    expect(availability(bargained, ctx, job('arc-koun-east-bridge')).kind).toBe('absent');
    const danced = play(bargained, 'arc-koun-wedding', [
      'Let him finish, then give Bunta Kōun’s message',
    ]);
    expect(danced.village.tallies['koun-grace']).toBe(1);
    const both = play(danced, 'arc-koun-strongroom');
    expect(availability(both, ctx, job('arc-koun-east-bridge')).kind).toBe('arc');
  });

  it('opens the kinder answer at the bridge to graces shown along the way', () => {
    const kind = 'Tell her what kind of man he has been since';
    const base = play(
      play(play(ready(), 'arc-koun-bargain'), 'arc-koun-wedding'),
      'arc-koun-strongroom',
    );
    const graced = withTally(base, 'koun-grace', 2);
    const done = play(graced, 'arc-koun-east-bridge', [kind]);
    expect(done.village.marks).toContain('koun-favours-done');
  });
});
