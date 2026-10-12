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

### D2. The growth model: agreed (all topics from the discussion)

The earlier limits-and-breakthroughs proposal is withdrawn. Direction from the user:

- **Ranking up should be a big deal.** Crossing from one grade to another must feel like an
  event and must unlock concrete things.
- **No hard lock. The wall should come about naturally:**
  - Solo training hits diminishing returns fast: effective at E, mildly effective at D,
    far too slow to fill C.
  - Training with someone who has a higher grade in that ability gives reasonable progress.
  - The teacher's shinobi rank helps too: a jōnin with B taijutsu teaches better than a
    chūnin with B taijutsu.
  - Traits can unlock better solo training in a field.
- **Techniques are gated by rank.** A C-grade ninjutsu user should struggle to learn
  higher techniques, and some should be impossible.
- **Training should vary.** Some technique acquisition (not all) should be staged.
- **Even builds are an engine problem.** Different approaches must each be effective.
  Reference archetypes: Lee, Guy, Kakashi, Itachi, Zabuza (see the discussion log).
- **Where techniques are found:**
  - Clan techniques are found within the clan, gated by rank or ability.
  - The academy holds E and D only.
  - An adult library holds C and some B.
  - The best B and A techniques come from a willing teacher, or from scrolls found in
    the wild or given as rewards.
- **A trait or skill tree** gives another meaningful goal, even though there are only
  about four ranks.

**Principle agreed: no enforced parity.** Builds come from **scarce resources**, not
from balancing approaches against each other. The perfect build (good at everything) exists
and is strong. Almost nobody reaches it, because it needs the perfect mix of **talent**
(aptitude), **trainers** (access to people better than you) and **scrolls** (access to
techniques), which is to say talent and luck. Kakashi's low stamina is a talent gap he built
around. Lee is a taijutsu monster because he can't do ninjutsu or genjutsu. The engine's job
is to make sure **every weakness can be built around** (there are tools that compensate),
not to make every approach equally strong. More resources should mean more power.

**Agreed answers:**

1. **Presentation of growth comes in three tiers:**
   - A tick within a grade (12.9 → 13.0) is a quick, simple animation.
   - Crossing an ability grade (D → C) needs no sign-off from a person, just a fitting
     presentation: a moment, a stamp, and what it unlocks.
   - A shinobi rank promotion (for example chūnin → jōnin) is a big moment, a scene of its own.
2. **Decision 15 is retired.** People have real grades and a rank. Teammates and rivals
   have stored stats and grow on their own.
3. **Scope is everything.** Plan it all properly, then build all of it.
4. **The skill tree comes after** gating, teachers and technique ranks are in.

**Talent (aptitude), agreed:**

- **Aptitude per stat** multiplies every growth source (solo, teacher, fight). With
  efficiency falling by grade, low aptitude gives a natural ceiling and **zero aptitude
  means impossible** (no training, no techniques in that art). **Hard work** (for example a
  Tireless trait) is separate: it raises the solo-training floor and energy, not aptitude.
- **Aptitude is found by discovery,** not shown up front.
- **Luck in talent is tied to other choices.** Most clan shinobi are reasonably talented
  (a higher floor in the clan's arts). The exact shape is still to confirm.
- **Aptitude can change, rarely** (awakening, forbidden arts). This is not needed for the
  first implementation.
- **Chakra reserves become their own stat:**
  - Largely tied to stamina; they grow alongside stamina and from using jutsu, and aren't
    drilled directly. `maxChakra` derives from reserves.
  - **Chakra control** stays separate. It multiplies jutsu learning and matters especially
    for some ninjutsu, most genjutsu, and escaping genjutsu.
- **The people baseline:** in the Naruto pack, author all the known Konoha shinobi, then
  use their totals (how many genin, chūnin and jōnin, and their grades) as the baseline for
  village populations. Other villages and the original pack are filled to match, with a mix
  of authored and generated people.

**Training relationship, agreed in principle:**

- **The verb:** "Train with [person]" where they are. They offer the arts they are
  better than you at.
- **Efficiency:** base × your aptitude × grade gap (equal is a little better than solo,
  +1 is good, +2 is very good, +3 is no better than +2) × their rank as a teaching
  factor (plus a personal quirk) × your condition.
- **Access is the throttle:** bond needed (scaled by their rank relative to yours),
  sessions per week by rank, bond grows from training, peers grow together. The sensei is
  the special case: guaranteed weekly time and signature techniques. `lesson` folds into
  this verb.
- **Fights use the same formula,** scaled down, with the foe's grade in the arts you used.
- **Who chooses what you train depends on the teacher and the relationship.** A teacher
  profile says whether they steer, and bond can loosen that.
- **Teaching juniors** is worth having eventually, once the player has genin. Not now.
- **A teacher's price is templated:** a few reusable approaches with swappable
  flavour: bond, ryo, a mission, a favour, or combinations.
- **Order:** the Naruto pack's people come first (author the known Konoha shinobi); the
  original pack is sized from that baseline.

**Techniques, agreed:**

- **Ranks E–S** use the same letters as ability grades. Compared with your grade in the
  technique's discipline:
  - At or below your grade: learn normally.
  - One above: slow, and it arrives **unstable** (extra chakra, can misfire), stabilising
    when your grade catches up.
  - Two or more above: **impossible, even with a teacher.**
- **Hard requirements** where physically needed: nature, clan or bloodline, minimum
  reserves, a control grade, a weapon.
- **Study speed** = aptitude × chakra control × source quality (a teacher beats a
  scroll, a scroll beats nothing).
- **Sources:**
  - Academy: E and D.
  - Clan: the clan's people, through "train with".
  - Library: C and some B, needs chūnin rank.
  - Teachers: their `teaches` list and price.
  - **Scroll items:** rewards, gifts, finds. Studied at home or in the library.
- **Techniques don't improve with use.** Their effect is tied to the **user's stats**, so
  the same technique differs in two people's hands. Every verb has a scaling profile in
  `rules/` (which stats drive its potency, and which of the target's stats resist it); a
  technique may override it.
- **Verbs** (composable effect list, each rule defined once): damage, area, daze, seal,
  confuse, conceal, field, move, substitute, empower (with cost), break, clone, trap, sense,
  heal. The list is accepted for now. Summons are a separate topic later.
- **Seal cast time and interruption are out for now.**
- **A trump card's cost varies by card:** a template set (hospital days, chakra exhaustion
  days, temporary stat injury, rarely permanent), chosen per technique.
- **Content target:** about 15 general techniques per discipline per pack (E 2, D 3, C 4,
  B 3, A 2, S 1), plus clan and teacher signatures.

**Gear, agreed:**

- **Flat `statBonuses` are removed.** Gear changes how you fight; quality shows through the
  verb (a better blade's cut does more), not through stats.
- **Weapons enable and shape:**
  - A blade turns Strike into a cut and is required for kenjutsu techniques.
  - Knuckles and gauntlets change taijutsu blows.
  - Throwing weapons (kunai, shuriken, senbon) change the throw card.
- **Armour comes in levels,** each a trade of protection against speed and dodge:
  - Light, no penalty.
  - Flak jacket.
  - Heavier shinobi armour (more than a flak jacket, less than full plate).
  - Full samurai plate.
  - It uses the `armoured` kit rule, scaled by level.
- **Focus items** boost a verb's or discipline's scaling (seals hold longer, confusion
  lands more often).
- **Tools** stay as consumables, with rank tiers.
- **Gear has ranks (D–A).** Shops stock D and C, and B with chūnin rank or the smith's
  favour.
- **Unique named weapons are in this pass.** They are earned, found or inherited, and can
  carry their own verbs.
- **Gear does not grow with use.** Durability and weight are out.

**Team tactics, agreed:**

- **Formation is rows:** each side has a front and a back row, with the shared range
  band between the sides. The back row can't be struck up close while someone stands in
  front of it. Foes use rows too. **Future experiment:** real per-fighter ranges
  (Shikamaru hangs back while Chōji closes in). Not in this pass; keep the engine's
  range code open to it.
- **Control escalates with bonds:**
  - At first you **don't** direct the team: the sensei or the teammates' own judgement
    sets their stances.
  - As bonds grow, you earn **stances** for teammates who trust you, then **card editing**
    once a teammate's trust is high or your sensei sees you as the leader.
- **Stances:** press, cover [someone], support, hold.
- **Targeting:** a per-card target rule (weakest, strongest, threatening my back row,
  marked) and a team mark set between rounds.
- **Combos:**
  - Generic, with no authoring: element combos when two allies hit one target in an
    exchange; set-up and payoff (an ally's daze or seal makes your finisher land
    harder).
  - Authored, bond-gated: combination techniques both partners must know.
- **No coordination meter.**
- **Mission roles are in:** on team missions, a stage check uses the best teammate for
  the job (tracker, sensor, medic). Stages are written with roles in mind.
- **The sensei fights alongside the team when it's serious** (high-threat missions).
  After promotion to chūnin, more missions are solo.

**Lethality and injury, agreed:**

- **Lethality targets:**
  - Equals: about 1–2 rounds (4–8 exchanges).
  - One grade apart: the stronger side wins head-on within a round unless the weaker
    side's kit turns it.
  - Two or more grades apart: head-on, it's over in 1–2 exchanges.
  - These are bench tests.
- **Avoiding combat must be a valid path to victory.** The gameplay before a fight
  (missions, scouting, approach) needs work so that not fighting, sneaking past,
  negotiating or fleeing are real options. This is its own topic (engagement).
- **No death.** Defeat means hospital plus an injury.
- **Named injuries** (ribs, hand, eyes…), each with specific effects and a duration in
  days, built like hunger (a `ModifierSpec` plus a fight effect). The hospital shortens
  them; stamina speeds recovery.
- **Chakra exhaustion:** ending a fight nearly drained, or overusing empowerment,
  leaves reserves only partly refilled the next day.
- **Stat roles:** proposed table in the discussion; pending confirmation along with the
  flat health question.

**Health and defence, agreed:**

- **Health is 100 for every human.** Creatures declare a multiplier on `EnemyDef` (giant
  beasts more, swarms of small things less).
- **Damage comes from the gap** between the attacker's power and the defender's defence
  (a ratio or difference), not from absolute values, so equals take about the same number
  of exchanges at every rank.
- **Damage variance is narrower than now.** The swing comes from decisions (dodged,
  guarded) rather than damage rolls.
- **Defence has five layers:**
  - Evasion: speed, perception, dodge.
  - Guard: taijutsu, strength, guard and counter.
  - Toughness: stamina, armour level.
  - Resistance: willpower, control (genjutsu and seals).
  - Healing: medical ninjutsu, regeneration, tools.
- **Stamina becomes toughness and endurance:** damage reduction, injury resistance,
  recovery, reserves growth, energy.
- **Save migration** rescales current health to a fraction of 100.

**Stat roles (agreed with the health change):**

| Stat           | In fights                                                                               | Outside fights                       |
| -------------- | --------------------------------------------------------------------------------------- | ------------------------------------ |
| Strength       | blow damage, break, reduces armour's speed penalty                                      | physical checks                      |
| Speed          | initiative, footwork, evasion, kenjutsu, move verbs                                     | chases, escapes, stealth             |
| Stamina        | toughness, injury resistance                                                            | recovery, reserves growth, energy    |
| Reserves (new) | max chakra, clone counts, empower duration                                              | grows with stamina and jutsu use     |
| Chakra control | jutsu cost, breaking genjutsu, medical and genjutsu precision                           | study speed, control milestones      |
| Intellect      | loadout slots, trap and fūinjutsu scaling                                               | scroll study, planning checks        |
| Perception     | finding the hidden, seeing through fields, reading telegraphs precisely, throw accuracy | sensing, tracking, spotting ambushes |
| Willpower      | genjutsu resistance, fighting on while hurt, enduring trump and Gates costs             | trials, interrogation, intimidation  |
| Arts (5)       | potency of their techniques; taijutsu and kenjutsu basics                               | gates for techniques and teachers    |

**Engagement, agreed:**

- **An encounter is a scene with three beats:**
  1. **Recon** (optional, freeform): observe, track, sense, ask around (intel), later
     clones and summons. Each costs something and tests a stat. Success reveals count,
     identity, kit, terrain and awareness. Failure risks being noticed.
  2. **Approach:** head-on, ambush (only if they're unaware), sneak past, talk / bribe /
     intimidate (only foes who'd listen), set the ground (traps, mist, a chosen spot), or
     withdraw.
  3. **The fight**, if any, inherits an **opening** in `CombatSetup`: start range, who
     is hidden, foes dazed in exchange 1, rows disrupted, a field in place.
- **Foe alertness** (unaware, wary, alert) is the state variable. Recon failures raise it.
- **You can be ambushed too:** your perception, a sensor teammate, and careless recon
  decide who moves first.
- **Every mission fight** gets at least head-on, withdraw and whatever recon reveals.
  Some stages (a duel, a surprise attack) skip straight to the fight on purpose.
- **Rewards depend on the job:**
  - An escort that arrives safely is fully paid.
  - "Eliminate" jobs aren't paid for sneaking past.
  - A negotiated surrender may pay more reputation and less ryo.
- **Content:** stage templates (bandit camp, beast, lone rogue, guarded building) say which
  approaches make sense, with flavour swapped per mission.

**Promotions and presentation, agreed:**

- **The chūnin exam:**
  - A calendar event, **twice a year**, announced ahead through rumours and the sensei.
  - **Entry:** sensei nomination (bond plus their judgement), a mission record, and a
    **three-person team**. A replacement teammate is possible but **hits the bond with the
    left-out teammate hard**, and depends on the sensei: some won't tolerate it.
  - **Modular stages:** an exam is a list of stage definitions (a discriminated union),
    so alternative stages can be designed and slotted in. The first set:
    1. A mind test (intellect and perception; cheating is an approach, with risk).
    2. Survival (the engagement layer, against other teams).
    3. A tournament (Plan & Watch duels against generated rivals).
  - **Promotion is judged on conduct,** not just winning.
- **Jōnin by nomination:** a record of B- and A-rank missions, grades in your specialty,
  and standing with the leadership.
- **Presentation tiers:**
  - A tick within a grade is an ink-stroke roll on the stat.
  - An ability grade-up is a report card with the grade seal and a "What this opens" list.
  - Discovery reads are journal lines; the Shinobi screen shows aptitude as unknown, a
    rough sense, or known.
  - A rank promotion is a full scene: the ceremony, the title, the flak jacket, the
    unlocks.
- **The skill tree comes after** this plan (not in this run).

### D3–D13 (from the original review): superseded

These were folded into the D2 discussion. Where each landed:

- D3 mastery stages: no improvement with use; staging comes from unstable techniques.
- D4 verbs: the verb list.
- D5 loadout: Plan & Watch slots.
- D6 gear: gear.
- D7 fight growth: fights use the teacher formula.
- D8 limits: injuries, exhaustion, trump costs (seal time dropped).
- D9 lethality: health 100 and gap damage.
- D10 team tactics: team tactics.
- D11 companion growth: decision 15 retired, peers grow.
- D12 stat model: the stat roles table, reserves.
- D13 natures: chakra paper as discovery. Chakra-control world milestones wait for
  milestone 4.

---

## Part 3: Build plan

### How the run works

- **Branch:** `ccr-62a24875-5s1vya`. Each numbered step is one commit or more, pushed when
  `npm run check` **and** `npm run check:release` are green. No step lands red. If a step
  can't be made green, revert to the last green commit, write down why under "Run log",
  and move to the next step that doesn't depend on it.
- **Order is by dependency.** Every phase leaves the game playable end to end (the UI
  smoke tests prove it). Later phases build on earlier ones, so stopping anywhere still
  leaves a coherent game.
- **Saves:** every change to the save shape bumps `SAVE_VERSION` (currently 13) with a
  migration in `game/persistence/migrations.ts` and a test that a previous-version save
  still loads. Never break a save.
- **Numbers:** every tunable is a named constant. Balance is checked by the **bench** and
  the **pacing harness** (step 0.2), not by eye.
- **UI:** each new or changed screen gets a smoke test and a screenshot check at 390px
  (the `run` skill / Playwright), following the Village Hub rules.
- **Gaps in the design:** when a step meets a question this doc doesn't answer, choose
  the option most consistent with the principles above (scarcity, not parity; stats drive
  effects; access is the throttle) and record it under "Decisions made during the run"
  for review.
- **Scope honesty:** this is many weeks of human work. The run goes phase by phase in
  this order. Whatever isn't reached stays planned here.

### Phase 0: Ground and guardrails

**0.1 Shelve Classic.**

- `defaultEngines()` offers Plan & Watch only.
- Migrate `settings.combatStyle: 'duel-v1'` to `plan-v1`. A Classic fight in progress
  finishes in Classic.
- Hide the fight-style picker when only one style is offered.
- Update CLAUDE.md decision 16.
- Tests that need Classic inject it explicitly.

**0.2 Bench and pacing harness** (in `src/test/`, headless):

- **Bench:** stat lines, loadouts and kits for archetype fighters (Lee, Guy, Kakashi,
  Itachi, Zabuza at genin, chūnin and jōnin scale), fought through the Plan & Watch engine
  against a fixed set of foes over many seeds. It asserts the **lethality targets** and the
  two principles:
  - **Power is real:** more resources beat fewer, head-on.
  - **Every weakness can be built around:** a constrained build with the right plan beats
    or escapes a somewhat stronger foe.
  - Assertions are tightened as phases land.
- **Pacing harness:** a scripted focused player dispatching real actions day by day. It
  asserts milestone windows (about 60 days to chūnin readiness) once Phase 2 exists.

### Phase 1: The combat core (Plan & Watch)

**1.1 Health 100 and gap damage.**

- Humans have health 100. Creatures have `EnemyDef.healthScale`.
- Damage comes from attacker power against defender defence, with narrower variance.
- The five defence layers: evasion, guard, toughness, resistance, healing.
- Stamina becomes toughness.
- Genjutsu: willpower resists it taking hold; control breaks it (Dispel and confusion
  duration).
- Perception sharpens telegraphs.
- Migration rescales stored health.

**1.2 The plan as a priority list.**

- A slot becomes `{ card, when?, target? }`.
- The condition vocabulary: foe dazed or sealed, foe readying a jutsu, me below a third of
  my health, chakra low, foe hidden.
- Target rules: weakest, strongest, threatening my back row, marked.
- The player plays the first playable card whose condition holds; foes and allies keep
  the instinct AI.
- `rememberedLoadout` accepts the old shape.
- Plan editor UI: reorder, set when and target.

**1.3 Rows.**

- Front and back rows per side. The back row can't be struck up close while the front
  stands.
- Default placement comes from kit.
- Rows show on the fight screen. Range code stays open to per-fighter ranges later.

**1.4 Verbs.**

- `TechniqueDef.effect` becomes `effects: Effect[]`, each with a scaling profile in
  `rules/verbs/` (driving stats, resisting stats; a technique may override).
- Steps:
  - 1.4a: the schema and today's four effects; mechanical migration of both packs.
  - 1.4b: area, confuse, conceal, sense, break.
  - 1.4c: field (mist, smoke), move, substitute (a defence card).
  - 1.4d: empower (with cost), clone, trap.

**1.5 Trump cards.**

- `oncePerFight`, plus an after-cost picked from a template set (hospital days,
  exhaustion days, temporary stat injury, rarely permanent).
- `CombatOutcome` reports costs incurred, and the game applies them (needs 2.6;
  until then they are recorded only).

**1.6 Openings.**

- `CombatSetup.opening`: start range, who starts hidden, foes dazed in exchange 1, rows
  disrupted, field in place, and who moved first.
- The engine honours it.

**1.7 Team.**

- Allies fight with their own real techniques and loadouts.
- Stances: press, cover, support, hold. A team mark.
- Element combos and set-up and payoff, both generic.
- Combination techniques that need a partner who knows them.
- `CombatOutcome` reports what each fighter used (feeds 2.4).

### Phase 2: The character, its aptitude and growth

**2.1 Aptitude.**

- Each character has a hidden aptitude per stat, plus a discovery state (unknown,
  sense, known).
- It is rolled at creation, seeded by the break-in, and shaped by clan (high floor,
  narrow spread in clan arts) or clanless (wide spread), and by creation choices.
- Zero aptitude is possible.
- Migration derives aptitude from existing clan, talent and trait growth modifiers.

**2.2 Growth.**

- Solo efficiency falls steeply by grade (roughly E 100%, D 40%, C 10%, B 3%), multiplied
  by aptitude and by hard-work traits (for example Tireless).
- It replaces `trainingGain`. Zero aptitude blocks training in that art.
- Early sessions in an art give a discovery read (a journal line).

**2.3 Reserves.**

- A new stat (`STAT_IDS`, plus a save migration seeding it from the old `maxChakra`).
- Not drilled directly: it grows with stamina training and chakra spent in fights.
- `maxChakra` derives from reserves.

**2.4 Fights teach.**

- Growth after a fight uses the teacher formula, scaled down, against the foe's grade in
  the arts you used.

**2.5 Presentation.**

- A tick within a grade animates an ink stroke.
- A grade-up shows a report card with the seal and a "What this opens" list.
- The Shinobi screen shows aptitude reads.

**2.6 Injuries and exhaustion.**

- Named injuries as content (`InjuryDef`: where it hurts, `ModifierSpec`, fight effect,
  days).
- Defeat, trump costs and Gates add injuries. The hospital shortens them; stamina speeds
  recovery.
- Chakra exhaustion carries into the next day.

### Phase 3: People with real grades (decision 15 retired)

**3.1 Real stats.**

- `PersonDef` gains `rank` and stats (authored).
- Generated genin store stats in `people.generated`.
- `companionStats` becomes a read of stored stats.
- Migration snapshots the old derivation.

**3.2 Peers grow.**

- Teammates and rivals grow by themselves, caught up lazily per day from
  `hashUnit(seed, day, id)` (no Rng, like the board).
- They also grow from training with you.

**3.3 Teacher profiles.**

- Teaching quirk, steering (whether they choose what to train, loosened by bond),
  `teaches` list, sessions per week by rank.
- **Price templates:** bond, ryo, mission, favour, or a combination, with flavour per
  teacher.

**3.4 "Train with".**

- A new action at training places, with the efficiency formula (grade gap capped at +2,
  rank teaching factor, quirk, condition).
- The training page shows who's here, what they could teach and their price.
- `lesson` folds into it, with the sensei as the special case.

**3.5 The Naruto pack's people.**

- Author the known Konoha shinobi (rank, grades, teaches, price, schedules).
- Record the totals as the village baseline.
- Size the original pack's Tōrōgakure from it (authored plus generated).

### Phase 4: Techniques and gear

**4.1 Technique ranks.**

- Ranks E–S. Learnability by grade gap (normal, unstable, impossible).
- The book tracks unstable techniques; they stabilise when your grade catches up.
- Hard requirements: nature, clan, reserves, control, weapon.
- Study speed = aptitude × control × source.
- Migrate stat requirements to ranks.

**4.2 Sources.**

- The academy holds E–D only.
- A new `library` place kind: C and some B, needs chūnin rank, with its own page.
- Clan techniques through clan people.
- Scroll items in the inventory, studied at home or in the library.
- Missions can reward scrolls.

**4.3 Gear.**

- Remove `statBonuses`.
- Weapons shape cards (cut, blows, throws) and are required for kenjutsu.
- Armour levels with a speed and dodge penalty, reduced by strength.
- Focus items boost a verb's scaling.
- Gear ranks D–A and shop access.
- Unique named weapons with their own verbs.
- Migration for owned and equipped gear.

**4.4 Content.**

- About 15 general techniques per discipline per pack (E 2, D 3, C 4, B 3, A 2, S 1),
  Naruto pack first, then original.
- Gear lists and named weapons.
- Add fan markers to `scripts/check-release.mjs` as needed.

### Phase 5: Engagement

**5.1 Encounter stages.**

- A mission stage kind `encounter`: recon actions, foe alertness, approaches (head-on,
  ambush, sneak past, talk / bribe / intimidate, set the ground, withdraw), results
  feeding `CombatSetup.opening`.
- Job-dependent reward rules.
- Templates (bandit camp, beast, lone rogue, guarded building).

**5.2 Around the encounter.**

- You can be ambushed.
- Mission roles: a check uses the best teammate.
- The sensei joins high-threat missions.

**5.3 Migration.**

- Existing combat stages become encounters via templates (or stay plain fights where
  that's the point).

### Phase 6: Ranks

**6.1 Exam framework.**

- `ExamDef`, a list of modular stage definitions.
- Calendar twice a year, announced through rumours and the sensei.
- Entry: nomination, record, team of three. A replacement teammate costs the bond and
  depends on the sensei's tolerance.

**6.2 First stages.**

- The mind test, survival (encounters) and the tournament (duels against generated
  rivals).
- Conduct scoring.

**6.3 Promotion.**

- A promotion scene, the rank change, the flak jacket, and the unlocks (library, mission
  ranks, teachers, solo missions).
- Jōnin by nomination.

### Not in this run

- The skill tree (after gating and teachers).
- Teaching juniors.
- Per-fighter ranges.
- Summons and spirits.
- Chakra-control world milestones (milestone 4).
- Aptitude changes.

### Run log

_(filled in during the run)_

### Decisions made during the run

_(filled in during the run, for review)_
