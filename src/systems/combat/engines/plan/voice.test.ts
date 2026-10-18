import {
  castsLine,
  dazes,
  GUARDED,
  hitsOn,
  SEES_IT_COMING,
  searchesInVain,
  SLIPS,
  SMASHED,
  spots,
  SWAPS,
  holdsOff,
  GETS_THROUGH,
} from '@/test/fightLines';

import type { CombatTechnique } from '../../contract';
import {
  clearHeadLine,
  confusedLine,
  heldOffLine,
  throughLine,
  knockLine,
  rehideLine,
  swapLine,
  tracedLine,
} from './sceneVoice';
import {
  castLine,
  counterLine,
  dazeLine,
  emptySearchLine,
  foundLine,
  hitLine,
  seenLine,
  slipLine,
  stepLine,
  blockedStepLine,
  type Landing,
} from './voice';

const RYO = { id: 'ryo', name: 'Ryo' };
const KAI = { id: 'kai', name: 'Kai' };

/** Enough moments to see every line of every bank. */
const MOMENTS = Array.from({ length: 120 }, (_, i) => `${i}:${i * 3}:x`);

const fire: CombatTechnique = {
  id: 'f',
  name: 'Fire Blast',
  discipline: 'ninjutsu',
  element: 'fire',
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 4,
};

const LANDINGS: readonly Landing[] = [
  { what: 'strike', kind: 'blow', physical: true },
  { what: 'cut', kind: 'weapon', physical: true },
  { what: 'kunai', kind: 'weapon', physical: false },
  { what: 'Fire Blast', kind: 'jutsu', discipline: 'ninjutsu', element: 'fire', physical: false },
  { what: 'Haze', kind: 'jutsu', discipline: 'genjutsu', physical: false },
  { what: 'Seal', kind: 'seal', discipline: 'fuuinjutsu', physical: false },
  { what: 'Kick', kind: 'blow', discipline: 'taijutsu', physical: true, followUp: true },
];

function variety(lines: readonly string[]): number {
  return new Set(lines).size;
}

describe('the fight’s voice', () => {
  it('tells the same beat in several ways, the same way each time for a moment', () => {
    const casts = MOMENTS.map((m) => castLine(m, RYO, fire));
    expect(variety(casts)).toBeGreaterThan(2);
    expect(castLine('1:2:x', RYO, fire)).toBe(castLine('1:2:x', RYO, fire));
  });

  it('names the caster before the technique, so every cast is recognised', () => {
    for (const m of MOMENTS)
      expect(castsLine(castLine(m, RYO, fire), 'Ryo', 'Fire Blast')).toBe(true);
  });

  it('tells every hit with the attacker first and the one it lands on, by the attack’s kind', () => {
    for (const blow of LANDINGS) {
      const lines = MOMENTS.map((m) =>
        hitLine(m, {
          attacker: RYO,
          target: KAI,
          blow,
          guarded: false,
          smashed: false,
          dodgeTried: false,
        }),
      );
      for (const line of lines) expect(line).toMatch(hitsOn('Kai', blow.what));
      expect(variety(lines)).toBeGreaterThan(1);
    }
  });

  it('says how a guard fared, in words the tests know', () => {
    const blow = LANDINGS[0]!;
    for (const m of MOMENTS) {
      const base = { attacker: RYO, target: KAI, blow, dodgeTried: false };
      expect(hitLine(m, { ...base, guarded: true, smashed: false })).toMatch(GUARDED);
      expect(hitLine(m, { ...base, guarded: false, smashed: true })).toMatch(SMASHED);
    }
  });

  it('keeps every other bank recognisable', () => {
    for (const m of MOMENTS) {
      expect(slipLine(m, { target: KAI, attacker: RYO, what: 'strike' })).toMatch(SLIPS);
      expect(seenLine(m, KAI)).toMatch(SEES_IT_COMING);
      expect(dazeLine(m, KAI)).toMatch(dazes('Kai'));
      expect(emptySearchLine(m, RYO)).toMatch(searchesInVain('Ryo'));
      expect(foundLine(m, RYO, [KAI])).toMatch(spots('Ryo', 'Kai'));
      expect(counterLine(m, KAI)).toMatch(/Kai/);
      expect(stepLine(m, { actor: RYO, to: 'mid', closing: true })).toMatch(/Ryo .*mid range\./);
      expect(swapLine(m, { target: KAI, attacker: RYO, what: 'strike', jutsu: 'Swap' })).toMatch(
        SWAPS,
      );
      expect(heldOffLine(m, KAI, RYO)).toMatch(holdsOff('Kai', 'Ryo'));
      expect(throughLine(m, RYO, KAI)).toMatch(GETS_THROUGH);
      expect(knockLine(m, KAI, 'far', false)).toMatch(/Kai .*far range\./);
      expect(blockedStepLine(m, RYO, 'mid', KAI)).toMatch(/Ryo .*mid range|Kai cuts Ryo off/);
    }
  });

  it('never puts a number in the story', () => {
    const lines = MOMENTS.flatMap((m) => [
      castLine(m, RYO, fire),
      slipLine(m, { target: KAI, attacker: RYO, what: 'strike' }),
      dazeLine(m, KAI),
      counterLine(m, KAI),
      knockLine(m, KAI, 'far', false),
      confusedLine(m, KAI, RYO),
      clearHeadLine(m, KAI),
      rehideLine(m, RYO),
      tracedLine(m, KAI, RYO),
    ]);
    for (const line of lines) expect(line).not.toMatch(/\d/);
  });
});
