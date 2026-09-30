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
- Adapted, as the sheet allows per file: its Drag & Drop lines are written for reading games ("शब्द को ध्यान से
  सुनिए", "शब्द की आवाज़ पहचानिए"), so here "ध्यान से देखिए" and "ब्लॉक्स को ध्यान से गिनिए" take their place. The sheet
  stops at attempt 2 (or 3); after that the answer is shown so no child gets stuck, and it does not score as correct.
- Kept from the decks, since the sheet has no row for it: the idle ghost drag (6s) while laying blocks, and the hand
  on the classroom tray after 8s.
- Code: `MDK.shake` (the kit's lateral buzz, recipes 11/20), `MDK.softGlow` (the kit's hint glow, recipe 12: a green ring
  for cards and areas, a green glow that follows a picture's shape), the ladder in `MDK.childMeasure` (`cfg.hints`);
  the sheet's 8 lines are `vo_hint_mcq2_1/_2`, `vo_hint_mcq3_1/_2`, `vo_hint_dd_1/_2`, `vo_ok_mcq2`, `vo_ok_dd`, recorded
  in the lesson's voice and re-timed like every other clip (see `VO_MANIFEST.md`).

### The slides
- **T1 — page 2, `PICK_EXTREME`.** The long and the short table (`obj_table_long.webp` 450px - the orange top on red
  legs / `obj_table_short.webp` 308px - the yellow top on brown legs; supplied art 2026-09-30, cropped tight, its
  faint stray pixels cleared so the outline stays clean) stand on the card's calm floor (CSS `[T1 tables]`: light wood under the grid-paper
  wall, a skirting line, soft shadows), a little right of centre so Swifty's corner stays free. Tap the longer one.
  Right = SFX + confetti + "शाबाश! आपने सही चुना।" + a clean green outline that follows the table's own shape (FLN
  animation kit recipe 21, engine A, `ol ol-alpha`: four zero-blur passes + a soft glow) with the kit's small pop, then
  on. Wrong = the sheet's MCQ – 2 ladder; never a red box or a red glow on a table (review 2026-09-30). When the answer
  is shown, the hand taps the long table's front leg (`options[].tap`, the point on the picture) with the kit's tap
  ripple and "यह टेबल ज्यादा लंबी है।" plays.
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
  mid-fall is put in its place first. The backdrop is the mock-up's outdoor scene (`data.bg: "yard"`,
  `#stage[data-bg]`; review: "this should have outdoor background scene, also the mango one I want"): CSS sky strip,
  sand wall, its darker plinth, sand ground - the wall meets the ground half-way up the charpai (`--horizon`, set by the
  slide) - and over them `bg_yard_top.webp`, cut out of the mock-up: its leafy canopy top-left, its mango tree top-right
  (trunk, leaves, two mangoes, the dappled shade of its leaves on the wall), two soft bricks. Where the mock-up's own
  header bar and Swifty hid the trees (ours sit a few px apart) they are mended: the canopy behind its Swifty mirrored
  from beside it, every tree's lower edge carried under the bar, the trunk behind the bar's end filled from the trunk
  round it. Nothing in it moves. The charpai and its row sit low on the ground, the row just above the answers' place.
  The OST / VO stay the deck's ("पलंग ..."; the mock-up writes खटिया).
- **G4 mats — page 8, P1 chairs — page 9, `COMPARE_MEASURED`.** Two objects side by side, already measured: blocks
  flush along each mat's long side (a row under it) / up beside each chair from the floor, no numbers. Tap the longer /
  taller one. Right — it lifts with a green glow, the other greys, SFX + confetti, "6 ब्लॉक्स" / "7 ब्लॉक्स" under the
  mats ("4" / "5" beside the chairs), the deck's correct VO. Wrong — the sheet's MCQ – 2 ladder. The chairs are in the
  deck's order, the 4-block chair first (`obj_chair_short.webp`, `obj_chair_tall.webp` — split from the deck's two-chair
  picture).
- **P2 — page 10, P3 — page 11, `MATCH_MEASURE`.** Left, three cards in the deck's yellow / blue / green, each object
  already measured with dashed lines at its two ends — P2: the bench (7, a row on top), the blackboard (5, on top), the
  stool (3, a column on its left); P3: the window (5), the water bottle (3), the TV (4, on top). Right, the boxes in
  the deck's shuffled order (3 / 7 / 5 and 5 / 4 / 3). Drag a box onto an object: right — it snaps into that card's
  slot, green with a ✓, SFX + confetti + "शाबाश! सही जगह पर रखा।"; wrong — the sheet's Drag & Drop ladder, counted per
  box (the hand points at the box's right slot; the boxes are spaced so the hand never covers the next one). All three
  — `vo_match_ok`, on. Art drawn for these pages in the tables' style: `obj_bench.svg`, `obj_blackboard.svg`,
  `obj_stool.svg`, `obj_window.svg`, `obj_bottle.svg`, `obj_tv.svg`.
- **P4 — pages 12-13, `CLASSROOM_FIT`** (replaces the old P4 and P5). The classroom (`scene_classroom.svg`: the wall
  with bunting and a clock, the window, the door, the tiled floor) with four empty spaces, each with a strip of faint
  blocks and its size: the blackboard's on the wall (6, लंबाई), the chair's beside the window (4, ऊँचाई), the small
  almirah's in the corner (5, ऊँचाई), the bench's on the floor between two markers (8, लंबाई). The tray below: बेंच,
  छोटी अलमारी, कुर्सी, ब्लैकबोर्ड. After the intro VO the child taps any object: it enlarges in the centre, the
  classroom fades out, its blocks (two spare) wait in the tray, and the child measures it — no idle ghost, no start
  pulse, no counting VO, no target outlines; a block not laid flush - the sheet's block ladder. The blocks stay on it;
  the classroom returns, its spaces pulse, and the measured object waits in the tray: dragged into the right space it
  snaps in and stays (SFX + confetti + "शाबाश! सही जगह पर रखा।"); into another - the sheet's Drag & Drop ladder, per
  object. The deck's VO names the bench, so "बेंच को ब्लॉक से मापिए।" / "अब बेंच के लिए सही जगह चुनिए।" play when the
  bench is the first object; the next objects' instructions play without VO (the header still names each one). After
  the fourth, on. Idle 8s on the tray: the hand points at it (flow only).
- **CEL — page 14.** No text: only the VO "शाबाश! आपने ब्लॉक्स से लंबाई मापना सीख लिया!", then the engine's आगे बढ़ें.

Signals (`signals_expected`): `slide_entered`, `slide_completed`, `pick_extreme_correct` (T1), `measure_unit_placed`
(every block laid), `cardinality_first_try` (G1-G3), `compare_correct` (G4, P1), `match_correct` (each P2/P3 pair),
`classroom_placed` (each P4 object) + `classroom_done`, `answer_wrong`, `answer_revealed`, `mastery_score`,
`lesson_completed`. Every answerable slide sends `question_started` / `question_answered` and scores first-try.

## Assets
- **Art — the objects:** `obj_table_long.webp` / `obj_table_short.webp` (T1), `obj_table_measure.webp` (T2),
  `obj_door.webp` (T3), `obj_charpai.webp`
  (G1), `obj_almirah.webp` (G2, P4), `obj_pillow.webp` (G2b), `obj_fridge.webp` (G3), `obj_mat_1.webp` /
  `obj_mat_2.webp` (G4), `obj_chair_short.webp` / `obj_chair_tall.webp` (P1; the tall one also in P4), `obj_bench.svg`,
  `obj_blackboard.svg` (P2, P4), `obj_stool.svg` (P2), `obj_window.svg`, `obj_bottle.svg`, `obj_tv.svg` (P3),
  `scene_classroom.svg` (P4). The `.webp` cut-outs are the deck's art, tight-cropped; the `.svg` art is drawn in the
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
  backgrounds, the same measuring proportions.
- **Known, harmless**: the shared engine's `BUILD_TO_NUMBER` / crane modules name `assets/obj_crane.png`; this lesson
  has no such slide, so nothing ever asks for it.
- **Open for the SME**: P2 / P3's object pictures are still the stand-ins (see "P2 / P3 as photos").

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
  `painting_answer_order.png` holds when each pixel is drawn (the letters' thinned skeleton walked in writing order). The
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
  - **P2 "board"** - the class notice board (`bg_corkboard.webp`: cork, a wooden frame, kids' drawings, a star chart,
    gold stars pinned at the edges). The three objects are white photos pinned on it (`prop_pushpin.webp`); the sizes are
    brown paper tags (a hole, a red string) - dropped on the right photo, a tag is pinned on and swings on the pin.
  - **P3 "fridge"** - the fridge door (`bg_fridge.webp`: cream enamel, a chrome handle, a kid's drawing, fruit magnets,
    Mummy's sticky pad and a crayon). The photos are held by fruit magnets (`prop_mango/strawberry/sunflower.webp`); the
    sizes are Mummy's sticky notes, pressed on. Once all three are matched, each photo shows what the size was for
    (`item.fit`): a curtain slides down over the window, a floral cover drops on the TV, a knitted sleeve slides up the
    bottle - then the all-matched VO.
  - Each photo's picture is a little scene of the object's own place (`item.scene` floor / wall / shelf / table,
    `item.wall`), its broad bottom margin the label's place. Right = a green outline on the photo and the label; wrong =
    the photo shakes, the label comes home; the 2nd time the right photo glows and the hand points (unchanged ladder).
- Stand-ins until the generated art arrives: the six objects are still `obj_*.svg`; the curtain / cover / sleeve are
  drawn in code. To swap: an object's `src` + its `ar` (h / w of the trimmed art); a generated fit picture as
  `item.fit.src` (+ `x y w h` as fractions of the object's box if the defaults don't sit right); the backdrops / pin /
  magnets by replacing the webp of the same name. Props: Fluent 3D emoji (MIT, see "Rooms").

## Rooms (2026-10-01) — `app.js` `[rooms]`, CSS `[rooms]`, `assets/bg_*.webp`, `assets/holder_*.webp`, `assets/prop_sock.webp`
- Review: "generate relatable backgrounds for these slides ... not too distracting, on the theme of the main elements,
  funny, relatable, eye pleasing ... all different backgrounds and different tokri than the red one" - only G2, G2b, G3,
  G4, P1. Per slide in the card: `data.bg` (the stage's backdrop, CSS `#stage[data-bg]`), `data.holder` (G2 `laundry`,
  G2b `catbed`, G3 `tokri` - MDK.holder, the toy box's two layers and proportions), G2b `data.horizon: "base"` (its wall
  meets the floor at the pillow's base, not half-way up it), G2 `data.gag` (a pair of socks caught in the almirah's doors).
- The rooms: G2 a bedroom (sage wall, honey planks, a window with rose curtains, a calendar, a school bag and a teddy);
  G2b the same at dusk (lavender wall, a soft rug, the moon in the window, the cat glaring at its own bed full of
  blocks); G3 a kitchen (a window with tulsi, a tiled counter with steel dabbas and a teapot, a mouse, a soft checker
  floor); G4 a sunny terrace seen from above like the mats (cement slabs, a kite, papads drying, a pigeon eyeing them);
  P1 a veranda (a grille window, a wainscot, a clock, a plant, a curious dog, a red-oxide floor). Each backdrop is one
  image drawn in stage px (SVG, rendered at 1.5x) with 60px spare above and below, anchored to the slide's own
  `--horizon` (MEASURE_ASK and now COMPARE_MEASURED set it), so the object stands on its floor; props only in measured
  empty zones (never behind an object, a block, a flag, a button or a count plate). The holders: a pastel plastic laundry
  basket, a round mustard plush cat bed with a paw, a round bamboo tokri with a carrot and a tomato - drawn as SVG.
- Credits: the props (backpack, teddy, calendar, moon, cat, anger sign, mouse, teapot, potted plant, kite, pigeon - the
  bird recoloured, dog - flipped, socks, carrot, tomato, clock) are Microsoft Fluent UI Emoji, 3D style
  (github.com/microsoft/fluentui-emoji), under the MIT License:

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
  7 → 4 (options 3/4/5), G3 fridge 6 → 3 (options 2/3/4), G4 mats 6/7 → 5/6, P1 chairs 4/5 → 3/4. Unchanged: T2 6,
  G1 8, G2b 3, P4.
- **Re-recorded 2026-10-01** (their numbers changed): `vo_p4_done` "…दरवाजा 5 ब्लॉक्स…", `vo_p6_ok` "…अलमारी … 4 ब्लॉक्स",
  `vo_p7_ok` "…फ्रिज … 3 ब्लॉक्स" - the card's texts, the same voice and pipeline (see `VO_MANIFEST.md`). T3's `count_at`
  is re-timed on the new `vo_p4_done`: 2.12s (was 2.16s on the old nine-block line).
- P2 / P3 (the matching screens): three measured objects + a COLUMN of number boxes could not hold 76px cubes at any
  sensible counts, so they take `data.strip` - the objects in one row across the whole width, the boxes in a row under
  them (a little tighter: box 64px, padding 12) - and fewer cubes: P2 bench 7 → 4, board 5 → 3, stool 3 → 2 (boxes 2 / 4
  / 3); P3 window 5 → 3, bottle 3 → 2, TV 4 (boxes 3 / 4 / 2). Their VO says no numbers - nothing to re-record.

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
- **Start + speed (latest):** it starts on the spoken **"आज"** (आज हम सीखेंगे), 3.13s into `vo_landing.ogg` (`T_WORD`), and
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
