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

### D2. Growth walls: reworked, under discussion

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
