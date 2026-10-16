# Hittability: reading, avoiding, taking hold, and what blades and clones change

Working document for Plan & Watch. Part 1 is how a hit is decided today and what is wrong with
it. Part 2 is the sequence we want. Part 3 is kenjutsu. Part 4 is clones. Part 5 is the build
plan. Nothing here is binding until each step lands.

---

## Part 1: Today

A technique faces two gates; a plain strike or throw faces only the second.

1. **Seen coming** (`seenChance`, `plan/jutsu.ts`). The target's resist stat against the
   caster's drive, through a logistic: about 30% between equals, 5–60% overall. If it succeeds
   the technique fails outright. The resist stat comes from the verb (`rules/verbs/profiles.ts`):
   perception for damage, areas, dazes, seals and breaks (willpower against genjutsu), strength
   for pins, strength and speed for knocks, willpower for confusion, chakra control for drains,
   stamina for afflictions. Familiarity, the hold escape and foresight multiply it.
2. **The reaction** (`plan/react.ts`): clones, then a Dodge (only when Dodge is the ready
   defence), a substitution or wall, a Guard, a Counter, then damage from the power gap, capped at
   half the target's health.

What is wrong:

- **Avoiding and resisting are one roll.** Whether a pin _reaches_ you is decided by your
  strength, which has nothing to do with getting out of the way; whether it _holds_ you is never
  asked separately. The same roll stands in for both halves of every verb.
- **Speed is no defence unless you chose Dodge.** A fast, sharp fighter with a substitution
  ready is a sitting target for every blow after the first each round. Intellect never helps
  avoid anything except holds.
- **Guard is opt-in.** Anyone not standing in Guard takes blows as though they'd never fought,
  though toughness already absorbs some of every hit.
- **Plain blows are never read.** A master sees nothing coming from a kunai.
- **Holds last a set time.** A pin wears off by the clock; the held never struggle.

---

## Part 2: The sequence

Every attack, technique or plain, goes through the same five steps. Each step has one story,
so the log can always say why something missed or landed.

### 2.1 Read (anticipation)

The defender sees the attack coming, and may respond sooner. **Perception and intellect**
(seeing it, and understanding it) against the attacker's **speed and practice in the art**.
Familiarity (a technique leaned on) and foresight (awakened eyes) live here, not as multipliers
on a resist roll. A read does two things:

- It boosts the avoid roll (2.2).
- A strong read lets the defender answer in time: a substitution timed to the blow, a clash met
  with an element, a counter. A defence that today reacts on its own fires more often against
  something read.

### 2.2 Avoid: one roll

Did the attack reach you? One roll, whose odds are:

- **Base:** the defender's avoid stat against how fast the attack arrives (the attacker's speed
  for a blow, their grade in the art for a technique).
- **Shape:** accuracy (sure, steady, wild) and area size (small as a single target, wide hard
  to get clear of, vast impossible).
- **Read:** the boost from 2.1.
- **Stance:** everyone has a baseline avoid chance; a ready Dodge raises it a lot rather than
  being the only way to slip anything.

The avoid stat depends on the attack. Most are speed (with perception); **genjutsu is avoided
by noticing it**, perception and willpower, never by stepping aside. Each attack type declares
its avoid stat and its resist stat (2.4), so the table in `profiles.ts` splits in two.

Plain blows go through this roll too, so a master reads kunai as well as jutsu.

### 2.3 Spent and standing defences

What still escapes a hit that wasn't avoided: a substitution or elemental wall (once a round;
the way a slow fighter survives what they can't outrun, vast areas included), and clones (a
decoy takes it; Part 4).

### 2.4 Take hold: by attack type

The hit landed. What it does now depends on what it is.

- **Damage stays a reduction, not a roll.** The gap formula (`rules/damage.ts`) against the
  right defence: taijutsu and kenjutsu against toughness; ninjutsu against toughness and
  chakra; genjutsu against willpower and chakra control. Rolls on rolls make fights swingy, and
  the lethality bench wants equals to fight two to three rounds.
- **Conditions roll** against the right stat:

  | Condition                              | Resisted by              |
  | -------------------------------------- | ------------------------ |
  | Physical pin (wires, a grapple, earth) | strength                 |
  | Chakra bind (a water prison, a seal)   | chakra control           |
  | Daze                                   | stamina                  |
  | Confusion, illusion                    | willpower                |
  | Poison, bleeding, burns                | stamina                  |
  | Knock (thrown back)                    | strength (footing helps) |
  | Drain                                  | chakra control           |

### 2.5 Over time

Holds are fought, not waited out. Each exchange the held roll to escape against the same
resist stat; a **channelled** bind is much harder to break while its caster holds it (and still
breaks when the caster is hurt or dazed); a **teammate can break you out** at the cost of their
turn.

### 2.6 Guard for everyone

Everyone guards to a degree. Toughness already carries it: its skill share (the fighter's best
art) is how a trained fighter rolls with any hit. Against a physical attack (a blow, a blade, a
taijutsu or kenjutsu technique) hand-to-hand skill and strength do better still: the defence a
blow meets is toughness, or a blend with guard where guard is the better of the two
(`physicalDefence`), so a brawler catches a punch a seal scholar only rolls with, and no one is
worse off than before. A ready Guard is a clear boost on top, and still breaks under a smash
and loses to a wide or vast area.

(Built this way rather than as a straight blend: blending guard into everyone's defence lowered
it for every fighter whose best art isn't hand-to-hand, and shortened their fights.)

### 2.7 Balance

These are not new layers on today's numbers: a read, a universal avoid and a universal guard
stacked on top would make everyone hard to hit. The whole chain is retuned together against
the lethality bench (equals two to three rounds, about half each) and the content bench.

---

## Part 3: Kenjutsu

A weapon in skilled hands is a big advantage, and it costs something.

- **Power.** A blade hits clearly harder than a fist: a cut's scale rises above a plain strike's
  (today they are equal, `rules/weapons.ts`), climbing with the blade's rank.
- **Priority up close.** Reach wins the first exchange at close range: a fighter with a blade
  drawn acts first there, unless their foe's taijutsu is well above their kenjutsu (about a grade
  clear). Blade against blade, the better kenjutsu goes first. This is an initiative lead in
  `round.ts`, not a damage bonus.
- **Open when unskilled.** A swing is a commitment. A cut whose kenjutsu is below the target's
  taijutsu (or kenjutsu, if they're armed) is easier to counter, and the worse the gap the more
  often a Counter or a riposte answers it.
- **Hands are full.** Hand seals need both hands. With a blade drawn, ninjutsu and genjutsu at
  close and mid are slower (they lose initiative) and easier to read (2.1); at far there is time
  to sheathe and form the seals. Kenjutsu techniques that run chakra through the blade are
  kenjutsu, not ninjutsu, and pay nothing.

So the swordsman wins close range against all but a much better hand-to-hand fighter, and gives
up the jutsu game until they've got distance.

---

## Part 4: Clones

Today every clone technique is the same thing with a power and an on/off switch for whether
the clones throw a weak blow (`rules/verbs/clones.ts`). Clones become **kinds**, each a row in
one rules table, so the techniques that make them are worth different things.

| Kind      | Cost             | Tangible | What makes it worth it                                                                    |
| --------- | ---------------- | -------- | ----------------------------------------------------------------------------------------- |
| Illusion  | cheapest         | no       | Decoys only. A hit or a sharp eye passes through.                                         |
| Water     | cheap            | yes      | Fragile, but can cast the maker's water techniques.                                       |
| Wind      | cheap            | yes      | Fragile and quick: screens a charge well; casts wind techniques.                          |
| Earth     | dear             | yes      | Tough (shrugs off a light hit) and rebuilds one clone between exchanges.                  |
| Lightning | dear             | yes      | Whoever destroys one up close takes a shock (harm, maybe a daze).                         |
| Fire      | moderate         | yes      | Feeds itself: its upkeep comes back as it burns; casts fire techniques.                   |
| Shadow    | dearest (shared) | yes      | Coordinated: they strike harder, can run the maker's own plan, and set up for each other. |

- **Tangible clones cost what they're worth.** They hold chakra while they stand: an up-front
  cost plus upkeep each exchange, by kind. Shadow clones split the maker's reserves among them.
  Illusions are cheap because they can't touch anyone.
- **Tangible clones multiply offence and defence.** Each takes a hit for its maker (Part 2.3)
  and adds a blow when the maker attacks. Elemental clones may also **cast**, but only
  techniques of their own nature, at reduced power, paid from the maker's chakra.
- **Shadow clones are coordinated.** Their blows are fuller, they follow the maker's plan
  (combos, setups for each other), and out of a fight they **multiply training**: a game-layer
  rule (a `ModifierSpec` on growth while known), not a combat rule.

Ideas held for later: sand or ink clones from clan arts, explosive clones (bursting is the
point), clones that carry a seal.

---

## Part 5: Build plan

One PR each, benches green at every step.

1. **Avoid and resist split.** A read stage; one avoid roll with a baseline for everyone and a
   Dodge boost; avoid and resist stats per attack type; condition rolls on the right stats;
   plain blows read. Retune the bench.
2. **Holds over time.** Escape rolls each exchange; channelled binds; teammates breaking you out.
3. **Guard for everyone.** Baseline folded into toughness, the Guard stance a boost.
4. **Kenjutsu.** Blade power, close priority, openness when unskilled, the casting penalty.
5. **Clone kinds.** The kinds table, costs and upkeep, toughness, rebuilding, the shock, fire's
   upkeep; content tagged by kind.
6. **Clones that cast.** Elemental clones casting their nature; shadow clone coordination.
7. **Shadow clone training.** The growth modifier, out of combat.
