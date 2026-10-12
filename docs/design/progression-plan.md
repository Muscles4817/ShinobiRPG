# Progression overhaul: review, decisions, plan

Working document for the improvement cycle (stats, jutsu, gear, team combat). Part 1 is the
original review. Part 2 records what we agreed, item by item. Part 3 is the build plan
that comes out of it. Nothing here is binding until it is in Part 2.

---

## Part 1: The review (as first suggested)

### How the loop works today

- **Training** is a single tap that always gives the same result:
  `gain = base / (1 + stat/25)` per drill, for energy and time. There is no failure,
  breakthrough, injury or plateau.
- **Jutsu** work like a progress bar: stat gates unlock a scroll, study points accumulate
  to `difficulty`, and then you know it. A technique doesn't grow after that.
- **Gear** is training paid for in ryo: flat `statBonuses` on the same axis as drilling.
- **Missions** pay ryo and reputation only. Fighting teaches nothing directly.
- **Companions** don't grow on their own: `companionStats` scales with _your_
  `missionsCompleted`.

### As an RPG game designer

1. **The growth curve makes everyone a generalist and has no ceiling.** Diminishing
   returns are per stat, so the weakest stat is always the cheapest to raise and characters
   flatten out. That works against `fightingPower` (which rewards a specialty), clans and
   specialties. S grade (40) takes roughly 50 sessions, a few in-game weeks.
   → **Rank ceilings and breakthroughs**: a soft cap per rank, broken by an event (exam,
   trial, sensei test, near-death fight), not by more drilling.
2. **There are 12 stats, but combat leans on a few.** Combat code reads speed about 22 times,
   genjutsu 12, and taijutsu, ninjutsu and chakra control about 2 each. Intellect mostly
   feeds study speed (and one Plan & Watch slot).
   → Split **attributes** (body and mind: slow, capped, shared) from **arts**
   (proficiency that comes from using techniques). Cut intellect, or give it a combat job
   (memory = loadout size).
3. **Jutsu go up in a straight line.** A newer technique in the same discipline is a
   bigger number. There are only four effects (damage, stun, heal, seal).
   → Techniques become **verbs** (repositioning, sensing, area, traps, clones, set-up and
   payoff finishers), carried in a **prepared loadout**.
4. **Gear should change how you fight.** It should grant kit traits, enable techniques
   (wire makes traps possible, a blade is needed for kenjutsu) and carry trade-offs (heavy
   armour costs speed), rather than add stats.
5. **Close the loop.** Fights should grow the proficiency of the arts you used. The
   debrief should name what beat you, using the same reading scouting already makes.

### As a Naruto fan

- **Signature jutsu are learned in stages.** The Rasengan has three steps (spin, power,
  shape), each a different exercise, and the technique keeps growing afterwards. The
  stages here would be unstable → proficient → mastered → a signature variant.
- **Chakra control should show up in the world.** Tree-walking and water-walking are
  milestones that open places and routes, which ties into milestone 4.
- **Natures are found, not picked.** Chakra paper as a scene, and a second nature as a
  hard-won moment.
- **Hard work versus genius.** The Rock Lee route needs teeth: high-risk power such as the
  Gates (huge strength, then injury), and grit that pays off at breakthroughs.
- **Teams are defined by their combos** (Ino-Shika-Chō, the Team 7 set-ups).
- **Teammates and rivals are people.** A rival who sometimes pulls ahead. Training
  together grows both of you.

### As a hard-fantasy fan

- **Limits matter more than powers.** Chakra exhaustion carries over from a fight.
  Overtraining injures. Hand seals take time and can be interrupted. Every technique has a
  known counter.
- **Gear should make sense in the world.** "+2 kenjutsu" can't be explained in-world.
  "A shorter blade: faster draw, worse reach" can.
- **Be lethal before you are big.** Today damage is subtracted from big HP pools
  (`armour = stamina × 0.3`, `maxHealth ≈ 60 + 4×stamina`), so fights are attrition.
  Set-ups should let a prepared genin down a stronger foe.
- **Information is power.** Intel and scouting are already the most "hard" part of the
  game. Lean on them.

### Team combat as its own tactical layer

Today, Plan & Watch allies get the default loadout and the player's side focuses the
weakest foe.

1. **Stances, not commands**, for each teammate: press, cover, support or hold, set in
   the plan.
2. **Formation is range.** Front, mid and back are just who stands in which band. Kit
   decides who is happy where.
3. **Combination techniques come from bonds.** They need a set-up (A binds, B's finisher
   gets a big bonus).
4. **A shared coordination meter** that grows with complementary actions and is spent on
   combos. Its maximum comes from bond stage.
5. **Roles outside fights.** A sensor, tracker or medic on the team changes mission stages.

### Structural call and priority order

Settle on one canonical fight engine before milestone 3: every new verb otherwise has to
reach every engine. Priority:

1. Canonical engine.
2. Rank ceilings and breakthroughs.
3. Staged technique mastery and learning by doing.
4. Gear and techniques as verbs and trade-offs.
5. Team stances, then bond combos.
6. Thinning the stats.

---

## Part 2: Decisions (agreed item by item)

Status key: **agreed**, **changed** (agreed with the user's amendment), **rejected**,
**open**.

### D1. Canonical engine: agreed

**Decision:** Plan & Watch (`plan-v1`) is the canonical engine. Classic (`duel-v1`) is
shelved the way Deck is: its code and tests stay and must keep passing, but it isn't offered,
and new traits, tools and verbs don't have to reach it.

**Decision: the player's card is a priority list with conditions.** Slot order at each range
is priority. Each exchange the player plays the first card that is playable and whose
condition (if any) holds. Conditions come from a small fixed vocabulary, for example: foe
dazed or sealed, foe readying a jutsu (from the telegraph), I'm below a third of my health,
my chakra is low, a foe is hidden. Foes and allies keep the instinct and weight AI (allies
get stances later, in D10). The engine stays deterministic given the Rng.

Consequences:

- Saves with `combatStyle: 'duel-v1'` migrate to `plan-v1`. A fight in progress in Classic
  finishes in Classic (`engineFor` already routes by `CombatState.engineId`).
- A remembered plan (`settings.combatPlans['plan-v1']`) grows from `CardId[]` per range to
  slots of `{ card, when? }`. `rememberedLoadout` accepts both shapes.
- The default loadout must produce sensible priorities and conditions, because most
  players will touch it rarely.
- The CLAUDE.md wording for decision 16 changes ("every engine" now means Plan & Watch).
  Tests that dispatch fights through Classic either pin `duel-v1` explicitly or move to
  `plan-v1`.

Context, as of main @ 7e8f971:

- Mind Game is retired. Deck is shelved.
- Plan & Watch:
  - Each range (close, mid, far) has 3 card slots, plus 1 at intellect 10.
  - A round is 4 exchanges that play out on their own. Cards can be changed between rounds.
  - Fighters act in speed order. Defences (guard, dodge, counter) react on their own.
  - Foes telegraph their next card. Insight shows their full loadout.
  - The loadout persists between fights. Allies use the default loadout.

### D2. Ceilings and breakthroughs: limits agreed; triggers and pacing still under discussion

**Decision: personal limits, separate from rank.** Power is capped by personal
limits on each stat. Village `rank` is a separate social track. Rank exams _require_
broken limits but don't raise them by themselves, except the exam's own breakthrough.
This keeps milestone 5 (rogue) coherent: power isn't a village title.

Mechanics:

- **Limits.** `character.limits: Record<StatId, number>`. A fresh genin's limit sits at the
  top of grade D (13). A talent or clan bonus may start some stats one grade higher (C top,
  20). Grade tops follow `STAT_TIERS`: 13, 20, 28, 40, then S (open-ended, set per pack).
- **Growth curve.** It replaces `base / (1 + stat/25)`. Gain is full until 70% of the
  limit, then tapers linearly to a floor of 15%, and the stat is clamped at its limit.
  At the limit the stat shows "Plateau" and the drill card says what breaks it.
  Specialising is no longer taxed until the wall.
- **Breakthroughs** raise one stat's limit to the next grade top. Proposed first-pass sources
  (not yet discussed):
  1. **Trials.** One per stat group (body, mind, arts), unlocked when any stat in that
     group is plateaued. A risky scene at a training place: costs a day and energy, and
     succeeds by chance, helped by willpower, grit or hard-work traits, today's meal and
     sensei bond. Failure injures (see D8) but raises the next attempt's odds.
  2. **Near-death wins.** Win a fight at under 10% health against a foe whose
     `fightingPower` is at least yours. The plateaued stat you leaned on most (the
     discipline of your most-played cards) breaks through.
  3. **The chūnin exam.** A rank event (built later in milestone 3) that is also a
     breakthrough. The **gate** to enter: at least 3 stats past their first limit, plus
     the mission record.
  4. Bond and rival moments come later, with D11.
- **Pacing target** (proposed, not yet discussed): a focused player
  reaches chūnin level, meaning first limits broken and exam eligibility, in about 60
  in-game days. Numbers are tuned against a **headless pacing harness**: a scripted
  "focused player" plays through days in a test and asserts milestone windows, so a
  pacing change fails CI.
- **Save migration.** Existing characters get limits of max(the default limit, the
  current stat's grade top), so nobody loses progress.

### D3. Technique mastery stages and learning by doing: open

### D4. Techniques as verbs (effect vocabulary): open

### D5. Prepared loadout: open

### D6. Gear as kit and trade-offs: open

### D7. Fights feed growth (proficiency and debrief): open

### D8. Limits (exhaustion, injury, seal time): open

### D9. Lethality and HP scale: open

### D10. Team tactics (stances, formation, combos, meter): open

### D11. Companion and rival growth: open

### D12. Stat model (attributes versus arts, intellect's job): open

### D13. Natures and chakra-control milestones: open

---

## Part 3: Build plan

To be written once Part 2 is settled: phased PR-sized steps, save migrations, tests, and
what can run unattended.
