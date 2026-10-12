import { act, ctx, fightOut } from '@/test/gameFixtures';
import { atEncounter, capable, hardCtx, spying, withStats } from '@/test/encounterFixtures';

import { dispatch } from './dispatch';
import { BRIBE_PER_FOE } from './encounter/approaches';
import { WITHDRAW_REPUTATION_LOSS } from './encounter/resolve';
import type { GameState } from './state';
import { encounterScene } from './views/encounter';

/** Tea-merchant escort: a bandit camp (two foes) that starts unaware. */
const ESCORT = 'tea-merchant-escort';
const ESCORT_PAY = 220;
/** The academy dropout: a lone rogue (wary), to be brought in. */
const ELIMINATE = 'academy-dropout';
const ELIMINATE_PAY = { ryo: 200, reputation: 5 };

function approach(state: GameState, approach: string, context = ctx, range?: string) {
  return act(
    state,
    {
      type: 'encounterApproach',
      approach: approach as 'head-on',
      ...(range ? { range: range as 'far' } : {}),
    },
    context,
  );
}

describe('going in to fight', () => {
  it('head-on is a plain fight, unless they saw you coming', () => {
    const spy = spying();
    const fight = approach(
      atEncounter(ESCORT, capable(spy.context), spy.context),
      'head-on',
      spy.context,
    );
    expect(fight.combat).not.toBeNull();
    expect(spy.setups[0]?.opening).toBeUndefined();

    const hard = spying(hardCtx);
    let s = atEncounter(ELIMINATE, capable(hard.context), hard.context);
    s = act(s, { type: 'encounterRecon', recon: 'observe' }, hard.context);
    expect(s.mission?.encounter?.alertness).toBe('alert');
    approach(s, 'head-on', hard.context);
    expect(hard.setups[0]?.opening).toEqual({ firstMover: 'enemy' });
  });

  it('an ambush needs them unaware, and you need to know it', () => {
    const spy = spying();
    const s = atEncounter(ESCORT, capable(spy.context), spy.context);
    expect(dispatch(s, { type: 'encounterApproach', approach: 'ambush' }, spy.context)).toEqual({
      ok: false,
      error: 'You don’t know whether they’ve noticed you. Watch or sense them first.',
    });
    const watched = act(s, { type: 'encounterRecon', recon: 'observe' }, spy.context);
    const fight = approach(watched, 'ambush', spy.context, 'far');
    expect(fight.combat).not.toBeNull();
    expect(spy.setups[0]?.opening).toEqual({
      range: 'far',
      dazed: ['bandit-thug#0', 'bandit-archer#1'],
      firstMover: 'player',
    });
    expect(spy.setups[0]?.intro).toMatch(/drop on them/);
  });

  it('no ambushing foes who are already on guard', () => {
    const s = act(atEncounter(ELIMINATE), { type: 'encounterRecon', recon: 'observe' });
    expect(s.mission?.encounter?.alertness).toBe('wary');
    expect(dispatch(s, { type: 'encounterApproach', approach: 'ambush' }, ctx)).toEqual({
      ok: false,
      error: 'They’re on guard. No surprising them now.',
    });
  });

  it('winning the encounter’s fight pays the job in full', () => {
    const s = fightOut(approach(atEncounter(ESCORT), 'head-on'));
    expect(s.mission).toBeNull();
    expect(s.reports).toContainEqual(
      expect.objectContaining({ kind: 'mission-complete', ryo: ESCORT_PAY }),
    );
  });
});

describe('ways past without a fight', () => {
  it('slipping past an escort’s foes is full pay', () => {
    const s = atEncounter(ESCORT);
    const done = approach(s, 'sneak');
    expect(done.mission).toBeNull();
    expect(done.wallet.ryo).toBe(s.wallet.ryo + ESCORT_PAY);
    expect(done.standing.missionsCompleted).toBe(s.standing.missionsCompleted + 1);
  });

  it('slipping past the foes you were sent for leaves the job undone, without losing face', () => {
    const s = atEncounter(ELIMINATE);
    expect(encounterScene(s, ctx)?.approaches.find((a) => a.id === 'sneak')?.pay).toMatch(/undone/);
    const done = approach(s, 'sneak');
    expect(done.mission).toBeNull();
    expect(done.wallet.ryo).toBe(s.wallet.ryo);
    expect(done.standing).toEqual(
      expect.objectContaining({
        reputation: s.standing.reputation,
        missionsCompleted: s.standing.missionsCompleted,
      }),
    );
    expect(done.reports).toContainEqual(
      expect.objectContaining({ kind: 'mission-failed', reputationLost: 0 }),
    );
  });

  it('a failed sneak is a fight they start', () => {
    const spy = spying(hardCtx);
    const s = withStats(atEncounter(ESCORT, capable(spy.context), spy.context), { speed: 1 });
    const caught = approach(s, 'sneak', spy.context);
    expect(caught.combat).not.toBeNull();
    expect(spy.setups[0]?.opening).toEqual({ firstMover: 'enemy' });
  });

  it('talking down the foes you were sent for is a surrender: less ryo, more reputation', () => {
    const s = atEncounter(ELIMINATE);
    const done = approach(s, 'talk');
    expect(done.mission).toBeNull();
    expect(done.reports).toContainEqual(
      expect.objectContaining({
        kind: 'mission-complete',
        ryo: Math.round(ELIMINATE_PAY.ryo * 0.6),
        reputation: Math.round(ELIMINATE_PAY.reputation * 1.5),
      }),
    );
  });

  it('talk that fails puts them on guard and can’t be tried again', () => {
    const s = atEncounter(ELIMINATE, capable(hardCtx), hardCtx);
    const laughed = approach(s, 'talk', hardCtx);
    expect(laughed.combat).toBeNull();
    expect(laughed.mission?.encounter).toMatchObject({ alertness: 'alert', tried: ['talk'] });
    expect(dispatch(laughed, { type: 'encounterApproach', approach: 'talk' }, hardCtx)).toEqual({
      ok: false,
      error: 'You’ve tried that. It won’t work twice.',
    });
  });

  it('a threat that doesn’t land starts a fight', () => {
    const spy = spying(hardCtx);
    const s = atEncounter(ELIMINATE, capable(spy.context), spy.context);
    expect(approach(s, 'intimidate', spy.context).combat).not.toBeNull();
    expect(spy.setups[0]?.opening).toEqual({ firstMover: 'enemy' });
  });

  it('paying them off costs ryo for each of them, and an escort is still fully paid', () => {
    const s = atEncounter(ESCORT);
    const done = approach(s, 'bribe');
    expect(done.wallet.ryo).toBe(s.wallet.ryo - 2 * BRIBE_PER_FOE + ESCORT_PAY);
  });

  it('withdrawing fails the job unhurt, for a little reputation', () => {
    const known = capable();
    const s = atEncounter(ELIMINATE, { ...known, standing: { ...known.standing, reputation: 10 } });
    const gone = approach(s, 'withdraw');
    expect(gone.mission).toBeNull();
    expect(gone.character.vitals.health).toBe(s.character.vitals.health);
    expect(gone.standing.reputation).toBe(s.standing.reputation - WITHDRAW_REPUTATION_LOSS);
    expect(gone.reports).toContainEqual(
      expect.objectContaining({ kind: 'mission-failed', reputationLost: WITHDRAW_REPUTATION_LOSS }),
    );
  });
});

describe('setting the ground', () => {
  it('needs a trap or field technique, or a smoke bomb', () => {
    const s = atEncounter(ESCORT);
    expect(dispatch(s, { type: 'encounterApproach', approach: 'set-ground' }, ctx)).toEqual({
      ok: false,
      error: 'Needs a trap or field technique, or a smoke bomb in your pouch.',
    });
  });

  it('a smoke bomb lays smoke where you choose to fight, and you move first', () => {
    const spy = spying();
    const start = capable(spy.context);
    const armed = {
      ...start,
      inventory: { ...start.inventory, tools: { 'smoke-bomb': 1 } },
    };
    const s = atEncounter(ESCORT, armed, spy.context);
    const fight = approach(s, 'set-ground', spy.context, 'far');
    expect(fight.combat).not.toBeNull();
    expect(fight.inventory.tools['smoke-bomb']).toBeUndefined();
    const opening = spy.setups[0]?.opening;
    expect(opening).toMatchObject({ range: 'far', firstMover: 'player' });
    expect(opening?.field).toMatchObject({ id: 'smoke', side: 'player' });
  });

  it('a field technique raises its field over the ground', () => {
    const spy = spying();
    const start = capable(spy.context);
    const field = spy.context.content.techniques.all.find((t) =>
      t.effects.some((e) => e.verb === 'field'),
    )!;
    const learned = {
      ...start,
      techniques: { ...start.techniques, known: [...start.techniques.known, field.id] },
    };
    approach(atEncounter(ESCORT, learned, spy.context), 'set-ground', spy.context);
    expect(spy.setups[0]?.opening?.field?.side).toBe('player');
    expect(spy.setups[0]?.opening?.range).toBe('close');
  });
});
