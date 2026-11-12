Reference: 42 states, mean 6690 exchanges and 4.6 s each.
Reference noise (32 seeds against the other 32): agreement 76%, within 2 of best 86%, regret mean 0.8, worst 9.5.

| Approach                                                | Category      | ms median | ms p95 | exchanges | model evals | agree | near best | regret mean |                    regret worst | daze@0 plays              | hide@0 plays          | notes                                               |
| ------------------------------------------------------- | ------------- | --------: | -----: | --------: | ----------: | ----: | --------: | ----------: | ------------------------------: | ------------------------- | --------------------- | --------------------------------------------------- |
| baseline: prototype beam d2 w4 r16                      | exact         |      1222 |   2080 |      1708 |           0 |   62% |       83% |         2.4 |      51.4 (assassin-v-sensor@5) | step-back > spark         | veil > blade          |                                                     |
| E1 prefix sharing (d2 w4 r16)                           | exact         |       701 |   1056 |       970 |           0 |   62% |       83% |         2.4 |      51.4 (assassin-v-sensor@5) | step-back > spark         | veil > blade          |                                                     |
| greedy d1 r16                                           | width/depth   |        72 |    143 |       126 |           0 |   52% |       64% |        17.6 |                  194.8 (hide@2) | spark + default           | blade + default       |                                                     |
| d2 w1 r16                                               | width/depth   |       329 |    543 |       445 |           0 |   67% |       83% |         3.9 |      51.4 (assassin-v-sensor@5) | flash > burst             | veil > blade          |                                                     |
| d2 w2 r16                                               | width/depth   |       369 |    546 |       624 |           0 |   62% |       81% |         2.9 |      51.4 (assassin-v-sensor@5) | step-back > spark         | veil > blade          |                                                     |
| d2 w2 r8                                                | width/depth   |       171 |    281 |       310 |           0 |   57% |       81% |         2.8 |      44.4 (assassin-v-sensor@5) | flash > burst             | veil > blade          |                                                     |
| d2 w4 r8                                                | width/depth   |       308 |    473 |       484 |           0 |   60% |       83% |         1.7 | 24.3 (counterer-v-powerhouse@5) | flash > burst             | veil > blade          |                                                     |
| d2 w4 r4                                                | width/depth   |       134 |    238 |       239 |           0 |   55% |       81% |         2.7 |      44.4 (assassin-v-sensor@5) | flash > burst             | veil > blade          |                                                     |
| d2 w1 r4                                                | width/depth   |        60 |    116 |       111 |           0 |   48% |       79% |         3.2 |      44.4 (assassin-v-sensor@5) | flash > burst             | veil > blade          |                                                     |
| d2 w4 r32                                               | width/depth   |      1143 |   1692 |      1945 |           0 |   86% |       98% |         0.2 | 2.5 (versatile-v-illusionist@2) | flash > burst             | veil > blade          |                                                     |
| d3 w2 r8                                                | width/depth   |       455 |    635 |       734 |           0 |   57% |       81% |         2.6 |                   41.2 (daze@5) | step-back > flash > burst | veil > blade > strike |                                                     |
| selective depth r8 w2 (margin 10)                       | width/depth   |       150 |    302 |       268 |           0 |   57% |       81% |         2.8 |      44.4 (assassin-v-sensor@5) | flash > burst             | veil + default        | {"deepened":33,"shallow":9}                         |
| selective depth r16 w4 (margin 15)                      | width/depth   |       530 |    846 |       896 |           0 |   62% |       83% |         2.4 |      51.4 (assassin-v-sensor@5) | step-back > spark         | veil + default        | {"deepened":37,"shallow":5}                         |
| racing 4→32 keep 4                                      | goal-directed |      1105 |   2057 |      1136 |           0 |   79% |       95% |         0.7 | 24.3 (counterer-v-powerhouse@5) | flash > burst             | veil > blade          |                                                     |
| racing 2→16 keep 2                                      | goal-directed |       343 |    539 |       563 |           0 |   67% |       88% |         0.8 |                   10.6 (daze@2) | step-back > spark         | veil > blade          |                                                     |
| GOAP pairs r16                                          | goal-directed |       211 |    364 |       333 |           0 |   67% |       83% |         2.1 |                   41.2 (daze@5) | flash + default           | veil + default        |                                                     |
| GOAP pairs r8                                           | goal-directed |        96 |    171 |       166 |           0 |   57% |       86% |         1.7 | 24.3 (counterer-v-powerhouse@5) | flash + default           | veil + default        |                                                     |
| GOAP pairs + w1 r8                                      | goal-directed |       160 |    248 |       259 |           0 |   57% |       86% |         1.7 | 24.3 (counterer-v-powerhouse@5) | flash + default           | veil + default        |                                                     |
| approx model d2                                         | approximate   |         5 |     13 |         0 |         197 |   43% |       60% |         8.0 |      55.8 (assassin-v-sensor@5) | flash > burst             | veil > blade          |                                                     |
| approx model d3                                         | approximate   |        73 |    151 |         0 |        3698 |   48% |       64% |         7.3 |      45.3 (medic-v-counterer@5) | flash > flash > burst     | veil > blade > blade  |                                                     |
| hybrid: approx top 2 → real r8                          | approximate   |       138 |    193 |       209 |         197 |   45% |       64% |         7.0 |      55.8 (assassin-v-sensor@5) | flash > burst             | veil > blade          |                                                     |
| hybrid: approx top 3 → real r16                         | approximate   |       368 |    534 |       628 |         197 |   52% |       71% |         5.6 |      44.4 (assassin-v-sensor@5) | step-back > spark         | veil > blade          |                                                     |
| leaf memo, fine key (d2 w4 r16)                         | cached        |       579 |    849 |       907 |           0 |   62% |       83% |         2.4 |      51.4 (assassin-v-sensor@5) | step-back > spark         | veil > blade          | leaf hits 2668/35459 (8%)                           |
| leaf memo, coarse key (d2 w4 r16)                       | cached        |       506 |    694 |       845 |           0 |   62% |       83% |         2.4 |      51.4 (assassin-v-sensor@5) | step-back > spark         | veil > blade          | leaf hits 5269/35459 (15%)                          |
| GOAP pairs r4                                           | goal-directed |       107 |    175 |        83 |           0 |   50% |       81% |         3.0 |      44.4 (assassin-v-sensor@5) | flash + default           | veil + default        |                                                     |
| racing 1→8 keep 2                                       | goal-directed |       208 |    333 |       279 |           0 |   52% |       76% |         4.3 |      52.0 (assassin-v-sensor@5) | step-back > spark         | veil > blade          |                                                     |
| GOAP candidates raced 2→16 keep 2                       | goal-directed |        78 |    136 |       127 |           0 |   60% |       81% |         2.8 |                   41.2 (daze@5) | step-back + default       | veil + default        |                                                     |
| GOAP candidates raced 4→32 keep 2                       | goal-directed |       149 |    293 |       253 |           0 |   71% |       83% |         2.5 |                   41.2 (daze@5) | flash + default           | veil + default        |                                                     |
| decision table, coarse key, offline (fallback d2 w2 r8) | cached        |        99 |    242 |       167 |           0 |   57% |       81% |         2.8 |      44.4 (assassin-v-sensor@5) | flash > burst             | veil > blade          | table 325 entries, hits 20/42; {"hit":20,"miss":22} |

| Approach                          | Scenario    |   won | dealt | taken | ms / decision | usual openings                                   | notes |
| --------------------------------- | ----------- | ----: | ----: | ----: | ------------: | ------------------------------------------------ | ----- |
| default plan                      | daze-finish |  2/30 |    67 |    99 |             0 |                                                  |       |
| default plan                      | hide-lethal | 11/30 |    87 |    66 |             0 |                                                  |       |
| E1 prefix sharing (d2 w4 r16)     | daze-finish |  6/30 |    51 |    50 |           411 | step-back > step-back ×18, step-back > spark ×12 |       |
| E1 prefix sharing (d2 w4 r16)     | hide-lethal | 30/30 |   100 |     6 |           544 | veil > blade ×30                                 |       |
| GOAP pairs r8                     | daze-finish | 15/30 |    80 |    61 |           104 | flash > burst ×22, flash > flash ×8              |       |
| GOAP pairs r8                     | hide-lethal | 30/30 |   100 |     6 |            88 | veil > blade ×30                                 |       |
| approx model d2                   | daze-finish |  4/30 |    78 |    68 |             2 | flash > burst ×22, flash > flash ×8              |       |
| approx model d2                   | hide-lethal | 30/30 |   100 |     6 |             5 | veil > blade ×30                                 |       |
| racing 2→16 keep 2                | daze-finish |  6/30 |    50 |    52 |           200 | step-back > step-back ×18, step-back > spark ×12 |       |
| racing 2→16 keep 2                | hide-lethal | 30/30 |   100 |     6 |           207 | veil > blade ×30                                 |       |
| d2 w1 r4                          | daze-finish | 19/30 |    87 |    76 |            35 | flash > burst ×22, flash > flash ×8              |       |
| d2 w1 r4                          | hide-lethal | 30/30 |   100 |     6 |            30 | veil > blade ×30                                 |       |
| GOAP candidates raced 4→32 keep 2 | daze-finish | 14/30 |    81 |    64 |           103 | flash > burst ×22, flash > flash ×8              |       |
| GOAP candidates raced 4→32 keep 2 | hide-lethal | 30/30 |   100 |     6 |           119 | veil > blade ×30                                 |       |
| hybrid: approx top 2 → real r8    | daze-finish | 15/30 |    80 |    62 |            76 | flash > burst ×22, flash > flash ×8              |       |
| hybrid: approx top 2 → real r8    | hide-lethal | 30/30 |   100 |     6 |            78 | veil > blade ×30                                 |       |
| greedy d1 r16                     | daze-finish |  2/30 |    61 |    99 |            45 | spark > spark ×30                                |       |
| greedy d1 r16                     | hide-lethal | 12/30 |    87 |    66 |            56 | blade > blade ×30                                |       |
| d2 w4 r32                         | daze-finish | 19/30 |    88 |    77 |           635 | flash > burst ×22, flash > flash ×8              |       |
| d2 w4 r32                         | hide-lethal | 30/30 |   100 |     6 |           719 | veil > blade ×30                                 |       |

| Approach (uncontended)            | silent | ms median | ms p95 | exchanges | µs / exchange |
| --------------------------------- | ------ | --------: | -----: | --------: | ------------: |
| fixed cost (candidate list)       |        |       0.0 |    0.1 |         0 |             0 |
| E1 prefix sharing (d2 w4 r16)     | no     |     567.9 |  957.6 |       970 |           615 |
| E1 prefix sharing (d2 w4 r16)     | yes    |     443.7 |  801.1 |       970 |           472 |
| d2 w4 r32                         | no     |    1184.3 | 1691.7 |      1945 |           583 |
| d2 w4 r32                         | yes    |     800.7 | 1143.0 |      1945 |           408 |
| racing 2→16 keep 2                | no     |     349.8 |  594.6 |       563 |           658 |
| racing 2→16 keep 2                | yes    |     257.0 |  377.6 |       563 |           429 |
| GOAP candidates raced 4→32 keep 2 | no     |     176.3 |  264.0 |       253 |           691 |
| GOAP candidates raced 4→32 keep 2 | yes    |     105.4 |  216.6 |       253 |           496 |
| GOAP pairs r8                     | no     |      95.8 |  159.3 |       166 |           605 |
| GOAP pairs r8                     | yes    |      81.1 |  159.1 |       166 |           519 |
| d2 w4 r8                          | no     |     296.5 |  452.9 |       484 |           601 |
| d2 w4 r8                          | yes    |     217.4 |  361.5 |       484 |           453 |
| d2 w1 r4                          | no     |      68.7 |  105.2 |       111 |           602 |
| d2 w1 r4                          | yes    |      49.7 |   68.5 |       111 |           433 |
| hybrid: approx top 2 → real r8    | no     |     130.7 |  196.9 |       209 |           603 |
| hybrid: approx top 2 → real r8    | yes    |     103.2 |  182.7 |       209 |           521 |
| approx model d2                   | no     |       3.8 |    6.8 |         0 |             0 |
| approx model d2                   | yes    |       3.2 |    5.5 |         0 |             0 |
