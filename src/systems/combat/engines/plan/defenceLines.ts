import type { Approach } from '../../rules/tags';

/**
 * Defences told by what came at the defender (`rules/tags/approach.ts`): a fist is ducked, a
 * blade leaned away from, thrown steel turned side-on to, something out of the ground jumped
 * clear of. Each bank keeps at least three lines (held to by `defenceLines.test.ts`), picked
 * fresh like every line (`fresh.ts`). Slots: `{t}` the defender, `{a}` the attacker, `{what}`
 * the attack, `{jutsu}` a substitution. Walls are `wallLines.ts`.
 */

type Lines = Readonly<Record<Approach, readonly string[]>>;

/** A ready Dodge taking the defender clear. */
export const DODGES: Lines = {
  blow: [
    '{t} twist{t.s} clear of {a.poss} {what}.',
    '{t} duck{t.s} under {a.poss} {what}.',
    '{a.poss} {what} cuts only air as {t} sway{t.s} aside.',
  ],
  grab: [
    '{t} twist{t.s} out of {a.poss} {what} before it can take hold.',
    '{a} reach{a.es} for {t}, and {t} {t.is} not there.',
    '{t} drop{t.s} low and out of {a.poss} {what}.',
  ],
  blade: [
    '{t} lean{t.s} back, and {a.poss} {what} passes a hair from {t.their} throat.',
    '{t} step{t.s} inside the arc of {a.poss} {what}.',
    'Steel whistles past {t} as {a.poss} {what} misses.',
  ],
  thrown: [
    '{t} turn{t.s} side-on, and {a.poss} {what} flies past.',
    '{a.poss} {what} thuds into the ground where {t} stood.',
    '{t} roll{t.s} aside, and {a.poss} {what} skips away behind.',
  ],
  breath: [
    '{t} dive{t.s} under {a.poss} {what} as it roars overhead.',
    '{t} break{t.s} sideways out of the path of {a.poss} {what}.',
    '{a.poss} {what} pours past, and {t} {t.is} already out of it.',
  ],
  ground: [
    '{t} spring{t.s} up as {a.poss} {what} bursts from below.',
    'The ground heaves under {t}, and {t} {t.is} off it before {a.poss} {what} closes.',
    '{t} skip{t.s} back from where {a.poss} {what} rises.',
  ],
  above: [
    '{t} throw{t.s} {t.themself} clear as {a.poss} {what} comes down.',
    '{a.poss} {what} falls on empty ground, and {t} {t.is} out from under it.',
    '{t} look{t.s} up in time and get{t.s} out from under {a.poss} {what}.',
  ],
  blast: [
    '{t} get{t.s} to the edge of {a.poss} {what} and over it.',
    '{t} outrun{t.s} the front of {a.poss} {what}.',
    '{a.poss} {what} sweeps the ground, and {t} {t.is} past its edge.',
  ],
  mind: [
    '{t} shake{t.s} off {a.poss} {what} before it settles.',
    '{t} see{t.s} {a.poss} {what} for what it is.',
    '{a.poss} {what} slides off {t.poss} mind.',
  ],
};

/** A slip with no Dodge ready: read in time, or plain luck. */
export const SLIPS: Lines = {
  blow: [
    '{t} slip{t.s} past {a.poss} {what}.',
    '{t} roll{t.s} with {a.poss} {what}, and it glances off.',
    '{a.poss} {what} finds only the space where {t} stood.',
  ],
  grab: [
    '{a.poss} {what} closes on cloth, and {t} tear{t.s} loose.',
    '{t} slip{t.s} {a.poss} {what} at the last moment.',
    '{a.poss} hands find nothing to hold as {t} slide{t.s} away.',
  ],
  blade: [
    '{a.poss} {what} catches only the edge of {t.poss} sleeve.',
    '{t} {t.is} half a step back when {a.poss} {what} falls.',
    '{a.poss} {what} bites into nothing.',
  ],
  thrown: [
    '{a.poss} {what} hisses past {t}.',
    '{a.poss} {what} goes by {t} by a finger.',
    '{t} flinch{t.es} aside, and {a.poss} {what} misses.',
  ],
  breath: [
    '{a.poss} {what} washes past {t} without catching.',
    '{t} {t.is} just outside the edge of {a.poss} {what}.',
    '{a.poss} {what} tears up the ground beside {t}.',
  ],
  ground: [
    '{a.poss} {what} breaks the ground a step short of {t}.',
    '{t} {t.is} already moving when {a.poss} {what} comes up.',
    '{a.poss} {what} rises behind {t} and closes on nothing.',
  ],
  above: [
    '{a.poss} {what} comes down a step behind {t}.',
    '{t} stumble{t.s} clear just before {a.poss} {what} lands.',
    '{a.poss} {what} crashes down beside {t}.',
  ],
  blast: [
    '{t} {t.is} at the very edge of {a.poss} {what}, and it passes.',
    '{a.poss} {what} spends itself just short of {t}.',
    '{t} find{t.s} the one gap in {a.poss} {what}.',
  ],
  mind: [
    '{a.poss} {what} never quite takes hold of {t}.',
    '{t} blink{t.s}, and {a.poss} {what} is gone.',
    '{t.poss} mind slides out from under {a.poss} {what}.',
  ],
};

/** A plain substitution taking the hit in its owner's place. */
export const SWAPS: Lines = {
  blow: [
    '{a.poss} {what} splinters the log {t} left behind with {jutsu}.',
    '{t} swap{t.s} out of {a.poss} {what} with {jutsu}, and a log takes it.',
    '{a.poss} {what} lands on a log, and {t} {t.is} gone.',
  ],
  grab: [
    '{a} haul{a.s} up a log, not {t}: {jutsu}.',
    '{a.poss} {what} wraps round a log as {t} swap{t.s} out with {jutsu}.',
    '{a} slam{a.s} a log into the ground, and {t} {t.is} elsewhere.',
  ],
  blade: [
    '{a.poss} {what} cleaves a log in two, and {t} {t.is} elsewhere.',
    'Wood chips fly as {a.poss} {what} bites into a log.',
    '{t} leave{t.s} a log in the path of {a.poss} {what} with {jutsu}.',
  ],
  thrown: [
    '{a.poss} {what} thunks into a log, and {t} {t.is} elsewhere.',
    'A log bristling with {a.poss} {what} drops where {t} stood.',
    '{t} swap{t.s} out with {jutsu}, and {a.poss} {what} pins a log.',
  ],
  breath: [
    '{a.poss} {what} swallows a log in {t.poss} place.',
    '{t} {t.is} gone with {jutsu}, and {a.poss} {what} breaks over a log.',
    'Only a log takes {a.poss} {what}, and {t} {t.is} clear.',
  ],
  ground: [
    '{a.poss} {what} closes on a log, and {t} {t.is} elsewhere.',
    'A log is dragged under by {a.poss} {what}.',
    '{t} leave{t.s} a log for {a.poss} {what} to take.',
  ],
  above: [
    '{a.poss} {what} flattens a log where {t} stood.',
    '{t} swap{t.s} out with {jutsu}, and {a.poss} {what} crushes a log.',
    'A log is all {a.poss} {what} comes down on.',
  ],
  blast: [
    '{t} swap{t.s} clear of {a.poss} {what} with {jutsu}, and a log is torn apart.',
    '{a.poss} {what} shreds the log {t} left behind.',
    'Splinters fly in {a.poss} {what}, and {t} {t.is} out of it.',
  ],
  mind: [
    '{t} swap{t.s} out of reach of {a.poss} {what} with {jutsu}.',
    '{t} {t.is} somewhere else by the time {a.poss} {what} lands.',
    '{a.poss} {what} takes hold of a log, and {t} {t.is} gone.',
  ],
};
