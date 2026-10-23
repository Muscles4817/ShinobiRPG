import { stepWords, type LadderStep } from '@/systems/techniques';

import { alive } from '../../rules/body';
import { maxBreath } from '../../rules/breath';
import { harmLine } from '../../rules/narration';
import {
  attributesAfterEmpower,
  canOpen,
  CHAKRA_SURGE_PER_STEP,
  driveOf,
  empower,
  empowerEnds,
  givesOut as bodyGivesOut,
  healthAfterPrice,
  openStep,
  spentBody,
  stepBreathPrice,
  stepToll,
  wearsBody,
  type EffectUse,
} from '../../rules/verbs';
import { breathOf } from './effort';
import { felled } from './falls';
import { shadowsGone } from './shadows';
import { fighterIn, say, type PlanFighter, type Round } from './state';
import { tell } from '../../rules/telling';

/**
 * Empower in a planned fight: the user's stats rise at once (every rule reads them raised), the
 * body pays its price as each exchange ends, and the stats fall back when it runs out. An
 * empower already in force isn't stacked, but a ladder climbs: opening a deeper gate replaces
 * the one below, releasing a surge of chakra for each step climbed, and holds until the body
 * gives out (`rules/verbs/ladders.ts`): each exchange it takes its toll of health and wind
 * (`rules/verbs/tolls.ts`), and when health or breath runs out it slams shut and leaves its user
 * reeling and spent for the rest of the fight, or past the seventh gate, collapsed.
 */

/** Exchanges a fighter loses when an open ladder gives out. */
const GIVE_OUT_TURNS = 1;

export function empowerSelf(round: Round, actor: PlanFighter, use: EffectUse<'empower'>): Round {
  const { opens } = use.effect;
  const climbs = opens !== undefined && canOpen(actor, use.technique);
  if (actor.empowered && !climbs) {
    return say(round, tell('{a} {a.is} already pushing past {a.their} limits.', { a: actor }));
  }
  const change = empower(actor, use, { drive: driveOf(actor, use), exchange: round.number });
  const climbed = opens ? opens.step - openStep(actor, opens.ladder) : 0;
  const chakra = Math.min(actor.maxChakra, actor.chakra + climbed * CHAKRA_SURGE_PER_STEP);
  const fighters = round.fighters.map((f) => (f.id === actor.id ? { ...f, ...change, chakra } : f));
  const told = opens
    ? openingLine(actor, opens)
    : tell('Chakra surges through {a.poss} body.', { a: actor });
  return say({ ...round, fighters }, told);
}

function openingLine(actor: PlanFighter, opens: LadderStep): string {
  switch (opens.ladder) {
    case 'gates':
      return tell('{a} force{a.s} open {gate}; chakra roars through {a.their} body.', {
        a: actor,
        gate: stepWords(opens),
      });
    case 'sage':
      return tell(SAGE_OPENS, { a: actor });
  }
}

const SAGE_OPENS =
  'Natural energy floods into {a} out of the stillness, and a toad’s marks ring {a.their} eyes.';

/** Sage toads perched on their summoner keep drawing natural energy in for them (`perching.ts`). */
function renewed(f: PlanFighter): boolean {
  return f.empowered?.opened?.ladder === 'sage' && (f.perched ?? []).length > 0;
}

function endLine(f: PlanFighter): string {
  return f.empowered?.opened?.ladder === 'sage'
    ? tell('The natural energy runs out of {a}, and {a.poss} sage mode fades.', { a: f })
    : tell('{a.poss} surge of strength fades.', { a: f });
}

function ended(f: PlanFighter): PlanFighter {
  const { empowered: _over, ...rest } = f;
  return { ...rest, attributes: attributesAfterEmpower(f) };
}

/**
 * An open ladder slammed shut: the stats it lent taken back, the body spent for the rest of the
 * fight (`spentBody`) and never forced open again, reeling; past the seventh gate, collapsed and
 * out of the fight.
 */
function shut(f: PlanFighter, opened: LadderStep): PlanFighter {
  const base = ended(f);
  const attributes = spentBody(base.attributes, opened);
  const breath = Math.min(breathOf(base), maxBreath(attributes));
  const health = stepToll(opened).collapses ? 0 : base.health;
  const laddersShut = [...(base.laddersShut ?? []), opened.ladder];
  return {
    ...base,
    attributes,
    breath,
    health,
    laddersShut,
    stunned: base.stunned + GIVE_OUT_TURNS,
  };
}

/** What one exchange of an empower in force takes: its health price, and a ladder's wind. */
function paid(f: PlanFighter): PlanFighter {
  const health = healthAfterPrice(f);
  const opened = f.empowered?.opened;
  if (!opened) return { ...f, health };
  const breath = Math.max(0, breathOf(f) - stepBreathPrice(opened, maxBreath(f.attributes)));
  return { ...f, health, breath };
}

function shutLine(f: PlanFighter, opened: LadderStep): string {
  return stepToll(opened).collapses
    ? tell('The gates slam shut, and {a.poss} body gives out under {a.them}.', { a: f })
    : tell('{a.poss} body gives out, and the gates slam shut.', { a: f });
}

/** Whether an open ladder step gives out: the Gates when the body does; Sage Mode never. */
function givesOut(f: PlanFighter): boolean {
  const opened = f.empowered?.opened;
  return (
    opened !== undefined && wearsBody(opened.ladder) && bodyGivesOut({ ...f, breath: breathOf(f) })
  );
}

/** An empower still in force; perched toads keep Sage Mode going another exchange. */
function heldOn(f: PlanFighter, exchange: number): PlanFighter {
  if (!renewed(f) || !f.empowered) return f;
  return { ...f, empowered: { ...f.empowered, until: exchange + 1 } };
}

/** One fighter's empower as the exchange ends: the price paid, and the end if it has come. */
function tick(round: Round, id: string, exchange: number): Round {
  const f = fighterIn(round, id);
  if (!f?.empowered || !alive(f)) return round;
  const after = paid(f);
  const opened = f.empowered.opened;
  const spent = givesOut(after) ? opened : undefined;
  const over = spent !== undefined || (!renewed(f) && empowerEnds(f, exchange));
  const next = spent ? shut(after, spent) : over ? ended(after) : heldOn(after, exchange);
  const fighters = round.fighters.map((g) => (g.id === id ? next : g));
  const price = f.health - after.health;
  const lines = [
    ...(price > 0 ? [harmLine(tell('The strain tells on {a.poss} body.', { a: f }), price)] : []),
    ...(spent ? [shutLine(f, spent)] : over ? [endLine(f)] : []),
  ];
  const told = say({ ...round, fighters }, ...lines);
  // Collapsed past the seventh gate: down like any fall, their clones with them.
  return alive(next) ? told : shadowsGone(felled(told, next), next);
}

/** As an exchange ends: every empower in force takes its price, and those run out end. */
export function afterEmpowers(round: Round, exchange: number): Round {
  return round.fighters.reduce((r, f) => tick(r, f.id, exchange), round);
}
