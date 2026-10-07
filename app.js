const CARD = JSON.parse(document.getElementById('cardData').textContent);
  const AUDIO_EXT = (CARD.assets && CARD.assets.audio_ext) || "ogg";  // Ogg/Opus (every lesson's audio since 2026-10-06; Chrome/Edge/Firefox, Safari 18.4+)
  const IMG_EXT   = (CARD.assets && CARD.assets.img_ext)   || "webp"; // WebP (all still art; Chrome/Edge/Firefox/Safari 14+) — twin of AUDIO_EXT (fixes A3)
  const ENGINE_VERSION = "2026.07.16i-r4-unified";  // ENGINE STAMP — the receipt (verify_bundle.py) asserts a built game carries THIS exact string; a stale/divergent engine → hard FAIL, so the wrong engine can never silently ship. BUMP IN LOCKSTEP with engine_guard.py + swiftpal_build.py + unified_build.py + verify_bundle.py on EVERY engine change (r2: drag/pattern feedback standard + PHASE_TRANSITION; r3c: off-white toybox bg, dual-coded counting options numeral+hand, full-body landing mascot, true-corner square/rect; r3d: Swiftie mouth-stops-when-silent (still frame), Arabic display numerals 1/2/3, landing shows full 1..n hand row, volume-chip aligned in header pill); r4: additive number-sequence path modules MEET_SEQUENCE + SEQUENCE_COMPLETE + SEQUENCE_NEXT (MTKGA01_L02_S04 "completes a number sequence within 20") — purely additive, existing lessons untouched. r4-landing (16c): landing recomposed to match reference — small corner mascot (230px, was 300), content re-centered (dropped padding-left:300 right-shift hack), VO chip moved from top-right to the mascot's shoulder (left:150/bottom:34, 58px). CSS-only; supersedes the 16b right-shift overlap fix.; 16d: TRUNK MERGE — unified the two diverged engine lines at base 12d: the 15e mechanics trunk (CONSERVE_COUNT + COUNT_ACTION + COUNT_DRAG_MATCH + ORDER_BY_WEIGHT + PICK_SET_BY_NUMBER, per_row/dense count-set grouping, bigNumCell numeral-only test options, title_first landing order) + the 16c r4 design trunk (boot loader, peek phase-transition, concept-strip landing, DS header, flat CTAs, sunburst/star-burst celebration, recomposed corner-mascot landing). Nothing dropped from either line. 16e: landing count-hero hand sizing FIXED — the .sg-hero sizing selectors never matched (template uses .sg-art); hands rendered natural-size, overflowing the card (title pushed outside the box, numeral-1 hidden behind the mascot — user-visible on MTKGA01_L02_S01). Retargeted to .sg-art .sg-hand/.sg-hand-cell/.sg-hand-num (112px; image-hero landings untouched). CSS-only. 16f: INTRO strip fit-or-wrap — old sizing assumed 1220px + a -100px breakout and punched wide strips (10 numerals, 7+ letters) through the tut-frame borders; now sized to the frame (960) and wrapping into two balanced rows below the 110px touch floor. Fixes MTKGA01_L02_S01 s00 (user-caught live) AND the HIKGH04_P2 letter-row daylight item.
  try { window.SWIFTPAL_ENGINE = ENGINE_VERSION; } catch(e){}
const $ = id => document.getElementById(id);

/* ---------- 1. SCALE THE 1333x750 STAGE - ON EVERY SCREEN ----------
   [responsive] (review 2026-10-01: "make my game all screen responsive"). The lesson is ONE fixed 1333x750 stage,
   scaled as a whole to the largest size the screen holds (contain-fit) and never re-laid-out: in a measuring game
   the sizes ARE the content (each object is exactly n blocks long), so nothing may reflow on a phone. Every other
   shape of screen is handled AROUND the stage:
   - viewport-fit=cover (index.html): the page fills the whole screen, notch and home bar included, and the STAGE is
     fitted inside the safe area (env(safe-area-inset-*)) - no button ever sits under a notch or the home bar.
   - the bands a stage leaves (above and below it on a 4:3 iPad, beside it on a 20:9 phone) show the slide's OWN
     backdrop, mirrored at the stage's edge (bleed below): the room, the yard, the fridge door simply carry on.
   - a phone or tablet held upright: a "turn it" card over the lesson (html.ask-rotate); a voice line that was
     speaking waits for the turn back, then goes on.
   - a phone/tablet BROWSER goes full screen on the play tap, and stays landscape where it can (Android).
   Pointer maths everywhere reads --scale at the moment it runs, so drags stay exact at every size. */
const Screen = (function(){
  const root = document.documentElement;
  let probe = null, asking = false, heldVO = false, bleedQueued = false;
  function safe(){
    if(!probe){ probe = document.createElement("div"); probe.setAttribute("aria-hidden", "true");
      probe.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;" +
        "padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)";
      (document.body || root).appendChild(probe); }
    const cs = getComputedStyle(probe);
    return { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
  }
  function touch(){ try{ return matchMedia("(pointer: coarse)").matches; }catch(e){ return false; } }
  function fit(){
    const vw = (window.visualViewport ? window.visualViewport.width  : root.clientWidth)  || window.innerWidth;
    const vh = (window.visualViewport ? window.visualViewport.height : root.clientHeight) || window.innerHeight;
    const sa = safe(), aw = Math.max(1, vw - sa.l - sa.r), ah = Math.max(1, vh - sa.t - sa.b);
    // contain-fit, scaling UP to fill the screen (no 1x cap, no margin) so a 16:9 viewport is covered edge-to-edge
    const s = Math.min(aw / 1333, ah / 750);
    root.style.setProperty("--scale", s);
    root.style.setProperty("--safe-dx", (sa.l - sa.r) / 2 + "px");   // centred in the safe area, not the whole screen
    root.style.setProperty("--safe-dy", (sa.t - sa.b) / 2 + "px");
    root.classList.toggle("bands-x", vw - 1333 * s > 1);              // (QA hooks: which bands the bleed fills)
    root.classList.toggle("bands-y", vh - 750 * s > 1);
    rotate(touch() && vh > vw * 1.1);
  }
  function rotate(on){
    if(on === asking) return;
    asking = on; root.classList.toggle("ask-rotate", on);
    try{                                                              // (voEl: the one VO element, below - not there yet on the first fit)
      if(on && !voEl.paused && !voEl.ended){ voEl.pause(); heldVO = true; }
      else if(!on && heldVO){ heldVO = false; voEl.play().catch(()=>{}); }
    }catch(e){}
  }
  /* a phone/tablet browser: full screen, landscape-locked where the browser can (Android Chrome). Called from a tap.
     Never on a desktop, inside an embedding page, or in a host app's WebView - those run the screen themselves. */
  function fullscreen(){
    try{
      const bridge = window.SwiftPAL && window.SwiftPAL._platform;
      if(!touch() || window.self !== window.top || (bridge && bridge !== "web") || /; wv\)/.test(navigator.userAgent)) return;
      const req = root.requestFullscreen || root.webkitRequestFullscreen;
      if(!req || document.fullscreenElement || document.webkitFullscreenElement) return;
      const lock = ()=>{ try{ screen.orientation.lock("landscape").catch(()=>{}); }catch(e){} };
      const p = req.call(root, { navigationUI: "hide" });
      if(p && p.then) p.then(lock, ()=>{}); else lock();
    }catch(e){}
  }
  /* the bands: 8 mirrored copies of the stage's own backdrop around it (index.html #stageBleed), kept in step with every
     change of it - a slide's data-bg and --horizon, the tutorial's white, the landing's and the end's transparency.
     While a hint card dims the stage, they dim with it (.dim). */
  function bleed(){
    bleedQueued = false;
    const st = document.getElementById("stage"), b = document.getElementById("stageBleed");
    if(!st || !b) return;
    /* (review 2026-10-07 "fix these line cuts": at a fractional --scale the stage's background COLOUR was painted to its
       very edge but its picture stopped short of the last device column, so the colour - the floor's, under every room
       picture - showed as a 1px line down the stage's right side. The colour now lies on an underlay 1px inside the
       stage (.stage-wrap.bg-under::before, --stage-bg) and the stage's own is transparent: the edge column is picture
       + band only. The wrap is not observed, so toggling its class to read the slide's colour starts no loop.) */
    const wrap = st.parentElement; wrap.classList.remove("bg-under");
    const cs = getComputedStyle(st), color = cs.backgroundColor;
    const css = "background-color:" + color + ";background-image:" + cs.backgroundImage + ";background-size:" + cs.backgroundSize +
                ";background-position:" + cs.backgroundPosition + ";background-repeat:" + cs.backgroundRepeat;
    wrap.style.setProperty("--stage-bg", color); wrap.classList.add("bg-under");
    if(b._css === css) return;
    b._css = css; b.dataset.bg = st.dataset.bg || "";
    for(const i of b.children) i.style.cssText = css;
  }
  function queueBleed(){ if(!bleedQueued){ bleedQueued = true; requestAnimationFrame(bleed); } }
  function watch(){
    const st = document.getElementById("stage");
    if(!st || !window.MutationObserver) return;
    const mo = new MutationObserver(queueBleed);
    mo.observe(st, { attributes: true, attributeFilter: ["class", "style", "data-bg"] });
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    const ra = document.getElementById("rotateAsk"); if(ra) ra.addEventListener("click", fullscreen);   // Android: the tap itself turns the screen
    queueBleed();
  }
  window.addEventListener("resize", fit);
  window.addEventListener("load", fit);
  if(window.visualViewport) window.visualViewport.addEventListener("resize", fit);
  fit(); watch();
  return { fit: fit, fullscreen: fullscreen, bleed: queueBleed };
})();

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
    return statement;
  }
  return { ctx:ctx, log:log, send:send,
           once:function(v,o,r){ if(fired[v]) return null; fired[v]=1; return send(v,o,r); },
           hasFired:function(v){ return !!fired[v]; } };
})();
/* signal -> verb, for the three that already have a 1:1 signal */
const XAPI_MAP = { slide_entered:"screen_viewed", hint_shown:"hint_used", audio_replay:"audio_replayed" };
const XAPI_ANSWERABLE = ["COUNT_HOW_MANY","MAKE_SET","PICK_EXTREME","MEASURE_ASK","COMPARE_MEASURED","MATCH_MEASURE","MATCH_ROWS","CLASSROOM_FIT"];   /* slide types that send question_started */

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
  bgmDuck();
  /* [QA 05] only the chip the audio is actually coming FROM animates, and only one at a time.
     It used to pulse every chip for every sound - option words, feedback, the count-aloud. */
  const src = on && currentAudio ? srcOf(currentAudio) : null;
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
    let retried = false;
    a.onended = fire;
    /* the clip's blob: copy failed (Assets): the file's own URL, once; anything else - a silent beat, then on */
    a.onerror = ()=>{ if(tok !== _playTok) return;
      if(!retried && /^blob:/.test(a.src)){ retried = true; a.src = src; a.play().catch(()=>{ if(tok === _playTok) setTimeout(fire, 1200); }); return; }
      setTimeout(fire, 1200); };
    a.setAttribute("data-asset", src);
    a.src = Assets.url(src); setPlaying(true);   // re-apply now the src is known, so the right chip lights
    a.play().catch(()=>{ if(tok === _playTok) setTimeout(fire, 1200); });
    /* WATCHDOG: whatever waits on this clip's end (आगे, the next line, the play button) can never be stranded by a clip
       that stalls mid-way or never reports `ended`: the clip's remaining length + 3s grace, re-armed while it is still
       really moving on. No length yet (metadata stuck): 15s. */
    let lastT = -1;
    const watch = ()=>{ if(done || tok !== _playTok) return;
      const left = isFinite(a.duration) && a.duration > 0 ? (a.duration - a.currentTime) / (a.playbackRate || 1) : 12;
      setTimeout(()=>{ if(done || tok !== _playTok) return;
        if(!a.paused && !a.ended && a.currentTime > lastT + 0.05){ lastT = a.currentTime; watch(); } else fire(); }, Math.max(0, left) * 1000 + 3000);
    };
    watch();
  } else { setTimeout(fire, 800); }
}
/* playSfx(id): fire-and-forget sound effect that can overlap the spoken VO (does NOT touch
   currentAudio / the play() chain). Two pooled elements, reused - never one per call.
   Silently no-ops if the file is missing or playback is blocked. */
const _sfxPool = [new Audio(), new Audio(), new Audio(), new Audio()]; let _sfxNext = 0;
function playSfx(id, onEnd){
  if(!id) return;
  try{
    const a = _sfxPool[_sfxNext++ % _sfxPool.length];
    a.pause(); a.volume = 0.7; a.onended = onEnd ? ()=>{ a.onended = null; onEnd(); } : null;
    const f = "assets/voiceover/" + id + "." + AUDIO_EXT;
    a.onerror = ()=>{ a.onerror = null; if(/^blob:/.test(a.src)){ a.src = f; a.play().catch(()=>{}); } };   // blob: copy failed - the file, once
    a.setAttribute("data-asset", f); a.src = Assets.url(f);
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
/* ===== QA checklist 2026-10-05: the STANDARD SFX + background music, as files in assets/sfx/ =====
   sfx_correct / sfx_wrong (correct + incorrect feedback), sfx_confetti (with every confetti burst), sfx_play (the play
   button), sfx_nudge (a soft, encouraging chime with each nudge hand), bgm (the lesson's background track, from the play
   tap on) and bgm_game (the practice game's track - the lesson track carries on if it is not shipped). A file that
   is missing or blocked is silent; correct / wrong fall back to the old procedural tones so feedback is never mute. */
const SFX_DIR = "assets/sfx/";
function playSfxFile(name, vol, fallback){
  try{
    const a = _sfxPool[_sfxNext++ % _sfxPool.length];
    a.pause(); a.volume = vol == null ? 0.8 : vol;
    const f = SFX_DIR + name + "." + AUDIO_EXT;
    /* its blob: copy failed (Assets): the file's own URL, once; the file itself failed: the procedural fallback */
    a.onerror = ()=>{ if(/^blob:/.test(a.src)){ a.src = f; a.play().catch(()=>{}); return; } a.onerror = null; if(fallback) fallback(); };
    a.setAttribute("data-asset", f); a.src = Assets.url(f);
    a.play().catch(()=>{});
  }catch(e){ if(fallback) fallback(); }
}
const sfxCorrect   = ()=> playSfxFile("sfx_correct", 0.8, ()=> _tone([660, 880, 1180], "sine", 0.42, 0.13));
const sfxWrongSoft = ()=> playSfxFile("sfx_wrong", 0.6, ()=> _tone([300, 235], "triangle", 0.20, 0.08));   // gentle, never harsh
/* 2026-10-07: the team's Standard SFX pack (correct / incorrect / confetti / play / next). Its confetti is mastered
   ~8dB hotter than the kit's and lands on top of sfx_correct + the VO, so it plays lower to sit under them. */
const sfxConfetti  = ()=> playSfxFile("sfx_confetti", 0.45);
const sfxPlay      = ()=> playSfxFile("sfx_play", 0.9);
const sfxNext      = ()=> playSfxFile("sfx_next", 0.9);   // the आगे tap (a disabled आगे fires no click, so no sound)
const sfxNudge     = ()=> playSfxFile("sfx_nudge", 0.45);
/* background music: one looping element, started by the play tap (never before it), ducked under every VO clip,
   paused while the app is in the background. bgmFor(phase) picks the track: the practice game has its own. */
/* 2026-10-07: bgm.ogg is the team's "Standard Background Music 2" (bouncy, seamless 4-min loop; "1" is an 18s lo-fi loop
   that would repeat ~30x a lesson). Its quietness is BAKED INTO THE FILE (-33 LUFS, ~14.5dB under the VO's -18.5): iOS
   Safari ignores media .volume, so a loud file would play at full VO level there. VOL/DUCK only add the dip under VO
   (0.35 = -9dB, ~24dB under the voice); the dip is a short fade, not a jump, so the bed never pumps. */
var BGM = { el: null, track: "", VOL: 1, DUCK: 0.35, raf: 0 };   // (var: setPlaying, above, may reach it)
function bgmDuck(){
  if(!BGM || !BGM.el) return;
  const el = BGM.el, from = el.volume, to = isPlaying ? BGM.DUCK : BGM.VOL, ms = to < from ? 180 : 600, t0 = performance.now();
  cancelAnimationFrame(BGM.raf);
  const step = now =>{ if(BGM.el !== el) return; const k = Math.min(1, (now - t0) / ms);
    el.volume = from + (to - from) * k; if(k < 1) BGM.raf = requestAnimationFrame(step); };
  BGM.raf = requestAnimationFrame(step);
}
function bgmFor(phase){
  const want = phase === "practice" ? "bgm_game" : "bgm";
  if(!BGM.el || BGM.track === want) return;
  bgmPlay(want, ()=>{ if(want !== "bgm" && BGM.track !== "bgm") bgmPlay("bgm"); });          // no game track shipped: keep the lesson one
}
function bgmPlay(track, onMissing){
  /* only a track that ships (ASSET_SIZES = the files on disk): bgm.ogg / bgm_game.ogg are not in this lesson yet, and
     asking for them was a 404 on every play tap. Drop a file into assets/sfx/ and run tools/gen_asset_sizes.js. */
  if(!Object.prototype.hasOwnProperty.call(ASSET_SIZES, SFX_DIR + track + "." + AUDIO_EXT)){ if(onMissing) onMissing(); return; }
  try{
    const old = BGM.el; if(old){ old.pause(); old.onerror = null; }
    const a = new Audio(); a.loop = true; a.preload = "auto";
    a.onerror = ()=>{ a.onerror = null; if(BGM.el === a && onMissing) onMissing(); };
    a.src = Assets.url(SFX_DIR + track + "." + AUDIO_EXT);
    a.volume = isPlaying ? BGM.DUCK : BGM.VOL;   // start at the right level - a new track never fades in from 1
    BGM.el = a; BGM.track = track; bgmDuck();
    a.play().catch(()=>{});
  }catch(e){}
}
function bgmStart(){ if(!BGM.el) bgmPlay("bgm"); }
document.addEventListener("visibilitychange", ()=>{ if(!BGM.el) return;
  if(document.hidden) BGM.el.pause(); else BGM.el.play().catch(()=>{}); });
/* dynamic Swiftie buddy: swap pose + a little pop on every reaction (correct/wrong/explain/celebrate) */
// [20a mascot-01] moods -> production EXPRESSIONS (head webp), not idle-gif basenames.
//   Ported verbatim from HI01H01_L02_S04_dist (its app lines 2474-2493) together with the
//   .mascot-wrap > .mascot-circle > .mascot-img markup. The old sw_anim_*.gif scheme and the
//   isPlaying mouth-coupling go with it - heads are now driven by setSwMood alone.
const SW_POSE = { talk:"talking", point:"talking", idle:"talking", happy:"celebrate", celebrate:"celebrate",
                  hint:"hint", teach:"hint", idea:"hint", tryagain:"tryagain" };
const SW_STILL = (() => { try { const q=new URLSearchParams(location.search);
  return q.has("still") || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); } catch(e){ return false; } })();
let swMood = "point", _celebUrl = "", _celebKey = null;
function swApplyPose(){ /* [20a] retired: heads no longer couple to isPlaying (setSwMood drives them). */ }
function setSwMood(m){ swMood = m;
  const img = document.getElementById("swBuddyImg"), w = document.getElementById("swBuddy");
  if(!img) return;
  const expr = SW_POSE[m] || "talking";
  const animated = expr !== "talking" && !SW_STILL;   // resting face is the static talking head
  img.onerror = () => { img.onerror = null; img.src = "assets/mascot.webp"; };   // [mascot-10]
  const src = "assets/" + (animated ? "gif/" : "") + "sw_head_" + expr + (animated ? "_anim" : "") + ".webp";
  /* [mascot-08] replay play-once: a slide's first cheer plays from frame 0 - a fresh blob: URL of the one download
     ([loading]: it was "?r=<slide start>", a new 380KB download on every slide that cheered) */
  if(animated && expr === "celebrate"){
    if(_celebKey !== state.slideStart){ if(_celebUrl.indexOf("blob:") === 0) URL.revokeObjectURL(_celebUrl);
      _celebUrl = Assets.fresh(src); _celebKey = state.slideStart; }
    img.src = _celebUrl;
  } else img.src = src;
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
  /* [13] the kit's recipe 7 with its own shapes (star 40%, rectangle, line, square), sizes, depth and fall - review
     2026-09-30: "all square-shaped and not covering the full horizontal space". It falls over the WHOLE window
     (#fxLayer, body-level: the stage is letterboxed and clips at its edges), so ~100 pieces keep the density of the
     kit's 80 across the wider field. phases:[] because the checklist asks for confetti on every correct answer,
     including tutorial. The palette is the kit's own VIBGYOR pairs. */
  /* fall: seconds to cross the window, before the depth divisor - the kit's [1.1, 1.8] made ~40% slower (review
     2026-09-30: "reduce its speed a bit"); pieces cross in ~1.4-3.5s, the burst clears in ~3.8s */
  FLNMotion.confetti.burst({
    host: "#fxLayer", phase: sl.phase, phases: [], count: 100, fall: [1.6, 2.6]
  });
  sfxConfetti();   // QA checklist 2026-10-05: the standard confetti SFX with the standard confetti
}
// pitch climbs one step per block — HEAR the count
/* slide audio path: per slide, we look at slide.audio.prompt / .phoneme / etc.
   In this v0.1 the embedded card holds short ids; the compiler would replace
   them with base64 data URIs. We resolve to assets/voiceover/{id}.mp3 with fallback. */
function audioFor(slide, key){
  if(!slide.audio || !slide.audio[key]) return null;
  return "assets/voiceover/" + slide.audio[key] + "." + AUDIO_EXT;
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
/* QA checklist 2026-10-05: "inactivity nudges are activated after 7 seconds" - one value for every idle nudge in the
   lesson (the card's nudge_timeout_ms, per phase, says the same) */
const IDLE_MS = 7000;
function startNudge(slide, target){
  clearTimeout(state.nudgeTimer);
  if(!target) return;
  const ms = (CARD.scaffold_rules.nudge_timeout_ms || {})[slide.phase] || IDLE_MS;
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
    /* only the BOTTOM is cut: the tap ripple (kit recipe 4) spreads up to ~55px above and around the box */
    nh.style.clipPath = "inset(-60px -60px " + Math.max(0, NH.H - keep).toFixed(1) + "px -60px)";
  }
  if(!nh.classList.contains("show")) sfxNudge();   // QA checklist 2026-10-05: an encouraging SFX with every nudge
  nh.classList.add("show");
  return true;
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

/* VISUAL-FIRST quantity: a HAND showing n fingers up (assets/hand_1..5) — pre-reader,
   NO number-word text. Falls back to the numeral only if n is outside 1..5 or the art is missing. */
function fingerCount(n, cls){ cls = cls || "finger-hand";
  if(!(n>=1 && n<=5)) return `<span class="num-glyph">${n}</span>`;
  return `<img class="${cls}" src="assets/hand_${n}.png" alt="" ` +
    `onerror="var s=document.createElement('span');s.className='num-glyph';s.textContent='${n}';this.replaceWith(s);">`;
}
/* DISPLAY numeral: ALWAYS Arabic (1 2 3) on screen — kids learn the universal digit.
   Spoken VO stays Hindi (एक/दो/तीन) via the separate vo_num_/vo_total_ audio files. */
function devNumeral(n){ return String(n); }

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
  sparkle:"mk_sparkle",      plate:  "badge_result",
};
const mkSrc = (id)=> "assets/" + id + "." + IMG_EXT;
/* is this a measuring slide? = the card gave it an object laid along a scene object */
function mkIsMeasure(slide){
  return !!(slide && slide.data && slide.data.object && slide.data.object.img &&
            String(slide.data.object.img).indexOf("mk_block") === 0);
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
/* the result plate: "<n> \u092c\u094d\u0932\u0949\u0915\u094d\u0938" on the result badge, + the sparkle burst.
   The badge art ships with "6" baked in; the text is lifted off it once
   (badge_result, see MDK.plate) so every count 1..9 this card uses can reuse it. */
/* Both overlays FLOAT inside .slide-stage rather than joining the slide's flex
   column. That column is `flex:1;min-height:0` all the way down, so anything
   added to it steals height from the scene art above - which pulled the table
   up into the prompt. Absolute + anchored leaves every module's layout alone. */
function mkFloatHost(){ return document.querySelector(".slide-stage"); }
function mkClearFloats(){
  const h = mkFloatHost(); if(!h) return;
  h.querySelectorAll(".mk-result, .mk-errflash").forEach(n => n.remove());
}


/* ---------- 12. SLIDE MODULES ---------- */
/* ---------- [measure kit] MDK - shared by every measuring slide (review 2026-09-30: "follow the ppt slides
   instructions"): the T2/T3 demos, the measure-and-ask slides, the compare slides, the match slides and the classroom
   game. Blocks = the first screen's plain blue cubes (slices of assets/cubes_blue_row.webp); a toy box they are taken
   from; dashed end lines with a start and a finish flag; the demonstrating hand; counting digits; ✓ / ✗ marks; the
   result plate. Everything is placed in stage px inside a .md-stage scene; CSS [measure kit].
   MOVES ARE ANIMATED ON `translate`, never `transform`: a lifted block (scale 1.07) and the pressing hand (scale .9)
   carry a CSS `scale`, which CSS applies to anything in `transform` - a block used to travel 107% of the way and the
   hand 90%, so the fingertip slid up to 84px off the block. ---------- */
const MDK = (function(){
  const STRIP = { src: "assets/cubes_blue_row.webp", w: 2102, h: 214, top: 2, bot: 211, cuts: [3, 208, 416, 626, 839, 1049, 1260, 1472, 1683, 1893, 2099] };
  const reduce = ()=> !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const px = v => (Math.round(v * 10) / 10) + "px";
  const wait = ms => new Promise(r => setTimeout(r, reduce() ? Math.min(ms, 80) : ms));
  function add(parent, tag, cls, css){ const e = document.createElement(tag); e.className = cls; if(css) e.style.cssText = css; parent.appendChild(e); return e; }
  const pos = e => ({ x: parseFloat(e.style.left), y: parseFloat(e.style.top) });
  const setPos = (e, p)=>{ e.style.left = px(p.x); e.style.top = px(p.y); };
  /* one blue cube, s x s, at (x, y); i picks its slice of the strip (its shade of blue) */
  function cube(parent, i, x, y, s, rot){
    // review 2026-10-05: "change all the cubes color to this blue ... throughout the game" - every cube is the strip's
    // FIRST cube (its deep blue); i still staggers the fade-in (--i)
    const k = 0, c0 = STRIP.cuts[k], c1 = STRIP.cuts[k + 1], kx = s / (c1 - c0), ky = s / (STRIP.bot - STRIP.top);
    const b = add(parent, "div", "md-block", "left:" + px(x) + ";top:" + px(y) + ";width:" + px(s) + ";height:" + px(s) + ";--i:" + i + ";" +
      "background-image:url(" + STRIP.src + ");background-size:" + px(STRIP.w * kx) + " " + px(STRIP.h * ky) + ";background-position:" + px(-c0 * kx) + " " + px(-STRIP.top * ky));
    b._home = { x, y }; b._placed = false; b._rot = rot || 0; if(rot) b.style.setProperty("--rot", rot + "deg");
    return b;
  }
  const path = (dx, dy, up)=> [{ translate: "0px 0px" }, { translate: dx / 2 + "px " + (dy / 2 + up) + "px", offset: .5 }, { translate: dx + "px " + dy + "px" }];
  /* the hand (the engine's nudge hand art; fingertip at NH.TIP_X/TIP_Y of its 86x108 box), pressing a block of size s */
  function hand(parent, s){
    const el = add(parent, "img", "md-hand"); el.src = "assets/nudge_hand_new.svg"; el.alt = "";
    const grip = p => ({ x: p.x + s * 0.52 - NH.TIP_X, y: p.y + s * 0.56 - NH.TIP_Y });
    return { el, grip, on(p){ setPos(el, grip(p)); el.classList.add("on"); }, off(){ el.classList.remove("on", "press"); el.getAnimations().forEach(a => a.cancel()); },
             press(){ el.classList.add("press"); }, up(){ el.classList.remove("press"); } };
  }
  /* move an element along a gentle arc (arc) or straight; a hand rides with it */
  function glide(el, to, ms, arc, h){
    return new Promise(res => {
      const from = pos(el), dx = to.x - from.x, dy = to.y - from.y, up = arc ? -Math.min(80, 26 + Math.hypot(dx, dy) * 0.16) : 0;
      if(el._rot){ const home = el._home && Math.abs(to.x - el._home.x) < .5 && Math.abs(to.y - el._home.y) < .5;
        el.style.setProperty("--rot", home ? el._rot + "deg" : "0deg"); }
      // [robot] away from its home (the lid) = rb-away: the robot's aura is only lit while its cube is on the lid
      if(el._home) el.classList.toggle("rb-away", !(Math.abs(to.x - el._home.x) < .5 && Math.abs(to.y - el._home.y) < .5));
      let fin = false; const done = ()=>{ if(fin) return; fin = true; setPos(el, to); el.classList.remove("moving"); if(h) setPos(h.el, h.grip(to)); res(); };
      el.classList.add("moving");                                            // (a painting's cube shows while it flies: CSS .in-art-home)
      if(reduce() || ms <= 0){ done(); return; }
      const o = { duration: ms, easing: "cubic-bezier(.45,.05,.35,1)" };
      const a = el.animate(path(dx, dy, up), o); if(h) h.el.animate(path(dx, dy, up), o);
      a.onfinish = done; a.oncancel = done;
    });
  }
  const knock = ()=> _tone([392, 311], "sine", 0.16, 0.1);                    // a soft wooden set-down
  // (review 2026-10-05 "there is a space between cubes": its bounce never goes NARROWER than its tile - the old ".98" step
  //  opened a seam beside the neighbour for a moment; placed cubes also overlap ~1px, CSS .md-block.placed)
  function land(el, quiet){ if(!reduce()) el.animate([{ scale: "1.07 .9" }, { scale: "1.025 1.04" }, { scale: "1.025 1.025" }], { duration: 220, easing: "ease-out" }); if(!quiet) knock(); }
  /* a correct block: its green outline flashes on, then fades (review 2026-09-30: "the green outline should disappear
     after it is correctly placed") - it confirms the drop, like the ✓ it replaced; it is not a lasting state */
  // (review 2026-10-07 "no need for green outline when the cube is placed correctly throughout the game": a right
  //  placement is its landing + the SFX now; the callers stay, the flash is gone)
  function okFlash(el){}
  /* the toy box: n blocks of size s in rows of `cols`, each back row higher so they peek over the front row, the front
     wall in front of the lowest row. Returns the box and the n home spots. (Before the art below, T2's review "the cubes
     inside it should be much more visible" had an `open` CSS variant; the art shows every cube nearly whole.) */
  /* THE TOY BOX = the supplied art (review 2026-09-30: "replace image 1 asset with image 2 red box"): two layers,
     assets/toybox_back.webp behind the blocks (the art's six painted smiling cubes removed, its inside refilled from
     the box's own red) and assets/toybox_front.webp - the front wall: rim, starred panel, feet - over them. BOX is in
     block units s, measured on the art (a painted cube ~345px): the box 3.97 x 2.58 s; the front row's blocks 0.458 s
     from its left edge, 1.035 s apart, their tops 1.10 s down (the front rim hides their lowest 0.2 s); a second row
     0.75 s higher, as painted; three rows share the room above (the top one 0.12 s down). One look for every box -
     `open` (T2's shallower box) is kept only so its callers need not change. */
  const BOX = { w: 3.97, h: 2.58, x0: 0.458, dx: 1.035, y0: 1.10, dy2: 0.75, top: 0.12 };
  /* PILE (review 2026-09-30: "the cubes are too much in a straight line - a more natural way of putting them there"):
     each block a little off its cell and askew, as if tossed in - [dx, dy] in s, tilt in degrees - by row from the
     front, then column. Designed, not random, so every box looks the same: the front row splays out (left leans left,
     right leans right), the back row leans on the back wall with its middle block propped higher, a third row sits
     loosest on top. A block straightens the moment it leaves the box and lies square in the row (CSS [measure kit]). */
  const PILE = [
    [[-0.02,  0.04, -5], [0,  -0.02,  2], [ 0.03,  0.05,  6]],
    [[ 0.06, -0.03,  4], [0,  -0.10, -3], [-0.05, -0.01, -7]],
    [[ 0.10,  0.02, -6], [0,  -0.06,  5], [-0.08,  0,     8]]];
  function toyboxGeom(n, s, cols, open){
    cols = Math.max(1, Math.min(cols || 3, n)); const rows = Math.ceil(n / cols);
    const step = (rows <= 2 ? BOX.dy2 : (BOX.y0 - BOX.top) / (rows - 1)) * s;
    return { cols, rows, step, w: BOX.w * s, h: BOX.h * s };
  }
  function toybox(parent, x, y, n, s, cols, open){
    const g = toyboxGeom(n, s, cols, open), { w, h } = g;
    const back = add(parent, "div", "md-box-back", "left:" + px(x) + ";top:" + px(y) + ";width:" + px(w) + ";height:" + px(h));
    const front = add(parent, "div", "md-box-front", "left:" + px(x) + ";top:" + px(y) + ";width:" + px(w) + ";height:" + px(h));
    function layout(m){                                                     // m blocks: full rows from the front, the top one centred
      const q = toyboxGeom(m, s, cols, open), out = [];
      for(let r = 0; r < q.rows; r++){ const rowsBelow = q.rows - 1 - r, k = r ? q.cols : m - (q.rows - 1) * q.cols, lead = (3 - k) * BOX.dx / 2;
        for(let c = 0; c < k; c++){ const L = (PILE[rowsBelow] || PILE[PILE.length - 1])[k === 3 ? c : c + (k === 1 ? 1 : 0.5) | 0] || [0, 0, 0];
          out.push({ x: x + (BOX.x0 + lead + c * BOX.dx + L[0]) * s, y: y + BOX.y0 * s - rowsBelow * q.step + L[1] * s, rot: L[2], z: 3 + r }); } }
      return out;
    }
    // the last spots are the front row: take from the top (back) first so the pile empties back to front
    return { back, front, spots: layout(n), w, h, settle: pileSettle(layout) };
  }
  /* THE BASKET (G1, review 2026-10-01: "use this for better slide" - the supplied mock-up of the charpai and a woven
     basket of cubes): the basket cut out of that picture, two layers like the toy box - assets/basket_back.webp (its
     seven painted cubes removed; the inside they hid rebuilt from its own weave) behind the blocks, and
     assets/basket_front.webp (the front rim and wall) over them. BASKET is in block units s, measured on the art (its
     401 x 322 px = 3.9 blocks wide - a touch smaller than its painted cubes had it, so it fits beside the centred
     object at the game's 76px cube): the opening is an ellipse, centre (xc, yc), half-width ai; the rim's inner
     edge lies bf below the centre at the front (it hides what is below it) and bb above it at the back. The blocks lie
     in rows from the front - 3 along the front rim, 3 higher behind them, the rest higher still, centred - each a
     little askew (BASKET_PILE: [dx, dy] in s, tilt in degrees, by row from the front); the spots come back row first,
     like the toy box's, so the pile empties from the top. Each spot carries its z (a row in front covers the one
     behind). Same interface as toybox. */
  const BASKET = { w: 3.9, h: 3.1317, xc: 1.9451, yc: 1.1257, ai: 1.7506, bf: 0.781, bb: 0.9599 };
  const BASKET_PILE = [
    [[-0.03,  0.03, -6], [0,  0.01,  3], [ 0.03,  0.03,  7]],
    [[ 0.05, -0.02,  5], [0, -0.05, -4], [-0.05, -0.01, -6]],
    [[ 0.04,  0.02, -5], [0, -0.03,  4], [-0.04,  0.01,  6]]];
  /* ---- [rooms] the other holders (review 2026-10-01: "different tokri than the red one" on each slide): a pastel laundry
     basket (G2, the almirah's bedroom), the cat's own round bed (G2b, the pillow's), a bamboo sabzi tokri (G3, the
     kitchen). Each two layers like the toy box - assets/holder_<kind>_back.webp (its outside
     back wall and inside) under the blocks, _front.webp (its front wall and rim) over them - drawn to the toy box's own
     proportions (HOLD, in block units s), so every layout that places a toy box places these. The blocks: a front row of
     up to 3 standing in it, the rest raised behind; the top ones (the back) are taken first. ---- */
  const HOLD_BASE = { w: 3.97, h: 2.58, x0: .46, dx: 1.035, y0: 1.1, dy2: .75 };
  /* a holder drawn to its own proportions (supplied art): its box and its blocks' places, in block units. laundry (G2, review
     2026-10-01 "replace the pink box with image 3"): the supplied pink heart basket. Review 2026-10-01: "the almirah should
     look bigger as compared to the pink box / other elements" - it is 2.7 blocks wide now (it was 4.2, wider than the
     almirah), its opening holding TWO cubes a row (cols): the front row centred in it, a third of each cube behind the
     front wall (the front layer starts at the rim's top edge, 26.7% down the art), the back row 0.5 higher behind it */
  /* cloudtub (G2b, review 2026-10-01: "place the window and the tub which has the cubes"): the supplied cream storage tub with
     blue clouds and a yellow rim, its three painted cubes taken out (holder_cloudtub_back / _front.webp). Measured on the art
     (a painted cube ~184px): 4.0 blocks wide, three cubes standing in a row as drawn - their tops just under its top edge,
     a bit under half of each behind the front rim - a little askew, as painted; a fourth (a spare) raised behind them */
  /* wicker (G3, review 2026-10-01: "change the tokri in screen 1 from image 2"): the supplied woven basket (a thick rim with
     wrapped bindings, a red-and-green band), its five painted cubes taken out (holder_wicker_back / _front.webp). Review
     2026-10-01 "reduce the size of tokri": the cubes keep the game's one size, so the basket is smaller by holding TWO a
     row - 2.8 x 1.53 blocks (it was 4.02 wide, three a row: wider than the fridge). Its front row stands in it, its lower
     40% behind the front wall; each row behind raised 0.42, a little askew - a heap (G3's 5 cubes: 2 + 2 + 1) */
  const HOLD_K = { wicker: { w: 2.8, h: 1.531, x0: .389, dx: 1.02, y0: .2, dy2: .42, cols: 2,
    pile: [[[-.02, .02, -3], [.02, .01, 3]], [[.07, .02, 5], [-.05, -.03, -4]], [[-.04, .03, -6], [.06, 0, 4]]] },
    cloudtub: { w: 4.0, h: 1.723, x0: .473, dx: 1.027, y0: .05, dy2: .48, cols: 3,
    pile: [[[-.01, .02, -3], [0, -.03, 1], [.01, .04, 4]], [[.04, .02, 6], [-.04, 0, -5], [0, 0, 3]]] },
    laundry: { w: 2.7, h: 1.2719, x0: .3325, dx: 1.035, y0: -.30, dy2: .5, cols: 2,
    pile: [[[-.02, .02, -3], [.03, 0, 3]], [[.11, .03, 8], [-.1, -.04, -7]]] } };   // [dx, dy, tilt] a cube, by row from the front:
                                                                                     // the back pair leans in, as if tossed
  const HOLD_TILT = [[-3, 2, -2], [4, -3, 3]];
  function holderGeom(n, s, kind){ const G = HOLD_K[kind] || HOLD_BASE; return { w: G.w * s, h: G.h * s }; }
  function holder(kind, parent, x, y, n, s){
    const HOLD = HOLD_K[kind] || HOLD_BASE;                                 // (this holder's own geometry, if it has one)
    const { w, h } = holderGeom(n, s, kind);
    const back = add(parent, "div", "md-box-back h-" + kind, "left:" + px(x) + ";top:" + px(y) + ";width:" + px(w) + ";height:" + px(h));
    const front = add(parent, "div", "md-box-front h-" + kind, "left:" + px(x) + ";top:" + px(y) + ";width:" + px(w) + ";height:" + px(h) + ";z-index:6");
    function layout(m){                                                     // m blocks: rows of up to C (3, or the holder's cols) from
      const C = HOLD.cols || 3, rows = [], out = [];                        // the front, each further back raised dy2 on the one before
      for(let left = m; left > 0; left -= C) rows.push(Math.min(C, left));
      const row = (r, cnt)=>{ const lead = (C - cnt) * HOLD.dx / 2, tilt = HOLD_TILT[Math.min(r, 1)];
        for(let c = 0; c < cnt; c++){ const J = (HOLD.pile && HOLD.pile[r] && HOLD.pile[r][c]) || [0, 0, tilt[c] || 0];
          out.push({ x: x + (HOLD.x0 + lead + c * HOLD.dx + J[0]) * s, y: y + (HOLD.y0 - HOLD.dy2 * r + J[1]) * s, rot: J[2], z: 5 - r }); } };
      for(let r = rows.length - 1; r >= 0; r--) row(r, rows[r]);           // the back (top) first: taken first
      return out;
    }
    return { back, front, spots: layout(n), w, h, settle: pileSettle(layout) };   // (a front block taken: the pile settles)
  }
  function basketGeom(n, s){ return { w: BASKET.w * s, h: BASKET.h * s }; }
  function basket(parent, x, y, n, s){
    const { w, h } = basketGeom(n, s), B = BASKET;
    const back = add(parent, "div", "md-box-back basket", "left:" + px(x) + ";top:" + px(y) + ";width:" + px(w) + ";height:" + px(h));
    const front = add(parent, "div", "md-box-front basket", "left:" + px(x) + ";top:" + px(y) + ";width:" + px(w) + ";height:" + px(h));
    const rim = cx => B.yc + B.bf * Math.sqrt(Math.max(0, 1 - ((cx - B.xc) / B.ai) ** 2));   // the inner front edge at cx
    const LIFT = [0.75, 1.35, 1.75];                                        // a block's top, above the rim at its middle
    function layout(m){                                                     // the places of a pile of m blocks, back row first
      const rows = []; for(let left = m; left > 0;){ const k = Math.min(3, left); rows.push(k); left -= k; }   // from the front
      const out = [];
      for(let r = rows.length - 1; r >= 0; r--){
        const k = rows[r];
        for(let c = 0; c < k; c++){
          const cx = B.xc + (c - (k - 1) / 2), L = ((BASKET_PILE[r] || [])[k === 3 ? c : c + (k === 1 ? 1 : 0.5) | 0]) || [0, 0, 0];
          out.push({ x: x + (cx - 0.5 + L[0]) * s, y: y + (rim(cx) - (LIFT[r] != null ? LIFT[r] : 1.75 + 0.4 * (r - 2)) + L[1]) * s,
                     rot: L[2], z: 5 - r });                              // the front row over the one behind it
        }
      }
      return out;
    }
    front.style.zIndex = 6;
    return { back, front, spots: layout(n), w, h, settle: pileSettle(layout) };
  }
  /* the pile SETTLES (review 2026-10-01: "after one by one cubes going, the other cubes on the tokari should get in the
     middle, just like the correct law of physics" - the basket; then "cubes can't be in air when other cubes are taken
     out ... best example is the charpai screen cube box, implement from there" - every holder): once a block has left,
     the ones still in it take the pile of their own count (layout(m): the front row filled first, what is left on top of
     it, centred) - each block the place that costs it least (sideways travel, and a climb costs far more than a drop, so
     none rises), and they DROP there under gravity (faster as they fall), land with a small rebound and squash, their
     tilt settling; the lowest places fill first. A block grabbed while it settles is put in its place at once (_settle). */
  function pileSettle(layout){
    return function settle(list){
      if(!list.length) return;
      const to = layout(list.length), used = to.map(()=> false), pick = [];
      const cost = (b, p)=>{ const q = pos(b), dx = p.x - q.x, dy = p.y - q.y; return dx * dx + (dy < 0 ? 9 : 0.25) * dy * dy; };
      let best = null, bestC = Infinity;
      (function dfs(i, c){
        if(c >= bestC) return;
        if(i === list.length){ bestC = c; best = pick.slice(); return; }
        for(let j = 0; j < to.length; j++){ if(used[j]) continue; used[j] = true; pick[i] = j; dfs(i + 1, c + cost(list[i], to[j])); used[j] = false; }
      })(0, 0);
      const order = list.map((b, i)=> i).sort((a, b_)=> to[best[b_]].y - to[best[a]].y);   // the lowest places first
      order.forEach((i, k)=>{
        const b = list[i], p = to[best[i]], q = pos(b), dx = p.x - q.x, dy = p.y - q.y;
        b._home = { x: p.x, y: p.y }; b._rot = p.rot; b._z = p.z;
        const fin = ()=>{ clearTimeout(b._settleT); if(b._settleA){ const a = b._settleA; b._settleA = null; setPos(b, p); a.cancel(); }
          b._settle = null; if(!b.classList.contains("lift")) b.style.zIndex = p.z; };
        if(reduce() || Math.hypot(dx, dy) < 1){ b.style.setProperty("--rot", p.rot + "deg"); setPos(b, p); b.style.zIndex = p.z; return; }
        b.style.zIndex = Math.max(+b.style.zIndex || 0, p.z);                // over what it tumbles past
        b._settle = ()=>{ b.style.setProperty("--rot", p.rot + "deg"); setPos(b, p); fin(); };   // grabbed now: in place at once
        b._settleT = setTimeout(()=>{
          if(!b.isConnected || b._placed) return;
          b.style.setProperty("--rot", p.rot + "deg");
          const drop = dy > 4, reb = Math.min(7, dy * 0.12);
          const kf = drop ? [{ translate: "0px 0px", easing: "cubic-bezier(.5,0,.85,.45)" },                        // falling, faster and faster
                             { translate: dx + "px " + dy + "px", offset: .78, easing: "cubic-bezier(.2,.6,.4,1)" },  // lands,
                             { translate: dx + "px " + (dy - reb) + "px", offset: .9, easing: "cubic-bezier(.6,0,.8,.4)" },   // a small rebound,
                             { translate: dx + "px " + dy + "px" }]                                                  // and rests
                          : [{ translate: "0px 0px", easing: "cubic-bezier(.25,.6,.35,1)" }, { translate: dx + "px " + dy + "px" }];   // slides, friction
          const ms = drop ? 250 + 45 * Math.sqrt(dy) + Math.abs(dx) * 0.4 : 300 + Math.abs(dx) * 0.8;
          const a = b._settleA = b.animate(kf, { duration: ms, fill: "forwards" });
          a.onfinish = ()=>{ fin(); if(drop) land(b, true); };
        }, 90 * k);
      });
    };
  }
  /* ---- [ground] review 2026-10-05: "add correct shadow effects so that they look placed correctly on the floor - the main
     elements whose length we measure with the cubes" (as T1's tables, CSS [T1 ground]). The one flat ellipse under the
     front edge left the back legs / feet floating: the pictures are drawn in perspective. feet = where it touches the
     floor, [x centre, y bottom, width] as fractions of the picture, measured from its alpha (card data obj.feet /
     items[].feet): four - front-left, back-left, back-right, front-right - or its contacts left to right (feet against a
     wall, a frame's two posts, a soft pillow's whole underside: then depth = how far back the floor under it reaches, a
     fraction of its height). Drawn: a tight dark contact shadow centred on each foot's bottom (behind the picture, so the
     foot covers its upper half) + the floor under it shaded (the polygon through the feet, blurred). Returns null when
     there are no feet - the caller keeps its old ellipse. ---- */
  function ground(parent, ox, oy, ow, oh, feet, depth){
    if(!Array.isArray(feet) || !feet.length) return null;
    const g = add(parent, "div", "md-gnd", "left:" + px(ox) + ";top:" + px(oy) + ";width:" + px(ow) + ";height:" + px(oh));
    const L = feet[0], R = feet[feet.length - 1], dp = depth != null ? depth : 0.03;
    const pts = feet.length >= 3 ? feet.map(f => [f[0], f[1]])
      : [[L[0] - L[2] / 2, L[1]], [L[0] - L[2] / 2 + 0.02, L[1] - dp], [R[0] + R[2] / 2 - 0.02, R[1] - dp], [R[0] + R[2] / 2, R[1]]];
    // (two contacts: the shade is only the thin gap under the base - a blur bigger than that gap wipes it out)
    const blur = feet.length >= 3 ? Math.max(4, Math.min(12, ow * 0.014)) : Math.max(3, Math.min(10, ow * 0.014, dp * oh * 0.3)), fh = Math.max(8, Math.min(14, ow * 0.026));
    g.innerHTML = '<i class="md-gnd-ao" style="filter:blur(' + px(blur) + ')"><b style="clip-path:polygon(' +
      pts.map(q => q[0] * 100 + "% " + q[1] * 100 + "%").join(",") + ')"></b></i>' +
      feet.map(f => '<i class="md-gnd-foot" style="left:' + f[0] * 100 + '%;top:' + f[1] * 100 + '%;width:' + Math.min(f[2] * 1.45, f[2] + 0.06) * 100 +
        '%;height:' + px(fh) + '"></i>').join("");
    return g;
  }
  /* ---- [robot] THE ROBOT MOP (review 2026-10-05: "in all game screens replace these cube boxes with the robot ... place
     this beside Swifty on the left side and only 1 cube in the same front-view position above it ... dragging and dropping
     of cubes will happen from here"): one cube stands on its lid; once it is placed, the next pops up out of the robot
     (an endless supply - the cube on top is always the next unplaced block), until the row is full. A wrong drop flies
     back onto the lid. Its face (supplied art, three expressions of one robot): robot_body.webp is the smiling robot;
     robot_face_happy / _sad.webp are just its face screen cut from the hearts / closed-eyes versions (soft-edged), laid
     over it and cross-faded - so only the eyes change, the body never shimmers. react("happy"): hearts;
     react("sad"): closed eyes (the robot itself never moves); each back to the smile after 1.4s; hold(kind) keeps one (the finish). ROBOT in
     the body's own units: ar = h/w, face = the screen's box, seat = where the cube's foot stands (x centre, y), all as
     fractions of the body. Same interface as the toy box ({back, front, spots, w, h, settle}) + link, react, hold. One more cube than the row needs: when the row is
     full a last one still rises onto the lid and stays there (it can't be dragged - the row is measured). */
  const ROBOT = { w: 2.7, ar: 0.5688, face: [0.1191, 0.559, 0.771, 0.3746], seat: [0.5025, 0.3304] };
  function robotGeom(n, s){ const w = ROBOT.w * s; return { w, h: w * ROBOT.ar }; }
  function robot(parent, x, y, n, s){
    const { w, h } = robotGeom(n, s), F = ROBOT.face;
    const back = add(parent, "div", "md-robot", "left:" + px(x) + ";top:" + px(y) + ";width:" + px(w) + ";height:" + px(h));
    const front = add(parent, "div", "md-robot-front", "left:" + px(x) + ";top:" + px(y) + ";width:" + px(w) + ";height:" + px(h));
    const fc = "left:" + F[0] * 100 + "%;top:" + F[1] * 100 + "%;width:" + F[2] * 100 + "%;height:" + F[3] * 100 + "%;font-size:" + px(F[2] * w / 100);
    back.innerHTML = '<i class="rb-shadow"></i><span class="rb-in"><img class="rb-body" src="assets/robot_body.webp" alt="" draggable="false">' +
      '<span class="rb-face" style="' + fc + '"><img class="rb-screen" src="assets/robot_screen.webp" alt="" draggable="false">' +
      '<span class="rb-eyes"><i class="rb-eye l"><b></b></i><i class="rb-eye r"><b></b></i></span>' +   // [robot eyes] live
      '<img class="rb-hearts" src="assets/robot_face_happy.webp" alt="" draggable="false"></span></span>' +   // [robot hearts] its happy face
      '<img class="rb-side" src="assets/robot_side.webp" alt="" draggable="false">';   // its profile, cube on board (robot_enter: .profile)
    const seat = { x: x + ROBOT.seat[0] * w - s / 2, y: y + ROBOT.seat[1] * h - s };
    /* the waiting cube's sky-blue aura (review 2026-10-05: "glow ... sky blue ... magical", then "this is really bad"): a
       blurred light BEHIND the cube, rising from the lid - the cube covers its middle, so only a soft halo shows round it.
       (It was the cube's own ::after: a child paints OVER its parent, so its pale ring sat on the cube's rim, rounder
       than the art's corners - a hard double outline, flashing as it breathed.) .on while a cube rests on the lid. */
    const aura = add(parent, "div", "rb-aura", "left:" + px(seat.x) + ";top:" + px(seat.y) + ";width:" + px(s) + ";height:" + px(s));
    aura.innerHTML = "<i></i>";
    const spots = []; for(let j = 0; j < n; j++) spots.push({ x: seat.x, y: seat.y, rot: 0, z: 8 });
    let blocks = [], faceT = 0, popT = 0;
    const next = ()=> blocks.find(b => !b._placed);
    function show(){ const nx = next(); blocks.forEach(b =>{ if(!b._placed) b.classList.toggle("rb-wait", b !== nx); b.classList.toggle("rb-top", b === nx); });
      aura.classList.toggle("on", !!nx); return nx; }
    function link(list){ blocks = list; show(); }
    // a cube has left for good: the next one rises out of the robot onto its lid (right after the drop)
    function settle(){
      clearTimeout(popT); const nx = next(); if(!nx){ aura.classList.remove("on"); return; }
      nx.classList.add("rb-wait"); aura.classList.remove("on");
      popT = setTimeout(()=>{ if(!nx.isConnected || nx._placed) return; show();
        if(!reduce()) nx.animate([{ translate: "0 " + px(s * 0.45), scale: ".35", opacity: 0, easing: "cubic-bezier(.25,.7,.35,1)" },
                                  { translate: "0 " + px(-s * 0.12), scale: "1.06", opacity: 1, offset: 0.62, easing: "ease-in-out" },
                                  { translate: "0 0", scale: "1", opacity: 1 }], { duration: 300 }); }, reduce() ? 0 : 120);   // (review 2026-10-05: "new cubes should appear faster")
    }
    /* review 2026-10-07 ("do not put the cube back on the robo mop - after putting it there in the wrong attempt, make it
       disappear, and the new cube will appear on the robo mop ... in all game screens which have this kind of
       interaction"): a cube set down wrong - the demo's gap / overlap, a child's wrong drop - is never carried back. It
       vanishes where it lies (shrinks away, a little puff) and a new one rises out of the robot onto its lid, as after a
       right drop (settle). The "new" cube is the same element, sent home unseen. Resolves once it stands on the lid. */
    function respawn(b){
      b._busy = true;                                                       // (not grabbed while it goes - childMeasure)
      return new Promise(res =>{
        let gone = null;                                                    // (only its own vanish is cancelled - never the cube's CSS fade-in, or it goes back to opacity 0)
        const home = ()=>{ if(gone) gone.cancel(); b.classList.remove("rb-away", "over", "lift", "moving"); setPos(b, b._home);
          b.style.zIndex = b._z || 8; settle(); setTimeout(()=>{ b._busy = false; res(); }, reduce() ? 0 : 120 + 300); };
        if(reduce()){ b.classList.add("rb-wait"); home(); return; }
        const q = pos(b), z = s * .9;
        const d = add(parent, "i", "rb-puff", "left:" + px(q.x + s / 2) + ";top:" + px(q.y + s / 2) + ";width:" + px(z) + ";height:" + px(z) + ";margin:" + px(-z / 2) + " 0 0 " + px(-z / 2));
        d.style.zIndex = 31;
        d.animate([{ transform: "scale(.4)", opacity: 0 }, { transform: "scale(1)", opacity: .95, offset: .35 }, { transform: "scale(1.5)", opacity: 0 }],
                  { duration: 520, easing: "ease-out" }).onfinish = ()=> d.remove();
        gone = b.animate([{ scale: "1", opacity: 1 }, { scale: "1.08", opacity: 1, offset: .25 }, { scale: ".2", opacity: 0 }],
                         { duration: 300, easing: "cubic-bezier(.5,0,.75,.4)", fill: "forwards" });
        gone.onfinish = ()=>{ b.classList.add("rb-wait"); home(); };
      });
    }
    /* [robot eyes] review 2026-10-07 ("whenever the cube is dragged and dropped - the demo's and the child's - the eyes
       should follow it ... express everything like the pencil ... smoother transitions, just like in robots"): the eyes
       are live (CSS [robot eyes]). GAZE, every frame: a cube on the move in this scene - dragged (.lift), flying home or
       into place (.moving), the hint's ghost - is watched (smooth pursuit); after it lands the eyes stay on that spot a
       moment, then wander like a robot's: quick little jumps (saccades) between the child (straight out) and nearby
       points, every 1.4-3s. gaze({x, y}) (-1..1 each) holds a direction instead (robotIn: on the table), gaze(null)
       lets go; tau = how quickly they get there. BLINKS: every 2.4-5s, and on each change of mood (a robot's "refresh").
       Off the page, the loop stops. */
    const eyesEl = back.querySelector(".rb-eyes"), eyeEls = [...back.querySelectorAll(".rb-eye")], faceEl = back.querySelector(".rb-face");
    const G = { x: 0, y: 0, tx: 0, ty: 0, over: null, tau: 0, seenAt: -1e9, nextWander: 0 }, GX = 10, GY = 2.8;   // range, em
    function blink(){ if(reduce()) return; eyeEls.forEach(e => e.classList.add("blink")); setTimeout(()=> eyeEls.forEach(e => e.classList.remove("blink")), 110); }
    function gaze(o, tau){ G.over = o || null; G.tau = tau || 0; }
    let blinkAt = performance.now() + 1800, lastT = performance.now();
    (function loop(t){
      if(!back.isConnected) return;
      const dt = Math.min(64, t - lastT); lastT = t;
      if(G.over){ G.tx = G.over.x; G.ty = G.over.y; }
      else {
        const mv = parent.querySelector(".md-block.lift, .md-block.moving, .md-block.ghost");
        if(mv && faceEl.offsetWidth){
          const r = mv.getBoundingClientRect(), f = faceEl.getBoundingClientRect(), k = f.width / faceEl.offsetWidth || 1;
          const dx = (r.left + r.width / 2 - f.left - f.width / 2) / k, dy = (r.top + r.height / 2 - f.top - f.height / 2) / k;
          G.tx = dx / Math.hypot(dx, 170); G.ty = dy / Math.hypot(dy, 150); G.seenAt = t; G.nextWander = t + 900;
        } else if(t > G.nextWander){                                      // wander: mostly back to the child, sometimes a glance
          const home = Math.random() < .45; G.tx = home ? 0 : (Math.random() * 2 - 1) * .45; G.ty = home ? 0 : (Math.random() * 2 - 1) * .35;
          G.nextWander = t + 1400 + Math.random() * 1600;
        }
      }
      const tau = G.tau || (G.over || t - G.seenAt < 100 ? 80 : 55), a = 1 - Math.exp(-dt / tau);   // pursuit / saccade
      G.x += (G.tx - G.x) * a; G.y += (G.ty - G.y) * a;
      eyesEl.style.translate = (G.x * GX).toFixed(2) + "em " + (G.y * GY).toFixed(2) + "em";
      eyesEl.style.scale = (1 - Math.abs(G.x) * .08).toFixed(3) + " 1";   // a little narrower toward the sides
      if(t > blinkAt){ blink(); blinkAt = t + 2400 + Math.random() * 2600; }
      requestAnimationFrame(loop);
    })(performance.now());
    function face(kind){
      const was = ["happy", "sad", "look"].find(c => back.classList.contains(c)) || null;
      back.classList.remove("happy", "sad", "look"); if(kind) back.classList.add(kind);
      if(was !== (kind || null) && kind !== "sad") blink();               // (sad squeezes shut on its own)
    }
    /* "look" (review 2026-10-05: "add this robot reaction ... at the time of the tutorial or when there is inactivity"):
       wide-open round eyes - the robot watching. Held through the tutorial's explanation + demonstration (MEASURE_DEMO)
       and whenever the idle nudge shows the drag (childMeasure onIdle); back to its smile the moment the child picks a
       cube up (onGrab). The hearts / closed eyes of a drop simply replace it. */
    function look(on){ if(!back.isConnected) return; if(on){ clearTimeout(faceT); face("look"); } else if(back.classList.contains("look")) face(null); }
    /* review 2026-10-05: "I don't want any movement in the robot, only his eyes will show expression - less distracting":
       no hop, no shake - only the face screen cross-fades (CSS .rb-face) */
    /* review 2026-10-05: "don't show any expression in the tutorial parts - only when the user drags and drops the cubes
       correctly or incorrectly": react() is called from the child's drops only (MDK.childMeasure onHit / onWrong) - never
       from the demo hand, the demo's gap / overlap, the answer options or the finish */
    function react(kind){
      if(!back.isConnected) return; clearTimeout(faceT); face(kind);
      faceT = setTimeout(()=> face(null), 1400);
    }
    function hold(kind){ clearTimeout(faceT); face(kind); }
    return { back, front, spots, w, h, settle, link, respawn, react, hold, look, face, gaze, blink, robot: true };
  }
  /* ---- the painting (T3, review 2026-09-30): a framed crayon painting of a man hauling a stack of blue cubes, on the wall
     where the rack was, shown as supplied (no cord, nothing laid over it). ITS cubes are the ones the child takes. "the
     second I have dragged the cube from the painting it should not be visible in the painting anymore": picked up, a
     painted cube PEELS OFF the paper - bare paper appears where it was, and the cube in hand starts exactly as the
     painted one (its place, size and tilt: PAINT.cubes) and straightens and grows to a real cube as it lifts. In hand it
     looks like that painted cube (painting_cubes.webp: each one cut on a smooth rounded square); placed on the door it
     turns glossy. Sent back, it shrinks and tilts back into its place and the painting has it again.
     "as the cubes get cleared the expression of the man should get relaxed gradually" + the relieved painting ("use
     these expression"): with each cube PLACED he eases - the 1st: his black strain dashes fade; half of them: his face
     cross-fades to the relieved one (from that painting, aligned on his hair); all: his sweat drops go.
     painting_layers.webp = every layer, as frames over one box of the painting (U): 0-5 the paper under cube k, 6-11
     painted cube k as it is (both: exactly its pixels, hard-edged - a clean partition of the stack), 12 the relieved head,
     13 the same without sweat drops, 14 the paper over the strain dashes. They are composited 1:1 into ONE canvas over U:
     the paper of the cubes taken, the dashes' paper, the relieved head, and over it the cubes still there - so his face
     tucks behind the stack, taken neighbours join with no seam, and nothing of a taken cube is left. Same interface as
     toybox ({back, front, spots, w, h}) + link(blocks), which arms all that; x, y = the frame's top-left. ---- */
  const PAINT = { src: "assets/painting_carrier.webp", ar: 2.009,
    // his 6 painted cubes, top row first: centre, size and tilt as painted (cx, cy, w, h: fractions of the painting's WIDTH)
    cubes: [{ cx: .4607, cy: .121, w: .0983, h: .0843, ang: -10 }, { cx: .558, cy: .1092, w: .0978, h: .0837, ang: -8 },
            { cx: .486, cy: .2026, w: .1039, h: .0764, ang: -8.25 }, { cx: .5826, cy: .1868, w: .0904, h: .0747, ang: -8.25 },
            { cx: .5036, cy: .2742, w: .0826, h: .0716, ang: -9.25 }, { cx: .5894, cy: .2674, w: .0921, h: .0859, ang: -7.5 }],
    look: "assets/painting_cubes.webp",                                     // each painted cube, straightened: a cube in hand
    layers: { src: "assets/painting_layers.webp", box: [.30259, .07684, .3847, .59209], fw: 385, fh: 295,
              PAPER: 0, CUBE: 6, HEAD: 12, HEAD_DRY: 13, DASHES: 14 },
    inner: [.0231, .0418, .9545, .9164],                                   // the paper inside the wooden frame (x, y, w, h)
    blank: "assets/painting_blank.webp",                                   // the same frame, its paper wiped clean
    upright: "assets/painting_upright.webp",                               // the same scene, him upright holding ONE cube
    // the answer, written in crayon (Kalam, crayon-textured; the order map: when each pixel's stroke is drawn; path: the tip)
    answer: { src: "assets/painting_answer.webp", order: "assets/painting_answer_order.webp", x: .1393, y: .3114, w: .722, h: .2972, px: [722, 148],
              path: [[0.3493,0.4018,0.0,0],[0.3253,0.4038,0.0059,0],[0.3148,0.4469,0.0125,0],[0.3318,0.4931,0.0199,0],[0.3168,0.5313,0.0267,0],[0.2928,0.5122,0.0335,0],[0.3253,0.5222,0.0787,0],[0.4118,0.467,0.0973,0],[0.4003,0.5112,0.104,0],[0.4188,0.5293,0.1103,0],[0.4413,0.5102,0.1169,0],[0.4513,0.5484,0.1234,0],[0.4188,0.4992,0.1417,0],[0.4438,0.5052,0.1852,0],[0.4633,0.4731,0.1921,0],[0.4738,0.5082,0.1989,0],[0.4808,0.4961,0.2508,0],[0.5043,0.467,0.2579,0],[0.5028,0.4861,0.2737,0],[0.4983,0.5343,0.28,0],[0.5298,0.3957,0.2986,0],[0.5538,0.3967,0.3048,0],[0.5268,0.5504,0.3417,0],[0.5318,0.5022,0.3479,0],[0.5358,0.454,0.3541,0],[0.5853,0.5383,0.3747,0],[0.5923,0.4901,0.3812,0],[0.5588,0.5072,0.3899,0],[0.5818,0.4931,0.3972,0],[0.5618,0.5413,0.4062,0],[0.5848,0.5333,0.4127,0],[0.5653,0.5353,0.4356,0],[0.6103,0.4951,0.4626,0],[0.6338,0.465,0.4698,0],[0.6273,0.5293,0.5069,0],[0.6338,0.5273,0.5162,0],[0.6578,0.5172,0.5226,0],[0.6813,0.5082,0.5297,0],[0.6318,0.5283,0.5405,0],[0.6493,0.5072,0.5493,0],[0.6703,0.5604,0.5854,0],[0.6788,0.5152,0.5919,0],[0.3948,0.4249,0.624,0],[0.4428,0.4299,0.6355,0],[0.4908,0.4329,0.647,0],[0.5388,0.4369,0.6586,0],[0.5868,0.4419,0.6701,0],[0.6348,0.448,0.6816,0],[0.6828,0.451,0.6932,0],[0.7108,0.455,0.6999,0],[0.2206,0.3871,0.7212,1],[0.2248,0.401,0.7237,1],[0.2292,0.4149,0.7261,1],[0.2338,0.4282,0.7285,1],[0.2409,0.43,0.731,1],[0.2485,0.4278,0.7334,1],[0.2559,0.4259,0.7358,1],[0.2634,0.4251,0.7383,1],[0.26,0.4358,0.7407,1],[0.2551,0.4486,0.7431,1],[0.2502,0.4614,0.7456,1],[0.2449,0.4737,0.748,1],[0.2462,0.4886,0.7505,1],[0.2484,0.5043,0.7529,1],[0.2507,0.5203,0.7553,1],[0.2507,0.5308,0.7578,1],[0.2437,0.5252,0.7602,1],[0.2364,0.5197,0.7626,1],[0.2287,0.5144,0.7651,1],[0.2214,0.5199,0.7675,1],[0.2143,0.5284,0.7699,1],[0.2074,0.5366,0.7724,1],[0.2033,0.5338,0.7748,1],[0.2027,0.5169,0.7773,1],[0.2025,0.5002,0.7797,1],[0.2017,0.4848,0.7821,1],[0.1948,0.4757,0.7846,1],[0.1882,0.4671,0.787,1],[0.1817,0.4588,0.7894,1],[0.1787,0.4514,0.7919,1],[0.1865,0.4472,0.7943,1],[0.1945,0.4438,0.7968,1],[0.2028,0.4413,0.7992,1],[0.2095,0.4353,0.8016,1],[0.2121,0.4203,0.8041,1],[0.2147,0.4046,0.8065,1],[0.2172,0.3884,0.8089,1],[0.1848,0.4562,0.8133,1],[0.1948,0.4695,0.82,1],[0.2057,0.5316,0.8267,1],[0.2162,0.5188,0.8333,1],[0.2271,0.5057,0.84,1],[0.2372,0.5127,0.8467,1],[0.2467,0.5199,0.8533,1],[0.2572,0.4354,0.86,1],[0.7892,0.4313,0.8711,1],[0.7914,0.4465,0.8732,1],[0.7937,0.4622,0.8754,1],[0.7961,0.4783,0.8775,1],[0.8035,0.4848,0.8796,1],[0.811,0.4897,0.8818,1],[0.8182,0.4941,0.8839,1],[0.8221,0.4994,0.8861,1],[0.8158,0.5088,0.8882,1],[0.809,0.5176,0.8903,1],[0.8016,0.5263,0.8925,1],[0.799,0.54,0.8946,1],[0.7988,0.556,0.8968,1],[0.7988,0.5719,0.8989,1],[0.799,0.5877,0.901,1],[0.793,0.5798,0.9032,1],[0.7868,0.57,0.9053,1],[0.7808,0.5597,0.9075,1],[0.7746,0.552,0.9096,1],[0.7673,0.5575,0.9117,1],[0.7603,0.5635,0.9139,1],[0.7535,0.5698,0.916,1],[0.748,0.5734,0.9182,1],[0.7505,0.5588,0.9203,1],[0.753,0.5437,0.9224,1],[0.7556,0.5283,0.9246,1],[0.7579,0.513,0.9267,1],[0.7529,0.5002,0.9289,1],[0.748,0.4878,0.931,1],[0.7435,0.4755,0.9331,1],[0.7427,0.4668,0.9353,1],[0.7505,0.4668,0.9374,1],[0.7584,0.4665,0.9396,1],[0.7664,0.4665,0.9417,1],[0.7729,0.4594,0.9438,1],[0.7781,0.4467,0.946,1],[0.7833,0.4347,0.9481,1],[0.7436,0.4735,0.95,1],[0.7534,0.4724,0.9571,1],[0.7635,0.4725,0.9643,1],[0.7741,0.4612,0.9714,1],[0.7847,0.4363,0.9786,1],[0.7962,0.481,0.9857,1],[0.8067,0.4929,0.9929,1],[0.8164,0.4991,1.0,1]] } };   // path: [x, y, t, crayon 0 blue / 1 yellow]
  function paintingGeom(n, s, cols, maxW){
    const w = Math.min(maxW || 480, 480);
    return { w, h: w / PAINT.ar, hang: 0 };
  }
  function wallPainting(parent, x, y, n, s, cols, maxW){
    const { w, h } = paintingGeom(n, s, cols, maxW), L = PAINT.layers, NC = PAINT.cubes.length;
    const back = add(parent, "div", "md-painting", "left:" + px(x) + ";top:" + px(y) + ";width:" + px(w) + ";height:" + px(h));
    const front = add(parent, "div", "md-painting-front", "left:" + px(x) + ";top:" + px(y) + ";width:" + px(w) + ";height:" + px(h));
    const im = add(back, "img", "pt-art", "width:" + px(w) + ";height:" + px(h)); im.src = PAINT.src; im.alt = "";
    const spots = [];
    for(let j = 0; j < n; j++){ const c = PAINT.cubes[Math.min(j, NC - 1)];   // on its painted cube's centre
      spots.push({ x: x + w * c.cx - s / 2, y: y + w * c.cy - s / 2, rot: 0 }); }
    // the live canvas over U: transparent wherever the painting is as supplied
    const cv = add(back, "canvas", "pt-erase-cv", "left:" + px(w * L.box[0]) + ";top:" + px(h * L.box[1]) + ";width:" + px(w * L.box[2]) + ";height:" + px(h * L.box[3]));
    cv.width = L.fw; cv.height = L.fh;
    const ctx = cv.getContext("2d"), spr = new Image(), gone = new Set();
    const cur = { dash: 0, head: 0 }, tgt = { dash: 0, head: 0 }; let tweening = false;
    spr.src = L.src;
    // "after the 5th box is dragged his posture should straighten a bit and he should only hold 1 box": the upright painting
    // (the same scene - its sun and clouds land on this one's) cross-fades in over him once the last cube is placed
    const up = add(back, "img", "pt-upright", "width:" + px(w) + ";height:" + px(h) + ";opacity:0"); up.src = PAINT.upright; up.alt = "";
    let uprightDone = Promise.resolve();
    const fr = (i, a)=>{ ctx.globalAlpha = a; ctx.drawImage(spr, i * L.fw, 0, L.fw, L.fh, 0, 0, L.fw, L.fh); };
    function draw(){
      if(!spr.complete || !spr.naturalWidth) return;
      ctx.clearRect(0, 0, L.fw, L.fh);
      gone.forEach(j => fr(L.PAPER + j, 1));                               // the cubes taken: paper
      if(cur.dash > 0) fr(L.DASHES, cur.dash);                              // his strain dashes, fading
      if(cur.head > 0){                                                     // his face, easing
        fr(L.HEAD, Math.min(1, cur.head));
        if(cur.head > 1) fr(L.HEAD_DRY, cur.head - 1);
        for(let j = 0; j < NC; j++) if(!gone.has(j)) fr(L.CUBE + j, 1);     // the cubes still there, in front of him
      }
      ctx.globalAlpha = 1;
    }
    spr.addEventListener("load", draw);
    function ease(){                                                        // cur -> tgt: .5s a step (the face .7s)
      if(tweening) return; tweening = true; let last = performance.now();
      (function tick(now){
        const dt = (now - last) / 1000; last = now; let moving = false;
        for(const [k, rate] of [["dash", 1 / .5], ["head", 1 / .7]]){
          const d = tgt[k] - cur[k]; if(!d) continue;
          const step = Math.sign(d) * Math.min(Math.abs(d), rate * dt); cur[k] += step; moving = true;
        }
        draw();
        if(moving && cv.isConnected) requestAnimationFrame(tick); else tweening = false;
      })(last);
    }
    let placedN = 0;
    function relax(){                                                       // the cubes placed -> how eased he is
      tgt.dash = placedN >= 1 ? 1 : 0;
      tgt.head = placedN >= n ? 2 : placedN >= Math.ceil(n / 2) ? 1 : 0;
      if(reduce()){ cur.dash = tgt.dash; cur.head = tgt.head; draw(); } else ease();
    }
    /* he stands up (the upright painting cross-fades in) the moment the LAST cube to measure leaves his arms - picked up,
       not placed (review 2026-10-01: "when I am dragging the 2nd last cube the posture is looking weird, it should
       smoothly change to holding 1 cube"); that cube sent back into the painting, he leans again */
    let upOn = false, upAnim = null;
    function upright(){
      const on = gone.size >= n; if(on === upOn) return; upOn = on;
      if(reduce()){ up.style.opacity = on ? 1 : 0; return; }
      const from = parseFloat(getComputedStyle(up).opacity) || 0;
      if(upAnim) upAnim.cancel();
      upAnim = up.animate([{ opacity: from }, { opacity: on ? 1 : 0 }], { duration: 750 * Math.abs((on ? 1 : 0) - from) + 1, easing: "ease-in-out", fill: "forwards" });
      if(on) uprightDone = upAnim.finished.catch(()=>{});
    }
    const take = j =>{ if(j < NC && !gone.has(j)){ gone.add(j); draw(); upright(); } };
    const give = j =>{ if(gone.delete(j)){ draw(); upright(); } };
    /* each real cube: unseen while it sits on its painted cube; lifted, it peels off (take + the painted pose -> a real
       cube); in hand it looks like its painted cube (.pt-cube, CSS); placed, it turns glossy and he eases; back home, it
       settles into the painting (the reverse, then give) */
    const link = blocks => blocks.forEach((b, j)=>{
      const k = Math.min(j, NC - 1), c = PAINT.cubes[k], S = b.offsetWidth || s;
      const pose = { scale: (w * c.w / S).toFixed(4) + " " + (w * c.h / S).toFixed(4), rotate: c.ang + "deg" };
      b.classList.add("pt-cube"); b.style.setProperty("--pt-x", (k * 20) + "%");   // (frame k of 6: 0 / 20 / ... / 100 %)
      // its tap area while it waits in the painting = its painted cube (~43px): the real 76px cubes overlap there, and a tap
      // on one painted cube used to lift its neighbour (CSS .in-art-home clip-path: clipped area is not hit)
      b.style.setProperty("--pt-hit", "inset(" + px(Math.max(0, (S - w * c.h) / 2)) + " " + px(Math.max(0, (S - w * c.w) / 2)) + ")");
      let lifted = false, settle = null;
      const sync = ()=>{
        const q = pos(b), home = Math.abs(q.x - b._home.x) < 1 && Math.abs(q.y - b._home.y) < 1;
        const now = b.classList.contains("lift"), placed = b.classList.contains("placed");
        b.classList.toggle("in-art-home", home);
        if(now && !lifted){                                                  // picked up
          if(settle){ settle.cancel(); settle = null; b.classList.remove("pt-settle"); }
          if(home && !gone.has(j)){ take(j);                                 // off the painting: it peels away from the paper
            if(!reduce()) b.animate([pose, { scale: "1.07", rotate: "0deg" }], { duration: 300, easing: "cubic-bezier(.3,1.25,.5,1)" }); }
        }
        lifted = now;
        if(placed){ if(!b.classList.contains("glossy")){ b.classList.add("glossy"); placedN++; relax(); } return; }   // on the door
        if(home && !now && gone.has(j) && !settle){                          // sent back: it settles into its place
          if(reduce()){ give(j); return; }
          b.classList.add("pt-settle");
          settle = b.animate([{ scale: "1", rotate: "0deg" }, pose], { duration: 220, easing: "ease-in", fill: "forwards" });
          settle.onfinish = ()=>{ if(b.classList.contains("lift")) return;   // (grabbed again meanwhile)
            give(j); b.classList.remove("pt-settle"); settle.cancel(); settle = null; };
        }
      };
      sync(); new MutationObserver(sync).observe(b, { attributes: true, attributeFilter: ["style", "class"] });
    });
    /* ---- the ending: the curtain and the child's crayon answer (review 2026-10-01). reveal({onWrite}) -> Promise:
       a red velvet stage curtain drops inside the frame over the painting (a small bounce), holds while the painting is
       swapped for blank paper (painting_blank.webp: the same frame, its paper wiped clean), rises - and the answer is
       written in crayon, stroke by stroke, a crayon tip moving along the letters (painting_answer.webp + its order map:
       per pixel, when its stroke is drawn). Reduced motion: straight to the written answer. */
    function curtainSVG(cw, ch){                                            // minimal (review 2026-10-01): "keep the curtains red
      // only, with golden borders, minimal" - red soft folds, a gold rod, a thin gold border down both sides and along the hem
      const sv = svgEl("svg", { viewBox: "0 0 " + cw + " " + ch, width: cw, height: ch, preserveAspectRatio: "none", "aria-hidden": "true" });
      const id = "ptc" + (++_flagN), defs = svgEl("defs", {}, sv), fw = cw / 5;
      const fold = svgEl("linearGradient", { id: id + "f", x1: 0, x2: 1, y1: 0, y2: 0 }, defs);   // a gentle light/dark rhythm
      [[0, "#8E1622"], [.32, "#AE1F2C"], [.5, "#BC2532"], [.68, "#AE1F2C"], [1, "#8E1622"]].forEach(q => svgEl("stop", { offset: q[0], "stop-color": q[1] }, fold));
      const pat = svgEl("pattern", { id: id + "p", width: fw, height: ch, patternUnits: "userSpaceOnUse" }, defs);
      svgEl("rect", { width: fw, height: ch, fill: "url(#" + id + "f)" }, pat);
      const sh = svgEl("linearGradient", { id: id + "s", x1: 0, x2: 0, y1: 0, y2: 1 }, defs);
      [[0, "rgba(40,0,6,.28)"], [.18, "rgba(40,0,6,0)"], [.88, "rgba(40,0,6,0)"], [1, "rgba(40,0,6,.18)"]].forEach(q => svgEl("stop", { offset: q[0], "stop-color": q[1] }, sh));
      const gold = svgEl("linearGradient", { id: id + "g", x1: 0, x2: 0, y1: 0, y2: 1 }, defs);
      [[0, "#F3D58A"], [.5, "#D9A93F"], [1, "#B8862A"]].forEach(q => svgEl("stop", { offset: q[0], "stop-color": q[1] }, gold));
      const hem = ch - 7; let d = "M0 0 H" + cw + " V" + hem, e = "M" + cw + " " + hem;
      for(let x = cw; x > 0; x -= fw){ const q = " Q" + (x - fw / 2) + " " + (hem + 6) + " " + Math.max(0, x - fw) + " " + hem; d += q; e += q; }
      svgEl("path", { d: d + " Z", fill: "url(#" + id + "p)" }, sv);
      svgEl("path", { d: d + " Z", fill: "url(#" + id + "s)" }, sv);
      const G = "url(#" + id + "g)", B = 3.2;
      svgEl("path", { d: e, fill: "none", stroke: G, "stroke-width": B, "stroke-linecap": "round" }, sv);             // the hem's border
      svgEl("rect", { x: 0, y: 0, width: B, height: hem, fill: G }, sv);                                             // the sides'
      svgEl("rect", { x: cw - B, y: 0, width: B, height: hem, fill: G }, sv);
      svgEl("rect", { x: -2, y: 0, width: cw + 4, height: 6, rx: 3, fill: "#C9A046" }, sv);                          // the rod
      svgEl("rect", { x: -2, y: 0, width: cw + 4, height: 2, rx: 1, fill: "#F0D595" }, sv);
      return sv;
    }
    const CRAYON = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><g transform="rotate(-45 30 30)"><path d="M4 30 L14 25 V35 Z" fill="#1C46A8"/><rect x="14" y="25" width="10" height="10" fill="#2F66D8"/><rect x="24" y="24.5" width="26" height="11" rx="1.5" fill="#F4EBD9" stroke="#C9B89A" stroke-width=".8"/><path d="M28 24.5 V35.5 M46 24.5 V35.5" stroke="#2F66D8" stroke-width="2"/><rect x="50" y="25" width="6" height="10" rx="2" fill="#2F66D8"/></g></svg>');
    const CRAYON_Y = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><g transform="rotate(-45 30 30)"><path d="M4 30 L14 25 V35 Z" fill="#C9800B"/><rect x="14" y="25" width="10" height="10" fill="#F2B01E"/><rect x="24" y="24.5" width="26" height="11" rx="1.5" fill="#F4EBD9" stroke="#C9B89A" stroke-width=".8"/><path d="M28 24.5 V35.5 M46 24.5 V35.5" stroke="#F2B01E" stroke-width="2"/><rect x="50" y="25" width="6" height="10" rx="2" fill="#F2B01E"/></g></svg>');
    function reveal(opts){
      opts = opts || {};
      const A = PAINT.answer, IN = PAINT.inner;
      return new Promise(res =>{
        if(!back.isConnected) return res();
        const blank = add(back, "img", "pt-blank", "width:" + px(w) + ";height:" + px(h) + ";opacity:0"); blank.src = PAINT.blank; blank.alt = "";
        const acv = add(back, "canvas", "pt-answer", "left:" + px(w * A.x) + ";top:" + px(h * A.y) + ";width:" + px(w * A.w) + ";height:" + px(h * A.h));
        acv.width = A.px[0]; acv.height = A.px[1];
        const actx = acv.getContext("2d");
        const ti = new Image(), oi = new Image(); ti.src = A.src; oi.src = A.order;
        let tData = null, oData = null;
        const ready = Promise.all([ti, oi].map(im => im.decode ? im.decode().catch(()=>{}) : Promise.resolve())).then(()=>{
          const oc = document.createElement("canvas"); oc.width = A.px[0]; oc.height = A.px[1]; const ox = oc.getContext("2d", { willReadFrequently: true });
          ox.drawImage(ti, 0, 0, A.px[0], A.px[1]); tData = ox.getImageData(0, 0, A.px[0], A.px[1]);
          ox.clearRect(0, 0, A.px[0], A.px[1]); ox.drawImage(oi, 0, 0, A.px[0], A.px[1]); oData = ox.getImageData(0, 0, A.px[0], A.px[1]).data;
        });
        const drawTo = t =>{                                                   // the writing up to t (0..1)
          if(!tData) return; const out = actx.createImageData(A.px[0], A.px[1]), s = tData.data, o = out.data, th = 1 + t * 254;
          for(let i = 0; i < s.length; i += 4){ const ord = oData[i]; if(ord && ord <= th){ o[i] = s[i]; o[i + 1] = s[i + 1]; o[i + 2] = s[i + 2]; o[i + 3] = s[i + 3]; } }
          actx.putImageData(out, 0, 0);
        };
        const swap = ()=>{ blank.style.opacity = 1; im.style.visibility = "hidden"; cv.style.visibility = "hidden"; };
        if(reduce()){ ready.then(()=>{ swap(); drawTo(1); if(opts.onWrite) opts.onWrite(); res(); }); return; }
        const box = add(back, "div", "pt-curtain-box", "left:" + px(w * IN[0]) + ";top:" + px(h * IN[1]) + ";width:" + px(w * IN[2]) + ";height:" + px(h * IN[3]));
        const cw = w * IN[2], ch = h * IN[3], cur = curtainSVG(cw, ch); box.appendChild(cur); cur.classList.add("pt-curtain");
        const tip = add(back, "img", "pt-crayon", "left:0;top:0;opacity:0"); tip.src = CRAYON; tip.alt = "";
        const wait = ms => new Promise(r => setTimeout(r, ms));
        (async ()=>{
          await uprightDone; await wait(550);                                  // he stands up, and stays so a moment
          // it falls, lands, its hem rebounds a little and settles (a bounce UP: a gap never opens along the top)
          await cur.animate([{ translate: "0 -104%", easing: "cubic-bezier(.45,0,.85,.55)" }, { translate: "0 0", offset: .7, easing: "ease-out" },
                             { translate: "0 -3.5%", offset: .85, easing: "ease-in" }, { translate: "0 0" }], { duration: 860, fill: "forwards" }).finished;
          swap(); await ready; await wait(420);                                // behind it: blank paper
          await cur.animate([{ translate: "0 0" }, { translate: "0 -104%" }], { duration: 820, easing: "cubic-bezier(.6,0,.4,1)", fill: "forwards" }).finished;
          box.remove();
          if(!back.isConnected) return res();
          if(opts.onWrite) opts.onWrite();
          const P = A.path, D = 3300, t0 = performance.now(); tip.style.opacity = 1; let ink = 0;
          await new Promise(done =>{
            (function frame(now){
              const t = Math.min(1, (now - t0) / D); drawTo(t);
              let j = 0; while(j < P.length - 1 && P[j + 1][2] <= t) j++;       // the tip: where the stroke is now
              const a = P[j], b = P[Math.min(j + 1, P.length - 1)], f = b[2] > a[2] ? Math.min(1, (t - a[2]) / (b[2] - a[2])) : 0;
              const tx = w * (a[0] + (b[0] - a[0]) * f), ty = h * (a[1] + (b[1] - a[1]) * f);
              if((a[3] || 0) !== ink){ ink = a[3] || 0; tip.src = ink ? CRAYON_Y : CRAYON; }   // the stars: a yellow crayon
              tip.style.left = px(tx - 4); tip.style.top = px(ty - 30);        // its point (bottom-left) on the stroke
              if(t < 1 && back.isConnected) requestAnimationFrame(frame); else done();
            })(t0);
          });
          tip.animate([{ opacity: 1, translate: "0 0" }, { opacity: 0, translate: "14px -18px" }], { duration: 380, fill: "forwards" });   // lifted away
          res();
        })();
      });
    }
    return { back, front, spots, w, h, hang: 0, link, reveal };
  }
  /* ---- the end-line flags. Review 2026-09-30: "the small flags are moving very much and look Claude-generated ... keep
     the flags still and give a wind effect on the flags (the upper part)". The old ones were a flat triangle / a flat
     checker rect whose WHOLE flag, pole and all, rocked +-6deg forever. Now the pole never moves - a silver pole, a gold
     ball, a small stand on the floor - and only the cloth does, the way cloth on a pole does: its hem is sewn to the pole
     (fixed); a wave runs out along it and grows toward the free end (u^1.25); the wind comes in slow gusts (two
     incommensurate sines, shared by every flag - one wind), and in a lull the free end sags under its own weight; a bent
     cloth is foreshortened, so the free edge draws in on each fold. The cloth is a 6 x 4 grid of quads recomputed each
     frame, so the checkers bend WITH it (a pattern fill would slide under the moving outline), and each cell is lit by
     its slope - the folds read as light and shade travelling out. One rAF loop drives every flag on screen and stops when
     none is left; reduced motion = the cloth at rest, drawn once. ---- */
  const FLAG = { W: 40, H: 50, x0: 6, y0: 6, L: 30, CH: 19, C: 6, R: 4 };
  const NS = "http://www.w3.org/2000/svg", _flags = new Set();
  let _windRaf = 0, _windT0 = 0, _windLast = 0, _flagN = 0;
  function svgEl(tag, attrs, parent){ const e = document.createElementNS(NS, tag); for(const k in attrs) e.setAttribute(k, attrs[k]); if(parent) parent.appendChild(e); return e; }
  function clothPt(u, v, ph, g){                                            // u: pole -> free end, v: top -> bottom
    const amp = 3.1 * g, TAU = 2 * Math.PI;
    const dy = amp * Math.pow(u, 1.25) * Math.sin(TAU * (u / 0.95 + 0.14 * v) - ph)
             + 0.28 * amp * u * Math.sin(TAU * 2.3 * u - 1.9 * ph + 0.7)    // a faster flutter riding on it
             + 1.6 * (1.05 - g) * u * u;                                    // weight: the free end sags in a lull
    const dx = -FLAG.L * 0.05 * g * u * (1 - Math.cos(TAU * u / 0.95 - ph)) / 2;   // a folded cloth is shorter
    return [FLAG.x0 + u * FLAG.L + dx, FLAG.y0 + v * FLAG.CH + dy];
  }
  const mixC = (rgb, k)=> "rgb(" + rgb.map(c => Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k))).join(",") + ")";
  function drawCloth(f, ph, g){
    const { C, R } = FLAG, P = [], pt = p => p[0].toFixed(2) + " " + p[1].toFixed(2);
    for(let r = 0; r <= R; r++){ const row = []; for(let c = 0; c <= C; c++) row.push(clothPt(c / C, r / R, ph, g)); P.push(row); }
    const lit = slope => Math.max(-0.3, Math.min(0.22, -slope * 0.45));      // a fold rising toward the free end faces the light
    for(let r = 0; r < R && f.cells.length; r++) for(let c = 0; c < C; c++){ // the checkers: each quad lit by its own slope
      const a = P[r][c], b = P[r][c + 1], d = P[r + 1][c + 1], e = P[r + 1][c], cell = f.cells[r * C + c];
      const col = mixC(cell.rgb, lit(((b[1] + d[1]) - (a[1] + e[1])) / 2 / (FLAG.L / C)));
      cell.el.setAttribute("d", "M" + pt(a) + "L" + pt(b) + "L" + pt(d) + "L" + pt(e) + "Z");
      cell.el.setAttribute("fill", col); cell.el.setAttribute("stroke", col);          // the stroke seals the hairline seams
    }
    if(f.stops){                                                              // a plain cloth: one smooth gradient along the wave -
      const m = P[R >> 1];                                                    // flat-lit quads showed as facets on a solid colour
      f.stops.forEach((s, c)=>{ const c0 = Math.max(0, c - 1), c1 = Math.min(C, c + 1);
        s.setAttribute("stop-color", mixC(f.rgb, lit((m[c1][1] - m[c0][1]) / ((c1 - c0) * FLAG.L / C)))); });
    }
    let o = "M" + pt(P[0][0]); for(let c = 1; c <= C; c++) o += "L" + pt(P[0][c]);
    for(let r = 1; r <= R; r++) o += "L" + pt(P[r][C]); for(let c = C - 1; c >= 0; c--) o += "L" + pt(P[R][c]);
    f.outline.setAttribute("d", o + "Z");
  }
  function windTick(now){
    if(!_windT0) _windT0 = _windLast = now;
    const dt = Math.min(0.05, (now - _windLast) / 1000), t = (now - _windT0) / 1000; _windLast = now;
    const g = 0.8 + 0.14 * Math.sin(2 * Math.PI * t / 5.7) + 0.06 * Math.sin(2 * Math.PI * t / 2.3 + 1.1);   // the gusts
    _flags.forEach(f =>{
      if(!f.svg.isConnected){ _flags.delete(f); return; }
      if(f.tick){ f.tick(g, dt, t); return; }                                 // something else in the same wind (MDK.windOn)
      f.ph += 2 * Math.PI * 1.15 * (0.75 + 0.35 * g) * dt;                   // a stronger gust flaps faster
      drawCloth(f, f.ph, g);
    });
    if(_flags.size) _windRaf = requestAnimationFrame(windTick); else { _windRaf = 0; _windT0 = 0; }
  }
  function flag(parent, kind, left, top){
    const box = add(parent, "div", "md-flag " + kind, "left:" + px(left) + ";top:" + px(top));
    const svg = svgEl("svg", { viewBox: "0 0 " + FLAG.W + " " + FLAG.H, width: FLAG.W, height: FLAG.H, "aria-hidden": "true" }, box);
    const id = "mdf" + (++_flagN), defs = svgEl("defs", {}, svg), end = kind === "end";
    const gp = svgEl("linearGradient", { id: id + "p", x1: 0, x2: 1, y1: 0, y2: 0 }, defs);
    [[0, "#FFFFFF"], [.55, "#D5DBE5"], [1, "#8F9AAD"]].forEach(s => svgEl("stop", { offset: s[0], "stop-color": s[1] }, gp));
    const gb = svgEl("radialGradient", { id: id + "b", cx: .35, cy: .32, r: .75 }, defs);
    [[0, "#FFF1B8"], [1, "#E2A410"]].forEach(s => svgEl("stop", { offset: s[0], "stop-color": s[1] }, gb));
    svgEl("ellipse", { cx: 4, cy: 48.6, rx: 6.5, ry: 1.5, fill: "rgba(18,48,98,.28)" }, svg);                       // contact shadow
    const cloth = svgEl("g", { "stroke-width": .5, "stroke-linejoin": "round" }, svg), cells = [];
    let stops = null;
    if(end){ for(let r = 0; r < FLAG.R; r++) for(let c = 0; c < FLAG.C; c++)
      cells.push({ el: svgEl("path", {}, cloth), rgb: (r + c) % 2 ? [255, 255, 255] : [34, 38, 46] }); }
    else {
      const gc = svgEl("linearGradient", { id: id + "c", gradientUnits: "userSpaceOnUse", x1: FLAG.x0, x2: FLAG.x0 + FLAG.L, y1: 0, y2: 0 }, defs);
      stops = []; for(let c = 0; c <= FLAG.C; c++) stops.push(svgEl("stop", { offset: c / FLAG.C }, gc));
    }
    const outline = svgEl("path", { fill: end ? "none" : "url(#" + id + "c)", stroke: end ? "#22262E" : "#17803A", "stroke-width": 1.1 }, cloth);
    svgEl("rect", { x: 4.6, y: 5.2, width: 2.4, height: FLAG.CH + 1.6, rx: 1.2, fill: end ? "#22262E" : "#1E8E3C" }, svg);   // the hem round the pole
    svgEl("rect", { x: 2.3, y: 4, width: 3.4, height: 43, rx: 1.7, fill: "url(#" + id + "p)", stroke: "#5B6474", "stroke-width": .8 }, svg);
    svgEl("rect", { x: 0, y: 45.6, width: 8, height: 3.2, rx: 1.6, fill: "#5B6474" }, svg);                         // its stand
    svgEl("circle", { cx: 4, cy: 3.4, r: 2.8, fill: "url(#" + id + "b)", stroke: "#9C6B00", "stroke-width": .6 }, svg);   // the gold ball
    const f = { svg, cells, stops, rgb: [45, 184, 76], outline, ph: end ? 0 : 1.9 };   // two flags, one wind, not in lockstep
    drawCloth(f, f.ph, 0.85);
    if(!reduce()){ _flags.add(f); if(!_windRaf) _windRaf = requestAnimationFrame(windTick); }
    return box;
  }
  /* [night-window] a window with a night sky as its own layer (G2b, review 2026-10-01: "make the moon shine a bit and the
     stars twinkle - don't overdo it"): the art, a soft warm glow over its moon that slowly breathes, and a small twinkle on
     each of its stars, each in its own time (CSS .md-win-*). W: {src, ar (h / w), moon [cx, cy, w, h], stars [[x, y]..]},
     the moon and the stars as fractions of the art. x, y, w: its box (scene px). */
  function nightWindow(parent, x, y, w, W){
    const h = w * (W.ar || .689), box = add(parent, "div", "md-win", "left:" + px(x) + ";top:" + px(y) + ";width:" + px(w) + ";height:" + px(h));
    const im = add(box, "img", "md-win-art"); im.src = W.src; im.alt = "";
    if(W.moon){ const m = W.moon, gl = Math.max(m[2] * w, m[3] * h) * 2.3;
      add(box, "i", "md-win-moon", "left:" + (m[0] * 100).toFixed(2) + "%;top:" + (m[1] * 100).toFixed(2) + "%;width:" + px(gl) + ";height:" + px(gl)); }
    // (review 2026-10-01: "they are twinkling too much and it is distracting") - every other star only, slowly, out of step
    (W.stars || []).forEach((st, i)=>{ if(i % 2) return; const k = i / 2;
      add(box, "i", "md-win-star", "left:" + (st[0] * 100).toFixed(2) + "%;top:" + (st[1] * 100).toFixed(2) + "%;" +
        "--t:" + (5 + (k * .53) % 1.4).toFixed(2) + "s;--d:" + ((k * 1.9) % 5.2).toFixed(2) + "s"); });
    return box;
  }
  /* the dashed end lines and their flags. axis "x": two vertical lines at x = a and b, from y0 to y1, flags standing at
     the bottom (the line stops at the flag's ball; its pole carries on to the floor); axis "y": two horizontal lines at
     y = a (bottom) and b (top), from x0 to x1, a flag standing on each at the right */
  /* axis "x": the flags stand just BELOW the row (review 2026-10-01: "as per law of physics both flags will flow in the
     direction of the wind only" - one wind, every cloth flies right; the start flag used to be mirrored so its cloth
     kept off the row's first block, flying the other way): a row's bottom + FLAG_LOW is where the lines end, so the
     flag's gold ball sits at the row's lower edge and its cloth flies under the row */
  const FLAG_LOW = 46;
  function endLines(parent, axis, a, b, s0, s1){
    const mk = (v, kind)=>{
      /* [line outside] review 2026-10-05: "the pink dotted line is getting hidden behind the blue cube" - a line centred ON
         the end had half of its 10px under the first / last block, which starts exactly there. Each now stands just
         OUTSIDE its end (its inner edge on it): start = before a (left of it on x; below the foot, a, on y), end = past b. */
      const out = kind === "start" ? (axis === "x" ? -10 : 0) : (axis === "x" ? 0 : -10);
      const l = add(parent, "div", "md-line " + (axis === "x" ? "v" : "h"),
        axis === "x" ? "left:" + px(v + out) + ";top:" + px(s0) + ";height:" + px(s1 - 50 - s0)   // stops just above the ball (dashes anchored at its foot, CSS)
                     : "top:" + px(v + out) + ";left:" + px(s0) + ";width:" + px(s1 - s0));
      /* [no flags] review 2026-10-05: "remove the flags throughout the game" - the end lines stand alone now (each
         still stops where its flag's ball was, at the row's edge). flag() and its wind stay for windOn's other users. */
      return l; };
    return { start: mk(a, "start"), end: mk(b, "end") };
  }
  const show = (l, pulse)=>{ l.classList.add("show"); if(l._flag) l._flag.classList.add("show"); if(pulse) l.classList.add("pulse"); };
  const unpulse = l => l.classList.remove("pulse");
  /* a counting digit on a block: its top edge (default), "above" it, "bottom" (below it), "right" / "left" of it */
  function digit(parent, p, s, n, side){                                  // p = the TILE's top-left (the block may still be snapping in)
    const d = add(parent, "div", "md-num", side === "right" ? "left:" + px(p.x + s - 4) + ";top:" + px(p.y + s / 2 - 16)
                                         : side === "left" ? "left:" + px(p.x - 30) + ";top:" + px(p.y + s / 2 - 16)
                                         : side === "bottom" ? "left:" + px(p.x + s / 2 - 16) + ";top:" + px(p.y + s + 6)
                                         : side === "above" ? "left:" + px(p.x + s / 2 - 16) + ";top:" + px(p.y - 34) : "left:" + px(p.x + s / 2 - 16) + ";top:" + px(p.y - 18));
    d.textContent = devNumeral(n); requestAnimationFrame(()=> d.classList.add("in")); return d;
  }
  /* ✓ / ✗ pop at (x, y) (its centre); ✗ stays until removed, ✓ fades by itself */
  function mark(parent, x, y, ok){
    const m = add(parent, "div", "md-mark " + (ok ? "ok" : "no"), "left:" + px(x - 22) + ";top:" + px(y - 22));
    m.setAttribute("aria-label", ok ? "सही" : "गलत");                      // the ✓ / ✕ is drawn (CSS), centred - the font's ✕ glyph sat off-centre
    requestAnimationFrame(()=> m.classList.add("in"));
    if(ok) setTimeout(()=>{ m.classList.add("out"); setTimeout(()=> m.remove(), 400); }, 900);
    return m;
  }
  /* where a mark of radius r can go beside box bx {l,t,w,h} (scene px) without touching anything (review 2026-09-30:
     "the cross mark circle should not overlap with any other surrounding elements"): spots ring the box, nearest first
     and the `prefer` side ("up" / "right") first at each distance; the first one clear of every number bubble, block,
     flag, the toy box, the plate, आगे, Swiftie - and of the OBJECT's opaque pixels (its box is mostly air: the space under
     a table is fine, the door is not) - wins. Inside the card only. None clear: the nearest preferred spot. */
  const _alpha = new Map();                                                 // src -> canvas of its pixels (null: unreadable)
  function opaqueUnder(img, cr){                                           // any solid pixel of img under client rect cr?
    const ir = img.getBoundingClientRect();
    if(cr.right <= ir.left || cr.left >= ir.right || cr.bottom <= ir.top || cr.top >= ir.bottom) return false;
    let cv = _alpha.get(img.src);
    if(cv === undefined){
      cv = null;
      try{ if(img.naturalWidth){ cv = document.createElement("canvas"); cv.width = img.naturalWidth; cv.height = img.naturalHeight;
        const c = cv.getContext("2d", { willReadFrequently: true }); c.drawImage(img, 0, 0); c.getImageData(0, 0, 1, 1); } }catch(e){ cv = null; }
      _alpha.set(img.src, cv);
    }
    if(!cv) return true;                                                     // can't read it: treat its box as solid
    const sx = cv.width / ir.width, sy = cv.height / ir.height;
    const x0 = Math.max(0, Math.floor((cr.left - ir.left) * sx)), y0 = Math.max(0, Math.floor((cr.top - ir.top) * sy));
    const x1 = Math.min(cv.width, Math.ceil((cr.right - ir.left) * sx)), y1 = Math.min(cv.height, Math.ceil((cr.bottom - ir.top) * sy));
    if(x1 <= x0 || y1 <= y0) return false;
    const d = cv.getContext("2d").getImageData(x0, y0, x1 - x0, y1 - y0).data;
    for(let i = 3; i < d.length; i += 4) if(d[i] > 40) return true;
    return false;
  }
  function freeSpot(scene, bx, r, prefer){
    const sR = scene.getBoundingClientRect(), k = sR.width / (scene.offsetWidth || 1);
    const card = scene.closest(".tut-card"), cR = card ? card.getBoundingClientRect() : null;
    const solids = [...scene.querySelectorAll(".md-num, .md-block:not(.ghost), .md-flag, .md-box-back, .md-box-front, .md-painting, .md-plate, .md-endmark, .md-mark")]
      .concat([...document.querySelectorAll("#navBtn, #slideHost .tut-mascot")]).map(e => e.getBoundingClientRect()).filter(b => b.width && b.height);
    const objs = [...scene.querySelectorAll(".md-obj")];
    const cx = bx.l + bx.w / 2, cy = bx.t + bx.h / 2, sides = prefer === "right" ? ["right", "up", "down", "left"] : prefer === "left" ? ["left", "up", "down", "right"] : ["up", "right", "left", "down"];
    const at = (side, d)=> side === "up" ? { x: cx, y: bx.t - d } : side === "down" ? { x: cx, y: bx.t + bx.h + d }
                         : side === "right" ? { x: bx.l + bx.w + d, y: cy } : { x: bx.l - d, y: cy };
    let first = null;
    for(let d = r + 6; d <= r + 6 + 14 * 8; d += 14) for(const side of sides){
      const p = at(side, d); if(!first) first = p;
      const cr = { left: sR.left + (p.x - r - 3) * k, top: sR.top + (p.y - r - 3) * k, right: sR.left + (p.x + r + 3) * k, bottom: sR.top + (p.y + r + 3) * k };
      if(cR && (cr.left < cR.left + 12 || cr.right > cR.right - 12 || cr.top < cR.top + 12 || cr.bottom > cR.bottom - 12)) continue;
      if(solids.some(b => cr.left < b.right && b.left < cr.right && cr.top < b.bottom && b.top < cr.bottom)) continue;
      if(objs.some(o => opaqueUnder(o, cr))) continue;
      return p;
    }
    return first;
  }
  /* the result plate ("6 ब्लॉक्स"), centred on cx, top at y. Review 2026-09-30: "change it with this" - the supplied
     golden badge. badge_result.webp is that art with its baked "6 ब्लॉक्स" painted out (so any count can go on it)
     and its two stars lifted off: they are badge_star.svg, drawn to the art's own stars, set back where they were so
     they can turn on their own (.cheer, CSS); its three rays (top-left) are erased (review: "remove this"). The text
     sits on the cream, in the art's maroon, at the art's size. */
  const BADGE_AR = 2.1718, BADGE_TXT = 0.17;                               // the art's width / height; text px per badge px (the art's own size)
  /* THE cube size, every measuring slide (review 2026-09-30: "the cubes size should stay same all across the game - this
     slide [T2] has the perfect size of the cube"): T2's 76 stage px. Each slide asks for it and only goes smaller where
     its object can't hold that many 76px cubes (the door is 9 tall: 684px - the scene is ~410) - then it takes the
     biggest size that fits. The card's old per-slide "s" / "bh" sizes are gone.
     Review 2026-10-06: "the cubes should look of the same size length and breadth and size in all game screen" + "zoom
     in so that assets looks bigger ... along with the cubes should also look bigger": T2's size on every screen. Every
     measuring slide asks for exactly CUBE (MEASURE_ASK / COMPARE_MEASURED used to cap at 88, MATCH_ROWS at 76), so the
     counts are what fits at 74px: the tall screens (T3 door, G2 almirah, G3 fridge, ~400px high) hold 5. */
  const CUBE = 74;
  function plate(parent, text, cx, y, w, rise){
    w = w || 230; const h = Math.round(w / BADGE_AR);
    const p = add(parent, "div", "md-plate" + (rise ? " rise" : ""), "left:" + px(cx - w / 2) + ";top:" + px(y) + ";width:" + px(w) + ";height:" + px(h));
    p.innerHTML = '<img class="md-plate-img" src="assets/badge_result.webp" alt="">' +
      '<img class="md-plate-star s1" src="assets/badge_star.svg" alt=""><img class="md-plate-star s2" src="assets/badge_star.svg" alt="">' +
      '<span class="md-plate-text"></span>';
    const tx = p.querySelector(".md-plate-text"); tx.textContent = text;
    tx.style.fontSize = px(Math.max(16, w * BADGE_TXT));                        // the text grows with the badge
    if(!rise) requestAnimationFrame(()=> p.classList.add("in"));
    return p;
  }
  /* run fn when the VO being played reaches `sec` into its clip (the count word, from its word timing), or at once if
     sec is not given; if the clip never plays (missing / blocked), the wall clock stands in. Returns a trigger that
     fires it now (e.g. from the VO's end) - it only ever runs once. */
  function atVoice(sec, fn){
    let done = false; const go = ()=>{ if(!done){ done = true; fn(); } };
    if(!(sec >= 0)){ go(); return go; }
    const t0 = performance.now();
    (function tick(){
      if(done) return;
      const a = voEl, running = a && !a.paused && a.currentTime > 0;
      if(running ? a.currentTime >= sec : performance.now() - t0 > sec * 1000 + 600) return go();
      requestAnimationFrame(tick);
    })();
    return go;
  }
  /* the result plate rising OUT OF THE TOY BOX (review 2026-09-30: "this can come inside the side red box only - it
     can animate and come from inside the box"): the box - empty now - stays; the badge sits between its two layers,
     starts small and hidden behind the front wall, springs up and stands in the box, its foot still behind the wall.
     At least 150px wide, so it reads even in T3's small box. */
  function boxPlate(box, text, rest){
    const bx = parseFloat(box.back.style.left), by = parseFloat(box.back.style.top), W = box.w, H = box.h;
    // its foot a little above the front wall's rim (62% down the box art - centred in the box, review 2026-10-05), not behind it: the badge's lower star sits at its foot,
    // and it has to be seen whole when it spins (MEASURE_DEMO .cheer). rest: the spare blocks left in the box (data.spare,
    // review 2026-10-01) - it comes to stand ON them, so they stay in sight under it
    const tops = (rest || []).map(b => (b._home || pos(b)).y).filter(v => v === v);   // (where it rests, even mid-settle)
    const w = Math.max(W * 0.72, 150), h = Math.round(w / BADGE_AR), foot = Math.min(by + H * 0.62, tops.length ? Math.min(...tops) + 4 : Infinity);
    const p = plate(box.back.parentNode, text, bx + W / 2, foot - h, w, true);
    const fz = parseInt(box.front.style.zIndex, 10) || 5; p.style.zIndex = fz; box.front.style.zIndex = fz + 1;
    const k0 = Math.min(0.45, (H * 0.25) / h), drop = (by + H * 0.97) - foot;     // start: small, its top under the front rim
    if(reduce()){ p.style.opacity = 1; return p; }
    p.animate([{ translate: "0 " + px(drop), scale: k0 + "", opacity: 1, easing: "cubic-bezier(.25,.6,.35,1)" },    // up out of the box ~0.55s,
               { translate: "0 " + px(-h * 0.1), scale: "1.05", opacity: 1, offset: 0.6, easing: "ease-in-out" },  // a little past,
               { translate: "0 " + px(h * 0.02), scale: ".98", opacity: 1, offset: 0.82, easing: "ease-out" },     // a small dip,
               { translate: "0 0", scale: "1", opacity: 1 }], { duration: 950, fill: "forwards" });                // and it stands
    return p;
  }
  /* the result on the robot's slides (review 2026-10-07): "a normal box as throughout the game" - the answer cards' own
     white box (CSS .md-count: 16px corners, the #D5D8DF rim and its 0 4px 0 edge, the prompt's navy text), not the gold
     badge - and it comes out from UNDER the measured object ("I want the six blocks to come from the upper side of the
     table, slipping from there"). countBox: the box, centred on cx, top at `top`, w x h. */
  function countBox(parent, text, cx, top, w, h){
    const c = add(parent, "div", "md-count", "left:" + px(cx - w / 2) + ";top:" + px(top) + ";width:" + px(w) + ";height:" + px(h) + ";font-size:" + px(Math.round(h * .45)));
    c.textContent = text; return c;
  }
  /* slipBox (T2, the table): the box waits BEHIND the table (z 0, under the picture), tucked up under its top - its
     bottom at the apron's lower edge (`hide`), so none of it shows - and slips down out from under the top into the gap
     between the legs: it drops, overshoots a little with a small swing, and settles. */
  function slipBox(parent, text, cx, top, w, h, hide){
    const c = countBox(parent, text, cx, top, w, h); c.style.zIndex = 0;
    if(reduce()) return c;
    const up = px(hide - (top + h));
    c.animate([{ translate: "0 " + up, rotate: "0deg", easing: "cubic-bezier(.55,0,.85,.45)" },          // slips out, gathering speed,
               { translate: "0 " + px(h * .07), rotate: "1.6deg", offset: .58, easing: "ease-out" },        // a little past, swinging,
               { translate: "0 " + px(-h * .03), rotate: "-.8deg", offset: .78, easing: "ease-in-out" },
               { translate: "0 0", rotate: "0deg" }], { duration: 780 });                                  // and settles
    return c;
  }
  /* riseBox (T3, the door): the box comes out of the light under the door - small and flat at `from`, a puff of dust -
     springs up, a little past, a small dip, and stands in front of the door's foot. */
  function riseBox(parent, text, cx, foot, w, h, from){
    const c = countBox(parent, text, cx, foot - h, w, h); c.style.zIndex = 14; c.style.transformOrigin = "50% 100%";
    if(reduce()) return c;
    const at = px(from.x - cx) + " " + px(from.y - foot);
    c.animate([{ translate: at, scale: ".16 .06", opacity: 0, easing: "ease-out" },
               { translate: at, scale: ".34 .2", opacity: 1, offset: .16, easing: "cubic-bezier(.25,.6,.35,1)" },
               { translate: "0 " + px(-h * .14), scale: "1.06", opacity: 1, offset: .62, easing: "ease-in-out" },
               { translate: "0 " + px(h * .02), scale: "1.03 .97", opacity: 1, offset: .82, easing: "ease-out" },
               { translate: "0 0", scale: "1", opacity: 1 }], { duration: 1050 });
    for(let j = 0; j < 4; j++){
      const z = w * (.13 + Math.random() * .05), sx = (j < 2 ? -1 : 1) * (j % 2 ? .22 : .1) * w;
      const d = add(parent, "i", "rb-puff", "left:" + px(from.x) + ";top:" + px(from.y - z * .2) + ";width:" + px(z) + ";height:" + px(z) + ";margin:" + px(-z / 2) + " 0 0 " + px(-z / 2));
      d.style.zIndex = 13;
      d.animate([{ transform: "scale(.3)", opacity: .9 }, { transform: "translate(" + px(sx) + "," + px(-z * .5) + ") scale(1.25)", opacity: 0 }],
                { duration: 650, delay: 60 + j * 40, easing: "cubic-bezier(.2,.7,.4,1)", fill: "backwards" }).onfinish = ()=> d.remove();
    }
    return c;
  }
  /* a bouncing arrow at (x, y): "down" above a tile, "left" to the right of one */
  function arrow(parent, x, y, dir){ const a = add(parent, "div", "md-arrow " + (dir || "down"), "left:" + px(x - 16) + ";top:" + px(y - 16)); return a; }
  /* the tutorial mascot's pose: "guide" / "cheer" / null = back to the card's own. Review 2026-09-30: "why has Swifty
     changed in this slide?" - the old kit's mk_sw_guide / mk_sw_cheer were a different drawing of her (round chick head,
     black eyes, rosy cheeks). Only on-model art now: "guide" keeps the card's own Swiftie, "cheer" is her celebrating
     clip (the end screen's). That clip plays once, and <img>s of one URL share one timeline, so each cheer gets its own
     blob: URL of it - it plays from frame 0 and never uses up the end screen's play. */
  const POSE = { cheer: "assets/gif/sw_lg_celebrating_anim.webp" };
  function pose(id){
    const m = document.querySelector("#slideHost .tut-mascot"); if(!m) return;
    if(!m._src0) m._src0 = m.getAttribute("src");
    const p = id && POSE[id], b = p && Assets.blob(p), old = m._blobUrl;
    m._blobUrl = b instanceof Blob ? URL.createObjectURL(b) : null;
    m.setAttribute("src", p ? (m._blobUrl || p + "?r=" + Date.now()) : m._src0); m.classList.toggle("md-pose", !!p);
    if(old) URL.revokeObjectURL(old);
  }
  /* THE HINT SHEET (review 2026-09-30: "for the hint part follow the excel sheet, not the slides" - the FLN hint logic
     sheet: MCQ 2 / 3 options, Drag & Drop). Its "the wrong option / drop area shakes and returns": the kit's lateral
     buzz (recipes 11/20: +-9px decaying, .4s), on `translate` so it never fights an element's own entrance animation. */
  function shake(el, amp){ if(!el || reduce()) return; const a = amp || 9;
    el.animate([{ translate: "0 0" }, { translate: -a + "px 0" }, { translate: a + "px 0" }, { translate: -a * .67 + "px 0" },
                { translate: a * .67 + "px 0" }, { translate: "0 0" }], { duration: 400, easing: "ease-in-out" }); }
  /* its "soft pulse/glow" on the right answer / the right drop area: the kit's hint glow (recipe 12, revealPulse's
     green), three soft pulses. A card or an area gets a green ring (box-shadow, on top of its own shadows); a picture
     (pic) gets the same green as a glow that follows its shape (drop-shadow) and swells a little. */
  function softGlow(el, pic){
    if(!el) return null;
    const cs = getComputedStyle(el), own = pic ? cs.filter : cs.boxShadow, b = own && own !== "none" ? own + (pic ? " " : ", ") : "";
    const off = "drop-shadow(0 0 0 rgba(0,177,50,0)) drop-shadow(0 0 0 rgba(0,177,50,0))";
    const kf = pic
      ? [{ filter: b + off, scale: "1" }, { filter: b + "drop-shadow(0 0 3px rgba(0,177,50,.8)) drop-shadow(0 0 14px rgba(0,177,50,.65))", scale: "1.04" },
         { filter: b + off, scale: "1" }]
      : [{ boxShadow: b + "0 0 0 0 rgba(0,177,50,0), 0 0 0 0 rgba(0,177,50,0)" }, { boxShadow: b + "0 0 0 8px rgba(0,177,50,.32), 0 10px 26px rgba(0,177,50,.34)" },
         { boxShadow: b + "0 0 0 0 rgba(0,177,50,0), 0 0 0 0 rgba(0,177,50,0)" }];
    return el.animate(kf, { duration: 1100, iterations: reduce() ? 1 : 3, easing: "ease-in-out" });
  }
  /* the child's measuring turn, shared by every slide where the child lays the blocks: drag each next block from the
     box onto the next tile. A drop on the next tile snaps flush (onHit(n, tile) - may return a Promise, e.g. a counting
     VO); anywhere else - a gap, an overlap, off the row - it bounces back to the box. The hint sheet's Drag & Drop
     ladder, counted per tile (cfg.hints): attempt 1 - it returns + hints.say(1) (think again, nothing shown); attempt 2
     on - it returns, the tile glows and the hand shows the drag (the ghost) + hints.say(2) (the rule). Idle cfg.idleMs -
     the ghost drag (the sheet has no inactivity row; the decks' idle ghost stays). After the last one, onAll(). cfg:
     { scene, slide, alive, blocks, slots, slotXY(k), S, hand, placed0, idleMs, hints:{say(attempt)}, showTiles (the
     next tile's outline while a block is carried), onHit, onAll, onWrong(attempt) } */
  function childMeasure(cfg){
    const { scene, blocks, slots, slotXY, S, hand } = cfg, N = slots.length, STOP = {};
    let placed = cfg.placed0 || 0, drag = null, idleT = 0, tok = 0, on = false;
    const misses = [];                                                       // wrong drops per tile - the hint ladder
    const live = ()=> on && cfg.alive();
    const lift = b =>{ b.classList.add("lift"); b.style.zIndex = 30; };
    const drop = b =>{ b.classList.remove("lift"); b.style.zIndex = b._placed ? 6 : (b._z || 3); };
    async function ghost(keep){                                              // keep: the tile stays lit after it (hint attempt 2)
      const t = ++tok, src = blocks.find(b => !b._placed); if(!src || placed >= N || !hand) return;
      const g = src.cloneNode(false); g.classList.add("ghost"); g.classList.remove("lift"); g.style.zIndex = 31; scene.appendChild(g); setPos(g, pos(src));
      const slot = slots[placed];
      try{
        hand.on(pos(g)); await wait(300); if(t !== tok) throw STOP;
        hand.press(); slot.classList.add("show", "target");
        await glide(g, slotXY(placed), 1100, true, hand); if(t !== tok) throw STOP;
        await wait(260);
      } catch(e){ if(e !== STOP) throw e; }
      g.remove(); if(t === tok){ hand.off(); if(!drag && !keep) slot.classList.remove("show", "target"); }
    }
    const cancelGhost = ()=>{ tok++; scene.querySelectorAll(".md-block.ghost").forEach(e => e.remove()); if(hand) hand.off(); };
    const armIdle = ()=>{ clearTimeout(idleT); if(!cfg.idleMs) return;
      idleT = setTimeout(()=>{ if(live() && !drag){ if(cfg.onIdle) cfg.onIdle(); ghost().then(()=>{ if(live()) armIdle(); }); } }, cfg.idleMs); };
    blocks.forEach(b =>{
      b.addEventListener("pointerdown", ev =>{
        if(!live() || b._placed || b._busy || drag || placed >= N) return;
        ev.preventDefault(); clearTimeout(idleT); cancelGhost(); if(cfg.onGrab) cfg.onGrab();
        if(b._settle) b._settle();                                         // (a holder's block still settling: in its place first)
        const p = local(scene, ev), bp = pos(b);
        drag = { b, id: ev.pointerId, ox: p.x - bp.x, oy: p.y - bp.y, sx: p.x, sy: p.y, moved: false };
        try{ b.setPointerCapture(ev.pointerId); }catch(e){}
        lift(b); sfxTap(); if(cfg.showTiles !== false) slots[placed].classList.add("show", "target");
      });
      b.addEventListener("pointermove", ev =>{
        if(!drag || drag.b !== b || ev.pointerId !== drag.id) return;
        const p = local(scene, ev); if(Math.hypot(p.x - drag.sx, p.y - drag.sy) > 6) drag.moved = true;
        setPos(b, { x: p.x - drag.ox, y: p.y - drag.oy });
      });
      const up = ev =>{
        if(!drag || drag.b !== b || ev.pointerId !== drag.id) return;
        const dr = drag; drag = null;
        const at = pos(b), to = slotXY(placed), slot = slots[placed];
        const hit = dr.moved && Math.abs(at.x - to.x) <= S * 0.6 && Math.abs(at.y - to.y) <= S * 0.6;
        slot.classList.remove("show", "target");
        if(hit){                                                            // flush against the last one
          b._placed = true; b.classList.add("placed"); drop(b);
          glide(b, to, reduce() ? 0 : 120, false).then(()=>{ land(b); okFlash(b); });   // correct: it lands (no ✓, no green outline)
          placed++; const n = placed;
          GameBus.emit("measure_unit_placed", { slide_id: cfg.slide.id, phase: cfg.slide.phase, count: n, of: N });
          Promise.resolve(cfg.onHit ? cfg.onHit(n, to) : null).then(()=>{ if(!live()) return; if(n >= N){ on = false; clearTimeout(idleT); if(cfg.onAll) cfg.onAll(); } else armIdle(); });
        } else {                                                            // a gap / an overlap / off the row: back to the box
          sfxWrongSoft(); drop(b); b.style.zIndex = 30;
          const k = placed, m = misses[k] = (misses[k] || 0) + 1;
          GameBus.emit("answer_wrong", { slide_id: cfg.slide.id, phase: cfg.slide.phase, attempts: ++state.attempts });
          if(cfg.onWrong) cfg.onWrong(m);
          // [robot] cfg.respawn: it wiggles where it lies, vanishes, and a new one rises on the lid (MDK.robot respawn) - else back to the box
          const back = cfg.respawn ? (shake(b, 7), wait(reduce() ? 0 : 420).then(()=> cfg.alive() ? cfg.respawn(b) : null))
                                   : glide(b, b._home, reduce() ? 0 : 420, true);
          back.then(()=>{ if(!cfg.alive()) return; b.style.zIndex = b._z || 3;
            if(!cfg.respawn) shake(b, 7);                                   // a wrong drop wiggles (QA checklist)
            if(!live() || drag || placed !== k) return;
            /* QA checklist 2026-10-05 - three layers: 1 think again (hints.say(1)); 2 the strong hint, the rule - start
               where the last block ends (hints.say(2)); 3 the visual nudge - the tile glows and the hand shows the
               drag (hints.say(3)) */
            if(cfg.hints) cfg.hints.say(Math.min(m, 3));
            if(m >= 3 && hand) setTimeout(()=>{ if(!live() || drag || placed !== k) return;
              slots[k].classList.add("show", "target"); ghost(true).then(()=>{ if(live()) armIdle(); }); }, 350);
            else armIdle(); });
        }
      };
      b.addEventListener("pointerup", up); b.addEventListener("pointercancel", up);
    });
    return {
      start(){ on = true; armIdle(); }, stop(){ on = false; clearTimeout(idleT); cancelGhost(); },
      ghost(){ return live() ? ghost() : Promise.resolve(); }, cancelGhost, armIdle, get placed(){ return placed; }, set placed(v){ placed = v; }
    };
  }
  /* pointer -> scene px (the stage is scaled by --scale) */
  function local(scene, ev){ const r = scene.getBoundingClientRect(), k = r.width / (scene.offsetWidth || 1); return { x: (ev.clientX - r.left) / k, y: (ev.clientY - r.top) / k }; }
  return { STRIP, FLAG_LOW, px, wait, add, pos, setPos, cube, hand, glide, land, okFlash, knock, toybox, toyboxGeom, basket, basketGeom, holder, holderGeom, robot, robotGeom, ground, nightWindow, wallPainting, paintingGeom, endLines, show, unpulse, digit, mark, freeSpot, plate, boxPlate, slipBox, riseBox, arrow, pose, atVoice, BADGE_AR, CUBE, local, reduce, childMeasure, shake, softGlow };
})();

const SlideModules = {













  MEASURE_DEMO: {
    /* T2 (the table, SME deck page 3) and T3 (the door, page 4): the deck's measuring lesson, step by step, each step
       on its own VO line (review 2026-09-30: "add things and animation as per the instruction completely", then
       "yes, follow the ppt slides instructions"):
         heading VO ....... the object, the toy box and the floor come in
         VO1 explain_a .... the START end line appears (its flag too) and pulses; explain_b - the END line
         VO2 demo ......... Swiftee (guide pose) - her hand drags blocks one by one from the toy box: एक... दो...
         VO3 rule_a ....... the previous block's end pulses; rule_b - a block set down with a GAP: boxed, ✗, taken
                            back; rule_c - one set down OVERLAPPING: boxed, ✗, taken back
         child VO ......... a ghost drag, box -> the next tile (the tile shows as the block moves)
         child ............ drags each next block (MDK.childMeasure): on the next tile it snaps flush - its number
                            pops on it, ✓, counted aloud (vo_num_k); anywhere else it bounces back to the box, then the
                            ghost drag; idle 6s - the ghost drag; a bouncing arrow marks the next tile
         done ............. "<n> ब्लॉक्स" on the result plate under the measured object, confetti, Swiftee cheers,
                            the conclusion VO; आगे unlocks.
       axis "x" (T2): the units lie in their own row a little BELOW the object; axis "y" (T3): they stand in a column
       BESIDE it (on its right), from the floor up. Dashed lines carry the object's two ends to them. The card gets
       the T1 floor, the object standing on it. data: { n, demo, axis, obj:{src, w, ar, a0, a1}, bh, unit_hi }
       (ar = h/w of the picture; a0/a1 = the measured ends as fractions along the axis). audio: prompt, explain_a,
       explain_b, demo, rule_a, rule_b, rule_c, child, conclude (+ vo_num_k). CSS [measure kit]. */
    mount(host, slide){
      const d = slide.data, N = d.n || 6, DEMO = Math.max(1, Math.min(d.demo || 2, N - 1)), AX = d.axis === "y" ? "y" : "x";
      const K = MDK, reduce = K.reduce(), px = K.px;
      state.ownsAudio = true; setNavActive(false); setSwMood("teach");   // (her cheer clip is one of this slide's files: Assets has it before the slide mounts)
      const scene = document.createElement("div"); scene.className = "md-stage"; host.appendChild(scene);
      const card = host.closest(".tut-card"); if(card) card.classList.add("tc-measure", "tc-floor");
      const alive = ()=> CARD.slides[state.idx] === slide && scene.isConnected;
      const STOP = {}, guard = ()=>{ if(!alive()) throw STOP; };
      /* ---- layout: everything fits between the prompt and आगे (the door group sits right of आगे and may go lower) ---- */
      const kS = scene.getBoundingClientRect().width / (scene.offsetWidth || 1) || 1;
      const W = scene.offsetWidth || 1053, navR = $("navBtn").getBoundingClientRect(), sR = scene.getBoundingClientRect();
      let avail = Math.max(300, (navR.top - sR.top) / kS - 10); const PLATE_H = 72;
      let OX, OY, OW, OH, S, A0, A1, slotXY, lines, plateAt, boxAt, floorY, plateH = PLATE_H - 2;
      const ar = d.obj.ar || 1, f0 = d.obj.a0 || 0, f1 = d.obj.a1 != null ? d.obj.a1 : 1;
      const BOX_COLS = 3, BOX_OPEN = AX === "x";
      /* [t3-room] review 2026-09-30 (T3): "replace the red box with some interior hanging wall thing in which the cubes are
         placed ... better floor in this particular slide ... light comes from inside of door in down vacant space between
         floor and door" - per slide, from the card: data.holder "painting" (MDK.wallPainting instead of the toy box), data.floor
         "wood" (the card's floor: planks + a skirting board, CSS), data.obj.light [x0, x1, y0] (the gap under the door leaf,
         as fractions of the picture: a warm light in it, spilling onto the floor) */
      /* [robot] review 2026-10-05: the robot mop replaces every holder (the toy box, T3's painting) - data.keep_holder brings
         the old one back. It stands on the card's floor at the bottom left, beside Swifty; the measured object is centred. */
      const ROBOT = !d.keep_holder, PAINTING = !ROBOT && d.holder === "painting"; let paintMaxW = 0;
      const PCOLS = Math.min(3, Math.ceil(Math.sqrt(N)));                   // his stack: 2 x 2 for 4, 3 x 3 for 9
      if(card && d.floor) card.classList.add("floor-" + d.floor);
      if(card && d.wall) card.classList.add("wall-" + d.wall);               // data.wall "paint": plain painted wall, not graph paper
      if(AX === "x"){
        /* [t2-layout] T2: the table centred, the row on the floor IN FRONT of it, the open toy box on its right. Review
           2026-09-30: "the table should be bigger and kind of in the center ... the box is really short and in the middle
           ... I have this width changed, it's not able to shift width". The table used to be sized by the height left
           after the table, a separate row BELOW it and 72px kept for the plate, so raising obj.w changed nothing. Now the
           blocks stand in front of its feet (their tops RISE x S above the foot line), the plate appears under the top,
           between the legs, and ✓ pops on the block itself - the height only holds the table + (1 - RISE) x S, and obj.w
           is reachable. The table stays centred, or within OFF_MAX of it - it gives up size before it gives up the
           centre; the box may use the card's side padding (RIGHT = W + 18, the card's inner edge is at W + 30). */
        /* [t2-on-top] review 2026-10-05: "I want the cubes to come above the table and not down" - the row now stands ON
           the tabletop: its base on the top's surface just behind the front edge (TOPY of the picture; the cream top runs
           0.006..0.185 of obj_table_measure.webp, the olive edge band below it), still A0..A1 = the top's full width.
           Above the row the height keeps ROOM_UP for its digits and the "place here" arrow (target(): p.y - 30); the
           table gives up size before that room. The end lines run from just above the row down to the floor. */
        const TOPY = 0.17, ROOM_UP = 58, DOWN = 10;
        const fr = (f1 - f0) / N, GAP_B = 38, OFF_MAX = 40, LEFT_MIN = 170, M = 8, RIGHT = W + 18;
        const boxW = ow => K.toyboxGeom(N, ow * fr, BOX_COLS, true).w + 12;   // + the front rim's 6px each side
        /* [robot gap] review 2026-10-05: "why is there no space between the table and the robot?" - the robot stands beside
           Swifty, the table was centred regardless, and its front-left foot met the robot. The table centres only where that
           leaves ROBOT_GAP of floor between them, else it moves right - and gives up size only if it would leave the card. */
        const mascot = document.querySelector("#slideHost .tut-mascot"), mR = mascot && mascot.getBoundingClientRect();
        const rbX = mR && mR.width > 20 ? (mR.right - sR.left) / kS + 4 : 114, ROBOT_GAP = 36;
        const place = ow => ROBOT ? Math.max((W - ow) / 2, rbX + K.robotGeom(N, ow * fr).w + ROBOT_GAP) : Math.min((W - ow) / 2, RIGHT - boxW(ow) - GAP_B - ow);
        OW = Math.min(d.obj.w || 400, (avail - 2 - M - ROOM_UP - DOWN) / (ar * (1 - TOPY) + fr), K.CUBE / fr);   // its cube: the game's one size
        while(OW > 240 && (ROBOT ? place(OW) + OW > W - 8 : ((W - OW) / 2 - place(OW) > OFF_MAX || place(OW) < LEFT_MIN))) OW -= 4;
        OH = OW * ar; S = OW * fr; OX = place(OW);
        const UP = ROOM_UP + S - TOPY * OH;                                  // how far the row + its digits rise above the picture
        OY = UP + Math.max(0, (avail - M - UP - OH - DOWN) / 2);
        A0 = OX + OW * f0; A1 = OX + OW * f1;
        const RY = OY + OH * TOPY - S; slotXY = k => ({ x: A0 + k * S, y: RY });
        /* [short lines] review 2026-10-05: "reduce the dotted line length" - from just above the row to the bottom of the
           top's front band (0.27 of the picture), not down to the floor (endLines stops a line 50px above s1) */
        lines = K.endLines(scene, "x", A0, A1, RY - 10, OY + OH * 0.27 + 16 + 50);   // (+16: one dash below the band, review 2026-10-05)
        const under = OY + OH * 0.43, room = OY + OH * 0.82 - under;           // between the legs, below the apron
        plateH = Math.max(48, Math.min(PLATE_H - 2, room - 4));
        plateAt = { cx: (A0 + A1) / 2, y: under + (room - plateH) / 2 };
        boxAt = { x: A1 + GAP_B + 6, y: OY + OH + 6 - K.toyboxGeom(N, S, BOX_COLS, true).h };   // on the floor, level with the front feet
        floorY = OY + OH * 0.84;                                             // above where the back legs end
      } else {                                                               // T3: the door, the column beside it (on its right)
        const cR0 = card ? card.getBoundingClientRect() : null;
        const bottom = cR0 ? (cR0.bottom - sR.top) / kS - 10 - 8 : avail, navL = (navR.left - sR.left) / kS, navRt = (navR.right - sR.left) / kS;
        // the game's cube (MDK.CUBE) - but N of them stand as tall as the door, so here it is as big as the height allows.
        // The rack's badge pops over the rack, so the floor band under the door (FLOOR) no longer holds a plate.
        const FLOOR = PAINTING || ROBOT ? 4 : PLATE_H;                               // (4, was 24: more room for the door's 9 cubes - review 2026-10-06)
        S = Math.min(K.CUBE, (bottom - 6 - FLOOR) * (f1 - f0) / N); OH = N * S / (f1 - f0); OW = OH / ar;
        const gW = OW + 14 + S + 40;
        OX = Math.min(W - gW - 12, Math.max(navRt + 24, W * 0.62 - gW / 2)); OY = bottom - FLOOR - OH;
        /* [t3-left] review 2026-10-05: "place the dotted lines and cubes on the left side of the door - there is a lot of
           vacant space on the left". The column (and its digits, on its left now) stands left of the door; the door moves
           right by the column + its gap, into the room the column had on its right - so the group keeps its place and the
           column stays clear of आगे (the door used to start just 24px right of it). */
        const LEFT = 30 + S + 14;                                           // the digits, the column, the gap
        OX = Math.min(W - OW - 12, Math.max(OX + S + 14, navRt + 24 + LEFT) + 60);   // (+60: review 2026-10-05 "shift this door a little towards right" - the column + lines go with it)
        /* review 2026-10-06: "the next button should stay at the bottom center only, as in all screens" - so आगे is never moved
           (the 2026-10-05 navAside / centred-group layout is gone) and the group (digits + column + door) stands as far
           left as it can while clearing आगे: its digits start 16px right of the button. */
        OX = Math.min(W - OW - 12, navRt + 16 + LEFT) - 60;   // (-60: review 2026-10-06 "shift the door a little more towards left" - the column + lines go with it; agreed: when आगे appears at the end it covers the bottom cube's "1")
        A0 = OY + OH * f1; A1 = OY + OH * f0;                                // A0 = bottom, A1 = top
        const CX = OX - 14 - S; slotXY = k => ({ x: CX, y: A0 - (k + 1) * S });
        lines = K.endLines(scene, "y", A0, A1, CX - 10, OX + OW * 0.4);      // [short lines] the column + the door's left side
        plateAt = { cx: OX + (OW + 14 + S) / 2, y: A0 + 8 };
        if(PAINTING){                                                        // [t3-room] the painting hangs on the wall between Swiftie and the door
          const xL = 150, xR = OX - 44; paintMaxW = xR - xL; const G = K.paintingGeom(N, S, PCOLS, paintMaxW);
          boxAt = { x: xL + (paintMaxW - G.w) / 2, y: Math.max(G.hang + 4, (A0 - G.hang - G.h) * 0.42 + G.hang) };
          // the result pops where his erased cubes were (upper right, over the cloud) - he and his last cubes stay in view
          plateAt = { cx: boxAt.x + G.w * .74, y: boxAt.y + G.h * .22 };
        } else {
          const BG = K.toyboxGeom(N, S, BOX_COLS), bh = BG.h, bw = BG.w + 12;
          boxAt = { x: Math.max(250, Math.min(navL - bw - 30, W * 0.3 - bw / 2)), y: Math.min(A0 - bh - 4, (navR.top - sR.top) / kS - bh - 24) };
        }
        floorY = A0; avail = Math.max(avail, bottom);
      }
      if(ROBOT){                                                             // [robot] beside Swifty, on the floor
        const g = K.robotGeom(N, S), cRb = card ? card.getBoundingClientRect() : null, m = document.querySelector("#slideHost .tut-mascot");
        const mr = m && m.getBoundingClientRect().width > 20 ? (m.getBoundingClientRect().right - sR.left) / kS : 110;   // (T2's place() keeps the table clear of this spot)
        /* review 2026-10-05 ("on the floor, not between the floor and the wall"): its base half-way down the floor that shows
           - between the floor line (floorY, the card's --floor-top) and the card's inner bottom edge - at least 0.9 of a
           cube in front of the floor line where the floor is that deep (T2); on T3's shallow floor, at its front edge */
        const inner = cRb ? (cRb.bottom - sR.top) / kS - 10 : avail;
        const foot = Math.min(inner - 6, floorY + Math.max(S * 0.9, (inner - floorY) * 0.5));
        boxAt = { x: Math.max(0, mr + 4), y: foot - g.h };
      }
      scene.style.height = px(avail);
      if(card){ const cR = card.getBoundingClientRect(); card.style.setProperty("--floor-top", px((sR.top - cR.top) / kS - 10 + floorY - 10)); }   // (inside the 10px border)
      const obj = K.add(scene, "img", "md-obj", "left:" + px(OX) + ";top:" + px(OY) + ";width:" + px(OW) + ";height:" + px(OH)); obj.src = d.obj.src; obj.alt = "";
      if(!K.ground(scene, OX, OY, OW, OH, d.obj.feet, d.obj.ground_depth))   // [ground] its feet on the floor, else the old ellipse
        K.add(scene, "div", "md-shadow", AX === "x" ? "left:" + px(OX + OW * .04) + ";top:" + px(OY + OH - 14) + ";width:" + px(OW * .92)
                                                       : "left:" + px(OX - 6) + ";top:" + px(A0 - 13) + ";width:" + px(OW + 12));
      const slots = []; for(let k = 0; k < N; k++){ const p = slotXY(k); slots.push(K.add(scene, "div", "md-slot", "left:" + px(p.x) + ";top:" + px(p.y) + ";width:" + px(S) + ";height:" + px(S))); }
      if(d.obj.light){                                                       // the light under the door (its gap, as fractions)
        const [lx0, lx1, ly0] = d.obj.light, gy = OY + OH * ly0, gh = Math.max(3, OY + OH - gy);
        const lt = K.add(scene, "div", "md-doorlight", "left:" + px(OX + OW * lx0) + ";top:" + px(gy) + ";width:" + px(OW * (lx1 - lx0)) + ";height:" + px(gh));
        lt.style.setProperty("--spill", px(Math.max(40, (avail - (OY + OH)) * 0.9)));
      }
      /* data.spare (review 2026-10-01: "throughout the game in the cube boxes there can be left 1 or 2, sometimes no cubes
         in the basket"): the box holds N + spare blocks - the child stops at the end line, not when the box is empty, and
         the spare ones stay in it. (The painting keeps its own: the man is left holding one.) */
      const NB = N + (ROBOT ? 1 : PAINTING ? 0 : Math.max(0, d.spare | 0));   // (the robot: endless - one cube on its lid at a time, one left on it at the end)
      const box = ROBOT ? K.robot(scene, boxAt.x, boxAt.y, NB, S) : PAINTING ? K.wallPainting(scene, boxAt.x, boxAt.y, N, S, PCOLS, paintMaxW) : K.toybox(scene, boxAt.x, boxAt.y, NB, S, BOX_COLS, BOX_OPEN);
      const blocks = box.spots.map((p, j)=>{ const b = K.cube(scene, j, p.x, p.y, S, p.rot); b.style.zIndex = p.z != null ? p.z : 3 + Math.floor(j / BOX_COLS); b._z = b.style.zIndex; return b; });
      if(box.link) box.link(blocks);                                         // the painting: its cubes wait, unseen, on the painted ones
      /* data.robot_enter (T2, review 2026-10-07 "only after the 2 dotted lines come on both sides, show the robo mop
         entering, then the next explanation"): the robot, its lid's aura and its cubes wait unseen; once both end lines
         are up it drives in. Review 2026-10-07 ("he will enter sideways, his eyes seeing the table, then he will rotate in
         front ... only seen inside the game screen box", then "use this for the side-eye view" + "a better animation when
         he enters and when he rotates to show his front face"):
           drive - its profile (robot_side.webp, cube on board, eyes on the table) glides in from past the card's left
                   edge - smoothly, like a robot: no bumps, no tilts, no hops (review 2026-10-07: "it's kind of jumping,
                   which shouldn't happen, even when he is entering");
           look  - it stops, a beat with its eyes on the table;
           turn  - a quick spin in place to face the child (see "turn in place" below): smeared, swapped at the
                   smear's peak, settled sharp; its live eyes sweep from the far right to the middle; then a blink.
         While it moves the scene is clipped to the card's inner box (inside its 10px border, rounded corners): it never
         shows over the border or outside the card. */
      const rbParts = ROBOT && d.robot_enter ? [box.back, box.front, ...scene.querySelectorAll(".rb-aura"), ...blocks] : null;
      if(rbParts) rbParts.forEach(e => e.style.visibility = "hidden");
      const robotIn = async ()=>{
        if(!rbParts) return;
        if(reduce){ rbParts.forEach(e => e.style.visibility = ""); return; }
        const BD = 10, RAD = 24, sR2 = scene.getBoundingClientRect(), k = sR2.width / (scene.offsetWidth || 1) || 1;
        const cR = card ? card.getBoundingClientRect() : sR2, bd = card ? BD : 0;
        const clip = { t: (cR.top - sR2.top) / k + bd, r: (sR2.right - cR.right) / k + bd, b: (sR2.bottom - cR.bottom) / k + bd, l: (cR.left - sR2.left) / k + bd };
        scene.style.clipPath = "inset(" + px(clip.t) + " " + px(clip.r) + " " + px(clip.b) + " " + px(clip.l) + " round " + px(card ? RAD : 0) + ")";
        const back = box.back, side = back.querySelector(".rb-side"), body = back.querySelector(".rb-in");
        const lidParts = rbParts.filter(e => e !== back && e !== box.front);   // the cubes + the aura: shown as it faces us
        const dx = clip.l - box.w - 12 - boxAt.x;                            // starts just past the card's inner left edge
        const DRIVE = 2000, TURN = 950, PER = "perspective(" + px(box.w * 2.4) + ") ", ANG = 28;
        try{
          back.classList.add("profile"); box.face("look");
          back.style.visibility = box.front.style.visibility = "";
          /* ---- drive: one smooth glide ---- */
          await back.animate([{ translate: px(dx) + " 0" }, { translate: "0 0" }], { duration: DRIVE, easing: "cubic-bezier(.42,0,.3,1)" }).finished;
          if(!alive()) return;
          /* ---- look: a beat on the table ---- */
          await K.wait(500); if(!alive()) return;
          /* ---- turn in place: a quick spin ----
             review 2026-10-07 ("it was looking like a two-image transition"): the profile and the front view are two
             different drawings (other proportions, wheels, a painted cube) - cross-fading them showed both at once. Now
             it SPINS: the profile smears sideways (a horizontal motion blur, an SVG filter) and stretches toward the
             front view's height; at the peak of the smear it is swapped - one frame, no dissolve - for the front view,
             equally smeared, which settles back to sharp as its live eyes sweep from the far right to the child. Two
             swirl arcs whip round its base meanwhile, so the swap reads as one fast turn. The real cube (+ aura) comes
             in at the swap, smeared with it. */
          const SPIN = 1400, CUT = .42, BLUR = Math.max(6, box.w * .045);   // (1400, was 680 - review 2026-10-07: "just slow this part")
          const fid = "rbSmear" + Date.now(), NS = "http://www.w3.org/2000/svg";
          const fsvg = document.createElementNS(NS, "svg"); fsvg.setAttribute("width", "0"); fsvg.setAttribute("height", "0"); fsvg.style.position = "absolute";
          fsvg.innerHTML = '<filter id="' + fid + '" x="-25%" y="-10%" width="150%" height="120%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0"/></filter>';
          scene.appendChild(fsvg);
          const gb = fsvg.querySelector("feGaussianBlur"), cubes = lidParts.filter(e => e.classList.contains("md-block")), auras = lidParts.filter(e => !cubes.includes(e));
          const smeared = [back, ...cubes]; smeared.forEach(e => e.style.filter = "url(#" + fid + ")");
          /* the swirl: two arcs round the base, on the footprint's oval (in front of the robot, under its cube) */
          const sw = K.add(scene, "div", "rb-swirl", "left:" + px(boxAt.x - box.w * .12) + ";top:" + px(boxAt.y + box.h * .35) + ";width:" + px(box.w * 1.24) + ";height:" + px(box.h * .8));
          sw.style.zIndex = 7;
          sw.innerHTML = '<svg viewBox="0 0 124 50" preserveAspectRatio="none"><path d="M6 25 A56 20 0 0 0 118 25"/><path d="M118 25 A56 20 0 0 0 6 25"/></svg>';
          sw.querySelectorAll("path").forEach((pa, j) => pa.animate([{ strokeDashoffset: 120, opacity: 0 }, { opacity: .95, offset: .3 }, { opacity: .95, offset: .6 }, { strokeDashoffset: -120, opacity: 0 }],
                                                                     { duration: SPIN * .9, delay: SPIN * .08 + j * 40, easing: "cubic-bezier(.3,.2,.4,1)", fill: "both" }));
          const t0 = performance.now(); let cut = false;
          if(box.gaze) box.gaze({ x: 1.5, y: -.2 }, 1);                       // the live eyes wait where the profile's are
          side.style.transformOrigin = "50% 100%";
          await new Promise(res =>{
            (function step(t){
              if(!alive()) return res();
              const u = Math.min(1, (t - t0) / SPIN);
              const bl = u < CUT ? BLUR * Math.pow(u / CUT, 1.6) : BLUR * Math.pow(1 - (u - CUT) / (1 - CUT), 1.4);   // the smear, peaking at the swap
              gb.setAttribute("stdDeviation", bl.toFixed(2) + " " + (bl * .08).toFixed(2));
              if(u < CUT){ const q = u / CUT; side.style.transform = "scale(" + (1 - .04 * q) + "," + (1 + .09 * q) + ")"; }   // toward the front view's proportions
              else {
                if(!cut){ cut = true; back.classList.remove("profile"); side.style.transform = "";   // the swap: one frame
                  lidParts.forEach(e => e.style.visibility = ""); auras.forEach(e => e.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380 }));
                  if(box.gaze) box.gaze({ x: 0, y: 0 }, 280); }                  // the eyes sweep round to the child
                const q = (u - CUT) / (1 - CUT), e = 1 - Math.pow(1 - q, 3), y = .93 + .07 * e + .025 * Math.sin(Math.PI * e);
                body.style.transform = "scale(" + (.97 + .03 * e) + "," + y.toFixed(4) + ")";
              }
              if(u < 1) requestAnimationFrame(step); else res();
            })(t0);
          });
          smeared.forEach(e => e.style.filter = ""); body.style.transform = ""; side.style.transform = side.style.transformOrigin = "";
          fsvg.remove(); setTimeout(()=> sw.remove(), 200);
          if(!alive()) return;
          await K.wait(120); if(box.gaze) box.gaze(null); if(box.blink) box.blink();   // facing the child: a blink
          await K.wait(300);
        } finally { scene.style.clipPath = ""; if(box.gaze) box.gaze(null); }
      };
      box.front.style.zIndex = 3 + Math.ceil(NB / BOX_COLS);
      const hand = K.hand(scene, S);
      const say = role => new Promise(r => { const s = audioFor(slide, role); if(!s) return r(); play(s, r); });
      const sayNum = n => new Promise(r => play("assets/voiceover/vo_num_" + n + "." + AUDIO_EXT, r));
      const side = AX === "x" ? "top" : "left";                             // [t3-left] the column is left of the door: its digits on its left
      const lift = b =>{ b.classList.add("lift"); b.style.zIndex = 30; };
      const drop = b =>{ b.classList.remove("lift"); b.style.zIndex = b._placed ? 6 : b._z; };
      // a correct block: its number + a green outline on the block itself (review 2026-09-30: "I don't want a tick mark ...
      // it should be a green outline boundary around that cube") - the child's blocks get .ok in MDK.childMeasure
      const placeMark = (p, n)=>{ K.digit(scene, p, S, n, side); };
      async function handDrag(el, to){                                      // Swiftee's hand picks a block up and sets it down
        hand.on(K.pos(el)); await K.wait(320); guard();
        hand.press(); sfxTap(); lift(el); await K.wait(120);
        await K.glide(el, to, 900, true, hand); guard();
        drop(el); K.land(el); hand.up(); await K.wait(200); hand.off();
      }
      let phase = "demo", arrowEl = null;
      const target = n =>{ if(arrowEl){ arrowEl.remove(); arrowEl = null; } if(phase !== "child" || n >= N) return;
        const p = slotXY(n); arrowEl = AX === "x" ? K.arrow(scene, p.x + S / 2, p.y - 30, "down") : K.arrow(scene, p.x - 30, p.y + S / 2, "right"); };   // [t3-left] from the open side, pointing at the tile
      /* ---- the child's turn: MDK.childMeasure ---- */
      const run = K.childMeasure({ scene, slide, alive, blocks, slots, slotXY, S, hand, placed0: DEMO, idleMs: IDLE_MS, respawn: box.respawn,
        hints: { say: a => say(a === 1 ? "block_try" : a === 2 ? "block_hint" : "block_nudge") },   // the hint sheet's Drag & Drop ladder (MDK.childMeasure)
        onHit: (n, tile)=>{ placeMark(tile, n); target(n); if(box.react) box.react("happy"); if(box.settle) box.settle(blocks.filter(b => !b._placed)); return sayNum(n); },   // the box's pile settles
        onWrong: ()=>{ if(box.react) box.react("sad"); },                    // [robot] its face: hearts / closed eyes
        onIdle: ()=>{ if(box.look) box.look(true); }, onGrab: ()=>{ if(box.look) box.look(false); },   // [robot] watching while idle
        onAll: finish });
      /* the result, on the VO's word (review 2026-09-30: "when VO says 6 blocks the word should pop up, after that
         immediately the stars on the border rotate in inner direction to represent celebration"): the badge rises out
         of the box the moment the conclusion line says the count - d.count_at, that word's start in the clip (word
         timing of vo_p3_done / vo_p4_done) - and as it stands up its two stars spin inward (.cheer, CSS) */
      let plateEl = null;
      const cheer = ()=>{ if(!plateEl) return; plateEl.classList.remove("cheer"); void plateEl.offsetWidth; plateEl.classList.add("cheer"); };
      function finish(){
        phase = "done"; target(N);
        if(PAINTING && box.reveal){
          /* the painting's own ending (review 2026-10-01: "after that curtains will come and the painting will hide, and then
             5 blocks written with a crayon by a child will come"): a curtain drops over it, rises on blank paper, and the
             answer is written in crayon - instead of the badge. The line plays as the writing starts; confetti when done. */
          setSwMood("happy");
          box.reveal({ onWrite: ()=>{ if(alive()) play(audioFor(slide, "conclude") || null, ()=>{ if(alive()) setNavActive(true); }); } })
            .then(()=>{ if(!alive()) return; K.pose("cheer"); try{ confettiCannon(); }catch(e){} });
          return;
        }
        setSwMood("happy"); K.pose("cheer"); try{ confettiCannon(); }catch(e){}
        let pop = null;
        play(audioFor(slide, "conclude") || null, ()=>{ if(pop) pop(); if(alive()) setNavActive(true); });
        pop = K.atVoice(d.count_at, ()=>{
          if(!alive()) return;
          const txt = devNumeral(N) + " " + (d.unit_hi || "ब्लॉक्स");
          if(PAINTING){ const pw = Math.min(220, box.w * .5);                // pops up where his erased cubes were
            plateEl = K.plate(scene, txt, plateAt.cx, plateAt.y - pw / K.BADGE_AR / 2, pw); plateEl.style.zIndex = 20; }
          else if(!box.robot) plateEl = K.boxPlate(box, txt, blocks.filter(b => !b._placed));   // rises out of the box
          else if(AX === "x"){                                               // [robot] T2: slips down from under the tabletop (review 2026-10-07)
            const apron = OY + OH * .39, top = apron + 6;                     // (obj_table_measure.webp: top + apron solid to 0.39 of it, the back legs 0.163..0.833 apart)
            const h = Math.max(48, Math.min(72, OY + OH * .8 - top)), w = Math.min(220, OW * .6);
            plateEl = K.slipBox(scene, txt, (A0 + A1) / 2, top, w, h, apron - 2);
          } else {                                                           // [robot] T3: out of the light under the door
            const lt = scene.querySelector(".md-doorlight"), w = Math.min(220, OW * .92), cx = OX + OW / 2;
            if(lt && !reduce) lt.animate([{ filter: "brightness(1)" }, { filter: "brightness(1.9)", offset: .3 }, { filter: "brightness(1)" }], { duration: 900, easing: "ease-out" });
            plateEl = K.riseBox(scene, txt, cx, A0 - 2, w, 76, { x: cx, y: A0 - 4 });
          }
          setTimeout(()=>{ if(alive()) cheer(); }, reduce ? 0 : box.robot ? 1100 : 600);   // ~its peak: it stands, the stars spin (the robot's box: once it has settled, a pop)
        });
      }
      state.replayAudio = ()=>{
        if(phase === "child"){ run.cancelGhost(); say("child").then(()=>{ if(alive() && phase === "child") run.armIdle(); }); run.ghost(); }
        else if(phase === "done"){                                           // the line again - and the stars again, on its count
          let again = null;
          play(audioFor(slide, "conclude") || null, ()=>{ if(again) again(); if(alive()) setNavActive(true); });
          again = K.atVoice(d.count_at, ()=>{ if(alive()) cheer(); });
        }
      };
      /* ---- the script ---- */
      (async ()=>{
        try{
          const tp = document.querySelector("#slideHost .tut-prompt");
          requestAnimationFrame(()=> scene.classList.add("in"));             // the object + the toy box come in
          if(tp) tp.classList.add("speaking"); await say("prompt"); guard(); if(tp) tp.classList.remove("speaking");
          if(box.look) box.look(true);                                       // [robot] wide-eyed, watching the lesson (until the child's first grab)
          K.show(lines.start, true); await say("explain_a"); guard(); K.unpulse(lines.start);
          K.show(lines.end, true); await say("explain_b"); guard(); K.unpulse(lines.end);
          await robotIn(); guard(); if(box.look && rbParts) box.look(true);   // [robot_enter] in only now, then watching
          K.pose("guide"); await say("demo"); guard();
          for(let k = 0; k < DEMO; k++){                                     // एक... दो...
            await handDrag(blocks[k], slotXY(k)); guard();
            blocks[k]._placed = true; blocks[k].classList.add("placed"); drop(blocks[k]); K.okFlash(blocks[k]); placeMark(slotXY(k), k + 1);
            if(box.robot) box.settle();                                       // [robot] the next cube rises onto its lid (no face: only the child's drops get one)
            await sayNum(k + 1); guard();
          }
          // the rule: start where the last one ends ...
          const e0 = slotXY(DEMO), mark = AX === "x" ? K.add(scene, "div", "md-endmark v", "left:" + px(e0.x - 3) + ";top:" + px(e0.y - 10) + ";height:" + px(S + 20))
                                                     : K.add(scene, "div", "md-endmark h", "left:" + px(e0.x - 10) + ";top:" + px(e0.y + S - 3) + ";width:" + px(S + 20));
          await say("rule_a"); guard(); mark.classList.add("out"); setTimeout(()=> mark.remove(), 400);
          // ... no gap ... and not on top of each other
          const g = blocks[DEMO], GAP = S * 0.45;
          for(const kind of ["gap", "over"]){
            const v = say(kind === "gap" ? "rule_b" : "rule_c");
            const off = kind === "gap" ? GAP : -GAP;
            const to = AX === "x" ? { x: e0.x + off, y: e0.y } : { x: e0.x, y: e0.y - off };
            if(kind === "over") g.classList.add("over");
            await handDrag(g, to); guard();
            const bx = AX === "x" ? (kind === "gap" ? { l: e0.x + 2, t: e0.y - 8, w: GAP - 4, h: S + 16 } : { l: e0.x - GAP, t: e0.y - 8, w: GAP, h: S + 16 })
                                  : (kind === "gap" ? { l: e0.x - 8, t: e0.y + S - GAP + 2, w: S + 16, h: GAP - 4 } : { l: e0.x - 8, t: e0.y + S, w: S + 16, h: GAP });
            const boxEl = K.add(scene, "div", "md-err", "left:" + px(bx.l) + ";top:" + px(bx.t) + ";width:" + px(bx.w) + ";height:" + px(bx.h));
            /* review 2026-10-05: "the white outline will be on EACH dotted line": the dashes are drawn as SVG - each dash twice,
               a wider white one under the purple one (same dash pattern, round caps), so every dash has its own white edge */
            { const sw = 4, ins = 3.5, rw = Math.max(1, bx.w - 2 * ins), rh = Math.max(1, bx.h - 2 * ins), r = 8;
              const rect = 'x="' + ins + '" y="' + ins + '" width="' + rw + '" height="' + rh + '" rx="' + r + '" fill="none" stroke-linecap="round" stroke-dasharray="7 7"';
              boxEl.innerHTML = '<svg class="md-err-dash" width="' + bx.w + '" height="' + bx.h + '" viewBox="0 0 ' + bx.w + ' ' + bx.h + '" aria-hidden="true">' +
                '<rect ' + rect + ' stroke="#FFFFFF" stroke-width="' + (sw + 3.5) + '"/><rect ' + rect + ' stroke="#6D28D9" stroke-width="' + sw + '"/></svg>'; }
            const sp = K.freeSpot(scene, bx, 22, AX === "x" ? "up" : "left");   // clear of the bubbles, blocks, flag, door ... ([t3-left] the open side)
            const x = K.mark(scene, sp.x, sp.y, false);
            if(!reduce) g.animate([{ rotate: "0deg" }, { rotate: "-6deg" }, { rotate: "6deg" }, { rotate: "-4deg" }, { rotate: "0deg" }], { duration: 600, easing: "ease-in-out" });
            await v; guard(); await K.wait(1000); guard();
            boxEl.classList.add("out"); x.classList.add("out");
            if(box.respawn){ if(kind === "over") g.classList.remove("over"); await box.respawn(g); }   // [robot] it vanishes, a new one rises on the lid
            else await handDrag(g, g._home);
            guard(); boxEl.remove(); x.remove();
            if(kind === "over") g.classList.remove("over");
          }
          // the child's turn: the ghost drag shows how while the VO asks
          K.pose(null); phase = "child"; target(DEMO); run.start();
          const gh = run.ghost(); await say("child"); guard(); await gh; guard();
          run.armIdle();
        } catch(e){ if(e !== STOP) console.error("[MEASURE_DEMO]", e); }
      })();
    }
  },

  MEASURE_ASK: {
    /* G1 the bed, G2 the almirah, G2b the pillow, G3 the fridge - SME deck pages 5-7 (review 2026-09-30: "follow the
       ppt slides instructions"). The child MEASURES first, then answers:
         instruction OST + VO ... the object (its dashed end lines + flags), its tiles, the toy box. The child drags the
                                  blocks one by one (MDK.childMeasure): each correct drop stays; a gap / an overlap / off
                                  the row bounces back; idle 6s - the ghost drag from the box to the next tile
         then ................... every block stays; the OST becomes the question (data.ask_hi) and its VO plays
                                  (audio.ask); three options, "<k> ब्लॉक्स"
         a tap .................. correct - the card locks (green) + SFX + confetti + the correct VO, then on.
                                  HINTS = the FLN hint logic sheet, MCQ - 3 options (review 2026-09-30: "for the hint
                                  part follow the excel sheet, not the slides"):
                                  wrong #1 - the card shakes (red) and returns, nothing shown: audio.try_again ("फिर से
                                             सोचिए और विकल्पों को ध्यान से देखिए।");
                                  wrong #2 - it shakes; after a moment the right card glows softly: audio.hint ("चित्र को
                                             ध्यान से देखिए और सही उत्तर पहचानिए।");
                                  wrong #3 - (the sheet stops at 2) the right card is shown, its VO, on (never stuck).
                                  Laying the blocks: the sheet's Drag & Drop ladder (MDK.childMeasure).
       axis "x": the tiles in a row below the object; "y": a column beside it, from its foot up.
       data: { n, axis, obj:{src, ar, a0, a1}, s, ask_hi, options:[..], unit_hi }
       audio: prompt, ask, correct, try_again, hint, block_try, block_hint */
    mount(host, slide){
      const d = slide.data, N = d.n, AX = d.axis === "y" ? "y" : "x", K = MDK, px = K.px, reduce = K.reduce();
      state.ownsAudio = true; state.locked = false; setNavActive(false); $("navBtn").style.display = "none"; setSwMood("point");
      const scene = document.createElement("div"); scene.className = "md-stage mq"; host.appendChild(scene);
      const alive = ()=> CARD.slides[state.idx] === slide && scene.isConnected;
      const kS = scene.getBoundingClientRect().width / (scene.offsetWidth || 1) || 1;
      const W = scene.offsetWidth || 1033;
      let H = Math.max(420, host.getBoundingClientRect().height / kS - 6);
      /* data.fill "stage" (G2b, review 2026-10-01: "reduce the floor space"): the scene runs down to the stage's own bottom
         edge (14px clear) - the space kept for आगे, which this slide hides - so the whole group sits lower, the floor line
         (at the object's base) with it: less floor, more wall */
      if(d.fill === "stage"){ const stR = $("stage").getBoundingClientRect();
        H = Math.max(H, (stR.bottom - scene.getBoundingClientRect().top) / kS - 14); }
      scene.style.height = px(H);
      // (review 2026-10-07 "these boxes are really below - shift them up", "consistency in the game elements": the answers'
      //  row and everything laid above it sit 24px higher on every MEASURE_ASK screen - 100 -> 124; the cube stays 74)
      const OPT_H = 124, ar = d.obj.ar || 1, f0 = d.obj.a0 || 0, f1 = d.obj.a1 != null ? d.obj.a1 : 1;
      let S, OX, OY, OW, OH, A0, A1, slotXY, lines, boxAt;
      /* [centre] review 2026-10-01: "place all the main objects in the center" - the measured object is centred on the
         screen (it used to be the object + box group, which pushed the object aside); the box, the row / column and the
         flags go round it, and may use the stage's margin beyond the scene (ROOM_L / ROOM_R, less 10px) */
      const ST = (scene.closest(".slide-stage") || host).getBoundingClientRect(), SR0 = scene.getBoundingClientRect();
      const ROOM_L = Math.max(0, (SR0.left - ST.left) / kS - 10), ROOM_R = Math.max(0, (ST.right - SR0.right) / kS - 10);
      const FLAG = 44;                                                       // a flag's reach beyond its line
      /* the holder: the toy box, or (data.holder "basket", G1 - review 2026-10-01: "use this for better slide") the woven
         basket of the supplied mock-up (MDK.basket) */
      /* [robot] review 2026-10-05: the robot mop replaces every holder (data.keep_holder brings the old one back): on the
         floor at the bottom left of the screen (under Swifty's header circle), the measured object centred */
      const ROBOT = !d.keep_holder;
      const BASKET = !ROBOT && d.holder === "basket", ART = !ROBOT && ["laundry", "cloudtub", "wicker"].indexOf(d.holder) >= 0;   // [rooms] the other holders
      const hold = s_ => ROBOT ? K.robotGeom(N, s_) : BASKET ? K.basketGeom(N, s_) : ART ? K.holderGeom(N, s_, d.holder) : K.toyboxGeom(N, s_, 3);
      if(AX === "x"){
        const DROP = K.FLAG_LOW - 12;                                        // the flags below the row (the kit's FLAG_LOW)
        S = Math.min(K.CUBE, (H - OPT_H - 44 - DROP) / (N * ar / (f1 - f0) + 1));   // the game's one cube (MDK.CUBE)
        // ... or the width: half the object + the box beside it (a gap no smaller than the end flag) within the half-stage
        while(S > 24 && N * S / (f1 - f0) / 2 + FLAG + hold(S).w + 12 > W / 2 + ROOM_R) S -= 1;
        OW = N * S / (f1 - f0); OH = OW * ar;
        const boxW = hold(S).w + 12; OX = (W - OW) / 2; OY = Math.max(4, (H - OPT_H - 30 - OH - S - 14 - DROP) / 2);
        // on a backdrop's ground (data.bg, G1) the object and its row sit low, the row just above the answers' place
        if(d.bg) OY = Math.max(OY, H - OPT_H - 24 - DROP - (OH + 14 + S));
        const GAP = Math.max(FLAG, Math.min(60, W + ROOM_R - (OX + OW) - boxW));   // (review 2026-10-01: "the katiya is not at the
                                                                               //  center" - the object itself centred, never the group)
        A0 = OX + OW * f0; A1 = OX + OW * f1; const RY = OY + OH + 14; slotXY = k => ({ x: A0 + k * S, y: RY });
        lines = K.endLines(scene, "x", A0, A1, OY + OH * (d.line_top != null ? d.line_top : 0.45), RY + S + 16 + K.FLAG_LOW);   // data.line_top: where the lines start, a fraction down the object (G1, review 2026-10-06: "the dotted lines are very big - shorten them")   // (+16: one dash below the row)   // [short lines] the object's lower half + the row
        const bh = hold(S).h; boxAt = { x: OX + OW + GAP + (d.box_dx || 0), y: RY + S - bh + S * 0.3 };   // (data.box_dx: a nudge, px)
      } else {
        // the game's cube, unless the height can't take it - the height less 48px for the top line's flag, which stands ON
        // that line (it used to rise into the header and lose its cloth there)
        S = Math.min(K.CUBE, (H - OPT_H - 34 - 48) / N * (f1 - f0));                // the game's one cube (MDK.CUBE)
        const half = s_ => N * s_ / (f1 - f0) / ar / 2;                      // ... or the width: each side of the centred object
        /* [g-left] review 2026-10-05 (G2, G3: "same request" as T3 - the column and the dotted lines on the LEFT of the object,
           where the space is): the column stands left of the object, the robot left of the column - so the left half holds
           the object's half, the column, a gap and the robot; the right half only the object's half */
        while(S > 24 && (half(S) + FLAG > W / 2 + ROOM_R || half(S) + 14 + S + 32 + hold(S).w > W / 2 + ROOM_L)) S -= 1;
        OH = N * S / (f1 - f0); OW = OH / ar;
        const boxW = hold(S).w + 12; OX = (W - OW) / 2; OY = H - OPT_H - 22 - OH;
        const GAP = Math.max(40, Math.min(70, OX + ROOM_L - boxW));
        A0 = OY + OH * f1; A1 = OY + OH * f0; const CX = OX - 14 - S; slotXY = k => ({ x: CX, y: A0 - (k + 1) * S });   // [g-left]
        lines = K.endLines(scene, "y", A0, A1, CX - 10, OX + OW * 0.4);      // [short lines] the column + the object's left side
        const bh = hold(S).h; boxAt = { x: OX - GAP - boxW, y: A0 - bh + S * 0.3 };
      }
      /* [robot] review 2026-10-05: "reposition the robot on the floor with correct shadow - it looks like it is in between the
         floor and the wall": its base used to sit ON the object's base line, which here is where the wall meets the floor.
         Follow-up ("I don't see much change"): it now stands well IN FRONT of that line - its base half-way down the floor
         that shows below the floor line (the backdrop's --horizon, as set below), at least 0.9 of a cube in front of it.
         Only if it would then run into the answers' row (centred, ~200px cards 30px apart) does it stop just above it. */
      if(ROBOT){ const g = hold(S);
        const x = Math.min(-ROOM_L + 24, (AX === "y" ? OX - 14 - S - 24 : OX - 40) - g.w);   // [g-left] left of the column
        const hz = d.bg ? (AX === "x" && d.horizon !== "base" ? OY + OH * 0.52 : OY + OH - 6) : OY + OH;   // where the wall meets the floor
        let base = Math.min(H - 12, hz + Math.max(S * 0.9, (H - hz) * 0.5));
        const nO = d.options.length, optL = W / 2 - (nO * 200 + (nO - 1) * 30) / 2, optT = H - OPT_H + 8;
        if(x + g.w > optL - 12 && base > optT - 6) base = Math.max(hz + 14, optT - 6);
        boxAt = { x, y: base - g.h }; }
      const obj = K.add(scene, "img", "md-obj", "left:" + px(OX) + ";top:" + px(OY) + ";width:" + px(OW) + ";height:" + px(OH)); obj.src = d.obj.src; obj.alt = "";
      if(!K.ground(scene, OX, OY, OW, OH, d.obj.feet, d.obj.ground_depth))   // [ground] its feet on the floor, else the old ellipse
        K.add(scene, "div", "md-shadow", "left:" + px(OX + OW * .04) + ";top:" + px(OY + OH - 14) + ";width:" + px(OW * .92));
      const slots = []; for(let k = 0; k < N; k++){ const p = slotXY(k); slots.push(K.add(scene, "div", "md-slot", "left:" + px(p.x) + ";top:" + px(p.y) + ";width:" + px(S) + ";height:" + px(S))); }
      /* data.bg (G1 "yard"): the stage's plain two-tone backdrop (CSS .stage[data-bg]) - its wall meets the ground behind the
         object, half-way up it, in stage px (review 2026-10-01: "keep the background minimal only - non distracting,
         so that the main focus is on the main gameplay") */
      if(d.bg){ const st = $("stage"), stR = st.getBoundingClientRect(), kSt = stR.width / (st.offsetWidth || 1) || 1;
        st.style.setProperty("--horizon", px((SR0.top - stR.top) / kSt + (AX === "x" && d.horizon !== "base" ? OY + OH * 0.52 : OY + OH - 6))); }
      /* [night-window] data.window {src, x, y, w, h0, ar, moon, stars}: the room's window as its own layer (MDK.nightWindow), where
         the backdrop drew it: x, y, w in the backdrop's own px (its wall meets its floor at h0), shifted with the slide's
         --horizon as the backdrop is (stage y = y - h0 + horizon) */
      if(d.window && d.bg){ const st = $("stage"), stR = st.getBoundingClientRect(), kSt = stR.width / (st.offsetWidth || 1) || 1;
        const hz = parseFloat(st.style.getPropertyValue("--horizon")) || d.window.h0, ox = (SR0.left - stR.left) / kSt, oy = (SR0.top - stR.top) / kSt;
        K.nightWindow(scene, d.window.x - ox, d.window.y - d.window.h0 + hz - oy, d.window.w, d.window); }
      const NB = N + (ROBOT ? 1 : Math.max(0, d.spare | 0));                // data.spare: blocks left in the holder at the end (as MEASURE_DEMO); the robot: endless, one left on it
      const box = ROBOT ? K.robot(scene, boxAt.x, boxAt.y, NB, S) : BASKET ? K.basket(scene, boxAt.x, boxAt.y, NB, S) : ART ? K.holder(d.holder, scene, boxAt.x, boxAt.y, NB, S) : K.toybox(scene, boxAt.x, boxAt.y, NB, S, 3);
      /* [cal-wind] G2 (review 2026-10-01: "add a shadow to all three elements ... see perfect shadows on the objects"): one light,
         from the upper left and in front. The pink tub stands on the floor a little before the wall: its shadow on the floor
         under its feet, as the almirah's, a little to the right (its own filter gives the contact shadow and a faint one on
         the wall). data.calendar {w, top}: the wall calendar (MDK.calendar - its sheet in the flags' wind), centred
         over the holder, its top edge `top` x the object's height below the object's top. */
      if(ART){ const hg = hold(S); K.add(scene, "div", "md-shadow md-shadow-floor",
        "left:" + px(boxAt.x + hg.w * .03) + ";top:" + px(boxAt.y + hg.h - 17) + ";width:" + px(hg.w * 1.02)); }
      const blocks = box.spots.map((p, j)=>{ const b = K.cube(scene, j, p.x, p.y, S, p.rot); b.style.zIndex = p.z != null ? p.z : 3 + Math.floor(j / 3); b._z = b.style.zIndex; return b; });
      if(!BASKET && !ART && !ROBOT) box.front.style.zIndex = 3 + Math.ceil(NB / 3);  // (the basket and the other holders set their own)
      if(box.link) box.link(blocks);                                         // [robot] only the next cube shows, on its lid
      const hand = K.hand(scene, S);
      const say = role => new Promise(r => { const s = audioFor(slide, role); if(!s) return r(); play(s, r); });
      let phase = "measure";
      /* ---- measure ---- */
      const run = K.childMeasure({ scene, slide, alive, blocks, slots, slotXY, S, hand, idleMs: IDLE_MS, respawn: box.respawn,
        hints: { say: a => say(a === 1 ? "block_try" : a === 2 ? "block_hint" : "block_nudge") }, onAll: ask,
        onHit: ()=>{ if(box.react) box.react("happy"); if(box.settle) box.settle(blocks.filter(b => !b._placed)); },   // the holder's pile settles
        onWrong: ()=>{ if(box.react) box.react("sad"); },                   // [robot] its face: hearts / closed eyes
        onIdle: ()=>{ if(box.look) box.look(true); }, onGrab: ()=>{ if(box.look) box.look(false); } });   // [robot] watching while idle
      /* ---- ask ---- */
      const opts = K.add(scene, "div", "mq-opts", "top:" + px(H - OPT_H + 8));
      const optEls = d.options.map(v =>{ const o = K.add(opts, "button", "mq-opt"); o.type = "button"; o.textContent = devNumeral(v) + " " + (d.unit_hi || "ब्लॉक्स"); o._v = v; return o; });
      const right = optEls.find(o => o._v === N);
      let wrong = 0, busy = false;
      function ask(){
        phase = "ask"; run.stop();
        // an empty holder fades away; one with spare blocks left in it stays (they were not needed)
        if(!ROBOT && !blocks.some(b => !b._placed)){ box.back.classList.add("empty"); box.front.classList.add("empty"); }   // (the robot stays)
        $("promptText").textContent = d.ask_hi || slide.prompt_hi;
        opts.classList.add("in"); busy = true;
        say("ask").then(()=>{ busy = false; armAskIdle(); });
      }
      async function onWrong(o){
        wrong++; busy = true;
        try{ XAPI.send("question_answered", { slide_id: slide.id, type: slide.type, phase: slide.phase }, { is_correct: false, attempt: wrong, score: 0 }); }catch(e){}
        GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: wrong });
        sfxWrongSoft(); setSwMood("tryagain");
        o.classList.add("wrong"); K.shake(o, 9); setTimeout(()=> o.classList.remove("wrong"), 900);   // wiggles and returns
        /* QA checklist 2026-10-05 - THREE layers of feedback for a wrong answer:
           1 ... clarification: think again, look at the options (audio.try_again)
           2 ... a strong hint - the procedure: count the blocks laid, that many blocks is its length (audio.hint)
           3 ... the visual nudge: the wrong cards lock (faded, untappable), the right one glows and the hand points at
                 it (audio.nudge) - the child still taps it themselves */
        if(wrong === 1){ await say("try_again"); }
        else if(wrong === 2){ await say("hint"); }
        else { lockToRight(); await say("nudge"); }
        if(alive() && !state.locked){ busy = false; setSwMood("point"); armAskIdle(); }
      }
      function lockToRight(){
        optEls.forEach(x =>{ if(x !== right){ x.classList.add("faded", "locked"); x.disabled = true; } });
        right.classList.add("hint-on"); K.softGlow(right);
        setTimeout(()=>{ if(alive() && !state.locked) placeNudge(right); }, 300);
      }
      /* an idle child in the question (7s, QA checklist 2026-10-05): the question is asked again - and on the third
         layer, the hand returns to the right card */
      let askIdleT = 0;
      function armAskIdle(){ clearTimeout(askIdleT); askIdleT = setTimeout(()=>{
        if(!alive() || phase !== "ask" || busy || state.locked) return;
        if(right.classList.contains("hint-on")) placeNudge(right);
        busy = true; say("ask").then(()=>{ if(alive() && !state.locked){ busy = false; armAskIdle(); } });
      }, IDLE_MS); }
      function onRight(o, revealed){
        state.locked = true; busy = true; stopNudge(); clearTimeout(askIdleT);
        o.classList.remove("hint-on"); o.classList.add("correct");
        // review 2026-10-06 (one behaviour on every answer screen, as T1 / G4 / P1): the other cards dim, always
        optEls.forEach(x =>{ if(x !== o) x.classList.add("faded"); });
        try{ XAPI.send("question_answered", { slide_id: slide.id, type: slide.type, phase: slide.phase }, { is_correct: true, attempt: wrong + 1, score: wrong === 0 ? 1 : 0 }); }catch(e){}
        recordResult(slide, wrong === 0 && !revealed);
        const sig = (slide.signals && slide.signals.on_complete && slide.signals.on_complete[0]) || "cardinality_first_try";
        GameBus.emit(sig, { slide_id: slide.id, phase: slide.phase, value: wrong === 0 && !revealed, first_try: wrong === 0, attempts: wrong + 1, latency_ms: Date.now() - state.slideStart });
        if(!revealed){ sfxCorrect(); try{ confettiCannon(); }catch(e){} setSwMood("happy"); }
        say("correct").then(()=> setTimeout(()=>{ if(alive()) completeSlide(!revealed); }, 500));
      }
      function reveal(){ GameBus.emit("answer_revealed", { slide_id: slide.id, phase: slide.phase, attempts: wrong, reason: "wrong" });
        optEls.forEach(x =>{ if(x !== right) x.classList.add("faded"); }); onRight(right, true); }
      optEls.forEach(o => o.addEventListener("click", ()=>{
        if(phase !== "ask" || busy || state.locked || !alive() || o.classList.contains("locked")) return; stopNudge(); clearTimeout(askIdleT);
        if(o === right) onRight(o, false); else onWrong(o);
      }));
      state.replayAudio = ()=>{ if(phase === "measure"){ say("prompt"); run.ghost(); } else if(!busy) say("ask"); };
      /* ---- go ---- */
      requestAnimationFrame(()=>{ scene.classList.add("in"); K.show(lines.start); K.show(lines.end); });
      say("prompt").then(()=>{ if(alive() && phase === "measure") run.armIdle(); });
      run.start();
    }
  },

  COMPARE_MEASURED: {
    /* G4 the mats, P1 the chairs - SME deck pages 8-9 (review 2026-09-30: "follow the ppt slides instructions"). Two
       objects side by side, each ALREADY measured: its blocks laid flush along it, from one end to the other (no
       numbers yet). The child taps the longer / taller one.
         correct ...... it lights up (green glow) + SFX + confetti; "<k> ब्लॉक्स" below (a row) / beside (a column) each
                        one - why it is longer; the correct VO; then on
         HINTS = the FLN hint logic sheet, MCQ - 2 options (review 2026-09-30: "for the hint part follow the excel sheet,
         not the slides"):
         wrong #1 ..... the tapped one shakes and returns, nothing shown: audio.try_again ("दोनों विकल्पों को ध्यान से
                        देखिए और सोचिए।")
         wrong #2 ..... it shakes; after a moment the right one glows softly: audio.hint ("ध्यान से देखिए और सही विकल्प
                        चुनिए।")
         wrong #3 ..... (the sheet stops at 2) the right one is shown, its counts + VO, on (never stuck)
       axis "x" (the mats): each n·S long, its row of blocks under it, both rows on one line. axis "y" (the chairs):
       each n·S tall on one floor, its column of blocks beside it. data: { axis, s, unit_hi, items:[{src, ar, n,
       correct}] } (items in the deck's order - its "first" and "second"). audio: prompt, correct, try_again, hint. */
    mount(host, slide){
      const d = slide.data, AX = d.axis === "y" ? "y" : "x", K = MDK, px = K.px, reduce = K.reduce();
      state.ownsAudio = true; state.locked = false; setNavActive(false); $("navBtn").style.display = "none"; setSwMood("point");
      const scene = document.createElement("div"); scene.className = "md-stage cm cm-" + AX; host.appendChild(scene);
      const alive = ()=> CARD.slides[state.idx] === slide && scene.isConnected;
      const kS = scene.getBoundingClientRect().width / (scene.offsetWidth || 1) || 1;
      const W = scene.offsetWidth || 1033, H = Math.max(420, host.getBoundingClientRect().height / kS - 6); scene.style.height = px(H);
      // Tighter secondary spacing gives the compared objects and their block rulers
      // more of the stage without changing any measurement or answer logic.
      const items = d.items, unit = d.unit_hi || "ब्लॉक्स", GAP = 56, PW = 148, PH = Math.round(PW / MDK.BADGE_AR), NUM = 44, CG = 10;
      /* the block size: the two (plus, for columns, their digits and count plates) across the width; the taller one
         (plus, for rows, its blocks, the digits and the plate) down the height */
      // data.zoom (P1 only, review 2026-10-07: "zoom in this screen a bit" - chosen knowing its cubes then differ from the
      // other screens' 74px): the slide's cube, objects and riders scale together; the fit rules below still cap it
      let S = MDK.CUBE * (d.zoom || 1);                                      // the game's one cube, as far as the two fit
      if(AX === "x") S = Math.min(S, (W - GAP - 40) / items.reduce((a, it)=> a + it.n, 0),
                                     (H - 24 - 8 - NUM - PH) / (Math.max(...items.map(it => it.n * it.ar)) + 1));
      else S = Math.min(S, (H - 40) / Math.max(...items.map(it => it.n)),
                           (W - GAP - 40 - items.length * (CG + 36 + PW)) / items.reduce((a, it)=> a + it.n / it.ar + 1, 0));
      const geo = items.map(it => AX === "x" ? { w: it.n * S, h: it.n * S * it.ar } : { w: it.n * S / it.ar, h: it.n * S });
      const gw = g => AX === "x" ? g.w : g.w + CG + S + 36 + PW;
      // [centre] the objects (and their columns) centred - not with the space kept for the last one's count plate
      let x = (W - geo.reduce((a, g)=> a + gw(g), 0) - GAP * (items.length - 1) + (AX === "x" ? 0 : 36 + PW)) / 2;
      const maxH = Math.max(...geo.map(g => g.h));
      const base = AX === "x" ? (H - (maxH + 8 + S + NUM + PH)) / 2 + maxH     // the mats' lower edge (their rows under it)
                              : H - 30;                                        // the floor the chairs stand on
      /* [rooms] a slide's backdrop (data.bg, CSS #stage[data-bg]): the line where its wall meets the floor, in stage px -
         the chairs' floor; for the mats (seen from above, lying on it) the floor fills the scene: its far edge above them */
      if(d.bg){ const st = $("stage"), stR = st.getBoundingClientRect(), kSt = stR.width / (st.offsetWidth || 1) || 1;
        const sTop = (scene.getBoundingClientRect().top - stR.top) / kSt;
        st.style.setProperty("--horizon", px(sTop + (AX === "x" ? base - maxH - 22 : base - 8))); }
      /* the riders (P1, review 2026-10-01: "add cat and turtle only on the chair - cat a little big and turtle small, non
         distracting" + "add small motion in these 2"): an animal on an object's seat, over it - data.riders [{ src, ar,
         w (its width, in blocks - so its size is the same on either chair), motion ("breathe" / "bob", CSS [rider]) }],
         one on each item.seat { cx (its centre across the object), y (where its lowest point rests, a fraction down it) };
         in order, or (data.riders_random, review 2026-10-01: "the event should stay random - sometimes the turtle on the
         long chair, sometimes the short one, same for the cat") shuffled each time the slide opens. It drops in with its
         object, shakes and dims with it. */
      /* (review 2026-10-05: the turtle is gone, the cat rides alone - so the SEATS are shuffled, not the riders, or one
         rider would always sit on the first chair) */
      const seats = items.filter(it => it.seat), riders = (d.riders || []).slice(0, seats.length);
      if(d.riders_random) for(let i = seats.length - 1; i > 0; i--){ const j = (Math.random() * (i + 1)) | 0; [seats[i], seats[j]] = [seats[j], seats[i]]; }
      const riderOn = new Map(seats.map((it, i)=> [it, riders[i]]));
      let shade = 0;
      const els = items.map((it, i)=>{
        const g = geo[i], ox = x, oy = base - g.h, e = { it, blocks: [] };
        const gnd = K.ground(scene, ox, oy, g.w, g.h, it.feet, it.ground_depth);   // [ground] its feet on the floor
        if(AX === "y" && !gnd) K.add(scene, "div", "md-shadow", "left:" + px(ox + g.w * .02) + ";top:" + px(base - 13) + ";width:" + px(g.w + CG + S));
        e.img = K.add(scene, "img", "md-obj cm-obj" + (it.ground === "flat" ? " gnd-flat" : ""), "left:" + px(ox) + ";top:" + px(oy) + ";width:" + px(g.w) + ";height:" + px(g.h));
        e.img.src = it.src; e.img.alt = "";
        const R = riderOn.get(it);
        if(R){ const st = it.seat, rw = S * R.w, rh = rw * (R.ar || 1);
          e.rider = K.add(scene, "div", "cm-rider", "left:" + px(ox + g.w * (st.cx != null ? st.cx : .5) - rw / 2) + ";top:" + px(oy + g.h * st.y - rh) + ";width:" + px(rw) + ";height:" + px(rh));
          const art = K.add(e.rider, "img", "cm-rider-art" + (R.motion ? " " + R.motion : "")); art.src = R.src; art.alt = ""; }
        for(let k = 0; k < it.n; k++){
          const p = AX === "x" ? { x: ox + k * S, y: base + 8 } : { x: ox + g.w + CG, y: base - (k + 1) * S };
          const b = K.cube(scene, shade++, p.x, p.y, S); b.classList.add("placed"); b.style.zIndex = 4; e.blocks.push(b);
        }
        /* one tap area over the object and its blocks */
        e.hit = K.add(scene, "div", "cm-hit", AX === "x"
          ? "left:" + px(ox - 8) + ";top:" + px(oy - 8) + ";width:" + px(g.w + 16) + ";height:" + px(g.h + 8 + S + 16)
          : "left:" + px(ox - 8) + ";top:" + px(Math.min(oy, base - it.n * S) - 8) + ";width:" + px(g.w + CG + S + 16) + ";height:" + px(Math.max(g.h, it.n * S) + 16));
        e.hit.setAttribute("role", "button");
        e.plateAt = AX === "x" ? { cx: ox + g.w / 2, y: base + 8 + S + NUM } : { cx: ox + g.w + CG + S + 36 + PW / 2, y: base - it.n * S / 2 - PH / 2 };
        x += gw(g) + GAP;
        return e;
      });
      const right = els.find(e => e.it.correct) || els[els.length - 1];
      const say = role => new Promise(r => { const s = audioFor(slide, role); if(!s) return r(); play(s, r); });
      let wrong = 0, busy = true;
      function onRight(e, revealed){
        state.locked = true; busy = true; stopNudge(); clearTimeout(idleT);
        e.img.classList.add("cm-right"); els.forEach(o =>{ if(o !== e){ o.img.classList.add("cm-dim"); if(o.rider) o.rider.classList.add("cm-dim"); } });
        e.blocks.forEach(b => b.classList.add("glow"));
        try{ XAPI.send("question_answered", { slide_id: slide.id, type: slide.type, phase: slide.phase }, { is_correct: true, attempt: wrong + 1, score: wrong === 0 ? 1 : 0 }); }catch(e2){}
        recordResult(slide, wrong === 0 && !revealed);
        const sig = (slide.signals && slide.signals.on_complete && slide.signals.on_complete[0]) || "compare_correct";
        GameBus.emit(sig, { slide_id: slide.id, phase: slide.phase, value: wrong === 0 && !revealed, first_try: wrong === 0, attempts: wrong + 1, latency_ms: Date.now() - state.slideStart });
        if(!revealed){ sfxCorrect(); try{ confettiCannon(); }catch(e2){} setSwMood("happy"); }
        els.forEach((o, i)=> setTimeout(()=>{
          if(!alive()) return; const txt = devNumeral(o.it.n) + " " + unit;
          if(d.count_box === "card"){                                       // G4: the reference game's answer card (CSS [count-card])
            const c = K.add(scene, "div", "cm-count" + (o === e ? " ok" : ""), "left:" + px(o.plateAt.cx) + ";top:" + px(o.plateAt.y - 22));   // (nearer its row than the badge)
            c.textContent = txt; if(reduce){ c.style.opacity = 1; c.style.scale = 1; } else requestAnimationFrame(()=> c.classList.add("in"));
          } else K.plate(scene, txt, o.plateAt.cx, o.plateAt.y, PW);
        }, 250 + i * 350));
        say("correct").then(()=> setTimeout(()=>{ if(alive()) completeSlide(!revealed); }, 900));
      }
      async function onWrong(e){
        wrong++; busy = true;
        try{ XAPI.send("question_answered", { slide_id: slide.id, type: slide.type, phase: slide.phase }, { is_correct: false, attempt: wrong, score: 0 }); }catch(e2){}
        GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: wrong });
        sfxWrongSoft(); setSwMood("tryagain");
        K.shake(e.img, 10); if(e.rider) K.shake(e.rider, 10);                                      // wiggles and returns (its rider with it)
        /* QA checklist 2026-10-05 - three layers: 1 think again (audio.try_again); 2 the strong hint - count both rows,
           more blocks is longer (audio.hint); 3 the wrong one locks (dimmed, untappable), the right one glows and the
           hand points at it (audio.nudge) - the child still taps it */
        if(wrong === 1){ await K.wait(250); await say("try_again"); }
        else if(wrong === 2){ await K.wait(250); await say("hint"); }
        else {
          els.forEach(o =>{ if(o !== right){ o.locked = true; [o.img, o.rider].concat(o.blocks).forEach(x =>{ if(x) x.classList.add("cm-dim", "cm-locked"); }); } });
          K.softGlow(right.img, true); setTimeout(()=>{ if(alive() && !state.locked) placeNudge(right.hit); }, 300);
          await K.wait(250); await say("nudge");
        }
        if(alive() && !state.locked){ busy = false; setSwMood("point"); armIdle(); }
      }
      /* an idle child (7s, QA checklist 2026-10-05): the question again - on the third layer the hand comes back too */
      let idleT = 0;
      function armIdle(){ clearTimeout(idleT); idleT = setTimeout(()=>{
        if(!alive() || busy || state.locked) return;
        if(wrong >= 3) placeNudge(right.hit);
        busy = true; say("prompt").then(()=>{ if(alive() && !state.locked){ busy = false; armIdle(); } });
      }, IDLE_MS); }
      els.forEach(e => e.hit.addEventListener("click", ()=>{
        if(busy || state.locked || !alive() || e.locked) return; clearTimeout(idleT);
        if(e === right) onRight(e, false); else { stopNudge(); onWrong(e); }
      }));
      state.replayAudio = ()=>{ if(!busy) say("prompt"); };
      requestAnimationFrame(()=> scene.classList.add("in"));
      say("prompt").then(()=>{ if(alive() && !state.locked && !wrong){ busy = false; armIdle(); } });
      setTimeout(()=>{ if(alive() && busy && !state.locked && !wrong) busy = false; }, 1600);   // a tap may come while the question plays
    }
  },


  MATCH_ROWS: {
    /* P2, P3 - the SME's recommendations (2026-10-06, pages 10 + 11): "Show three objects on the left with blocks already
       placed ... on the right, three shuffled measurement boxes. The child matches each object with its correct measurement."
         setup ........ each object with its n blocks already laid flush - along its longer side (axis "x": on top of it)
                        or from the bottom up beside it (axis "y": its height) - the measured span's two ends dashed. The
                        objects are scaled so their blocks look plausible (one block size on the slide: it is the unit).
                        Three rows (or, when that gives the blocks more room - tall objects - three cards side by side);
                        the boxes, "<n> ब्लॉक्स", in the deck's shuffled order, in a column on the right.
         a match ...... the child drags a box onto an object. Right: it locks in beside / under that object (green), the
                        object's blocks flash green, a positive SFX. All three: confetti + audio.correct ("शाबाश! आपने सभी
                        चीज़ों को उनके सही माप से मिला दिया।"), on.
         wrong (counted per object - the one it was dropped on):
           1 .......... the box bounces back (the object wiggles) + audio.try_again
           2 .......... it bounces back, then that object's blocks light up one by one with their counting digits 1, 2,
                        3 ... (each one said - vo_num_k): the measure, counted
           3 on ....... it bounces back and the hand points at the right box for that object (it glows softly)
         idle 7s ...... the hand on the next box still to place (flow only).
       data: { unit_hi, bg, join, items:[{ id, src, n, axis, ar (h / w of the picture) }], boxes:[n, ...] (the shuffled order) }
       audio: prompt, correct, try_again. CSS [match rows].
       [lines] data.join "lines" (P2, P3 - review 2026-10-06: "change from drag and drop to match the following"): the
       objects stay as cards side by side, the shuffled boxes stand in a row under them, a dot on each card's foot and each
       box's head. The child joins an object to a box with a line - drags from either dot (or card / box) to the other
       side, or taps one then the other (HI01's pair games: a red flash for a wrong pair, never solved for the child).
       Right: the line stays, green. Wrong: the line flashes red and fades, the same ladder - the 3rd rung's hand travels
       from the object's dot to its box's dot (HI01 travelNudge) and loops until the next pair. */
    mount(host, slide){
      const d = slide.data, K = MDK, px = K.px, reduce = K.reduce();
      state.ownsAudio = true; state.locked = false; setNavActive(false); $("navBtn").style.display = "none"; setSwMood("point");
      const scene = document.createElement("div"); scene.className = "md-stage mr" + (d.join === "lines" ? " mr-wide" : ""); host.appendChild(scene);   // [lines] CSS .mr-wide
      const alive = ()=> CARD.slides[state.idx] === slide && scene.isConnected;
      const kS = scene.getBoundingClientRect().width / (scene.offsetWidth || 1) || 1;
      const W = scene.offsetWidth || 1033, stR = $("stage").getBoundingClientRect();
      const H = Math.max(420, (stR.bottom - scene.getBoundingClientRect().top) / kS - 14);   // down to the stage's bottom (no आगे here)
      scene.style.height = px(H);
      const unit = d.unit_hi || "ब्लॉक्स", TONES = ["yellow", "blue", "green"];
      const say = role => new Promise(r =>{ const s = audioFor(slide, role); if(!s) return r(); play(s, r); });
      const sayNum = n => new Promise(r => play("assets/voiceover/vo_num_" + n + "." + AUDIO_EXT, r));
      /* ---- layout ---- */
      // [lines] match the following in two COLUMNS (review 2026-10-07 "change the match the following horizontal lines to
      // vertical"): the objects stacked on the left, the boxes stacked on the right, the lines run across between them. The
      // stack has to fit the scene's height, so the cube is the largest that does - asked first, and chosen knowing it is
      // under the game's 74 here (~48 on both P2 and P3, the same: no column of three measured objects holds 74). Before, a row of cards over
      // a row of boxes (2026-10-06 - 07). A dot on each card's right edge and each box's left edge.
      const LINES = d.join === "lines", DOT = 21;                          // (21: the Figma connector, FLN "Match the following" 1162:29905)
      // a box; the panels' padding / gap; end-line overhang (12 / 10, was 16 / 14: P2's three rows hold the game's 44px cube).
      // [lines] review 2026-10-06 "increase the size of all 6 boxes": the boxes 196 x 76 -> 236 x 92
      const BW = LINES ? 236 : 196, BH = LINES ? 92 : 76, BG = 22, PAD = LINES ? 8 : 12, G = LINES ? 12 : 10, ENDS = 10;   // [lines] 8 / 12 (review 2026-10-07: the 3rd card sat on the stage's bottom edge)
      const LX = 8, LW = LINES ? W - 2 * LX : W - BW - 64 - LX;            // the objects' area (left); the boxes' column (right) - [lines] the whole width
      const items = d.items.map(it => Object.assign({ ar: 1, axis: "x" }, it));
      // an object + its blocks, for a block size S: w = wc * S, h = hc * S
      // it.span [f0, f1] (axis "y"): the part of the picture's height the blocks measure (default all of it) - review
      // 2026-10-07 "increase the size of monitor just a little": the monitor's 1 block is its screen (0 - .826), the stand below
      const spanOf = it => it.span ? it.span[1] - it.span[0] : 1;
      const coef = it => it.axis === "x" ? { wc: it.n, hc: it.n * it.ar + 1 } : { wc: it.n / (it.ar * spanOf(it)) + 1.2, hc: it.n / spanOf(it) };
      const rowH = (H - 2 * G) / 3;
      const S_rows = Math.min(...items.map(it =>{ const c = coef(it); return Math.min((LW - 2 * PAD - 2 * ENDS) / c.wc, (rowH - 2 * PAD - ENDS) / c.hc); }));
      const SLOT = BH + 18, cardH = H - SLOT - 6;
      const sumW = items.reduce((a, it)=> a + coef(it).wc, 0);
      const S_cols = Math.min((LW - 2 * G - items.length * 2 * (PAD + ENDS)) / sumW, ...items.map(it => (cardH - 2 * PAD - ENDS) / coef(it).hc));
      // [lines] the stack: the three objects' heights + each card's padding and end-line room + the gaps, 8px over and under
      // review 2026-10-07 "make the 6 boxes with images and cube of exactly the same size": every [lines] slide's card
      // (P2 and P3, all six) is one size - as tall as the tallest object of the two needs, as wide as the widest - so the
      // cube is the largest that lets three of those cards stand in the stack (P3 cut to 3 / 2 / 1 so it stays 48)
      const lineItems = [].concat(...CARD.slides.filter(s => s.type === "MATCH_ROWS" && s.data && s.data.join === "lines")
        .map(s => s.data.items), items).map(it => Object.assign({ ar: 1, axis: "x" }, it));
      const maxHc = Math.max(...lineItems.map(it => coef(it).hc)), nI = items.length;
      const S_stack = (H - 40 - G * (nI - 1) - nI * (2 * PAD + ENDS)) / (nI * maxHc);   // (40: ~20px clear over and under the stack; the cube stays 48)
      const ROWS = !LINES && S_rows >= S_cols, S = Math.min(K.CUBE, Math.floor(LINES ? S_stack : ROWS ? S_rows : S_cols));   // the game's one cube
      scene.classList.add(LINES ? "mr-stack" : ROWS ? "mr-rows" : "mr-cols");
      // each object's panel (scene px)
      let panels, boxX = W - BW - 26;
      if(LINES){
        // one card size for all six on P2 + P3 (the widest object's width, the tallest one's height - review 2026-10-07);
        // the cards, the lines' band (160 - 340) and the boxes centred across the scene
        const gwOf = it => it.axis === "x" ? it.n * S : S + 10 + it.n * S / (it.ar * spanOf(it));
        const cw = Math.max(...lineItems.map(gwOf)) + 2 * (PAD + ENDS), hs = items.map(()=> maxHc * S + 2 * PAD + ENDS);   // [same size] one card for all six
        const band = Math.max(160, Math.min(340, LW - cw - BW - 40)), x0 = LX + (LW - cw - band - BW) / 2;
        let y = (H - hs.reduce((a, h)=> a + h, 0) - G * (items.length - 1)) / 2;
        panels = hs.map(h =>{ const p = { x: x0, y, w: cw, h }; y += h + G; return p; });
        boxX = x0 + cw + band;
      }
      else if(ROWS) panels = items.map((it, i)=> ({ x: LX, y: i * (rowH + G), w: LW, h: rowH }));
      else {
        const ws = items.map(it => coef(it).wc * S + 2 * (PAD + ENDS)), free = LW - ws.reduce((a, b)=> a + b, 0) - G * (items.length - 1);
        let x = LX + Math.max(0, free / 2);
        // the cards as tall as their tallest object needs (not the whole height), the cards + their slots centred
        const ch = Math.min(cardH, Math.max(...items.map(it => coef(it).hc * S)) + 2 * PAD + ENDS + 20), cy = Math.max(0, (H - ch - SLOT) / 2);
        panels = ws.map(w =>{ const p = { x, y: cy, w, h: ch }; x += w + G; return p; });
      }
      // [lines] the boxes stacked in the right column, spread evenly over the cards' height
      const nB = d.boxes.length, T0 = panels[0].y, T1 = panels[panels.length - 1].y + panels[panels.length - 1].h;
      const homes = d.boxes.map((v, j)=> LINES ? { x: boxX, y: T0 + (j + .5) * (T1 - T0) / nB - BH / 2 }
                                      : ROWS ? { x: boxX, y: panels[j].y + (rowH - BH) / 2 }
                                            : { x: boxX, y: (H - 3 * BH - 2 * BG) / 2 + j * (BH + BG) });
      const slotOf = i => ROWS ? { x: boxX, y: panels[i].y + (rowH - BH) / 2 } : { x: panels[i].x + (panels[i].w - BW) / 2, y: panels[i].y + panels[i].h + 12 };
      /* ---- the objects, their blocks, the ends ---- */
      let shade = 0;
      const objs = items.map((it, i)=>{
        const P = panels[i], c = coef(it), e = { it, i, blocks: [], wrong: 0, done: false };
        e.panel = K.add(scene, "div", "mr-panel" + (LINES ? "" : " tone-" + TONES[i % 3]), "left:" + px(P.x) + ";top:" + px(P.y) + ";width:" + px(P.w) + ";height:" + px(P.h));
        if(!ROWS && !LINES) e.slotEl = K.add(scene, "div", "mr-slot", "left:" + px(slotOf(i).x) + ";top:" + px(slotOf(i).y) + ";width:" + px(BW) + ";height:" + px(BH));
        // the object + its blocks, centred in the panel (on its floor). [lines] review 2026-10-07 "place the assets in
        // center of respective boxes": in the middle of its card both ways, measured on what is drawn (blocks + object;
        // a column's group is S + 10 + the object's width, not the layout's wc estimate)
        const gw = LINES && it.axis !== "x" ? S + 10 + it.n * S / (it.ar * spanOf(it)) : c.wc * S, gh = c.hc * S;
        const gx = P.x + (P.w - gw) / 2, gy = ROWS ? P.y + (P.h - gh) / 2 + ENDS / 2 : LINES ? P.y + (P.h - gh) / 2 : P.y + P.h - PAD - gh;
        let ox, oy, ow, oh;
        if(it.axis === "x"){ ow = it.n * S; oh = ow * it.ar; ox = gx; oy = gy + S; }
        else { oh = it.n * S / spanOf(it); ow = oh / it.ar; ox = gx + S + 10; oy = gy; }
        const m0 = it.axis === "x" ? 0 : oy + oh * (it.span ? it.span[0] : 0), m1 = m0 + it.n * S;   // the measured span (y)
        e.img = K.add(scene, "img", "md-obj mr-obj", "left:" + px(ox) + ";top:" + px(oy) + ";width:" + px(ow) + ";height:" + px(oh));
        e.img.src = it.src; e.img.alt = "";
        e.tiles = [];
        for(let k = 0; k < it.n; k++){
          const t = it.axis === "x" ? { x: ox + k * S, y: oy - S } : { x: gx, y: m1 - (k + 1) * S };
          const b = K.cube(scene, shade++, t.x, t.y, S); b.classList.add("placed", "mr-cube"); b.style.zIndex = 4; e.blocks.push(b); e.tiles.push(t);
        }
        // the measured span's two ends, dashed (as the game's measuring slides)
        // (review 2026-10-06 "decrease the length of dotted lines": they ran the blocks' and the whole object's length and
        //  past both, nearly card edge to card edge - now the blocks plus a short reach into the object, 4px over)
        const TK = 4, IN = it.axis === "x" ? Math.min(oh, S * .45) : Math.min(ow, S * .45);
        if(it.axis === "x"){ [ox, ox + it.n * S].forEach(x => K.add(scene, "i", "mr-end v", "left:" + px(x - 3) + ";top:" + px(oy - S - TK) + ";height:" + px(S + IN + TK))); }
        else { [m1, m0].forEach(y => K.add(scene, "i", "mr-end h", "left:" + px(gx - TK) + ";top:" + px(y - 3) + ";width:" + px(S + 10 + IN + TK))); }
        e.side = it.axis === "x" ? "above" : "left";
        if(LINES){ e.dot = { x: P.x + P.w, y: P.y + P.h / 2 }; e.dotEl = K.add(scene, "i", "mr-dot l", "left:" + px(e.dot.x - DOT / 2) + ";top:" + px(e.dot.y - DOT / 2)); }
        return e;
      });
      /* ---- the boxes ---- */
      const boxes = d.boxes.map((v, j)=>{
        const b = K.add(scene, "div", "mr-box" + (LINES ? "" : " tone-" + ["green", "blue", "yellow"][j % 3]), "left:" + px(homes[j].x) + ";top:" + px(homes[j].y) + ";width:" + px(BW) + ";height:" + px(BH));
        b.textContent = devNumeral(v) + " " + (v === 1 ? "ब्लॉक" : unit); b._v = v; b._home = homes[j]; b._done = false; b.setAttribute("role", "button");
        if(LINES){ b.classList.add("mr-pin"); b._dot = { x: homes[j].x, y: homes[j].y + BH / 2 };
          b._dotEl = K.add(scene, "i", "mr-dot r", "left:" + px(b._dot.x - DOT / 2) + ";top:" + px(b._dot.y - DOT / 2)); }
        return b;
      });
      const rightBox = e => boxes.find(b => !b._done && b._v === e.it.n);
      const centre = b =>{ const p = K.pos(b); return { x: p.x + BW / 2, y: p.y + BH / 2 }; };
      const objAt = p => objs.find(e =>{ const P = panels[e.i]; return p.x >= P.x && p.x <= P.x + P.w && p.y >= P.y && p.y <= P.y + P.h; });
      let drag = null, busy = true, wrongAll = 0, matched = 0, idleT = 0, count = null;
      const home = (b, bounce)=> K.glide(b, b._home, reduce ? 0 : 380, true).then(()=>{ b.style.zIndex = "";
        if(bounce && !reduce && alive()) b.animate([{ translate: "0 -12px" }, { translate: "0 0" }, { translate: "0 -5px" }, { translate: "0 0" }], { duration: 380, easing: "ease-out" }); });
      // [lines] no idle hand (review 2026-10-07 "remove hand nudge from match the following" - the one-time demo shows the move)
      function armIdle(){ clearTimeout(idleT); if(LINES) return; idleT = setTimeout(()=>{
        if(!alive() || busy || drag || state.locked) return;
        const nb = boxes.find(b => !b._done); if(nb && placeNudge(nb)) state.nudgeUsed = true;
      }, IDLE_MS); }
      /* a right match: the box locks in beside (rows) / under (cards) its object; a box already standing in that place
         (rows) moves to the one this box came from */
      function lockIn(e, b){
        e.done = true; b._done = true; matched++; stopNudge(); b.classList.remove("hint");
        const to = slotOf(e.i), other = ROWS && boxes.find(x => x !== b && !x._done && Math.abs(x._home.x - to.x) < 1 && Math.abs(x._home.y - to.y) < 1);
        if(other){ other._home = b._home; K.glide(other, other._home, reduce ? 0 : 420, true); }
        b._home = to; b.style.zIndex = 12;
        return K.glide(b, to, reduce ? 0 : 220, false).then(()=>{
          if(!alive()) return;
          b.classList.add("ok"); e.panel.classList.add("ok"); if(e.slotEl) e.slotEl.classList.add("filled");
          e.blocks.forEach(x => K.okFlash(x)); sfxCorrect(); setSwMood("happy");
          GameBus.emit("match_correct", { slide_id: slide.id, phase: slide.phase, object: e.it.id, value: e.it.n, attempts: e.wrong + 1 });
          if(matched === objs.length) finish(); else { busy = false; armIdle(); }
        });
      }
      async function miss(e, b){
        const m = ++e.wrong; wrongAll++; busy = true; stopNudge();
        GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, object: e.it.id, box: b._v, attempts: m });
        sfxWrongSoft(); setSwMood("tryagain"); K.shake(e.panel, 8); K.shake(e.img, 8);
        await (LINES ? wrongLine(e, b) : home(b, true)); if(!alive()) return;
        if(m === 1) await say("try_again");                                   // 1: bounced back
        else if(m === 2){                                                    // 2: its blocks counted, one by one, digits on
          if(count) count.forEach(x => x.remove()); count = [];
          for(let k = 0; k < e.blocks.length; k++){
            if(!alive()) return;
            e.blocks[k].classList.add("mr-counting"); count.push(K.digit(scene, e.tiles[k], S, k + 1, e.side));
            await sayNum(k + 1); e.blocks[k].classList.remove("mr-counting");
          }
        } else {                                                             // 3 on: the hand on its right box
          const rb = rightBox(e); if(rb){ rb.classList.add("hint"); K.softGlow(rb); if(LINES) e.panel.classList.add("hint"); else placeNudge(rb); }   // [lines] the card + box light up, no hand
        }
        if(alive() && !state.locked){ busy = false; setSwMood("point"); armIdle(); }
      }
      function finish(){
        state.locked = true; busy = true; stopNudge(); clearTimeout(idleT);
        const first = wrongAll === 0;
        try{ XAPI.send("question_answered", { slide_id: slide.id, type: slide.type, phase: slide.phase }, { is_correct: true, attempt: wrongAll + 1, score: first ? 1 : 0 }); }catch(e2){}
        recordResult(slide, first); setSwMood("happy");
        try{ confettiCannon(); }catch(e2){}
        setTimeout(()=>{ if(alive()) say("correct").then(()=> setTimeout(()=>{ if(alive()) completeSlide(true); }, 700)); }, 450);
      }
      /* ---- [lines] joining an object and a box with a line ---- */
      const NS = "http://www.w3.org/2000/svg";
      let svg = null, live = null, sel = null, down = null, travel = null, hov = null;
      if(LINES){ svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "mr-lines"); svg.setAttribute("viewBox", "0 0 " + W + " " + H);
        svg.setAttribute("width", W); svg.setAttribute("height", H); scene.appendChild(svg); }
      // a line = <g class="mr-ln">: the 3.5px stroke (Figma 2px, thickened a little - review 2026-10-07) and, at its far end, the handle dot (Figma "Arrow": r 5.33)
      const setLine = (g, a, b)=>{ const l = g._l, c = g._c; l.setAttribute("x1", a.x); l.setAttribute("y1", a.y); l.setAttribute("x2", b.x); l.setAttribute("y2", b.y);
        c.setAttribute("cx", b.x); c.setAttribute("cy", b.y); };
      const mkLine = (a, b, cls)=>{ const g = document.createElementNS(NS, "g"), l = document.createElementNS(NS, "line"), c = document.createElementNS(NS, "circle");
        g.setAttribute("class", "mr-ln " + (cls || "")); l.setAttribute("pathLength", "1"); c.setAttribute("r", "5.33");
        g.appendChild(l); g.appendChild(c); g._l = l; g._c = c; setLine(g, a, b); svg.appendChild(g); return g; };
      const near = (p, q, r)=> Math.hypot(p.x - q.x, p.y - q.y) < r;
      const hitAt = p =>{                                                    // an open card or box (or its dot) under p
        const inR = (x, y, w, h)=> p.x >= x - 6 && p.x <= x + w + 6 && p.y >= y - 6 && p.y <= y + h + 6;
        const e = objs.find(o => !o.done && (inR(panels[o.i].x, panels[o.i].y, panels[o.i].w, panels[o.i].h) || near(p, o.dot, 30)));
        if(e) return { kind: "obj", e, el: e.panel, dot: e.dot, dotEl: e.dotEl };
        const b = boxes.find(x => !x._done && (inR(x._home.x, x._home.y, BW, BH) || near(p, x._dot, 30)));
        return b ? { kind: "box", b, el: b, dot: b._dot, dotEl: b._dotEl } : null;
      };
      const hover = h =>{ if(hov) hov.el.classList.remove("hover"); hov = h; if(h) h.el.classList.add("hover"); };
      function pick(h){ unpick(); sel = h; h.el.classList.add("sel"); h.dotEl.classList.add("sel"); sfxTap(); }
      function unpick(){ if(live){ live.remove(); live = null; } if(!sel) return; sel.el.classList.remove("sel"); sel.dotEl.classList.remove("sel"); sel = null; }
      function stopTravel(){ if(travel){ travel.el.getAnimations().forEach(a => a.cancel()); travel.el.remove(); travel = null; } }
      function clearHelp(){ stopTravel(); stopNudge(); boxes.forEach(x => x.classList.remove("hint")); objs.forEach(o => o.panel.classList.remove("hint")); }
      // the 3rd-rung hand: from the box's dot up to its object's dot, again and again (the move itself, not just "this one").
      // It travels UP so it rests in the band between the rows - the engine's hand rule [QA 12]: never on a label (ending
      // on the box, its hand covered the box's "<n> ब्लॉक्स"); a line may start from either side, so it is the same move.
      function travelHand(a, b){
        stopTravel(); travel = K.hand(scene, 0); travel.on(reduce ? b : a);   // (reduced motion: the hand waits at the end)
        const dx = b.x - a.x, dy = b.y - a.y, at = (x, y, o, f)=> ({ translate: x + "px " + y + "px", opacity: o, offset: f });
        if(!reduce) travel.el.animate([at(0, 0, 0, 0), at(0, 0, 1, .06), at(dx, dy, 1, .6), at(dx, dy, 1, .88), at(dx, dy, 0, 1)],
                                      { duration: 2000, iterations: Infinity, easing: "ease-in-out" });
      }
      function pairUp(a, h){
        const e = a.kind === "obj" ? a.e : h.e, b = a.kind === "box" ? a.b : h.b;
        unpick(); hover(null); clearHelp();
        if(e.it.n === b._v) lockLine(e, b); else miss(e, b);
      }
      // (review 2026-10-07 "if I connect with correct or wrong one, the line again comes from right to left and gets
      //  connected - this should not happen": the child's own line is already there, so the kept / red line just takes
      //  its place, colour only - no "draw" re-animation)
      function lockLine(e, b){
        e.done = true; b._done = true; matched++; busy = true;
        mkLine(e.dot, b._dot, "ok"); e.dotEl.classList.add("ok"); b._dotEl.classList.add("ok");
        // (review 2026-10-07 "after correct match the cubes should not show green outline": the card, the line and the box
        //  turn green - the cubes stay as they are, no okFlash)
        b.classList.add("ok"); e.panel.classList.add("ok"); sfxCorrect(); setSwMood("happy");
        GameBus.emit("match_correct", { slide_id: slide.id, phase: slide.phase, object: e.it.id, value: e.it.n, attempts: e.wrong + 1 });
        if(matched === objs.length) finish(); else { busy = false; armIdle(); }
      }
      // a wrong pair: the line is drawn red, both ends flash red, then it fades (red first, always - HI01 28r)
      const wrongLine = (e, b)=> new Promise(r =>{
        const ends = [b, e.panel, e.dotEl, b._dotEl];                       // (Figma frame 5: both cards, both dots, the line red)
        const l = mkLine(e.dot, b._dot, "no"); ends.forEach(x => x.classList.add("no")); K.shake(b, 8);
        setTimeout(()=>{ l.classList.add("gone"); ends.forEach(x => x.classList.remove("no")); setTimeout(()=>{ l.remove(); r(); }, 320); }, reduce ? 500 : 750);
      });
      if(LINES){
        scene.addEventListener("pointerdown", ev =>{
          stopDemo(); touched = true;                                        // (a child who has started never gets the demo)
          if(!alive() || busy || state.locked) return;
          const p = K.local(scene, ev), h = hitAt(p);
          if(!h){ unpick(); return; }
          ev.preventDefault(); stopNudge(); clearTimeout(idleT);
          if(sel && sel.kind !== h.kind){ pairUp(sel, h); return; }         // the 2nd tap, on the other side
          pick(h); down = { id: ev.pointerId, p };
          try{ scene.setPointerCapture(ev.pointerId); }catch(e2){}
          live = mkLine(h.dot, h.dot, "live");
        });
        scene.addEventListener("pointermove", ev =>{
          if(!down || ev.pointerId !== down.id || !sel || !live) return;
          const p = K.local(scene, ev), h = hitAt(p); setLine(live, sel.dot, p); hover(h && h.kind !== sel.kind ? h : null);
        });
        const lineUp = ev =>{
          if(!down || ev.pointerId !== down.id) return;
          const p = K.local(scene, ev), moved = !near(p, down.p, 14), h = hitAt(p); down = null; hover(null);
          if(sel && h && h.kind !== sel.kind){ pairUp(sel, h); return; }    // dragged onto the other side
          if(live){ live.remove(); live = null; }
          if(moved) unpick();                                                // dragged into nothing: let go
          armIdle();
        };
        scene.addEventListener("pointerup", lineUp); scene.addEventListener("pointercancel", lineUp);
      }
      if(!LINES) boxes.forEach(b =>{
        b.addEventListener("pointerdown", ev =>{
          if(!alive() || busy || b._done || drag || state.locked) return;
          ev.preventDefault(); stopNudge(); clearTimeout(idleT);
          const p = K.local(scene, ev), bp = K.pos(b);
          drag = { b, id: ev.pointerId, ox: p.x - bp.x, oy: p.y - bp.y, moved: false };
          try{ b.setPointerCapture(ev.pointerId); }catch(e2){}
          b.classList.add("lift"); b.style.zIndex = 30; sfxTap();
        });
        b.addEventListener("pointermove", ev =>{
          if(!drag || drag.b !== b || ev.pointerId !== drag.id) return;
          const p = K.local(scene, ev); K.setPos(b, { x: p.x - drag.ox, y: p.y - drag.oy }); drag.moved = true;
          const e = objAt(centre(b)); objs.forEach(o => o.panel.classList.toggle("hover", o === e && !o.done));
        });
        const up = ev =>{
          if(!drag || drag.b !== b || ev.pointerId !== drag.id) return;
          drag = null; b.classList.remove("lift"); objs.forEach(o => o.panel.classList.remove("hover"));
          const e = objAt(centre(b));
          if(!e || e.done){ home(b, false); armIdle(); return; }
          if(e.it.n === b._v) lockIn(e, b); else miss(e, b);
        };
        b.addEventListener("pointerup", up); b.addEventListener("pointercancel", up);
      });
      /* [lines] THE DEMO (review 2026-10-07 "see the figma keep the animation like this only for the 1 time"; Figma FLN
         "Match the following" 1162:29905, frame 2): after the instruction, once per session (window.MR_DEMO_SEEN), the
         Figma hand appears on the first object's dot - the card and its dot turn blue - and travels to its RIGHT box's
         ring (review 2026-10-07 "the hand animation is not correct, it's going straight every time": it used to slide
         two-thirds toward the box level with it). The white arrow is the art's own (assets/nudge_hand_head.svg = the
         nudge_slide_right_v1 arrowhead + hand, cropped at x 102), its shaft a CSS bar behind it that grows from the dot
         to the hand ("the white arrow will only come and expand with the hand distance"), the whole turned to the
         travel. A beat on the ring, then all of it and the blue clear (nothing is joined). Any touch ends it at once.
         Reduced motion: none. */
      let demoEls = null, demoRaf = 0, demoT = [], touched = false;
      function stopDemo(){
        if(!demoEls) return;
        cancelAnimationFrame(demoRaf); demoT.forEach(clearTimeout); demoT = [];
        demoEls.arrow.remove(); demoEls.e.panel.classList.remove("sel"); demoEls.e.dotEl.classList.remove("sel");
        demoEls = null;
      }
      function demo(){
        if(!LINES || window.MR_DEMO_SEEN || reduce || !alive() || state.locked || touched || matched || wrongAll || sel) return;
        const e = objs[0], rb = rightBox(e); if(!rb) return;
        window.MR_DEMO_SEEN = true;
        const a = e.dot, end = rb._dot, dx = end.x - a.x, dy = end.y - a.y, D = Math.hypot(dx, dy);
        // the arrow, from the dot along the travel: [shaft][head]. In the head art the arrow's tip is 32px right of its
        // left edge (x 134 of the 185 art, cropped at 102) on the shaft's axis (y 76.55) - the tip rides the travel's end
        const arrow = K.add(scene, "div", "mr-demo", "left:" + px(a.x) + ";top:" + px(a.y) + ";rotate:" + Math.atan2(dy, dx) + "rad");
        const shaft = K.add(arrow, "i", "mr-demo-shaft"), head = K.add(arrow, "img", "mr-demo-head");
        head.src = "assets/nudge_hand_head.svg"; head.alt = "";
        const put = L =>{ head.style.left = px(L - 32); shaft.style.width = px(Math.max(0, L - 32 + 1)); };
        demoEls = { arrow, e }; put(0);
        demoT.push(setTimeout(()=>{ if(!demoEls) return; arrow.classList.add("on"); e.panel.classList.add("sel"); e.dotEl.classList.add("sel"); }, 100));
        demoT.push(setTimeout(()=>{
          if(!demoEls) return;
          const t0 = performance.now(), MS = 1600, ease = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          const step = now =>{ if(!demoEls) return; const k = ease(Math.min(1, (now - t0) / MS)); put(D * k);
            if(k < 1) demoRaf = requestAnimationFrame(step); };
          demoRaf = requestAnimationFrame(step);
        }, 600));
        demoT.push(setTimeout(()=>{ if(demoEls) arrow.classList.remove("on"); }, 2900));
        demoT.push(setTimeout(stopDemo, 3250));
      }
      state.replayAudio = ()=>{ if(!busy) say("prompt"); };
      requestAnimationFrame(()=> scene.classList.add("in"));
      say("prompt").then(()=>{ if(alive() && !state.locked){ busy = false; armIdle(); demo(); } });
      setTimeout(()=>{ if(alive() && busy && !matched && !wrongAll) busy = false; }, 1600);   // a drag may start while the instruction plays
    }
  },
  CLASSROOM_FIT: {
    /* P4 - the classroom game, SME deck pages 12-13 (review 2026-09-30: "follow the ppt slides instructions"). The
       classroom (assets/scene_classroom.svg) in the upper part with four empty spaces, each showing its size: a strip
       of faint blocks along it and "<k> ब्लॉक्स (लंबाई / ऊँचाई)". At the bottom, a tray with the four objects.
         intro ....... the VO (audio.intro); the child picks ANY object (idle 8s: the hand on the tray - flow only)
         measure ..... the object enlarges in the centre, the classroom fades out; its blocks wait in the tray (two
                       more than it needs). The child lays them from one end to the other: no idle ghost, no start pulse,
                       no counting VO, no target outlines; a block not flush goes back (the hint sheet's Drag & Drop
                       ladder, MDK.childMeasure). The first object, if it is the one the VO names (data.vo_object, the
                       bench): audio.measure
         place ....... the blocks stay on it; the classroom comes back and its spaces pulse; the measured object waits
                       in the tray and the child drags it into a space - the right one: it snaps in and stays, SFX +
                       audio.item_ok ("शाबाश! सही जगह पर रखा।"); the confetti once, with the last one. HINTS = the FLN hint logic sheet, Drag &
                       Drop (review 2026-09-30: "for the hint part follow the excel sheet, not the slides"), per object:
                       wrong #1 - the space shakes, the object returns to the tray, audio.try_again; wrong #2 - the same,
                       then its right space glows softly and the hand points at it, audio.hint; wrong #3 - it moves in by
                       itself (never stuck). The first object, if the bench: audio.place
         ...then the next object (the deck's instructions without VO; the hints and praise still speak); after the
         fourth, on.
       data: { sc (the classroom's block px), unit_hi, vo_object, items:[{id, name_hi, src, ar, n, axis, space:{x, y,
       markers, label:[cx, top]}}], room:{decor:[{src, x, y, w}], bunting:{src, n, ar, w, step, x0, hang, rope}} } in the
       room's px (1033 x 340). audio: intro, measure, place, item_ok, try_again, hint, block_try, block_hint. */
    mount(host, slide){
      const d = slide.data, K = MDK, px = K.px, reduce = K.reduce();
      state.ownsAudio = true; state.locked = false; setNavActive(false); $("navBtn").style.display = "none"; setSwMood("point");
      /* [room full] data.room.full (review 2026-10-07, the new full-screen classroom picture assets/bg_classroom.webp): the
         picture is the STAGE's backdrop (data.bg "classroom" - so the side bands carry it on); the room's coordinates are
         the stage's own 1333 x 750, the spaces laid on the picture's wall / rug / floor; the tray floats over its foot */
      const FULL = !!(d.room && d.room.full);
      const scene = document.createElement("div"); scene.className = "md-stage cf" + (FULL ? " cf-roomfull" : d.no_head ? " cf-full" : ""); host.appendChild(scene);
      const alive = ()=> CARD.slides[state.idx] === slide && scene.isConnected;
      const kS = scene.getBoundingClientRect().width / (scene.offsetWidth || 1) || 1;
      const W = scene.offsetWidth || 1033, H0 = Math.max(440, host.getBoundingClientRect().height / kS - 6);
      /* [full] data.no_head (review 2026-10-07 "remove the instruction box, only its VO; do this full screen"): the
         classroom keeps its own 1033 x 340 coordinates (every space, label and decor in the card data) and is zoomed
         as a whole by Z to the stage's width; the tray under it; the two centred in the height. Z = 1 otherwise. */
      const RW0 = FULL ? 1333 : 1033, RH0 = FULL ? 750 : 340, Z = FULL ? W / RW0 : d.no_head ? Math.min((W - 24) / RW0, (H0 - 190) / RH0) : 1;
      const RWz = RW0 * Z, RHz = RH0 * Z;
      const TH = FULL ? (d.tray_h || 124) * Z : d.no_head ? Math.min(H0 - (RHz + 14), 176) : H0 - (RHz + 14);
      const TY = FULL ? RHz - TH - 10 * Z : RHz + 14, H = FULL ? RHz : TY + TH;
      scene.style.height = px(H); if(d.no_head && !FULL) scene.style.marginTop = px(Math.max(0, (H0 - H) / 2));
      const RW = RW0, RH = RH0, RX = (W - RWz) / 2, SC = d.sc || 36, unit = d.unit_hi || "ब्लॉक्स";
      const items = d.items;
      const say = role => new Promise(r => { const s = audioFor(slide, role); if(!s) return r(); play(s, r); });
      const setHead = t =>{ $("promptText").textContent = t; };
      /* [juice] review 2026-10-07 "make the end game screen the best": motion only, no new hints (the SME's measure rules
         stand). rectIn(el): an element's box in scene px (the room is zoomed by Z, the stage by kS) */
      const rectIn = el =>{ const a = el.getBoundingClientRect(), b = scene.getBoundingClientRect();
        return { x: (a.left - b.left) / kS, y: (a.top - b.top) / kS, w: a.width / kS, h: a.height / kS }; };
      // a right drop's flourish, in room px: dust off the floor (or chalk dust off the wall) and a few sparks over it
      function burst(r, wall){
        if(reduce) return;
        const fx = K.add(room, "div", "cf-fx"), base = wall ? r.y + r.h / 2 : r.y + r.h - 4;
        for(let k = 0; k < 9; k++){
          const side = k % 2 ? 1 : -1, x0 = r.x + r.w / 2 + side * (r.w / 2 - 6) * (wall ? .9 : .7 + Math.random() * .3);
          const pf = K.add(fx, "i", "cf-puff" + (wall ? " chalk" : ""), "left:" + px(x0 - 9) + ";top:" + px(base - 9));
          pf.animate([{ translate: "0 0", scale: .4, opacity: .9 }, { translate: (side * (18 + Math.random() * 26)) + "px " + (-(8 + Math.random() * 18)) + "px", scale: 1.5, opacity: 0 }],
                     { duration: 650 + Math.random() * 250, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" });
        }
        for(let k = 0; k < 9; k++){
          const a = -Math.PI * (.08 + .84 * k / 8), d = 40 + Math.random() * 26;
          const sp = K.add(fx, "i", "cf-spark", "left:" + px(r.x + r.w / 2 - 8) + ";top:" + px(r.y + r.h * .35 - 8));
          sp.animate([{ translate: "0 0", scale: .2, opacity: 0 }, { opacity: 1, offset: .25 },
                      { translate: (Math.cos(a) * (r.w / 2 + d)) + "px " + (Math.sin(a) * (r.h / 2 + d)) + "px", scale: 1, opacity: 0, rotate: "120deg" }],
                     { duration: 760, delay: 60 * k, easing: "cubic-bezier(.2,.8,.4,1)", fill: "both" });
        }
        setTimeout(()=> fx.remove(), 1400);
      }
      /* ---- the classroom: its spaces, their block strips, floor markers and size labels ---- */
      const room = K.add(scene, "div", "cf-room" + (FULL ? " full" : ""), "left:" + px(RX) + ";top:0;width:" + px(RW) + ";height:" + px(RH) + (Z !== 1 ? ";transform-origin:0 0;scale:" + Z : ""));
      if(!FULL){ const bg = K.add(room, "img", "cf-room-bg"); bg.src = "assets/scene_classroom.svg"; bg.alt = ""; }
      /* the room's HD pictures (review 2026-10-01: "use these hd images and replace the assets in last game screen"):
         data.room.decor - the window, the door, the clock, each {src, x, y, w} (its height its own); data.room.bunting -
         its rope (two quadratic curves: rope = [p0, c1, p1, c2, p2]) and the supplied flags hung along it every step px
         from x0, each turned to the rope's slope where it hangs (hang: the rope's height in the flag, a fraction of it);
         src the flags side by side, n of them, ar a flag's height / width. The supplied garland sags deep - laid across
         the wall whole it would hang down over the blackboard's space - so its flags are hung on the room's own rope */
      const RM = d.room || {};
      (RM.decor || []).forEach(o =>{ const im = K.add(room, "img", "cf-deco", "left:" + px(o.x) + ";top:" + px(o.y) + ";width:" + px(o.w)); im.src = o.src; im.alt = ""; im.draggable = false; });
      if(RM.bunting){
        const B = RM.bunting, [p0, c1, p1, c2, p2] = B.rope, NS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "cf-rope"); svg.setAttribute("viewBox", "0 0 " + RW + " " + RH);
        ["", "hi"].forEach(k =>{ const p = document.createElementNS(NS, "path"); p.setAttribute("d", "M" + p0 + "Q" + c1 + " " + p1 + "Q" + c2 + " " + p2);
          if(k){ p.setAttribute("class", k); p.setAttribute("transform", "translate(0 -.6)"); } svg.appendChild(p); });
        room.appendChild(svg);
        const q = (a, b, c, t)=> (1 - t) * (1 - t) * a + 2 * t * (1 - t) * b + t * t * c, dq = (a, b, c, t)=> 2 * (1 - t) * (b - a) + 2 * t * (c - b);
        const at = x =>{                                                     // the rope at x: its height and its slope (deg)
          const [A, C, E] = x <= p1[0] ? [p0, c1, p1] : [p1, c2, p2]; let lo = 0, hi = 1;
          for(let i = 0; i < 24; i++){ const m = (lo + hi) / 2; if(q(A[0], C[0], E[0], m) < x) lo = m; else hi = m; }
          const t = (lo + hi) / 2; return { y: q(A[1], C[1], E[1], t), a: Math.atan2(dq(A[1], C[1], E[1], t), dq(A[0], C[0], E[0], t)) * 180 / Math.PI };
        };
        const fh = B.w * B.ar;
        for(let k = 0, x = B.x0; x <= RW - B.x0 + .5; k++, x += B.step){
          const p = at(x);
          K.add(room, "div", "cf-flag", "left:" + px(x - B.w / 2) + ";top:" + px(p.y - B.hang * fh) + ";width:" + px(B.w) + ";height:" + px(fh) +
            ";background-image:url(" + B.src + ");background-size:" + px(B.w * B.n) + " " + px(fh) + ";background-position:" + px(-(k % B.n) * B.w) + " 0" +
            ";transform-origin:50% " + (B.hang * 100).toFixed(1) + "%;rotate:" + p.a.toFixed(2) + "deg");
        }
      }
      items.forEach(it =>{
        const s = it.space, w = it.axis === "y" ? it.n * SC / it.ar : it.n * SC, h = it.axis === "y" ? it.n * SC : it.n * SC * it.ar;
        it._r = { x: s.x, y: s.y, w, h };
        it._hit = it.axis === "y" ? { x: s.x - SC - 18, y: s.y - 14, w: w + SC + 32, h: h + 28 } : { x: s.x - 14, y: s.y - SC - 18, w: w + 28, h: h + SC + 32 };
        it._sp = K.add(room, "div", "cf-space", "left:" + px(s.x) + ";top:" + px(s.y) + ";width:" + px(w) + ";height:" + px(h));
        it._anchor = K.add(room, "div", "md-anchor", "left:" + px(s.x + w / 2 - 1) + ";top:" + px(s.y + h / 2 - 10));   // the hint hand's target
        /* data.dims (review 2026-10-07, the reviewer's sketch: a plain space with "<- 8 blocks ->" along its side): no strip
           of ghost blocks - a double-headed arrow the measured side long (above a length, left of a height), its label on
           it (a length) or beside it, stacked (a height); both turn green when the object is in */
        if(d.dims){
          // (review 2026-10-07 "the 8 blocks label shouldn't collide with the dotted box": a length's arrow stands clear of its
          //  space by more than half its label's height - 28 in the full room, where the labels are bigger)
          const DG = 16, DGH = FULL ? 30 : 16;
          it._strip = it.axis === "y" ? K.add(room, "div", "cf-dim v", "left:" + px(s.x - DG) + ";top:" + px(s.y) + ";height:" + px(h))
                                      : K.add(room, "div", "cf-dim h", "left:" + px(s.x) + ";top:" + px(s.y - DGH) + ";width:" + px(w));
          it._lb = it.axis === "y" ? K.add(room, "div", "cf-label dim narrow", "left:" + px(s.x - DG - 8) + ";top:" + px(s.y + h / 2))
                                   : K.add(room, "div", "cf-label dim", "left:" + px(s.x + w / 2) + ";top:" + px(s.y - DGH));
          it._lb.innerHTML = it.axis === "y" ? "<b></b><i></i>" : "<b></b>";
          if(it.axis === "y"){ it._lb.querySelector("b").textContent = devNumeral(it.n); it._lb.querySelector("i").textContent = it.n === 1 ? "ब्लॉक" : unit; }
          else it._lb.querySelector("b").textContent = devNumeral(it.n) + " " + (it.n === 1 ? "ब्लॉक" : unit);
          return;
        }
        it._strip = K.add(room, "div", "cf-strip");
        for(let k = 0; k < it.n; k++){
          const p = it.axis === "y" ? { x: s.x - SC - 4, y: s.y + h - (k + 1) * SC } : { x: s.x + k * SC, y: s.y - SC - 4 };
          K.add(it._strip, "div", "cf-sb", "left:" + px(p.x) + ";top:" + px(p.y) + ";width:" + px(SC) + ";height:" + px(SC));
        }
        if(s.markers) [s.x - 6, s.x + w - 2].forEach(x => K.add(room, "div", "cf-marker", "left:" + px(x) + ";top:" + px(s.y + h * .3) + ";height:" + px(h * .7 + 6)));
        /* data.label_in (review 2026-10-07 "label inside each space": "8 ब्लॉक्स" stood by the door, "6" by the clock - whose
           was which?): the label sits in the middle of its own space; a narrow (upright) space gets the stacked one -
           the number, then the unit - and it fades once the object is in (the strip turns green instead) */
        const narrow = d.label_in && w < 100;
        it._lb = d.label_in ? K.add(room, "div", "cf-label in" + (narrow ? " narrow" : ""), "left:" + px(s.x + w / 2) + ";top:" + px(s.y + h / 2))
                            : K.add(room, "div", "cf-label", "left:" + px(s.label[0]) + ";top:" + px(s.label[1]));
        // (review 2026-10-07 "remove lambai and uchai words": the label is the measure only - no "(लंबाई)" / "(ऊँचाई)" line)
        it._lb.innerHTML = narrow ? "<b></b><i></i>" : d.label_in ? "<b></b>" : "<b></b><span></span>";
        if(narrow){ it._lb.querySelector("b").textContent = devNumeral(it.n); it._lb.querySelector("i").textContent = it.n === 1 ? "ब्लॉक" : unit; }
        else it._lb.querySelector("b").textContent = devNumeral(it.n) + " " + unit;
        if(!d.label_in) it._lb.querySelector("span").textContent = it.axis === "y" ? "(ऊँचाई)" : "(लंबाई)";
      });
      /* ---- the tray ---- */
      // [room full] while an object is measured the picture recedes under a soft veil (the room's own fade can't reach it)
      if(FULL) K.add(scene, "div", "cf-veil");
      const TX = FULL ? RX + 18 * Z : RX, TWD = FULL ? RWz - 36 * Z : RWz;
      /* [shelf] data.room.full: the tray is the wooden shelf (assets/cls_shelf.webp, 1600 x 399 - its carved ends 185 px
         wide, kept; its plain middle stretched), the objects standing on its floor (58% down), their names on its lip */
      // (review 2026-10-07 "remove this big chair and have an option box only": the shelf is off unless data.shelf - the
      //  four objects are white option boxes again, standing straight on the room)
      const SH = FULL && !!d.shelf, SHELF = { end: 185 / 399 * TH, floor: .58 };
      const tray = K.add(scene, "div", "cf-tray" + (SH ? " shelf" : FULL ? " boxes" : ""), "left:" + px(TX) + ";top:" + px(TY) + ";width:" + px(TWD) + ";height:" + px(TH) + (SH ? ";--end:" + px(SHELF.end) : ""));
      const IX = SH ? SHELF.end : 20, TG = 18, TW = (TWD - 2 * IX - 3 * TG) / 4;
      items.forEach((it, i)=>{
        const t = K.add(tray, "button", "cf-item", "left:" + px(IX + i * (TW + TG)) + ";top:" + (SH ? "0" : "8px") + ";width:" + px(TW) + ";height:" + px(SH ? TH : TH - 18));
        t.type = "button"; t.style.setProperty("--i", i); t.innerHTML = '<img alt=""><span></span>'; t.querySelector("img").src = it.src; t.querySelector("span").textContent = it.name_hi;   // [juice] --i: its turn to drop in
        t.addEventListener("click", ()=> pick(it)); it._t = t;
      });
      /* (review 2026-10-07 "after it is placed the disabled option should get removed and the other options should come to
         the bottom centre"): a placed object's box leaves the tray; the ones left close up, centred, at the same size */
      function layoutTray(){
        const left = items.filter(o => !o._done), x0 = (TWD - (left.length * TW + (left.length - 1) * TG)) / 2;
        left.forEach((o, k)=>{ o._t.style.left = px(x0 + k * (TW + TG)); });
      }
      /* ---- the game ---- */
      let phase = "pick", first = true, cur = null, run = null, wrongs = 0, placedN = 0, idleT = 0, pending = null, anyRev = false;
      const voFor = it => first && it && it.id === d.vo_object;
      function armIdle(){ clearTimeout(idleT); idleT = setTimeout(()=>{ if(!alive() || phase !== "pick") return;
        const it = items.find(x => x.id === d.vo_object && !x._done) || items.find(x => !x._done); if(it && placeNudge(it._t)) state.nudgeUsed = true; }, IDLE_MS); }
      function toPick(idle){
        phase = "pick"; cur = null; setHead(slide.prompt_hi || ""); scene.classList.remove("cf-measuring", "cf-placing");
        items.forEach(it =>{ it._t.disabled = !!it._done; }); if(idle) armIdle();
        if(pending){ const q = pending; pending = null; pick(q); }            // a tap made while the room came back
      }
      function pick(it){
        /* (QA 2026-10-01) a tap in the 2.3s after a right drop - the praise, the room coming back - used to be dropped
           silently though its button looked ready: it is kept, and that object opens the moment the room is back */
        if(phase === "fit" && !it._done && alive()){ pending = it; sfxTap(); return; }
        if(phase !== "pick" || it._done || !alive()) return;
        clearTimeout(idleT); stopNudge(); sfxTap();
        cur = it; phase = "measure"; scene.classList.add("cf-measuring");
        setHead(it.name_hi + " को ब्लॉक से मापिए।");
        measureView(it);
        if(voFor(it)) say("measure"); else stopAudio();
      }
      /* the measuring view: the object big in the centre (a row on top of a long one, a column left of a tall one),
         dashed lines at its ends, the blocks waiting in the tray */
      function measureView(it){
        const N = it.n, M = N + 2, TOP = FULL ? TY - 10 : RHz - 10, layer = K.add(scene, "div", "cf-mv");
        let S, slotXY, ox, oy, ow, oh;
        if(it.axis === "y"){
          S = Math.min(K.CUBE, (TOP - 40) / N, (W - 80) / (M + (M - 1) * .16));   // the game's cube, as far as it fits
          oh = N * S; ow = oh / it.ar; const gx = (W - (S + 12 + ow)) / 2; ox = gx + S + 12; oy = (TOP - oh) / 2 + 10;
          slotXY = k => ({ x: gx, y: oy + oh - (k + 1) * S });
          const gw = S + 12 + ow * .6 + 16;
          K.add(layer, "div", "mm-guide h", "left:" + px(gx - 10) + ";top:" + px(oy - 1) + ";width:" + px(gw));
          K.add(layer, "div", "mm-guide h", "left:" + px(gx - 10) + ";top:" + px(oy + oh - 1) + ";width:" + px(gw));
        } else {
          S = Math.min(K.CUBE, (W - 120) / N, (TOP - 40) / (1 + N * it.ar), (W - 80) / (M + (M - 1) * .16));
          ow = N * S; oh = ow * it.ar; ox = (W - ow) / 2; oy = (TOP - (S + oh)) / 2 + S + 10;
          /* it.sit (review 2026-10-07 "can the cubes get placed in the front of the table, not at the back?"): how far down
             the picture its top's front edge is (the bench's seat: .235) - the row rests there, in front, not on its back edge */
          const sy = (it.sit || 0) * oh;
          slotXY = k => ({ x: ox + k * S, y: oy - S + sy });
          const gh = S + 12 + Math.min(oh * .4, 50);
          K.add(layer, "div", "mm-guide v", "left:" + px(ox - 1) + ";top:" + px(oy - S + sy - 12) + ";height:" + px(gh));
          K.add(layer, "div", "mm-guide v", "left:" + px(ox + ow - 1) + ";top:" + px(oy - S + sy - 12) + ";height:" + px(gh));
        }
        const img = K.add(layer, "img", "md-obj", "left:" + px(ox) + ";top:" + px(oy) + ";width:" + px(ow) + ";height:" + px(oh)); img.src = it.src; img.alt = "";
        // [juice] it lifts off its tray tile and flies here, growing (its tile's picture is where it starts)
        const ti = it._t.querySelector("img");
        if(ti && !reduce){ const f = rectIn(ti), k0 = Math.min(f.w / ow, f.h / oh), fx0 = f.x + (f.w - ow * k0) / 2, fy0 = f.y + (f.h - oh * k0) / 2;
          img.classList.add("cf-fly"); img.style.transformOrigin = "0 0";
          img.animate([{ translate: (fx0 - ox) + "px " + (fy0 - oy) + "px", scale: k0 }, { translate: ((fx0 - ox) * .45) + "px " + ((fy0 - oy) * .45 - 40) + "px", scale: (k0 + 1) / 2, offset: .55 },
                       { translate: "0 0", scale: 1 }], { duration: 560, easing: "cubic-bezier(.4,.1,.3,1)" }); }
        const slots = []; for(let k = 0; k < N; k++){ const p = slotXY(k); slots.push(K.add(layer, "div", "md-slot", "left:" + px(p.x) + ";top:" + px(p.y) + ";width:" + px(S) + ";height:" + px(S))); }
        const gap = Math.round(S * .16), bx = (W - (M * S + (M - 1) * gap)) / 2, by = SH ? TY + TH * SHELF.floor - S
                 : FULL ? Math.min(TY + (TH - S) / 2, Math.max(oy + oh + 28, TY - S * .4))   // (review 2026-10-07 "the cubes are really below - shift them up": nearer the object, never on it)
                 : TY + (TH - S) / 2;
        const blocks = []; for(let j = 0; j < M; j++){ const b = K.cube(layer, j, bx + j * (S + gap), by, S); b._z = 3; b.style.zIndex = 3; blocks.push(b); }
        run = K.childMeasure({ scene, slide, alive: ()=> alive() && phase === "measure", blocks, slots, slotXY, S, hand: K.hand(layer, S),
          idleMs: 0, showTiles: false, hints: { say: a => say(a === 1 ? "block_try" : a === 2 ? "block_hint" : "block_nudge") },
          onAll: ()=> setTimeout(()=> measured(it, layer), 650) });
        run.start();
      }
      function measured(it, layer){
        if(!alive() || cur !== it) return;
        run.stop(); phase = "place";
        setHead("अब " + it.name_hi + " के लिए सही जगह चुनिए।");
        if(voFor(it)) say("place");
        layer.querySelectorAll(".md-block:not(.placed)").forEach(b => b.classList.add("cf-spare"));
        /* the blocks stay on it a moment; then the classroom comes back and the object, still measured, moves to the tray */
        setTimeout(()=>{ if(!alive() || cur !== it) return;
          // [juice] the object with its blocks on it flies down onto the tray as one (the card starts where they stand)
          const parts = [...layer.querySelectorAll(".md-obj, .md-block.placed")].map(rectIn);
          const from = parts.length ? parts.reduce((a, r)=>{ const x = Math.min(a.x, r.x), y = Math.min(a.y, r.y);
            return { x, y, w: Math.max(a.x + a.w, r.x + r.w) - x, h: Math.max(a.y + a.h, r.y + r.h) - y }; }) : null;
          if(from && !reduce) layer.querySelectorAll(".md-obj, .md-block.placed").forEach(x => x.style.visibility = "hidden");
          layer.classList.add("out"); setTimeout(()=> layer.remove(), 450);
          scene.classList.remove("cf-measuring"); scene.classList.add("cf-placing");
          makeCard(it, from);
        }, 1100);
      }
      /* the measured object in the tray: its picture with its blocks, dragged as one */
      function makeCard(it, from){
        const N = it.n, avH = SH ? TH * .95 : TH - 22, avW = 460 * Z;
        let s2, cw, ch, bl = [], ob;
        if(it.axis === "y"){ s2 = Math.min(avH / N, avW / (1 + N / it.ar)); const oh = N * s2, ow = oh / it.ar; cw = s2 + 6 + ow; ch = oh;
          for(let k = 0; k < N; k++) bl.push({ x: 0, y: oh - (k + 1) * s2 }); ob = { x: s2 + 6, y: 0, w: ow, h: oh }; }
        else { const st = it.sit || 0; s2 = Math.min(avW / N, avH / (1 + N * it.ar * (1 - st))); const ow = N * s2, oh = ow * it.ar; cw = ow; ch = s2 + oh * (1 - st);
          for(let k = 0; k < N; k++) bl.push({ x: k * s2, y: 0 }); ob = { x: 0, y: s2 - st * oh, w: ow, h: oh }; }   // (it.sit: the row on its front edge)
        const home = { x: (W - cw) / 2, y: SH ? TY + TH * SHELF.floor - ch : TY + (TH - ch) / 2 };   // [shelf] on its floor
        const c = K.add(scene, "div", "cf-card", "left:" + px(home.x) + ";top:" + px(home.y) + ";width:" + px(cw) + ";height:" + px(ch));
        const img = K.add(c, "img", "md-obj", "left:" + px(ob.x) + ";top:" + px(ob.y) + ";width:" + px(ob.w) + ";height:" + px(ob.h)); img.src = it.src; img.alt = "";
        bl.forEach((p, k)=>{ const b = K.cube(c, k, p.x, p.y, s2); b.classList.add("placed"); });
        c.setAttribute("role", "button");
        if(from && !reduce){ const k0 = from.w / cw; c.classList.add("cf-fly"); c.style.transformOrigin = "0 0";
          c.animate([{ translate: (from.x - home.x) + "px " + (from.y - home.y) + "px", scale: k0 }, { translate: "0 0", scale: 1 }],
                    { duration: 620, easing: "cubic-bezier(.45,.05,.3,1.15)" }); }
        /* (review 2026-10-07 "there should be some pop-up effect on the table so the user understands he should pick it up
           and place it" - then "use the pop effect of the first screen's button"): once it has landed in the tray it
           pulses like the landing's play button; then "no pulsating wave out of any element; first the object pulses, then
           all the boxes pulse once or twice, and no pulse after that"): once it has landed, it pops twice (no halo), then
           every open space pops twice, then all is still - once per object, never again after a wrong drop) */
        const cueT = [];
        const invite = on =>{ if(reduce) return;
          if(!on){ cueT.forEach(clearTimeout); c.classList.remove("cf-invite"); scene.classList.remove("cf-cue"); return; }
          c.style.transformOrigin = "50% 50%"; c.classList.add("cf-invite");
          cueT.push(setTimeout(()=>{ c.classList.remove("cf-invite"); if(alive() && phase === "place" && !drag) scene.classList.add("cf-cue"); }, 2300));
          cueT.push(setTimeout(()=> scene.classList.remove("cf-cue"), 4600)); };
        setTimeout(()=>{ if(alive() && phase === "place") invite(true); }, from ? 700 : 300);
        let drag = null, busy = false;
        const spaceAt = p =>{ const x = (p.x - RX) / Z, y = p.y / Z; return items.find(o => !o._done && x >= o._hit.x && x <= o._hit.x + o._hit.w && y >= o._hit.y && y <= o._hit.y + o._hit.h) || null; };
        const hover = sp => items.forEach(o => o._sp.classList.toggle("hover", o === sp));
        const back = ()=>{ busy = true; return K.glide(c, home, reduce ? 0 : 480, true).then(()=>{ busy = false;   // [juice] a settle on landing
          if(!reduce) c.animate([{ rotate: "-5deg" }, { rotate: "4deg" }, { rotate: "-2deg" }, { rotate: "0deg" }], { duration: 380, easing: "ease-out" });
        }); };
        c.addEventListener("pointerdown", ev =>{
          if(phase !== "place" || busy || drag || !alive()) return;
          ev.preventDefault(); stopNudge();
          const p = K.local(scene, ev), cp = K.pos(c); drag = { id: ev.pointerId, ox: p.x - cp.x, oy: p.y - cp.y, lx: p.x, tilt: 0 };
          try{ c.setPointerCapture(ev.pointerId); }catch(e){}
          c.classList.add("lift"); invite(false); sfxTap();
        });
        c.addEventListener("pointermove", ev =>{
          if(!drag || ev.pointerId !== drag.id) return;
          const p = K.local(scene, ev); K.setPos(c, { x: p.x - drag.ox, y: p.y - drag.oy }); hover(spaceAt(p));
          // [juice] it leans the way it is carried (a little, eased), upright again when it stops
          drag.tilt = drag.tilt * .7 + Math.max(-9, Math.min(9, (p.x - drag.lx) * .9)) * .3; drag.lx = p.x; if(!reduce) c.style.rotate = drag.tilt.toFixed(2) + "deg";
        });
        const up = ev =>{
          if(!drag || ev.pointerId !== drag.id) return;
          drag = null; c.classList.remove("lift"); hover(null); c.style.rotate = "";
          const sp = spaceAt(K.local(scene, ev));
          if(!sp){ back(); return; }
          if(sp === it){ busy = true; fit(it, c, false); return; }
          const m = it._wrong = (it._wrong || 0) + 1; wrongs++;                // the hint sheet's Drag & Drop ladder, per object
          GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, object: it.id, space: sp.id, attempts: m });
          sfxWrongSoft(); setSwMood("tryagain"); K.shake(sp._sp, 8);           // the wrong space shakes...
          back().then(()=>{                                                    // ...and the object returns to the tray
            if(!alive() || phase !== "place" || cur !== it) return;
            if(m === 1) say("try_again");                                      // attempt 1: think again
            else if(m === 2){ K.softGlow(it._sp); placeNudge(it._anchor); say("hint"); }   // attempt 2: its space glows + the hand on it
            else { busy = true; stopNudge();                                   // after the sheet's last attempt: it moves in by itself
              GameBus.emit("answer_revealed", { slide_id: slide.id, phase: slide.phase, object: it.id, attempts: m, reason: "wrong" });
              fit(it, c, true); }
          });
        };
        c.addEventListener("pointerup", up); c.addEventListener("pointercancel", up);
      }
      function fit(it, c, revealed){
        phase = "fit"; it._done = true; placedN++; first = false; stopNudge();
        if(revealed) anyRev = true;
        stopAudio(); if(!revealed){ sfxCorrect(); setSwMood("happy"); say("item_ok"); }   // the sheet: locks + glows + "शाबाश! सही जगह पर रखा।"
        // the confetti once, when the LAST object is in (review 2026-10-01: "confetti will only drop after all are correctly
        // placed"); not when one of them was shown
        if(placedN >= items.length && !anyRev){ try{ confettiCannon(); }catch(e){} }
        c.classList.add("gone"); setTimeout(()=> c.remove(), 320);
        /* (review 2026-10-07 "the objects don't look part of the scene - no shadow; the chair doesn't look placed on the
           floor"): what stands on the floor gets a soft contact shadow at its feet, nudged right (the light is the window,
           left); the blackboard on the wall casts its shadow down-right onto the wall */
        const r = it._r, wall = it.id === "board";
        if(!wall) K.add(room, "div", "cf-shadow", "left:" + px(r.x - r.w * .06 + r.w * .04) + ";top:" + px(r.y + r.h - Math.max(11, r.w * .08)) +
                                                  ";width:" + px(r.w * 1.12) + ";height:" + px(Math.max(22, r.w * .16)));
        const o = K.add(room, "img", "cf-placed" + (wall ? " wall" : " floor") + (it.id === "almirah" ? " back" : ""), "left:" + px(r.x) + ";top:" + px(r.y) + ";width:" + px(r.w) + ";height:" + px(r.h));
        o.src = it.src; o.alt = "";
        burst(r, it.id === "board");                                         // [juice] dust (chalk dust on the wall) + sparks
        it._sp.classList.add("filled"); it._strip.classList.add("ok"); it._lb.classList.add("ok");
        it._t.classList.add("done", "leaving"); it._t.disabled = true;
        setTimeout(()=>{ if(!alive()) return; it._t.style.display = "none"; layoutTray(); }, reduce ? 0 : 320);
        GameBus.emit("classroom_placed", { slide_id: slide.id, phase: slide.phase, object: it.id, value: it.n, attempts: (it._wrong || 0) + 1 });
        scene.classList.remove("cf-placing");
        setTimeout(()=>{ if(!alive()) return; if(placedN >= items.length) finish(); else { setSwMood("point"); toPick(false); } }, revealed ? 900 : 2300);
      }
      function finish(){
        phase = "done"; state.locked = true; stopNudge(); clearTimeout(idleT); setHead(slide.prompt_hi || "");
        try{ XAPI.send("question_answered", { slide_id: slide.id, type: slide.type, phase: slide.phase }, { is_correct: true, attempt: wrongs + 1, score: wrongs === 0 ? 1 : 0 }); }catch(e){}
        recordResult(slide, wrongs === 0);
        const sig = (slide.signals && slide.signals.on_complete && slide.signals.on_complete[0]) || "classroom_done";
        GameBus.emit(sig, { slide_id: slide.id, phase: slide.phase, value: wrongs === 0, wrong_drops: wrongs, latency_ms: Date.now() - state.slideStart });
        setSwMood("happy");                                                    // (the last right fit threw the confetti)
        finale().then(()=> setTimeout(()=>{ if(alive()) completeSlide(true); }, 500));
      }
      /* [juice] the finale: the room is done - the measuring marks fade, sunlight slants in through the window, the clock
         rings, and the finished room holds a moment (Swiftie's hop onto the bench was removed, review 2026-10-07) */
      function finale(){
        if(!d.no_head) return Promise.resolve();
        scene.classList.add("cf-done");
        const deco = name => [...room.querySelectorAll(".cf-deco")].find(e => (e.getAttribute("src") || "").indexOf(name) >= 0);
        const win = deco("room_window"), clock = deco("room_clock");
        // the doorway he comes out of: data.room.door [x, y, w, h] on the full picture, else the door picture
        const RD = (d.room || {}).door, dEl = deco("room_door");
        const door = RD ? { x: RD[0], y: RD[1], w: RD[2] } : dEl ? { x: parseFloat(dEl.style.left), y: parseFloat(dEl.style.top), w: parseFloat(dEl.style.width) } : null;
        if(win){ const w = { x: parseFloat(win.style.left), y: parseFloat(win.style.top), w: parseFloat(win.style.width) };
          K.add(room, "div", "cf-beams", "left:" + px(w.x + w.w * .3) + ";top:" + px(w.y + 10) + ";width:" + px(w.w * 3.2) + ";height:" + px(RH - w.y)); }
        if(clock && !reduce) clock.animate([{ rotate: "0deg" }, { rotate: "-9deg" }, { rotate: "8deg" }, { rotate: "-6deg" }, { rotate: "4deg" }, { rotate: "0deg" }],
                                           { duration: 700, delay: 350, easing: "ease-in-out" });
        // (review 2026-10-07 "remove Swifty from here": no Swiftie hopping onto the bench - the finished room holds a moment)
        return new Promise(r => setTimeout(r, 1800));
      }
      state.replayAudio = ()=>{ if(phase === "pick") say("intro"); else if(phase === "measure" && voFor(cur)) say("measure"); else if(phase === "place" && voFor(cur)) say("place"); };
      requestAnimationFrame(()=> scene.classList.add("in"));
      toPick(false);
      say("intro").then(()=>{ if(alive() && phase === "pick") armIdle(); });
    }
  },










  /* ===== NUMBER-SEQUENCE PATH (MTKGA01_L02_S04 — "completes a number sequence within 20") =====
     Three additive modules that share the .seq-* number-path skin. Numerals are crisp text glyphs
     (Baloo), only the tile chrome is rounded — content-true geometry (never round the number). */




  /* ===== ORDERING / SERIATION (MTKGA02_L02_S02 — "orders three objects by size, length, or weight") =====
     Additive modules sharing the .ord-* skin. Objects render at true magnitude (size scale / bar length);
     weight is assessed by 'pick the heaviest' (weight is not visual) — targeting the bigger=heavier
     misconception with a big-but-light distractor. */



  PICK_EXTREME: {
    // PICK test: tap the object that is the MOST (सबसे बड़ा / सबसे लंबा / सबसे भारी). For weight, options
    // include a big-but-light distractor to break the bigger=heavier misconception. Reuses mountTapOptions
    // → tap-to-answer + speak-the-word-on-tap + mastery. data:{by, options:[{img/emoji/color,mag,label,audio,correct}]}.
    // PICTURE OPTIONS (MTG2A04 T1 "कौन-सी टेबल ज़्यादा लंबी है?", review 2026-09-30): an option may carry its own
    // asset path + display width, {src, w} - the picture keeps its own aspect instead of the square magnitude box,
    // with a light glint across it; data.look names a CSS look for the row ("tables": no tile, the pictures stand
    // on one floor line, CSS [T1 tables]). data.wrong_cue:"sheet" = the FLN hint logic sheet, MCQ - 2 options (review
    // 2026-09-30: "for the hint part follow the excel sheet, not the slides"): every wrong tap - the tapped picture
    // shakes and returns; #1 - nothing else shown (VO: audio.try_again, via mountTapOptions); #2 - after a moment the
    // right picture glows softly (VO: audio.hint); #3 - the engine shows the answer (audio.reveal) and the hand taps it
    // (o.tap: its leg), then on. The right option's own audio is the praise ("शाबाश! आपने सही चुना।").
    mount(host, slide){
      const d = slide.data;
      mountTapOptions({
        slide, host, signalName: "pick_extreme_correct", stimulus: null,
        options: d.options,
        optionRenderer: (o)=>{ const cell = document.createElement("div"); cell.className = "ord-pick";
          if(o.correct === true) cell.dataset.right = "1";
          /* the picture carries the kit's object outline (recipe 21, `ol ol-alpha`: green on the right answer); o.tap =
             [x, y] of the picture = where the hand taps it (T1: the long table's front leg), outside .pk-in so the pulse
             never moves it */
          const tap = o.tap ? `<i class="pk-tap" style="left:${o.tap[0] * 100}%;top:${o.tap[1] * 100}%"></i>` : "";
          /* [T1 ground] o.feet = the picture's four feet [x centre, y bottom, width] as fractions of it, measured from its
             alpha, in the order front-left, back-left, back-right, front-right. Given, the floor shadow is drawn from
             them (CSS [T1 ground]): a dark contact shadow under each foot + the shade of the top over the floor between
             them. It sits outside .pk-drop / .pk-in, so it stays on the floor while the table drops in, lifts or shakes. */
          const ft = Array.isArray(o.feet) && o.feet.length === 4 ? o.feet : null;
          const gnd = ft ? `<span class="pk-gnd" aria-hidden="true"><i class="pk-ao"><b style="clip-path:polygon(${
              ft.map(f => `${f[0] * 100}% ${f[1] * 100}%`).join(",")})"></b></i>` +
            ft.map(f => `<i class="pk-foot" style="left:${f[0] * 100}%;top:${f[1] * 100}%;width:${f[2] * 100}%"></i>`).join("") + `</span>` : "";
          const inner = `<span class="pk-in"><img class="pk-img ol ol-alpha" src="${o.src}" alt="" style="width:${o.w || 240}px">` +
              `<span class="pk-shine" style="-webkit-mask-image:url(${o.src});mask-image:url(${o.src})"></span></span>`;
          const pic = o.src
            ? (ft ? `<span class="pk-pic has-gnd">${gnd}<span class="pk-drop">${inner}</span>${tap}</span>`
                  : `<span class="pk-pic">${inner}${tap}</span>`)
            : renderOrdObj(o, d.by);
          cell.innerHTML = pic + (o.label ? `<span class="lbl">${o.label}</span>` : ""); return cell; },
        isCorrect: (o)=> o.correct === true,
        mastery: slide.phase === "mastery",
        columnsHint: d.options.length,
        nudgeTarget: null,
        onWrong: d.wrong_cue === "sheet" ? (opt, cell)=>{
          MDK.shake(cell.querySelector(".pk-in") || cell, 10);                                         // shakes and returns
          const right = host.querySelector('.opt-cell[data-right="1"]'); if(!right || right === cell) return;
          const n = state.attempts;                                                                     // this wrong tap's number
          if(n === 2) setTimeout(()=>{ if(!state.locked && right.isConnected) MDK.softGlow(right.querySelector(".pk-in") || right, true); }, 600);
          else if(n >= 3) setTimeout(()=>{ if(right.isConnected) placeNudge(right.querySelector(".pk-tap") || right); }, 450);   // the answer shown: the hand taps its leg
        } : undefined,
        reask: d.wrong_cue === "sheet" ? false : undefined   // the sheet's attempt line only - no re-ask of the question after it
      });
      if(d.look){ const g = host.querySelector(".opt-grid"); if(g) g.classList.add("pk-" + d.look);
        const card = host.closest(".tut-card"); if(card) card.classList.add("tc-" + d.look); }   // the card's own look (CSS [T1 tables]: the floor)
    }
  },























  CELEBRATION: {
    mount(host, slide){
      /* [end swifty] review 2026-10-07 "use the end screen Swifty animation from hindi-game-gender-identify, as it is"
         - ported from that game's CELEBRATION ([34v] [H11-161] [H11-177]): ONE SOUND, THEN ONE LINE - the jingle, and
         on its end (or after 1800 ms, whichever lands first, never twice) the praise. Until the line starts Swiftie
         stands still (assets/last_swifty_still.webp, the clip's first frame); with it he jumps and talks
         (assets/last_swifty_end.webp, 3.28 s, plays once from frame 0 - a fresh blob: URL) and then holds its last
         frame - nothing loops. आगे बढ़ें comes when the line ends. */
      state.ownsAudio = true;
      const et = $("endTitle"); if(et) et.textContent = "";
      const st = $("endSubtitle"); if(st) st.textContent = "";
      const es = $("endScreen"); es.classList.add("show");
      document.body.classList.add("is-end");   // r4: immersive sunburst backdrop (end_screen.webp)
      const em = es.querySelector(".end-mascot");
      const setSw = u =>{ try{ if(!em) return; em.removeAttribute("data-src"); em.removeAttribute("src"); void em.offsetWidth; em.setAttribute("src", u); }catch(e){} };
      setSw(Assets.url("assets/last_swifty_still.webp"));
      let spoke = false;
      const speak = ()=>{
        if(spoke || !$("endScreen").classList.contains("show")) return; spoke = true;
        setSw(Assets.fresh("assets/last_swifty_end.webp"));
        play(audioFor(slide, "prompt") || null, ()=>{ if(state.endBtnPending){ $("endBtn").classList.add("show"); state.endBtnPending = false; } });
      };
      setTimeout(speak, 1800);
      playSfx(slide.audio && slide.audio.sfx ? slide.audio.sfx : "sfx_celebrate", speak);
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

/* ---------- 13. CONTROLLER ---------- */
/* ===== FLN ANIMATION KIT: star-burst (call site) BEGIN =====
   Recipe 8 is a RETUNE of the function below, which was already the shipped
   HI01H05 original: fewer and slower (150 ticks / decay .975 / startV 14 /
   32 stars + 8 circles / spin .18 / shots 0-220-440, against 100 / .96 / 22 /
   80 + 20 / .3 / 0-150-300). Travel distance is held at ~547px so it still
   fills the same area - only the density and pace change.
   The original is kept as _starBurstOld, unreferenced, to make this reversible. */
function starBurst(){ FLNMotion.starBurst.fire({ host: "#confetti" }); }
function clearHost(){
  document.body.classList.remove("is-end");   // r4: clear immersive end state when leaving celebration
  $("slideHost").innerHTML = "";
  $("hintBtn").classList.remove("show");
  $("hintBtn").disabled = false;
  setNavActive(false);
  stopNudge();
  stopAudio();
}

/* [loading] a slide mounts once its own files are in (Assets.whenSlide: at once, same tick, when they already are).
   The token keeps the LAST request: two quick jumps never mount the older slide on top of the newer. */
let _mountTok = 0;
function mountSlide(idx){ const t = ++_mountTok; Assets.whenSlide(idx, ()=>{ if(t === _mountTok) mountSlideNow(idx); }); }
function mountSlideNow(idx){
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
  bgmFor(slide.phase);        // QA checklist 2026-10-05: the practice game gets its own music (when shipped)
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
  $("navBtn").style.left = "";           // (T3 sets its own place for it: beside the door - every other slide, bottom centre)
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
  // data.no_head: no header band / Swiftie on this slide - its instruction is its VO only (P4, review 2026-10-07)
  $("stage").classList.toggle("no-head", !!(slide.data && slide.data.no_head));
  document.body.classList.toggle("tut-page", isTut);
  // a slide's own backdrop (data.bg, CSS .stage[data-bg]) - only while that slide is up; its module sets --horizon
  $("stage").dataset.bg = (slide.data && slide.data.bg) || ""; $("stage").style.removeProperty("--horizon");
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
const PHASE_GATE_TITLE = { tutorial:"चलिए, शुरू करते हैं!", guided:"चलिए, साथ में करें!", practice:"अब आपकी बारी!" };   // QA checklist 2026-10-05: the headlines are exactly the lines Swiftie speaks (each VO is now that line alone), so the text appears only as she says it
const PHASE_GATE_VO    = { tutorial:"vo_pt_tutorial", guided:"vo_pt_guided", practice:"vo_pt_practice" };
/* [peek-2] The clip's own length, and the CSS duck-down that follows it. Both are contracts
   with assets/gif/peeking.webp and @keyframes pgDuck — if either is re-cut, change it here too. */
const ANIM_ASSETS = ["loader.webp", "new_landing_swiftee_anim.webp", "peeking.webp", "sw_head_celebrate_anim.webp", "sw_head_hint_anim.webp", "sw_head_tryagain_anim.webp", "sw_lg_celebrating_anim.webp"];
const PG_CLIP_MS = 8304;  // peeking.webp: hands arrive, peek, blink, come out, talk with blinks, duck back; 8.30s, plays once (9.72s before 2026-10-05).
const PG_EXIT_MS = 520;    // .phase-gate.leaving / @keyframes pgDuck - a FALLBACK bound only; animationend is what actually closes the gate
/* [peek-5] review 2026-09-30: the headline and VO came up the instant the gate opened, while
   Swiftie was still peeking over the ledge - she "spoke" 4s before her mouth moved. They now
   wait for her: PG_TALK_MS is peeking.webp's first open-mouth frame (frame 58 of 84, measured
   from the clip's ANMF frame durations). Until then the gate is Swiftie alone. */
/* review 2026-10-05: "fasten the gif a little before it starts speaking" - the clip's own frame timings were re-timed
   (frames 1-58 only: its still holds halved, its motion frames 40 -> 32ms; every frame kept, nothing re-encoded), so she
   reaches her first open-mouth frame at 2.72s instead of 4.14s. The talking part is untouched. */
const PG_TALK_MS = 2724;
const PG_TAIL_MS = 450;    // a VO that ends while her clip is still talking: hold this long after it, then duck
const PG_LOAD_CAP_MS = 2500;   // never wait longer than this for the clip to decode
/* [peek-6] review 2026-09-30: "Swifty is glitching very much in the transition screen". Three causes:
   1. peeking.webp's ANIM loop count was 0 (= loop forever; the kit builds it as a play-once GIF and
      the webp conversion dropped that). Every gate that outlived the clip's 9.72s snapped her back to
      frame 0 - hands only - and she re-peeked while ducking. The file now says 1: play once, then hold
      the last frame, which is what PG_CLIP_MS and the park-on-her-smile logic always assumed.
   2. (asset only) At 1500x1500 the clip's frame decode stalled the whole page ~45 times per gate on an
      Intel UHD laptop; it now ships at 900x900 - same 84 frames, same durations - and stalls ~6 times.
   3. Each gate restarted her with a fresh ?r= URL, i.e. a new 3.7MB download - a blank blurred beat
      before her hands appeared, seconds long on a school connection. The clip is now fetched ONCE and
      each gate gets a new blob: URL of it; a new URL is a new image, so she starts from frame 0 with
      no network. Where fetch() can't read the file (file:// hosts) the cache-bust remains the fallback. */
let _peekUrl = "";
/* [loading] the clip is the loader's GATE file (Assets): fetched once as a Blob, right after the landing's own files -
   the gate's <img> no longer pulls it with the page, ahead of them. Each gate: a fresh blob: URL of it. */
function restartPeek(img){
  const old = _peekUrl;
  img.src = _peekUrl = Assets.fresh("assets/gif/peeking.webp");
  if(old && old.indexOf("blob:") === 0) URL.revokeObjectURL(old);
}
/* [peek-7] review 2026-10-05: "swifty gif in the transition screen is glitching a lot". The clip itself is clean
   (84 frames, a smooth rise, no jumps between frames); the glitch is the browser playing a big animated <img> with
   alpha under the gate's full-screen backdrop blur - frame steps stall and, as measured on the landing (see
   [landing mascot player]), Chrome sometimes paints nothing for a frame or two. Same cure as the landing: decode the
   clip ourselves (WebCodecs ImageDecoder, the next frame always decoded ahead) and draw it on a canvas at its
   displayed size - a canvas keeps its last picture until the next is drawn. play() resolves true once frame 0 is
   on screen (the gate's clip clock starts there), false = no ImageDecoder / no bytes / an error: use the <img>. */
const PeekPlayer = (()=>{
  const SRC = "assets/gif/peeking.webp", TYPE = "image/webp";
  let run = 0;
  function stop(){ run++; }
  function play(cv, img){
    const my = ++run, blob = Assets.blob(SRC);
    if(!cv || !blob || typeof ImageDecoder === "undefined") return Promise.resolve(false);
    if(img) img.style.display = "none";
    cv.style.display = "";
    cv.width = cv.height = 900;                  // the clip's 1:1 shape, so the CSS height + width:auto lays it out
    const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    const W = Math.max(1, Math.round(r.width * dpr)), H = Math.max(1, Math.round(r.height * dpr));
    cv.width = W; cv.height = H;                 // (this also wipes the last gate's parked smile)
    const ctx = cv.getContext("2d"); ctx.imageSmoothingQuality = "high";
    const draw = f =>{ ctx.clearRect(0, 0, W, H); ctx.drawImage(f, 0, 0, W, H); };
    return (async ()=>{
      if(ImageDecoder.isTypeSupported && !(await ImageDecoder.isTypeSupported(TYPE))) return false;
      const dec = new ImageDecoder({ data: await blob.arrayBuffer(), type: TYPE });
      await dec.tracks.ready;
      const count = dec.tracks.selectedTrack.frameCount;
      const first = count > 0 ? (await dec.decode({ frameIndex: 0 })).image : null;
      if(!first || my !== run){ if(first) first.close(); dec.close(); return false; }
      draw(first);
      let i = 0, cur = first, due = performance.now() + (cur.duration || 90000) / 1000;   // VideoFrame.duration: us
      let next = count > 1 ? dec.decode({ frameIndex: 1 }) : null;
      (async ()=>{
        while(next){
          let n; try { n = (await next).image; } catch(e){ break; }   // a failed decode: the frame on show stays
          const wait = due - performance.now();
          if(wait > 1) await new Promise(res => setTimeout(res, wait));
          if(my !== run){ n.close(); break; }                        // a newer gate, or this one closed
          draw(n); cur.close(); cur = n; i++;
          due = Math.max(due, performance.now() - 30) + (n.duration || 90000) / 1000;
          next = i + 1 < count ? dec.decode({ frameIndex: i + 1 }) : null;   // decoded while this one is on show
        }
        cur.close(); dec.close();                                    // plays once: the last frame stays drawn
      })();
      return true;
    })().catch(()=> false);
  }
  return { play, stop };
})();
const _gatedPhases = new Set();   // each phase gate plays ONCE (Start→tutorial, →guided, →practice)
let _gateToken = 0;
function phaseBlurTransition(cb, toPhase){
  const tok = ++_gateToken;
  stopNudge(); stopAudio();
  const gate = $("phaseGate"), img = $("phaseGateImg"), cv = $("phaseGateCv");
  gate.classList.remove("talking");   // headline stays hidden until she talks
  const title = $("phaseGateTitle"); if(title) title.textContent = PHASE_GATE_TITLE[toPhase] || "";
  $("stage").classList.add("blurred", "gating");
  document.body.classList.add("gating");
  gate.classList.remove("leaving");   // a gate interrupted mid-exit would open her already off-screen
  gate.classList.add("show");
  GameBus.emit("phase_transition", { to: toPhase });
  const closeGate = ()=>{ gate.classList.remove("show", "leaving", "talking"); $("stage").classList.remove("blurred", "gating"); document.body.classList.remove("gating"); };
  // VO only if the card actually ships it; else a silent beat — the clip floor keeps the peek visible.
  const voId = PHASE_GATE_VO[toPhase];
  const voSrc = (voId && CARD.assets && CARD.assets.audio && CARD.assets.audio[voId]) || null;
  /* The clip's clock starts when it can actually paint, NOT when the gate opens: decoding a
     fresh 1500px clip (or downloading it, on the ?r= fallback) takes a moment, and timing from
     the open would put the VO ahead of her mouth by however long that took. */
  let clipAt = 0;
  const startClock = ()=>{
    if(clipAt || tok !== _gateToken) return;
    clipAt = Date.now();
    setTimeout(talk, PG_TALK_MS);
  };
  /* [peek-7] the canvas player first (it needs the gate shown, to measure her); the <img> only if it can't */
  const useImg = ()=>{
    if(tok !== _gateToken) return;
    if(cv) cv.style.display = "none";
    if(!img){ startClock(); return; }
    img.style.display = "";
    restartPeek(img);                 // from frame 0, every gate
    if(img.decode) img.decode().then(startClock, startClock); else startClock();
  };
  PeekPlayer.play(cv, img).then(ok =>{ if(tok !== _gateToken) return; if(ok) startClock(); else useImg(); }, useImg);
  setTimeout(startClock, PG_LOAD_CAP_MS);   // a stalled download never strands the gate
  function talk(){
    if(tok !== _gateToken) return;          // a newer gate superseded us
    gate.classList.add("talking");          // headline pops in (CSS) on the same tick the VO starts
    play(voSrc, afterVo);
  }
  function afterVo(){
    if(tok !== _gateToken){ closeGate(); return; }               // a newer gate superseded us
    /* peeking.webp plays ONCE: rise, talk, then park on her smile (PG_CLIP_MS).
       A line that outlasts the clip still governs - she holds the parked smile until
       it ends, then ducks at once. A line that ends while she is still talking (the
       2.3s practice line against 4.4s of mouth) ducks her PG_TAIL_MS after it, so her
       beak is not flapping in silence. With no VO at all the whole clip plays out. */
    const clipLeft = Math.max(0, PG_CLIP_MS - (Date.now() - clipAt));
    const hold = voSrc ? Math.min(clipLeft, PG_TAIL_MS) : clipLeft;
    const finish = ()=>{
      PeekPlayer.stop();
      gate.classList.remove("show", "leaving", "talking");
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
        if(cv) cv.removeEventListener("animationend", once);
        if(tok !== _gateToken){ closeGate(); return; }
        finish();
      };
      if(img) img.addEventListener("animationend", once);   // only the one on show runs the duck
      if(cv) cv.addEventListener("animationend", once);
      gate.classList.add("leaving");
      // reduced-motion, a missing clip, a backgrounded tab: nothing to end, so close anyway
      fallback = setTimeout(once, PG_EXIT_MS + 500);
    }, hold);
  }
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
    afterConfetti(()=>{ if(state.idx === fromIdx) Assets.whenSlide(nextIdx, ()=>{                   // [loading] the gate + that slide's files
      if(state.idx === fromIdx) phaseBlurTransition(()=> mountSlide(nextIdx), next.phase); }, next.phase); });
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

/* ---------- 14b. ASSETS: THE LANDING FIRST, THEN EVERY FILE OF THE LESSON ----------
   The white boot loader holds only until the LANDING's own files are in (tag CRIT: its art, the title font, the play
   button, the greeting + Swiftee's wave) - so the first screen comes up fast. Then every other file in ASSET_SIZES (all
   shipped files, generated from disk) streams in behind the landing while the greeting plays, so nothing loads
   mid-lesson. (A loading bar in the play button's place was tried on 2026-10-06 and taken out at review: "remove this
   loader". The play tap needs no gate of its own - slide 0 mounts through whenSlide, below, which waits for its files.)
     - queue: the landing's files first (nothing else starts until they are in), then SMALLEST FIRST - pictures,
       backdrops and clips land in the first seconds and never wait behind the big animated WebPs. 5 at a time.
     - a fetched file is kept as a Blob: an <img> / <audio> that is later given that file's path gets a blob: URL of it
       instead (the MutationObserver below; play() for the voice element), so "loaded" really means local. A blob: URL
       that fails falls back, once, to the file's own URL. CSS url() backgrounds read the same bytes from the HTTP
       cache the fetch just filled.
     - NEVER BLOCKS: a failed, stalled (STALL_MS without a byte) or over-long (CAP_MS) transfer is aborted and counts as
       done - the element keeps its original src and loads it the normal way. file:// (fetch blocked) is done at once.
   Assets.whenSlide(i, fn): fn runs once slide i's own files are in (same tick when they already are - almost always, as
   the files arrive while the greeting plays); a spinner shows after 300ms and after 8s fn runs anyway. Animations that must restart from frame 0
   (the peeking gate, the cheers) get a fresh blob: URL per restart (Assets.fresh) - no ?r= re-downloads.
   ?noprefetch (QA only) turns the queue off, so a slide's own requests can be watched.
   Formats (2026-10-06): images WebP, audio Ogg/Opus, fonts WOFF2 - Chrome / Edge / Firefox, and Safari 17+ (Ogg Opus
   from Safari 18.4). */
/* @asset-sizes:begin (generated by tools/gen_asset_sizes.js - do not edit by hand) */
const ASSET_SIZES = {
  "assets/background_1st_screen.webp": 53190,
  "assets/badge_result.webp": 29754,
  "assets/badge_star.svg": 1444,
  "assets/basket_back.webp": 40634,
  "assets/basket_front.webp": 21510,
  "assets/bg_bedroom.webp": 8108,
  "assets/bg_classroom_v2.webp": 105796,
  "assets/bg_corkboard.webp": 31498,
  "assets/bg_dusk.webp": 9130,
  "assets/bg_fridge.webp": 6058,
  "assets/bg_kitchen.webp": 12864,
  "assets/bg_room.webp": 5646,
  "assets/bg_terrace.webp": 13032,
  "assets/bg_veranda.webp": 8920,
  "assets/bgdeco_spark.svg": 220,
  "assets/bgdeco_star.svg": 391,
  "assets/bgdeco_star_o.svg": 448,
  "assets/btn-play-round-waiting.svg": 2655,
  "assets/btn-play-round.svg": 2645,
  "assets/cls_shelf.webp": 41810,
  "assets/cubes_blue_row.webp": 44710,
  "assets/end_screen.webp": 33634,
  "assets/floor_planks.svg": 1405,
  "assets/fonts/baloo2-600.woff2": 87020,
  "assets/fonts/baloo2-700.woff2": 86108,
  "assets/fonts/baloo2-800.woff2": 74512,
  "assets/gif/loader.webp": 137428,
  "assets/gif/new_landing_swiftee_anim.webp": 641710,
  "assets/gif/peeking.webp": 1252974,
  "assets/gif/sw_head_celebrate_anim.webp": 293618,
  "assets/gif/sw_head_hint_anim.webp": 316076,
  "assets/gif/sw_head_tryagain_anim.webp": 313414,
  "assets/gif/sw_lg_celebrating_anim.webp": 322604,
  "assets/holder_cloudtub_back.webp": 32490,
  "assets/holder_cloudtub_front.webp": 27176,
  "assets/holder_laundry_back.webp": 47884,
  "assets/holder_laundry_front.webp": 35856,
  "assets/holder_wicker_back.webp": 155016,
  "assets/holder_wicker_front.webp": 108610,
  "assets/last_swifty_end.webp": 1779506,
  "assets/last_swifty_still.webp": 26456,
  "assets/mascot.webp": 8006,
  "assets/nudge_fx_ring_inner.svg": 786,
  "assets/nudge_fx_ring_outer.svg": 769,
  "assets/nudge_fx_sparks.svg": 2476,
  "assets/nudge_hand_head.svg": 9718,
  "assets/nudge_hand_new.svg": 6860,
  "assets/nudge_slide_right_v1.svg": 12310,
  "assets/obj_almirah.webp": 44002,
  "assets/obj_almirah_sock.webp": 16842,
  "assets/obj_bed.webp": 61714,
  "assets/obj_bench.webp": 27022,
  "assets/obj_bench_p2.webp": 27244,
  "assets/obj_blackboard.webp": 32152,
  "assets/obj_blackboard_p2.webp": 24796,
  "assets/obj_chair.webp": 71148,
  "assets/obj_chair_short.webp": 86918,
  "assets/obj_chair_tall.webp": 89764,
  "assets/obj_charpai.webp": 86194,
  "assets/obj_door.webp": 27900,
  "assets/obj_fridge.webp": 42888,
  "assets/obj_mat_1.webp": 165508,
  "assets/obj_mat_2.webp": 145580,
  "assets/obj_pillow.webp": 90784,
  "assets/obj_stool.webp": 45510,
  "assets/obj_table_long.webp": 31502,
  "assets/obj_table_measure.webp": 45156,
  "assets/obj_table_short.webp": 21208,
  "assets/obj_tv.webp": 52550,
  "assets/obj_watercan.webp": 93936,
  "assets/obj_window.webp": 55550,
  "assets/painting_answer.webp": 47420,
  "assets/painting_answer_order.webp": 4014,
  "assets/painting_blank.webp": 35620,
  "assets/painting_carrier.webp": 123524,
  "assets/painting_cubes.webp": 68334,
  "assets/painting_layers.webp": 59066,
  "assets/painting_upright.webp": 105140,
  "assets/pencil_face_rig.webp": 11068,
  "assets/pencil_purple.webp": 63574,
  "assets/prop_cat.webp": 26404,
  "assets/robot_body.webp": 47744,
  "assets/robot_face_happy.webp": 13272,
  "assets/robot_face_look.webp": 14988,
  "assets/robot_face_sad.webp": 12836,
  "assets/robot_screen.webp": 10534,
  "assets/robot_side.webp": 26946,
  "assets/room_clock.webp": 12296,
  "assets/room_door.webp": 19620,
  "assets/room_flags.webp": 21862,
  "assets/room_window.webp": 33842,
  "assets/scene_classroom.svg": 1740,
  "assets/sfx/bgm.ogg": 1443997,
  "assets/sfx/sfx_confetti.ogg": 11582,
  "assets/sfx/sfx_correct.ogg": 10099,
  "assets/sfx/sfx_next.ogg": 1538,
  "assets/sfx/sfx_nudge.ogg": 3537,
  "assets/sfx/sfx_play.ogg": 3094,
  "assets/sfx/sfx_wrong.ogg": 6095,
  "assets/start_card.webp": 1024,
  "assets/start_mascot.webp": 18020,
  "assets/startnew_bg_plain.webp": 24446,
  "assets/sw_head_celebrate.webp": 41998,
  "assets/sw_head_hint.webp": 36812,
  "assets/sw_head_neutral.webp": 31940,
  "assets/sw_head_talking.webp": 37384,
  "assets/sw_head_tryagain.webp": 48836,
  "assets/toybox_back.webp": 46950,
  "assets/toybox_front.webp": 23106,
  "assets/voiceover/sfx_celebrate.ogg": 8344,
  "assets/voiceover/vo_demo_start.ogg": 7652,
  "assets/voiceover/vo_hint_compare.ogg": 25407,
  "assets/voiceover/vo_hint_count.ogg": 24948,
  "assets/voiceover/vo_hint_dd_1.ogg": 17585,
  "assets/voiceover/vo_hint_dd_2.ogg": 15071,
  "assets/voiceover/vo_hint_drag.ogg": 13012,
  "assets/voiceover/vo_hint_mcq2_1.ogg": 16331,
  "assets/voiceover/vo_hint_mcq2_2.ogg": 12399,
  "assets/voiceover/vo_hint_mcq3_1.ogg": 14337,
  "assets/voiceover/vo_hint_tap.ogg": 17997,
  "assets/voiceover/vo_landing.ogg": 32354,
  "assets/voiceover/vo_match_instr.ogg": 11850,
  "assets/voiceover/vo_match_ok.ogg": 18568,
  "assets/voiceover/vo_num_1.ogg": 2617,
  "assets/voiceover/vo_num_2.ogg": 2795,
  "assets/voiceover/vo_num_3.ogg": 2880,
  "assets/voiceover/vo_num_4.ogg": 3047,
  "assets/voiceover/vo_num_5.ogg": 2612,
  "assets/voiceover/vo_num_6.ogg": 2621,
  "assets/voiceover/vo_num_7.ogg": 3108,
  "assets/voiceover/vo_num_8.ogg": 3086,
  "assets/voiceover/vo_num_9.ogg": 2775,
  "assets/voiceover/vo_ok_dd.ogg": 10303,
  "assets/voiceover/vo_ok_mcq2.ogg": 9707,
  "assets/voiceover/vo_p13_intro.ogg": 32060,
  "assets/voiceover/vo_p13_measure.ogg": 8800,
  "assets/voiceover/vo_p13_place.ogg": 10765,
  "assets/voiceover/vo_p2_ask.ogg": 17889,
  "assets/voiceover/vo_p2_fb.ogg": 8670,
  "assets/voiceover/vo_p3_child.ogg": 18404,
  "assets/voiceover/vo_p3_done.ogg": 13699,
  "assets/voiceover/vo_p3_explain_a.ogg": 15992,
  "assets/voiceover/vo_p3_explain_b.ogg": 14732,
  "assets/voiceover/vo_p3_head.ogg": 21299,
  "assets/voiceover/vo_p4_child.ogg": 21277,
  "assets/voiceover/vo_p4_done.ogg": 15122,
  "assets/voiceover/vo_p4_explain_a.ogg": 17725,
  "assets/voiceover/vo_p4_explain_b.ogg": 6652,
  "assets/voiceover/vo_p4_head.ogg": 27364,
  "assets/voiceover/vo_p5_ask.ogg": 12413,
  "assets/voiceover/vo_p5_instr.ogg": 10976,
  "assets/voiceover/vo_p5_ok.ogg": 13477,
  "assets/voiceover/vo_p6_ask.ogg": 13954,
  "assets/voiceover/vo_p6_instr.ogg": 11475,
  "assets/voiceover/vo_p6_ok.ogg": 14560,
  "assets/voiceover/vo_p6b_ask.ogg": 12300,
  "assets/voiceover/vo_p6b_instr.ogg": 9893,
  "assets/voiceover/vo_p6b_ok.ogg": 13117,
  "assets/voiceover/vo_p7_ask.ogg": 13102,
  "assets/voiceover/vo_p7_instr.ogg": 9760,
  "assets/voiceover/vo_p7_ok.ogg": 13914,
  "assets/voiceover/vo_p8_ask.ogg": 14441,
  "assets/voiceover/vo_p8_ok.ogg": 12448,
  "assets/voiceover/vo_p9_ask.ogg": 14593,
  "assets/voiceover/vo_p9_ok.ogg": 12280,
  "assets/voiceover/vo_pt_guided.ogg": 7736,
  "assets/voiceover/vo_pt_practice.ogg": 7611,
  "assets/voiceover/vo_pt_tutorial.ogg": 7759,
  "assets/voiceover/vo_rule_a.ogg": 22761,
  "assets/voiceover/vo_rule_b.ogg": 8243,
  "assets/voiceover/vo_rule_c.ogg": 10176,
  "assets/voiceover/vo_well_done.ogg": 15199
};
/* @asset-sizes:end */
const Assets = (function(){
  const CRIT = -3, GATE = -2, UI = -1, REST = 999;
  const CONCURRENCY = 5, STALL_MS = 15000, CAP_MS = 90000, CRIT_CAP_MS = 20000;
  let q; try{ q = new URLSearchParams(location.search); }catch(e){ q = { has: ()=> false }; }
  const OFF = q.has("noprefetch");
  const HTTP = /^https?:$/.test(location.protocol);           // file:// can't fetch(): every element loads its own file there
  const items = new Map(), perSlide = [], blobs = new Map(), urls = new Map();
  let seq = 0, active = 0, started = false, hold = false;
  const A = (CARD.assets || {});
  const known = src => Object.prototype.hasOwnProperty.call(ASSET_SIZES, src);
  const vo = id => (A.audio && typeof A.audio[id] === "string" && A.audio[id].indexOf("assets/") === 0) ? A.audio[id]
                                                                                                      : "assets/voiceover/" + id + "." + AUDIO_EXT;
  const art = f => "assets/" + (ANIM_ASSETS.indexOf(f) >= 0 ? "gif/" : "") + f;
  const TYPES = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", svg: "image/svg+xml", ogg: "audio/ogg", woff2: "font/woff2" };
  const typeOf = src => TYPES[(src.split("?")[0].split(".").pop() || "").toLowerCase()] || "";
  /* a font file is "in" once the face is ready to draw too (fetched bytes + document.fonts.load: no swap later) */
  const faceOf = src =>{ const m = /baloo2-(\d+)\.woff2$/.exec(src); return m ? m[1] + " 1em 'Baloo 2'" : null; };
  function add(src, tag){
    if(!src || !known(src)) return null;                       // not shipped: never requested (no 404s)
    let it = items.get(src);
    if(it){ if(tag < it.tag) it.tag = tag; return it; }
    it = { src: src, tag: tag, n: seq++, st: 0, size: ASSET_SIZES[src] || 1, cbs: [] };   // st: 0 queued, 1 loading, 2 in
    items.set(src, it); return it;
  }
  function ready(){ if(OFF) return true; if(!items.size) return false; for(const it of items.values()) if(it.st !== 2) return false; return true; }
  function finish(it){
    if(it.st === 2) return;
    if(it.st === 1) active--;
    it.st = 2;
    /* an <img data-src> in index.html that only needs its picture later gets it now (it used to start downloading
       with the page, ahead of the landing's own files) */
    document.querySelectorAll('img[data-src="' + it.src + '"]').forEach(im =>{ im.src = it.src; im.removeAttribute("data-src"); });
    it.cbs.splice(0).forEach(f =>{ try{ f(); }catch(e){} });
    pump();
  }
  function load(it){
    it.st = 1; active++;
    if(!HTTP){ finish(it); return; }
    const ctl = typeof AbortController === "function" ? new AbortController() : null;
    let stallT = 0, capT = 0, over = false;
    const end = blob =>{
      if(over) return; over = true; clearTimeout(stallT); clearTimeout(capT);
      if(blob) blobs.set(it.src, blob);
      const face = faceOf(it.src);
      if(!face || !document.fonts || !document.fonts.load) return finish(it);
      const t = setTimeout(()=> finish(it), 3000);
      document.fonts.load(face).then(()=>{ clearTimeout(t); finish(it); }, ()=>{ clearTimeout(t); finish(it); });
    };
    const abort = ()=>{ try{ if(ctl) ctl.abort(); }catch(e){} end(null); };   // stalled / too long: counts as done
    const arm = ()=>{ clearTimeout(stallT); stallT = setTimeout(abort, STALL_MS); };
    capT = setTimeout(abort, it.tag <= CRIT ? CRIT_CAP_MS : CAP_MS); arm();
    fetch(it.src, ctl ? { signal: ctl.signal } : undefined).then(r =>{
      if(!r.ok) throw new Error("HTTP " + r.status);
      const len = +r.headers.get("content-length");
      if(len > 0 && !r.headers.get("content-encoding")) it.size = len;
      const type = typeOf(it.src) || r.headers.get("content-type") || "";
      if(!r.body || !r.body.getReader) return r.blob().then(b => new Blob([b], { type: type }));
      const rd = r.body.getReader(), parts = [];
      const next = ()=> rd.read().then(c =>{
        if(c.done) return new Blob(parts, { type: type });
        parts.push(c.value); arm();
        return next();
      });
      return next();
    }).then(end, ()=> end(null));
  }
  function pump(){
    if(OFF || !started) return;
    let crit = false;
    for(const it of items.values()) if(it.tag <= CRIT && it.st !== 2){ crit = true; break; }
    /* the landing's files (CRIT) and anything a waiting slide asked for (GATE) by tag; the rest smallest first */
    const rank = it => it.tag <= GATE ? it.tag : 0;
    while(active < CONCURRENCY){
      let best = null;
      for(const it of items.values())
        if(it.st === 0 && (!best || rank(it) < rank(best) || (rank(it) === rank(best) && (it.size < best.size || (it.size === best.size && it.n < best.n))))) best = it;
      if(!best || ((crit || hold) && best.tag > CRIT)) return;   // the landing's own files have the line to themselves
      load(best);
    }
  }
  function whenDone(srcs, cb){
    const pend = srcs.map(s => items.get(s)).filter(it => it && it.st !== 2);
    let left = pend.length;
    if(!left){ cb(); return; }
    pend.forEach(it => it.cbs.push(()=>{ if(--left === 0) cb(); }));
  }
  /* the engine art a slide's KIND draws, which its card data does not name (CSS backdrops, holders, MDK pieces) */
  const HOLDER = { basket: ["basket_back", "basket_front"], laundry: ["holder_laundry_back", "holder_laundry_front"],
    cloudtub: ["holder_cloudtub_back", "holder_cloudtub_front"], wicker: ["holder_wicker_back", "holder_wicker_front"],
    painting: ["painting_carrier", "painting_layers", "painting_cubes", "painting_blank", "painting_answer", "painting_upright"] };
  function slideArt(s){
    const d = s.data || {}, out = [], img = f => out.push("assets/" + f + "." + IMG_EXT);
    if(d.bg && d.bg !== "softboard") img("bg_" + d.bg);                            // #stage[data-bg] (style.css; the softboard is CSS only)
    if((s.type === "MEASURE_DEMO" || s.type === "MEASURE_ASK") && !d.keep_holder) ["robot_body", "robot_screen", "robot_side"].forEach(img);   // [robot] MDK.robot
    if(s.type === "MEASURE_DEMO" || s.type === "MEASURE_ASK" || s.type === "COMPARE_MEASURED"){
      if(s.type === "COMPARE_MEASURED" || d.keep_holder) (HOLDER[d.holder] || ["toybox_back", "toybox_front"]).forEach(img);   // MDK.toybox / basket / holder / painting
      img("badge_result"); out.push("assets/badge_star.svg");                       // MDK.plate
    }
    if(d.holder === "painting" && d.keep_holder) out.push("assets/painting_answer_order.webp");
    if(d.floor === "wood") out.push("assets/floor_planks.svg");
    if(s.type === "MEASURE_DEMO") out.push(art("sw_lg_celebrating_anim.webp"));     // MDK.pose("cheer")
    if(s.type === "CLASSROOM_FIT" && A.image && A.image.scene_classroom) out.push(A.image.scene_classroom);
    if(s.type === "CELEBRATION"){ img("end_screen"); out.push(art("sw_lg_celebrating_anim.webp"), vo("sfx_celebrate")); }
    if(s.phase === "tutorial" && s.type !== "CELEBRATION") img("start_mascot");      // the tutorial card's Swiftie
    return out;
  }
  const PEEK = art("peeking.webp");
  const FONTS = ["assets/fonts/baloo2-800.woff2", "assets/fonts/baloo2-700.woff2", "assets/fonts/baloo2-600.woff2"];
  function gateFiles(phase){ return [PEEK, vo(PHASE_GATE_VO[phase])].filter(Boolean); }
  function init(){
    if(items.size) return;
    /* CRIT: the landing - what the boot loader waits for */
    ["startnew_bg_plain.webp", "start_card.webp", "background_1st_screen.webp", "pencil_purple.webp", "pencil_face_rig.webp",
     "cubes_blue_row.webp", "btn-play-round-waiting.svg", "btn-play-round.svg", "bgdeco_star.svg", "bgdeco_star_o.svg",
     "bgdeco_spark.svg"].forEach(f => add("assets/" + f, CRIT));
    add(art("new_landing_swiftee_anim.webp"), CRIT);                                // Swiftee's wave (sgMascotPlayer reads its Blob)
    add(FONTS[0], CRIT);                                                            // the title's weight; the others next
    add(vo("vo_landing"), CRIT);
    /* each slide, in lesson order: whenSlide's lists */
    const ids = Object.keys(A.audio || {});
    (CARD.slides || []).forEach((s, i)=>{
      const t = JSON.stringify(s), list = FONTS.slice();                            // (every slide: no text in a fallback face)
      (t.match(/assets\/[\w\/.\-]+\.(?:webp|png|svg|jpg|gif|ogg|mp3)/g) || []).forEach(src => list.push(src));
      ids.forEach(k =>{ if(t.indexOf('"' + k + '"') >= 0) list.push(vo(k)); });
      slideArt(s).forEach(src => list.push(src));
      const prev = CARD.slides[i - 1];
      if(PHASE_GATE_TITLE[s.phase] && (!prev || prev.phase !== s.phase)) gateFiles(s.phase).forEach(src => list.push(src));
      perSlide[i] = [...new Set(list)].filter(known);
      perSlide[i].forEach(src => add(src, i));
    });
    /* ...and EVERY other shipped file: the bar reaches 100% only when the whole lesson is local */
    Object.keys(ASSET_SIZES).forEach(src => add(src, REST));
  }
  /* the spinner: a slide that is still waiting for its own files */
  let waiting = 0;
  function spin(on){
    let el = document.getElementById("assetWait");
    if(!el){ el = document.createElement("div"); el.id = "assetWait"; el.className = "asset-wait"; el.setAttribute("aria-hidden", "true"); document.body.appendChild(el); }
    waiting = Math.max(0, waiting + (on ? 1 : -1));
    el.classList.toggle("show", waiting > 0);
  }
  function whenSlide(i, cb, phase){
    if(OFF || !perSlide[i]){ cb(); return; }
    const srcs = perSlide[i].concat(phase ? gateFiles(phase) : []);
    const pend = srcs.filter(s =>{ const it = items.get(s); return it && it.st !== 2; });
    if(!pend.length){ cb(); return; }
    pend.forEach(s =>{ const it = items.get(s); if(it.st === 0 && it.tag > GATE) it.tag = GATE; });   // jump the queue
    start();
    let fired = false, spun = false;
    const t0 = setTimeout(()=>{ if(!fired){ spun = true; spin(true); } }, 300);
    const go = ()=>{ if(fired) return; fired = true; clearTimeout(t0); clearTimeout(t1); if(spun) spin(false); cb(); };
    const t1 = setTimeout(go, 8000);
    whenDone(pend, go);
  }
  function start(){ if(!started){ started = true; init(); } pump(); }
  /* critical(extra, cb): cb once the landing's own files are in, and the extra promise (Swiftee's wave) has settled */
  function critical(extra, cb){
    init(); hold = true; start();
    const crit = [...items.values()].filter(it => it.tag <= CRIT).map(it => it.src);
    let left = 2; const one = ()=>{ if(--left === 0) release(); };
    const release = ()=>{ if(!hold) return; hold = false; pump(); cb(); };
    whenDone(crit, one);
    if(extra && extra.then) extra.then(one, one); else one();
    setTimeout(release, 10000);                                  // (the boot loader's own watchdog lifts it then too)
  }
  /* blobOf(src): a promise of the file's Blob (null when it could not be fetched) - sgMascotPlayer's one download */
  function blobOf(src){
    return new Promise(res =>{
      if(!HTTP || !known(src)) return res(null);
      init(); const it = items.get(src);
      const give = ()=> res(blobs.get(src) || null);
      if(!it || it.st === 2) give(); else it.cbs.push(give);
    });
  }
  /* url(src): one shared blob: URL of a fetched file, else the file's own path */
  function url(src){
    if(!blobs.has(src)) return src;
    if(!urls.has(src)) urls.set(src, URL.createObjectURL(blobs.get(src)));
    return urls.get(src);
  }
  /* a fresh blob: URL of a fetched animation (it plays from frame 0), else the file with a cache-bust (file://) */
  function fresh(src){ const b = blobs.get(src); return b ? URL.createObjectURL(b) : src + "?r=" + Date.now(); }
  /* ---- blob: swap: an <img>/<audio>/<video> given a fetched file's path shows the local copy instead. Only at the
     moment it is given the path (never a picture already on screen: no flash), and not on the landing card, whose
     pencil rules match its src. data-asset keeps the path (srcOf). A blob: URL that errors goes back, once, to the
     file's own URL (and a playing clip resumes). */
  function swap(el){
    if(!el || el._noBlob || !el.getAttribute) return;
    const s = el.getAttribute("src");
    if(!s || !blobs.has(s) || (el.closest && el.closest("#startGate"))) return;
    el.setAttribute("data-asset", s);
    if(!el._blobFallback){
      el._blobFallback = true;
      el.addEventListener("error", function onErr(){
        if(!/^blob:/.test(el.getAttribute("src") || "")) return;
        el.removeEventListener("error", onErr); el._noBlob = true;
        const playing = el.tagName !== "IMG" && el._wantPlay;
        el.setAttribute("src", el.getAttribute("data-asset"));
        if(playing && el.play) el.play().catch(()=>{});
      });
      if(el.tagName !== "IMG"){ el.addEventListener("play", ()=>{ el._wantPlay = true; }); el.addEventListener("pause", ()=>{ el._wantPlay = false; }); }
    }
    el.setAttribute("src", url(s));
  }
  const SWAP_SEL = "img[src],audio[src],video[src],source[src]";
  if(HTTP && !OFF && typeof MutationObserver === "function"){
    new MutationObserver(recs =>{
      for(const r of recs){
        if(r.type === "attributes"){ if(r.target.matches && r.target.matches(SWAP_SEL)) swap(r.target); continue; }
        r.addedNodes.forEach(n =>{
          if(n.nodeType !== 1) return;
          if(n.matches(SWAP_SEL)) swap(n);
          if(n.firstElementChild) n.querySelectorAll(SWAP_SEL).forEach(swap);
        });
      }
    }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });
  }
  return { CRIT: CRIT, GATE: GATE, UI: UI, REST: REST, start: start, critical: critical, whenSlide: whenSlide,
           ready: ready, blob: src => blobs.get(src) || null, blobOf: blobOf, url: url, fresh: fresh };
})();
/* srcOf(el): the file an element shows - its path, even while it plays a blob: URL of it (Assets) */
function srcOf(el){ return el ? (el.getAttribute("data-asset") || el.getAttribute("src") || "") : ""; }

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
     greeting, so the pop still lands exactly when the greeting ends. Never strands the child: an 18s
     watchdog releases the button even if the greeting never reports back at all.
     NB the waiting state is .sg-waiting + aria-disabled, NOT the disabled attribute - a disabled
     button swallows the tap that has to start a blocked greeting. */
  let _greetingHeard = false, _startIdleT = 0, _startWatchT = 0, _starting = false;
  const onLandingNow = ()=> { const g = $("startGate"); return g && !g.classList.contains("hidden"); };
  const startWaiting = ()=>{ const b = $("sgBtn"); return !b || b.classList.contains("sg-waiting"); };
  const disarmStartPulse = ()=>{ clearTimeout(_startIdleT); _startIdleT = 0; const b = $("sgBtn"); if(b) b.classList.remove("idle-pulse"); };
  const armStartPulse = ()=>{
    disarmStartPulse();
    /* QA checklist 2026-10-05: "the Play button pulsates immediately after the VO is complete" - it starts pulsing as
       its one-shot pop settles (was: only after 5s untouched) */
    _startIdleT = setTimeout(()=>{ const b = $("sgBtn"); if(b && !startWaiting() && onLandingNow()) b.classList.add("idle-pulse"); }, 600);
  };
  const setStartBtnReady = (ready)=>{
    const b = $("sgBtn"); if(!b) return;
    const img = b.querySelector("img");
    const was = !startWaiting();
    b.disabled = false;
    b.classList.toggle("sg-waiting", !ready);
    b.setAttribute("aria-disabled", ready ? "false" : "true");
    if(img) img.src = ready ? "assets/btn-play-round.svg" : "assets/btn-play-round-waiting.svg";   // HI02H11_L01_S01's round play button (review 2026-10-06)
    if(!ready){ disarmStartPulse(); b.classList.remove("sg-pop"); return; }
    if(!was){ b.classList.remove("sg-pop"); void b.offsetWidth; b.classList.add("sg-pop");
      setTimeout(()=> b.classList.remove("sg-pop"), 900); }
    armStartPulse();
  };
  setStartBtnReady(false);   // grey + disabled from first paint, until the greeting has been heard
  /* [landing intro] the gold pop waits for the whole intro too (title words -> cubes -> lines, "sg-intro-done"),
     so the button is the LAST thing to arrive (review 2026-09-29). The 18s watchdog still forces it - never stranded. */
  let _releasePending = false;
  const releaseStart = (force)=>{ if(!force && !window.__sgIntroDone){ _releasePending = true; return; }
    clearTimeout(_startWatchT); _releasePending = false; if(onLandingNow()) setStartBtnReady(true); };
  document.addEventListener("sg-intro-done", ()=>{ if(_releasePending) releaseStart(); });
  const playLanding = ()=>{
    if(!onLandingNow()) return;
    clearTimeout(_startWatchT); _startWatchT = setTimeout(()=> releaseStart(true), 18000);   // watchdog (forces it; 18s: the intro now starts on "आज", ends ~13.5s)
    /* released only when the greeting was really heard; a blocked/failed start leaves it grey for the
       child's first tap (or the watchdog) */
    /* review 2026-10-05: "why is the sound box getting disabled - this should not happen anywhere in the game": the
       speaker is never greyed out (the QA checklist's disabled-while-the-greeting-speaks state is gone). A tap while the
       greeting is still playing is ignored, as on every speaker (replayTap), so it never restarts the line mid-way. */
    play(landSrc, ()=>{ if(voEl.ended){ _greetingHeard = true; releaseStart(); } });
  };
  // any tap on the landing restarts the 5s idle timer (only once the button is live)
  window.addEventListener("pointerdown", ()=>{ if(onLandingNow() && !startWaiting()) armStartPulse(); }, true);
  const sgVo = $("sgVo"); if(sgVo) sgVo.onclick = (e)=>{ e.stopPropagation();
    if(replayTap(null, "landing_chip")) playLanding(); };   // [QA 11] the landing chip reports audio_replayed too
  /* ---- [landing mascot player] (review 2026-09-29: "swifty is getting glitched ... at the starting only"). Measured
     on the landing with a frame-by-frame screen recording: in about half the loads Chrome paints NOTHING where Swifty
     is for 1-2 frames, exactly when the <img>'s animated WebP (alpha) steps to its next frame while the landing
     is busy starting up - with the original HI01 file too. A canvas cannot blink like that: it keeps its last picture
     until the next one is drawn. So where the browser can decode the file itself (WebCodecs ImageDecoder), Swifty is
     drawn on a canvas at its displayed size, the next frame always decoded ahead. Anything missing or failing (no
     ImageDecoder, a decode error, not ready when the loader lifts) keeps the plain <img> and its restart below.
     [loading] ONE download (2026-10-01): the clip used to be fetched for the decoder AND pulled by the <img src> beside
     it - 1.6MB twice on the landing's critical path, and once more by the ?r= restart. The <img> has only a data-src
     now: the file is fetched once (index.html starts it with the page, on http(s)), the decoder reads those bytes,
     and the <img> path shows them as a blob: URL. file:// can't fetch(): there the plain <img src>, as before.
     `ready` settles once Swiftee can be shown - one of the things the boot loader waits for. ---- */
  const sgMascotPlayer = (()=>{
    const img = document.querySelector(".sg-mascot");
    if(!img) return null;
    const url = img.getAttribute("data-src") || (img.getAttribute("src") || "").split("?")[0], TYPE = "image/webp";
    let dec = null, count = 0, first = null, ok = false, dead = false, blob = null, blobUrl = "", pending = true;
    const shown = ()=> new Promise(res =>{
      if(img.complete && img.naturalWidth) return res();
      img.onload = ()=> res(); img.onerror = ()=>{ img.style.display = "none"; res(); };
    });
    const show = src =>{ img.removeAttribute("data-src"); img.src = src; return shown(); };
    const ready = (async ()=>{                                     // fetch + decode start at once, under the loader
      let buf = null;
      try{ const b = await Assets.blobOf(url); if(b){ blob = new Blob([b], { type: TYPE }); buf = await blob.arrayBuffer(); } }catch(e){}   // the loader's one download (Assets, CRIT)
      if(!buf){ pending = false; return show(url); }
      try{
        if(typeof ImageDecoder !== "undefined" && !(ImageDecoder.isTypeSupported && !(await ImageDecoder.isTypeSupported(TYPE)))){
          dec = new ImageDecoder({ data: buf, type: TYPE });
          await dec.tracks.ready; count = dec.tracks.selectedTrack.frameCount;
          first = (await dec.decode({ frameIndex: 0 })).image;
          ok = count > 0 && !dead;
        }
      }catch(e){ ok = false; }
      pending = false;
      if(!ok) return show(blobUrl = URL.createObjectURL(blob));
    })().catch(()=>{ ok = false; pending = false; });
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
    /* the plain <img>: the wave from frame 0 again - a fresh blob: URL of the same bytes (file://: a cache-bust of the
       local file). Still downloading (the watchdog lifted the loader first): it shows from frame 0 when it lands. */
    function restart(){
      if(!img.isConnected || pending) return;
      const old = blobUrl;
      if(blob){ img.src = blobUrl = URL.createObjectURL(blob); if(old) URL.revokeObjectURL(old); }
      else img.src = url + "?r=" + Date.now();
    }
    return { start, restart, ready };
  })();
  // ---- [engine JS] r4/P2 boot loader: the loader until the LANDING's own files are in (Assets: CRIT + Swiftee's wave),
  // then it dismisses ITSELF into the landing (NO tap gate) - the rest of the lesson keeps loading behind the landing.
  // A 10s watchdog never strands the child; .done dedups the two. The same handler adds body.loaded (unblocks the
  // concept-strip stagger) and fires the landing VO. play() absorbs an autoplay block; the pulsing 🔊 chip is the fallback.
  // ===== QA CHECKLIST [02]: PRELOAD BEFORE THE START SCREEN - since 2026-10-01 only what the START SCREEN shows. It
  // used to be every image and clip of the lesson ([loading], Assets); each slide now waits for its own files instead
  // (mountSlide), so art and VO still never pop in mid-lesson. A FAILED ASSET COUNTS AS DONE: a 404 never strands. ----
  (function(){
    const bl = $("bootLoader");
    if(!bl){ document.body.classList.add("loaded"); playLanding(); Assets.start(); return; }
    const ready = ()=>{
      if(bl.classList.contains("done")) return;   // the files + the watchdog both land here → dedup
      bl.classList.add("done");
      document.body.classList.add("loaded");       // starts the .sg-acell pop chain
      /* [QA 03] the landing wave plays ONCE (the .webp's loop count is 1). It decodes under the loader, so without a
         restart the one wave would be spent before the child sees it: the moment the loader lifts it starts again
         from frame 0 - on the canvas player, or a fresh blob: URL of the same bytes (no second download). */
      if(sgMascotPlayer && !sgMascotPlayer.start()) sgMascotPlayer.restart();
      playLanding();
      setTimeout(()=> bl.remove(), 450);
    };
    Assets.critical(sgMascotPlayer && sgMascotPlayer.ready, ready);
    setTimeout(ready, 10000);   // hard watchdog: never strand the child on the loader
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
    if(_starting) return;  // a second tap while slide 0's files finish loading
    disarmStartPulse(); clearTimeout(_startWatchT);
    stopAudio();          // silence the landing greeting BEFORE slide 0 speaks (no VO overlap)
    sfxPlay();            // QA checklist 2026-10-05: the standard play button SFX
    bgmStart();           // ...and the background music starts on this tap (never before it)
    _ac();                // unlock/resume WebAudio on the start gesture so the first clip never clips
    Screen.fullscreen();  // [responsive] a phone/tablet browser: the whole screen, held in landscape (Android)
    // [engine JS] r4/P1: peek gate into the tutorial. The landing stays visible-and-BLURRED behind the
    // peeking Swiftie + "चलिए शुरू करें"; it hides once the tutorial mounts (in the callback).
    // [loading] the gate's Swiftie and slide 0 are almost always in long before this tap; if not, a spinner holds here.
    _starting = true;
    Assets.whenSlide(0, ()=>{
      _gatedPhases.add("tutorial");
      phaseBlurTransition(()=>{
        _starting = false;
        $("startGate").classList.add("hidden");
        document.body.classList.remove("is-start");   // blue bg only on the title screen
        mountSlide(0);
      }, "tutorial");
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
    /* "दोस्तों" starts, in vo_landing.ogg (seconds). QA checklist 2026-10-05: the play button pulses the moment the greeting
       ends and nothing else moves then - so the title fx (~4.4s) + the cube row (~3.3s) must be done before the 9.2s
       greeting ends: it starts with the greeting itself (measured in Chrome: title fx 7.66s at SLOW 1.5 + cubes 3.32s at
       STEP 400 ran 1.8s past the greeting - now ~6.1s + ~2.7s, done ~9.1s). Was "आज" (3.13s in the old 7.5s clip). */
    /* Review 2026-10-07: "the title animation will start from 'आज हम सीखेंगे लंबाई कैसे मापते हैं' and not from 'नमस्ते
       दोस्तों' - when Swifty is saying that, that is logically correct": it starts on the spoken "आज" again - 4.69s into
       the current 9.2s vo_landing.ogg (its pauses, ffmpeg silencedetect -35dB: नमस्ते दोस्तों 0.29-1.40 | मैं हूँ स्विफ्टी
       2.45-3.66 | आज हम सीखेंगे 4.69-5.85 | किसी चीज़ की लंबाई कैसे मापते हैं 6.36-9.2). So the intro (title ~6.1s, then
       the cubes ~2.7s) now runs on ~4.3s past the greeting; the play button still pops once it is all done
       ("sg-intro-done"), and its watchdog waits 18s (was 15s) so it never cuts the intro short. */
    const T_WORD = 4.69;
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
    const SLOW = 1.2;   // QA checklist 2026-10-05: was 1.5 - the whole intro must end with the greeting (see T_WORD)                                                                        // one clock for the whole title animation: 1.5x slower, and it starts on "आज", 2.33s earlier -
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
      const onLanding = srcOf(voEl).indexOf("vo_landing") >= 0;
      const ct = onLanding ? voEl.currentTime : 0;
      if(onLanding && ct + 0.3 < lastCt && (phase === "pull" || phase === "recoil")){ restW1(); phase = "idle"; }   // greeting restarted
      if(onLanding) lastCt = ct;
      const speaking = onLanding && isPlaying;
      // लंबाई: on the word (again on a replay)
      if(phase === "idle" && speaking && ct >= T_WORD - 0.03 && ct < T_WORD + 2){   // (a 2s window: right at the clip's start the page may still be busy - a missed window left the button to its 15s watchdog)
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

  // tapping आगे clears any pending nav-nudge, and sounds the standard next-button SFX
  $("navBtn").addEventListener("click", ()=>{ clearTimeout(state.navNudgeTimer); stopNudge(); sfxNext(); });
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
  const MARK_DUR = 350, CUBES_AFTER = 120, STEP = 280, CUBE_DUR = 420, WATCHDOG = 16000;   // ms; watchdog: never wait for the title fx forever
  const FIRST = MARK_DUR + CUBES_AFTER;                                                    // the first cube, once the lines are in
  let built = false;
  function build(){
    const hero = document.getElementById("sgHero"), pen = hero && hero.querySelector("img");
    if(!pen || !pen.complete || !pen.offsetWidth) return false;
    const x0 = pen.offsetLeft + pen.offsetWidth * TIP, x1 = pen.offsetLeft + pen.offsetWidth * END;
    const yTop = pen.offsetTop + pen.offsetHeight * INK_TOP, yBot = pen.offsetTop + pen.offsetHeight * INK_BOT;
    /* every cube EXACTLY square and all the same (review 2026-09-30: "same size length and breadth of cubes in all the
       slides strictly"): CW = the pencil's span / N - the pencil is sized (CSS [one cube]) so that is MDK.CUBE - and each
       cube's slice of the strip is stretched to CW x CW (the strip's cubes are 205-213 px wide as drawn), as MDK.cube does */
    const C = ROW.cuts, CW = (x1 - x0) / N, ky = CW / (ROW.bot - ROW.top);
    const top = yBot + GAP, cubeBot = yBot + GAP + CW;
    const box = document.createElement("div"); box.className = "sg-measure"; box.setAttribute("aria-hidden", "true");
    /* SHADOWS on the table (review 2026-09-29: "make it look like the cubes are placed on the table ... and the cubes
       making shadow on the table"): the cubes' bases stand on the tabletop, ~27px in front of its back edge, so each
       cube gets a soft contact shadow ON the table - darkest right at its base, fading out in front of it - laid down
       BEHIND the cubes and the dashed lines (first in the box). The light comes from the window on the left, so the
       row's shadow sits SH_DX px to the right and trails a little further past the last cube. Each shadow grows in as
       its own cube lands (same delay: CSS .sgm-shadow). */
    const SH_UP = 5, SH_H = 21, SH_DX = 3, SH_TAIL = 16;              // stage px
    for(let i = 0; i < N; i++){
      const l = x0 + i * CW + SH_DX, wd = CW + (i === N - 1 ? SH_TAIL : 0);
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
      const ci = 0;                                                     // review 2026-10-05: every cube the strip's first, deep-blue one
      const kx = CW / (C[ci + 1] - C[ci]);                              // this slice, stretched to exactly CW wide
      b.style.cssText = "left:" + (x0 + i * CW).toFixed(2) + "px;top:" + top.toFixed(2) + "px;width:" + CW.toFixed(2) + "px;height:" + CW.toFixed(2) + "px;--d:" + (FIRST + i * STEP) + "ms;" +
        "background-image:url(" + ROW.src + ");background-size:" + (ROW.w * kx).toFixed(2) + "px " + (ROW.h * ky).toFixed(2) + "px;background-position:" + (-C[ci] * kx).toFixed(2) + "px " + (-ROW.top * ky).toFixed(2) + "px";
      box.appendChild(b);
    }
    /* dashed end lines, centred on the tip and on the eraser end. Length as marked on the review screenshot
       (2026-09-29, "this much lining would be fine"): from LINE_TOP px below the pencil's top down to LINE_END px
       below the blocks (measured there: 58 -> ~221 px on a 1.144x screenshot = top+10 .. blocks+14 stage px) */
    const DASH = 12, PERIOD = 19;                                       // CSS .sgm-mark: a 12px dash every 19px, from the top
    const y0 = yTop + LINE_TOP, want = cubeBot + LINE_END - y0;
    const nDash = Math.max(Math.round((want + PERIOD - DASH) / PERIOD), Math.ceil((cubeBot + 6 - y0 + PERIOD - DASH) / PERIOD));
    const y1 = y0 + nDash * PERIOD - (PERIOD - DASH);                  // ends on a WHOLE dash (review: the last one was cut off), still below the cubes
    /* review 2026-10-05: "match the behaviour of the dotted lines in the game screens" - as the game's end lines
       (.md-line show + pulse): each DRAWS itself from the top down, then glows; the start line first, the end line
       after it (END_AT) - the size and colour are the landing's own. They are done before the last cube lands. */
    const marksAt = { start: 0, end: 250 };                            // the lines come FIRST, then the cubes
    [["start", x0], ["end", x1]].forEach(([k, x])=>{
      const e = document.createElement("div"); e.className = "sgm-mark " + k;
      e.style.cssText = "left:" + (x - LINE_W / 2).toFixed(2) + "px;top:" + y0.toFixed(2) + "px;width:" + LINE_W + "px;height:" + (y1 - y0).toFixed(2) + "px;--d:" + marksAt[k] + "ms";
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
    /* QA checklist 2026-10-05: while the play button pulses nothing else on the screen moves - the eyes rest on it */
    if(btn && btn.classList.contains("idle-pulse")) return btn;
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
    if(!img || !/pencil_purple/.test(srcOf(img))) return;   // the rig is measured on this pencil only
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
