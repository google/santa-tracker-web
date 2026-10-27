/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import api from '../../src/scene/api.js';
import '../../src/magic.js';
import { _msg } from '../../src/magic.js';
import {
  ELVES, TUNE, SLEIGHS, SNOW, SNOW_PILE, GUST, WAVES, SKIN_TONES, CATS,
  ELF_LABELS, msgSleighAway, W, H, FLOOR_H, BUILD_X0, BUILD_X1,
  GROUND_Y, LADDER_CX, TAP_SPLIT, TEETER_X, DROP_X0, DROP_X1, DROP_CX,
  CHUTE_BX, CHUTE_CX, MACH_CX, SPINE_X, WRAP_X, LINE_SPEED, BIN_X, BIN_Y,
  SLEIGH_X, SLEIGH_Y, ELF_MIN_X, ELF_MAX_X, CARRY_OFF, GIFT_R,
  feetY, beltY, chuteY, elfCarryOff, carryY, TUT, KEYMAP,
} from './constants.js';
import {
  cv, fit, toGame, reduceMotion, viewX0, viewY0, viewX1, viewY1, renderScene, isTutOkClick,
} from './renderer.js';

api.preload.sounds('pd_load_sounds', 'qd_load_sounds');

// Startup cleanup: only clear ?tune slider keys from localStorage, not general elfexpress settings
try {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && /\btune\b|[_.-]tune|tune[_.-]/i.test(k)) localStorage.removeItem(k);
  }
} catch (_) {}
TUNE.speedPct = 100;
TUNE.runSpeed = TUNE.baseRunSpeed || 1200;
TUNE.climbSpeed = TUNE.baseClimbSpeed || 700;

let S = null;
let elfChoice = 0;
let shortcutWave = 0;
let tunePanelEl = null;
let tuneControls = null;

function parseWaveShortcut(data) {
  let raw = data && data.wave;
  if (raw === undefined || raw === null || raw === '') {
    try {
      raw = new URLSearchParams(window.location.search).get('wave');
    } catch (_) {}
  }
  if ((raw === undefined || raw === null || raw === '') && document.referrer) {
    try {
      raw = new URL(document.referrer).searchParams.get('wave');
    } catch (_) {}
  }
  if (raw === undefined || raw === null || raw === '') {
    try {
      raw = new URLSearchParams(window.top.location.search).get('wave');
    } catch (_) {}
  }
  const n = parseInt(raw, 10);
  return (n >= 1 && n <= WAVES.length) ? n : 0;
}

function hasTuneFlag(data) {
  if (data && data.tune !== undefined) return true;
  try {
    if (new URLSearchParams(window.location.search).has('tune')) return true;
  } catch (_) {}
  if (document.referrer) {
    try {
      if (new URL(document.referrer).searchParams.has('tune')) return true;
    } catch (_) {}
  }
  try {
    if (new URLSearchParams(window.top.location.search).has('tune')) return true;
  } catch (_) {}
  return false;
}

function syncTunePanel() {
  if (!tuneControls) return;
  const w = S ? wave() : WAVES[0];
  const wNum = w ? w.wave : 1;
  const openF = S ? activeFloors() : (w.floors || 2);
  tuneControls.title.textContent = 'Tuning (Sleigh ' + wNum + ' · ' + openF + 'F)';
  tuneControls.flowGap.input.value = w.flowGap;
  tuneControls.flowGap.val.textContent = Number(w.flowGap).toFixed(2) + 's';
  tuneControls.burstGap.input.value = w.burstGap;
  tuneControls.burstGap.val.textContent = Number(w.burstGap).toFixed(2) + 's';
  tuneControls.burstSize.input.value = w.burstSize;
  tuneControls.burstSize.val.textContent = String(w.burstSize);
  tuneControls.breathe.input.value = w.breathe;
  tuneControls.breathe.val.textContent = Number(w.breathe).toFixed(1) + 's';
  tuneControls.teeter.input.value = w.teeter;
  tuneControls.teeter.val.textContent = Number(w.teeter).toFixed(2) + 's';
  const pct = TUNE.speedPct || 100;
  tuneControls.speed.input.value = pct;
  tuneControls.speed.val.textContent = `${pct}% (${TUNE.runSpeed}/${TUNE.climbSpeed} px/s)`;
  tuneControls.relax.input.value = TUNE.relaxTime;
  tuneControls.relax.val.textContent = Number(TUNE.relaxTime).toFixed(1) + 's';
}

function initTunePanel() {
  if (S) S.tuneMode = true;
  if (tunePanelEl) {
    syncTunePanel();
    return;
  }
  const stg = document.getElementById('stage') || document.body;
  const panel = document.createElement('div');
  panel.id = 'tunePanel';
  panel.className = 'tune-panel';
  ['pointerdown', 'mousedown', 'touchstart', 'click', 'keydown'].forEach(evName => {
    panel.addEventListener(evName, ev => ev.stopPropagation());
  });

  const titleRow = document.createElement('div');
  titleRow.className = 'tune-panel-title';
  const titleSpan = document.createElement('span');
  titleSpan.textContent = 'Tuning (Wave 1)';
  titleRow.appendChild(titleSpan);
  panel.appendChild(titleRow);

  const makeSlider = (labelTxt, min, max, step, initVal, fmt, onInput) => {
    const row = document.createElement('div');
    row.className = 'tune-row';
    const lbl = document.createElement('label');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = labelTxt;
    const valSpan = document.createElement('span');
    valSpan.textContent = fmt(initVal);
    lbl.appendChild(nameSpan);
    lbl.appendChild(valSpan);
    const inp = document.createElement('input');
    inp.type = 'range';
    inp.min = String(min);
    inp.max = String(max);
    inp.step = String(step);
    inp.value = String(initVal);
    inp.addEventListener('input', () => {
      const v = parseFloat(inp.value);
      onInput(v);
      valSpan.textContent = fmt(v);
    });
    inp.addEventListener('change', () => {
      inp.blur();
      cv.focus({ preventScroll: true });
    });
    row.appendChild(lbl);
    row.appendChild(inp);
    panel.appendChild(row);
    return { input: inp, val: valSpan };
  };

  const w0 = S ? wave() : WAVES[0];
  const flowGapCtrl = makeSlider('Flow gap', 0.5, 3.5, 0.05, w0.flowGap, v => v.toFixed(2) + 's', v => {
    const w = S ? wave() : WAVES[0];
    w.flowGap = v;
    if (S && S.waveQueue) {
      for (const ev of S.waveQueue) {
        if (ev.delayType === 'flow') ev.delay = v;
      }
    }
  });
  const burstGapCtrl = makeSlider('Burst gap', 0.3, 2.5, 0.05, w0.burstGap, v => v.toFixed(2) + 's', v => {
    const w = S ? wave() : WAVES[0];
    w.burstGap = v;
    if (S && S.waveQueue) {
      for (const ev of S.waveQueue) {
        if (ev.delayType === 'burst') ev.delay = v;
      }
      if (S.phase === 'burst') S.spawnTimer = Math.min(S.spawnTimer, v);
    }
  });
  const burstSizeCtrl = makeSlider('Burst size', 0, 6, 1, w0.burstSize, v => String(Math.round(v)), v => {
    const w = S ? wave() : WAVES[0];
    w.burstSize = Math.round(v);
    SLEIGHS[w.wave - 1] = w.flowCount + (w.speedUpCount || 0) + w.burstSize;
  });
  const breatheCtrl = makeSlider('Breathe', 1.0, 6.0, 0.2, w0.breathe, v => v.toFixed(1) + 's', v => {
    const w = S ? wave() : WAVES[0];
    w.breathe = v;
    TUNE.relaxTime = v;
  });
  const teeterCtrl = makeSlider('Teeter time', 0.8, 3.5, 0.05, w0.teeter, v => v.toFixed(2) + 's', v => {
    const w = S ? wave() : WAVES[0];
    w.teeter = v;
    TUNE.teeterTime = v;
    if (S && S.gifts) {
      for (const g of S.gifts) if (!g.tutGift) g.teeter = v;
    }
  });
  const speedCtrl = makeSlider(
    'Elf speed',
    50,
    150,
    5,
    TUNE.speedPct || 100,
    v => `${Math.round(v)}% (${TUNE.runSpeed}/${TUNE.climbSpeed} px/s)`,
    v => {
      TUNE.speedPct = Math.round(v);
      TUNE.runSpeed = Math.round((TUNE.baseRunSpeed || 1200) * (TUNE.speedPct / 100));
      TUNE.climbSpeed = Math.round((TUNE.baseClimbSpeed || 700) * (TUNE.speedPct / 100));
    }
  );
  const relaxCtrl = makeSlider('Relax pause', 0.5, 4.0, 0.1, TUNE.relaxTime, v => v.toFixed(1) + 's', v => {
    TUNE.relaxTime = v;
    TUNE.sleighFlyTime = v;
  });

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.id = 'btnCopyTune';
  copyBtn.className = 'tune-copy-btn';
  copyBtn.textContent = 'Copy values';
  copyBtn.addEventListener('click', () => {
    const w = S ? wave() : WAVES[0];
    const summary = `Wave ${w.wave}: floors=${w.floors}, flowGap=${Number(w.flowGap).toFixed(2)}s, burstGap=${Number(w.burstGap).toFixed(2)}s, burstSize=${w.burstSize}, breathe=${Number(w.breathe).toFixed(1)}s, teeter=${Number(w.teeter).toFixed(2)}s, elfSpeed=${TUNE.speedPct || 100}% (${TUNE.runSpeed}/${TUNE.climbSpeed} px/s), relax=${Number(TUNE.relaxTime).toFixed(1)}s`;
    const finishCopy = () => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy values'; }, 1400);
      copyBtn.blur();
      cv.focus({ preventScroll: true });
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summary).then(finishCopy).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = summary;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        ta.remove();
        finishCopy();
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = summary;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      ta.remove();
      finishCopy();
    }
  });
  panel.appendChild(copyBtn);
  stg.appendChild(panel);

  tunePanelEl = panel;
  tuneControls = {
    title: titleSpan,
    flowGap: flowGapCtrl,
    burstGap: burstGapCtrl,
    burstSize: burstSizeCtrl,
    breathe: breatheCtrl,
    teeter: teeterCtrl,
    speed: speedCtrl,
    relax: relaxCtrl,
    copyBtn,
  };
  syncTunePanel();
}

function selectElf(box, idx, focusBtn) {
  elfChoice = (idx + ELVES.length) % ELVES.length;
  const btns = box.querySelectorAll('.elf-card');
  btns.forEach((btn, j) => {
    const sel = j === elfChoice;
    btn.setAttribute('aria-checked', sel ? 'true' : 'false');
    btn.tabIndex = sel ? 0 : -1;
    if (sel && focusBtn) btn.focus();
  });
}

function buildElfPicker() {
  document.querySelectorAll('.elf-picker').forEach(box => {
    box.setAttribute('aria-label', _msg`elfexpress_pick_elf`);
    if (box.querySelectorAll('.elf-card').length === ELVES.length) {
      selectElf(box, elfChoice, false);
      return;
    }
    box.innerHTML = '';
    ELVES.forEach((d, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'elf-card';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', i === elfChoice ? 'true' : 'false');
      b.tabIndex = i === elfChoice ? 0 : -1;
      b.setAttribute('aria-label', ELF_LABELS[i] || ('Elf ' + (i + 1)));
      b.innerHTML = '<img alt="" style="height:' + Math.round(d.front.h / 606 * 100) + '%;margin-top:auto" src="' + d.front.src + '">';
      b.style.display = 'flex';
      b.style.flexDirection = 'column';
      b.addEventListener('click', () => selectElf(box, i, true));
      b.addEventListener('keydown', ev => {
        if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') {
          ev.preventDefault(); selectElf(box, i + 1, true);
        } else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') {
          ev.preventDefault(); selectElf(box, i - 1, true);
        } else if (ev.key === 'Enter') {
          ev.preventDefault(); b.blur(); start(shortcutWave || 0);
        }
      });
      box.appendChild(b);
    });
  });
}

function makeSnow() {
  return Array.from({ length: 160 }, (_, i) => {
    const isLarge = i % 8 === 0;
    const r = isLarge ? 2.6 + Math.random() * 2.0 : 1.2 + Math.random() * 1.6;
    return {
      x: -300 + Math.random() * (W + 600),
      y: -80 + Math.random() * (H + 160),
      r,
      vy: 52 + r * 28 + Math.random() * 28,
      sw: 0.8 + Math.random() * 1.8,
      ph: Math.random() * 6.28,
      a: 0.5 + Math.random() * 0.5,
      crystal: false,
      large: isLarge,
    };
  });
}

function reportScore() {
  if (!S) return;
  api.score({
    score: S.score,
    level: Math.min(S.sleighsDone + 1, SLEIGHS.length),
    maxLevel: SLEIGHS.length,
  });
}

function newGame() {
  if (!tunePanelEl) {
    TUNE.speedPct = 100;
    TUNE.runSpeed = TUNE.baseRunSpeed || 1200;
    TUNE.climbSpeed = TUNE.baseClimbSpeed || 700;
  }
  S = {
    mode: 'play', t: 0, uiT: 0, beltAnimT: 0, score: 0, combo: 0,
    sleighsDone: 0, inSleigh: 0, recycled: 0, waveRecycled: 0, missed: 0, misfiled: 0,
    unlockedFloors: 2,
    waveStars: Array.from({ length: SLEIGHS.length }, () => false), lastSleighStar: true,
    firstMissFlashed: false,
    phase: 'flow', relaxT: 0, sleighFlyT: 0, sleighFlyDur: 1.8, sleighFlyGifts: 0,
    breatheCueT: 0, breatheCueDur: 3.0, breatheSlowT: 0, breatheArmed: false,
    sleighTimer: 0,
    twoHandsBoxUp: false, twoHandsIntroShown: false, twoHandsStage: null, twoHandsBelt: -1,
    twoHandsArrowShown: false, twoHandsArrowChute: -1,
    waveQueue: [], spawnTimer: 1.0, lastBelt: -1, lastCat: 0,
    gifts: [], fx: [], nextId: 1, recent: [],
    shake: 0, catchFlash: 0,
    machFlash: [0, 0, 0, 0, 0], machOk: [false, false, false, false, false],
    snow: makeSnow(), snowAmt: 0, snowDepth: 0,
    gustT: 0, gustX: 0, gustWarnT: 0, gustWarnBelts: [], gustBelts: null,
    hint: 0, floorPulse: [0, 0, 0, 0, 0], beltPulse: [0, 0, 0, 0, 0], binPulse: 0, binShake: 0,
    catDual: [false, false, false, false, false], catPop: [0, 0, 0, 0, 0],
    revealT: 0, revealed: false,
    hasSack: false, carryCap: 1, sackPop: 0,
    actionEdge: false, actionHeld: false, actionBuf: 0,
    skin: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
    elf: {
      x: DROP_CX, y: GROUND_Y, floor: 0, climbing: false, climbTo: null,
      climbPause: 0, facing: 1, carrying: null, bag: [], bob: 0,
    },
    liveSpeed: 0,
    tuneMode: !!tunePanelEl,
    cmd: null, queue: null, keys: {},
    takeoff: 0, hitchT: 0, stars: 0, won: false,
    tut: 0, tutBoxUp: false, tutTimer: 0,
    sky: Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.5, a: Math.random() * 0.5 + 0.2, s: Math.random() * 2 + 1,
    })),
  };
  reportScore();
}

const syncCarry = () => {
  if (S && S.elf) S.elf.carrying = S.elf.bag[0] || null;
};

const wave = () => WAVES[Math.min(S.sleighsDone, WAVES.length - 1)];
const activeFloors = () => (S && S.tut) ? 2 : ((S && S.unlockedFloors) || wave().floors || 2);
const teeterLen = g => {
  if (g && g.tutWatch) return g.teeter || 0.45;
  if ((S && S.tut) || (g && g.tutGift)) return 1e9;
  return (g && g.teeter) || wave().teeter || TUNE.teeterTime;
};
const sleighTarget = () => SLEIGHS[Math.min(S.sleighsDone, SLEIGHS.length - 1)];
const gustFront = () => -160 + (W + 320) * Math.min(1, (GUST.dur - S.gustT) / GUST.front);

function snowTarget() {
  let a = 0;
  for (const s of SNOW) if (S.sleighsDone >= s.at) a = s.fall;
  return a;
}

function pickCategory(recentArr = null, nFloorsOverride = 0) {
  const nFloors = nFloorsOverride || activeFloors();
  const w = Array.from({ length: nFloors }, () => 1);
  const h = recentArr || S.recent, n = h.length;
  for (let i = 0; i < w.length; i++) {
    if (n >= 2 && h[n - 1] === i && h[n - 2] === i) w[i] *= 0.10;
    else if (n >= 1 && h[n - 1] === i) w[i] *= 0.45;
  }
  let tot = 0;
  for (const v of w) tot += v;
  let r = Math.random() * tot;
  for (let i = 0; i < w.length; i++) {
    r -= w[i];
    if (r <= 0) return i;
  }
  return 0;
}

function pickBeltWithDist(prevBelt, minDist = 1, nFloorsOverride = 0) {
  const nFloors = nFloorsOverride || activeFloors();
  const cands = [];
  for (let b = 0; b < nFloors; b++) {
    if (prevBelt < 0 || Math.abs(b - prevBelt) >= minDist) cands.push(b);
  }
  if (!cands.length) {
    for (let b = 0; b < nFloors; b++) if (b !== prevBelt) cands.push(b);
  }
  if (!cands.length) return 0;
  return cands[Math.floor(Math.random() * cands.length)];
}

function pickNearbyFloor(anchor, maxDist = 1, avoidExact = -1, nFloorsOverride = 0) {
  const nFloors = nFloorsOverride || activeFloors();
  const clampedAnchor = Math.max(0, Math.min(nFloors - 1, anchor));
  const cands = [];
  for (let f = 0; f < nFloors; f++) {
    if (Math.abs(f - clampedAnchor) <= maxDist && f !== avoidExact) cands.push(f);
  }
  if (!cands.length) {
    for (let f = 0; f < nFloors; f++) {
      if (Math.abs(f - clampedAnchor) <= maxDist) cands.push(f);
    }
  }
  return cands[Math.floor(Math.random() * cands.length)];
}

function simTravelTime(f1, x1, f2, x2) {
  const runSpd = TUNE.runSpeed || 1200;
  const climbSpd = TUNE.climbSpeed || 700;
  if (f1 === f2) return Math.abs(x2 - x1) / runSpd;
  return (Math.abs(LADDER_CX - x1) + Math.abs(x2 - LADDER_CX)) / runSpd +
         (Math.abs(f2 - f1) * FLOOR_H) / climbSpd;
}

// Playable check using 0.60s per gift (0.30s per tap x 2 taps = 0.60s per gift, plus 0.60s after teeter starts)
function verifyWaveSolvable(q, teeter, carryCap, startFloor, startX) {
  const humanPerGift = TUNE.humanTimePerGift !== undefined ? TUNE.humanTimePerGift : 0.60;
  const reactTap = humanPerGift / 2;
  const gifts = [];
  let t = 0;
  for (const ev of q) {
    t += ev.delay;
    if (ev.action === 'gift') {
      const spd = ev.gusted ? 165 * GUST.beltMul : 165;
      const startXPos = ev.startX !== undefined ? ev.startX : -30;
      const tTeeter = t + (TEETER_X - startXPos) / spd;
      const tReady = tTeeter;
      gifts.push({ belt: ev.belt, cat: ev.cat, tReady, tDeadline: tTeeter + teeter });
    }
  }
  const n = gifts.length;
  if (!n) return 1;
  const CATCH_X = 280, DROP_X = 398;
  const levels = Array.from({ length: 2 * n + 1 }, () => new Map());
  levels[0].set(`0||${startFloor}|2`, { mask: 0n, bag: [], floor: startFloor, x: startX, t: 0, minSlack: Infinity });

  for (let prog = 0; prog < 2 * n; prog++) {
    for (const st of levels[prog].values()) {
      let firstUncaught = -1;
      for (let gi = 0; gi < n; gi++) {
        if (!(st.mask & (1n << BigInt(gi)))) {
          firstUncaught = gi;
          break;
        }
      }
      if (firstUncaught >= 0 && gifts[firstUncaught].tDeadline < st.t) continue;

      if (st.bag.length > 0) {
        const tried = new Set();
        for (const cat of st.bag) {
          if (tried.has(cat)) continue;
          tried.add(cat);
          const nextT = st.t + reactTap + simTravelTime(st.floor, st.x, cat, DROP_X);
          if (firstUncaught >= 0 && gifts[firstUncaught].tDeadline < nextT) continue;
          const nextBag = st.bag.filter(c => c !== cat);
          const nextProg = prog + (st.bag.length - nextBag.length);
          const k = `${st.mask}|${nextBag.join(',')}|${cat}|1`;
          const map = levels[nextProg];
          const prev = map.get(k);
          if (!prev || nextT < prev.t - 1e-4 || (Math.abs(nextT - prev.t) < 0.02 && st.minSlack > prev.minSlack)) {
            map.set(k, { mask: st.mask, bag: nextBag, floor: cat, x: DROP_X, t: nextT, minSlack: st.minSlack });
          }
        }
      }
      if (st.bag.length < carryCap && firstUncaught >= 0) {
        let countUncaught = 0;
        for (let gi = firstUncaught; gi < n; gi++) {
          const bit = 1n << BigInt(gi);
          if (st.mask & bit) continue;
          countUncaught++;
          if (countUncaught > 2) break;
          const g = gifts[gi];
          const catchT = Math.max(st.t + reactTap + simTravelTime(st.floor, st.x, g.belt, CATCH_X), g.tReady + humanPerGift);
          const slack = g.tDeadline - catchT;
          if (slack < 0) continue;
          if (gi > firstUncaught && gifts[firstUncaught].tDeadline < catchT) continue;
          const nextSlack = Math.min(st.minSlack, slack);
          const nextMask = st.mask | bit;
          const nextBag = st.bag.concat([g.cat]);
          const k = `${nextMask}|${nextBag.join(',')}|${g.belt}|0`;
          const map = levels[prog + 1];
          const prev = map.get(k);
          if (!prev || catchT < prev.t - 1e-4 || (Math.abs(catchT - prev.t) < 0.02 && nextSlack > prev.minSlack)) {
            map.set(k, { mask: nextMask, bag: nextBag, floor: g.belt, x: CATCH_X, t: catchT, minSlack: nextSlack });
          }
        }
      }
    }
  }
  let bestSlack = -Infinity;
  for (const st of levels[2 * n].values()) {
    if (st.minSlack > bestSlack) bestSlack = st.minSlack;
  }
  return bestSlack;
}

function buildWaveQueue(waveIdx) {
  const w = WAVES[Math.min(waveIdx, WAVES.length - 1)];
  const maxFloors = w.floors || 2;
  const carryCap = (TUNE.twoHands && (waveIdx + 1) >= TUNE.sackFromWave) ? 2 : 1;
  const startFloor = (S && S.elf) ? Math.min(maxFloors - 1, S.elf.floor) : 0;
  const startX = (S && S.elf) ? S.elf.x : DROP_CX;
  const minSpare = (TUNE.minSpareByWave && TUNE.minSpareByWave[waveIdx] !== undefined)
    ? TUNE.minSpareByWave[waveIdx]
    : 0.60;

  let bestQ = null, bestPrevB = S.lastBelt, bestPrevC = S.lastCat || 0, bestSlack = -Infinity;

  for (let attempt = 0; attempt < 60; attempt++) {
    const q = [];
    let curFloors = w.startFloors || maxFloors;
    let prevB = S.lastBelt >= 0 ? Math.min(curFloors - 1, S.lastBelt) : 0;
    let prevC = Math.min(curFloors - 1, S.lastCat || 0);
    const recentSim = S.recent ? S.recent.slice() : [];
    let giftIdx = 0;

    const nextCat = nF => {
      const c = pickCategory(recentSim, nF);
      recentSim.push(c);
      if (recentSim.length > 4) recentSim.shift();
      return c;
    };

    const checkProgressiveFloor = () => {
      if (!w.progressiveFloors) return 0;
      const match = w.progressiveFloors.find(p => p.atGift === giftIdx);
      if (match) {
        curFloors = match.floors;
        return match.floors;
      }
      return 0;
    };

    // 1. Steady flow phase
    const isTwoHandsWave = Boolean(TUNE.twoHands && (waveIdx + 1) === TUNE.sackFromWave && w.flowCount >= 2);
    for (let i = 0; i < w.flowCount; i++) {
      const unlocked = checkProgressiveFloor();
      if (isTwoHandsWave && i === 0) {
        const b0 = unlocked ? (unlocked - 1) : pickNearbyFloor(prevC, 2, prevB, curFloors);
        const c0 = pickNearbyFloor(b0, 1, -1, curFloors);
        const c1 = pickNearbyFloor(b0, 2, c0, curFloors);
        recentSim.push(c0, c1);
        while (recentSim.length > 4) recentSim.shift();
        prevB = b0;
        prevC = c1;
        q.push({
          delay: 0.15,
          delayType: 'init',
          phase: 'flow',
          action: 'gift',
          belt: b0,
          cat: c0,
          startX: -10,
          twoHandsPair: true,
          unlockFloor: unlocked,
          gusted: false,
        });
        q.push({
          delay: 0,
          delayType: 'init',
          phase: 'flow',
          action: 'gift',
          belt: b0,
          cat: c1,
          startX: -52,
          twoHandsPair: true,
          unlockFloor: 0,
          gusted: false,
        });
        giftIdx += 2;
        i++;
        continue;
      }
      const b = unlocked ? (unlocked - 1) : pickNearbyFloor(prevC, 2, prevB, curFloors);
      const c = unlocked ? pickNearbyFloor(b, 1, -1, curFloors) : nextCat(curFloors);
      prevB = b;
      prevC = c;
      q.push({
        delay: i === 0 ? 0.35 : ((isTwoHandsWave && i === 2) ? w.flowGap + 0.85 : w.flowGap),
        delayType: i === 0 ? 'init' : 'flow',
        phase: 'flow',
        action: 'gift',
        belt: b,
        cat: c,
        unlockFloor: unlocked,
        gusted: false,
      });
      giftIdx++;
    }

    // 2. Speed-up phase
    const speedUpCount = w.speedUpCount || 0;
    const speedUpGap = w.speedUpGap || w.flowGap;
    for (let i = 0; i < speedUpCount; i++) {
      const unlocked = checkProgressiveFloor();
      const isGustStart = Boolean(w.gustOnBurst && i === 0);
      const b = unlocked ? (unlocked - 1) : pickNearbyFloor(prevC, 1, prevB, curFloors);
      const c = pickNearbyFloor(b, 1, -1, curFloors);
      prevB = b;
      prevC = c;
      if (isGustStart) {
        const warnLead = Math.min(GUST.warnTime, speedUpGap - 0.10);
        q.push({
          delay: Math.max(0.10, speedUpGap - warnLead),
          delayType: 'speedup',
          phase: 'speedup',
          action: 'gustWarn',
          belts: [b, Math.min(curFloors - 1, b + 1), Math.max(0, b - 1)],
          warnDur: warnLead,
        });
        q.push({
          delay: warnLead,
          delayType: 'speedup',
          phase: 'speedup',
          action: 'gift',
          belt: b,
          cat: c,
          unlockFloor: unlocked,
          gusted: true,
          triggerGust: true,
        });
      } else {
        q.push({
          delay: speedUpGap,
          delayType: 'speedup',
          phase: 'speedup',
          action: 'gift',
          belt: b,
          cat: c,
          unlockFloor: unlocked,
          gusted: false,
        });
      }
      giftIdx++;
    }

    // 3. Final burst phase (runs until the sleigh is full)
    if (w.burstSize > 0) {
      let bFloor = pickNearbyFloor(prevC, 1, -1, curFloors);
      const isGustBurst = Boolean(w.gustOnBurst);
      const preBurstGap = isGustBurst ? (speedUpGap + 0.58) : speedUpGap;

      if (isGustBurst) {
        const warnLead = Math.min(GUST.warnTime, preBurstGap - 0.10);
        q.push({
          delay: Math.max(0.10, preBurstGap - warnLead),
          delayType: 'speedup',
          phase: 'burst',
          action: 'gustWarn',
          belts: [bFloor, Math.min(curFloors - 1, bFloor + 1), Math.max(0, bFloor - 1)],
          warnDur: warnLead,
        });
      }

      for (let j = 0; j < w.burstSize; j++) {
        const unlocked = checkProgressiveFloor();
        const maxJump = (waveIdx === 1) ? 2 : 1;
        bFloor = j === 0 ? bFloor : pickNearbyFloor(prevC, maxJump, prevB, curFloors);
        const cFloor = pickNearbyFloor(bFloor, maxJump, -1, curFloors);
        prevB = bFloor;
        prevC = cFloor;
        const firstBurstDelay = isGustBurst
          ? Math.min(GUST.warnTime, preBurstGap - 0.10)
          : preBurstGap;
        q.push({
          delay: j === 0 ? firstBurstDelay : w.burstGap,
          delayType: j === 0 ? 'speedup' : 'burst',
          phase: 'burst',
          action: 'gift',
          belt: bFloor,
          cat: cFloor,
          unlockFloor: unlocked,
          gusted: isGustBurst,
          triggerGust: isGustBurst && j === 0,
        });
        giftIdx++;
      }
    }

    const slack = verifyWaveSolvable(q, w.teeter, carryCap, startFloor, startX);
    if (slack > bestSlack || !bestQ) {
      bestSlack = slack;
      bestQ = q;
      bestPrevB = prevB;
      bestPrevC = prevC;
    }
    if (slack >= minSpare) break;
  }

  S.lastBelt = bestPrevB;
  S.lastCat = bestPrevC;
  return bestQ;
}

function startWave(waveIdx) {
  S.sleighsDone = Math.max(0, Math.min(WAVES.length - 1, waveIdx));
  S.inSleigh = 0;
  S.waveRecycled = 0;
  S.sleighTimer = 0;
  S.phase = 'flow';
  S.relaxT = 0;
  S.breatheCueT = 0;
  S.breatheSlowT = 0;
  S.breatheArmed = false;
  S.gustWarnT = 0;
  S.gustWarnBelts = [];
  S.gustBelts = null;

  const w = wave();
  const waveNum = S.sleighsDone + 1;
  const startFloors = w.startFloors || w.floors || 2;
  S.unlockedFloors = startFloors;

  // Sleigh 3+: Second toys introduced at the start of the level
  if (waveNum >= TUNE.dualToysFromWave && !S.revealed) {
    S.revealed = true;
    for (let i = 0; i < 5; i++) {
      S.catDual[i] = true;
      S.catPop[i] = 2.6;
      if (i < startFloors) puff(CHUTE_BX + 56, chuteY(i), CATS[i].color, 12);
    }
  }

  // Two-hands mode starting from Sleigh 6
  if (TUNE.twoHands && waveNum >= TUNE.sackFromWave) {
    if (!S.hasSack) {
      S.hasSack = true;
      S.carryCap = 2;
      S.sackPop = 2.0;
      puff(S.elf.x, S.elf.y - 38, '#FDE047', 16);
    }
    if (waveNum === TUNE.sackFromWave && !S.twoHandsIntroShown) {
      S.twoHandsIntroShown = true;
      S.twoHandsBoxUp = true;
    }
  } else {
    S.hasSack = false;
    S.carryCap = 1;
  }

  // Sleigh 7 (finale): hurry-up music starts at the beginning of the level
  if (waveNum >= TUNE.hurryMusicFromWave) {
    api.play('game_hurry_up');
    say(_msg`elfexpress_sr_last_sleigh`);
  }

  S.waveQueue = buildWaveQueue(S.sleighsDone);
  if (TUNE.twoHands && waveNum === TUNE.sackFromWave) {
    const firstPair = S.waveQueue.find(ev => ev.twoHandsPair);
    S.twoHandsStage = firstPair ? 'catch' : null;
    S.twoHandsBelt = firstPair ? firstPair.belt : -1;
  } else {
    S.twoHandsStage = null;
    S.twoHandsBelt = -1;
  }
  S.spawnTimer = S.waveQueue.length ? S.waveQueue[0].delay : 1.0;
  syncTunePanel();
  reportScore();
}

function spawnGiftOnBelt(belt, startX = -30, teeterOverride = null, catOverride = null) {
  const nFloors = activeFloors();
  const safeBelt = Math.max(0, Math.min(nFloors - 1, belt));
  const cat = (catOverride !== null && catOverride !== undefined)
    ? Math.max(0, Math.min(nFloors - 1, catOverride))
    : pickCategory(null, nFloors);
  S.recent.push(cat);
  if (S.recent.length > 4) S.recent.shift();
  const v = (S.revealed && Math.random() < 0.55) ? 1 : 0;
  const g = {
    id: S.nextId++, cat, v, belt: safeBelt, state: 'belt',
    x: startX, y: beltY(safeBelt) - GIFT_R,
    timer: 0, teeter: teeterOverride || wave().teeter,
    wrapped: false, tilt: 0, spin: 0, gusted: false,
    path: null, seg: 0, p: 0, speed: 0, dropFloor: -1, ductFloor: -1,
  };
  S.gifts.push(g);
  return g;
}

function triggerGustNow(belts) {
  S.gustWarnT = 0;
  S.gustT = GUST.dur;
  S.gustX = -220;
  S.gustBelts = belts ? belts.slice() : null;
  if (!reduceMotion) S.shake = Math.max(S.shake, 0.18);
  say(_msg`elfexpress_sr_gust`);
  for (const g of S.gifts) {
    if (g.state === 'belt' && (!belts || belts.includes(g.belt))) {
      g.gusted = true;
    }
  }
}

function processWaveQueue(dt) {
  if (S.tut || S.twoHandsBoxUp) return;
  if (S.relaxT > 0) {
    S.relaxT = Math.max(0, S.relaxT - dt);
    if (TUNE.twoHands && S.sleighsDone + 1 === TUNE.sackFromWave && !S.twoHandsIntroShown && S.relaxT <= 1.2) {
      S.twoHandsIntroShown = true;
      S.twoHandsBoxUp = true;
      if (!S.hasSack) {
        S.hasSack = true;
        S.carryCap = 2;
        S.sackPop = 2.0;
        puff(S.elf.x, S.elf.y - 38, '#FDE047', 16);
      }
      return;
    }
    if (S.relaxT <= 0) {
      startWave(S.sleighsDone);
    }
    return;
  }

  // Keep the end-of-level burst (or steady flow in Sleigh 1) running until the sleigh is full
  if (!S.waveQueue.length) {
    const activeGifts = S.gifts.filter(g => g.state !== 'done' && g.state !== 'toBin' && g.state !== 'rejecting').length;
    if (S.inSleigh + activeGifts < sleighTarget()) {
      const w = wave();
      const isBurst = (w.burstSize || 0) > 0;
      const gap = isBurst ? w.burstGap : w.flowGap;
      const nFloors = activeFloors();
      const b = pickNearbyFloor(S.lastCat !== undefined ? S.lastCat : S.lastBelt, 1, S.lastBelt, nFloors);
      const c = pickNearbyFloor(b, 1, -1, nFloors);
      S.lastBelt = b;
      S.lastCat = c;
      S.waveQueue.push({
        delay: gap,
        delayType: isBurst ? 'burst' : 'flow',
        phase: isBurst ? 'burst' : 'flow',
        action: 'gift',
        belt: b,
        cat: c,
        gusted: Boolean(isBurst && w.gustOnBurst),
      });
      if (S.spawnTimer <= 0) S.spawnTimer = gap;
    } else {
      return;
    }
  }

  S.spawnTimer -= dt;
  while (S.waveQueue.length && S.spawnTimer <= 0) {
    const ev = S.waveQueue.shift();
    if (ev.phase) S.phase = ev.phase;
    if (ev.unlockFloor && ev.unlockFloor > (S.unlockedFloors || 2)) {
      for (let f = S.unlockedFloors || 2; f < ev.unlockFloor; f++) {
        S.floorPulse[f] = 0.85;
        puff(CHUTE_CX, chuteY(f), CATS[f].color, 14);
      }
      S.unlockedFloors = ev.unlockFloor;
      syncTunePanel();
    }
    if (ev.action === 'gustWarn') {
      S.gustWarnT = ev.warnDur || GUST.warnTime;
      S.gustWarnBelts = ev.belts ? ev.belts.slice() : [0, 1, 2, 3, 4];
    } else if (ev.action === 'gift') {
      const g = spawnGiftOnBelt(ev.belt, ev.startX !== undefined ? ev.startX : -30, null, ev.cat);
      if (ev.gusted) g.gusted = true;
      if (ev.twoHandsPair) g.twoHandsPair = true;
      if (ev.triggerGust) triggerGustNow(S.gustWarnBelts.length ? S.gustWarnBelts : [ev.belt]);
    }
    if (S.waveQueue.length) {
      S.spawnTimer += S.waveQueue[0].delay;
    } else {
      S.spawnTimer = 0;
    }
  }
}

function updateGifts(dt) {
  const pausedByBox = (S.tut && S.tutBoxUp) || S.twoHandsBoxUp;
  const pausedBelts = S.relaxT > 0 || pausedByBox;
  const beltSpeedMul = (S.breatheSlowT > 0) ? 0.35 : 1.0;
  const teetering = [];
  for (const g of S.gifts) if (g.state === 'teeter') teetering[g.belt] = g;

  for (const g of S.gifts) {
    switch (g.state) {
      case 'belt': {
        if (pausedBelts) break;
        let limit = teetering[g.belt] ? TEETER_X - 40 : TEETER_X;
        for (const o of S.gifts) {
          if (o !== g && o.belt === g.belt && (o.state === 'belt' || o.state === 'teeter') &&
            o.x > g.x && o.x - g.x < 200) limit = Math.min(limit, o.x - 40);
        }
        const inGustBelts = !S.gustBelts || S.gustBelts.includes(g.belt);
        const blown = g.gusted || (S.gustT > 0 && inGustBelts && g.x < gustFront());
        if (blown) g.gusted = true;
        g.tilt = blown ? 0.16 : 0;
        g.x = Math.min(g.x + 165 * (blown ? GUST.beltMul : beltSpeedMul) * dt, limit);
        if (!teetering[g.belt] && g.x >= TEETER_X - 0.5) {
          g.state = 'teeter'; g.timer = 0; teetering[g.belt] = g;
        }
        break;
      }
      case 'teeter': {
        if (pausedBelts && !g.tutGift) break;
        g.timer += dt;
        const len = teeterLen(g);
        const k = (g.tutGift && len > 100) ? 0.65 : Math.min(g.timer / len, 1);
        g.tilt = reduceMotion ? 0
          : Math.sin(g.timer * (3 + 11 * k * k) * Math.PI) * (0.06 + 0.30 * k * k);
        if (g.timer >= len) { g.state = 'falling'; g.timer = 0; g.tilt = 0; }
        break;
      }
      case 'falling': {
        if (pausedByBox) break;
        g.timer += dt;
        const k = Math.min(1, g.timer / TUNE.fallTime);
        const y0 = beltY(g.belt) - GIFT_R, y1 = carryY(g.belt, elfChoice);
        g.x = TEETER_X + 16 * k;
        g.y = y0 + (y1 - y0) * k * k;
        if (g.timer >= TUNE.fallTime) {
          g.state = 'landed'; g.y = feetY(g.belt) - 14;
          if (!g.tutWatch) S.missed++;
          breakCombo();
          api.play('pd_item_miss');
        }
        break;
      }
      case 'carried': {
        const e = S.elf;
        const idx = e.bag.indexOf(g);
        const side = idx === 1 ? -e.facing : e.facing;
        g.x = e.x + side * 18;
        g.y = e.y - elfCarryOff(elfChoice) + Math.sin(e.bob) * 2;
        break;
      }
      case 'landed': {
        if (pausedByBox) break;
        const slideSpeed = g.tutWatch ? 440 : 230;
        g.x += slideSpeed * dt; g.spin += dt * 5;
        if (g.x >= BUILD_X1 - 14) {
          g.state = 'toStation'; g.spin = 0;
          g.ductFloor = g.belt; g.dropFloor = -1;
          pathTo(g, [{ x: MACH_CX, y: chuteY(g.belt) }], g.tutWatch ? LINE_SPEED : LINE_SPEED * 0.85);
        }
        break;
      }
      default:
        if (!pausedByBox) updateTransit(g, dt);
    }
  }
  S.gifts = S.gifts.filter(g => g.state !== 'done');
  if (S.twoHandsStage === 'catch' && !S.waveQueue.some(ev => ev.twoHandsPair)) {
    const pairStillOnBelt = S.gifts.some(g => g.twoHandsPair &&
      (g.state === 'belt' || g.state === 'teeter' || g.state === 'falling' || g.state === 'landed'));
    if (!pairStillOnBelt) {
      S.twoHandsStage = S.elf.bag.length > 0 ? 'deliver' : 'done';
    }
  }
}

function pathTo(g, pts, speed) {
  g.path = [{ x: g.x, y: g.y }].concat(pts);
  g.seg = 0; g.p = 0; g.speed = speed;
}

function stepPath(g, dt) {
  let move = g.speed * dt;
  while (move > 0 && g.seg < g.path.length - 1) {
    const a = g.path[g.seg], b = g.path[g.seg + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 0.001;
    const rem = len * (1 - g.p);
    if (move < rem) { g.p += move / len; move = 0; }
    else { move -= rem; g.seg++; g.p = 0; }
  }
  if (g.seg >= g.path.length - 1) {
    const last = g.path[g.path.length - 1];
    g.x = last.x; g.y = last.y; return true;
  }
  const a = g.path[g.seg], b = g.path[g.seg + 1];
  g.x = a.x + (b.x - a.x) * g.p;
  g.y = a.y + (b.y - a.y) * g.p;
  return false;
}

function updateTransit(g, dt) {
  if (g.state === 'inBin') return;

  if (g.state === 'wrapping' || g.state === 'rejecting') {
    g.timer += dt;
    const hold = g.state === 'wrapping' ? 0.40 : 0.24;
    if (g.state === 'wrapping' && g.timer >= hold * 0.5) g.wrapped = true;
    if (g.timer >= hold) {
      const cy = chuteY(g.ductFloor);
      if (g.state === 'wrapping') {
        g.state = 'toSleigh';
        pathTo(g, [
          { x: WRAP_X, y: cy },
          { x: WRAP_X, y: SLEIGH_Y - 52 },
          { x: SLEIGH_X - 20 + Math.random() * 40, y: SLEIGH_Y - 12 },
        ], LINE_SPEED);
      } else {
        g.state = 'toBin';
        pathTo(g, [
          { x: SPINE_X, y: BIN_Y - 30 },
          { x: BIN_X + (g.tutWatch ? 0 : (Math.random() * 16 - 8)), y: g.tutWatch ? BIN_Y - 11 : BIN_Y - 6 },
        ], LINE_SPEED);
      }
    }
    return;
  }

  if (g.state === 'toBin') g.spin += dt * 4;
  if (!stepPath(g, dt)) return;

  if (g.state === 'toStation') {
    const ok = g.dropFloor === g.cat;
    g.state = ok ? 'wrapping' : 'rejecting';
    g.timer = 0;
    S.machFlash[g.ductFloor] = 0.42; S.machOk[g.ductFloor] = ok;
  } else if (g.state === 'toSleigh') {
    g.state = 'done'; landInSleigh(g);
  } else if (g.state === 'toBin') {
    if (g.tutWatch) {
      g.state = 'inBin';
      g.x = BIN_X;
      g.y = BIN_Y - 11;
      g.tilt = -0.18;
      g.spin = 0;
      S.recycled = 1;
      S.binPulse = 99;
      S.binShake = 0.85;
      if (!reduceMotion) S.shake = Math.max(S.shake, 0.24);
      api.play('pd_item_miss');
      puff(BIN_X, BIN_Y - 10, '#FF3333', 14);
      S.tut = 5;
      S.tutBoxUp = true;
      return;
    }
    g.state = 'done';
    S.recycled++;
    S.waveRecycled = (S.waveRecycled || 0) + 1;
    if (!S.firstMissFlashed) {
      S.firstMissFlashed = true;
      S.binPulse = 2.4;
      S.binShake = 0.90;
      if (!reduceMotion) S.shake = Math.max(S.shake, 0.24);
    } else {
      S.binPulse = Math.max(S.binPulse || 0, 0.75);
      S.binShake = 0.45;
    }
    puff(BIN_X, BIN_Y - 10, '#FF3333', 10);
    if (!S.tut && S.recycled < TUNE.recycleLimit && S.relaxT <= 0) {
      const w = wave();
      const isBurst = (w.burstSize || 0) > 0;
      const repGap = isBurst ? w.burstGap : w.flowGap;
      const nFloors = activeFloors();
      const b = pickNearbyFloor(S.lastCat !== undefined ? S.lastCat : S.lastBelt, 1, S.lastBelt, nFloors);
      const c = pickNearbyFloor(b, 1, -1, nFloors);
      S.lastBelt = b;
      S.lastCat = c;
      const hadEmptyQueue = S.waveQueue.length === 0;
      S.waveQueue.push({
        delay: repGap,
        delayType: isBurst ? 'burst' : 'flow',
        phase: isBurst ? 'burst' : 'flow',
        action: 'gift',
        belt: b,
        cat: c,
        gusted: Boolean(isBurst && w.gustOnBurst),
      });
      if (hadEmptyQueue && S.spawnTimer <= 0) {
        S.spawnTimer = repGap;
      }
    }
    checkLoss();
  }
}

function catchable(forgiving) {
  const e = S.elf;
  if (e.climbing || e.bag.length >= S.carryCap) return null;
  if (S.tut && S.tut !== 2) return null;
  const minX = BUILD_X0;
  const maxX = forgiving ? LADDER_CX + 16 : TAP_SPLIT + 16;
  if (e.x < minX || e.x > maxX) return null;
  const beltMinX = g => (forgiving ? BUILD_X0 + 10 : (g.gusted || g.tilt ? TEETER_X - 95 : TEETER_X - 70));
  const cands = S.gifts.filter(g => !g.tutWatch && g.belt === e.floor &&
    (g.state === 'teeter' || g.state === 'falling' ||
      (g.state === 'belt' && g.x >= beltMinX(g)) ||
      (g.state === 'landed' && (forgiving ? g.x <= BUILD_X1 - 24 : (g.x <= TAP_SPLIT + 16 || Math.abs(g.x - e.x) <= 72)))));
  if (!cands.length) return null;
  const prio = st => st === 'falling' ? 4 : st === 'teeter' ? 3 : st === 'landed' ? 2 : 1;
  cands.sort((a, b) => (prio(b.state) - prio(a.state)) || (b.timer - a.timer) || (b.x - a.x));
  return cands[0];
}

const atChute = () => !S.elf.climbing && S.elf.x >= LADDER_CX - 16;

function doAction(edge, manual) {
  if (!S || S.mode !== 'play') return;
  const e = S.elf;

  if (manual && edge && e.bag.length > 0 && atChute()) {
    if (e.x < CHUTE_BX - 18) { e.x = CHUTE_BX - 12; e.facing = 1; }
    if (releaseGift(false)) { S.actionBuf = 0; S.actionHeld = false; }
    return;
  }

  if (e.bag.length >= S.carryCap) {
    if (edge && manual && !e.climbing && !S.keys.left) {
      if (!S.tut || (S.tut === 3 && e.floor === 1)) {
        S.cmd = { type: 'chute', floor: e.floor }; S.queue = null; S.actionBuf = 0;
      }
    }
    return;
  }

  if (S.tut && S.tut !== 2) {
    if (e.bag.length > 0 && edge && manual && !e.climbing && !S.keys.left && S.tut === 3 && e.floor === 1) {
      S.cmd = { type: 'chute', floor: e.floor }; S.queue = null; S.actionBuf = 0;
    }
    return;
  }

  const g = catchable(manual);
  if (!g) {
    if (edge && manual && !e.climbing) {
      if (e.bag.length > 0 && e.x >= LADDER_CX - 16 && !S.keys.left) {
        if (!S.tut || (S.tut === 3 && e.floor === 1)) {
          S.cmd = { type: 'chute', floor: e.floor }; S.queue = null; S.actionBuf = 0;
        }
      } else if (e.x > DROP_X1 + 24 && !S.keys.right) {
        if (!S.tut || (S.tut === 2 && e.floor === 0)) {
          S.cmd = { type: 'belt', floor: e.floor }; S.queue = null; S.actionBuf = 0;
        }
      }
    }
    return;
  }
  if (manual && (e.x < DROP_X0 || e.x > DROP_X1)) {
    e.x = Math.max(DROP_X0, Math.min(DROP_X1, e.x));
  }
  g.state = 'carried'; g.tilt = 0; g.timer = 0; g.spin = 0;
  e.bag.push(g);
  syncCarry();
  if (S.twoHandsStage === 'catch' && e.bag.length >= 2) {
    S.twoHandsStage = 'deliver';
    for (const item of e.bag) {
      S.floorPulse[item.cat] = 1.2;
    }
  }
  if (TUNE.twoHands && e.bag.length === 2 && !S.twoHandsArrowShown) {
    S.twoHandsArrowShown = true;
    S.twoHandsArrowChute = e.bag[0].cat;
  }
  S.actionBuf = 0; S.actionHeld = false;
  api.play('pd_player_present_pickup');
  if (S.tut === 2) {
    S.tut = 3;
    S.tutBoxUp = true;
  }
  const keepBeltForPair = S.twoHandsStage === 'catch' && e.bag.length < S.carryCap &&
    S.gifts.some(o => o.twoHandsPair && o.belt === e.floor &&
      (o.state === 'belt' || o.state === 'teeter' || o.state === 'falling' || o.state === 'landed'));
  if (!keepBeltForPair) {
    S.cmd = null; S.queue = null;
  }
  S.catchFlash = 0.3;
  S.beltPulse[e.floor] = 0.5;
  puff(e.x, carryY(e.floor, elfChoice), '#FF7733', 10);
}

function releaseGift(onlyMatching = false) {
  const e = S.elf;
  if (!e.bag.length || e.climbing || e.x < LADDER_CX - 16) return false;
  if (S.tut && (S.tut !== 3 || e.floor !== 1)) return false;

  const matching = e.bag.filter(item => item.cat === e.floor);
  if (onlyMatching && !matching.length) return false;
  const toDrop = matching.length ? matching : [e.bag[0]];

  for (let dIdx = 0; dIdx < toDrop.length; dIdx++) {
    const g = toDrop[dIdx];
    const bagIdx = e.bag.indexOf(g);
    if (bagIdx >= 0) e.bag.splice(bagIdx, 1);
    g.dropFloor = e.floor; g.ductFloor = e.floor;
    g.state = 'toStation'; g.tilt = 0; g.spin = 0;
    const cy = chuteY(e.floor);
    const startX = Math.max(g.x, CHUTE_CX) - dIdx * 20;
    pathTo(g, [{ x: startX, y: cy }, { x: MACH_CX, y: cy }], LINE_SPEED);
    if (e.floor === g.cat) {
      S.combo++;
      const m = Math.min(1 + Math.floor(S.combo / TUNE.comboStep), TUNE.comboMax);
      S.score += TUNE.basePoints * m;
      S.floorPulse[e.floor] = 0.5;
      puff(CHUTE_CX, chuteY(e.floor), CATS[e.floor].color, 10);
    } else {
      S.misfiled++; breakCombo();
      puff(CHUTE_CX, chuteY(e.floor), '#FF3333', 8);
    }
  }
  syncCarry();
  S.twoHandsArrowChute = -1;
  if (S.twoHandsStage === 'deliver' && e.bag.length === 0) {
    S.twoHandsStage = 'done';
  }
  if (matching.length) {
    api.play('pd_player_present_pickup');
    reportScore();
  } else {
    api.play('pd_item_miss');
  }
  if (S.tut === 3) {
    S.tut = 4;
    S.tutBoxUp = false;
    S.tutTimer = 0;
    tutWatchGift(0);
  }
  return true;
}

function autoDropAtChute() {
  const e = S.elf;
  if (e.climbing || !e.bag.length || e.x < CHUTE_BX - 12) return false;
  return releaseGift(true);
}

function landInSleigh(g) {
  if (S.mode !== 'play') return;
  if (g && g.tutGift) {
    S.inSleigh = 1;
    puff(SLEIGH_X, SLEIGH_Y - 18, '#FFE14D', 16);
    return;
  }
  S.inSleigh++;
  const prevTarget = sleighTarget();
  if (S.inSleigh < prevTarget) return;

  // Diner Dash two-goal check: a wave with zero misses earns a star on the wave's sleigh
  const earnedStar = (S.waveRecycled || 0) === 0;
  if (S.waveStars && S.sleighsDone < S.waveStars.length) {
    S.waveStars[S.sleighsDone] = earnedStar;
  }
  S.lastSleighStar = earnedStar;

  S.inSleigh = 0; S.sleighsDone++;
  S.score += TUNE.sleighBonus * S.sleighsDone + (earnedStar ? 150 : 0);
  reportScore();
  if (!reduceMotion) S.shake = 0.32;
  puff(SLEIGH_X, SLEIGH_Y - 18, '#FFE14D', 22);
  puff(SLEIGH_X, SLEIGH_Y - 18, '#32A658', 18);

  if (S.sleighsDone >= WAVES.length) {
    S.stars = S.waveStars ? S.waveStars.filter(Boolean).length : 0;
    say(_msg`elfexpress_sr_win`);
    endRun(true);
  } else {
    api.play('pd_player_level_up');
    say(msgSleighAway(S.sleighsDone, SLEIGHS.length));
    const prevWave = WAVES[Math.max(0, S.sleighsDone - 1)] || WAVES[0];
    const pauseDur = prevWave.breathe || TUNE.relaxTime || 3.0;
    S.phase = 'relax';
    S.relaxT = pauseDur;
    S.breatheCueDur = pauseDur;
    S.breatheCueT = pauseDur;
    S.breatheSlowT = pauseDur;
    S.sleighFlyDur = Math.min(pauseDur, TUNE.sleighFlyTime || 1.8);
    S.sleighFlyT = S.sleighFlyDur;
    S.sleighFlyGifts = prevTarget;
    S.waveQueue = [];
    S.gifts = [];
    S.elf.bag = [];
    syncCarry();
  }
}

function breakCombo() {
  S.combo = 0;
  if (!reduceMotion) S.shake = Math.max(S.shake, 0.14);
}

function checkLoss() {
  if (S.mode === 'play' && !S.tut && S.recycled >= TUNE.recycleLimit) endRun(false);
}

function moveX(e, tx, dt) {
  const d = tx - e.x, step = TUNE.runSpeed * dt;
  if (Math.abs(d) <= step) e.x = tx;
  else { e.x += Math.sign(d) * step; e.facing = Math.sign(d); }
  e.x = Math.max(ELF_MIN_X, Math.min(ELF_MAX_X, e.x));
  e.bob += dt * 15;
}

// Seamless movement across horizontal -> ladder -> horizontal with zero dead frames
function stepTo(e, tf, tx, dt) {
  let rem = dt;
  if (e.climbing || e.floor !== tf) {
    if (!e.climbing) {
      const dx = LADDER_CX - e.x;
      if (Math.abs(dx) > 4) {
        const needT = Math.abs(dx) / TUNE.runSpeed;
        if (rem < needT) {
          moveX(e, LADDER_CX, rem);
          return false;
        }
        moveX(e, LADDER_CX, needT);
        rem -= needT;
      }
      e.x = LADDER_CX;
      e.climbing = true;
    }
    const wantY = feetY(tf);
    const dy = wantY - e.y;
    const dir = dy < 0 ? -1 : 1;
    const needClimbT = Math.abs(dy) / TUNE.climbSpeed;
    if (rem < needClimbT) {
      e.x += (LADDER_CX - e.x) * Math.min(1, rem * 16);
      e.y += dir * TUNE.climbSpeed * rem;
      e.bob += rem * 14;
      return false;
    }
    e.x = LADDER_CX;
    e.y = wantY;
    e.floor = tf;
    e.climbing = false;
    e.bob = 0;
    rem -= needClimbT;
  }
  e.y = feetY(tf);
  if (Math.abs(e.x - tx) > 5) {
    if (rem > 0) moveX(e, tx, rem);
    if (Math.abs(e.x - tx) > 5) return false;
  }
  e.bob = 0;
  return true;
}

function updateElf(dt) {
  const e = S.elf;
  const prevX = e.x, prevY = e.y;
  if (S.twoHandsBoxUp || (S.tut && S.tut !== 2 && S.tut !== 3)) {
    clearKeys();
    if (!e.climbing) {
      e.y = feetY(e.floor);
      e.bob = 0;
    }
    S.liveSpeed = 0;
    return;
  }
  const k = S.keys, maxF = activeFloors() - 1;
  e.climbPause = 0;
  let mx = 0, my = 0;
  if (k.left) mx--; if (k.right) mx++; if (k.up) my--; if (k.down) my++;

  if (mx <= 0 || e.climbing || e.x < CHUTE_BX - 12) {
    e.droppedOnRun = false;
  }

  if (mx || my) {
    if (e.climbing && e.climbTo === null) {
      let near = S.cmd ? S.cmd.floor : e.floor, best = 1e9;
      if (!S.cmd) {
        for (let f = 0; f <= maxF; f++) {
          const d = Math.abs(e.y - feetY(f));
          if (d < best) { best = d; near = f; }
        }
      }
      e.climbTo = near;
    }
    S.cmd = null; S.queue = null;
  }

  if (my && e.climbTo === null && !e.climbing) {
    const dir = my < 0 ? 1 : -1;
    const nextF = Math.max(0, Math.min(maxF, e.floor + dir));
    if (nextF !== e.floor) e.climbTo = nextF;
  }

  const finishUpdateElf = () => {
    if (dt > 0) {
      const dist = Math.hypot(e.x - prevX, e.y - prevY);
      S.liveSpeed = dist > 0.1 ? dist / dt : 0;
    }
  };

  const runIntoChuteDrop = () => {
    if (mx > 0 && !e.droppedOnRun) {
      if (autoDropAtChute() || (e.x >= CHUTE_BX + 18 && releaseGift(false))) {
        e.droppedOnRun = true;
      }
    }
  };

  if (e.climbTo !== null) {
    const tf = Math.max(0, Math.min(maxF, e.climbTo));
    e.climbTo = tf;
    if (tf === e.floor && !e.climbing) {
      e.climbTo = null;
    } else {
      let remDt = dt;
      if (!e.climbing) {
        const dx = LADDER_CX - e.x;
        if (Math.abs(dx) > 4) {
          const needT = Math.abs(dx) / TUNE.runSpeed;
          if (remDt < needT) {
            moveX(e, LADDER_CX, remDt);
            finishUpdateElf();
            return;
          }
          moveX(e, LADDER_CX, needT);
          remDt -= needT;
        }
        e.x = LADDER_CX;
        e.climbing = true;
      }
      if (!my && mx && Math.abs(e.y - feetY(e.climbTo)) <= 20) {
        e.y = feetY(e.climbTo);
        e.floor = e.climbTo;
        e.climbing = false;
        e.climbTo = null;
        e.bob = 0;
        moveX(e, e.x + mx * 1000, remDt);
        runIntoChuteDrop();
        if (e.bag.length < S.carryCap) doAction(false, false);
        finishUpdateElf();
        return;
      }
      e.x += (LADDER_CX - e.x) * Math.min(1, remDt * 16);
      let rem = TUNE.climbSpeed * remDt;
      while (rem > 0 && e.climbing) {
        const wantY = feetY(e.climbTo);
        const dy = wantY - e.y;
        if (Math.abs(dy) <= rem) {
          rem -= Math.abs(dy);
          e.y = wantY;
          e.floor = e.climbTo;
          e.climbing = false;
          e.climbTo = null;
          e.bob = 0;
        } else {
          e.y += Math.sign(dy) * rem;
          rem = 0;
        }
      }
      if (e.climbing) {
        e.bob += remDt * 14;
      } else if (mx) {
        moveX(e, e.x + mx * 1000, rem / TUNE.climbSpeed);
        runIntoChuteDrop();
        if (e.bag.length < S.carryCap) doAction(false, false);
      } else {
        e.bob = 0;
      }
      finishUpdateElf();
      return;
    }
  }

  if (mx) {
    e.y = feetY(e.floor);
    moveX(e, e.x + mx * 1000, dt);
    runIntoChuteDrop();
    if (e.bag.length < S.carryCap) doAction(false, false);
    finishUpdateElf();
    return;
  }

  const idleCatch = () => {
    if (e.bag.length < S.carryCap) doAction(false, false);
  };

  if (S.cmd) {
    if (S.cmd.floor >= activeFloors()) { S.cmd = null; finishUpdateElf(); return; }
    const cmdType = S.cmd.type;
    const cmdFloor = S.cmd.floor;
    const tx = cmdType === 'belt' ? DROP_CX : CHUTE_CX;
    const arrived = stepTo(e, cmdFloor, tx, dt);
    if (!e.climbing && e.floor === cmdFloor) {
      if (cmdType === 'chute') {
        if (e.x >= CHUTE_BX - 12 || arrived) {
          if (e.bag.length > 0) releaseGift(false);
          S.cmd = null; S.queue = null;
          if (!S.cmd) e.bob = 0;
          finishUpdateElf();
          return;
        }
      } else {
        idleCatch();
        if (!S.cmd || S.cmd.type !== 'belt') {
          if (!S.cmd) e.bob = 0;
          finishUpdateElf();
          return;
        }
      }
    }
    if (arrived && S.cmd) {
      if (S.cmd.type === 'chute') {
        if (e.bag.length > 0) releaseGift(false);
        S.cmd = null; S.queue = null;
      } else {
        idleCatch();
        if (S.cmd && S.cmd.type === 'belt') {
          S.cmd = null; S.queue = null;
        }
      }
      if (!S.cmd) e.bob = 0;
    }
    finishUpdateElf();
    return;
  }
  if (!e.climbing) e.y = feetY(e.floor);
  e.bob = 0;
  idleCatch();
  finishUpdateElf();
}

function puff(x, y, color, n) {
  if (reduceMotion) return;
  for (let i = 0; i < n; i++) {
    S.fx.push({
      x, y, color,
      vx: (Math.random() - 0.5) * 210,
      vy: -Math.random() * 150 - 28,
      life: 0.5 + Math.random() * 0.32,
      age: 0,
      r: 2.4 + Math.random() * 3.2,
      star: Math.random() > 0.45,
    });
  }
}

function updateFx(dt) {
  for (const p of S.fx) { p.age += dt; p.vy += 470 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  S.fx = S.fx.filter(p => p.age < p.life);
}

function updateSnow(dt) {
  S.snowAmt += (snowTarget() - S.snowAmt) * Math.min(1, dt * 0.7);
  S.snowDepth = Math.min(1, S.snowDepth + S.snowAmt * SNOW_PILE * dt);

  if (S.gustWarnT > 0) {
    S.gustWarnT = Math.max(0, S.gustWarnT - dt);
  }
  if (S.gustT > 0) {
    S.gustT = Math.max(0, S.gustT - dt);
    S.gustX += (W + 420) / GUST.dur * dt;
  }

  if (S.snowAmt < 0.01 || reduceMotion) return;
  const gust = S.gustT > 0 ? 300 : (S.gustWarnT > 0 ? 90 : 0);
  const fall = 0.75 + 0.5 * S.snowAmt;
  for (const s of S.snow) {
    s.y += s.vy * dt * fall;
    s.x += Math.sin(S.t * s.sw + s.ph) * 16 * dt + (16 * S.snowAmt + gust) * dt;
    if (s.y > Math.max(H, viewY1) + 6) {
      s.y = Math.min(0, viewY0) - 8;
      s.x = viewX0 + Math.random() * (viewX1 - viewX0);
    }
    if (s.x > Math.max(W, viewX1) + 6) s.x = Math.min(0, viewX0) - 6;
  }
}

function tutGift(cat) {
  S.gifts.push({
    id: S.nextId++, cat, v: 0, belt: 0, state: 'belt',
    x: TEETER_X - 42, y: beltY(0) - GIFT_R,
    timer: 0, teeter: 1e9, tutGift: true,
    wrapped: false, tilt: 0, spin: 0, gusted: false,
    path: null, seg: 0, p: 0, speed: 0, dropFloor: -1, ductFloor: -1,
  });
}

function tutWatchGift(cat) {
  S.gifts.push({
    id: S.nextId++, cat, v: 0, belt: 0, state: 'belt',
    x: TEETER_X - 36, y: beltY(0) - GIFT_R,
    timer: 0, teeter: 0.45, tutWatch: true,
    wrapped: false, tilt: 0, spin: 0, gusted: false,
    path: null, seg: 0, p: 0, speed: 0, dropFloor: -1, ductFloor: -1,
  });
}

function tutFinish() {
  S.tut = 0;
  S.tutBoxUp = false;
  S.tutTimer = 0;
  S.binPulse = 0;
  S.binShake = 0;
  S.gifts = [];
  S.inSleigh = 0;
  S.recycled = 0;
  S.waveRecycled = 0;
  S.missed = 0;
  S.misfiled = 0;
  S.combo = 0;
  S.score = 0;
  show('btnSkipTut', false);
  api.play('pd_player_level_up');
  startWave(0);
}

function tutDismissOk() {
  if (!S) return false;
  if (S.twoHandsBoxUp) {
    api.play('pd_player_present_pickup');
    S.twoHandsBoxUp = false;
    if (S.relaxT > 0) {
      S.relaxT = 0;
      S.breatheCueT = 0;
      S.breatheSlowT = 0;
      startWave(S.sleighsDone);
    }
    return true;
  }
  if (!S.tut || !S.tutBoxUp) return false;
  const st = TUT[S.tut - 1];
  if (!st || !st.ok) return false;
  api.play('pd_player_present_pickup');
  if (S.tut === 1) {
    S.tut = 2;
    S.tutBoxUp = false;
    S.tutTimer = 0;
    tutGift(1);
    return true;
  }
  if (S.tut === 4) {
    S.tutBoxUp = false;
    S.tutTimer = 0;
    return true;
  }
  if (S.tut === 5) {
    tutFinish();
    return true;
  }
  return false;
}

function updateTutorial(dt) {
  if (!S || !S.tut) return;
  if (S.tut === 2 && !S.tutBoxUp) {
    const g = S.gifts.find(item => item.tutGift);
    if (g && g.state === 'teeter' && g.timer >= 0.22) {
      S.tutBoxUp = true;
    }
  } else if (S.tut === 4 && !S.tutBoxUp) {
    const g = S.gifts.find(item => item.tutWatch);
    if (g && (g.state === 'falling' || g.state === 'landed') && !g.shownStep4) {
      g.shownStep4 = true;
      S.tutBoxUp = true;
    }
  }
}

let last = 0, raf = 0;
function frame(now) {
  raf = requestAnimationFrame(frame);
  if (!last) last = now;
  let dt = (now - last) / 1000; last = now;
  if (dt > 0.05) dt = 0.05;

  if (S && (S.mode === 'takeoff' || (S.mode === 'over' && S.won))) {
    S.takeoff += dt;
  } else if (S && S.mode === 'play') {
    S.uiT = (S.uiT || 0) + dt;
    const pausedByTutBox = (S.tut && S.tutBoxUp) || S.twoHandsBoxUp;
    if (!pausedByTutBox) {
      S.t += dt;
      if (!S.tut && S.relaxT <= 0) {
        S.sleighTimer = (S.sleighTimer || 0) + dt;
      }
      const beltMul = (S.breatheSlowT > 0 || S.relaxT > 0) ? 0.28 : 1.0;
      S.beltAnimT += dt * beltMul;
      processWaveQueue(dt);
    } else if (S.tut === 5) {
      // Keep recycler flash/shake animated while Step 5 box is up
      S.t += dt;
    }
    updateElf(dt);
    if (S.actionBuf > 0) S.actionBuf = Math.max(0, S.actionBuf - dt);
    if (S.actionEdge || S.actionBuf > 0) doAction(S.actionEdge, true);
    else if (S.actionHeld) doAction(false, true);
    S.actionEdge = false;
    updateGifts(dt);
    updateTutorial(dt);
    updateFx(dt);
    if (!pausedByTutBox) updateSnow(dt);
    if (S.shake > 0) S.shake = Math.max(0, S.shake - dt * 2.2);
    if (S.catchFlash > 0) S.catchFlash = Math.max(0, S.catchFlash - dt * 1.4);
    if (S.sackPop > 0) S.sackPop = Math.max(0, S.sackPop - dt);
    if (!pausedByTutBox && S.breatheCueT > 0) S.breatheCueT = Math.max(0, S.breatheCueT - dt);
    if (!pausedByTutBox && S.breatheSlowT > 0) S.breatheSlowT = Math.max(0, S.breatheSlowT - dt);
    if (S.binPulse > 0 && S.tut !== 5) S.binPulse = Math.max(0, S.binPulse - dt);
    if (S.binShake > 0 && S.tut !== 5) S.binShake = Math.max(0, S.binShake - dt * 1.4);
    if (S.sleighFlyT > 0) S.sleighFlyT = Math.max(0, S.sleighFlyT - dt);
    for (let i = 0; i < 5; i++) {
      if (S.floorPulse[i] > 0) S.floorPulse[i] = Math.max(0, S.floorPulse[i] - dt * 1.6);
      if (S.beltPulse[i] > 0) S.beltPulse[i] = Math.max(0, S.beltPulse[i] - dt * 1.6);
      if (S.machFlash[i] > 0) S.machFlash[i] = Math.max(0, S.machFlash[i] - dt * 2.4);
      if (S.catPop[i] > 0) S.catPop[i] = Math.max(0, S.catPop[i] - dt);
    }
  }
  if (S) {
    renderScene(S, elfChoice, activeFloors(), sleighTarget(), !!catchable(false));
  }
}

const clearKeys = () => { if (S) S.keys.left = S.keys.right = S.keys.up = S.keys.down = false; };

let keysBound = false;
function onKeyDown(ev) {
  if (!S || S.mode !== 'play') return;
  const k = KEYMAP[ev.key];
  if (k) {
    if (S.twoHandsBoxUp || (S.tut && S.tut !== 2 && S.tut !== 3)) {
      ev.preventDefault();
      return;
    }
    const wasDown = !!S.keys[k];
    S.keys[k] = true;
    S.cmd = null;
    S.queue = null;
    if (!ev.repeat && !wasDown) {
      const e = S.elf, maxF = activeFloors() - 1;
      if (k === 'up' || k === 'down') {
        const dir = k === 'up' ? 1 : -1;
        let base = e.climbTo !== null ? e.climbTo : e.floor;
        if (e.climbing) {
          const curDir = feetY(base) < e.y ? 1 : feetY(base) > e.y ? -1 : 0;
          if (curDir && curDir !== dir) {
            if (dir > 0) {
              for (let f = 0; f <= maxF; f++) { if (feetY(f) < e.y - 1) { base = f - 1; break; } }
            } else {
              for (let f = maxF; f >= 0; f--) { if (feetY(f) > e.y + 1) { base = f + 1; break; } }
            }
          }
        }
        const nextF = Math.max(0, Math.min(maxF, base + dir));
        if (nextF !== e.floor || e.climbing) {
          e.climbTo = nextF;
          e.climbPause = 0;
        }
      } else if (!e.climbing && !S.keys.up && !S.keys.down) {
        if ((k === 'left' && e.x <= LADDER_CX + 8) || (k === 'right' && e.x >= LADDER_CX - 8)) {
          e.climbTo = null;
        }
      }
    }
    ev.preventDefault();
    return;
  }
  if (ev.key === ' ' || ev.code === 'Space' || ev.key === 'Enter' || ev.keyCode === 32) {
    if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
      document.activeElement.blur();
      cv.focus({ preventScroll: true });
    }
    if (!ev.repeat && ((S.tut && S.tutBoxUp) || S.twoHandsBoxUp) && tutDismissOk()) {
      ev.preventDefault();
      return;
    }
    if (!ev.repeat) {
      S.actionEdge = true;
      S.actionBuf = 0.28;
    }
    S.actionHeld = true;
    ev.preventDefault();
    return;
  }
}

function onKeyUp(ev) {
  if (!S) return;
  if (ev.key === ' ' || ev.code === 'Space' || ev.key === 'Enter' || ev.keyCode === 32) {
    S.actionHeld = false;
    ev.preventDefault();
    return;
  }
  const k = KEYMAP[ev.key];
  if (k) {
    S.keys[k] = false;
    ev.preventDefault();
  }
}

function bindKeys() {
  if (!keysBound) {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    keysBound = true;
  }
  if (document.activeElement && document.activeElement !== cv && document.activeElement !== document.body) {
    document.activeElement.blur();
  }
  window.focus();
  cv.focus({ preventScroll: true });
}

function unbindKeys() {
  if (keysBound) {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    keysBound = false;
  }
  if (S) {
    clearKeys();
    S.actionHeld = false;
    S.actionEdge = false;
    S.actionBuf = 0;
  }
}

window.addEventListener('resize', fit);
window.addEventListener('orientationchange', () => setTimeout(fit, 120));
window.addEventListener('pagehide', unbindKeys);
window.addEventListener('beforeunload', unbindKeys);
window.addEventListener('blur', () => {
  if (S) {
    clearKeys();
    S.actionHeld = false;
    S.actionEdge = false;
    S.actionBuf = 0;
  }
});

function tapTarget(p) {
  if (S.twoHandsBoxUp) {
    if (isTutOkClick(p, S)) {
      tutDismissOk();
    }
    return;
  }
  if (S.tut) {
    if (S.tutBoxUp && isTutOkClick(p, S)) {
      tutDismissOk();
      return;
    }
    const st = TUT[S.tut - 1];
    if (!st || st.ok) return;
    const tf = Math.max(0, Math.min(4, Math.floor((GROUND_Y - p.y) / FLOOR_H)));
    const side = p.x < TAP_SPLIT ? 'belt' : 'chute';
    if (!((st.go === 'belt' || st.go === 'chute') && side === st.go && tf === st.f)) return;
  }

  let f = Math.floor((GROUND_Y - p.y) / FLOOR_H);
  f = Math.max(0, Math.min(4, f));
  if (f >= activeFloors()) return;
  const t = { type: p.x < TAP_SPLIT ? 'belt' : 'chute', floor: f };

  S.elf.climbTo = null;
  S.cmd = t;
  S.queue = null;
  clearKeys();
  if (!S.elf.climbing && S.elf.floor === f) {
    if (t.type === 'chute' && S.elf.x >= CHUTE_BX - 12 && S.elf.bag.length > 0) {
      releaseGift(false);
      S.cmd = null;
    } else if (t.type === 'belt' && S.elf.bag.length < S.carryCap && catchable(false)) {
      doAction(false, false);
    }
  }
}

cv.addEventListener('pointerdown', ev => {
  if (!S || S.mode !== 'play') return;
  window.focus();
  cv.focus({ preventScroll: true });
  tapTarget(toGame(ev));
  ev.preventDefault();
}, { passive: false });
cv.addEventListener('contextmenu', ev => ev.preventDefault());

const el = id => document.getElementById(id);
const show = (id, on) => { const node = el(id); if (node) node.classList.toggle('on', on); };
const say = m => { el('sr').textContent = m; };

function endRun(won) {
  if (S.mode === 'over') return;
  S.mode = 'over';
  S.won = won;
  if (won) S.takeoff = 0;
  unbindKeys();
  reportScore();
  api.play('game_hurry_up_end');
  if (won) {
    api.play('pd_player_level_up');
    api.play('qd_complete');
    api.play('music_start_scene');
  } else {
    api.play('music_ingame_gameover');
    api.play('pd_game_over');
  }
  api.gameover();
}

// Starts either at a specific wave (1..5) if waveNum > 0, or at Wave 1 with the 5-step Diner Dash tutorial.
function start(waveNum = 0) {
  fit();
  newGame();
  api.play('game_hurry_up_end');
  api.play('music_start_ingame');
  if (document.activeElement && document.activeElement !== cv && document.activeElement !== document.body) {
    document.activeElement.blur();
  }
  show('scrTitle', false);
  show('btnSkipTut', false);
  bindKeys();
  if (waveNum >= 1 && waveNum <= WAVES.length) {
    S.tut = 0;
    S.tutBoxUp = false;
    startWave(waveNum - 1);
  } else {
    S.sleighsDone = 0;
    S.tut = 1;
    S.tutBoxUp = true;
    S.tutTimer = 0;
    S.elf.x = CHUTE_CX;
    S.elf.facing = -1;
    syncTunePanel();
  }
  last = 0;
  if (!raf) raf = requestAnimationFrame(frame);
}

if (el('btnSkipTut')) {
  el('btnSkipTut').addEventListener('click', ev => { ev.currentTarget.blur(); start(1); });
}
buildElfPicker();
el('btnStart').addEventListener('click', ev => { ev.currentTarget.blur(); start(shortcutWave || 0); });

api.config({
  pause: true,
  orientation: 'landscape',
});

api.addEventListener('pause', () => {
  if (!S) return;
  unbindKeys();
  if (S.mode === 'play' || S.mode === 'takeoff') {
    S.pausedFrom = S.mode;
    S.mode = 'pause';
  }
});

api.addEventListener('resume', () => {
  if (!S) return;
  if (S.mode === 'pause') {
    S.mode = S.pausedFrom || 'play';
    S.pausedFrom = null;
    bindKeys();
    last = 0;
  }
});

api.addEventListener('restart', () => {
  start(shortcutWave || 0);
});

api.addEventListener('data', ev => {
  const detail = ev && ev.detail;
  if (hasTuneFlag(detail)) initTunePanel();
  const w = parseWaveShortcut(detail);
  if (w) {
    shortcutWave = w;
    start(w);
  }
});

if (typeof CanvasRenderingContext2D !== 'undefined' &&
  !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath(); return this;
  };
}

fit(); newGame(); S.mode = 'idle';
if (hasTuneFlag(null)) initTunePanel();
raf = requestAnimationFrame(frame);
api.ready(data => {
  fit();
  api.play('qd_load_sounds');
  if (hasTuneFlag(data)) initTunePanel();
  shortcutWave = parseWaveShortcut(data);
  if (shortcutWave) {
    start(shortcutWave);
  } else {
    show('scrTitle', true);
  }
  last = 0;
});
