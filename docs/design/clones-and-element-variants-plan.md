# Clones by substance, and elements as characters: notes for later

Status: **ideas, agreed in conversation, not started.** Part 1 (clones) is fairly settled; Part 2
(element variants across techniques) is the direction only. Both packs get the work (the fan
pack is where it is play-tested; the original pack must not fall behind).

## What exists today

- `systems/combat/rules/verbs/cloneKinds.ts`: seven kinds (illusion, water, wind, earth,
  lightning, fire, shadow) differing only by numbers: `blow` (0 to 0.35 of the maker's blow, so
  elemental clones are a crowd beside the maker, not fighters), `upkeep`, `sturdy`, `rebuilds`,
  `shock`, `screen`. A solid clone takes its technique's element; solid with no element is a
  shadow clone; not solid is an illusion.
- Weak spots: water has no identity (a worse wind); fire has no catch (free upkeep, hits like
  earth); clones never meet the elemental cycle; the kind has no bearing on rank or cost (cost
  is `chakraWorth`, what the technique does).
- Shadow clones (`rules/shadowClones.ts`, `plan/shadows.ts`) are fighters: a tenth of the tank
  per body, the rest split evenly, the maker's body and kit, a turn and plan each, popping at the
  first hit.
- Grounds (`rules/ground.ts`) already declare elements they feed or starve.
- Cycle (`rules/elements.ts`): fire › wind › lightning › earth › water › fire. Combos: wind
  feeds fire, water carries lightning, earth and water make a mire.
- The original pack's `techniques/elementVariants.ts` (19 techniques) already gives each element
  more than one way to fight per grade, by hand, without a rule behind it.

## Part 1: clones are bodies made of something

**Principle.** A clone is a copy of its maker's body: it never moves faster, hits harder or is
slower than them. What it is **made of** decides everything else:

1. **What it costs**, set by what the ground gives (below).
2. **How it holds up**: whether one hit ends it, and whether it re-forms.
3. **What it can do**: grab or not (all can; only the sturdy ones are worth it).
4. **What happens when it breaks.**
5. **What kills it outright**: an attack of the element that overpowers its own.

**Shared rules for every clone but shadow:**

- **Taijutsu only.** No techniques, no substitution. They strike, guard, dodge and grab.
- **The ground sets the cost.** Where the ground gives the substance, a clone is cheap; where it
  doesn't, dear. Read from the ground's elements, extended as needed (rain, a burning field and
  storms are candidates once fights have weather or a ground that changes).
- **A cap on how many stand at once**, set by chakra control (like puppets' `threadsHeld`).
  Needed because cheap clones with the maker's body could swamp a fight. This is the balance
  lever, not a weaker body.
- An attack of the element that overpowers a clone's element destroys it whatever its toughness.

### Balance: full bodies, traded turn for turn (leaning, not final ?)

Leaning towards: **elemental clones are full bodies with the maker's stats**, fighters with a turn
of their own acting by taijutsu, not a weaker crowd. They are balanced by the exchange of turns
and by toughness, never by a weaker body. Open to change.

- **One clone per technique** for the elemental kinds (no multi-clone versions). Making one costs
  the maker a turn and chakra.
- **A fragile clone costs the defender a turn**: any hit or a landed Counter pops it, however
  light. A turn for a turn is a fair trade, and it plays as a real fight would: three wind clones
  keep a defender dodging, running and countering for a few exchanges while the maker gathers
  chakra or sets something up. Clones **buy time**.
- **The tough kinds are the risk** (earth, then water): cheap on their ground, standing hits,
  rebuilding and grabbing, one could cost the maker one turn and the defender three. So:
  - **Toughness stops only light hits.** An earth clone shrugs off a jab; a real blow breaks it
    (a force threshold like `stopsCloser` in `rules/size.ts`). Water takes a little more than
    the fragile kinds; neither is a wall.
  - **Rebuilding costs chakra** each time, so a maker who leans on it drains their own tank.
- **The cap by chakra control** stays as a backstop, not the main lever.
- **Clones don't tire (?)**: an elemental clone has no breath to run out of. Kept on purpose: a
  maker can send clones to run a defender out of breath while gathering chakra at a distance,
  answered by killing them fast with counters or going past them to the maker. This leans on
  the breath economy (`rules/breath.ts`) and the planned rework of gathering chakra in fights.

### Defending should be easier than attacking (to check ?)

The intuition (from real fighting: a fighter who only defends wins most exchanges): someone who
only defends (running, dodging, blocking, never countering) should hold out against a better
attacker for a while, forcing them to take big swings and expose themselves; breath is what ends
it. The game partly does this (Evade and Brace are strong; breath is the clock; the defence bench
holds that a turtle loses to an equal, slowly). It may clash with two deliberate rules: **each
grade of difference is decisive**, and **pace** (`rules/pace.ts`: a far faster attacker can't be
slipped at all). A jōnin purely defending against an elite jōnin, a grade up, may fall faster than
the intuition expects.

**Measure before changing**: a bench of pure defence against one grade up, checking how many
exchanges it lasts and whether the attacker has to commit (Evade, gather, breath spent) to finish.
Then decide whether anything moves. **Taken further in `docs/design/grade-gaps-plan.md`** (speed as
born, outpacing only from S, a grade meaning the same at every level).

| Kind      | Cost                                                     | Holds up                                              | Grabs     | When it breaks                                                                                | Rank (proposed)              |
| --------- | -------------------------------------------------------- | ----------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- | ---------------------------- |
| Illusion  | free                                                     | nothing to hit                                        | no        | gone; a shot passes through                                                                   | E                            |
| Wind      | cheap everywhere (air)                                   | one hit                                               | pointless | a gust throws the striker back a distance                                                     | D                            |
| Earth     | cheap on any solid ground; dear on water                 | tough, may stand a hit; rebuilds                      | yes       | crumbles                                                                                      | C                            |
| Water     | very cheap on a lake, river or in rain; dear in a desert | takes a little beating; re-forms where there is water | yes       | splashes the striker: **drenched**, so lightning hits them harder (the water-lightning combo) | C                            |
| Fire      | always dear (there is rarely fire about)                 | one hit                                               | pointless | bursts into flame: **burns** those up close (can catch several)                               | C                            |
| Lightning | always dear                                              | one hit                                               | pointless | discharges: **dazes** whoever broke it (takes a turn)                                         | B                            |
| Shadow    | a large share of the tank (below)                        | one hit                                               | yes       | see below                                                                                     | B; the many-bodies version A |

- **Fire is a suicide clone**: sent in to throw hands and burst among foes. Made at range to take
  a shot, it wastes its burst, so it is rarely worth it; that rarity is the explanation for why
  fire clones are seldom seen. Fire's burst harms (several, over time); lightning's takes a turn
  (one target). They must not overlap.
- **Wind** is the everywhere-cheap fragile body. Stealth was considered and left for an
  advanced version.
- Rank follows how hard the substance is to shape into a person and how much of you is in it:
  illusion nothing, elements a shaped substance (lightning hardest, it won't hold a shape),
  shadow a real share of you.

### Shadow clones

- **The only clones that cast techniques**, and the only ones whose experience counts (below).
  That and their cost are their identity.
- **Chakra back.** Dismissing a shadow clone yourself returns the chakra it still holds; one
  destroyed returns half. Dismissing is free as a turn begins (no turn spent, like uncovering a
  veiled eye, `plan/veil.ts`).
- **Never a chakra farm.** Each body recovers chakra every exchange, so what comes back is capped
  at what the clone was given. Otherwise making clones and dismissing them out-gathers Gather.
- **Depends on the chakra rework.** Gathering and pacing chakra in fights may be expanded (fights
  as balancing energy and recovering); settle these numbers after that.
- **Training (out of combat).** Shadow clones bring experience home: a session with clones grows
  more, at a cost in energy and chakra. It touches the growth formula (`game/growth.ts`) and the
  pacing bench; it needs its own plan and must not break the dead last's climb or the genius's
  ceiling (limits still apply).

### Later: advanced clones

- **Explosive clones**: canon's Explosion Release is earth and lightning, so an explosive clone
  is a two-nature clone, not fire's.
- An advanced wind clone that can't be struck (moving air that parts and re-forms), or one that
  is hard to see.
- Mud (earth and water), lava, wood, ice: two-nature or bloodline clones.
- **Sand clones** from the dust system (`CombatantSetup.dust`): spent from the pool, cheap where
  the ground holds the dust.

### What changes in code (outline)

- `CLONE_RULES` loses `blow` as a scale of the body; elemental clones become bodies with the
  maker's stats acting with taijutsu only (today only shadow clones are fighters). This is the
  big engine change: they become fighters like shadow clones (leaning, see Balance), one per
  technique, fragile kinds popping at any hit, tough kinds stopping only light hits, rebuilds
  paid in chakra.
- A cost by ground (a cost multiplier per kind per ground), read wherever clone cost is reckoned.
- Burst effects: drenched (new condition, read by the water-lightning combo), burn, daze, a knock.
- Grab: a pin from a clone, broken when the clone is hit.
- Cycle kills: a clone struck by its overpowering element breaks outright.
- A cap on clones held, by chakra control.
- Shadow chakra return, capped; a dismiss at the start of a turn.
- Content in both packs: an E illusion, D wind, C earth, water and fire, B lightning, B and A
  shadow clone techniques, each named in the pack's own voice.
- Benches: clones must not make an equal fight one-sided; content and defence benches still pass.

## Part 2: each element has a character

Abstracting the clones one level up: each element is a character that shows across many kinds
of technique, not only a damage label.

| Element   | Character                                                             | Where it comes from        |
| --------- | --------------------------------------------------------------------- | -------------------------- |
| Fire      | spreads and burns out: aggression, areas, harm over time, short-lived | rarely about: always dear  |
| Water     | flows and holds: grabs, re-forms, drenches, best on water             | cheap near water           |
| Earth     | endures, slow: walls, armour, guard-breaking, rebuilding              | almost always about: cheap |
| Wind      | quick and cutting: reach, bleeding, screening, pushing back           | always about: cheap        |
| Lightning | fast and punishing: dazes, shocks on contact, pierces armour          | rarely about: always dear  |

**Where the element comes from** may apply to all elemental techniques, not only clones: water
techniques cheaper near water, earth cheap almost anywhere, fire and lightning always at full
price (and stronger for it). This is the same rule as clone cost; decide whether it is general.

**Families × elements.** The common families: thrown shot, wall or substitution, bind, clone,
armour (`shroud`), weapon coating, a burst of movement, trap, area. Fill a cell only where the
element's character gives the family a different job (a fire bind that burns while it holds; an
earth bind that holds harder and can be broken), never a copy with a new element. Not every
family gets every element.

**Why.** More honest techniques, especially E to C, and a reason one fighter carries several of
one family (illusions to mislead, earth to hold a line, fire to throw into a crowd). Each new
technique needs a source (academy rack, library shelves) and goes through `validateTags`; the
finder's kinds (`techniqueKinds`) already sort by family.

## Open questions

- Elemental clones as full fighters with the maker's stats: leaning yes (see Balance above), to
  be confirmed. Performance and the plan screen both matter with more bodies.
- Clones that don't tire: keep, or give them a breath of their own?
- Pure defence against a grade up: does it last long enough? (the defence bench above)
- The clone cap: by chakra control alone, or also by the kind?
- Does ground cost apply to all elemental techniques (Part 2) or only to clones?
- Weather in fights (rain, storms) as a source for water and lightning.
- Shadow-clone training: how much more growth, at what cost.

## Suggested order

1. The shared clone rules and the kinds table (Part 1), with benches, in both packs.
2. Shadow clones' chakra return, after the chakra/gather rework.
3. Shadow-clone training (its own plan).
4. Part 2: settle the element characters, then fill the families grid a family at a time.
5. Advanced clones.
