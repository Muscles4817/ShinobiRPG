import type { CombatOption } from '../../contract';
import { alive } from '../../rules/body';
import type { CombatStance } from '../../teamContract';
import { inSight } from './senses';
import { patch, playerOf, type PlanFighter, type PlanState } from './state';
import { editLoadout, tableOptions } from './table';
import { isTeammate, stanceLoadout } from './team';

/**
 * Orders to the team at the card table: the team mark (a foe the player's side goes for), each
 * teammate's stance and, when they let you, their cards. What a teammate lets you change comes
 * with the fight (`CombatantSetup.orders`, decided by the game from your bonds); what they don't
 * is still shown, disabled, saying why.
 */

const MARK_PREFIX = 'mark:';
const NO_MARK = 'none';
const STANCE_PREFIX = 'stance:';
const CARDS_PREFIX = 'cards:';
/** A teammate's card-table option: `for:<fighter id>|<the table's own option id>`. */
const FOR_PREFIX = 'for:';
const MARK_GROUP = 'Team mark';

const STANCE_DETAIL: Readonly<Record<CombatStance['kind'], string>> = {
  press: 'Close in and attack, going for the mark',
  cover: 'Guard them, and step in front of attacks aimed at them',
  support: 'Daze, seal and heal first to set up the rest',
  hold: 'Keep their place and range, spare chakra',
};

function stanceKey(stance: CombatStance): string {
  return stance.kind === 'cover' ? `cover|${stance.covers}` : stance.kind;
}

function stanceLocked(ally: PlanFighter): string | undefined {
  if (!ally.orders) return `${ally.name} follows their own judgement.`;
  return ally.orders.stanceLocked;
}

function cardsLocked(ally: PlanFighter): string | undefined {
  if (!ally.orders) return `${ally.name} fights their own way.`;
  return ally.orders.cardsLocked;
}

/** The stances on offer for a teammate: press, cover each other fighter on the side, support, hold. */
function stancesFor(ally: PlanFighter, fighters: readonly PlanFighter[]): CombatStance[] {
  const wards = fighters.filter((f) => isTeammate(f) || f.isPlayer);
  const covers = wards
    .filter((w) => w.id !== ally.id && alive(w))
    .map((w): CombatStance => ({ kind: 'cover', covers: w.id }));
  return [{ kind: 'press' }, ...covers, { kind: 'support' }, { kind: 'hold' }];
}

const STANCE_LABEL: Readonly<Record<Exclude<CombatStance['kind'], 'cover'>, string>> = {
  press: 'Press',
  support: 'Support',
  hold: 'Hold',
};

function stanceLabel(stance: CombatStance, fighters: readonly PlanFighter[]): string {
  if (stance.kind !== 'cover') return STANCE_LABEL[stance.kind];
  const ward = fighters.find((f) => f.id === stance.covers);
  return ward?.isPlayer ? 'Cover you' : `Cover ${ward?.name ?? 'a teammate'}`;
}

function stanceOptions(ally: PlanFighter, fighters: readonly PlanFighter[]): CombatOption[] {
  const locked = stanceLocked(ally);
  const current = ally.stance ? stanceKey(ally.stance) : null;
  return stancesFor(ally, fighters).map((stance): CombatOption => ({
    id: `${STANCE_PREFIX}${ally.id}|${stanceKey(stance)}`,
    label: stanceLabel(stance, fighters),
    detail: STANCE_DETAIL[stance.kind],
    kind: 'order',
    group: ally.name,
    adjusts: ally.id,
    setting: 'Stance',
    selected: current === stanceKey(stance),
    ...(locked ? { disabledReason: locked } : {}),
  }));
}

/** A teammate's card table, when they let you change it; else a note saying why not. */
function cardOptions(ally: PlanFighter): CombatOption[] {
  const locked = cardsLocked(ally);
  if (locked) {
    const note: CombatOption = {
      id: `${CARDS_PREFIX}${ally.id}`,
      label: 'Their cards',
      detail: '',
      kind: 'order',
      group: ally.name,
      adjusts: ally.id,
      setting: 'Cards',
      disabledReason: locked,
    };
    return [note];
  }
  const own = (id: string) => `${FOR_PREFIX}${ally.id}|${id}`;
  return tableOptions(ally).map((o) => ({
    ...o,
    id: own(o.id),
    owner: ally.id,
    ...(o.adjusts === undefined ? {} : { adjusts: own(o.adjusts) }),
  }));
}

function markOptions(state: PlanState): CombatOption[] {
  const player = playerOf(state);
  const foes = state.fighters.filter((f) => f.side === 'enemy' && alive(f) && inSight(player, f));
  const marked = foes.some((f) => f.id === state.mark) ? state.mark : undefined;
  const base = {
    detail: '',
    kind: 'order',
    group: MARK_GROUP,
    adjusts: 'mark',
    setting: 'Mark',
  } as const;
  const none: CombatOption = {
    ...base,
    id: `${MARK_PREFIX}${NO_MARK}`,
    label: 'No mark',
    selected: marked === undefined,
  };
  return [
    none,
    ...foes.map((f): CombatOption => ({
      ...base,
      id: `${MARK_PREFIX}${f.id}`,
      label: f.name,
      selected: marked === f.id,
    })),
  ];
}

/**
 * Every team order at the card table. The mark is offered once there is a team or more than
 * one foe to choose between.
 */
export function teamOptions(state: PlanState): CombatOption[] {
  const allies = state.fighters.filter((f) => isTeammate(f) && alive(f));
  const foes = state.fighters.filter((f) => f.side === 'enemy' && alive(f));
  const mark = allies.length > 0 || foes.length > 1 ? markOptions(state) : [];
  const orders = allies.flatMap((a) => [...stanceOptions(a, state.fighters), ...cardOptions(a)]);
  return [...mark, ...orders];
}

function parseStance(rest: string): { allyId: string; stance: CombatStance } | null {
  const [allyId, kind, covers] = rest.split('|');
  if (!allyId) return null;
  if (kind === 'cover') return covers ? { allyId, stance: { kind, covers } } : null;
  if (kind === 'press' || kind === 'support' || kind === 'hold')
    return { allyId, stance: { kind } };
  return null;
}

/** A new stance brings the cards that go with it. */
function setStance(state: PlanState, rest: string): PlanState | null {
  const parsed = parseStance(rest);
  const ally = parsed && state.fighters.find((f) => f.id === parsed.allyId);
  if (!parsed || !ally) return null;
  const loadout = stanceLoadout(ally, parsed.stance, state.fighters);
  return {
    ...state,
    fighters: patch(state.fighters, ally.id, { stance: parsed.stance, loadout }),
  };
}

function editAllyCards(state: PlanState, rest: string): PlanState | null {
  const split = rest.indexOf('|');
  const ally = state.fighters.find((f) => f.id === rest.slice(0, split));
  return ally ? editLoadout(state, ally, rest.slice(split + 1)) : null;
}

function setMark(state: PlanState, target: string): PlanState {
  const { mark: _old, ...rest } = state;
  return target === NO_MARK ? rest : { ...rest, mark: target };
}

/** Applies a team order, or null when the option isn't one. Options are checked by the caller. */
export function editTeam(state: PlanState, optionId: string): PlanState | null {
  if (optionId.startsWith(MARK_PREFIX)) return setMark(state, optionId.slice(MARK_PREFIX.length));
  if (optionId.startsWith(STANCE_PREFIX)) {
    return setStance(state, optionId.slice(STANCE_PREFIX.length));
  }
  if (optionId.startsWith(FOR_PREFIX))
    return editAllyCards(state, optionId.slice(FOR_PREFIX.length));
  return null;
}
