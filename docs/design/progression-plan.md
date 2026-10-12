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

### Village baseline

Recorded in step 3.5 from the Naruto pack's Konoha, set in Part 1 between graduation and the
Chūnin Exams (the Third Hokage leads; Team Guy is a year ahead of the player's class). The
Sannin, Shizune and Yamato are away in that era and Mizuki is gone on graduation night, so none
of them are in the village. "Best" is a person's highest stat, "specialty" their grade in it.

| Rank          | Konoha (authored)                              | Best stat   | Specialty             | Teacher profiles                    |
| ------------- | ---------------------------------------------- | ----------- | --------------------- | ----------------------------------- |
| Genin         | 12, plus 6 generated classmates and the player | D ×12       | D ×12                 | none (they teach by default)        |
| Chūnin        | 4                                              | C ×4        | C ×3 (Iruka has none) | 4                                   |
| Jōnin         | 18: 5 senseis, 7 without a team, 6 clan heads  | A ×12, B ×6 | A ×10, B ×8           | 18                                  |
| Legend (kage) | 1, the Hokage                                  | S           | none                  | none (never at the training ground) |
| Civilians     | 2                                              | E           | none                  | none                                |

So a village is roughly **one legend, about twenty jōnin, a handful of named chūnin and a
genin year or two of about a dozen authored plus the generated class**. Jōnin are two-thirds
A at their best, special jōnin and the less famous B; every jōnin teaches something. Chūnin
sit at C. The canon gives few named chūnin; the generated population is where the rank fills
out later (Phase 6).

**Tōrōgakure, sized from it.** Its clans are four to Konoha's eight, and its authored genin
six to twelve, so it has a smaller authored roster in the same shape:

| Rank          | Tōrōgakure (authored)                            | Best stat   | Specialty           | Teacher profiles |
| ------------- | ------------------------------------------------ | ----------- | ------------------- | ---------------- |
| Genin         | 6, plus 6 generated and the player               | D ×6        | D ×6                | none             |
| Chūnin        | 4: Rin and three more                            | C ×4        | C ×3 (Rin has none) | 3                |
| Jōnin         | 14: 5 senseis, 5 without a team, 4 clan heads    | A ×11, B ×3 | A ×8, B ×6          | 14               |
| Legend (kage) | 2: the Tōrokage and a retired legend who teaches | S ×2        | S ×1                | 1                |
| Civilians     | 1                                                | D           | none                | none             |

Unlike Konoha in its era, Tōrōgakure keeps one legend at home (Kōun, the Ash Lantern), so the
legend tier has a teacher in the original pack.

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

**Phase 0 (done).**

- 0.1: Classic is shelved; save v14 moves every save to `plan-v1`. A shelved engine
  still finishes a fight in progress (`GameContext.shelvedEngines`). The style picker
  hides when there is only one style.
- 0.2: The bench (`src/test/bench/`) and the pacing harness (`src/test/pacing/`) are in.
  Baseline measurements, the targets for Phase 1 and 2 to fix:
  - Equal fights take about 15–20 exchanges (target 4–8), and the player's default plan
    wins only 25–40% of them against the foe AI.
  - One grade apart, the stronger side always wins but takes about 12–13 exchanges. Two
    apart takes about 9 (target 1–2).
  - **Fighters who start hidden are never hit.** Hidden against hidden stalls 100% of the
    time. (Phase 1.4b/c: sense, field, search balance.)
  - The rusher and the powerhouse lose every fight to a trickster.
  - Growth: a focused stat goes D→C by day 3, A by day 12 and S by about day 22
    (target about 60 days to C-level readiness). Phase 2.

**Phase 1 (in progress).**

- 1.4a: techniques carry `effects: [{ verb, power, scaling? }]`. Verb profiles live in
  `rules/verbs/`. This was a behaviour-preserving refactor; the bench output was identical.
- 1.2: the player's plan is a priority list of `{ card, when?, target? }` slots, edited in a
  new plan editor. The player's equal-fight win rate rose from 25–40% to 43–57% before 1.1.
- 1.1: health is 100 (save v15 rescales stored health); `EnemyDef.healthScale`. Damage
  comes from the power/defence ratio (`rules/damage.ts`, `rules/defence.ts`), with ±8%
  variance. The bench lethality targets now hold: equals 6.4–6.5 exchanges; one grade
  apart, the stronger wins within a round 85–95% of the time; two apart, it's over in 2
  exchanges 82–88% of the time. The retune after merging with 1.2 traced long fights to
  kunai duels at mid range: footwork now closes in for full blows, and Dodge joins the
  default plan.
- 1.5/1.6: trump cards (`oncePerFight`, `afterCost` templates) and `CombatSetup.opening`
  (range, hidden, dazed, first mover) are in. Costs are journalled only, through
  `applyFightCosts`, until 2.6 applies them. Opening fields wait on 1.4c, and rows
  disruption on 1.3.
- 1.4b: verbs area, confuse, conceal, sense and break, with a technique for each in both
  packs (academy). Hiding has counterplay: a fighter with no one in sight searches instead
  of idling, an illusionist's attack may be traced back by the one it struck, and insight
  (or a sense) sees the hidden. The bench now asserts that a stalker is hit by every foe,
  that hidden against hidden never stalls (it stalled 100% before), and that knowing a
  sense wins more often against a stalker and a trickster.
- 1.3: rows. Each side has a front and a back row (`PlanFighter.row`, `CombatantView.row`,
  optional `CombatantSetup.row`). The rule lives once in `rules/rows.ts` (`canReach`, with an
  `area` flag that area techniques set); the plan engine asks it through `engines/plan/rows.ts`
  (`attackOf(card)`). Instinct targeting, the plan's slots and counters respect it; a
  screened fighter shows a "Screened" status. Fights saved before rows are placed on load
  (`withRows`); no save version change. The fight screen splits the foes into back and front
  rows and stamps your side's rows. The 1v1 bench is unchanged (a side of one stands in
  front). New group measurements (`benchSkirmish`): a C fighter with an archer behind them
  against two chūnin brutes wins 88% with 33% health left in rows, against 100% and 51% when
  everyone stands in one line: the front takes the blows. Two pack wolves and an archer: 100%
  won, 18.8 exchanges, no stalemates. Against a guardian and an archer the rows change
  nothing: the player goes for the front anyway, and the archer spends its turns in the
  shared range tug-of-war (per-fighter ranges are the real fix, later).

- 1.4c: verbs field, move and substitute, with techniques in both packs (academy): a mist
  (Hidden Mist now raises a field; Camouflage Concealment keeps a conceal in the fan pack),
  a body flicker and a substitution. `CombatSetup.opening.field` puts a field in place from
  exchange 1. The fight screen shows a field as a meter ("Your mist 3/4") and the fighters it
  blinds as "Blinded". Bench, a new mist blade archetype with and without its mist: against a
  rusher it wins 95–98% (65–83% without), against a powerhouse 38–57% (3–13%), and against
  a brute it ends with 57–65% health (28–48%). A fragile fighter with a substitution lasts
  2.8 exchanges against a brute instead of 1.5 (it still loses: time, not invulnerability).
- 1.4d: verbs empower, clone and trap (`rules/verbs/empower.ts`, `clones.ts`, `trap.ts`; the
  plan engine's `empower.ts`, `clones.ts`, `decoys.ts`, `traps.ts`, `prep.ts`), with a technique
  for each in both packs (academy). An empower raises its `boosts` stats for a few exchanges and
  takes `healthPerExchange` (eased by willpower) and/or an `afterCost` reported in
  `CombatOutcome.costs` per use. Clones stand beside their maker ("Clones ×N"), take
  single-target hits that reach the maker, burst all at once to an area hit, and solid ones
  (`strikes`) add a weak blow. A trap waits at the band it was set at ("Trap at … range").
  Bench (plain C against plain C, 43% won without): with Kindled Pulse 83% (5.7 exchanges),
  Lantern Shades 83% (7.6), Snare Ward 83% (7.2); against a plain B, each still 0%. The
  Naruto pack's Clone Jutsu is now a clone (it was a daze). No save version change.

- 1.7: team. Teammates fight by a **stance** (`CombatSetup` ally `stance`; `engines/plan/team.ts`):
  press, cover <someone>, support or hold, each shaping their default cards, which they now play
  as a priority list like the player's (foes keep the instinct AI). The **team mark** is set at
  the card table and the `marked` target rule is offered; pressing teammates aim at it. A cover
  may step in front of a single attack aimed at the one it covers (`rules/team.ts`). Generic
  combos: element pairs (`rules/elements.ts`: wind and fire, water and lightning, earth and
  water) when two fighters of one side hit one foe in an exchange, and a finisher bonus on a
  dazed or sealed foe. **Combination techniques** (`TechniqueDef.combo`), one pair per pack at
  the academy. **Control escalates with bonds** (`game/people/teamOrders.ts`): stances from a
  friend, cards from a close friend or once your sensei is a close friend. `CombatOutcome.used`
  reports each fighter's techniques and chakra spent. No save change (the new plan-state
  fields are optional). Team bench (`teamBench.test.ts`): a back row covered by a teammate ends
  with 80% health against 65% when the teammate presses; earth and water together end a fight
  in 3.3 exchanges against 3.8; a snare-and-anvil pair in 3.3 against 4.6 apart. The 1v1 bench
  moved only where dazes are involved (the finisher bonus, and no re-dazing a held foe): a
  versatile fighter now beats a trickster 90–100% (was 40–80%); a trickster now beats a rusher
  or a powerhouse a little more often.
- Phase 1 UI check (390px, real app, Playwright outside the project): fixed the fight
  view showing the exchange number as the round (cards and report), disabled cards not
  saying why on phones, unlabelled locked orders, tap targets under 40px, and a clipped
  target label. **Follow-ups noted:** a solo spar still offers the "back-row threat" and
  "team mark" targets; two foes with the same name can't be told apart; the read-only
  range strip looks like the range tabs; log dividers carry numbers ("End of round 1");
  the "⚔" on team notices; creation buttons and swatches under 40px.

**Phase 2 (in progress).**

- 2.3: `reserves` ("Chakra Reserves", body group) is a stat. Max chakra is 30 + 3.5 per point
  of reserves + 1 per point of control; stamina no longer feeds it. Reserves grow with half of
  every stamina gain (`withReserves` inside `applyTraining`) and with chakra paid in fights
  (Plan & Watch reports the player's `CombatOutcome.chakraSpent`; 0.02 base gain a point,
  `game/fightGrowth.ts`). Save v16 seeds reserves from the old maximum (within one point).
  An enemy's reserves are read back from its authored `maxChakra`.
- 2.6: named injuries are content (`InjuryDef` in `content/injuries.ts`; twelve shared ones
  in `content/shared/injuries.ts`, validated), with the rules in a new `systems/injuries`.
  `character.injuries` and `character.exhaustion` (save v17). Injuries add their
  `ModifierSpec` to `characterModifiers` and their per-stat fight multipliers (and a trump's
  strain) to `combatStats`; they heal on the morning of `until` (`spendTime`), with a journal
  line. Sources go through `game/wounds.ts`: a real defeat (`game/fightToll.ts`) picks a
  `defeat` injury weighted by the share of foe health still standing and names it on the
  defeat card; `applyFightCosts` now pays trump costs (hospital days: a bed-rest `collapse`
  injury; exhaustion days; a stat injury: the matching `strain` injury plus the flat amount
  off that stat in fights; permanent: the stat drops); ending any fight under 10% chakra
  leaves one night of exhaustion (sleep refills half). Stamina takes 1% a point off a new
  injury's days (at most half). The hospital treats injuries even at full health: 25 ryo
  each on top of the fee, halving the days left, once per injury. The Shinobi screen has a
  Condition section; the hospital lists your injuries.
- 2.1/2.2: aptitude and growth. `character.aptitude` (a hidden multiplier per stat, 0 to 1.8),
  `aptitudeKnown` (unknown, sense, known) and `aptitudeSessions` (save v18 derives aptitude
  from the clan's and talent's growth multipliers, nothing known). New characters roll it from
  the break-in dice (`game/aptitude.ts`): a clan's `arts` (new `ClanDef` field, both packs)
  1.1–1.4, its other stats 0.75–1.2; the clanless 0.6–1.35 with 8% prodigies (1.4–1.8), 10%
  holes (0.25–0.55) and a 12% chance of one void art (0). A talent's raised stats never roll
  under 1; clan and talent growth multipliers tilt the roll and no longer act as modifiers.
  Growth (`systems/stats/growth.ts`, through `game/growth.ts` for every source) is base ×
  `SESSION_PACE` (0.09) × solo efficiency by grade (E 1, D 0.4, C 0.1, B 0.03, A 0.01, S
  0.003) × aptitude × modifiers, and × 3 for the sensei's lesson. Stats are stored to three
  decimals. The Tireless trait (`soloEfficiencyFloor`) keeps 0.4 through B in strength, speed,
  stamina and taijutsu. Three sessions in a stat give a rough read (a journal line); a void
  art shows itself on the first try and then refuses its drills and scrolls. The Shinobi screen
  shows each stat's read in words. Pacing (an ordinary talent, taijutsu specialist): taijutsu
  reaches C on day 61 (was day 3), and a further month alone adds about one point of the C
  band's seven.
- 2.4/2.5: fights teach, and grade-ups are a moment. The teacher rule is
  `systems/stats/teaching.ts` (`teacherGap`, `teacherEfficiency`; solo efficiency moved to
  `solo.ts`): the share a session keeps is your solo efficiency × 1.25 with an equal, × 1.6 one
  grade up and × 2 two up (three counts as two), but never less than 0.35 one up or 0.6 two up;
  someone below you gives a tenth of a solo session. `Growth.teachers` (their value per stat)
  switches a stat to it, and `growCharacter` takes a `Session` (`teacher` multiplier for the
  lesson, `teachers` for fights; Phase 3's "train with" passes its teacher here). After every
  fight, missions and spars alike (`game/fightGrowth.ts`, read before the result is applied),
  each art used grows by 1.5 base × `FIGHT_SCALE` (0.3) against the foes' best value in it: a
  technique's discipline, and plain strikes as taijutsu. Strikes also work strength, steps
  speed, and losing a tenth of your health stamina (0.5 base each, same rule). The plan engine
  now counts `blows` and `footwork` in `CombatUsage`. Spars no longer have their own growth.
  The journal line is "What the fight taught you", and the same gains are listed on the
  fight's, defeat's or spar's card. Grade-ups are found once per action in `dispatch`
  (`noteGradeUps`), whatever grew the stat: a `grade` report card stamped with the letter in
  its colour and a "What this opens" list (academy techniques whose requirements the new
  stats meet and the old didn't), plus a journal line. The stat sheet rolls a grown number up
  and brushes an ink stroke over the stretch gained since it was last shown (off under
  reduced motion). Stat values are cut to one decimal, not rounded, so 7.98 no longer reads
  "8.0 E". The discipline tiles now show their talent read too. No save change.

**Phase 3 (in progress).**

- 3.1/3.2: people have real stats; peers grow. `PersonDef` has a `rank` (`PersonRank`: the
  standing ranks without `academy`, plus `civilian`), `stats` (authored with the new
  `statLine(base, marks)` helper: a grade or exact value for everything, then exceptions) and an
  optional `aptitude` (`talent(base, marks)`). Every person in both packs has them: senseis are
  jōnin, A in their specialty (Ito and Anko B), the instructors chūnin C, the leaders kage
  (A–S), villagers civilians, genin E–D (the original pack's genin sit on the old 5/9/6 line).
  `validateRanks` checks role against rank, the best stat against the rank's band and a
  sensei's specialty at B–A. Generated genin get a graduate's line (5, +4 specialty, +1 body,
  each stat ±1) and a clanless aptitude from `createRng(hashString(seed|id))`, so the game's
  dice are untouched. `companionStats` is gone: fights and scouting read `personStats` (the
  stored stats, else the `PersonDef`'s). Genin grow every day (`game/people/regimen.ts`: four
  sessions of specialty, its support stat and one body stat, a day off in about seven) through
  `applyTraining` with their aptitude and traits; teammates also get the sensei's weekly lesson
  (× 3, the sensei's specialty) on their own weekday. `peopleGrown` catches up every ended day
  on each new day (`spendTime`), into `people.progress` (stats plus `lastGrownDay`); a spar
  trains the partner with the same gains as you. Save v19 snapshots the old derivation at the
  save's mission record for every genin (authored ones into `progress`), and gives generated
  ones a rank and talent. Pacing: over a month, the focused player's fighting power goes 6.6 to
  8.7 and taijutsu 8 to 11.5; teammates go about 7.2 to 9.5, their specialty about +3.5
  (asserted: more than 1.5, and within 25% of the player's fighting power).
- 3.3/3.4: teachers and "train with". `PersonDef.teacher` (`TeacherProfile`, `content/teachers.ts`):
  a `quirk` (patient 1.1, harsh 1.2 with half the bond, natural 1.3, distracted 0.8), optional
  `steers` (`focus` specialty or weakest, `freeAtStage`), `teaches` (moved from
  `SenseiProfile`), optional `sessionsPerWeek` (by rank: genin 7, chūnin 2, jōnin and kage 1) and
  a `price` (`PriceTemplate`: bond stage, ryo a session, a mission finished once, a favour, or
  `all` of distinct kinds; each with the teacher's own `line`). A favour is done by a
  conversation reply carrying its id (`ConversationChoice.favour`). `validateTeachers` checks
  techniques, missions, favours both ways, stages, sessions and that every sensei has a profile;
  every sensei in both packs has one (one of each price kind per pack). `trainWith { personId,
statId }` (`game/actions/trainWith.ts`): at a training place, anyone ranked shinobi who is
  there offers the stats they are ahead of you in (by value; reserves excepted); a session is
  `sessionGains` (1.5 in the stat, plus 0.6 in an art's support stat) through `growCharacter`
  with their values as `teachers` (the 2.4 grade-gap rule) and `teacher` = rank factor (genin
  0.6, chūnin 0.85, jōnin 1, kage 1.2) × quirk (`game/people/teachingFactor.ts`); aptitude and
  condition come from `growthFor` as for any session. 30 energy, two slots, +3 bond (+6 with your
  sensei; a harsh teacher half), ryo paid; a genin practises the same gains (`trainPerson`).
  Sessions are counted per teacher per calendar week (`people.taught`, `weekOf`), one a day.
  Profile-less shinobi ask a bond stage by rank above yours (same rank 1, +1 2, +2 3, +3 4). The
  `lesson` action is gone: your sensei is a teacher with no price, once a week, who comes to the
  training ground for you by day, and whose session keeps the lesson report card; teammates'
  weekly lessons use the same rule against the sensei's stats (`LESSON_TEACHER` is gone). The
  training page's "Train with someone here" lists who's present (sensei first, then by teaching
  factor; three shown, the rest folded): manner, price slip with met/not-yet stamps, a tile per
  stat with their grade over yours, the one shared reason when something stops every tile, and
  the stats they won't teach yet folded with why. Save v20 turns `team.lastLessonDay` into the
  sensei's `people.taught` entry and adds `people.favours` and `board.completed` (jobs finished at
  least once, recorded from now on). Pacing: the focused player trains with the sensei whenever
  it's on offer and with any genin ahead in their focus; taijutsu reaches C on day 59 (drilling
  alone, day 73). The window is now 60 ± 10, and a new assertion holds the teacher run at least
  seven days ahead of the solo one.
- 3.5: the village's people. The Naruto pack gains seven jōnin without a team (Ibiki, Genma,
  Raidō, Aoba, Hayate, Yūgao, Ebisu; `naruto/jonin.ts`), six clan heads (Hiashi, Inoichi,
  Shikaku, Chōza, Tsume, Shibi; `naruto/clanHeads.ts`) and three chūnin (Izumo, Kotetsu, Hana;
  `naruto/chunin.ts`), each with rank, stats, schedule, bio and a teacher profile (quirk, price,
  `teaches`); Iruka gets a profile too and stays late at the training ground at night. Five new
  signature techniques (`naruto/rosterTechniques.ts`) and the favours Ibiki and Shikaku ask
  (`naruto/rosterConversations.ts`). The original pack is sized from the baseline (see "Village
  baseline"): five jōnin and a retired legend (`original/jonin.ts`), four clan heads
  (`original/clanHeads.ts`), three chūnin (`original/chunin.ts`), three techniques and two
  favours. A new `PersonRole`, `shinobi` (chūnin, jōnin or kage with no post the game models);
  clan heads are `leader`s. A teacher's clan techniques go only to members of that clan
  (`nextSignature`), and `validateTeachers` now checks that a teacher who isn't a sensei comes to
  a training place at some hour and teaches only their own clan's techniques. Release markers
  add Ibiki, Hiashi and Shikaku. No save change.

**Phase 4 (in progress).**

- 4.1: technique ranks. `TechniqueDef.rank` (E–S) replaces the raw stat `requirements`, which are
  gone (and `unmetRequirements` with them); hard needs are `needs: { nature?, minReserves?,
control? }` (`clan` stays its own field). The rules live in `systems/techniques/learning.ts`
  and `techniques.ts`: at or below your grade in the discipline learns normally, one above at
  `UNSTABLE_STUDY` (0.5) and arrives unstable, two or more above is impossible from any source
  ("Needs D ninjutsu; you're E."). Study speed (`sessionStudyPoints`, through
  `game/learning.ts`) is the old study points × aptitude in the art × a chakra-control factor
  (chakra arts only) × the source (scroll 1, teacher 1.5; the old lesson boost) × identity
  modifiers. The sensei's signatures pass the same gate. `TechniqueBook.unstable` (save v20
  marks known techniques ranked above the character's grade). In fights an unstable technique
  costs ×1.5 chakra (`rules/unstable.ts`, read by `chakraCost`, so every engine) and misfires
  25% of the time in Plan & Watch (chakra spent, nothing done). Every action passes through
  `stabiliseTechniques` in `dispatch`, which steadies those your grade has caught up with, with a
  journal line. Validation: ranks and needs are sane, starting techniques are rank E with no
  needs, and every discipline has such a scroll at the academy. The academy folds blocked
  scrolls into Coming up with the reason; technique cards carry a rank stamp and an Unstable
  stamp. Bench (`unstableBench.test.ts`, plain D against plain D, 120 seeds): Ember Breath wins
  88% steady and 68% unstable; Kindled Pulse 50% and 36%.

- 4.3: gear. `GearDef` is a union by `kind` (weapon with a `shape`: blade, knuckles, throwing,
  senbon; armour with a `level`: light, flak, heavy, plate; focus with `boosts` a verb or a
  discipline), with a `rank` D–A and `unique` for named weapons; `statBonuses` is gone. Slots are
  weapon (held), thrown, body and charm. Equipped gear reaches the fight as `CombatantSetup.gear`
  (`systems/combat/gearContract.ts`); the rules are `rules/weapons.ts` (cut driven by kenjutsu,
  knuckles' power and guard pierce, throwing steel, senbon with a perception-driven daze; unique
  verbs drain, daze, sunder), `rules/armour.ts` (the `armoured` kit rule by level, and a speed cost
  strength carries away) and `rules/focus.ts` (drive ×1.12, +0.06 a rank, inside `driveOf`).
  Blade arts need a blade in hand (`needs.weapon`), to study and to play (a disabled reason at
  the card table). A starting technique may need a weapon (the academy issues the blade). Shops show kind, a rank
  stamp and chips from the same rule numbers; B-rank needs chūnin. Two unique weapons per pack,
  unsold. Save v22 (after 3.3's v20 and 4.1's v21) moves worn pieces to their new slots and issues a blade to a character who
  knows a blade art and owns none (new genin get one at creation too). Gear bench
  (`gearBench.test.ts`, chūnin plain against equals): win rate in no armour 43%, flak 65%, heavy
  85%, plate 93%; against an archer 43% bare, 3% in plate; with strength 30, 98% either way. A
  kenjutsu-peak fighter wins 0% bare-handed, 80% with a D blade. The 1v1 bench is unchanged.

- 4.2: sources. The academy holds rank E–D only and no clan techniques; a new `library` place
  kind (`techniqueIds`, rank C–B, no clan techniques; both validated in `validateSources`) is
  open to chūnin and above ("The restricted stacks are for chūnin and above.") and studied at a
  new source quality, `library` 1.1 (scroll 1, teacher 1.5). Each pack's start location has one
  (the Village Archives, the Lantern Archive) with hours; its page shows a lattice with the
  reason while you're shut out, then a bay of shelves per art with what you're reading on the
  desk (`game/shelves.ts`, `views/library.ts`, `LibraryPage`). Clan techniques come from clan
  people through 3.3's `teacher.teaches` (3.5's clan heads, plus Sasuke and Naruto for the
  clans without a head, and Akari and Yomi for the clan trumps); `TeacherProfile.quirk` and
  `price` became optional so a teacher can be just a `teaches` list. Scroll items:
  `inventory.scrolls` (technique id → true), read with `studyScroll { techniqueId }` at home or
  in a library you may use, at the scroll's pace and by the same gate (`studyFrom` is shared with
  `study`); the home page has a reading desk and a "Read scrolls" hotspot when you own unread
  ones. Missions hand over `reward.scrollId` and `reward.gearId` once (`game/missionRewards.ts`),
  shown as chips and on the debrief. The general C techniques moved to the library; Gate of
  Opening and Kindled Pulse (the taijutsu trumps) are scroll rewards only, from the hardest team
  job, which also hands over a named weapon (Samehada, the Hungry Lantern); two more C scrolls per
  pack ride on mid-rank jobs. Every technique needs a source (shelf, teacher, scroll reward or
  starting kit; validated). Grade-up "What this opens" now includes the library once you may use
  it and your own scrolls. Save v23 adds the empty scroll case.
- 4.4 (content): both packs now meet the per-discipline target (E 2, D 3, C 4, B 3, A 2,
  S 1; ninjutsu D is over because no existing technique was removed). The original pack
  gained 44 techniques and the fan pack 54, all with sources. Every S technique is a trump
  card. The fan pack also gained five elite missions (to rank B) handing out rare scrolls
  and named weapons; the original pack gained one late team job and two unique weapons.
  **Follow-up:** the default plan rarely slots seal, confuse or trump cards, so those
  techniques barely show on a bench. They are strong when a player slots them by hand;
  the default plan or the foe AI should learn to use them. Several elite missions are
  untested in play.
  **Phase 5 (in progress).**

- 5.1/5.3: encounter stages. `MissionStage` has an `encounter` kind (`systems/missions/encounter.ts`):
  a template id, foes, `canFlee`, a `job` (escort, deliver, eliminate, retrieve, patrol) and
  optional `approaches`, `talkable`, `bypassable` and `flavour` overrides. Five shared templates
  (`content/shared/encounters.ts`: bandit camp, beast, lone rogue, guarded building, spirit) say
  which approaches and recon make sense, base alertness (unaware, wary, alert), the foes'
  `resolve` and the flavour lines; `ContentPack.encounters`, validated (`validateEncounters.ts`).
  Reaching the stage, "Size them up" opens the encounter scene (`activeScene` 'encounter', state
  on `MissionRun.encounter`). Recon (`game/encounter/recon.ts`), at most three looks: observe
  and track (perception; on team jobs the best teammate's, `bestHandFor` in
  `game/missionRoles.ts`, which 5.2 reuses), sense (the better of perception and ninjutsu; needs
  an awakened bloodline, which makes it certain, a sense technique, or ninjutsu 10), ask around
  (15 ryo, certain; the client's report counts as done). Success reveals facts (count, identity,
  kit, terrain, awareness); failure raises alertness a step. Approaches
  (`approaches.ts`, played in `resolve.ts`, openings in `opening.ts`): head-on (alert foes move
  first), ambush (only when they are unaware and you know it: every foe dazed in exchange 1,
  your side first, at a range you pick), sneak past (speed, or genjutsu with a conceal or field
  technique, +3 with a smoke bomb, which it uses up, against their best perception plus
  alertness; caught: they move first), talk (willpower plus reputation / 10 against resolve,
  alertness and numbers; a failure stirs them and can't be retried), pay them off (40 ryo a foe;
  not when alert), frighten them off (willpower plus your fighting-power edge against their
  nerve; failure is a fight they start), set the ground (fūinjutsu or intellect; needs a field
  or trap technique or a smoke bomb: your field or smoke in place, or the first foe snared, you
  first at your range; not when alert), withdraw (the job fails, unhurt, −1 reputation instead
  of −2). Pay by job lives in `encounterPay.ts` (`MissionRun.pay` multiplies the reward).
  Converted: every combat stage in the original pack, and all but the fan pack's missing-nin
  (who steps out of the mist to confront the team: a surprise attack stays a plain fight). No
  save change: the new run fields are optional, and a save mid-mission at a former fight steps
  into its encounter (tested).
- 5.2: around the encounter. Being ambushed (`game/encounter/spotted.ts`): on arrival, and again
  after every failed recon, the foes look round: their best perception plus alertness against
  your lookout's (`bestHandFor` perception, so a sharp-eyed teammate keeps watch) plus a
  `SPOT_HEADSTART` of 8. Spotted, the encounter becomes a fight at once (`SPOTTED_OPENING`: they
  move first and you are dazed through exchange 1), opening on the template's new `spotted`
  line. Mission roles: `CheckApproach.role` (tracker, sensor, medic; validated to be on team
  missions only) hands a check to the best teammate in its stat (`checkHand`); the choice line
  names them. A medic (the teammate with the most chakra control, at least 8) heals you by their
  control between stages (`afterStage`, which replaced `completeIfFinished`). The sensei leads
  serious team jobs (C-rank and up, or a far-stronger foe on the notice): a fourth ally with
  their real stats, their specialty's techniques plus their signatures and nature, the
  specialty stance, and both orders locked. Sneaking as a team goes at the slowest speed among
  teammates who won't take your orders (those who will hang back). Team mission narratives and
  checks in both packs reworded to use roles and the sensei. No save change.

### Decisions made during the run

- 0.1: shelved engines live in a separate `shelvedEngines` list, not in `engines`
  (otherwise they'd stay on offer). Deck isn't routable, since its fights were already
  called off at v13.
- 0.2: "chūnin readiness" is measured, for now, as the focused stat reaching grade C. The
  scripted player goes to hospital below 40% health, because missions refuse anyone under
  that.
- 1.4a: power lives on each effect, not the technique. A technique has one landing check;
  a dodged damage effect stops the foe-aimed effects after it.
- 1.2: the default plan has no "finisher when dazed" (it was dead with the old daze
  timing); it uses the daze to spoil a telegraphed jutsu. The `marked` target is reserved
  but hidden until the team mark exists.
- 1.1: toughness is pure stamina, so a low-stamina versatile build is fragile against
  equals head-on (its "built around" path is for later verbs). Explosive tags are fixed at
  40 damage, ignoring the gap.
- 1.1 retune: **a daze now leaves the target open** (no defences, a finisher target)
  until the end of the following exchange, so set-up and payoff works one-on-one.
- 1.4b: an area technique hits every foe standing, hidden ones included (it needs no aim);
  each foe sees it coming, dodges and guards on their own. Self-aimed effects in it happen
  once.
- 1.4b: a sense reveals each hidden foe with a chance (its drive and power against their
  concealment, floor 40%) and grants **insight** for the rest of the fight. Insight now
  lets its holder aim at hidden foes in Plan & Watch (it already made Search certain);
  this also applies to the insight perk from bloodlines.
- 1.4b: a conceal sets a `concealment` on the fighter; Search and sense are measured
  against it (else against genjutsu, as before). Conceal has no instant check against
  foes' perception: the contest is every Search.
- 1.4b: break ignores a guard entirely, 15% of toughness (the gap formula is steep, so
  that is about half again as hard a hit) and half of what armour or a spirit's form
  shrugs off. Its drive is strength alone.
- 1.4b: confuse lasts 1–3 turns from power and the user's genjutsu against the target's
  `breakRating` (chakra control first).
- 1.4b: an illusionist is no longer untouchable while attacking: the fighter it struck
  may trace it back (Search odds). A master illusionist still usually wins before being
  found matters, which is power, not a bug.
- 1.3: kit placement: archers, illusionists and healers (more heals than attacks) at the
  back; brawlers and the armoured always in front; everyone else in front. A setup's `row`
  wins, but a side with no one in front all stands in front. "Up close" means an attack
  whose reach is close range only (blows, counters, taijutsu); a kenjutsu technique that also
  reaches mid can hit the back row. Rows are fixed for the fight; when the front falls the
  back is simply exposed (nobody steps up). The `threat` target rule is now "threatening our
  back row": a foe whose telegraphed attack can reach someone in our back row; with no one
  there, any foe about to attack.
- Accepted: the player's equal-fight win rate at grade E is 35% (43% at D–A). Parity
  isn't a goal; a better foe sense of tempo can come later.
- 1.5: the new trump techniques sit at the academy as a placeholder (grade B
  requirements); 4.2 moves them to teachers and scrolls. Once-per-fight applies to foes
  too.
- 1.4c: fields are `mist` and `smoke` (`FIELD_RULES` in `rules/verbs/field.ts`). A field
  belongs to the side that raised it and blinds everyone else whose perception is at or below
  its potency (the caster's art plus a fifth of its power) and who doesn't read foes (insight
  or a sense). The blinded: attacks go wide (mist 30%, smoke 40%), perception halved for
  dodging, seeing techniques coming and searching. In mist the owning side strikes the blinded
  as if from hiding; smoke gives no cover. One field at a time; a new one replaces the old.
- 1.4c: a move goes to the distance it names, else the user's home band; it is uncontested
  and its power only ranks it. The default plan uses a move instead of a step as footwork, and
  a field before footwork (it sets the ground, then stays out of the way while it holds).
- 1.4c: a substitution works **once a round**, not once an exchange: with one foe striking
  about once an exchange, once an exchange made its owner untouchable (100% health left
  against every foe in the bench) until their chakra ran out. It reacts after a Dodge has had
  its chance, costs its chakra each time, and never swaps out of a genjutsu. It is certain; its
  profile has no driving stats.
- 1.4d: empower and clone durations and counts read `maxChakra` until reserves exist (2.x).
  An empower holds `1 + maxChakra / 50` exchanges (at most 4) after the one it is used in;
  boosts are a share of the user's own stat (power and art), so the gap maths keeps grades
  apart. Its health price never takes the user below 1. Its `afterCost` is on the effect, not
  the technique, so it needs no `oncePerFight`; each use owes it again ("overusing
  empowerment").
- 1.4d: clones are a count on their maker rather than fighters of their own: they stand in the
  maker's row, so a hit only meets them once it has reached the maker past the rows (and a
  solid clone's blow obeys the rows like a strike or kunai). The odds a hit takes a clone are
  `n / (n + 2)`, shifted by the maker's art against the attacker's perception, halved by
  insight, at most 70%. Counters, traps and every single-target hit can be taken by a clone.
- 1.4d: a trap springs on a foe's turn start (from the exchange after it was set) or as soon as
  a foe's step moves the fight into its band; only foes of the setter spring it, and a foe whose
  perception beats the setter's craft may spot and disarm it (25% between equals). Its bite is
  `techniqueDamage` (fūinjutsu and intellect against toughness), can't be dodged, can be
  guarded; a daze sprung at turn start costs that turn. One trap per fighter.
- 1.4d: foes and allies reach for an empower or clones when a foe is in sight and they can
  attack from here, and set a trap to open a round; the player's plan passes over all three
  while one holds (or, for empower and clones, with no foe in sight). The default plan slots
  them ahead of attacks. In short fights the turn spent can cost more than it gives (a rusher
  with Kindled Pulse wins less against a brute at genin and chūnin scale); accepted, it's the
  trade.
- 1.4d (merged with 1.4c): a blow meets its target's clones first, then a Dodge, then a
  substitution. Both clones and a substitution are decoys, but a clone is a chance per hit
  that runs out, a substitution a certainty once a round paid in chakra.
- 1.7: allies play their cards as a priority list (as the player does), so a stance and an
  edited card mean exactly what they say; foes keep the instinct AI. With no stance given, an
  illusionist supports and anyone else presses.
- 1.7: the team mark is always available once there is a team or more than one foe; it is a
  target the player calls, not an order a teammate can refuse. Pressing teammates aim at it.
  The improvised blow (no slot qualifies) also goes for the mark.
- 1.7: "press" closes in to close range only when the fighter's wounding jutsu still reach
  there (a ninjutsu caster keeps its distance).
- 1.7: a daze, seal or confusion from a slot looks for a foe not already held; the finisher
  bonus (×1.25) applies to technique damage on a dazed (open) or sealed foe.
- 1.7: a combination technique fires both halves at the same foe, each ×1.4; the partner pays
  their own chakra and loses their next turn. A half nobody on your side could join is left
  out of default plans. Teammates know the half in their specialty (no clan); the packs' pairs
  are fūinjutsu and kenjutsu (original: Shrine Snare and Anvil Fall) and ninjutsu and
  kenjutsu (fan pack: Gale Palm and Rising Twin Dragons).
- 1.7: control thresholds: a teammate at Friend takes stances; at Close friend, or with the
  sensei at Close friend ("sees you as the leader"), they let you edit their cards too. Default
  stances by specialty: taijutsu and ninjutsu press, kenjutsu covers you, genjutsu and
  fūinjutsu support. Edits to a teammate's cards last for the fight only, and a new stance
  rebuilds their cards.
- 2.3: reserves are not a combat attribute or a technique scaling stat (`ScalingStat`
  excludes them): they size the chakra pool, which reaches the fight as `maxChakra`. Clone
  counts and empower duration can add them to `CombatAttributes` when those verbs need them.
  They are left out of `fightingPower` (an enemy's chakra is authored apart from its stats),
  but sharp-eyed scouting lists them like any other standout stat. No drill may grant them
  (validated). The "Huge chakra reserves" talent now gives reserves +4 instead of stamina +3,
  and the fan pack's sealing clan trades one stamina for reserves +3.
- 2.6: injuries last until the morning of `until` (`until = today + days`), and exhaustion
  spoils every sleep begun before its `until`, so "one day" of either means tonight. A spar
  never injures (nobody is really hurt), but ending one drained still exhausts. A bed-rest
  injury blocks training, lessons, sparring and jobs like starving does. The trump's stat
  `amount` is kept on the injury as a flat strain in fights, besides the injury's own
  multipliers. Treatment can be repeated for health, but each injury is set only once (a
  `treated` flag on it), so ryo can't erase injuries. `exhaustion` is `null` when rested
  rather than absent.
- 2.1: clan and talent growth multipliers moved into aptitude (they tilt the roll and the
  v18 migration copies them), so they aren't counted twice; traits, academy grades, meals,
  hunger and injuries stay modifiers. Traits don't tilt aptitude: they are temperament, which
  already acts on every session.
- 2.1: aptitude is rolled from the break-in dice after the roll, and the game continues from
  the dice after aptitude (the scene and the game still agree on the break-in).
- 2.2: within a grade, efficiency holds the grade's value for the lower 60% of the band and
  eases geometrically to the next grade's over the top 40%, so a boundary is no cliff. A
  hard-work floor holds through its grade and stops at the next (a drop, not an exploit).
- 2.2: a drill belongs to its largest gain; a void art blocks only drills it heads (a void
  taijutsu still lets Kicking Posts grow strength until it is known; then it is refused). A
  void art is revealed by the first session or scroll in it, which grows nothing in it.
- 2.2: every growth source goes through the new formula: drills, lessons (× 3), spars (until
  2.4), night sights and fight reserves. Drill previews assume an ordinary aptitude where
  none has been read, so they don't give talent away.
- 2.2: the 60-day target holds now, mostly by drilling: the weekly lesson adds little. So the
  stall is in C (asserted), not D; "solo stalls in D" waits for Phase 3 teachers.
- 2.4: thrown kunai teach no art (they are a tool; throwing weapons may map to an art once gear
  shapes the throw card). Kenjutsu is learned through kenjutsu techniques until a blade turns
  Strike into a cut (Phase 4).
- 2.4: each art used counts once per fight, however often it was used; the body counts if
  the work was done at all (one strike, one step, a tenth of your health lost). The teacher is
  the foe with the best value in that stat, so a group with one strong fighter teaches like
  that fighter. Teammates' grades don't teach in a fight.
- 2.4: fights teach win, lose or yield; spars use the partner's derived stats as the foe (an
  even match, so a spar teaches like a fight with an equal). Reserves from chakra spent stay
  solo practice (no teacher, no fight scale).
- 2.4: an equal teacher multiplies solo efficiency rather than replacing it, and better
  teachers set a floor, so at E (where solo is already 1) a better partner still helps.
- 2.5: grade-ups are noted in `dispatch` rather than in each growth path, so every source
  (drills, lessons, fights, sights, future ones) fires one card per stat per action, and
  reserves rising with stamina in a fight can't fire twice. A grade falling (a permanent
  trump cost) shows nothing. "What this opens" lists only academy techniques newly within
  reach, on the first card when several stats cross at once; teachers and the tree join the
  list when they exist.
- 2.5: the tick plays on the Shinobi screen for whatever grew since it was last shown in this
  session (remembered in the UI only); the first visit after loading plays nothing.
- 3.1: villagers have a `civilian` rank rather than none; a leader may be jōnin or kage, an
  instructor chūnin or jōnin. A grade in `statLine` stands for a typical value in its band (E 5,
  D 10, C 16, B 23, A 32, S 44). Authored people without an `aptitude` roll one from their id
  with their clan's odds, the same in every save.
- 3.1: generated genin's stats and talent come from a hash-seeded Rng (seed and id), not the
  game's dice, so the class, the scenes and every later roll stay as they were.
- 3.2: only genin grow (adults stay as written). Someone with no `progress` entry starts
  growing from the next day; nobody grows for days before the save knew them. Catch-up is
  capped at 60 days. A teammate's weekly lesson is in the sensei's specialty (as yours is), not
  their own. Rivals are not a separate kind: a classmate with a better aptitude simply pulls
  ahead (asserted in `peerGrowth.test.ts`).
- 3.2: the support stat per discipline and the lesson's gains moved from `actions/lesson.ts` to
  `people/regimen.ts`, shared by your lesson and your teammates'.
- 3.3: a profile's `price` is waived for your own sensei, not optional; a teacher with no profile
  uses defaults (no quirk, no steering, sessions and a bond price by rank). Civilians never teach.
- 3.3: a favour is a flag set by a conversation reply; the pack's person-specific conversations
  come first, so the ask comes up the first time you talk. "Bring an item" waits for items that
  can be given.
- 3.3: no record of finished jobs existed, so `board.completed` starts empty on old saves: a
  mission price counts jobs finished from v20 on.
- 3.4: "ahead of you" is by value, not grade (an equal-grade teacher a little ahead gives the
  1.25 × solo of the rule). A steering teacher picks their specialty when they're ahead in it,
  else (or with `focus: 'weakest'`) your lowest stat among those they're ahead in, skipping a
  known void art.
- 3.4: your sensei makes time for you: they count as at the training ground whenever they are in
  the village from morning to evening, so a sensei whose schedule never passes the ground (Yomi,
  Ito, Asuma) can still give the weekly lesson. Others must actually be there.
- 3.4: weekly allowances use calendar weeks (days 1–7, 8–14…), not seven days since the last
  session, so "Your next lesson is in N days" counts to the week's turn.
- 3.4: a session is two slots and 30 energy, like the lesson was; the support-stat gain uses the
  teacher's value there too, so a specialist who is weaker in it teaches it almost nothing.
- 3.5: the era is Part 1 before the Chūnin Exams, matching the pack's senseis and genin: no
  Sannin, Shizune or Yamato (away), no Mizuki (gone on graduation night), Hayate alive. The
  Hokage has no teacher profile and keeps to the mission desk; the legend tier is taught in the
  original pack only, by a retired legend.
- 3.5: people with a rank but no post (examiners, guards, ANBU, gate chūnin) get a new role,
  `shinobi`, rather than `sensei` (which would offer them at team assignment) or `instructor`.
  Clan heads are `leader`s; Shikaku is titled Jōnin Commander but is a jōnin (S is kage-only).
- 3.5: clan heads teach their clan's techniques, but signatures were taught to anyone; a clan's
  techniques now go only to its members (an outsider can still train stats with the head). This
  is the "Clan: the clan's people" source from D2.
- 3.5: a teacher must be reachable to count as "learnable in principle": validation asks every
  non-sensei teacher to be at a training place in some slot (senseis come to their own team).
  New teachers' schedules each pass the training ground once, spread over the slots.
- 3.5: Rin (original) has no teacher profile, as before: her schedule never reaches the training
  ground and the tavern's regulars depend on it. Iruka's does (his night slot), since Konoha's
  academy instructor was the obvious first teacher.
- 4.1: ranks came from the old requirement in the art (5 or less E, 6–10 D, 11–14 C) with
  judgement for the rest: trumps A or S, sensei signatures D–C (Lightning Blade A, Front Lotus
  B). Physical needs kept: medical and the fine water jutsu need D control, the clone techniques
  8 reserves, Lightning Blade a lightning nature. Other old minor stat requirements (strength,
  speed, willpower) were dropped. No `weapon` need yet: gear kinds arrive with 4.3.
- 4.1: unstable means "rank above your grade", for migration and new learning alike, so the
  v20 migration marks known techniques a rank above too (not only two or more above). A
  stabilised technique stays stable even if a stat later drops.
- 4.1: chakra control's study factor (0.75 + 0.02 a point, at most 1.5) applies to ninjutsu,
  genjutsu and fūinjutsu only; taijutsu and kenjutsu study ignores it. The misfire chance is
  flat (25%), not scaled by control.
- 4.1: stabilisation runs after every action in `dispatch`, beside 2.5's `noteGradeUps`. A sensei teaches the first signature you could learn; the
  lesson card shows the next blocked one with its reason.
- 4.3: no gear shop has a keeper person, so B-rank access is by rank only (chūnin and up);
  the smith's favour waits for a keeper person. A-rank gear is unique only (validated). The
  flak vest is rank B, so it is sold to chūnin (and 6.3 hands it over at promotion).
- 4.3: gear quality is its rank (D 0 … A 3 steps); each rule grows by the step, no per-item
  numbers. Weapon needs are `TechniqueNeeds.weapon` (blade or knuckles; every kenjutsu technique
  needs a blade, validated). They gate learning against the weapon equipped in hand (not grade-up
  "What this opens" lists) and using: `rules/weapons.ts` blocks the card only for fighters whose
  gear is known (the player); foes and teammates carry no `gear` and are
  armed as their techniques suggest.
- 4.3: armour's speed cost is applied to the fighter's speed for the whole fight (`bodyFrom`),
  so it slows initiative, footwork and dodging together; strength 40 carries any armour. Worn
  armour and the `armoured` trait don't stack (the better counts). Thrown weapons count as
  `weapon` hits, so armour helps against kunai.
- 4.3: unique weapons are in the packs but not obtainable yet (no reward hook); 4.2/4.4 hand
  them out. The issued blade is the cheapest D blade the start location sells; the v22 migration
  uses the pack's content (as v18 does) to find it.
- 4.2: no general B technique exists in either pack yet, so the libraries hold C only until 4.4
  adds B content; validation already allows B.
- 4.2: the trumps 1.5 placed at the academy were not library material: Gate of Opening and
  Kindled Pulse became mission scrolls, the clan trumps clan teachings.
- 4.2: a clan technique is taught through the existing signature path, so it needs the bond stage
  any signature does, and a train-with session with someone ahead of you in a stat. A clan with no
  clan head is taught by its genin (Sasuke, Naruto) until the roster has elders for them.
- 4.2: reading your own scroll in a library obeys the library's rank and hours; at home it is
  always possible. A scroll you own stays in the case after you learn it; the desk hides it. A
  repeated job doesn't hand over a scroll or weapon you already own.
- 4.2: 3.5's roster techniques were converted to ranks by the 4.1 rule (12–13 → C, 8–10 → D),
  Black Blade Draw needing a blade and Water Syrup Capture Field D control.
- 5.1: an eliminate job's foes slipped past leave the job undone: the mission ends at once,
  unpaid and unrecorded but without the reputation loss (a quiet exit beats being seen running).
  A negotiated surrender (talk or a threat that lands) pays ×0.6 ryo and ×1.5 reputation; a
  bribe on an eliminate job ×0.5 ryo, normal reputation. A patrol that slips round trouble is
  paid half; on a patrol a bribe keeps the ryo but halves the reputation. Escorts, deliveries
  and retrievals pay in full however you got past.
- 5.1: talk, pay and threats are three approaches rather than one; beasts and spirits don't
  listen (validated: a template offering them needs `resolve`). Spirits can't be slipped past
  (their template leaves sneak out).
- 5.1: an ambush needs `awareness` known as well as unaware foes, so recon has a point. Its
  range and set-the-ground's are picked on the scene ("Strike from"), close by default.
- 5.1: on team jobs only observe and track use the best teammate (mission roles); sensing,
  sneaking and talking are yours (you lead; the whole team sneaking past by its weakest member
  can come with 5.2). The sensor talent works through its perception, not a special case.
- 5.1: recon costs energy (observe 5, track 8), chakra (sense 10) or ryo (ask 15), not time:
  a day has four slots, too coarse for a look over a ridge.
- 5.3: stage texts were reworded to set the scene before contact ("sit round a fire" rather than
  "step out of the reeds"), since you now see the foes before they see you.
- 5.2: "deadly" is the notice's top read, far stronger than you (`much-stronger`). The sensei
  comes only on team missions (it "joins the team"); every team mission is C-rank today, so
  they lead them all.
- 5.2: being spotted always means both: they move first and you are dazed. Arrival notes the
  lookout's roll; after recon only being seen is noted.
- 5.2: roles name who rolls but the stat stays the check's own; teammates sneak and keep pace
  on speed. Ordering teammates to hang back is automatic for those who take your stance orders
  (bond Friend, or you lead), rather than a separate choice.
- 5.2: the medic heals between stages only (not after the last), and only from a teammate; the
  sensei doesn't patch you up, so a medic on the team still matters.
