import type { CombatOption, RangeBand } from '../../contract';
import { RANGE_BANDS, RANGE_LABEL } from '../../rules/range';
import { cardId } from './cards';
import { defaultReactions, reactionAt, reactionChoices } from './readiness';
import type { PlanFighter, PlanState } from './state';
import { cardDetail, cardLabel } from './wording';
import { holdOffAt, holdOffChoices, NO_HOLD_OFF } from './zoning';

/**
 * The card table's settings for each distance that aren't slots: the defence kept ready
 * there, what is fired at anyone closing in from there (mid and far only), and where the
 * fighter fights (one choice, shown with every distance). Each choice is
 * an option the fight screen shows as a picker; picking one is an edit to the plan.
 */

const READY_PREFIX = 'ready:';
const KEEP_PREFIX = 'keep:';
const HOLD_PREFIX = 'hold:';
const ANYWHERE = 'any';
const NOTHING = 'none';

export const REACTION_SETTING = 'Defence';
export const KEEP_SETTING = 'Fight at';
export const HOLD_SETTING = 'Hold off';

const KEEP_LABEL: Readonly<Record<RangeBand | typeof ANYWHERE, string>> = {
  any: 'Wherever I stand',
  close: 'Close range',
  mid: 'Mid range',
  far: 'Far range',
};

const KEEP_DETAIL: Readonly<Record<RangeBand | typeof ANYWHERE, string>> = {
  any: 'Step only when nothing slotted reaches',
  close: 'Close in first whenever further off',
  mid: 'Make for mid range first',
  far: 'Back off first whenever closer',
};

function reactionOptions(fighter: PlanFighter, band: RangeBand): CombatOption[] {
  const current = reactionAt(fighter, band);
  return reactionChoices(fighter, band).map((card) => ({
    id: `${READY_PREFIX}${band}:${cardId(card)}`,
    label: cardLabel(card, fighter),
    detail: cardDetail(card, fighter),
    kind: 'plan',
    group: RANGE_LABEL[band],
    setting: REACTION_SETTING,
    selected: current !== null && cardId(current) === cardId(card),
  }));
}

function keepOptions(fighter: PlanFighter, band: RangeBand): CombatOption[] {
  const choices = [ANYWHERE, ...RANGE_BANDS] as const;
  return choices.map((value) => ({
    id: `${KEEP_PREFIX}${band}:${value}`,
    label: KEEP_LABEL[value],
    detail: KEEP_DETAIL[value],
    kind: 'plan',
    group: RANGE_LABEL[band],
    setting: KEEP_SETTING,
    selected: (fighter.keepAt ?? ANYWHERE) === value,
  }));
}

/** What to fire at anyone closing in from this distance (`zoning.ts`): nothing, kunai, a technique. */
function holdOptions(fighter: PlanFighter, band: RangeBand): CombatOption[] {
  const choices = holdOffChoices(fighter, band);
  if (choices.length === 0) return [];
  const current = holdOffAt(fighter, band);
  const none: CombatOption = {
    id: `${HOLD_PREFIX}${band}:${NOTHING}`,
    label: 'Nothing',
    detail: 'Let them come',
    kind: 'plan',
    group: RANGE_LABEL[band],
    setting: HOLD_SETTING,
    selected: current === null,
  };
  return [
    none,
    ...choices.map((card) => ({
      id: `${HOLD_PREFIX}${band}:${cardId(card)}`,
      label: cardLabel(card, fighter),
      detail: 'Fired at anyone closing in on you',
      kind: 'plan' as const,
      group: RANGE_LABEL[band],
      setting: HOLD_SETTING,
      selected: current !== null && cardId(current) === cardId(card),
    })),
  ];
}

/** A distance's settings beside its slots: its defence, what holds foes off, where to fight. */
export function readinessOptions(fighter: PlanFighter, band: RangeBand): CombatOption[] {
  return [
    ...reactionOptions(fighter, band),
    ...holdOptions(fighter, band),
    ...keepOptions(fighter, band),
  ];
}

function isBand(value: string): value is RangeBand {
  return RANGE_BANDS.some((b) => b === value);
}

function withKeepAt(fighter: PlanFighter, value: string): PlanFighter {
  const { keepAt: _was, ...rest } = fighter;
  return isBand(value) ? { ...rest, keepAt: value } : rest;
}

function withHoldOff(fighter: PlanFighter, band: RangeBand, id: string): PlanFighter {
  const holdOff = { ...(fighter.holdOff ?? NO_HOLD_OFF), [band]: id === NOTHING ? null : id };
  return { ...fighter, holdOff };
}

function withReaction(fighter: PlanFighter, band: RangeBand, id: string): PlanFighter {
  const reactions = { ...(fighter.reactions ?? defaultReactions(fighter)), [band]: id };
  return { ...fighter, reactions };
}

/** Applies a settings option to a fighter, or null when the option isn't one. */
export function editReadiness<S extends Pick<PlanState, 'fighters'>>(
  state: S,
  fighter: PlanFighter,
  optionId: string,
): S | null {
  const prefix = [READY_PREFIX, KEEP_PREFIX, HOLD_PREFIX].find((p) => optionId.startsWith(p));
  if (!prefix) return null;
  const rest = optionId.slice(prefix.length);
  const split = rest.indexOf(':');
  const band = rest.slice(0, split);
  const value = rest.slice(split + 1);
  if (!isBand(band)) return null;
  const changed =
    prefix === KEEP_PREFIX
      ? withKeepAt(fighter, value)
      : prefix === HOLD_PREFIX
        ? withHoldOff(fighter, band, value)
        : withReaction(fighter, band, value);
  return { ...state, fighters: state.fighters.map((f) => (f.id === fighter.id ? changed : f)) };
}
