# Cue inference bench output

67657 decision points from 2904 watched fights (22 cast members, 3 scales, 2 seeds), 40 s to collect.

Default tuning: watchful hides.

## The player reading foes (today: the telegraph)

### Player reads foe: by perception gap (observer − actor), no insight

| bin | n | today: told | today: exact card | cue: today's class right | cue: fine class right | cue: broad right | cue: exact card | techniques named, today / cue | cue names wrong |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a. ≤ -5 | 5746 | 96% | 28% | 87% | 84% | 88% | 54% | 0% / 39% | 0% |
| b. -4..-1 | 5861 | 97% | 46% | 94% | 92% | 92% | 75% | 0% / 56% | 0% |
| c. 0 | 9737 | 96% | 96% | 94% | 91% | 93% | 85% | 94% / 76% | 0% |
| d. +1..+4 | 5091 | 95% | 95% | 94% | 92% | 94% | 89% | 91% / 80% | 0% |
| e. ≥ +5 | 2045 | 97% | 97% | 97% | 94% | 94% | 91% | 95% / 86% | 0% |
| all, out-read (gap ≥ 0) | 16873 | 96% | 96% | 94% | 92% | 93% | 87% | 93% / 79% | 0% |
| out-read, a technique or tool seen before | 6299 | 100% | 100% | 100% | 99% | 100% | 97% | 100% / 97% | 0% |
| out-read, a technique or tool on first sight | 3249 | 81% | 81% | 75% | 63% | 69% | 42% | 81% / 42% | 0% |
| all, out-read by the actor (gap < 0) | 11607 | 96% | 37% | 91% | 88% | 90% | 64% | 0% / 46% | 0% |
| insight | 6247 | 96% | 96% | 96% | 96% | 96% | 96% | 96% / 96% | 0% |

### Player reads foe: by read margin (observer perception − actor concealment of the card), no insight

| bin | n | today: told | today: exact card | cue: today's class right | cue: fine class right | cue: broad right | cue: exact card | techniques named, today / cue | cue names wrong |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a. < -6 | 1104 | 94% | 3% | 78% | 71% | 77% | 17% | 0% / 16% | 0% |
| b. -6..-3 | 2843 | 96% | 39% | 87% | 85% | 88% | 59% | 0% / 40% | 0% |
| c. -3..0 | 6273 | 98% | 45% | 93% | 90% | 93% | 71% | 17% / 57% | 0% |
| d. 0..3 | 8901 | 95% | 85% | 93% | 90% | 91% | 84% | 75% / 73% | 0% |
| e. 3..6 | 6649 | 96% | 96% | 95% | 94% | 95% | 90% | 93% / 82% | 0% |
| f. ≥ 6 | 2710 | 97% | 97% | 97% | 94% | 95% | 90% | 95% / 83% | 0% |
| out-read in the cue model (margin ≥ 0) | 18260 | 96% | 91% | 94% | 92% | 93% | 87% | 84% / 78% | 0% |
| out-read in both senses | 15473 | 95% | 95% | 94% | 92% | 93% | 87% | 93% / 79% | 0% |

### Player reads foe: by the observer's grade in the true card's art (no insight)

| bin | n | today: told | today: exact card | cue: today's class right | cue: fine class right | cue: broad right | cue: exact card | techniques named, today / cue | cue names wrong |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 2675 | 98% | 84% | 95% | 94% | 96% | 84% | 71% / 72% | 0% |
| B | 1467 | 98% | 58% | 92% | 89% | 90% | 68% | 36% / 55% | 0% |
| C | 7668 | 96% | 73% | 93% | 91% | 93% | 80% | 54% / 68% | 0% |
| D | 9172 | 95% | 70% | 92% | 90% | 92% | 77% | 52% / 65% | 0% |
| E | 7372 | 95% | 71% | 92% | 88% | 90% | 76% | 52% / 61% | 0% |
| S | 126 | 99% | 99% | 79% | 79% | 80% | 79% | 100% / 88% | 0% |

### Player reads foe: by scale (no insight)

| bin | n | today: told | today: exact card | cue: today's class right | cue: fine class right | cue: broad right | cue: exact card | techniques named, today / cue | cue names wrong |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| chunin | 9660 | 96% | 71% | 93% | 90% | 92% | 78% | 52% / 65% | 0% |
| genin | 9537 | 96% | 72% | 94% | 91% | 93% | 81% | 55% / 70% | 0% |
| jonin | 9283 | 96% | 72% | 91% | 89% | 91% | 75% | 53% / 59% | 0% |

### Player reads foe: by true class (no insight)

| bin | n | today: told | today: exact card | cue: today's class right | cue: fine class right | cue: broad right | cue: exact card | techniques named, today / cue | cue names wrong |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| blow | 6515 | 98% | 74% | 95% | 95% | 97% | 83% | 46% / 65% | 0% |
| brace | 18 | 100% | 100% | 72% | 72% | 78% | 72% | – / – | – |
| dispel | 167 | 92% | 92% | 91% | 91% | 92% | 91% | – / – | – |
| evade | 268 | 98% | 98% | 82% | 83% | 83% | 83% | – / – | – |
| gather | 26 | 81% | 81% | 81% | 81% | 81% | 81% | – / – | – |
| search | 554 | 88% | 88% | 87% | 87% | 87% | 87% | – / – | – |
| stance | 248 | 100% | 18% | 75% | 75% | 75% | 48% | 18% / 48% | 0% |
| step-back | 1882 | 98% | 98% | 96% | 96% | 96% | 96% | – / – | – |
| step-in | 2911 | 99% | 99% | 98% | 98% | 99% | 98% | – / – | – |
| support | 2558 | 100% | 80% | 98% | 75% | 75% | 71% | 80% / 71% | 0% |
| technique | 10874 | 92% | 50% | 88% | 87% | 90% | 64% | 50% / 64% | 0% |
| throw | 2459 | 100% | 100% | 96% | 96% | 98% | 96% | – / – | – |

### Player reads foe: confidence words (no insight)

| word | share of points | class right |
| --- | --- | --- |
| sure | 67% | 99% |
| fairly sure | 20% | 92% |
| maybe | 10% | 64% |

### Player reads foe: confidence words, out-read (gap ≥ 0)

| word | share of points | class right |
| --- | --- | --- |
| sure | 80% | 98% |
| fairly sure | 13% | 89% |
| maybe | 2% | 55% |

### Player reads foe: confidence words, out-read by the actor (gap < 0)

| word | share of points | class right |
| --- | --- | --- |
| sure | 48% | 99% |
| fairly sure | 29% | 94% |
| maybe | 20% | 66% |

### Player reads foe: slot conditions (no insight)

| condition | threshold | true (= today fires) | inference fires when true | inference firings wrong | inference fires |
| --- | --- | --- | --- | --- | --- |
| foe-readying | 0.5 | 58% | 94% | 2% | 56% |
| foe-readying | 0.65 | 58% | 89% | 0% | 52% |
| foe-readying | 0.9 | 58% | 72% | 0% | 42% |
| foe-attacking | 0.5 | 70% | 97% | 3% | 70% |
| foe-attacking | 0.65 | 70% | 94% | 3% | 67% |
| foe-attacking | 0.9 | 70% | 78% | 0% | 55% |
| foe-closing | 0.5 | 11% | 98% | 1% | 10% |
| foe-closing | 0.65 | 11% | 97% | 0% | 10% |
| foe-closing | 0.9 | 11% | 62% | 0% | 7% |

### Player reads foe: slot conditions at low perception (gap < 0, no insight)

| condition | threshold | true (= today fires) | inference fires when true | inference firings wrong | inference fires |
| --- | --- | --- | --- | --- | --- |
| foe-readying | 0.5 | 61% | 88% | 1% | 55% |
| foe-readying | 0.65 | 61% | 78% | 1% | 48% |
| foe-readying | 0.9 | 61% | 46% | 0% | 28% |
| foe-attacking | 0.5 | 72% | 93% | 3% | 69% |
| foe-attacking | 0.65 | 72% | 86% | 2% | 63% |
| foe-attacking | 0.9 | 72% | 57% | 0% | 41% |
| foe-closing | 0.5 | 3% | 91% | 4% | 3% |
| foe-closing | 0.65 | 3% | 84% | 1% | 3% |
| foe-closing | 0.9 | 3% | 39% | 0% | 1% |

### Player-facing lines (samples)

| gap | truth | what the panel says |
| --- | --- | --- |
| a. ≤ -5 | jutsu:lantern-cut | Lantern Cut: sure. |
| a. ≤ -5 | jutsu:tide-lash | Tide Lash: sure. |
| a. ≤ -5 | jutsu:whispering-dread | Likely Whispering Dread: fairly sure. |
| a. ≤ -5 | step-in | Likely closing in: fairly sure. |
| a. ≤ -5 | jutsu:tide-lash | Perhaps an attacking technique: maybe. |
| a. ≤ -5 | throw | Perhaps a throw: maybe. |
| b. -4..-1 | jutsu:moonfall-slash | Moonfall Slash: sure. |
| b. -4..-1 | jutsu:ember-rain | Ember Rain: sure. |
| b. -4..-1 | jutsu:lantern-cut | Likely a blow up close: fairly sure. |
| b. -4..-1 | throw | Likely a throw: fairly sure. |
| b. -4..-1 | jutsu:summon-ember-salamander | Perhaps an attacking technique: maybe. |
| b. -4..-1 | jutsu:toga-scale-blind | Perhaps a blow up close: maybe. |
| c. 0 | jutsu:gale-heel | Gale Heel: sure. |
| c. 0 | jutsu:mending-glow | Mending Glow: sure. |
| c. 0 | jutsu:gale-heel | Likely Gale Heel: fairly sure. |
| c. 0 | step-in | Likely closing in: fairly sure. |
| c. 0 | jutsu:cut-the-wick | Perhaps an attacking technique: maybe. |
| c. 0 | jutsu:gale-heel | Perhaps Gale Heel: maybe. |
| d. +1..+4 | jutsu:gale-heel | Gale Heel: sure. |
| d. +1..+4 | strike | A blow up close: sure. |
| d. +1..+4 | step-in | Likely closing in: fairly sure. |
| d. +1..+4 | step-in | Likely closing in: fairly sure. |
| d. +1..+4 | jutsu:paper-veil | Perhaps an attacking technique: maybe. |
| e. ≥ +5 | jutsu:gale-heel | Gale Heel: sure. |
| e. ≥ +5 | jutsu:gale-heel | Gale Heel: sure. |
| e. ≥ +5 | step-in | Likely closing in: fairly sure. |
| e. ≥ +5 | step-in | Likely closing in: fairly sure. |
| e. ≥ +5 | jutsu:cut-the-wick | Perhaps an attacking technique: maybe. |

## Foes reading the player (today: nothing; "today" columns show a symmetric telegraph)

### Foe reads player: by perception gap (observer − actor), no insight

| bin | n | today: told | today: exact card | cue: today's class right | cue: fine class right | cue: broad right | cue: exact card | techniques named, today / cue | cue names wrong |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a. ≤ -5 | 5105 | 95% | 30% | 86% | 83% | 86% | 53% | 0% / 38% | 0% |
| b. -4..-1 | 5568 | 95% | 48% | 93% | 89% | 90% | 78% | 0% / 63% | 0% |
| c. 0 | 9251 | 95% | 95% | 93% | 91% | 92% | 82% | 95% / 77% | 0% |
| d. +1..+4 | 4880 | 94% | 94% | 93% | 92% | 93% | 86% | 92% / 79% | 0% |
| e. ≥ +5 | 2194 | 96% | 96% | 91% | 89% | 94% | 85% | 94% / 85% | 0% |
| all, out-read (gap ≥ 0) | 16325 | 95% | 95% | 93% | 91% | 92% | 83% | 94% / 78% | 0% |
| out-read, a technique or tool seen before | 7768 | 99% | 99% | 99% | 98% | 99% | 95% | 99% / 95% | 0% |
| out-read, a technique or tool on first sight | 3498 | 84% | 84% | 80% | 69% | 73% | 41% | 84% / 41% | 0% |
| all, out-read by the actor (gap < 0) | 10673 | 95% | 39% | 89% | 86% | 88% | 66% | 0% / 49% | 0% |
| insight | 5932 | 96% | 96% | 96% | 96% | 96% | 96% | 95% / 95% | 0% |

### Foe reads player: by read margin (observer perception − actor concealment of the card), no insight

| bin | n | today: told | today: exact card | cue: today's class right | cue: fine class right | cue: broad right | cue: exact card | techniques named, today / cue | cue names wrong |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a. < -6 | 908 | 93% | 0% | 79% | 71% | 76% | 12% | 0% / 12% | 0% |
| b. -6..-3 | 2632 | 95% | 43% | 84% | 83% | 86% | 60% | 0% / 39% | 0% |
| c. -3..0 | 5622 | 97% | 45% | 93% | 90% | 92% | 70% | 28% / 62% | 0% |
| d. 0..3 | 8673 | 94% | 84% | 92% | 89% | 90% | 82% | 79% / 76% | 0% |
| e. 3..6 | 6419 | 96% | 96% | 95% | 93% | 94% | 88% | 93% / 80% | 0% |
| f. ≥ 6 | 2744 | 96% | 96% | 92% | 90% | 94% | 85% | 95% / 82% | 0% |
| out-read in the cue model (margin ≥ 0) | 17836 | 95% | 90% | 93% | 91% | 92% | 84% | 86% / 78% | 0% |
| out-read in both senses | 14984 | 95% | 95% | 93% | 91% | 92% | 84% | 93% / 79% | 0% |

### Foe reads player: by the observer's grade in the true card's art (no insight)

| bin | n | today: told | today: exact card | cue: today's class right | cue: fine class right | cue: broad right | cue: exact card | techniques named, today / cue | cue names wrong |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 2625 | 97% | 82% | 94% | 93% | 94% | 79% | 76% / 74% | 0% |
| B | 1366 | 98% | 61% | 93% | 90% | 92% | 70% | 40% / 56% | 0% |
| C | 7402 | 96% | 74% | 92% | 90% | 92% | 78% | 61% / 70% | 0% |
| D | 8792 | 95% | 71% | 91% | 89% | 91% | 76% | 59% / 68% | 0% |
| E | 6737 | 94% | 73% | 91% | 86% | 88% | 75% | 60% / 65% | 0% |
| S | 76 | 97% | 97% | 76% | 75% | 76% | 74% | 100% / 38% | 0% |

### Foe reads player: by scale (no insight)

| bin | n | today: told | today: exact card | cue: today's class right | cue: fine class right | cue: broad right | cue: exact card | techniques named, today / cue | cue names wrong |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| chunin | 9119 | 95% | 73% | 92% | 89% | 91% | 77% | 60% / 68% | 0% |
| genin | 8989 | 96% | 72% | 93% | 90% | 92% | 80% | 59% / 73% | 0% |
| jonin | 8890 | 95% | 74% | 90% | 88% | 90% | 73% | 62% / 63% | 0% |

### Foe reads player: by true class (no insight)

| bin | n | today: told | today: exact card | cue: today's class right | cue: fine class right | cue: broad right | cue: exact card | techniques named, today / cue | cue names wrong |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| blow | 5913 | 98% | 71% | 95% | 95% | 96% | 72% | 68% / 70% | 0% |
| brace | 7 | 86% | 86% | 86% | 86% | 86% | 86% | – / – | – |
| dispel | 74 | 76% | 76% | 55% | 55% | 55% | 55% | – / – | – |
| evade | 161 | 97% | 97% | 84% | 85% | 85% | 85% | – / – | – |
| search | 781 | 87% | 87% | 77% | 78% | 78% | 78% | – / – | – |
| stance | 149 | 100% | 17% | 66% | 66% | 66% | 41% | 17% / 41% | 0% |
| step-back | 2282 | 95% | 95% | 92% | 92% | 93% | 92% | – / – | – |
| step-in | 3241 | 99% | 99% | 95% | 95% | 99% | 95% | – / – | – |
| support | 2704 | 97% | 73% | 95% | 73% | 73% | 68% | 73% / 68% | 0% |
| technique | 9381 | 91% | 53% | 88% | 87% | 89% | 67% | 53% / 67% | 0% |
| throw | 2305 | 100% | 100% | 97% | 97% | 98% | 97% | – / – | – |

### Foe reads player: confidence words (no insight)

| word | share of points | class right |
| --- | --- | --- |
| sure | 67% | 99% |
| fairly sure | 19% | 92% |
| maybe | 10% | 59% |

### Foe reads player: confidence words, out-read (gap ≥ 0)

| word | share of points | class right |
| --- | --- | --- |
| sure | 80% | 98% |
| fairly sure | 12% | 90% |
| maybe | 3% | 41% |

### Foe reads player: confidence words, out-read by the actor (gap < 0)

| word | share of points | class right |
| --- | --- | --- |
| sure | 48% | 99% |
| fairly sure | 28% | 94% |
| maybe | 20% | 64% |

### Foe reads player: slot conditions (no insight)

| condition | threshold | true (= today fires) | inference fires when true | inference firings wrong | inference fires |
| --- | --- | --- | --- | --- | --- |
| foe-readying | 0.5 | 64% | 95% | 1% | 61% |
| foe-readying | 0.65 | 64% | 91% | 0% | 58% |
| foe-readying | 0.9 | 64% | 71% | 0% | 46% |
| foe-attacking | 0.5 | 65% | 97% | 4% | 66% |
| foe-attacking | 0.65 | 65% | 93% | 3% | 63% |
| foe-attacking | 0.9 | 65% | 80% | 0% | 52% |
| foe-closing | 0.5 | 13% | 95% | 1% | 12% |
| foe-closing | 0.65 | 13% | 94% | 0% | 12% |
| foe-closing | 0.9 | 13% | 63% | 0% | 8% |

### Foe reads player: slot conditions at low perception (gap < 0, no insight)

| condition | threshold | true (= today fires) | inference fires when true | inference firings wrong | inference fires |
| --- | --- | --- | --- | --- | --- |
| foe-readying | 0.5 | 59% | 88% | 1% | 52% |
| foe-readying | 0.65 | 59% | 78% | 0% | 46% |
| foe-readying | 0.9 | 59% | 49% | 0% | 29% |
| foe-attacking | 0.5 | 64% | 92% | 4% | 62% |
| foe-attacking | 0.65 | 64% | 84% | 2% | 55% |
| foe-attacking | 0.9 | 64% | 58% | 0% | 37% |
| foe-closing | 0.5 | 4% | 93% | 6% | 4% |
| foe-closing | 0.65 | 4% | 85% | 2% | 3% |
| foe-closing | 0.9 | 4% | 49% | 0% | 2% |

## Variant: body hides (concealment from speed and skill alone)

### Player reads foe: by perception gap

| bin | n | today: told | today: exact card | cue: today's class right | cue: fine class right | cue: broad right | cue: exact card | techniques named, today / cue | cue names wrong |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a. ≤ -5 | 5746 | 96% | 28% | 89% | 87% | 90% | 62% | 0% / 48% | 0% |
| b. -4..-1 | 5861 | 97% | 46% | 93% | 91% | 92% | 72% | 0% / 51% | 0% |
| c. 0 | 9737 | 96% | 96% | 87% | 82% | 90% | 67% | 94% / 49% | 0% |
| d. +1..+4 | 5091 | 95% | 95% | 91% | 88% | 92% | 82% | 91% / 66% | 0% |
| e. ≥ +5 | 2045 | 97% | 97% | 94% | 92% | 94% | 89% | 95% / 81% | 0% |
| all, out-read (gap ≥ 0) | 16873 | 96% | 96% | 89% | 85% | 91% | 74% | 93% / 57% | 0% |
| all, out-read by the actor (gap < 0) | 11607 | 96% | 37% | 91% | 89% | 91% | 67% | 0% / 49% | 0% |

### Player reads foe: by read margin

| bin | n | today: told | today: exact card | cue: today's class right | cue: fine class right | cue: broad right | cue: exact card | techniques named, today / cue | cue names wrong |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a. < -6 | 2456 | 96% | 65% | 77% | 72% | 88% | 39% | 47% / 13% | 0% |
| b. -6..-3 | 5532 | 95% | 55% | 84% | 78% | 85% | 50% | 40% / 36% | 0% |
| c. -3..0 | 9103 | 96% | 63% | 90% | 87% | 91% | 71% | 42% / 56% | 0% |
| d. 0..3 | 6221 | 96% | 81% | 94% | 93% | 94% | 87% | 59% / 74% | 0% |
| e. 3..6 | 4309 | 97% | 97% | 96% | 94% | 95% | 89% | 95% / 82% | 0% |
| f. ≥ 6 | 859 | 100% | 100% | 100% | 100% | 100% | 98% | 100% / 87% | 0% |
| out-read in the cue model (margin ≥ 0) | 11389 | 97% | 89% | 95% | 94% | 95% | 88% | 78% / 78% | 0% |

### Player reads foe: confidence words

| word | share of points | class right |
| --- | --- | --- |
| sure | 55% | 99% |
| fairly sure | 25% | 91% |
| maybe | 16% | 61% |

### Foe reads player: by perception gap

| bin | n | today: told | today: exact card | cue: today's class right | cue: fine class right | cue: broad right | cue: exact card | techniques named, today / cue | cue names wrong |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a. ≤ -5 | 5105 | 95% | 30% | 88% | 85% | 88% | 60% | 0% / 46% | 0% |
| b. -4..-1 | 5568 | 95% | 48% | 92% | 89% | 89% | 76% | 0% / 58% | 0% |
| c. 0 | 9251 | 95% | 95% | 88% | 84% | 88% | 59% | 95% / 47% | 0% |
| d. +1..+4 | 4880 | 94% | 94% | 91% | 88% | 90% | 77% | 92% / 64% | 0% |
| e. ≥ +5 | 2194 | 96% | 96% | 90% | 88% | 93% | 83% | 94% / 82% | 0% |
| all, out-read (gap ≥ 0) | 16325 | 95% | 95% | 89% | 85% | 90% | 67% | 94% / 56% | 0% |
| all, out-read by the actor (gap < 0) | 10673 | 95% | 39% | 90% | 87% | 89% | 68% | 0% / 51% | 0% |

### Foe reads player: by read margin

| bin | n | today: told | today: exact card | cue: today's class right | cue: fine class right | cue: broad right | cue: exact card | techniques named, today / cue | cue names wrong |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a. < -6 | 2244 | 96% | 67% | 81% | 76% | 87% | 17% | 65% / 14% | 0% |
| b. -6..-3 | 5020 | 94% | 60% | 85% | 78% | 83% | 46% | 51% / 36% | 0% |
| c. -3..0 | 8445 | 95% | 64% | 90% | 86% | 89% | 69% | 50% / 59% | 0% |
| d. 0..3 | 6266 | 95% | 79% | 93% | 91% | 92% | 86% | 58% / 75% | 0% |
| e. 3..6 | 4066 | 96% | 96% | 95% | 93% | 94% | 87% | 95% / 82% | 0% |
| f. ≥ 6 | 957 | 100% | 100% | 92% | 92% | 100% | 90% | 100% / 90% | 0% |
| out-read in the cue model (margin ≥ 0) | 11289 | 96% | 87% | 93% | 92% | 93% | 87% | 76% / 79% | 0% |

### Foe reads player: confidence words

| word | share of points | class right |
| --- | --- | --- |
| sure | 56% | 99% |
| fairly sure | 23% | 92% |
| maybe | 16% | 58% |

## Feints (both directions)

### Feints: the actor wears an attacking technique's cues while doing something else

| observer | n | fooled (reads the bait's class) | fooled, fairly sure or sure | feint suspected | reads the true class |
| --- | --- | --- | --- | --- | --- |
| a. insight | 2575 | 0% | 0% | 0% | 100% |
| b. sharp and expert in its art | 3322 | 47% | 31% | 25% | 19% |
| c. expert, not sharp | 8199 | 66% | 55% | 0% | 21% |
| d. sharp, not expert | 177 | 76% | 58% | 0% | 5% |
| e. neither | 1983 | 84% | 72% | 0% | 4% |
