const CARD = JSON.parse(document.getElementById('cardData').textContent);
  const AUDIO_EXT = (CARD.assets && CARD.assets.audio_ext) || "mp3";  // .mp3 (maths) / .ogg (Hindi FLN)
  const IMG_EXT   = (CARD.assets && CARD.assets.img_ext)   || "png";  // .png (working) / .webp (delivered/FLN) — twin of AUDIO_EXT (fixes A3)
  const ENGINE_VERSION = "2026.07.16i-r4-unified";  // ENGINE STAMP — the receipt (verify_bundle.py) asserts a built game carries THIS exact string; a stale/divergent engine → hard FAIL, so the wrong engine can never silently ship. BUMP IN LOCKSTEP with engine_guard.py + swiftpal_build.py + unified_build.py + verify_bundle.py on EVERY engine change (r2: drag/pattern feedback standard + PHASE_TRANSITION; r3c: off-white toybox bg, dual-coded counting options numeral+hand, full-body landing mascot, true-corner square/rect; r3d: Swiftie mouth-stops-when-silent (still frame), Arabic display numerals 1/2/3, landing shows full 1..n hand row, volume-chip aligned in header pill); r4: additive number-sequence path modules MEET_SEQUENCE + SEQUENCE_COMPLETE + SEQUENCE_NEXT (MTKGA01_L02_S04 "completes a number sequence within 20") — purely additive, existing lessons untouched. r4-landing (16c): landing recomposed to match reference — small corner mascot (230px, was 300), content re-centered (dropped padding-left:300 right-shift hack), VO chip moved from top-right to the mascot's shoulder (left:150/bottom:34, 58px). CSS-only; supersedes the 16b right-shift overlap fix.; 16d: TRUNK MERGE — unified the two diverged engine lines at base 12d: the 15e mechanics trunk (CONSERVE_COUNT + COUNT_ACTION + COUNT_DRAG_MATCH + ORDER_BY_WEIGHT + PICK_SET_BY_NUMBER, per_row/dense count-set grouping, bigNumCell numeral-only test options, title_first landing order) + the 16c r4 design trunk (boot loader, peek phase-transition, concept-strip landing, DS header, flat CTAs, sunburst/star-burst celebration, recomposed corner-mascot landing). Nothing dropped from either line. 16e: landing count-hero hand sizing FIXED — the .sg-hero sizing selectors never matched (template uses .sg-art); hands rendered natural-size, overflowing the card (title pushed outside the box, numeral-1 hidden behind the mascot — user-visible on MTKGA01_L02_S01). Retargeted to .sg-art .sg-hand/.sg-hand-cell/.sg-hand-num (112px; image-hero landings untouched). CSS-only. 16f: INTRO strip fit-or-wrap — old sizing assumed 1220px + a -100px breakout and punched wide strips (10 numerals, 7+ letters) through the tut-frame borders; now sized to the frame (960) and wrapping into two balanced rows below the 110px touch floor. Fixes MTKGA01_L02_S01 s00 (user-caught live) AND the HIKGH04_P2 letter-row daylight item.
  try { window.SWIFTPAL_ENGINE = ENGINE_VERSION; } catch(e){}
const $ = id => document.getElementById(id);

/* ---------- 1. SCALE THE 1333x750 STAGE ---------- */
function fit(){
  const vw = (window.visualViewport ? window.visualViewport.width  : document.documentElement.clientWidth)  || window.innerWidth;
  const vh = (window.visualViewport ? window.visualViewport.height : document.documentElement.clientHeight) || window.innerHeight;
  // contain-fit, scaling UP to fill the screen (no 1× cap, no margin) so a 16:9
  // viewport is covered edge-to-edge. Any leftover bars on non-16:9 are blue, not white.
  const s = Math.min(vw/1333, vh/750);
  document.documentElement.style.setProperty("--scale", s);
}
window.addEventListener("resize", fit);
window.addEventListener("load", fit);
if(window.visualViewport) window.visualViewport.addEventListener("resize", fit);
fit();

/* ---------- 2. SIGNAL BUS + OFFLINE TELEMETRY ---------- */
/* TELEMETRY: offline self-capture. Every signal is buffered to localStorage so
   the run survives a reload / works with NO host app. A full results record can
   be pulled via GameBus.downloadResults() (or the ?dev=1 button on the end
   screen). If `endpoint` is set AND the device is online, the final record is
   also POSTed — left null so the lesson is fully offline by default. */
const TELEMETRY = {
  endpoint: null,   // e.g. "https://lrs.example.com/swiftpal" — null = offline only
  storageKey: "swiftpal:run:" + CARD.skill_code + "_" + (CARD.part_label || "P1")
};
/* ===== QA CHECKLIST [14]: xAPI VERB LAYER =================================
   The engine emits 36 GameBus signals but none of the seven required xAPI
   verbs. This layer maps the ones that already have a signal and fires the
   rest explicitly. context echoes context_id / journey_id / medium straight
   off the launch URL and always carries skill_code. */
const XAPI = window.XAPI = (function(){
  var q; try{ q = new URLSearchParams(location.search); }catch(e){ q = { get:function(){ return null; } }; }
  var startedAt = Date.now();
  var ctx = { skill_code: CARD.skill_code, lo_code: CARD.lo_code,
              context_id: q.get("context_id"), journey_id: q.get("journey_id"),
              medium: q.get("medium") || CARD.medium || "hi" };
  /* [QA 14] question_format per answerable slide type (HI01's enum). */
  var QUESTION_FORMAT = { MAKE_SET:"build", COUNT_HOW_MANY:"tap_count" };
  var log = [], fired = {};
  /* send(verb, object, result): builds the standard { verb, object, result, context } statement
     (HI01 shape) and hands it to the platform bridge - SwiftPAL.sendEvent -> Android / iOS / web.
     Falls back to a direct postMessage only if the bridge is absent (standalone dev).
     context echoes context_id / journey_id / medium off the launch URL, always carries skill_code,
     and on a slide-level verb adds question_id / question_index / template / question_format / phase. */
  function send(verb, object, result){
    var o = object || {}, sl = null;
    try{ if(o.slide_id) sl = CARD.slides.find(function(x){ return x.id === o.slide_id; }) || null; }catch(e){}
    var c = Object.assign({}, ctx, { session_ms: Date.now() - startedAt });
    if(sl){ Object.assign(c, { question_id: sl.id, question_index: CARD.slides.indexOf(sl), template: sl.type,
                               question_format: QUESTION_FORMAT[sl.type] || null, phase: sl.phase }); }
    var statement = { verb: verb, object: o, result: result || {}, context: c };
    log.push(Object.assign({ ts: Date.now() }, statement));
    try{
      if(window.SwiftPAL && typeof window.SwiftPAL.sendEvent === "function") window.SwiftPAL.sendEvent(statement);
      else window.parent && window.parent.postMessage({ type:"swiftpal:xapi", statement: statement }, "*");
    }catch(e){}
    try{ console.log("[xapi]", verb, statement); }catch(e){}
    devLog(verb, statement);
    return statement;
  }
  /* [QA 14] ?dev=1 on-screen verb log: every verb as it fires, with a running count per verb, so a
     misfired or duplicated verb is visible on screen during a QA pass (not only in the console). */
  var devBox = null, counts = {};
  function devLog(verb, st){
    if(!q.get || q.get("dev") === null) return;
    try{
      if(!devBox){
        devBox = document.createElement("div"); devBox.id = "xapiDevLog";
        devBox.style.cssText = "position:fixed;right:8px;top:8px;z-index:2147483000;max-height:46vh;width:300px;overflow:auto;" +
          "font:12px/1.35 ui-monospace,Consolas,monospace;background:rgba(10,20,40,.86);color:#E6F1FF;border-radius:8px;padding:6px 8px;pointer-events:none;";
        (document.body || document.documentElement).appendChild(devBox);
      }
      counts[verb] = (counts[verb] || 0) + 1;
      var r = st.result || {}, line = document.createElement("div");
      line.textContent = verb + " #" + counts[verb] + (st.context.question_id ? " · " + st.context.question_id : "") +
        (r.is_correct !== undefined ? " · correct=" + r.is_correct + " att=" + r.attempt + " score=" + r.score : "");
      devBox.appendChild(line); devBox.scrollTop = devBox.scrollHeight;
    }catch(e){}
  }
  return { ctx:ctx, log:log, send:send,
           once:function(v,o,r){ if(fired[v]) return null; fired[v]=1; return send(v,o,r); },
           hasFired:function(v){ return !!fired[v]; } };
})();
/* signal -> verb, for the three that already have a 1:1 signal */
const XAPI_MAP = { slide_entered:"screen_viewed", hint_shown:"hint_used", audio_replay:"audio_replayed" };
const XAPI_ANSWERABLE = ["COUNT_HOW_MANY","MAKE_SET","PICK_EXTREME"];   /* slide types that send question_started */

/* [QA 01] The game's internal bus is GameBus (window.GameBus). The global SwiftPAL name belongs to
   the platform bridge (swiftpal-bridge.js, loaded first), which XAPI.send() hands each statement to.
   This bus used to be called SwiftPAL itself, which took the name the host bridge needs. */
const GameBus = window.GameBus = {
  signals: [],
  validatorReport: { missing_signals: [], errors: [], passed: false },
  firedSet: new Set(),
  startedAt: Date.now(),
  emit(name, payload){
    const evt = Object.assign({
      ts: Date.now(),
      skill_code: CARD.skill_code,
      lo_code: CARD.lo_code,
      signal: name
    }, payload || {});
    this.signals.push(evt);
    this.firedSet.add(name);
    /* [14] fan the mapped signals out as xAPI verbs */
    /* a MANUAL hint_shown is a bulb tap, whose hint_used the capture listener on #hintBtn already
       sent - mapping it too would log the verb twice ([QA 14] no duplicated verbs). */
    /* [QA 14] one verb per screen, as HI01 does: an answerable slide sends question_started
       (mountSlide), everything else screen_viewed - never both for the same slide. */
    try{ if(XAPI_MAP[name] && !(name === "hint_shown" && payload && payload.manual)
            && !(name === "slide_entered" && payload && XAPI_ANSWERABLE.indexOf(payload.type) >= 0))
           XAPI.send(XAPI_MAP[name], { slide_id: payload && payload.slide_id }, payload || {}); }catch(e){}
    try{ console.log("[signal]", name, evt); }catch(e){}
    /* [QA 14] NOISE CONTROL (as HI01): the raw signal firehose is DEV-ONLY. Production hosts receive
       only the 7 xAPI verbs through the bridge. */
    if(new URLSearchParams(location.search).has("dev")){
      try{ window.parent?.postMessage({type:"swiftpal:signal", payload: evt}, "*"); }catch(e){}
    }
    this.persist();
  },
  /* full results record (used for download / POST / end-of-lesson dump) */
  exportResults(){
    const ms = (typeof state!=="undefined") ? state.masteryAttempts : 0;
    const mh = (typeof state!=="undefined") ? state.masteryHits : 0;
    return {
      skill_code: CARD.skill_code, lo_code: CARD.lo_code, part: CARD.part_label || null,
      started_at: this.startedAt, exported_at: Date.now(),
      mastery: { hits: mh, attempts: ms, score: ms ? mh/ms : 0 },
      validatorReport: this.validatorReport,
      signals: this.signals
    };
  },
  /* silent: flush the running buffer to localStorage (survives reload / offline) */
  persist(){
    try{ localStorage.setItem(TELEMETRY.storageKey, JSON.stringify(this.exportResults())); }
    catch(e){ /* private mode / quota — non-fatal, postMessage + memory still work */ }
  },
  /* pull the run as a JSON file (teacher/dev; not in the child's flow) */
  downloadResults(){
    try{
      const blob = new Blob([JSON.stringify(this.exportResults(), null, 2)], {type:"application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = CARD.skill_code + "_" + (CARD.part_label||"P1") + "_results.json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=> URL.revokeObjectURL(url), 1000);
    }catch(e){ console.error("[telemetry] download failed", e); }
  }
};

/* ---------- 3. AUDIO ---------- */
let isPlaying=false, currentAudio=null;
function setPlaying(on){
  // the dynamic Swiftie sits header-left; the audio chips pulse to signal playback. r4/F1: share the
  // .playing toggle across the header chip AND the tut-card replay chip (the header is hidden in the
  // tut frame, so the in-card .tut-audio is the only visible affordance and must react to VO too).
  isPlaying=on;
  /* [QA 05] only the chip the audio is actually coming FROM animates, and only one at a time.
     It used to pulse every chip for every sound - option words, feedback, the count-aloud. */
  const src = on && currentAudio ? currentAudio.getAttribute("src") : null;
  const from = on ? chipFor(src) : null;
  document.querySelectorAll(".audio-chip, .tut-audio, .sg-vo").forEach(c => c.classList.toggle("playing", c === from));
  swApplyPose();   // freeze/unfreeze Swiftie's mouth: animate only while a clip is sounding
}
/* [QA 15] ONE reusable VO element, not a new Audio() per clip. Every clip used to get its own
   element and none was ever released: ~150 live media players by the last question, and the
   renderer crashed there on every full playthrough (Android WebViews cap players far lower).
   _playTok retires a superseded clip's callbacks, so a stopped clip can never fire onEnd late. */
const voEl = new Audio(); voEl.preload = "auto";
let _playTok = 0;
/* chipFor(src): the ONE chip a clip belongs to, or null. The landing greeting belongs to the
   landing chip; a slide's own lines (prompt / ask / conclude ...) to that slide's chip - the in-card
   tutorial chip when the tutorial frame is up, else the header chip. Feedback, option words and
   the count-aloud belong to no chip, so no chip moves for them. */
const _FEEDBACK_KEYS = { correct:1, try_again:1, hint:1, hint1:1, reveal:1, sfx:1 };
function chipFor(src){
  if(!src || typeof CARD === "undefined") return null;
  const gate = document.getElementById("startGate");
  if(gate && !gate.classList.contains("hidden")){
    const land = (CARD.assets && CARD.assets.audio && CARD.assets.audio.vo_landing) || "";
    return land && src.indexOf(land) >= 0 ? document.getElementById("sgVo") : null;
  }
  const sl = CARD.slides[state.idx];
  if(!sl || !sl.audio) return null;
  const own = Object.keys(sl.audio).some(k => !_FEEDBACK_KEYS[k] && src === audioFor(sl, k));
  if(!own) return null;
  return document.querySelector("#slideHost .tut-audio") || document.getElementById("audioChip");
}
/* [QA 11] replay-chip guard (HI01 [24a N8]): a replay tap while a clip is sounding is ignored.
   play() stops the current clip, and a paused clip never fires its end callback - so a replay
   mid-count froze DEMO_COUNT (आगे never unlocked) and mid-answer-word lost the auto-advance.
   The tap still reports audio_replayed (flagged ignored), so every tap is logged. */
function replayTap(slide, src){
  state.audioReplays++;
  const busy = isPlaying;
  GameBus.emit("audio_replay", { slide_id: slide ? slide.id : "landing", phase: slide ? slide.phase : "landing",
    count: state.audioReplays, src: src, ignored_while_playing: busy });
  return !busy;
}
function stopAudio(){
  _playTok++;
  if(currentAudio){ try{ currentAudio.pause(); }catch(e){} currentAudio=null; }
  setPlaying(false);
}
/* play(src, onEnd): real clip if the path exists; silent beat if missing/blocked. */
function play(src, onEnd){
  stopAudio(); setPlaying(true);
  const tok = _playTok;
  let done=false; const fire=()=>{ if(done || tok !== _playTok) return; done=true; currentAudio=null; setPlaying(false); if(onEnd) onEnd(); };
  if(src){
    const a = voEl; currentAudio = a;
    a.onended = fire;
    a.onerror = ()=>{ if(tok === _playTok) setTimeout(fire, 1200); };
    a.src = src; setPlaying(true);   // re-apply now the src is known, so the right chip lights
    a.play().catch(()=>{ if(tok === _playTok) setTimeout(fire, 1200); });
  } else { setTimeout(fire, 800); }
}
/* playSfx(id): fire-and-forget sound effect that can overlap the spoken VO (does NOT touch
   currentAudio / the play() chain). Two pooled elements, reused - never one per call.
   Silently no-ops if the file is missing or playback is blocked. */
const _sfxPool = [new Audio(), new Audio()]; let _sfxNext = 0;
function playSfx(id){
  if(!id) return;
  try{
    const a = _sfxPool[_sfxNext++ % _sfxPool.length];
    a.pause(); a.volume = 0.7;
    a.src = "assets/voiceover/" + id + "." + AUDIO_EXT;
    a.play().catch(()=>{});
  }catch(e){}
}
/* ---------- game-feel: procedural SFX (no audio files) + success particle burst ----------
   WebAudio resumes on the first user tap (autoplay policy), so taps/answers always sound. */
let _juiceAC = null;
function _ac(){ if(!_juiceAC){ try{ _juiceAC = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){} }
  if(_juiceAC && _juiceAC.state === "suspended"){ try{ _juiceAC.resume(); }catch(e){} } return _juiceAC; }
function _tone(freqs, type, dur, vol){ const c = _ac(); if(!c) return; const t0 = c.currentTime;
  freqs.forEach((f, i)=>{ const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f;
    const t = t0 + i*(dur/freqs.length); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur/freqs.length); o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur/freqs.length); }); }
const sfxTap       = ()=> _tone([520], "sine", 0.09, 0.09);
const sfxCorrect   = ()=> _tone([660, 880, 1180], "sine", 0.42, 0.13);   // rising major arpeggio
const sfxWrongSoft = ()=> _tone([300, 235], "triangle", 0.20, 0.08);      // gentle, never harsh
/* a joyful star/confetti pop, centred on the play stage (upper-middle) */
function burstStars(){ const stage = document.querySelector(".slide-stage") || document.body;
  const cx = stage.offsetWidth/2, cy = stage.offsetHeight*0.38, emo = ["⭐","✨","🌟","💫","🎉"];
  for(let i=0;i<14;i++){ const s = document.createElement("span"); s.className = "spark"; s.textContent = emo[i % emo.length];
    const ang = (Math.PI*2)*(i/14) + Math.random()*0.5, dist = 70 + Math.random()*110;
    s.style.left = cx + "px"; s.style.top = cy + "px";
    s.style.setProperty("--dx", (Math.cos(ang)*dist).toFixed(0) + "px");
    s.style.setProperty("--dy", (Math.sin(ang)*dist).toFixed(0) + "px");
    s.style.animationDelay = (i*10) + "ms"; stage.appendChild(s); setTimeout(()=> s.remove(), 950); } }
/* dynamic Swiftie buddy: swap pose + a little pop on every reaction (correct/wrong/explain/celebrate) */
// [20a mascot-01] moods -> production EXPRESSIONS (head webp), not idle-gif basenames.
//   Ported verbatim from HI01H01_L02_S04_dist (its app lines 2474-2493) together with the
//   .mascot-wrap > .mascot-circle > .mascot-img markup. The old sw_anim_*.gif scheme and the
//   isPlaying mouth-coupling go with it - heads are now driven by setSwMood alone.
const SW_POSE = { talk:"talking", point:"talking", idle:"talking", happy:"celebrate", celebrate:"celebrate",
                  hint:"hint", teach:"hint", idea:"hint", tryagain:"tryagain" };
const SW_STILL = (() => { try { const q=new URLSearchParams(location.search);
  return q.has("still") || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); } catch(e){ return false; } })();
let swMood = "point";
function swApplyPose(){ /* [20a] retired: heads no longer couple to isPlaying (setSwMood drives them). */ }
function setSwMood(m){ swMood = m;
  const img = document.getElementById("swBuddyImg"), w = document.getElementById("swBuddy");
  if(!img) return;
  const expr = SW_POSE[m] || "talking";
  const animated = expr !== "talking" && !SW_STILL;   // resting face is the static talking head
  img.onerror = () => { img.onerror = null; img.src = "assets/mascot.webp"; };   // [mascot-10]
  const bust = (animated && expr === "celebrate") ? ("?r=" + (state.slideStart || 1)) : "";  // [mascot-08] replay play-once
  img.src = "assets/" + (animated ? "gif/" : "") + "sw_head_" + expr + (animated ? "_anim" : "") + ".webp" + bust;
  if(w){ w.dataset.expr = expr; w.classList.toggle("anim", animated);
         w.classList.remove("react"); void w.offsetWidth; w.classList.add("react"); } }   // .react pop kept from MTG
/* ===== FLN ANIMATION KIT: confetti (call site) BEGIN =====
   Recipe 7 REPLACES the correct-answer celebration rather than tuning it, so the
   two-sided .conf-shot cannon below is retired to _confettiCannonOld. The kit
   gates itself to guided/practice/mastery, so the phase of the live slide is
   passed through; in tutorial the tile-level confirm (recipe 19) is the feedback.
   The old function is kept, unreferenced, so the change is reversible in one line. */
function confettiCannon(){
  var sl = CARD.slides[state.idx] || {};
  /* [13] QA CHECKLIST gauge: ~100 pieces, 3s fall, staggered 0-0.5s, appended
     inside the stage, approved 7-colour palette. Size/radius/easing are pinned
     in style.css. phases:[] because the checklist asks for confetti on every
     correct answer, including tutorial. */
  FLNMotion.confetti.burst({
    host: ".stage-inner", phase: sl.phase, phases: [],
    count: 100, stagger: 0.5, fall: [3, 3], depth: [1, 1],
    colors: [["#8B2FC9","#5E1C8C"],["#3F51B5","#27358A"],["#1E88E5","#135FA6"],
             ["#22B24C","#157A34"],["#FFD21E","#D9A800"],["#FF8A1E","#C75F00"],
             ["#E5322D","#A81F1B"]]
  });
}
/* ===== FLN ANIMATION KIT: confetti (call site) END ===== */
/* confetti cannons from BOTH sides — the correct-answer celebration (replaces the popup) */
function _confettiCannonOld(){ const stage = document.querySelector(".slide-stage") || document.body;
  const W = stage.offsetWidth || 1000, cols = ["#F9695E","#FDC23C","#4EBE6A","#4EA3F0","#9B7BE8","#FF8FB1"];
  for(let side=0; side<2; side++){ for(let i=0;i<24;i++){ const c = document.createElement("i"); c.className = "conf-shot";
    c.style.background = cols[i % cols.length]; c.style.left = (side ? W-8 : 8) + "px"; c.style.bottom = "6px";
    const dir = side ? -1 : 1;
    c.style.setProperty("--tx", (dir*(120 + Math.random()*430)).toFixed(0) + "px");
    c.style.setProperty("--ty", (-(200 + Math.random()*300)).toFixed(0) + "px");
    c.style.animationDelay = (i*8) + "ms"; stage.appendChild(c); setTimeout(()=> c.remove(), 1300); } } }
/* ---------- Block Town helpers (flagship) ---------- */
const BT_COLORS = ["#F9695E","#FDC23C","#4EBE6A","#4EA3F0","#9B7BE8"];
function btBlock(i){ const b = document.createElement("div"); b.className = "blk"; b.style.background = BT_COLORS[i % BT_COLORS.length]; return b; }
function btThunk(n){ _tone([360 + n*46], "sine", 0.12, 0.10); }   // pitch climbs one step per block — HEAR the count
function btDust(plot){ const d = document.createElement("span"); d.className = "bt-dust"; d.textContent = "💨"; plot.appendChild(d); setTimeout(()=> d.remove(), 520); }
function btSkyline(done, total){ const s = document.createElement("div"); s.className = "bt-skyline";
  for(let i=0;i<total;i++){ const b = document.createElement("div"); b.className = "bt-bldg" + (i < done ? " done" : "");
    b.style.height = (26 + ((i*17) % 32)) + "px"; s.appendChild(b); } return s; }
/* the teach scene: the crane drops N blocks ONE AT A TIME (ascending thunk + spoken count) then a
   cardinality "freeze" (vo_total_N). Reached from MEET_NUMBER via data.present==='crane'. */
function btCraneMeet(host, slide){
  const d = slide.data, N = d.count;
  state.ownsAudio = true;   // the crane drops+counts blocks on its own timed VO — skip autoPlayChain
  const stage = document.createElement("div"); stage.className = "bt-stage";
  const board = document.createElement("div"); board.className = "bt-board";
  board.innerHTML = `<span class="bt-numeral">${N}</span>` + (d.word ? `<span class="bt-goallbl">${d.word}</span>` : "");   // Arabic numeral (from the integer, not card Devanagari)
  const track = document.createElement("div"); track.className = "bt-track"; const cells = [];
  for(let i=1;i<=N;i++){ const c = document.createElement("div"); c.className = "bt-nt"; track.appendChild(c); cells.push(c); }
  const yard = document.createElement("div"); yard.className = "bt-yard";
  const crane = document.createElement("div"); crane.className = "bt-crane"; crane.innerHTML = `<img src="assets/obj_crane.png" alt="">`;
  const plotwrap = document.createElement("div"); plotwrap.className = "bt-plotwrap";
  const plot = document.createElement("div"); plot.className = "bt-plot ground";
  plot.style.setProperty("--bh", Math.max(20, Math.min(46, Math.floor(230/N) - 2)) + "px");
  plotwrap.appendChild(plot); yard.appendChild(crane); yard.appendChild(plotwrap);
  stage.appendChild(board); stage.appendChild(track); stage.appendChild(yard);
  host.appendChild(stage);
  state.gateNavUntilAudio = false; setNavActive(false);
  $("navBtn").onclick = ()=> completeSlide(true);
  let i = 0;
  const step = ()=>{
    if(i >= N){ if(d.topper){ const t = document.createElement("div"); t.className = "bt-topper snap"; t.innerHTML = `<img src="assets/${d.topper}.png" alt="">`; plot.appendChild(t); }
      burstStars(); play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT, ()=> setNavActive(true)); return; }
    const b = btBlock(i); b.classList.add("drop"); plot.appendChild(b); i++;
    if(cells[i-1]){ cells[i-1].classList.add("lit"); cells[i-1].textContent = i; }
    btThunk(i); btDust(plot);
    play("assets/voiceover/vo_num_" + i + "." + AUDIO_EXT, ()=> setTimeout(step, 340));
  };
  // play the slide prompt FIRST, then start the crane count sequence — so the count VO never cuts the
  // prompt off (we own the audio here; mountSlide's autoPlayChain is skipped via state.ownsAudio).
  play(audioFor(slide, "prompt") || null, ()=> setTimeout(step, 400));
}
/* slide audio path: per slide, we look at slide.audio.prompt / .phoneme / etc.
   In this v0.1 the embedded card holds short ids; the compiler would replace
   them with base64 data URIs. We resolve to assets/voiceover/{id}.mp3 with fallback. */
function audioFor(slide, key){
  if(!slide.audio || !slide.audio[key]) return null;
  return "assets/voiceover/" + slide.audio[key] + "." + AUDIO_EXT;
}
/* audioText(slide,key): the exact Hindi line the VO for this slot speaks, so a
   popup can SHOW what it SAYS (shown == spoken). Looks up the build-injected
   CARD.assets.audio_text map by the slot's audio_id. null if unknown. */
function audioText(slide, key){
  const id = slide.audio && slide.audio[key];
  if(!id) return null;
  return (CARD.assets && CARD.assets.audio_text && CARD.assets.audio_text[id]) || null;
}
/* Play a SEQUENCE of audio sources back-to-back. Each one finishes (or
   falls back to silent beat if missing) before the next starts. */
function playChain(srcs, i, onDone){
  i = i || 0;
  if(i >= srcs.length){ if(onDone) onDone(); return; }
  play(srcs[i], () => playChain(srcs, i+1, onDone));
}
/* On slide mount, play prompt → phoneme/word_name → instruction in order.
   KG learners can't read prompt_hi — the chain gives them both the
   instruction AND the cue (letter sound or picture name) audibly.
   onDone fires after the whole chain finishes (used to gate the नav button). */
function autoPlayChain(slide, onDone){
  const order = ["prompt","phoneme","shape_name","word_name","instruction"];
  const chain = [];
  for(const k of order){
    const src = audioFor(slide, k);
    if(src) chain.push(src);
  }
  if(chain.length) playChain(chain, 0, onDone);
  else if(onDone) onDone();
}

/* nav button: enable/disable the kit-style pill. When it becomes active (the
   activity is done) but the child doesn't tap आगे, the hand-nudge points at it. */
function setNavActive(on){
  const btn = $("navBtn");
  btn.disabled = !on;
  btn.classList.toggle("active", on);
  clearTimeout(state.navNudgeTimer);
  if(on) state.navNudgeTimer = setTimeout(nudgeNavBtn, 4500);
}
function nudgeNavBtn(){
  /* [04] QA CHECKLIST: "Nudge hand only ever points at interactive tiles/objects
     - never at आगे, शुरू करें, or any other button." This pointed it straight at
     #navBtn, so it is now a no-op. Kept as a function because setNavActive()
     schedules it and several modules clear its timer. */
  return;
  /* eslint-disable no-unreachable */
  const btn = $("navBtn");
  if(!btn.classList.contains("active") || state.hintActive) return;
  const nh = $("nudgeHand");
  const r = btn.getBoundingClientRect();
  const sw = document.querySelector(".slide-stage").getBoundingClientRect();
  const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
  nh.style.left = ((r.left - sw.left)/scale + r.width/scale/2 - 48) + "px";
  nh.style.top  = ((r.top  - sw.top )/scale + r.height/scale/2 - 6) + "px";
  nh.classList.add("show");
}

/* ---------- 4. STATE ---------- */
const state = {
  idx: 0,
  slideStart: Date.now(),
  attempts: 0,
  audioReplays: 0,
  hintUsed: false,
  nudgeUsed: false,
  scaffoldLevel: 0,   // 0 none, 1 nudge, 2 hint, 3 reveal
  selectedKey: null,
  locked: false,
  hintActive: false,
  masteryHits: 0,
  masteryAttempts: 0,
  nudgeTimer: null
};
/* [QA 06] SCORE = first-try correctness over every ANSWERABLE question (guided + practice here).
   It used to count only phase==="mastery" slides - this card has none, so hits/attempts stayed
   0/0 and every run scored 0. recordResult() is called once per question when it resolves
   (right tap, or the reveal), from COUNT_HOW_MANY and MAKE_SET alike; a slide can only be
   scored once, so a replayed/re-entered slide can never be double-counted (no off-by-one). */
function recordResult(slide, firstTry){
  state.scored = state.scored || {};
  if(!slide || Object.prototype.hasOwnProperty.call(state.scored, slide.id)) return;
  state.scored[slide.id] = !!firstTry;
  state.masteryAttempts++; if(firstTry) state.masteryHits++;
}

/* ---------- 5. NUDGE ----------
   target may be a CSS selector OR an element. Used ONLY for flow guidance
   (e.g. the "listen" button / prompt) — never to point at the correct answer. */
function startNudge(slide, target){
  clearTimeout(state.nudgeTimer);
  if(!target) return;
  const ms = (CARD.scaffold_rules.nudge_timeout_ms || {})[slide.phase];
  if(!ms) return;
  state.nudgeTimer = setTimeout(()=>{
    if(state.locked || state.hintActive) return;
    const el = (typeof target === "string") ? document.querySelector(target) : target;
    if(!el) return;
    if(!placeNudge(el)) return;
    state.nudgeUsed = true;
    state.scaffoldLevel = Math.max(state.scaffoldLevel, 1);
    GameBus.emit("nudge_invoked", { slide_id: slide.id, phase: slide.phase });
  }, ms);
}
function stopNudge(){
  clearTimeout(state.nudgeTimer);
  $("nudgeHand").classList.remove("show");
}
/* [QA 12] THE HAND SITS BELOW ITS TARGET, NEVER ON IT, NEVER ON A BUTTON.
   #nudgeHand is 86x108 and nudge_hand_new.svg (75x94) fills it at scale 1.1467, which puts the
   fingertip at (34.2, 15.8) inside the box (kit recipe 4 geometry). The old code dropped the box
   -56px / -30px INTO the target, i.e. the fingertip 24-50px inside the tile and the hand over it.
   Now the FINGERTIP lands 8px below the target's bottom edge, and, as HI01 [28j] does, below any
   label text sitting under the target in the same column. It is clamped inside the stage
   (never flipped above - it points UP, so above a target it would point away), and if the box
   would still overlap any button other than its own target it is not shown at all.
   References .slide-stage (the nudge's positioning context), not .stage (~140px header off). */
const NH = { W:86, H:108, TIP_X:34.2, TIP_Y:15.8, GAP:8 };
function placeNudge(el){
  const nh = $("nudgeHand"), host = document.querySelector(".slide-stage");
  if(!el || !nh || !host || !el.getBoundingClientRect) return false;
  const r = el.getBoundingClientRect(), sw = host.getBoundingClientRect();
  const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
  const cx = (r.left - sw.left)/scale + r.width/scale/2;
  let tipY = (r.bottom - sw.top)/scale + NH.GAP;
  const tile = el.closest(".opt-cell, .count-item, .ms-item, .q-cell, .tut-card") || el.parentElement;
  if(tile){
    tile.querySelectorAll(".lbl, .opt-label, .count-badge, .pic-label").forEach(t => {
      const tr = t.getBoundingClientRect();
      if(tr.width < 2 || tr.height < 2 || tr.right < r.left || tr.left > r.right) return;
      const tb = (tr.bottom - sw.top)/scale + NH.GAP;
      if(tb > tipY) tipY = tb;
    });
  }
  const stageW = sw.width/scale, stageH = sw.height/scale;
  const left = Math.max(0, Math.min(stageW - NH.W, cx - NH.TIP_X));
  const top  = Math.max(0, Math.min(stageH - NH.H, tipY - NH.TIP_Y));
  nh.style.left = left + "px"; nh.style.top = top + "px";
  // never covering a button: test the hand's final box against every button except its target
  const hr = { l: sw.left + left*scale, t: sw.top + top*scale, r: sw.left + (left + NH.W)*scale, b: sw.top + (top + NH.H)*scale };
  /* A button in the hand's box: the hand is CUT OFF 4px above that button's top edge (clip-path),
     so it reads as tucked behind the button and never draws over it. On the tutorial slides आगे
     sits right under the unit row, so a plain "hide if it overlaps" rule hid the tutorial hand
     entirely. If the cut would leave less than 40% of the hand (fingertip + finger), it is hidden. */
  let cutTop = Infinity;
  [...document.querySelectorAll("button, .nav-btn, .audio-chip, .tut-audio, .hint-btn")].forEach(b => {
    if(b === el || b.contains(el) || el.contains(b)) return;
    const br = b.getBoundingClientRect();
    if(br.width < 2 || br.height < 2 || getComputedStyle(b).visibility === "hidden") return;
    if(br.left < hr.r && br.right > hr.l && br.top < hr.b && br.bottom > hr.t) cutTop = Math.min(cutTop, br.top);
  });
  nh.style.clipPath = "";
  if(cutTop !== Infinity){
    const keep = (cutTop - 4 - hr.t) / scale;                 // design px of the hand left visible
    if(keep < NH.H * 0.4){ nh.classList.remove("show"); return false; }
    nh.style.clipPath = "inset(0 0 " + Math.max(0, NH.H - keep).toFixed(1) + "px 0)";
  }
  nh.classList.add("show");
  return true;
}
/* Show the hand-nudge immediately on a specific element (teach slides use it to guide the
   next tap). Same placement as the idle nudge - see placeNudge(). */
function pointNudgeAt(el){ placeNudge(el); }

const SW_REST = "sw_anim_rest";   // the feedback-card Swiftie's closed-mouth rest frame (assets/sw_anim_rest.png)
/* ---------- 7. HINT / FEEDBACK BOX ----------
   No button: the popup plays its VO, then auto-dismisses. onEnd runs after it
   closes (callers add a short pause there so the revealed answer shows). */
function showBox(emoji, text, theme, audioSrc, onEnd){
  // CORRECT: no popup (lead review) — confetti cannons from both sides + Swiftie cheer, then onEnd.
  if(theme === "correct"){
    sfxCorrect(); confettiCannon(); setSwMood("celebrate");
    play(audioSrc || null, ()=> setTimeout(()=>{ if(onEnd) onEnd(); }, 300));
    return;
  }
  state.hintActive = true;
  // wrong/hint/reveal keep a light card (mechanics use it for a short cue); Swiftie reacts too.
  // one-Swiftie rule: the popup shows the reacting Swiftie (animated), so HIDE the header buddy
  // while it's open — never two Swifties on screen at once (MoM flag).
  /* [kit] the measurement sheet ships seven FULL-BODY Swiftie poses; the feedback
     card is the one place this build already shows a whole mascot, so it reads
     them instead of the old three-gif set. Falls back to the gifs if a cut is
     missing. */
  const swMap  = { wrong:"sw_anim_tryagain", hint:"sw_anim_teach", reveal:"sw_anim_teach" };
  const mkPose = { wrong:MK.sw.cheer, hint:MK.sw.guide, reveal:MK.sw.explain };
  const sw = $("hintMascot");
  if(sw){
    sw.style.display = "";
    const gif = "assets/gif/" + (swMap[theme] || "sw_anim_talk") + ".gif";
    sw.onerror = function(){ this.onerror = null; this.src = gif; };
    sw.src = mkPose[theme] ? mkSrc(mkPose[theme]) : gif;
  }
  const buddy = $("swBuddy"); if(buddy) buddy.style.visibility = "hidden";
  setSwMood(theme === "wrong" ? "tryagain" : "hint");
  $("hintBox").classList.remove("celebrate");
  sfxWrongSoft();
  const ht = $("hintText"); ht.textContent = text; ht.className = "hint-text " + theme;
  $("stage").classList.add("blurred");
  $("hintOverlay").classList.add("show");
  $("hintBtn").disabled = true;
  { const hb=$("hintBtn"); if(hb) hb.classList.remove("hint-glow"); }   // HI01 parity (its line 2965): the bulb stops pulsing once the hint is spent
  /* [12] QA CHECKLIST: the hint bulb is the inline SVG (gradient + ring + rays),
     so the old hint.png / hint_active.png swap is gone, not just inert. */
  const close = ()=>{
    $("hintOverlay").classList.remove("show");
    $("stage").classList.remove("blurred");
    if(buddy) buddy.style.visibility = "";   // header Swiftie returns when the popup closes
    state.hintActive = false;
    if(!state.locked) $("hintBtn").disabled = false;
    if(onEnd) onEnd();
  };
  // auto-dismiss after the VO finishes (small buffer so it never just flashes); freeze the popup
  // Swiftie's mouth to the still frame the instant its line ends
  /* [QA 05] SW_REST was never defined, so this callback threw and close() never ran - the popup
     stayed up and blocked every tap (reached once MAKE_SET's wrong path became live). The rest pose
     is the feedback card's own default (index.html #hintMascot). close() is now always scheduled. */
  play(audioSrc, ()=>{ try{ if(sw) sw.src = "assets/" + SW_REST + ".png"; }catch(e){} setTimeout(close, 300); });
}

/* ---------- 8. TAP-OPTION HELPER (shared by 5 slide types) ---------- */
function mountTapOptions({slide, host, signalName, stimulus, options, isCorrect, optionRenderer, columnsHint, mastery, hintAction, nudgeTarget, shuffle, onCorrect, onWrong, reask}){
  state.attempts = 0; state.selectedKey = null; state.locked = false;
  state.audioReplays = 0; state.hintUsed = false; state.nudgeUsed = false; state.scaffoldLevel = 0;
  // idle hand-nudge target: defaults to the stimulus (re-listen), but a slide can pass
  // nudgeTarget:null to suppress it entirely (e.g. "how many?" — nothing to re-tap).
  const _nudge = (nudgeTarget !== undefined) ? nudgeTarget : (stimulus || null);
  // optional custom hint (runs on the live slide instead of a text popup), e.g. a
  // count-demonstration. Wrapped to block option taps while it plays.
  const runHint = hintAction ? (after)=>{ state.hintActive = true; hintAction(()=>{ state.hintActive = false; if(after) after(); }); } : null;

  // Shuffle options once so the correct answer isn't pinned to one position (engine-wide anti
  // positional-bias — otherwise "always tap the same spot" can pass mastery). Opt out with
  // shuffle:false for inherently-ordered options (e.g. a number line).
  const _opts = (shuffle === false) ? options.slice()
    : (function(a){ a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; })(options);

  const wrap = document.createElement("div"); wrap.className = "q-row";
  if(stimulus){ wrap.appendChild(stimulus); }
  const grid = document.createElement("div");
  const cols = columnsHint || (_opts.length <= 2 ? 2 : _opts.length <= 3 ? 3 : 4);
  grid.className = "opt-grid cols-" + cols;
  _opts.forEach((opt, i) => {
    const cell = optionRenderer(opt, i);
    cell.classList.add("opt-cell");
    cell.dataset.key = String(i);
    cell.onclick = ()=>{
      /* [10] a wrong card must stay tappable - the .crossed early-return is gone.
         .correct still blocks, because the slide is locked once it is answered. */
      if(state.locked || state.hintActive || cell.classList.contains("correct")) return;
      stopNudge();
      // SME rule: SPEAK THE TAPPED WORD on EVERY tap (right or wrong), then the feedback — never two
      // voices at once (buzz/confetti are sfx, they ride alongside the word). opt.audio = word clip id.
      // Fallback wiring for LETTER options (SME: the tapped item's own sound speaks EVERYWHERE): options
      // authored as {letter:"आ"} carry no audio id, but the slide's data.phonemes map has each letter's
      // clip — derive it here centrally so every TAP_LETTER_* / mastery module inherits speak-on-tap
      // without per-module or per-card changes. Explicit opt.audio always wins.
      const _aid = opt.audio ||
                   (opt.letter && slide.data && slide.data.phonemes && slide.data.phonemes[opt.letter]) || null;
      const _word = _aid ? ("assets/voiceover/" + _aid + "." + AUDIO_EXT) : null;
      const _afterWord = (cb)=>{ if(_word) play(_word, cb); else cb(); };
      if(isCorrect(opt, i)){
        state.locked = true; cell.classList.add("correct"); FLNMotion.correctSelect.play(cell);
        try{ XAPI.send("question_answered", { slide_id: slide.id, type: slide.type, phase: slide.phase },
             { is_correct:true, attempt: state.attempts + 1, score: state.attempts === 0 ? 1 : 0 }); }catch(e){}   /* kit recipe 19 - tile-level confirm; runs WITH the confetti, not instead of it */
        sfxCorrect(); confettiCannon(); setSwMood("happy");
        if(onCorrect) onCorrect(opt, cell);      // [kit] slide-level flourish (e.g. the result plate)
        recordResult(slide, state.attempts === 0);   // [QA 06] every answerable slide scores, not only "mastery"
        GameBus.emit(signalName, { slide_id: slide.id, phase: slide.phase, value: true,
          first_try: state.attempts === 0, attempts: state.attempts + 1,
          scaffold_level: state.scaffoldLevel, latency_ms: Date.now()-state.slideStart });
        _afterWord(()=> setTimeout(()=> completeSlide(true), 700));   // speak the word → then advance (confetti is the reward)
      } else {
        state.attempts++; cell.classList.add("crossed");
        /* [10] QA CHECKLIST: the wrong card auto-reverts after ~900ms and STAYS
           TAPPABLE, so this is the kit's transient .play() (release), no longer
           .out() (elimination). .play() releases at dur*1500+40 then fades over
           260ms = ~900ms at the default .4s beat, which is the spec figure.
           The .crossed class is left on only so existing logic still reads it;
           its dim/lock/cross are neutralised in style.css. */
        FLNMotion.wrongSelect.play(cell, { then: function(){ cell.classList.remove("crossed"); } });
        try{ XAPI.send("question_answered", { slide_id: slide.id, type: slide.type, phase: slide.phase },
             { is_correct:false, attempt: state.attempts, score: 0 }); }catch(e){}
        sfxWrongSoft(); setSwMood("tryagain");
        if(onWrong) onWrong(opt, cell);          // [kit] slide-level cue (e.g. gap vs overlap)
        // (do NOT count masteryAttempts here — the correct branch counts one attempt PER ITEM.)
        GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
        // LAYERED SCAFFOLD (A1): L1 re-listen → L2 hint → L3 REVEAL at max_attempts (never stuck).
        const _maxA = (CARD.scaffold_rules && CARD.scaffold_rules.max_attempts) || 3;
        $("hintBtn").classList.add("show","hint-glow");
        _afterWord(()=>{   // speak the tapped word FIRST, then the layered feedback VO (no overlap)
          if(state.attempts >= _maxA){ revealAnswer("wrong"); }
          else if(state.attempts >= 2){ state.scaffoldLevel = Math.max(state.scaffoldLevel, 2);
            GameBus.emit("hint_shown", { slide_id: slide.id, manual: false });   // [QA 14] auto hint -> hint_used
            if(runHint) runHint(); else play(audioFor(slide, "hint") || audioFor(slide, "try_again") || null, ()=>{}); }
          else { state.scaffoldLevel = Math.max(state.scaffoldLevel, 1);
            /* [QA 05] rung 1 = RE-LISTEN: the try-again line, then the question itself again
               (reask:false = the try-again line only, where the deck's incorrect feedback is just that line) */
            play(audioFor(slide, "try_again") || null, ()=>{ if(reask !== false && !state.locked && !state.hintActive) play(audioFor(slide, "prompt") || null, ()=>{}); }); }
        });
      }
    };
    grid.appendChild(cell);
  });
  wrap.appendChild(grid);
  host.appendChild(wrap);

  // ---- layered-hint helpers (A1/B2): reveal-on-max + a wired manual hint button ----
  function _correctCell(){ return [...grid.querySelectorAll(".opt-cell")].find(c => isCorrect(_opts[+c.dataset.key], +c.dataset.key)); }
  function revealAnswer(reason){
    if(state.locked) return; state.locked = true; state.scaffoldLevel = 3; setSwMood("hint");
    const el = _correctCell();
    [...grid.querySelectorAll(".opt-cell")].forEach(c => { if(c !== el) c.classList.add("faded"); });
    if(el) el.classList.add("correct", "ck-correct", "reveal-pulse");   // [QA 10] the spec green border, never the tick badge
    recordResult(slide, false);
    GameBus.emit("answer_revealed", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts, reason });
    play(audioFor(slide, "reveal") || audioFor(slide, "correct") || audioFor(slide, "try_again") || null,
      ()=> setTimeout(()=> completeSlide(false), 800));
  }
  $("hintBtn").onclick = ()=>{ if(state.locked || state.hintActive) return;
    state.hintUsed = true; if(state.attempts < 1) state.attempts = 1;
    GameBus.emit("hint_shown", { slide_id: slide.id, manual: true });
    if(runHint) runHint(); else play(audioFor(slide, "hint") || audioFor(slide, "try_again") || null, ()=>{}); };

  startNudge(slide, _nudge);
  // Tap-to-answer standard (lead review): a WRONG tap = soft buzz + ✕ + that card LOCKS (can't re-tap);
  // a RIGHT tap = confetti cannons + Swiftie cheer, then auto-advance. No select-then-आगे for pick questions.
  $("navBtn").style.display = "none"; setNavActive(false);
}

/* ---------- 10. RENDER HELPERS ---------- */
/* Render a picture as the real PNG (assets/<key>.png); if the file is
   missing it falls back to the emoji. Pass the image id (e.g. "pic_anaar"). */
function imgOrEmoji(imgKey, emoji, imgClass, emojiClass){
  if(imgKey){
    const fb = String(emoji||"❓").replace(/'/g,"");
    return `<img class="${imgClass}" src="assets/${imgKey}.${IMG_EXT}" alt="" `+
      `onerror="var s=document.createElement('span');s.className='${emojiClass}';s.textContent='${fb}';this.replaceWith(s);">`;
  }
  return `<span class="${emojiClass}">${emoji||"❓"}</span>`;
}
function letterCell(letter){
  const cell = document.createElement("div");
  cell.innerHTML = `<span class="big-glyph ink-glyph">${letter}</span>`;
  return cell;
}
/* ordering/seriation render (MTKGA02_L02_S02): an object at a given magnitude. by="size" scales the
   picture uniformly; by="length" draws a content-true rounded bar of width∝mag; by="weight" shows the
   picture at a uniform size (weight is not visual — the child uses known heaviness / the balance cue). */
function imgOrEmojiSized(img, emoji, px){
  const fb = String(emoji||"❓").replace(/'/g,"");
  if(img) return `<img class="ord-obj-img" style="width:${px}px;height:${px}px" src="assets/${img}.${IMG_EXT}" alt="" `+
    `onerror="var s=document.createElement('span');s.className='ord-obj-emoji';s.style.fontSize='${Math.round(px*0.82)}px';s.textContent='${fb}';this.replaceWith(s);">`;
  return `<span class="ord-obj-emoji" style="font-size:${Math.round(px*0.82)}px">${emoji||"❓"}</span>`;
}
function renderOrdObj(o, by){
  if(by === "length"){ const w = {1:130,2:210,3:300}[o.mag] || 200;
    return `<div class="ord-bar" style="width:${w}px;background:${o.color||"#F5A623"}"></div>`; }
  // size AND weight scale the picture by visual magnitude — so a BIG-but-LIGHT balloon looks big and
  // tempts the child (bigger=heavier misconception), while the small stone is the correct heaviest pick.
  const px = {1:80, 2:116, 3:154}[o.mag] || 116;
  return imgOrEmojiSized(o.img, o.emoji, px);
}
function pictureCell(picture, emoji, imgKey){
  const cell = document.createElement("div");
  cell.innerHTML = imgOrEmoji(imgKey, emoji, "pic-img", "pic-emoji") + `<span class="lbl">${picture||""}</span>`;
  return cell;
}
function stimulusLetter(letter){
  const el = document.createElement("div"); el.className = "stimulus-letter";
  el.innerHTML = `<span class="ink-glyph">${letter}</span>`;
  return el;
}
function stimulusPic(picture, emoji, imgKey){
  const el = document.createElement("div"); el.className = "stimulus-pic";
  el.innerHTML = imgOrEmoji(imgKey, emoji, "img", "emoji") + `<span class="lbl">${picture||""}</span>`;
  return el;
}
/* gender helpers: an option card showing a gender label (पुल्लिंग/स्त्रीलिंग),
   and a stimulus card showing the target gender label. */
function genderLabelCell(label, gender){
  const cell = document.createElement("div");
  cell.innerHTML = `<span class="gender-label${gender==="F"?" fem":""}">${label}</span>`;
  return cell;
}
function stimulusGender(label, gender){
  const el = document.createElement("div");
  el.className = "stimulus-gender" + (gender==="F"?" fem":"");
  el.textContent = label;
  return el;
}

/* shape helpers (maths): render circle/square/triangle/rectangle as inline SVG in
   any colour / size / rotation (LO: recognise regardless of orientation or size).
   No image assets needed — shapes are pure geometry, so the sample renders offline. */
function shapeSVG(shape, opts){
  opts = opts || {};
  const color = opts.color || "#386AF6";
  const size  = opts.size  || 120;
  const rot   = opts.rotate || 0;
  let inner = "";
  if(shape === "circle")         inner = `<circle cx="50" cy="50" r="42" fill="${color}"/>`;
  else if(shape === "square")    inner = `<rect x="12" y="12" width="76" height="76" rx="0" fill="${color}"/>`;   // TRUE corners — teachable geometry is never rounded
  else if(shape === "triangle")  inner = `<polygon points="50,9 91,89 9,89" fill="${color}"/>`;
  else if(shape === "rectangle") inner = `<rect x="6" y="28" width="88" height="44" rx="0" fill="${color}"/>`;    // TRUE corners
  const g = rot ? `<g transform="rotate(${rot} 50 50)">${inner}</g>` : inner;
  return `<svg class="shape-svg" viewBox="0 0 100 100" width="${size}" height="${size}" `+
         `xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${g}</svg>`;
}
function shapeCell(o){
  const cell = document.createElement("div");
  cell.innerHTML = shapeSVG(o.shape, {color:o.color, size:130, rotate:o.rotate});
  return cell;
}
function stimulusShape(o){
  const el = document.createElement("div"); el.className = "stimulus-shape";
  el.innerHTML = shapeSVG(o.shape, {color:o.color, size:150, rotate:o.rotate});
  return el;
}

/* counting helpers (maths): a numeral option card (big numeral + small number word),
   and a stimulus box showing a set of `count` identical objects to be counted. */
function numberCell(numeral, word){
  const cell = document.createElement("div");
  cell.innerHTML = `<span class="num-glyph">${numeral}</span>` + (word ? `<span class="num-word">${word}</span>` : "");
  return cell;
}
/* VISUAL-FIRST quantity: a HAND showing n fingers up (assets/hand_1..5) — pre-reader,
   NO number-word text. Falls back to the numeral only if n is outside 1..5 or the art is missing. */
function fingerCount(n, cls){ cls = cls || "finger-hand";
  if(!(n>=1 && n<=5)) return `<span class="num-glyph">${n}</span>`;
  return `<img class="${cls}" src="assets/hand_${n}.png" alt="" ` +
    `onerror="var s=document.createElement('span');s.className='num-glyph';s.textContent='${n}';this.replaceWith(s);">`;
}
function fingerCell(n){ const c = document.createElement("div"); c.innerHTML = fingerCount(n, "opt-hand"); return c; }
/* DISPLAY numeral: ALWAYS Arabic (1 2 3) on screen — kids learn the universal digit.
   Spoken VO stays Hindi (एक/दो/तीन) via the separate vo_num_/vo_total_ audio files. */
function devNumeral(n){ return String(n); }
/* DUAL-CODED counting option: the Devanagari NUMERAL the child is learning, big and on top,
   with a smaller finger-hand beneath it as a visual anchor. The point of counting is to learn the
   NUMBER SYMBOL, not just read a hand-sign — so the numeral leads and the hand supports. Falls back
   to the numeral alone if the hand art (1..5) is missing. */
function numFingerCell(n){
  // outer div BECOMES the .opt-cell (mountTapOptions adds that class), so the stack lives in an
  // INNER .numfinger wrapper — otherwise ".opt-cell .numfinger x" selectors wouldn't match.
  const c = document.createElement("div");
  // hand art exists only for 1..5; beyond that fingerCount would fall back to a SECOND numeral
  // (numeral shown twice — hit when the counting range grew to 10), so skip the hand entirely.
  c.innerHTML = `<div class="numfinger"><span class="num-glyph">${devNumeral(n)}</span>${(n>=1&&n<=5) ? fingerCount(n, "nf-hand") : ""}</div>`;
  return c;
}
function stimulusCountSet(count, obj, scatter, perRow){
  // counts >10 render DENSE (smaller objects, wrapping); perRow groups the set in rows of exactly
  // N (the curriculum's "rows of 5/10" organisation for sets up to 20 — MTKGA01_L01_S04).
  const dense = count > 10 || !!perRow;
  const el = document.createElement("div"); el.className = "count-set" + (scatter ? " scattered" : "") + (dense ? " dense" : "");
  if(perRow && !scatter){ el.style.display = "grid"; el.style.gridTemplateColumns = `repeat(${perRow}, auto)`; }
  for(let i=0;i<count;i++){
    const c = document.createElement("span"); c.className = "cobj";
    // SCATTERED arrangement (SME/misconception: "total changes when objects are scattered") —
    // deterministic per-index jitter (stable across mounts/captures), never so large items overlap-hide.
    if(scatter) c.style.transform = `translateY(${((i*23)%25)-12}px) rotate(${((i*37)%21)-10}deg)`;
    c.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji");
    el.appendChild(c);
  }
  return el;
}
/* SME (S01 review deck): outside the tutorial, numeral options show the NUMBER ONLY, larger —
   no finger-hand support (fingers are a TEACHING aid, not a test aid). */
function bigNumCell(n){
  const c = document.createElement("div");
  c.innerHTML = `<span class="bignum-glyph">${devNumeral(n)}</span>`;
  return c;
}
/* COMPARE_SETS helpers (one-to-one matching → ज़्यादा / कम / बराबर).
   Two left-aligned rows (columns line up), a dashed connector drawn top[i]↔bottom[i]
   for each matched pair, and the unmatched leftover item(s) in the longer row glow —
   that glow IS the "which has more" proof. Offsets (not getBoundingClientRect) so it
   works even when the preview tab is throttled. */
function cmpObj(obj){
  const c = document.createElement("span"); c.className = "cobj";
  c.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji");
  return c;
}
function stimulusCompareSets(data){
  const nA = data.a_count, nB = data.b_count, A = data.a_object, B = data.b_object;
  const NS = "http://www.w3.org/2000/svg";
  const stage = document.createElement("div"); stage.className = "compare-stage";
  const rowA = document.createElement("div"); rowA.className = "cmp-row top";
  const rowB = document.createElement("div"); rowB.className = "cmp-row bot";
  const svg  = document.createElementNS(NS, "svg"); svg.setAttribute("class", "cmp-lines");
  for(let i=0;i<nA;i++) rowA.appendChild(cmpObj(A));
  for(let i=0;i<nB;i++) rowB.appendChild(cmpObj(B));
  stage.appendChild(rowA); stage.appendChild(svg); stage.appendChild(rowB);
  const btn = document.createElement("button"); btn.type = "button"; btn.className = "cmp-match-btn";
  btn.textContent = "🔗 मिलाओ"; stage.appendChild(btn);
  const min = Math.min(nA, nB);
  let drawn = false;
  function draw(){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    const IA = [...rowA.children], IB = [...rowB.children];
    const y1 = rowA.offsetTop + rowA.offsetHeight - 4;
    const y2 = rowB.offsetTop + 4;
    for(let i=0;i<min;i++){
      const x = IA[i].offsetLeft + IA[i].offsetWidth/2;
      const ln = document.createElementNS(NS, "line");
      ln.setAttribute("x1", x); ln.setAttribute("y1", y1);
      ln.setAttribute("x2", x); ln.setAttribute("y2", y2);
      ln.setAttribute("class", "cmp-line"); svg.appendChild(ln);
      setTimeout(()=> ln.classList.add("show"), 130*i);
    }
    const longer = nA > nB ? IA : nB > nA ? IB : null;   // null when equal (nothing left over)
    if(longer) for(let i=min;i<longer.length;i++)
      setTimeout(()=> longer[i].classList.add("leftover"), 130*min + 160);
  }
  // reveal the matching (child taps मिलाओ, or the hint/tutorial calls this). cb fires after it settles.
  stage._revealMatches = (cb)=>{ if(!drawn){ drawn = true; btn.disabled = true; draw(); }
    if(cb) setTimeout(cb, 130*min + 800); };
  btn.onclick = ()=> stage._revealMatches();
  if(data.show_matches){ btn.style.display = "none"; setTimeout(()=> stage._revealMatches(), 420); }
  return stage;
}
/* HINT for "how many": instead of a text popup, COUNT the set FOR the child —
   highlight each object left→right, say एक/दो/तीन, show the numeral on top of it.
   The child sees + hears the count modelled, then answers from the options. */
function demoCount(items, numerals, onDone){
  numerals = numerals || [];
  const clear = ()=> items.forEach(o=>{ o.classList.remove("counting"); const c=o.querySelector(".count-callout"); if(c) c.remove(); });
  clear();
  let i = 0;
  (function step(){
    if(i >= items.length){                       // last count landed → clear, then continue
      setTimeout(()=>{ clear(); if(onDone) onDone(); }, 1000);
      return;
    }
    const o = items[i];
    o.classList.add("counting");
    let cal = o.querySelector(".count-callout");
    if(!cal){ cal = document.createElement("span"); cal.className = "count-callout"; o.appendChild(cal); }
    cal.textContent = String(i+1);   // Arabic count callout; Hindi number-word is spoken separately
    play("assets/voiceover/vo_num_" + (i+1) + "." + AUDIO_EXT, ()=>{ i++; setTimeout(step, 320); });
  })();
}
function demoCountSet(setEl, count, numerals, onDone){   // count the "how many?" stimulus set
  demoCount([...setEl.querySelectorAll(".cobj")].slice(0, count), numerals, onDone);
}

/* ---------- 10b. DEVANAGARI GLYPH INK-CENTERING ----------
   Devanagari glyphs carry matras above (ओ, औ, अं) and below (ऋ) the shirorekha,
   so plain flex `align-items:center` leaves them sitting high with a gap below —
   and the offset differs per glyph. Measure each glyph's real ink box (canvas
   actualBoundingBox) + its baseline in the DOM, then translateY so the INK is
   truly centred in its tile/box. Font-agnostic; recomputed on mount + fonts.ready. */
let _inkCtx = null;
function centerInkGlyph(span){
  if(!span || !span.parentElement) return;
  const glyph = (span.textContent || "").trim();
  if(!glyph) return;
  const box = span.parentElement;
  const cs = getComputedStyle(span);
  const fpx = parseFloat(cs.fontSize);
  if(!fpx) return;
  _inkCtx = _inkCtx || document.createElement("canvas").getContext("2d");
  _inkCtx.font = `${cs.fontWeight} ${fpx}px ${cs.fontFamily}`;
  const m = _inkCtx.measureText(glyph);
  const a = m.actualBoundingBoxAscent, d = m.actualBoundingBoxDescent;
  if(!isFinite(a) || !isFinite(d)) return;
  const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
  span.style.transform = "";   // reset before measuring baseline
  const probe = document.createElement("span");
  probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline;";
  span.appendChild(probe);
  const baseScreen = probe.getBoundingClientRect().top;
  span.removeChild(probe);
  const br = box.getBoundingClientRect();
  if(br.height < 5) return;    // not laid out yet
  const boxCenter = br.top + br.height/2;
  const inkCenter = baseScreen + ((d - a)/2) * scale;   // screen px
  const dy = (boxCenter - inkCenter) / scale;           // css px to move glyph down
  span.style.transform = `translateY(${dy}px)`;
}
function centerAllGlyphs(root){
  (root || document).querySelectorAll(".ink-glyph").forEach(centerInkGlyph);
}

/* ---------- 11. DRAG-DROP PRIMITIVE ---------- */
function makeDraggable(tileEl, onDrop){
  let startX=0, startY=0, dx=0, dy=0, dragging=false;
  let scale = 1;
  const refScale = ()=> scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
  function onDown(e){
    if(tileEl.classList.contains("snapped") || tileEl.classList.contains("matched")) return;
    refScale();
    dragging = true;
    // bind move/up on the document ONLY while dragging (removed in onUp) — otherwise every tile leaves
    // stale document listeners that pile up across the 11 drag slides.
    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onMove, {passive:false});
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    const p = e.touches ? e.touches[0] : e;
    startX = p.clientX; startY = p.clientY;
    dx = 0; dy = 0;
    tileEl.classList.add("dragging");
    e.preventDefault();
  }
  function onMove(e){
    if(!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    dx = (p.clientX - startX) / scale; dy = (p.clientY - startY) / scale;
    tileEl.style.transform = `translate(${dx}px,${dy}px) scale(1.08)`;
    // highlight zone under — hide the tile from hit-testing so the dragged tile
    // (z-index 50, now covering the zone) doesn't mask the zone beneath it.
    const cx = p.clientX, cy = p.clientY;
    document.querySelectorAll(".dd-zone").forEach(z => z.classList.remove("hover"));
    tileEl.style.pointerEvents = "none";
    const under = document.elementFromPoint(cx, cy);
    tileEl.style.pointerEvents = "";
    const zone = under?.closest?.(".dd-zone");
    if(zone && !zone.classList.contains("filled")) zone.classList.add("hover");
    e.preventDefault();
  }
  function onUp(e){
    if(!dragging) return;
    dragging = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("mouseup", onUp);
    document.removeEventListener("touchend", onUp);
    tileEl.classList.remove("dragging");
    const p = e.changedTouches ? e.changedTouches[0] : e;
    // hide the tile from hit-testing so we detect the zone underneath it
    tileEl.style.pointerEvents = "none";
    const under = document.elementFromPoint(p.clientX, p.clientY);
    tileEl.style.pointerEvents = "";
    const zone = under?.closest?.(".dd-zone");
    document.querySelectorAll(".dd-zone").forEach(z => z.classList.remove("hover"));
    if(zone && !zone.classList.contains("filled")){
      // snap
      tileEl.style.transform = "";
      onDrop(zone, tileEl);
    } else {
      tileEl.style.transform = "";
    }
  }
  tileEl.addEventListener("mousedown", onDown);
  tileEl.addEventListener("touchstart", onDown, {passive:false});
}
/* shared wrong-drop response for drag/sort/sequence modules: soft buzz + Swiftie try-again pose + the
   authored spoken "try_again". Pre-readers need the SPOKEN recovery, not just the visual spring-back. */
function dragWrong(slide){ sfxWrongSoft(); setSwMood("tryagain"); play(audioFor(slide, "try_again") || null, ()=>{}); }

/* ---------- 11b. MEASUREMENT ART KIT (assets/mk_*) ----------------------
   The kit sheet cut for this card: tables, the unit block in four states
   (idle / placed / ghost / glow), start+end measure markers, the two wrong-way
   figures (gap, overlap), a success sparkle, a re-usable result plate and seven
   full-body Swiftie poses. It is wired here rather than inside each module so
   DEMO_COUNT / MAKE_SET / COUNT_HOW_MANY all pick the same visual language up.

   The pedagogy drives the art: this skill is "units laid in ONE ROW, WITH NO
   GAPS". So the kit lays its blocks FLUSH (.mk-rail) and names the two ways a
   child gets it wrong - a gap, or an overlap - with the sheet's own figures. */
const MK = {
  block:  "mk_block",        placed: "mk_block_placed",
  ghost:  "mk_block_ghost",  glow:   "mk_block_glow",
  mStart: "mk_marker_start", mEnd:   "mk_marker_end",
  errGap: "mk_err_gap",      errOver:"mk_err_overlap",
  sparkle:"mk_sparkle",      plate:  "mk_badge_blank",
  sw: { explain:"mk_sw_explain", guide:"mk_sw_guide", cheer:"mk_sw_cheer" }
};
const mkSrc = (id)=> "assets/" + id + "." + IMG_EXT;
/* is this a measuring slide? = the card gave it an object laid along a scene object */
function mkIsMeasure(slide){
  return !!(slide && slide.data && slide.data.object && slide.data.object.img &&
            String(slide.data.object.img).indexOf("mk_block") === 0);
}
/* swap a laid block between its states without re-rendering the tile */
function mkSetBlockState(itemEl, stateId){
  const img = itemEl && itemEl.querySelector(".cobj-img, .ms-obj-img");
  if(img && img.tagName === "IMG") img.src = mkSrc(stateId);
}
/* the kit's glow sprite, flashed over a block the instant it is laid/counted */
function mkGlow(itemEl){
  if(!itemEl) return;
  const g = document.createElement("img");
  g.className = "mk-glow"; g.src = mkSrc(MK.glow); g.alt = "";
  itemEl.appendChild(g);
  setTimeout(()=> g.remove(), 620);
}
/* START / END markers bracketing the thing being measured - the sheet's
   mk_table_markers page, generalised to whatever object the slide names. */
function mkAddMarkers(figEl){
  if(!figEl || figEl.querySelector(".mk-marker")) return;
  const mk = (cls, id)=>{ const i = document.createElement("img");
    i.className = "mk-marker " + cls; i.src = mkSrc(id); i.alt = ""; i.setAttribute("aria-hidden","true");
    i.onerror = function(){ this.remove(); }; return i; };
  figEl.classList.add("mk-measured");
  figEl.insertBefore(mk("mk-marker-s", MK.mStart), figEl.firstChild);
  figEl.appendChild(mk("mk-marker-e", MK.mEnd));
}
/* the result plate: "<n> \u092c\u094d\u0932\u0949\u0915\u094d\u0938" on the kit's own badge, + the sparkle burst.
   The sheet ships the plate with "6" baked in; the text is lifted off it once
   (mk_badge_blank) so every count 1..9 this card uses can reuse the same art. */
/* Both overlays FLOAT inside .slide-stage rather than joining the slide's flex
   column. That column is `flex:1;min-height:0` all the way down, so anything
   added to it steals height from the scene art above - which pulled the table
   up into the prompt. Absolute + anchored leaves every module's layout alone. */
function mkFloatHost(){ return document.querySelector(".slide-stage"); }
function mkClearFloats(){
  const h = mkFloatHost(); if(!h) return;
  h.querySelectorAll(".mk-result, .mk-errflash").forEach(n => n.remove());
}
/* Park `el` NEXT TO `anchorEl` if the gutter beside it is wide enough, else
   under it. Docking beside is preferred because "under" lands on the आगे button
   on the narrow modules, and the plate must never cover the control the child
   needs next. Measured after paint, so the element must already be in the DOM. */
function mkFloatBeside(el, anchorEl, gutter){
  const h = mkFloatHost(); if(!h) return;
  const hb = h.getBoundingClientRect();
  const ab = (anchorEl && anchorEl.getBoundingClientRect) ? anchorEl.getBoundingClientRect() : null;
  const w  = el.offsetWidth || 300, hh = el.offsetHeight || 110;
  const PAD = (gutter === undefined) ? 18 : gutter;
  if(ab){
    const freeRight = hb.right - ab.right;
    if(freeRight >= w + PAD * 2){                       // dock to the right of the anchor
      el.style.left = (ab.right - hb.left + PAD + w / 2) + "px";
      el.style.top  = Math.max(8, Math.min(ab.top - hb.top + (ab.height - hh) / 2, hb.height - hh - 8)) + "px";
      return;
    }
  }
  el.style.left = "50%";                                // otherwise: centred, just below
  const top = ab ? (ab.bottom - hb.top + 12) : (hb.height * 0.6);
  el.style.top = Math.max(8, Math.min(top, hb.height - hh - 8)) + "px";
}
/* re-place once each sprite has decoded - an undecoded <img> measures 0 wide,
   which would put the plate in the wrong gutter on a cold cache */
function mkPlace(el, anchorEl){
  mkFloatBeside(el, anchorEl);
  const imgs = el.tagName === "IMG" ? [el] : [...el.querySelectorAll("img")];
  imgs.forEach(im => { if(!im.complete) im.addEventListener("load", ()=> mkFloatBeside(el, anchorEl), { once:true }); });
}
function mkShowResult(anchorEl, n){
  const host = mkFloatHost(); if(!host || host.querySelector(".mk-result")) return null;
  const wrap = document.createElement("div"); wrap.className = "mk-result";
  wrap.innerHTML =
    '<img class="mk-sparkle" src="' + mkSrc(MK.sparkle) + '" alt="" aria-hidden="true">' +
    '<div class="mk-badge"><img class="mk-badge-plate" src="' + mkSrc(MK.plate) + '" alt="" aria-hidden="true">' +
      '<span class="mk-badge-text">' + devNumeral(n) + ' \u092c\u094d\u0932\u0949\u0915\u094d\u0938</span></div>';
  host.appendChild(wrap);
  mkPlace(wrap, anchorEl);
  requestAnimationFrame(()=> wrap.classList.add("in"));
  return wrap;
}
/* Which wrong-way figure fits this mistake? Too few units => the child left a
   GAP; too many => they OVERLAPPED. Straight off the kit sheet, and exactly the
   +/-1 misconception this card's distractors are built from (see README). */
function mkErrFigure(made, target){
  return made < target ? MK.errGap : MK.errOver;
}
/* flash that figure beside the laid row (inline cue - no popup), once at a time */
function mkFlashErr(nearEl, figId){
  const host = mkFloatHost(); if(!host) return;
  const prev = host.querySelector(".mk-errflash"); if(prev) prev.remove();
  const f = document.createElement("img");
  f.className = "mk-errflash"; f.src = mkSrc(figId); f.alt = ""; f.setAttribute("aria-hidden","true");
  f.onerror = function(){ this.remove(); };
  host.appendChild(f);
  mkPlace(f, nearEl);
  requestAnimationFrame(()=> f.classList.add("in"));
  setTimeout(()=>{ f.classList.remove("in"); setTimeout(()=> f.remove(), 320); }, 2400);
}

/* shared SUCCESS response — the engine-wide answer-feedback standard (lead-confirmed): side confetti
   cannons + rising sfx + Swiftie celebrates + the authored "correct" VO, then AUTO-ADVANCE. Never a
   celebration popup, never a "press आगे to continue" gate on a solved activity. `revealed` = the child
   got there via the reveal scaffold → quieter settle (no confetti/cheer) + completeSlide(false) so
   mastery telemetry stays honest. */
function celebrateThenAdvance(slide, revealed){
  if(revealed){ play(audioFor(slide, "reveal") || null, ()=>{}); setTimeout(()=> completeSlide(false), 1400); return; }
  sfxCorrect(); confettiCannon(); setSwMood("celebrate");
  play(audioFor(slide, "correct") || null, ()=>{});
  setTimeout(()=> completeSlide(true), 1400);
}

/* ---------- 12. SLIDE MODULES ---------- */
const SlideModules = {
  INTRO: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "intro-stage";
      const letters = slide.data.letters;
      const tapped = new Set();
      const tiles = [];
      // [16f] Size tiles to the REAL container: the r4 tut-card frame is ~990px inside (the old
      // math assumed 1220 + a -100px breakout and punched 10-card strips through the frame borders
      // — user-caught live on MTKGA01_L02_S01 s00; same root as the HIKGH04_P2 letter row).
      // Fit one row at MAXW=960; if tiles would drop below the 110px touch floor, WRAP into two
      // balanced rows (numerals 0-9 → fives-structure 0-4 / 5-9) sized to the wider row.
      const GAP = 20, MAXW = 960, n = letters.length;
      let rowsOf;
      let tSize = Math.min(184, Math.floor((MAXW - (n-1)*GAP) / n));
      if (tSize >= 110) { rowsOf = [n]; }
      else {
        const top = Math.ceil(n/2), bot = n - top;
        tSize = Math.min(184, Math.floor((MAXW - (top-1)*GAP) / top));
        rowsOf = [top, bot];
      }
      const tFont = Math.round(tSize * 0.565);
      const rowEls = rowsOf.map(() => {
        const r = document.createElement("div"); r.className = "intro-letters";
        r.style.gap = GAP + "px"; return r;
      });
      const rowFor = i => (rowsOf.length === 1 || i < rowsOf[0]) ? rowEls[0] : rowEls[1];
      // hand-nudge points at the first letter not yet tapped — guides every box
      function nudgeNext(){
        for(let i=0;i<letters.length;i++){
          if(!tapped.has(letters[i])){ pointNudgeAt(tiles[i]); return; }
        }
        stopNudge();
      }
      letters.forEach((L, i) => {
        const tile = document.createElement("div"); tile.className = "intro-letter";
        tile.style.width = tile.style.height = tSize + "px";
        tile.style.fontSize = tFont + "px";
        tile.innerHTML = `<span class="ink-glyph">${L}</span>`;
        tile.onclick = ()=>{
          if(slide.data.auto) return;   // [16h] Phase-1 autonomous mode: the demo plays itself
          tile.classList.add("played");
          const phon = slide.data.phonemes && slide.data.phonemes[L];
          play(phon ? "assets/voiceover/" + phon + "." + AUDIO_EXT : null);
          GameBus.emit("intro_letter_tap", { slide_id: slide.id, letter: L });
          tapped.add(L);
          // नav unlocks only after EVERY letter has been heard
          if(tapped.size >= letters.length){ stopNudge(); setNavActive(true); }
          else { nudgeNext(); }
        };
        rowFor(i).appendChild(tile); tiles.push(tile);
      });
      rowEls.forEach(r => wrap.appendChild(r));
      host.appendChild(wrap);

      setNavActive(false);
      $("navBtn").onclick = ()=>{ if(tapped.size >= letters.length) completeSlide(true); };
      nudgeNext();
      // [16h] Phase-1 autonomous mode (lead's 3-phase contract): tiles highlight + speak one by
      // one BY THEMSELVES; the child watches/listens. आगे unlocks after the last one.
      if(slide.data.auto){
        stopNudge(); state.ownsAudio = true;
        let ai = 0;
        const aStep = ()=>{
          if(CARD.slides[state.idx] !== slide) return;
          if(ai >= letters.length){ stopNudge(); $("navBtn").onclick = ()=> completeSlide(true); setNavActive(true); return; }
          const L = letters[ai], tile = tiles[ai];
          tile.classList.add("played"); pointNudgeAt(tile);
          const phon = slide.data.phonemes && slide.data.phonemes[L];
          ai++;
          play(phon ? "assets/voiceover/" + phon + "." + AUDIO_EXT : null, ()=> setTimeout(aStep, 380));
        };
        play(audioFor(slide, "prompt") || null, ()=> setTimeout(aStep, 500));
      }   // start by guiding the first letter
    }
  },

  MEET_LETTER: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "meet-stage";
      if(slide.data.pair){
        const pair = document.createElement("div"); pair.className = "meet-pair";
        slide.data.pair.forEach(p => {
          const item = document.createElement("div"); item.className = "meet-pair-item";
          item.innerHTML = `
            <div class="meet-letter-box"><span class="glyph ink-glyph">${p.letter}</span></div>
            <div class="meet-arrow">→</div>
            <div class="meet-pic-box">
              ${imgOrEmoji(p.picture_img, p.picture_emoji, "pic-img", "pic-emoji")}
              <span class="pic-label">${p.word_hi}</span>
            </div>`;
          pair.appendChild(item);
        });
        wrap.appendChild(pair);
      } else {
        wrap.innerHTML = `
          <div class="meet-letter-box"><span class="glyph ink-glyph">${slide.data.letter}</span></div>
          <div class="meet-arrow">→</div>
          <div class="meet-pic-box">
            ${imgOrEmoji(slide.data.picture_img, slide.data.picture_emoji, "pic-img", "pic-emoji")}
            <span class="pic-label">${slide.data.word_hi}</span>
          </div>`;
      }
      host.appendChild(wrap);
      // नav unlocks only after the VO has played once (students can't skip the model)
      state.gateNavUntilAudio = true;
      setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  /* ===== SHAPES (maths) — reuse the same scaffold/nudge/feedback as letters ===== */
  SHAPE_INTRO: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "intro-stage";
      const row  = document.createElement("div"); row.className = "intro-shapes";
      const shapes = slide.data.shapes; const tapped = new Set(); const tiles = [];
      const GAP = 28, MAXW = 1220, n = shapes.length;
      const tSize = Math.max(120, Math.min(184, Math.floor((MAXW - (n-1)*GAP) / n)));
      row.style.gap = GAP + "px";
      function nudgeNext(){
        for(let i=0;i<shapes.length;i++){ if(!tapped.has(i)){ pointNudgeAt(tiles[i]); return; } }
        stopNudge();
      }
      shapes.forEach((sh, i) => {
        const tile = document.createElement("div"); tile.className = "intro-shape";
        tile.style.width = tile.style.height = tSize + "px";
        // name label (revealed on tap — child hears the name AND sees it on top of the shape)
        tile.innerHTML = `<span class="shape-name">${sh.name || ""}</span>` +
                         shapeSVG(sh.shape, {color: sh.color, size: Math.round(tSize*0.62), rotate: sh.rotate});
        tile.onclick = ()=>{
          tile.classList.add("played");
          play(sh.name_audio ? "assets/voiceover/" + sh.name_audio + "." + AUDIO_EXT : null);
          GameBus.emit("intro_shape_tap", { slide_id: slide.id, shape: sh.shape });
          tapped.add(i);
          if(tapped.size >= shapes.length){ stopNudge(); setNavActive(true); }
          else { nudgeNext(); }
        };
        row.appendChild(tile); tiles.push(tile);
      });
      wrap.appendChild(row); host.appendChild(wrap);
      setNavActive(false);
      $("navBtn").onclick = ()=>{ if(tapped.size >= shapes.length) completeSlide(true); };
      nudgeNext();
    }
  },

  MEET_SHAPE: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "meet-stage";
      wrap.innerHTML = `
        <div class="meet-shape-box">
          ${shapeSVG(slide.data.shape, {color: slide.data.color, size: 190, rotate: slide.data.rotate})}
          <span class="label">${slide.data.name}</span>
        </div>
        <div class="meet-arrow">→</div>
        <div class="meet-pic-box">
          ${imgOrEmoji(slide.data.object_img, slide.data.object_emoji, "pic-img", "pic-emoji")}
          <span class="pic-label">${slide.data.object_hi}</span>
        </div>`;
      host.appendChild(wrap);
      state.gateNavUntilAudio = true; setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  TAP_SHAPE_BY_NAME: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "shape_name_first_try",
        stimulus: (()=> {
          const el = document.createElement("div"); el.className = "stimulus-pic"; el.style.cursor = "pointer";
          el.innerHTML = `<span class="emoji">🔊</span><span class="lbl">${slide.data.name || "नाम सुनो"}</span>`;
          el.onclick = ()=>{ state.audioReplays++; play(audioFor(slide,"shape_name") || null); };
          return el;
        })(),
        options: slide.data.options,
        isCorrect: (opt) => opt.shape === slide.data.target,
        optionRenderer: (opt) => shapeCell(opt)
      });
    }
  },

  TAP_SHAPE_BY_PICTURE: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "shape_env_first_try",
        stimulus: stimulusPic(slide.data.object_hi, slide.data.object_emoji, slide.data.object_img),
        options: slide.data.options,
        isCorrect: (opt) => opt.shape === slide.data.target,
        optionRenderer: (opt) => shapeCell(opt)
      });
    }
  },

  TAP_PICTURE_BY_SHAPE: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "shape_object_first_try",
        stimulus: stimulusShape({shape: slide.data.shape, color: slide.data.color, rotate: slide.data.rotate}),
        options: slide.data.options,
        isCorrect: (opt) => opt.correct === true,
        optionRenderer: (opt) => pictureCell(opt.object_hi, opt.object_emoji, opt.object_img)
      });
    }
  },

  SORT_SHAPE: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "sort-stage shape-sort";
      const binsRow = document.createElement("div");
      binsRow.className = "sort-bins" + (slide.data.bins.length >= 4 ? " many" : "");
      slide.data.bins.forEach(b => {
        const bin = document.createElement("div");
        bin.className = "sort-bin dd-zone";            // dd-zone → drop detection
        bin.dataset.shape = b.shape;
        // header (faint reference shape + label) INSIDE the box, then a clear drop area
        bin.innerHTML = `<div class="bin-head-row"><span class="bin-ref">${shapeSVG(b.shape, {color:"#AEB9CC", size:34})}</span><span class="bin-title">${b.label}</span></div>`+
          `<div class="bin-items"></div>`;
        binsRow.appendChild(bin);
      });
      const tray = document.createElement("div"); tray.className = "sort-tray";
      const items = slide.data.items.slice().sort(()=> Math.random() - 0.5);
      items.forEach(it => {
        const t = document.createElement("div"); t.className = "sort-item"; t.dataset.shape = it.shape;
        t.innerHTML = shapeSVG(it.shape, {color: it.color, size: 70, rotate: it.rotate});
        tray.appendChild(t);
      });
      wrap.appendChild(binsRow); wrap.appendChild(tray);
      host.appendChild(wrap);

      state.attempts = 0; state.locked = false;
      let placed = 0; const need = slide.data.items.length;
      [...tray.children].forEach(tile => {
        makeDraggable(tile, (zone, t) => {
          const bin = zone.closest(".sort-bin"); if(!bin) return;
          state.attempts++;
          if(bin.dataset.shape === t.dataset.shape){
            t.classList.add("snapped");
            bin.querySelector(".bin-items").appendChild(t);
            placed++;
            GameBus.emit("shape_sort_item", { slide_id: slide.id, shape: t.dataset.shape, attempts: state.attempts });
            if(placed === need){
              state.locked = true;
              GameBus.emit("shape_sort_correct", {
                slide_id: slide.id, phase: slide.phase, value: true,
                attempts: state.attempts, latency_ms: Date.now() - state.slideStart
              });
              setTimeout(()=> celebrateThenAdvance(slide, false), 250);   // standard: confetti + VO + auto-advance, no popup
            }
          } else {
            bin.classList.add("hover"); bin.style.borderColor = "var(--wrong)";
            setTimeout(()=>{ bin.classList.remove("hover"); bin.style.borderColor = ""; }, 500);
            dragWrong(slide);   // buzz + Swiftie + spoken try_again (pre-readers need the spoken recovery)
            GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
          }
        });
      });
    }
  },

  /* ===== COUNTING (maths) — OTO tap-count, cardinality, meet-number, make-set ===== */
  COUNT_TAP: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "count-stage";
      const row  = document.createElement("div"); row.className = "count-row";
      const N = slide.data.count, obj = slide.data.object, nums = slide.data.numerals || [];
      // large sets (S04, up to 20): smaller tiles + optional rows-of-N grouping (curriculum: rows of 5/10)
      if(N > 10 || slide.data.per_row) row.classList.add("dense");
      if(slide.data.per_row){ row.style.display = "grid"; row.style.gridTemplateColumns = `repeat(${slide.data.per_row}, auto)`; }
      const items = []; let c = 0;
      for(let i=0;i<N;i++){
        const it = document.createElement("div"); it.className = "count-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="count-badge"></span>`;
        row.appendChild(it); items.push(it);
      }
      wrap.appendChild(row); host.appendChild(wrap);

      function nudgeNext(){ const nx = items.find(x=>!x.classList.contains("counted")); if(nx) pointNudgeAt(nx); else stopNudge(); }
      items.forEach(it => {
        it.onclick = ()=>{
          if(it.classList.contains("counted")) return;   // one-to-one: never double-count
          c++; it.classList.add("counted");
          it.querySelector(".count-badge").textContent = String(c);   // Arabic running count; Hindi word spoken separately
          GameBus.emit("count_tap", { slide_id: slide.id, phase: slide.phase, n: c });
          if(c >= N){
            stopNudge();
            GameBus.emit("count_oto_complete", { slide_id: slide.id, phase: slide.phase,
              total: N, value: true, latency_ms: Date.now()-state.slideStart });
            // say the LAST number, then the total; enable आगे ONLY after "कुल N" finishes
            play("assets/voiceover/vo_num_" + c + "." + AUDIO_EXT, ()=> setTimeout(()=>
              play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT, ()=> setNavActive(true)), 300));
          } else {
            play("assets/voiceover/vo_num_" + c + "." + AUDIO_EXT);    // one number word per touch
            nudgeNext();
          }
        };
      });
      setNavActive(false);
      $("navBtn").onclick = ()=>{ if(c >= N) completeSlide(true); };
      nudgeNext();
    }
  },

  CONSERVE_COUNT: {
    // MTKGA01_L01_S03 "the LAST counted number IS the total" + its core misconception ("the total
    // changes when objects move"). One slide, two beats: (A) the child tap-counts the set one-to-one
    // (badges + spoken एक/दो/…, ending "कुल N" — the freeze-the-final-number teach), then (B) the SAME
    // objects visibly MOVE to scattered spots (badges clear), the move line asks "अब कितनी हैं?" and
    // numeral options appear — correct is the SAME N; options include N±1 (the moved-so-changed error).
    // data:{count, object, numerals, options:[{value,audio}]} · audio:{prompt, move, try_again, hint, reveal}.
    // GENERALISED count-then-pick engine (S03 conservation + S02's tap-count items). One slide:
    // tap-count the set one-to-one (badges + spoken एक/दो/… → frozen "कुल N"), then numeral options.
    // data: {count, object, options, arrange?("row"|"scatter"|"circle"|"two_groups"), groups?[a,b],
    //        move?(default true = objects drift after counting; false = count-then-pick, no drift)}.
    // move:false emits cardinality_first_try; move:true emits conserve_count_first_try.
    mount(host, slide){
      const d = slide.data, N = d.count, obj = d.object;
      const arrange = d.arrange || "row";
      const doMove  = d.move !== false;
      state.ownsAudio = true; setNavActive(false);
      const wrap = document.createElement("div"); wrap.className = "count-stage conserve";
      const row  = document.createElement("div"); row.className = "count-row arr-" + arrange + (N > 8 ? " dense" : "");
      const items = []; let c = 0;
      const mkItem = ()=>{ const it = document.createElement("div"); it.className = "count-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="count-badge"></span>`;
        items.push(it); return it; };
      if(arrange === "two_groups"){
        const g = d.groups || [Math.ceil(N/2), Math.floor(N/2)];
        g.forEach((gn, gi)=>{ const cl = document.createElement("div"); cl.className = "count-cluster";
          for(let i=0;i<gn;i++) cl.appendChild(mkItem()); row.appendChild(cl);
          if(gi === 0){ const plus = document.createElement("div"); plus.className = "count-plus"; plus.textContent = "और"; row.appendChild(plus); } });
      } else if(arrange === "circle"){
        for(let i=0;i<N;i++){ const it = mkItem(); const a = -Math.PI/2 + i*2*Math.PI/N, R = N > 6 ? 176 : 140;
          it.style.position = "absolute";
          it.style.left = `calc(50% + ${Math.round(Math.cos(a)*R)}px)`;
          it.style.top  = `calc(50% + ${Math.round(Math.sin(a)*R)}px)`;
          it.style.marginLeft = "-48px"; it.style.marginTop = "-48px"; row.appendChild(it); }
      } else {
        for(let i=0;i<N;i++){ const it = mkItem();
          if(arrange === "scatter") it.style.transform = `translateY(${((i*23)%25)-12}px) rotate(${((i*37)%21)-10}deg)`;
          row.appendChild(it); }
      }
      wrap.appendChild(row); host.appendChild(wrap);
      const nudgeNext = ()=>{ const nx = items.find(x=>!x.classList.contains("counted")); if(nx) pointNudgeAt(nx); else stopNudge(); };
      const askOptions = ()=>{
        mountTapOptions({
          slide, host, signalName: doMove ? "conserve_count_first_try" : "cardinality_first_try",
          stimulus: null, nudgeTarget: null,
          options: d.options,
          columnsHint: Math.min(d.options.length, 5),
          isCorrect: (opt) => opt.value === N,
          optionRenderer: (opt) => slide.phase === "tutorial" ? numFingerCell(opt.value) : bigNumCell(opt.value),
          mastery: slide.phase === "mastery"
        });
      };
      const afterCount = ()=>{
        if(doMove){
          items.forEach((it,i)=>{ const keep = slide.phase === "tutorial" &&
              it.querySelector(".count-badge").textContent === String(N);
            if(!keep) it.querySelector(".count-badge").textContent = "";
            it.classList.add("moved");
            it.style.transform = `translate(${((i*53)%81)-40}px, ${((i*37)%61)-30}px) rotate(${((i*29)%25)-12}deg)`; });
          sfxTap();
          setTimeout(()=>{ play(audioFor(slide, "move") || null, ()=>{}); askOptions(); }, 950);
        } else {
          play(audioFor(slide, "ask") || null, ()=>{}); askOptions();
        }
      };
      items.forEach(it => {
        it.onclick = ()=>{
          if(it.classList.contains("counted") || it.classList.contains("moved")) return;   // one-to-one; inert once moved
          c++; it.classList.add("counted");
          it.querySelector(".count-badge").textContent = String(c);
          GameBus.emit("count_tap", { slide_id: slide.id, phase: slide.phase, n: c });
          if(c >= N){
            stopNudge();
            play("assets/voiceover/vo_num_" + c + "." + AUDIO_EXT, ()=> setTimeout(()=>
              play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT, ()=> setTimeout(afterCount, 450)), 300));
          } else {
            play("assets/voiceover/vo_num_" + c + "." + AUDIO_EXT);
            nudgeNext();
          }
        };
      });
      state.replayAudio = ()=> play(audioFor(slide, c >= N ? (doMove ? "move" : "ask") : "prompt") || null, ()=>{});
      play(audioFor(slide, "prompt") || null, ()=>{});
      nudgeNext();
    }
  },

  COUNT_ACTION: {
    // S02 themed tap-count: tap each object and it ENACTS to a target while counting — pop (balloon
    // vanishes), feed (flies to the monster's mouth), or basket (drops into the basket). After the last
    // one the frozen "कुल N" plays and numeral options appear. data:{count, object, options, theme
    // ("pop"|"feed"|"basket")}. audio:{prompt, ask, try_again, hint, reveal}.
    mount(host, slide){
      const d = slide.data, N = d.count, obj = d.object, theme = d.theme || "pop";
      state.ownsAudio = true; setNavActive(false);
      const wrap = document.createElement("div"); wrap.className = "count-stage act act-" + theme;
      let target = null;
      if(theme === "feed"){ target = document.createElement("div"); target.className = "act-target act-monster"; target.textContent = "👹"; wrap.appendChild(target); }
      if(theme === "basket"){ target = document.createElement("div"); target.className = "act-target act-basket";
        target.innerHTML = imgOrEmoji("obj_basket", "🧺", "act-basket-img", "act-basket-emoji"); wrap.appendChild(target); }
      const row = document.createElement("div"); row.className = "count-row act-row" + (N > 8 ? " dense" : "");
      const items = []; let c = 0;
      for(let i=0;i<N;i++){ const it = document.createElement("div"); it.className = "count-item act-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="count-badge"></span>`;
        row.appendChild(it); items.push(it); }
      wrap.appendChild(row); host.appendChild(wrap);
      const nudgeNext = ()=>{ const nx = items.find(x=>!x.classList.contains("done")); if(nx) pointNudgeAt(nx); else stopNudge(); };
      const askOptions = ()=>{ mountTapOptions({
        slide, host, signalName: "cardinality_first_try", stimulus: null, nudgeTarget: null,
        options: d.options, columnsHint: Math.min(d.options.length, 5),
        isCorrect: (opt) => opt.value === N,
        optionRenderer: (opt) => slide.phase === "tutorial" ? numFingerCell(opt.value) : bigNumCell(opt.value),
        mastery: slide.phase === "mastery" }); };
      items.forEach(it => {
        it.onclick = ()=>{
          if(it.classList.contains("done")) return;
          c++; it.classList.add("done", "act-go");   // act-go = fly/pop animation (theme-scoped CSS)
          it.querySelector(".count-badge").textContent = String(c);
          if(theme === "feed" && target) target.classList.add("chomp");
          sfxTap();
          GameBus.emit("count_tap", { slide_id: slide.id, phase: slide.phase, n: c });
          if(c >= N){
            stopNudge();
            play("assets/voiceover/vo_num_" + c + "." + AUDIO_EXT, ()=> setTimeout(()=>
              play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT, ()=> setTimeout(()=>{
                play(audioFor(slide, "ask") || null, ()=>{}); askOptions(); }, 450)), 300));
          } else { play("assets/voiceover/vo_num_" + c + "." + AUDIO_EXT); nudgeNext(); }
        };
      });
      state.replayAudio = ()=> play(audioFor(slide, c >= N ? "ask" : "prompt") || null, ()=>{});
      play(audioFor(slide, "prompt") || null, ()=>{});
      nudgeNext();
    }
  },

  COUNT_DRAG_MATCH: {
    // S02 drag items. mode "num_to_box": count the set, then DRAG the correct NUMBER CARD into the
    // answer box (#2, #9). mode "obj_to_num": count, then DRAG the object onto the correct NUMBER (#11).
    // data:{count, object, options:[{value}], mode}. audio:{prompt, ask, try_again, reveal}.
    mount(host, slide){
      const d = slide.data, N = d.count, obj = d.object, mode = d.mode || "num_to_box";
      state.ownsAudio = true; setNavActive(false);
      const wrap = document.createElement("div"); wrap.className = "count-stage dragmatch";
      const setRow = document.createElement("div"); setRow.className = "count-row show-set" + (N > 8 ? " dense" : "");
      const items = []; let c = 0;
      for(let i=0;i<N;i++){ const it = document.createElement("div"); it.className = "count-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="count-badge"></span>`;
        setRow.appendChild(it); items.push(it); }
      wrap.appendChild(setRow);
      const dz = document.createElement("div"); dz.className = "cdm-zone";   // built after counting
      const tray = document.createElement("div"); tray.className = "cdm-tray";
      wrap.appendChild(dz); wrap.appendChild(tray); host.appendChild(wrap);
      const nudgeNext = ()=>{ const nx = items.find(x=>!x.classList.contains("counted")); if(nx) pointNudgeAt(nx); else stopNudge(); };
      const settleWin = (revealed)=>{ state.locked = true;
        GameBus.emit("cardinality_first_try", { slide_id: slide.id, phase: slide.phase, value: !revealed, latency_ms: Date.now()-state.slideStart });
        celebrateThenAdvance(slide, revealed); };
      const buildDrag = ()=>{
        // shuffle the numeral options
        const opts = d.options.slice(); for(let i=opts.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [opts[i],opts[j]]=[opts[j],opts[i]]; }
        if(mode === "obj_to_num"){
          // number cards are the DROP ZONES; a single draggable object-chip is the tile
          dz.className = "cdm-numrow";
          opts.forEach(o=>{ const z = document.createElement("div"); z.className = "cdm-numzone dd-zone"; z.dataset.val = String(o.value);
            z.innerHTML = `<span class="bignum-glyph">${devNumeral(o.value)}</span>`; dz.appendChild(z); });
          const tile = document.createElement("div"); tile.className = "cdm-objtile";
          tile.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji"); tray.appendChild(tile);
          makeDraggable(tile, (zone)=>{ if(state.locked || !zone) return;
            if(parseInt(zone.dataset.val,10) === N){ zone.classList.add("filled","correct"); tile.classList.add("snapped"); settleWin(false); }
            else { zone.classList.add("wrong"); setTimeout(()=>zone.classList.remove("wrong"),500); dragWrong(slide);
              state.attempts=(state.attempts||0)+1; if(state.attempts>=(CARD.scaffold_rules.max_attempts||3)){ const zc=[...dz.children].find(z=>parseInt(z.dataset.val,10)===N); if(zc){zc.classList.add("filled","correct","reveal-glow"); tile.classList.add("snapped"); play(audioFor(slide,"reveal")||null,()=>{}); settleWin(true);} } }
          });
        } else {
          // one BOX is the drop zone; number cards are the draggable tiles
          dz.className = "cdm-box dd-zone"; dz.innerHTML = `<span class="cdm-box-q">?</span>`;
          opts.forEach(o=>{ const tile = document.createElement("div"); tile.className = "cdm-card"; tile.dataset.val = String(o.value);
            tile.innerHTML = `<span class="bignum-glyph">${devNumeral(o.value)}</span>`; tray.appendChild(tile);
            makeDraggable(tile, (zone)=>{ if(state.locked || zone !== dz) return;
              if(o.value === N){ dz.classList.add("filled","correct"); dz.innerHTML = `<span class="bignum-glyph">${devNumeral(N)}</span>`; tile.classList.add("snapped"); settleWin(false); }
              else { dz.classList.add("wrong"); setTimeout(()=>dz.classList.remove("wrong"),500); dragWrong(slide);
                state.attempts=(state.attempts||0)+1; if(state.attempts>=(CARD.scaffold_rules.max_attempts||3)){ dz.classList.add("filled","correct","reveal-glow"); dz.innerHTML=`<span class="bignum-glyph">${devNumeral(N)}</span>`; play(audioFor(slide,"reveal")||null,()=>{}); settleWin(true); } }
            });
          });
        }
        play(audioFor(slide, "ask") || null, ()=>{});
      };
      items.forEach(it => { it.onclick = ()=>{ if(it.classList.contains("counted")) return;
        c++; it.classList.add("counted"); it.querySelector(".count-badge").textContent = String(c);
        GameBus.emit("count_tap", { slide_id: slide.id, phase: slide.phase, n: c });
        if(c >= N){ stopNudge(); play("assets/voiceover/vo_num_"+c+"."+AUDIO_EXT, ()=> setTimeout(()=>
          play("assets/voiceover/vo_total_"+N+"."+AUDIO_EXT, ()=> setTimeout(buildDrag, 450)), 300)); }
        else { play("assets/voiceover/vo_num_"+c+"."+AUDIO_EXT); nudgeNext(); }
      }; });
      state.attempts = 0; state.locked = false;
      state.replayAudio = ()=> play(audioFor(slide, c >= N ? "ask" : "prompt") || null, ()=>{});
      play(audioFor(slide, "prompt") || null, ()=>{});
      nudgeNext();
    }
  },

  DEMO_COUNT: {
    // TUTORIAL TEACH, TAP-TO-COUNT ([QA 04] - was the [16h] autonomous count, which the FLN QA
    // checklist rejects: "tutorial intro is interactive, not auto-playing"). All N objects are
    // visible; after the prompt the hand points at the next one; each TAP counts it - a BIG running
    // count updates 1..N with vo_num_N; then the conclusion line plays and आगे unlocks.
    // NO options — never a test, and no wrong tap is possible (a tap always counts the next unit).
    // Zero (N=0): empty tray, straight to the conclusion. data:{count, object} audio:{prompt?, conclude}
    mount(host, slide){
      /* data.bare (review 2026-09-30, T1: "remove all the assets as shown in this screen"): NO counting art - no
         units, badges, running count or result plate; the prompt plays, then the conclusion, then आगे unlocks. */
      const d = slide.data, bare = !!d.bare, N = bare ? 0 : d.count, obj = d.object;
      state.ownsAudio = true; setNavActive(false); setSwMood("teach");
      const wrap = document.createElement("div"); wrap.className = "demo-stage";
      const counter = document.createElement("div"); counter.className = "demo-count";
      counter.textContent = N === 0 ? "0" : "";
      const row = document.createElement("div"); row.className = "count-row demo-row" + (N > 8 && !d.per_row ? " dense" : "");
      const measuring = mkIsMeasure(slide);
      if(measuring) row.classList.add("mk-rail");   // [kit] units laid flush - no gaps, which is the skill
      if(d.per_row){ row.classList.add("perrow"); row.style.gridTemplateColumns = `repeat(${d.per_row}, auto)`; }
      const items = [];
      for(let k = 0; k < N; k++){
        const it = document.createElement("div"); it.className = "count-item demo-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="count-badge"></span>`;
        row.appendChild(it); items.push(it);
      }
      if(N === 0){ row.classList.add("demo-empty"); }
      if(!bare){ wrap.appendChild(counter); wrap.appendChild(row); }
      host.appendChild(wrap);
      /* [QA 04] TUTORIAL INTRO IS INTERACTIVE, NOT AUTO-PLAYING. The count used to run by itself;
         now the CHILD taps each unit to hear it counted: after the prompt, the hand points (below)
         at the next unit, a tap counts it - "placed" face + glow, badge, big running numeral,
         vo_num_k - and the spoken numeral wears the white outline while its clip plays. Taps land
         in left-to-right order (any tap counts the NEXT unit, so the count is never out of order)
         and are ignored while a numeral is still being spoken. आगे unlocks only once every unit
         has been heard AND the conclusion line has played. */
      let i = 0, busy = true, finished = false;
      const tutPrompt = ()=> document.querySelector("#slideHost .tut-prompt");
      let concluded = false;                                         // (a replayed prompt must not conclude twice)
      const conclude = ()=>{ if(concluded) return; concluded = true; stopNudge();
        /* [kit] the measurement lands on the sheet's own result plate - the count
           the child just made, restated as "<n> ब्लॉक्स" with the sparkle. */
        if(measuring && N > 0) mkShowResult(row, N);
        play(audioFor(slide, "conclude") || null, ()=>{ finished = true; setNavActive(true); }); };
      const nudgeNext = ()=>{ if(i < N) pointNudgeAt(items[i]); else stopNudge(); };
      const countNext = ()=>{
        if(CARD.slides[state.idx] !== slide || busy || i >= N) return;
        busy = true; stopNudge();
        const it = items[i];
        it.classList.add("counted", "demo-hit");
        /* [kit] a counted unit settles into its "placed" face and flashes the glow */
        if(measuring){ mkSetBlockState(it, MK.placed); mkGlow(it); }
        it.querySelector(".count-badge").textContent = String(i + 1);
        counter.textContent = String(i + 1);
        counter.classList.remove("demo-pop"); void counter.offsetWidth; counter.classList.add("demo-pop");
        counter.classList.add("speaking");
        i++;
        play("assets/voiceover/vo_num_" + i + "." + AUDIO_EXT, ()=>{
          counter.classList.remove("speaking"); busy = false;
          if(i >= N) setTimeout(conclude, 400); else nudgeNext();
        });
      };
      items.forEach(it => { it.style.cursor = "pointer"; it.onclick = countNext; });
      const tp0 = tutPrompt(); if(tp0) tp0.classList.add("speaking");
      play(audioFor(slide, "prompt") || null, ()=>{
        const tp = tutPrompt(); if(tp) tp.classList.remove("speaking");
        busy = false;
        if(N === 0) setTimeout(conclude, 400); else nudgeNext();
      });
      /* replay = the prompt again (or the conclusion once done). While it plays the prompt wears the
         outline; the child's next tap is held until it ends, and the hand returns to the next unit. */
      state.replayAudio = ()=>{
        if(finished || (!bare && i >= N)){ play(audioFor(slide, "conclude") || null, ()=>{}); return; }
        busy = true; stopNudge();
        const tp = tutPrompt(); if(tp) tp.classList.add("speaking");
        play(audioFor(slide, "prompt") || null, ()=>{ if(tp) tp.classList.remove("speaking"); busy = false;
          if(bare) setTimeout(conclude, 400); else nudgeNext(); });   // a bare slide: the replayed prompt still leads on to the conclusion
      };
    }
  },

  MEASURE_DEMO: {
    /* MTG2A04 T2 - the SME deck's page 3, built to its script step by step (review 2026-09-30: "add things and
       animation as per the instruction completely"). Each step has its own VO line:
         heading VO ........................ the table and the block tray come in
         VO1 "...एक छोर से मापना शुरू करेंगे।" - a dashed line at the table's LEFT end appears and pulses;
             "फिर एक-एक ब्लॉक रखते हुए दूसरे छोर तक जाएंगे।" - the RIGHT end
         VO2 "चलिए, शुरू करते हैं" ............ Swiftee's hand drags blocks one by one from the tray: एक... दो...
         VO3 "अब ध्यान रखें! ...जहाँ पिछला खत्म हुआ था।" - the previous block's end pulses;
             "बीच में जगह न छोड़ें," ......... a block set down with a GAP, the gap boxed and pulsing, then taken back;
             "और एक-दूसरे के ऊपर न रखें।" ..... a block set down OVERLAPPING, the overlap boxed, then taken back
         child VO "अब आगे आप मापिए..." ...... a ghost drag, tray -> the next tile (the tile shows as the block moves)
         child: drags each next block - dropped on the next tile it snaps flush and is counted aloud (vo_num_k);
             dropped anywhere else it bounces back to the tray, then the ghost drag; idle 6s - the ghost drag
         done: "शाबाश! यह टेबल 6 ब्लॉक्स लंबी है।" + "6 ब्लॉक्स" under the measured row; आगे unlocks.
       As on the first screen, the units lie in their OWN row a little below the object, flush, and a dashed line
       carries each end of it down to them. The blocks are the first screen's plain blue cubes (one slice each of
       assets/cubes_blue_row.webp). data: { n, demo, table:{src, w, ar, x0, x1}, unit_hi } (x0/x1 = the tabletop's
       ends, fractions of the picture). audio: prompt, explain_a, explain_b, demo, rule_a, rule_b, rule_c, child,
       conclude (+ vo_num_k). CSS [T2 measure]. */
    mount(host, slide){
      const d = slide.data, N = d.n || 6, DEMO = Math.max(1, Math.min(d.demo || 2, N - 1));
      const reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
      state.ownsAudio = true; setNavActive(false); setSwMood("teach");
      const scene = document.createElement("div"); scene.className = "md-stage"; host.appendChild(scene);
      const card = host.closest(".tut-card"); if(card) card.classList.add("tc-measure");   // the scene sits right under the prompt (CSS)
      const alive = ()=> CARD.slides[state.idx] === slide && scene.isConnected;
      const STOP = {}, guard = ()=>{ if(!alive()) throw STOP; };
      const px = v => v.toFixed(1) + "px";
      /* ---- geometry (scene px = stage px) ---- */
      const W = scene.offsetWidth || 1053, cx = W / 2;
      const TW = d.table.w || 420, TH = TW * (d.table.ar || 212 / 460), TX = cx - TW / 2, TY = 0;
      const XL = TX + TW * (d.table.x0 != null ? d.table.x0 : 2 / 460), XR = TX + TW * (d.table.x1 != null ? d.table.x1 : 458 / 460);
      const BW = (XR - XL) / N, BH = BW, RY = TY + TH + 16;                  // the row: its own line, a little below the table
      const TC = 3, TG = 8, TP = 12, TRW = TC * BW + (TC - 1) * TG + 2 * TP, TRH = Math.ceil(N / TC) * (BH + TG) - TG + 2 * TP;
      const TRX = Math.min(W - TRW - 8, XR + 56), TRY = RY + BH - TRH + TP;   // the tray: right of the row, its floor on the row's line
      scene.style.height = px(RY + BH + 64);
      const add = (tag, cls, css)=>{ const e = document.createElement(tag); e.className = cls; if(css) e.style.cssText = css; scene.appendChild(e); return e; };
      const table = add("img", "md-table", "left:" + px(TX) + ";top:" + px(TY) + ";width:" + px(TW)); table.src = d.table.src; table.alt = "";
      add("div", "md-shadow", "left:" + px(TX + TW * .04) + ";top:" + px(TY + TH - 14) + ";width:" + px(TW * .92));
      add("div", "md-tray", "left:" + px(TRX) + ";top:" + px(TRY) + ";width:" + px(TRW) + ";height:" + px(TRH));
      const lineTop = TY + 12, lineH = RY + BH + 16 - lineTop;
      const lineL = add("div", "md-line", "left:" + px(XL - 4) + ";top:" + px(lineTop) + ";height:" + px(lineH));
      const lineR = add("div", "md-line", "left:" + px(XR - 4) + ";top:" + px(lineTop) + ";height:" + px(lineH));
      const slotXY = k => ({ x: XL + k * BW, y: RY });
      const slots = [];
      for(let k = 0; k < N; k++){ const p = slotXY(k); slots.push(add("div", "md-slot", "left:" + px(p.x) + ";top:" + px(p.y) + ";width:" + px(BW) + ";height:" + px(BH))); }
      const STRIP = { src: "assets/cubes_blue_row.webp", w: 2102, h: 214, top: 2, bot: 211, cuts: [3, 208, 416, 626, 839, 1049, 1260, 1472, 1683, 1893, 2099] };
      const trayXY = j => ({ x: TRX + TP + (j % TC) * (BW + TG), y: TRY + TP + Math.floor(j / TC) * (BH + TG) });
      const blocks = [];
      for(let j = 0; j < N; j++){
        const c0 = STRIP.cuts[j % 10], c1 = STRIP.cuts[j % 10 + 1], kx = BW / (c1 - c0), ky = BH / (STRIP.bot - STRIP.top), p = trayXY(j);
        const b = add("div", "md-block", "left:" + px(p.x) + ";top:" + px(p.y) + ";width:" + px(BW) + ";height:" + px(BH) + ";--i:" + j + ";" +
          "background-image:url(" + STRIP.src + ");background-size:" + px(STRIP.w * kx) + " " + px(STRIP.h * ky) + ";background-position:" + px(-c0 * kx) + " " + px(-STRIP.top * ky));
        b._home = p; b._placed = false; blocks.push(b);
      }
      const hand = add("img", "md-hand"); hand.src = "assets/nudge_hand_new.svg"; hand.alt = "";
      const TIPX = NH.TIP_X, TIPY = NH.TIP_Y;                                   // the engine's hand: fingertip inside its 86x108 box
      /* ---- motion helpers ---- */
      const wait = ms => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 80) : ms));
      const say = role => new Promise(r => { const s = audioFor(slide, role); if(!s) return r(); play(s, r); });
      const sayNum = n => new Promise(r => play("assets/voiceover/vo_num_" + n + "." + AUDIO_EXT, r));
      const knock = ()=> _tone([392, 311], "sine", 0.16, 0.1);                 // a soft wooden set-down
      const pos = e => ({ x: parseFloat(e.style.left), y: parseFloat(e.style.top) });
      const setPos = (e, p)=>{ e.style.left = px(p.x); e.style.top = px(p.y); };
      const grip = p => ({ x: p.x + BW * 0.52 - TIPX, y: p.y + BH * 0.56 - TIPY });   // the hand's box, fingertip pressing the block
      const handOn = p =>{ setPos(hand, grip(p)); hand.classList.add("on"); };
      const handOff = ()=>{ hand.classList.remove("on", "press"); };
      /* the move is animated on the `translate` property, NOT `transform`: a lifted block (scale 1.07) and the pressing hand
         (scale .9) carry a CSS `scale`, and CSS applies that scale to anything in `transform` - the block used to travel 107%
         of the way and the hand 90%, so the fingertip slid up to 84px off the block. `translate` is applied outside the scale. */
      const path = (dx, dy, up)=> [{ translate: "0px 0px" }, { translate: dx / 2 + "px " + (dy / 2 + up) + "px", offset: .5 }, { translate: dx + "px " + dy + "px" }];
      function glide(el, to, ms, arc, withHand){                             // along a gentle arc (the hand rides with it)
        return new Promise(res => {
          const from = pos(el), dx = to.x - from.x, dy = to.y - from.y, up = arc ? -Math.min(80, 26 + Math.hypot(dx, dy) * 0.16) : 0;
          let fin = false;
          const done = ()=>{ if(fin) return; fin = true; setPos(el, to); if(withHand) setPos(hand, grip(to)); res(); };
          if(reduce || ms <= 0){ done(); return; }
          const o = { duration: ms, easing: "cubic-bezier(.45,.05,.35,1)" };
          const a = el.animate(path(dx, dy, up), o);
          if(withHand) hand.animate(path(dx, dy, up), o);
          a.onfinish = done; a.oncancel = done;
        });
      }
      const land = el =>{ if(!reduce) el.animate([{ transform: "scale(1.07,.9)" }, { transform: "scale(.98,1.03)" }, { transform: "none" }], { duration: 220, easing: "ease-out" }); knock(); };
      async function handDrag(el, to){                                      // Swiftee's hand picks a block up and sets it down
        handOn(pos(el)); await wait(320); guard();
        hand.classList.add("press"); sfxTap(); el.classList.add("lift"); await wait(120);
        await glide(el, to, 900, true, true); guard();
        el.classList.remove("lift"); land(el); hand.classList.remove("press"); await wait(200); handOff();
      }
      /* ---- the ghost drag (the hint): a see-through block, tray -> the next tile, the tile showing as it moves ---- */
      let placed = 0, phase = "demo", ghostTok = 0, idleT = 0, drag = null;
      async function ghost(){
        const tok = ++ghostTok, src = blocks.find(b => !b._placed); if(!src || placed >= N) return;
        const g = src.cloneNode(false); g.classList.add("ghost"); g.classList.remove("lift"); scene.appendChild(g); setPos(g, pos(src));
        const slot = slots[placed];
        try{
          handOn(pos(g)); await wait(300); if(tok !== ghostTok) throw STOP;
          hand.classList.add("press"); slot.classList.add("show", "target");
          await glide(g, slotXY(placed), 1100, true, true); if(tok !== ghostTok) throw STOP;
          await wait(260);
        } catch(e){ if(e !== STOP) throw e; }
        g.remove(); if(tok === ghostTok){ handOff(); if(!drag) slot.classList.remove("show", "target"); }
      }
      const cancelGhost = ()=>{ ghostTok++; scene.querySelectorAll(".md-block.ghost").forEach(e => e.remove()); handOff(); hand.getAnimations().forEach(a => a.cancel()); };
      const armIdle = ()=>{ clearTimeout(idleT); idleT = setTimeout(()=>{ if(alive() && phase === "child" && !drag) ghost().then(()=>{ if(alive() && phase === "child") armIdle(); }); }, 6000); };
      /* ---- the child's drag ---- */
      const local = ev =>{ const r = scene.getBoundingClientRect(), s = r.width / (scene.offsetWidth || 1); return { x: (ev.clientX - r.left) / s, y: (ev.clientY - r.top) / s }; };
      blocks.forEach(b =>{
        b.addEventListener("pointerdown", ev =>{
          if(!alive() || phase !== "child" || b._placed || drag) return;
          ev.preventDefault(); clearTimeout(idleT); cancelGhost();
          const p = local(ev), bp = pos(b);
          drag = { b, id: ev.pointerId, ox: p.x - bp.x, oy: p.y - bp.y, sx: p.x, sy: p.y, moved: false };
          try{ b.setPointerCapture(ev.pointerId); }catch(e){}
          b.classList.add("lift"); sfxTap(); slots[placed].classList.add("show", "target");
        });
        b.addEventListener("pointermove", ev =>{
          if(!drag || drag.b !== b || ev.pointerId !== drag.id) return;
          const p = local(ev); if(Math.hypot(p.x - drag.sx, p.y - drag.sy) > 6) drag.moved = true;
          setPos(b, { x: p.x - drag.ox, y: p.y - drag.oy });
        });
        const drop = ev =>{
          if(!drag || drag.b !== b || ev.pointerId !== drag.id) return;
          const dr = drag; drag = null; b.classList.remove("lift");
          const at = pos(b), to = slotXY(placed), slot = slots[placed];
          const hit = dr.moved && Math.abs(at.x - to.x) <= BW * 0.6 && Math.abs(at.y - to.y) <= BH * 0.85;
          if(hit){                                                          // flush against the last one: counted aloud
            b._placed = true; b.classList.add("placed"); slot.classList.remove("show", "target");
            glide(b, to, reduce ? 0 : 120, false, false).then(()=> land(b));
            placed++;
            GameBus.emit("measure_unit_placed", { slide_id: slide.id, phase: slide.phase, count: placed, of: N });
            const n = placed;
            sayNum(n).then(()=>{ if(!alive()) return; if(n >= N) finish(); else armIdle(); });
          } else {                                                          // bounce back to the tray, then show how
            sfxWrongSoft(); slot.classList.remove("show", "target");
            GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: ++state.attempts });
            glide(b, b._home, reduce ? 0 : 420, true, false).then(()=>{ if(!alive()) return;
              if(!reduce) b.animate([{ transform: "translateY(-10px)" }, { transform: "translateY(0)" }, { transform: "translateY(-4px)" }, { transform: "none" }], { duration: 360, easing: "ease-out" });
              setTimeout(()=>{ if(alive() && phase === "child" && !drag) ghost().then(()=>{ if(alive() && phase === "child") armIdle(); }); }, 350); });
          }
        };
        b.addEventListener("pointerup", drop); b.addEventListener("pointercancel", drop);
      });
      /* ---- done: "6 ब्लॉक्स" under the measured row, the conclusion, आगे ---- */
      function finish(){
        phase = "done"; clearTimeout(idleT); cancelGhost();
        const trayEl = scene.querySelector(".md-tray"); if(trayEl) trayEl.classList.add("empty");   // every block is used: the tray bows out
        const res = add("div", "md-result", "left:" + px(XL - 40) + ";width:" + px(XR - XL + 80) + ";top:" + px(RY + BH + 12));
        res.textContent = devNumeral(N) + " " + (d.unit_hi || "ब्लॉक्स");
        requestAnimationFrame(()=> res.classList.add("in"));
        setSwMood("happy");
        play(audioFor(slide, "conclude") || null, ()=>{ if(alive()) setNavActive(true); });
      }
      state.replayAudio = ()=>{
        if(phase === "child"){ clearTimeout(idleT); say("child").then(()=>{ if(alive() && phase === "child") armIdle(); }); ghost(); }
        else if(phase === "done") play(audioFor(slide, "conclude") || null, ()=>{ if(alive()) setNavActive(true); });
      };
      /* ---- the script ---- */
      (async ()=>{
        try{
          const tp = document.querySelector("#slideHost .tut-prompt");
          requestAnimationFrame(()=> scene.classList.add("in"));             // the table + tray come in
          if(tp) tp.classList.add("speaking"); await say("prompt"); guard(); if(tp) tp.classList.remove("speaking");
          lineL.classList.add("show", "pulse"); await say("explain_a"); guard(); lineL.classList.remove("pulse");
          lineR.classList.add("show", "pulse"); await say("explain_b"); guard(); lineR.classList.remove("pulse");
          await say("demo"); guard();
          for(let k = 0; k < DEMO; k++){                                     // एक... दो...
            await handDrag(blocks[k], slotXY(k)); guard();
            blocks[k]._placed = true; blocks[k].classList.add("placed"); placed++;
            await sayNum(placed); guard();
          }
          // the rule: start where the last one ends ...
          const endAt = slotXY(DEMO).x, mark = add("div", "md-endmark", "left:" + px(endAt - 3) + ";top:" + px(RY - 10) + ";height:" + px(BH + 20));
          await say("rule_a"); guard(); mark.classList.add("out"); setTimeout(()=> mark.remove(), 400);
          // ... no gap between ...
          const g = blocks[DEMO], gp = slotXY(DEMO), GAP = BW * 0.45;
          const vGap = say("rule_b");
          await handDrag(g, { x: gp.x + GAP, y: gp.y }); guard();
          const gapBox = add("div", "md-box", "left:" + px(gp.x + 2) + ";top:" + px(RY - 8) + ";width:" + px(GAP - 4) + ";height:" + px(BH + 16));
          await vGap; guard(); await wait(1000); guard();
          gapBox.classList.add("out"); await handDrag(g, g._home); guard(); gapBox.remove();
          // ... and not on top of each other
          const vOver = say("rule_c");
          g.classList.add("over");
          await handDrag(g, { x: gp.x - GAP, y: gp.y }); guard();
          const ovBox = add("div", "md-box", "left:" + px(gp.x - GAP) + ";top:" + px(RY - 8) + ";width:" + px(GAP) + ";height:" + px(BH + 16));
          await vOver; guard(); await wait(1000); guard();
          ovBox.classList.add("out"); await handDrag(g, g._home); guard(); ovBox.remove(); g.classList.remove("over");
          // the child's turn: the ghost drag shows how while the VO asks
          phase = "child";
          const gh = ghost(); await say("child"); guard(); await gh; guard();
          armIdle();
        } catch(e){ if(e !== STOP) console.error("[MEASURE_DEMO]", e); }
      })();
    }
  },

  MEET_NUMBER: {
    mount(host, slide){
      if(slide.data && slide.data.present === "crane"){ return btCraneMeet(host, slide); }   // Block Town teach
      const wrap = document.createElement("div"); wrap.className = "meet-stage number-meet";
      const n = slide.data.count;
      // [16d] dual-code the numeral: hands for 1..5; for bigger numbers (teens) the Hindi number WORD.
      // Never the numeral twice — fingerCount's out-of-range fallback IS the numeral, which rendered
      // the "12 over 12" teach card the SME flagged on MTKGA01_L01_S04.
      const word = (slide.data.numerals || [])[n-1] || "";
      const second = (n>=1 && n<=5) ? fingerCount(n,'meet-hand') : (word ? `<span class="num-word">${word}</span>` : "");
      wrap.innerHTML = `
        <div class="meet-number-box"><span class="num-glyph">${n}</span>${second}</div>
        <div class="meet-arrow">→</div>`;
      // [16d] the teach set honors data.per_row (rows of 10 → a teen visibly reads as ten-and-ones)
      const setEl = stimulusCountSet(n, slide.data.object, false, slide.data.per_row);
      setEl.classList.add("meet-set");
      wrap.appendChild(setEl);
      host.appendChild(wrap);
      state.gateNavUntilAudio = true; setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  COUNT_HOW_MANY: {
    mount(host, slide){
      const setEl = stimulusCountSet(slide.data.count, slide.data.object, slide.data.scatter, slide.data.per_row);
      const measuring = mkIsMeasure(slide) && !slide.data.scatter;
      if(measuring) setEl.classList.add("mk-rail");   // [kit] a finished measurement = units laid flush
      mountTapOptions({
        slide, host, signalName: "cardinality_first_try",
        stimulus: setEl,
        /* [kit] the distractors here are +/-1 - i.e. exactly what a child gets by
           leaving a GAP (too few) or OVERLAPPING units (too many). A wrong tap
           names which of the two it was, using the sheet's own figure; a right
           tap lands on the result plate with the sparkle. */
        onWrong: measuring ? (opt)=>{ mkFlashErr(setEl, mkErrFigure(opt.value, slide.data.count)); } : undefined,
        onCorrect: measuring ? ()=>{ mkShowResult(setEl, slide.data.count); } : undefined,
        nudgeTarget: null,   // nothing to re-tap here → no idle hand
        options: slide.data.options,
        columnsHint: Math.min(slide.data.options.length, 5),
        isCorrect: (opt) => opt.value === slide.data.count,
        // SME (S01 review deck): finger-hands are a TUTORIAL teaching aid only — in guided/
        // independent/practice/mastery the options are the NUMBER ALONE, larger.
        optionRenderer: (opt) => slide.phase === "tutorial" ? numFingerCell(opt.value) : bigNumCell(opt.value),
        mastery: slide.phase === "mastery",
        // HINT = count the set FOR the child (highlight + say एक/दो/तीन + numeral on top)
        hintAction: (done) => demoCountSet(setEl, slide.data.count, slide.data.numerals, done)
      });
    }
  },

  PICK_SET_BY_NUMBER: {
    // SME-designed REVERSE how-many (S01 review deck, new pages): a big NUMBER is the stimulus;
    // the options are small OBJECT SETS — tap the set with that many. Speak-on-tap = each set's own
    // count line ("इसमें तीन चीज़ें हैं।"), which doubles as the SME's wrong-tap hint; the ladder then
    // runs try_again → hint → reveal-glow as everywhere. data:{target, options:[{count, object:{img,emoji},
    // audio, correct}]}.
    mount(host, slide){
      const d = slide.data;
      const stim = document.createElement("div"); stim.className = "psn-stimulus";
      stim.innerHTML = `<span class="psn-num">${devNumeral(d.target)}</span>`;
      mountTapOptions({
        slide, host, signalName: "pick_set_first_try",
        stimulus: stim,
        nudgeTarget: null,
        options: d.options,
        columnsHint: Math.min(d.options.length, 3),
        isCorrect: (opt) => opt.correct === true,
        optionRenderer: (opt) => {
          const c = document.createElement("div"); c.className = "psn-cell";
          let inner = "";
          for(let i=0;i<opt.count;i++) inner += `<span class="psn-obj">${imgOrEmoji(opt.object.img, opt.object.emoji, "psn-img", "psn-emoji")}</span>`;
          c.innerHTML = `<div class="psn-set">${inner}</div>`;
          return c;
        },
        mastery: slide.phase === "mastery"
      });
    }
  },

  MAKE_SET: {
    mount(host, slide){
      const N = slide.data.target, obj = slide.data.object;
      const wrap = document.createElement("div"); wrap.className = "makeset-stage";
      wrap.innerHTML = `
        <div class="makeset-target"><span class="ms-label">डालो</span><span class="num-glyph">${devNumeral(slide.data.target)}</span>${imgOrEmoji(obj.img, obj.emoji, "ms-goal-obj", "ms-goal-emoji")}</div>
        <div class="makeset-frame" id="msFrame"></div>
        <button class="makeset-add" id="msAdd"><span class="ms-add-plus">＋</span>${imgOrEmoji(obj.img, obj.emoji, "ms-add-obj", "ms-add-emoji")}</button>`;
      host.appendChild(wrap);
      const frame = wrap.querySelector("#msFrame"), addBtn = wrap.querySelector("#msAdd");
      const numerals = slide.data.numerals || [];
      const measuring = mkIsMeasure(slide);
      if(measuring) frame.classList.add("mk-rail");   // [kit] lay the units flush against each other
      /* [kit] GHOST SLOT - the sheet's dashed block, parked after the last laid
         unit, so "where does the next one go?" is answered before the child taps.
         It is the anti-gap cue: the slot always sits hard against the last block. */
      /* NB deliberately NOT .ms-item - the reveal/hint paths count and trim
         .ms-item, and a counted ghost would corrupt the child's total. */
      const ghost = document.createElement("div"); ghost.className = "mk-ghostslot";
      ghost.innerHTML = '<img class="cobj-img" src="' + mkSrc(MK.ghost) + '" alt="" aria-hidden="true">';
      const syncGhost = ()=>{
        if(!measuring) return;
        /* hide it once the row already measures N - a "next slot" cue at the
           finished length would invite one unit too many. */
        const done = state.locked || state.hintActive || c >= N;
        if(done || c >= MAXITEMS){ ghost.remove(); return; }
        frame.appendChild(ghost);                       // always last in the rail
      };
      /* Deck pages 5 and 7 ask for पलंग = 8 blocks and फ्रिज = 6, but this was
         capped at 5 - both targets were literally unreachable, so the slide could
         never be completed. Raised to 9, the top of the card's own number_set. */
      const MAXITEMS = 9;
      let c = 0; state.attempts = 0; state.locked = false; state.hintActive = false;
      /* [QA 05] आगे = SUBMIT, live once at least one unit is laid. It used to light ONLY at exactly N,
         which made every wrong-answer branch below unreachable - no re-listen, no hint, no reveal. */
      const refreshNav = ()=>{ setNavActive(!state.locked && !state.hintActive && c > 0); syncGhost(); };  // आगे activates ONLY at exactly N — no premature/wrong submit; child self-corrects by adding more / removing (×). Nudge on the add-button guides an idle child.
      function makeItem(){
        const it = document.createElement("div"); it.className = "ms-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="ms-del" aria-label="हटाओ">×</span>`;
        const remove = (e)=>{ if(e) e.stopPropagation(); if(state.locked || state.hintActive) return; it.remove(); c--; refreshNav(); };
        // remove ONLY via the explicit × badge — tapping the object itself must NOT delete it
        // (the count tutorial teaches "tap the object to count it"; a placed apple that vanishes on tap
        //  would silently destroy the child's work)
        it.querySelector(".ms-del").onclick = remove;
        frame.insertBefore(it, ghost.parentNode === frame ? ghost : null);   // [kit] keep the ghost slot trailing
        if(measuring){ mkSetBlockState(it, MK.placed); mkGlow(it); }         // [kit] it lands "placed", with the glow
        return it;
      }
      addBtn.onclick = ()=>{
        if(state.locked || state.hintActive) return;
        if(c >= MAXITEMS){ addBtn.classList.add("shake"); setTimeout(()=> addBtn.classList.remove("shake"), 420);
          /* [kit] laying more units than fit IS the overlap error - name it with the
             sheet's figure instead of only buzzing the button. */
          if(measuring) mkFlashErr(frame, MK.errOver);
          return; }  // cap at MAXITEMS
        c++; makeItem();
        play("assets/voiceover/vo_num_" + c + "." + AUDIO_EXT);   // count up as you add
        GameBus.emit("make_set_add", { slide_id: slide.id, count: c });
        refreshNav();
      };
      // HINT = count what the child actually placed (highlight + say the number)
      const runHint = (after)=>{
        state.hintActive = true; refreshNav();
        /* [kit] before re-counting for the child, SHOW what went wrong: too few
           units means a gap was left, too many means they overlap. */
        if(measuring && c !== N) mkFlashErr(frame, mkErrFigure(c, N));
        demoCount([...frame.querySelectorAll(".ms-item")], numerals, ()=>{ state.hintActive = false; refreshNav(); if(after) after(); });
      };
      $("hintBtn").onclick = ()=>{ if(state.locked || state.hintActive) return;
        GameBus.emit("hint_shown", { slide_id: slide.id, manual: true }); runHint(); };
      // आगे = SUBMIT. correct → celebrate & advance. wrong → graduated scaffold, same as
      // everywhere: 1st = try again, 2nd = count-demo hint, 3rd = REVEAL (auto-fix to N,
      // count 1..N automatically, then move to the next slide).
      $("navBtn").onclick = ()=>{
        if(state.locked || state.hintActive || c === 0) return;
        if(c === N){
          state.locked = true; refreshNav();
          try{ XAPI.send("question_answered", { slide_id: slide.id, type: slide.type, phase: slide.phase },
               { is_correct:true, attempt: state.attempts + 1, score: state.attempts === 0 ? 1 : 0, response: c }); }catch(e){}
          recordResult(slide, state.attempts === 0);
          sfxCorrect(); setSwMood("happy");
          GameBus.emit("make_set_correct", { slide_id: slide.id, phase: slide.phase,
            value: true, target: N, attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          syncGhost();
          // [kit] the measurement, restated on the result plate. Anchored on the goal
          // chip, not the frame: the frame spans the card, leaving no side gutter.
          if(measuring) mkShowResult(wrap.querySelector(".makeset-target") || frame, N);
          play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT, ()=>
            celebrateThenAdvance(slide, false));   // standard: confetti + VO + auto-advance, no popup
          return;
        }
        state.attempts++;
        try{ XAPI.send("question_answered", { slide_id: slide.id, type: slide.type, phase: slide.phase },
             { is_correct:false, attempt: state.attempts, score: 0, response: c }); }catch(e){}
        sfxWrongSoft(); setSwMood("tryagain");
        frame.classList.remove("shake"); void frame.offsetWidth; frame.classList.add("shake");
        setTimeout(()=> frame.classList.remove("shake"), 450);
        GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts, made: c, target: N });
        const maxA = (CARD.scaffold_rules && CARD.scaffold_rules.max_attempts) || 3;
        $("hintBtn").classList.add("show","hint-glow");
        if(state.attempts >= maxA){
          // 3rd wrong → reveal: correct the set to exactly N, count it 1..N, then advance
          state.locked = true; state.scaffoldLevel = 3; refreshNav();
          /* NB last-of-type, not :last-child - the kit parks a ghost slot after the
             last real unit, so :last-child would match nothing and throw. */
          for(let ex = frame.querySelectorAll(".ms-item"); ex.length > N; ex = frame.querySelectorAll(".ms-item")) ex[ex.length-1].remove();
          while(frame.querySelectorAll(".ms-item").length < N) makeItem();
          c = N;
          recordResult(slide, false);
          GameBus.emit("answer_revealed", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
          state.hintActive = true;
          // count the (now-correct) set 1..N, then say the total "कुल N", then advance
          demoCount([...frame.querySelectorAll(".ms-item")], numerals, ()=>{
            state.hintActive = false;
            play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT, ()=> setTimeout(()=> completeSlide(false), 500));
          });
        } else if(state.attempts === 2){
          state.scaffoldLevel = Math.max(state.scaffoldLevel, 2);
          GameBus.emit("hint_shown", { slide_id: slide.id, manual: false });
          runHint();                                                   // 2nd wrong → count what they made
        } else {
          // 1st wrong → RE-LISTEN: the try-again line, then the question itself again
          state.scaffoldLevel = Math.max(state.scaffoldLevel, 1);
          showBox("", audioText(slide,"try_again") || "फिर से कोशिश करो।", "wrong", audioFor(slide,"try_again"),
            ()=>{ if(!state.locked && !state.hintActive) play(audioFor(slide, "prompt") || null, ()=>{}); });
        }
      };
      setNavActive(false);
      if(slide.phase !== "practice") pointNudgeAt(addBtn);   // [QA 06] practice = the child alone, no hand by default
    }
  },

  COMPARE_SETS: {
    // Two visible groups, TWO picture options — the child taps the object that has MORE (or LESS).
    // No बराबर chip (lead review): equality is taught in MEET_COMPARE + produced on the see-saw, so
    // a judge question always has one clear answer between the two objects. Tap-to-answer: a wrong
    // tap buzzes + crosses + locks that card; the right one confetti-cheers + advances.
    mount(host, slide){
      const d = slide.data;
      const stage = stimulusCompareSets(d);
      // JUDGE (test): hide the "मिलाओ" reveal button — its one-to-one reveal + leftover glow gives the
      // answer away (and on a "less" question it glows the MORE set, pointing at the WRONG option).
      // The two rows stay visible so the child still compares by eye. (Reveal stays only on MEET_COMPARE.)
      const mb = stage.querySelector(".cmp-match-btn"); if(mb) mb.style.display = "none";
      const answer = (d.ask === "less") ? (d.a_count < d.b_count ? "a" : "b")
                                        : (d.a_count > d.b_count ? "a" : "b");
      const options = [ {kind:"a", obj:d.a_object}, {kind:"b", obj:d.b_object} ];
      // (option shuffle is now centralized in mountTapOptions — no per-module reverse needed)
      mountTapOptions({
        slide, host, signalName: "compare_first_try",
        stimulus: stage,
        nudgeTarget: null,
        options,
        columnsHint: 2,
        isCorrect: (opt)=> opt.kind === answer,
        optionRenderer: (opt)=>{
          const cell = document.createElement("div");
          cell.innerHTML = imgOrEmoji(opt.obj.img, opt.obj.emoji, "pic-img", "cmp-chip-emoji")
            + `<span class="cmp-chip-lbl">${opt.obj.word_hi || ""}</span>`;
          return cell;
        },
        mastery: slide.phase === "mastery"
      });
    }
  },

  MEET_COMPARE: {
    // TEACH BY DOING (lead review): the child COUNTS each group by tapping its objects one-by-one
    // (running numeral + spoken एक/दो/तीन), the top group then the bottom. Then the one-to-one
    // match reveals, the leftover glows, and Swiftie EXPLAINS the outcome by name — e.g.
    // "एक सेब बच गया, सेब ज़्यादा हैं, केले कम" / "कुछ नहीं बचा, दोनों बराबर". आगे appears after.
    mount(host, slide){
      const d = slide.data;
      const wrap = document.createElement("div"); wrap.className = "meet-compare";
      const stage = stimulusCompareSets({a_object:d.a_object, a_count:d.a_count,
                                          b_object:d.b_object, b_count:d.b_count, show_matches:false});
      const mb = stage.querySelector(".cmp-match-btn"); if(mb) mb.style.display = "none";
      const verdict = document.createElement("div");
      verdict.className = "cmp-verdict " + (d.outcome || "more");
      verdict.textContent = d.label_hi || "";
      wrap.appendChild(stage); wrap.appendChild(verdict);
      host.appendChild(wrap);

      state.gateNavUntilAudio = false; state.locked = false; state.ownsAudio = true; setNavActive(false);
      $("navBtn").onclick = ()=>{ if(state.locked) completeSlide(true); };

      // 🔊 replay: re-hear the teach line (and, once revealed, the explanation). autoPlayChain skips
      // count_intro/explain, so without this the header chip would be silent on teach slides.
      let revealed = false;
      state.replayAudio = ()=>{ const chain = [audioFor(slide, "count_intro")];
        if(revealed) chain.push(audioFor(slide, "explain"));
        playChain(chain.filter(Boolean), 0); };

      const rowA = [...stage.querySelectorAll(".cmp-row.top .cobj")];
      const rowB = [...stage.querySelectorAll(".cmp-row.bot .cobj")];

      // make one row countable-by-tapping; cb fires once every item in it is counted
      function countRow(items, cb){
        const nudgeNext = ()=>{ const nx = items.find(o=>!o.classList.contains("counted"));
          if(nx) pointNudgeAt(nx); else stopNudge(); };
        let n = 0;
        items.forEach(o=>{
          o.classList.add("tappable");
          o.onclick = ()=>{
            if(state.locked || o.classList.contains("counted")) return;
            o.classList.add("counted", "counting"); n++; sfxTap();
            let cal = o.querySelector(".count-callout");
            if(!cal){ cal = document.createElement("span"); cal.className = "count-callout"; o.appendChild(cal); }
            cal.textContent = n;
            play("assets/voiceover/vo_num_" + n + "." + AUDIO_EXT, ()=>{});
            if(items.every(x=>x.classList.contains("counted"))){ stopNudge(); setTimeout(cb, 550); }
            else nudgeNext();
          };
        });
        nudgeNext();
        // [16h] Phase-1 autonomous mode (lead's 3-phase contract): the demo hand counts the row
        // BY ITSELF — drives the same handlers a child would, so behavior is identical.
        if(slide.data.auto){
          items.forEach(o=> o.classList.remove("tappable"));
          let ai = 0;
          (function autoTap(){
            if(CARD.slides[state.idx] !== slide || ai >= items.length) return;
            const o = items[ai++]; pointNudgeAt(o); if(o.onclick) o.onclick();
            setTimeout(autoTap, 950);
          })();
        }
      }

      // intro VO → count group A → count group B → reveal match + explain the outcome.
      // NB: uses non-autochain role names (count_intro / explain) so mountSlide's autoPlayChain
      // does NOT also fire the intro — this module owns its own audio sequence.
      play(audioFor(slide, "count_intro") || null, ()=>{
        countRow(rowA, ()=> countRow(rowB, ()=>{
          stage._revealMatches(()=>{
            verdict.classList.add("show"); setSwMood("point");
            state.locked = true; revealed = true; setNavActive(true);
            play(audioFor(slide, "explain") || null, ()=>{});
          });
        }));
      });
    }
  },

  MAKE_EQUAL: {
    // PRODUCE mechanic (see-saw): the left pan holds a fixed group; the child taps + जोड़ो to
    // add to the right pan (tap an added item to take it back). The beam tilts toward the heavier
    // side in real time; at equal it levels, locks, celebrates. Overshoot is enacted (invite to
    // remove), never a red ✗ — the KG "produce, don't pick" model.
    mount(host, slide){
      const d = slide.data, L = d.a_count, fixedObj = d.a_object, addObj = d.b_object;
      const MAXR = d.max || Math.max(L + 2, 6);
      const wrap = document.createElement("div"); wrap.className = "balance-stage";
      wrap.innerHTML = `
        <div class="balance">
          <div class="beam-wrap" id="beamWrap"><div class="beam"></div>
            <div class="pan pan-left"><div class="pan-grid" id="panL"></div></div>
            <div class="pan pan-right"><div class="pan-grid" id="panR"></div></div></div>
          <div class="fulcrum"></div>
        </div>
        <button class="balance-add" id="balAdd" type="button"></button>`;
      host.appendChild(wrap);
      const panL = wrap.querySelector("#panL"), panR = wrap.querySelector("#panR");
      const beam = wrap.querySelector("#beamWrap"), addBtn = wrap.querySelector("#balAdd");
      const balance = wrap.querySelector(".balance");
      addBtn.innerHTML = imgOrEmoji(addObj.img, addObj.emoji, "cobj-img", "cobj-emoji") + `<span>+ जोड़ो</span>`;
      for(let i=0;i<L;i++){ const c=document.createElement("span"); c.className="cobj";
        c.innerHTML = imgOrEmoji(fixedObj.img, fixedObj.emoji, "cobj-img", "cobj-emoji"); panL.appendChild(c); }
      let right = 0; state.locked = false; state.attempts = 0; let tipT = 0;
      const TILT = 6, TMAX = 15;
      const tilt = ()=>{ const diff = right - L; const deg = Math.max(-TMAX, Math.min(TMAX, diff*TILT));
        beam.style.transform = `translateX(-50%) rotate(${deg}deg)`; balance.classList.toggle("level", diff===0 && right>0); };
      const check = ()=>{ if(state.locked) return; const diff = right - L;
        if(diff===0 && right>0){ state.locked = true; setNavActive(true);
          GameBus.emit("make_equal_correct", { slide_id: slide.id, phase: slide.phase, value: true,
            count: right, target: L, attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          showBox("⚖️", audioText(slide,"balanced") || "बराबर! दोनों बराबर हैं।", "correct", audioFor(slide,"balanced") || null, ()=>{});
        } else if(diff > 0){ state.attempts++;
          GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, made: right, target: L });
          if(Date.now()-tipT > 1200){ tipT = Date.now();
            showBox("", audioText(slide,"too_many") || "बहुत ज़्यादा! एक हटाओ।", "hint", audioFor(slide,"too_many"), ()=>{}); } }
      };
      const addItem = ()=>{ const c=document.createElement("span"); c.className="cobj added";
        c.innerHTML = imgOrEmoji(addObj.img, addObj.emoji, "cobj-img", "cobj-emoji");
        c.onclick = ()=>{ if(state.locked) return; c.remove(); right = Math.max(0, right-1); tilt(); check(); };
        panR.appendChild(c); right++; };
      addBtn.onclick = ()=>{ if(state.locked) return;
        if(right >= MAXR){ addBtn.classList.add("shake"); setTimeout(()=> addBtn.classList.remove("shake"), 400); return; }
        addItem(); tilt(); sfxTap();
        // count EVERY added item aloud INCLUDING the final/target one (एक, दो, तीन) — then, on the
        // last count, the "बराबर" VO follows (check runs in the count's onEnd so the number isn't cut).
        if(right <= L) play("assets/voiceover/vo_num_" + right + "." + AUDIO_EXT, right === L ? ()=> check() : ()=>{});
        else check();   // overshoot → "एक हटाओ" hint
      };
      setNavActive(false);
      $("navBtn").onclick = ()=>{ if(state.locked) completeSlide(true); };
      tilt();                 // START tilted toward the heavier (left) group — the see-saw is NOT level yet
      pointNudgeAt(addBtn);
    }
  },

  MEET_PATTERN: {
    // TEACH: show a repeating pattern and pulse the repeating UNIT (first data.unit_len cells) a few
    // times so the child sees "this part comes again". Nav gated on the VO, like MEET_NUMBER.
    mount(host, slide){
      const d = slide.data;
      const wrap = document.createElement("div"); wrap.className = "pattern-stage";
      const lbl = document.createElement("div"); lbl.className = "pat-unit-lbl"; lbl.textContent = "यह हिस्सा दोहराता है 🔁";
      const row = document.createElement("div"); row.className = "pattern-row";
      d.items.forEach(o=>{ const c = document.createElement("div"); c.className = "pat-cell";
        c.innerHTML = imgOrEmoji(o.img, o.emoji, "cobj-img", "cobj-emoji"); row.appendChild(c); });
      wrap.appendChild(lbl); wrap.appendChild(row); host.appendChild(wrap);
      state.gateNavUntilAudio = true; setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
      const cells = [...row.children]; let rep = 0;
      const glow = ()=>{ cells.forEach((c,i)=> { if(i < d.unit_len) c.classList.add("unit-glow"); });
        setTimeout(()=> cells.forEach(c=> c.classList.remove("unit-glow")), 1100); };
      glow(); const t = setInterval(()=>{ if(rep++ >= 2){ clearInterval(t); return; } glow(); }, 1700);
    }
  },

  PATTERN_BUILD: {
    // PRODUCE: a pattern with empty ghost slot(s) — at the END (extend) or in the MIDDLE (fill the
    // gap). Tap a tray item to drop it into the active slot; the correct item = data.items[slot].
    // Wrong taps bounce (enacted, no ✗). Fill every blank → complete. data:{items[],blanks[],tray[]}.
    mount(host, slide){
      const d = slide.data;
      const wrap = document.createElement("div"); wrap.className = "pattern-stage";
      const row = document.createElement("div"); row.className = "pattern-row";
      const cells = d.items.map((o,i)=>{
        const c = document.createElement("div");
        if(d.blanks.includes(i)){ c.className = "pat-ghost"; c.innerHTML = `<span class="qmark">?</span>`; }
        else { c.className = "pat-cell"; c.innerHTML = imgOrEmoji(o.img, o.emoji, "cobj-img", "cobj-emoji"); }
        row.appendChild(c); return c;
      });
      const tray = document.createElement("div"); tray.className = "pattern-tray";
      d.tray.forEach(o=>{ const t = document.createElement("div"); t.className = "pat-tray-item"; t._obj = o;
        t.innerHTML = imgOrEmoji(o.img, o.emoji, "cobj-img", "cobj-emoji"); tray.appendChild(t); });
      wrap.appendChild(row); wrap.appendChild(tray); host.appendChild(wrap);
      const blanks = d.blanks.slice(); let bi = 0, wrongStreak = 0, revealedAny = false;
      state.locked = false; state.attempts = 0;
      const key = (o)=> o.img || o.emoji;
      const activeGhost = ()=> cells[blanks[bi]];
      const markActive = ()=>{ cells.forEach(c=> c.classList.remove("active"));
        // idle nudge points at the ACTIVE BLANK ('?' slot = "put one here"), re-armed per blank —
        // NEVER at a tray answer; startNudge is phase-aware so it's silent in practice/mastery.
        if(bi < blanks.length){ activeGhost().classList.add("active"); startNudge(slide, activeGhost()); } else stopNudge(); };
      const flashHint = ()=>{ const want = d.items[blanks[bi]], g = activeGhost(); const prev = g.innerHTML;
        g.innerHTML = imgOrEmoji(want.img, want.emoji, "cobj-img", "cobj-emoji"); g.style.opacity = ".4";
        setTimeout(()=>{ if(g.classList.contains("pat-ghost")){ g.innerHTML = prev; g.style.opacity = ""; } }, 950); };
      const placeCorrect = ()=>{                      // one placement path (tap AND reveal)
        const want = d.items[blanks[bi]], g = activeGhost();
        g.className = "pat-cell"; g.innerHTML = imgOrEmoji(want.img, want.emoji, "cobj-img", "cobj-emoji");
        g.classList.add("unit-glow"); setTimeout(()=> g.classList.remove("unit-glow"), 700); bi++;
        if(bi >= blanks.length){
          state.locked = true; stopNudge();
          GameBus.emit("pattern_extend_correct", { slide_id: slide.id, phase: slide.phase, value: !revealedAny,
            attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          // engine standard: confetti + cheer + correct VO + AUTO-advance — no popup, no आगे gate.
          celebrateThenAdvance(slide, revealedAny);
        } else markActive();
      };
      markActive();
      tray.querySelectorAll(".pat-tray-item").forEach(t=>{
        t.onclick = ()=>{
          if(state.locked || bi >= blanks.length) return;
          stopNudge();
          const want = d.items[blanks[bi]];
          if(key(t._obj) === key(want)){
            wrongStreak = 0;
            placeCorrect();
          } else {
            state.attempts++;
            t.classList.add("shake"); setTimeout(()=> t.classList.remove("shake"), 420);
            activeGhost().classList.add("shake"); setTimeout(()=> activeGhost().classList.remove("shake"), 420);
            GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
            $("hintBtn").classList.add("show","hint-glow");
            // layered ladder, standard-aligned: L1 spoken try-again (buzz + Swiftie, no popup) →
            // L2 flash the answer ghost + spoken hint → L3 reveal ceiling: DEMONSTRATE the placement.
            if(++wrongStreak >= (CARD.scaffold_rules.max_attempts||3)){
              revealedAny = true; wrongStreak = 0;
              activeGhost().classList.add("reveal-glow");
              play(audioFor(slide,"reveal") || audioFor(slide,"hint") || null, ()=>{});
              setTimeout(()=>{ placeCorrect(); }, 1000);
            }
            else if(state.attempts >= 2){ flashHint(); play(audioFor(slide,"hint") || null, ()=>{}); }
            else dragWrong(slide);
          }
        };
      });
      setNavActive(false);
      $("navBtn").onclick = ()=>{};   // completion is automatic now — आगे never gates a solved pattern
      $("hintBtn").onclick = ()=>{ if(!state.locked && bi < blanks.length) flashHint(); };
      // NB: the idle nudge is armed by markActive() → startNudge(activeGhost) above — it points at the
      // BLANK, phase-aware. (Bug fix: was pointNudgeAt(first tray tile) = an immediate hand on the WRONG
      // answer on most slides, and it showed even in mastery.)
    }
  },

  /* ===== NUMBER-SEQUENCE PATH (MTKGA01_L02_S04 — "completes a number sequence within 20") =====
     Three additive modules that share the .seq-* number-path skin. Numerals are crisp text glyphs
     (Baloo), only the tile chrome is rounded — content-true geometry (never round the number). */

  MEET_SEQUENCE: {
    // TEACH BY DOING: a number path; a token sits on the first cell. The child taps the glowing NEXT
    // cell to hop the token forward, each number spoken (vo_num_N) with an ascending thunk — so the
    // child ENACTS "numbers move forward one step at a time" (curriculum teach spec). Nav gates until
    // the token reaches the end, then Swiftie's explain line plays. data:{path:[n…], token?}.
    mount(host, slide){
      const d = slide.data, nums = d.path;
      state.ownsAudio = true; setNavActive(false); setSwMood("teach");
      const stage = document.createElement("div"); stage.className = "seq-stage";
      const path  = document.createElement("div"); path.className = "seq-path";
      const cw = nums.length > 7 ? 74 : 90;
      const cells = nums.map((n,i)=>{
        if(i){ const con = document.createElement("div"); con.className = "seq-connector"; path.appendChild(con); }
        const cell = document.createElement("div"); cell.className = "seq-cell";
        cell.style.width = cell.style.height = cw+"px"; cell.style.fontSize = Math.round(cw*0.56)+"px";
        cell.textContent = n; path.appendChild(cell); return cell;
      });
      stage.appendChild(path); host.appendChild(stage);
      const token = document.createElement("span"); token.className = "seq-token"; token.textContent = d.token || "🐤";
      let pos = 0;
      const place = ()=>{ cells.forEach((c,i)=> c.classList.toggle("lit", i <= pos));
        if(!cells[pos].contains(token)) cells[pos].appendChild(token); };
      const glowNext = ()=>{ cells.forEach((c,i)=> c.classList.toggle("active", i === pos+1));
        if(pos+1 < cells.length) startNudge(slide, cells[pos+1]); else stopNudge(); };
      place(); btThunk(1); play("assets/voiceover/vo_num_" + nums[0] + "." + AUDIO_EXT, ()=>{}); glowNext();
      const advance = ()=>{
        if(pos >= cells.length-1) return;
        pos++; cells[pos].classList.remove("active"); place(); btThunk(pos+1);
        play("assets/voiceover/vo_num_" + nums[pos] + "." + AUDIO_EXT, ()=>{});
        if(pos >= cells.length-1){ stopNudge();
          GameBus.emit("meet_sequence_done", { slide_id: slide.id, phase: slide.phase });
          setTimeout(()=> play(audioFor(slide, "explain") || null, ()=> setNavActive(true)), 500);
        } else glowNext();
      };
      cells.forEach((c,i)=>{ c.onclick = ()=>{ if(i === pos+1) advance(); }; });
      // 🔊 replay re-speaks the current number (module owns its audio; autoPlayChain is skipped)
      state.replayAudio = ()=> play("assets/voiceover/vo_num_" + nums[pos] + "." + AUDIO_EXT, ()=>{});
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  SEQUENCE_COMPLETE: {
    // PRODUCE test: a number path with blank(s); tap a tray numeral into the active blank. Correct =
    // path[blankIdx]. Wrong = shake + soft buzz + spoken try_again; reveal (demonstrate) after
    // max_attempts. Fills left→right. data:{path:[n… , with the blank positions still holding the true
    // number], blanks:[idx…], tray:[n…] (numerals incl. misconception distractors)}.
    mount(host, slide){
      const d = slide.data;
      const stage = document.createElement("div"); stage.className = "seq-stage";
      const path  = document.createElement("div"); path.className = "seq-path";
      const cw = d.path.length > 7 ? 74 : 90;
      const cells = d.path.map((n,i)=>{
        if(i){ const con = document.createElement("div"); con.className = "seq-connector"; path.appendChild(con); }
        const cell = document.createElement("div");
        cell.style.width = cell.style.height = cw+"px"; cell.style.fontSize = Math.round(cw*0.56)+"px";
        if(d.blanks.includes(i)){ cell.className = "seq-cell seq-ghost"; cell.innerHTML = '<span class="seq-q">?</span>'; }
        else { cell.className = "seq-cell filled"; cell.textContent = n; }
        path.appendChild(cell); return cell;
      });
      const tray = document.createElement("div"); tray.className = "seq-tray";
      d.tray.forEach(n=>{ const t = document.createElement("div"); t.className = "seq-tile"; t._num = n; t.textContent = n; tray.appendChild(t); });
      stage.appendChild(path); stage.appendChild(tray); host.appendChild(stage);

      const blanks = d.blanks.slice(); let bi = 0, wrongStreak = 0, revealedAny = false;
      state.locked = false; state.attempts = 0;
      const activeGhost = ()=> cells[blanks[bi]];
      const markActive = ()=>{ cells.forEach(c=> c.classList.remove("active"));
        if(bi < blanks.length){ activeGhost().classList.add("active"); startNudge(slide, activeGhost()); } else stopNudge(); };
      const placeCorrect = ()=>{
        const want = d.path[blanks[bi]], g = activeGhost();
        g.className = "seq-cell filled unit-glow"; g.textContent = want; setTimeout(()=> g.classList.remove("unit-glow"), 700);
        const tile = [...tray.children].find(x=> x._num === want && !x.classList.contains("used")); if(tile) tile.classList.add("used");
        bi++;
        if(bi >= blanks.length){
          state.locked = true; stopNudge();
          GameBus.emit("sequence_complete_correct", { slide_id: slide.id, phase: slide.phase, value: !revealedAny,
            attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          celebrateThenAdvance(slide, revealedAny);
        } else markActive();
      };
      markActive();
      tray.querySelectorAll(".seq-tile").forEach(t=>{
        t.onclick = ()=>{
          if(state.locked || bi >= blanks.length || t.classList.contains("used")) return;
          stopNudge();
          if(t._num === d.path[blanks[bi]]){ wrongStreak = 0; placeCorrect(); }
          else {
            state.attempts++;
            t.classList.add("shake"); setTimeout(()=> t.classList.remove("shake"), 420);
            activeGhost().classList.add("shake"); setTimeout(()=> activeGhost().classList.remove("shake"), 420);
            GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
            $("hintBtn").classList.add("show","hint-glow");
            if(++wrongStreak >= (CARD.scaffold_rules.max_attempts || 3)){
              revealedAny = true; wrongStreak = 0;
              activeGhost().classList.add("reveal-glow");
              play(audioFor(slide, "reveal") || audioFor(slide, "hint") || null, ()=>{});
              setTimeout(()=> placeCorrect(), 1000);
            } else dragWrong(slide);
          }
        };
      });
      setNavActive(false); $("navBtn").onclick = ()=>{};   // completion is automatic — never gate a solved path
      $("hintBtn").onclick = ()=>{ if(!state.locked && bi < blanks.length){ const g = activeGhost();
        g.classList.add("reveal-glow"); setTimeout(()=> g.classList.remove("reveal-glow"), 800); } };
    }
  },

  SEQUENCE_NEXT: {
    // PICK test (what comes next / before): a number path with ONE '?' cell (null in data.path) is the
    // stimulus; the child taps the correct numeral option. Reuses mountTapOptions → full tap-to-answer
    // contract (wrong=buzz+✗+lock+try_again, right=confetti+advance) + speak-the-number-on-tap +
    // mastery scoring. data:{path:[n…,null,…], options:[{num, audio:"vo_num_N", correct}]}.
    mount(host, slide){
      const d = slide.data;
      const stim = document.createElement("div"); stim.className = "seq-stage";
      const path = document.createElement("div"); path.className = "seq-path";
      const cw = d.path.length > 7 ? 74 : 90;
      d.path.forEach((n,i)=>{
        if(i){ const con = document.createElement("div"); con.className = "seq-connector"; path.appendChild(con); }
        const cell = document.createElement("div");
        cell.style.width = cell.style.height = cw+"px"; cell.style.fontSize = Math.round(cw*0.56)+"px";
        if(n === null){ cell.className = "seq-cell seq-ghost active"; cell.innerHTML = '<span class="seq-q">?</span>'; }
        else { cell.className = "seq-cell filled"; cell.textContent = n; }
        path.appendChild(cell);
      });
      stim.appendChild(path);
      mountTapOptions({
        slide, host, signalName: "sequence_next_correct", stimulus: stim,
        options: d.options,
        optionRenderer: (o)=>{ const cell = document.createElement("div"); const s = document.createElement("span");
          s.className = "seq-optnum"; s.textContent = o.num; cell.appendChild(s); return cell; },
        isCorrect: (o)=> o.correct === true,
        mastery: slide.phase === "mastery",
        columnsHint: d.options.length,
        nudgeTarget: null
      });
    }
  },

  /* ===== ORDERING / SERIATION (MTKGA02_L02_S02 — "orders three objects by size, length, or weight") =====
     Additive modules sharing the .ord-* skin. Objects render at true magnitude (size scale / bar length);
     weight is assessed by 'pick the heaviest' (weight is not visual) — targeting the bigger=heavier
     misconception with a big-but-light distractor. */

  MEET_ORDER: {
    // TEACH BY DOING: the 3 objects are shown already in order (small→big / short→long / light→heavy);
    // the child taps each left→right to hear its rank name (सबसे छोटा / बीच का / सबसे बड़ा etc.), then an
    // explain line plays and नav unlocks. data:{by, items:[{mag,img/emoji/color}] (ascending), rank_audio:[id…],
    // arrow_lo, arrow_hi, hint_icon?}.
    mount(host, slide){
      const d = slide.data; state.ownsAudio = true; setNavActive(false); setSwMood("teach");
      const stage = document.createElement("div"); stage.className = "ord-stage ord-" + d.by;
      const arrow = document.createElement("div"); arrow.className = "ord-arrow";
      arrow.innerHTML = `<span>${d.arrow_lo||""}</span><span class="ord-arrowline"></span><span>${d.arrow_hi||""}</span>`;
      const row = document.createElement("div"); row.className = "ord-tray";
      const cells = d.items.map((o,i)=>{ const el = document.createElement("div"); el.className = "ord-item";
        el.style.opacity = ".5"; el.innerHTML = renderOrdObj(o, d.by); row.appendChild(el); return el; });
      if(d.hint_icon){ const hi = document.createElement("div"); hi.className = "ord-hint-icon"; hi.textContent = d.hint_icon; stage.appendChild(hi); }
      stage.appendChild(arrow); stage.appendChild(row); host.appendChild(stage);
      let tapped = 0;
      const nudgeNext = ()=>{ cells.forEach((c,i)=> c.classList.toggle("active", i === tapped));
        if(tapped < cells.length) startNudge(slide, cells[tapped]); else stopNudge(); };
      nudgeNext();
      cells.forEach((c,i)=>{ c.onclick = ()=>{ if(i !== tapped) return; stopNudge();
        c.classList.remove("active"); c.style.opacity = "1"; c.classList.add("reveal-glow");
        setTimeout(()=> c.classList.remove("reveal-glow"), 600);
        play("assets/voiceover/" + (d.rank_audio[i]) + "." + AUDIO_EXT, ()=>{}); tapped++;
        if(tapped >= cells.length){ stopNudge();
          GameBus.emit("meet_order_done", { slide_id: slide.id, phase: slide.phase });
          setTimeout(()=> play(audioFor(slide, "explain") || null, ()=> setNavActive(true)), 450);
        } else nudgeNext();
      }; });
      state.replayAudio = ()=> play(audioFor(slide, "explain") || null, ()=>{});
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  ORDER_BY_ATTR: {
    // PRODUCE test: 3 scrambled objects + a left→right strip (arrow छोटा→बड़ा). Tap the smallest-remaining
    // → it fills the next slot. Wrong (not the current smallest) = shake + soft buzz + spoken try_again;
    // demonstrate after max_attempts. data:{by, items:[{mag,img/emoji/color}], arrow_lo, arrow_hi}.
    mount(host, slide){
      const d = slide.data;
      const stage = document.createElement("div"); stage.className = "ord-stage ord-" + d.by;
      const arrow = document.createElement("div"); arrow.className = "ord-arrow";
      arrow.innerHTML = `<span>${d.arrow_lo||""}</span><span class="ord-arrowline"></span><span>${d.arrow_hi||""}</span>`;
      const strip = document.createElement("div"); strip.className = "ord-strip";
      const n = d.items.length; const slots = [];
      for(let i=0;i<n;i++){ const sl = document.createElement("div"); sl.className = "ord-slot"; strip.appendChild(sl); slots.push(sl); }
      const tray = document.createElement("div"); tray.className = "ord-tray";
      const disp = d.items.slice(); for(let i=disp.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [disp[i],disp[j]]=[disp[j],disp[i]]; }
      const sortedMags = d.items.map(o=>o.mag).slice().sort((a,b)=>a-b);
      const tiles = disp.map(o=>{ const el = document.createElement("div"); el.className = "ord-item"; el._mag = o.mag;
        el.innerHTML = renderOrdObj(o, d.by); tray.appendChild(el); return el; });
      stage.appendChild(arrow); stage.appendChild(strip); stage.appendChild(tray); host.appendChild(stage);
      let placed = 0, wrongStreak = 0, revealed = false; state.locked = false; state.attempts = 0;
      const wantMag = ()=> sortedMags[placed];
      const nextTile = ()=> tiles.find(x=> !x.classList.contains("used") && x._mag === wantMag());
      const markActive = ()=>{ slots.forEach((s,i)=> s.classList.toggle("active", i === placed));
        if(placed < n) startNudge(slide, nextTile()); else stopNudge(); };
      const placeInto = (tile)=>{ const slot = slots[placed]; slot.classList.remove("active"); slot.classList.add("filled");
        slot.innerHTML = tile.innerHTML; tile.classList.add("used"); placed++;
        if(placed >= n){ state.locked = true; stopNudge();
          GameBus.emit("order_by_attr_correct", { slide_id: slide.id, phase: slide.phase, value: !revealed,
            attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          celebrateThenAdvance(slide, revealed);
        } else markActive();
      };
      markActive();
      tiles.forEach(t=>{ t.onclick = ()=>{ if(state.locked || t.classList.contains("used")) return; stopNudge();
        if(t._mag === wantMag()){ wrongStreak = 0; placeInto(t); }
        else { state.attempts++; t.classList.add("shake"); setTimeout(()=> t.classList.remove("shake"), 420);
          GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
          $("hintBtn").classList.add("show","hint-glow");
          if(++wrongStreak >= (CARD.scaffold_rules.max_attempts || 3)){ revealed = true; wrongStreak = 0;
            const c = nextTile(); if(c){ c.classList.add("reveal-glow"); play(audioFor(slide,"reveal")||null, ()=>{});
              setTimeout(()=>{ c.classList.remove("reveal-glow"); placeInto(c); }, 1000); }
          } else dragWrong(slide);
        }
      }; });
      setNavActive(false); $("navBtn").onclick = ()=>{};
      $("hintBtn").onclick = ()=>{ if(!state.locked){ const t = nextTile(); if(t){ t.classList.add("reveal-glow"); setTimeout(()=> t.classList.remove("reveal-glow"), 800); } } };
    }
  },

  PICK_EXTREME: {
    // PICK test: tap the object that is the MOST (सबसे बड़ा / सबसे लंबा / सबसे भारी). For weight, options
    // include a big-but-light distractor to break the bigger=heavier misconception. Reuses mountTapOptions
    // → tap-to-answer + speak-the-word-on-tap + mastery. data:{by, options:[{img/emoji/color,mag,label,audio,correct}]}.
    // PICTURE OPTIONS (MTG2A04 T1 "कौन-सी टेबल ज़्यादा लंबी है?", review 2026-09-30): an option may carry its own
    // asset path + display width, {src, w} - the picture keeps its own aspect instead of the square magnitude box,
    // with a light glint across it; data.look names a CSS look for the row ("tables": no tile, the pictures stand
    // on one floor line, CSS [T1 tables]); data.wrong_cue:"show_correct" = the deck's "Incorrect: pulsate / hand
    // nudge on the right one" - on a wrong tap the right picture pulses and the hand points at it (the spoken
    // line is the slide's try_again audio, via the usual scaffold).
    mount(host, slide){
      const d = slide.data;
      mountTapOptions({
        slide, host, signalName: "pick_extreme_correct", stimulus: null,
        options: d.options,
        optionRenderer: (o)=>{ const cell = document.createElement("div"); cell.className = "ord-pick";
          if(o.correct === true) cell.dataset.right = "1";
          const pic = o.src
            ? `<span class="pk-pic"><span class="pk-in"><img class="pk-img" src="${o.src}" alt="" style="width:${o.w || 240}px">` +
              `<span class="pk-shine" style="-webkit-mask-image:url(${o.src});mask-image:url(${o.src})"></span></span></span>`
            : renderOrdObj(o, d.by);
          cell.innerHTML = pic + (o.label ? `<span class="lbl">${o.label}</span>` : ""); return cell; },
        isCorrect: (o)=> o.correct === true,
        mastery: slide.phase === "mastery",
        columnsHint: d.options.length,
        nudgeTarget: null,
        onWrong: d.wrong_cue === "show_correct" ? (opt, cell)=>{
          const right = host.querySelector('.opt-cell[data-right="1"]'); if(!right || right === cell) return;
          right.classList.remove("pk-pulse"); void right.offsetWidth; right.classList.add("pk-pulse");   // restart the pulse
          clearTimeout(right._pkT); right._pkT = setTimeout(()=> right.classList.remove("pk-pulse"), 2600);
          setTimeout(()=>{ if(!state.locked && right.isConnected) placeNudge(right); }, 450);             // ...and the hand points at it
        } : undefined,
        reask: d.wrong_cue === "show_correct" ? false : undefined   // deck: "Incorrect: ... play VO: <that line>" - no re-ask after it
      });
      if(d.look){ const g = host.querySelector(".opt-grid"); if(g) g.classList.add("pk-" + d.look);
        const card = host.closest(".tut-card"); if(card) card.classList.add("tc-" + d.look); }   // the card's own look (CSS [T1 tables]: the floor)
    }
  },

  ORDER_BY_WEIGHT: {
    // PRODUCE test — WEIGHT seriation via A-vs-B COMPARISON (weight is not visual). Two pans: tap a tray
    // object → it loads the next empty pan; with BOTH loaded the beam tilts toward the heavier (it DROPS)
    // + thunk, and the lighter one RISES + pulses. Tap the lighter (risen) object to send it to the next
    // हल्का→भारी slot — accepted only if it is the lightest still unplaced; else it is the lighter of a
    // heavy pair (an even lighter one exists) → soft buzz + try_again, both return. The last object
    // auto-places (it is forced). Objects render at sizes that DON'T match weight (a big balloon can be
    // light) so the SCALE is the only cue. data:{items:[{wmag,dmag,img,emoji}], arrow_lo, arrow_hi}.
    mount(host, slide){
      const d = slide.data;
      const stage = document.createElement("div"); stage.className = "ord-stage ord-weight";
      const arrow = document.createElement("div"); arrow.className = "ord-arrow";
      arrow.innerHTML = `<span>${d.arrow_lo||"हल्का"}</span><span class="ord-arrowline"></span><span>${d.arrow_hi||"भारी"}</span>`;
      const scale = document.createElement("div"); scale.className = "owt-scale";
      scale.innerHTML = `<div class="owt-foot"></div><div class="owt-post"></div>` +
        `<div class="owt-beamwrap"><div class="owt-beam"></div><div class="owt-cap"></div>` +
        `<div class="owt-arm l"></div><div class="owt-arm r"></div>` +
        `<div class="owt-pan l"><div class="owt-load"></div></div><div class="owt-pan r"><div class="owt-load"></div></div></div>`;
      const beamwrap = scale.querySelector(".owt-beamwrap");
      const panEl = { l: scale.querySelector(".owt-pan.l"), r: scale.querySelector(".owt-pan.r") };
      const loadEl = { l: panEl.l.querySelector(".owt-load"), r: panEl.r.querySelector(".owt-load") };
      const strip = document.createElement("div"); strip.className = "ord-strip";
      const n = d.items.length; const slots = [];
      for(let i=0;i<n;i++){ const sl = document.createElement("div"); sl.className = "ord-slot"; strip.appendChild(sl); slots.push(sl); }
      const tray = document.createElement("div"); tray.className = "ord-tray";
      const disp = d.items.slice(); for(let i=disp.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [disp[i],disp[j]]=[disp[j],disp[i]]; }
      const sortedW = d.items.map(o=>o.wmag).slice().sort((a,b)=>a-b);
      const tiles = disp.map(o=>{ const el = document.createElement("div"); el.className = "ord-item"; el._o = o; el._w = o.wmag; el._onpan = false;
        el.innerHTML = renderOrdObj({ mag: o.dmag, img: o.img, emoji: o.emoji }, "size"); tray.appendChild(el); return el; });
      stage.appendChild(arrow); stage.appendChild(scale); stage.appendChild(strip); stage.appendChild(tray);
      host.appendChild(stage);

      let placed = 0, wrongStreak = 0, revealed = false, busy = false; state.locked = false; state.attempts = 0;
      const pans = { l: null, r: null };
      const wantW = ()=> sortedW[placed];
      const nextTile = ()=> tiles.find(x=> !x.classList.contains("used") && x._w === wantW());
      const remaining = ()=> tiles.filter(x=> !x.classList.contains("used"));
      const markActive = ()=>{ slots.forEach((s,i)=> s.classList.toggle("active", i === placed));
        if(placed < n && !pans.l && !pans.r){ const t = nextTile(); if(t && !t._onpan) startNudge(slide, t); } else stopNudge(); };
      const resetPans = ()=>{ ["l","r"].forEach(k=>{ const t = pans[k]; if(t){ t._onpan = false; t.style.visibility = ""; }
        loadEl[k].innerHTML = ""; loadEl[k].classList.remove("lighter"); pans[k] = null; }); beamwrap.style.transform = "rotate(0deg)"; };
      const loadPan = (k, t)=>{ pans[k] = t; t._onpan = true; t.style.visibility = "hidden"; loadEl[k].innerHTML = imgOrEmojiSized(t._o.img, t._o.emoji, 56); };
      const compare = ()=>{ beamwrap.style.transform = `rotate(${(pans.r._w - pans.l._w) * 7}deg)`;   // heavier side drops
        btThunk(Math.max(pans.l._w, pans.r._w)); const lightK = pans.l._w < pans.r._w ? "l" : "r";
        loadEl[lightK].classList.add("lighter"); loadEl[lightK === "l" ? "r" : "l"].classList.remove("lighter"); };
      const placeToSlot = (t, cb)=>{ const slot = slots[placed]; slot.classList.remove("active"); slot.classList.add("filled");
        slot.innerHTML = renderOrdObj({ mag: t._o.dmag, img: t._o.img, emoji: t._o.emoji }, "size"); t.classList.add("used"); t._onpan = false; placed++;
        if(placed >= n){ state.locked = true; stopNudge();
          GameBus.emit("order_by_weight_correct", { slide_id: slide.id, phase: slide.phase, value: !revealed,
            attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          celebrateThenAdvance(slide, revealed);
        } else markActive();
        if(cb) cb();
      };
      // when only one object remains it is forced — weigh it alone briefly, then place it.
      const autoLast = ()=>{ if(state.locked) return; const rem = remaining(); if(rem.length !== 1){ markActive(); return; }
        busy = true; const t = rem[0]; loadPan("l", t); beamwrap.style.transform = "rotate(-9deg)"; btThunk(t._w);
        setTimeout(()=>{ loadEl.l.innerHTML = ""; beamwrap.style.transform = "rotate(0deg)"; placeToSlot(t, ()=>{ busy = false; }); }, 850); };
      // tray tap → load the next empty pan (compare once both are full)
      tiles.forEach(t=>{ t.onclick = ()=>{ if(state.locked || busy || t.classList.contains("used") || t._onpan) return; stopNudge();
        if(!pans.l){ loadPan("l", t); }
        else if(!pans.r){ loadPan("r", t); compare(); }
      }; });
      // pan tap → try to place that pan's object (must be the LIGHTER of the two AND the lightest unplaced)
      ["l","r"].forEach(k=>{ panEl[k].onclick = ()=>{ if(state.locked || busy || !pans.l || !pans.r) return;
        const t = pans[k], other = pans[k === "l" ? "r" : "l"];
        if(t._w > other._w){ const lk = pans.l._w < pans.r._w ? "l" : "r";   // tapped the heavier one → re-pulse the lighter (hint), no penalty
          loadEl[lk].classList.remove("lighter"); void loadEl[lk].offsetWidth; loadEl[lk].classList.add("lighter"); return; }
        if(t._w === wantW()){ busy = true; wrongStreak = 0;   // correct: lighter AND globally lightest
          other._onpan = false; other.style.visibility = "";
          loadEl.l.innerHTML = ""; loadEl.r.innerHTML = ""; loadEl.l.classList.remove("lighter"); loadEl.r.classList.remove("lighter");
          pans.l = null; pans.r = null; beamwrap.style.transform = "rotate(0deg)";
          placeToSlot(t, ()=> setTimeout(()=>{ busy = false; autoLast(); }, 250));
        } else {   // lighter of the pair, but an even lighter one is still unplaced
          state.attempts++; GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts }); $("hintBtn").classList.add("show","hint-glow");
          if(++wrongStreak >= (CARD.scaffold_rules.max_attempts || 3)){ revealed = true; wrongStreak = 0; resetPans();
            const c = nextTile(); if(c){ c.classList.add("reveal-glow"); play(audioFor(slide, "reveal") || null, ()=>{});
              setTimeout(()=>{ c.classList.remove("reveal-glow"); busy = true; placeToSlot(c, ()=> setTimeout(()=>{ busy = false; autoLast(); }, 250)); }, 900); } }
          else { dragWrong(slide); resetPans(); }
        }
      }; });
      markActive();
      setNavActive(false); $("navBtn").onclick = ()=>{};
      $("hintBtn").onclick = ()=>{ if(!state.locked && !busy){ const t = nextTile(); if(t && !t._onpan){ t.classList.add("reveal-glow"); setTimeout(()=> t.classList.remove("reveal-glow"), 800); } } };
    }
  },

  BUILD_TO_NUMBER: {
    // Signature produce module. data: {target, mode:'guided'|'independent', topper, friend, goal_hi,
    // skyline_done, skyline_total}. Guided = dashed blueprint, auto-completes on fill. Independent =
    // free stack + "बन गया!" serve with world-enacted feedback (short/teeter, never a ✗). Ascending-
    // pitch thunk + spoken एक/दो/… per block. Geometry via offsets (throttle-safe).
    mount(host, slide){
      const d = slide.data, N = d.target, mode = d.mode || "independent";
      const stage = document.createElement("div"); stage.className = "bt-stage";
      const board = document.createElement("div"); board.className = "bt-board";
      board.innerHTML = `<span class="bt-numeral">${N}</span>` +
        (d.topper ? `<img class="bt-goalpic" src="assets/${d.topper}.png" alt="">` : "") +
        (d.goal_hi ? `<span class="bt-goallbl">${d.goal_hi}</span>` : "");
      const track = document.createElement("div"); track.className = "bt-track"; const cells = [];
      for(let i=1;i<=N;i++){ const c = document.createElement("div"); c.className = "bt-nt"; track.appendChild(c); cells.push(c); }
      const yard = document.createElement("div"); yard.className = "bt-yard";
      const crane = document.createElement("div"); crane.className = "bt-crane"; crane.innerHTML = `<img src="assets/obj_crane.png" alt="">`;
      const pile = document.createElement("div"); pile.className = "bt-pile";
      pile.innerHTML = `<div class="bt-pile-blocks"></div><span class="bt-pile-lbl">＋ ब्लॉक</span>`;
      const pb = pile.querySelector(".bt-pile-blocks");
      for(let i=0;i<3;i++){ const b = btBlock(i+1); b.style.left = (i*12) + "px"; b.style.bottom = (i*18) + "px"; pb.appendChild(b); }
      const plotwrap = document.createElement("div"); plotwrap.className = "bt-plotwrap";
      const plot = document.createElement("div"); plot.className = "bt-plot ground " + mode;
      plot.style.setProperty("--bh", Math.max(20, Math.min(46, Math.floor(230/N) - 2)) + "px");   // tall towers auto-shrink to fit
      plotwrap.appendChild(plot);
      const friend = document.createElement("div"); friend.className = "bt-friend";
      if(d.friend) friend.innerHTML = `<img src="assets/${d.friend}.png" alt="">`;
      yard.appendChild(crane); yard.appendChild(pile); yard.appendChild(plotwrap); if(d.friend) yard.appendChild(friend);
      stage.appendChild(board); stage.appendChild(track); stage.appendChild(yard);
      if(d.skyline_total) stage.appendChild(btSkyline(d.skyline_done || 0, d.skyline_total));
      let serveBtn = null;
      if(mode === "independent"){ serveBtn = document.createElement("button"); serveBtn.type = "button"; serveBtn.className = "bt-serve"; serveBtn.textContent = "बन गया!"; stage.appendChild(serveBtn); }
      host.appendChild(stage);

      let count = 0; state.locked = false; state.attempts = 0;
      const lit = ()=> cells.forEach((c,i)=>{ const on = i < count; c.classList.toggle("lit", on); c.textContent = on ? (i+1) : ""; });
      const addSound = ()=>{ btThunk(count); btDust(plot); play("assets/voiceover/vo_num_" + count + "." + AUDIO_EXT); };

      function success(){
        state.locked = true; if(serveBtn) serveBtn.disabled = true;
        if(d.topper){ const t = document.createElement("div"); t.className = "bt-topper snap"; t.innerHTML = `<img src="assets/${d.topper}.png" alt="">`; plot.appendChild(t);
          if(d.topper === "top_rocket") setTimeout(()=> t.classList.add("rocket-go"), 750); }
        if(d.friend) friend.classList.add("hop");
        sfxCorrect(); burstStars();
        const lots = [...stage.querySelectorAll(".bt-bldg")]; const nextLot = lots[d.skyline_done || 0];
        if(nextLot) setTimeout(()=> nextLot.classList.add("done"), 380);
        GameBus.emit("build_to_number_correct", { slide_id: slide.id, phase: slide.phase, value: true, target: N, attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
        play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT); setNavActive(true);
      }

      if(mode === "guided"){
        const ghosts = [];
        for(let i=0;i<N;i++){ const g = document.createElement("div"); g.className = "bp-slot"; plot.appendChild(g); ghosts.push(g); }
        ghosts[0].classList.add("next");
        pile.onclick = ()=>{ if(state.locked) return;
          const g = ghosts.find(x=> x.classList.contains("bp-slot"));
          if(!g){ showBox("", "बस इतने ही चाहिए!", "hint", null, ()=>{}); return; }
          g.className = "blk drop"; g.style.background = BT_COLORS[count % 5];
          count++; lit(); addSound();
          const nx = ghosts.find(x=> x.classList.contains("bp-slot")); if(nx) nx.classList.add("next");
          if(count === N) setTimeout(success, 280);
        };
      } else {
        pile.onclick = ()=>{ if(state.locked) return;
          const b = btBlock(count); b.classList.add("drop");
          b.onclick = (e)=>{ e.stopPropagation(); if(state.locked) return; b.remove(); count--; lit(); };
          plot.appendChild(b); count++; lit(); addSound(); };
        serveBtn.onclick = ()=>{ if(state.locked) return;
          if(count === N){ success(); return; }
          state.attempts++;
          GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts, made: count, target: N });
          if(count < N){ if(d.friend) friend.classList.add("peer");
            showBox("", "थोड़े और चाहिए!", "hint", null, ()=>{ if(d.friend) friend.classList.remove("peer"); }); }
          else { const bs = [...plot.querySelectorAll(".blk")]; const top = bs[bs.length-1];
            if(top){ top.classList.add("wobble"); setTimeout(()=> top.classList.remove("wobble"), 520); }
            showBox("", "अरे! एक ब्लॉक हटाओ।", "hint", null, ()=>{}); } };
      }
      setNavActive(false);
      $("navBtn").onclick = ()=>{ if(state.locked) completeSlide(true); };
      pointNudgeAt(pile);
    }
  },

  MAKE_NUMBER: {
    // produce-the-numeral dial (grafted from Firefly Valley). A set of N built blocks; ＋/− dials a
    // 1–10 numeral; wrong is inert (build dim), exact match ignites the build + snaps its topper.
    mount(host, slide){
      const d = slide.data, N = d.count;
      const stage = document.createElement("div"); stage.className = "bt-stage";
      if(d.prompt2_hi){ const lbl = document.createElement("div"); lbl.className = "pat-unit-lbl"; lbl.textContent = d.prompt2_hi; stage.appendChild(lbl); }
      const yard = document.createElement("div"); yard.className = "bt-yard";
      const plotwrap = document.createElement("div"); plotwrap.className = "bt-plotwrap";
      const plot = document.createElement("div"); plot.className = "bt-plot ground"; plot.style.filter = "grayscale(.35) brightness(.95)";
      plot.style.setProperty("--bh", Math.max(20, Math.min(46, Math.floor(230/N) - 2)) + "px");
      for(let i=0;i<N;i++){ plot.appendChild(btBlock(i)); }
      plotwrap.appendChild(plot); yard.appendChild(plotwrap);
      const dial = document.createElement("div"); dial.className = "bt-dial";
      dial.innerHTML = `<button class="bt-dial-btn" data-d="-1" type="button">−</button><div class="bt-dial-val">1</div><button class="bt-dial-btn" data-d="1" type="button">＋</button>`;
      stage.appendChild(yard); stage.appendChild(dial); host.appendChild(stage);
      let val = 1; state.locked = false; const valEl = dial.querySelector(".bt-dial-val");
      const check = ()=>{ if(val === N && !state.locked){ state.locked = true; valEl.classList.add("match"); plot.style.filter = "";
        if(d.topper){ const t = document.createElement("div"); t.className = "bt-topper snap"; t.innerHTML = `<img src="assets/${d.topper}.png" alt="">`; plot.appendChild(t); }
        sfxCorrect(); burstStars(); play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT);
        GameBus.emit("make_number_correct", { slide_id: slide.id, phase: slide.phase, value: true, count: N, latency_ms: Date.now()-state.slideStart });
        setNavActive(true); } };
      dial.querySelectorAll(".bt-dial-btn").forEach(btn=> btn.onclick = ()=>{ if(state.locked) return;
        val = Math.max(1, Math.min(10, val + parseInt(btn.dataset.d, 10))); valEl.textContent = val; sfxTap(); check(); });
      setNavActive(false); $("navBtn").onclick = ()=>{ if(state.locked) completeSlide(true); };
    }
  },

  TAP_LETTER_BY_NAME: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "letter_name_first_try",
        stimulus: null,
        options: slide.data.options,
        isCorrect: (opt) => opt.letter === slide.data.target,
        optionRenderer: (opt) => letterCell(opt.letter)
      });
    }
  },

  TAP_LETTER_BY_SOUND: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "letter_sound_first_try",
        stimulus: (()=> {
          const el = document.createElement("div"); el.className = "stimulus-pic";
          el.innerHTML = `<span class="emoji">🔊</span><span class="lbl">ध्वनि सुनो</span>`;
          el.style.cursor = "pointer";
          el.onclick = ()=>{ state.audioReplays++; play(audioFor(slide,"phoneme") || null); };
          return el;
        })(),
        options: slide.data.options,
        isCorrect: (opt) => opt.letter === slide.data.target,
        optionRenderer: (opt) => letterCell(opt.letter)
      });
    }
  },

  TAP_PICTURE_BY_LETTER: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "letter_image_match_first_try",
        stimulus: stimulusLetter(slide.data.target_letter),
        options: slide.data.options,
        isCorrect: (opt) => opt.correct === true,
        optionRenderer: (opt) => pictureCell(opt.picture, opt.emoji, opt.img)
      });
    }
  },

  TAP_LETTER_BY_PICTURE: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "image_letter_match_first_try",
        stimulus: stimulusPic(slide.data.picture, slide.data.emoji, slide.data.img),
        options: slide.data.options,
        isCorrect: (opt) => opt.letter === slide.data.target,
        optionRenderer: (opt) => letterCell(opt.letter)
      });
    }
  },

  ODD_ONE_OUT: {
    mount(host, slide){
      const sig = (slide.signals && slide.signals.on_complete && slide.signals.on_complete[0]) || "letter_recognise_first_try";
      const useShape = slide.data.options.some(o => o.shape);
      const usePic = slide.data.options.some(o => o.picture || o.word_hi || o.img);
      mountTapOptions({
        slide, host, signalName: sig,
        stimulus: null,
        options: slide.data.options,
        columnsHint: 4,
        isCorrect: (opt) => opt.is_odd === true,
        optionRenderer: (opt) => useShape
          ? shapeCell(opt)
          : usePic
            ? pictureCell(opt.word_hi || opt.picture, opt.emoji, opt.img)
            : letterCell(opt.letter),
        mastery: slide.phase === "mastery"
      });
    }
  },

  TAP_GENDER: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "gender_match_first_try",
        stimulus: stimulusPic(slide.data.noun.word_hi, slide.data.noun.emoji, slide.data.noun.img),
        options: slide.data.options,
        columnsHint: 2,
        isCorrect: (opt) => opt.gender === slide.data.target_gender,
        optionRenderer: (opt) => genderLabelCell(opt.label, opt.gender),
        mastery: slide.phase === "mastery"
      });
    }
  },

  TAP_PICTURE_BY_GENDER: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "gender_match_first_try",
        stimulus: stimulusGender(slide.data.label, slide.data.target_gender),
        options: slide.data.options,
        // tap-to-answer needs ONE unambiguous key — author marks the single intended picture
        // with correct:true (matches every other TAP_* module). The old `|| gender===target`
        // fallback silently accepted any same-gender distractor, defeating buzz+✗+lock.
        isCorrect: (opt) => opt.correct === true,
        optionRenderer: (opt) => pictureCell(opt.word_hi, opt.emoji, opt.img),
        mastery: slide.phase === "mastery"
      });
    }
  },

  GENDER_INTRO: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "gender-cats";
      const cats = slide.data.categories;
      const tapped = new Set();
      cats.forEach(cat => {
        const card = document.createElement("div");
        card.className = "gender-cat " + (cat.gender === "F" ? "fem" : "masc");
        card.innerHTML =
          `<div class="cat-title">${cat.label}</div>` +
          imgOrEmoji(cat.anchor.img, cat.anchor.emoji, "cat-pic", "cat-emoji") +
          `<div class="cat-word">${cat.anchor.word_hi}</div>`;
        card.onclick = ()=>{
          card.classList.add("played");
          playChain(["assets/voiceover/" + cat.label_audio + "." + AUDIO_EXT, "assets/voiceover/" + cat.name_audio + "." + AUDIO_EXT], 0);
          tapped.add(cat.gender);
          GameBus.emit("gender_intro_tap", { slide_id: slide.id, gender: cat.gender });
          if(tapped.size >= cats.length){ stopNudge(); setNavActive(true); }
        };
        wrap.appendChild(card);
      });
      host.appendChild(wrap);
      state.gateNavUntilAudio = true;   // nav unlocks after the concept VO
      setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  MEET_GENDER: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "meet-gender";
      const n = slide.data.noun;
      wrap.innerHTML =
        `<div class="meet-pic-box">${imgOrEmoji(n.img, n.emoji, "pic-img", "pic-emoji")}<span class="pic-label">${n.word_hi}</span></div>` +
        `<div class="meet-arrow">→</div>` +
        `<div class="gender-badge${slide.data.gender === "F" ? " fem" : ""}">${slide.data.label}</div>`;
      host.appendChild(wrap);
      state.gateNavUntilAudio = true;   // nav unlocks after the model VO
      setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  SORT_GENDER: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "sort-stage";
      const binsRow = document.createElement("div"); binsRow.className = "sort-bins";
      slide.data.bins.forEach(b => {
        const bin = document.createElement("div");
        bin.className = "sort-bin dd-zone" + (b.gender === "F" ? " fem" : "");   // dd-zone → drop detection
        bin.dataset.gender = b.gender;
        bin.innerHTML = `<div class="bin-title">${b.label}</div><div class="bin-items"></div>`;
        binsRow.appendChild(bin);
      });
      const tray = document.createElement("div"); tray.className = "sort-tray";
      const items = slide.data.items.slice().sort(()=> Math.random() - 0.5);
      items.forEach(it => {
        const t = document.createElement("div"); t.className = "sort-item";
        t.dataset.gender = it.gender;
        t.innerHTML = imgOrEmoji(it.img, it.emoji, "img", "emoji") + `<span class="lbl">${it.word_hi}</span>`;
        tray.appendChild(t);
      });
      wrap.appendChild(binsRow); wrap.appendChild(tray);
      host.appendChild(wrap);

      state.attempts = 0; state.locked = false;
      let placed = 0; const need = slide.data.items.length;
      [...tray.children].forEach(tile => {
        makeDraggable(tile, (zone, t) => {
          const bin = zone.closest(".sort-bin"); if(!bin) return;
          state.attempts++;
          if(bin.dataset.gender === t.dataset.gender){
            t.classList.add("snapped");
            bin.querySelector(".bin-items").appendChild(t);
            placed++;
            GameBus.emit("gender_sort_item", { slide_id: slide.id, gender: t.dataset.gender, attempts: state.attempts });
            if(placed === need){
              state.locked = true;
              GameBus.emit("gender_sort_correct", {
                slide_id: slide.id, phase: slide.phase, value: true,
                attempts: state.attempts, latency_ms: Date.now() - state.slideStart
              });
              setTimeout(()=> celebrateThenAdvance(slide, false), 250);   // standard: confetti + VO + auto-advance, no popup
            }
          } else {
            bin.classList.add("hover"); bin.style.borderColor = "var(--wrong)";
            setTimeout(()=>{ bin.classList.remove("hover"); bin.style.borderColor = ""; }, 500);
            dragWrong(slide);   // buzz + Swiftie + spoken try_again (pre-readers need the spoken recovery)
            GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
          }
        });
      });
    }
  },

  MATCH_GENDER_PAIRS: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "dd-stage";
      const zoneRow = document.createElement("div"); zoneRow.className = "dd-row";
      const zones = slide.data.pairs.slice().sort(()=> Math.random() - 0.5);
      zones.forEach(p => {
        const z = document.createElement("div"); z.className = "dd-zone"; z.dataset.accept = p.id;
        z.innerHTML = imgOrEmoji(p.f.img, p.f.emoji, "zone-img", "zone-emoji") + `<span class="zone-lbl">${p.f.word_hi}</span>`;
        zoneRow.appendChild(z);
      });
      const tileRow = document.createElement("div"); tileRow.className = "dd-row"; tileRow.style.marginTop = "34px";
      const tiles = slide.data.pairs.slice().sort(()=> Math.random() - 0.5);
      tiles.forEach(p => {
        const t = document.createElement("div"); t.className = "dd-tile pic-tile"; t.dataset.pairId = p.id;
        t.innerHTML = imgOrEmoji(p.m.img, p.m.emoji, "zone-img", "zone-emoji") + `<span class="zone-lbl">${p.m.word_hi}</span>`;
        tileRow.appendChild(t);
      });
      wrap.appendChild(zoneRow); wrap.appendChild(tileRow);
      host.appendChild(wrap);

      state.attempts = 0; state.locked = false;
      let filled = 0, wrongStreak = 0, revealed = false; const need = slide.data.pairs.length;
      const settle = (zone, t)=>{                       // the one correct-placement path (drop AND reveal)
        zone.classList.add("filled","correct");
        // grey the matched masculine tile in place (pictures don't badge well)
        t.classList.add("matched"); t.style.transform = "";
        filled++;
        if(filled === need){ state.locked = true; setTimeout(()=> celebrateThenAdvance(slide, revealed), 250); }
      };
      // A8 reveal ceiling: after max consecutive misses, DEMONSTRATE one pair (pulse + auto-settle) so
      // the child is guided forward instead of dead-ending; run counts success=false via `revealed`.
      const revealOne = ()=>{
        const zone = [...zoneRow.children].find(z=> !z.classList.contains("filled")); if(!zone) return;
        const t = [...tileRow.children].find(x=> !x.classList.contains("matched") && x.dataset.pairId === zone.dataset.accept); if(!t) return;
        revealed = true; wrongStreak = 0;
        zone.classList.add("reveal-glow"); t.classList.add("reveal-glow");
        play(audioFor(slide,"reveal") || null, ()=>{});
        setTimeout(()=>{ zone.classList.remove("reveal-glow"); t.classList.remove("reveal-glow"); settle(zone, t); }, 1000);
      };
      [...tileRow.children].forEach(tile => {
        makeDraggable(tile, (zone, t) => {
          if(state.locked || zone.classList.contains("filled")) return;
          state.attempts++;
          if(zone.dataset.accept === t.dataset.pairId){
            wrongStreak = 0;
            GameBus.emit("gender_pair_match", {
              slide_id: slide.id, phase: slide.phase, value: true,
              pair: t.dataset.pairId, attempts: state.attempts
            });
            settle(zone, t);
          } else {
            zone.classList.add("filled","wrong");
            setTimeout(()=> zone.classList.remove("filled","wrong"), 600);
            dragWrong(slide);
            GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
            if(++wrongStreak >= (CARD.scaffold_rules.max_attempts||3)) revealOne();
          }
        });
      });
    }
  },

  MATCH_DRAG_1: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "dd-stage";
      // zone (target picture)
      const zoneRow = document.createElement("div"); zoneRow.className = "dd-row";
      const zone = document.createElement("div"); zone.className = "dd-zone";
      zone.innerHTML = imgOrEmoji(slide.data.target.img, slide.data.target.emoji, "zone-img", "zone-emoji") + `<span class="zone-lbl">${slide.data.target.picture||""}</span>`;
      zone.dataset.accept = slide.data.letter.letter;
      zoneRow.appendChild(zone);
      // tile
      const tileRow = document.createElement("div"); tileRow.className = "dd-row"; tileRow.style.marginTop = "30px";
      const tile = document.createElement("div"); tile.className = "dd-tile"; tile.innerHTML = `<span class="ink-glyph">${slide.data.letter.letter}</span>`;
      tileRow.appendChild(tile);
      wrap.appendChild(zoneRow); wrap.appendChild(tileRow);
      host.appendChild(wrap);

      state.attempts = 0; state.locked = false;
      makeDraggable(tile, (zone, t) => {
        state.attempts++;
        const ok = (zone.dataset.accept === t.textContent.trim());
        if(ok){
          zone.classList.add("filled","correct");
          // snap tile into zone (badge is small — drop the ink-centering transform)
          t.classList.add("snapped");
          t.querySelector(".ink-glyph")?.style.removeProperty("transform");
          zone.appendChild(t);
          state.locked = true;
          GameBus.emit("letter_image_match_first_try", {
            slide_id: slide.id, phase: slide.phase, value: true,
            first_try: state.attempts === 1, attempts: state.attempts,
            latency_ms: Date.now()-state.slideStart
          });
          celebrateThenAdvance(slide, false);
        } else {
          zone.classList.add("filled","wrong");
          setTimeout(()=> zone.classList.remove("filled","wrong"), 600);
          dragWrong(slide);
          GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
          if(state.attempts >= (CARD.scaffold_rules.max_attempts||3)){
            state.locked = true;
            // reveal = DEMONSTRATE, don't just tell: snap the letter into its picture (dimmed pulse)
            // with the spoken reveal line, then move on as success=false.
            showBox("", audioText(slide,"reveal") || "कोई बात नहीं! इसे यहाँ रखो।", "reveal", audioFor(slide,"reveal"), ()=>{});
            setTimeout(()=>{
              zone.classList.add("filled","correct","reveal-glow");
              t.classList.add("snapped");
              t.querySelector(".ink-glyph")?.style.removeProperty("transform");
              zone.appendChild(t);
              setTimeout(()=> completeSlide(false), 1300);
            }, 900);
          }
        }
      });
    }
  },

  MATCH_DRAG_N: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "dd-stage";
      const zoneRow = document.createElement("div"); zoneRow.className = "dd-row";
      // shuffle zones so order ≠ tile order
      const zones = slide.data.pairs.slice().sort(()=> Math.random()-0.5);
      zones.forEach(p => {
        const z = document.createElement("div"); z.className = "dd-zone";
        z.innerHTML = imgOrEmoji(p.img, p.emoji, "zone-img", "zone-emoji") + `<span class="zone-lbl">${p.picture||""}</span>`;
        z.dataset.accept = p.letter;
        zoneRow.appendChild(z);
      });
      const tileRow = document.createElement("div"); tileRow.className = "dd-row"; tileRow.style.marginTop = "30px";
      const tiles = slide.data.pairs.slice().sort(()=> Math.random()-0.5);
      tiles.forEach(p => {
        const t = document.createElement("div"); t.className = "dd-tile"; t.innerHTML = `<span class="ink-glyph">${p.letter}</span>`;
        tileRow.appendChild(t);
      });
      wrap.appendChild(zoneRow); wrap.appendChild(tileRow);
      host.appendChild(wrap);

      state.attempts = 0; state.locked = false;
      let filled = 0, wrongStreak = 0, revealed = false; const need = slide.data.pairs.length;
      const settle = (zone, t)=>{                       // one correct-placement path (drop AND reveal)
        zone.classList.add("filled","correct");
        t.classList.add("snapped"); t.querySelector(".ink-glyph")?.style.removeProperty("transform"); zone.appendChild(t);
        filled++;
        if(filled === need){ state.locked = true; setTimeout(()=> celebrateThenAdvance(slide, revealed), 250); }
      };
      // A8 reveal ceiling: after max consecutive misses, demonstrate one letter→picture match.
      const revealOne = ()=>{
        const zone = [...zoneRow.children].find(z=> !z.classList.contains("filled")); if(!zone) return;
        const t = [...tileRow.children].find(x=> !x.classList.contains("snapped") && x.textContent.trim() === zone.dataset.accept); if(!t) return;
        revealed = true; wrongStreak = 0;
        zone.classList.add("reveal-glow"); t.classList.add("reveal-glow");
        play(audioFor(slide,"reveal") || null, ()=>{});
        setTimeout(()=>{ zone.classList.remove("reveal-glow"); t.classList.remove("reveal-glow"); settle(zone, t); }, 1000);
      };
      [...tileRow.children].forEach(tile => {
        makeDraggable(tile, (zone, t) => {
          if(state.locked || zone.classList.contains("filled")) return;
          state.attempts++;
          const ok = (zone.dataset.accept === t.textContent.trim());
          if(ok){
            wrongStreak = 0;
            GameBus.emit("letter_image_match_first_try", {
              slide_id: slide.id, phase: slide.phase, value: true,
              letter: t.textContent, attempts: state.attempts
            });
            settle(zone, t);
          } else {
            zone.classList.add("filled","wrong");
            dragWrong(slide);
            GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
            setTimeout(()=> zone.classList.remove("filled","wrong"), 600);
            if(++wrongStreak >= (CARD.scaffold_rules.max_attempts||3)) revealOne();
          }
        });
      });
    }
  },

  SEQUENCE_DRAG: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "dd-stage";
      // slots row
      const slots = document.createElement("div"); slots.className = "seq-slots";
      slide.data.correct_order.forEach((L,i) => {
        const sl = document.createElement("div"); sl.className = "seq-slot";
        sl.dataset.accept = L; sl.dataset.idx = String(i);
        sl.classList.add("dd-zone");      // reuse drop logic
        sl.innerHTML = `<span class="ordinal">${i+1}</span>`;
        slots.appendChild(sl);
      });
      const tileRow = document.createElement("div"); tileRow.className = "dd-row"; tileRow.style.marginTop = "40px";
      slide.data.tiles.forEach(t => {
        const tl = document.createElement("div"); tl.className = "dd-tile"; tl.innerHTML = `<span class="ink-glyph">${t.letter}</span>`;
        tileRow.appendChild(tl);
      });
      wrap.appendChild(slots); wrap.appendChild(tileRow);
      host.appendChild(wrap);

      let placed = 0, wrongStreak = 0, revealed = false; const need = slide.data.correct_order.length;
      state.attempts = 0; state.locked = false;
      const settle = (zone, t)=>{                       // one correct-placement path (drop AND reveal)
        zone.classList.remove("dd-zone");
        zone.classList.add("filled","correct");
        zone.innerHTML = `<span class="ordinal">${parseInt(zone.dataset.idx,10)+1}</span><span class="ink-glyph">${t.textContent.trim()}</span>`;
        centerInkGlyph(zone.querySelector(".ink-glyph"));
        t.remove();
        placed++;
        if(placed === need){
          state.locked = true;
          GameBus.emit("letter_sequence_correct", {
            slide_id: slide.id, phase: slide.phase, value: !revealed,
            attempts: state.attempts, latency_ms: Date.now()-state.slideStart
          });
          setTimeout(()=> celebrateThenAdvance(slide, revealed), 250);
        }
      };
      // A8 reveal ceiling: after max consecutive misses, demonstrate the NEXT slot in the order.
      const revealOne = ()=>{
        const zone = [...slots.children].find(z=> !z.classList.contains("filled")); if(!zone) return;
        const t = [...tileRow.children].find(x=> x.textContent.trim() === zone.dataset.accept); if(!t) return;
        revealed = true; wrongStreak = 0;
        zone.classList.add("reveal-glow"); t.classList.add("reveal-glow");
        play(audioFor(slide,"reveal") || null, ()=>{});
        setTimeout(()=>{ zone.classList.remove("reveal-glow"); settle(zone, t); }, 1000);
      };
      [...tileRow.children].forEach(tile => {
        makeDraggable(tile, (zone, t) => {
          if(state.locked || zone.classList.contains("filled")) return;
          state.attempts++;
          const ok = (zone.dataset.accept === t.textContent.trim());
          if(ok){
            wrongStreak = 0;
            settle(zone, t);
          } else {
            zone.classList.add("wrong");
            setTimeout(()=> zone.classList.remove("wrong"), 600);
            dragWrong(slide);
            GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
            if(++wrongStreak >= (CARD.scaffold_rules.max_attempts||3)) revealOne();
          }
        });
      });
    }
  },

  MASTERY_SILENT_PICK: {
    mount(host, slide){
      const mode = slide.data.mode;
      let stimulus = null, options = null, isCorrect = null, optionRenderer = null;
      if(mode === "sound_to_letter"){
        stimulus = (()=> {
          const el = document.createElement("div"); el.className = "stimulus-pic"; el.style.cursor="pointer";
          el.innerHTML = `<span class="emoji">🔊</span><span class="lbl">ध्वनि सुनो</span>`;
          el.onclick = ()=>{ state.audioReplays++; play(audioFor(slide,"phoneme") || null); };
          return el;
        })();
        options = slide.data.options;
        isCorrect = (opt) => opt.letter === slide.data.target;
        optionRenderer = (opt) => letterCell(opt.letter);
      } else if(mode === "picture_to_letter"){
        stimulus = stimulusPic(slide.data.picture, slide.data.emoji, slide.data.img);
        options = slide.data.options;
        isCorrect = (opt) => opt.letter === slide.data.target;
        optionRenderer = (opt) => letterCell(opt.letter);
      } else if(mode === "name_to_shape"){
        stimulus = (()=> {
          const el = document.createElement("div"); el.className = "stimulus-pic"; el.style.cursor="pointer";
          el.innerHTML = `<span class="emoji">🔊</span><span class="lbl">${slide.data.name || "नाम सुनो"}</span>`;
          el.onclick = ()=>{ state.audioReplays++; play(audioFor(slide,"shape_name") || null); };
          return el;
        })();
        options = slide.data.options;
        isCorrect = (opt) => opt.shape === slide.data.target;
        optionRenderer = (opt) => shapeCell(opt);
      } else if(mode === "object_to_shape"){
        stimulus = stimulusPic(slide.data.object_hi, slide.data.object_emoji, slide.data.object_img);
        options = slide.data.options;
        isCorrect = (opt) => opt.shape === slide.data.target;
        optionRenderer = (opt) => shapeCell(opt);
      } else if(mode === "shape_to_object"){
        stimulus = stimulusShape({shape: slide.data.shape, color: slide.data.color, rotate: slide.data.rotate});
        options = slide.data.options;
        isCorrect = (opt) => opt.correct === true;
        optionRenderer = (opt) => pictureCell(opt.object_hi, opt.object_emoji, opt.object_img);
      } else { // letter_to_picture
        stimulus = stimulusLetter(slide.data.letter);
        options = slide.data.options;
        isCorrect = (opt) => opt.correct === true;
        optionRenderer = (opt) => pictureCell(opt.picture, opt.emoji, opt.img);
      }
      // SAME scaffold as the rest of the lesson — hint button after 1st wrong,
      // correct/incorrect feedback popups, reveal-on-3rd-wrong. Not silent.
      // `mastery:true` keeps the mastery_score tracking (first-try = hit).
      mountTapOptions({
        slide, host, signalName: "mastery_item",
        stimulus, options, isCorrect, optionRenderer, mastery: true
      });
    }
  },

  STORY_SCENE: {
    // TEACH: one picture-story beat. Scene image fills the frame; narration VO plays on mount;
    // slow Ken-Burns pan keeps it alive for a pre-reader. Chain several in order for the story.
    mount(host, slide){
      const d = slide.data || {};
      const wrap = document.createElement("div"); wrap.className = "story-scene";
      const fb = String(d.emoji || "📖").replace(/'/g,"");
      wrap.innerHTML =
        '<div class="story-frame">' +
          '<img class="story-img" src="assets/' + d.image_id + '.' + IMG_EXT + '" alt="' + (d.alt_hi||'') + '" ' +
            'onerror="var s=document.createElement(\'span\');s.className=\'story-fallback\';s.textContent=\'' + fb + '\';this.replaceWith(s);"/>' +
        '</div>' +
        (d.caption_hi ? '<div class="story-caption">' + d.caption_hi + '</div>' : '');
      host.appendChild(wrap);
      state.ownsAudio = true; setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
      state.replayAudio = ()=>{ play(audioFor(slide, "narration") || null, ()=>{}); };
      setSwMood("talk");
      let _armed = false;
      const _armNav = ()=>{ if(_armed) return; _armed = true; setNavActive(true); setSwMood("point"); };
      play(audioFor(slide, "narration") || null, _armNav);
      setTimeout(_armNav, 30000);   // watchdog: nav always eventually opens if VO buffers slowly
    }
  },

  STORY_QUESTION: {
    // TEST: a comprehension question after story beats. A recall thumb (visual anchor) + 🔊 chip
    // form the stimulus; options are 2–3 picture chips. Tap-to-answer feedback is inherited from
    // mountTapOptions. Recall thumb is a CUE, hidden at mastery / when data.hide_recall so the
    // answer isn't leaked by thumb-reading.
    mount(host, slide){
      const d = slide.data || {};
      const stim = document.createElement("div"); stim.className = "story-q-stim"; stim.style.cursor = "pointer";
      const hideRecall = slide.phase === "mastery" || d.hide_recall === true;
      const thumb = (!hideRecall && d.recall_image_id)
        ? '<img class="story-q-thumb" src="assets/' + d.recall_image_id + '.' + IMG_EXT + '" alt="" ' +
          'onerror="this.style.display=\'none\';"/>'
        : '';
      stim.innerHTML = thumb +
        '<span class="story-q-listen"><span class="emoji">🔊</span>' +
        '<span class="lbl">' + (d.stim_hi || 'प्रश्न सुनो') + '</span></span>';
      stim.onclick = ()=>{ state.audioReplays++; play(audioFor(slide, "prompt") || null); };
      mountTapOptions({
        slide, host,
        signalName: d.signal_name || "story_question_first_try",
        stimulus: stim,
        options: d.options,
        isCorrect: (opt) => opt.correct === true,
        optionRenderer: (opt) => {
          const cell = document.createElement("div");
          cell.innerHTML =
            imgOrEmoji(opt.img, opt.emoji, "story-q-opt-img", "story-q-opt-emoji") +
            (opt.label_hi ? '<span class="story-q-opt-label">' + opt.label_hi + '</span>' : '');
          return cell;
        },
        mastery: d.mastery === true,
        columnsHint: (d.options && d.options.length) <= 2 ? 2 : 3
      });
    }
  },

  TAP_IN_SCENE: {
    // "Tap the thing in the picture" — a PRODUCE-style comprehension mechanic (NOT an MCQ). A story
    // scene fills the frame; the child taps the target region(s) (e.g. the monkeys who took the caps).
    // A correct hotspot → confetti + advance; a miss → soft buzz + try_again VO; after a few idle
    // seconds the target gently pulses (hint). Data: {image_id, alt_hi, prompt, hotspots:[{x,y,w,h,
    // correct}] (as % of the frame), audio:{prompt,correct,try_again}}. Reusable for any "find X".
    mount(host, slide){
      const d = slide.data || {};
      const wrap = document.createElement("div"); wrap.className = "tis-scene";
      const frame = document.createElement("div"); frame.className = "tis-frame";
      const img = document.createElement("img"); img.className = "tis-img";
      img.src = "assets/" + d.image_id + "." + IMG_EXT; img.alt = d.alt_hi || "";
      frame.appendChild(img);
      let done = false;
      const miss = ()=>{ if(done) return; sfxWrongSoft(); setSwMood("tryagain"); play(audioFor(slide,"try_again")||null,()=>{}); };
      (d.hotspots || []).forEach(h => {
        const hs = document.createElement("button"); hs.className = "tis-hot" + (h.correct ? " correct-hot" : "");
        hs.style.left=h.x+"%"; hs.style.top=h.y+"%"; hs.style.width=h.w+"%"; hs.style.height=h.h+"%";
        hs.onclick = (e)=>{ e.stopPropagation(); if(done) return;
          if(h.correct){ done=true; hs.classList.add("hit"); sfxCorrect(); confettiCannon(); setSwMood("happy");
            GameBus.emit(d.signal_name || "scene_tap_first_try", {slide_id:slide.id, phase:slide.phase, correct:true});
            play(audioFor(slide,"correct")||null, ()=> setTimeout(()=>completeSlide(true), 900)); }
          else { hs.classList.add("shake"); miss(); } };
        frame.appendChild(hs);
      });
      frame.onclick = miss;   // tapping empty scene = gentle try_again
      wrap.appendChild(frame); host.appendChild(wrap);
      $("navBtn").style.display = "none";   // advance on the correct tap — no आगे on a pick
      state.replayAudio = ()=> play(audioFor(slide,"prompt")||null, ()=>{});
      setSwMood("point");
      play(audioFor(slide,"prompt")||null, ()=>{});
      setTimeout(()=>{ if(!done) frame.querySelectorAll(".tis-hot.correct-hot").forEach(el=>el.classList.add("pulse")); }, 6000);
    }
  },

  PHASE_TRANSITION: {
    // Additive "learning journey" beat between arc phases (the MoM "no sense of progression" fix).
    // Full-screen friendly panel: badge + "अब हम ___ करेंगे" headline + a 5-dot journey map with the
    // current step lit. The header Swiftie presents it (ONE-Swiftie rule — no second mascot). Learner-
    // paced: no auto-advance timer; आगे unlocks when the beat's VO ends (immediately if silent).
    // data:{ headline_hi, icon?, step (1-based), total_steps?, to_phase? }. Build scripts weave one of
    // these before each phase change; older cards without it are untouched (purely additive).
    mount(host, slide){
      const d = slide.data || {};
      const panel = document.createElement("div"); panel.className = "phase-transition";
      const total = d.total_steps || 5, step = Math.min(d.step || 1, total);
      let map = '<div class="pt-map">';
      for(let i = 1; i <= total; i++){
        map += `<span class="pt-step ${i < step ? 'done' : i === step ? 'current' : ''}"></span>`;
        if(i < total) map += '<span class="pt-connector"></span>';
      }
      map += '</div>';
      panel.innerHTML =
        `<div class="pt-badge">${d.icon || '🎯'}</div>` +
        `<div class="pt-headline">${d.headline_hi || slide.prompt_hi || ''}</div>` + map;
      host.appendChild(panel);
      setSwMood("teach");
      GameBus.emit("phase_transition_shown", { slide_id: slide.id, to_phase: d.to_phase || slide.phase, step });
      state.ownsAudio = true; state.locked = false; setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
      const vo = audioFor(slide, "prompt");
      if(vo) play(vo, ()=> setNavActive(true)); else setNavActive(true);
    }
  },

  CELEBRATION: {
    mount(host, slide){
      // celebration SFX — own Audio element so it overlaps the spoken VO chain
      playSfx(slide.audio && slide.audio.sfx ? slide.audio.sfx : "sfx_celebrate");
      // show end screen overlay + a big Hindi headline (== the VO) so the finale feels like a reward
      const et = $("endTitle"); if(et) et.textContent = slide.prompt_hi || "";
      const st = $("endSubtitle"); if(st) st.textContent = (slide.data && slide.data.end_subtitle) || "";
      const es = $("endScreen"); es.classList.add("show");
      document.body.classList.add("is-end");   // r4: immersive sunburst backdrop (end_screen.webp)
      const c = $("confetti"); c.innerHTML = "";
      starBurst();   // r4: gold star burst from centre (replaces flat falling confetti)
      const masteryScore = state.masteryAttempts ? (state.masteryHits/state.masteryAttempts) : 0;
      GameBus.emit("mastery_score", { value: masteryScore, hits: state.masteryHits, attempts: state.masteryAttempts });
      GameBus.emit("lesson_completed", { skill_code: CARD.skill_code, total_signals: GameBus.signals.length });
      runValidator();
      setNavActive(false);
      // "आगे बढ़ें" appears only AFTER the celebration VO finishes (see autoPlayChain onDone)
      const eb = $("endBtn"); eb.classList.remove("show");
      state.endBtnPending = true;
      // dev-only: a small "download results" button (teacher/QA), never in child flow
      if(new URLSearchParams(location.search).has("dev") && !$("dlResults")){
        const dl = document.createElement("button"); dl.id = "dlResults"; dl.textContent = "⬇ results JSON";
        dl.style.cssText = "position:absolute;bottom:20px;left:20px;z-index:5;font-family:var(--font-hi);font-weight:700;font-size:16px;padding:8px 16px;border-radius:12px;border:2px solid #B7DCFB;background:#fff;color:var(--navy);cursor:pointer;";
        dl.onclick = ()=> GameBus.downloadResults();
        es.appendChild(dl);
      }
      /* [08][14] the completion event fires ONCE, and only on this tap - not on
         mount. XAPI.once() is the guard, so a fast double-tap cannot send it
         twice; the button also disables itself on the first tap. */
      eb.onclick = ()=>{
        if(eb.dataset.done === "1") return;
        eb.dataset.done = "1"; eb.disabled = true;
        /* [QA 06][14] score = first-try correctness over every answerable question (recordResult) */
        const firstTryScore = state.masteryAttempts ? (state.masteryHits/state.masteryAttempts) : 0;
        XAPI.once("activity_completed",
          { skill_code: CARD.skill_code, part: CARD.part_label },
          { completed: true, completion: true, progress: 100, score: firstTryScore,
            first_try_correct: state.masteryHits, questions: state.masteryAttempts,
            duration_ms: Date.now() - GameBus.startedAt });
        GameBus.emit("proceed_next", { skill_code: CARD.skill_code, part: CARD.part_label });
        try{ window.parent?.postMessage({type:"swiftpal:proceed", skill_code:CARD.skill_code, part:CARD.part_label}, "*"); }catch(e){}
      };
    }
  }
};

/* VACHAN (एकवचन/बहुवचन) + any 2-category attribute reuse the GENERIC gender modules — identical
   mechanic, just different labels. A vachan game authors these types with the category in the
   "gender" field (e.g. "S"/"P"), the two labels, and (for pairs) f=singular / m=plural; it then
   inherits immediate tap-to-answer feedback, speak-word-on-tap, layered hints, and the engine
   guard for free. Named *_VACHAN (not *_NUMBER) to avoid colliding with MEET_NUMBER = counting. */
SlideModules.VACHAN_INTRO          = SlideModules.GENDER_INTRO;
SlideModules.MEET_VACHAN           = SlideModules.MEET_GENDER;
SlideModules.TAP_VACHAN            = SlideModules.TAP_GENDER;
SlideModules.TAP_PICTURE_BY_VACHAN = SlideModules.TAP_PICTURE_BY_GENDER;
SlideModules.SORT_VACHAN           = SlideModules.SORT_GENDER;
SlideModules.MATCH_VACHAN_PAIRS    = SlideModules.MATCH_GENDER_PAIRS;

/* ---------- 13. CONTROLLER ---------- */
/* ===== FLN ANIMATION KIT: star-burst (call site) BEGIN =====
   Recipe 8 is a RETUNE of the function below, which was already the shipped
   HI01H05 original: fewer and slower (150 ticks / decay .975 / startV 14 /
   32 stars + 8 circles / spin .18 / shots 0-220-440, against 100 / .96 / 22 /
   80 + 20 / .3 / 0-150-300). Travel distance is held at ~547px so it still
   fills the same area - only the density and pace change.
   The original is kept as _starBurstOld, unreferenced, to make this reversible. */
function starBurst(){ FLNMotion.starBurst.fire({ host: "#confetti" }); }
/* ===== FLN ANIMATION KIT: star-burst (call site) END ===== */
/* r4: gold star burst for the celebration finale (adopted from Shruti's build) */
function _starBurstOld(){
  if(document.documentElement.classList.contains("no-anim")) return;
  const host = $("confetti"); if(!host) return;
  const cv = document.createElement("canvas");
  cv.width = 1333; cv.height = 750;
  cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
  host.appendChild(cv);
  const ctx = cv.getContext("2d");
  const COLORS = ["#FFE400","#FFBD00","#E89400","#FFCA6C","#FDFFB8"];
  const TICKS = 100, DECAY = 0.96, START_V = 22;
  const parts = [];
  function starPath(r){
    ctx.beginPath();
    for(let i=0;i<10;i++){
      const rad = (i % 2 === 0) ? r : r/2;
      const a = Math.PI/5*i - Math.PI/2;
      ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(a)*rad, Math.sin(a)*rad);
    }
    ctx.closePath();
  }
  function shoot(){
    const add = (n, scalar, shape) => {
      for(let i=0;i<n;i++){
        const a = Math.random()*Math.PI*2;
        parts.push({ x:cv.width/2, y:cv.height/2, ax:Math.cos(a), ay:Math.sin(a),
          vel:START_V*(0.5 + Math.random()), tick:0, scalar, shape,
          color:COLORS[Math.floor(Math.random()*COLORS.length)],
          rot:Math.random()*Math.PI*2, spin:(Math.random()-.5)*0.3 });
      }
    };
    add(80, 1.8, "star");
    add(20, 1.0, "circle");
  }
  shoot(); setTimeout(shoot, 150); setTimeout(shoot, 300);
  let frames = 0;
  (function frame(){
    ctx.clearRect(0, 0, cv.width, cv.height);
    let alive = false;
    for(const p of parts){
      if(p.tick >= TICKS) continue;
      alive = true;
      p.x += p.ax*p.vel; p.y += p.ay*p.vel; p.vel *= DECAY; p.rot += p.spin; p.tick++;
      ctx.globalAlpha = 1 - p.tick/TICKS;
      ctx.fillStyle = p.color;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      if(p.shape === "star"){ starPath(8*p.scalar); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(0, 0, 6*p.scalar, 0, Math.PI*2); ctx.fill(); }
      ctx.restore();
    }
    frames++;
    if(alive || frames < 30) requestAnimationFrame(frame);
    else setTimeout(()=> cv.remove(), 300);
  })();
}
function clearHost(){
  document.body.classList.remove("is-end");   // r4: clear immersive end state when leaving celebration
  $("slideHost").innerHTML = "";
  $("hintBtn").classList.remove("show");
  $("hintBtn").disabled = false;
  setNavActive(false);
  stopNudge();
  stopAudio();
}

function mountSlide(idx){
  state.idx = idx;
  state.slideStart = Date.now();
  state.attempts = 0; state.selectedKey = null; state.locked = false;
  state.hintUsed = false; state.nudgeUsed = false; state.scaffoldLevel = 0; state.hintActive = false;
  state.audioReplays = 0; state.gateNavUntilAudio = false; state.endBtnPending = false;
  state.replayAudio = null;   // a module may set a slide-specific replay (e.g. teach slides whose
                              // audio roles aren't in the autoPlayChain order); else the chip replays the chain
  state.ownsAudio = false;    // a module that drives its OWN audio sequence sets this → skip autoPlayChain
                              // (else the auto prompt-chain stomps/truncates the module's timed VO)
  const slide = CARD.slides[idx];
  /* [14] question_started - only on slides that actually ask something */
  try{ if(XAPI_ANSWERABLE.indexOf(slide.type) >= 0)
         XAPI.send("question_started", { slide_id: slide.id, type: slide.type, phase: slide.phase }); }catch(e){}
  clearHost();

  // header prompt
  $("promptText").textContent = slide.prompt_hi || "";

  // Hint button stays HIDDEN until the learner makes a wrong attempt, then it is
  // exposed (graduated scaffold). Mastery uses the SAME scaffold — not excluded.
  $("hintBtn").classList.remove("show");
  $("hintBtn").style.display = "";
  $("navBtn").style.display = "";        // restored by default; tap-to-answer slides hide it themselves
  // [16i] DEFAULT nav wiring — a module that enables आगे without overriding onclick still advances.
  // (DEMO_COUNT shipped an enabled-but-dead button; auto-INTRO inherited an unfulfillable tap guard.)
  $("navBtn").onclick = ()=> completeSlide(true);
  setSwMood("point");                    // Swiftie turns to present each new slide

  GameBus.emit("slide_entered", { slide_id: slide.id, phase: slide.phase, eis: slide.eis, type: slide.type, idx });

  // audio chip = replay the slide audio. Prefer a module-supplied replay (teach slides own their
  // count_intro/explain sequence, which autoPlayChain deliberately skips), else replay the chain.
  $("audioChip").onclick = ()=>{
    if(!replayTap(slide, "header_chip")) return;
    if(state.replayAudio) state.replayAudio(); else autoPlayChain(slide);
  };

  // mount the type
  const mod = SlideModules[slide.type];
  if(!mod){ console.error("[engine] no module for", slide.type); return; }
  // [engine JS] r4/F1 TEACHING FRAME: tutorial slides mount inside a grid-paper .tut-card (header hidden,
  // prompt in-card, standing Swiftie bottom-left + shoulder audio chip). Type-agnostic — any tutorial-phase
  // module renders into the card. Non-tutorial slides mount bare into slideHost as before.
  const isTut = (slide.phase === "tutorial" && slide.type !== "PHASE_TRANSITION" && slide.type !== "CELEBRATION");
  $("stage").classList.toggle("tut", isTut);
  document.body.classList.toggle("tut-page", isTut);
  let mountHost = $("slideHost");
  if(isTut){
    const card = document.createElement("div"); card.className = "tut-card";
    card.innerHTML = `<div class="tut-prompt">${slide.prompt_hi || ""}</div>` +
      `<img class="tut-mascot" src="assets/start_mascot.webp" alt="" onerror="this.style.display='none'">` +
      /* [05][11] QA CHECKLIST: the in-slide speaker chip is the inline SVG -
         gradient + white ring + wave arcs - never a flat PNG. Verbatim HI01. */
      `<span class="tut-audio" role="button" aria-label="फिर से सुनो"><svg viewBox="0 0 62 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Audio"><g filter="url(#tutChipShadow)"><rect x="8" y="4" width="46" height="44" rx="22" fill="url(#tutChipGrad)"/><rect x="6" y="2" width="50" height="48" rx="24" stroke="white" stroke-width="4"/><path d="M29.8466 19.0574C29.8804 19.0524 29.9145 19.0496 29.9487 19.0488C30.6094 19.0317 31.0021 19.5124 31.0015 20.1414C31.0008 20.9661 31.0003 21.7911 31.0005 22.6158L31.001 27.7212L31.0009 30.5591C31.0009 31.0364 31.0122 31.5472 30.9863 32.0228C30.9662 32.2709 30.902 32.4608 30.7251 32.643C30.3831 32.9952 29.8337 33.0842 29.4386 32.7671C29.0784 32.4781 28.7473 32.1159 28.4181 31.7862L26.4414 29.8087C26.1771 29.5426 25.9071 29.2636 25.6339 29.0081C25.0227 28.9649 24.3645 29.017 23.7487 28.9979C23.445 28.9885 23.1625 29.0211 22.8589 28.9606C22.3751 28.8616 22.0618 28.4823 22.0642 27.9824C22.0706 26.5937 22.0287 25.1949 22.0828 23.8081C22.0884 23.6626 22.2302 23.4334 22.3309 23.3252C22.454 23.1907 22.6146 23.0963 22.792 23.0543C23.0567 22.9904 23.5328 23.016 23.8224 23.0128C24.4143 23.0063 25.0171 23.0277 25.609 23.0073C25.6794 22.9529 25.8505 22.7743 25.919 22.706L26.5305 22.0945L28.5396 20.0838C28.9157 19.7059 29.3217 19.1749 29.8466 19.0574Z" fill="white"/><path class="wv wv2" d="M36.2367 18.6905C36.8783 18.6449 37.3041 19.231 37.6725 19.6829C38.7675 21.0046 39.4982 22.5894 39.7923 24.2804C40.2503 26.8763 39.6548 29.5478 38.1378 31.7035C37.8393 32.1274 37.508 32.5324 37.149 32.9063C36.9404 33.1236 36.7646 33.2558 36.4622 33.3081C36.2013 33.3412 35.9378 33.2717 35.7272 33.1144C35.5185 32.9615 35.3816 32.7298 35.3483 32.4733C35.2786 31.9235 35.5696 31.6821 35.8914 31.3297C36.0448 31.1639 36.1901 30.9908 36.3269 30.811C38.3669 28.136 38.4986 24.4654 36.6555 21.6511C36.4826 21.3899 36.2966 21.1376 36.0984 20.8951C35.8252 20.5652 35.3947 20.2691 35.3472 19.8184C35.2845 19.2225 35.6439 18.768 36.2367 18.6905Z" fill="white"/><path class="wv wv1" d="M33.3868 21.5044C33.9769 21.4549 34.2563 21.7845 34.5981 22.1981C35.1982 22.924 35.6149 23.7691 35.8211 24.6886C36.171 26.2384 35.8867 27.8637 35.0314 29.2026C34.7421 29.6568 34.2333 30.3745 33.6937 30.4946C33.1633 30.5437 32.6759 30.2927 32.5495 29.7376C32.3921 29.0462 32.9849 28.6956 33.3274 28.1763C34.2088 26.833 34.1932 25.0908 33.288 23.7635C33.0747 23.4522 32.6159 23.0564 32.5518 22.7133C32.4377 22.1027 32.7745 21.619 33.3868 21.5044Z" fill="white"/></g><defs><filter id="tutChipShadow" x="0" y="0" width="62" height="60" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter><linearGradient id="tutChipGrad" x1="8" y1="26" x2="54" y2="26" gradientUnits="userSpaceOnUse"><stop stop-color="#1987FC"/><stop offset="1" stop-color="#1565F4"/></linearGradient></defs></svg></span>`;
    const inner = document.createElement("div"); inner.className = "tut-content";
    card.insertBefore(inner, card.querySelector(".tut-mascot"));
    card.querySelector(".tut-audio").onclick = ()=>{
      if(!replayTap(slide, "tut_chip")) return;
      if(state.replayAudio) state.replayAudio(); else autoPlayChain(slide);
    };
    $("slideHost").appendChild(card);
    mountHost = inner;
  }
  /* ===== DECK ART: the object being measured =============================
     The review deck shows each page's real object (table, door, पलंग, अलमारी…)
     with the blocks laid along it; the build had no assets/ at all, so
     every slide rendered a bare row of 🧱 fallbacks. The cut-outs are imported
     from the deck and named per slide in data.scene_img. Injected here, ahead of
     mod.mount, rather than inside each module, so DEMO_COUNT / MAKE_SET /
     COUNT_HOW_MANY all pick it up without touching their own render paths. */
  /* ONE ROW, ALWAYS, on a measuring slide. per_row groups the set into rows of
     N, which on P2 laid 7 units out as 6 + 1 - a measurement broken across two
     lines is not a measurement. Previously this reset lived inside the scene_img
     branch, so the two slides that ship no scene art kept wrapping. */
  /* .mk-on carries every kit style, so it is keyed off the slide being a
     measuring one - NOT off it happening to ship scene art. P2/P3/P4 have no
     scene picture and were left with the default gutters between their units. */
  $("stage").classList.toggle("mk-on", mkIsMeasure(slide));
  if(mkIsMeasure(slide) && slide.data && slide.data.per_row) slide.data.per_row = 0;
  if(slide.data && slide.data.scene_img){
    const fig = document.createElement("div"); fig.className = "measure-obj";
    fig.innerHTML = imgOrEmoji(slide.data.scene_img, (slide.data.object||{}).emoji || "", "measure-obj-img", "measure-obj-emoji");
    mountHost.appendChild(fig);
    /* [kit] bracket the object with the sheet's START / END markers, so the child
       can see WHAT is being measured - from this edge to that edge - before a
       single block is laid. Measuring slides also switch their block row to the
       flush .mk-rail (no gaps between units), which is the skill itself. */
    if(mkIsMeasure(slide)) mkAddMarkers(fig);
  }
  mkClearFloats();   // the floats live on .slide-stage, which outlives #slideHost
  mod.mount(mountHost, slide);
  // game-feel: animate the slide content in on every mount
  { const _sh = $("slideHost"); _sh.classList.remove("slide-in"); void _sh.offsetWidth; _sh.classList.add("slide-in"); }

  // vertically ink-centre every Devanagari glyph once the slide has laid out
  requestAnimationFrame(()=> centerAllGlyphs($("slideHost")));

  // play the full VO chain automatically (prompt → phoneme/word_name → instruction).
  // If the slide gated its nav button on audio, enable it once the chain finishes
  // (so students can't skip before hearing it). SKIP when the module owns its audio
  // (state.ownsAudio) — else this chain stomps/truncates the module's own timed VO.
  if(!state.ownsAudio){
    autoPlayChain(slide, ()=>{
      if(state.gateNavUntilAudio) setNavActive(true);
      if(state.endBtnPending){ $("endBtn").classList.add("show"); state.endBtnPending = false; }
    });
  }
}

/* ---------- [engine JS] r4/P1 PHASE-TRANSITION PEEK GATE (Shruti's peek beat) ----------
   An automatic interstitial fired ON A PHASE BOUNDARY (not a slide type): blur the stage, Swiftie
   peeks up from the bottom under a big headline, hold ≥2s, then mount the next slide. Kept ALONGSIDE
   our journey-map PHASE_TRANSITION module (a distinct, author-placed slide type) — the gate below
   skips PHASE_TRANSITION + CELEBRATION so the two never double-fire. */
function afterConfetti(fn){
  /* ===== FLN ANIMATION KIT: confetti (advance gate) BEGIN =====
     Recipe 7 renders into .fx-confetti, not the retired .conf-shot, so this gate
     was about to poll for an element that can no longer exist and wave every
     slide straight through mid-celebration. FLNMotion.confetti.after() is the
     kit's own version of this poll, with the same 8s cap. */
  FLNMotion.confetti.after(fn);
  /* ===== FLN ANIMATION KIT: confetti (advance gate) END ===== */
}
/* onscreen headline per gate (display only; distinct from any narration). Eligibility = phase IN this map. */
const PHASE_GATE_TITLE = { tutorial:"चलिए, शुरू करें!", guided:"चलिए, साथ में करें!", practice:"अब आपकी बारी!" };   // [16h] the lead’s official transition lines (VO = full sentences in the card manifest; NOTE aap-register — flagged)
const PHASE_GATE_VO    = { tutorial:"vo_pt_tutorial", guided:"vo_pt_guided", practice:"vo_pt_practice" };
/* [peek-2] The clip's own length, and the CSS duck-down that follows it. Both are contracts
   with assets/gif/peeking.webp and @keyframes pgDuck — if either is re-cut, change it here too. */
const ANIM_ASSETS = ["loader.gif", "new_landing_swiftee_anim.webp", "peeking.webp", "sw_anim_talk.gif", "sw_anim_teach.gif", "sw_anim_tryagain.gif", "sw_head_celebrate_anim.webp", "sw_head_hint_anim.webp", "sw_head_tryagain_anim.webp", "sw_lg_celebrating_anim.webp"];
const PG_CLIP_MS = 9720;  // peeking.webp: hands arrive, peek, blink, come out, talk with blinks, duck back; 9.72s, plays once.
const PG_EXIT_MS = 520;    // .phase-gate.leaving / @keyframes pgDuck - a FALLBACK bound only; animationend is what actually closes the gate
const _gatedPhases = new Set();   // each phase gate plays ONCE (Start→tutorial, →guided, →practice)
let _gateToken = 0;
function phaseBlurTransition(cb, toPhase){
  const tok = ++_gateToken;
  stopNudge(); stopAudio();
  const gate = $("phaseGate"), img = $("phaseGateImg");
  if(img) img.src = "assets/gif/peeking.webp?r=" + Date.now();   // restart the loop each time (cache-bust)
  const title = $("phaseGateTitle"); if(title) title.textContent = PHASE_GATE_TITLE[toPhase] || "";
  $("stage").classList.add("blurred", "gating");
  document.body.classList.add("gating");
  gate.classList.remove("leaving");   // a gate interrupted mid-exit would open her already off-screen
  gate.classList.add("show");
  GameBus.emit("phase_transition", { to: toPhase });
  const closeGate = ()=>{ gate.classList.remove("show", "leaving"); $("stage").classList.remove("blurred", "gating"); document.body.classList.remove("gating"); };
  // VO only if the card actually ships it; else a silent beat — the 2s min-hold keeps the peek visible.
  const voId = PHASE_GATE_VO[toPhase];
  const voSrc = (voId && CARD.assets && CARD.assets.audio && CARD.assets.audio[voId]) || null;
  const openedAt = Date.now();
  play(voSrc, ()=>{
    if(tok !== _gateToken){ closeGate(); return; }               // a newer gate superseded us
    /* peeking.webp now plays ONCE: rise, talk, then park on her smile (PG_CLIP_MS).
       The floor is that clip plus the duck-down, so the beat always completes even
       with no VO or a short one - the old 3100ms floor was cut to the 3.03s looping
       clip and closed the gate mid-rise on a silent card. If a future VO is LONGER
       than the clip, the VO still governs: play()'s callback is what starts this
       timer, and Swiftie holds her parked smile until it fires. */
    const hold = Math.max(0, PG_CLIP_MS - (Date.now() - openedAt));
    const finish = ()=>{
      gate.classList.remove("show", "leaving");
      $("stage").classList.remove("blurred");
      if(cb) cb();                              // mounts the next slide
      $("stage").classList.remove("gating");    // header returns once the slide is in
      document.body.classList.remove("gating");
    };
    /* Send her back down BEFORE the gate is torn down, not with it - the clip no longer
       ducks on its own (it can't: it would have to know how long the VO is). The close
       waits on animationend, NOT on a matching setTimeout: a fixed PG_EXIT_MS timer
       raced the animation and lost - decoding the clip's tail delayed the animation's
       first frame by ~270ms, so the gate vanished with Swiftie still barely moved. */
    setTimeout(()=>{
      if(tok !== _gateToken){ closeGate(); return; }   // a newer gate superseded us
      let done = false, fallback = 0;
      const once = ()=>{
        if(done) return; done = true;
        clearTimeout(fallback);
        if(img) img.removeEventListener("animationend", once);
        if(tok !== _gateToken){ closeGate(); return; }
        finish();
      };
      if(img) img.addEventListener("animationend", once);
      gate.classList.add("leaving");
      // reduced-motion, a missing clip, a backgrounded tab: nothing to end, so close anyway
      fallback = setTimeout(once, PG_EXIT_MS + 500);
    }, hold);
  });
}

function completeSlide(success){
  const slide = CARD.slides[state.idx];
  GameBus.emit("slide_completed", {
    slide_id: slide.id, phase: slide.phase, success: !!success,
    attempts: state.attempts + (success ? 1 : 0), latency_ms: Date.now()-state.slideStart,
    scaffold_level: state.scaffoldLevel, hint_used: state.hintUsed,
    nudge_used: state.nudgeUsed, audio_replays: state.audioReplays
  });
  if(state.idx >= CARD.slides.length - 1){
    // last slide is CELEBRATION; nothing more
    return;
  }
  // advance only AFTER the correct-answer confetti has landed (to the gate AND to the next slide alike).
  const fromIdx = state.idx, nextIdx = state.idx + 1;
  const next = CARD.slides[nextIdx];
  if(next && next.phase !== slide.phase && next.type !== "CELEBRATION" && next.type !== "PHASE_TRANSITION"
     && PHASE_GATE_TITLE[next.phase] && !_gatedPhases.has(next.phase)){
    _gatedPhases.add(next.phase);
    afterConfetti(()=>{ if(state.idx === fromIdx) phaseBlurTransition(()=> mountSlide(nextIdx), next.phase); });
    return;
  }
  afterConfetti(()=>{ if(state.idx === fromIdx) mountSlide(nextIdx); });
}

/* ---------- 14. VALIDATOR (runtime self-check) ---------- */
function runValidator(){
  const missing = (CARD.signals_expected || []).filter(s => !GameBus.firedSet.has(s));
  GameBus.validatorReport.missing_signals = missing;
  GameBus.validatorReport.passed = missing.length === 0;
  console.log("[validator]", GameBus.validatorReport);
  try{ window.parent?.postMessage({type:"swiftpal:lesson_complete", signals: GameBus.signals, validatorReport: GameBus.validatorReport}, "*"); }catch(e){}
  // offline self-capture: write the final record to localStorage; optionally POST
  // it to a learning-record endpoint if one is configured AND the device is online.
  GameBus.persist();
  if(TELEMETRY.endpoint && navigator.onLine){
    try{ fetch(TELEMETRY.endpoint, {method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(GameBus.exportResults()), keepalive:true}).catch(()=>{}); }catch(e){}
  }
  // dev banner
  if(new URLSearchParams(location.search).has("dev")){
    const b = $("devBanner");
    if(missing.length === 0){ b.textContent = "✓ all expected signals fired"; b.className = "dev-banner show ok"; }
    else { b.textContent = "✗ missing signals: " + missing.join(", "); b.className = "dev-banner show"; }
  }
}

/* ---------- [engine JS] r4/#2 DATA-DRIVEN LANDING CONCEPT STRIP ----------
   A landing_hero of kind "concept_strip" renders N visual-example tiles from card data, so any game
   declares its landing preview in card.json instead of hand-editing HTML. Tile types: discs (size),
   bars (length), balance (weight — equal-size objects, heavier lower, never a size cue), image. */
const SG_BALANCE_SVG =
  '<svg viewBox="0 0 124 112" xmlns="http://www.w3.org/2000/svg">' +
  '<line x1="62" y1="30" x2="62" y2="86" stroke="#8AA0C8" stroke-width="6" stroke-linecap="round"/>' +
  '<polygon points="62,60 44,100 80,100" fill="#8AA0C8"/>' +
  '<g transform="rotate(-13 62 34)">' +
  '<rect x="14" y="30" width="96" height="11" rx="5.5" fill="#4EA3F0"/>' +
  '<circle cx="22" cy="20" r="14" fill="#FBD24B" stroke="#D9A21A" stroke-width="2.5"/>' +
  '<circle cx="102" cy="20" r="14" fill="#98A2B3" stroke="#5B6577" stroke-width="2.5"/>' +
  '</g></svg>';
function conceptTileHTML(c){
  const lbl = c && c.label ? ` aria-label="${c.label}"` : "";   // a11y only; not shown (pre-reader → visual+VO)
  switch(c && c.type){
    case "discs": {
      const sizes = c.sizes || [34, 54, 76];
      return `<div class="sg-ex sg-ex-size" role="img"${lbl}>` +
        sizes.map(s => `<span class="sg-disc" style="width:${s}px;height:${s}px"></span>`).join("") + `</div>`;
    }
    case "bars": {
      const widths = c.widths || [42, 72, 102];
      return `<div class="sg-ex sg-ex-len" role="img"${lbl}>` +
        widths.map(w => `<span class="sg-bar" style="width:${w}px"></span>`).join("") + `</div>`;
    }
    case "balance":
      return `<div class="sg-ex sg-ex-wt" role="img"${lbl}>` + SG_BALANCE_SVG + `</div>`;
    case "image":
      return `<div class="sg-ex" role="img"${lbl}><img src="${c.src}" alt="${c.label || ''}"></div>`;
    default:
      return "";
  }
}

/* ---------- 15. BOOT ---------- */
function boot(){
  /* [14] activity_launched - once, at mount */
  try{ XAPI.once("activity_launched", { skill_code: CARD.skill_code, title: (CARD.title&&CARD.title.en)||"" }); }catch(e){}
  // god-mode visual theme (opt-in via CARD.theme) — warms the whole stage; scoped CSS under .thm-*
  if(CARD.theme) $("stage").classList.add("thm-" + CARD.theme);
  // banner title = skill name only (strip "(भाग…)" and the ": letters" list)
  $("sgTitle").textContent = (CARD.title.hi || "").split(/[:：(]/)[0].trim();
  // VISUAL-FIRST landing hero: SHOW the concept (shapes row / a finger-hand / an image), not just the title text
  (function(){ const hero = CARD.landing_hero, el = $("sgHero"); if(!hero || !el) return;
    if(hero.kind === "concept_strip"){
      // r4/#2: each cell is a .sg-acell (keeps the staggered fingerPop pop-in) wrapping a visual example.
      el.innerHTML = (hero.cells || []).map(c => `<div class="sg-acell">${conceptTileHTML(c)}</div>`).join("");
      /* HI01 PARITY: the early `return` here kept MTG's own landing type scale - 60px title and a
         150px content margin - by skipping the .compact / .has-hero classes every other hero kind
         adds. That is the whole remaining title-size and spacing gap against HI01, which runs the
         42px compact title and a 120px has-hero margin. Falling through instead of returning. */
    }
    if(hero.kind === "shapes" && typeof shapeSVG === "function")
      el.innerHTML = (hero.shapes||[]).map(s=> shapeSVG(s.shape, {color:s.color, size:104, rotate:s.rotate||0})).join("");
    else if(hero.kind === "count"){
      // counting game: preview the WHOLE 1..n sequence — a row of hands (1,2,3…), each with its Arabic numeral
      const hi = Math.min(Math.max(parseInt(hero.n,10)||3, 1), 5);   // clamp to available hand art (1..5)
      let cells = "";
      for(let i=1;i<=hi;i++){
        cells += `<div class="sg-hand-cell">${fingerCount(i, "sg-hand")}<span class="sg-hand-num">${devNumeral(i)}</span></div>`;
      }
      el.innerHTML = cells;
    }
    else if(hero.kind === "image") el.innerHTML = `<img src="${hero.src}" alt="">`;
    if(el.innerHTML){ el.classList.add("show"); $("sgTitle").classList.add("compact");
      const c = el.closest && el.closest(".sg-content"); if(c){ c.classList.add("has-hero");
        // SME (S01 review deck): landing reads TITLE first, image BELOW it, image smaller.
        if(hero.title_first) c.classList.add("title-first"); } }
  })();

  // ----- landing-screen welcome VO (lead review) -----
  // A warm greeting on the title screen. Autoplay is often blocked before a gesture, so we also
  // (a) expose a pulsing 🔊 "listen" button, and (b) fire it on the first pointer-down. The whole
  // greeting lives HERE now (not on slide 0), which also kills the old overlap glitch where the
  // landing VO and slide-0 VO could talk over each other.
  const landSrc = (CARD.assets && CARD.assets.audio && CARD.assets.audio["vo_landing"]) || ("assets/voiceover/vo_landing." + AUDIO_EXT);
  /* ---- PLAY BUTTON WAITS FOR THE GREETING, THEN POPS (as HI02H11_L01_S01, the reference game) ----
     While the landing greeting speaks, the play button is shown but DISABLED in its grey waiting art
     (btn-play-blob-waiting.svg) - a bright button that ignores taps reads as broken. When the greeting
     ENDS it swaps to the gold art with a one-shot pop + gold ring (.sg-pop), and becomes tappable.
     If the child then does nothing for 5s it starts the strong idle pulse (.idle-pulse, the reference's
     sgBtnPulseStrong); any tap on the landing restarts that 5s timer.
     "Heard" means the clip really played to its end (voEl.ended). When the browser BLOCKS autoplay the
     button stays grey and the child's first tap - anywhere, the grey button included - starts the
     greeting, so the pop still lands exactly when the greeting ends. Never strands the child: a 15s
     watchdog releases the button even if the greeting never reports back at all.
     NB the waiting state is .sg-waiting + aria-disabled, NOT the disabled attribute - a disabled
     button swallows the tap that has to start a blocked greeting. */
  let _greetingHeard = false, _startIdleT = 0, _startWatchT = 0;
  const onLandingNow = ()=> { const g = $("startGate"); return g && !g.classList.contains("hidden"); };
  const startWaiting = ()=>{ const b = $("sgBtn"); return !b || b.classList.contains("sg-waiting"); };
  const disarmStartPulse = ()=>{ clearTimeout(_startIdleT); _startIdleT = 0; const b = $("sgBtn"); if(b) b.classList.remove("idle-pulse"); };
  const armStartPulse = ()=>{
    disarmStartPulse();
    _startIdleT = setTimeout(()=>{ const b = $("sgBtn"); if(b && !startWaiting() && onLandingNow()) b.classList.add("idle-pulse"); }, 5000);
  };
  const setStartBtnReady = (ready)=>{
    const b = $("sgBtn"); if(!b) return;
    const img = b.querySelector("img");
    const was = !startWaiting();
    b.disabled = false;
    b.classList.toggle("sg-waiting", !ready);
    b.setAttribute("aria-disabled", ready ? "false" : "true");
    if(img) img.src = ready ? "assets/btn-play-blob.svg" : "assets/btn-play-blob-waiting.svg";
    if(!ready){ disarmStartPulse(); b.classList.remove("sg-pop"); return; }
    if(!was){ b.classList.remove("sg-pop"); void b.offsetWidth; b.classList.add("sg-pop");
      setTimeout(()=> b.classList.remove("sg-pop"), 900); }
    armStartPulse();
  };
  setStartBtnReady(false);   // grey + disabled from first paint, until the greeting has been heard
  /* [landing intro] the gold pop waits for the whole intro too (title words -> cubes -> lines, "sg-intro-done"),
     so the button is the LAST thing to arrive (review 2026-09-29). The 15s watchdog still forces it - never stranded. */
  let _releasePending = false;
  const releaseStart = (force)=>{ if(!force && !window.__sgIntroDone){ _releasePending = true; return; }
    clearTimeout(_startWatchT); _releasePending = false; if(onLandingNow()) setStartBtnReady(true); };
  document.addEventListener("sg-intro-done", ()=>{ if(_releasePending) releaseStart(); });
  const playLanding = ()=>{
    if(!onLandingNow()) return;
    clearTimeout(_startWatchT); _startWatchT = setTimeout(()=> releaseStart(true), 15000);   // watchdog (forces it)
    /* released only when the greeting was really heard; a blocked/failed start leaves it grey for the
       child's first tap (or the watchdog) */
    play(landSrc, ()=>{ if(voEl.ended){ _greetingHeard = true; releaseStart(); } });
  };
  // any tap on the landing restarts the 5s idle timer (only once the button is live)
  window.addEventListener("pointerdown", ()=>{ if(onLandingNow() && !startWaiting()) armStartPulse(); }, true);
  const sgVo = $("sgVo"); if(sgVo) sgVo.onclick = (e)=>{ e.stopPropagation();
    if(replayTap(null, "landing_chip")) playLanding(); };   // [QA 11] the landing chip reports audio_replayed too
  /* ---- [landing mascot player] (review 2026-09-29: "swifty is getting glitched ... at the starting only"). Measured
     on the landing with a frame-by-frame screen recording: in about half the loads Chrome paints NOTHING where Swifty
     is for 1-2 frames, exactly when the <img>'s animated WebP (560x550, alpha) steps to its next frame while the landing
     is busy starting up - with the original HI01 file too. A canvas cannot blink like that: it keeps its last picture
     until the next one is drawn. So where the browser can decode the file itself (WebCodecs ImageDecoder), Swifty is
     drawn on a canvas at its displayed size, the next frame always decoded ahead. Anything missing or failing (no
     ImageDecoder, file:// fetch, a decode error, not ready when the loader lifts) keeps the plain <img> and its restart
     below, exactly as before. ---- */
  const sgMascotPlayer = (()=>{
    const img = document.querySelector(".sg-mascot");
    if(!img || typeof ImageDecoder === "undefined" || typeof fetch === "undefined") return null;
    const url = (img.getAttribute("src") || "").split("?")[0], TYPE = "image/webp";
    let dec = null, count = 0, first = null, ok = false, dead = false;
    (async ()=>{                                                   // decode starts at once, under the loader
      if(ImageDecoder.isTypeSupported && !(await ImageDecoder.isTypeSupported(TYPE))) return;
      const res = await fetch(url); if(!res.ok) return;
      dec = new ImageDecoder({ data: await res.arrayBuffer(), type: TYPE });
      await dec.tracks.ready; count = dec.tracks.selectedTrack.frameCount;
      first = (await dec.decode({ frameIndex: 0 })).image;
      ok = count > 0 && !dead;
    })().catch(()=>{ ok = false; });
    function start(){                                              // the loader lifting; false = keep the <img>
      if(!ok || !img.isConnected){ dead = true; return false; }
      try {
        const r = img.getBoundingClientRect(), W = Math.max(1, Math.round(r.width * (window.devicePixelRatio || 1)));
        const H = Math.max(1, Math.round(W * first.displayHeight / first.displayWidth));
        const cv = document.createElement("canvas"); cv.className = img.className; cv.width = W; cv.height = H;
        cv.setAttribute("role", "img"); cv.setAttribute("aria-label", img.getAttribute("alt") || "");
        const ctx = cv.getContext("2d"); ctx.imageSmoothingQuality = "high";
        const draw = f => { ctx.clearRect(0, 0, W, H); ctx.drawImage(f, 0, 0, W, H); };   // one task: never shown half-drawn
        draw(first); img.replaceWith(cv);
        let i = 0, cur = first, due = performance.now() + (cur.duration || 90000) / 1000;   // VideoFrame.duration is in us
        let next = count > 1 ? dec.decode({ frameIndex: 1 }) : null;
        const step = async ()=>{
          if(!next){ cur.close(); dec.close(); return; }             // plays once: the last frame stays drawn
          let n; try { n = (await next).image; } catch(e){ return; }  // a failed decode: the frame on show simply stays
          const wait = due - performance.now();
          if(wait > 1) await new Promise(res => setTimeout(res, wait));
          draw(n); cur.close(); cur = n; i++;
          due = Math.max(due, performance.now() - 30) + (n.duration || 90000) / 1000;
          next = i + 1 < count ? dec.decode({ frameIndex: i + 1 }) : null;   // decoded while this one is on show
          step();
        };
        step();
        return true;
      } catch(e){ dead = true; return false; }
    }
    return { start };
  })();
  // ---- [engine JS] r4/P2 boot loader: loader.gif until assets warm, then it dismisses ITSELF into
  // the landing (NO tap gate). DUAL auto-dismiss (window 'load' OR a 2.5s watchdog — never strand the
  // child), deduped by .done. The same handler adds body.loaded (unblocks the concept-strip stagger)
  // and fires the landing VO. play() absorbs an autoplay block; the pulsing 🔊 chip is the fallback. ----
  (function(){
    const bl = $("bootLoader"); if(!bl){ document.body.classList.add("loaded"); playLanding(); return; }
    const ready = ()=>{
      if(bl.classList.contains("done")) return;   // load event + watchdog both land here → dedup
      bl.classList.add("done");
      document.body.classList.add("loaded");       // starts the .sg-acell pop chain
      /* [QA 03] the landing wave plays ONCE (the .webp's loop count is 1). It decodes under the
         loader, so without a restart the one wave would be spent before the child sees it -
         re-point the src (cache-busted, same trick as peeking.webp) the moment the loader lifts. */
      const sgm = document.querySelector(".sg-mascot");
      if(sgm && !(sgMascotPlayer && sgMascotPlayer.start())){       // the canvas player (above) when it can; else as before:
        const base = (sgm.getAttribute("src") || "").split("?")[0]; if(base) sgm.src = base + "?r=" + Date.now(); }
      playLanding();
      setTimeout(()=> bl.remove(), 450);
    };
    /* ===== QA CHECKLIST [02]: PRELOAD EVERYTHING BEFORE THE START SCREEN =====
       `window.load` only waits for nodes already in the DOM. Every image this
       game uses is either a CSS background or injected per-slide, and no audio
       was warmed at all, so art and VO popped in mid-lesson. This walks the
       real asset list - card images, card audio, and the UI art the stylesheet
       and slides reference - and holds the branded loader until all of it has
       resolved, plus document.fonts.ready so no glyph reflows after paint.
       A FAILED ASSET COUNTS AS DONE, so a 404 can never strand the child. */
    const PRELOAD = (function(){
      const ext = (CARD.assets && CARD.assets.audio_ext) || AUDIO_EXT;
      const imgs = [], auds = [];
      const A = (CARD.assets || {});
      Object.keys(A.image || {}).forEach(k => imgs.push(A.image[k]));
      Object.keys(A.audio || {}).forEach(k => {
        const v = A.audio[k];
        auds.push(typeof v === "string" && v.indexOf("assets/") === 0 ? v : "assets/voiceover/" + k + "." + ext);
      });
      auds.push("assets/voiceover/sfx_celebrate." + ext);   /* [QA 02] the celebration sting (playSfx), not in the VO map */
      [ "loader.gif","startnew_bg_plain.webp","start_card.webp","background_1st_screen.webp","pencil_purple.webp","pencil_face_rig.webp","cubes_blue_row.webp","new_landing_swiftee_anim.webp",
        "end_screen.webp","peeking.webp","nudge_hand_new.svg","mascot.webp",
        "bgdeco_star.svg","bgdeco_star_o.svg","bgdeco_spark.svg",
        "sw_head_talking.webp","sw_head_celebrate.webp","sw_head_celebrate_anim.webp",
        "sw_head_hint.webp","sw_head_hint_anim.webp","sw_head_neutral.webp",
        "sw_head_tryagain.webp","sw_head_tryagain_anim.webp",
        "sw_lg_celebrating_anim.webp",
        /* [QA 02] used in play but missing from this list: the tutorial-card mascot (every tutorial
           slide), the landing play button, and the feedback-card rest pose */
        "start_mascot.webp","btn-play-blob.svg","btn-play-blob-waiting.svg","sw_anim_rest.png",
        /* [QA 10] the real button assets (default + deactive) */
        "btn-next-default.svg","btn-next-deactive.svg","btn-continue-default.svg","btn-continue-deactive.svg"
      ].forEach(f => imgs.push("assets/" + (ANIM_ASSETS.indexOf(f) >= 0 ? "gif/" : "") + f));
      /* deck object art - preload so it never pops in mid-lesson [QA 02] */
      ["obj_door","obj_bed","obj_almirah","obj_pillow","obj_fridge","obj_mat_1","obj_chairs"   /* [QA 01] only the ones a slide shows */
      ].forEach(f => imgs.push("assets/" + f + ".webp"));
      /* [kit] measurement art kit - the block states, markers, wrong-way figures,
         result plate and the Swiftie poses the feedback card reads. */
      ["mk_block","mk_block_placed","mk_block_ghost","mk_block_glow",
       "mk_marker_start","mk_marker_end","mk_err_gap","mk_err_overlap",
       "mk_sparkle","mk_badge_blank",
       "mk_sw_explain","mk_sw_guide","mk_sw_cheer"   /* [QA 01] the three poses MK.sw actually reads */
      ].forEach(f => imgs.push("assets/" + f + "." + IMG_EXT));
      return { imgs: imgs, auds: auds, total: imgs.length + auds.length };
    })();

    let _left = PRELOAD.total + 1;                    // +1 for the font pass
    const _tick = ()=>{ if(--_left <= 0) ready(); };  // a 404 still ticks - never strand
    PRELOAD.imgs.forEach(src => { const i = new Image(); i.onload = i.onerror = _tick; i.src = src; });
    PRELOAD.auds.forEach(src => {
      const a = new Audio(); let fired = false;
      /* once fetched, drop the element's source: the bytes stay in the HTTP cache for play(),
         and the media player behind this element is released instead of held all session.
         canplaythrough fires BEFORE a long clip is fully downloaded, so the release waits until
         the whole clip is buffered (or 15s) - releasing early aborted the tail of a long clip (the old 24.8s T2 prompt). */
      const release = ()=>{ a.onprogress = null; try{ a.removeAttribute("src"); a.load(); }catch(e){} };
      const full = ()=>{ try{ return a.buffered.length && a.duration && a.buffered.end(a.buffered.length - 1) >= a.duration - 0.05; }catch(e){ return false; } };
      const once = ()=>{ if(!fired){ fired = true; a.oncanplaythrough = a.onerror = a.onabort = null;
        if(full()) release(); else { a.onprogress = ()=>{ if(full()) release(); }; setTimeout(release, 15000); }
        _tick(); } };
      a.oncanplaythrough = a.onerror = a.onabort = once;
      a.preload = "auto"; a.src = src;
      setTimeout(once, 6000);                          // a stalled clip must not hold the gate
    });
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(_tick, _tick);
    else _tick();

    if(document.readyState !== "complete") window.addEventListener("load", ()=>{});
    setTimeout(ready, 12000);   // hard watchdog: never strand the child on the loader
  })();
  // landing VO best-effort on first interaction too (some browsers block autoplay pre-gesture)
  /* ...but not when the greeting has already been heard or is playing now, and never on the play button
     itself - tapping the live gold button used to restart the greeting a split second before its click
     silenced it again. */
  window.addEventListener("pointerdown", function once(ev){ window.removeEventListener("pointerdown", once);
    if(ev && ev.target && ev.target.closest && ev.target.closest("#sgBtn")) return;
    if(!_greetingHeard && !isPlaying) playLanding(); }, { once:true });

  $("sgBtn").onclick = ()=>{
    if(startWaiting()){                 // still waiting for the greeting: a tap can only START it
      if(!_greetingHeard && !isPlaying) playLanding();
      return;
    }
    disarmStartPulse(); clearTimeout(_startWatchT);
    stopAudio();          // silence the landing greeting BEFORE slide 0 speaks (no VO overlap)
    _ac();                // unlock/resume WebAudio on the start gesture so the first clip never clips
    // [engine JS] r4/P1: peek gate into the tutorial. The landing stays visible-and-BLURRED behind the
    // peeking Swiftie + "चलिए शुरू करें"; it hides once the tutorial mounts (in the callback).
    _gatedPhases.add("tutorial");
    phaseBlurTransition(()=>{
      $("startGate").classList.add("hidden");
      document.body.classList.remove("is-start");   // blue bg only on the title screen
      mountSlide(0);
    }, "tutorial");
  };
  /* ===== [landing title fx] लंबाई STRETCHES TO THE PENCIL NIB AND SPRINGS BACK; मापना BECOMES A RULER =====
     (review 2026-09-28/29). Starts on the spoken "आज" (आज हम सीखेंगे), 3.13s into vo_landing.ogg - 2.3s before "लंबाई"
     (5.41s), so the animation has time to be unhurried and still ends when it did (edge-tts word
     boundaries of the same line, aligned to this clip and mapped through the VO re-time). From that moment it runs
     on the wall clock, so it is smooth and the same every time.
     AT REST it is the real CSS heading. While it moves, each letter group (लं बा ई | मा प ना) is a copy of that text
     in the same .sg-title style, painted as one text run paints (every blue/ambient shadow, then every white
     outline, then every fill), so the swap to the copies and back is invisible. Each word is its own composited
     stack, so a fade never shows the outline through a half-faded fill. This font breaks its top line between
     letters; while the word moves one continuous line takes its place, and the letters' own pieces come back after.
     ALL of it runs SLOW = 1.5x slower than the times written here (one clock for everything, so the rhythm is kept).
     लंबाई (slow: ~1.0s stretch, 0.3s hold, ~2.5s spring back):
       - pull: the right end (ई's right edge) is the FIXED end; the left end (ल's left edge) is drawn PAST the pencil
         nib tip, by PAST_NIB px beyond it. Uniform strain between them: each letter group moves in proportion to its distance from the
         fixed end. The line is taut and straight.
       - release: the spring snaps back, s(t) = D cos(w t) (0.9 Hz).
       - HARD STOP: at rest the letters already touch - the word is at its SOLID length, like a coil spring with
         closed coils - so it cannot compress past rest and letters never overlap. It hits the stop at v = D w and
         rebounds with restitution e = .3 (v -> e v): a few smaller bounces, each s(t) = (e v / w) sin(w t).
       - CURL: at each impact the letters stop but the top line's own material keeps moving, so it buckles into a
         damped standing wave, y(u,t) = C v e^(-g t) sin(wl t) sin(m pi u), m = 5 half-waves. The letters hang from
         the line and stay joined to it: while it curls the word is drawn from its own outlines (font data) and each
         letter's upper part bends with the line, easing to nothing at the baseline.
       - SET: the first impact also bends the line for good, like an over-stretched spring - its rest shape becomes
         the wave (dip first, 3 dips and 2 humps, height 4% of the word), reached critically damped while the curl
         waves ring about it and die away. It STAYS wavy while मापना's ruler forms and shows, then straightens
         TOGETHER with मापना's own reversal (same start, same end), and the real heading comes back.
     मापना (starts only once लंबाई's animation is completely done - one after the other): the word goes
     grey ("disabled") while its letters move apart - so each mark gets clean space of its own - then its ruler top
     line forms one letter at a time - the line over मा only, with मा coming back
     in orange along it, then प with its line, then ना with its line - with a start mark and a mark after each letter,
     springing out through the line equally above and below it (no numbers). The finished ruler shows for a moment
     (the heading has grown to the right; it is NOT re-centred), then BOTH words UNDO together: लंबाई's wave
     straightens while मापना goes back to normal - the marks pull back into the line and the letters slide back
     together - which by itself returns the heading to its centred place. ONLY THEN (review 2026-09-29: undo before
     the words are placed at the centre) do the two words move in towards the centre, closer to each other (word gap
     28px -> 14px, each word half the way), and the real heading returns with that closer gap. */
  (function(){
    const titleEl = $("sgTitle");
    if(!titleEl || titleEl.textContent.trim() !== "लंबाई मापना") return;
    const reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const T_WORD = 3.13;                                       // "आज" (आज हम सीखेंगे) starts, in vo_landing.ogg (seconds) - review 2026-09-29 (was "लंबाई", 5.46)
    const PULL = 0.6, HOLD = 0.15;                             // stretch, then a short hold at full stretch (tightened 2026-09-29: the
                                                               // whole first screen must stay short - 15 slides follow)
    const PAST_NIB = 5;                                        // stage px: ल's left edge is pulled this far PAST the pencil nib tip.
                                                               // Review 2026-09-29: "keep the stretch just ahead of the nib only" -
                                                               // a few px beyond the tip (was 16, earlier 50/70). The spring-back/
                                                               // bounce/curl scale with the stretch.
    const BAND_TOP = 39.68, BAND_BOT = 32.6;                   // headline band, px above the baseline (Baloo 2 800 @64px)
    const BAR_T = BAND_TOP - BAND_BOT, BAR_MID = (BAND_TOP + BAND_BOT) / 2, HOLE_TOP = 0.3, HOLE_KEEP = 0.6, BAR_R = 2.4;
    const W0 = 2 * Math.PI * 0.9, RESTITUTION = 0.3, HALF_WAVES = 5;                         // spring + hard stop
    const CURL_C = 0.016, CURL_W = 2 * Math.PI * 1.6, CURL_G = 1.4, CURL_MAX = 7;           // line buckling at impact
    const SET_A = 0.04, SET_G = 5;                                                           // the wave it keeps: height / word length, settling rate
    const SLOW = 1.5;                                                                        // one clock for the whole title animation: 1.5x slower, and it starts on "आज", 2.33s earlier -
                                                                                             // so it still ENDS when it did (5.04s -> 7.5s, same end; review 2026-09-29: no rushed animation, first screen not longer)
    const W2_START = 1.0;                                                                    // मापना starts this long (s) into लंबाई's spring-back, not only once it is fully still
    const GAP_END = 14;                                                                      // word-spacing (px) the heading ENDS with: the words a little closer than at the start (28)
    // the heading's sticker look (.sg-title text-shadow) for the drawn parts: white pen, blue extrusion, ambient
    const OUT_W = 8.4, EXT_DY = 4.8, ORANGE = "#F85A00", BLUE = "#2F82DE", AMB = "rgba(0,40,120,.26)", GREY = "#9A9AA6", GREY_DOT = "#6F6F7B";
    const DATA = {"w1_flat":[[[[29.5,-10.82],[28.69,-10.58],[27.88,-10.39],[27.07,-10.24],[26.25,-10.13],[25.39,-10.07],[24.51,-10.05],[23.54,-10.1],[22.69,-10.26],[21.95,-10.52],[21.32,-10.89],[20.8,-11.36],[20.3,-12.07],[19.94,-12.89],[19.72,-13.81],[19.65,-14.85],[19.67,-15.7],[19.74,-16.53],[19.86,-17.35],[20.02,-18.14],[20.23,-18.92],[20.18,-18.93],[20.13,-18.94],[19.27,-19.09],[18.43,-19.14],[17.54,-19.09],[16.72,-18.95],[15.99,-18.71],[15.35,-18.38],[14.78,-17.96],[14.3,-17.44],[13.83,-16.74],[13.46,-16.0],[13.2,-15.21],[13.04,-14.38],[12.99,-13.5],[13.04,-12.49],[13.19,-11.56],[13.44,-10.71],[13.79,-9.94],[14.24,-9.25],[14.76,-8.63],[15.34,-8.08],[15.97,-7.59],[16.65,-7.17],[17.38,-6.82],[18.32,-6.45],[19.26,-6.17],[20.19,-5.96],[21.12,-5.82],[21.17,-5.48],[21.18,-5.09],[21.18,-4.35],[21.13,-3.48],[20.97,-2.65],[20.7,-1.86],[20.32,-1.12],[19.84,-0.42],[19.41,0.03],[18.9,0.41],[18.3,0.73],[17.61,0.97],[16.84,1.14],[15.98,1.25],[15.04,1.28],[14.21,1.25],[13.4,1.16],[12.59,1.01],[11.8,0.8],[11.01,0.52],[10.24,0.19],[9.49,-0.2],[8.76,-0.63],[8.06,-1.12],[7.4,-1.66],[6.76,-2.24],[6.14,-2.88],[5.65,-3.46],[5.18,-4.08],[4.74,-4.72],[4.34,-5.4],[3.96,-6.11],[3.61,-6.85],[3.3,-7.62],[3.02,-8.42],[2.78,-9.24],[2.58,-10.09],[2.43,-10.97],[2.33,-11.87],[2.26,-12.8],[2.24,-13.76],[2.26,-14.65],[2.32,-15.52],[2.41,-16.35],[2.55,-17.15],[2.72,-17.92],[2.93,-18.66],[3.18,-19.37],[3.47,-20.05],[3.8,-20.7],[4.16,-21.31],[4.66,-22.04],[5.19,-22.72],[5.76,-23.36],[6.37,-23.95],[7.01,-24.5],[7.69,-25.0],[8.4,-25.45],[9.15,-25.86],[9.93,-26.22],[10.71,-26.53],[11.51,-26.79],[12.32,-27.01],[13.14,-27.18],[13.98,-27.3],[14.82,-27.37],[15.68,-27.39],[16.65,-27.37],[17.57,-27.3],[18.44,-27.19],[19.27,-27.04],[20.06,-26.84],[20.81,-26.59],[21.5,-26.3],[22.47,-25.83],[23.36,-25.32],[24.19,-24.78],[24.84,-25.26],[25.54,-25.7],[26.19,-26.05],[26.87,-26.37],[27.58,-26.64],[28.31,-26.87],[29.07,-27.06],[29.86,-27.2],[30.67,-27.31],[31.52,-27.37],[32.38,-27.39],[33.35,-27.37],[34.27,-27.3],[35.14,-27.19],[35.14,-28.01],[35.14,-28.83],[35.14,-29.66],[35.14,-30.48],[35.14,-31.3],[35.14,-32.13],[34.33,-32.13],[33.53,-32.13],[32.73,-32.13],[31.93,-32.13],[31.12,-32.13],[30.32,-32.13],[29.52,-32.13],[28.72,-32.13],[27.92,-32.13],[27.11,-32.13],[26.31,-32.13],[25.51,-32.13],[24.71,-32.13],[23.9,-32.13],[23.1,-32.13],[22.3,-32.13],[21.5,-32.13],[20.7,-32.13],[19.89,-32.13],[19.09,-32.13],[18.29,-32.13],[17.49,-32.13],[16.68,-32.13],[15.88,-32.13],[15.08,-32.13],[14.28,-32.13],[13.48,-32.13],[12.67,-32.13],[11.87,-32.13],[11.07,-32.13],[10.27,-32.13],[9.46,-32.13],[8.66,-32.13],[7.86,-32.13],[7.06,-32.13],[6.26,-32.13],[5.45,-32.13],[4.65,-32.13],[3.85,-32.13],[3.05,-32.13],[2.24,-32.13],[1.44,-32.13],[0.64,-32.13],[-0.32,-32.24],[-1.07,-32.57],[-1.6,-33.12],[-1.96,-33.88],[-2.17,-34.86],[-2.24,-36.03],[-2.18,-36.9],[-2.02,-37.95],[-1.78,-38.96],[-1.54,-39.68],[-0.73,-39.68],[0.08,-39.68],[0.88,-39.68],[1.69,-39.68],[2.5,-39.68],[3.3,-39.68],[4.11,-39.68],[4.92,-39.68],[5.72,-39.68],[6.53,-39.68],[7.34,-39.68],[8.14,-39.68],[8.95,-39.68],[9.76,-39.68],[10.56,-39.68],[11.37,-39.68],[12.18,-39.68],[12.98,-39.68],[13.79,-39.68],[14.6,-39.68],[15.4,-39.68],[16.21,-39.68],[17.02,-39.68],[17.82,-39.68],[18.63,-39.68],[19.44,-39.68],[20.24,-39.68],[21.05,-39.68],[21.86,-39.68],[22.66,-39.68],[23.47,-39.68],[24.28,-39.68],[25.08,-39.68],[25.89,-39.68],[26.7,-39.68],[27.5,-39.68],[28.31,-39.68],[29.11,-39.68],[29.92,-39.68],[30.73,-39.68],[31.53,-39.68],[32.34,-39.68],[33.15,-39.68],[33.95,-39.68],[34.76,-39.68],[35.57,-39.68],[36.37,-39.68],[37.18,-39.68],[37.99,-39.68],[38.79,-39.68],[39.6,-39.68],[40.41,-39.68],[41.21,-39.68],[42.02,-39.68],[42.83,-39.68],[43.63,-39.68],[44.44,-39.68],[45.25,-39.68],[46.05,-39.68],[46.86,-39.68],[47.67,-39.68],[48.47,-39.68],[49.28,-39.68],[49.95,-39.62],[50.54,-39.44],[51.03,-39.15],[51.44,-38.74],[51.75,-38.2],[51.98,-37.56],[52.11,-36.79],[52.16,-35.9],[52.1,-34.98],[51.94,-33.89],[51.69,-32.86],[51.39,-32.13],[50.57,-32.13],[49.75,-32.13],[48.92,-32.13],[48.1,-32.13],[47.28,-32.13],[46.45,-32.13],[45.63,-32.13],[45.63,-31.32],[45.63,-30.52],[45.63,-29.72],[45.63,-28.92],[45.63,-28.11],[45.63,-27.31],[45.63,-26.51],[45.63,-25.7],[45.63,-24.9],[45.63,-24.1],[45.63,-23.29],[45.63,-22.49],[45.63,-21.69],[45.63,-20.88],[45.63,-20.08],[45.63,-19.28],[45.63,-18.47],[45.63,-17.67],[45.63,-16.87],[45.63,-16.06],[45.63,-15.26],[45.63,-14.46],[45.63,-13.65],[45.63,-12.85],[45.63,-12.05],[45.63,-11.24],[45.63,-10.44],[45.63,-9.64],[45.63,-8.84],[45.63,-8.03],[45.63,-7.23],[45.63,-6.43],[45.63,-5.62],[45.63,-4.82],[45.63,-4.02],[45.63,-3.21],[45.63,-2.41],[45.63,-1.61],[45.63,-0.8],[45.63,0.0],[44.82,0.25],[43.78,0.48],[42.97,0.6],[42.07,0.68],[41.09,0.7],[40.0,0.67],[39.03,0.58],[38.18,0.42],[37.46,0.21],[36.86,-0.07],[36.38,-0.42],[35.93,-0.92],[35.59,-1.53],[35.34,-2.26],[35.19,-3.09],[35.14,-4.03],[35.14,-4.87],[35.14,-5.71],[35.14,-6.55],[35.14,-7.39],[35.14,-8.22],[35.14,-9.06],[35.14,-9.9],[35.14,-10.74],[35.14,-11.58],[35.14,-12.42],[35.14,-13.25],[35.14,-14.09],[35.14,-14.93],[35.14,-15.77],[35.14,-16.61],[35.14,-17.45],[35.14,-18.28],[35.14,-19.12],[34.95,-19.13],[34.75,-19.14],[33.84,-19.08],[33.02,-18.92],[32.3,-18.65],[31.67,-18.27],[31.13,-17.78],[30.69,-17.18],[30.41,-16.66],[30.17,-16.05],[29.97,-15.37],[29.8,-14.62],[29.67,-13.78],[29.58,-12.87],[29.52,-11.88],[29.5,-10.82]],[[34.5,-49.66],[34.56,-50.56],[34.76,-51.4],[35.08,-52.19],[35.54,-52.92],[36.13,-53.6],[36.7,-54.1],[37.33,-54.51],[38.01,-54.82],[38.74,-55.05],[39.54,-55.19],[40.38,-55.23],[41.21,-55.19],[41.98,-55.05],[42.7,-54.82],[43.37,-54.51],[43.98,-54.1],[44.54,-53.6],[45.12,-52.92],[45.57,-52.19],[45.89,-51.4],[46.08,-50.56],[46.14,-49.66],[46.08,-48.77],[45.89,-47.93],[45.57,-47.14],[45.12,-46.41],[44.54,-45.73],[43.98,-45.23],[43.37,-44.82],[42.7,-44.5],[41.98,-44.28],[41.21,-44.14],[40.38,-44.1],[39.54,-44.14],[38.74,-44.28],[38.01,-44.5],[37.33,-44.82],[36.7,-45.23],[36.13,-45.73],[35.54,-46.41],[35.08,-47.14],[34.76,-47.93],[34.56,-48.77],[34.5,-49.66]]],[[[59.9,-32.13],[59.08,-32.13],[58.26,-32.13],[57.44,-32.13],[56.61,-32.13],[55.79,-32.13],[54.97,-32.13],[54.14,-32.13],[54.14,-31.32],[54.14,-30.52],[54.14,-29.72],[54.14,-28.92],[54.14,-28.11],[54.14,-27.31],[54.14,-26.51],[54.14,-25.7],[54.14,-24.9],[54.14,-24.1],[54.14,-23.29],[54.14,-22.49],[54.14,-21.69],[54.14,-20.88],[54.14,-20.08],[54.14,-19.28],[54.14,-18.47],[54.14,-17.67],[54.14,-16.87],[54.14,-16.06],[54.14,-15.26],[54.14,-14.46],[54.14,-13.65],[54.14,-12.85],[54.14,-12.05],[54.14,-11.24],[54.14,-10.44],[54.14,-9.64],[54.14,-8.84],[54.14,-8.03],[54.14,-7.23],[54.14,-6.43],[54.14,-5.62],[54.14,-4.82],[54.14,-4.02],[54.14,-3.21],[54.14,-2.41],[54.14,-1.61],[54.14,-0.8],[54.14,0.0],[53.33,0.25],[52.29,0.48],[51.48,0.6],[50.58,0.68],[49.6,0.7],[48.51,0.67],[47.54,0.58],[46.7,0.42],[45.97,0.21],[45.37,-0.07],[44.9,-0.42],[44.45,-0.92],[44.1,-1.53],[43.85,-2.26],[43.7,-3.09],[43.65,-4.03],[43.65,-4.83],[43.65,-5.64],[43.65,-6.44],[43.65,-7.24],[43.65,-8.05],[43.65,-8.85],[43.65,-9.65],[43.65,-10.45],[43.65,-11.26],[43.65,-12.06],[43.65,-12.86],[43.65,-13.66],[43.65,-14.47],[43.65,-15.27],[43.65,-16.07],[43.65,-16.88],[43.65,-17.68],[43.65,-18.48],[43.65,-19.28],[43.65,-20.09],[43.65,-20.89],[43.65,-21.69],[43.65,-22.5],[43.65,-23.3],[43.65,-24.1],[43.65,-24.9],[43.65,-25.71],[43.65,-26.51],[43.65,-27.31],[43.65,-28.11],[43.65,-28.92],[43.65,-29.72],[43.65,-30.52],[43.65,-31.33],[43.65,-32.13],[42.79,-32.13],[41.93,-32.13],[41.08,-32.13],[40.22,-32.13],[39.36,-32.13],[38.5,-32.13],[37.64,-32.13],[36.79,-32.13],[35.93,-32.13],[35.07,-32.13],[35.07,-31.32],[35.07,-30.52],[35.07,-29.72],[35.07,-28.92],[35.07,-28.11],[35.07,-27.31],[35.07,-26.51],[35.07,-25.7],[35.07,-24.9],[35.07,-24.1],[35.07,-23.29],[35.07,-22.49],[35.07,-21.69],[35.07,-20.88],[35.07,-20.08],[35.07,-19.28],[35.07,-18.47],[35.07,-17.67],[35.07,-16.87],[35.07,-16.06],[35.07,-15.26],[35.07,-14.46],[35.07,-13.65],[35.07,-12.85],[35.07,-12.05],[35.07,-11.24],[35.07,-10.44],[35.07,-9.64],[35.07,-8.84],[35.07,-8.03],[35.07,-7.23],[35.07,-6.43],[35.07,-5.62],[35.07,-4.82],[35.07,-4.02],[35.07,-3.21],[35.07,-2.41],[35.07,-1.61],[35.07,-0.8],[35.07,0.0],[34.26,0.25],[33.22,0.48],[32.41,0.6],[31.51,0.68],[30.53,0.7],[29.44,0.67],[28.47,0.58],[27.62,0.42],[26.9,0.21],[26.3,-0.07],[25.82,-0.42],[25.37,-0.92],[25.03,-1.53],[24.78,-2.26],[24.63,-3.09],[24.58,-4.03],[24.58,-4.87],[24.58,-5.7],[23.72,-5.26],[22.81,-4.88],[21.86,-4.54],[21.13,-4.34],[20.36,-4.17],[19.55,-4.03],[18.7,-3.92],[17.8,-3.84],[16.86,-3.79],[15.87,-3.78],[14.99,-3.8],[14.12,-3.86],[13.28,-3.95],[12.46,-4.09],[11.66,-4.27],[10.88,-4.49],[10.12,-4.74],[9.39,-5.04],[8.67,-5.38],[7.9,-5.8],[7.17,-6.26],[6.49,-6.76],[5.84,-7.31],[5.24,-7.9],[4.68,-8.53],[4.16,-9.21],[3.68,-9.92],[3.3,-10.59],[2.96,-11.28],[2.67,-12.0],[2.42,-12.74],[2.22,-13.51],[2.06,-14.3],[1.95,-15.12],[1.88,-15.96],[1.86,-16.83],[1.88,-17.78],[1.96,-18.69],[2.1,-19.57],[2.29,-20.42],[2.53,-21.24],[2.83,-22.03],[3.18,-22.79],[3.58,-23.52],[4.04,-24.21],[4.53,-24.87],[5.07,-25.48],[5.65,-26.06],[6.27,-26.59],[6.93,-27.09],[7.64,-27.55],[8.38,-27.97],[9.08,-28.3],[9.79,-28.6],[10.53,-28.86],[11.29,-29.07],[12.07,-29.25],[12.88,-29.39],[13.7,-29.49],[14.55,-29.55],[15.42,-29.57],[16.45,-29.53],[17.39,-29.42],[18.24,-29.22],[19.01,-28.96],[19.69,-28.61],[20.29,-28.19],[20.89,-27.6],[21.35,-26.92],[21.69,-26.16],[21.89,-25.31],[21.95,-24.38],[21.88,-23.48],[21.66,-22.56],[21.34,-21.7],[20.93,-20.99],[20.42,-21.11],[19.81,-21.22],[19.06,-21.29],[18.18,-21.31],[17.07,-21.26],[16.08,-21.09],[16.73,-20.61],[17.39,-20.13],[18.04,-19.64],[18.69,-19.16],[19.35,-18.68],[20.0,-18.19],[20.65,-17.71],[21.31,-17.23],[21.96,-16.75],[22.62,-16.26],[23.27,-15.78],[23.92,-15.3],[24.58,-14.81],[24.58,-15.64],[24.58,-16.46],[24.58,-17.29],[24.58,-18.11],[24.58,-18.94],[24.58,-19.76],[24.58,-20.59],[24.58,-21.41],[24.58,-22.23],[24.58,-23.06],[24.58,-23.88],[24.58,-24.71],[24.58,-25.53],[24.58,-26.36],[24.58,-27.18],[24.58,-28.01],[24.58,-28.83],[24.58,-29.65],[24.58,-30.48],[24.58,-31.3],[24.58,-32.13],[23.77,-32.13],[22.96,-32.13],[22.15,-32.13],[21.34,-32.13],[20.53,-32.13],[19.72,-32.13],[18.92,-32.13],[18.11,-32.13],[17.3,-32.13],[16.49,-32.13],[15.68,-32.13],[14.87,-32.13],[14.07,-32.13],[13.26,-32.13],[12.45,-32.13],[11.64,-32.13],[10.83,-32.13],[10.02,-32.13],[9.21,-32.13],[8.41,-32.13],[7.6,-32.13],[6.79,-32.13],[5.98,-32.13],[5.17,-32.13],[4.36,-32.13],[3.55,-32.13],[2.75,-32.13],[1.94,-32.13],[1.13,-32.13],[0.32,-32.13],[-0.64,-32.24],[-1.39,-32.57],[-1.92,-33.12],[-2.28,-33.88],[-2.49,-34.86],[-2.56,-36.03],[-2.5,-36.9],[-2.34,-37.95],[-2.1,-38.96],[-1.86,-39.68],[-1.05,-39.68],[-0.24,-39.68],[0.56,-39.68],[1.37,-39.68],[2.17,-39.68],[2.98,-39.68],[3.79,-39.68],[4.59,-39.68],[5.4,-39.68],[6.2,-39.68],[7.01,-39.68],[7.82,-39.68],[8.62,-39.68],[9.43,-39.68],[10.23,-39.68],[11.04,-39.68],[11.85,-39.68],[12.65,-39.68],[13.46,-39.68],[14.27,-39.68],[15.07,-39.68],[15.88,-39.68],[16.68,-39.68],[17.49,-39.68],[18.3,-39.68],[19.1,-39.68],[19.91,-39.68],[20.71,-39.68],[21.52,-39.68],[22.33,-39.68],[23.13,-39.68],[23.94,-39.68],[24.74,-39.68],[25.55,-39.68],[26.36,-39.68],[27.16,-39.68],[27.97,-39.68],[28.77,-39.68],[29.58,-39.68],[30.39,-39.68],[31.19,-39.68],[32.0,-39.68],[32.8,-39.68],[33.61,-39.68],[34.42,-39.68],[35.22,-39.68],[36.03,-39.68],[36.83,-39.68],[37.64,-39.68],[38.45,-39.68],[39.25,-39.68],[40.06,-39.68],[40.86,-39.68],[41.67,-39.68],[42.48,-39.68],[43.28,-39.68],[44.09,-39.68],[44.9,-39.68],[45.7,-39.68],[46.51,-39.68],[47.31,-39.68],[48.12,-39.68],[48.93,-39.68],[49.73,-39.68],[50.54,-39.68],[51.34,-39.68],[52.15,-39.68],[52.96,-39.68],[53.76,-39.68],[54.57,-39.68],[55.37,-39.68],[56.18,-39.68],[56.99,-39.68],[57.79,-39.68],[58.47,-39.62],[59.05,-39.44],[59.55,-39.15],[59.95,-38.74],[60.27,-38.2],[60.49,-37.56],[60.63,-36.79],[60.67,-35.9],[60.62,-34.98],[60.45,-33.89],[60.2,-32.86],[59.9,-32.13]],[[21.17,-12.48],[20.48,-13.0],[19.79,-13.52],[19.1,-14.04],[18.41,-14.56],[17.72,-15.08],[17.03,-15.6],[16.34,-16.12],[15.65,-16.65],[14.97,-17.17],[14.28,-17.69],[13.59,-18.21],[12.9,-18.73],[12.59,-18.02],[12.41,-17.26],[12.35,-16.45],[12.42,-15.66],[12.61,-14.95],[12.94,-14.3],[13.4,-13.72],[13.98,-13.22],[14.66,-12.79],[15.4,-12.46],[16.18,-12.22],[17.03,-12.08],[17.92,-12.03],[18.81,-12.06],[19.64,-12.14],[20.43,-12.28],[21.17,-12.48]]],[[[37.38,-32.13],[36.46,-32.13],[35.55,-32.13],[34.63,-32.13],[33.72,-32.13],[32.8,-32.13],[31.89,-32.13],[30.98,-32.13],[30.98,-31.29],[30.98,-30.45],[30.98,-29.61],[30.98,-28.77],[30.98,-27.93],[30.98,-27.09],[30.98,-26.25],[30.98,-25.41],[30.88,-24.43],[30.59,-23.63],[30.11,-23.01],[29.43,-22.56],[28.55,-22.3],[27.46,-22.21],[26.62,-22.21],[25.78,-22.21],[24.95,-22.21],[24.11,-22.21],[23.27,-22.21],[22.43,-22.21],[21.6,-22.21],[20.76,-22.21],[19.92,-22.21],[19.09,-22.21],[18.25,-22.21],[17.41,-22.21],[16.58,-22.21],[15.5,-22.13],[14.67,-21.91],[14.08,-21.54],[13.55,-20.78],[13.38,-19.84],[13.46,-19.19],[13.73,-18.66],[14.12,-18.22],[14.59,-17.86],[15.42,-18.07],[16.24,-18.25],[17.05,-18.4],[17.86,-18.53],[18.66,-18.63],[19.46,-18.7],[20.26,-18.74],[21.06,-18.75],[22.01,-18.74],[22.93,-18.69],[23.81,-18.61],[24.66,-18.51],[25.47,-18.37],[26.24,-18.2],[26.97,-18.0],[27.67,-17.77],[28.33,-17.51],[28.95,-17.22],[29.53,-16.9],[30.08,-16.54],[30.59,-16.16],[31.2,-15.63],[31.74,-15.06],[32.22,-14.46],[32.64,-13.84],[32.99,-13.18],[33.28,-12.49],[33.5,-11.76],[33.66,-11.01],[33.76,-10.22],[33.79,-9.41],[33.76,-8.5],[33.66,-7.64],[33.49,-6.82],[33.26,-6.04],[32.95,-5.31],[32.59,-4.61],[32.15,-3.97],[31.65,-3.36],[31.09,-2.8],[30.48,-2.27],[29.83,-1.78],[29.14,-1.34],[28.39,-0.93],[27.6,-0.56],[26.77,-0.23],[25.89,0.06],[25.11,0.28],[24.32,0.48],[23.5,0.64],[22.66,0.79],[21.81,0.91],[20.93,1.01],[20.03,1.08],[19.11,1.13],[19.9,1.76],[20.7,2.37],[21.46,2.91],[22.2,3.42],[22.94,3.92],[23.67,4.4],[24.38,4.85],[25.09,5.28],[25.79,5.7],[25.71,6.57],[25.54,7.38],[25.28,8.15],[24.94,8.87],[24.51,9.53],[24.0,10.14],[23.41,10.68],[22.76,11.12],[22.03,11.46],[21.24,11.71],[20.38,11.86],[19.46,11.9],[18.53,11.85],[17.65,11.69],[16.82,11.43],[16.04,11.06],[15.3,10.59],[14.79,10.18],[14.28,9.69],[13.78,9.12],[13.29,8.48],[12.8,7.75],[12.32,6.96],[11.84,6.08],[11.45,5.32],[11.06,4.56],[10.67,3.8],[10.28,3.04],[9.89,2.28],[9.51,1.52],[9.12,0.76],[8.14,0.5],[7.23,0.2],[6.37,-0.14],[5.58,-0.51],[4.84,-0.93],[4.16,-1.38],[3.51,-1.9],[2.97,-2.45],[2.52,-3.04],[2.17,-3.67],[1.93,-4.33],[1.78,-5.03],[1.73,-5.76],[1.8,-6.68],[2.02,-7.51],[2.38,-8.26],[2.88,-8.93],[3.68,-9.68],[4.53,-10.26],[5.44,-10.69],[5.99,-10.23],[6.6,-9.78],[7.25,-9.33],[7.95,-8.89],[8.7,-8.45],[9.49,-8.02],[10.34,-7.58],[11.03,-7.27],[11.75,-6.99],[12.5,-6.75],[13.28,-6.54],[14.1,-6.38],[14.94,-6.25],[15.82,-6.15],[16.73,-6.1],[17.66,-6.08],[18.71,-6.11],[19.64,-6.2],[20.45,-6.36],[21.15,-6.57],[21.73,-6.85],[22.46,-7.43],[22.89,-8.16],[23.04,-9.02],[22.9,-9.77],[22.49,-10.38],[21.79,-10.85],[21.24,-11.07],[20.56,-11.24],[19.78,-11.36],[18.87,-11.43],[17.86,-11.46],[16.87,-11.42],[15.88,-11.33],[14.88,-11.17],[13.9,-10.97],[12.95,-10.74],[12.03,-10.5],[11.23,-10.75],[10.41,-11.06],[9.57,-11.43],[8.71,-11.85],[7.84,-12.32],[7.12,-12.76],[6.45,-13.24],[5.81,-13.76],[5.21,-14.33],[4.65,-14.93],[4.13,-15.58],[3.67,-16.28],[3.29,-17.03],[3.0,-17.83],[2.79,-18.68],[2.67,-19.59],[2.62,-20.54],[2.66,-21.4],[2.77,-22.22],[2.94,-22.99],[3.19,-23.72],[3.51,-24.41],[3.9,-25.05],[4.37,-25.65],[4.9,-26.21],[5.5,-26.72],[6.1,-27.14],[6.73,-27.51],[7.39,-27.85],[8.09,-28.13],[8.83,-28.38],[9.61,-28.57],[10.41,-28.73],[11.26,-28.84],[12.14,-28.91],[13.06,-28.93],[13.88,-28.93],[14.71,-28.93],[15.53,-28.93],[16.36,-28.93],[17.18,-28.93],[18.01,-28.93],[18.83,-28.93],[19.66,-28.93],[20.48,-28.93],[20.48,-29.99],[20.48,-31.06],[20.48,-32.13],[19.67,-32.13],[18.87,-32.13],[18.06,-32.13],[17.25,-32.13],[16.45,-32.13],[15.64,-32.13],[14.84,-32.13],[14.03,-32.13],[13.22,-32.13],[12.42,-32.13],[11.61,-32.13],[10.8,-32.13],[10.0,-32.13],[9.19,-32.13],[8.38,-32.13],[7.58,-32.13],[6.77,-32.13],[5.96,-32.13],[5.16,-32.13],[4.35,-32.13],[3.55,-32.13],[2.74,-32.13],[1.93,-32.13],[1.13,-32.13],[0.32,-32.13],[-0.64,-32.24],[-1.39,-32.57],[-1.92,-33.12],[-2.28,-33.88],[-2.49,-34.86],[-2.56,-36.03],[-2.5,-36.9],[-2.34,-37.95],[-2.1,-38.96],[-1.86,-39.68],[-1.05,-39.68],[-0.24,-39.68],[0.56,-39.68],[1.37,-39.68],[2.18,-39.68],[2.98,-39.68],[3.79,-39.68],[4.59,-39.68],[5.4,-39.68],[6.21,-39.68],[7.01,-39.68],[7.82,-39.68],[8.63,-39.68],[9.43,-39.68],[10.24,-39.68],[11.05,-39.68],[11.85,-39.68],[12.66,-39.68],[13.46,-39.68],[14.27,-39.68],[15.08,-39.68],[15.88,-39.68],[16.69,-39.68],[17.5,-39.68],[18.3,-39.68],[19.11,-39.68],[19.92,-39.68],[19.25,-40.49],[18.66,-41.38],[18.27,-42.06],[17.95,-42.78],[17.69,-43.53],[17.48,-44.31],[17.33,-45.12],[17.25,-45.97],[17.22,-46.85],[17.26,-47.81],[17.37,-48.72],[17.57,-49.59],[17.84,-50.42],[18.19,-51.2],[18.62,-51.94],[19.12,-52.62],[19.68,-53.26],[20.29,-53.83],[20.96,-54.35],[21.68,-54.82],[22.46,-55.23],[23.17,-55.54],[23.9,-55.8],[24.64,-56.01],[25.41,-56.17],[26.2,-56.29],[27.01,-56.36],[27.84,-56.38],[28.79,-56.35],[29.66,-56.25],[30.46,-56.07],[31.2,-55.83],[31.86,-55.52],[32.45,-55.14],[33.05,-54.59],[33.51,-53.95],[33.85,-53.21],[34.05,-52.38],[34.11,-51.46],[34.04,-50.6],[33.82,-49.7],[33.53,-48.87],[33.22,-48.26],[32.86,-48.31],[32.54,-48.35],[32.22,-48.38],[31.81,-48.38],[30.79,-48.32],[29.86,-48.14],[29.02,-47.83],[28.26,-47.39],[27.74,-46.93],[27.33,-46.33],[27.05,-45.59],[26.87,-44.72],[26.82,-43.71],[26.88,-42.94],[27.06,-42.16],[27.36,-41.38],[27.88,-40.45],[28.52,-39.68],[29.37,-39.68],[30.21,-39.68],[31.05,-39.68],[31.89,-39.68],[32.74,-39.68],[33.58,-39.68],[34.42,-39.68],[35.26,-39.68],[35.94,-39.62],[36.52,-39.44],[37.02,-39.15],[37.42,-38.74],[37.74,-38.2],[37.96,-37.56],[38.1,-36.79],[38.14,-35.9],[38.09,-34.98],[37.92,-33.89],[37.67,-32.86],[37.38,-32.13]]]]};   // w1_flat: लंबाई group outlines (overlaps merged) as point rings. px, origin = group pen, y down from the baseline
    titleEl.innerHTML = '<span class="tfx-w1">लंबाई</span> <span class="tfx-w2">मापना</span>';
    /* बा separates too when लंबाई stretches (review 2026-09-29): ब and its vowel sign ा become two groups. A span holding
       "ा" alone would render with a dotted circle (◌ा), so BOTH groups draw the whole "बा" run and each is clipped to its
       half. SPLIT_BA = the middle of the gap between ब's right stroke (ink ends x 35.07) and ा's stroke (starts 43.65) -
       only the headline crosses it, and that is cut out / redrawn as one line while the word moves. The two clips overlap
       by SPLIT_OVL so the halves meet without an antialiasing seam when they sit together. */
    const SPLIT_BA = 39.36, SPLIT_OVL = 0.5;
    // [group range in the word, text, ink left, ink right, optional {x0,x1} clip] (px from the group's pen, Baloo 2 800 @64px)
    const WORDS = { w1: { el: titleEl.querySelector(".tfx-w1"), groups: [[0, 2, "लं", -2.24, 52.16], [2, 4, "बा", -2.56, SPLIT_BA, { x1: SPLIT_BA + SPLIT_OVL }],
                                                                    [2, 4, "बा", SPLIT_BA, 60.67, { x0: SPLIT_BA - SPLIT_OVL }], [4, 5, "ई", -2.56, 38.14]] },
                    w2: { el: titleEl.querySelector(".tfx-w2"), groups: [[0, 2, "मा", -2.24, 62.4], [2, 3, "प", -2.88, 40.26], [3, 5, "ना", -2.56, 59.65]] } };
    /* the outline rings लंबाई is drawn from while it curls, one list per group in WORDS.w1 order: बा's rings are split
       at SPLIT_BA (Sutherland-Hodgman against a vertical line, same SPLIT_OVL overlap), so ब and ा bend and move apart
       exactly like their text halves */
    const clipX = (ring, lo, hi)=>{
      let pts = ring;
      for(const [edge, keepBelow] of [[hi, true], [lo, false]]){
        if(!isFinite(edge)) continue;
        const inside = p => keepBelow ? p[0] <= edge : p[0] >= edge, out = [];
        for(let k = 0; k < pts.length; k++){
          const c = pts[k], p = pts[(k + pts.length - 1) % pts.length];
          const cut = ()=> [edge, p[1] + (edge - p[0]) / (c[0] - p[0]) * (c[1] - p[1])];
          if(inside(c)){ if(!inside(p)) out.push(cut()); out.push(c); } else if(inside(p)) out.push(cut());
        }
        pts = out;
      }
      return pts;
    };
    const splitRings = (rings, lo, hi)=> rings.map(r => clipX(r, lo, hi)).filter(r => r.length >= 3);
    const W1_RINGS = [DATA.w1_flat[0], splitRings(DATA.w1_flat[1], -Infinity, SPLIT_BA + SPLIT_OVL),
                      splitRings(DATA.w1_flat[1], SPLIT_BA - SPLIT_OVL, Infinity), DATA.w1_flat[2]];
    const NS = "http://www.w3.org/2000/svg";
    const svgEl = (tag, attrs)=>{ const e = document.createElementNS(NS, tag); for(const k in attrs) e.setAttribute(k, attrs[k]); return e; };
    const div = cls => { const d = document.createElement("div"); d.className = cls; return d; };
    let fx = null;   // built lazily, the first time it is needed (fonts + layout ready by then)
    function build(){
      /* the stage's own scale factor - NOT rect.width / offsetWidth: offsetWidth is rounded to a whole pixel and that
         error grew letter by letter (0.3px off by ना, a shimmer at the swap) */
      const tr = titleEl.getBoundingClientRect();
      const sc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || (tr.width / (titleEl.offsetWidth || 1));
      const probe = document.createElement("span"); probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      titleEl.appendChild(probe); const base = (probe.getBoundingClientRect().bottom - tr.top) / sc; probe.remove();
      const root = div("tfx"); root.setAttribute("aria-hidden", "true"); titleEl.appendChild(root);
      const nibImg = document.querySelector(".sg-art img"), nr = nibImg ? nibImg.getBoundingClientRect() : null;
      const nibX = nr && nr.width ? (nr.left + nr.width * (6 / 1658) - tr.left) / sc : null;   // pencil_purple.webp: nib tip 6px in from the left of 1658
      /* the band cut out of the letters: from 0.3px above the top line to 0.6px ABOVE its bottom - the letter keeps a thin
         sliver of its own top line there, so its cut edge lies on the drawn bar (no pale seam) and the bar can be exactly
         the letters' own top-line thickness */
      const holeFor = (X0, X1)=> "M" + X0 + " -80H" + X1 + "V260H" + X0 + "Z M" + X0 + " " + (base - BAND_TOP - HOLE_TOP).toFixed(2) + "H" + X1 + "V" + (base - BAND_BOT - HOLE_KEEP).toFixed(2) + "H" + X0 + "Z";
      const hole = holeFor(-80, 320);
      // the heading's text-shadow, split: all blue/ambient shadows, then all white outline, then fills (see above)
      const shadows = [], ts = getComputedStyle(titleEl).textShadow || "none";
      let depth = 0, cur = "";
      for(const ch of ts){ if(ch === "(") depth++; if(ch === ")") depth--; if(ch === "," && depth === 0){ shadows.push(cur.trim()); cur = ""; } else cur += ch; }
      if(cur.trim() && cur.trim() !== "none") shadows.push(cur.trim());
      const isWhite = t => /rgb\(\s*255,\s*255,\s*255\s*\)|#fff\b|#ffffff\b|\bwhite\b/i.test(t);
      const shWhite = shadows.filter(isWhite).join(", ") || "none", shBlue = shadows.filter(t => !isWhite(t)).join(", ") || "none";
      const out = { root, base, nibX, gapHalf: Math.max(0, (parseFloat(getComputedStyle(titleEl).wordSpacing) || 0) - GAP_END) / 2 };
      const mkPath = (parent, attrs)=>{ const e = svgEl("path", Object.assign({ fill: "none", "stroke-linecap": "butt", "stroke-linejoin": "round" }, attrs)); parent.appendChild(e); return e; };
      const filters = (defs, id)=>{ defs.innerHTML = '<filter id="tfxExt' + id + '" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation=".4"/></filter>' +
        '<filter id="tfxAmb' + id + '" x="-30%" y="-150%" width="160%" height="400%"><feGaussianBlur stdDeviation="6"/></filter>'; };
      let fid = 0;
      for(const key of ["w1", "w2"]){
        const w = WORDS[key], txt = w.el.firstChild, id = ++fid;
        /* two complete stacks per word, each one composited unit:
           full = the letters as they are;  cut = the letters minus their own top line + one continuous drawn line */
        const full = div("tfx-word"), cut = div("tfx-word");
        const fBl = div("tfx-sh"), fSh = div("tfx-sh"), fFi = div("tfx-fi"), under = svgEl("svg", { class: "tfx-svg" }),
              cBl = div("tfx-sh"), mid = svgEl("svg", { class: "tfx-svg" }), cSh = div("tfx-sh"), over = svgEl("svg", { class: "tfx-svg" }), cFi = div("tfx-fi");
        [fBl, cBl].forEach(l => { l.style.textShadow = shBlue; }); [fSh, cSh].forEach(l => { l.style.textShadow = shWhite; });
        full.append(fBl, fSh, fFi); cut.append(under, cBl, mid, cSh, over, cFi);
        const defs = svgEl("defs", {}); filters(defs, id); under.appendChild(defs);
        // मापना only: a grey "disabled" copy of the word (the heading's own layers through a greyscale filter)
        let dis = null, dBl = null, dSh = null, dFi = null;
        if(key === "w2"){ dis = div("tfx-word tfx-dis"); dBl = div("tfx-sh"); dSh = div("tfx-sh"); dFi = div("tfx-fi");
          dBl.style.textShadow = shBlue; dSh.style.textShadow = shWhite; dis.append(dBl, dSh, dFi); }
        root.append(...(dis ? [full, dis, cut] : [full, cut]));
        const groups = [];
        for(const [a, b, str, inkL, inkR, clip] of w.groups){
          const r = document.createRange(); r.setStart(txt, a); r.setEnd(txt, b);
          const x = (r.getBoundingClientRect().left - tr.left) / sc;
          const X0 = clip && clip.x0 != null ? clip.x0 : -80, X1 = clip && clip.x1 != null ? clip.x1 : 320;   // a split group shows only its half
          const mk = (layer, isCut)=>{ const s = document.createElement("span"); s.className = "tfx-g"; s.textContent = str; s.style.left = x + "px";
            if(isCut) s.style.clipPath = 'path(evenodd, "' + (clip ? holeFor(X0, X1) : hole) + '")';
            else if(clip) s.style.clipPath = 'path("M' + X0 + ' -80H' + X1 + 'V260H' + X0 + 'Z")';
            layer.appendChild(s); return s; };
          const cutSpans = [mk(cBl, true), mk(cSh, true), mk(cFi, true)];
          groups.push({ x, inkL: x + inkL, inkR: x + inkR, cutSpans, spans: [mk(fBl), mk(fSh), mk(fFi), ...cutSpans].concat(dis ? [mk(dBl), mk(dSh), mk(dFi)] : []) });
        }
        const barL = groups[0].inkL, barR = groups[groups.length - 1].inkR;
        /* the straight top line: a ROUNDED BAR (corner radius like the font's own headline ends), exactly as thick as the
           letters' own top line, so लंबाई and मापना match */
        const barTop = base - BAND_TOP - HOLE_TOP, barH = BAR_T + HOLE_TOP;   // = the letters' own top line (+0.3 to cover the cut)
        const mkRect = (parent, attrs)=>{ const e = svgEl("rect", Object.assign({ y: barTop, height: barH, rx: BAR_R, ry: BAR_R, x: 0, width: 0 }, attrs)); parent.appendChild(e); return e; };
        const line = [ mkRect(under, { fill: AMB, filter: "url(#tfxAmb" + id + ")", transform: "translate(0 8)" }),
                       mkRect(under, { fill: BLUE, stroke: BLUE, "stroke-width": OUT_W, "stroke-linejoin": "round", filter: "url(#tfxExt" + id + ")", transform: "translate(0 " + EXT_DY + ")" }),
                       mkRect(mid, { fill: "#fff", stroke: "#fff", "stroke-width": OUT_W, "stroke-linejoin": "round" }),   // above ALL blue: an even outline in the gaps
                       mkRect(over, { fill: ORANGE }) ];
        out[key] = { w, full, cut, dis, under, mid, over, id, groups, barL, barR, line, letterLayers: [cBl, cSh, cFi], yMid: base - BAR_MID, yTop: base - BAND_TOP,
                     yBarMid: barTop + barH / 2 };
        // strain reference: the first group's LEFT edge moves the full stretch, the last group's RIGHT edge stays fixed
        const n = groups.length;
        groups.forEach((g, i)=>{ const f = n > 1 ? i / (n - 1) : 0; g.ref = g.inkL + (g.inkR - g.inkL) * f; });
      }
      /* लंबाई while the line curls: the word drawn from its outlines so the letters can bend with the line.
         Same sticker layers as the heading: ambient, blue extrusion, white outline, orange fill. */
      const w1 = out.w1, bend = svgEl("svg", { class: "tfx-svg tfx-bend" }), bdefs = svgEl("defs", {}); filters(bdefs, "B"); bend.appendChild(bdefs);
      const layer = (attrs)=>{ const gEl = svgEl("g", attrs); bend.appendChild(gEl); return gEl; };
      const L = { amb: layer({ fill: AMB, filter: "url(#tfxAmbB)", transform: "translate(0 8)" }),
                  ext: layer({ fill: BLUE, stroke: BLUE, "stroke-width": OUT_W, "stroke-linejoin": "round", filter: "url(#tfxExtB)", transform: "translate(0 " + EXT_DY + ")" }),
                  wht: layer({ fill: "#fff", stroke: "#fff", "stroke-width": OUT_W, "stroke-linejoin": "round" }),
                  org: layer({ fill: ORANGE }) };
      w1.bendEls = w1.groups.map(()=> [L.amb, L.ext, L.wht, L.org].map(p => { const e = svgEl("path", {}); p.appendChild(e); return e; }));
      // the continuous top line while it curls: a band, painted exactly like the letters (each layer's fill and outline)
      w1.bendLine = [L.amb, L.ext, L.wht, L.org].map(p => { const e = svgEl("path", {}); p.appendChild(e); return e; });
      bend.style.opacity = 0; root.appendChild(bend); w1.bend = bend;
      /* मापना's ruler: a START mark, then one mark after मा, after प and after ना, in the heading's sticker style.
         The letters move apart by GAP each (मा stays, प +GAP, ना +2*GAP) - enough for the marks, but well under the space
         between the two words, so मापना still reads as ONE word. Each mark stands in the middle of its own gap. */
      const GAP = 16, w2 = out.w2; w2.off = [0, GAP, 2 * GAP];
      const ms = w2.barL - GAP / 2, m0 = w2.groups[1].x + GAP / 2, m1 = w2.groups[2].x + GAP * 1.5, m2 = w2.barR + 2 * GAP + GAP / 2;
      const TICK_OUT = 1, TICK_W = 7, TICK_OUTLINE = OUT_W;   // marks as heavy as the line, as SHORT as possible: 1px + the 3.5px round end ~ 4.5px out on each side;
                                                              // the SAME white outline as the bar, so mark and line outline meet flush
      const x0 = ms - TICK_W / 2, x1 = m2 + TICK_W / 2, y0 = w2.yBarMid;   // the line runs flush from the start mark to the last mark
      const TICK_H = BAR_T + HOLE_TOP + 2 * TICK_OUT;   // sticks out TICK_OUT px on BOTH sides of the bar
      const ticks = [ms, m0, m1, m2].map(x => ({ x }));
      for(const t of ticks){
        const mkT = (parent, attrs)=>{ const e = svgEl("line", Object.assign({ x1: t.x, x2: t.x, y1: y0, y2: y0, "stroke-linecap": "round" }, attrs)); parent.appendChild(e); return e; };
        t.els = [ mkT(w2.under, { stroke: BLUE, "stroke-width": TICK_W + TICK_OUTLINE, filter: "url(#tfxExt" + w2.id + ")", transform: "translate(0 " + EXT_DY + ")" }),
                  mkT(w2.mid, { stroke: "#fff", "stroke-width": TICK_W + TICK_OUTLINE }),   // above all blue shadows: a complete outline
                  mkT(w2.over, { stroke: ORANGE, "stroke-width": TICK_W }) ];
      }
      w2.ruler = { ticks, x0, x1, y0, h: TICK_H };
      w2.seg = [x0, m0, m1, x1];   // the ruler's three segments: over मा, over प, over ना (each ends at that letter's mark)
      // after the ruler the heading has grown to the right by this much x2 (kept for reference: no longer glided -
      // the undo shrinks it back first, which re-centres it by itself)
      w2.centreShift = (x1 + TICK_OUTLINE / 2 - w2.barR) / 2;
      return out;
    }
    const clamp01 = v => Math.max(0, Math.min(1, v));
    const smoother = v => { v = clamp01(v); return v * v * v * (v * (v * 6 - 15) + 10); };
    const op = (el, v)=>{ el.style.opacity = v; };
    const showCopy = (word, on)=> word.w.el.classList.toggle("tfx-off", on);   // the real word goes transparent (still read by screen readers)
    const wave = (u, amp)=> -amp * Math.sin(HALF_WAVES * Math.PI * u);         // y offset of the line at u (0..1 along it), px, - = up
    /* the curling top line as a band, bent EXACTLY like the letters' own top-line pieces (each point moved straight up or
       down by the wave at its x), so the two coincide - a stroke would be thicker on the slopes and end in slanted cuts.
       Its ends sit LINE_IN px inside the word's first and last letters, so their own rounded headline ends show. */
    const LINE_IN = 3;
    function bandPath(xL, xR, base, amp){
      const S = xR - xL, a = xL + LINE_IN, b = xR - LINE_IN, n = 72; let top = "", bot = "";
      for(let i = 0; i <= n; i++){ const x = a + (b - a) * i / n, dy = wave(clamp01((x - xL) / S), amp);
        top += (i ? "L" : "M") + x.toFixed(2) + " " + (base - BAND_TOP + dy).toFixed(2);
        bot = "L" + x.toFixed(2) + " " + (base - BAND_BOT + dy).toFixed(2) + bot; }
      return top + bot + "Z";
    }
    const setBar = (word, xa, xb)=>{ const wd = Math.max(0, xb - xa);            // the straight rounded bar, from xa to xb
      word.line.forEach(e => { e.setAttribute("x", xa.toFixed(2)); e.setAttribute("width", wd.toFixed(2)); e.style.visibility = wd > 0.5 ? "" : "hidden"; }); };
    /* ---- लंबाई: one frame at extension s (px, >= 0: stretched toward the nib) and curl amplitude amp ----
       mode "text": the text copies (straight line only);  bendOp > 0: the outline-drawn word fades in on top (curl) */
    let D = 0, Wlen = 0;
    function frameW1(s, amp, cutOp, fullOp, bendOp){
      const w = fx.w1, xR = w.barR, xL = w.barL - s, S = xR - xL, g0 = w.groups[0];
      const dxOf = g => -s * (xR - g.ref) / (xR - g0.ref);                     // uniform strain: ref of group 0 moves s, the fixed end 0
      if(cutOp > 0 || fullOp > 0){
        setBar(w, xL, xR);
        w.groups.forEach(g => { const tf = "translate(" + dxOf(g).toFixed(2) + "px,0px)"; g.spans.forEach(e => { e.style.transform = tf; }); });
      }
      op(w.full, fullOp); op(w.cut, cutOp);
      op(w.bend, bendOp);
      if(bendOp > 0){
        const base = fx.base;
        w.groups.forEach((g, i)=>{
          const gx = g.x + dxOf(g); let d = "";
          for(const ring of W1_RINGS[i]){
            for(let k = 0; k < ring.length; k++){
              const px = ring[k][0] + gx, py = ring[k][1];                        // py: px below the baseline (negative = up)
              const f = clamp01(-py / BAND_BOT);                                  // 1 on the top line and above, easing to 0 at the baseline
              const yy = base + py + wave(clamp01((px - xL) / S), amp) * f;
              d += (k ? "L" : "M") + px.toFixed(2) + " " + yy.toFixed(2);
            }
            d += "Z";
          }
          w.bendEls[i].forEach(e => e.setAttribute("d", d));
        });
        const band = bandPath(xL, xR, base, amp); w.bendLine.forEach(e => e.setAttribute("d", band));
      }
    }
    function restW1(){ pen.rest(); const w = fx.w1; op(w.full, 0); op(w.cut, 0); op(w.bend, 0); w.groups.forEach(g => g.spans.forEach(e => { e.style.transform = ""; })); showCopy(w, false); }
    /* ---- मापना: the ruler sequence, t = seconds since it started. Returns true when finished.
       grey ("disabled"), then one segment per letter: the line draws over that letter only, and the letter is uncovered
       in orange right behind the line's tip (a wipe over its grey copy, never a fade, so the outline and shadow layers
       never mix into a washed-out look); at the end of the segment its mark springs out through the line, equally above
       and below it. मा, then प, then ना. The START mark springs up as the line begins. ---- */
    const M = { disIn: 0.25, seg: 0.35, gap: 0.06, settle: 0.3 };   // tightened 2026-09-29 (was .35/.55/.12, settle .6)
    const setTick = (tk, k)=>{ const R = fx.w2.ruler, half = R.h / 2 * k;      // a mark, grown out both ways from the line (k 0: hidden in it)
      tk.els.forEach(e => { e.setAttribute("y1", (R.y0 - half).toFixed(2)); e.setAttribute("y2", (R.y0 + half).toFixed(2));
        e.style.visibility = k > 0 ? "" : "hidden"; }); };
    const tickSpring = tau => { if(tau <= 0) return 0; const z = .4, w0 = 2 * Math.PI * 2.2, wd = w0 * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w0 * tau) * (Math.cos(wd * tau) + z / Math.sqrt(1 - z * z) * Math.sin(wd * tau)); };
    function frameW2(t){
      const w = fx.w2, R = w.ruler, B = w.seg, a = smoother(t / M.disIn);
      op(w.dis, a); op(w.full, a < 1 ? 1 : 0); op(w.cut, t >= M.disIn ? 1 : 0);    // grey comes in over the orange word
      w.groups.forEach((g, i)=>{ const tf = "translate(" + (w.off[i] * a).toFixed(2) + "px,0px)"; g.spans.forEach(e => { e.style.transform = tf; }); });   // ...as its letters move apart
      let tip = B[0];
      setTick(R.ticks[0], tickSpring(t - M.disIn));                           // the start mark, as the line begins
      for(let i = 0; i < 3; i++){
        const s0 = M.disIn + i * (M.seg + M.gap), q = smoother((t - s0) / M.seg);
        if(q > 0) tip = B[i] + (B[i + 1] - B[i]) * q;                           // the line's tip, inside segment i
        setTick(R.ticks[i + 1], tickSpring(t - (s0 + M.seg)));                // the mark after letter i
      }
      setBar(w, R.x0, tip);                                                    // the ruler line, grown to the tip
      eyeAt(tip, R.y0);                                                        // the eyes follow the ruler as it forms
      const end = M.disIn + 3 * M.seg + 2 * M.gap;
      const revealX = t < M.disIn ? B[0] - 14 : (t >= end ? R.x1 + 14 : tip);
      const clip = "inset(-80px calc(100% - " + revealX.toFixed(2) + "px) -80px -80px)";
      w.letterLayers.forEach(l => { l.style.clipPath = clip; });
      if(t >= end) op(w.dis, 0);
      return t >= end + M.settle;                                              // the last mark has settled
    }
    /* ---- मापना back to normal, u = seconds since the finished ruler's moment on show. Returns true when done.
       The marks pull back into the line first (a mark of length 0 hides inside the line), then the letters slide back
       together and the ruler's two ends move in with them, until it is exactly the word's own top line again - the
       heading's centring shift shrinks with it, so the heading stays centred and both words come closer; the
       letters' own top line then comes back under the drawn one (a short fade, as लंबाई does - the drawn line is 0.3px
       taller) and the real heading takes over (centred, as at the start: मापना is back to its own width). ---- */
    const CL = { show: 0.35, marks: 0.2, slideAt: 0.15, slide: 0.4, fade: 0.2 };   // tightened 2026-09-29 (was .6/.3/.2/.6/.25)
    function closeW2(u){
      const w = fx.w2, R = w.ruler, km = 1 - smoother(u / CL.marks), q = smoother((u - CL.slideAt) / CL.slide);
      R.ticks.forEach(tk => setTick(tk, km));
      w.groups.forEach((g, i)=>{ const tf = "translate(" + (w.off[i] * (1 - q)).toFixed(2) + "px,0px)"; g.spans.forEach(e => { e.style.transform = tf; }); });
      setBar(w, R.x0 + (w.barL - R.x0) * q, R.x1 + (w.barR - R.x1) * q);
      /* UNDO FIRST, CENTRE AFTER (review 2026-09-29): no sideways shift here - the heading never glided, so as मापना
         shrinks back to its own width the heading is simply back in its centred place. The words' move to the centre
         (the closer gap) is its own step after this ("gap" in tick). */
      const closed = CL.slideAt + CL.slide, f = clamp01((u - closed) / CL.fade);
      op(w.full, u >= closed ? 1 : 0); op(w.cut, 1 - f);
      if(f >= 1){ restW2(); return true; }                                     // back to normal, still at the starting gap
      return false;
    }
    function restW2(){ const w = fx.w2; op(w.cut, 0); op(w.dis, 0); op(w.full, 0); w.ruler.ticks.forEach(tk => setTick(tk, 0));
      w.groups.forEach(g => g.spans.forEach(e => { e.style.transform = ""; })); w.letterLayers.forEach(l => { l.style.clipPath = ""; }); showCopy(w, false);
      setCentre(0); setGap(0); }
    /* the words coming closer, k 0..1: लंबाई moves right and मापना left by half the lost spacing each (so the heading stays
       centred) - the real words by a relative offset (no reflow), their copies with them */
    function setGap(k){
      const g = fx ? fx.gapHalf * k : 0, on = Math.abs(g) > 0.001;
      [[WORDS.w1.el, g], [WORDS.w2.el, -g]].forEach(([e, d]) => { e.style.position = on ? "relative" : ""; e.style.left = on ? d.toFixed(2) + "px" : ""; });
      if(fx){ const t = d => on ? "translateX(" + d.toFixed(2) + "px)" : "";
        [fx.w1.full, fx.w1.cut, fx.w1.bend].forEach(e => { e.style.transform = t(g); }); [fx.w2.full, fx.w2.dis, fx.w2.cut].forEach(e => { e.style.transform = t(-g); }); }
    }
    function commitGap(){                                                      // the end: that closer spacing becomes the heading's own
      if(!fx || !fx.gapHalf) return;
      if(phase === "pull" || phase === "recoil"){ restW1(); phase = "idle"; }   // (never the case in the normal order - लंबाई is done well before)
      setGap(0); titleEl.style.wordSpacing = GAP_END + "px";                  // the real layout now puts both words exactly where they moved to
      fx.root.remove(); fx = null;                                            // the copies were measured at the old spacing: rebuilt when next needed
    }
    /* ---- the PENCIL stretches with लंबाई (review 2026-09-29: "when लंबाई is getting stretched can the pencil also get
       stretched along?"). Its nib is pulled out to the left by PEN_K x the word's pull (~45px), on the SAME spring - out,
       hold, snap back, the same bounces - with the eraser end fixed. The word's own pull is NOT changed by this (review:
       "don't increase the stretch length of लंबाई, keep it same"): it still ends PAST_NIB beyond the nib's REST position,
       so at full stretch the stretched nib reaches further left than the word.
       Only the plain barrel (pencil image x PEN_BAR0..PEN_BAR1 of its 1658px) lengthens: the nib and wood, the face, the
       band and the eraser keep their shape. While it moves the pencil is drawn on a canvas over the real <img> (made
       transparent, so it keeps its place in the layout); at rest the <img> shows again - so the nib maths above, the
       cubes' measure and every `.sg-art img` lookup only ever see the pencil at rest. ---- */
    /* the pencil's eyes (app.js [pencil eyes]) watch the title move: x, y in the heading's own stage px */
    let eyeTr = null, eyeTrAt = -1e9;                                         // the heading's box, re-read at most every 150ms
    const eyeAt = (x, y)=>{ const E = window.SGEyes; if(!E) return; const tn = performance.now();
      if(tn - eyeTrAt > 150){ const r = titleEl.getBoundingClientRect(); eyeTrAt = tn;
        eyeTr = { l: r.left, t: r.top, sc: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1 }; }
      E.look("title", { x: eyeTr.l + x * eyeTr.sc, y: eyeTr.t + y * eyeTr.sc }, 7, 300); };
    let winced = false;                                                        // the eyes' flinch at लंबाई's first impact, once per stretch
    const PEN_K = 2 / 3, PEN_BAR0 = 260 / 1658, PEN_BAR1 = 920 / 1658;
    const pen = (function(){
      let cv = null, ctx = null, img = null, maxE = 0, cssW = 0, cssH = 0, on = false;
      function prepare(e){                                                     // before each stretch: fit the canvas to the pencil as it is NOW
        const hero = $("sgHero"); img = hero && hero.querySelector("img");
        if(!img || !img.complete || !img.naturalWidth || !img.offsetWidth){ img = null; return; }
        // measure the pencil BEFORE the canvas is inserted: a canvas still in the flex row would shift the pencil
        maxE = Math.ceil(e) + 2; cssW = img.offsetWidth; cssH = img.offsetHeight;
        const offL = img.offsetLeft, offT = img.offsetTop;
        if(!cv){ cv = document.createElement("canvas"); cv.className = "sg-pen-stretch"; cv.setAttribute("aria-hidden", "true"); ctx = cv.getContext("2d"); }
        const sc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
        const k = Math.min(2, sc * (window.devicePixelRatio || 1));            // crisp, but capped for low-end GPUs
        cv.width = Math.round((cssW + maxE) * k); cv.height = Math.round(cssH * k); ctx.setTransform(k, 0, 0, k, 0, 0);
        cv.style.cssText = "position:absolute;pointer-events:none;display:none;left:" + (offL - maxE) + "px;top:" + offT +
          "px;width:" + (cssW + maxE) + "px;height:" + cssH + "px;filter:" + getComputedStyle(img).filter;
        if(cv.previousElementSibling !== img) img.insertAdjacentElement("afterend", cv);   // out of the flow already (absolute)
      }
      function set(e){
        if(!img || !cv) return;
        e = Math.max(0, Math.min(e, maxE - 2));
        if(e < 0.3){ rest(); return; }                                      // the last third of a pixel is invisible: back to the real <img>
        const nw = img.naturalWidth, nh = img.naturalHeight, f = cssW / nw, b0 = PEN_BAR0 * nw, b1 = PEN_BAR1 * nw, x0 = maxE - e;
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
        ctx.clearRect(0, 0, cssW + maxE, cssH);
        ctx.drawImage(img, b0, 0, b1 - b0, nh, x0 + b0 * f - 0.5, 0, (b1 - b0) * f + e + 1, cssH);   // the barrel, lengthened (0.5px under each seam)
        ctx.drawImage(img, 0, 0, b0, nh, x0, 0, b0 * f, cssH);                                    // nib + wood, moved out by e
        ctx.drawImage(img, b1, 0, nw - b1, nh, maxE + b1 * f, 0, (nw - b1) * f, cssH);            // face, band, eraser: fixed
        if(!on){ cv.style.display = "block"; img.style.opacity = "0"; on = true; }
      }
      function rest(){ if(on){ cv.style.display = "none"; img.style.opacity = ""; on = false; } }
      return { prepare, set, rest };
    })();
    /* ---- driver: two timelines, each started by its spoken word, then run on the wall clock ---- */
    let w1Quiet = false;                                                       // लंबाई fully settled: the undo (its straightening) may start
    let phase = "idle", w1Done = false, tStart = 0, w2Phase = "wait", w2Start = 0, w2Gap = 0, w2Close = 0, lastCt = 0, raf = 0, backAt = 0, gapPending = false;
    const GAP_MOVE = 350;                                                      // ms (animation clock): the words' move in to the centre, after the undo
    // centring shift (k 0 = none). Only ever reset to 0 now: the heading is no longer glided while the ruler shows
    const setCentre = k => { titleEl.style.transform = k > 0 && fx ? "translateX(" + (-fx.w2.centreShift * k).toFixed(2) + "px)" : ""; };
    function measureNib(){                                                      // nib tip in the heading's own coordinates, as it is NOW
      const tr = titleEl.getBoundingClientRect(), sc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
      const im = document.querySelector(".sg-art img"), nr = im ? im.getBoundingClientRect() : null;
      return nr && nr.width ? (nr.left + nr.width * (6 / 1658) - tr.left) / sc : null;
    }
    function finishNow(){                                                      // leaving the landing mid-animation: put everything at rest
      if(!fx) return;
      if(phase === "pull" || phase === "recoil"){ restW1(); phase = "idle"; }
      if(w2Phase === "run" || w2Phase === "close" || w2Phase === "gap"){ restW2(); w2Phase = "done"; commitGap(); }
      if(gapPending){ gapPending = false; commitGap(); }
    }
    function recoilState(tau){                                                 // s, curl amplitude, and whether it has settled
      const half = Math.PI / W0;
      let s = tau < half / 2 ? D * Math.cos(W0 * tau) : 0, amp = 0, env = 0, stopped = false;
      let tk = half / 2, vk = D * W0;                                          // first impact: a quarter period, speed D w
      /* the permanent set: from the first impact the line's rest shape is the wave (amp < 0: dip first), approached
         critically damped - A (1 - (1 + x) e^-x) - so it never overshoots; the curl waves below ring about it */
      if(tau >= tk){ const x = SET_G * (tau - tk), rem = (1 + x) * Math.exp(-x), A = SET_A * Wlen; amp -= A * (1 - rem); env += A * rem; }
      while(tk <= tau){
        const dt = tau - tk, a = Math.min(CURL_MAX, CURL_C * vk) * Math.exp(-CURL_G * dt);
        amp -= a * Math.sin(CURL_W * dt); env += a;                            // this impact's curl wave (it buckles the way it sets: dip first)
        const vOut = RESTITUTION * vk;
        if(vOut / W0 <= 0.3){ stopped = true; break; }                          // rebound too small to see: it rests on the stop
        if(dt < half) s = (vOut / W0) * Math.sin(W0 * dt);                      // rebound flight, back after half a period
        tk += half; vk = vOut;
      }
      return { s, amp, quiet: stopped && env < 0.5 };                          // under half a pixel of wobble: settled in its wave
    }
    // a word noticed a little late still starts from its beginning: at most 50ms is caught up, never a visible jump
    const startAt = (now, ct, tw)=> now - Math.min(0.05, Math.max(0, ct - tw)) * 1000 / SLOW;
    function tick(now){
      raf = 0;
      now /= SLOW;                                                             // the animation's own clock: every duration below runs SLOW x longer
      const gate = $("startGate");
      if(!gate || gate.classList.contains("hidden")){ finishNow(); return; }  // left the landing: stop, at rest
      const onLanding = (voEl.getAttribute("src") || "").indexOf("vo_landing") >= 0;
      const ct = onLanding ? voEl.currentTime : 0;
      if(onLanding && ct + 0.3 < lastCt && (phase === "pull" || phase === "recoil")){ restW1(); phase = "idle"; }   // greeting restarted
      if(onLanding) lastCt = ct;
      const speaking = onLanding && isPlaying;
      // लंबाई: on the word (again on a replay)
      if(phase === "idle" && speaking && ct >= T_WORD - 0.03 && ct < T_WORD + 0.5){
        if(gapPending){ gapPending = false; commitGap(); }                    // (a replay right at the very end: settle first)
        fx = fx || build();
        const w = fx.w1; Wlen = w.barR - w.barL;
        fx.nibX = measureNib();                                                // afresh: the layout may have changed since
        D = (fx.nibX !== null && fx.nibX < w.barL) ? (w.barL - fx.nibX) + PAST_NIB : 0;
        if(w2Phase === "run" || w2Phase === "close" || w2Phase === "gap") restW2();   // a replay: मापना plays again after लंबाई
        w2Phase = "wait"; w1Done = false; w1Quiet = false;
        if(D > 0 && !reduce){ tStart = startAt(now, ct, T_WORD); showCopy(w, true); frameW1(0, 0, 0, 1, 0); pen.prepare(PEN_K * D); phase = "pull"; winced = false; if(window.SGEyes) SGEyes.react("surprise"); }
        else w1Done = true;                                                    // nothing to stretch to / reduced motion: मापना may go
      }
      const t = (now - tStart) / 1000;
      if(phase === "pull"){
        if(t >= PULL + HOLD){ phase = "recoil"; backAt = 0; }
        else {
          /* the stretch is drawn from the font OUTLINES (as the curl is): there बा is split into ब and ा as shapes, so each
             half keeps its own round outline and shadow while they move apart - the text copies cut "बा" with a straight
             vertical clip, which sliced both halves' outline and shadow into hard vertical edges in the gap (review
             2026-09-29: "non smooth lines when लंबाई is stretched"). It fades in over the real-text copy in the first
             0.12s, while the word has barely moved (the two differ by a hairline of outline). */
          const bIn = clamp01(t / 0.12), sNow = D * smoother(t / PULL);
          frameW1(sNow, 0, 0, bIn < 1 ? 1 : 0, bIn); pen.set(PEN_K * sNow); eyeAt(fx.w1.barL - sNow, fx.base - BAR_MID);
        }
      }
      if(phase === "recoil"){
        const tau = t - PULL - HOLD, r = recoilState(tau);
        if(r.quiet) w1Quiet = true;                                            // settled in its wave (it stays in it until the undo)
        if(r.quiet || tau >= W2_START) w1Done = true;                          // मापना may go - early, while लंबाई still rings down
        // the wave eases back straight TOGETHER with मापना's undo (before the words move to the centre)
        const kS = !r.quiet ? 0 : w2Phase === "close" ? smoother(Math.max(0, now - w2Close) / 1000 / (CL.slideAt + CL.slide)) : (w2Phase === "gap" || w2Phase === "done") ? 1 : 0;
        if(kS >= 1 && !backAt) backAt = now;                                   // straight again: back to the real heading
        /* the bent word and the straight copy under it only ever meet while the line is straight, and always by a short
           fade (their outlines differ by a hairline): at the start the bent word fades in, then the straight copy fades
           out - both before the first impact bends the line - so it never peeks out of the dips or behind ई's hook; at
           the end the straight copy fades back in under it, the bent word fades out, and the letters' own top line returns */
        const b = backAt ? (now - backAt) / 1000 : 0;
        const bendOp = backAt ? 1 - clamp01((b - 0.15) / 0.3) : 1;           // (up since the stretch)
        const cutOp = backAt ? Math.min(clamp01(b / 0.15), 1 - clamp01((b - 0.45) / 0.3)) : 0;
        frameW1(backAt ? 0 : r.s, backAt ? 0 : r.amp * (1 - kS), cutOp, backAt && b >= 0.45 ? 1 : 0, bendOp);
        pen.set(backAt ? 0 : PEN_K * r.s);
        if(!backAt) eyeAt(fx.w1.barL - r.s, fx.base - BAR_MID);             // the eyes ride the snap-back and its bounces
        if(!winced && tau >= Math.PI / W0 / 2){ winced = true; if(window.SGEyes) SGEyes.react("wince"); }   // ...and flinch at the hard stop
        if(b >= 0.75){ restW1(); phase = "idle"; }                             // लंबाई is completely done
      }
      // मापना: only once लंबाई is completely done; the ruler forms, shows for a moment, BOTH words undo (मापना back to
      // normal, लंबाई's wave straight), and only THEN do the two words move in to the centre (review 2026-09-29)
      if(w2Phase === "wait" && w1Done){
        if(reduce){ w2Phase = "done"; titleFxDone(); }                        // reduced motion: मापना simply stays as it is
        else { fx = fx || build(); showCopy(fx.w2, true); w2Start = now; w2Phase = "run"; if(window.SGEyes) SGEyes.react("curious"); }
      }
      if(w2Phase === "run" && frameW2((now - w2Start) / 1000)){ w2Phase = "close"; w2Close = now + CL.show * 1000; }   // no glide: hold, then undo
      if(w2Phase === "close" && now >= w2Close && !w1Quiet && phase === "recoil") w2Close = now;     // ruler shown its full CL.show; if लंबाई still rings, hold until it is still
      if(w2Phase === "close" && now >= w2Close && closeW2((now - w2Close) / 1000)){ w2Phase = "gap"; w2Gap = now; }
      if(w2Phase === "gap"){ const k = smoother((now - w2Gap) / GAP_MOVE); setGap(k); if(k >= 1){ w2Phase = "done"; gapPending = true; titleFxDone(); } }   // both words in to the centre
      if(gapPending && phase !== "pull" && phase !== "recoil"){ gapPending = false; commitGap(); }   // both words at rest: the closer gap is the heading's own
      // keep ticking while something moves, or while the greeting plays (so each word is caught on time)
      if(phase === "pull" || phase === "recoil" || w2Phase === "run" || w2Phase === "close" || w2Phase === "gap" || gapPending || speaking) raf = requestAnimationFrame(tick);
    }
    const kick = ()=>{ if(!raf) raf = requestAnimationFrame(tick); };
    /* the landing intro's next step (the measuring cubes, app.js [landing measure]) starts when the title animation is done */
    function titleFxDone(){ if(window.SGEyes) SGEyes.release("title"); if(!window.__sgTitleFxDone){ window.__sgTitleFxDone = true; document.dispatchEvent(new Event("sg-title-fx-done")); } }
    voEl.addEventListener("playing", kick); voEl.addEventListener("timeupdate", kick);
    // back on the landing (QA nav 'home'): make sure nothing is left mid-way
    new MutationObserver(kick).observe($("startGate"), { attributes: true, attributeFilter: ["class"] });
  })();

  // tapping आगे clears any pending nav-nudge
  $("navBtn").addEventListener("click", ()=>{ clearTimeout(state.navNudgeTimer); stopNudge(); });
  /* [12][14] QA CHECKLIST: "hint_used event fires on every bulb tap." Each slide
     module rebinds $("hintBtn").onclick with its own `if(state.locked ...) return`
     guard, and only two of those seven handlers ever emitted hint_shown - so most
     bulb taps sent nothing. This capture-phase listener sits ahead of all of them
     and is the single place the verb is raised. */
  $("hintBtn").addEventListener("click", ()=>{
    const sl = CARD.slides[state.idx] || {};
    state.hintUsed = true;
    try{ XAPI.send("hint_used", { slide_id: sl.id, phase: sl.phase, type: sl.type },
                   { attempt: state.attempts }); }catch(e){}
  }, true);
  // [engine JS] r4 dev jump: ?slide=N skips the loader+gate and mounts slide N directly (QA/capture only)
  (function(){
    const j = parseInt(new URLSearchParams(location.search).get("slide"), 10);
    if(isNaN(j)) return;
    const bl = $("bootLoader"); if(bl) bl.remove();
    document.body.classList.add("loaded");
    $("startGate").classList.add("hidden");
    document.body.classList.remove("is-start");
    mountSlide(Math.max(0, Math.min(j, CARD.slides.length - 1)));
  })();
  // when the web font finishes loading, re-centre glyphs (metrics change vs fallback)
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(()=> centerAllGlyphs()); }
  // dev banner if ?dev=1 — show empty initially
  /* [QA 01] ?dev=1 JUMP PANEL. This engine revision shipped the dev BANNER but
     never the slide navigator - HI01 gained it in a later block (its line 7503)
     that MTG predates, which is why ?dev=1 looked like it "did nothing" here.
     buildDevNav() is ported verbatim; ?nav=1 is accepted too, as in HI01. */
  if(new URLSearchParams(location.search).has("dev") || new URLSearchParams(location.search).has("nav")){
    $("devBanner").textContent = "engine ready · slides=" + CARD.slides.length;
    $("devBanner").className = "dev-banner show";
    buildDevNav();
  }
}
/* ===== FLN ANIMATION KIT: core BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion = window.FLNMotion || {};
  M.still = function(){
    try{ return document.documentElement.classList.contains("no-anim") ||
      (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }
    catch(_){ return false; }
  };
  M.scale = function(){
    try{ return parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue("--scale")) || 1; }catch(_){ return 1; }
  };
  M.rect = function(r, sw){                    // screen rect -> stage coords (R1/R2)
    var s = M.scale();
    if(document.documentElement.classList.contains("rotated")){
      return { left:(r.top - sw.top)/s, top:(sw.right - r.right)/s, w:r.height/s, h:r.width/s };
    }
    return { left:(r.left - sw.left)/s, top:(r.top - sw.top)/s, w:r.width/s, h:r.height/s };
  };
  M.guard = function(fn){                      // R4
    try{ fn(); }catch(e){ try{ console.warn("[animation-kit]", e && e.message); }catch(_){} }
  };
  var _actx = null;
  M.audio = function(){
    try{
      var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null;
      _actx = _actx || new AC();
      if(_actx.state === "suspended") _actx.resume();
      return _actx;
    }catch(_){ return null; }
  };
  M.ready = function(fn){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  };
})();
/* ===== FLN ANIMATION KIT: core END ===== */

/* ===== FLN ANIMATION KIT: sky-drift BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;

  function build(o){
    var sky = typeof o.container === "string" ? document.querySelector(o.container) : o.container;
    if(!sky) return null;
    sky.textContent = "";
    var maxSize = 0, frag = document.createDocumentFragment();

    /* [landing card clear] every lane STARTS just outside the centre card, never behind it.
       The sky and the card share the viewport centre (body flex-centres the stage, the gate
       flex-centres the card), so per lane: distance from centre to where the ray leaves the
       card box (1114x456 design px x --scale) + the element's half-size + a gap, in vmax.
       Before this every star launched at a flat r0 = 22vmax - well inside the card - and slid
       out from under it. */
    var clear = null;
    if(o.avoid && document.querySelector(o.avoid)){
      var sc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
      var vmaxPx = Math.max(document.documentElement.clientWidth, document.documentElement.clientHeight) / 100 || 1;
      clear = { hw:(o.avoidBox[0] / 2) * sc / vmaxPx, hh:(o.avoidBox[1] / 2) * sc / vmaxPx, gap:o.avoidGap * sc / vmaxPx };
    }
    function startR(cos, sin, size){
      if(!clear) return o.r0;
      var t = Math.min(Math.abs(cos) > 1e-6 ? clear.hw / Math.abs(cos) : Infinity,
                       Math.abs(sin) > 1e-6 ? clear.hh / Math.abs(sin) : Infinity);
      return Math.max(o.r0, t + size * 0.75 + clear.gap);   // 0.75: half-size + the glow halo
    }

    o.layers.forEach(function(L, li){
      for(var i = 0; i < o.lanes; i++){
        var a = ((360 / o.lanes) * i + L.rot) * Math.PI / 180;
        var cos = Math.cos(a), sin = Math.sin(a);
        var size = +((o.size[0] + Math.random() * (o.size[1] - o.size[0])) * L.scale).toFixed(2);
        if(size > maxSize) maxSize = size;
        var dur = +(o.dur[0] + Math.random() * (o.dur[1] - o.dur[0])).toFixed(1);
        var el = document.createElement("i"), r0 = startR(cos, sin, size);
        el.className = o.shapes[(i + li) % o.shapes.length];
        el.style.cssText =
          "--s:"  + size + "vmax;" +
          "--x1:" + (r0 * cos).toFixed(2) + "vmax;--y1:" + (r0 * sin).toFixed(2) + "vmax;" +
          "--x2:" + (o.r1 * cos).toFixed(2) + "vmax;--y2:" + (o.r1 * sin).toFixed(2) + "vmax;" +
          "--t:"  + dur + "s;" +
          "--d:-" + (Math.random() * dur).toFixed(1) + "s;" +     // negative = de-sync
          "--g:"  + (o.glow[0] + Math.random() * (o.glow[1] - o.glow[0])).toFixed(1) + "s;" +
          "--gd:-" + (Math.random() * 4).toFixed(1) + "s;" +
          "--o:"  + (o.opacity[0] + Math.random() * (o.opacity[1] - o.opacity[0])).toFixed(2) + ";";
        frag.appendChild(el);
      }
    });
    sky.appendChild(frag);

    // collision proof: lane arc at the tightest radius must be >= 1.5x the largest element
    var arc = (2 * Math.PI * o.r0) / o.lanes, ok = arc >= maxSize * 1.5;
    if(!ok && o.warn !== false){
      console.warn("[animation-kit] sky lanes too tight: arc " + arc.toFixed(2) +
        "vmax vs element " + maxSize.toFixed(2) + "vmax. Reduce lanes or size.");
    }
    return { arc:arc, maxSize:maxSize, safe:ok, count:sky.children.length };
  }

  M.sky = {
    defaults: {
      container:".sg-sky", lanes:29,
      layers:[{rot:0,scale:1},{rot:6.2,scale:0.62},{rot:-6.2,scale:0.55}],
      r0:22, r1:72, size:[0.8,2.6], dur:[18,34], glow:[3.0,4.8],
      opacity:[0.62,0.92], shapes:["s1","s2","s3","s4","s5"], warn:true,
      avoid:".sg-card", avoidBox:[1114,456], avoidGap:24   // [landing card clear] design px
    },
    init: function(opts){
      var o = Object.assign({}, this.defaults, opts || {}), res = null;
      this._last = opts;
      M.guard(function(){ res = build(o); });
      return res;
    }
  };
  M.ready(function(){ M.guard(function(){ if(!window.__skyManual) M.sky.init(); }); });
  /* the card's size in vmax changes with aspect ratio (rotation, split-screen), so re-plan the
     lanes after a resize settles - otherwise start points drift back inside the card. */
  var skyRz = 0;
  window.addEventListener("resize", function(){
    clearTimeout(skyRz);
    skyRz = setTimeout(function(){ M.guard(function(){ if(!window.__skyManual) M.sky.init(M.sky._last); }); }, 250);
  });
})();
/* ===== FLN ANIMATION KIT: sky-drift END ===== */

/* ===== FLN ANIMATION KIT: sky-burst BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;

  function boom(o){                      // sine thud + noise tail + square crackles
    var actx = M.audio(); if(!actx) return;
    try{
      var t = actx.currentTime, out = actx.createGain();
      out.gain.value = o.volume; out.connect(actx.destination);

      var tg = actx.createGain();
      tg.gain.setValueAtTime(0.9, t);
      tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      tg.connect(out);
      var osc = actx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.16);
      osc.connect(tg); osc.start(t); osc.stop(t + 0.18);

      var n = actx.sampleRate * 0.45;
      var buf = actx.createBuffer(1, n, actx.sampleRate), d = buf.getChannelData(0);
      for(var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6);
      var src = actx.createBufferSource(); src.buffer = buf;

      for(var c = 0; c < o.crackles; c++){
        var cg = actx.createGain(), ct = t + 0.10 + Math.random() * 0.30;
        cg.gain.setValueAtTime(0.0001, ct);
        cg.gain.exponentialRampToValueAtTime(0.18, ct + 0.006);
        cg.gain.exponentialRampToValueAtTime(0.0001, ct + 0.07);
        cg.connect(out);
        var co = actx.createOscillator();
        co.type = "square";
        co.frequency.setValueAtTime(1500 + Math.random() * 2200, ct);
        co.connect(cg); co.start(ct); co.stop(ct + 0.08);
      }
      var bp = actx.createBiquadFilter();
      bp.type = "bandpass"; bp.frequency.value = 3400; bp.Q.value = 0.8;
      var ng = actx.createGain();
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.exponentialRampToValueAtTime(0.5, t + 0.03);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      src.connect(bp); bp.connect(ng); ng.connect(out); src.start(t + 0.02);
    }catch(_){}
  }

  function pop(el, r, o){
    el.classList.add("popped");
    // respawn on the next FLIGHT lap - the glow cycle is much shorter, so filter by name
    el.addEventListener("animationiteration", function back(e){
      if(e.animationName !== "sgFly") return;
      el.classList.remove("popped");
      el.removeEventListener("animationiteration", back);
    });

    var kind = "k-dot", cls = el.classList;
    for(var ci = 0; ci < cls.length; ci++){ if(o.kind[cls[ci]]) kind = o.kind[cls[ci]]; }

    var bs = Math.max(11, r.width);
    var b = document.createElement("div");
    b.className = "sg-burst " + kind;
    b.style.left = (r.left + r.width / 2) + "px";
    b.style.top  = (r.top  + r.height / 2) + "px";
    b.style.setProperty("--bs", bs + "px");
    b.appendChild(document.createElement("div")).className = "fl";

    var k = 0;
    for(var g = 0; g < o.rings.length; g++){
      var R = o.rings[g], off = Math.random() * Math.PI * 2;
      for(var i = 0; i < R.n; i++, k++){
        var a = off + i / R.n * Math.PI * 2;
        var dist = bs * R.rad * (0.78 + Math.random() * 0.44);
        var p = document.createElement("i");
        p.style.cssText =
          "--ps:"  + (bs * R.size * (0.8 + Math.random() * 0.5)).toFixed(1) + "px;" +
          "--dx:"  + (Math.cos(a) * dist).toFixed(1) + "px;" +
          "--dy:"  + (Math.sin(a) * dist).toFixed(1) + "px;" +
          "--gy:"  + (dist * o.gravity).toFixed(1) + "px;" +
          "--sd:"  + (R.dur + Math.random() * 0.22).toFixed(2) + "s;" +
          "--sdl:" + (Math.random() * 0.06).toFixed(3) + "s;" +
          "color:" + o.hues[k % o.hues.length];
        b.appendChild(p);
      }
    }
    document.body.appendChild(b);
    if(o.sound) boom(o);
    setTimeout(function(){ b.remove(); }, o.life);
  }

  M.skyBurst = {
    defaults: {
      container:".sg-sky", when:["is-start","is-end"],
      rings:[{n:9,rad:3.1,size:.58,dur:.80},{n:7,rad:1.8,size:.78,dur:.62}],
      hues:["#FCB717","#3B7DD8","#21A74A","#E5484D","#7048D6","#F1781D"],
      kind:{s1:"k-star",s2:"k-star",s3:"k-spark",s4:"k-dot",s5:"k-dot"},
      gravity:0.42, pad:12, padRatio:0.7, minAlpha:0.08, life:1200,
      sound:true, volume:0.22, crackles:4
    },
    init: function(opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        var sky = typeof o.container === "string"
          ? document.querySelector(o.container) : o.container;
        if(!sky) return;
        // capture phase: .sg-sky is pointer-events:none, so hit-test by rect (R6)
        document.addEventListener("pointerdown", function(e){
          if(M.still()) return;
          if(!o.when.some(function(c){ return document.body.classList.contains(c); })) return;
          var els = sky.querySelectorAll("i:not(.popped)");
          for(var i = 0; i < els.length; i++){
            var el = els[i], r = el.getBoundingClientRect();
            if(r.width < 2) continue;
            var pad = Math.max(o.pad, r.width * o.padRatio);   // ~4px targets need slack
            if(e.clientX < r.left - pad || e.clientX > r.right  + pad ||
               e.clientY < r.top  - pad || e.clientY > r.bottom + pad) continue;
            if(parseFloat(getComputedStyle(el).opacity) < o.minAlpha) continue;
            // claim the tap, or it also fires the button under the star
            e.stopPropagation(); e.preventDefault();
            pop(el, r, o);
            return;
          }
        }, true);
      });
    }
  };
  M.ready(function(){ M.guard(function(){ M.skyBurst.init(); }); });
})();
/* ===== FLN ANIMATION KIT: sky-burst END ===== */

/* ===== FLN ANIMATION KIT: still-switch BEGIN ===== */
/* R5, second half. The kit's M.still() and the shipped starBurst both READ
   html.no-anim, but nothing in this activity ever SET it and there was no
   ?still=1 handler at all - so the kill-switch was unreachable. */
(function(){ "use strict";
  try{
    var q = new URLSearchParams(location.search);
    if(q.has("still") || (window.matchMedia &&
       matchMedia("(prefers-reduced-motion: reduce)").matches)){
      document.documentElement.classList.add("no-anim");
    }
  }catch(_){}
})();
/* ===== FLN ANIMATION KIT: still-switch END ===== */

/* ===== FLN ANIMATION KIT: nudge BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;
  function place(el, o){
    var nh = document.getElementById(o.hand); if(!nh || !el) return;
    var host = document.querySelector(o.host); if(!host) return;
    var r = el.getBoundingClientRect(), sw = host.getBoundingClientRect(), s = M.scale();
    nh.style.left = ((r.left - sw.left)/s + r.width/s/2 + o.dx) + "px";
    nh.style.top  = ((r.top  - sw.top )/s + r.height/s   + o.dy) + "px";
    nh.classList.add("show");
  }
  M.nudge = {
    defaults:{ hand:"nudgeHand", host:".slide-stage", dx:-34.2, dy:-7.8, oneHand:true },   /* [QA 12] fingertip 8px below target */
    pointAt: function(el, opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(M.still()) return;
        if(o.oneHand) document.querySelectorAll(".demo-hand").forEach(function(h){ h.remove(); });
        place(el, o);
      });
    },
    after: function(target, ms, opts){            // returns cancel()
      var o = Object.assign({}, this.defaults, opts || {}), t = null;
      M.guard(function(){
        if(!ms || M.still()) return;
        t = setTimeout(function(){
          var el = (typeof target === "string") ? document.querySelector(target) : target;
          if(el) place(el, o);
        }, ms);
      });
      return function(){ clearTimeout(t); };
    },
    hide: function(opts){
      var o = Object.assign({}, this.defaults, opts || {});
      var nh = document.getElementById(o.hand); if(nh) nh.classList.remove("show");
    }
  };
})();
/* ===== FLN ANIMATION KIT: nudge END ===== */

/* ===== FLN ANIMATION KIT: confetti BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;
  function rnd(a, b){ return a + Math.random() * (b - a); }

  M.confetti = {
    defaults: {
      host:".stage-inner", count:80, stagger:0.35,
      fall:[1.1,1.8], drift:45, sway:[10,34], bob:[3,7],
      rockT:[0.6,1.2], tumbleT:[0.75,1.5], tumbleShare:0.22,
      amp:[28,52], yaw:30, depth:[0.75,1.15], tilt:25,
      /* weighted: star 40%, rectangle 20%, line 20%, square 20%.
         Repeat an entry to weight it - the array is sampled uniformly. */
      shapes:["st","st","st","st","rc","rc","ln","ln","sq","sq"],
      /* VIBGYOR. Front/back pairs - the back is the SAME hue darkened, never a
         different hue, or it reads as two pieces flickering instead of one turning. */
      colors:[["#8B2FC9","#5E1C8C"],   /* violet */
              ["#3F51B5","#27358A"],   /* indigo */
              ["#1E88E5","#135FA6"],   /* blue   */
              ["#22B24C","#157A34"],   /* green  */
              ["#FFD21E","#D9A800"],   /* yellow */
              ["#FF8A1E","#C75F00"],   /* orange */
              ["#E5322D","#A81F1B"]],  /* red    */
      phases:["guided","practice","mastery"]   /* [] disables phase gating */
    },
    burst: function(opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(M.still()) return;
        /* confetti ONLY on activity phases - never tutorials, demos, landing, transitions */
        if(o.phases.length && o.phase && o.phases.indexOf(o.phase) < 0) return;
        var host = document.querySelector(o.host); if(!host) return;

        var dist = host.clientHeight + 60, maxLife = 0;
        var wrap = document.createElement("div");
        wrap.className = "fx-confetti";

        for(var i = 0; i < o.count; i++){
          var z     = rnd(o.depth[0], o.depth[1]);        /* depth */
          var fall  = rnd(o.fall[0], o.fall[1]) / z;      /* nearer = bigger = faster */
          var delay = rnd(0, o.stagger);
          if(fall + delay > maxLife) maxLife = fall + delay;
          var pair = o.colors[i % o.colors.length];
          /* most pieces flutter (face stays visible); a minority go end-over-end */
          /* Two regimes, and a real plate moves DIFFERENTLY in each:
             flutter = zigzags hard, almost no net sideways drift;
             tumble  = autorotation gives a steady lateral force, so it barely
                       zigzags but drifts consistently to one side. */
          var flutter = Math.random() > o.tumbleShare;
          var rockT   = flutter ? rnd(o.rockT[0], o.rockT[1])
                                : rnd(o.tumbleT[0], o.tumbleT[1]);
          var sway    = flutter ? rnd(o.sway[0], o.sway[1]) : rnd(2, 8);
          var drift   = flutter ? rnd(-o.drift/2.5, o.drift/2.5) : rnd(-o.drift, o.drift);
          var bob     = flutter ? rnd(o.bob[0], o.bob[1]) : rnd(2, 4);

          /* set every property once - they inherit down to .w and .f */
          var p = document.createElement("i"); p.className = "p";
          p.style.cssText =
            "--x:"     + rnd(-2, 98).toFixed(1) + "%;" +
            "--dist:"  + dist + "px;" +
            "--fall:"  + fall.toFixed(2) + "s;" +
            "--delay:" + delay.toFixed(2) + "s;" +
            "--drift:" + drift.toFixed(0) + "px;" +
            "--sway:"  + sway.toFixed(0) + "px;" +
            "--bob:"   + bob.toFixed(1) + "px;" +
            "--rockT:" + rockT.toFixed(2) + "s;" +
            /* capped short of 90deg: even at max tilt the face still reads */
            "--amp:"   + Math.round(rnd(o.amp[0], o.amp[1])) + "deg;" +
            "--yaw:"   + Math.round(rnd(-o.yaw, o.yaw)) + "deg;" +
            "--tilt:"  + Math.round(rnd(-o.tilt, o.tilt)) + "deg;" +
            "--z:"     + z.toFixed(2) + ";" +
            "--dim:"   + (0.72 + (z - o.depth[0]) /
                          (o.depth[1] - o.depth[0]) * 0.28).toFixed(2) + ";" +
            /* shapes stay legible by ASPECT RATIO, not size - see the shape table */
            "--c:"     + pair[0] + ";--c2:" + pair[1] + ";";

          var w = document.createElement("i"); w.className = "w";
          var f = document.createElement("i");
          f.className = "f " + o.shapes[Math.floor(Math.random() * o.shapes.length)] +
                        (flutter ? "" : " tum");
          w.appendChild(f); p.appendChild(w); wrap.appendChild(p);
        }
        host.appendChild(wrap);
        /* lifetime is computed, not hard-coded - a longer fall cannot be cut off */
        setTimeout(function(){ wrap.remove(); }, (maxLife + 0.3) * 1000);
      });
    },
    /* stops a slide advancing mid-celebration. 8s safety cap. */
    after: function(fn){
      var started = Date.now();
      (function check(){
        if(!document.querySelector(".fx-confetti") || Date.now() - started > 8000){ fn(); return; }
        setTimeout(check, 200);
      })();
    }
  };
})();
/* ===== FLN ANIMATION KIT: confetti END ===== */

/* ===== FLN ANIMATION KIT: star-burst BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;
  M.starBurst = {
    defaults:{ host:"#confetti", w:1333, h:750,
      colors:["#FFE400","#FFBD00","#E89400","#FFCA6C","#FDFFB8"],
      /* retuned: fewer, slower, longer. Travel distance is held at ~547px so the
         burst still fills the same area - only the density and pace changed. */
      ticks:150, decay:0.975, startV:14, shots:[0,220,440], spin:0.18,
      stars:32, starScale:1.8, circles:8, circleScale:1.0 },
    fire: function(opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(M.still()) return;
        var host = document.querySelector(o.host); if(!host) return;
        var cv = document.createElement("canvas");
        cv.width = o.w; cv.height = o.h;                 // design grid, scaled by CSS
        cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
        host.appendChild(cv);
        var ctx = cv.getContext("2d"), parts = [];

        function starPath(r){
          ctx.beginPath();
          for(var i = 0; i < 10; i++){
            var rad = (i % 2 === 0) ? r : r/2, a = Math.PI/5*i - Math.PI/2;
            ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(a)*rad, Math.sin(a)*rad);
          }
          ctx.closePath();
        }
        function add(n, scalar, shape){
          for(var i = 0; i < n; i++){
            var a = Math.random()*Math.PI*2;
            parts.push({ x:cv.width/2, y:cv.height/2, ax:Math.cos(a), ay:Math.sin(a),
              vel:o.startV*(0.5 + Math.random()), tick:0, scalar:scalar, shape:shape,
              color:o.colors[Math.floor(Math.random()*o.colors.length)],
              rot:Math.random()*Math.PI*2, spin:(Math.random()-.5)*o.spin });
          }
        }
        function shoot(){ add(o.stars, o.starScale, "star"); add(o.circles, o.circleScale, "circle"); }
        o.shots.forEach(function(ms){ ms ? setTimeout(shoot, ms) : shoot(); });

        /* derived from the LAST shot, so retiming the shots cannot end the loop
           before they have all fired. A hard-coded 30 breaks if shots move later. */
        var minFrames = Math.max.apply(null, o.shots) / 16 + 20;
        var frames = 0;
        (function frame(){
          ctx.clearRect(0, 0, cv.width, cv.height);
          var alive = false;
          for(var i = 0; i < parts.length; i++){
            var p = parts[i];
            if(p.tick >= o.ticks) continue;
            alive = true;
            p.x += p.ax*p.vel; p.y += p.ay*p.vel; p.vel *= o.decay;
            p.rot += p.spin; p.tick++;
            ctx.globalAlpha = 1 - p.tick/o.ticks;
            ctx.fillStyle = p.color;
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
            if(p.shape === "star"){ starPath(8*p.scalar); ctx.fill(); }
            else { ctx.beginPath(); ctx.arc(0, 0, 6*p.scalar, 0, Math.PI*2); ctx.fill(); }
            ctx.restore();
          }
          frames++;
          if(alive || frames < minFrames) requestAnimationFrame(frame);  // survive delayed shots
          else setTimeout(function(){ cv.remove(); }, 300);
        })();
      });
    }
  };
})();
/* ===== FLN ANIMATION KIT: star-burst END ===== */

/* ===== FLN ANIMATION KIT: correct-select BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;
  function rnd(a, b){ return a + Math.random() * (b - a); }
  function mk(cls){ var i = document.createElement("i"); i.className = cls; return i; }

  /* Every deferred step is parked ON THE TILE so clear() can cancel it. Without this
     a second play inherits the FIRST play's pending timers and they strip the state
     off the new beat part-way through. Owning the timers is what makes these safely
     re-fireable, which the 2-attempt ladder needs. */
  function later(el, fn, ms){ (el._selT = el._selT || []).push(setTimeout(fn, ms)); }

  /* Tempo lives in CSS (--fx-beat / --fx-reward) so the two effects cannot drift
     apart. JS reads it rather than keeping a second copy, and only writes --ckT or
     --wgT when a caller explicitly passes `dur`. Custom properties do not resolve
     calc(), so the two numbers are read and multiplied here rather than reading
     the composed value. */
  function tempo(el){
    var cs = getComputedStyle(el);
    function num(p, d){
      var v = parseFloat(cs.getPropertyValue(p));
      if(!v && v !== 0) return d;
      return v > 20 ? v / 1000 : v;              /* tolerate ms as well as s */
    }
    var beat = num("--fx-beat", 0.4);
    return { beat: beat, reward: beat * (parseFloat(cs.getPropertyValue("--fx-reward")) || 2) };
  }

  M.answer = {
    clear: function(el){
      if(!el) return;
      if(el._selT){ for(var j = 0; j < el._selT.length; j++) clearTimeout(el._selT[j]); }
      el._selT = [];
      el.classList.remove("ck-correct", "wg-wrong", "wg-out", "wg-rel");
      var fx = el.querySelectorAll(".ck-fx,.wg-fx");
      for(var i = 0; i < fx.length; i++) fx[i].remove();
    }
  };

  M.correctSelect = {
    defaults:{ crown:5 },      /* dur comes from CSS unless you pass one */
    play: function(el, opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(!el) return;
        M.answer.clear(el);
        void el.offsetWidth;                 /* forced reflow - restarts the pop */
        var dur = o.dur || tempo(el).reward;            /* CSS owns the tempo */
        if(o.dur) el.style.setProperty("--ckT", dur + "s");

        var fx = mk("ck-fx");

        if(o.crown && !M.still()){
          var cr = mk("ck-crown");
          /* clientWidth is layout px INSIDE the scaled stage - design px already.
             getBoundingClientRect() would come back multiplied by --scale (R1). */
          var w = el.clientWidth || 96, h = el.clientHeight || 96;
          var rx = w * 0.46, ry = h * 0.46;               /* the tile's own edge */
          for(var i = 0; i < o.crown; i++){
            var t  = (o.crown === 1) ? 0.5 : i / (o.crown - 1);
            var a  = (-158 + t * 136 + rnd(-7, 7)) * Math.PI / 180;   /* TOP arc */
            var x0 = Math.cos(a) * rx, y0 = Math.sin(a) * ry;
            var out = rnd(.20, .34);
            var s = mk("");
            s.style.cssText =
              "--ss:" + rnd(7, 12).toFixed(1) + "px;" +
              "--x0:" + x0.toFixed(1) + "px;" +
              "--y0:" + y0.toFixed(1) + "px;" +
              "--sx:" + (x0 + Math.cos(a) * w * out).toFixed(1) + "px;" +
              "--sy:" + (y0 + Math.sin(a) * h * out).toFixed(1) + "px;" +
              "--sr:" + Math.round(rnd(-140, 140)) + "deg;";
            cr.appendChild(s);
          }
          fx.appendChild(cr);
        }

        /* class FIRST: the border and the pop are the feedback, and they must not
           wait on ~9 nodes of decoration being built. Measured 45ms of dead time
           before any pixel moved when this ran the other way round. */
        el.classList.add("ck-correct");
        el.appendChild(fx);
        /* Only the TRANSIENT layers are swept. .ck-correct stays: the green outline
           is the correct-mark and it belongs to the tile until the slide advances. */
        later(el, function(){
          var t = fx.querySelectorAll(".ck-crown");
          for(var i = 0; i < t.length; i++) t[i].remove();
        }, dur * 1050);
      });
    }
  };
})();
/* ===== FLN ANIMATION KIT: correct-select END ===== */

/* ===== FLN ANIMATION KIT: wrong-select BEGIN ===== */
/* needs the `later`, `tempo` and `M.answer.clear` helpers from recipe 19 */
(function(){ "use strict";
  var M = window.FLNMotion;
  function mk(cls){ var i = document.createElement("i"); i.className = cls; return i; }
  function later(el, fn, ms){ (el._selT = el._selT || []).push(setTimeout(fn, ms)); }
  /* ---- KIT PATCH (install-time), not part of the published block ----------
     Recipe 20's header says it "needs the `later`, `tempo` and `M.answer.clear`
     helpers from recipe 19". It re-declares `mk` and `later` in this IIFE but not
     `tempo`, which is local to recipe 19's IIFE - so both play() and out() threw
     `ReferenceError: tempo is not defined`. M.guard swallows it, so the wrong
     answer beat was silently DEAD rather than visibly broken. Verified with node
     before patching. Remove this once the kit block carries the helper itself. */
  function tempo(el){
    var cs = getComputedStyle(el);
    function num(p, d){
      var v = parseFloat(cs.getPropertyValue(p));
      if(!v && v !== 0) return d;
      return v > 20 ? v / 1000 : v;              /* tolerate ms as well as s */
    }
    var beat = num("--fx-beat", 0.4);
    return { beat: beat, reward: beat * (parseFloat(cs.getPropertyValue("--fx-reward")) || 2) };
  }

  M.wrongSelect = {
    defaults:{},               /* dur comes from CSS unless you pass one */

    /* transient: shakes, holds red, then RELEASES */
    play: function(el, opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(!el) return;
        M.answer.clear(el);
        void el.offsetWidth;
        var dur = o.dur || tempo(el).beat;              /* CSS owns the tempo */
        if(o.dur) el.style.setProperty("--wgT", dur + "s");
        el.classList.add("wg-wrong");          /* class first - see recipe 19 */
        var fx = mk("wg-fx"); fx.appendChild(mk("wg-pulse"));
        el.appendChild(fx);
        /* RELEASE on a timeout, never on animationend: under the reduced-motion kill
           switch animationend never fires and the tile would stay red forever - on
           exactly the devices least able to recover from it. (R5, second half.)
           .wg-rel goes on BEFORE .wg-wrong comes off so the border has something to
           transition with. */
        later(el, function(){
          el.classList.add("wg-rel");
          el.classList.remove("wg-wrong");
          var f = el.querySelector(".wg-fx"); if(f) f.remove();
          later(el, function(){
            el.classList.remove("wg-rel");
            if(o.then) o.then();
          }, 260);
        }, dur * 1500 + 40);
      });
    },

    /* elimination: shakes once, recedes, and STAYS recessed. No auto-clear. */
    out: function(el, opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(!el) return;
        M.answer.clear(el);
        void el.offsetWidth;
        var dur = o.dur || tempo(el).beat;
        if(o.dur) el.style.setProperty("--wgT", dur + "s");
        el.classList.add("wg-out");
        var fx = mk("wg-fx"); fx.appendChild(mk("wg-pulse"));
        el.appendChild(fx);
      });
    }
  };
})();
/* ===== FLN ANIMATION KIT: wrong-select END ===== */

/* ===== FLN ANIMATION KIT: object-outline BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;
  var ST = ["is-correct", "is-wrong", "is-muted"];

  M.objectOutline = {
    /* state is just a class - both engines read the same ones */
    set: function(el, state){
      M.guard(function(){
        if(!el) return;
        for(var i = 0; i < ST.length; i++) el.classList.remove(ST[i]);
        void el.offsetWidth;                  /* restart - as in recipe 19 */
        if(state) el.classList.add("is-" + state);
      });
    },
    correct: function(el){ this.set(el, "correct"); },
    muted:   function(el){ this.set(el, "muted"); },
    reset:   function(el){ if(el && el._olT) clearTimeout(el._olT); this.set(el, ""); },

    /* wrong RELEASES back to idle white - the child has another attempt, exactly
       as the tile does in recipe 20. Timeout, never animationend: under the
       reduced-motion kill-switch animationend never fires. */
    wrong: function(el, opts){
      var o = opts || {}, self = this;
      M.guard(function(){
        if(!el) return;
        self.set(el, "wrong");
        var v = parseFloat(getComputedStyle(el).getPropertyValue("--olT")) || 0.4;
        if(v > 20) v = v / 1000;
        if(el._olT) clearTimeout(el._olT);
        el._olT = setTimeout(function(){
          el.classList.remove("is-wrong");
          if(o.then) o.then();
        }, v * 1500 + 40);
      });
    },

    /* OPTIONAL, and read the caveat. A rectangular hit box over an irregular sprite
       steals taps meant for whatever is behind it - two overlapping characters and
       the child taps the wrong one. This tests the tap against the sprite's ALPHA.
       It FAILS OPEN: reading pixels back taints the canvas on file://, which is how
       the activities ship, so there it always returns true and you are back to the
       bounding box. Treat it as a dev-server nicety, not a guarantee - the reliable
       fix is z-order and not overlapping the tappable parts in the first place. */
    alphaHit: function(img, clientX, clientY){
      var r = img.getBoundingClientRect();
      if(clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom)
        return false;
      if(img._olA === undefined){
        try{
          var w = Math.min(img.naturalWidth, 256);
          var h = Math.round(img.naturalHeight * w / img.naturalWidth);
          var c = document.createElement("canvas"); c.width = w; c.height = h;
          var x = c.getContext("2d"); x.drawImage(img, 0, 0, w, h);
          img._olA = x.getImageData(0, 0, w, h);
        }catch(e){ img._olA = null; }         /* tainted - fail OPEN */
      }
      if(!img._olA) return true;
      var d = img._olA;
      var px = Math.floor((clientX - r.left) / r.width  * d.width);
      var py = Math.floor((clientY - r.top)  / r.height * d.height);
      return d.data[(py * d.width + px) * 4 + 3] > 24;
    }
  };
})();
/* ===== FLN ANIMATION KIT: object-outline END ===== */

/* [engine JS] DEV NAV — a review/QA slide navigator. Shows ONLY with ?dev=1 or ?nav=1 (children never
   see it). Jump to any slide by dropdown, step ◀▶, first/last, or back to the landing. Uses the
   engine's own mountSlide + state.idx; a light poll keeps the label synced when the game self-advances. */
function buildDevNav(){
  if(document.getElementById("devNav")) return;
  const bar = document.createElement("div"); bar.id = "devNav"; bar.className = "dev-nav";
  const mk = (txt, title)=>{ const b = document.createElement("button"); b.className = "dev-nav-btn"; b.textContent = txt; if(title) b.title = title; return b; };
  const land = mk("⌂", "landing"), first = mk("⏮", "first"), prev = mk("◀", "prev"), next = mk("▶", "next"), last = mk("⏭", "last");
  const sel = document.createElement("select"); sel.className = "dev-nav-sel"; sel.title = "jump to slide";
  CARD.slides.forEach((s, i)=>{ const o = document.createElement("option"); o.value = i; o.textContent = (i+1) + ". " + s.id + " · " + s.type; sel.appendChild(o); });
  const lbl = document.createElement("span"); lbl.className = "dev-nav-lbl";
  const cur = ()=> (state && typeof state.idx === "number") ? state.idx : 0;
  const leaveStart = ()=>{ const sg = $("startGate"); if(sg) sg.classList.add("hidden"); document.body.classList.remove("is-start"); document.body.classList.add("loaded"); const bl = $("bootLoader"); if(bl) bl.remove(); };
  const sync = ()=>{ const i = cur(); const s = CARD.slides[i]; if(document.activeElement !== sel) sel.value = i;
    lbl.textContent = (i+1) + "/" + CARD.slides.length + (s ? " · " + s.id : ""); };
  const go = (i)=>{ i = Math.max(0, Math.min(i, CARD.slides.length - 1)); leaveStart(); mountSlide(i); sync(); };
  land.onclick = ()=>{ const sg = $("startGate"); if(sg){ sg.classList.remove("hidden"); document.body.classList.add("is-start"); } };
  first.onclick = ()=> go(0); prev.onclick = ()=> go(cur() - 1); next.onclick = ()=> go(cur() + 1); last.onclick = ()=> go(CARD.slides.length - 1);
  sel.onchange = ()=> go(parseInt(sel.value, 10));
  bar.append(land, first, prev, sel, lbl, next, last);
  document.body.appendChild(bar);
  setInterval(sync, 300); sync();
}

boot();

/* ---------- [landing dust] sunlit dust motes on the first screen ----------
   Real dust in a sunbeam, not sprites on rails:
   - VISIBLE ONLY WHERE LIT. Each speck's brightness = the sunlight at its position:
     a falloff spilling down-right from the sun (.sg-sun, read live), so motes
     glint near the window and fade out toward the shaded right side.
   - DRIFTS ON AIR, NOT ON THE LIGHT. Light does not push dust: motion = a slow room
     draught from the window (down-right) + smooth per-particle turbulence + a tiny
     gravity settle + damping (dust is light, drag dominates). No straight paths.
   - TUMBLES. Flakes glint as they rotate to face the sun: brightness pulses ^3.
   - DEPTH. z 0..1: far = tiny, sharp, slow, dim; near = larger, softer (out of
     focus), faster across the screen (parallax). Most dust is far.
   - COMES FROM THE WINDOW (review 2026-09-29: "the particles coming from the direction of
     sunlight?" - 80 dim specks drifting ~5px/s were too faint to see): the draught blows ALONG the
     light (26deg, down-right), most specks re-enter in the sunlit window and fade in there, and
     there are more, slightly larger, brighter specks.
   Pauses off the landing and when the tab is hidden; one static frame under
   prefers-reduced-motion. Coordinates are .sg-fx-local design px (1096x438). */
(function(){
  const cv = document.getElementById("sgDust"); if(!cv || !cv.getContext) return;
  const ctx = cv.getContext("2d"), W = 1096, H = 438, N = 120;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // soft round sprite (one draw per mote); small sizes read as crisp points
  const spr = document.createElement("canvas"); spr.width = spr.height = 32;
  (function(){ const g = spr.getContext("2d"), r = g.createRadialGradient(16,16,0,16,16,16);
    r.addColorStop(0, "rgba(255,251,236,1)"); r.addColorStop(.45, "rgba(255,244,215,.75)");
    r.addColorStop(1, "rgba(255,236,196,0)"); g.fillStyle = r; g.fillRect(0,0,32,32); })();

  /* light field = the sun (the .sg-sun anchor, read live) spilling into the room: an
     elongated falloff pointing down-right from the window (~26deg, the angle of the
     painted wall streak) - bright near the window, gone by the shaded right side. */
  let sun = { x:170, y:70 };
  const LA = 26 * Math.PI / 180, LC = Math.cos(LA), LS = Math.sin(LA);
  function readSun(){
    const f = document.querySelector(".sg-fx .sg-sun");
    if(f) sun = { x:f.offsetLeft, y:f.offsetTop };            // .sg-sun is a 0x0 anchor AT the sun
  }
  function light(x, y){
    const dx = x - sun.x, dy = y - sun.y;
    const s = dx * LC + dy * LS, c = -dx * LS + dy * LC;       // along / across the spill
    const sa = s >= 0 ? s / 520 : s / 150;                     // reaches far into the room, little behind the sun
    return Math.exp(-(sa * sa + (c / 230) * (c / 230)));
  }

  const rnd = (a, b) => a + Math.random() * (b - a);
  function spawn(p, fresh){
    p.z = Math.pow(Math.random(), 1.8);                        // bias far
    // start anywhere on screen the first time; later mostly re-enter IN the sunlit window (fading in there,
    // so they visibly come out of the light), the rest from the window-side edges
    const r0 = Math.random();
    if(fresh){ p.x = rnd(-20, W * .75); p.y = rnd(-10, H); }
    else if(r0 < .7){ p.x = sun.x + rnd(-130, 70); p.y = sun.y + rnd(-60, 90); }
    else if(r0 < .85){ p.x = rnd(-30, -5); p.y = rnd(0, H * .6); }
    else { p.x = rnd(0, W * .4); p.y = rnd(-30, -5); }
    p.vx = rnd(-2, 2); p.vy = rnd(-2, 2);
    p.r  = 1.1 + p.z * 3.4;                                    // radius px
    p.f1 = rnd(.07, .19); p.f2 = rnd(.11, .27); p.ph1 = rnd(0, 6.3); p.ph2 = rnd(0, 6.3);
    p.spin = rnd(.6, 2.2); p.sph = rnd(0, 6.3);
    p.fade = fresh ? 1 : 0;                                    // ease in after respawn
    return p;
  }
  const P = Array.from({length:N}, () => spawn({}, true));

  function fit(){
    const sc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
    const k = Math.min(sc * (window.devicePixelRatio || 1), 2);  // cap backing store for low-end GPUs
    cv.width = Math.round(W * k); cv.height = Math.round(H * k);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    readSun();
    if(reduce) draw(8);                                        // resizing clears the canvas
  }

  function step(p, t, dt){
    const par = .45 + p.z * .9;                                // parallax: near crosses faster
    // room draught from the window, ALONG the light (LA) + slow global gusts
    const ws = 13 + 4 * Math.sin(t * .09);
    const wx = ws * LC, wy = ws * LS + 1.2 * Math.sin(t * .07 + 1.3);
    // smooth turbulence (two incommensurate sines per axis = no visible loop)
    const tx = 7 * Math.sin(t * p.f1 + p.ph1) + 4 * Math.sin(t * p.f2 * 1.7 + p.ph2);
    const ty = 6 * Math.cos(t * p.f2 + p.ph2) + 3 * Math.sin(t * p.f1 * 2.3 + p.ph1);
    const g  = .8 + p.z * .9;                                  // settling: heavier near flakes sink a touch faster
    // drag toward the local air velocity (dust has almost no inertia) + Brownian jitter
    const k = 1 - Math.exp(-1.6 * dt);
    p.vx += ((wx + tx) - p.vx) * k + rnd(-1, 1) * 6 * dt;
    p.vy += ((wy + ty + g) - p.vy) * k + rnd(-1, 1) * 6 * dt;
    p.x += p.vx * par * dt; p.y += p.vy * par * dt;
    if(p.fade < 1) p.fade = Math.min(1, p.fade + dt / 1.5);
    if(p.x > W + 20 || p.y > H + 20 || p.x < -40 || p.y < -40) spawn(p, false);
  }

  function draw(t){
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for(const p of P){
      const L = light(p.x, p.y);
      if(L < .02) continue;                                    // in shade: invisible, like real dust
      const glint = .5 + .5 * Math.pow(Math.max(0, Math.sin(t * p.spin + p.sph)), 3);
      const depth = .45 + .55 * (1 - Math.abs(p.z - .35));     // far dim, very near slightly defocused
      const a = Math.min(1, L * 1.7) * glint * depth * p.fade;
      if(a < .02) continue;
      const d = p.r * 2 * (p.z > .7 ? 1.35 : 1);               // near = out-of-focus blur disc
      ctx.globalAlpha = p.z > .7 ? a * .6 : a;
      ctx.drawImage(spr, p.x - d / 2, p.y - d / 2, d, d);
    }
    ctx.globalAlpha = 1;
  }

  let last = 0, t = 0;
  function frame(now){
    requestAnimationFrame(frame);
    if(!document.body.classList.contains("is-start")){ last = 0; return; }
    const dt = last ? Math.min((now - last) / 1000, .05) : 0; last = now; t += dt;
    for(const p of P) step(p, t, dt);
    draw(t);
  }

  fit();
  window.addEventListener("resize", () => { clearTimeout(fit._t); fit._t = setTimeout(fit, 200); });
  window.addEventListener("load", fit);
  if(reduce){ for(let i = 0; i < 240; i++) for(const p of P) step(p, i / 30, 1 / 30); draw(8); }
  else requestAnimationFrame(frame);
})();

/* ---------- [landing measure] blocks (cubes) appear one by one under the landing pencil ----------
   How we measure length (review 2026-09-29, the bench-and-hand-spans example): the units lie in their OWN row a little
   BELOW the object - they do not touch it - laid in ONE ROW with NO GAPS, and a dashed line dropped from each end of the
   object carries its length down to them. Here: N cubes span exactly the pencil's ink (pencil_purple.webp is framed on
   a 1658x283 canvas: tip x 7, eraser end x 1650, ink rows 7..276), GAP px under it, with a blue start line at the tip
   and a pink end line at the eraser end. Runs AFTER the title animation (see ORDER below), then releases the play button. */
(function(){
  /* CUBES: N flush cubes spanning the pencil, GAP px under it (only ~71 px lie between the pencil and the CTA).
     N = 7 (review 2026-09-29: "increase the size of cubes ... ok if some cubes don't fit, remove them", then "a bit
     more"): the same cubes, 10/7 = 1.43x their first size - the first 7 of the strip, scaled so those 7 span the
     pencil exactly (whole cubes only, none cut by the dotted lines).
     LINES (review: "a lot of glow ... reduce their size"): plain rounded dashes, no glow, LINE_W px wide (CSS .sgm-mark);
     both PINK (review 2026-09-29). */
  const N = 7, GAP = 8, LINE_W = 8, LINE_TOP = 10, LINE_END = 14;   // lines: bold 8x12 dashes (review: "too small")
  /* CUBE ART (review 2026-09-29: "replace the cubes with this"): the supplied row of 10 glossy blue cubes,
     cleaned (haze/specks removed, bodies solid; faces painted out, review 2026-09-29: "remove the faces of the cubes")
     into assets/cubes_blue_row.webp, 2102x214. Its cubes already TOUCH
     (the dark "gaps" are only their rounded corners meeting) - flush, as the game's no-gaps rule wants. Each block div
     shows ITS cube as a slice of that one strip (cuts = the seams between cubes, x px), and the strip is scaled so its
     cube span equals the pencil exactly - so the art is shown as drawn and the blocks still arrive one by one. */
  const ROW = { src: "assets/cubes_blue_row.webp", w: 2102, h: 214, top: 2, bot: 211,
                cuts: [3, 208, 416, 626, 839, 1049, 1260, 1472, 1683, 1893, 2099] };

  const TIP = 7 / 1658, END = 1650 / 1658, INK_TOP = 7 / 283, INK_BOT = 276 / 283;
  /* ORDER (review 2026-09-29): the title words animate on the VO's लंबाई -> THEN the dashed lines at both ends (they mark
     where the pencil starts and stops) -> THEN the cubes, one by one, between them -> THEN the play button pops
     ("sg-intro-done"). 0.35s of lines, then one cube every STEP ms.
     STEP (review 2026-09-30: "the cubes are getting placed very fast"): was 140ms - all 7 popped in within 0.84s, one
     sweep rather than blocks placed one by one. 400ms is a clear one-by-one pace: the 7th lands ~3.3s after the lines
     start (was ~1.7s). Their shadows, the pencil's eyes and the play button's release all follow STEP. */
  const MARK_DUR = 350, CUBES_AFTER = 120, STEP = 400, CUBE_DUR = 420, WATCHDOG = 16000;   // ms; watchdog: never wait for the title fx forever
  const FIRST = MARK_DUR + CUBES_AFTER;                                                    // the first cube, once the lines are in
  let built = false;
  function build(){
    const hero = document.getElementById("sgHero"), pen = hero && hero.querySelector("img");
    if(!pen || !pen.complete || !pen.offsetWidth) return false;
    const x0 = pen.offsetLeft + pen.offsetWidth * TIP, x1 = pen.offsetLeft + pen.offsetWidth * END;
    const yTop = pen.offsetTop + pen.offsetHeight * INK_TOP, yBot = pen.offsetTop + pen.offsetHeight * INK_BOT;
    const C = ROW.cuts, k = (x1 - x0) / (C[N] - C[0]);                 // strip px -> stage px: cube span = pencil span
    const top = yBot + GAP - ROW.top * k, h = ROW.h * k, cubeBot = yBot + GAP + (ROW.bot - ROW.top) * k;
    const box = document.createElement("div"); box.className = "sg-measure"; box.setAttribute("aria-hidden", "true");
    /* SHADOWS on the table (review 2026-09-29: "make it look like the cubes are placed on the table ... and the cubes
       making shadow on the table"): the cubes' bases stand on the tabletop, ~27px in front of its back edge, so each
       cube gets a soft contact shadow ON the table - darkest right at its base, fading out in front of it - laid down
       BEHIND the cubes and the dashed lines (first in the box). The light comes from the window on the left, so the
       row's shadow sits SH_DX px to the right and trails a little further past the last cube. Each shadow grows in as
       its own cube lands (same delay: CSS .sgm-shadow). */
    const SH_UP = 5, SH_H = 21, SH_DX = 3, SH_TAIL = 16;              // stage px
    for(let i = 0; i < N; i++){
      const l = x0 + (C[i] - C[0]) * k + SH_DX, wd = (C[i + 1] - C[i]) * k + (i === N - 1 ? SH_TAIL : 0);
      const sh = document.createElement("div"); sh.className = "sgm-shadow" + (i === 0 ? " first" : "") + (i === N - 1 ? " last" : "");
      sh.style.cssText = "left:" + l.toFixed(2) + "px;top:" + (cubeBot - SH_UP).toFixed(2) + "px;width:" + wd.toFixed(2) + "px;height:" + SH_H + "px;--d:" + (FIRST + i * STEP) + "ms";
      box.appendChild(sh);
    }
    /* once the last cube has landed, the strips give way to ONE shadow of exactly the same shape: side by side, the
       strips' antialiased edges left faint light seams at the cube joins */
    const swapAt = FIRST + (N - 1) * STEP + CUBE_DUR;
    box.style.setProperty("--swap", swapAt + "ms");
    const row = document.createElement("div"); row.className = "sgm-shadow-row";
    row.style.cssText = "left:" + (x0 + SH_DX).toFixed(2) + "px;top:" + (cubeBot - SH_UP).toFixed(2) + "px;width:" + (x1 - x0 + SH_TAIL).toFixed(2) + "px;height:" + SH_H + "px";
    box.appendChild(row);
    for(let i = 0; i < N; i++){
      const b = document.createElement("div"); b.className = "sgm-block";
      b.style.cssText = "left:" + (x0 + (C[i] - C[0]) * k).toFixed(2) + "px;top:" + top.toFixed(2) + "px;width:" + ((C[i + 1] - C[i]) * k).toFixed(2) + "px;height:" + h.toFixed(2) + "px;--d:" + (FIRST + i * STEP) + "ms;" +
        "background-image:url(" + ROW.src + ");background-size:" + (ROW.w * k).toFixed(2) + "px " + h.toFixed(2) + "px;background-position:" + (-C[i] * k).toFixed(2) + "px 0";
      box.appendChild(b);
    }
    /* dashed end lines, centred on the tip and on the eraser end. Length as marked on the review screenshot
       (2026-09-29, "this much lining would be fine"): from LINE_TOP px below the pencil's top down to LINE_END px
       below the blocks (measured there: 58 -> ~221 px on a 1.144x screenshot = top+10 .. blocks+14 stage px) */
    const DASH = 12, PERIOD = 19;                                       // CSS .sgm-mark: a 12px dash every 19px, from the top
    const y0 = yTop + LINE_TOP, want = cubeBot + LINE_END - y0;
    const nDash = Math.max(Math.round((want + PERIOD - DASH) / PERIOD), Math.ceil((cubeBot + 6 - y0 + PERIOD - DASH) / PERIOD));
    const y1 = y0 + nDash * PERIOD - (PERIOD - DASH);                  // ends on a WHOLE dash (review: the last one was cut off), still below the cubes
    const marksAt = 0;                                                  // the lines come FIRST, then the cubes
    [["start", x0], ["end", x1]].forEach(([k, x])=>{
      const e = document.createElement("div"); e.className = "sgm-mark " + k;
      e.style.cssText = "left:" + (x - LINE_W / 2).toFixed(2) + "px;top:" + y0.toFixed(2) + "px;width:" + LINE_W + "px;height:" + (y1 - y0).toFixed(2) + "px;--d:" + marksAt + "ms";
      box.appendChild(e);
    });
    hero.appendChild(box);                                          // AFTER the pencil: it stays the first .sg-art img
    built = box; return true;
  }
  let started = false;
  const introDone = ()=>{ if(!window.__sgIntroDone){ window.__sgIntroDone = true; document.dispatchEvent(new Event("sg-intro-done")); } };
  function run(){                                                    // the cubes, then the lines, then the play button
    if(started) return;
    if(!built && !build()){ setTimeout(run, 120); return; }
    started = true;
    const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduce){ built.classList.add("static"); introDone(); return; }
    built.classList.add("go");
    setTimeout(introDone, FIRST + (N - 1) * STEP + CUBE_DUR);         // once the last cube has landed
    const eyes = window.SGEyes;                                        // the pencil's eyes (app.js [pencil eyes]) watch its own measuring
    if(eyes){
      const marks = built.querySelectorAll(".sgm-mark"), blocks = built.querySelectorAll(".sgm-block");
      if(marks[0]) eyes.look("measure", marks[0], 7, 220);
      setTimeout(()=>{ if(marks[1]) eyes.look("measure", marks[1], 7, FIRST - 200 + 60); }, 200);
      blocks.forEach((b, i)=> setTimeout(()=> eyes.look("measure", b, 7, STEP + 80), FIRST + i * STEP));
      setTimeout(()=>{ eyes.react("happy"); if(blocks[3]) eyes.look("measure", blocks[3], 7, 800); }, FIRST + (N - 1) * STEP + CUBE_DUR * 0.7);
    }
  }
  // step 1 is the title animation (it fires "sg-title-fx-done"); a watchdog from the loader lifting covers a title
  // animation that never runs (autoplay blocked, a different title)
  if(window.__sgTitleFxDone) run(); else document.addEventListener("sg-title-fx-done", run, { once: true });
  const armWatchdog = ()=> setTimeout(run, WATCHDOG);
  if(document.body.classList.contains("loaded")) armWatchdog();
  else new MutationObserver((_, o)=>{ if(document.body.classList.contains("loaded")){ o.disconnect(); armWatchdog(); } })
         .observe(document.body, { attributes: true, attributeFilter: ["class"] });
})();

/* ---------- [pencil eyes] the landing pencil's eyes come alive ----------
   Review 2026-09-29: "add life to the eye of the pencil - wherever something is happening the eyeballs look towards
   that animation and express with the eyes". The painted face is turned a quarter turn: its UP points to the eraser
   (screen +x). So its brows sit to the right of its eyes, its upper lids close from right to left, and its lower lids
   rise from the left.
   RIG: the eyes are drawn live on a small canvas over the face (in #sgHero, above the pencil <img> and its stretch
   canvas - the face is on the part of the pencil that never stretches). Per eye, clipped to the painted eyeball's
   inner edge (measured on pencil_purple.webp: one ellipse per eye): a white eyeball with soft shading, an iris ~13%
   smaller than the painted one (so the look direction reads at this size), a pupil that widens and narrows, two
   shines, and eyelids in the barrel's own purple (its row colours, taken from the art) with a lash line. The brows
   are cut from the art (assets/pencil_face_rig.webp: the barrel with the brows removed, plus each brow) and lift and
   tilt as pieces.
   BRAIN: each landing animation says where it is - SGEyes.look(id, element | {x,y} | fn, priority, ms) - and the
   eyes watch the most important live one; otherwise they wander between the child (straight out), Swifty and, once
   it is up, the play button. They move like real eyes: a fast jump (saccade, 50-170ms) to each new target, smooth
   following for moving things (with catch-up jumps), tiny drifts while they rest, a blink every 2-5s and often with a
   big jump. SGEyes.react(name) adds an expression for a moment: surprise (eyes grow, pupils narrow, brows up), wince
   (a squeeze blink, brows down), happy (lower lids up "^^", pupils wide), curious (one brow up, pupils wide).
   SAFE: canvas draws only; the loop stops off the landing; reduced motion = eyes that look at the child and blink;
   any error removes the overlay, which leaves the painted eyes. */
(function(){
  "use strict";
  const ART_W = 1658, ART_H = 283;
  // eyeball outline per eye: centre + semi-axes of its OUTER edge (art px); the outline is RING px wide
  const EYES = [ { cx: 1232.5, cy: 84.9, a: 48.0, b: 45.4 }, { cx: 1231.8, cy: 189.9, a: 48.4, b: 43.8 } ];
  const FACE = { x: 1232, y: 137 };                          // between the eyes: where "the pencil" looks from
  const RING = 4.8, IRIS_R = 30.5, PUPIL_R = 16.5;
  const SHINE = [13.7, -10.9, 7.8], SHINE2 = [-10.5, 10.5, 2.8];   // on the iris: [dx, dy, r] - the painted shine's place
  const REG_X = 1170, REG_W = 176;                           // the canvas covers art x 1170..1346, full height
  const RIG_SRC = "assets/pencil_face_rig.webp";
  // rig sheet tiles (x offset of the clean patch and of the brow; the tile's art box; the brow's pivot)
  const BROWS = [ { clean: 0,   brow: 72,  box: [1268, 34, 70, 80],  c: [1306.0, 71.8],  tilt: 1 },
                  { clean: 144, brow: 216, box: [1268, 160, 70, 82], c: [1306.1, 203.5], tilt: -1 } ];
  const BROW_UP = 5, BROW_DOWN = 4;                          // art px the brows travel (toward the eraser = up)
  // the barrel's colour every 3 art px from y 33 (its stripes run along the pencil): the eyelids' skin
  const LID_Y0 = 33, LID_DY = 3, LID_COL = ("dcc2ff,d0acfd,cda0fb,cc9ffb,cc9dfc,cf9dfb,cd9efb,cfa2ff,cfa3fd,cda3ff,d0a6fd,d1aafd,d1aafd,d0acff," +
    "d0acfd,d2affd,d2b1fe,d1b0fd,d1b0fd,d3b5fc,d4b6fe,d3b8ff,d3b8fd,d5bafe,d6bbfd,d7bdfc,d8befd,cda6fc,ca9afc,c996fe,c996fe,c592fc,c78eff," +
    "c88cfe,c68dfe,c68dfe,c58dfb,c78bfd,c286fc,c286fc,c485fc,c485fc,c485fc,c280fd,c280fd,c37fff,c07bfd,bf79fe,c079fc,bf77fd,c177fd,be70fc," +
    "ab5fe4,a259d9,a259d9,9f58d4,9c56d0,9c56d0,9c56d0,9b55cf,9b55cf,9a54ce,9a54ce,9a54ce,9653c9,9754ca,9754ca,9754ca,8b4cba,7d41a7").split(",");
  const Z = 70;                                              // screen px "in front of" the eyes: how a screen point maps to a look direction
  const reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const now = ()=> performance.now();
  const lerp = (a, b, k)=> a + (b - a) * k, clamp01 = v => Math.max(0, Math.min(1, v));

  /* ---- expressions: every value springs toward its target; a reaction holds its targets for a while ---- */
  const NEUTRAL = { scale: 1, pupil: 1, lidU: 0, lidL: 0, lidH: 0, lift: 0, tilt: 0, liftB: 0 };
  const EXPR = {
    surprise: { ms: 900,  v: { scale: 1.07, pupil: 0.72, lift: 1, tilt: -0.08 } },
    wince:    { ms: 420,  v: { lift: -0.8, tilt: 0.2 } },     // + a squeeze: the lids snap shut and hold (see react)
    happy:    { ms: 1300, v: { lidH: 0.7, pupil: 1.12, lift: 0.5, tilt: -0.1 } },
    curious:  { ms: 1000, v: { pupil: 1.15, liftB: 1 } }
  };
  const P = {}; for(const k in NEUTRAL) P[k] = { v: NEUTRAL[k], vel: 0 };
  let expr = null, exprUntil = 0;
  const lidsBusy = tn => !!(expr && tn < exprUntil + 250 && expr.v.lidH) || P.lidH.v > 0.05;   // no natural blink across a happy squint
  function springs(dt, tn){
    const e = expr && tn < exprUntil ? expr : null;
    for(const k in P){
      const p = P[k], tgt = e && k in e.v ? e.v[k] : NEUTRAL[k];
      const K = k === "scale" ? 700 : 380, C = k === "scale" ? 24 : 36;         // the eyes pop a touch when they grow
      p.vel += (K * (tgt - p.v) - C * p.vel) * dt; p.v += p.vel * dt;
    }
  }

  /* ---- attention: id -> { t: Element | {x,y} | fn, pri, until, at } ---- */
  const src = new Map();
  const api = {
    look(id, t, pri, ms){ if(!t) return; const old = src.get(id);
      src.set(id, { t, pri: pri || 1, until: now() + (ms || 250), at: old && old.t === t ? old.at : now() }); },
    release(id){ src.delete(id); },
    react(name){ if(reduce || !EXPR[name]) return; expr = EXPR[name]; exprUntil = now() + expr.ms;
      if(name === "wince") blink(now(), 170, true); }
  };
  window.SGEyes = api;

  /* layout reads are cached (80-500ms): the eyes must never force the page to re-layout on every frame (low-end tablets) */
  let mascotAt = -1e9, mascotP = null;
  const mascot = ()=>{ const tn = now(); if(tn - mascotAt < 400) return mascotP; mascotAt = tn; mascotP = null;
    for(const m of document.querySelectorAll(".sg-mascot")){ const r = m.getBoundingClientRect(), cs = getComputedStyle(m);
      if(r.width && r.height && cs.visibility !== "hidden" && +cs.opacity > 0.05){ mascotP = { x: r.left + r.width * 0.5, y: r.top + r.height * 0.3 }; break; } }
    return mascotP; };
  const rects = new WeakMap();
  function centreOf(el, tn){ let c = rects.get(el);
    if(!c || tn - c.t > 80){ const r = el.getBoundingClientRect(); c = { t: tn, p: r.width || r.height ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null }; rects.set(el, c); }
    return c.p; }
  const idle = { t: "child", until: 0 };
  function chooseIdle(){
    const btn = document.getElementById("sgBtn"), btnOn = !!(window.__sgIntroDone && btn), r = Math.random();
    if(btnOn && r < 0.32) return btn;                          // the play button, once it is up: an invitation
    if(r < (btnOn ? 0.47 : 0.3)) return mascot;
    if(r < 0.88) return "child";
    const card = document.querySelector(".sg-card"); if(!card) return "child";
    const c = card.getBoundingClientRect();                     // a glance somewhere on the card
    return { x: c.left + c.width * (0.15 + 0.7 * Math.random()), y: c.top + c.height * (0.2 + 0.6 * Math.random()) };
  }
  function pickTarget(tn){
    let best = null;
    for(const [id, s] of src){ if(s.until < tn){ src.delete(id); continue; }
      if(!best || s.pri > best.pri || (s.pri === best.pri && s.at > best.at)) best = s; }
    if(best) return best.t;
    if(tn >= idle.until){ idle.t = chooseIdle(); idle.until = tn + 1300 + Math.random() * 1900; }
    return idle.t;
  }

  /* ---- gaze: a look direction g in the unit disc (0,0 = straight out at the child), shared by both eyes ---- */
  const E = { x: 0, y: 0 };                                  // the face on screen, updated every frame
  let g = { x: -0.8, y: 0 }, sac = null, jit = { x: 0, y: 0 }, nextJit = 0;
  function aim(t, tn){
    if(t === "child") return { x: 0, y: 0 };
    let p = t;
    if(typeof t === "function") p = t();
    else if(t && t.getBoundingClientRect) p = centreOf(t, tn);
    if(!p) return { x: 0, y: 0 };
    const dx = p.x - E.x, dy = p.y - E.y, n = Math.sqrt(dx * dx + dy * dy + Z * Z);
    return { x: dx / n, y: dy / n };
  }
  function gaze(dt, tn, T){
    const a = aim(T, tn);
    if(tn > nextJit){ const m = 0.04 + Math.random() * 0.06, th = Math.random() * 6.2832;   // tiny drifts while it rests
      jit = { x: m * Math.cos(th), y: m * Math.sin(th) }; nextJit = tn + 700 + Math.random() * 1100; }
    const tx = a.x + jit.x, ty = a.y + jit.y, dx = tx - g.x, dy = ty - g.y, dist = Math.hypot(dx, dy);
    if(sac){                                                   // a saccade lands on where the target is NOW
      const k = Math.min(1, (tn - sac.t0) / sac.ms), e = 1 - Math.pow(1 - k, 3);
      g.x = sac.x0 + (tx - sac.x0) * e; g.y = sac.y0 + (ty - sac.y0) * e; if(k >= 1) sac = null;
    } else if(dist > 0.16){
      sac = { t0: tn, ms: 50 + 70 * Math.min(dist, 1.7), x0: g.x, y0: g.y };
      if(dist > 0.55 && tn - lastBlink > 1200 && !lidsBusy(tn) && Math.random() < 0.35) blink(tn);   // big jumps often come with a blink
    } else { const k = 1 - Math.exp(-dt * 12); g.x += dx * k; g.y += dy * k; }        // smooth following
  }

  /* ---- blinks ---- */
  let blinkAt = -1, blinkHold = 25, lastBlink = 0, nextBlink = 0, dbl = 0;
  function blink(tn, hold, force){                           // hold: ms fully shut (a blink 25, the wince's squeeze longer)
    if(blinkAt >= 0 && !force) return;
    blinkAt = tn; blinkHold = hold || 25; lastBlink = tn; nextBlink = tn + 2200 + Math.random() * 3300;
    if(!hold && Math.random() < 0.12) dbl = tn + 330;        // now and then a double blink
  }
  function blinkU(tn){
    if(blinkAt < 0) return 0;
    const t = tn - blinkAt, o = 70 + blinkHold;
    if(t < 70){ const k = t / 70; return k * k; }            // closes fast...
    if(t < o) return 1;
    if(t < o + 135){ const k = (t - o) / 135; return (1 - k) * (1 - k); }   // ...opens a little slower
    blinkAt = -1; return 0;
  }

  /* ---- drawing (in art px: the canvas transform maps the pencil art onto it) ---- */
  let cv = null, ctx = null, img = null, rig = null, irisC = null, S = 1, layoutKey = "";
  const sclera = [], lidGrad = [], lidLight = [];
  function makeIris(){
    const R = IRIS_R, K = 5, c = document.createElement("canvas"); c.width = c.height = Math.ceil(2 * R * K);
    const x = c.getContext("2d"); x.scale(K, K); x.translate(R, R);
    const gr = x.createRadialGradient(0, 0, 0, 0, 0, R);
    [[0, "#4a2106"], [0.5, "#7d3d0c"], [0.66, "#a15616"], [0.8, "#b46a22"], [0.9, "#8a4611"], [0.96, "#4b1f05"], [1, "#2a1003"]].forEach(s => gr.addColorStop(s[0], s[1]));
    x.beginPath(); x.arc(0, 0, R, 0, 6.2832); x.fillStyle = gr; x.fill(); x.save(); x.clip();
    let seed = 7; const rnd = ()=> (seed = (seed * 16807) % 2147483647) / 2147483647;
    for(let k = 0; k < 44; k++){                               // the iris's fibres, light and dark in turn
      const th = k / 44 * 6.2832 + rnd() * 0.08, r0 = R * (0.52 + rnd() * 0.06), r1 = R * (0.82 + rnd() * 0.12);
      x.strokeStyle = (k % 2 ? "rgba(222,150,72," : "rgba(58,22,4,") + (0.18 + rnd() * 0.2).toFixed(2) + ")"; x.lineWidth = 0.6 + rnd() * 1.1;
      x.beginPath(); x.moveTo(Math.cos(th) * r0, Math.sin(th) * r0); x.lineTo(Math.cos(th) * r1, Math.sin(th) * r1); x.stroke();
    }
    x.strokeStyle = "rgba(30,10,2,.55)"; x.lineWidth = 2.2; x.beginPath(); x.arc(0, 0, R - 1.1, 0, 6.2832); x.stroke();   // limbal ring
    x.restore(); return c;
  }
  function makeGradients(){
    EYES.forEach((e, i)=>{
      const ia = e.a - RING, ib = e.b - RING;
      const s = ctx.createRadialGradient(-0.2 * ia, -0.12 * ib, 2, 0, 0, Math.max(ia, ib) * 1.02);
      [[0, "#ffffff"], [0.55, "#fcfafa"], [0.8, "#f1edec"], [0.93, "#e2dcdc"], [1, "#cfc7cb"]].forEach(st => s.addColorStop(st[0], st[1]));
      sclera[i] = s;
      const y0 = LID_Y0 - e.cy, y1 = LID_Y0 + LID_DY * (LID_COL.length - 1) - e.cy, l = ctx.createLinearGradient(0, y0, 0, y1);
      LID_COL.forEach((c, k)=> l.addColorStop(k / (LID_COL.length - 1), "#" + c));
      lidGrad[i] = l;
      const s2 = ctx.createLinearGradient(0, -ib, 0, ib);     // a lid is a dome over the eyeball: lit from above, shaded below
      s2.addColorStop(0, "rgba(255,255,255,.16)"); s2.addColorStop(0.5, "rgba(255,255,255,0)"); s2.addColorStop(1, "rgba(60,20,100,.16)");
      lidLight[i] = s2;
    });
  }
  /* EYELIDS (eye-local art px; t = y / ib from -1 to 1 along the eye). A lid covers the eye from one side up to its edge
     x(t) = x1 + (x0 - x1)(1 - t^2): x1 at the ends, x0 in the middle. Blinks: the upper lid (from +x, the face's top) and
     the lower lid (from -x) meet on the closed line x = XM - BM (1 - t^2) - bowed toward the face's bottom, like a
     closed eye. Happy: the lower lid rises with its edge bowed the other way, a "^". */
  const XM = -0.1, BM = 0.34, XH = 0.05, BH = 0.38;          // fractions of the eye's inner half-width ia
  function lid(i, ia, ib, side, x1, x0, lashW, lashCol, shadowDx){
    const xc = 2 * x0 - x1, path = ()=>{ ctx.beginPath(); ctx.moveTo(side, -ib - 5); ctx.lineTo(x1, -ib - 5); ctx.lineTo(x1, -ib);
      ctx.quadraticCurveTo(xc, 0, x1, ib); ctx.lineTo(x1, ib + 5); ctx.lineTo(side, ib + 5); ctx.closePath(); };
    const edge = ()=>{ ctx.beginPath(); ctx.moveTo(x1, -ib); ctx.quadraticCurveTo(xc, 0, x1, ib); };
    path(); ctx.save(); ctx.shadowColor = "rgba(60,20,90,.35)"; ctx.shadowBlur = 5 * S; ctx.shadowOffsetX = shadowDx * S;
    ctx.fillStyle = lidGrad[i]; ctx.fill(); ctx.restore();                       // the skin (the barrel's own colour at each row)
    ctx.save(); path(); ctx.clip();
    ctx.fillStyle = lidLight[i]; ctx.fillRect(-ia - 6, -ib - 6, 2 * ia + 12, 2 * ib + 12);
    edge(); ctx.lineWidth = 8; ctx.strokeStyle = "rgba(60,20,95,.2)"; ctx.stroke();   // the lid's thickness along its edge
    ctx.restore();
    edge(); ctx.lineWidth = lashW; ctx.lineCap = "round"; ctx.strokeStyle = lashCol; ctx.stroke();   // lash line
  }
  function lids(i, ia, ib, u, ul, h){
    const xm = XM * ia, bm = BM * ia;
    if(ul > 0.005){ const x1 = lerp(-ia - 2, xm, ul); lid(i, ia, ib, -ia - 6, x1, x1 - bm, 2.4, "rgba(34,16,38,.75)", 1); }
    if(h > 0.005){ const x1 = lerp(-ia - 2 - BH * ia, XH * ia, h); lid(i, ia, ib, -ia - 6, x1, x1 + BH * ia, 2.6, "rgba(34,16,38,.85)", 1); }
    if(u > 0.005){ const x1 = lerp(ia + bm + 2, xm, u); lid(i, ia, ib, ia + 6, x1, x1 - bm, 3.6, "#221026", -1.2); }
  }
  function drawEye(e, i, bU){
    const ia = e.a - RING, ib = e.b - RING, sc = P.scale.v;
    const mx = ia - IRIS_R - 1.5, my = ib - IRIS_R - 1.5;
    let ox = g.x * mx * 1.25, oy = g.y * my * 1.25;
    const q = Math.hypot(ox / mx, oy / my); if(q > 1){ ox /= q; oy /= q; }      // the iris stays inside the eyeball
    ctx.save(); ctx.translate(e.cx, e.cy); if(Math.abs(sc - 1) > 0.001) ctx.scale(sc, sc);
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, ia + 0.9, ib + 0.9, 0, 0, 6.2832); ctx.clip();
    ctx.fillStyle = sclera[i]; ctx.fillRect(-ia - 3, -ib - 3, 2 * ia + 6, 2 * ib + 6);
    ctx.drawImage(irisC, ox - IRIS_R, oy - IRIS_R, 2 * IRIS_R, 2 * IRIS_R);
    ctx.fillStyle = "#080302"; ctx.beginPath(); ctx.arc(ox, oy, PUPIL_R * P.pupil.v, 0, 6.2832); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(ox + SHINE[0], oy + SHINE[1], SHINE[2], 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(ox + SHINE2[0], oy + SHINE2[1], SHINE2[2], 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
    const sh = ctx.createLinearGradient(ia, 0, 0.4 * ia, 0);   // the soft shadow under the brow side of the eye
    sh.addColorStop(0, "rgba(80,50,110,.16)"); sh.addColorStop(1, "rgba(80,50,110,0)"); ctx.fillStyle = sh; ctx.fillRect(0.4 * ia, -ib - 3, 0.6 * ia + 3, 2 * ib + 6);
    const u = clamp01(Math.max(bU, P.lidU.v)), ul = clamp01(Math.max(bU, P.lidL.v));
    lids(i, ia, ib, u, ul, clamp01(P.lidH.v));
    ctx.restore();
    if(sc > 1.002){ ctx.lineWidth = 3.8; ctx.strokeStyle = "rgba(36,16,43,.92)"; ctx.beginPath(); ctx.ellipse(0, 0, e.a - RING / 2, e.b - RING / 2, 0, 0, 6.2832); ctx.stroke(); }
    const shut = Math.min(u, ul);                              // closed: the lid's skin softens the eyeball's dark outline, so it reads as a lid, not a hole
    if(shut > 0.3){ ctx.globalAlpha = 0.5 * (shut - 0.3) / 0.7; ctx.lineWidth = RING + 1; ctx.strokeStyle = lidGrad[i];
      ctx.beginPath(); ctx.ellipse(0, 0, e.a - RING / 2, e.b - RING / 2, 0, 0, 6.2832); ctx.stroke(); ctx.globalAlpha = 1; }
    ctx.restore();
  }
  function draw(bU){
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(S, 0, 0, S, -REG_X * S, 0);
    BROWS.forEach(br => { const [x, y, w, h] = br.box; ctx.drawImage(rig, br.clean, 0, w, h, x, y, w, h); });   // the barrel, brows removed
    BROWS.forEach((br, i)=>{
      const [x, y, w, h] = br.box, [bx, by] = br.c, L = P.lift.v + (i === 1 ? P.liftB.v : 0), dx = L >= 0 ? L * BROW_UP : L * BROW_DOWN;
      ctx.save(); ctx.translate(bx + dx, by); ctx.rotate(P.tilt.v * br.tilt); ctx.drawImage(rig, br.brow, 0, w, h, x - bx, y - by, w, h); ctx.restore();
    });
    EYES.forEach((e, i)=> drawEye(e, i, bU));
  }
  let placedAt = -1e9;
  window.addEventListener("resize", ()=>{ placedAt = -1e9; });
  function place(tn){                                        // fit the canvas to the pencil as laid out now (4x a second; at once after a resize)
    if(tn - placedAt < 250) return; placedAt = tn;
    const f = img.offsetWidth / ART_W, sc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
    const k = Math.min(3, Math.max(1, sc * (window.devicePixelRatio || 1)) * 1.5);
    const key = [img.offsetLeft, img.offsetTop, img.offsetWidth, img.offsetHeight, k].join();
    if(key !== layoutKey){
      layoutKey = key;
      cv.style.left = (img.offsetLeft + REG_X * f) + "px"; cv.style.top = img.offsetTop + "px";
      cv.style.width = (REG_W * f) + "px"; cv.style.height = img.offsetHeight + "px";
      cv.width = Math.round(REG_W * f * k); cv.height = Math.round(img.offsetHeight * k); S = f * k;
      makeGradients();
    }
    const r = img.getBoundingClientRect(), fs = r.width / ART_W, fy = r.height / ART_H;
    E.x = r.left + FACE.x * fs; E.y = r.top + FACE.y * fy;
  }

  /* ---- life cycle ---- */
  let raf = 0, last = 0, running = false;
  const gate = ()=> document.getElementById("startGate");
  const onLanding = ()=>{ const gt = gate(); return !!gt && !gt.classList.contains("hidden") && document.body.classList.contains("loaded"); };
  function frame(){
    raf = 0;
    if(!onLanding()){ running = false; if(cv) cv.style.display = "none"; return; }  // off the landing: stop (the gate observer restarts it)
    raf = requestAnimationFrame(frame);
    try {
      const tn = now(), dt = last ? Math.min(1 / 30, (tn - last) / 1000) : 0; last = tn;
      cv.style.display = "block";
      place(tn);
      const T = reduce ? "child" : pickTarget(tn);
      if(!reduce){ gaze(dt, tn, T); springs(dt, tn); } else { g.x = 0; g.y = 0; }
      if(tn > nextBlink){ if(lidsBusy(tn)) nextBlink = tn + 400; else blink(tn); }
      if(dbl && tn > dbl){ dbl = 0; if(blinkAt < 0 && !lidsBusy(tn)) blink(tn); }
      draw(blinkU(tn));
    } catch(err){ cancelAnimationFrame(raf); raf = 0; if(cv) cv.remove(); cv = null; }   // anything wrong: the painted eyes stay
  }
  function start(){
    if(running || !cv) return;
    running = true; last = 0; nextBlink = now() + 1500;
    api.look("swifty", mascot, 2, 2800);                       // Swifty greets first: the pencil watches her
    if(!raf) raf = requestAnimationFrame(frame);
  }
  function init(){
    const hero = document.getElementById("sgHero"); img = hero && hero.querySelector("img");
    if(!img || !/pencil_purple/.test(img.getAttribute("src") || "")) return;   // the rig is measured on this pencil only
    rig = new Image();
    rig.onload = ()=>{
      const go = ()=>{
        if(!img.complete || !img.offsetWidth){ setTimeout(go, 120); return; }
        cv = document.createElement("canvas"); cv.className = "sg-pen-eyes"; cv.setAttribute("aria-hidden", "true");
        ctx = cv.getContext("2d"); irisC = makeIris(); hero.appendChild(cv);
        if(onLanding()) start();
        new MutationObserver(()=>{ if(onLanding()) start(); }).observe(gate(), { attributes: true, attributeFilter: ["class"] });
        new MutationObserver(()=>{ if(onLanding()) start(); }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
      };
      go();
    };
    rig.src = RIG_SRC;
    // the child's finger (or mouse): the pencil looks at it for a moment
    const gt = gate();
    if(gt){
      gt.addEventListener("pointermove", ev => { if(ev.pointerType === "mouse") api.look("pointer", { x: ev.clientX, y: ev.clientY }, 6, 700); });
      gt.addEventListener("pointerdown", ev => { api.look("pointer", { x: ev.clientX, y: ev.clientY }, 6, 1100); api.react("curious"); });
    }
    // the play button pops once the intro is done: look at it, curious
    document.addEventListener("sg-intro-done", ()=>{ const btn = document.getElementById("sgBtn");
      setTimeout(()=>{ api.look("play", btn, 4, 1600); api.react("curious"); }, 650); });
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
