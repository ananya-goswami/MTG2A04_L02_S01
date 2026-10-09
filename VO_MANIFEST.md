# VO manifest — MTG2A04_L02_S01 · लंबाई मापना (ब्लॉक से नापें!)

Every voiceover the game plays, in the order a child meets it: the exact line, its file in `assets/voiceover/`, when it
plays and where it comes from. Checked 2026-10-08:

- **Against the PPT** — `MTG2A04_L02_S01_review.pptx` (24 Sep 2026), slides 3–17 = pages 1–14. Of the 50 lines the deck
  writes, 43 match character for character, 2 differ only by a comma or full stop where the deck's sentence is cut into
  two clips, and 5 are the deck's line with a different block count: on 2026-10-08 every screen moved to one 53px cube
  ("the size of cube will remain as shown in image 1 throughout the game" + "do not reduce the sizes of any elements" +
  "if number of cubes changes thats fine"), so the objects keep their size and their counts changed: table 9, door 7,
  bed 12, pillow 5, fridge 7, mats 8 / 9, chairs 6 / 7, classroom 11 / 7 / 6 / 9 (the almirah stays 7);
  and on P3 the bottle 4 and the TV 6 ("zoom in the bottle and tv"; boxes 6 / 5 / 4).
- **Against the recordings** — all 51 sentence clips were transcribed (Whisper) and compared with their lines: each says what
  is written here, its number included. The 12 counting words (एक … बारह) are single words too short to transcribe reliably:
  एक … नौ are the original 28 Sep renders, दस / ग्यारह / बारह were rendered 2026-10-08 in the same voice and loudness.

**64 files: 63 voiceover clips + 1 sound effect.** Every file is used, and every line the game asks for has its file.

Source column — **PPT, exact**: the deck's line as written. **PPT, exact words (split point)**: the deck's sentence cut into two clips at its
own break. **PPT counting**: the deck's "एक… दो… तीन…" counting, one clip per number. **Not in the PPT**: the transition
cards between the phases. **Derived**: not written in the deck, follows its pattern (the classroom).

## Title screen — PPT page 1 (slide 3)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_landing` | नमस्ते दोस्त! मैं हूँ स्विफ्टी। आज हम सीखेंगे - किसी चीज की लंबाई कैसे मापते हैं। | As the loader lifts. If the browser blocks sound until a tap, the play button shows at once; its tap starts this line and the game then continues by itself | 7.5s | PPT, exact |

## Transition into the tutorial (after the play button)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_pt_tutorial` | चलिए, शुरू करते हैं! | The transition card; the pink headline is written on as it is said | 2.3s | Not in the PPT |

## T1 — which table is longer? — PPT page 2 (slide 4)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p2_ask` | इनमें से कौन-सी टेबल ज्यादा लंबी है? उस पर टैप करिए। | On entry | 4.6s | PPT, exact |
| `vo_p2_fb` | यह टेबल ज्यादा लंबी है। | Every wrong tap (the long table pulses, the hand taps it); also if the answer is shown after a 3rd wrong tap | 2.4s | PPT, exact |

Correct answer: **the sound effect only, no voiceover** (the deck: "Correct Response: SFX").

## T2 — measuring the table — PPT page 3 (slide 5)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p3_head` | यह टेबल कितनी लंबी है? चलिए, इसे ब्लॉक से मापकर देखते हैं। | On entry (the heading VO) | 5.4s | PPT, exact |
| `vo_p3_explain_a` | इसके लिए हम टेबल के एक छोर से मापना शुरू करेंगे। | VO1: the start line pulses | 4.1s | PPT, exact |
| `vo_p3_explain_b` | फिर एक-एक ब्लॉक रखते हुए दूसरे छोर तक जाएंगे। | VO1: the end line pulses | 3.8s | PPT, exact |
| `vo_demo_start` | चलिए, शुरू करते हैं। | VO2: before Swiftee drags blocks 1 and 2 | 2.2s | PPT, exact words (split point) — the deck's "चलिए, शुरू करते हैं—एक... दो...।" |
| `vo_num_1` `vo_num_2` | एक · दो | VO2: as Swiftee lays blocks 1 and 2 | ~1.0s each | PPT counting |
| `vo_rule_a` | अब ध्यान रखें! हर अगला ब्लॉक वहीं से शुरू करें, जहाँ पिछला खत्म हुआ था। | VO3: the end of the last block pulses | 6.0s | PPT, exact |
| `vo_rule_b` | बीच में जगह न छोड़ें, | VO3: a block is set down with a gap | 2.2s | PPT, exact words (split point) |
| `vo_rule_c` | और एक-दूसरे के ऊपर न रखें। | VO3: a block is set down overlapping | 2.7s | PPT, exact |
| `vo_p3_child` | अब आगे आप मापिए और बताइए, टेबल कितने ब्लॉक लंबी है। | The child-action VO: the child's turn starts | 4.8s | PPT, exact |
| `vo_num_3` `vo_num_4` `vo_num_5` `vo_num_6` `vo_num_7` `vo_num_8` `vo_num_9` | तीन · चार · पाँच · छह · सात · आठ · नौ | Each block the child lays, counted aloud (blocks 3–9) | ~1.0s each | PPT counting |
| `vo_p3_done` | शाबाश! यह टेबल 9 ब्लॉक्स लंबी है। | On completion; the "9 ब्लॉक्स" badge pops on the number | 4.1s | PPT line, count changed (one 53px cube - see below) — the PPT: "शाबाश! यह टेबल 6 ब्लॉक्स लंबी है।" |

A wrong drop (gap / overlap) bounces back and the ghost drag shows — no voiceover.

## T3 — measuring the door — PPT page 4 (slide 6)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p4_head` | क्या आप बता सकते हैं, यह दरवाजा कितना लंबा है? चलिए, इसे ब्लॉक से मापकर देखते हैं। | On entry (the heading VO) | 7.2s | PPT, exact |
| `vo_p4_explain_a` | इसके लिए हम दरवाजे के निचले छोर से मापना शुरू करेंगे | VO1: the start line pulses | 4.6s | PPT, exact |
| `vo_p4_explain_b` | और ऊपर तक जाएंगे। | VO1: the end line pulses | 1.9s | PPT, exact |
| `vo_demo_start` | चलिए, शुरू करते हैं। | VO2: before Swiftee drags blocks 1 and 2 | 2.2s | PPT, exact words (split point) — the deck's "चलिए, शुरू करते हैं—एक... दो...।" |
| `vo_num_1` `vo_num_2` | एक · दो | VO2: as Swiftee lays blocks 1 and 2 | ~1.0s each | PPT counting |
| `vo_rule_a` | अब ध्यान रखें! हर अगला ब्लॉक वहीं से शुरू करें, जहाँ पिछला खत्म हुआ था। | VO3: the end of the last block pulses | 6.0s | PPT, exact |
| `vo_rule_b` | बीच में जगह न छोड़ें, | VO3: a block is set down with a gap | 2.2s | PPT, exact words (split point) |
| `vo_rule_c` | और एक-दूसरे के ऊपर न रखें। | VO3: a block is set down overlapping | 2.7s | PPT, exact |
| `vo_p4_child` | अब आगे आप मापिए और बताइए, दरवाजे की लंबाई कितनी है। | The child-action VO: the child's turn starts | 5.1s | PPT, exact |
| `vo_num_3` `vo_num_4` `vo_num_5` `vo_num_6` `vo_num_7` | तीन · चार · पाँच · छह · सात | Each block the child lays, counted aloud (blocks 3–7) | ~1.0s each | PPT counting |
| `vo_p4_done` | शाबाश! यह दरवाजा 7 ब्लॉक्स लंबा है। | On completion; the "7 ब्लॉक्स" badge pops on the number | 4.4s | PPT line, count changed (one 53px cube - see below) — the PPT: "शाबाश! यह दरवाजा 9 ब्लॉक्स लंबा है।" |

A wrong drop (gap / overlap) bounces back and the ghost drag shows — no voiceover.

## Transition into the guided phase

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_pt_guided` | चलिए, साथ में करें! | The transition card | 2.3s | Not in the PPT |

## G1 — measure the bed (पलंग) — PPT page 5 (slide 7)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p5_instr` | पलंग की लंबाई ब्लॉक से मापिए। | On entry (the VO is the instruction OST) | 2.7s | PPT, exact |
| `vo_p5_ask` | अब बताइए, पलंग की लंबाई कितनी है? | After the last block is laid (the OST becomes the question) | 3.3s | PPT, exact |
| `vo_p5_ok` | शाबाश! पलंग की लंबाई 12 ब्लॉक्स है। | Correct answer (with the SFX and confetti) | 4.1s | PPT line, count changed (one 53px cube - see below) — the PPT: "शाबाश! पलंग की लंबाई 8 ब्लॉक्स है।" |
| `vo_try_again` | ब्लॉक्स को एक बार फिर गिनिए। | Wrong answer 1: the option wiggles, the laid blocks glow | 2.6s | PPT, exact |
| `vo_num_1` `vo_num_2` `vo_num_3` `vo_num_4` `vo_num_5` `vo_num_6` `vo_num_7` `vo_num_8` `vo_num_9` `vo_num_10` `vo_num_11` `vo_num_12` | एक … बारह | Wrong answer 2: each block lights up in turn as it is counted | ~1.0s each | PPT counting |

Wrong answer 3: counting digits below each block, then the hand on the right option — no voiceover. A block laid with a gap / overlap goes back — no voiceover.

## G2 — measure the almirah (अलमारी) — PPT page 6 (slide 8)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p6_instr` | अलमारी की लंबाई ब्लॉक से मापिए। | On entry (the VO is the instruction OST) | 2.9s | PPT, exact |
| `vo_p6_ask` | अब बताइए, अलमारी की लंबाई कितनी है? | After the last block is laid (the OST becomes the question) | 3.5s | PPT, exact |
| `vo_p6_ok` | शाबाश! अलमारी की लंबाई 7 ब्लॉक्स है। | Correct answer (with the SFX and confetti) | 3.8s | PPT, exact |
| `vo_try_again` | ब्लॉक्स को एक बार फिर गिनिए। | Wrong answer 1: the option wiggles, the laid blocks glow | 2.6s | PPT, exact |
| `vo_num_1` `vo_num_2` `vo_num_3` `vo_num_4` `vo_num_5` `vo_num_6` `vo_num_7` | एक … सात | Wrong answer 2: each block lights up in turn as it is counted | ~1.0s each | PPT counting |

Wrong answer 3: counting digits beside each block, then the hand on the right option — no voiceover. A block laid with a gap / overlap goes back — no voiceover.

## G2b — measure the pillow (तकिया) — PPT page 6 (slide 9)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p6b_instr` | तकिये की लंबाई ब्लॉक से मापिए। | On entry (the VO is the instruction OST) | 2.7s | PPT, exact |
| `vo_p6b_ask` | अब बताइए, तकिये की लंबाई कितनी है? | After the last block is laid (the OST becomes the question) | 3.3s | PPT, exact |
| `vo_p6b_ok` | शाबाश! तकिये की लंबाई 5 ब्लॉक्स है। | Correct answer (with the SFX and confetti) | 4.2s | PPT line, count changed (one 53px cube - see below) — the PPT: "शाबाश! तकिये की लंबाई 3 ब्लॉक्स है।" |
| `vo_try_again` | ब्लॉक्स को एक बार फिर गिनिए। | Wrong answer 1: the option wiggles, the laid blocks glow | 2.6s | PPT, exact |
| `vo_num_1` `vo_num_2` `vo_num_3` `vo_num_4` `vo_num_5` | एक … पाँच | Wrong answer 2: each block lights up in turn as it is counted | ~1.0s each | PPT counting |

Wrong answer 3: counting digits below each block, then the hand on the right option — no voiceover. A block laid with a gap / overlap goes back — no voiceover.

## G3 — measure the fridge (फ्रिज) — PPT page 7 (slide 10)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p7_instr` | फ्रिज की लंबाई ब्लॉक से मापिए। | On entry (the VO is the instruction OST) | 2.7s | PPT, exact |
| `vo_p7_ask` | अब बताइए, फ्रिज की लंबाई कितनी है? | After the last block is laid (the OST becomes the question) | 3.3s | PPT, exact |
| `vo_p7_ok` | शाबाश! फ्रिज की लंबाई 7 ब्लॉक्स है। | Correct answer (with the SFX and confetti) | 4.2s | PPT line, count changed (one 53px cube - see below) — the PPT: "शाबाश! फ्रिज की लंबाई 6 ब्लॉक्स है।" |
| `vo_try_again` | ब्लॉक्स को एक बार फिर गिनिए। | Wrong answer 1: the option wiggles, the laid blocks glow | 2.6s | PPT, exact |
| `vo_num_1` `vo_num_2` `vo_num_3` `vo_num_4` `vo_num_5` `vo_num_6` `vo_num_7` | एक … सात | Wrong answer 2: each block lights up in turn as it is counted | ~1.0s each | PPT counting |

Wrong answer 3: counting digits beside each block, then the hand on the right option — no voiceover. A block laid with a gap / overlap goes back — no voiceover.

## G4 — which mat is longer? — PPT page 8 (slide 11)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p8_ask` | कौन-सी चटाई ज़्यादा लंबी है? उस पर टैप करिए। | On entry | 4.0s | PPT, exact |
| `vo_p8_ok` | शाबाश! यह चटाई ज़्यादा लंबी है। | Correct on the first tap, or after the counting (after the hand nudge: the SFX only, as the deck says) | 3.4s | PPT, exact |
| `vo_num_1` `vo_num_2` `vo_num_3` `vo_num_4` `vo_num_5` `vo_num_6` `vo_num_7` `vo_num_8` `vo_num_9` | एक … आठ, then एक … नौ | Wrong 1: both mats' blocks counted one by one, digits below | ~1.0s each | PPT counting |
| `vo_p8_reask` | अब बताइए, कौन-सी चटाई ज़्यादा लंबी है? | Wrong 1: after the counting, only the question again | 3.5s | PPT, exact |

Wrong 2: the hand on the longer mat — no voiceover.

## Transition into practice

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_pt_practice` | अब आपकी बारी! | The transition card | 1.7s | Not in the PPT |

## P1 — which chair is taller? — PPT page 9 (slide 12)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p9_ask` | कौन-सी कुर्सी ज़्यादा लंबी है? उस पर टैप करिए। | On entry | 4.0s | PPT, exact |
| `vo_p9_ok` | शाबाश! यह कुर्सी ज़्यादा लंबी है। | Correct answer — also when the child taps the right chair after the hand nudge | 3.4s | PPT, exact |
| `vo_num_1` `vo_num_2` `vo_num_3` `vo_num_4` `vo_num_5` `vo_num_6` `vo_num_7` | एक … छह, then एक … सात | Wrong 1: both chairs' blocks counted one by one, digits beside | ~1.0s each | PPT counting |
| `vo_p9_reask` | अब बताइए, कौन-सी कुर्सी ज़्यादा ऊँची है? | Wrong 1: after the counting, only the question again (the deck says ऊँची here) | 3.5s | PPT, exact |

Wrong 2: the hand on the taller chair — no voiceover.

## P2 and P3 — match each object to its measure — PPT pages 10 and 11 (slides 13, 14)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_match_instr` | हर चीज़ को उसके सही माप से मिलाइए। | On entry (both screens) | 3.1s | PPT, exact |
| `vo_match_ok` | शाबाश! आपने सभी चीज़ों को उनके सही माप से मिला दिया। | When all three are matched (both screens) | 4.9s | PPT, exact |

A right pair: the connection locks + a positive SFX — no voiceover. Wrong 1: the line bounces back; wrong 2: that object's blocks light up with digits 1, 2, 3… (shown, not said); wrong 3: the hand on the right box — no voiceover.

## P4 — the classroom — PPT pages 12–13 (slides 15, 16)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p13_intro` | आज हमें कक्षा सजानी है! हर चीज़ अपनी सही जगह पर ही फिट होगी। ब्लॉक से मापिए और सही जगह चुनिए। | On entry | 8.3s | PPT, exact |
| `vo_p13_measure` | बेंच को ब्लॉक से मापिए। | First object picked is the bench: as it is measured | 2.3s | PPT, exact |
| `vo_p13_place` | अब बेंच के लिए सही जगह चुनिए। | First object picked is the bench: once it is measured | 2.7s | PPT, exact |
| `vo_p13_measure_almirah` | छोटी अलमारी को ब्लॉक से मापिए। | First object picked is the small almirah: as it is measured | 2.9s | Derived — the deck's bench line, for this object |
| `vo_p13_place_almirah` | अब छोटी अलमारी के लिए सही जगह चुनिए। | First object picked is the small almirah: once it is measured | 3.4s | Derived — the deck's bench line, for this object |
| `vo_p13_measure_chair` | कुर्सी को ब्लॉक से मापिए। | First object picked is the chair: as it is measured | 2.3s | Derived — the deck's bench line, for this object |
| `vo_p13_place_chair` | अब कुर्सी के लिए सही जगह चुनिए। | First object picked is the chair: once it is measured | 2.8s | Derived — the deck's bench line, for this object |
| `vo_p13_measure_board` | ब्लैकबोर्ड को ब्लॉक से मापिए। | First object picked is the blackboard: as it is measured | 2.6s | Derived — the deck's bench line, for this object |
| `vo_p13_place_board` | अब ब्लैकबोर्ड के लिए सही जगह चुनिए। | First object picked is the blackboard: once it is measured | 3.0s | Derived — the deck's bench line, for this object |

Blocks: bench 11, small almirah 7, chair 6, blackboard 9 (the PPT's example: 6 / 5 / 8 / 4 - the counts follow the 53px cube; the spaces in the room keep their size). The deck gives the bench as its example; the child may pick any object first, so each object has its pair of lines and only the first object picked speaks. After that the game runs without voiceover (the deck: "game continues without any VO"). A right fit: the correct SFX only; a wrong space: the object goes back to the tray — no voiceover, no hints.

## End screen — PPT page 14 (slide 17)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_well_done` | शाबाश! आपने ब्लॉक्स से लंबाई मापना सीख लिया! | On the end screen (no text on screen) | 4.2s | PPT, exact |
| `sfx_celebrate` | *(sound effect, no speech)* | The end screen's celebration | 1.5s | — |

## The counting clips

| Clip | Line | Length |
|---|---|---|
| `vo_num_1` | एक | 1.0s |
| `vo_num_2` | दो | 1.1s |
| `vo_num_3` | तीन | 1.1s |
| `vo_num_4` | चार | 1.0s |
| `vo_num_5` | पाँच | 1.0s |
| `vo_num_6` | छह | 0.9s |
| `vo_num_7` | सात | 1.1s |
| `vo_num_8` | आठ | 1.1s |
| `vo_num_9` | नौ | 1.1s |
| `vo_num_10` | दस | 1.2s |
| `vo_num_11` | ग्यारह | 1.2s |
| `vo_num_12` | बारह | 1.2s |

`vo_num_10` … `vo_num_12` (दस, ग्यारह, बारह) are for the bed's 12 blocks (G1, wrong answer 2).

## How the clips are made

Voice: `hi-IN-SwaraNeural` (edge-tts), rate +0%, pitch +0Hz. Finish: pauses inside a line pulled in to ~0.4s, sped up ×1.028
(pitch kept), 0.28s of silence before and 0.36s after, −18.5 LUFS, Ogg/Opus 48 kHz mono 32 kbps. To render a line in the same
voice and finish: `MTG2A01_L03_S02/tools/build_vo.py` (pointed at this folder; a target of −17.9 lands at −18.5 here). After any
clip is added, removed or re-encoded, run `node tools/gen_asset_sizes.js` or it is not preloaded.

## Clips removed (git has them)

FLN hint-sheet lines no screen uses since every screen follows its PPT page: `vo_hint_mcq2_1`, `vo_hint_mcq2_2`, `vo_hint_mcq3_1`,
`vo_hint_count`, `vo_hint_compare`, `vo_hint_tap`, `vo_hint_drag`, `vo_hint_dd_1`, `vo_hint_dd_2`, `vo_ok_dd`, `vo_ok_mcq2`.

