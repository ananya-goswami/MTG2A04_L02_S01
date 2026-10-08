| counting aloud: each block the child lays on T2 / T3; G1 + G2 wrong #2: the laid blocks counted one by one || counting aloud: each block the child lays on T2 / T3; G1 + G2 wrong #2: the laid blocks counted one by one || counting aloud: each block the child lays on T2 / T3; G1 + G2 wrong #2: the laid blocks counted one by one || counting aloud: each block the child lays on T2 / T3; G1 + G2 wrong #2: the laid blocks counted one by one || counting aloud: each block the child lays on T2 / T3; G1 + G2 wrong #2: the laid blocks counted one by one || counting aloud: each block the child lays on T2 / T3; G1 + G2 wrong #2: the laid blocks counted one by one || counting aloud: each block the child lays on T2 / T3; G1 + G2 wrong #2: the laid blocks counted one by one |; G1 wrong #2: the laid blocks counted one by one; G1 wrong #2: the laid blocks counted one by one; G1 wrong #2: the laid blocks counted one by one; G1 wrong #2: the laid blocks counted one by one; G1 wrong #2: the laid blocks counted one by one; G1 wrong #2: the laid blocks counted one by one; G1 wrong #2: the laid blocks counted one by one; G1 wrong #2: the laid blocks counted one by one# VO_MANIFEST — MTG2A04_L02_S01


**Re-recorded / added 2026-10-05 (FLN QA checklist):** same voice (Swara +0% +0Hz), x1.028, 0.28s lead / 0.36s tail,
-18.5 LUFS, Opus 48 kHz mono 32 kbps. `vo_landing` (नमस्ते दोस्तों! मैं हूँ स्विफ्टी। आज हम सीखेंगे, किसी चीज़ की लंबाई कैसे
मापते हैं। - 9.2s), `vo_pt_tutorial` (चलिए, शुरू करते हैं!), `vo_pt_guided` (चलिए, साथ में करें!), `vo_pt_practice` (अब
आपकी बारी!), `vo_well_done` (बहुत बढ़िया, दोस्त! तुमने कमाल कर दिया!); new: `vo_hint_count` (G1-G3 hint: रखे हुए ब्लॉक्स को
एक-एक करके गिनिए। जितने ब्लॉक्स हैं, उतनी ही लंबाई है।), `vo_hint_compare` (G4 hint: दोनों के ब्लॉक्स गिनिए। जिसके ब्लॉक्स
ज़्यादा हैं, वही ज़्यादा लंबी है।), `vo_hint_tap` (3rd layer: देखिए, सही उत्तर यह है। इस पर टैप कीजिए।), `vo_hint_drag`
(3rd layer, laying blocks: हाथ को देखिए, और ब्लॉक को वहीं रखिए।). Deleted: `vo_hint_mcq3_2` (replaced by `vo_hint_count`).
The table below predates this pass for those clips.
**59 VO clips + 1 sfx on disk · all 60 wired into the lesson** (FLN QA checklist 01: no unused assets in the build). Rebuilt 2026-09-30 when the lesson was re-made slide by slide to the SME deck (review: "follow the ppt slides instructions"): every line the deck gives now has a slide that plays it, so the clips set aside earlier (T3's heading / explain / child lines, the bed / almirah / pillow / fridge questions, the pillow page, the classroom game's intro and "choose the space" line) are back, from the same renders; the lines only the old slides needed are deleted (below). The wrong-answer help follows the FLN hint logic sheet (review: "for the hint part follow the excel sheet, not the slides"): its 8 lines were rendered in the same voice with the same re-time (a re-render of `vo_try_again` came out within 0.02s and 0.1 LU of the shipped clip), and the deck's own hint lines it replaced are deleted.

**Re-recorded 2026-10-06 (one 74px cube - see README):** `vo_p6_ok` (almirah 5), `vo_p7_ok` (fridge 5) - edge-tts Swara +0% +0Hz, interior pauses pulled in to ~0.37s, x1.028 (atempo), 0.28s lead / 0.36s tail, -18.5 LUFS, Opus 48 kHz mono 32 kbps. `vo_p4_done` (door 5), `vo_p3_done`, `vo_p5_ok`, `vo_p6b_ok` are the original clips.

**Re-recorded 2026-10-01:** `vo_p4_done` (the door is now 5 blocks), `vo_p6_ok` (the almirah 4), `vo_p7_ok` (the fridge 3; re-recorded again for 4 - review 2026-10-01 "increase the size of refrigerator") - their counts changed with the one cube size - from the card's own texts, in the same voice through the same pipeline (edge-tts Swara +0% +0Hz -> the HI01 re-time at x1.028 -> Opus 48 kHz mono 32 kbps, -18.5 LUFS). T3's `count_at` (the badge pops on the count word) is 2.12s in the new `vo_p4_done`: edge-tts's word timing mapped through the re-time, checked against T2's `vo_p3_done` (this method: 1.96s, its measured 1.92s).

Script source: `MTG2A04_L02_S01_review.pptx`, **slides 3 → 17** (Pages 1 → 14), followed verbatim except where noted as DERIVED.

Voice: `hi-IN-SwaraNeural` (edge-tts) at pitch `+0Hz`, rate `+0%` — Swara's natural register. The HI01H01_L02_S04 reference voice (F0 ~199 Hz) is NOT an edge-tts voice; pitch-shifting Swara down to that register also drags her formants down (Azure prosody pitch is not formant-preserving) and the result reads as male, so the natural voice is used instead. See VOICE_AB/ for samples. Encoded Ogg/Opus mono 48 kHz ~32 kbps at −17.5 LUFS, identical to the reference clips.



**Pacing matched to HI01H01_L02_S04 (2026-09-28):** every wired clip was re-timed from the original render — pauses inside a line pulled in to HI01's range (a 1.1-1.8s sentence gap is now ~0.36-0.46s; short pauses untouched), speaking rate matched with a pitch-preserving ×1.028, HI01's edge silence (0.28s lead / 0.36s tail), loudness −18.5 LUFS, same Opus 48 kHz mono ~32 kbps encode. Medians now equal HI01's: longest pause 0.35s (HI01 0.36), 9.9 chars/s (HI01 9.9). The voice itself is unchanged.

## Wired

| file | dur | Hindi text | used at | from |
|---|--:|---|---|---|
| `sfx_celebrate` | 1.5s | *(sound effect - no speech)* | CEL: celebration sting (playSfx) | FLN animation toolkit `assets/sfx_celebrate.ogg` |
| `vo_demo_start` | 2.2s | चलिए, शुरू करते हैं। | T2 VO2 demonstrate; T3 VO2 demonstrate | PPT slides 5+6 (Pages 3+4) VO2 Demonstrate |
| `vo_hint_mcq3_2` | 4.0s | चित्र को ध्यान से देखिए और सही उत्तर पहचानिए। | G1 hint; G2 hint; G2b hint; G3 hint | FLN hint logic sheet, MCQ - 3 options, attempt 2 (its चित्र/शब्द: चित्र) |
| `vo_landing` | 7.5s | नमस्ते दोस्त! मैं हूँ स्विफ्टी। आज हम सीखेंगे - किसी चीज की लंबाई कैसे मापते हैं। | engine: landing greeting | PPT slide 3 (Page 1) |
| `vo_match_instr` | 3.1s | हर चीज़ को उसके सही माप से मिलाइए। | P2 prompt; P3 prompt | PPT slides 13+14 (Pages 10+11) Instruction OST/VO |
| `vo_match_ok` | 4.9s | शाबाश! आपने सभी चीज़ों को उनके सही माप से मिला दिया। | P2 correct; P3 correct | PPT slides 13+14 (Pages 10+11) all-matched VO |
| `vo_num_1` | 1.0s | एक | counting aloud: each block the child lays on T2 / T3; G1 / G2 / G2b / G3 wrong #2: the laid blocks counted one by one; G4 / P1 wrong #1: both objects' blocks counted, digits below / beside | engine count-aloud |
| `vo_num_2` | 1.1s | दो | counting aloud: each block the child lays on T2 / T3; G1 / G2 / G2b / G3 wrong #2: the laid blocks counted one by one; G4 / P1 wrong #1: both objects' blocks counted, digits below / beside | engine count-aloud |
| `vo_num_3` | 1.1s | तीन | counting aloud: each block the child lays on T2 / T3; G1 / G2 / G2b / G3 wrong #2: the laid blocks counted one by one; G4 / P1 wrong #1: both objects' blocks counted, digits below / beside | engine count-aloud |
| `vo_num_4` | 1.0s | चार | counting aloud: each block the child lays on T2 / T3; G1 / G2 / G3 wrong #2: the laid blocks counted one by one; G4 / P1 wrong #1: both objects' blocks counted, digits below / beside | engine count-aloud |
| `vo_num_5` | 1.0s | पाँच | counting aloud: each block the child lays on T2 / T3; G1 / G2 / G3 wrong #2: the laid blocks counted one by one; G4 / P1 wrong #1: both objects' blocks counted, digits below / beside | engine count-aloud |
| `vo_num_6` | 0.9s | छह | counting aloud: each block the child lays on T2 / T3; G1 / G2 / G3 wrong #2: the laid blocks counted one by one; G4 wrong #1: both mats' blocks counted, digits below | engine count-aloud |
| `vo_num_7` | 1.1s | सात | counting aloud: each block the child lays on T2 / T3; G1 / G2 wrong #2: the laid blocks counted one by one; G4 wrong #1: both mats' blocks counted, digits below | engine count-aloud |
| `vo_num_8` | 1.1s | आठ | counting aloud: each block the child lays on T2 / T3; G1 wrong #2: the laid blocks counted one by one | engine count-aloud |
| `vo_num_9` | 1.1s | नौ | counting aloud: each block the child lays on T2 / T3 | engine count-aloud |
| `vo_p13_intro` | 8.3s | आज हमें कक्षा सजानी है! हर चीज़ अपनी सही जगह पर ही फिट होगी। ब्लॉक से मापिए और सही जगह चुनिए। | P4 intro | PPT slide 16 (Page 13) Intro VO |
| `vo_p13_measure` | 2.3s | बेंच को ब्लॉक से मापिए। | P4 measure, when the bench is the first object picked | PPT slide 16 (Page 13) VO (the selected object) |
| `vo_p13_place` | 2.7s | अब बेंच के लिए सही जगह चुनिए। | P4 choose the space, when the bench is the first object | PPT slide 16 (Page 13) "Swiftee then says" |
| `vo_p13_measure_almirah` | 2.9s | छोटी अलमारी को ब्लॉक से मापिए। | P4 measure, when the small almirah is the first object picked | DERIVED 2026-10-08 from the deck's bench line (user: "record all four") - rendered by the MTG2A01 tools/build_vo.py pipeline (Swara +0% +0Hz, x1.028, 0.28s lead / 0.36s tail, Opus 32k), target -17.9 so it lands at the lesson's -18.5 (the bench line re-rendered as a control matched its clip: 2.34s, -18.6) |
| `vo_p13_measure_board` | 2.6s | ब्लैकबोर्ड को ब्लॉक से मापिए। | P4 measure, when the blackboard is the first object picked | DERIVED 2026-10-08 from the deck's bench line (user: "record all four") - rendered by the MTG2A01 tools/build_vo.py pipeline (Swara +0% +0Hz, x1.028, 0.28s lead / 0.36s tail, Opus 32k), target -17.9 so it lands at the lesson's -18.5 (the bench line re-rendered as a control matched its clip: 2.34s, -18.6) |
| `vo_p13_measure_chair` | 2.3s | कुर्सी को ब्लॉक से मापिए। | P4 measure, when the chair is the first object picked | DERIVED 2026-10-08 from the deck's bench line (user: "record all four") - rendered by the MTG2A01 tools/build_vo.py pipeline (Swara +0% +0Hz, x1.028, 0.28s lead / 0.36s tail, Opus 32k), target -17.9 so it lands at the lesson's -18.5 (the bench line re-rendered as a control matched its clip: 2.34s, -18.6) |
| `vo_p13_place_almirah` | 3.4s | अब छोटी अलमारी के लिए सही जगह चुनिए। | P4 choose the space, when the small almirah is the first object picked | DERIVED 2026-10-08 from the deck's bench line (user: "record all four") - rendered by the MTG2A01 tools/build_vo.py pipeline (Swara +0% +0Hz, x1.028, 0.28s lead / 0.36s tail, Opus 32k), target -17.9 so it lands at the lesson's -18.5 (the bench line re-rendered as a control matched its clip: 2.34s, -18.6) |
| `vo_p13_place_board` | 3.0s | अब ब्लैकबोर्ड के लिए सही जगह चुनिए। | P4 choose the space, when the blackboard is the first object picked | DERIVED 2026-10-08 from the deck's bench line (user: "record all four") - rendered by the MTG2A01 tools/build_vo.py pipeline (Swara +0% +0Hz, x1.028, 0.28s lead / 0.36s tail, Opus 32k), target -17.9 so it lands at the lesson's -18.5 (the bench line re-rendered as a control matched its clip: 2.34s, -18.6) |
| `vo_p13_place_chair` | 2.8s | अब कुर्सी के लिए सही जगह चुनिए। | P4 choose the space, when the chair is the first object picked | DERIVED 2026-10-08 from the deck's bench line (user: "record all four") - rendered by the MTG2A01 tools/build_vo.py pipeline (Swara +0% +0Hz, x1.028, 0.28s lead / 0.36s tail, Opus 32k), target -17.9 so it lands at the lesson's -18.5 (the bench line re-rendered as a control matched its clip: 2.34s, -18.6) |
| `vo_p2_ask` | 4.6s | इनमें से कौन-सी टेबल ज्यादा लंबी है? उस पर टैप करिए। | T1 prompt | PPT slide 4 (Page 2) VO |
| `vo_p2_fb` | 2.4s | यह टेबल ज्यादा लंबी है। | T1 every wrong tap (the long table pulses + the hand) + reveal | PPT slide 4 (Page 2) incorrect-feedback VO |
| `vo_p3_child` | 4.8s | अब आगे आप मापिए और बताइए, टेबल कितने ब्लॉक लंबी है। | T2 child-action VO | PPT slide 5 (Page 3) child-action VO |
| `vo_p3_done` | 3.7s | शाबाश! यह टेबल 6 ब्लॉक्स लंबी है। | T2 completion | PPT slide 5 (Page 3) completion VO |
| `vo_p3_explain_a` | 4.1s | इसके लिए हम टेबल के एक छोर से मापना शुरू करेंगे। | T2 VO1 explain, part 1 | PPT slide 5 (Page 3) VO1 Explain - split at its sentence pause |
| `vo_p3_explain_b` | 3.8s | फिर एक-एक ब्लॉक रखते हुए दूसरे छोर तक जाएंगे। | T2 VO1 explain, part 2 | PPT slide 5 (Page 3) VO1 Explain - split at its sentence pause |
| `vo_p3_head` | 5.4s | यह टेबल कितनी लंबी है? चलिए, इसे ब्लॉक से मापकर देखते हैं। | T2 prompt | PPT slide 5 (Page 3) Heading VO |
| `vo_p4_child` | 5.1s | अब आगे आप मापिए और बताइए, दरवाजे की लंबाई कितनी है। | T3 child-action VO | PPT slide 6 (Page 4) child-action VO |
| `vo_p4_done` | 4.0s | शाबाश! यह दरवाजा 5 ब्लॉक्स लंबा है। | T3 completion | PPT slide 6 (Page 4) completion VO |
| `vo_p4_explain_a` | 4.6s | इसके लिए हम दरवाजे के निचले छोर से मापना शुरू करेंगे | T3 VO1 explain, part 1 | PPT slide 6 (Page 4) VO1 Explain - split at its pause (4.31s) |
| `vo_p4_explain_b` | 1.9s | और ऊपर तक जाएंगे। | T3 VO1 explain, part 2 | PPT slide 6 (Page 4) VO1 Explain - split at its pause (4.31s) |
| `vo_p4_head` | 7.2s | क्या आप बता सकते हैं, यह दरवाजा कितना लंबा है? चलिए, इसे ब्लॉक से मापकर देखते हैं। | T3 prompt | PPT slide 6 (Page 4) Heading VO |
| `vo_p5_ask` | 3.3s | अब बताइए, पलंग की लंबाई कितनी है? | G1 question (after the measuring) | PPT slide 7 (Page 5) post-measure VO |
| `vo_p5_instr` | 2.7s | पलंग की लंबाई ब्लॉक से मापिए। | G1 prompt | PPT slide 7 (Page 5) Instruction OST/VO |
| `vo_p5_ok` | 3.7s | शाबाश! पलंग की लंबाई 8 ब्लॉक्स है। | G1 correct | PPT slide 7 (Page 5) correct VO |
| `vo_p6_ask` | 3.5s | अब बताइए, अलमारी की लंबाई कितनी है? | G2 question (after the measuring) | PPT slide 8 (Page 6) post-measure VO |
| `vo_p6_instr` | 2.9s | अलमारी की लंबाई ब्लॉक से मापिए। | G2 prompt | PPT slide 8 (Page 6) Instruction OST/VO |
| `vo_p6_ok` | 3.8s | शाबाश! अलमारी की लंबाई 7 ब्लॉक्स है। | G2 correct | PPT slide 8 (Page 6) correct VO - the deck's 7 again (review 2026-10-08 "follow the recommendations exactly"): the 2026-09-28 render, restored from git 7c1f24e; the 5-block re-record of 2026-10-06 is in git 7cf2ccc |
| `vo_p6b_ask` | 3.3s | अब बताइए, तकिये की लंबाई कितनी है? | G2b question (after the measuring) | PPT slide 9 (Page 6, the pillow) post-measure VO |
| `vo_p6b_instr` | 2.7s | तकिये की लंबाई ब्लॉक से मापिए। | G2b prompt | PPT slide 9 (Page 6, the pillow) Instruction OST/VO |
| `vo_p6b_ok` | 3.6s | शाबाश! तकिये की लंबाई 3 ब्लॉक्स है। | G2b correct | PPT slide 9 (Page 6, the pillow) correct VO |
| `vo_p7_ask` | 3.3s | अब बताइए, फ्रिज की लंबाई कितनी है? | G3 question (after the measuring) | PPT slide 10 (Page 7) post-measure VO |
| `vo_p7_instr` | 2.7s | फ्रिज की लंबाई ब्लॉक से मापिए। | G3 prompt | PPT slide 10 (Page 7) Instruction OST/VO |
| `vo_p7_ok` | 3.6s | शाबाश! फ्रिज की लंबाई 6 ब्लॉक्स है। | G3 correct | PPT slide 10 (Page 7) correct VO - the deck's 6 again (review 2026-10-08 "same for this game screen also"): the 2026-09-28 render, restored from git 7c1f24e; the 5-block re-record of 2026-10-06 is in git 7cf2ccc |
| `vo_p8_ask` | 4.0s | कौन-सी चटाई ज़्यादा लंबी है? उस पर टैप करिए। | G4 prompt | PPT slide 11 (Page 8) VO |
| `vo_p8_ok` | 3.4s | शाबाश! यह चटाई ज़्यादा लंबी है। | G4 correct | PPT slide 11 (Page 8) correct VO |
| `vo_p8_reask` | 3.5s | अब बताइए, कौन-सी चटाई ज़्यादा लंबी है? | G4 wrong #1, after both mats are counted | PPT slide 11 (Page 8) wrong-attempt-1 re-ask VO - the 2026-09-28 render, restored 2026-10-08 from git 7c1f24e |
| `vo_p9_ask` | 4.0s | कौन-सी कुर्सी ज़्यादा लंबी है? उस पर टैप करिए। | P1 prompt | PPT slide 12 (Page 9) VO |
| `vo_p9_ok` | 3.4s | शाबाश! यह कुर्सी ज़्यादा लंबी है। | P1 correct | PPT slide 12 (Page 9) correct VO |
| `vo_p9_reask` | 3.5s | अब बताइए, कौन-सी कुर्सी ज़्यादा ऊँची है? | P1 wrong #1, after both chairs are counted | PPT slide 12 (Page 9) wrong-attempt-1 re-ask VO (the deck's own "ऊँची") - the 2026-09-28 render, restored 2026-10-08 from git 7c1f24e |
| `vo_pt_guided` | 5.7s | बहुत बढ़िया! अब हम साथ मिलकर शुरू करते हैं। चलिए, साथ में करें! | engine: guided phase gate | ENGINE FURNITURE - phase gate, not in the PPT |
| `vo_pt_practice` | 2.3s | वाह! अब आपकी बारी। | engine: practice phase gate | ENGINE FURNITURE - phase gate, not in the PPT |
| `vo_pt_tutorial` | 5.0s | ध्यान से देखिए और मेरे साथ जानिए। चलिए, शुरू करें! | engine: tutorial phase gate | ENGINE FURNITURE - phase gate, not in the PPT |
| `vo_rule_a` | 6.0s | अब ध्यान रखें! हर अगला ब्लॉक वहीं से शुरू करें, जहाँ पिछला खत्म हुआ था। | T2 VO3 rule, part 1; T3 VO3 rule, part 1 | PPT slides 5+6 (Pages 3+4) VO3 Rule - split at its pauses |
| `vo_rule_b` | 2.2s | बीच में जगह न छोड़ें, | T2 VO3 rule, part 2 (the gap); T3 VO3 rule, part 2 (the gap) | PPT slides 5+6 (Pages 3+4) VO3 Rule - split at its pauses |
| `vo_rule_c` | 2.7s | और एक-दूसरे के ऊपर न रखें। | T2 VO3 rule, part 3 (the overlap); T3 VO3 rule, part 3 (the overlap) | PPT slides 5+6 (Pages 3+4) VO3 Rule - split at its pauses |
| `vo_try_again` | 2.6s | ब्लॉक्स को एक बार फिर गिनिए। | G1 / G2 / G2b / G3 wrong #1 (+ the laid blocks glow) | PPT slide 7 (Page 5) wrong-answer attempt 1 VO - the 2026-09-28 render (same voice, re-time and encode), restored 2026-10-08 from git 7c1f24e |
| `vo_well_done` | 4.2s | शाबाश! आपने ब्लॉक्स से लंबाई मापना सीख लिया! | CEL prompt | PPT slide 17 (Page 14) VO |

## Deleted - no slide uses them

Re-render from the text below if one is ever needed again (same voice, same re-time and encode).

| file | Hindi text | why |
|---|---|---|
| `vo_p12_ask` | अब बताइए, यह कितने ब्लॉक्स लंबा है? | DERIVED for the old P4 (a count-the-blocks question). The deck's Page 12 is the classroom game, built as P4 (2026-09-30) |
| `vo_p12_ok` | शाबाश! यह 7 ब्लॉक्स लंबा है। | DERIVED for the old P4 - as above |
| `vo_p13_ok` | शाबाश! बेंच की लंबाई 6 ब्लॉक्स है। | DERIVED for the old P5. The deck's Page 13 has no line after the measuring but "अब बेंच के लिए सही जगह चुनिए।" (`vo_p13_place`) |
| `vo_total_1` ... `vo_total_9` | कुल एक ब्लॉक / कुल दो ब्लॉक्स ... कुल नौ ब्लॉक्स | engine count-aloud totals; no slide of the rebuilt lesson counts a set to a total |
| `vo_t2_prompt`, `vo_t3_prompt` | (the heading + explain + rule + demonstrate lines of Pages 3 / 4 in one clip) | composed prompts, replaced by the separate lines above so each animation step has its own |
| `vo_p3_explain`, `vo_p4_explain`, `vo_rule` | (whole lines) | replaced by their `_a` / `_b` (/ `_c`) parts, cut at the sentence pauses |
| `vo_hint_mcq3_1` | फिर से सोचिए और विकल्पों को ध्यान से देखिए। | the sheet's MCQ - 3 options attempt 1 on G1-G3; removed 2026-10-08 - G1, G2, G2b, G3 follow the deck's own wrong-answer lines (`vo_try_again`, the count, the hand) |
| `vo_hint_count` | रखे हुए ब्लॉक्स को एक-एक करके गिनिए। जितने ब्लॉक्स हैं, उतनी ही लंबाई है। | the G1-G3 strong hint (2026-10-05); removed 2026-10-08 - as above |
| `vo_hint_drag` | हाथ को देखिए, और ब्लॉक को वहीं रखिए। | the 3rd layer when laying blocks on G1-G3 (2026-10-05); removed 2026-10-08 - the deck: a wrong drop only goes back |
| `vo_ok_mcq2` | शाबाश! आपने सही चुना। | T1's praise on the right table; removed 2026-10-08 - the deck's page 2 "Correct Response: SFX" |
| `vo_hint_mcq2_1` | दोनों विकल्पों को ध्यान से देखिए और सोचिए। | the sheet's MCQ - 2 options attempt 1 (T1, G4, P1); removed 2026-10-08 - all three follow their deck pages |
| `vo_hint_mcq2_2` | ध्यान से देखिए और सही विकल्प चुनिए। | the sheet's MCQ - 2 options attempt 2 (T1, G4, P1); removed 2026-10-08 - as above |
| `vo_hint_dd_1` | फिर से सोचिए। ध्यान से देखिए और सही जगह चुनिए। | the sheet's Drag & Drop attempt 1 (G1-G3, P2, P4); removed 2026-10-08 - every slide follows its deck page |
| `vo_hint_dd_2` | ब्लॉक्स को ध्यान से गिनिए और सही जगह पर रखिए। | the sheet's Drag & Drop attempt 2 (P2-P4); removed 2026-10-08 - as above |
| `vo_ok_dd` | शाबाश! सही जगह पर रखा। | the sheet's Drag & Drop praise (P2-P4); removed 2026-10-08 - P4's deck: a right fit gets the SFX only |
| `vo_hint_compare` | दोनों के ब्लॉक्स गिनिए। जिसके ब्लॉक्स ज़्यादा हैं, वही ज़्यादा लंबी है। | the G4 strong hint (2026-10-05); removed 2026-10-08 - G4 follows the deck's page 8 (the count, then the re-ask) |
| `vo_hint_tap` | देखिए, सही उत्तर यह है। इस पर टैप कीजिए। | the 3rd layer on G1-G4 (2026-10-05); removed 2026-10-08 - the deck's hand nudge has no VO |
