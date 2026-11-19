# Technique tags: how a move works

Worked out with the owner move by move (the doc "How moves work: tagging techniques"). A
technique's effects say what it does; its tags say how. The engine and the story read the tags
to decide whether a move can be used on a target, how it lands and what answers it.

## The axes (`systems/techniques/tags.ts`)

| Axis                | What it says                                            | Values                                                                                                                                                                    |
| ------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Delivery            | How it reaches the target                               | strike, charge, grapple, weapon, thrown, placed, breath, gas, eye-contact, sound, senses, touch, along-ground, from-ground, from-above, burst, field, threads, body, self |
| Shape               | What ground it covers                                   | one, spread, line, cone, burst, zone (an area's size stays on its effect), none                                                                                           |
| Needs of the target | What the target must be, as things stand at that moment | liftable (the user's strength now against the target's size now), mind, meets-eyes, on-ground, casts-shadow, chakra-points, straight-line                                 |
| Lands as            | What it does to a body or mind                          | harmed, thrown-back, slammed, bound, mirrored, crushed, frozen, stunned, dreaming, confused, sealed, drained, burning, lingering, blast, mended, strengthened, hidden     |
| Catches             | How much of a body it catches                           | point (a pinprick on a giant), whole (a push or a crush hurts a big body more), none                                                                                      |
| Answered by         | What stops or escapes it                                | slip, guard, armour, wall, swap, deflect, look-away, cover-ears, hold-breath, wind, cut-free, burn, break-free, distance, jump, dig-in, see-through, ally-frees           |
| Execution           | How it is done                                          | hand signs, tell (loud, plain, quiet), held, channelled, recovery, stages, follows, opens the user, travels                                                               |

## Where tags come from

`tagsOf` in `systems/combat/rules/tags/` reads every axis from what a technique already has
(its art, verbs, reach, name and description), then lays what was written by hand
(`TechniqueDef.tags`, each axis given replacing the reading) over it. A delivery guessed from
the art alone is listed for a person to settle (`prototypes/technique-tags/REVIEW.md`).
Validation (`content/validateTags.ts`) checks every technique reads to a delivery, that
everything that hurts or hinders lands as something, and that `follows` names a real technique.

## Agreed with the owner

- Tags are checked against how things stand at the moment, not base values.
- Reading and speed cover for each other in slipping a move; being set to dodge is the third
  part.
- Coercion Sharingan freezes (no damage). Tsukuyomi drains a will pool; a mind with none left
  passes out. Shadow Possession binds and mirrors, held for chakra. Sand Burial follows the
  Coffin. Almighty Push is a burst with a one-exchange recovery and levels picked when slotted.
  Planetary Devastation is two stages. Rasengan throws back. Gentle Fist blocks access to
  chakra and passes through armour.

## Still to build, in order

1. The engine reads the tags: needs (lifting, eye contact range), point against whole body,
   the narration, the move fixes above, Pain's Paths drawing on Pain's chakra, levels.
2. Breath as the clock: dodging costs breath, and low breath slows you.
3. What you can see: a hidden fighter's casting doesn't show until its effect does.
4. The counter system: moves meeting moves, a counter taking a slot.
5. Travel time, entries, durations.
