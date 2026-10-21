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

## Part 4: The Eight Gates, the Sharingan and set-ups

### 4.1 The Eight Gates

The Gates are the test of all of it: the biggest attack in the game, available only after a
turn every foe can see.

- **Opening a gate is a visible turn** ("chakra roars through his body"). Everyone facing him
  gets their next turn to flee, Evade or Brace. That setup turn is the balance, not a cap.
- **The lift is real.** The deep gates put Guy beyond any body (`LADDER_SHARE`: the seventh and
  eighth at least double), fast enough to outpace almost anyone (3.4).
- **Guy fights with taijutsu first.** The Gates are not a readying move: they leave his default
  plan, which opens with his style and chains (the body arts were built so a taijutsu fighter
  closes the gap and wins with taijutsu). He opens a gate only for a reason the fight gives him
  (`worthOpening`, rewritten), and climbs only as far as the reason needs, a gate or two at a
  time, never straight to the sixth or seventh for one move:
  - **His taijutsu isn't enough.** A perceptive fighter can judge it from sizing the foe up; a
    duller one has to try first, a few exchanges of real blows, and see them miss or do little
    (a read of the damage he has dealt against the damage he needs).
  - **He is badly hurt**, and has to end it before it ends him.
  - **A teammate is about to die**: the only reason for the eighth gate.
- **The price escalates, while open and after.** Each band of gates costs more than the last,
  and costs he carries for the rest of the fight once it shuts:

  | Gates                   | While open                                        | Once they shut                                     |
  | ----------------------- | ------------------------------------------------- | -------------------------------------------------- |
  | First to third          | Breath drains faster                              | His most breath is lower for the rest of the fight |
  | Fourth and fifth        | As above, and a little health each exchange       | Speed and strength fall a little                   |
  | Sixth (Morning Peacock) | Breath drains hard, and real health each exchange | Clearly slower and weaker for the fight            |
  | Seventh                 | A health drain that leaves about a round to win   | He collapses: out of the fight, or barely standing |
  | Eighth                  | Night Guy, and the burn kills him                 |                                                    |

  By the seventh gate he is fighting to win within a round; if he hasn't, he is cooked. Opening
  the deep gates to throw one finisher costs the fight unless it wins it, so it is a last resort
  or a judgement that the foe can't be hurt any other way.

- **His finishers**, each a kind of attack of its own:
  - **Morning Peacock** (sixth gate): close range, and only against a target who is held or
    dazed (a new `needsTarget` on the technique: open or held). A storm of blows. Guy can still
    fight afterwards, but the sixth gate's toll (above) stays with him: winded, slower, weaker.
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

### 4.2 The Sharingan, revealed

Kakashi keeps his Sharingan covered, and in canon he has good reason: it drains him. Today it is a
passive perk (`foresight`: slips, counters and sees techniques more often, always on). It becomes a
choice:

- **Revealing it is a turn** (a technique, like opening a gate), and it costs chakra every
  exchange it stays uncovered.
- **While revealed**, the fighter reads everything: Evade's read is perfect (3.3, all of it on the
  attack that matters), their slip's ceiling rises well above an ordinary evader's, counters and
  copying come easier, and a genjutsu cast at them is seen through far more often.
- **Pace still holds** (3.4): against Guy deep in the Gates his eyes see it coming, but his body
  can't keep up past a point. That is the canon matchup: Kakashi has to make sure Guy never gets
  the chance.
- Covering it again (to save chakra) is also a choice; a sharp mind reveals it when the fight
  turns dangerous, not before.

### 4.3 Stealth and set-ups

Hiding exists (smoke, mist, concealment, Search to find someone), but nobody fights with it as a
plan. A fighter like Kakashi against someone like Guy would use his range of genjutsu and ninjutsu
to manipulate the field: stop Guy tracking him at all, pin him with an illusion, and put him down in
one blow with a Chidori or a Rasengan. The engine learns three things:

- **Controlling the field.** Mist, a cloaking genjutsu or a substitution drops a foe's tracking;
  finding them again is perception (and sensing) against the hider's concealment, so a fighter
  with poor eyes, like Guy, may not find them at all.
- **Pinning from hiding.** A genjutsu or a binding cast from concealment is far harder to notice
  and to break (the caster isn't where the target is looking).
- **The one-hit finisher.** A killing technique (Chidori, Rasengan) on a target who is held or
  can't see the attacker can't be evaded and hits to kill (`lethal` on the finisher, 3.1): the
  pay-off the set-up was for.
- **Planning it.** A mind that reads the fight sequences it (hide, pin, finish) instead of trading
  blows, and a foe who knows it is outclassed in taijutsu reaches for it first.

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
5. **Gather and chakra.** The Gather action; a review of the top techniques' costs; shadow
   clones as their canon price and power (a share of chakra for whole fighters who fall to one
   hit).
6. **The Gates.** Guy's judgement (taijutsu first; a gate only for a reason the fight gives,
   and only as deep as it needs); the escalating price, while open and after (4.1); the lift; the
   collapse; `needsTarget`, `lethal`, `sRankDefence`; Guy's four finishers rewritten; survival
   judgement for foes.
7. **The Sharingan revealed** (4.2): a turn to reveal, chakra upkeep, a perfect read and a raised
   slip ceiling while it is uncovered.
8. **Stealth and set-ups** (4.3): field control that stops tracking, pins from hiding, one-hit
   finishers on the held or the blind, and the AI that sequences them.
9. **Shadow clones** (slice 5's second half): their canon price and power.
10. **Durability by build**: `SKILL_DEFENCE_SHARE` lowered so stamina tells a glass cannon from a
    tank, retuned against the benches now that Evade, Brace and reading are in.
11. **The fight table and the docs** (`CLAUDE.md` decision 16, `hittability-plan.md`): Guy
    against Kakashi should be a rivalry again, decided by the Sharingan, set-ups and the Gates'
    price, not by who runs dry first.

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
- **Durability by build is still open.** Toughness is still mostly skill
  (`SKILL_DEFENCE_SHARE` 0.8), so a genjutsu master is as hard to hurt as a wall of a clan
  fighter of the same grade. Lowering the share is what lets stamina tell a glass cannon from a
  tank, but without Evade a glass cannon would have no way to survive, and equals would end each
  other in a hit. With Evade, Brace and reading in, it is the next retune, against the same bench
  targets.
- **Slice 3, Evade and Brace (done).** Two actions (`rules/commitment.ts`, `plan/commitment.ts`),
  slotted like any other and paid in breath (Evade 8, Brace 5), held until the fighter's next
  turn. Evade adds to the avoid roll's stance (a technique +1, a blow +1.2, on top of an open
  fighter's or a ready Dodge's) and lifts its ceiling from 0.75 to 0.9; Brace lets half of a
  physical hit through any guard, meets a flurry's every blow, and halves how often a pin, daze
  or knock takes hold (a break goes through it). Against chakra, an element or the mind, Brace
  does nothing: that is what Evade or a swap is for (the open question settled that way). A foe
  who reads the fight and is outmatched takes cover about a third of its turns, Evade or Brace as
  its body suits (`plan/shelter.ts`). On the defence bench a fighter who only Evades loses every
  bout to an equal in 15 exchanges, one who only Braces in 19, against 9 for a straight trade; no
  bout stalls. The fight table moves only where someone is outclassed and reads the fight: Kakashi
  takes cover against Guy some turns (Guy 77% → 67%, 2.0 → 2.2 rounds), and the lopsided
  cross-rank bouts last a little longer. Between equals nothing changes until slice 4 teaches
  fighters when a blow is worth evading.
- **Slice 4, reading and pace (done).** Every attack now carries its threat (the share of the
  target's health it would take, mid-roll) and, for a body's attack, its speed. Evade's lift
  meets an attack by the evader's read (`evadeFocus` in `rules/commitment.ts`). Blind, 0.6 of it
  meets everything. A clear read (the read's multiplier at 1.25 or more) puts all of it on an
  attack worth a quarter of their health or more, and none on the rest. Between equals, with a
  read of one, a dangerous attack meets 0.8 of it and an ordinary one 0.3. Familiarity sharpens
  the read, as it already did. Pace (`rules/pace.ts`): a body's attack from someone 1.5 times
  the defender's avoid rating starts to outpace them, and from twice it nothing slips it, Evade
  or a ready Dodge alike; a swap still works. Against an equal's plain blows (a fifth of their
  health each) a reader lets them meet the ready defence, so an evade-only turtle lasts 12
  exchanges where it lasted 15. The fight table moves a little where one side is much quicker:
  Guy beats Hiruzen 90% of the time (83% before) in shorter bouts, his speed now partly
  outpacing an old body's slip.
- **Slice 5, part one: Gather and chakra costs (done).** A technique costs at least its rank's
  floor before its user's control (`RANK_COST_FLOOR` in `rules/chakra.ts`: C 10, B 18, A 30,
  S 45; E and D keep their written costs). Surveyed against the cast before the floor, the best
  techniques took far too little: Kisame's 7% of his tank, Zabuza's 8%, Kurenai's 12%, Gaara's
  S-rank 13%. After it, Asuma's best takes 26%, Guy's finishers 28%, Kakashi's Great Waterfall
  40% of his small tank; Kisame's deep reserves still make his cheap (8%). Gather
  (`rules/gather.ts`, `plan/gather.ts`) is an action that draws back a fifth of the fighter's
  chakra (at least 10) and 30% of their breath and leaves them open until their next turn: their
  slip times 0.4, and only a Guard of the ready defences. A foe with attacks paid in chakra and
  none it can still pay for (a body move paid in breath counts) gathers half the time, never up
  close if it reads the fight (`plan/resting.ts`). The fight table: fights at the top run longer
  (Kakashi against Asuma 2.0 → 2.3 rounds, against Zabuza 1.6 → 1.9), and Guy now beats Kakashi
  93% of the time (67% before): Kakashi's costly ninjutsu drains his small tank while Guy fights
  on breath. That is too lopsided for rivals and a target for the durability retune (or for
  Kakashi's reserves).
- **Slice 5, part two: shadow clones (done).** A technique that only makes solid clones of no
  element (Shadow Clone, Multiple Shadow Clone, an earth or lightning shadow clone keeps its
  element and stays a decoy) now splits its maker's chakra evenly with the clones it makes, and
  each clone is a fighter (`rules/shadowClones.ts`, `plan/shadows.ts`): the maker's body and kit
  (all but the technique that made it), its own turn, a plan made as the exchange ends, popping
  at the first hit that lands, gone with its maker. One fighting clone for every five power, at
  most four standing; any more the technique makes are a crowd of decoys beside the maker, with
  no upkeep (the split is the price). An attack aimed at the maker may go into a clone instead:
  more clones make it likelier, the attacker's perception against the maker's ninjutsu shifts
  it, and insight sees through most of it. Its leftover chakra is lost when a clone pops. A
  technique that wounds as it makes clones (Clone Body Blow, Shadow Clone Sword Dance) keeps
  them as decoys. The fight table: Hiruzen, a kage with deep reserves, now fields his clones
  (canon has four of him against Orochimaru), and Guy beats him 40% of the time (90% before),
  Kakashi lasting a round where he lasted two; Naruto lasts longer against Sasuke (3.3 → 3.8
  rounds) and Izumo (2.7 → 3.1), though the split leaves him short of chakra, which the
  chakra-totals review may answer.
- **Chakra totals (done).** A full tank grew by adding (30, plus 3.5 a point of reserves, plus
  control), so the deepest well in the cast held twice a jōnin's and a cost or a clone split
  swung everyone alike. It now doubles every 10 points of reserves (`maxChakra` in
  `systems/vitals`: 40 × 2^(reserves ÷ 10), plus control), so genin barely move (Sakura 66,
  Sasuke 97) and the deep wells pull away: Kakashi 141, Guy 176, Naruto 246, Hiruzen 779,
  Gaara 1,004, Kisame 1,496, and a tailed beast at reserves 60 about 2,600. Foes', companions'
  and puppets' authored chakra moved onto the same curve from the reserves it stood for;
  summons were set by hand as the chakra beasts they are (Gamabunta 650, a great snake 230,
  the Kiln Mother 370). Regen, Gather and the clone split already scale with the tank, and the
  rank floors stay, so a deep well pays for big techniques many times over. Saves keep their
  stats, so a save's chakra follows the curve. The fight table: Guy beats Kakashi 63% of the
  time (93% before), and Guy beats Hiruzen 30% (40%).
- **Guy never opens a deep gate** in the table's bouts (only the first, the Gate of Life), so
  his finishers never come into it; that is slice 6.

## Open questions

- How large is a committed Evade against a plain blow, and against a technique? (Set by the
  bench in slice 3: a turtle should lose to an equal, but by rounds, not by a coin flip.)
- Should Brace reduce damage from techniques that aren't physical (chakra, the elements)? Leaning
  no: those are what a swap or an evasion is for.
- Does Gather also give back breath, or only chakra? Leaning both, at different rates.
