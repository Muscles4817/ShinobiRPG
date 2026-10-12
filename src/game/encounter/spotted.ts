import type { Rng } from '@/core';
import type { CombatOpening } from '@/systems/combat';
import type { MissionNote } from '@/systems/missions';
import { checkChance } from '@/systems/stats';

import { enemyStatLine, PLAYER_COMBATANT_ID } from '../combatants';
import type { GameContext } from '../context';
import { beginCombat } from '../missionFlow';
import { bestHandFor, type Hand } from '../missionRoles';
import type { GameState } from '../state';
import { ALERT_STEP } from './approaches';
import { beginEncounter, encounterHere, withEncounter, type EncounterHere } from './current';

/**
 * Being ambushed: foes may spot you before you spot them. Their sharpest eyes, sharper the more
 * alert they are, against yours or the team's best lookout (a sensor's job). They look when you
 * arrive and again whenever careless recon stirs them. Spotted, the encounter is over: they fall
 * on you, moving first while you reel.
 */

/** Coming up carefully gives the lookout this edge over the foes' eyes. */
export const SPOT_HEADSTART = 8;

/** How a fight they started by spotting you opens: they move first and you are off balance. */
export const SPOTTED_OPENING: CombatOpening = {
  firstMover: 'enemy',
  dazed: [PLAYER_COMBATANT_ID],
};

/** Who keeps watch for the team, and the chance the foes see you first anyway. */
export function spotRisk(
  state: GameState,
  ctx: GameContext,
  here: EncounterHere,
): { readonly lookout: Hand; readonly chance: number } {
  const lookout = bestHandFor(state, ctx, 'perception');
  const eyes = Math.max(...here.foes.map((f) => enemyStatLine(f).perception));
  const theirs = eyes + ALERT_STEP[here.encounter.alertness];
  return { lookout, chance: checkChance(theirs, lookout.value + SPOT_HEADSTART) };
}

/**
 * The foes look round. Spotted, the fight starts at once; otherwise the encounter goes on, with
 * the lookout's roll noted when `noted` (on arrival; after recon only being seen is news).
 */
export function watchedFor(
  state: GameState,
  ctx: GameContext,
  rng: Rng,
  noted: boolean,
): GameState {
  const here = encounterHere(state, ctx);
  if (!here) return state;
  const { lookout, chance } = spotRisk(state, ctx, here);
  const spotted = rng.chance(chance);
  const roll: MissionNote = {
    kind: 'roll',
    stat: 'perception',
    chance: 1 - chance,
    success: !spotted,
  };
  const who: MissionNote[] = lookout.personId
    ? [{ kind: 'story', text: `${lookout.name} keeps watch.` }]
    : [];
  if (!spotted) {
    if (!noted) return state;
    return { ...state, mission: withEncounter(here, here.encounter, ...who, roll) };
  }
  const story: MissionNote = { kind: 'story', text: here.flavour.spotted };
  const mission = withEncounter(here, here.encounter, ...who, roll, story);
  const intro = `${here.flavour.spotted} They saw you first.`;
  return beginCombat({ ...state, mission }, ctx, rng, { opening: SPOTTED_OPENING, intro });
}

/** Steps into the encounter, where they may already have seen you coming. */
export function enterEncounter(state: GameState, ctx: GameContext, rng: Rng): GameState {
  return watchedFor(beginEncounter(state, ctx), ctx, rng, true);
}
