import type { CounterOutcome, CounterWaits } from '../../rules/counters';

/**
 * How counters tell themselves (`counter.ts`): waiting for one kind of attack, then the attack
 * read cleanly and answered, read late and only turned aside, or read wrong and let in. Each bank
 * keeps at least three lines (`counterLines.test.ts`). Slots: `{t}` the one countering, `{a}` the
 * attacker, `{what}` the attack.
 */

type Lines = Readonly<Record<CounterWaits, readonly string[]>>;

/** Playing a counter: settling in to wait for it. */
export const WAITING: Lines = {
  blow: [
    '{a} settle{a.s} low and wait{a.s}, hands loose, for the blow to come.',
    '{a} go{a.es} still, coiled, inviting the first strike.',
    '{a} drop{a.s} {a.their} guard a fraction and wait{a.s} for someone to take the bait.',
  ],
  blade: [
    '{a} hold{a.s} {a.their} blade low and wait{a.s} for the cut.',
    '{a} turn{a.s} {a.their} edge to meet whatever steel comes.',
    '{a} wait{a.s} with {a.their} blade ready to catch a cut and send it back.',
  ],
  thrown: [
    '{a} palm{a.s} a kunai and watch{a.es} for anything thrown.',
    '{a} wait{a.s} with steel in hand to knock down whatever flies.',
    '{a} track{a.s} every hand that might throw, a blade of {a.their} own ready.',
  ],
  eyes: [
    '{a} drop{a.s} {a.their} gaze to the shoulders and keep{a.s} it there.',
    '{a} watch{a.es} feet and hands, never eyes.',
    '{a} look{a.s} past the face, ready to look away.',
  ],
};

/** A clean read: the attack stopped and answered. */
export const CLEAN: Lines = {
  blow: [
    '{t} read{t.s} {a.poss} {what} as it starts, slip{t.s} inside it and hit{t.s} back.',
    '{t} catch{t.es} {a.poss} {what} and turn{t.s} it round on {a}.',
    '{a.poss} {what} meets nothing but {t.poss} answer.',
  ],
  blade: [
    '{t} catch{t.es} {a.poss} {what} on {t.their} blade and cut{t.s} back along it.',
    'Steel rings as {t} turn{t.s} {a.poss} {what} aside and answer{t.s} with an edge.',
    '{t} block{t.s} {a.poss} {what} and cut{t.s} into the opening it leaves.',
  ],
  thrown: [
    '{t} knock{t.s} {a.poss} {what} out of the air and throw{t.s} back before it lands.',
    'Steel meets steel, and {t.poss} answer flies back at {a}.',
    '{t} bat{t.s} {a.poss} {what} aside and send{t.s} a kunai of {t.their} own after it.',
  ],
  eyes: [
    '{t} look{t.s} away as {a.poss} {what} comes, and it finds nothing to take hold of.',
    '{t} keep{t.s} {t.their} eyes on {a.poss} feet, and {a.poss} {what} slides past.',
    '{a.poss} {what} needs {t.poss} eyes, and {t} never give{t.s} them.',
  ],
};

/** A late read: the attack turned aside, nothing back. */
export const LATE: Lines = {
  blow: [
    '{t} only just get{t.s} a hand to {a.poss} {what} and turn{t.s} it aside.',
    '{t} read{t.s} {a.poss} {what} late, and deflecting it is all {t} can do.',
    '{t} knock{t.s} {a.poss} {what} wide, with no time to answer it.',
  ],
  blade: [
    '{t} get{t.s} {t.their} blade across in time, and no more.',
    '{a.poss} {what} skids off {t.poss} steel, too fast to answer.',
    '{t} turn{t.s} {a.poss} {what} aside, a breath from too late.',
  ],
  thrown: [
    '{t} knock{t.s} {a.poss} {what} down with nothing to spare.',
    'Steel clatters away as {t} bat{t.s} {a.poss} {what} aside at the last.',
    '{t} deflect{t.s} {a.poss} {what}, too late to throw back.',
  ],
  eyes: [
    '{t} tear{t.s} {t.their} eyes away just in time.',
    '{t} look{t.s} away a heartbeat late, and {a.poss} {what} only grazes {t.their} mind.',
    '{t} blink{t.s} away from {a.poss} {what} before it can settle.',
  ],
};

/** A wrong read: waiting for it, and it got in anyway. */
export const MISSED: Lines = {
  blow: [
    '{t} wait{t.s} for {a.poss} {what} and read{t.s} it wrong.',
    '{a.poss} {what} comes faster than {t} read{t.s} it, and {t} {t.is} wide open.',
    '{t} move{t.s} to answer a blow that never comes the way {t} expected.',
  ],
  blade: [
    '{t.poss} parry meets empty air, and {a.poss} {what} does not.',
    '{t} read{t.s} the wrong line, and {a.poss} {what} comes through the other.',
    '{a.poss} {what} is past {t.poss} blade before it moves.',
  ],
  thrown: [
    '{t} swing{t.s} at {a.poss} {what} and miss{t.es}.',
    '{a.poss} {what} flies past {t.poss} waiting steel.',
    '{t} read{t.s} the throw a beat too late.',
  ],
  eyes: [
    '{t} look{t.s} away too late, and {a.poss} {what} already has {t.them}.',
    '{a.poss} {what} catches {t.poss} eye in the instant {t} glance{t.s} up.',
    '{t} meet{t.s} {a.poss} eyes for a heartbeat, and it is enough.',
  ],
};

export const OUTCOME_LINES: Readonly<Record<CounterOutcome, Lines>> = {
  clean: CLEAN,
  late: LATE,
  missed: MISSED,
};
