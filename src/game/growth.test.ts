import { blockerFor, dispatch, shinobiView, trainingView, type GameState } from '@/game';
import { aptitudeBand, evenAptitude, nothingKnown, type StatId } from '@/systems/stats';
import { act, ctx, lastEntry, newGame, withAllStats } from '@/test/gameFixtures';

import { growCharacter, SESSIONS_TO_SENSE } from './growth';

const text = ctx.content.text.aptitude;
const drill = { type: 'train', trainingId: 'post-kicks' } as const;

/** A character with this talent who has found none of it out yet (no gifts on the file). */
function withAptitude(state: GameState, overrides: Partial<Record<StatId, number>>): GameState {
  const aptitude = { ...evenAptitude(1), ...overrides };
  return { ...state, character: { ...state.character, aptitude, aptitudeKnown: nothingKnown() } };
}

function rested(state: GameState): GameState {
  const vitals = { ...state.character.vitals, energy: 100 };
  return { ...state, character: { ...state.character, vitals } };
}

describe('growth and aptitude', () => {
  it('reveals a void art on the first try, then refuses the drill', () => {
    const start = withAptitude(newGame(), { taijutsu: 0 });
    expect(blockerFor(start, drill, ctx)).toBeNull();
    const tried = act(start, drill);
    expect(tried.character.stats.taijutsu).toBe(start.character.stats.taijutsu);
    expect(tried.character.stats.strength).toBeGreaterThan(start.character.stats.strength);
    expect(tried.character.aptitudeKnown.taijutsu).toBe('sense');
    expect(lastEntry(tried)?.text).toBe(text.reads.none);
    expect(blockerFor(rested(tried), drill, ctx)).toBe(text.blocked);
  });

  it('refuses scrolls in a void art once you know', () => {
    const start = withAllStats(withAptitude(newGame(), { ninjutsu: 0 }), 15);
    const study = { type: 'study', techniqueId: 'ember-breath' } as const;
    const tried = act(start, study);
    expect(tried.techniques.progress['ember-breath'] ?? 0).toBe(0);
    expect(tried.character.aptitudeKnown.ninjutsu).toBe('sense');
    expect(dispatch(rested(tried), study, ctx)).toEqual({ ok: false, error: text.blocked });
  });

  it('gives a rough read, in words, after the first few sessions', () => {
    let state = withAptitude(newGame(), { taijutsu: 1.6 });
    for (let i = 1; i < SESSIONS_TO_SENSE; i++) state = act(rested(state), drill);
    expect(state.character.aptitudeKnown.taijutsu).toBe('unknown');
    state = act(rested(state), drill);
    expect(state.character.aptitudeKnown.taijutsu).toBe('sense');
    const reads = state.journal.entries.slice(-2).map((e) => e.text);
    expect(reads).toContain(text.reads.gifted);
    for (const read of reads) expect(read).not.toMatch(/\d/);
  });

  it('multiplies growth by aptitude', () => {
    const state = withAllStats(newGame(), 5);
    const plain = growCharacter(state.character, { taijutsu: 1 }, ctx).character.stats.taijutsu;
    const gifted = withAptitude(state, { taijutsu: 1.6 }).character;
    expect(growCharacter(gifted, { taijutsu: 1 }, ctx).character.stats.taijutsu - 5).toBeCloseTo(
      ((plain - 5) * 1.6) / state.character.aptitude.taijutsu,
      2,
    );
  });

  it('lets a teacher multiply a session', () => {
    const state = withAptitude(withAllStats(newGame(), 10), {});
    const alone = growCharacter(state.character, { taijutsu: 1 }, ctx).character.stats.taijutsu;
    const taught = growCharacter(state.character, { taijutsu: 1 }, ctx, { teacher: 3 }).character
      .stats;
    expect(taught.taijutsu - 10).toBeCloseTo(3 * (alone - 10), 2);
  });

  it('keeps tireless solo training worthwhile through C', () => {
    const state = withAptitude(withAllStats(newGame(), 15), {});
    const tireless = { ...state.character, traitIds: ['tireless', 'kind'] };
    const plain = { ...state.character, traitIds: ['kind'] };
    const gain = (c: typeof plain) =>
      growCharacter(c, { taijutsu: 1, ninjutsu: 1 }, ctx).character.stats;
    expect(gain(tireless).taijutsu - 15).toBeGreaterThan(3 * (gain(plain).taijutsu - 15));
    expect(gain(tireless).ninjutsu).toBe(gain(plain).ninjutsu);
  });

  it('previews drills without giving away an undiscovered talent', () => {
    const state = withAptitude(newGame(), { taijutsu: 0 });
    const kicks = trainingView(state, ctx)!.drills.find((d) => d.id === 'post-kicks')!;
    const taijutsu = kicks.previews.find((p) => p.label === 'Taijutsu')!;
    expect(taijutsu.after).toBeGreaterThan(taijutsu.now);
  });

  it('shows aptitude on the Shinobi screen only as discovered, in words', () => {
    const start = withAptitude(newGame(), { taijutsu: 0 });
    const line = (s: GameState) =>
      shinobiView(s, ctx)
        .groups.flatMap((g) => g.stats)
        .find((l) => l.label === 'Taijutsu')!.talent;
    expect(line(start)).toEqual({ read: 'unknown', phrase: text.unknown });
    expect(line(act(start, drill))).toEqual({ read: 'sense', phrase: text.senses.none });
    expect(aptitudeBand(0)).toBe('none');
  });
});
