import type { CombatEvent, NarrationCause, ToldEvent } from '@/systems/combat';
import { CAUSE_KIND, type CombatView } from '@/systems/combat';
import { divider, health, reacting, said } from '@/test/story';

import { roundAdvice } from './roundAdvice';
import { roundWhy } from './roundWhy';

/** One thing to try next round, from what the rules prove (audit P1.3). */

const fighter = { health: 100, maxHealth: 100, chakra: 50, maxChakra: 50, statuses: [] };

function after(...events: CombatEvent[]): CombatView {
  return {
    round: 2,
    combatants: [
      { id: 'aoi', name: 'Aoi', side: 'player', ...fighter },
      { id: 'goro', name: 'Goro', side: 'enemy', ...fighter },
    ],
    options: [],
    story: [divider(), ...events],
  };
}

/** A line in `actor`'s turn that says why, about `subject`. */
function because(cause: NarrationCause, subject: string, actor = subject): ToldEvent {
  return said('…', actor, { cause: { cause, kind: CAUSE_KIND[cause], subject } });
}

/** Aoi's blow, met by Goro's ready defence. */
const guarded = said('Aoi hits Goro.', 'aoi', { reactions: [reacting('guarded', 'goro', 'aoi')] });

describe('round advice', () => {
  it('says nothing when nothing happened twice', () => {
    expect(roundAdvice(after(health('goro', 91, 'aoi'), said('Aoi hits Goro.', 'aoi')))).toBeNull();
  });

  it('names what gets past a Guard they keep up', () => {
    expect(roundAdvice(after(guarded, guarded))).toMatch(/guard-breaker or a flurry/);
  });

  it('a move they have read comes before their defence', () => {
    const read = because('familiar', 'aoi');
    expect(roundAdvice(after(read, read, guarded, guarded))).toMatch(/Change it up/);
  });

  it('steps that keep failing say stay where you are', () => {
    const blocked = because('outpaced', 'aoi');
    expect(roundAdvice(after(blocked, blocked))).toMatch(/Fight from where you stand/);
  });

  // Bug #1: a counter is told in the attacker's turn and names the counterer, so reading whom a
  // line was aimed at from its words got it backwards.
  it('warns of a counter only when a foe’s Counter answered your blow', () => {
    // Goro's blow, told in Goro's turn; Aoi's Counter answers it and hurts Goro.
    const yoursAnswered = said('Aoi turns it and strikes back.', 'goro', {
      named: ['aoi', 'goro'],
      reactions: [reacting('countered', 'aoi', 'goro')],
    });
    expect(roundAdvice(after(health('goro', 90, 'aoi'), yoursAnswered))).toBeNull();
    // Aoi's blow, told in Aoi's turn; Goro's Counter answers it and hurts Aoi.
    const theirsAnswered = said('Goro turns it and strikes back.', 'aoi', {
      named: ['goro', 'aoi'],
      reactions: [reacting('countered', 'goro', 'aoi')],
    });
    expect(roundAdvice(after(health('aoi', 90, 'goro'), theirsAnswered))).toMatch(
      /They counter blows up close/,
    );
  });
});

describe('the strip says why', () => {
  it('rows the causes of your misses, failed steps and holds that didn’t take', () => {
    const view = after(
      because('read-it', 'aoi'),
      because('outpaced', 'aoi'),
      because('resisted', 'aoi'),
    );
    const rows = Object.fromEntries(
      roundWhy(view).map((r) => [r.text, r.chips.map((c) => c.label)]),
    );
    expect(rows['Why your attacks were slipped']).toEqual(['Read it coming ×1']);
    expect(rows['Why your steps failed']).toEqual(['Outpaced ×1']);
    expect(rows['Why your holds didn’t take']).toEqual(['Resisted ×1']);
  });

  // Bug #15: causes carried no subject or kind, so a teleport and seals coming apart were rowed
  // as slipped attacks, and a foe keeping pace with your leap (told in their turn) as their
  // own failed step.
  it('rows each cause by what it is about, for whom it is about', () => {
    const view = after(
      because('teleport', 'aoi'),
      because('crowded', 'aoi'),
      // Goro follows Aoi's leap clear: told in Goro's turn, it is Aoi's step back that failed.
      because('kept-pace', 'aoi', 'goro'),
      // Aoi holds Goro off as he steps in: told as Aoi's, it is Goro's step that failed.
      because('held-off', 'goro', 'aoi'),
    );
    const rows = Object.fromEntries(
      roundWhy(view).map((r) => [r.text, r.chips.map((c) => c.label)]),
    );
    expect(rows['Why your attacks were slipped']).toBeUndefined();
    expect(rows['Moves that cost you no turn']).toEqual(['Teleported, no turn spent ×1']);
    expect(rows['Why your techniques came apart']).toEqual(['No room for the seals ×1']);
    expect(rows['Why your steps failed']).toEqual(['Kept pace ×1']);
  });
});
