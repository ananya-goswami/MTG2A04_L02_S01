# MTG2A04_L02_S01 — ब्लॉक से नापें! (Measuring distances in non-standard units)

**Grade:** G2 · **LO:** MTG2A04_L02 · **Attribute:** A04 (Measurement) · **Type:** CORE

**Skill description:**
> ब्लॉक जैसी एक ही तरह की इकाई को एक कतार में, बिना जगह छोड़े रखकर, गिनकर किसी चीज़ की लंबाई नापता है।

> Code resolved via `skill_lookup.py MTG2A04_L02_S01` against the Green-Flagged Skills G2-G3 sheet — GREEN-FLAGGED, not inferred.

**Slides:** 13 · Tutorial 3 / Guided 5 / Practice 5 (the celebration counts as practice)

## The lesson, slide by slide (rebuilt 2026-09-30 to the SME deck, pages 2-14)
Review: "follow the ppt slides instructions". Each slide does what its deck page says, with the page's own OST and VO -
except the wrong-answer help, which follows the FLN hint logic sheet (below).
Every measuring slide uses one kit — `app.js` `MDK` (`[measure kit]`) + CSS `[measure kit]`: the first screen's plain
blue cubes (slices of `cubes_blue_row.webp`; the deck's mock-ups draw yellow blocks), the red toy box (the supplied art,
2026-09-30: `toybox_back.webp` behind the blocks - its six painted smiling cubes painted out and the inside refilled
from the box's own red - and `toybox_front.webp`, the front wall with its stars and feet, over them; `MDK.toybox` places
the blocks where the painted cubes sat - 2 rows as painted, 3 rows stacked closer, 1 row at the front - as a
tossed-in pile, not a grid (`PILE`: each a little off its cell and tilted 2-8 degrees; square again once picked up;
G1 holds its cubes in a woven basket instead - `MDK.basket`, see G1),
dashed end lines with a start and a finish flag, the hand, counting digits, ✓ / ✕ marks and the result plate. Moves
animate the `translate` property, never `transform`: a lifted block and the pressing hand carry a CSS `scale`, which
multiplies anything in `transform` (the hand used to drift up to 84px off its block).

### Hints = the FLN hint logic sheet (review 2026-09-30: "for the hint part follow the excel sheet, not the slides")
| format (sheet row) | slides | attempt 1 | attempt 2 | after the last attempt |
|---|---|---|---|---|
| MCQ – 2 options | T1 tables, G4 mats, P1 chairs | the tapped one shakes and returns, nothing shown; "दोनों विकल्पों को ध्यान से देखिए और सोचिए।" | it shakes; after a moment the right one glows softly; "ध्यान से देखिए और सही विकल्प चुनिए।" | attempt 3: the answer is shown (T1: the hand taps the long table's leg) and the slide moves on |
| MCQ – 3 options | G1–G3 + pillow, the answer cards | the card shakes (red border) and returns; "फिर से सोचिए और विकल्पों को ध्यान से देखिए।" | it shakes; after a moment the right card glows softly; "चित्र को ध्यान से देखिए और सही उत्तर पहचानिए।" | attempt 3: shown, on |
| Drag & Drop | P2, P3 match (per box), P4 classroom (per object) | the wrong drop area shakes, the item returns; "फिर से सोचिए। ध्यान से देखिए और सही जगह चुनिए।" | the same, then the right area glows softly and the hand points at it; "ब्लॉक्स को ध्यान से गिनिए और सही जगह पर रखिए।" | attempt 3: it moves in by itself |
| Drag & Drop (laying blocks) | T2, T3 child turn, G1–G3, P4 measuring (per tile) | the block returns; "फिर से सोचिए। ध्यान से देखिए और सही जगह चुनिए।" | it returns, the next tile lights up and the hand shows the drag; the rule "हर अगला ब्लॉक वहीं से शुरू करें, जहाँ पिछला खत्म हुआ था।" | the same again |

- Right answers: the sheet's "locks / glows + sparkle or confetti". Its praise line where the deck had none (T1
  "शाबाश! आपने सही चुना।", every right drop "शाबाश! सही जगह पर रखा।"); where the deck's own line names the answer
  ("शाबाश! पलंग की लंबाई 8 ब्लॉक्स है।"), that line is kept.
- Confetti only when a slide's whole game is done (review 2026-10-01: "remember confetti will only drop after all 3
  are correctly placed - that means that slide's game is perfectly completed"): once, at the end - never for one of
  several steps (P2 / P3's tags, P4's objects: each right one gets its green, the SFX and the praise only) - and not
  when the answer had to be shown (as on the MCQ slides).
- Adapted, as the sheet allows per file: its Drag & Drop lines are written for reading games ("शब्द को ध्यान से
  सुनिए", "शब्द की आवाज़ पहचानिए"), so here "ध्यान से देखिए" and "ब्लॉक्स को ध्यान से गिनिए" take their place. The sheet
  stops at attempt 2 (or 3); after that the answer is shown so no child gets stuck, and it does not score as correct.
- Kept from the decks, since the sheet has no row for it: the idle ghost drag (6s) while laying blocks, and the hand
  on the classroom tray after 8s.
- Code: `MDK.shake` (the kit's lateral buzz, recipes 11/20), `MDK.softGlow` (the kit's hint glow, recipe 12: a green ring
  for cards and areas, a green glow that follows a picture's shape), the ladder in `MDK.childMeasure` (`cfg.hints`);
  the sheet's lines are `vo_hint_mcq2_1/_2`, `vo_hint_mcq3_1/_2`, `vo_hint_dd_1/_2`, `vo_ok_dd` (and was `vo_ok_mcq2`, T1's
  praise - removed 2026-10-08, the deck's page 2 "Correct Response: SFX"), recorded
  in the lesson's voice and re-timed like every other clip (see `VO_MANIFEST.md`).

### The slides
- **T1 — page 2, `PICK_EXTREME`.** The long and the short table (`obj_table_long.webp` 450px - the orange top on red
  legs / `obj_table_short.webp` 308px - the yellow top on brown legs; supplied art 2026-09-30, cropped tight, its
  faint stray pixels cleared so the outline stays clean) stand on the card's calm floor (CSS `[T1 tables]`: light wood under the grid-paper
  wall, a skirting line, soft shadows), a little right of centre so Swifty's corner stays free. Tap the longer one.
  Right = SFX + confetti (no VO - the deck's "Correct Response: SFX", review 2026-10-08 "follow the ppt"; it used to
  say "शाबाश! आपने सही चुना।", `vo_ok_mcq2`, removed) + a clean green outline that follows the table's own shape (FLN
  animation kit recipe 21, engine A, `ol ol-alpha`: four zero-blur passes + a soft glow) with the kit's small pop, then
  on. Wrong = the deck's own line (review 2026-10-08: "follow this instruction VO when selected wrong option as in the
  ppt" - page 2 "Incorrect: Pulsate/hand nudge on the long table and play VO: यह टेबल ज्यादा लंबी है।"; it was the
  sheet's MCQ – 2 ladder, `data.wrong_cue "sheet"`, still in the code): `data.wrong_cue "deck"` - every wrong tap the
  tapped table shakes and returns, the long table pulses (MDK.softGlow, green, following its shape) and the hand taps
  the middle of its top (`options[].tap` [0.5, 0.2], the point on the picture - review 2026-10-08 "the hand nudge tap
  should come at the center of the table"; was its front leg) with the kit's tap ripple, and "यह टेबल ज्यादा लंबी है।"
  plays (`audio.try_again` = `hint` = `reveal` = `vo_p2_fb`); the child then taps it. After a 3rd wrong tap the engine
  shows the answer with the same line and moves on. Never a red box or a red glow on a table (review 2026-09-30).
- **T2 — page 3, `MEASURE_DEMO`.** The long table on the floor and the toy box. Heading VO; VO1 (`vo_p3_explain_a/_b`):
  the start line and its flag pulse, then the finish; VO2 (`vo_demo_start`): Swiftee's hand drags blocks 1 and 2, each
  counted aloud with a digit and a ✓; VO3 (`vo_rule_a/_b/_c`): the last block's end glows, a block set down with a GAP
  (boxed red, ✕, wiggles, taken back), then one OVERLAPPING (the same); the child VO with a bouncing arrow on the next
  tile. The child drags blocks 3-6: a drop on the next tile snaps flush and is counted aloud with its digit; anywhere
  else - the sheet's block ladder; idle 6s — the ghost drag. Done: the "6 ब्लॉक्स" badge rises OUT OF THE EMPTIED TOY
  BOX (review 2026-09-30: "this can come inside the side red box only"; `MDK.boxPlate`: it starts small, hidden behind
  the box's front wall, springs up over ~0.55s and stands in the box, its foot behind the wall; the box no longer fades
  out; the badge lost its sparkle burst - yellow rays and a fuzzy green glow - everywhere), confetti, Swiftee cheers,
  `vo_p3_done`, आगे. T3 the same ("9 ब्लॉक्स", the badge at least 150px wide in its small box).
- **T3 — page 4, `MEASURE_DEMO` (axis y).** The door, measured from its bottom to its top — the same script with the
  door's lines (`vo_p4_head`, `vo_p4_explain_a/_b`, `vo_demo_start`, `vo_rule_a/_b/_c`, `vo_p4_child`, `vo_p4_done`): a
  column of 9 beside the door using the card's full height, the box on its left, clear of आगे.
- **G1 bed — page 5, G2 almirah + G2b pillow — page 6, G3 fridge — page 7, `MEASURE_ASK`.** The child measures first:
  every block dragged from the box onto the object's row (a column for the almirah and the fridge) — no digits, no
  counting; a block not laid flush - the sheet's block ladder; idle 6s the ghost drag. Then the header becomes the
  question (its VO) and three answer cards "<k> ब्लॉक्स" come up: the sheet's MCQ – 3 ladder. Right — SFX + confetti +
  the deck's correct VO.
  **G1 follows the deck's page 5 as it is (review 2026-10-08: "in this game screen follow the ppt instructions as it is
  for everything"; `data.wrong_cue: "deck"`, app.js MEASURE_ASK `[deck]`):** a block not laid flush only goes back (the
  robot's vanish + a new cube on its lid - no VO, no lit tile, no ghost; the idle ghost drag stays). Wrong answer 1 - the
  option wiggles, the laid blocks glow (gold with a white rim, swelling a little, three pulses) and "ब्लॉक्स को एक बार फिर
  गिनिए।" plays (`vo_try_again`, restored); 2 - each block lights up in turn as it is counted aloud, एक ... आठ
  (`vo_num_1`-`8`, CSS `.mq-counting`); 3 on - a counting digit under each block, then the hand on "8 ब्लॉक्स" (no VO;
  the options stay open - the child taps it). Right - SFX + confetti + "शाबाश! पलंग की लंबाई 8 ब्लॉक्स है।".
  Review 2026-10-08 ("the VO is still not correct"): the question is never re-asked by itself (the deck has no
  inactivity line for it - it used to come back after 7s idle, between the attempts). Since the [vo-lock] (below) no
  tap reaches the options while any line - the question or a rung's - is said; each one plays to its end first.
  **G2 almirah follows the deck's page 6 the same way (review 2026-10-08: "in this game screen also follow the
  recommendations exactly"; `data.wrong_cue: "deck"`):** the deck's 7 blocks again (was 5), options 6 / 7 / 8, "शाबाश!
  अलमारी की लंबाई 7 ब्लॉक्स है।" (`vo_p6_ok`, the 2026-09-28 render restored from git); wrong 2 counts एक ... सात up the
  column, wrong 3 puts the digits BESIDE the blocks (left of the column). Seven blocks only fit the tall screen at a
  53px cube (74 everywhere else) - the user chose "7 blocks, smaller cube here" over keeping 5 at 74px or 53px on
  every screen.
  **G2b pillow follows the deck's page 6 (pillow) the same way (review 2026-10-08 "same for this game screen also";
  `data.wrong_cue: "deck"`):** its count already was the deck's - 3 blocks, options 2 / 3 / 5, "शाबाश! तकिये की
  लंबाई 3 ब्लॉक्स है।" - so only the feedback changed: wrong 1 the blocks glow + `vo_try_again`; wrong 2 एक ... तीन;
  wrong 3 the digits below the row, then the hand on "3 ब्लॉक्स".
  **G3 fridge follows the deck's page 7 the same way (review 2026-10-08 "same for this game screen also"):** the deck's
  6 blocks again (was 5), options 4 / 5 / 6, "शाबाश! फ्रिज की लंबाई 6 ब्लॉक्स है।" (`vo_p7_ok`, the 2026-09-28 render
  restored from git), counting एक ... छह up the column. Six blocks fit the tall screen at a 62px cube - the user chose
  "6 blocks, smaller cube here" over keeping 5 at 74px. The deck says "digits below each block"; in a column that
  would sit on the next block, so they stand BESIDE the blocks as on G2. With G3 every MEASURE_ASK runs the deck's
  lines; `vo_hint_mcq3_1`, `vo_hint_count`, `vo_hint_drag` had no slide left and are deleted (git has them).
  **G1 (review 2026-10-01: "use this for better slide but keep the background minimal only - non distracting, so that
  the main focus is on the main gameplay")** follows the supplied mock-up: the wooden charpai with its blue-and-cream
  weave (`obj_charpai.webp`, cut out of the mock-up; it replaced the metal-legged `obj_bed.webp`), centred on the
  ground - its row's places are NOT drawn ahead: only the place the next block goes shows, while a block is dragged,
  as on every slide (the mock-up drew all 8; review: "all the white boxes all together are looking odd"; on the sand
  that place keeps its light blue, pulsing to a stronger one) - and the cubes in the mock-up's woven basket on its right instead of the
  toy box (`data.holder: "basket"`, `MDK.basket`: `basket_back.webp` - the basket with its seven painted cubes removed
  and the inside they hid rebuilt from its own weave - behind the blocks, `basket_front.webp` - the front rim and wall -
  over them; the blocks lie in rows from the front rim, 3 + 3 + 2, each a little askew). The pile obeys gravity
  (review: "after one by one cubes going, the other cubes on the tokari should get in middle, just like the correct law
  of physics"): after every block laid, the ones left take the pile of their own count - its lowest places first,
  centred; each the place that costs it least, never one above it - and drop there, faster as they fall, with a small
  rebound and squash, the lowest first (`settle` in `MDK.basket`, called from MEASURE_ASK's `onHit`); a block grabbed
  mid-fall is put in its place first. Every holder does this now (review 2026-10-01: "cubes can't be in air when other
  cubes are taken out ... best example is the charpai screen cube box, implement from there"): the settle is the kit's
  `pileSettle(layout)`, shared by the basket, the room holders (G2 pink basket, G2b cloud tub, G3 woven basket - their raised
  back block used to hang in the air once a front one was taken) and T2's toy box (now settles on the child's drops too;
  its 6-block start is unchanged). Each holder's `layout(m)` fills the front row first and centres what is left on it.
  Tested taking the front cubes first on G1 / G2 / G2b / G3 / T2: nothing is left above a free front place.
  Spare cubes (review 2026-10-01: "throughout the game in the cube boxes there can be left 1 or 2, sometimes no cubes
  in the basket"): `data.spare` - the box holds n + spare, the child stops at the end line, and the spare ones stay in
  it. T2 2 (8 in the box; Swifty's demo takes the top 2, so the child's turn starts on the old 3 + 3), G1 1, G2 0 (its
  small pink basket would stack 3 high into the calendar), G2b 1, G3 1 (it was 2: in its smaller basket 5 cubes pile neatly 2 + 2 + 1, review
  2026-10-01); T3's painting keeps its own (the man is left
  holding one), P4's row already has n + 2. A holder with spares left no longer fades at the question (only an empty
  one does), and T2's result badge rises out of the box to stand ON its spare cubes (`MDK.boxPlate(box, text, rest)`). The backdrop is the mock-up's outdoor scene (`data.bg: "yard"`,
  `#stage[data-bg]`; review: "this should have outdoor background scene, also the mango one I want"): CSS sky strip,
  sand wall, its darker plinth, sand ground - the wall meets the ground half-way up the charpai (`--horizon`, set by the
  slide) - and over them `bg_yard_top.webp`, cut out of the mock-up: its leafy canopy top-left, its mango tree top-right
  (trunk, leaves, two mangoes, the dappled shade of its leaves on the wall), two soft bricks. Where the mock-up's own
  header bar and Swifty hid the trees (ours sit a few px apart) they are mended: the canopy behind its Swifty mirrored
  from beside it, every tree's lower edge carried under the bar, the trunk behind the bar's end filled from the trunk
  round it. Nothing in it moves. The charpai and its row sit low on the ground, the row just above the answers' place.
  Review 2026-10-01 ("reduce the floor space ... so that the charpai comes in the center, along with the tokri"):
  `data.fill "stage"` (as G2b) - the scene uses the height kept for the hidden आगे, so the charpai, its row, the
  flags, the basket and the wall's line all sit 90px lower (charpai 174-397 -> 262-488 of 750); the charpai stays
  centred across, the basket beside it.
  The OST / VO stay the deck's ("पलंग ..."; the mock-up writes खटिया).
- **G4 mats — page 8, P1 chairs — page 9, `COMPARE_MEASURED`.** Two objects side by side, already measured: blocks
  flush along each mat's long side (a row under it) / up beside each chair from the floor, no numbers. Tap the longer /
  taller one. Right — it lifts with a green glow, the other greys, SFX + confetti, "6 ब्लॉक्स" / "7 ब्लॉक्स" under the
  mats ("4" / "5" beside the chairs), the deck's correct VO. Wrong — the sheet's MCQ – 2 ladder (P1). **G4 follows the
  deck's page 8 as it is (review 2026-10-08: "follow the recommdations exactly"; `data.wrong_cue: "deck"`):** the deck's
  6 / 7 blocks (were 5 / 6 - the user chose "6 and 7, cube 72px": the two rows fit at 72px, 74 elsewhere); wrong 1 -
  the tapped mat wiggles, then both mats' blocks light up one by one, first then second, a digit below each (they
  stay), each counted aloud (एक ... छह, then एक ... सात), then only the question again (`vo_p8_reask`, restored from
  git; it plays to its end - the [vo-lock]); wrong 2 on - it wiggles and the hand nudges the longer mat (no VO, nothing locked);
  the child's tap on it then gets the correct SFX only (the user chose "SFX only, as written" - it lights up, the
  counts show, no correct VO). No idle re-ask. The digits fade as the counts come in. `vo_hint_compare` and
  `vo_hint_tap` had no slide left and are deleted (git has them). **P1 the same, the deck's page 9 (review 2026-10-08:
  "in this game screen also follow the recommdations exactly"):** the deck's 4 / 5 blocks (were 3 / 4), the cube 74px
  again - the user chose "4 and 5, 74px", so `data.zoom` is gone (at 4 / 5 the height capped it at 75.6px anyway);
  wrong 1 counts both chairs up their columns, digits BESIDE the blocks, then "अब बताइए, कौन-सी कुर्सी ज़्यादा ऊँची है?"
  (`vo_p9_reask`, the deck's own "ऊँची", restored from git); wrong 2 the hand on the taller chair, its tap the whole
  correct response WITH "शाबाश! यह कुर्सी ज़्यादा लंबी है।" (review 2026-10-08 "last VO is still missing in this" - G4
  keeps the SFX only: its `data.nudge_sfx_only`). `vo_hint_mcq2_1/_2` had no slide left and are deleted. The chairs are in the
  deck's order, the 4-block chair first (`obj_chair_short.webp`, `obj_chair_tall.webp` — split from the deck's two-chair
  picture). G4's counts (review 2026-10-01: "replace these boxes with the correct box layout, take help from
  HI01H01_L02_S04 — only in this slide"): `data.count_box: "card"` shows each count in that game's answer card instead
  of the gold badge — white, a pale blue edge, 22px corners, its soft navy shadow, navy 800 26px text (CSS
  `[count-card]`, `.cm-count`); the longer mat's card in its correct green (`--correct` / `--correct-bg`), both popping
  in one after the other just under their rows. Then (review 2026-10-01: "increase the size of these 2 boxes and shift
  them a little down, and the right answer will only have a green outline"): 76px tall (was 60), 32px text (was 26),
  26px corners, 18px lower (`margin-top`); the right one is the same white card with its shadow - only its outline turns
  green (3px `--correct`, no green fill). P1 too (review 2026-10-01: "same for this screen also"): `data.count_box:
  "card"`, each card beside its chair's column of cubes, centred on it.
  P1's riders (review 2026-10-01: "add cat and turtle only on the chair - cat a little big and turtle small, non
  distracting" + "add small motion in these 2"): `assets/prop_cat.webp` (the sleeping cat) and `prop_turtle.webp`, cut
  out of the supplied cat-on-chair / turtle-on-chair pictures by their own outlines (their chairs are not P1's - other
  proportions - so only the animals are used, as layers on P1's own chairs, not painted in).
  `data.riders [{src, ar, w, motion}]`, one on each chair's `item.seat {cx, y}`, and `data.riders_random` (review
  2026-10-01: "the event should stay random - sometimes the turtle will be placed on the long chair, sometimes the short
  chair, same for the cat"): the two are shuffled onto the chairs each time P1 opens. An animal's `w` is in blocks, so
  it is the same size on either chair: the cat 1.265 blocks wide (0.70 of the short chair's seat), the turtle 0.611
  (0.32 of the tall one's; 0.45 first - review 2026-10-01: "reduce the size of turtle"). A seat's `y` is where an
  animal's lowest point rests, about three quarters of the way across its cushion from the back (short 0.502, tall 0.541
  of the chair), centred - both animals well under either chair's top, so the heights compared are unchanged.
  CSS `[rider]`: each drops in with its chair, shakes with it on
  a wrong tap and dims with it; the cat breathes (a 3.6s swell of 4%), the turtle sways a degree or two (3.2s) -
  nothing under reduced motion.
- **P2 — page 10, P3 — page 11, `MATCH_MEASURE`.** Left, three cards in the deck's yellow / blue / green, each object
  already measured with dashed lines at its two ends — P2: the bench (7, a row on top), the blackboard (5, on top), the
  stool (3, a column on its left); P3: the window (5), the water bottle (3), the TV (4, on top). Right, the boxes in
  the deck's shuffled order (3 / 7 / 5 and 5 / 4 / 3). Drag a box onto an object: right — it snaps into that card's
  slot, green, SFX + "शाबाश! सही जगह पर रखा।" (the confetti once, with the third); wrong — the sheet's Drag & Drop ladder, counted per
  box (the hand points at the box's right slot; the boxes are spaced so the hand never covers the next one). All three
  — `vo_match_ok`, on. The art is the supplied HD art (P2's pictures with the blocks drawn on; P3's cards, with the
  object, its blocks and its magnet laid on by the game - one block size on all three cards) - see "P2 / P3 as photos".
  **P2 follows the deck's page 10 as it is (review 2026-10-08: "in this game screen also follow the recommdations
  exactly"):** the deck's counts again - bench 7, blackboard 5 (rows), stool 3 (a column) - were 4 / 3 / 2; the boxes
  in its order 3 / 7 / 5; `data.ppt_hints` as P3 (wrong 1 the line bounces back, no VO - `try_again` removed; wrong 2
  that object's blocks light up with digits 1, 2, 3 ... shown, not said; wrong 3 on the hand on the right box); a right
  pair locks + the SFX; all three `vo_match_ok`. The shared P2 / P3 cube stays 29px and the cards 241 x 171 (P3's
  5-block window still sets them), so P3 does not change. The digits on these two slides are drawn at .82 (26px) so
  the bench's seven sit one per cube (CSS `.mr.mr-stack .md-num`).
  The 2nd rung's digits are a hint for that one object (review 2026-10-08 "why is this still present afterwards?" -
  they used to stay to the end): they fade once that object is matched, or at the end (`clearCount`, P2 and P3).
- **P4 — pages 12-13, `CLASSROOM_FIT`** (replaces the old P4 and P5). The classroom (`scene_classroom.svg`: the wall
  and the tiled floor; its bunting, clock, window and door the supplied HD pictures) with four empty spaces, each with a strip of faint
  blocks and its size: the blackboard's on the wall (6, लंबाई), the chair's beside the window (4, ऊँचाई), the small
  almirah's in the corner (5, ऊँचाई), the bench's on the floor between two markers (8, लंबाई). The tray below: बेंच,
  छोटी अलमारी, कुर्सी, ब्लैकबोर्ड. After the intro VO the child taps any object: it enlarges in the centre, the
  classroom fades out, its blocks (two spare) wait in the tray, and the child measures it — no idle ghost, no start
  pulse, no counting VO, no target outlines; a block not laid flush - the sheet's block ladder. The blocks stay on it;
  the classroom returns, its spaces pulse, and the measured object waits in the tray: dragged into the right space it
  snaps in and stays (SFX + "शाबाश! सही जगह पर रखा।"; the confetti once, with the fourth); into another - the sheet's Drag & Drop ladder, per
  object. The deck's VO names the bench, so "बेंच को ब्लॉक से मापिए।" / "अब बेंच के लिए सही जगह चुनिए।" play when the
  bench is the first object; the next objects' instructions play without VO (the header still names each one). After
  the fourth, on. Idle 8s on the tray: the hand points at it (flow only).
  **P4 follows the deck's page 13 as it is (review 2026-10-08: "follow the recommdations exactly"; `data.wrong_cue:
  "deck"`, app.js CLASSROOM_FIT `[deck]`):** the deck's 6 / 5 / 8 / 4 - board 6, almirah 5 (was 3), bench 8, chair 4
  (was 2): the two upright spaces grew upward on the picture (chair y 263, its foot unchanged; the almirah's foot moved
  25px forward onto the floor, y 207, so its top clears the painted clock). Measuring: ONE block waits at the source
  place (the rest stacked under it - each one taken shows the next); a block not flush just goes back - no hints, no
  ghost. The FIRST object picked - any of the four - gets its own two lines (`audio.measure_<id>` / `place_<id>`; the
  user chose "record all four": six new clips, see VO_MANIFEST); later objects run without VO. A right fit: snaps in +
  the correct SFX (no "शाबाश! सही जगह पर रखा।"); a wrong space: it shakes and the object goes back to the tray - nothing
  else (no hint, never moved in for the child). No idle hand on the tray. `vo_ok_dd`, `vo_hint_dd_1/_2` had no slide
  left and are deleted (git has them).
  Review 2026-10-01 ("use better assets in this game screen - use the previous slide's HD assets"): the bench and the
  blackboard are now P2's supplied art with its blocks taken off (`obj_bench.webp` ar 0.2856 - its top edge, hidden
  under the blocks, redrawn straight with its outline; `obj_blackboard.webp` ar 0.4544), for the drawn `.svg`s (removed);
  the chair's ar is its art's (1.7768). The almirah stays `obj_almirah.webp` (G2's is wider - it would leave the room's
  corner). Still drawn: the classroom itself (`scene_classroom.svg` - its bunting, clock, window, door, wall, floor).
  Then (review 2026-10-01: "use these hd images and replace the assets in last game screen") all eight are the
  supplied HD art, cut tight (stray specks dropped), at most 1200px:
  - the objects: `obj_bench.webp` (ar 0.3167), `obj_almirah.webp` (1.7647), `obj_blackboard.webp` (0.4833) replaced
    (P4's only); the chair is a new `obj_chair.webp` (1.7143) - `obj_chair_tall.webp` stays for P1, whose two chairs
    are one pair. Each space takes its object's new ar (the almirah's 102px wide, the chair's 84, the board's 104px
    high); the bench's space is 8px higher (y 244) so its deeper art keeps its feet in the room; the two height labels
    re-centred over their spaces.
  - the room (`data.room`, app.js [CLASSROOM_FIT]): `room_window.webp`, `room_door.webp`, `room_clock.webp` laid where
    the drawn ones were (`decor` {src, x, y, w}), and the bunting: the supplied garland sags deep - laid across the
    wall whole it would hang over the blackboard's space - so its flags were cut out one by one (by the rope's
    thickness), turned upright and set side by side in `room_flags.webp` (red, yellow, blue, green, purple, one 110 x
    103 cell each), and hung by the game every 36px along the room's own shallow rope, each on the rope's slope
    (`bunting` {rope: two quadratic curves, w 28, step, x0, hang - the rope's height in a flag}); the rope is drawn
    as the garland's (a dark brown cord, a light top). `scene_classroom.svg` keeps only the wall and the floor.
- **CEL — page 14.** No text: only the VO "शाबाश! आपने ब्लॉक्स से लंबाई मापना सीख लिया!", then the engine's आगे बढ़ें.

Signals (`signals_expected`): `slide_entered`, `slide_completed`, `pick_extreme_correct` (T1), `measure_unit_placed`
(every block laid), `cardinality_first_try` (G1-G3), `compare_correct` (G4, P1), `match_correct` (each P2/P3 pair),
`classroom_placed` (each P4 object) + `classroom_done`, `answer_wrong`, `answer_revealed`, `mastery_score`,
`lesson_completed`. Every answerable slide sends `question_started` / `question_answered` and scores first-try.

## Assets
- **Art — the objects:** `obj_table_long.webp` / `obj_table_short.webp` (T1), `obj_table_measure.webp` (T2),
  `obj_door.webp` (T3), `obj_charpai.webp`
  (G1), `obj_almirah_sock.webp` (G2), `obj_pillow.webp` (G2b), `obj_fridge.webp` (G3), `obj_mat_1.webp` /
  `obj_mat_2.webp` (G4), `obj_chair_short.webp` / `obj_chair_tall.webp` (P1), `pic_bench/blackboard/stool.webp` (P2),
  `card_window/bottle/tv.webp` + `obj_window/bottle/tv.webp` + `prop_mango/strawberry/sunflower.webp` + `note_2/3/4.webp`
  (P3), `obj_bench.webp` / `obj_almirah.webp` / `obj_chair.webp` / `obj_blackboard.webp` + `room_window/door/clock.webp`
  + `room_flags.webp` + `scene_classroom.svg` (P4). The `.webp` cut-outs are the deck's art, tight-cropped; the `.svg` art is drawn in the
  tables' style (brown wood, dark outline). All of it is `CARD.assets.image`, preloaded.
- **Art — the blocks (`assets/cubes_blue_row.webp`):** one strip of 10 plain glossy blue cubes (faces painted out),
  sliced per cube on the landing and on every measuring slide.
- **Art — the result badge:** `badge_result.webp` + `badge_star.svg` (see "Result badge" below; it replaced the kit's
  `mk_badge_blank.webp`, deleted).
- **Art — measurement kit, what is left:** `mk_sparkle.webp`. The rest of
  the old kit (the block states, the start / end markers, the gap / overlap figures, the explain pose) went with the
  slides that used it; its Swiftee poses `mk_sw_guide` / `mk_sw_cheer` went 2026-09-30 - a different drawing of her
  (see "Measuring slides: flags, lines, ✓, Swifty").
- **Art - phase-gate peek clip** (`assets/gif/peeking.webp`): rebuilt from the two supplied
  high-resolution Swifty PNGs rather than the old 73-frame clip. One fixed pair of the supplied
  large hands stays on the ledge while her head and torso rise behind it, eliminating the old
  overlapping/two-character transition. She then talks for 6.64s, blinks twice,
  and parks on a closed-mouth smile. During talk, rows 390-499 (lower jacket, both hands, and
  ledge) are pixel-identical in every frame; only the head/upper character gets the subtle bob,
  sway, and breathing scale. The visible bottom stays anchored at `y=485`. The mouth cadence follows
  the measured studio speech rhythm, but uses clean authored open/closed beak keyframes.
  The app asset is a 900x900, 9.72s animated WebP (84 frames) with loop count 1. `PG_CLIP_MS` in `app.js` is the
  matching 9720ms contract, and `PG_TALK_MS` (4140ms) its first open-mouth frame (58). (This note used to say
  500x500 / 8.0s; the asset that actually shipped was 1500x1500 / 9.72s / loop 0 until 2026-09-30, see below.)
  Rebuild: `fln-animation-toolkit/tools/make-swifty-peek-talk.py` (kit recipe 23).
- **Audio:** Hindi VO `.ogg` (Opus, aap register) — 59 clips + 1 sfx, all wired, the script taken verbatim from the SME
  review deck, slides 3-17, and (the hints) from the FLN hint logic sheet. Voice matched to HI01H01_L02_S04. See `VO_MANIFEST.md`. Missing audio → silent beat, lesson
  still plays.

## Status: 🧪 for SME review — every deck page built (2026-09-30).

## One cube colour (2026-10-05)
Review: "change all the cubes color to this blue ... throughout the game". Every live cube (MDK.cube, the landing row) is now the FIRST cube of `cubes_blue_row.webp` (its deep blue). The cubes drawn INTO art were recoloured to the same blue, each keeping its own shading: `pic_bench` / `pic_stool` / `pic_blackboard` (P2), `painting_cubes` / `painting_layers` / `painting_carrier` (T3's painting - its crayon sky untouched). `painting_upright`'s cube was already that blue.

## FLN QA checklist pass (2026-10-05)
Tagged `QA checklist 2026-10-05` in `app.js` / `style.css`.
- **Title screen:** the greeting is re-recorded ("नमस्ते दोस्तों! ... आज हम सीखेंगे, किसी चीज़ की लंबाई कैसे मापते हैं।", 9.2s);
  the speaker button is never disabled (review 2026-10-05: "this should not happen anywhere in the game" - the greyed
  `.sg-vo.is-disabled` state is removed; a tap while the greeting plays is ignored, as on every speaker); the title fx + cube row now finish with
  the greeting (fx starts at 0.3s, `SLOW` 1.2, cube `STEP` 280ms), so the play button goes live and PULSES the moment
  it ends (was: 5s later, and ~3s after the greeting); while it pulses the pencil's eyes rest on it. Play tap: `sfx_play`.
- **Audio:** standard SFX are files in `assets/sfx/` - the team's Standard SFX pack (2026-10-07), Ogg/Opus mono:
  `sfx_correct`, `sfx_wrong`, `sfx_confetti` (with every confetti burst, at 0.45 - the pack's confetti is mastered hot),
  `sfx_play` (the play button), `sfx_next` (every आगे tap). `sfx_nudge` (with every nudge hand) is still the FLN kit's
  `burst.ogg` - the pack has no nudge sound. Background music: `assets/sfx/bgm.ogg` = the team's "Standard Background
  Music 2" (the bouncy 4-min seamless loop; "1" is an 18s lo-fi loop), from the play tap on, looping, paused in the
  background. Its level is baked into the file at -33 LUFS (~14.5dB under the VO; iOS ignores media `.volume`), and it
  fades down a further 9dB under every VO clip. `bgm_game.ogg` for the practice game is not shipped (the lesson track
  carries on); to add one, encode it at the same -33 LUFS and run `tools/gen_asset_sizes.js`.
- **Phase gates:** each VO is now exactly its headline ("चलिए, शुरू करते हैं!", "चलिए, साथ में करें!", "अब आपकी बारी!"),
  so the text appears only as Swiftie says it.
- **Next button:** pulses as soon as it turns active.
- **Idle nudges:** 7s everywhere (`IDLE_MS`; the card's `nudge_timeout_ms` per phase); P2/P3 got one (the hand on the
  next box); a guided question re-asks itself after 7s idle.
- **Guided feedback - 3 layers** (G1: the deck's own page-5 lines instead - see G1 above): 1 clarify (`try_again`), 2 a strong hint with the procedure (`vo_hint_count`: count the
  blocks laid / `vo_hint_compare`: more blocks is longer), 3 the wrong options lock and the right one glows with the hand
  on it (`vo_hint_tap`) - the child taps it. Laying blocks: 1 `block_try`, 2 the rule (`vo_rule_a`), 3 the tile glows +
  the hand shows the drag (`vo_hint_drag`). A wrong drop wiggles. No red anywhere: wrong = amber `#F5A524`.
- **Order:** review 2026-10-08 ("after the door screen the bed screen will come", then "shift the pillow screen after
  the almirah screen"): T3 door -> G1 bed (8, row) -> G2 almirah (4, column) -> G2b pillow (3, row) -> G3 fridge (4,
  column) -> G4. (It was G2b pillow first, easier to harder.)
  The guided phase gate now plays before G1 (worked out from the phase change, not the slide id).
- **End screen:** VO is the standard "बहुत बढ़िया, दोस्त! तुमने कमाल कर दिया!".

## The screen takes no input while a voiceover speaks (2026-10-08) — `app.js` `VoLock`, CSS `[vo-lock]`
- Review: "make sure the screen is disabled whenever the VO is playing throughout the game". Every slide and the
  landing: while a voiceover clip (`assets/voiceover/vo_*`) is really sounding - from the shared VO element's `playing`
  to its pause / end / error - a clear layer (`#voLock`, z-index 150000: over the game and the phase card, under the
  rotate prompt) takes every tap and drag. Nothing greys out (review 2026-10-05: the speaker is never shown disabled).
  Sound effects (`playSfx`) and `play()`'s silent beats do not lock; a drag already under way when a line starts
  finishes, and the layer goes up once that pointer is released. The dev nav stays clickable (QA).
- Tested: the landing (the play button covered during the greeting, live after it); T1 (a tap on the long table
  during the question and during "यह टेबल ज्यादा लंबी है।" - nothing; after - it answers); G1 (a drag during the
  instruction - nothing; taps on an option during the question and during "ब्लॉक्स को एक बार फिर गिनिए।" - nothing);
  T2 (block 4 can't be taken while "तीन" is said, can right after).

## The landing greeting after the loader (2026-10-08) — `app.js` `[landing autoplay]`
- Reviewer: "I am still needing to click randomly on the title screen that comes after the loading screen to play the
  VO - this should be automatic"; the user: "without adding any extra element the voiceover should play after the
  loader". A browser refuses every sound until the page has had a tap (HI02H11, the reference, has the same limit - its
  greeting starts "inside a tap"). Where sound is allowed (the SwiftPAL app, a browser that lets the site play) nothing
  changes: she speaks as the loader lifts. Where it is refused (NotAllowedError on the greeting the loader starts), the
  play button - hidden until she had spoken, so there was nothing to press - shows at once, gold and pulsing; its tap
  starts the greeting (the button steps back, the screen locks while she speaks) and when the greeting and the title
  animation are done the lesson starts by itself (`startGame(true)`: no second tap, no play SFX, fullscreen asked on the
  tap). A tap elsewhere first still starts her, and the button then waits for its own tap as before.
- Tested in Chrome with `--autoplay-policy=document-user-activation-required` (the desktop default): refused at 0.2s,
  the button pulsing; one tap - the greeting, then the tutorial gate at 20.6s and T1 at 23.9s. With sound allowed:
  the greeting on its own, the button after it, as before. The BGM fade's volume could go over 1 (a frame stamped before
  its start) and threw - clamped (the MTG2A01 games already had it).

## The phase gates' headline (2026-10-08) — CSS `.phase-gate.talking .pg-title`
- Reviewer: "for transition screens with chaliye shuru karein, aaiye sath karein etc., use the same animation for the
  pink text on top of swiftee as" hindi-game-gender-identify.vercel.app (HI02H11_L03_S02). Its headline is written on
  left to right: `pgWipe`, a clip-path opening from the left over .9s, cubic-bezier(.25,.6,.3,1), 24px insets so the
  white outline is never cut; it stays while Swiftie ducks. Ours starts .28s in (the gate line is the headline, after
  the clip's lead). Was a .38s scale pop and a .3s fade out. MTG2A04 only for now (user) - pv-addition-kit's
  assemble.py copies this engine by fixed line numbers from 2026-10-07 and must be made anchor-based before a rebuild.

## Every voiceover matches the PPT (2026-10-08) — `VO_MANIFEST.md`
- "match exactly from ppt then make" (the VO manifest): every card line compared with `MTG2A04_L02_S01_review.pptx`
  (24 Sep) and every sentence clip transcribed. Three differed, and the user chose all three back to the deck, each the
  2026-09-28 render restored from git (7c1f24e): the greeting "नमस्ते दोस्त! मैं हूँ स्विफ्टी। आज हम सीखेंगे - किसी चीज
  की लंबाई कैसे मापते हैं।" (was "दोस्तों", 5 Oct QA; the title animation now starts on its "आज", `T_WORD` 3.18s - was
  4.69s); the end screen "शाबाश! आपने ब्लॉक्स से लंबाई मापना सीख लिया!" (was the QA standard "बहुत बढ़िया, दोस्त!
  तुमने कमाल कर दिया!"); the door - 9 blocks again, "शाबाश! यह दरवाजा 9 ब्लॉक्स लंबा है।" (`count_at` 2.14s on its
  "नौ"), which takes T3's cube to 44px (74 elsewhere; the user chose it knowing). `VO_MANIFEST.md` is now generated from
  the card data, the deck and the files: every clip in play order with its line, when it plays, its length and its source.
- Seen while testing (not changed, as before): on T3 the आगे arrow overlaps the lowest blocks and their digits, and the
  "N ब्लॉक्स" badge sits on the door's lower part - the same at 5 blocks.
- T3, review 2026-10-08 ("the door is too much at the bottom, shift it little upper along with the floor so that everything
  remains same just the floor will be little more visible"): the door, its column, the dashed lines and the floor line
  rise together by `LIFT` = 16px (app.js MEASURE_DEMO, T3 branch) - nothing changes size; the floor under the door shows
  ~29px instead of ~11px. 26px was tried: the top dashed line nearly touched the heading's "ई" (the stage scales as one,
  so the gap is the same on every screen).
  Then "i still dont see the changes shift a little more upper": the top can only rise to `LIFT` = 20 (the heading), so
  the rest comes from the floor band under the door, `FLOOR` 4 -> 18: the door's foot stands 34px above where it was,
  ~45px of floor shows, and the door (and its 9 cubes) is ~3% shorter - 42.9px cubes, were 44.4.

## One 53px cube on every screen (2026-10-08) — `app.js` `MDK.CUBE` 53, `ROBOT_S`
- Review: "the size of cube will remain as shown in image 1 throughout the game" (image 1 = G2, the almirah, 53px), then
  "do not reduce the sizes of any elements plz" and "if number of cubes changes thats fine". So every measuring screen
  asks for 53 and the COUNTS changed to keep each object at (at least) its size: T2 table 6 -> 9, T3 door 9 -> 7 (8 do
  not fit its height), G1 bed 8 -> 12 (options 11 / 12 / 13), G2 almirah 7 (as it was), G2b pillow 3 -> 5 (4 / 5 / 7),
  G3 fridge 6 -> 7 (5 / 6 / 7), G4 mats 6 / 7 -> 8 / 9, P1 chairs 4 / 5 -> 6 / 7, P4 bench / almirah / chair / blackboard
  6 / 5 / 8 / 4 -> 11 / 7 / 6 / 9 with the room's block `sc` 54 -> 39 so its spaces keep their size. Sizes, old -> new:
  table 444 -> 479, door 386 -> 371 (-4%: 7 is the most that fits), bed 592 -> 636, pillow 222 -> 265, fridge and almirah
  the same, mats 433 / 505 -> 424 / 477 (-2% / -6%: 9 / 10 do not fit side by side), chairs 183 / 206 -> 197 / 207; the
  classroom's enlarged objects the same within 2%.
- New lines (edge-tts Swara, the lesson's finish): `vo_p3_done` 9, `vo_p4_done` 7, `vo_p5_ok` 12, `vo_p6b_ok` 5, `vo_p7_ok` 7,
  and the counting words `vo_num_10` / `11` / `12` (दस / ग्यारह / बारह - the bed's 12). The "N ब्लॉक्स" badge pops on the
  spoken number: T2 `count_at` 2.38s, T3 2.56s.
- The robot keeps its size (it used to be 2.7 cubes wide - at 53 it would shrink to 143px): `ROBOT_S` 74, the 53px cube
  centred on its lid. It also stands HALF WAY from where it was to the blocks (review: "shift the robo mop a little more
  right so that drag and drop of cube is not a lot of distance"; the user chose "about halfway"), never under आगे.
- Not this size: the match-the-following cards (P2 / P3, ~29px - their equal cards) and the landing's cube row.
- P2 / P3, same day: "remove pink dotted lines from this play screen" (P2) and "here also" (P3) - `data.no_ends` draws no
  end lines. "zoom in the bottle and tv so that they look bigger": they grow by blocks, the shared 29px cube and the six
  equal cards unchanged (the window's 5 sets the card height; the counts must differ for the three boxes): the bottle
  3 -> 4 (87 -> 116px tall), the TV 4 -> 6 (116 -> 174px wide), boxes 6 / 5 / 4 (the PPT's descending order).
- "in all such gameplay screens the box with correct number of blocks, like 9 blocks, will come before the confetti":
  T2 / T3 - the confetti no longer bursts as the last block lands; it waits for the "N ब्लॉक्स" box (which rises on the
  spoken number) and bursts once it has risen (~1.1s later, with the stars' spin). G4 / P1 - the count boxes pop at once
  on the right tap (0 / 0.3s, were 0.25 / 0.6s), the confetti after them (0.75s); the correct SFX stays on the tap.
  Measured in Chrome: T2 box 4.12s -> confetti 5.22s; T3 4.27s -> 5.37s; G4 / P1 boxes 0.02 + 0.3s -> confetti 0.76s.

## The VO manifest from the updated deck, and as a spreadsheet (2026-10-09) — `VO_MANIFEST.md`, `VO_MANIFEST.xlsx`, `tools/vo_manifest_xlsx.py`
- The user's updated deck, `MTG2A04_L02_S01_review.pptx` (received 2026-10-09, kept in this folder), now has the game's
  block counts on every screen. `VO_MANIFEST.md` was regenerated from it: 46 clips say the deck's line (44 exactly, 2 cut
  at the deck's own break); 2 need re-recording, P4's almirah pair (the deck now says अलमारी, the clips say छोटी अलमारी,
  and so does the card's `name_hi`); the 3 transition cards are not in the deck.
- Not changed, flagged to the user: on P4 the new deck has every object speak its VO1 / VO2, but the game speaks for the
  first object picked only (CLASSROOM_FIT `voFor`). The deck's options are pillow 4 / 5 / 6 (the game's 4 / 5 / 7) and
  fridge 6 / 7 / 8 (the game's 5 / 6 / 7).
- "i want it in a spreadsheet": `VO_MANIFEST.xlsx` is made from `VO_MANIFEST.md` by `python tools/vo_manifest_xlsx.py`
  (openpyxl); re-run it after any change to the manifest. Its sheets: VO by screen (play order, each screen's notes as
  grey rows), Clip list (the 64 files once each, where each is used, its status), and Notes. Neither the deck nor the
  spreadsheet is deployed (`.vercelignore`: `*.pptx`, `*.xlsx`).

## The counting hints at a medium pace (2026-10-09) — app.js `MDK.countBeat` (`COUNT_MS`, `COUNT_LEAD`)
- Review, of G1's 3rd wrong answer (a digit under each block, one by one): "it's too slow - I don't want it too slow or
  fast, medium paced - fix it throughout the game". The counting beat was 850ms (raised from 140ms, "really fast",
  earlier the same day). Every hint that counts block by block uses it: G1-G3 wrong 2 (each block lit as it is said)
  and wrong 3 (the digits), G4 / P1 wrong 1 (both objects counted aloud), P2 / P3 wrong 2 (the digits).
- Now 600ms a number (~1.7 a second). Measured on vo_num_1..12: each word starts .28-.30s into its clip and lasts
  .26-.49s (दस ends at .76s), so a spoken number now starts .22s in (`COUNT_LEAD`, set while the clip loads - the
  default playback start position): the word lands on the beat and the longest ends .54s later, before the next one.
- Measured in Chrome: G1 wrong 2 - 1…12 said every 607ms (578-622), none cut; wrong 3 - the 12 digits every 603ms, 6.6s
  in all (was 10.2s); G4 - 1…8 then 1…9 every 609ms; P1 - 1…6 then 1…7 every 607ms; every number started at its word.

## T3: the "7 ब्लॉक्स" box on the wall (2026-10-09) — app.js `MDK.wallBox`, `[wall-box]`, CSS `.md-count.wall`
- Review, a circle on the empty wall left of the door's cube column: "can we replace the 7 blocks box from below the door
  to on the wall as shown? how will you do this better". The result box rose out of the light under the door
  (`MDK.riseBox`) and stood over the door's lower panels, against the column.
- Now it stands on the free wall: centred between the card's left edge and the column's digits, and between the top of
  the scene (under the heading) and the robot's cube (its glow included) - worked out from the layout, so it holds at
  every screen size - and `MDK.wallBox` brings it OUT OF THE COLUMN: small, behind the cubes at the column's middle, it
  glides onto the wall in a gentle arc, growing, a little past its size, and settles (950 ms) - the box reads as the
  7 cubes' label. The same white answer box as everywhere, with a soft shadow on the wall; still on the VO's number word,
  the confetti after it (T2's box still slips out from under the tabletop). Checked in Chrome at 1500 × 720 and
  1945 × 897: T3 played through, the box clear of the heading, the column, its digits, the robot and →.

## P4: the wave entrance at a calm pace (2026-10-09) — app.js `[calm]`
- Review, of the [waves] entrance: "the entry is really fast - diagnose the error and fix it, apply the same in all
  endgame elements". Not a fault in the motion: the [waves] route has no loop, so it is ~8-10 robot widths, not ~15,
  and at the same pace (4.2 a second) the whole entrance took 2.6-3.1s - as short as the 3.2s drive turned down before -
  with a sideways wave every ~0.75s.
- The robot drives the wave route at 2.2 robot widths a second (the traced path, if brought back, keeps 4.2): home
  4.9-5.9s after it sets off - as the 4.7-5.4s entrance before the waves - a slow sway every ~1.5s. Measured in
  Chrome at 1945 × 897: average 1.7, fastest moments under 3.3; a cube ready 5.5-6.4s after the tap. One drive for
  all four objects; all four played through.

## P4: the robot's route in waves (2026-10-09) — app.js `wavePath` `[waves]`
- Review: "make the path of the robo mop a little better, like waves - for a better UX". The traced path (`DRIVE_PATH`)
  had a loop that crossed itself - a tangled trail - and tight turns.
- `wavePath(x0, y0, hx, hy, rw, rh, boxes)`: a smooth route - in from the screen's top-left corner along the top, down
  the free floor left of the object, round into the front, a calm glide into its spot (a Catmull-Rom curve) - with a
  sine sway along it: round waves, `WAVE_LEN` 640 px of floor each (~0.75s at the steady pace), `WAVE_AMP` 85 px to
  each side (smaller far away, with the robot's perspective), calm at the start (they grow as it leaves the wall) and at
  the end (the last stretch straight). Where the sway would take the robot into the object or its slots, off the
  stage's left edge or up the wall, it is reduced there. `data.drive_path: "traced"` brings the traced path back.
- Designed against each object's real geometry (a model of `drive()`): a zigzag of big bends gave pointy chevrons (the
  free floor is short top to bottom); joining crests through mid-points, straight runs with corners; the final one -
  gentle round waves on a smooth route - touches no object, never leaves the stage, never climbs the wall, for all four.
- Same steady speed; no loop, so shorter: 2.6-3.1s, a cube ready ~3.1-3.5s after the tap (was 5.2-5.9s). Checked in
  Chrome at 1945 × 897: the wave trails of all four objects, a real-speed recording, all four played through.

## P4: the robot's drive at a steady pace (2026-10-09) — app.js `MDK.robot drive()` `[steady]`
- Review: "the robo mop entry animation was really fast". The `[quick]` drive (3.2s, eased in and out) covered most of
  its path in a dash: measured in Chrome on the reviewer's screen, its fastest moments ran at 12-13 robot widths a
  second - the original 6.5s drive (on the stage) averaged 3.15 and peaked at 5.7 (a faithful model of drive()).
- `drive()` takes `o.speed` now: a steady pace over the ground - a sine ramp in over the first 20% of the time, that
  speed, a sine ramp into its spot over the last 30% - the time following from the path's length (`o.ms` and the
  old easing remain for calls without it). P4 drives at 4.2 robot widths a second: the original's average pace,
  never as fast as its peak. Measured (same method as above): average 3.3, fastest moments 5.3-6.6 (about half the
  3.2s drive's); drives of 4.7-5.4s, a cube ready 5.2-5.9s after the tap. All four objects played through.

## P4 measuring view: a floor, shadows, a quicker drive (2026-10-09) — CSS `[floor]`, app.js `[floor]`, `[quick]`
- Review (asked whether the solid colour was right for the screen, the issues listed - "sure, fix the issue"). On one
  flat cream the objects floated, the robot drove (small far, big near) and mopped a floor that was not there, its clean
  trail read as smoke, and each cube could be taken only ~7.1s after the tap (~28s of waiting over the four objects).
- `[floor]`: the veil is still solid and plain, but a floor in the classroom's own colours - a thin wall band (#FEF0D2)
  and its skirting line (#DA8A43) at the very top (7.4-8.3% down, above the robot's way in), the floor below (#F1D9BB
  far → #FAEEDF near); the same on the side bands, whose lines meet the stage's; on a 4:3 screen the bands above and
  below the stage (a mirror image - it put floor above the wall and a second skirting line) are plain wall / plain
  floor. Each measured object gets a soft floor shadow at its foot (`.cf-floorshadow`). The robot's trail now reads as
  a clean, shiny path on the floor.
- `[quick]`: the same path driven in 3.2s after a 0.3s pause (was 6.5s after 0.45s) - a cube can be taken ~3.6-3.7s
  after the tap; the object's line is 2.3-2.9s. The way in starts 11% down the STAGE (just below the skirting line) -
  11% of the visible height put it on the wall on a 4:3 screen.
- Checked in Chrome at 1945 × 897 (the reviewer's screen) and 1024 × 768: all four objects played through - measured,
  placed from their own box, on to the celebration.

## P4: the option boxes stay up while placing; the robot drives in for all four (2026-10-09) — `[boxes]`, `[all four]`
- Review, the classroom after the bench was measured: "bring back all the option boxes as they were, and only enable this
  bench box to place it in the correct position". The tray's boxes had been hidden while placing, the measured object
  alone at the tray's centre. Now (CSS `[boxes]`, app.js `makeCard`): the boxes stay up - the others dimmed (.45,
  grey) and off, the object's own box on (`.cf-cur`) - and the measured object, its blocks on it, flies into ITS box,
  where the box's picture was; it is dragged from there to its space, and a wrong drop sends it back into the box.
- Review: "add the same robo mop animation in all four elements ... and make it stop at the same position as in the
  bench game screen": the drive-in ([drive], [drive-in]) runs every time a measuring view opens (it ran for the first
  object only), and the robot stops centred under every object, its lid's cube 18px below the object's foot ([near];
  it had stood beside the column for the almirah and the chair).
- Average / longest drag from the robot's cube to a slot at 1945 × 897 (the robot at the foot of the view → now):
  bench 443 / 508 → 288 / 383 px, almirah 385 / 562 → 319 / 488, chair 376 / 526 → 279 / 421, board 507 / 543 → 377 / 425.
  A cube can be taken ~7.1s after each object is tapped (the drive). All four objects played through in Chrome.

## P4: the robot stands by the object - shorter drags (2026-10-09) — app.js `[near]` (superseded above: now under every object)
- Review, the bench's measuring view: "reduce the distance between the robo mop and the bench - the drag and drop takes a
  lot of time because of the distance; the same in all the last game screens". It stood at the foot of the view by the
  tray whatever the object; it was moved under a long object and beside a tall one's column, and the drive's path was
  made to end at the new spot (along the front to its point nearest home, then into it).

## P4: the robot drives in from the screen's top-left corner (2026-10-09) — app.js `[drive-in]`, CSS `[drive-in]`
- Review, a red circle at the screen's top-left corner: "the mop should enter from here". It started off the stage along
  its very top edge (the reviewer's path drawn on a wide window), and the stage clips (`#stage`, `.slide-stage`
  overflow hidden): unseen for its first ~2s, then it popped in at the stage's edge. Now it starts peeking in at the
  VISIBLE screen's left edge, at the circle's height (11% down), and joins the reviewer's path at its 5th point, where it
  turns down the left side; while an object is measured the stage does not clip (the room is under the solid veil, the
  side bands sit behind the stage), so on a screen wider than the stage it is seen coming in over the side band. The
  mop's trail canvases cover the whole visible screen (`trailInit`). Checked in Chrome at 1945 × 897: in view at ~1s
  inside the circle, home at ~7.6s; the whole P4 played through (4 objects measured and placed, on to the celebration).
- Found while checking (not changed - reported): the first object waits ~7.2s from the tap until a cube can be taken
  (its line is 2.3s; a drag during the drive gets no response); on the solid veil the measured objects have no floor
  shadow (they float) and the mop's white trail reads as smoke until it fades (~3s after the robot is home).

## P4 measuring view: a solid background (2026-10-09) — CSS `[solid]`
- Review, of the classroom's measuring view (the bench enlarged, the robot below): "make the background here solid". The
  classroom ghosted through a see-through cream veil (80%, backdrop blur), the room layer at 16% blurred, the side bands
  at 25% blurred. Now `.cf-veil` is opaque - #FCF4E7, the colour the faded room read as - the room goes to 0 under it,
  and the side bands get the same solid colour (`.stage-bleed i::after`); all fade in and out with the view (.45s). The
  veil overhangs the scene by 2px (it rounded a pixel short of the stage and a sliver of the room showed at the right).
- On the solid colour the robot's mopping trail shows more while it drives in ([drive], the reviewer's path); it dries to
  almost nothing once the robot has arrived. Checked in Chrome at 1920 × 891: the view while the robot drives in, once it
  has arrived (no seams), and the classroom coming back after the bench is measured.

## The bulb light: glowing orange jelly cubes (2026-10-09) — `gen_cube_lit.py`, app.js `MDK.bulb`, CSS `[bulb]`
- Review, with a picture of the pillow slide whose cubes glow as glossy orange jelly cubes (an edited picture - its lid
  cube is ~30% bigger than the row's): "use these cubes throughout for the effect". Measured on the picture: the blue
  cube's own design recoloured - the face orange at the top (253,150,33) to golden yellow at the bottom (255,213,30), a
  deep red-orange rim (~245,65,5), a cream-orange bevel line (253,202,115), the white gloss kept; round each a bright
  cream-yellow outline (255,241,165) and a warm glow fading into the floor.
- `gen_cube_lit.py` now recolours the game's cube part by part by its own shading (its green channel; a small dead zone
  so its faint face texture does not show): `assets/cube_orange.webp` (the lit cube) and `cube_orange_light.webp` (a
  soft golden light low in the face, screened, a touch of the twinkle). New names again; `cube_gold*` are gone. The rim
  is a full deep red-orange so each cube still reads in a flush row (the picture's cubes have gaps - the game's must not).
- `MDK.bulb`'s glow: a bold cream-yellow outline (two tight drop-shadows) and an 8px warm golden glow, scaled to the
  cube. Up = the picture; the twinkle is the glow breathing (.05 .. 1), the halo and pool with it, the cube .93 .. 1.04
  bright - measured round the pillow row: +84 .. +118 warmth (red - blue). The same on every screen that lights cubes:
  G1-G3 (+ the pillow) after a wrong answer, G4 / P1 and P2 / P3 while counting - checked in Chrome on each.
- The robot's waiting cube stays blue (in the picture it is lit too): it is not part of the measured row, and lit it
  would make 6 glowing cubes for a 5-block answer. `?v=` bumped to 20261009p (another edit had put it back to `i`).

## The bulb light: a glow you can see, and the twinkle back (2026-10-09) — app.js `MDK.bulb`, CSS `[bulb]`
- Review, a screenshot of the pillow row with its 2nd cube lit: "analyse yourself if the glow is really evidently visible
  - and the टिमटिमाना effect is gone". It was not: the glow was a pale haze BEHIND the cubes, so round a cube in a row
  its blue neighbours hid it but for two slivers; and the twinkle, slowed and made shallow, could not be seen.
- The glow is now ON the lit cube: two warm golden-orange drop-shadows hugging its rounded shape (2px + 7px, scaled to
  the cube - `gk` = size / 53, so P2 / P3's small cubes get a tight one too), and the cube is raised one z-index over
  its neighbours while it is lit, so the glow shows all round it - on the floor and over the next cubes' edges. The
  halo behind it and the floor pool are a clear golden orange (they were a pale cream); the spill layer is gone.
- The twinkle can be seen again: a diya's flicker, ~1.6 s round for a counted cube (~2 s in a row, each its own pace),
  dips to about half - the glow .5 .. .95 / .2 .. .7, the light inside .25 .. .9. Measured on the 2nd pillow cube:
  the ring round it goes from +3 (off) to +35 .. +60 warmth (red - blue) as it twinkles.
- Fixed: a cube lit again while its light was still fading out could be left raised or lose its blue picture - the
  fade's tidy-up is now run at once (`el._bulbTidy`). `?v=` bumped (20261009l). Checked in Chrome: the pillow cube on
  its own, the lit row (slow-motion recording), P2's small cubes, and the re-light case.

## The bulb light: one even honey gold, crisp, little glow (2026-10-09) — `gen_cube_lit.py`, app.js `MDK.bulb`, CSS `[bulb]`
- Review: "remove the inside shadow, reduce the glow effect and make the colour of the glow more evident - I can't
  really see the blocks nicely". The resin's deeper inside framed by paler walls, and its back edges, read as a shadow
  inside each cube; the soft wide haze round them blurred the blocks into each other and into the floor.
- The lit cube (`assets/cube_gold.webp` / `cube_gold_light.webp`; the `cube_honey*` files are gone) is now ONE even,
  richer honey gold (255,194,90), edge to edge - no inside / walls / top face / back edges - with only the cube's own
  bevel lines and gloss for its shape and a crisp caramel outline; the soft light inside stays (it carries the slow
  twinkle). The glow cut back: a tight warm edge glow (2px) and a faint halo (6 / 16px, at most .55), the pool and the
  spill faint. `?v=` bumped (20261009j). Checked in Chrome on the pillow row (slow-motion recording) and P2's cards.

## The bulb light: soft honey gold, a candle's twinkle (2026-10-09) — `gen_cube_lit.py`, app.js `MDK.bulb`, CSS `[bulb]`
- Review, of the golden amber: "still very harsh to the eyes - not warm lights". A saturated amber filling the whole cube
  read as a highlighter, and the twinkle changed ~5 times a second, deep. Warm light is soft and slow - candlelight.
- Re-rendered in HONEY GOLD (`assets/cube_honey.webp` / `cube_honey_light.webp`; the `cube_amber*` files are gone):
  softened towards warm cream (never towards grey - that went lime), enough honey left and a clear caramel edge that
  it still reads on a beige floor (a paler honey, tried first, faded into it); the light inside a soft cream gold.
  The halo, pool and spill softer and wider. The twinkle slow (a ~2.6 s breath in a row, ~1.9 s for a counted cube,
  ~2 changes a second at most) and shallow: the light inside .63 .. .8, the glow round it ~.55 .. .75; the switch
  flash .35 / .3. `?v=` bumped (20261009i). Checked in Chrome on the pillow row, recorded in slow motion, side by side
  with the amber and the paler honey.

## The bulb light: warm golden amber, twinkling (2026-10-09) — `gen_cube_lit.py`, app.js `MDK.bulb`, CSS `[bulb]`
- Review, of the softened light on the pillow row: "too lime flavour - can't see much because the floor is skin colour
  too - I want warm yellow light, and its टिमटिमाना (twinkling)". Softening had desaturated the yellow (CSS
  `saturate(.7)` + a pale resin) - it went khaki-lime and, pale on a beige floor, nearly vanished; the twinkle, at
  half strength, could hardly be seen.
- Re-rendered in WARM GOLDEN AMBER (`assets/cube_amber.webp` / `cube_amber_light.webp` - new names again, so no cached
  copy; the `cube_resin*` files are gone): the resin golden amber, with more body at the walls, a deeper amber outline
  (it stands clear of a beige floor), the light inside warm gold - never white, so no glare. The CSS desaturation is
  gone; the halo, pool and spill are amber (they show on beige and on white cards).
- The twinkle can be seen again: the light inside 0 .. .85 (×TWINKLE, dips to .35), the amber glow .2 .. .8, the edge
  glow .3 .. .7 - bright moments are warm gold, not white. `?v=` bumped (20261009g). Checked in Chrome: the pillow row
  (slow-motion recording), G1's peach floor, P2's white cards.

## The bulb light, softened (2026-10-09) — app.js `MDK.bulb`, CSS `[bulb]`
- Review, with the counted pillow cube lit: "the light is too much - hurting the eyes". Every light is now at most half
  its old strength - a night lamp, not a torch: the light inside at most .5 (was 1) and warm, not white-hot (CSS
  `sepia(.3)` on `.md-bulb-light`); the resin a softer butter yellow (`saturate(.7)` on `.md-bulb`); the glow round it
  - the pool, the halo, the spill - at most ~.5 / .55 / .4 (were 1); its edge glow faint; the switch flash .45 / .35
  (was .9 / .7). The twinkle stays, gentler (its dips shallower), so it flickers softly and never strobes.
- The switch: blue and yellow are never shown at once (half-way they made a grey-green): switching on, the blue fades
  in the first half and the resin with its light in the second, the soft flash bridging them; switching off, the
  reverse. Done in code and CSS only (the art is unchanged), with `?v=` on app.js / style.css bumped (20261009f), so
  no cached file can bring the old light back. Checked in Chrome on the pillow row, recorded in slow motion.

## The bulb light: a resin cube with a light inside, twinkling (2026-10-09) — CSS `[bulb]`, app.js `MDK.bulb`, `tools/gen_cube_lit.py`
- Review, with the pillow row lit as opaque golden cubes and a photo of a lime resin cube lamp: "still it's too solid -
  I want something similar to that, with a टिमटिमाना (twinkling) effect". The golden cubes in the screenshot were the
  first lit-cube images: they had been replaced three times under the same file names and the browser kept the old
  ones - so the new layers have NEW names (`assets/cube_resin.webp`, `cube_resin_light.webp`; the `cube_lit_*` files
  are gone) and the `?v=` on app.js / style.css in index.html is bumped (20261009c).
- The cube lit is now the photo's resin cube, in two layers rendered from the cube itself (`gen_cube_lit.py`): the RESIN
  (`.md-bulb`, steady) - clear and pale at the walls so the floor shows through, deeper yellow inside, the top face
  paler, its back edges faintly seen through it, the edges carrying the light (brightest low down), a crisp outline -
  and the LIGHT inside (`.md-bulb-light`, screened onto the resin): a source low in the middle with its glow rising
  through the cube. New: `.md-bulb-pool`, the pool of light on the floor under it (the photo's lit table).
- The twinkle (`TWINKLE` in app.js): after the power-up the light flickers like a diya's flame - an irregular cycle of
  ups and dips (~1.1 s for a counted cube, ~1.5 s in a row, each cube at its own pace: a row twinkles like fairy
  lights); the light inside, the pool, the halo and the spill twinkle together, the resin stays.
- The switch: blue and yellow cross-faded went a muddy green half-way, so the swap now happens under a quick warm-white
  flash of the cube's own shape (`.md-bulb-flash`, `FLASH_ON` / `FLASH_OFF`) - a light catching.
- Checked in Chrome: the pillow row lit (recorded in slow motion through power-up, twinkle and switch-off), each cube
  counted, P2's small cubes.

## The bulb light: see-through walls, warm light coming out (2026-10-09) — CSS `[bulb]`, app.js `MDK.bulb`, `tools/gen_cube_lit.py`
- Review, a screenshot of the pillow row with its first cube lit (dim: an opaque amber block): "the glow effect is coming
  very solid - not like the walls of the cube become a little translucent and warm transparent colours coming out of
  it". The lit art was opaque, so it read as paint, and its light stayed behind the neighbouring cubes.
- `gen_cube_lit.py` now renders the frosted light cube with SEE-THROUGH WALLS: the light inside near-white and even,
  the walls round it (towards the outline) warmer and partly transparent - the floor shows faintly through them - a
  crisp outline, a line of light inside it, the bevel and the gloss faintly. Dim: warmer (golden) and more
  see-through; full: warm white. The shape is measured on a squircle fitted to the cube (exponent 6): a plain
  distance-to-edge made the walls reach further in at the corners, and the corners looked cut.
- See-through means the blue must go while it is lit (blue through the walls went grey-green): `MDK.bulb` moves the
  cube's own picture onto a layer (`.md-bulb-blue`) that fades out as the light comes on, and puts it back on the cube
  when the light goes off. The light coming out: the halo behind (warmer, wider - yellow near, orange as it spreads)
  and a new `.md-bulb-spill` over the neighbours, `mix-blend-mode: screen` (it brightens them, never tints the blue).
- Picked from a side-by-side of four looks (blue glass lit inside - went lavender; warm see-through amber glass;
  the frosted lamp; the blue cube with light leaking out - looked faded): the frosted lamp with see-through walls, the
  photo's look. Checked in Chrome on the pillow row (each cube lit as it is counted; the row lit) and on P2's cards.

## The bulb light: a frosted light cube (2026-10-09) — CSS `[bulb]`, app.js `MDK.bulb`, `tools/gen_cube_lit.py`
- Review, with a photo of a frosted LED light cube glowing in a dark room: "I want the cubes to glow like this - power
  up, then dim, then up". The lit art (below) is re-rendered as that: every pixel light, near-white and even (no spot),
  the top a touch brighter, the faces falling off softly at the edge, frosted - no gloss, the bevel only as soft tone.
  Full power = warm-bulb white (`cube_lit_full`); turned down = a lower, warmer glow (`cube_lit_dim`). Pure white was
  tried: on P2 / P3's white cards a white light vanished (the photo's room is dark), so the light is a warm white and
  the light it throws (`.md-bulb-halo`, the photo's lit floor and wall) a wider warm-golden bloom.
- The order is now the photo's: it POWERS UP straight to full, then dims, then up again (it used to come on dim first);
  a lit row powers up cube by cube, then breathes full / dim together. While lit, the cube's own dark drop-shadow fades
  out (a light casts none). Checked in Chrome: G1's bed row after a wrong answer (up / dim / up) and P2's small cubes.

## The bulb light on a cube: the cube becomes the lamp (2026-10-09) — CSS `[bulb]`, app.js `MDK.bulb`, `tools/gen_cube_lit.py`
- Review (a screenshot of the version below: a white spot in a blue cube, a white star on its corner): "this is still bad
  - see what I actually want". What was asked across the reviews: the light in the WHOLE cube, not gathered in the
  middle; warm yellow; the cube going see-through like a lamp, not a solid block; its outline lit too; dim, then a
  little more power. Light laid over the blue cube can't give that - yellow over blue mixes to white (screen) or olive
  (normal) - so every overlay showed as a white blob in a blue cube.
- Now the cube's own art is swapped for itself LIT: `assets/cube_lit_dim.webp` / `cube_lit_full.webp`, rendered by
  `python tools/gen_cube_lit.py` from the game's cube (the strip's first cube, the same box `MDK.cube` shows) as warm
  glowing glass from its own shading - a broad bright body over most of the cube (never a spot), warmer towards its
  edges, a glowing line just inside the rim, the bevel's light lines and the gloss kept, its soft edge a little fuller
  so no blue fringe shows. `.md-bulb` (dim: soft gold) and `.md-bulb-hot` (power: bright warm yellow) cross-fade over
  the blue cube - the dim / power breathing as before; the warm halo behind is a little stronger. The corner twinkle is
  gone (on a lit row it was a white star on every cube at once). Preloaded on MEASURE_ASK / COMPARE_MEASURED /
  MATCH_ROWS. Checked in Chrome on G1's bed row after a wrong answer, at dim and at full power.

## The bulb light on a cube (2026-10-08) — CSS `[bulb]`, app.js `MDK.bulb` (unchanged) — replaced above
- Review: "still the light effect is too solid - take help from internet and fix this effect of glow bulb effect". The
  light layers were opaque yellow painted over the cube, so a lit cube became a solid yellow block. Rebuilt the way glow is
  usually done on the web: the inside light is ADDED (`.md-bulb`: `mix-blend-mode: screen` - it can only brighten, never
  cover - a warm-white core fading to clear, with soft layered inset glows); at power a small warm filament in the middle
  (`.md-bulb-hot`, normal blend - screen on bright blue washes yellow out to white - clear well before the edges); the
  glow outside is a bloom of stacked soft shadows, each wider and fainter (`.md-bulb-halo`, no fill). The cube stays blue
  glass, lit from inside; the dim / power breathing and the twinkle are as before. Checked frozen at dim and at power on
  the bed's row and on P2's small cubes.

## Internal QA before the push (2026-10-01)
- **Played**, each slide in a fresh page the way a child would: the landing (its play button starts T1), T1 → CEL -
  every slide completes; the wrong-answer ladders (T1, G1 incl. a block laid off the row, G4, P2) give the sheet's hints,
  then show the answer, and the slide still completes. No script errors, no failed requests, on any slide.
- **Static**: `card.json` = the copy in `index.html`; every file the card / code / styles name is on disk (bar one, below);
  every asset is used; every VO clip is wired and every audio key has its clip; no mojibake; the scripts parse.
- **Fixed in the pass**:
  - P4: a tap on the next object in the 2.3s after a right drop (the praise, the room coming back) was dropped
    silently, though its button looked ready - it is kept now, and that object opens the moment the room is back.
  - `obj_almirah.webp` (G2, P4): its right door had a see-through streak (left by the background removal) with a
    stain under it - the almirah is solid again and that door's face is rebuilt from its mirror-image left door (the
    handle as drawn).
  - VO: `vo_p4_done` / `vo_p6_ok` / `vo_p7_ok` re-recorded for their new counts (5 / 4 / 3), T3's `count_at` 2.12s
    (see `VO_MANIFEST.md`).
- **The objects' cartoon restyle (2026-10-01)**: the almirah, the fridge, both mats, both chairs and the pillow (now a
  dog-face cushion) redrawn as flat 2D cartoons with bold outlines and simple shading (generated art), transparent
  backgrounds, the same measuring proportions. G4's mats are since the supplied papad mats (review 2026-10-01: "replace
  the mats with image 2 and 3 mats"): `obj_mat_1.webp` the blue one with 12 papads (5 blocks), `obj_mat_2.webp` the red
  one with 10 (6 blocks, the longer - the answer), each trimmed to its own outline (ar 0.4945 / 0.42 in the card), 1100px
  wide; the terrace they lie on has papads drying too.
- **Known, harmless**: the shared engine's `BUILD_TO_NUMBER` / crane modules name `assets/obj_crane.png`; this lesson
  has no such slide, so nothing ever asks for it.
- **For the SME to check**: P3's "2 ब्लॉक्स" note was made from the supplied "3 ब्लॉक्स" one (only 3 and 4 came) - see
  "P2 / P3 as photos". (P3's cards had their blocks drawn at different sizes, the bottle taller than its two - fixed
  2026-10-01: the game lays one block size on all three, each object exactly its count long.) P2's pictures still
  have their blocks drawn on: the bench top runs a little past its 4, the stool's seat a little over its 2.

## FLN QA checklist pass (2026-09-28)
Every change is tagged `[QA nn]` (checklist section) in `app.js` / `style.css` / `index.html`.
- **Files:** `swiftpal-bridge.js` added (HI01's host bridge: Android / iOS / web), loaded before
  `app.js`. The internal signal bus is now `window.GameBus`; `window.SwiftPAL` belongs to the bridge.
- **Stability:** one reusable VO `Audio` element (was one per clip, ~150 live players by P5 —
  full playthroughs crashed the renderer there); preload players are released once cached.
- **Score:** first-try correctness over every answerable slide (`recordResult`); was mastery-only = always 0.
- **xAPI:** HI01 statement shape via `SwiftPAL.sendEvent`; one screen verb per slide; MAKE_SET sends
  `question_answered`; landing chip sends `audio_replayed`; no duplicate `hint_used`; every verb is
  logged to the console as `[xapi]` (the on-screen verb log under `?dev=1` was removed 2026-09-30: it covered the game).
- **Art/type:** real button assets `btn-next-*` / `btn-continue-*` (default + deactive); Baloo 2
  SemiBold (600) embedded (instanced from the official Baloo 2 variable font, same 1.700 version and
  glyph set as the 700/800 faces) for the landing title and the option / box labels. The top blue bar is NOT SemiBold:
  it is HI01H01_L02_S04's own rule, Baloo 2 ExtraBold 800 / 30px / 1.15 / #0B3D8C (review 2026-10-01: "use it exactly
  from the game HI01H01_L02_S04" - the checklist's SemiBold 32px / #012F76 override is gone; the two bars now render
  pixel-identical); the nudge hand (2026-09-30: FLN animation kit recipe 3, treatment C - the plain press -
  + recipe 4, the tap ripple: two wavefronts and three sparks from the fingertip, `assets/nudge_fx_*.svg`; it replaced
  the two-layer clipped hand and its plain white ring), fingertip 8px below its target, cut off above any button
  (the ripple is never cut); veil blur 15.8px; landing mascot 180px, waves once.
- **Confetti (2026-09-30):** the FLN animation kit's recipe 7 as built (review: "all square-shaped and not covering
  the full horizontal space"): stars (40%), rectangles, lines and squares, two-faced, fluttering / tumbling at
  terminal velocity. The old `[13]` override that forced 10x10 squares and a 3s ease-out is gone. It falls in
  `#fxLayer` (body-level, the whole window - the stage is letterboxed and clips at its edges), 100 pieces, sized with
  the stage (`--scale`). Review "increase the size, reduce the speed a bit": pieces 1.5x the kit's size (`--fx-size`),
  `fall` [1.6, 2.6] instead of the kit's [1.1, 1.8] - about 30% slower, the burst clears in ~3.8s.
- **Cleanup:** 16 unwired VO clips + 34 unused images deleted (2026-09-29), and the old thin `pencil_purple.webp` once the
  landing switched to the green pencil with a face. That art is now recoloured purple (2026-09-29) and ships as
  `pencil_purple.webp` (same 1658×283 framing; only its green turned purple, in OKLab keeping every pixel's
  lightness); `pencil_green.webp` is gone. 2026-09-30, with the rebuild: the old kit's block states / markers /
  wrong-way figures / explain pose, the two-chair picture, and 12 clips only the old slides used (`vo_p12_ask/_ok`,
  `vo_p13_ok`, `vo_total_1..9`) were deleted. No unused assets ship in the build.
- **Test harness** (not shipped): automated Playwright playthrough — 0 console errors, 0 failed requests.

## Swifty animation tools — `tools/swifty_anim_tools.py`
- One file with the six helper scripts that used to sit outside the game in `podc/tools/` (merged 2026-09-29, code
  unchanged; verified to give byte/pixel-identical results). Used to make and check Swifty's animation files
  (`assets/gif/*.webp`, e.g. the peeking clip); **the game never loads it.** Needs Pillow, numpy, scipy.
- `python tools/swifty_anim_tools.py inspect|audit|extract|blinks|smooth-hands|build ...` (`-h` for each): contact
  sheet · per-frame audit (PNGs, CSV, biggest changes) · extract frames · add natural blinks (67-frame GIF) · smooth
  hand outlines · build the finished peeking GIF from the 114-frame source.

## Phase gate Swifty (2026-09-30) — CSS `[peek-4]`
- Swifty on the "चलिए, शुरू करें!" gate is 1.2× bigger at every window size (300–520px → 360–624px), ledge still on
  the bottom edge. The headline is untouched (its rule still places it from her old height). Measured at 10 window
  sizes: her head, at the clip's highest frame, stays ≥ 93px below the title's ink (≈114px at 1333×714).
- `[peek-5]` The headline and the VO wait for her: nothing but Swifty until her first open-mouth frame (4.14s into the
  clip, timed from when the clip can actually paint), then the headline pops in on the same tick the VO starts, and it
  fades as she ducks. A line that ends while she is still talking (practice, 2.3s) ducks her 0.45s after it.
- `[peek-6]` Swifty glitching: (1) the clip's loop count was 0 (loop forever) - any gate that outlived its 9.72s snapped
  her back to hands-only and she re-peeked while ducking; now 1 (play once, hold the smile). (2) At 1500x1500 its decode
  dropped ~45 frames per gate (~3.6s of stalls on an Intel UHD laptop; 4 with the clip hidden); at 900x900 (same 84
  frames and durations, still ≥ 840 device px at the largest size shown) it drops ~6. (3) It is fetched once and each
  gate restarts it from a `blob:` URL - the old `?r=` cache-bust re-downloaded 3.7MB per gate, a blank beat before her
  hands appeared.
- `[peek-7]` (2026-10-05) still glitching after peek-6. The clip itself is clean (84 frames, a smooth rise, no
  jumps between frames); the glitch is Chrome playing a big animated `<img>` with alpha under the gate's full-screen
  backdrop blur, the same stalls/blank frames already measured on the landing. `app.js` `PeekPlayer` now decodes the
  clip itself (WebCodecs `ImageDecoder`, the next frame decoded ahead, from the one `Assets` blob) and draws it on
  `#phaseGateCv` at its displayed size; the clip clock starts on its first drawn frame. No `ImageDecoder` (e.g. iOS
  WebView) or any error: the `<img>` path, unchanged.

## Correct-cube outline (2026-10-05) — CSS `.md-block.ok` `[ok ring]`
- Review: "the green outline on correct placement is not evident enough" (then: no white ring - only the green's shade).
  Measured: #00B132 on the cube's blue was 1.25:1 (same lightness). Now ONE 4px ring (was 3px) of deep green #166534 -
  the green with the most contrast on that blue (2.0:1), 3.7-6.6:1 on the floors / tabletop / grid. One rule for every
  cube in the game; timing unchanged.

## G1: the bed in a room (2026-10-05) — card data G1, CSS `#stage[data-bg="room"]`, `assets/obj_bed.webp`, `assets/bg_room.webp`
- Review: "replace the charpai and background in this screen only with image 2 and 3, do not add the window and plant".
  `obj_bed.webp`: the supplied bed cut-out, trimmed to its pixels, 1000×465 (ar 0.465, measured end to end: a0 0 / a1 1),
  its four floor contacts in `feet` for [ground]. `bg_room.webp`: the mock-up's own cream wall, orange skirting board and
  peach floor rebuilt row by row from a clean strip of it (no window, plant, props or UI) - 1333 px wide, wall meets floor
  at row 738, pinned to the slide's `--horizon` like the other rooms. G1's `bg` is "room" (was "yard"); everything else
  (8 cubes, the robot, the question and options) unchanged. `obj_charpai.webp` / `bg_yard_top.webp` stay in assets, unused.
- The thin light line down the floor at the stage's right edge (review "I can see a line here"): at a fractional scale
  (e.g. a 1920-wide window) the stage paints its own backdrop COLOUR in its last screen column, not the picture - the
  wall colour, on the floor. The room's layer under the picture is now a gradient of the same wall / skirting / floor
  bands, so that column matches. With it: every room backdrop is drawn 1px wider than the stage each side, and the
  mirrored bands round the stage (`.stage-bleed`) reach 1px under it. Measured at 1920 / 1600 / 1366 wide: no step left.
  (G2, G2b, G3's own backdrops show the same column at 1920 wide - not fixed yet.)

## Three fixes (2026-10-05) — `app.js` `[robot gap]`, `[line outside]`, MDK.mark; CSS `.md-mark.ok/.no`
- "why is there no space between the table and the robot?": on T2 the robot stands beside Swifty and the table was centred
  regardless - its front-left foot met the robot. The table now centres only where that leaves 36px of floor
  (`ROBOT_GAP`), else moves right, and shrinks only if it would leave the card.
- "the cross in the purple circle is not in the middle": the ✕ / ✓ were font glyphs (Baloo / Noto Devanagari), placed by
  the font's own metrics. They are drawn now (an SVG stroke, `background-position:center`): within half a px of centre.
  Then ("why is the cross so small"): drawn at 78% of the circle on a fuller stroke - 17px across in the 38px circle,
  the old glyph's size (it was ~10px).
- "the pink dotted line is getting hidden behind the blue cube": each end line was centred ON the measured end, where the
  first / last cube starts, so half its 10px was under the cube. Each line now stands just outside its end (inner edge on
  it) - every screen with end lines (T2, T3, G1, G2, G2b, G3); checked: no line overlaps a cube or a tile.

## T3: the column left of the door (2026-10-05) — `app.js` MEASURE_DEMO `[t3-left]`
- Review: "place the dotted lines and cubes on the left side of the door - there is a lot of vacant space on the left".
  The cube column stands left of the door now (its digits on its left, the "place here" arrow left of it pointing right -
  `.md-arrow.right` / `mdBobXR`, the gap/overlap ✗ on that open side - `freeSpot(..., "left")`); the end lines run from
  the column into the door's left side. The door moves right by the column + its gap (into the room the column had on
  its right), because it started only 24px right of आगे - at 1333×750 the door is at x 896-1127, the column 806-882, clear
  of आगे at every window size checked (1280×600, 1333×750, 1920×1080).
- Then ("shift this door a little towards right"): +60px, the column and its lines with it (1333×750: door at x 611-842).
- G2 (almirah) and G3 (fridge) the same (review: "same request for these 2 game screens", `app.js` MEASURE_ASK
  `[g-left]`): the column stands left of the object, the end lines run from it into the object's left side, the robot
  stays bottom-left - left of the column, at least 24px clear; the object is still centred. The cube size only shrinks if
  the left half can't hold the object's half + the column + the robot (1333×750: unchanged, 88px).
- (With it: the robot's aura also goes out while its cube is set down OFF the lid - the demo's gap/overlap step - via
  `rb-away`, set by MDK.glide whenever a block goes anywhere but its home.)

## "Start here" marker colour (2026-10-05) — CSS `.md-endmark` `[endmark colour]`
- Review: "the yellow indicator is not visible enough on a white background". The demo's "start where the last block ends"
  bar (T2, T3) was yellow `#FFC21A`: measured WCAG contrast 1.2-1.5 on the white grid paper, cream tabletop, wood and
  tile floors (3:1 is the floor for a UI mark). Now deep purple `#6D28D9` (3.7-6.6 on all of them; no other mark in the
  game uses that hue - green right, orange gap/overlap, red wrong, pink end lines, blue cubes), with a 2px white ring
  that lifts it off the blue cube beside it, a purple glow, and its own beat that dims only to .85 (was .55).
- Then (review: "yellow will change in all the tutorial part"): every teaching mark in the demo takes the same purple -
  the gap / overlap box (`.md-err`, was orange `#F5A524`, ~2:1 on these backgrounds), its ✗ (`.md-mark.no`) and the
  "place it here" arrow (`.md-arrow`, was `#FFB400`). Not changed: the game-wide wrong-ANSWER amber (`--wrong`, an
  option's border), the gold buttons, and P4's yellow/black measuring stripes (`.cf-marker`, not the tutorial).

## Measured objects on the floor (2026-10-05) — `app.js` MDK `ground` `[ground]`, CSS `[ground]`, data `obj.feet` / `items[].feet`
- Review: "add correct shadow effects so that they look placed correctly on the floor - the main elements whose length we
  measure with the cubes". As T1's tables: each object's floor contacts, measured from its alpha, are in the card data -
  `feet: [[x centre, y bottom, width], ...]` (fractions of the picture), four (front-left, back-left, back-right,
  front-right: the table, the charpai, both chairs) or its contacts left to right (the almirah's and fridge's feet, the
  door frame's posts, the pillow's whole underside) with `ground_depth` (how far back the floor under it reaches).
  Drawn: a dark contact shadow centred on each foot's bottom, behind the picture, and the floor under it shaded (the
  polygon through the feet, blurred - for two contacts the blur is scaled to the thin gap under the base, or it wipes
  it out). It replaces the old single ellipse (`.md-shadow`) wherever feet are given.
- The mats (G4) lie flat: `ground: "flat"` - a short tight shadow round their own outline (`.gnd-flat`).
- Re-measure `feet` if a picture is replaced.

## The robot mop (2026-10-05) — `app.js` MDK `robot` `[robot]`, CSS `[robot]`, `assets/robot_*.webp`
- Review: "in all game screens replace these cube boxes with the robot ... beside Swifty on the left side and only 1 cube
  in the same front view position above it; image 2 throughout, image 3 with every correct answer, 4 with every wrong
  answer". Every measuring slide's holder is the robot now: T2's toy box, T3's painting, G1's basket, G2's laundry
  basket, G2b's cloud tub, G3's wicker basket (`data.keep_holder: true` on a slide brings its old holder back - the code
  is all still there). It stands on the floor at the bottom left: beside the standing Swifty on T2/T3, under her header
  circle on G1-G3; the measured object is centred.
- One cube stands on its lid (in the cubes' usual front view); the child (and the demo hand) drags it from there. Once
  it is placed the next cube rises out of it onto the lid (0.12s later, a 0.3s rise) - endless: when the row is full one
  more still rises and stays on the lid (not draggable - the row is measured; `data.spare` is ignored with the robot). A wrong drop flies back onto the lid.
- The cube waiting on the lid has a sky-blue halo: a blurred light BEHIND it (`.rb-aura`, MDK.robot - over the robot,
  under the cube), slowly breathing (opacity only); it hides while the cube is carried or flying and comes back for the
  next. (Review "this is really bad": the first version was the cube's own `::after` - a child paints OVER its parent,
  so its pale ring sat on the cube's rim with rounder corners than the art: a hard double outline, flashing as it breathed.)
- Expressions: `robot_body.webp` = the smiling robot (image 2); `robot_face_happy` / `_sad.webp` are ONLY the face screen
  of images 3 / 4 (soft-edged) cross-faded over it in 0.2s, so the body never shimmers between the three renders.
  Hearts on every correct cube the CHILD drops, closed eyes on every wrong one; back to the smile after 1.4s. Nothing
  else changes its face (review: "don't show any expression in the tutorial parts"): not the demo hand, not the demo's
  gap / overlap, not the answer options, not the finish. No result badge on the robot (review: "remove 6 blocks from
  above the robot"). Review 2026-10-07 ("show it from under the table, let it come out for all these kinds of screens"):
  the result comes back as the game's normal white answer box (`.md-count`: the answer cards' rim and edge, navy #012F76
  text - not the gold badge), out from UNDER the measured object, on the conclusion VO's count word: T2 (`MDK.slipBox`) -
  it waits hidden behind the tabletop + apron and slips down out from under the top into the gap between the legs (a
  small overshoot and swing, then settles); T3 (`MDK.riseBox`) - it comes out of the light under the door (the light
  flares) and stands in front of the door's foot.
- Wrong placements (review 2026-10-07: "do not put the cube back on the robo mop ... make it disappear, and the new cube
  will appear on the robo mop"): on every robot screen (MEASURE_DEMO T2/T3, MEASURE_ASK) a cube set down wrong - the
  demo's gap / overlap and the child's wrong drops - is never carried back. It vanishes where it lies (a puff; the
  child's wiggles first) and a new one rises onto the lid (`MDK.robot` `respawn`, `childMeasure` cfg.respawn).
- Hearts: `react("happy")` shows the supplied pixel hearts again (`robot_face_happy.webp`, cross-faded over the live
  eyes, two beats) - the live eyes' "^^" had replaced them (review 2026-10-07: "where is the heart-shaped eyes").
- The entrance turn (T2 robot_enter) is a quick spin: the profile smears sideways (SVG horizontal blur), is swapped for
  the front view at the smear's peak in one frame, and the front view settles sharp with swirl arcs round its base - no
  cross-fade of the two drawings (review 2026-10-07: "it was looking like a two-image transition"). The robot itself never moves (review: "no movement, only his eyes") - it fades in, no pop. T3's painting finale (curtain + crayon answer) is gone with the painting.
- Sources: the three supplied 1254×1254 PNGs (2026-10-05); body cropped to the robot and scaled to 600px wide.

## Decor removed (2026-10-05) — card data, `app.js` COMPARE_MEASURED riders, `assets/obj_blackboard.webp`
- Review: "remove these elements from particular game screens". Gone from the card data: G2b's night window
  (`data.window`), G2's wall calendar (`data.calendar`), P1's turtle (the 2nd of `data.riders`), P4's bunting
  (`data.room.bunting`); `prop_turtle` / `room_flags` left the image manifest. Each is drawn only when its data is
  there, so no engine change was needed - except P1: with one rider left, `riders_random` now shuffles the SEATS, so the
  cat still lands on a random chair.
- `obj_blackboard.webp` (P4's answer card): the chalk "123", star, sun and wave are erased - the board's own shading
  rebuilt under them (a masked blur of the surrounding green + fine grain); the tray's chalk sticks and duster kept.
- The art files themselves (`obj_window_night`, `cal_*`, `prop_turtle`, `room_flags`) are still in `assets/`, unused.

## End lines: shorter + pink (2026-10-05) — `app.js` `[short lines]`, CSS `[line colour]`
- Review: "reduce the dotted line length too in all the screens, also change its color so that it doesn't blend with the
  blue cubes". Every end line (`.md-line`, and P3/P4's `.mm-guide`) keeps its white rounded dash but its core is now the
  landing's pink `#F03C8C` (was blue `#2458C6`), and `mdLineGlow` glows pink.
- Lengths (1333×750): T2 from just above the row to the bottom of the top's front band, ≈104px (was down to the floor);
  G1/G2b from the object's lower half (was its top) to the row; T3/G2/G3 horizontal lines from 60% across the object to
  10px past the column (were from its left edge to 40px past the column - room the removed flags needed).
- Whole dashes (review 2026-10-05: "I don't want any cut part in the dotted lines"): `.md-line` / `.mm-guide` repeat their
  dash tile with `round` (was `repeat-y` / `repeat-x`), so every line starts and ends on a whole dash at any length. The
  upright lines (T2, G1, G2b) also run one dash (16px) further down.

## T2 cubes on the tabletop (2026-10-05) — `app.js` MEASURE_DEMO `[t2-on-top]`
- Review: "in table game screens I want the cubes to come above the table and not down". T2 is the only slide that
  measures a table (T1 only compares two). The row now stands ON the top: its base at `TOPY` 0.17 of
  `obj_table_measure.webp` (the cream top runs 0.006..0.185, the olive edge band below it), still spanning a0..a1 (the
  top's full width). `ROOM_UP` 58px is kept above the row for its digits and the "place here" arrow; the table gives up
  size before that room (≈444px wide at 1333×750, was ≈482). End lines run from just above the row to the floor; the
  toy box stands on the floor level with the front feet; the result plate's slot is between the legs.

## No flags (2026-10-05) — `app.js` MDK `endLines` `[no flags]`
- Review: "remove the flags throughout the game". The start / finish flags on the measuring slides' dashed end lines
  are gone (T2, T3, G1-G3, G2b); the lines are unchanged and still end at the row's edge. MDK `flag()` and its wind loop
  stay in the file (`windOn` drives other things with the same wind). The room bunting (`room_flags.webp`) is
  decoration, not an end-line flag, and is kept.

## T1 tables on the floor (2026-10-05) — `app.js` PICK_EXTREME `[T1 ground]`, CSS `[T1 ground]`, data `options[].feet`
- Review: "these tables don't feel like they are placed on the floor". The one flat navy ellipse sat under the front
  feet only, but both pictures are drawn in perspective (back feet ~20% of the picture higher), so the back legs floated.
- Each table option now carries its four feet `[x centre, y bottom, width]` (fractions of the picture, measured from its
  alpha; order front-left, back-left, back-right, front-right). From them: a tight dark contact shadow under each foot
  (behind the picture, the foot covers its top half) + the top's soft shade on the floor between the four feet, in the
  floor's warm brown. The shadow stays down while the table drops in, lifts (it lightens) or shakes. Re-measure `feet`
  if a table picture is replaced.
- 2026-10-08 (review: "the tables looks like they are in the air, add a shadow so that it looks like the tables are
  placed on the floor"): the feet had gone from the card when the pictures were replaced, so only the old soft ellipse
  showed. Re-measured from the current art's alpha (each leg = the columns reaching below the apron; its foot = those
  within 3% of its lowest pixel): `obj_table_long.webp` [0.065, .9946, .0733] [.1478, .7649, .0656] [.8489, .7649, .0656]
  [.9328, .9946, .0733]; `obj_table_short.webp` [.0863, .9934, .0871] [.1766, .8073, .0742] [.8218, .8073, .0742]
  [.9113, .9934, .0855] - in both card copies.
- Same day, "same for this table" (T2, `obj_table_measure.webp`, MEASURE_DEMO already calls `MDK.ground` with `data.obj.feet`):
  its feet re-measured the same way - [.0585, .9941, .0768] [.1353, .8239, .0661] [.8607, .8258, .067] [.9411, .9941, .0759].
  Still without feet (the old ellipse only): T3 door, G2 almirah, G2b pillow, G3 fridge, G4 mats, P1 chairs.

## T2 table measuring layout (2026-09-30) — `app.js` `[t2-layout]` (MEASURE_DEMO, axis x), CSS `.md-box-*.open`
- Own table art, `assets/obj_table_measure.webp` (supplied 2026-09-30: a green table with a cream top and two drawers,
  replacing the drawn study table; T1 has its own two tables). Measured length = the top's full width (`a0`/`a1`
  0.0018 / 0.9982, `ar` 0.4562), shown 560px wide as before.
- Why the table could not grow: its width came from the height left after the table, a separate block row BELOW it
  and 72px kept for the result plate, so raising `obj.w` changed nothing (it stayed ≈ 361px). Now the blocks stand on
  the floor IN FRONT of its feet and the result plate no longer takes room below the row - at 1333×750 the table is
  482px (was 361), the blocks 80px (were 60).
- The table is centred or within 40px of centre (it gives up size before the centre). The toy box on its right was an
  OPEN CSS variant (`MDK.toybox(..., open)`) until the box became the supplied art (below), which shows every cube
  nearly whole on all the measuring slides.

## T3, the door's room (2026-09-30) — `app.js` `[t3-room]` + MDK `wallShelf`, CSS `[t3-room]`, `assets/floor_planks.svg`
- Card-driven, T3 only: `data.holder: "painting"` - a framed crayon painting of a man hauling a stack of blue cubes
  (`assets/painting_carrier.webp`) on the wall, SHOWN AS SUPPLIED ("keep the exact cubes as shown in painting, keep the
  painting as it is": no cord, nothing laid over it). Its cubes are the ones the child takes (MDK.wallPainting - same
  interface as the toy box): each real cube waits, unseen, on one of his painted cubes, top ones first, and shows only
  once it is picked up or moves off it; sent back, it goes back into the painting. Picked up, a painted cube PEELS OFF the
  paper ("the second I have dragged the cube from the painting it should not be visible in the painting anymore"): bare
  paper appears where it was and the cube in hand starts exactly as painted - its place, size and tilt - then straightens
  and grows to a real cube; in hand it looks like its painted cube (`assets/painting_cubes.webp`: each one cut on a
  smooth rounded square fitted to its outline - "the cubes are not smoothly cut"), and it turns glossy only when placed.
  A wrong drop: it flies back, shrinks and tilts into its place, and the painting has it again. He eases as the cubes are PLACED ("the expression of the man should get relaxed gradually" + the relieved version of
  the painting, "use these expression"): the 1st - his black strain dashes fade; half of them - his face cross-fades to
  the relieved one (cut from that painting, aligned on his hair: scale 1.017, shift -24/-5; his cheek, flat against a
  cube there, rounded and outlined); all - his sweat drops go. Every layer is a frame of `assets/painting_layers.webp`
  (0-5 the paper under cube k, 6-11 painted cube k, 12 the relieved head, 13 it without drops, 14 the paper over the
  dashes), composited 1:1 into one canvas over the head + stack. Review "his expression is getting cut": his relieved face
  ends 2px left of the painted cube still beside it (nothing covers it) with a rounded jaw - where a cube hid it in that
  painting - in his own skin tone and crayon outline; a pale sweat mark read as paper (a hole) is part of his face until
  he is fully relaxed. The stack is re-divided by each cube's fitted rounded square, so no corner of a taken cube is
  left behind; and a cube waiting in the painting only takes taps on its own painted cube (`--pt-hit` clip-path) - the
  76px cubes overlap there, and a tap could lift a neighbour.
  Upright (review 2026-10-01: "after the 5th box is dragged his posture should straighten a bit and he should only hold 1
  box", + the painting of it): `assets/painting_upright.webp` is that painting mapped into this frame - it is the same
  scene rescaled (x 1.0642, y 1.0373: its sun and clouds land on this one's within half a pixel), its paper put inside
  this frame's paper 14px in, feathered. It cross-fades in over him (0.75s) the moment the last cube to measure is LIFTED off him, not placed ("when I am
  dragging the 2nd last cube the posture is looking weird"), and back out if that cube is dropped wrong and returns: only he
  changes - he stands up, one blue cube in his hands.
  The ending (review 2026-10-01: "curtains will come and the painting will hide, and then 5 blocks written with a crayon
  by a child will come"; MDK.wallPainting `reveal`): once he stands upright, a curtain drops
  inside the frame - minimal (review 2026-10-01: "more minimal", then "keep the curtains red only, with golden borders, minimal"):
  red, five soft low-contrast folds, a gold rod, a thin gold border down both sides and along the gently curved hem; no
  swags, tassels or fringe (SVG) -, lands with a small upward
  rebound, holds while the painting is swapped for `assets/painting_blank.webp` (the same frame, its paper wiped clean),
  and rises; then "5 ब्लॉक्स" is written in blue crayon, stroke by stroke - each letter, then its top line
  (shirorekha) last, as a child writes it - a crayon tip moving along, and ("can we have stars also drawn on 2 sides") a
  star each side in yellow crayon, outline then a zigzag scribble, the tip turning yellow for them (3.3s in all),
  the conclusion VO starting with it; confetti and Swiftee's cheer when it is done. It replaces the golden badge on this
  slide. `assets/painting_answer.webp` is the text in the Kalam handwriting font (SIL OFL; rendered to an image, the font
  is not shipped) with a hand's wobble, a 2.5° slope, rough waxy edges and diagonal crayon strokes;
  `painting_answer_order.webp` holds when each pixel is drawn (the letters' thinned skeleton walked in writing order). The
  count is BAKED into these two images: if T3's count changes, they must be regenerated. Reduced motion: no curtain, the
  written answer at once. The paper
  is, per cube, the paper under exactly its pixels - the stack split on the middle of the
  dark outline between neighbours, with slivers and overhanging ledges handed to the cube whose body they belong to -
  hard-edged, reaching a few px past it over the paper / crayon fringe round it, its tint matched to the paper right next to it: no rim, no seam,
  nothing of a taken cube left, in any order. (The eraser animation that rubbed a cube out on placement is gone.) After 4 he carries his last 2.
  The result badge pops up where his erased cubes were (upper right), so he stays in view. (It replaced a wooden wall
  rack, MDK.wallShelf, now gone.) `data.floor: "wood"` - the card's
  floor is light oak planks (3 rows, staggered seams, a little perspective; review "not too distracting": seams a shade
  off the wood, no grain) under a white skirting board on the wall. `data.wall: "paint"` - the wall is plain warm cream
  paint instead of the graph paper ("wall painting in minimal way"), a touch lighter at the top.
  `data.obj.light: [0.093, 0.907, 0.984]` - the gap under the door leaf (measured on obj_door.webp); a quiet, steady
  sliver of warm yellow light in it (#FFD965, "the light should be yellow warm light"), dimmer toward the jambs, its glow
  falling only down onto a short, soft yellow patch of floor
  (review 2026-09-30: "the light coming out of the door is very loud" - it was a gold bar with a halo over the door's
  wood, a yellow fan across the floor and a slow pulse; no halo and no pulse now).
- The rule demo's ✗ (both slides) is placed by `MDK.freeSpot`: nearest clear spot round its red box - clear of the number
  bubbles, blocks, flags, rack / box, badge, आगे, Swiftie and the object's solid pixels.

## Result badge (2026-09-30) — `app.js` MDK `plate` / `boxPlate` / `atVoice`, MEASURE_DEMO `finish`, CSS `.md-plate*`
- The supplied golden badge ("6 ब्लॉक्स" on a cream pill, a glossy yellow rim, two stars, three rays). `badge_result.webp`
  is that art with its baked text painted out (a Laplace fill of the cream, so any count 1-9 goes on it) and its two
  stars lifted off (the rim under each rebuilt from the mirrored clean corner); its three rays (top-left) are erased
  (review 2026-09-30: "remove this" - the canvas keeps its size, so the text box and star spots hold). The stars are `badge_star.svg`, drawn to
  the art's star (puffy 5-point, inner/outer 0.6), put back at the measured spots and tilts (22°, −14°). The count is
  HTML text on the cream in the art's maroon (#6F1203), sized to the art (59% of the badge's width). Every slide's
  badge is this one (T2/T3 in the toy box, the MEASURE_ASK / COMPARE plates).
- T2 / T3: the badge rises out of the box ON the conclusion VO's count word - `data.count_at`, that word's start in the
  clip (word timings of `vo_p3_done` "…टेबल **छह** ब्लॉक्स…" 1.92s, `vo_p4_done` "…दरवाजा **5** ब्लॉक्स…" 2.12s),
  tracked on the audio's own clock (`MDK.atVoice`) - and as it stands (+0.6s) its two stars spin once inward (top-right
  anticlockwise, bottom-left clockwise, swelling to 1.3×; `.cheer`). Replaying the VO spins them again on the count. It
  now stands with its foot on the box's front rim (73% down the art), so the lower star is seen whole.

## P2 / P3 as photos (2026-10-01) — `app.js` `[photos]` (MATCH_MEASURE `data.look`), CSS `[photos]`
- Review: "redesign these slides for better relatable visuality and adding meaning" + "remove the tick marks - only green
  outline represents correct answer" (the ✓ badge on a matched label is gone). `data.look`:
  - **P2 "board"** - the class notice board (`bg_corkboard.webp`: cork in a wooden frame; its kids' drawings, star chart
    and gold stars pinned at the edges were taken out - review 2026-10-01: "remove the circled elements" - re-rendered
    from its own source without them). The three objects are white photos pinned on it (`prop_pushpin.webp`); the sizes are
    brown paper tags (a hole, a red string) - dropped on the right photo, a tag swings on its hole (now the supplied art,
    below).
  - **P3 "fridge"** - the fridge door (`bg_fridge.webp`: cream enamel with a soft gloss and its bottom edge; its chrome
    handle, a kid's drawing, the loose fruit magnets, Mummy's sticky pad and a crayon were taken out - review 2026-10-01:
    "remove extra elements as shown in circle" - re-rendered from its own source without them). `data.fill "stage"`
    (review 2026-10-01: "these are cropped from upper side"): the scene uses the height kept for the hidden next button,
    so the cards sit lower and their magnets clear the top of the slide's frame, which clips above it (they were cut 22px).
    The photos are held by fruit magnets (drawn on the supplied cards, below); the
    sizes are Mummy's sticky notes, pressed on. Once all three are matched, each photo shows what the size was for
    (`item.fit`): a curtain slides down over the window, a floral cover drops on the TV, a knitted sleeve slides up the
    bottle - then the all-matched VO.
  - Each photo's picture is a little scene of the object's own place (`item.scene` floor / wall / shelf / table,
    `item.wall`), its broad bottom margin the label's place. Right = a green outline on the photo and the label; wrong =
    the photo shakes, the label comes home; the 2nd time the right photo glows and the hand points (unchanged ladder).
- **P2's supplied art** (review 2026-10-01: "replace it with good quality assets", then "replace the on-screen clips and
  white sticky notes with these HD quality assets" and "remove extra wall clips"):
  - the pictures `pic_bench.webp` / `pic_blackboard.webp` / `pic_stool.webp` - each object with its blocks drawn on
    (4 across / 3 across / 2 up); `item.pic {w, h}` is the picture's size in blocks (measured from its own blocks), so
    the game draws them at its one cube size (76px) - no blocks or end lines of the game's own on P2 now. The art's
    bench top runs a little past its 4 blocks and the stool's seat a little over its 2 (as drawn).
  - the tags `tag_2/3/4.webp` (`data.tags`: each tag's card body, crop and hole in body heights) - the tag body fills
    the box, its red loop hangs out on the left (the row spaced for it); dropped right it swings on its own hole and
    its dashed slot fades; no pin of its own any more.
  - the card `card_photo.webp` (`data.card`) - the supplied photo card, its label slot painted out, 9-sliced to each
    photo's size at 0.416 (an 18.7px frame, a 104px margin for the slot; CSS `.mm-card.mm-ph.hd`); the slot is drawn
    as the card's was (`.mm-slot.at-board.hd`). `prop_pushpin.webp` is the supplied HD pin (240 x 298), only on the
    cards' tops. `obj_stool.svg` (P2's only) was removed; `obj_bench.svg` / `obj_blackboard.svg` stay for P4.
  - then (review 2026-10-01) "there are lines in the white note paper": CSS border-image left hairline seams where its
    slices meet, so the card is now 9-sliced onto a canvas of its own (`paintCard`, at the card's size x the screen's
    resolution, each piece a device pixel over its neighbours) - no seams at 1x or 1.5x; and "remove green outlines -
    only the green outline on the tags, and it goes away": a matched card gets no ring; the tag (and P3's note) shows
    the green outline, which fades out over 1.6s (`mmOkGlow`).
  - the ending (review 2026-10-01: "after all 3 are correctly placed they should come in the center and get a little
    big"): `data.finale {scale: 1.08}` - once the third tag is on (with the confetti), the three cards with their
    pictures, tags and slots glide as one group (0.8s) to the middle of the scene - the empty tag row's room too - and
    grow to 1.08, each part transformed about the group's centre; then the all-matched VO. P2 only (P3's fits are laid
    over its cards in the scene).
- **P3's supplied art** (review 2026-10-01: "replace the assets on this screen with the attached HD quality assets",
  "shift the options a little upper"; for a while before it P3 had P2's photo card round its drawn scenes):
  - the cards `card_window.webp` / `card_bottle.webp` / `card_tv.webp` - each supplied card whole: its white frame, its
    scene with the blocks and end lines drawn on (3 up / 2 up / 4 across), its fruit magnet (mango / strawberry /
    sunflower) sticking up over its top, its soft shadow; only its dashed label slot was painted out (the game draws
    it, `.mm-slot.art` - the art's brown dashes and cream - and fades it under the note). `item.art` = {src, ar, frame
    (the card's body in the picture), slot, obj (as fractions of the body)}: the card element is the body (the hover /
    right ring, the shake, the drop); the cards are all one height side by side, as big as the row allows (`artPlan`).
    No blocks, end lines, object pictures or magnets of the game's own on P3 now (`obj_window/bottle/tv.svg` and
    `prop_mango/strawberry/sunflower.webp` removed). The blocks are each card's own size (the cards are drawn at
    different zooms).
  - then (review 2026-10-01: "decrease the size of circle pins", "bottle is longer than the cube so game logic is
    affected"): the supplied cards had their blocks drawn at three sizes (153 / 170 x 207 / 144 px - the bottle's not
    even square) and the bottle stood ~1.35 blocks over its 2. Each card was split into layers: `card_*.webp` is now
    only its frame and room (the blocks, end lines, object and magnet painted out - the wall filled smooth from the
    clean wall round it, the shelf row by row from its planks, the magnet's band straight across; the empty band above
    the card cropped off), its object cut out (`obj_window.webp` - frame, sill and pot plant; `obj_bottle.webp`;
    `obj_tv.webp` with its stand) and its magnet (`prop_mango/strawberry/sunflower.webp`, the fruit with a white
    sticker edge). `item.art` = {src, ar, frame, slot, scene (its picture window), base (the shelf line)}; `item.src` /
    `item.ar` the object. The game lays one block size on all three cards - the biggest each picture holds (`artFit`;
    70px at 1366 x 768, the game's 76 at most) - each object exactly n blocks long standing on the shelf (a column of n
    beside the window / the bottle, a row of 4 on the TV), the game's cubes (`MDK.cube`) and end lines (`.mm-guide`)
    across both; the magnet is centred on the card's top edge in a box .18 of the card's width (`MAG`, ~60px - the
    supplied ones were ~100). The fits were re-fitted to the object pictures (`item.fit`, same place as before).
  - the sticky notes `note_3.webp` / `note_4.webp` (supplied) and `note_2.webp` (only 3 and 4 came: the "3" note with
    its "3" painted out and a "2" drawn in its place - the game's Baloo 2 ExtraBold, the size, slant and position of
    the painted 3 (fitted to it), its colours copied from it by distance from the edge and the way the edge faces:
    the dark rim, the light bevel, the gloss from the top left). `data.tags` as on P2, without a hole: each note's
    paper fills the box; the three a little askew, each its own way; their shadow is in the art.
  - `data.strip_up` 24: the notes' row 24px higher off the foot (34px clear of it).
  - the curtain / cover / sleeve (`item.fit`) are still drawn in code; on the new cards the curtain and the cover are
    kept inside the window frame / from the TV's top edge (`fit` x y w h), clear of the blocks and the magnet. A
    generated picture can replace one as `item.fit.src`.

  - review 2026-10-01 ("same for this - remove green outlines, only the green outline will come on the yellow options
    and go away"): a matched card gets no ring (`.mm-card.mm-ph.art.ok`); the note shows the green outline, which
    fades out to nothing over 1.6s (`mmOkGlowFlat` - the note picture keeps no shadow of its own).
  - review 2026-10-01 ("shift this a little upper so that the yellow options are not too much in the bottom"):
    `data.strip_up` 24 -> 64 - the notes 40px higher (592-668 of 750), the cards 20px. And ("the dotted lines are not
    looking good enough as per their responsibility", also P4's measuring view): `.mm-guide` - the end lines on P3's
    cards and P4's measure view - is now the game's own end line (`.md-line`'s white rounded dashes, a bolder blue core,
    a soft navy edge so they show on cream too), 9px, centred on the end, drawn in like the main slides' lines.
## Rooms (2026-10-01) — `app.js` `[rooms]`, CSS `[rooms]`, `assets/bg_*.webp`, `assets/holder_*.webp`
- Review: "generate relatable backgrounds for these slides ... not too distracting, on the theme of the main elements,
  funny, relatable, eye pleasing ... all different backgrounds and different tokri than the red one" - only G2, G2b, G3,
  G4, P1. Per slide in the card: `data.bg` (the stage's backdrop, CSS `#stage[data-bg]`), `data.holder` (G2 `laundry`,
  G2b `cloudtub`, G3 `wicker` - MDK.holder, the toy box's two layers and proportions), G2b `data.horizon: "base"` (its wall
  meets the floor at the pillow's base, not half-way up it).
- The rooms: G2 a bedroom (sage wall, honey planks, a calendar - review 2026-10-01: "remove window, remove bag and teddy,
  remove the socks": its window with rose curtains, the school bag, the teddy and the socks caught in the almirah's doors
  are gone, the backdrop re-rendered from its own source without them; then "replace the almirah with image 2": the
  supplied almirah with a sock caught in its doors, cut out of its room as `assets/obj_almirah_sock.webp` (ar 1.2302,
  measured from its top to its legs' bottom) - G2 only, P4 keeps `obj_almirah.webp`);
  G2b the same at dusk (lavender wall, a soft rug, the moon in the window on the left; review 2026-10-01: "reduce the
  floor space ... remove the cat completely" + "this pillow should be at center in the screen" - the cat is gone, the
  pillow itself is centred (its bed on its right), `data.fill "stage"` lets the scene use the height kept for the hidden
  आगे so the group and its floor line sit 92px lower: floor 372 -> 280px); G3 a kitchen (a tiled counter - its shelf of steel dabbas, the teapot and the mouse taken out, review 2026-10-01:
  "remove the assets in the red circle" - a soft checker
  floor; review 2026-10-01: "reduce the floor space and remove the window and the two vegetables on the cube box" - the
  window with its tulsi is gone from the backdrop and the carrot and tomato from the tokri, both re-rendered from their
  own sources, and `data.fill "stage"` puts the fridge's floor line 92px lower: floor 234 -> 142px; then "replace this
  refrigerator with image 2": `obj_fridge.webp` is now the supplied two-door red fridge with its three sticky notes, cut
  out of the checkerboard painted into that picture - ar 1.7208, measured from its top to its feet' bottom); G4 a sunny terrace seen from above like the mats (cement slabs in the sun - its kite, papads and pigeon taken out,
  review 2026-10-01: "remove the element in the red circle");
  P1 a veranda (a wainscot, a red-oxide floor - review 2026-10-01 "remove the elements inside the circle": its grille
  window, the clock on its shelf, the potted plant and the curious dog are gone, the backdrop re-rendered from its own
  source without them). Each backdrop is one
  image drawn in stage px (SVG, rendered at 1.5x) with 60px spare above and below, anchored to the slide's own
  `--horizon` (MEASURE_ASK and now COMPARE_MEASURED set it), so the object stands on its floor; props only in measured
  empty zones (never behind an object, a block, a flag, a button or a count plate). The holders: a pastel plastic laundry
  basket, a round mustard plush cat bed with a paw (since replaced, below), a round bamboo tokri (its carrot and tomato
  since taken out) - drawn as SVG.
  G2's basket and calendar are now supplied art (review 2026-10-01: "replace the calendar and pink box with image 2 and
  image 3"): `holder_laundry_back/front.webp` = the pink heart basket, split at its front rim's top edge, with its own
  geometry (MDK `HOLD_K.laundry`: 4.20 x 1.98 blocks, opening 3.45 blocks, the front row's bottom 35% behind the front
  wall - the other holders keep the shared `HOLD_BASE`); `obj_calendar.webp` = the "12" calendar (CSS on the bedroom
  backdrop, same place). Stray specks in both pictures were dropped.
- G2, review 2026-10-01 "the almirah should look bigger as compared to the pink box / other elements": the pink basket
  is 2.7 blocks wide (it was 4.2 - wider than the almirah), two cubes a row (`HOLD_K.laundry.cols`), the back pair
  tossed in, leaning (`pile`); the calendar is 90px wide (it was 122), centred over the basket, and "add a wind effect on
  the calendar page": `[cal-wind]` MDK.calendar - three layers of `obj_calendar`'s art (`cal_base.webp`: the calendar
  with its top sheet's "12" wiped, the blank sheet under it; `cal_page.webp`: the top sheet, drawn in 10 strips;
  `cal_head.webp`: the blue binding, over them). It is the flags' own wind (MDK.windOn, the same gusts): a gust lifts the
  sheet's lower part off the wall, bending more toward its free edge, pushed right with the wind; in a lull it settles,
  a little late; under it the blank sheet shows, shadowed (`data.calendar {w, top}`). "Add a shadow to all three ... see
  perfect shadows": one light, from the upper left - the almirah a contact shadow and its shadow on the wall to its
  right; the basket a contact shadow and its shadow on the floor (`.md-shadow-floor`); the calendar a short, crisp one.
- G2b, review 2026-10-01 "place the window and the tub which has the cubes ... ignore the separate big moon": the
  supplied night window is its own layer (`[night-window]` MDK.nightWindow, `obj_window_night.webp`, `data.window` -
  placed where the backdrop drew the old one, which is gone from the backdrop): "make the moon shine a bit and the
  stars twinkle - don't overdo it" + "too much, distracting": a soft warm glow over its moon breathes slowly (6.5s), and
  every other star brightens softly in its own time (5-6s, no rays). The supplied cream cloud tub replaced the cat bed
  (`holder_cloudtub_back/front.webp`, `HOLD_K.cloudtub`: 4.0 blocks, three cubes a row as drawn, the spare raised
  behind): its three painted cubes taken out, its back rim laid along its own line, its inside repainted end to end with
  its own colours (the lit back wall, the shadowed floor); the front layer follows the rim's top edge column by column
  round its curved corners ("the cube is unevenly cut" - a straight cut let the left cube cover the rim where it curves
  up); `data.box_dx` 40 sets it a little further right ("shift the box a little right"). The cat bed's art is deleted.
- G3, review 2026-10-01 "increase the size of refrigerator": the fridge is 4 blocks tall (it was 3 - 354px), options
  3 / 4 / 5, `vo_p7_ok` re-recorded ("शाबाश! फ्रिज की लंबाई 4 ब्लॉक्स है।"). "We can shift this to more right": the kitchen
  counter (its tiles, worktop and cabinets) sits 160px further right, clear of the end flags ("shift the kitchen
  interior a bit more": 90 -> 160px) - `bg_kitchen.webp` re-rendered from its page with the counter as one group moved
  (its second cabinet door now runs off the edge). Then "remove this": the counter is gone altogether - the kitchen is
  its plain cream wall and checker floor (re-rendered from its page without the counter group).
  "Change the tokri from image 2": the supplied woven basket (a thick rim with wrapped bindings, a red-and-green band)
  replaced the bamboo tokri (`holder_wicker_back/front.webp`, `HOLD_K.wicker`). "Reduce the size of tokri": the cubes
  keep the game's one size, so it holds two a row - 2.8 x 1.53 blocks (it was 4.02 wide, three a row, wider than the
  fridge), each row behind raised 0.42 and a little askew: its 5 cubes heaped 2 + 2 + 1, settling to 2 + 2, 2 + 1.
  "How this screen will look better" (agreed 2026-10-01): the fridge has the bedroom's one-light shadows (a contact
  shadow at its feet, its shadow on the wall to its right), G3 keeps one spare cube instead of two (5, a neat heap),
  and the counter's second cabinet door - a sliver at the screen edge - is taken out, so one whole door shows (the
  counter has since gone altogether, above). The basket's five painted cubes are taken out: its back rim laid along its
  own arc where they hid it, its inside rebuilt from its own outer weave (flipped to run like the back wall, colour-matched
  to the inside that shows at both ends and blended into them); the front layer starts at the rim's inner front edge.
  A floor shadow as the other room holders'. The tokri's art is deleted.
- Credits: the rooms' own props (backpack, teddy, calendar, moon, cat, anger sign, potted plant, dog, clock, kite,
  pigeon) have all since been taken out of the backdrops (reviews 2026-10-01); the props still in use - on P2 / P3, see
  "P2 / P3 as photos" - are Microsoft Fluent UI Emoji, 3D style (github.com/microsoft/fluentui-emoji), under the MIT
  License:

```
MIT License

Copyright (c) Microsoft Corporation.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE
```

## Objects centred (2026-10-01) — `app.js` `[centre]` (MEASURE_ASK, COMPARE_MEASURED)
- Review: "place all the main objects in the center" + "do changes after this slide only, don't touch this slide" (T3):
  the slides AFTER the door slide only - T2 and T3 unchanged. G1 / G2b (a row): the object centred, the toy box on its
  right (its gap 44-60px, never over the end flag), allowed into the stage margin beyond the scene. G2 / G3 (a column):
  the object centred, its column + flags on the right, the box on the left (gap 40-70px). P1: the two chairs with their
  columns centred as a pair (the space kept for the last one's count plate no longer shifts them). G4, P2, P3 were
  already centred. Played: every cube placed, the right answer taken, nothing outside the stage.

## One cube size (2026-09-30) — `app.js` `MDK.CUBE`, CSS `[one cube]`
- Review: "same size length and breadth of cubes in all the slides strictly" - chosen: 76px everywhere, fewer cubes where
  an object can't hold its count at 76. Every cube is exactly 76 × 76 stage px: the landing's (its pencil is 536.87px wide
  so its ink spans 7 × 76, and each strip slice is stretched to the square - the strip's cubes are 205-213px as drawn)
  and every measuring slide's (they ask for `MDK.CUBE`; the fit rules only step in if a slide ever can't hold it). The
  card's per-slide `s` / `bh` are gone.
- New counts (they must add up to the object at 76px): T3 door 9 → 5 (review "increase the size of door a little bit": 4 → 5, the door 304 → 380px; its floor band 46 → 24px), G2 almirah
  7 → 4 (options 3/4/5), G3 fridge 6 → 3 (options 2/3/4; then 4, options 3/4/5 - see Rooms), G4 mats 6/7 → 5/6, P1 chairs 4/5 → 3/4. Unchanged: T2 6,
  G1 8, G2b 3, P4.
- **Re-recorded 2026-10-01** (their numbers changed): `vo_p4_done` "…दरवाजा 5 ब्लॉक्स…", `vo_p6_ok` "…अलमारी … 4 ब्लॉक्स",
  `vo_p7_ok` "…फ्रिज … 3 ब्लॉक्स" - the card's texts, the same voice and pipeline (see `VO_MANIFEST.md`). T3's `count_at`
  is re-timed on the new `vo_p4_done`: 2.12s (was 2.16s on the old nine-block line).
- P2 / P3 (the matching screens): three measured objects + a COLUMN of number boxes could not hold 76px cubes at any
  sensible counts, so they take `data.strip` - the objects in one row across the whole width, the boxes in a row under
  them (a little tighter: box 64px, padding 12) - and fewer cubes: P2 bench 7 → 4, board 5 → 3, stool 3 → 2 (boxes 2 / 4
  / 3); P3 window 5 → 3, bottle 3 → 2, TV 4 (boxes 3 / 4 / 2). Their VO says no numbers - nothing to re-record.

## P2 / P3 match the following + P2 softboard (2026-10-06) — `app.js` MATCH_ROWS `[lines]`, CSS `[lines]` / `[softboard]`, card `data.join` / `data.bg`
- Reviews: "redesign the background of this game play screen, see and analyse the previous errors in the background and
  fix it" (P2) and "change the game mechanism of this game screen from drag and drop to match the following" (P2, then P3:
  "same for this game screen also"); "take help from HI01H01_L02_S04_dist to understand and implement match the following".
- **P2's background** - the errors in `bg_corkboard.webp` (2000x1125, its wooden frame painted in, drawn 100% x 100%):
  - the bands round the stage (`#stageBleed`) mirror the backdrop, so the painted frame came back as a 2nd / 3rd frame on
    the screen's sides with a seam down each;
  - stretched off its own shape onto the 1333x750 stage, the frame's top and bottom were thinner than its sides, and the
    bottom one sat under the nav;
  - mid-brown speckled cork, the tone of the bench's wood and the yellow card's rim: the cards' edges, the dashed tags
    and the beige empty slots sank into it.
  - Now `data.bg "softboard"`: CSS only (no picture, nothing to stretch, no frame) - a light warm board, a faint pin-dot
    weave, a soft light in the middle where the game is. Every layer mirrors onto itself, so the bands are seamless on
    any screen shape. `slideArt` does not preload a `bg_softboard` file. `bg_corkboard.webp` is no longer used by any slide.
- **Match the following** (`data.join "lines"`, P2 and P3): the three object cards stay side by side, the shuffled boxes
  stand in a row under them (the empty drop slots are gone), a navy dot on each card's foot and each box's head (one
  colour for all - the boxes' own tones would pair a card with the box of its colour). The child joins a card and a box:
  drags from either dot / card / box to the other side (a blue line follows the finger), or taps one (it pulses) and
  then the other. Right: the line draws on in green and stays, both dots green, the card's blocks flash, SFX. Wrong:
  the line draws red, the card and the box flash red and shake, the line fades - then the same per-object ladder: #1
  `try_again`, #2 its blocks counted with their digits, #3 the right box glows and the hand TRAVELS from the card's dot
  to that box's dot, looping until the next pair (HI01's `travelNudge`, 28o: the hand shows the move, not just "this
  one"). Never solved for the child (HI01 28l). Idle 7s: the hand under the next open card's dot. Same VO, same signals
  (`match_correct`, `answer_wrong`), same XAPI. HI01 has no line-drawing game (its pair games are drag-to-zone), so
  what was taken from it is its interaction rules, not a module.
- The cube stays 74px on both (P2 bench 4 / board 2 / stool 1, P3 window 3 / bottle 1 / TV 2 - unchanged).
- Then (review 2026-10-06, P2 + P3): "decrease the length of dotted lines" - the end lines ran the blocks' and the whole
  object's length and 10px past both (card edge to card edge); now the blocks plus a short reach into the object
  (0.45 cube), 4px over. "increase the size of all 6 boxes" - the size boxes 196 x 76 -> 236 x 92 (text 32 -> 38px) and
  the cards' padding 12 -> 24, gap 10 -> 16 (the cube unchanged). "these 3 box size should be same" - every card is the
  widest one's width, each object centred on its floor.
- Rule check (the game's own patterns, measured at 1920x894, 1617x781, 1366x768, 1280x800, 2400x1080, 1024x768): one cube
  size, the three cards one size, the three boxes one size, every cube / object / end line inside its card, nothing
  outside the stage or overlapping, no box text overflowing - clean on both slides at every size. One break found and
  fixed: the 3rd-rung hand ended ON the right box and covered its "<n> ब्लॉक्स" (the engine's hand rule [QA 12]: never on
  a label) - it now travels from the box's dot UP to the card's dot and rests in the band between the rows.
- Then (review 2026-10-07): "give more space between both the rows" - the lines' band 104 -> 150px (the group stays
  centred: P2 60px / P3 33px left under the boxes); "place the assets in center of respective boxes" - each object with
  its blocks sits in the middle of its card both ways (it stood on the card's floor), measured within 1px on all six.

- Then (review 2026-10-07): "the pink dotted line are not clearly seen" - 4px #F03C8C dashes (7 on / 6 off) ran along
  the blue cubes' and the wood's own edges and sank into them; now 6px, #E0137B, 10 on / 5 off, above the cubes, each
  dash ringed in white (four 1px drop-shadows) plus a soft shadow (CSS `.mr .mr-end`). "replace bottle with bottle can"
  (asked: the 20-litre water jar) - P3's bottle is now `obj_watercan.webp` (drawn for the game as an SVG in the objects'
  cartoon style - blue ribbed jar, neck ring, cap, navy outline - rendered 440 x 910, ar 2.0682), item id `watercan`,
  still 1 block tall (the box "1 ब्लॉक" unchanged; no VO names it). `obj_bottle.webp` removed from assets (ASSET_SIZES
  regenerated, `node tools/gen_asset_sizes.js`).

- Then (review 2026-10-07): "increase the size of stool a bit" - asked first (the cube stays 74, so a bigger stool either
  stops measuring 1 block or becomes 2); chosen: P2 stool 1 -> 2 blocks (148px tall) and, to keep three different
  answers, the blackboard 2 -> 3 blocks: P2 is bench 4 / board 3 / stool 2, boxes `[2, 4, 3]` (each still away from its
  own card's column). P2's VO says no numbers - nothing to re-record. "image 2 boxes size should be same as that of image
  1 boxes size" - the line cards are at least 300px tall (P3's, its window 3 blocks up), so P2 and P3's six cards are one
  size, 328 x 300 (measured at all six screen sizes).

- Then (review 2026-10-07): "replace the asset with these, these are better ones" - P2's three objects are the supplied
  pictures, each cleaned of the faint specks round its cut-out (alpha < 30 cleared), cropped to the object and saved
  600px wide: `obj_bench_p2.webp` (ar 0.4116), `obj_blackboard_p2.webp` (0.5934), `obj_stool.webp` (0.8349, replaced in
  place - P2's only). The bench and board are NEW files: `obj_bench.webp` / `obj_blackboard.webp` stay for P4's classroom,
  whose spaces are fitted to those pictures. The wider stool made the old fit rule (the three objects' widths summed)
  drop P2's cube to 73px; with the line cards one width (the row / 3) each object is now fitted to its own card - 74px
  again on both slides, every check clean at all six sizes.

- Then (review 2026-10-07): "replace assets with these. use window and monitor from image 3" - P3's three objects are the
  supplied art: `obj_watercan.webp` (the supplied 20-litre jar, ar 1.5967, replacing the one drawn for the game),
  `obj_window.webp` (ar 0.872 - frame, sill, pot plant, a school seen through it) and `obj_tv.webp` (ar 0.7574 - a
  monitor with a fish scene), the last two cut from the supplied sheet (its middle object, a water dispenser on a stool,
  is not used). Cleaned: specks under alpha 30 cleared, and every soft edge pixel recoloured from its solid neighbours -
  the sheet's cut-out had left ~870 red fringe pixels round the window and monitor. All three replaced in place (P3's
  only). The new window is much wider for its height (0.87 vs 1.07): 3 blocks up beside its cubes it needs ~340px, over
  the 328px card, which would have cut the cube below 74 - so the line screens (`.md-stage.mr.mr-wide`) take 100px more of
  the stage's 150px side margins on each side (about the header's width) and every line card is the row's third: P2 and
  P3's six cards are 395 x 300, the cube 74 on both, every check clean at all six screen sizes.

- Then (review 2026-10-07): "increase the size of bottle jar with the number of cubes", the reviewer's set "window 4, jar 3,
  monitor 2", then "whatever is logically more correct, but all 3 should be visible enough" and, for the monitor, "increase
  the size of this altogether". P3 is now window 4 (296px up) / jar 3 (222px up) / monitor 2 - the monitor measured by its
  HEIGHT now (`axis "y"`: ~195 x 148px, was 148 x 112 measured across) - boxes `[2, 4, 3]` (none under its own card; the
  old `[3, 2, 1]` had the window's 3 straight under it). The cube stays 74. What gave: a 4-block window with its blocks
  beside it is ~425px wide, over a third of the row, so the line cards are equal thirds only when every object fits one
  (P2) and otherwise each fitted to its object, the row's spare width shared out (P3: 510 / 309 / 366px). Every line
  card is one height, a 4-block object's (338px - padding 24 -> 16), on P2 and P3; the lines' band shrinks from 150 to
  what is left (min 110 - 126px on both). The cube's width fit is the objects' summed widths again (never a third).

- Then (review 2026-10-07): "change the match the following horizontal lines to vertical" - two COLUMNS now: the three
  objects stacked on the left (one width, the widest object's; each card as tall as its object), the boxes stacked on
  the right (spread over the cards' height), the lines run across; dots on each card's right edge and each box's left
  edge. Asked first: no column of three measured objects holds a 74px cube in the ~580px scene (P3 needs 666px of objects
  alone), and the reviewer chose "columns, smaller cubes" - the cube is the largest the stack allows: P2 57px, P3 48px
  (every other screen 74, P1 85). Same counts, boxes, ladder, hand (it now travels across, from the box to the card's
  dot), signals; both slides played through clean.

- Then (review 2026-10-07): "after correct match the cubes should not show green outline" - a right pair no longer
  flashes the object's cubes (`okFlash`); the card, the line, the dots and the box turn green, the cubes stay as they are.
  Probed on P2 and P3: no cube carries `.ok` in the 1.2s after a match.

- Then (review 2026-10-07): "remove hand nudge from match the following" + "see the figma keep the animation like this only
  for the 1 time - implement this design from Figma" (FLN "Match the following", node 1162:29905: five frames - rest,
  the hand demo, a drawn line, right, wrong). P2 / P3 now:
  - no hand at all in play: no idle hand, no travelling hand on the 3rd wrong (the right card and box only light up blue);
  - the Figma look: white cards and boxes, 2.69px #D5D8DF border (radius 16) -> #3B82F6 picked / aimed at, #00B132 right
    (box text #059669), #EB5757 wrong; box text #5A7CAD; on each object a 21px #D9D9D9 dot with the "pull me" handle (14px
    #5D85F5 stem + 10.67px dot), on each box a 21px ring (3px); the line 2px #5D85F5 ending in its 10.67px handle dot,
    green kept when right (the ring then holds the dot), red when wrong (both cards, dot, ring) then gone;
  - the demo, once per session (`window.MR_DEMO_SEEN`), after the instruction and only if the child has not touched yet:
    the Figma hand (`assets/nudge_slide_right_v1.svg`, 185px turned 32.14deg; its fingertip measured at (+80, -10) from
    its centre) lands on the first object's dot - card and dot blue - and slides two-thirds of the way to the box level
    with it, the blue line and its handle dot under the fingertip; then it all clears (~3s). No box is lit, so it shows
    the move without an answer. Any touch ends it. Reduced motion: no demo.
  Verified headless: the demo frames, nothing left after it, P2 / P3 played through, the 3rd wrong with no hand, 0
  console errors. Not run: P2 then P3 in one session (the once-only rests on the window flag).
- Then (review 2026-10-08): "in this game screen change the tv with image 2 asset. and follow the ppt as it is for
  everything" - P3 follows SME deck page 11 to the letter: the window 5 (its height) / the water bottle 3 (its height) /
  the TV 4 (`axis "x"`: along its longer side, the blocks on top), boxes `[5, 4, 3]` in the deck's order.
  `assets/obj_tv.webp` replaced in place by the supplied "Cartoon Ocean Adventure on TV" (1536x1024 PNG: its faint dark
  halo dropped, the body made fully opaque, cropped to the set, 600x348, ar 0.58). `data.ppt_hints` - the deck's own
  Feedback/Hint, no hint VO (`audio.try_again` removed): wrong 1 - the red line bounces back into the dot it was drawn
  from; wrong 2 - the object's blocks light up one by one with their digits 1, 2, 3 ... (shown, not said: 650ms each);
  wrong 3 on - a hand nudge, its fingertip tapping the right box's dot (the label stays clear), until the next pair.
  Right: the line locks green + the SFX; all three: `vo_match_ok`. P2 keeps its own ladder. The window's 5 blocks make the
  shared P2 / P3 cube 29px (was ~36): the six cards stay one size, 241 x 171. Verified headless (Edge): no VO on three
  wrong pairs, the hand on the 3rd, only `vo_match_ok` at the end.

## P1 zoom (2026-10-07) — card `slides[P1].data.zoom`, `app.js` COMPARE_MEASURED
- REMOVED 2026-10-08: P1 went to the deck's 4 / 5 chairs at the game's 74px cube (see G4 / P1 above). The code still
  reads `data.zoom`; no slide sets it now.
- Review: "zoom in this screen a bit, do not change anything else". P1 (the two chairs) only: `data.zoom 1.15` scales
  the slide's cube 74 -> 85px (the chairs, the cat and the blocks with it; the fit rules still cap it - nothing clipped at
  1920x894, 1366x768, 1024x768, 2400x1080). Asked first, since it breaks "one cube size on every screen" (2026-10-06):
  the reviewer chose P1 only - its cubes are now bigger than the other screens'. Every other slide has no `zoom`.
- Verified headless (Chrome, 1920x894): P2 and P3 played through - a wrong pair, a drag pair, a tap-tap pair, all three
  matched to the confetti; three wrong on one object reach the hand; 0 console errors.
- Not changed: P3's fridge backdrop (`bg_fridge.webp`) - its painted gloss stripe and bottom edge show the same
  mirrored-band kind of seam.

## One 74px cube on every screen (2026-10-06) — `app.js` `MDK.CUBE`, card `slides[].data.n`
- Reviews (in order): "define which will be the longest to shortest in order logically and then number of cubes as per
  each particular asset"; "the cubes should look of the same size length and breadth and size in all game screen. image 4
  [T2] has the perfect size of cube"; "zoom in so that assets looks bigger and more visible to the child along with the
  cubes should also look bigger".
- `MDK.CUBE` 76 → **74** (T2's own size - its table fits 6 at 74) and every measuring slide asks for exactly it:
  MEASURE_ASK / COMPARE_MEASURED used to cap at 88, MATCH_ROWS at 76 (its padding / gap 16 / 14 → 12 / 10). Measured
  74px on T2, T3, G1-G3, G2b, G4, P1, P2, P3 and all four P4 objects.
- Counts are what fits at 74px. The tall screens (~400px high) hold 5: T3 door 5 (as before), G2 almirah 4 → 5 (options
  4/5/6), G3 fridge 4 → 5 (options 4/5/6). P2 bench 7 → 4, board 5 → 2, stool 3 → 1 (boxes 1 / 4 / 2); P3 window 5 → 3,
  TV 4 → 2, bottle 3 → 1 (boxes 3 / 2 / 1); P4 almirah 5 → 3 and chair 4 → 2, each space lower (`y` / `label` +72px) so
  it still stands on the floor. Unchanged: T2 table 6, G1 bed 8, G2b pillow 3, G4 mats 5 / 6, P1 chairs 3 / 4, P4 bench
  8, board 6. The P2 / P3 boxes say "1 ब्लॉक" (singular). T3's floor band under the door 24 → 4px.
- The trade-off (the screen's height): with one cube for all, a realistic order (door 9 > bed 8 > almirah 7 > fridge 6)
  only fits at 44px, which shrank the table, bed, pillow, mats and chairs. Tried the same day and dropped: 44px with
  realistic counts, 66px with door 6, a per-slide zoom, and per-screen sizes with realistic tall counts.
- Re-recorded: `vo_p6_ok` (almirah 5), `vo_p7_ok` (fridge 5). `vo_p4_done` (door 5) is the original clip.

## Measuring slides: flags, lines, ✓, Swifty (2026-09-30) — `app.js` MDK `flag` / `endLines` / `pose`, CSS `.md-flag` / `.md-line` / `.md-block.ok`
- **Flags** (every measuring slide): the pole never moves - a silver pole, a gold ball, a small stand on the floor, drawn
  in front of the blocks (it stands closer to us). Only the cloth moves, like cloth on a pole: the hem is fixed to the
  pole, a wave runs out along it growing toward the free end, the wind comes in slow gusts shared by both flags, a
  lull lets the free end sag, a folded cloth draws in. The checkered cloth is a 6x4 grid of quads recomputed every
  frame, so the checkers bend with it; the green one is one path with a gradient that follows the folds. One rAF
  loop for all flags, stopped when none is on screen; reduced motion = the cloth at rest. (The old flags were flat
  shapes whose whole flag, pole included, rocked ±6° forever.) One wind, one direction: every cloth flies to the right,
  on every slide (review 2026-10-01: "as per law of physics both flags will flow in the direction of the wind only -
  correct it everywhere"; T2, G1 and G2b used to mirror the start flag so it pointed away from the row). On those
  sideways rows (T2, G1, G2b) both flags stand just below the row instead (`MDK.FLAG_LOW`: the lines end a row's
  bottom + 46px, the gold ball at the row's lower edge), so the start flag's cloth flies under the first block, never
  over it; the layouts keep room for that. On the upright ones (T3, G2, G3) they stand at the lines' right ends, as before.
- **End lines**: thin blue (#2458C6) rounded dashes with a white halo, drawn in like a pen (top to bottom / left to
  right); while the VO points at one it glows (it used to swell to 1.7× in pink). A vertical line stops just above
  its flag's ball.
- **A correct block** gets a green outline on its own shape (#00B132, the kit's four-pass outline) - no ✓. Swiftee's
  demo blocks and the child's (`MDK.childMeasure`, every measuring slide) alike.
- **Swifty** stays on-model: the demo no longer swaps in the old kit's `mk_sw_guide` / `mk_sw_cheer` (a different
  drawing of her - round chick head, black eyes); she cheers with `gif/sw_lg_celebrating_anim.webp`, from its own
  `blob:` URL so it plays from frame 0 and never uses up the end screen's play. The feedback card's Swiftie is her own
  gifs too (it read the same two poses).

## Landing study-lamp light (2026-09-29) — CSS `.sg-lamp`
- The light comes only from INSIDE the shade: the bulb glow (`::before`) is clipped to the shade's lit opening, traced
  from the art, and the light on the wall (`::after`) starts below the shade — its top edge follows the shade's lower
  rim — and spreads down-left, the way the lamp points, fading out before its own edges. The old round glow also lit
  the shade's orange outside. The smooth flicker is brightness-only (a scale would push the light past the traced edges).

## Landing measure (2026-09-29) — `app.js` block `[landing measure]`, CSS `.sg-measure` / `.sgm-*`
- After the title animation, two pink dashed lines drop from the pencil's ends, then the cubes arrive one by one,
  flush, in one row just below the pencil (`assets/cubes_blue_row.webp` sliced per cube), then the play button pops.
- **Pace** (`STEP`, review 2026-09-30: "the cubes are getting placed very fast"): one cube every 400ms (was 140ms,
  when all 7 popped in within 0.84s — one sweep, not blocks placed one by one). The 7th lands ~3.3s after the lines
  start; each cube's pop, its shadow, the pencil's eyes and the play button's release follow the same `STEP`.
- **7 cubes** (was 10, then 8): the same cubes 1.43× bigger — the strip's first 7 cubes, scaled to span the pencil
  exactly (whole cubes only). With the layout shift below, their row ends ~21px above the play button.
- Layout: the title and the pencil group (pencil, cubes, lines) sit 28px higher than before (`style.css`
  `[landing layout]`: `.sg-content .sg-title{top:-38px}`, `#sgHero{top:-28px}`); the play button did not move.
- **Shadows on the table:** the cubes' bases stand on the tabletop (~27px in front of its back edge), so each casts a
  soft warm-brown contact shadow on it — darkest at the base, fading ~15px in front, shifted right with a longer
  right tail (window light from the left), behind the cubes and lines. Each shadow grows in as its cube lands; once
  the last one has landed the per-cube strips swap for one continuous shadow (no seams). CSS `.sgm-shadow*`.
- Both dashed lines end on a **complete dash**: their length is snapped to whole 19px dash periods (12px dash + 7px
  gap) minus the last gap, never shorter than 6px below the cubes.

## Landing Swifty (2026-09-29) — `assets/gif/new_landing_swiftee_anim.webp`
- The source clip (same as HI01) snaps between two different poses — waving hand and bag strap switch sides — at
  frames 1→2 (0.18s) and 29→30 (2.70s). Frames 0–1 are the clip's END pose (it was cut from a loop at the wrong
  point), so it opened with a flash of the other pose. Now it **starts at frame 2**, and the 29→30 snap has 3
  premultiplied cross-fade frames (60ms each): 37 frames, 3.24s, plays once, same final pose; WebP q90, 1.69 MB.
- **Blank frames:** measured with a frame-by-frame screen recording, Chrome painted nothing where Swifty is for 1–2
  frames in ~half the loads, right at a frame change of the big animated `<img>` (560×550, alpha) while the landing
  starts up — with the original file too (not caused by drop-shadow, will-change, the restart or the loader).
  `app.js` `[landing mascot player]` now decodes the file itself (WebCodecs `ImageDecoder`, next frame decoded
  ahead) and draws it on a canvas at the displayed size, swapped in when the loader lifts: 0 blanks in 6 runs (was
  3 in 6), same sharpness. Without `ImageDecoder` (e.g. iOS WebView), or on any error, the `<img>` path is unchanged.

## Landing title animation (2026-09-29) — `app.js` block `[landing title fx]`, CSS `[landing title fx]`
- **Start (2026-10-07, review: "the title animation will start from 'आज हम सीखेंगे लंबाई कैसे मापते हैं' and not from
  'नमस्ते दोस्तों'"):** `T_WORD = 4.69` - the spoken "आज" in the current 9.2s `vo_landing.ogg` (its pauses: नमस्ते दोस्तों
  0.29-1.40, मैं हूँ स्विफ्टी 2.45-3.66, आज हम सीखेंगे 4.69-5.85, किसी चीज़ की लंबाई कैसे मापते हैं 6.36-9.2). The 2026-10-05
  QA move to the greeting's start (0.3s) is undone. The intro (title, then cubes) now ends ~4s after the greeting; the
  play button pops once it is done (~13.3s in Chrome), and the start watchdog waits 18s (was 15s).
- **Cubes only after the title (2026-10-07, review: "the cubes will only come after the title animation is done -
  immediately after that"):** the cube row starts on "sg-title-fx-done" (measured: the same frame). Its watchdog no longer
  counts 16s from the loader lifting (a late tap got the cubes mid-title); it counts 16s from the greeting's start
  ("sg-greeting-start"), re-armed to 12s when the title animation starts ("sg-title-fx-start"), 40s before any greeting.
- **Start + speed (earlier):** it starts on the spoken **"आज"** (आज हम सीखेंगे), 3.13s into `vo_landing.ogg` (`T_WORD`), and
  runs on one clock `SLOW = 1.5`× slower than its (tightened) durations in `app.js` — so it ENDS when the faster
  version that started on "लंबाई" did (~7.5s instead of ~5.0s; the first screen is no longer). Measured: लंबाई stretches
  on "आज हम सीखेंगे", मापना's ruler starts at 5.75s, as the voice says "कैसे मापते हैं". The per-step numbers below
  are from an earlier revision; `app.js` is the reference.
- **The pencil stretches with लंबाई** (review 2026-09-29): its nib is pulled out left by ⅔ of the word's pull
  (`PEN_K`, ~45px) on the same spring — out, hold, snap back, the same bounces — with the eraser end fixed. The word's
  own stretch is unchanged (review: "don't increase the stretch length of लंबाई"): it still ends 5px past the nib's
  rest position, so at full stretch the pencil reaches further left than the word. Only the plain barrel (image x 260..920 of 1658) lengthens; nib, face,
  band and eraser keep their shape. It is drawn on a canvas (`.sg-pen-stretch`) over the transparent real `<img>`, so the
  layout, the nib maths and the cubes' measure only ever see the pencil at rest.
- **लंबाई**: stretches over ~1s — ई's right edge fixed, ल's
  left edge drawn to the pencil nib tip, one taut top line — holds 0.3s, then springs back (0.9 Hz) onto a hard stop
  (the letters touch at rest, so they never overlap) with 30% rebounds; at each impact the top line buckles into a
  damped wave and the letters' upper parts bend with it. The STRETCH is drawn from the font outlines too (not the
  text copies), so when ब and ा separate each half keeps its own round outline and shadow — the text copies split
  "बा" with a straight vertical clip that left hard vertical edges in the gap (review 2026-09-29). (While it curls the whole word, line included, is drawn from
  the font outlines with every point bent the same way, and the straight copy underneath is faded out). The first impact
  also gives the line a permanent set, like an over-stretched spring: it settles into a held wave (dip first — 3 dips,
  2 humps, height 4% of the word ≈ 6px) and STAYS wavy while मापना's ruler forms and the heading glides to the centre;
  it then straightens TOGETHER with मापना's reversal (same start, same end), and the real CSS heading comes back.
- **मापना** (starts once लंबाई has settled into its wave — one after the other): goes grey while its letters
  move apart (16px each), then its ruler top line forms one letter at a time — मा, प, ना, each letter uncovered in orange
  behind the line's tip — with a start mark plus one mark after each letter (4 in all): as heavy as the line, sticking
  out as little as possible (~4.5px incl. the rounded end), equally above and below, with the same white outline as the
  line. The heading then glides back to the centre (0.6s), the finished ruler shows for 0.6s, and both words reverse
  together (~0.8s): लंबाई's wave straightens while मापना's marks pull back into the line and its letters slide back
  together — the heading stays centred,
  and the two words also move a little closer to each other (word-spacing 28px → 14px, each word half the way). The
  plain heading returns with that closer gap (set inline on `#sgTitle`; the animation copies are then rebuilt).
  A replay of the greeting plays both words again; with reduced motion मापना stays as it is.
- Both words' top lines are the same thickness (the letters' own top line); a wider gap separates the two words.
- At rest the heading is the real text; the moving copies are the same text in the same style, so swaps are invisible.
  Word timings come from edge-tts word boundaries of the same line, mapped through the VO re-time.

## Pencil eyes (2026-09-30) — `app.js` block `[pencil eyes]`, CSS `.sg-pen-eyes`, `assets/pencil_face_rig.webp`
- The landing pencil watches what happens on screen. Its eyes are drawn live on a small canvas over its face (the
  face never moves during the pencil stretch). Per eye, clipped to the painted eyeball: white, an iris ~13% smaller
  than the painted one (so the look direction reads at 480px), a pupil that widens and narrows, two shines, and
  eyelids in the barrel's own purple with a lash line. The brows are cut from the art — `pencil_face_rig.webp` holds
  the barrel with the brows removed plus each brow (11 KB) — and lift and tilt. The face is painted a quarter turn
  round (its "up" is the eraser), so the upper lids close from the right and the lower lids rise from the left.
- **What it looks at** (`SGEyes.look(id, element | {x,y} | fn, priority, ms)`, highest priority wins): Swifty while she
  greets; लंबाई's end as it stretches and bounces; the tip of मापना's ruler as it forms; the left then the right dashed
  line; each cube as it lands; then the play button. With nothing going on it wanders between the child (straight
  out), Swifty and the play button. A finger or mouse on the landing is looked at for a moment.
- **How it moves:** like real eyes — a fast jump (50–170ms) to each new target, smooth following of moving things with
  catch-up jumps, tiny drifts while it rests, a blink every 2–5s (sometimes a double blink, often with a big jump).
- **Expressions** (`SGEyes.react`): surprise when लंबाई starts to stretch (eyes grow, pupils narrow, brows up); a
  squeeze-shut wince at the snap-back's hard stop; curious (one brow up) as मापना starts and when the play button
  appears; happy "^^" once the last cube lands.
- Reduced motion: the eyes look at the child and only blink. Any error removes the canvas, leaving the painted eyes.
  Layout reads are cached (80–500ms) so the eyes never force a re-layout every frame.

## Phase-gate headline size (2026-09-30) — CSS `[07]` `.pg-title`
- "चलिए, शुरू करें!" / "चलिए, साथ में करें!" / "अब आपकी बारी!" are drawn as HI01H01_L02_S04 draws them: 96px, 271px from
  the top, 10px white stroke, centred on the screen. The earlier QA scaling (`min(96px, 7.4vw, 11vh)`) shrank it on
  ordinary laptop windows (77px at 1445×704). It now shrinks only where 96px cannot fit — narrower than the longest
  line (687px) plus 24px a side, or so short it would reach Swifty — and then moves up to stay 16px above her.
  Checked: 96px/271px at 1445×704, 1280×720 and 1920×1080; 96px at 1024×600 (raised to 188px); 50px on a phone
  sideways, 47.5px upright; always equally far from both sides.

## Next button (2026-09-30) — `assets/btn-next-{default,deactive}.svg`, CSS `[10]`
- Review: "remove the word आगे, keep only the arrow in the middle; the 1st screen's button style, but keep this button's
  structure - more width, not a circle". The same 170×62 pill (so no slide layout moves), drawn in the play button's
  construction (`btn-play-blob.svg`): a darker depth edge under a white rim, a shaded gold face with a light crescent
  along the top and a shade crescent along the bottom, two shine dots, and the symbol with a dark navy edge. The label
  is the arrow alone — the label's own Baloo 2 "→", 2.3× (~41×27px), centred. Deactive = the play button's grey
  "waiting" set. Shadows are the play button's navy-tinted ones. The button keeps "आगे" as its accessible name.
