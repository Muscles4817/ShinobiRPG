import {
  AFFLICT_EXCHANGES,
  chakraCost,
  equalHitShare,
  holdTurns,
  RANGE_BANDS,
  RANGE_LABEL,
  reachOf,
} from '@/systems/combat';
import type { CombatantSetup } from '@/systems/combat';
import { STAT_INFO } from '@/systems/stats';
import {
  blowsOf,
  stepWords,
  type AfflictionKind,
  type AreaSize,
  type FieldId,
  type Accuracy,
  type TechniqueDef,
  type TechniqueEffect,
} from '@/systems/techniques';

import { playerCombatant } from '../combatants';
import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * A technique as a sheet you can read before you study it, and on the back of its card after:
 * how far it reaches, how hard it hits (a word, with the power as a chip), each thing it does in
 * order, what it costs, what the body needs, which school teaches it, and how much of an equal's
 * health it takes in your hands today.
 */

export interface SheetReach {
  readonly band: string;
  readonly reaches: boolean;
}

/** One thing a technique does, in words, with a chip where a number helps. */
export interface SheetLine {
  readonly text: string;
  readonly chip: string | null;
}

export interface TechniqueSheet {
  readonly reach: readonly SheetReach[];
  /** "Heavy", with its power, for a technique that wounds; null otherwise. */
  readonly strength: { readonly word: string; readonly power: number } | null;
  /** How surely it lands, for a technique that can be slipped. */
  readonly lands: string | null;
  /** "Three blows", for a flurry. */
  readonly strikes: string | null;
  readonly effects: readonly SheetLine[];
  /** Chakra it costs you today (control and steadiness counted). */
  readonly chakra: number;
  /** Prices beyond chakra: once a fight, a cost after it. */
  readonly costs: readonly string[];
  /** What the body must have: a nature, a control grade, a weapon in hand, deep reserves. */
  readonly needs: readonly string[];
  /** "Standard technique", a school, or a clan's art. */
  readonly school: string;
  /** "About a quarter of an equal's health", for a technique that wounds. */
  readonly inYourHands: string | null;
}

/** Strength bands by power: the word the sheet uses, with the power as a chip. */
const STRENGTH_BANDS: readonly { readonly from: number; readonly word: string }[] = [
  { from: 30, word: 'Devastating' },
  { from: 23, word: 'Crushing' },
  { from: 16, word: 'Heavy' },
  { from: 10, word: 'Solid' },
  { from: 0, word: 'Light' },
];

export function strengthWord(power: number): string {
  return STRENGTH_BANDS.find((b) => power >= b.from)?.word ?? 'Light';
}

/** A share of health in words: a read, not a number. */
export function shareRead(share: number): string {
  if (share >= 0.45) return 'about half';
  if (share >= 0.3) return 'about a third';
  if (share >= 0.2) return 'about a quarter';
  if (share >= 0.13) return 'about a sixth';
  if (share >= 0.08) return 'about a tenth';
  return 'a scratch';
}

const LANDS: Readonly<Record<Accuracy, string>> = {
  sure: 'Sure: hard to slip',
  steady: 'Steady',
  wild: 'Wild: easy to slip, hits hard',
};

const COUNT_WORDS = ['', 'One', 'Two', 'Three', 'Four', 'Five'];

function strikesOf(def: TechniqueDef): string | null {
  const most = Math.max(1, ...def.effects.map(blowsOf));
  return most > 1 ? `${COUNT_WORDS[most] ?? most} blows` : null;
}

function turns(power: number): string {
  const n = holdTurns({ power });
  return n === 1 ? '1 turn' : `${n} turns`;
}

/** What each verb does when it needs no detail beyond its name. */
const PLAIN_WORDS: Readonly<Record<PlainSheetVerb, string>> = {
  damage: 'Strikes',
  break: 'Smashes through guards and armour',
  daze: 'Dazes: they lose their next turn',
  confuse: 'Confuses them: they may strike the wrong target',
  conceal: 'Hides you until you attack',
  sense: 'Finds the hidden and reads their plans',
  substitute: 'Swaps you out of the first hit each round',
  counter: 'Readies a riposte: the next blow at you is answered first',
  summon: 'Calls a summon to fight beside you; you pay its upkeep in chakra while it stays',
};

/** How an area reads by the ground it covers (`rules/verbs/area.ts`). */
const AREA_WORDS: Readonly<Record<AreaSize, string>> = {
  small: 'Hits every foe',
  wide: 'Hits every foe: hard to slip, no plain Guard stops it, and it throws everyone apart',
  vast: 'Hits every foe: no outrunning or guarding it, and it throws everyone far apart under dust that blinds both sides',
};

const FIELD_WORDS: Readonly<Record<FieldId, string>> = {
  mist: 'a mist',
  smoke: 'smoke',
  dust: 'dust',
};

const HARM_WORDS: Readonly<Record<AfflictionKind, string>> = {
  burn: 'Sets them burning',
  bleed: 'Opens a wound that bleeds (bleeds stack)',
  poison: 'Poisons them: weaker and slower while it lasts',
};

/** Verbs that leave something on a foe, whose line reads where, how long or how much. */
type LingeringVerb = 'knock' | 'pin' | 'drain' | 'afflict';
type DetailedVerb = 'area' | 'seal' | 'heal' | 'field' | 'move' | 'empower' | 'clone' | 'trap';
type PlainSheetVerb = Exclude<TechniqueEffect['verb'], DetailedVerb | LingeringVerb>;
const LINGERING_VERBS: readonly TechniqueEffect['verb'][] = ['knock', 'pin', 'drain', 'afflict'];

function isLingering(
  effect: TechniqueEffect,
): effect is Extract<TechniqueEffect, { verb: LingeringVerb }> {
  return LINGERING_VERBS.includes(effect.verb);
}

function isPlain(
  effect: TechniqueEffect,
): effect is Extract<TechniqueEffect, { verb: PlainSheetVerb }> {
  return effect.verb in PLAIN_WORDS;
}

/** Verbs whose line reads their data: how long, how much, where, what. */
function detailedLine(effect: Extract<TechniqueEffect, { verb: DetailedVerb }>): SheetLine {
  switch (effect.verb) {
    case 'area':
      return { text: AREA_WORDS[effect.size ?? 'small'], chip: null };
    case 'seal':
      return { text: 'Seals their techniques', chip: turns(effect.power) };
    case 'heal':
      return { text: 'Heals you', chip: `${effect.power} health` };
    case 'field':
      return {
        text: `Raises ${FIELD_WORDS[effect.field]} that blinds foes`,
        chip: null,
      };
    case 'move':
      return {
        text: effect.to
          ? `Takes you straight to ${effect.to} range`
          : 'Takes you to where you fight best',
        chip: null,
      };
    case 'empower':
      return {
        text: effect.opens
          ? `Opens ${stepWords(effect.opens)}: raises ${effect.boosts.map((s) => STAT_INFO[s].label.toLowerCase()).join(' and ')} until the body gives out`
          : `Raises ${effect.boosts.map((s) => STAT_INFO[s].label.toLowerCase()).join(' and ')}, at a price`,
        chip: effect.healthPerExchange ? `−${effect.healthPerExchange} health a turn` : null,
      };
    case 'clone':
      return {
        text: `Makes clones that ${effect.strikes ? 'fight and ' : ''}take hits`,
        chip: null,
      };
    case 'trap':
      return {
        text: effect.dazes ? 'Sets a trap that hurts and dazes' : 'Sets a trap where you stand',
        chip: null,
      };
  }
}

function lingeringLine(effect: Extract<TechniqueEffect, { verb: LingeringVerb }>): SheetLine {
  switch (effect.verb) {
    case 'knock':
      return {
        text: effect.to === 'close' ? 'Drags them in close' : `Throws them to ${effect.to} range`,
        chip: null,
      };
    case 'pin':
      return {
        text: 'Pins them: no stepping or fleeing, and slower to dodge',
        chip: turns(effect.power),
      };
    case 'drain':
      return {
        text: effect.absorb
          ? 'Drains their chakra, and some flows into you'
          : 'Drains their chakra',
        chip: `${effect.power} chakra`,
      };
    case 'afflict':
      return { text: HARM_WORDS[effect.harm], chip: `${AFFLICT_EXCHANGES} turns` };
  }
}

function effectLine(effect: TechniqueEffect): SheetLine {
  if (isPlain(effect)) return { text: PLAIN_WORDS[effect.verb], chip: null };
  return isLingering(effect) ? lingeringLine(effect) : detailedLine(effect);
}

function needLines(def: TechniqueDef): string[] {
  const open = def.needsOpen ? [`${capital(stepWords(def.needsOpen))} open`] : [];
  const n = def.needs;
  if (!n) return open;
  return [
    ...open,
    ...(n.nature ? [`${n.nature[0]?.toUpperCase() ?? ''}${n.nature.slice(1)} nature`] : []),
    ...(n.control ? [`Chakra control ${n.control}`] : []),
    ...(n.weapon ? [n.weapon === 'blade' ? 'A blade in hand' : 'Knuckles on'] : []),
    ...(n.minReserves !== undefined ? ['Deep chakra reserves'] : []),
  ];
}

function schoolOf(def: TechniqueDef, ctx: GameContext): string {
  if (def.clan) return `${ctx.content.clans.get(def.clan)?.name ?? 'A clan'} clan art`;
  return def.school ? `The ${def.school} school` : 'Standard technique';
}

const WOUNDING = new Set(['damage', 'area', 'break']);

/** You as a fighter today; pass one in when reading many sheets at once. */
export type Reader = CombatantSetup;

export function techniqueSheet(
  state: GameState,
  ctx: GameContext,
  def: TechniqueDef,
  you: Reader = playerCombatant(state, ctx),
): TechniqueSheet {
  const reach = reachOf(def);
  const wounding = def.effects.filter((e) => WOUNDING.has(e.verb));
  const power = wounding.reduce((sum, e) => sum + e.power, 0);
  const share = equalHitShare(you, def);
  const unstable = state.techniques.unstable.includes(def.id);
  return {
    reach: RANGE_BANDS.map((band) => ({ band: RANGE_LABEL[band], reaches: reach.includes(band) })),
    strength: wounding.length > 0 ? { word: strengthWord(power), power } : null,
    // Genjutsu can't be dodged, so how surely it lands only matters for the rest.
    lands:
      wounding.length > 0 && def.discipline !== 'genjutsu' ? LANDS[def.accuracy ?? 'steady'] : null,
    strikes: strikesOf(def),
    effects: def.effects.map(effectLine),
    chakra: chakraCost(you, {
      chakraCost: def.chakraCost,
      effects: def.effects,
      ...(unstable ? { unstable } : {}),
    }),
    costs: [
      ...(def.oncePerFight ? ['Once a fight'] : []),
      ...(def.afterCost ? ['Leaves you paying for it after the fight'] : []),
    ],
    needs: needLines(def),
    school: schoolOf(def, ctx),
    inYourHands: share === null ? null : `${capital(shareRead(share))} of an equal’s health`,
  };
}

function capital(text: string): string {
  return `${text[0]?.toUpperCase() ?? ''}${text.slice(1)}`;
}
