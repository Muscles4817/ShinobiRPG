# Defence first: damage without ceilings

Working document for Plan & Watch. Part 1 is how damage and defence work today and why that
forced a cap on every hit. Part 2 is the principle we are moving to. Part 3 is the rules, Part 4
the Eight Gates as their test, Part 5 what the benches will hold, Part 6 the build order.
Nothing here is binding until each slice lands.

---

## Part 1: Today

- **No hit takes more than half the target's health** (`MAX_HIT_SHARE` in `rules/damage.ts`,
  `cappedHit`; raised a little by size, `hitCapShare`). Damage is the gap between attacker
  power and defender defence, steep (`GAP_EXPONENT` 1.8) and counted only to four times either
  way (`MAX_RATIO`), and big techniques are weighed down by rank (`techniqueWeight`).
- **Defence is passive and free.** Everyone slips some (`AVOID_TOP`, `STANCE.open`), each
  distance keeps one ready defence (Guard, Dodge, Counter or a swap; `plan/readiness.ts`) that
  takes no slot and costs nothing, and the slip never passes `AVOID_MAX` (0.75) however sharp
  the defender or slow the attack. Nothing a fighter gives up buys them more defence.
- **So damage is the only lever.** With defence flat, the only way to stop one technique
  ending a fight between equals was to cap it. The cap then flattened everything above it:
  Night Guy (the eighth gate's kick, power 40 with strength and speed lifted 2.6 times) lands
  as half of Kakashi's health, the same as any other big hit; the Gates had to be cheap (5 to
  12 health an exchange) to stay balanced against a hit that can't kill.
- **Equal strength means equal durability.** A glass cannon (Itachi) and a wall (Chōza) of
  the same overall strength take the same share from the same blow, because the cap, not their
  bodies, decides how much a big hit takes.
- **Nobody fears anything.** No rule makes a fighter change what they do because the foe in
  front of them can kill them in one blow.

## Part 2: The principle

**Defending is easier than attacking, and costs something.** A fighter who commits to not
being hit is much harder to hit than one meeting you halfway; a better fighter still wins in the
end, by forcing a mistake: reading the defence, feinting it, trapping, dazing or pinning, busting
the guard, changing up, or simply being too fast for it. Damage then needs no ceiling: what
stands between a fighter and a killing blow is what they chose to do about it, and their own
body.

Three consequences:

- **No ceilings.** A hit takes what the gap says. Durability is the person's: toughness for
  those built to take it, evasion for those built never to be touched.
- **Defence is a choice with a price.** Committing to it spends your turn and your breath.
- **Wits decide how well it is spent.** Reading what is coming is what lets a defender save
  their best evasion for the blow that matters.

## Part 3: The rules

### 3.1 Damage without a cap

- `MAX_HIT_SHARE` and `cappedHit` go. `hitCapShare` (size) goes with them: size keeps its
  health and toughness and its weight, not a cap.
- Damage stays the power-to-defence gap. `MAX_RATIO` stays (it bounds a stat line's reach, not a
  hit's), but its limit is read again once the cap is gone.
- `techniqueWeight` (power against the typical power of its rank) stays: it keeps an ordinary
  technique of each rank landing like one, so a big technique is big because it is a standout,
  not because rank inflates it.
- **Durability by build, not by rank.** Toughness is stamina, blended with skill
  (`SKILL_DEFENCE_SHARE`). Glass cannons keep low stamina and live by evasion; a review of the
  cast's stamina against how they are meant to survive is part of slice 2.
- **Lethal is a word, not a number.** A technique that should end a fight when it lands
  (`lethal` on the damage effect) skips the guard blend: only evasion, a swap, or an S-rank
  defence (3.6) stops it.

### 3.2 Defence is a commitment

Two new actions take a slot like any attack (`plan/cards.ts`), cost breath (`rules/breath.ts`),
and last the exchange they are played in:

- **Evade.** The fighter gives the exchange to staying out of reach. Every attack aimed at them
  that exchange rolls avoidance with a large stance (well above the ready Dodge's), scaled by
  their speed and perception against each attack's arrival.
- **Brace.** The fighter gives the exchange to taking it. Physical hits meet a much stronger
  guard (taijutsu and strength, and toughness), and a pin or daze is far harder to make stick.

The free ready defence stays: it is the instinct anyone has (a Guard, a Dodge, a Counter or a
swap kept ready), not a commitment. Evade and Brace stack on top of it.

- **Breath is the clock.** Evade and Brace cost breath each time; a fighter who turtles all
  fight runs dry and is left with the ready defence alone. Turtling buys time; it never wins.
- **A step or an attack ends it.** You can't Evade and swing in the same exchange.
- `AVOID_MAX` rises for a committed evasion (an evader may get clear of most things), and falls
  to the attacker's pace (3.4).

### 3.3 Reading what is coming

A committed evasion is only as good as the defender's read:

- **A good read** (perception and intellect against the attacker's tell, as the read in
  `rules/avoidance.ts` and the telegraphed `intent` already work) lets the defender **save** the
  evasion for the attack that matters: ordinary blows meet the ready defence, and the big one
  (the telegraphed finisher, the technique worth most against them) meets the full Evade.
- **A poor read** spreads the evasion thin: every attack meets part of it, the big one included.
- **Familiarity** still applies: a technique the defender has seen over and over is read more
  easily.

### 3.4 Breaking a turtle

What the attacker brings against committed defence, most of it already in the engine:

- **Feints and illusions** that draw the evasion to the wrong attack (genjutsu, a feint).
- **Area**: wide is hard to get clear of, vast impossible (`rules/verbs/area.ts`); against a
  committed evasion, area is the honest answer.
- **Holds**: a daze leaves them open (no evasion at all), a pin makes them hard to slip.
- **Guard-breaks** (`break`) against a Brace.
- **Traps** set where they must step.
- **Changing up**, so the read fails.
- **Pace.** An attacker far faster than the defender's avoid rating **outpaces** them: past a
  gap (to be set, about twice), only a swap, a teleport or an S-rank defence escapes. Evasion
  alone cannot. This is what the deep Gates are.

### 3.5 Chakra's rhythm

- **Realistic costs.** The big techniques cost what they should (a review of every pack's top
  techniques against reserves: a jōnin's best should take a real share of a full tank).
- **Gather.** A new action that spends the turn drawing chakra and breath back, much more than
  the exchange's own trickle (`gathered`, `breathed`). It leaves the gatherer open: no evasion,
  no brace, a weak ready defence. A fighter who wants their finisher again spends a round to get
  it, and a sharp foe punishes the round.

### 3.6 S-rank defences

A few abilities are the only answer to a killing blow: an instant teleport (Flying Thunder
God), instant healing, an ultimate shield (one that has been shown to lose). They are tagged
(`sRankDefence` on the technique or perk) so the rule lives in data:

- Only they stand any chance against an attack that can't be evaded (Night Guy, an
  outpacing attacker), and even then not a sure one.
- They cost what an S-rank technique costs.

### 3.7 Survival, as judgement

Fighters change what they do when they face a killer (`plan/judgement.ts`, `plan/roles.ts`):

- A foe who **reads the fight** sees the threat (a deep gate opened, a lethal technique
  telegraphed, a fighter far beyond them) and switches to survival: Evade (or a swap) everywhere,
  distance, and holds or areas to buy time until the threat burns out.
- A **dull** foe keeps trading blows, and dies.
- The player's teammates switch when ordered or by stance; the player chooses, and the plan
  screen says why ("Guy has the seventh gate open: one blow from him could end you").

## Part 4: The Eight Gates

The Gates are the test of all of it: the biggest attack in the game, available only after a
turn every foe can see.

- **Opening a gate is a visible turn** ("chakra roars through his body"). Everyone facing him
  gets their next turn to flee, Evade or Brace. That setup turn is the balance, not a cap.
- **The lift is real.** The deep gates put Guy beyond any body (`LADDER_SHARE`: the seventh and
  eighth at least double), fast enough to outpace almost anyone (3.4).
- **The burn clock.** Each open gate drains health every exchange as a share of his maximum:
  about a tenth at the fifth, a sixth to a fifth at the seventh, a quarter at the eighth. When
  the gates shut (or the price takes him to `GIVE_OUT_SHARE`) he collapses: out of the fight.
  The hospital days after stay.
- **His finishers**, each a kind of attack of its own:
  - **Morning Peacock** (sixth gate): close range, and only against a target who is held or
    dazed (a new `needsTarget` on the technique: open or held). A storm of blows. Guy is still
    serviceable afterwards (a light toll).
  - **Afternoon Tiger** (seventh gate; today's Daytime Tiger): ranged, a wide area, crushing,
    hard to evade (area against evasion). It leaves him **drained**: winded and dazed for some
    exchanges, a heavy health and breath toll.
  - **Evening Elephant** (seventh gate): five blows at a pace almost nobody can evade (it
    outpaces by its own speed), each hitting to kill. A swap or a teleport is the answer; Brace
    alone is not.
  - **Night Guy** (eighth gate): `lethal`, and it can't be evaded. It kills anyone short of an
    S-rank defence, and even then is likely to. Opening the eighth gate kills Guy: the burn takes
    him whatever happens, and he opens it only in the last ditch (to save a teammate about to
    die, `worthOpening`).
- **Rock Lee** opens the Gates the same way, a few steps shallower, with the same price.

## Part 5: What the benches will hold

The lethality targets change shape, not intent:

- **Equals of a rank** still fight two to three rounds and win about half, now through attrition
  and evasion, not a cap.
- **A turtle loses eventually**: a fighter who only Evades against an equal who attacks well
  loses most fights, in more rounds than trading would take.
- **A glass cannon dies to one clean hit** from a heavy hitter of their rank, and avoids most of
  them when it commits to evading.
- **One grade up wins most fights; two grades up wins nearly all**, and quickly.
- **The Gates**: Guy with the seventh gate open beats an equal jōnin who trades with him nearly
  always; one who turtles and stalls survives to see him collapse a real share of the time. Night
  Guy kills its target in every fight short of an S-rank defence.
- **No stalemates**: breath runs out, so nobody turtles forever.
- The content bench (fresh characters against their year and D-rank foes) and the pacing bench
  keep their targets.

The fight table (`research/fight-table-*.md`) is rerun after each slice.

## Part 6: Build order

Each slice lands green (`npm run check`), with its benches retuned by named constants.

1. **This plan.**
2. **No cap.** Remove `MAX_HIT_SHARE`, `cappedHit` and `hitCapShare`; read `MAX_RATIO` again;
   review the cast's stamina against how each is meant to survive; retune the benches.
3. **Evade and Brace.** The two committed actions, their breath cost, their stance in the avoid
   roll and the guard; the plan screen's cards and wording; the default plan and judgement
   using them against a stronger foe.
4. **Reading and pace.** Saving evasion for the dangerous attack by the read; outpacing.
5. **Gather and chakra.** The Gather action; a review of the top techniques' costs.
6. **The Gates.** The burn clock, the collapse, the lift; `needsTarget`, `lethal`,
   `sRankDefence`; Guy's four finishers rewritten; survival judgement for foes.
7. **The fight table and the docs** (`CLAUDE.md` decision 16, `hittability-plan.md`).

## Progress

- **Slice 2, no cap (done).** `MAX_HIT_SHARE`, `cappedHit` and `hitCapShare` are gone; a hit
  takes what the gap says, and its chip shows what it took (`taken` in `plan/wound.ts`) while
  its words follow the blow's force. Between the cast the cap rarely bit: the fight table is
  unchanged to within a few points, and over 15 bouts each about one hit in twenty went past
  half (Chōza on Shikaku up to 72, Guy on Kakashi up to 70, Kakashi on Asuma up to 55). It bit
  where the plan says it should stop biting: a far stronger fighter on a weaker one (a jōnin's
  kick on a bandit thug now ends him) and small bodies (a hornet swarm). `MAX_RATIO` stays at
  four: it is what keeps a blow between grades from running away, and nothing in the table
  leans on it.
- **Durability by build is waiting on slice 3.** Toughness is still mostly skill
  (`SKILL_DEFENCE_SHARE` 0.8), so a genjutsu master is as hard to hurt as a wall of a clan
  fighter of the same grade. Lowering the share is what lets stamina tell a glass cannon from a
  tank, but without Evade a glass cannon would have no way to survive, and equals would end each
  other in a hit. It moves with Evade and Brace, against the same bench targets.
- **Guy never opens a deep gate** in the table's bouts (only the first, the Gate of Life), so
  his finishers never come into it; that is slice 6.

## Open questions

- How large is a committed Evade against a plain blow, and against a technique? (Set by the
  bench in slice 3: a turtle should lose to an equal, but by rounds, not by a coin flip.)
- Should Brace reduce damage from techniques that aren't physical (chakra, the elements)? Leaning
  no: those are what a swap or an evasion is for.
- Does Gather also give back breath, or only chakra? Leaning both, at different rates.
