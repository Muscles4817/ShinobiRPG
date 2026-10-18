import type { PersonDef } from '@/content';
import { ctx, newGame } from '@/test/gameFixtures';

import { requirePerson } from './people/cast';
import { personSlots } from './people/pronouns';
import { phrasingsOf } from './people/register';
import { fillLine } from './people/talk';
import { coachAfterLesson } from './sensei/coaching';
import { waysOf } from './sensei/generate';
import type { GameState } from './state';

/** Sensei text speaks of each sensei (and the people of their past) as they are, never "they". */

const SLOT_LEFT = /\{[^}]*\}/;

function pooledSensei(past: string, pronouns: 'he' | 'she'): PersonDef {
  const found = ctx.content.people.all.find(
    (p) => p.sensei?.pooled?.past === past && p.pronouns === pronouns,
  );
  if (!found) throw new Error(`No ${pronouns} sensei with the past ${past}`);
  return found;
}

/** Their story beats as the player reads them, filled for the one talking. */
function beats(sensei: PersonDef): string[] {
  const values = { you: 'Aya', ...personSlots('them', sensei) };
  return ctx.content.conversations.all
    .filter((c) => c.personId === sensei.id)
    .flatMap((c) =>
      [c.opener, ...c.choices.flatMap((x) => [x.label, x.reply])].flatMap(phrasingsOf),
    )
    .map((line) => fillLine(line, values));
}

function under(senseiId: string): GameState {
  const state = newGame();
  return { ...state, people: { ...state.people, team: { ...state.people.team!, senseiId } } };
}

/** Coaching after a lesson whose assignment wasn't done: the verdict, the read, the next work. */
function coachingOf(senseiId: string): string {
  const set = coachAfterLesson(under(senseiId), ctx, requirePerson(under(senseiId), ctx, senseiId));
  const missed = coachAfterLesson(set, ctx, requirePerson(set, ctx, senseiId));
  return missed.journal.entries.at(-1)?.text ?? '';
}

describe.each([
  ['he', 'his'],
  ['she', 'her'],
] as const)('a composed sensei who is %s', (pronouns, their) => {
  const sensei = pooledSensei('lost-team', pronouns);

  it('tells their story with their own pronouns, every slot filled', () => {
    const told = beats(sensei);
    // Four beats: an opener, and three choices with their replies.
    expect(told).toHaveLength(4 * (1 + 3 * 2));
    for (const line of told) expect(line).not.toMatch(SLOT_LEFT);
    expect(told[0]).toContain(`over in ${their} hands`);
    expect(told[0]).not.toMatch(/\btheir\b/);
    expect(waysOf(sensei)?.story.wound).toContain(`the only one of ${their} old team`);
  });

  it('coaches in words that agree with them', () => {
    const said = coachingOf(sensei.id);
    expect(said).not.toBe('');
    expect(said).not.toMatch(SLOT_LEFT);
  });
});

describe('an authored sensei', () => {
  it('who is he is never called they in coaching', () => {
    expect(requirePerson(newGame(), ctx, 'goran').pronouns).toBe('he');
    const said = coachingOf('goran');
    expect(said).toMatch(/\b(He|he|his)\b/);
    expect(said).not.toMatch(/\b(They|they|their|them)\b/);
    expect(said).not.toMatch(SLOT_LEFT);
  });
});
