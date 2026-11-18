# Jutsu audit: chakra cost against damage, utility and the pools that pay for it

Asked after Itachi against Pain: do techniques cost too little? The script (`audit.test.ts`) walks
every technique in both packs and every person's and duelist's pool, and writes
`RESULTS-data.md` (every table). Run it with:

```bash
npx vitest run --config prototypes/jutsu-audit/vitest.config.ts
```

## How chakra works today

- **Cost** is the authored cost, raised to a floor by rank (C 10, B 18, A 30, S 45), times 1.5
  or 2.2 for a wide or vast area. Chakra control then takes up to a third off (`chakraCost`: a
  third at control 20 and above).
- **A full tank** is 40 × 2^(reserves ÷ 10) + control (`maxChakra`). It doubles with every ten
  points of reserves.
- **Each exchange gives back** 2.5% of the full tank, or 2, whichever is more (`gathered`).

Costs are flat by rank, while tanks and regeneration grow exponentially with reserves.

## What it comes to (fan pack; the original pack is the same shape, with smaller kage)

| Technique rank | Typical user | Their tank | Cost after control | Casts per full tank | One exchange's regen pays |
| -------------- | ------------ | ---------: | -----------------: | ------------------: | ------------------------: |
| E              | genin        |         97 |                  4 |                  24 |             50% of a cast |
| D              | genin        |         97 |                  6 |                  16 |                       33% |
| C              | chūnin       |        102 |                  7 |                  15 |                       43% |
| B              | jōnin        |        138 |                 13 |                  11 |                       23% |
| A              | jōnin        |        138 |                 22 |                   6 |                       14% |
| S              | kage         |        761 |                 30 |                  25 |                       63% |

A fight between equals runs eight to twelve exchanges (the lethality bench), and a fighter acts
about once an exchange. So:

- **Chakra decides little below A-rank.** Ten or more casts per tank means a fighter can cast
  their B-rank best every turn of a whole fight. Only a jōnin's A-rank (six casts) bites.
- **Chakra decides nothing at kage.** The median kage tank (761) is 5.5 times a jōnin's. The
  deepest are 15 to 19 times (Hashirama 2606, Pain 2273, Madara 1984, Killer B 1972). Pain gets
  back 57 chakra every exchange, more than an S-rank technique costs anyone. Kage cast their S-rank
  arts every turn and never run dry.
- **Damage per chakra falls with rank** (1.7 power per chakra at E, 0.5 at S). A higher rank buys
  more power per action, not per chakra. Since chakra rarely runs out, actions are the real
  currency. That is why anything that multiplies actions (shadow clones, summons, retinues) is so
  strong.
- **Control is cheap at the bottom.** The hard-hitting control techniques (daze, pin, seal,
  confuse) start at 3 chakra (One Thousand Years of Death, Shrike Cry, Grasping Arms, Leg
  Sweep). A daze costs a genin's turn of regen.

## Itachi against Pain, by these numbers

- **Itachi's tank:** 466 (reserves 34, control 44).
- **Shadow Clone Jutsu** is written as a D-rank at 14 chakra, 9 after his control.
  - In canon the Shadow Clone is a B-rank forbidden technique, and the multi-clone version is
    A-rank.
- **Each clone** gets a third of his tank (155).
- **Coercion Sharingan** costs 12 after his control, so each body can cast it twelve times.
- **The fight was decided in two exchanges** and six casts.
  - Tripling every cost would still leave each body four casts, and the fight would go the same way.

**So costs are too low, but costs alone don't fix that bout.** It was won by actions
(three bodies acting first), not by chakra running out. Raising costs matters for longer fights
and for kage, where chakra currently means nothing.

## Options

1. **Regeneration that doesn't scale with the tank.** A flat amount, or one that grows far slower
   than the pool. At the kage end this is the largest single cause: Pain regains an S-rank cast
   every exchange.
2. **Costs that scale with rank as the tanks do.** Keep the floors for C and B, and raise A and S
   so a kage's S-rank is about a quarter of a kage's tank, as the floor's own comment intends for a
   jōnin. For example, S at 45 → 150 against a median kage tank of 761.
   - Alternatively, compress the tanks: a doubling every 15 points of reserves rather than 10
     would bring the median kage to about 300 and the deepest to about 750.
   - That is a stat-model change, so it would need measuring across everything.
3. **Shadow clones costed as what they are.** Make the technique B-rank and charge per clone,
   for example a tenth of the maker's tank for each, on top of the split. Making clones would then
   be a real commitment, and a deep pool buys more of them, as in canon.
4. **Control priced for what it does.** A daze or pin costs a turn of the target's. A floor for
   control verbs by rank (D-rank control at least 8, say) would keep the cheapest locks from being
   free.

None of these is a number to tune to the matrix. Each changes what chakra means, so each should
be measured on the benches and played before it is kept.
