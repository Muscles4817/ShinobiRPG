# Techniques overhaul: the academy, how techniques fight, and a content run

Working document. Part 1 is what is wrong today. Part 2 is how a technique should read at the
academy. Part 3 is how techniques should fight differently. Part 4 is how the content is
organised. Parts 5 and 6 are the catalogue for each pack. Part 7 is the build plan. Nothing here
is binding until confirmed.

---

## Part 1: Today

- **The academy says almost nothing.** A scroll shows its name, art, rank, a one-line
  description and study progress. Not its reach, how hard it hits, what it costs, or what it
  does beyond "Attack".
- **Reach belongs to the art, not the move.** Every taijutsu technique is close-only, every
  ninjutsu technique mid-to-far, every genjutsu anywhere. A shoulder throw and a jab play alike.
- **Fifteen verbs, no texture.** Damage, daze, seal, break, area and the rest exist, but there
  is no knockback, no pin, no chakra drain, no multi-hit, no lingering harm and no difference in
  how likely a move is to land. Styles cannot feel different because the engine can't express it.
- **The content has gaps and odd placements.** Each art's E–B ladder is thin and uneven. There
  is no "everyone learns this" curriculum distinct from a school's own moves. In the fan pack
  Leaf Whirlwind sits in the academy for everyone, though only Guy and Lee's school would teach it.

---

## Part 2: The academy, informative

Every scroll unrolls into a **technique sheet**. The same sheet is the back of the card in the
Jutsu deck, so what you read before studying is what you see before using it.

| Row               | What it shows                                                 | Example                                                  |
| ----------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| **Reach**         | The three range bands, the ones it reaches inked              | Close ● Mid ● Far ○                                      |
| **Hits**          | A word band for its strength, the power as a chip             | Heavy (chip: 20)                                         |
| **Lands**         | How sure it is to land: sure, steady or wild                  | Wild: easy to slip, hits hard                            |
| **Strikes**       | For multi-hit moves, how many blows                           | Three blows                                              |
| **Then**          | Each further effect in words, a duration chip where it lasts  | Knocks them back to mid range; Pins them (chip: 2 turns) |
| **Costs**         | Chakra (chip), plus any once-a-fight or after-the-fight price | 8 chakra; Once a fight; Sore for a day                   |
| **Needs**         | Nature, control grade, weapon, clan                           | Fire nature; Blade in hand                               |
| **School**        | Standard curriculum, or the school it belongs to              | The Lantern Wind school                                  |
| **In your hands** | A read against an equal: how much of their health a hit takes | About a quarter of an equal's health                     |

- **Strength bands** (by power): Light (under 10), Solid (10–15), Heavy (16–22), Crushing
  (23–29), Devastating (30+). The number is a chip; the story text never carries numbers.
- **"In your hands"** uses the real damage formula against a copy of you, so it rises as you
  grow, and two people reading the same scroll see different things. It is a read, not a
  number: "a scratch", "about a tenth", "about a quarter", "about half".
- **Filters at the academy and library:** by art and by what it does (strike, control,
  movement, defence, support). The rack groups standard techniques first, then each school.

---

## Part 3: How techniques fight

### 3.1 New properties on a technique

- **`reach`**: the bands it works at, overriding the art's default. A throw reaches close only;
  a water needle far only; a wind blade mid and far; a palm thrust close and mid.
- **`accuracy`**: `sure` (lightning, iaido, pressure points: harder to dodge), `steady` (the
  default), `wild` (big swings, drunken fist: easier to dodge, more damage when they land).
  Applied as a multiplier on the defender's evasion chance (`rules/defence.ts`), so speed and
  perception still matter.
- **`hits`** on a damage effect: the power split over 2–5 blows. Each rolls the defence
  separately. Good against guards and counters, which only stop one blow each; worse against
  armour, which takes its share from every blow.

### 3.2 New verbs

| Verb        | What it does                                                                                                                                                                                         | Driven by / resisted by                                  | Typical users                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| **knock**   | Changes the distance to the target (`to`: close, mid or far). A throw or palm thrust sends them away; a grab or chain drags them in. Spoils the target's planned move if it needed the old distance. | strength or art / the target's strength and speed        | Throws, water, wind, chains                                              |
| **pin**     | The target can't change range or flee, and dodges worse, for a few turns.                                                                                                                            | art / strength (bodily holds), willpower (illusory ones) | Grapples, mud, water prisons, binding ropes, heavy-limb illusions        |
| **drain**   | Takes chakra from the target; an absorbing seal returns part to the user.                                                                                                                            | art / chakra control                                     | Pressure points, gentle fist, chakra-leech seals, will-sapping illusions |
| **afflict** | Lingering harm over the next turns: **burn** (fire), **bleed** (blades, stacks), **poison** (senbon, weakens strength and speed).                                                                    | art / stamina                                            | Fire jutsu, cutting blades, poisoned needles                             |
| **counter** | Readies a riposte: the first blow aimed at the user this round is answered at once, at this power.                                                                                                   | art / the attacker's speed                               | Iaido, gentle fist rotation, defensive taijutsu                          |

Existing verbs keep their meaning. **Daze** is the stun (loses their next turn). **Seal** blocks
techniques: gentle fist and pressure points pair it with drain. **Break** smashes guards and
armour. **Area** hits every foe.

### 3.3 What each family feels like

**Taijutsu**

- **Standard**: steady, close, solid damage. Some moves close the distance or open a gap.
- **Fast kicks** (the Lantern Wind / Strong Fist school): multi-hit, sure through speed,
  launches (knock + daze), self-empowering forms at a price.
- **Grappling and throws** (the Iron Gate school): knock to mid or far, pin, break. Weak at range.
- **Pressure points** (the Moth Needle school; gentle fist for its clan): sure accuracy, light
  damage that ignores armour, drain and seal. Shuts down ninjutsu users.
- **Wild** (drunken fist): wild accuracy, heavy damage, confuse.

**Ninjutsu, by element**

- **Fire**: damage plus burn, areas at mid.
- **Water**: knock and pin (prisons), fogs.
- **Earth**: pins (mud), walls (substitution), crushing breaks.
- **Wind**: the longest reach, knocks foes back, cuts through armour.
- **Lightning**: sure to land, dazes, pierces guards. Light on chakra but fragile against earth.
- **Non-elemental**: substitution, clones, body flicker, sensing, healing.

**Genjutsu**

- Confuse, daze and conceal as now.
- **Heavy limbs**: pin, resisted by willpower.
- **Sap the will**: drain chakra.
- **False target**: a substitution through illusion; the next blow strikes an image.

**Kenjutsu**

- **Standard**: steady, close and mid.
- **Iaido** (the River Draw school): sure, counter, a first-strike bonus.
- **Heavy blade** (the Forge school, Kurogane): break, crushing damage.
- **Twin and fast blades**: multi-hit and bleed.

**Fūinjutsu**

- Traps, seals and binding: pin at mid, drain tags, knock-back blast rings, and explosive tags
  that reach far.

### 3.4 How the rest of the game follows

- **Scouting and telegraphs** name the new effects ("readies a throw", "a binding seal").
- **Foe AI priorities** learn the new verbs: pin a runner, knock away a brawler, drain a ninjutsu
  user, counter when outpaced.
- **The fight bench re-tunes** the named constants so equals still fight two to three rounds and
  win about half. New enemy kits use the verbs too: bandit grapplers, river pirates with nets
  (pin), rogue ninja with fire (burn).

---

## Part 4: How the content is organised

Every art has three kinds of technique:

1. **Standard curriculum**: what every shinobi of the village learns, at **every grade from E to
   B**. Two or three a grade per art. E and D at the academy; **C on the library's open
   shelves**, which genin can use; B in the restricted stacks for chūnin. These are plain,
   reliable, steady techniques.
2. **Schools**: a style's own line, roughly D to A, taught only by the people of that school
   (a teacher's `teaches`), for their price. Each has a clear identity and a counter. A school is
   how a specialist becomes recognisably themselves.
3. **Clan arts**: as now, members only, now with the same texture (gentle fist drains and seals;
   expansion breaks).

Elemental ninjutsu follows the standard pattern per nature: an E, D, C and B for each of the
five elements, gated by your nature.

**Saves:** technique ids are kept wherever a move survives, so nobody loses a technique they
know. A technique that leaves the academy for a school stays known to anyone who learned it.

---

## Part 5: Catalogue: Land of Embers (original pack)

Legend: **new** = new technique; others exist (some re-placed or re-tuned). Reach: C close, M
mid, F far.

### Taijutsu

**Standard: the Watch Fist (everyone)**

| Rank | Technique            | Reach | Does                                           | Where        |
| ---- | -------------------- | ----- | ---------------------------------------------- | ------------ |
| E    | Palm Strike          | C     | Solid, steady                                  | Starter      |
| E    | **Post Sweep**       | C     | Light, pins one turn (they lose their footing) | Academy      |
| E    | **Ferryman's Shove** | C     | Light, knocks them to mid                      | Academy      |
| D    | Temple-Bell Palm     | C     | Breaks a guard                                 | Academy      |
| D    | **Shoulder Throw**   | C     | Solid, knocks them to mid, dazes               | Academy      |
| D    | **Watchman's Rush**  | C, M  | Closes to close range, then a solid blow       | Academy      |
| C    | Crescent Drop        | C     | Heavy axe kick, wild                           | Open shelves |
| C    | Bellows Fist         | C     | Breaks, dazes                                  | Open shelves |
| C    | Lamplighter's Ladder | C, M  | Moves in, heavy                                | Open shelves |
| C    | **Arm Lock**         | C     | Light, pins two turns                          | Open shelves |
| B    | Kiln-Door Kick       | C     | Crushing break                                 | Restricted   |
| B    | Night-Watch Flurry   | C     | Three blows, dazes                             | Restricted   |
| B    | Ash Whirlwind        | C     | Spinning kick, hits every foe                  | Restricted   |

**School: Lantern Wind** (fast kicks and the inner fire; taught by Gōran)

| Rank | Technique               | Does                                               |
| ---- | ----------------------- | -------------------------------------------------- |
| E    | Gale Heel               | Sure kick (moves from the academy into the school) |
| D    | **Rising Gale**         | Launch: solid, knocks them to mid, dazes           |
| C    | **Spinning Gale**       | Four quick kicks, sure                             |
| C    | Kindled Pulse           | Empower speed and strength, at a health price      |
| B    | **Lantern Wind Flurry** | Five blows, dazes                                  |
| A    | Banked Coals            | Heal and empower                                   |
| S    | Every Lantern Lit       | The last gate                                      |

**School: Iron Gate** (grapples and throws; taught by the bridge watch's captain, a chūnin)

| Rank | Technique              | Does                                     |
| ---- | ---------------------- | ---------------------------------------- |
| D    | Iron-Gate Palm         | Heavy, steady                            |
| C    | **Gatekeeper's Throw** | Heavy, knocks them far, dazes            |
| B    | **Iron Hold**          | Pins three turns, light damage each turn |
| A    | Bridge-Holder Palm     | Crushing break, dazes                    |

**School: Moth Needle** (pressure points; taught by a medic-nin)

| Rank | Technique            | Does                                      |
| ---- | -------------------- | ----------------------------------------- |
| D    | Moth Needle          | Sure, light, ignores armour               |
| C    | **Moth-Wing Strike** | Drains chakra, dazes                      |
| B    | **Hundred Moths**    | Five light blows, drains, seals two turns |

### Ninjutsu

**Standard, non-elemental**: Lantern Husk (E, substitution), **Chakra Dart** (E new: a sure
light dart, mid and far), Snuffed-Wick Step (D, move), Wick Sense (D), Lantern Shades (D, clones),
Mending Glow (D, heal), **Paper Body** (C new: substitution through illusion), Night-Ward Lamp (B,
heal and sense).

**By element** (nature-gated, standard):

| Element   | E                              | D                                    | C                                             | B                                        |
| --------- | ------------------------------ | ------------------------------------ | --------------------------------------------- | ---------------------------------------- |
| Fire      | **Ember Flick** (light, burn)  | Ember Breath; Lantern Scatter (area) | Great Lantern Flame (heavy, burn)             | Ember Rain (area, burn)                  |
| Water     | **Water Needle** (far, sure)   | River Fog (field)                    | Tide Lash (knocks far); **River Grip** (pins) | Falls Hammer (crushing, dazes)           |
| Earth     | Pebble Volley                  | **Mud Grip** (pins)                  | **Clay Wall** (substitution)                  | **Landslide** (area, pins)               |
| Wind      | **Gust Palm** (knocks to mid)  | **Cutting Breeze** (pierces armour)  | **Vacuum Blade** (far, heavy)                 | **Great Gale** (area, knocks far)        |
| Lightning | **Static Touch** (sure, dazes) | **Charged Kunai** (sure, mid/far)    | Wire Spark (dazes)                            | **Thunder Lantern** (heavy, sure, dazes) |

### Genjutsu

**Standard**: Lantern Mirage (E), Shadow Feint (E), Moth Dance (D, confuse), Paper Veil (D,
conceal), Gutter the Lanterns (D, field), **Heavy Limbs** (D new: pin, resisted by will),
Whispering Dread (C), Ink in the Eyes (C), Lantern Question (C), **Sap the Will** (C new: drain),
Hall of Paper Lanterns (B), Cellar Silence (B, seal), Grave-Lantern Walk (B), **False Lantern**
(B new: illusory substitution).

**Clan**: the Tōkaku line, as now.

### Kenjutsu

**Standard**: Lantern Cut (E), Scabbard Rap (E), **Draw Cut** (E new: sure), Anvil Fall (D),
Ash Sweep (D, area), Notch Breaker (D, break), **Bleeding Cut** (D new: bleed), Moonfall Slash
(C), Riverbank Draw (C, move then cut), Cut the Wick (C, seals), Twice-Folded Edge (B, two
blows), Smith's Hammer (B, break), Lantern-Glint Ambush (B, from hiding).

**School: River Draw** (iaido; taught by a library-keeping chūnin swordsman)

| Rank | Technique            | Does                              |
| ---- | -------------------- | --------------------------------- |
| D    | **Still Water**      | Counter                           |
| C    | **First Light Draw** | Sure; heavy if they haven't moved |
| B    | **Return Current**   | Counter, then a heavy cut         |
| A    | Lantern-Gate Edge    | Crushing, dazes                   |

**School: Twin Cut**: **Paired Cuts** (D, two blows), **Thousand Cuts** (C, four blows, bleed),
Forge-Yard Storm (A).

**Clan**: the Kurogane forge line, as now; heavy blades break.

### Fūinjutsu

**Standard**: Ember Tag (E), Smoke Tag (E), **Sticking Tag** (E new: pins one turn), Binding
Ward (D), Shrine Snare (D), Snare Ward (D, trap), **Leech Tag** (D new: drain), Great Seal of Ash
(C), Ink-Chain Seal (C), Kiln Mine (C), **Long Rope Binding** (C new: pins at mid), Paper-Lantern
Cage (B), Buried Lantern (B), Stitch Seal (B, heal), **Blast Ring** (B new: area, knocks far).

**Clan**: Shimenawa ropes; binding now pins as well as seals.

**Totals for the original pack:** about 40 new techniques. Every art gets two to four
techniques at each grade from E to B, plus three taijutsu schools and two kenjutsu schools.

---

## Part 6: Catalogue: the fan pack

Same structure, Leaf names. In summary:

### Taijutsu

**Standard Leaf taijutsu (academy and open shelves)**

- E: **Basic Strike Combination** (two blows), **Leg Sweep** (pin one), Shuriken Jutsu (thrown,
  mid/far).
- D: **Shoulder Throw**, **Rising Knee** (dazes), Shadow of the Dancing Leaf (move behind, knocks up).
- C: **Arm Bar** (pin), **Flying Kick** (closes in), Drunken Fist (wild, confuse; stays on the shelves).
- B: Lion Combo (three blows, break), **Heel Drop** (crushing, wild).

**Strong Fist** (Guy's school; Guy and, once close friends, Lee teach it)

- Leaf Whirlwind, Leaf Hurricane, Leaf Rising Wind, Leaf Strong Whirlwind, Dynamic Entry and
  Thousand Years of Death **leave the academy** and become the school's.
- With them: Front Lotus, the Gates (Opening, Life), Reverse Lotus, Morning Peacock and
  Daytime Tiger.

**Gentle Fist** (Hyūga clan)

- Gentle Fist (drain, seal) and Sixty-Four Palms, plus **Air Palm** (D: mid reach, knocks back),
  **Eight Trigrams Palm Rotation** (C: counter, hits every foe) and **One Hundred Twenty-Eight
  Palms** (B).

**Akimichi** and **Inuzuka**: as now, given break (expansion) and multi-hit with knock
(fang-over-fang).

### Ninjutsu and the rest

- **Ninjutsu**: Leaf standards (substitution, clones, body flicker, sensing, mystical palm) and
  E–B for each element. Fire's Great Fireball stays Uchiha.
- **Genjutsu, kenjutsu and fūinjutsu**: filled to two to four techniques a grade by the same
  pattern. Sword schools follow the swordsmen of the Mist (multi-hit, bleed) and iaido.

---

## Part 7: Build plan

Each step is its own pull request.

1. **The technique sheet**: a view model, the academy, library and deck UI. No combat change.
2. **Reach, accuracy and multi-hit**: technique properties in Plan & Watch, scouting words, the
   bench re-tuned.
3. **New verbs**: knock, pin, drain, afflict and counter, each with rules in `rules/verbs/`,
   play in `engines/plan/`, the AI's priorities, telegraph words and tests.
4. **The library's open shelves**: genin may study standard C-rank techniques; restricted stacks
   stay chūnin.
5. **Original pack content run**: Part 5, with school teachers given `teaches`, and new enemy
   kits using the verbs.
6. **Fan pack content run**: Part 6, Strong Fist moved out of the academy into Guy's school.
