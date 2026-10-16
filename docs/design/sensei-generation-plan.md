# Generated senseis: a plan

Every save offers the same senseis today: five in the original world and five in the fan
pack, each about 400 lines of hand-written content (person, ways, four story conversations, a
two-job arc). They are good, but a second playthrough meets them again, and each new one costs
another 400 lines. This plan composes senseis from parts instead, so a new save meets
people nobody has met before, with the same depth: a temperament you can feel in every line,
a past that comes out over four conversations, and a story that ends in jobs of their own.

The rule that keeps them from feeling generated: **every part is written by hand, and parts
are chosen to fit each other**, never shuffled freely. A generated sensei is a hand-written
past, voiced by a hand-written temperament, filled with names and places drawn from the
world, with ways that follow from both.

## Part 1: What a sensei is made of

| Layer           | What it gives                                                                                                                                                                                            | Where it is written                                                  | How many                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| **Frame**       | Name, family, look, age, specialty, nature, clan, stats and talent at jōnin grade, signature techniques from the pack's own                                                                              | Game (`game/sensei/compose.ts`), from the pack's pools               | Endless                                  |
| **Temperament** | How they talk and teach: an archetype for their ways (the seven that exist), a voice kit (greeting, praise, scold, catchphrase, a tell you notice at lessons), fireside lines, their opening-test manner | `content/shared/sensei/temperaments.ts`                              | 10 to start                              |
| **Past**        | The wound and the four story conversations, with slots (the one they lost, the place, the foe, the keepsake, the promise)                                                                                | `content/shared/sensei/pasts.ts`, conversations with `about: 'past'` | 10 to start                              |
| **Arc**         | Two C-rank jobs that close the past: a template written once per past, filled per pack with its own places, regions and foes                                                                             | Templates in `content/shared/sensei/arcs/`, fills in each pack       | 10 templates, 2 or 3 fills each per pack |
| **Quirks**      | A favourite dish, a hobby, a pet peeve, a gift they love, two favoured traits, an everyday habit                                                                                                         | `content/shared/sensei/quirks.ts`                                    | Pools of 20 or more                      |

Ten temperaments times ten pasts times a few arc fills, before names, looks, quirks and
specialties, is several hundred distinct senseis. Each will read as a person because every
sentence they say was written for a temperament and a past, not stitched from fragments.

### Fit rules (what stops nonsense)

- **Pasts say which temperaments can carry them.** A sensei who deserted and came back can be
  a quiet old hand or a joker hiding it, never a cheerful drillmaster. A temperament may also
  rule pasts out.
- **Pasts say which specialties and natures fit.** "The blade my teacher broke" needs
  kenjutsu. "The fire I couldn't put out" needs a fire nature, or none.
- **The arc fill decides the slots.** The foe, the place and the region in the story come
  from the chosen arc fill, so the conversations and the jobs always agree.
- **The ways come from the temperament, then the past nudges them.** A past of a lost team
  makes a sensei grip harder and shield on missions. A past of a student they pushed too far
  makes them looser. Those are the existing ways dimensions, so every rule that reads ways
  already works.
- **No two senseis offered at once share a temperament, a past or a specialty.**

## Part 2: How it plays

- **When they are made.** At team assignment, the game composes a few senseis from the save's
  seed and stores them with the generated genin (`people.generated`, the same `PersonDef`
  shape). Views and actions already find people there.
- **Who is offered.** Two senseis, as now, chosen by fit from the authored roster and the
  generated ones together. A pack can prefer generated senseis, or offer authored ones only.
- **Their story.** Their four story conversations are ordinary personal talks at bond stages
  one to four (`about: 'past'`), filled from the sensei's own past. The last one leaves the
  world mark that opens their arc, exactly as authored senseis do today.
- **Their voice.** Wherever a sensei speaks, the temperament's voice kit replaces the plain
  line. That covers the slip, the lesson card, coaching, the fireside, the opening test, the
  farewell and the exam invitation. Authored senseis can opt into a voice kit too, so the
  code path is one.
- **Saves.** A generated sensei is stored whole, like a generated genin. If templates later
  change, the sensei keeps the slot fills they were made with (stored on the person), and the
  wording updates with the templates.

## Part 3: Steps

1. **Schema and validation.**
   - Temperaments, pasts (with fit rules and slots), quirk pools, and the `past` topic kind
     with its slots.
   - Arc templates and per-pack fills.
   - Validation: every past has four beat conversations and an arc template, every fill gives
     every slot, every temperament has a full voice kit, and every combination the fit rules
     allow is complete.
2. **The composer** (`game/sensei/compose.ts`). It builds a whole sensei from the seed: frame,
   temperament, past, arc fill, quirks and ways. A test composes a thousand and checks that
   each one holds together and that the spread is wide.
3. **Offering and storing.** Compose at team assignment, offer by fit across authored and
   generated, and add a save migration.
4. **Their story in talk.** The `past` topic fills the four beats; the arc opens from the
   last.
5. **Their voice.** Thread the voice kit through every place a sensei speaks.
6. **Content.** Write 10 temperaments, 10 pasts (wound and four conversations each), 10 arc
   templates with fills for both packs, and the quirk pools. This is the bulk of the work and
   the part that decides whether they feel real.
7. **A playthrough** with three generated senseis, from team assignment to the arc, before
   calling it done.

## Decisions to make

1. **How many generated senseis join the offer?** My leaning: the offer stays two, drawn by
   fit from authored and generated together, so every save has a fair chance of meeting
   someone new. (Built as one of each: see Part 4.)
2. **Do authored senseis stay?** My leaning: yes. They are the setting's own people and remain
   in the pool. The fan pack's canon four stay unoffered.
3. **How much variety before shipping?** My leaning: 10 temperaments and 10 pasts. Fewer than
   about eight of each starts to repeat within a few saves.

## Part 4: What was built

All seven steps, with the leanings taken, and one change of approach:

- **Composed when the context is built, not stored in the save.** Arc jobs, conversations and
  foes are looked up from the pack everywhere, so a sensei made at runtime and kept in the save
  could not own jobs with their name in them. Instead every pack carries the whole pool, composed
  from its parts and each sensei's id when the context is built (`withSenseiPool`), and a save
  draws the few it meets from its seed (`game/people/pooled.ts`). No save migration was needed;
  ids name the parts (`pool-lost-team-iron-bell`), so adding parts never renames anyone.
- **The pool:** 10 temperaments, 10 pasts, 6 grounds per pack and pools of grown-up names: about
  fifty senseis per pack, each validated as ordinary content.
- **The offer:** two senseis, the best fit and the best fit in another art from the other side
  of the roster, so every save offers one of the pack's own and one composed sensei.
- **Their voice** speaks at the weekly coaching (praise, scold), by the fire on jobs and at the
  farewell (their catchphrase). Their temperament's lesson, style and bio are their own.
- **Fit rules:** a past names the temperaments, arts, nature and regions it fits; its nudge to
  the ways is applied only as far as the ways still hang together; a past whose foe is the one
  they lost (a rival, a student, a friend who ran) uses the sensei's own art for the foe.
- **Played through:** a new save offered Gōran beside Haruka Wakabayashi, a composed showboat;
  Haruka ran the week, the test, the lesson and the coaching in their own voice, two other
  composed senseis lived in the village, and their story and arc open as authored ones do (tested
  end to end).
