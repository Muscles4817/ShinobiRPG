# Character creation overhaul: development, talent and limits

Working document. Part 1 says what was wrong, Part 2 the model, Part 3 the creation flow,
Part 4 the build plan. Part 5 records what was decided, and Part 6 how the build came out
(where the numbers moved from this proposal, Part 6 is right).

---

## Part 1: What is wrong today

- **Everyone starts at 5.** Every stat starts at `BASE_STAT` (5, grade E). Academy grades add
  only to the five arts (A +3, B +1.5, C 0, D −1), so a genius starts with two arts at 8 (just D)
  and every body and mind stat at 5. Clan bonuses are ±1–2. In practice almost every new
  character is all Es apart from one or two arts.
- **A genius barely starts ahead.** Same seed and the same focused routine:

  | Standing  | Best arts at start | Body and mind | Days to C in their specialty |
  | --------- | ------------------ | ------------- | ---------------------------- |
  | Dead last | 5 / 5              | 5             | 109                          |
  | Middle    | 8 / 6.5            | 5             | 61                           |
  | Genius    | 8 / 8              | 5             | 41                           |

  A genius only pulls ahead over time, through growth rate. Nobody starts out like Neji or
  Sasuke: fast, strong, fit, and able to trouble a chūnin straight away.

- **Talent is only a speed.** Aptitude multiplies growth and nothing else. Train long enough and
  anyone can reach anything, so speed is as trainable as stamina. There is no frame, no natural
  limit, and no strength-for-speed trade-off.
- **Two things are mixed up.** How trained you are now (_development_) and how far and fast you
  can go (_talent_) both come from one academy grade. That rules out the early bloomer (strong
  now, low ceiling), the late bloomer (weak now, high ceiling) and the natural athlete who is dumb
  as rocks.

## Part 2: The model

### 2.1 Two axes per stat

Each stat has:

- **Start**: where you stand at graduation, from early training. Set at creation.
- **Talent**: the existing hidden `aptitude` (how fast you grow) plus a new **limit** (the value
  your body or gift tops out at without a breakthrough).

### 2.2 Stats have kinds

Some stats are given at birth and some are earned. Each stat gets a **kind**:

| Kind    | Stats                                                           | Rule                                                                                                                                                                      |
| ------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Born    | speed, reserves                                                 | The limit is set mostly at birth and is low for most people. Training reaches it at the usual pace; past it, growth falls to a trickle. Reserves also creep up with rank. |
| Frame   | strength                                                        | The limit comes from your build. Strength above your build's comfortable level costs speed (bulk, 2.4).                                                                   |
| Trained | stamina, chakra control, intellect, perception, willpower, arts | Generous limits. Talent mostly sets the rate. Stamina is trainable by nearly everyone, but heavier builds pay more energy for it.                                         |

Mechanically, the limit is one more factor in `growCharacter`. It is 1 well below the limit,
eases down over the last stretch (like `EASE_SHARE`), and falls to `PAST_LIMIT_TRICKLE` (about
0.05) beyond it. Teachers help you reach your limit faster, not pass it. Only a **breakthrough**
raises a limit: a `limitBonus` on a `ModifierSpec`, granted later by the Gates, a bloodline
awakening or a sensei's trial (milestone 3). Until then the hook exists and nothing uses it.

How a limit is set for each kind (values are on the existing E–S scale; D starts at 8, C at
13, B at 20, A at 28, S at 40):

| Talent read | Born / frame limit | Trained limit |
| ----------- | ------------------ | ------------- |
| None        | 0 (never takes)    | 0             |
| Poor        | ~11 (D)            | ~22 (low B)   |
| Ordinary    | ~17 (C)            | ~32 (A)       |
| Gifted      | ~26 (B)            | ~44 (S)       |
| Prodigy     | ~36 (A)            | no limit      |

So most people top out at chūnin speed. A gifted runner reaches jōnin speed, and only a born
prodigy (or a breakthrough) reaches Gai.

### 2.3 Build (frame)

A new creation choice. It sets the frame limits and gives a small head start:

| Build    | Strength limit | Speed limit | Stamina                    | Start                   |
| -------- | -------------- | ----------- | -------------------------- | ----------------------- |
| Slight   | −1 grade       | +1 grade    | normal                     | speed +1                |
| Wiry     | −½             | +½          | cheaper to train           | speed +1, stamina +1    |
| Balanced | 0              | 0           | normal                     | none                    |
| Sturdy   | +½             | −½          | normal                     | strength +1, stamina +1 |
| Heavy    | +1 grade       | −1 grade    | costs more energy and food | strength +2             |

Clans may favour a build (the Akimichi run heavy) without forcing it.

### 2.4 Bulk

Each build has a comfortable strength. Every point of strength above it lowers your effective
speed limit by `BULK_SPEED_COST` (about 0.5). A heavy fighter who keeps getting stronger
slows down; a slight one who wants to hit hard pays in speed. This is a rule in
`systems/stats`, read by growth (the limit moves) and shown on the stat sheet ("Your frame
is carrying more than it's built for").

### 2.5 Upbringing

A second new choice. It decides how much early training you had (development), not your
talent:

| Upbringing         | Early training                       | Other                                                |
| ------------------ | ------------------------------------ | ---------------------------------------------------- |
| Civilian family    | none                                 | a hard-work floor in one stat of your choice         |
| Shinobi family     | +2 development points                | a parent who will teach once                         |
| Clan (branch line) | +3, at least half in the clan's arts | clan lodging; the main house expects things          |
| Clan (main house)  | +4, at least half in the clan's arts | clan lodging; the clan's eye is on you (later story) |
| Orphan             | +2, body stats only                  | a hard-work floor in body stats                      |

This is the "clan privilege means earlier training" the clans need. **A clan child never starts
all Es**, because they always have the early training in their clan's arts.

### 2.6 Standing becomes two budgets

Class standing stays the difficulty, but now it gives two things to spend: **development
points** (your starting stats) and **gifts** (your talent).

| Standing   | Development | Highest starting grade | Gifts                         | Hidden roll       |
| ---------- | ----------- | ---------------------- | ----------------------------- | ----------------- |
| Dead last  | 4           | D                      | 0, and a hard-work floor      | low band (as now) |
| Below avg. | 7           | D                      | 1                             | slightly low      |
| Middle     | 10          | D                      | 1                             | ordinary          |
| Top        | 14          | C in one stat          | 2                             | slightly high     |
| Genius     | 20          | C in up to three       | 2, which may be prodigy gifts | high (as now)     |

**Development cost** (raising a stat from 5): 1 point per +2 up to 9, 2 points per +2 up to 13,
3 points per +2 beyond. A D (9) costs 2, a solid D (11) costs 4, a C (13) costs 6.

- A middle student with 10 points: two stats at D (11) and one at 9.
- A genius with 20: three stats at C (13) and one at D (9). Sasuke-shaped.

**Gifts** are talent you choose and know from day one, so they're never hidden:

- A **gift** sets a stat's rate to at least gifted (1.3) and its limit to gifted.
- A **prodigy gift** (genius only, costs both gifts) sets rate 1.5+ and the prodigy limit.
- A **flaw** gives back a gift (or 2 development points): poor in a stat, rate ≤ 0.7 and the poor
  limit. Kakashi's reserves, a frail body, dull wits. One flaw at most, two for a genius.

**Trade between budgets**: an early bloomer swaps a gift for 3 development points. A late
bloomer swaps 3 development points for a gift. Both are allowed once.

Every stat you didn't gift or flaw is still rolled hidden, as now (the standing shifts the
roll), and found out by training. Picking a gift is knowing your talent; the rest stays a
mystery.

### 2.7 What the targets look like

Fighting power (`fightingPower`, half body-and-mind average, half best art) at the start:

| Character                                           | Today | Proposed   |
| --------------------------------------------------- | ----- | ---------- |
| Civilian dead last                                  | ~5    | ~7 (one D) |
| Average graduate                                    | ~6.5  | ~8.5       |
| Clan heir, middle                                   | ~7    | ~9.5       |
| Genius clan heir (speed, taijutsu, perception at C) | ~6.5  | ~11        |
| Typical chūnin (`statLine('D', two Cs)`)            | ~14   | ~14        |

The genius is now about half a grade under a chūnin: a hard fight they usually lose, but a
real one. That's the "gives a chūnin a run for their money" target. If it should be closer,
the lever is the genius's development budget, not the formulas.

### 2.8 Academy grades

Grades stop being a separate input. The report card becomes a **reading** of your starting
arts (an art at 11 reads B, at 13 reads A), so the scene is unchanged but the letters come from
your point-buy. Growth pace by grade moves into gifts. This removes the double count that makes
an A both a head start and a growth rate.

## Part 3: The creation flow

The scene stays the break-in, reading your own file. The new steps fit into it:

1. **Standing**: as now, or fate.
2. **Clan and upbringing**: one step, since a clan child's upbringing is the clan.
3. **Build**: five cards with what each does to strength, speed and stamina.
4. **The file**, as point-buy or a quick pick:
   - _Quick picks_ (presets that fill the budgets for you): Clan heir, Natural athlete (big
     physicals, dull), Bookworm, Early bloomer, Late bloomer, Prodigy (only for a genius),
     All-rounder.
   - _Custom_: a stat sheet with − and + per stat, the point and gift counters, and a live
     reading of each stat's grade and fighting grade, with gifts and flaws as stamps on the stats.
5. **Talent, traits, nature, nindo**: as now. The talent list (`TALENTS`) loses the entries
   that gifts and flaws now cover (Huge chakra reserves, Sensor and similar become gifts) and
   keeps the special ones (Can't mould chakra, Iron stomach).
6. **Break-in and caught**: as now.

## Part 4: Build plan

Each phase ships green and keeps saves loading.

1. **Limits and stat kinds** (`systems/stats`): `STAT_KINDS`, `limit` per stat on the character,
   the limit factor in growth, bulk, `limitBonus` on `ModifierSpec`. Save migration: existing
   characters get limits derived from their aptitude and a balanced build, with no stat
   changes. Pacing and content benches re-run.
2. **Build and upbringing**: content types (`BuildDef`, `UpbringingDef`) in both packs,
   validation, creation steps, migration defaults.
3. **Development and gifts**: the new standing table, point-buy, gifts and flaws, quick picks,
   the report card as a reading, the trimmed talent list. `draftProblems` validates the
   budgets.
4. **The world keeps up**: generated genin and classmates use the same builder with random
   picks (most are middle, a few are top, one in a year is a genius), and authored rookies are
   checked against the targets. Retune the content bench (D-rank foes, classmates) and the
   standing pacing targets. The lethality bench (equals win about half) should hold
   unchanged, since damage reads the gap.
5. **Breakthroughs** (milestone 3): the first things that raise a limit.

## Part 5: Decisions

1. **Limits are soft.** Past a limit, growth trickles at 5% (`PAST_LIMIT_TRICKLE`), teachers
   included, so years of work still show but no one outruns their frame.
2. **Chosen gifts and flaws are known** from the first day; everything else stays hidden and
   is found out by training.
3. **Academy grades are folded into the file** (2.8): the report card is a reading of the
   starting arts, and a grade no longer sets a pace.
4. **Bulk is in from the start.**

## Part 6: As built

All of Part 4 except breakthroughs (phase 5) shipped together. Where it differs from the
proposal:

- **Dead last has 2 development points, not 4.** With 4, the dead last bought a solid D in one
  art and their hard-work floor then carried them past the middle of the class. With 2 they
  graduate mostly at E, lose about three fights in four against their year, and climb to about
  even in four months of focused work (`src/test/pacing/standing.test.ts`).
- **Step costs** are 1, 1, 2, 2 (a D at 9 costs 2, a solid D at 11 costs 4, a C at 13 costs
  6).
- **Gifts** set talent to at least 1.3 (a prodigy's, 1.6: born limit about A); a flaw caps it at
  0.65, starts the stat 1 lower and gives back 2 points. Blooming early or late trades a gift
  for 3 points either way.
- **Upbringings** are as in 2.5, except: the civilian family's hard-work floor is in the five
  arts (0.25 through D, "nobody at home could teach you"), the shinobi family brings early
  training only, and the main house asks for 3 focused points, the branch line 2. The parent who
  teaches once and the clan's eye are left for later story.
- **Builds** move the strength and speed limits by a grade (slight, heavy) or half a grade
  (wiry, sturdy); heavy also costs stamina growth and food. Comfortable strength runs 9 (slight)
  to 20 (heavy).
- **The talent list is unchanged.** Gifts and flaws cover what some talents did, but the talents
  still work and old saves name them; trimming them is left for a later pass.
- **Reserves don't creep with rank** yet: they are a born stat with a limit like speed.
- **Quick picks** (`systems/profile/archetypes.ts`): steady student, clan heir (clans only),
  natural athlete, bookworm, all-rounder, early bloomer, late bloomer, prodigy (genius only).
  Each fills the file from whatever the standing and upbringing allow, around the art you name.
- **The world kept up.** Generated classmates are made the same way, from a fated standing, a
  random upbringing, build and quick pick. The original pack's rookies were raised to clan-child
  levels (Jin, top of his class, graduates at C in kenjutsu), and in the fan pack Sasuke is now
  a prodigy's line. Genin may be E–C (validated).
- **Pacing retuned.** A middle graduate now starts their art at a solid D, so the focused player
  makes C in about 30 days (was 60) and is nominated for the chūnin exam around day 45. A genius
  graduates at C, and B is still more than 120 days off. A fresh graduate beats D-rank foes up
  to 80% of the time (was 75%).

Starting fighting power (`fightingPower`), measured:

| Character                                    | Fighting power |
| -------------------------------------------- | -------------- |
| Dead last, steady student                    | ~7             |
| Middle of the class, steady student          | ~9             |
| Top of the class, steady student             | ~10            |
| Genius, steady student                       | ~10.5          |
| Genius clan heir, prodigy (three stats at C) | ~10.5–11       |
| Typical chūnin (`statLine('D', two Cs)`)     | ~14            |
