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
import { splitNarration } from '../../rules/narration';
import type { Moment } from './fresh';
import { weightOf } from './hitVoice';
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
  missLine,
  seenLine,
  stepLine,
  blockedStepLine,
  type Landing,
} from './voice';

const RYO = { id: 'ryo', name: 'Ryo', grammar: 'he' } as const;
const KAI = { id: 'kai', name: 'Kai', grammar: 'she' } as const;
const YOU = { id: 'player', name: 'Aoi', called: 'you', grammar: 'you' } as const;

/** Enough moments to see every line of every bank, with nothing said before them. */
const MOMENTS: readonly Moment[] = Array.from({ length: 120 }, (_, i) => ({
  key: `${i}:${i * 3}:x`,
  recent: [],
}));

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

const text = (line: string) => splitNarration(line).text;

function variety(lines: readonly string[]): number {
  return new Set(lines.map(text)).size;
}

const hit = (damage: number, blow = LANDINGS[0]!) => ({
  attacker: RYO,
  target: KAI,
  blow,
  damage,
  maxHealth: 100,
  guarded: false,
  smashed: false,
  dodgeTried: false,
});

describe('the fight’s voice', () => {
  it('tells the same beat in several ways, the same way each time for a moment', () => {
    const casts = MOMENTS.map((m) => castLine(m, RYO, fire));
    expect(variety(casts)).toBeGreaterThan(2);
    expect(castLine(MOMENTS[1]!, RYO, fire)).toBe(castLine(MOMENTS[1]!, RYO, fire));
  });

  it('names the caster and the technique, so every cast is recognised', () => {
    for (const m of MOMENTS) {
      expect(castsLine(castLine(m, RYO, fire), 'Ryo', 'Fire Blast')).toBe(true);
    }
  });

  it('tells every hit with the attacker and the one it lands on, by the attack’s kind', () => {
    for (const blow of LANDINGS) {
      const lines = MOMENTS.map((m) => hitLine(m, hit(15, blow)));
      for (const line of lines) expect(line).toMatch(hitsOn('Kai', blow.what));
      expect(variety(lines)).toBeGreaterThan(1);
    }
  });

  it('weighs a hit by the share of health it took', () => {
    expect(weightOf(5, 100)).toBe('graze');
    expect(weightOf(12, 100)).toBe('solid');
    expect(weightOf(25, 100)).toBe('heavy');
    expect(weightOf(45, 100)).toBe('crushing');
    const told = (damage: number) => new Set(MOMENTS.map((m) => text(hitLine(m, hit(damage)))));
    const grazes = told(5);
    for (const crushing of told(45)) expect(grazes.has(crushing)).toBe(false);
  });

  it('leaves a guard that held to its stamp, and says when one is smashed', () => {
    for (const m of MOMENTS) {
      const held = hitLine(m, { ...hit(10), guarded: true });
      expect(held).toMatch(GUARDED);
      expect(text(held)).not.toMatch(/guard/);
      const smashed = hitLine(m, { ...hit(10), smashed: true });
      expect(smashed).toMatch(SMASHED);
      expect(text(smashed)).toMatch(/guard/);
    }
  });

  it('passes over a template said in the last few lines', () => {
    const [first] = MOMENTS;
    const said = emptySearchLine(first!, RYO);
    const next = emptySearchLine({ key: first!.key, recent: [said] }, KAI);
    expect(splitNarration(next).voices).not.toEqual(splitNarration(said).voices);
  });

  it('says it again when the same fighter repeats themself', () => {
    const said = emptySearchLine(MOMENTS[0]!, YOU);
    const again = text(emptySearchLine({ key: 'later', recent: [said] }, YOU));
    expect(again).toMatch(/^You (search|look) again/);
    const cast = castLine(MOMENTS[0]!, YOU, fire);
    expect(text(castLine({ key: 'later', recent: [cast] }, YOU, fire))).toMatch(
      /back to|again|once more/,
    );
  });

  it('tells a miss by why it missed', () => {
    const slip = { target: KAI, attacker: RYO, what: 'strike' };
    for (const m of MOMENTS) {
      for (const why of ['dodged', 'wide', 'foreseen', 'slipped'] as const) {
        expect(missLine(m, why, slip)).toMatch(SLIPS);
      }
    }
    const wide = new Set(MOMENTS.map((m) => text(missLine(m, 'wide', slip))));
    const dodged = new Set(MOMENTS.map((m) => text(missLine(m, 'dodged', slip))));
    for (const line of wide) expect(dodged.has(line)).toBe(false);
  });

  it('keeps every other bank recognisable', () => {
    for (const m of MOMENTS) {
      expect(seenLine(m, KAI)).toMatch(SEES_IT_COMING);
      expect(dazeLine(m, KAI)).toMatch(dazes('Kai'));
      expect(emptySearchLine(m, RYO)).toMatch(searchesInVain('Ryo'));
      expect(foundLine(m, RYO, [KAI])).toMatch(spots('Ryo', 'Kai'));
      expect(counterLine(m, KAI)).toMatch(/Kai/);
      const step = stepLine(m, { actor: RYO, to: 'close', closing: true, foe: KAI });
      expect(text(step)).toMatch(/^Ryo/);
      const swap = swapLine(m, { target: KAI, attacker: RYO, what: 'strike', jutsu: 'Swap' });
      expect(swap).toMatch(SWAPS);
      expect(heldOffLine(m, KAI, RYO)).toMatch(holdsOff('Kai', 'Ryo'));
      expect(throughLine(m, RYO, KAI)).toMatch(GETS_THROUGH);
      expect(text(knockLine(m, KAI, 'far', false))).toMatch(/Kai .*far range\./);
      expect(text(blockedStepLine(m, RYO, 'mid', KAI))).toMatch(/Ryo/);
    }
  });

  it('steps in words, never "closes to close range"', () => {
    for (const m of MOMENTS) {
      const line = text(stepLine(m, { actor: YOU, to: 'close', closing: true, foe: KAI }));
      expect(line).not.toMatch(/close range/);
      expect(line).toMatch(/^You /);
    }
  });

  it('never puts a number, a "!" or a colon in the story', () => {
    const lines = MOMENTS.flatMap((m) => [
      castLine(m, RYO, fire),
      hitLine(m, hit(30)),
      missLine(m, 'slipped', { target: KAI, attacker: RYO, what: 'strike' }),
      dazeLine(m, KAI),
      counterLine(m, KAI),
      knockLine(m, KAI, 'far', false),
      confusedLine(m, KAI, RYO),
      clearHeadLine(m, KAI),
      rehideLine(m, RYO),
      tracedLine(m, KAI, RYO),
      emptySearchLine(m, YOU),
    ]).map(text);
    for (const line of lines) expect(line).not.toMatch(/\d|!|:/);
  });
});
