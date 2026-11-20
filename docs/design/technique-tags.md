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

## What the engine reads

- **Needs** (`rules/tags/fits.ts`, `plan/fitting.ts`): a target that doesn't fit is never aimed
  at, and one a technique reaches anyway is told why it did nothing (too big to lift, no mind,
  eyes not met, no chakra points, nothing held to close on).
- **Catches** (`rules/tags/catches.ts`): a point strike does less to a big body, a whole-body
  move more, on top of the toughness size already gives.
- **Recovery** (`plan/recovery.ts`): Almighty Push rests an exchange after use.
- **Follows**: Sand Burial closes only on someone its user holds in the Coffin.
- **Narration**: a hold lands and is shaken off in the words of how it reached (a shadow, trunks,
  threads, a grip, an illusion), flames are beaten out and poison fought off.
- **Pooled bodies** (`plan/pooled.ts`): Pain's Paths hold and spend Pain's chakra.
- **Moves fixed**: Coercion Sharingan freezes up close with no harm, Tsukuyomi is cast up close,
  Shadow Possession is a channelled bind, the Rasengan throws back.

## Still to build, in order

Done: levels picked when slotted (Almighty Push), the will pool (Tsukuyomi), two-stage moves
(Planetary Devastation), defence lines keyed by how an attack came, and the counter system.

1. Breath as the clock: dodging costs breath, and low breath slows you.
2. Entries and durations.

**What you can see (done):** an attack from someone the defender can't see (hidden, and no one of
theirs watching) is read far worse, in the avoid roll and a counter's (`rules/sight.ts`); and a
hidden caster's casting is told without them or the technique ("Chakra gathers somewhere out of
sight"). Their telegraph was already withheld. **Travel time (done):** an attack that travels
(thrown, breathed, along or out of the ground, down from above) is read better the further it
comes: a Sand Coffin from far gives time to see the sand rise.

### The counter system (agreed with the owner)

- A counter is an **action you slot**, never a free defence. It spends the turn waiting and holds
  until your next turn, answering the first attack it waits for. Nothing it waits for comes: the
  turn is gone, and nothing else.
- It **waits for one kind of attack**, read from the tags: a blow or grab up close (bare
  hands), a blade (a blade in hand), thrown steel (any distance), eyes (look away from an
  illusion through eye contact). Anyone with the means may try; skill sets how well.
- **Whether it lands is a read**: eyes and wits against the attacker's speed and the skill
  behind it, more decisive than a dodge's read. An attack that commits its user (a charge, a
  Chidori) is read more easily and answered harder.
- **Three outcomes**: clean (stopped and answered), late (turned aside, nothing back), wrong
  (it lands, and the fighter is open, every ready defence down, until their next turn).
- **Foes play it honestly**: only from what their read of your cues is sure of, only against
  something worth a turn (a committed attack, a hold, a daze, a quarter of their health), and
  not again straight after a counter that waited for nothing.
