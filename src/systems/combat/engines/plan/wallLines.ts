import type { Element } from '@/systems/techniques';

/**
 * Elemental walls told by what meets them (`rules/elements.ts`): water puts fire out in steam,
 * lightning splits stone, fire only feeds on wind. A wall that overpowers the attack holds
 * (`HOLDS`, by the wall: the element it beats is fixed), one overpowered breaks (`BREAKS`), and
 * between even elements it takes the hit and is spent (`TAKES` by the wall, beside `MEETS` by
 * what hit it, so fire on stone reads as fire). Slots: `{wall}`, `{t}`, `{a}`, `{what}`.
 */

type Lines = Readonly<Record<Element, readonly string[]>>;

export const HOLDS: Lines = {
  water: [
    '{wall} meets {a.poss} {what} and puts it out in a roar of steam.',
    'Steam bursts up where {a.poss} {what} hits {wall}, and the water still stands.',
    '{a.poss} {what} hisses and dies against {wall}.',
  ],
  earth: [
    '{wall} drinks in {a.poss} {what} and stands.',
    '{a.poss} {what} breaks against {wall} and soaks away into it.',
    'Mud runs down {wall}, but it holds against {a.poss} {what}.',
  ],
  fire: [
    '{a.poss} {what} feeds {wall} and only makes it roar.',
    '{wall} swallows {a.poss} {what} and flares higher.',
    'The wind of {a.poss} {what} fans {wall} brighter.',
  ],
  wind: [
    '{wall} scatters {a.poss} {what} into harmless sparks.',
    '{a.poss} {what} is torn apart in {wall}.',
    '{wall} shears {a.poss} {what} to nothing.',
  ],
  lightning: [
    '{a.poss} {what} cracks to gravel against {wall}.',
    '{wall} splits {a.poss} {what} apart.',
    'Stone shatters on {wall}, and {a.poss} {what} falls in pieces.',
  ],
};

export const BREAKS: Lines = {
  water: [
    '{a.poss} {what} drives through {wall} and leaves it a muddy spill.',
    '{wall} soaks into {a.poss} {what} and is gone.',
    '{a.poss} {what} buries {wall}.',
  ],
  earth: [
    '{a.poss} {what} splits {wall} down the middle.',
    'Lightning tears {wall} to rubble, and {a.poss} {what} comes on.',
    '{wall} cracks apart under {a.poss} {what}.',
  ],
  fire: [
    '{a.poss} {what} puts out {wall} in a cloud of steam.',
    '{wall} gutters out under {a.poss} {what}.',
    '{a.poss} {what} drowns {wall}.',
  ],
  wind: [
    '{a.poss} {what} rides {wall} and grows.',
    '{wall} only fans {a.poss} {what} into a blaze.',
    '{a.poss} {what} swallows {wall} whole.',
  ],
  lightning: [
    '{a.poss} {what} blows {wall} apart.',
    '{wall} scatters before {a.poss} {what}.',
    '{a.poss} {what} cuts {wall} to fading sparks.',
  ],
};

export const TAKES: Lines = {
  water: [
    '{wall} takes {a.poss} {what} and collapses in a wash of spray.',
    '{a.poss} {what} slams into {wall}, and both are spent.',
    '{wall} rises in time to take {a.poss} {what}.',
  ],
  earth: [
    '{wall} heaves up, takes {a.poss} {what} and crumbles.',
    '{t} {t.is} behind {wall} when {a.poss} {what} hits.',
    '{a.poss} {what} brings {wall} down, but not {t}.',
  ],
  fire: [
    '{wall} burns between {t} and {a.poss} {what} and is spent.',
    '{a.poss} {what} is lost in the flames of {wall}.',
    '{a.poss} {what} tears through {wall}, but {t} {t.is} gone behind it.',
  ],
  wind: [
    '{wall} turns {a.poss} {what} aside and dies away.',
    '{a.poss} {what} is caught in {wall} and thrown wide.',
    'A gust of {wall} knocks {a.poss} {what} off course.',
  ],
  lightning: [
    '{wall} crackles between {t} and {a.poss} {what} and is spent.',
    '{a.poss} {what} bursts against {wall} in a shower of sparks.',
    '{wall} flares and takes {a.poss} {what}.',
  ],
};

/** An even wall met by an element: told as that element. */
export const MEETS: Lines = {
  fire: [
    '{a.poss} {what} washes over {wall} and leaves it scorched and spent.',
    'Flame pours round {wall}, and {t} {t.is} not behind it any more.',
    '{wall} blackens under {a.poss} {what} and gives way.',
  ],
  water: [
    '{a.poss} {what} pounds {wall} until it gives, and {t} {t.is} clear.',
    'Water breaks over {wall} and runs off it, spent.',
    '{wall} streams with {a.poss} {what} and comes apart.',
  ],
  earth: [
    'Stone grinds into {wall}, and both crumble.',
    '{a.poss} {what} buries itself in {wall}.',
    '{wall} is battered down by {a.poss} {what}, and {t} {t.is} clear.',
  ],
  wind: [
    '{a.poss} {what} howls against {wall} and dies.',
    '{wall} bends in {a.poss} {what} and is gone.',
    'Wind scours {wall} away, but {t} {t.is} clear.',
  ],
  lightning: [
    '{a.poss} {what} cracks into {wall}, and both are gone.',
    'Lightning runs over {wall} and earths itself.',
    '{wall} takes the bolt of {a.poss} {what} and falls.',
  ],
};
