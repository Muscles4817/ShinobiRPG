import { createRng, type Rng } from '@/core';
import { ctx } from '@/test/gameFixtures';
import {
  atEncounter,
  capable,
  hardCtx,
  keenEyed,
  spying,
  withStats,
} from '@/test/encounterFixtures';

import { enemyStatLine } from './combatants';
import { encounterHere } from './encounter/current';
import { requirePerson } from './people/cast';
import { personStats } from './people/progress';
import { performRecon } from './encounter/recon';
import { SPOT_HEADSTART, spotRisk, SPOTTED_OPENING } from './encounter/spotted';
import type { GameState } from './state';
import { encounterScene } from './views/encounter';
import { activeScene } from './views/peopleScenes';

/** The academy dropout: a lone rogue, wary from the start. */
const ROGUE = 'academy-dropout';
/**
 * Eyes at which `hardCtx`'s rogue is less likely than not to see you while wary (+2), and more
 * likely once alert (+5): your lookout's edge lands between the two.
 */
const EVEN_EYES =
  enemyStatLine(hardCtx.content.enemies.require(ROGUE)).perception + 3.5 - SPOT_HEADSTART;

/** Dice that come up whenever the odds are better than even. */
const likelyWins: Rng = { ...createRng(1), chance: (p) => p > 0.5 };

function watchOf(state: GameState, id: string): number {
  return personStats(requirePerson(state, ctx, id), state).perception;
}

function spotChance(state: GameState, context = ctx): number {
  return spotRisk(state, context, encounterHere(state, context)!).chance;
}

describe('being ambushed', () => {
  it('foes who see you first fall on you: they move first and you reel', () => {
    const spy = spying(hardCtx);
    const blind = withStats(capable(spy.context), { perception: 1 });
    const s = atEncounter(ROGUE, blind, spy.context);
    expect(s.combat).not.toBeNull();
    expect(activeScene(s)).toBe('combat');
    expect(spy.setups[0]?.opening).toEqual(SPOTTED_OPENING);
    expect(spy.setups[0]?.intro).toMatch(/They saw you first\.$/);
    expect(s.mission?.notes.slice(-2)).toEqual([
      expect.objectContaining({ kind: 'roll', stat: 'perception', success: false }),
      { kind: 'story', text: hardCtx.content.encounters.require('lone-rogue').flavour.spotted },
    ]);
  });

  it('a sharp lookout sees them first: the encounter goes on, with the roll in its story', () => {
    const s = atEncounter(ROGUE, keenEyed(hardCtx), hardCtx);
    expect(s.combat).toBeNull();
    expect(encounterScene(s, hardCtx)?.lines.at(-1)).toMatchObject({
      kind: 'roll',
      success: true,
    });
  });

  it('the odds come from their eyes against yours, and rise as they grow alert', () => {
    const s = atEncounter(ROGUE, capable());
    const chance = spotChance(s);
    expect(spotChance(withStats(s, { perception: 1 }))).toBeGreaterThan(chance);
    const alert = {
      ...s,
      mission: {
        ...s.mission!,
        encounter: { ...s.mission!.encounter!, alertness: 'alert' as const },
      },
    };
    expect(spotChance(alert)).toBeGreaterThan(chance);
  });

  it('careless recon gives them another look, at their new alertness', () => {
    const s = withStats(atEncounter(ROGUE, keenEyed(hardCtx), hardCtx), { perception: EVEN_EYES });
    expect(spotChance(s, hardCtx)).toBeLessThan(0.5);
    const stirred = performRecon(s, hardCtx, 'observe', likelyWins);
    expect(stirred.mission?.encounter?.alertness).toBe('alert');
    expect(stirred.combat).not.toBeNull();
  });

  it('on a team job the best lookout keeps watch', () => {
    const s = withStats(atEncounter('river-road-bandits'), { perception: 1 });
    const { lookout } = spotRisk(s, ctx, encounterHere(s, ctx)!);
    expect(lookout.personId).toBe(
      [...s.people.team!.teammateIds].sort((a, b) => watchOf(s, b) - watchOf(s, a))[0],
    );
  });
});
