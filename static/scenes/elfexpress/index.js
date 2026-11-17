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
  cv, fit, toGame, reduceMotion, viewX0, viewY0, viewX1, viewY1, renderScene,
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
let shortcutWin = false;
let missFxMode = 'A';
let tunePanelEl = null;
let tuneControls = null;
let activeInputMode = 'touch';
function inputTimeMul(mode = (S && S.inputMode) || activeInputMode) {
  return mode === 'mouse' ? (TUNE.mouseTimeMul || 1.15) : 1.0;
}

function effEventDelay(ev, mode = (S && S.inputMode) || activeInputMode) {
  if (!ev) return 0;
  const mul = inputTimeMul(mode);
  if (ev.baseGap !== undefined) {
    return Math.max(0.18, ev.baseGap * mul + (ev.pairOffset || 0));
  }
  if (ev.isPairSecond) return ev.delay;
  return ev.delay * mul;
}

function setInputMode(pointerType) {
  if (!pointerType) return;
  const nextMode = pointerType === 'mouse' ? 'mouse' : 'touch';
  const prevMode = (S && S.inputMode) || activeInputMode;
  activeInputMode = nextMode;
  if (S) {
    S.inputMode = nextMode;
    S.inputTapCount = (S.inputTapCount || 0) + 1;
    S.inputFlashT = 0.35;
    if (prevMode !== nextMode) {
      const oldMul = inputTimeMul(prevMode);
      const newMul = inputTimeMul(nextMode);
      const nextEv = S.waveQueue && S.waveQueue[0];
      if (S.spawnTimer > 0 && (!nextEv || !nextEv.isPairSecond)) {
        S.spawnTimer *= (newMul / oldMul);
      }
    }
    syncTunePanel();
  } else {
    syncTunePanel();
  }
}

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

function parseMissFx(data) {
  let raw = data && (data.missfx || data.missFx);
  if (raw === undefined || raw === null || raw === '') {
    try {
      const sp = new URLSearchParams(window.location.search);
      raw = sp.get('missfx') || sp.get('missFx');
    } catch (_) {}
  }
  if ((raw === undefined || raw === null || raw === '') && document.referrer) {
    try {
      const sp = new URL(document.referrer).searchParams;
      raw = sp.get('missfx') || sp.get('missFx');
    } catch (_) {}
  }
  if (raw === undefined || raw === null || raw === '') {
    try {
      const sp = new URLSearchParams(window.top.location.search);
      raw = sp.get('missfx') || sp.get('missFx');
    } catch (_) {}
  }
  const up = String(raw || '').trim().toUpperCase();
  return (up === 'A' || up === 'B' || up === 'C') ? up : 'A';
}

function hasWinShortcut(data) {
  if (data && (data.win === 1 || data.win === '1' || data.win === true || data.win === 'true')) return true;
  try {
    const v = new URLSearchParams(window.location.search).get('win');
    if (v === '1' || v === 'true') return true;
  } catch (_) {}
  if (document.referrer) {
    try {
      const v = new URL(document.referrer).searchParams.get('win');
      if (v === '1' || v === 'true') return true;
    } catch (_) {}
  }
  try {
    const v = new URLSearchParams(window.top.location.search).get('win');
    if (v === '1' || v === 'true') return true;
  } catch (_) {}
  return false;
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
  const isMouse = ((S && S.inputMode) || activeInputMode) === 'mouse';
  const modeLabel = isMouse ? 'Mouse' : 'Touch';
  const mulStr = isMouse ? '×1.15' : '×1.00';
  tuneControls.title.textContent = `Tuning (Sleigh ${wNum} · ${openF}F · ${modeLabel} ${mulStr})`;
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
  const slowed = Boolean(S && S.snowballHitT > 0);
  const spdMul = slowed ? (TUNE.snowballSlowMul || 0.5) : 1.0;
  const curRun = Math.round((TUNE.runSpeed || 1200) * spdMul);
  const curClimb = Math.round((TUNE.climbSpeed || 700) * spdMul);
  const curPct = Math.round(pct * spdMul);
  tuneControls.speed.input.value = pct;
  tuneControls.speed.val.textContent = slowed
    ? `${curPct}% (${curRun}/${curClimb} px/s · Snowball ${S.snowballHitT.toFixed(1)}s)`
    : `${pct}% (${curRun}/${curClimb} px/s)`;
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
    const isLarge = i % 3 === 0;
    const beltFront = i % 2 === 0;
    const baseR = 1.3 + (i % 5) * 0.28;
    const bigR = isLarge ? 3.8 + (i % 4) * 0.55 : baseR;
    const x = beltFront
      ? (BUILD_X0 - 40 + Math.random() * (TEETER_X - BUILD_X0 + 120))
      : (-260 + Math.random() * (W + 520));
    return {
      x,
      y: -80 + Math.random() * (H + 160),
      r: baseR,
      baseR,
      bigR,
      vy: 52 + baseR * 28 + Math.random() * 28,
      sw: 0.8 + Math.random() * 1.8,
      ph: Math.random() * 6.28,
      a: 0.52 + Math.random() * 0.44,
      crystal: false,
      large: isLarge,
      beltFront,
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
    sleighsDone: 0, inSleigh: 0, recycled: 0, waveRecycled: 0, recycleDrainFrom: 0, recycleDrainDur: 0, missed: 0, misfiled: 0,
    unlockedFloors: 2,
    waveStars: Array.from({ length: SLEIGHS.length }, () => false), lastSleighStar: true,
    firstMissFlashed: false,
    phase: 'flow', relaxT: 0, sleighFlyT: 0, sleighFlyDur: 1.8, sleighFlyGifts: 0,
    breatheCueT: 0, breatheCueDur: 3.0, breatheSlowT: 0, breatheArmed: false,
    sleighTimer: 0,
    waveQueue: [], spawnTimer: 1.0, lastBelt: -1, lastCat: 0,
    gifts: [], fx: [], nextId: 1, recent: [],
    shake: 0, catchFlash: 0,
    machFlash: [0, 0, 0, 0, 0], machOk: [false, false, false, false, false],
    snow: makeSnow(), snowAmt: 0, snowDepth: 0,
    gustT: 0, gustX: 0, gustWarnT: 0, gustWarnBelts: [], gustBelts: null, gustMul: GUST.beltMul,
    hint: 0, floorPulse: [0, 0, 0, 0, 0], beltPulse: [0, 0, 0, 0, 0], binPulse: 0, binShake: 0, binPops: [],
    catDual: [false, false, false, false, false], catPop: [0, 0, 0, 0, 0],
    revealT: 0, revealed: false,
    carryCap: 2,
    actionEdge: false, actionHeld: false, actionBuf: 0,
    skin: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
    elf: {
      x: DROP_CX, y: GROUND_Y, floor: 0, climbing: false, climbTo: null,
      climbPause: 0, facing: 1, carrying: null, bag: [], bob: 0,
    },
    liveSpeed: 0,
    inputMode: activeInputMode,
    missFx: missFxMode || 'A',
    tuneMode: !!tunePanelEl,
    cmd: null, queue: null, keys: {},
    beltIdleAfterGiftFloor: -1,
    firstSnowballShown: false, snowballBoxUp: false, snowballBoxLockT: 0, snowballHitT: 0, snowballShedAcc: 0, snowballSchedule: [],
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
  const baseTeeter = (g && g.teeter) || wave().teeter || TUNE.teeterTime;
  return baseTeeter * inputTimeMul();
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

// Playable check using 0.60s per gift (0.30s per tap x 2 taps = 0.60s per gift, pipelined with the 3-action queue)
function verifyWaveSolvable(q, teeter, carryCap, startFloor, startX, timeMul = 1.0) {
  const humanPerGift = TUNE.humanTimePerGift !== undefined ? TUNE.humanTimePerGift : 0.60;
  const reactTap = humanPerGift / 2;
  const beltSpd = TUNE.beltSpeed || 38;
  const mode = timeMul > 1.01 ? 'mouse' : 'touch';
  const gifts = [];
  let t = 0;
  for (const ev of q) {
    t += effEventDelay(ev, mode);
    if (ev.action === 'gift') {
      const spd = ev.gusted ? beltSpd * (ev.gustMul || GUST.beltMul) : beltSpd;
      const startXPos = ev.startX !== undefined ? ev.startX : -26;
      const tTeeter = t + Math.max(0, (TEETER_X - startXPos) / spd);
      const tReady = tTeeter;
      gifts.push({
        belt: ev.belt,
        cat: ev.cat,
        tSpawn: t,
        tReady,
        tTeeter,
        tDeadline: tTeeter + teeter * timeMul,
      });
    }
  }
  const n = gifts.length;
  if (!n) return 1;
  const CATCH_X = TAP_SPLIT + 16;
  const DROP_X = CHUTE_BX - 12;
  const levels = Array.from({ length: 2 * n + 1 }, () => new Map());
  levels[0].set(`0||${startFloor}|2`, {
    mask: 0n,
    bag: [],
    floor: startFloor,
    x: startX,
    t: 0,
    tapT: 0,
    minSlack: Infinity,
  });

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
          const nextTapT = st.tapT + reactTap;
          const departT = Math.max(st.t, nextTapT - reactTap * 2);
          const nextT = Math.max(nextTapT, departT + simTravelTime(st.floor, st.x, cat, DROP_X));
          if (firstUncaught >= 0 && gifts[firstUncaught].tDeadline < nextT) continue;
          const nextBag = st.bag.filter(c => c !== cat);
          const nextProg = prog + (st.bag.length - nextBag.length);
          const k = `${st.mask}|${nextBag.join(',')}|${cat}|1`;
          const map = levels[nextProg];
          const prev = map.get(k);
          if (!prev || nextT < prev.t - 1e-5 || (Math.abs(nextT - prev.t) <= 1e-5 && st.minSlack > prev.minSlack)) {
            map.set(k, {
              mask: st.mask,
              bag: nextBag,
              floor: cat,
              x: DROP_X,
              t: nextT,
              tapT: nextTapT,
              minSlack: st.minSlack,
            });
          }
        }
      }
      if (st.bag.length < carryCap && firstUncaught >= 0) {
        const winEnd = Math.min(n, firstUncaught + 4);
        for (let gi = firstUncaught; gi < winEnd; gi++) {
          const bit = 1n << BigInt(gi);
          if (st.mask & bit) continue;
          const g = gifts[gi];
          const nextTapT = Math.max(st.tapT, g.tSpawn) + reactTap;
          const departT = Math.max(st.t, nextTapT - reactTap * 2);
          const arriveT = Math.max(nextTapT, departT + simTravelTime(st.floor, st.x, g.belt, CATCH_X));
          const catchT = Math.max(arriveT, g.tReady);
          const slack = g.tDeadline - catchT;
          if (slack < humanPerGift) continue;
          let expiredEarlier = false;
          for (let ei = firstUncaught; ei < n; ei++) {
            if (ei === gi || (st.mask & (1n << BigInt(ei)))) continue;
            if (gifts[ei].tDeadline < catchT) {
              expiredEarlier = true;
              break;
            }
          }
          if (expiredEarlier) continue;
          const nextSlack = Math.min(st.minSlack, slack);
          const nextMask = st.mask | bit;
          const nextBag = st.bag.concat([g.cat]).sort((a, b) => a - b);
          const k = `${nextMask}|${nextBag.join(',')}|${g.belt}|0`;
          const map = levels[prog + 1];
          const prev = map.get(k);
          if (!prev || catchT < prev.t - 1e-5 || (Math.abs(catchT - prev.t) <= 1e-5 && nextSlack > prev.minSlack)) {
            map.set(k, {
              mask: nextMask,
              bag: nextBag,
              floor: g.belt,
              x: CATCH_X,
              t: catchT,
              tapT: nextTapT,
              minSlack: nextSlack,
            });
          }
        }
      }
    }
  }
  let bestSlack = -1;
  for (const st of levels[2 * n].values()) {
    if (st.minSlack > bestSlack) bestSlack = st.minSlack;
  }
  return bestSlack;
}

// One-hand human check: returns missed gifts when playing with 1 hand under the 0.60s-per-gift rule
function verifyOneHandMisses(q, teeter, startFloor = 0, startX = DROP_CX, timeMul = 1.0) {
  const humanPerGift = TUNE.humanTimePerGift !== undefined ? TUNE.humanTimePerGift : 0.60;
  const reactTap = humanPerGift / 2;
  const beltSpd = TUNE.beltSpeed || 38;
  const CATCH_X = TAP_SPLIT + 16;
  const DROP_X = CHUTE_BX - 12;
  const mode = timeMul > 1.01 ? 'mouse' : 'touch';
  const gifts = [];
  let t = 0;
  for (const ev of q) {
    t += effEventDelay(ev, mode);
    if (ev.action === 'gift') {
      const spd = ev.gusted ? beltSpd * (ev.gustMul || GUST.beltMul) : beltSpd;
      const startXPos = ev.startX !== undefined ? ev.startX : -26;
      const tTeeter = t + Math.max(0, (TEETER_X - startXPos) / spd);
      gifts.push({
        belt: ev.belt,
        cat: ev.cat,
        tSpawn: t,
        tReady: tTeeter,
        tTeeter,
        tDeadline: tTeeter + teeter * timeMul,
        done: false,
      });
    }
  }
  let curFloor = startFloor;
  let curX = startX;
  let curT = 0;
  let misses = 0;

  while (true) {
    for (const g of gifts) {
      if (!g.done && g.tDeadline - humanPerGift < curT - 1e-6) {
        g.done = true;
        misses++;
      }
    }
    const avail = [];
    for (let i = 0; i < gifts.length; i++) {
      if (!gifts[i].done) avail.push(i);
    }
    if (!avail.length) break;

    let chosenIdx = -1;
    let bestCatchT = Infinity;
    const look = Math.min(avail.length, 3);
    for (let k = 0; k < look; k++) {
      const idx = avail[k];
      const g = gifts[idx];
      const arriveT = curT + reactTap + simTravelTime(curFloor, curX, g.belt, CATCH_X);
      const catchT = Math.max(arriveT, g.tReady);
      if (catchT <= g.tDeadline - humanPerGift + 1e-6 && catchT < bestCatchT) {
        bestCatchT = catchT;
        chosenIdx = idx;
      }
    }

    if (chosenIdx < 0) {
      gifts[avail[0]].done = true;
      misses++;
      continue;
    }

    const g = gifts[chosenIdx];
    g.done = true;
    for (const other of gifts) {
      if (!other.done && other.tDeadline - humanPerGift < bestCatchT - 1e-6) {
        other.done = true;
        misses++;
      }
    }
    const dropT = bestCatchT + reactTap + simTravelTime(g.belt, CATCH_X, g.cat, DROP_X);
    curFloor = g.cat;
    curX = DROP_X;
    curT = dropT;
  }
  return misses;
}

const BELT_CAP_BY_WAVE = [4, 5, 5, 6, 6, 7, 7, 8];
const BUILD_UP_DUR = 8.0;
const BREATHER_DUR = 2.0;

function beltCapForWave(waveIdx = S ? S.sleighsDone : 0) {
  return BELT_CAP_BY_WAVE[Math.max(0, Math.min(BELT_CAP_BY_WAVE.length - 1, waveIdx))];
}

function shuffleBag(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function refillFloorBag(sp, anchorFloor = -1, forbidFloor = -1) {
  const n = sp.curFloors;
  const bag = [];
  for (let f = 0; f < n; f++) bag.push(f);
  if (sp.waveIdx <= 1 && anchorFloor >= 0 && anchorFloor < n && anchorFloor !== forbidFloor) {
    bag.push(anchorFloor);
  }
  shuffleBag(bag);
  if (sp.maxFloorRun < 2 && sp.lastFloor >= 0 && sp.lastFloor < n && sp.floorRunLen === 1) {
    const idx = bag.indexOf(sp.lastFloor);
    if (idx > 0) {
      bag.splice(idx, 1);
      bag.unshift(sp.lastFloor);
    }
  }
  sp.floorBag = bag;
}

function drawFloorFromBag(sp, anchorFloor = -1, avoidFloor = -1, preferDist = -1) {
  const n = sp.curFloors;
  sp.floorBag = sp.floorBag.filter(f => f < n);
  const forbidRepeat = sp.floorRunLen >= 2 ? sp.lastFloor : -1;
  if (!sp.floorBag.length) {
    refillFloorBag(sp, anchorFloor, forbidRepeat);
  }

  const maxDist = preferDist >= 0 ? preferDist : (sp.waveIdx <= 1 ? 1 : -1);
  let chosenIdx = -1;
  if (maxDist >= 0 && anchorFloor >= 0) {
    for (let i = 0; i < sp.floorBag.length; i++) {
      const f = sp.floorBag[i];
      if (f !== forbidRepeat && f !== avoidFloor && Math.abs(f - anchorFloor) <= maxDist) {
        chosenIdx = i;
        break;
      }
    }
  }
  if (chosenIdx < 0) {
    for (let i = 0; i < sp.floorBag.length; i++) {
      const f = sp.floorBag[i];
      if (f !== forbidRepeat && f !== avoidFloor) {
        chosenIdx = i;
        break;
      }
    }
  }

  let b;
  if (chosenIdx >= 0) {
    b = sp.floorBag.splice(chosenIdx, 1)[0];
  } else {
    const cands = [];
    for (let f = 0; f < n; f++) {
      if (f !== forbidRepeat && f !== avoidFloor) cands.push(f);
    }
    if (!cands.length) {
      for (let f = 0; f < n; f++) {
        if (f !== forbidRepeat) cands.push(f);
      }
    }
    b = cands.length ? cands[Math.floor(Math.random() * cands.length)] : 0;
  }

  if (b === sp.lastFloor) {
    sp.floorRunLen++;
  } else {
    sp.lastFloor = b;
    sp.floorRunLen = 1;
  }
  if (sp.floorRunLen > sp.maxFloorRun) sp.maxFloorRun = sp.floorRunLen;
  return b;
}

function refillCatBag(sp, beltFloor = -1, forbidCat = -1) {
  const n = sp.curFloors;
  const bag = [];
  for (let c = 0; c < n; c++) bag.push(c);
  const sameProb = sp.w.sameCatProb || 0;
  if (sp.lastCat >= 0 && sp.lastCat < n && sp.lastCat !== forbidCat && Math.random() < sameProb) {
    bag.push(sp.lastCat);
  } else if (sp.waveIdx <= 1 && beltFloor >= 0 && beltFloor < n && beltFloor !== forbidCat && Math.random() < sameProb) {
    bag.push(beltFloor);
  }
  shuffleBag(bag);
  sp.catBag = bag;
}

function drawCatFromBag(sp, beltFloor = -1, preferDist = -1) {
  const n = sp.curFloors;
  sp.catBag = sp.catBag.filter(c => c < n);
  const forbidRepeat = sp.catRunLen >= 2 ? sp.lastCat : -1;
  if (!sp.catBag.length) {
    refillCatBag(sp, beltFloor, forbidRepeat);
  }

  const maxDist = preferDist >= 0 ? preferDist : (sp.waveIdx <= 1 ? 1 : -1);
  let chosenIdx = -1;
  if (sp.lastCat >= 0 && sp.lastCat < n && sp.lastCat !== forbidRepeat && Math.random() < (sp.w.sameCatProb || 0)) {
    const sameIdx = sp.catBag.indexOf(sp.lastCat);
    if (sameIdx >= 0 && (maxDist < 0 || Math.abs(sp.lastCat - beltFloor) <= maxDist)) {
      chosenIdx = sameIdx;
    }
  }
  if (chosenIdx < 0 && maxDist >= 0 && beltFloor >= 0) {
    for (let i = 0; i < sp.catBag.length; i++) {
      const c = sp.catBag[i];
      if (c !== forbidRepeat && Math.abs(c - beltFloor) <= maxDist) {
        chosenIdx = i;
        break;
      }
    }
  }
  if (chosenIdx < 0) {
    for (let i = 0; i < sp.catBag.length; i++) {
      if (sp.catBag[i] !== forbidRepeat) {
        chosenIdx = i;
        break;
      }
    }
  }

  let c;
  if (chosenIdx >= 0) {
    c = sp.catBag.splice(chosenIdx, 1)[0];
  } else {
    const cands = [];
    for (let i = 0; i < n; i++) {
      if (i !== forbidRepeat) cands.push(i);
    }
    c = cands.length ? cands[Math.floor(Math.random() * cands.length)] : 0;
  }

  if (c === sp.lastCat) {
    sp.catRunLen++;
  } else {
    sp.lastCat = c;
    sp.catRunLen = 1;
  }
  return c;
}

function spawnerIntervalAt(sp, t = sp.clock) {
  const u = Math.min(1, Math.max(0, t / sp.curveHorizon));
  return sp.startGap + (sp.endGap - sp.startGap) * u;
}

function checkSpawnerProgressiveFloor(sp) {
  if (!sp.w.progressiveFloors) return 0;
  const match = sp.w.progressiveFloors.find(p => p.atGift === sp.giftsSpawned);
  if (match && match.floors > sp.curFloors) {
    sp.curFloors = match.floors;
    return match.floors;
  }
  return 0;
}

function createWaveSpawner(waveIdx, startFloor = 0) {
  const w = WAVES[Math.min(waveIdx, WAVES.length - 1)];
  const target = SLEIGHS[Math.min(waveIdx, SLEIGHS.length - 1)];
  const startGap = w.flowGap;
  const endGap = w.burstGap || w.speedUpGap || w.flowGap;
  const avgGap = (startGap + endGap) * 0.5;
  const curFloors = w.startFloors || w.floors || 2;
  const wantSnowballs = w.snowballs || 0;
  const snowballSlots = [];
  if (wantSnowballs === 1) {
    snowballSlots.push({ cycle: 0, buildT: 3.0 });
  } else if (wantSnowballs === 2) {
    snowballSlots.push({ cycle: 0, buildT: 2.8 }, { cycle: 0, buildT: 5.6 });
  } else if (wantSnowballs === 3) {
    snowballSlots.push({ cycle: 0, buildT: 2.6 }, { cycle: 0, buildT: 5.4 }, { cycle: 1, buildT: 2.8 });
  } else if (wantSnowballs >= 4) {
    snowballSlots.push(
      { cycle: 0, buildT: 2.4 },
      { cycle: 0, buildT: 5.2 },
      { cycle: 1, buildT: 2.4 },
      { cycle: 1, buildT: 5.2 }
    );
  }
  return {
    waveIdx,
    w,
    target,
    startGap,
    endGap,
    curveHorizon: Math.max(8, target * avgGap),
    beltCap: beltCapForWave(waveIdx),
    peakSize: w.peakSize || (waveIdx >= 4 ? 4 : 3),
    curFloors,
    floorBag: [],
    catBag: [],
    lastFloor: -1,
    floorRunLen: 0,
    maxFloorRun: 0,
    lastCat: Math.max(0, Math.min(curFloors - 1, startFloor)),
    catRunLen: 0,
    clock: 0,
    nomClock: 0,
    cycleStartClock: 0.10,
    stage: 'preseed',
    cycleIdx: 0,
    cycleBuildT: 0,
    peakRemaining: 0,
    pairDoneInCycle: false,
    pairsSpawned: 0,
    gustsSpawned: 0,
    snowballsSpawned: 0,
    snowballSlots,
    lastSnowballBelt: -1,
    beltLastWasSnowball: [false, false, false, false, false],
    pendingAfterSnowballBelt: -1,
    peakTimes: [],
    giftsSpawned: 0,
    pendingJitter: 0,
    postBreatherHold: 0,
    heldTime: 0,
  };
}

function generateNextSpawnerEvents(sp, missesSoFar = 0) {
  const events = [];
  const w = sp.w;
  const goalGifts = sp.target + missesSoFar;

  if (sp.stage === 'preseed') {
    const preN = sp.waveIdx === 0 ? 1 : 2;
    const prePositions = preN === 1 ? [78] : [88, 32];
    for (let i = 0; i < preN; i++) {
      const unlocked = checkSpawnerProgressiveFloor(sp);
      const avoidF = i === 1 && events.length ? events[0].belt : -1;
      const b = unlocked ? (unlocked - 1) : drawFloorFromBag(sp, sp.lastCat, avoidF);
      const c = drawCatFromBag(sp, b);
      const delay = i === 0 ? 0.04 : 0.06;
      sp.clock += delay;
      sp.nomClock += delay;
      sp.giftsSpawned++;
      events.push({
        delay,
        delayType: 'init',
        phase: 'flow',
        action: 'gift',
        belt: b,
        cat: c,
        startX: prePositions[i],
        unlockFloor: unlocked,
        gusted: false,
      });
    }
    sp.stage = 'buildup';
    sp.cycleBuildT = 0;
    sp.cycleStartClock = sp.nomClock;
    sp.pairDoneInCycle = false;
    return events;
  }

  // Once the goal number of gifts has already been released onto the belts, keep releasing at steady endGap until the sleigh fills
  if (sp.giftsSpawned >= goalGifts && sp.stage !== 'peak') {
    const extraHold = sp.postBreatherHold || 0;
    sp.postBreatherHold = 0;
    const delay = sp.endGap + extraHold;
    const unlocked = checkSpawnerProgressiveFloor(sp);
    const forcedBelt = (!unlocked && sp.pendingAfterSnowballBelt >= 0 && sp.pendingAfterSnowballBelt < sp.curFloors)
      ? sp.pendingAfterSnowballBelt
      : -1;
    if (forcedBelt >= 0) sp.pendingAfterSnowballBelt = -1;
    const b = unlocked ? (unlocked - 1) : (forcedBelt >= 0 ? forcedBelt : drawFloorFromBag(sp, sp.lastCat, -1, 1));
    sp.beltLastWasSnowball[b] = false;
    const c = drawCatFromBag(sp, b, 1);
    sp.clock += delay;
    sp.nomClock += delay;
    sp.giftsSpawned++;
    events.push({
      delay,
      delayType: 'flow',
      phase: 'flow',
      action: 'gift',
      belt: b,
      cat: c,
      startX: -26,
      unlockFloor: unlocked,
      gusted: false,
    });
    return events;
  }

  if (sp.stage === 'peak') {
    const baseGap = spawnerIntervalAt(sp, sp.cycleStartClock + BUILD_UP_DUR);
    const peakGap = Number((baseGap * 0.5).toFixed(3));
    const isPeakStart = sp.peakRemaining === sp.peakSize;
    const unlocked = checkSpawnerProgressiveFloor(sp);
    const forcedBelt = (!unlocked && sp.pendingAfterSnowballBelt >= 0 && sp.pendingAfterSnowballBelt < sp.curFloors)
      ? sp.pendingAfterSnowballBelt
      : -1;
    if (forcedBelt >= 0) sp.pendingAfterSnowballBelt = -1;
    const b = unlocked ? (unlocked - 1) : (forcedBelt >= 0 ? forcedBelt : drawFloorFromBag(sp, sp.lastCat, -1, 1));
    sp.beltLastWasSnowball[b] = false;
    const c = drawCatFromBag(sp, b, 1);
    sp.clock += peakGap;
    sp.nomClock += peakGap;
    sp.giftsSpawned++;
    sp.peakRemaining--;
    events.push({
      delay: peakGap,
      delayType: 'burst',
      phase: 'burst',
      action: 'gift',
      belt: b,
      cat: c,
      startX: -26,
      unlockFloor: unlocked,
      gusted: false,
      isPeakGift: true,
      isPeakStart,
      peakClock: isPeakStart ? Number((sp.nomClock - peakGap).toFixed(2)) : 0,
    });
    if (sp.peakRemaining <= 0) {
      sp.stage = 'buildup';
      sp.cycleIdx++;
      sp.cycleBuildT = 0;
      sp.pairDoneInCycle = false;
      sp.pendingJitter = 0;
      sp.postBreatherHold = BREATHER_DUR;
      sp.cycleStartClock = sp.nomClock + BREATHER_DUR;
    }
    return events;
  }

  // Stage is 'buildup'
  const extraHold = sp.postBreatherHold || 0;
  sp.postBreatherHold = 0;
  if (extraHold > 0) {
    sp.nomClock += extraHold;
  }

  const nomBuildT = sp.nomClock - sp.cycleStartClock;
  const baseGap = spawnerIntervalAt(sp, sp.nomClock);
  const remBuild = (sp.cycleStartClock + BUILD_UP_DUR) - sp.nomClock;
  const nearGoal = sp.giftsSpawned >= goalGifts - 3 ? 1 : -1;
  const nextSlot = sp.snowballSlots[0] || null;
  const urgentSnowball = Boolean(nextSlot && (goalGifts - sp.giftsSpawned) <= sp.snowballSlots.length * 2 + 1);
  const slotDueNow = Boolean(
    nextSlot &&
    sp.pendingAfterSnowballBelt < 0 &&
    sp.giftsSpawned + 2 <= goalGifts &&
    (urgentSnowball || sp.cycleIdx > nextSlot.cycle || (sp.cycleIdx === nextSlot.cycle && nomBuildT >= nextSlot.buildT))
  );

  // Check if we should spawn the single pair (and optional gust) for this build-up cycle
  const canPair = !sp.pairDoneInCycle &&
    sp.pendingAfterSnowballBelt < 0 &&
    !slotDueNow &&
    sp.pairsSpawned < (w.pairs || 0) &&
    sp.curFloors >= 2 &&
    sp.giftsSpawned + 2 < goalGifts &&
    nomBuildT >= 1.5 &&
    remBuild >= baseGap * 1.45;

  if (canPair) {
    sp.pairDoneInCycle = true;
    sp.pairsSpawned++;
    const useGust = sp.gustsSpawned < (w.gusts || 0);
    if (useGust) sp.gustsSpawned++;

    const unlocked1 = checkSpawnerProgressiveFloor(sp);
    const b1 = unlocked1 ? (unlocked1 - 1) : drawFloorFromBag(sp, sp.lastCat, -1, 1);
    sp.beltLastWasSnowball[b1] = false;
    const c1 = drawCatFromBag(sp, b1, 1);
    const pairLag = useGust ? 0.24 : 0.22;
    const nomPairStep = Math.max(0.28 + pairLag, baseGap);
    const delay1 = Math.max(0.28, nomPairStep - pairLag - sp.pendingJitter) + extraHold;
    sp.pendingJitter = 0;
    sp.clock += delay1;
    sp.nomClock += nomPairStep - pairLag;
    sp.cycleBuildT = sp.nomClock - sp.cycleStartClock;
    sp.giftsSpawned++;

    const unlocked2 = checkSpawnerProgressiveFloor(sp);
    const b2 = unlocked2 ? (unlocked2 - 1) : drawFloorFromBag(sp, c1, b1, 1);
    sp.beltLastWasSnowball[b2] = false;
    const c2 = sp.waveIdx <= 1 ? c1 : drawCatFromBag(sp, b2, 1);
    sp.clock += pairLag;
    sp.nomClock += pairLag;
    sp.cycleBuildT = sp.nomClock - sp.cycleStartClock;
    sp.giftsSpawned++;

    const mul = w.gustMul || GUST.beltMul || 1.95;
    const beltSpd = TUNE.beltSpeed || 115;
    const travelNormal = (TEETER_X - (-26)) / beltSpd;
    const gustStartX = useGust
      ? Math.min(-26, Math.round(TEETER_X - travelNormal * beltSpd * mul))
      : -26;

    events.push({
      delay: delay1,
      delayType: 'flow',
      phase: 'flow',
      action: 'gift',
      belt: b1,
      cat: c1,
      startX: -26,
      unlockFloor: unlocked1,
      paired: true,
      gustLead: useGust,
      warnDur: useGust ? Math.max(GUST.warnTime || 1.0, pairLag) : 0,
      warnBelts: useGust ? [b2, b1] : null,
      gusted: false,
    });
    events.push({
      delay: pairLag,
      delayType: 'flow',
      phase: 'flow',
      action: 'gift',
      belt: b2,
      cat: c2,
      startX: gustStartX,
      unlockFloor: unlocked2,
      paired: true,
      isPairSecond: true,
      gusted: useGust,
      gustMul: useGust ? mul : 0,
      triggerGust: useGust,
      gustBelts: useGust ? [b2] : null,
    });
    return events;
  }

  // Normal build-up gift with paired +/-6% jitter (within +/-10%) and exact clamp to 8.0s peak start
  let nomStep;
  let stepGap;
  if (remBuild <= baseGap * 1.45 || sp.giftsSpawned + 1 === goalGifts) {
    nomStep = sp.giftsSpawned + 1 === goalGifts && remBuild > baseGap * 1.45 ? baseGap : remBuild;
    stepGap = nomStep - sp.pendingJitter;
    sp.pendingJitter = 0;
  } else if (sp.pendingJitter !== 0) {
    nomStep = baseGap;
    stepGap = baseGap - sp.pendingJitter;
    sp.pendingJitter = 0;
  } else if (remBuild >= baseGap * 2.85 && sp.giftsSpawned + 2 < goalGifts) {
    nomStep = baseGap;
    const jSec = ((Math.random() * 0.12) - 0.06) * baseGap;
    sp.pendingJitter = jSec;
    stepGap = baseGap + jSec;
  } else {
    nomStep = baseGap;
    stepGap = baseGap;
  }

  const delay = stepGap + extraHold;
  const unlocked = checkSpawnerProgressiveFloor(sp);
  let b;
  if (unlocked) {
    b = unlocked - 1;
  } else if (sp.pendingAfterSnowballBelt >= 0 && sp.pendingAfterSnowballBelt < sp.curFloors) {
    b = sp.pendingAfterSnowballBelt;
    sp.pendingAfterSnowballBelt = -1;
    if (b === sp.lastFloor) sp.floorRunLen++;
    else { sp.lastFloor = b; sp.floorRunLen = 1; }
  } else if (slotDueNow) {
    const avoidBelt = sp.curFloors >= 2 ? sp.lastSnowballBelt : -1;
    b = drawFloorFromBag(sp, sp.lastCat, avoidBelt, nearGoal);
    if (sp.beltLastWasSnowball[b]) {
      for (let f = 0; f < sp.curFloors; f++) {
        if (!sp.beltLastWasSnowball[f]) { b = f; break; }
      }
    }
  } else {
    b = drawFloorFromBag(sp, sp.lastCat, -1, nearGoal);
  }
  sp.beltLastWasSnowball[b] = false;
  const c = drawCatFromBag(sp, b, nearGoal);
  sp.clock += delay;
  sp.nomClock += nomStep;
  sp.cycleBuildT = sp.nomClock - sp.cycleStartClock;
  sp.giftsSpawned++;
  const phase = sp.cycleBuildT >= BUILD_UP_DUR * 0.55 ? 'speedup' : 'flow';

  events.push({
    delay,
    delayType: phase,
    phase,
    action: 'gift',
    belt: b,
    cat: c,
    startX: -26,
    unlockFloor: unlocked,
    gusted: false,
  });

  if (slotDueNow && !unlocked && !sp.beltLastWasSnowball[b] && sp.giftsSpawned < goalGifts) {
    sp.snowballSlots.shift();
    sp.snowballsSpawned++;
    sp.lastSnowballBelt = b;
    sp.beltLastWasSnowball[b] = true;
    sp.pendingAfterSnowballBelt = b;
    events.push({
      delay: 0,
      delayType: 'snowball',
      phase,
      action: 'snowball',
      belt: b,
    });
  }

  if (sp.cycleBuildT >= BUILD_UP_DUR - 1e-4 && sp.giftsSpawned <= goalGifts) {
    sp.stage = 'peak';
    sp.peakRemaining = sp.peakSize;
  }

  return events;
}

function buildWaveQueue(waveIdx) {
  const w = WAVES[Math.min(waveIdx, WAVES.length - 1)];
  const maxFloors = w.floors || 2;
  const carryCap = 2;
  const startFloor = (S && S.elf) ? Math.min(maxFloors - 1, S.elf.floor) : 0;
  const startX = (S && S.elf) ? S.elf.x : DROP_CX;

  // Single-pass check for verifyWaveSolvable (no 40-attempt retry loop)
  const checkSp = createWaveSpawner(waveIdx, startFloor);
  const checkQ = [];
  while (checkSp.giftsSpawned < checkSp.target) {
    const evs = generateNextSpawnerEvents(checkSp);
    for (const ev of evs) {
      checkQ.push(ev);
      if (checkSp.giftsSpawned >= checkSp.target && !ev.paired) break;
    }
  }
  const slackTouch = verifyWaveSolvable(checkQ, w.teeter, carryCap, startFloor, startX, 1.0);
  const slackMouse = verifyWaveSolvable(checkQ, w.teeter, carryCap, startFloor, startX, TUNE.mouseTimeMul || 1.15);
  if (S) {
    if (!S.waveSolvableReport) S.waveSolvableReport = [];
    S.waveSolvableReport[waveIdx] = {
      wave: waveIdx + 1,
      slackTouch: Number(slackTouch.toFixed(2)),
      slackMouse: Number(slackMouse.toFixed(2)),
    };
  }

  // Initialize the live continuous spawner for this sleigh
  const liveSp = createWaveSpawner(waveIdx, startFloor);
  const initialEvents = generateNextSpawnerEvents(liveSp);
  if (S) {
    S.spawner = liveSp;
    S.lastBelt = liveSp.lastFloor;
    S.lastCat = liveSp.lastCat;
  }
  return initialEvents;
}

function startWave(waveIdx) {
  show('btnSkipTut', false);
  S.sleighsDone = Math.max(0, Math.min(WAVES.length - 1, waveIdx));
  S.inSleigh = 0;
  S.recycled = 0;
  S.waveRecycled = 0;
  S.recycleDrainFrom = 0;
  S.recycleDrainDur = 0;
  S.binPops = [];
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
  S.gustMul = w.gustMul || GUST.beltMul;
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

  S.carryCap = 2;
  S.snowAmt = snowTarget();

  // Sleigh 7 (finale): hurry-up music starts at the beginning of the level
  if (waveNum >= TUNE.hurryMusicFromWave) {
    api.play('game_hurry_up');
    say(_msg`elfexpress_sr_last_sleigh`);
  }

  S.waveQueue = buildWaveQueue(S.sleighsDone);
  S.gifts = [];
  S.snowballSchedule = [];
  S.beltLastWasSnowball = [false, false, false, false, false];
  S.snowballHitT = 0;
  S.snowballShedAcc = 0;
  S.spawnTimer = S.waveQueue.length ? effEventDelay(S.waveQueue[0]) : 0.04;
  if (!S.tut && !S.firstSnowballShown && (w.snowballs || 0) > 0) {
    S.firstSnowballShown = true;
    S.snowballBoxUp = true;
    S.snowballBoxLockT = 1.0;
    S.cmd = null;
    S.queue = null;
    S.actionEdge = false;
    S.actionBuf = 0;
    S.actionHeld = false;
    clearKeys();
  }
  syncTunePanel();
  reportScore();
}

function nextBeltEdgeItem(floor) {
  if (!S || !S.gifts) return null;
  let best = null;
  for (const g of S.gifts) {
    if (g.belt === floor && (g.state === 'belt' || g.state === 'teeter')) {
      if (!best || g.x > best.x) best = g;
    }
  }
  return best;
}

function frontSnowballAtEdge(floor) {
  const front = nextBeltEdgeItem(floor);
  if (!front || !front.isSnowball) return null;
  if (front.state === 'teeter' || (front.state === 'belt' && front.x >= TEETER_X - 36)) {
    return front;
  }
  return null;
}

function activeCommittedSnowball() {
  if (!S || !S.cmd || S.cmd.type !== 'belt' || !S.cmd.commitSnowballId || !S.gifts) return null;
  return S.gifts.find(
    g => g.id === S.cmd.commitSnowballId && g.isSnowball && (g.state === 'belt' || g.state === 'teeter')
  ) || null;
}

function clearSnowballTaps() {
  if (!S || !S.gifts) return;
  const keepId = S.cmd && S.cmd.commitSnowballId;
  for (const g of S.gifts) {
    if (g.isSnowball && g.id !== keepId) g.tappedByPlayer = false;
  }
}

const isTutBlockingBox = () => Boolean(S && S.tut === 1 && S.tutBoxUp);

function tryGrabBeltSnowball(forgiving = false) {
  if (!S || S.mode !== 'play' || isTutBlockingBox() || S.snowballBoxUp) return false;
  const e = S.elf;
  if (e.climbing) return false;
  const maxX = forgiving ? LADDER_CX + 16 : TAP_SPLIT + 16;
  if (e.x < BUILD_X0 || e.x > maxX) return false;
  if (!forgiving && S.beltIdleAfterGiftFloor === e.floor) return false;
  const sb = frontSnowballAtEdge(e.floor);
  if (sb) return pickupSnowball(sb);
  return false;
}

function pickupSnowball(sb) {
  if (!S || !sb || !sb.isSnowball || sb.state === 'done') return false;
  const e = S.elf;
  if (e.x > TAP_SPLIT + 16) {
    e.x = DROP_X1;
  }
  sb.state = 'done';
  sb.tappedByPlayer = false;
  S.beltIdleAfterGiftFloor = -1;
  if (S.cmd && S.cmd.commitSnowballId === sb.id) {
    S.cmd.commitSnowballId = 0;
  }
  if (S.cmd && S.cmd.type === 'belt' && S.cmd.floor === sb.belt) {
    S.cmd = S.queue || null;
    S.queue = null;
  }
  S.snowballHitT = TUNE.snowballSlowTime || 2.5;
  S.snowballShedAcc = 0;
  S.actionBuf = 0;
  S.actionHeld = false;
  puff(e.x, carryY(e.floor, elfChoice), '#FFFFFF', 14);
  puff(e.x, carryY(e.floor, elfChoice), '#BAE6FD', 8);
  api.play('pd_item_miss');
  syncTunePanel();
  return true;
}

function beltTailX(floor) {
  if (!S || !S.gifts) return Infinity;
  let minX = Infinity;
  for (const g of S.gifts) {
    if (g.belt === floor && (g.state === 'belt' || g.state === 'teeter')) {
      if (g.x < minX) minX = g.x;
    }
  }
  return minX;
}

function spawnSnowballOnBelt(belt, startX = -78) {
  const nFloors = activeFloors();
  const safeBelt = Math.max(0, Math.min(nFloors - 1, belt || 0));
  if (!S.beltLastWasSnowball) S.beltLastWasSnowball = [false, false, false, false, false];
  if (S.beltLastWasSnowball[safeBelt]) return null;
  const tailX = beltTailX(safeBelt);
  const spawnX = tailX < Infinity ? Math.min(startX, tailX - 56) : startX;
  const g = {
    id: S.nextId++, cat: 0, v: 0, belt: safeBelt, state: 'belt',
    isSnowball: true, tappedByPlayer: false,
    x: spawnX, y: beltY(safeBelt) - GIFT_R,
    timer: 0, teeter: wave().teeter,
    wrapped: false, tilt: 0, spin: 0, gusted: false,
    path: null, seg: 0, p: 0, speed: 0, dropFloor: -1, ductFloor: -1,
  };
  S.beltLastWasSnowball[safeBelt] = true;
  S.gifts.push(g);
  return g;
}

function spawnGiftOnBelt(belt, startX = -30, teeterOverride = null, catOverride = null) {
  const nFloors = activeFloors();
  const safeBelt = Math.max(0, Math.min(nFloors - 1, belt));
  const tailX = beltTailX(safeBelt);
  const minTailGap = (S.beltLastWasSnowball && S.beltLastWasSnowball[safeBelt]) ? 56 : 52;
  const spawnX = tailX < Infinity ? Math.min(startX, tailX - minTailGap) : startX;
  if (!S.beltLastWasSnowball) S.beltLastWasSnowball = [false, false, false, false, false];
  S.beltLastWasSnowball[safeBelt] = false;
  const cat = (catOverride !== null && catOverride !== undefined)
    ? Math.max(0, Math.min(nFloors - 1, catOverride))
    : pickCategory(null, nFloors);
  S.recent.push(cat);
  if (S.recent.length > 4) S.recent.shift();
  const v = (S.revealed && Math.random() < 0.55) ? 1 : 0;
  const g = {
    id: S.nextId++, cat, v, belt: safeBelt, state: 'belt',
    x: spawnX, y: beltY(safeBelt) - GIFT_R,
    timer: 0, teeter: teeterOverride || wave().teeter,
    wrapped: false, tilt: 0, spin: 0, gusted: false,
    path: null, seg: 0, p: 0, speed: 0, dropFloor: -1, ductFloor: -1,
  };
  S.gifts.push(g);
  return g;
}

function triggerGustNow(belts, mul) {
  const gustMul = mul || wave().gustMul || GUST.beltMul;
  S.gustWarnT = 0;
  S.gustT = GUST.dur;
  S.gustX = -220;
  S.gustMul = gustMul;
  S.gustBelts = belts ? belts.slice() : null;
  if (!reduceMotion) {
    const strength = Math.max(0.4, Math.min(1.3, (gustMul - 1.2) / 0.9));
    S.shake = Math.max(S.shake, 0.10 + 0.10 * strength);
  }
  say(_msg`elfexpress_sr_gust`);
  for (const g of S.gifts) {
    if (g.state === 'belt' && (!belts || belts.includes(g.belt))) {
      g.gusted = true;
      if (!g.gustMul) g.gustMul = gustMul;
    }
  }
}

function processWaveQueue(dt) {
  if (S.tut) return;
  if (S.relaxT > 0) {
    S.relaxT = Math.max(0, S.relaxT - dt);
    if (S.recycleDrainFrom > 0 && S.recycleDrainDur > 0) {
      const k = Math.max(0, (S.relaxT - 0.35) / Math.max(0.5, S.recycleDrainDur - 0.35));
      S.recycled = Math.max(0, Math.ceil(S.recycleDrainFrom * k - 0.05));
    }
    if (S.relaxT <= 0) {
      startWave(S.sleighsDone);
    }
    return;
  }

  if (S.inSleigh >= sleighTarget()) return;

  if (!S.spawner) {
    S.spawner = createWaveSpawner(S.sleighsDone, S.elf ? S.elf.floor : 0);
  }
  const sp = S.spawner;

  if (!S.waveQueue.length) {
    const nextEvs = generateNextSpawnerEvents(sp, S.waveRecycled || 0);
    for (const ev of nextEvs) S.waveQueue.push(ev);
    S.lastBelt = sp.lastFloor;
    S.lastCat = sp.lastCat;
    if (S.waveQueue.length && S.spawnTimer <= 0) {
      S.spawnTimer = effEventDelay(S.waveQueue[0]);
    }
  }

  const beltCap = beltCapForWave(S.sleighsDone);
  S.spawnTimer -= dt;
  while (S.waveQueue.length && S.spawnTimer <= 0) {
    const nextAction = S.waveQueue[0].action;
    const onBelts = S.gifts.filter(g => !g.isSnowball && (g.state === 'belt' || g.state === 'teeter')).length;
    if (nextAction !== 'snowball' && onBelts >= beltCap) {
      S.spawnTimer = 0;
      break;
    }
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
    } else if (ev.action === 'snowball') {
      spawnSnowballOnBelt(ev.belt, -78);
    } else if (ev.action === 'gift') {
      if (ev.isPeakStart) {
        sp.peakTimes.push(ev.peakClock);
      }
      const g = spawnGiftOnBelt(ev.belt, ev.startX !== undefined ? ev.startX : -30, null, ev.cat);
      if (ev.gustLead) {
        S.gustWarnT = ev.warnDur || GUST.warnTime;
        S.gustWarnBelts = ev.warnBelts ? ev.warnBelts.slice() : [ev.belt];
      }
      if (ev.gusted) {
        g.gusted = true;
        g.gustMul = ev.gustMul || wave().gustMul || GUST.beltMul;
      }
      if (ev.triggerGust) {
        triggerGustNow(ev.gustBelts || (S.gustWarnBelts.length ? S.gustWarnBelts : [ev.belt]), ev.gustMul);
      }
    }
    if (!S.waveQueue.length) {
      const nextEvs = generateNextSpawnerEvents(sp, S.waveRecycled || 0);
      for (const nextEv of nextEvs) S.waveQueue.push(nextEv);
      S.lastBelt = sp.lastFloor;
      S.lastCat = sp.lastCat;
    }
    if (S.waveQueue.length) {
      S.spawnTimer += effEventDelay(S.waveQueue[0]);
    } else {
      S.spawnTimer = 0;
    }
  }
}

function updateGifts(dt) {
  const pausedByBox = Boolean((S.tut === 1 && S.tutBoxUp) || S.snowballBoxUp);
  const pausedBelts = S.relaxT > 0 || pausedByBox;
  const beltSpeedMul = (S.breatheSlowT > 0) ? 0.35 : 1.0;
  const teetering = [];
  for (const g of S.gifts) if (g.state === 'teeter') teetering[g.belt] = g;

  for (const g of S.gifts) {
    if (g.state === 'done') continue;
    switch (g.state) {
      case 'belt': {
        if (pausedBelts) break;
        const edgeItem = teetering[g.belt];
        const edgeGap = (g.isSnowball || (edgeItem && edgeItem.isSnowball)) ? 56 : 40;
        let limit = edgeItem ? TEETER_X - edgeGap : TEETER_X;
        for (const o of S.gifts) {
          if (o !== g && o.belt === g.belt && (o.state === 'belt' || o.state === 'teeter') && o.x > g.x && o.x - g.x < 240) {
            const minSep = (g.isSnowball || o.isSnowball) ? 56 : 40;
            limit = Math.min(limit, o.x - minSep);
          }
        }
        if (g.isSnowball) {
          const inGustBelts = !S.gustBelts || S.gustBelts.includes(g.belt);
          const blown = g.gusted || (S.gustT > 0 && inGustBelts && g.x < gustFront());
          if (blown) {
            g.gusted = true;
            if (!g.gustMul) g.gustMul = S.gustMul || wave().gustMul || GUST.beltMul;
          }
          const effGustMul = g.gustMul || S.gustMul || wave().gustMul || GUST.beltMul;
          const beltSpd = TUNE.beltSpeed || 49;
          const spd = beltSpd * (blown ? effGustMul : beltSpeedMul);
          const prevX = g.x;
          g.x = Math.min(g.x + spd * dt, limit);
          g.spin = (g.spin || 0) + Math.max(0, g.x - prevX) / (TUNE.snowballRadius || GIFT_R);

          if (g.tappedByPlayer) {
            const e = S.elf;
            if (!e.climbing && e.floor === g.belt && e.x <= TAP_SPLIT + 16 && g.x >= TEETER_X - 36) {
              pickupSnowball(g);
              break;
            }
            if (S.cmd && S.cmd.type === 'belt' && S.cmd.floor === g.belt && S.cmd.commitSnowballId === g.id) {
              if (!teetering[g.belt] && g.x >= TEETER_X - 0.5) {
                g.x = TEETER_X;
                g.state = 'teeter';
                g.timer = 0;
                teetering[g.belt] = g;
              }
              break;
            }
            g.tappedByPlayer = false;
          }
          if (!teetering[g.belt] && g.x >= TEETER_X - 0.5) {
            g.x = TEETER_X;
            g.state = 'teeter';
            g.timer = 0;
            teetering[g.belt] = g;
          }
          break;
        }
        const inGustBelts = !S.gustBelts || S.gustBelts.includes(g.belt);
        const blown = g.gusted || (S.gustT > 0 && inGustBelts && g.x < gustFront());
        if (blown) {
          g.gusted = true;
          if (!g.gustMul) g.gustMul = S.gustMul || wave().gustMul || GUST.beltMul;
        }
        const effGustMul = g.gustMul || S.gustMul || wave().gustMul || GUST.beltMul;
        const strength = Math.max(0.45, Math.min(1.25, (effGustMul - 1.2) / 0.9));
        g.tilt = blown ? (0.10 + 0.08 * strength) : 0;
        const beltSpd = (S.tut || g.tutGift || g.tutWatch) ? 49 : (TUNE.beltSpeed || 115);
        g.x = Math.min(g.x + beltSpd * (blown ? effGustMul : beltSpeedMul) * dt, limit);
        if (!teetering[g.belt] && g.x >= TEETER_X - 0.5) {
          g.state = 'teeter'; g.timer = 0; teetering[g.belt] = g;
        }
        break;
      }
      case 'teeter': {
        if (pausedBelts) break;
        g.timer += dt;
        const len = teeterLen(g);
        if (g.isSnowball && S.cmd && S.cmd.type === 'belt' && S.cmd.commitSnowballId === g.id) {
          g.timer = Math.min(g.timer, Math.max(0, len - 0.02));
        }
        const k = (g.tutGift && len > 100) ? 0.65 : Math.min(g.timer / len, 1);
        g.teeterProg = (g.tutGift && len > 100) ? 0 : k;
        if (reduceMotion || g.isSnowball) {
          g.tilt = 0;
        } else if (g.tutGift && len > 100) {
          g.tilt = Math.sin(g.timer * 4.5 * Math.PI) * 0.10;
        } else {
          const freq = (1.4 + 3.2 * k * k) * Math.PI * 2;
          g.wobblePhase = (g.wobblePhase || 0) + dt * freq;
          const amp = 0.09 + 0.35 * Math.pow(k, 1.35);
          g.tilt = Math.sin(g.wobblePhase) * amp;
        }
        if (!g.tutGift && g.timer >= len) {
          if (g.isSnowball) {
            puff(g.x, g.y - 6, '#FFFFFF', 14);
            puff(g.x, g.y - 6, '#BAE6FD', 10);
            g.state = 'done';
            g.tilt = 0;
          } else {
            const fx = (S && S.missFx) || missFxMode || 'A';
            g.state = 'fading';
            g.timer = 0;
            g.missFx = fx;
            g.baseX = g.x;
            g.baseY = g.y;
            g.fadeDur = fx === 'B' ? 0.34 : (fx === 'C' ? 0.38 : 0.36);
            g.fadeAlpha = 1;
            g.fadeScale = 1;
            g.fadeProg = 0;
            g.puffDone = false;
            g.tilt = fx === 'A' ? 0.18 : 0;
            if (fx === 'C') {
              puff(g.x, g.y, '#FFFFFF', 12);
              puff(g.x, g.y, '#E2E8F0', 8);
              g.puffDone = true;
            }
            breakCombo();
            api.play('pd_item_miss');
            if (g.tutWatch) {
              S.recycled = Math.min(TUNE.recycleLimit, (S.recycled || 0) + 1);
              triggerBinRecycleFeedback(true);
            } else {
              S.missed++;
              S.recycled++;
              S.waveRecycled = (S.waveRecycled || 0) + 1;
              triggerBinRecycleFeedback(false);
              checkLoss();
            }
          }
        }
        break;
      }
      case 'fading': {
        if (pausedByBox) break;
        g.timer += dt;
        const dur = g.fadeDur || 0.36;
        const u = Math.min(1, g.timer / dur);
        g.fadeProg = u;
        const fx = g.missFx || (S && S.missFx) || missFxMode || 'A';
        const toyCol = CATS[g.cat] ? CATS[g.cat].color : '#BAE6FD';
        if (fx === 'B') {
          g.x = g.baseX !== undefined ? g.baseX : g.x;
          g.y = g.baseY !== undefined ? g.baseY : g.y;
          g.tilt = 0;
          if (u < 0.38) {
            const s = u / 0.38;
            g.fadeScale = 1 + 0.28 * Math.sin(s * Math.PI * 0.5);
            g.fadeAlpha = 1;
          } else {
            const s = (u - 0.38) / 0.62;
            g.fadeScale = Math.max(0, 1.28 * (1 - s * s));
            g.fadeAlpha = Math.max(0, 1 - Math.pow(s, 1.4));
            if (!g.puffDone && u >= 0.42) {
              g.puffDone = true;
              puff(g.x, g.y, '#FFFFFF', 8);
              puff(g.x, g.y, toyCol, 6);
            }
          }
        } else if (fx === 'C') {
          g.x = g.baseX !== undefined ? g.baseX : g.x;
          g.y = g.baseY !== undefined ? g.baseY : g.y;
          g.tilt = 0;
          g.fadeAlpha = u < 0.30 ? Math.max(0, 1 - u / 0.30) : 0;
          g.fadeScale = 1 - 0.25 * Math.min(1, u / 0.30);
        } else {
          const bx = g.baseX !== undefined ? g.baseX : TEETER_X;
          const by = g.baseY !== undefined ? g.baseY : (beltY(g.belt) - GIFT_R);
          g.x = bx + 14 * u;
          g.y = by + 38 * (u * u);
          g.tilt = reduceMotion ? 0 : (0.18 + 0.78 * u);
          g.fadeScale = 1 - 0.28 * u;
          g.fadeAlpha = Math.max(0, 1 - Math.pow(u, 1.25));
          if (!g.puffDone && u >= 0.78) {
            g.puffDone = true;
            puff(g.x, g.y, '#FFFFFF', 7);
            puff(g.x, g.y, toyCol, 5);
          }
        }
        if (g.timer >= dur) {
          g.state = 'done';
        }
        break;
      }
      case 'falling': {
        if (pausedByBox) break;
        g.timer += dt;
        const k = Math.min(1, g.timer / TUNE.fallTime);
        if (g.isSnowball) {
          g.spin = (g.spin || 0) + dt * 6;
          const y0 = beltY(g.belt) - GIFT_R, y1 = feetY(g.belt) - 10;
          g.x = TEETER_X + 20 * k;
          g.y = y0 + (y1 - y0) * k * k;
          if (g.timer >= TUNE.fallTime) {
            puff(g.x, feetY(g.belt) - 8, '#FFFFFF', 14);
            puff(g.x, feetY(g.belt) - 8, '#BAE6FD', 10);
            g.state = 'done';
          }
          break;
        }
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

function triggerBinRecycleFeedback(isTutorial = false) {
  if (!S) return;
  if (isTutorial) {
    S.binPulse = 2.4;
    S.binShake = 0.85;
    if (!reduceMotion) S.shake = Math.max(S.shake, 0.24);
  } else if (!S.firstMissFlashed) {
    S.firstMissFlashed = true;
    S.binPulse = 2.4;
    S.binShake = 0.90;
    if (!reduceMotion) S.shake = Math.max(S.shake, 0.24);
  } else {
    S.binPulse = Math.max(S.binPulse || 0, 0.95);
    S.binShake = 0.55;
  }
  if (!S.binPops) S.binPops = [];
  S.binPops.push({
    x: BIN_X + (S.binPops.length % 2 === 0 ? 0 : (S.binPops.length % 4 === 1 ? -14 : 14)),
    y: BIN_Y - 26,
    age: 0,
    life: 0.95,
  });
  puff(BIN_X, BIN_Y - 10, '#FF3333', 12);
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
      g.state = 'done';
      S.recycled = Math.min(TUNE.recycleLimit, (S.recycled || 0) + 1);
      api.play('pd_item_miss');
      triggerBinRecycleFeedback(true);
      return;
    }
    g.state = 'done';
    S.recycled++;
    S.waveRecycled = (S.waveRecycled || 0) + 1;
    triggerBinRecycleFeedback(false);
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
  const beltMinX = g => (forgiving ? BUILD_X0 + 10 : (g.gusted || g.tilt ? TEETER_X - 30 : TEETER_X - 20));
  const cands = S.gifts.filter(g => !g.tutWatch && !g.isSnowball && g.belt === e.floor &&
    (!S.tut || g.tutGift) &&
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
  if (isTutBlockingBox() || S.snowballBoxUp) return;
  if (manual && S.tut === 2 && S.tutBoxUp) {
    S.tutBoxUp = false;
  }
  const e = S.elf;

  if (manual && edge && e.bag.length > 0 && atChute()) {
    if (e.x < CHUTE_BX - 18) { e.x = CHUTE_BX - 12; e.facing = 1; }
    if (releaseGift(false)) { S.actionBuf = 0; S.actionHeld = false; }
    return;
  }

  if (!S.tut && tryGrabBeltSnowball(manual)) {
    return;
  }

  if (e.bag.length >= S.carryCap) {
    if (edge && manual && !e.climbing && !S.keys.left) {
      if (!S.tut || (S.tut === 2 && e.bag.some(item => item.cat === e.floor))) {
        S.cmd = { type: 'chute', floor: e.floor }; S.queue = null; S.actionBuf = 0;
      }
    }
    return;
  }

  if (S.tut && S.tut !== 2) {
    return;
  }

  const g = catchable(manual);
  if (!g) {
    if (edge && manual && !e.climbing) {
      if (e.bag.length > 0 && e.x >= LADDER_CX - 16 && !S.keys.left) {
        if (!S.tut || (S.tut === 2 && e.bag.some(item => item.cat === e.floor))) {
          S.cmd = { type: 'chute', floor: e.floor }; S.queue = null; S.actionBuf = 0;
        }
      } else if (e.x > DROP_X1 + 24 && !S.keys.right) {
        if (!S.tut || S.gifts.some(item => item.tutGift && item.belt === e.floor && item.state !== 'carried')) {
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
  S.actionBuf = 0; S.actionHeld = false;
  api.play('pd_player_present_pickup');
  S.cmd = null; S.queue = null;
  S.beltIdleAfterGiftFloor = S.keys.left ? -1 : e.floor;
  clearSnowballTaps();
  S.catchFlash = 0.3;
  S.beltPulse[e.floor] = 0.5;
  puff(e.x, carryY(e.floor, elfChoice), '#FF7733', 10);
}

function releaseGift(onlyMatching = false) {
  const e = S.elf;
  if (!e.bag.length || e.climbing || e.x < LADDER_CX - 16) return false;
  if (S.tut && (S.tut !== 2 || !e.bag.some(item => item.cat === e.floor))) return false;

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
  if (matching.length) {
    api.play('pd_player_present_pickup');
    reportScore();
  } else {
    api.play('pd_item_miss');
  }
  const hasBeltTutGift = S.gifts.some(item => item.tutGift && (item.state === 'belt' || item.state === 'teeter'));
  if (S.tut === 2 && e.bag.length === 0 && !hasBeltTutGift) {
    S.cmd = null;
    S.queue = null;
    clearKeys();
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
    S.inSleigh = Math.min(2, (S.inSleigh || 0) + 1);
    puff(SLEIGH_X, SLEIGH_Y - 18, '#FFE14D', 16);
    if (S.tut === 2 && S.inSleigh >= 2 && S.elf.bag.length === 0) {
      startTutMissDemo();
    }
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
    S.recycleDrainFrom = S.recycled || 0;
    S.recycleDrainDur = pauseDur;
    if (S.recycleDrainFrom > 0) {
      puff(BIN_X, BIN_Y - 12, '#38BDF8', 10);
    }
    S.sleighFlyDur = Math.min(pauseDur, TUNE.sleighFlyTime || 1.8);
    S.sleighFlyT = S.sleighFlyDur;
    S.sleighFlyGifts = prevTarget;
    S.waveQueue = [];
    S.gifts = [];
    S.elf.bag = [];
    S.cmd = null;
    S.queue = null;
    S.actionEdge = false;
    S.actionBuf = 0;
    S.actionHeld = false;
    clearKeys();
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

function elfSpeedMul() {
  return (S && S.snowballHitT > 0) ? (TUNE.snowballSlowMul || 0.5) : 1.0;
}

function moveX(e, tx, dt) {
  const spd = TUNE.runSpeed * elfSpeedMul();
  const d = tx - e.x, step = spd * dt;
  if (Math.abs(d) <= step) e.x = tx;
  else { e.x += Math.sign(d) * step; e.facing = Math.sign(d); }
  e.x = Math.max(ELF_MIN_X, Math.min(ELF_MAX_X, e.x));
  e.bob += dt * 15 * elfSpeedMul();
}

// Seamless movement across horizontal -> ladder -> horizontal with zero dead frames
function stepTo(e, tf, tx, dt) {
  const spdMul = elfSpeedMul();
  const runSpd = TUNE.runSpeed * spdMul;
  const climbSpd = TUNE.climbSpeed * spdMul;
  let rem = dt;
  if (e.climbing || e.floor !== tf) {
    if (!e.climbing) {
      const dx = LADDER_CX - e.x;
      if (Math.abs(dx) > 4) {
        const needT = Math.abs(dx) / runSpd;
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
    const needClimbT = Math.abs(dy) / climbSpd;
    if (rem < needClimbT) {
      e.x += (LADDER_CX - e.x) * Math.min(1, rem * 16);
      e.y += dir * climbSpd * rem;
      e.bob += rem * 14 * spdMul;
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
  const tutHasBeltGift = Boolean(S.tut === 2 && S.gifts.some(g => g.tutGift && (g.state === 'belt' || g.state === 'teeter')));
  if (S.snowballBoxUp || (S.tut && (isTutBlockingBox() || S.tut !== 2 || (e.bag.length === 0 && !tutHasBeltGift)))) {
    clearKeys();
    if (!e.climbing && S.tut !== 3) {
      e.y = feetY(e.floor);
      e.bob = 0;
    }
    S.cmd = null;
    S.queue = null;
    S.liveSpeed = 0;
    return;
  }
  const spdMul = elfSpeedMul();
  const effRunSpd = TUNE.runSpeed * spdMul;
  const effClimbSpd = TUNE.climbSpeed * spdMul;
  const k = S.keys, maxF = activeFloors() - 1;
  e.climbPause = 0;
  let mx = 0, my = 0;
  if (k.left) mx--; if (k.right) mx++; if (k.up) my--; if (k.down) my++;

  if (S.beltIdleAfterGiftFloor >= 0) {
    if (e.climbing || e.floor !== S.beltIdleAfterGiftFloor || e.x > TAP_SPLIT + 16 || mx < 0) {
      S.beltIdleAfterGiftFloor = -1;
    }
  }

  if (mx <= 0 || e.climbing || e.x < CHUTE_BX - 12) {
    e.droppedOnRun = false;
  }

  const lockedSnowball = activeCommittedSnowball();
  if ((mx || my) && !lockedSnowball) {
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
    clearSnowballTaps();
  }

  if (!lockedSnowball && my && e.climbTo === null && !e.climbing) {
    const dir = my < 0 ? 1 : -1;
    const nextF = Math.max(0, Math.min(maxF, e.floor + dir));
    if (nextF !== e.floor) e.climbTo = nextF;
  }

  const finishUpdateElf = () => {
    if (dt > 0) {
      const dist = Math.hypot(e.x - prevX, e.y - prevY);
      S.liveSpeed = dist > 0.1 ? dist / dt : 0;
      if (S.snowballHitT > 0 && dist > 0.15 && S.relaxT <= 0) {
        const prevHit = S.snowballHitT;
        const moveDt = dist >= effClimbSpd * dt * 0.45 ? dt : Math.min(dt, dist / Math.max(1, effRunSpd));
        S.snowballHitT = Math.max(0, S.snowballHitT - moveDt);
        if (Math.floor(prevHit * 3) !== Math.floor(S.snowballHitT * 3)) {
          puff(e.x + (Math.random() - 0.5) * 20, e.y - 36, '#FFFFFF', 2);
        }
        S.snowballShedAcc = (S.snowballShedAcc || 0) + dist;
        if (S.snowballShedAcc >= 16) {
          S.snowballShedAcc -= 16;
          puff(e.x + (Math.random() - 0.5) * 24, e.y - 38 + (Math.random() - 0.5) * 20, '#FFFFFF', 2);
          puff(e.x + (Math.random() - 0.5) * 22, e.y - 38 + (Math.random() - 0.5) * 18, '#BAE6FD', 1);
        }
        if (S.snowballHitT === 0 || Math.floor(prevHit * 10) !== Math.floor(S.snowballHitT * 10)) {
          syncTunePanel();
        }
      }
    }
  };

  const runIntoChuteDrop = () => {
    if (mx > 0 && !e.droppedOnRun) {
      if (autoDropAtChute() || (e.x >= CHUTE_BX + 18 && releaseGift(false))) {
        e.droppedOnRun = true;
      }
    }
  };

  if (!lockedSnowball && e.climbTo !== null) {
    const tf = Math.max(0, Math.min(maxF, e.climbTo));
    e.climbTo = tf;
    if (tf === e.floor && !e.climbing) {
      e.climbTo = null;
    } else {
      let remDt = dt;
      if (!e.climbing) {
        const dx = LADDER_CX - e.x;
        if (Math.abs(dx) > 4) {
          const needT = Math.abs(dx) / effRunSpd;
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
        if (!tryGrabBeltSnowball(false) && e.bag.length < S.carryCap) doAction(false, false);
        finishUpdateElf();
        return;
      }
      e.x += (LADDER_CX - e.x) * Math.min(1, remDt * 16);
      let rem = effClimbSpd * remDt;
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
        e.bob += remDt * 14 * spdMul;
      } else if (mx) {
        moveX(e, e.x + mx * 1000, rem / effClimbSpd);
        runIntoChuteDrop();
        if (!tryGrabBeltSnowball(false) && e.bag.length < S.carryCap) doAction(false, false);
      } else {
        e.bob = 0;
      }
      finishUpdateElf();
      return;
    }
  }

  if (!lockedSnowball && mx) {
    e.y = feetY(e.floor);
    moveX(e, e.x + mx * 1000, dt);
    runIntoChuteDrop();
    if (!tryGrabBeltSnowball(false) && e.bag.length < S.carryCap) doAction(false, false);
    finishUpdateElf();
    return;
  }

  const idleCatch = () => {
    if (tryGrabBeltSnowball(false)) return;
    if (e.bag.length < S.carryCap) doAction(false, false);
  };

  if (S.cmd) {
    if (S.cmd.floor >= activeFloors()) { S.cmd = null; clearSnowballTaps(); finishUpdateElf(); return; }
    const cmdType = S.cmd.type;
    const cmdFloor = S.cmd.floor;
    const tx = cmdType === 'belt' ? DROP_CX : CHUTE_CX;
    const arrived = stepTo(e, cmdFloor, tx, dt);
    if (!e.climbing && e.floor === cmdFloor) {
      if (cmdType === 'chute') {
        if (e.x >= CHUTE_BX - 12 || arrived) {
          if (e.bag.length > 0) releaseGift(false);
          S.cmd = null; S.queue = null;
          clearSnowballTaps();
          if (!S.cmd) e.bob = 0;
          finishUpdateElf();
          return;
        }
      } else {
        const targetSb = S.cmd.commitSnowballId
          ? S.gifts.find(g => g.id === S.cmd.commitSnowballId && g.isSnowball && (g.state === 'belt' || g.state === 'teeter'))
          : null;
        if (targetSb) {
          if ((e.x <= TAP_SPLIT + 16 || arrived) && (targetSb.state === 'teeter' || targetSb.x >= TEETER_X - 36)) {
            pickupSnowball(targetSb);
            finishUpdateElf();
            return;
          }
          finishUpdateElf();
          return;
        }
        const edgeSb = (e.x <= TAP_SPLIT + 16 || arrived) ? frontSnowballAtEdge(cmdFloor) : null;
        if (edgeSb) {
          pickupSnowball(edgeSb);
          finishUpdateElf();
          return;
        }
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
        clearSnowballTaps();
      } else {
        const targetSb = S.cmd.commitSnowballId
          ? S.gifts.find(g => g.id === S.cmd.commitSnowballId && g.isSnowball && (g.state === 'belt' || g.state === 'teeter'))
          : null;
        if (targetSb) {
          if (targetSb.state === 'teeter' || targetSb.x >= TEETER_X - 36) {
            pickupSnowball(targetSb);
          }
          finishUpdateElf();
          return;
        }
        const edgeSb = frontSnowballAtEdge(cmdFloor);
        if (edgeSb) {
          pickupSnowball(edgeSb);
          finishUpdateElf();
          return;
        }
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
  if (S.binPops && S.binPops.length) {
    for (const bp of S.binPops) bp.age += dt;
    S.binPops = S.binPops.filter(bp => bp.age < bp.life);
  }
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
  const gustStrength = Math.max(0.55, Math.min(1.30, ((S.gustMul || GUST.beltMul) - 1.15) / 0.95));
  const gust = S.gustT > 0 ? Math.round(300 * gustStrength) : (S.gustWarnT > 0 ? Math.round(95 * gustStrength) : 0);
  const fall = 0.75 + 0.5 * S.snowAmt;
  for (const s of S.snow) {
    s.y += s.vy * dt * fall;
    s.x += Math.sin(S.t * s.sw + s.ph) * 16 * dt + (16 * S.snowAmt + gust) * dt;
    if (s.y > Math.max(H, viewY1) + 6) {
      s.y = Math.min(0, viewY0) - 8;
      s.x = s.beltFront
        ? (BUILD_X0 - 60 + Math.random() * (TEETER_X - BUILD_X0 + 140))
        : (viewX0 + Math.random() * (viewX1 - viewX0));
    }
    if (s.x > Math.max(W, viewX1) + 6) {
      s.x = s.beltFront ? (BUILD_X0 - 50) : (Math.min(0, viewX0) - 6);
    }
  }
}

function tutGift(cat, belt = 0) {
  S.gifts.push({
    id: S.nextId++, cat, v: 0, belt, state: 'belt',
    x: TEETER_X - 42, y: beltY(belt) - GIFT_R,
    timer: 0, teeter: 1e9, tutGift: true,
    wrapped: false, tilt: 0, spin: 0, gusted: false,
    path: null, seg: 0, p: 0, speed: 0, dropFloor: -1, ductFloor: -1,
  });
}

function ensureTutGift(cat, belt = 0) {
  if (!S || !S.gifts) return;
  const existing = S.gifts.find(g => g.tutGift && g.belt === belt && g.state !== 'carried');
  if (existing) {
    if (existing.state !== 'belt' && existing.state !== 'teeter') {
      existing.state = 'belt';
      existing.x = TEETER_X - 42;
      existing.y = beltY(belt) - GIFT_R;
      existing.timer = 0;
      existing.tilt = 0;
      existing.spin = 0;
    }
    return;
  }
  tutGift(cat, belt);
}

function startTutMissDemo() {
  if (!S) return;
  S.tut = 3;
  S.tutBoxUp = true;
  S.tutTimer = 0;
  S.tutDemoLockT = 0.35;
  S.cmd = null;
  S.queue = null;
  clearKeys();
  S.gifts = [];
  S.recycled = 0;
  S.binPops = [];
  const e = S.elf;
  e.bag = [];
  e.carrying = null;
  e.climbing = false;
  e.climbTo = null;
  e.floor = 0;
  e.x = CHUTE_CX;
  e.y = feetY(0);
  e.facing = -1;
  e.bob = 0;
  syncCarry();

  // 1. Toy at the far end (Belt 1) that gently teeters and fades away before the elf arrives
  S.gifts.push({
    id: S.nextId++, cat: 0, v: 0, belt: 1, state: 'teeter',
    x: TEETER_X, y: beltY(1) - GIFT_R,
    timer: 0.15, teeter: 1.45, teeterProg: 0.10, tutWatch: true,
    wrapped: false, tilt: 0, spin: 0, gusted: false,
    path: null, seg: 0, p: 0, speed: 0, dropFloor: -1, ductFloor: -1,
  });

  // 2. Simultaneous toy dropped into the wrong chute on Floor 0 and sent to the recycler
  const wrongGift = {
    id: S.nextId++, cat: 1, v: 0, belt: 0, state: 'toStation',
    x: CHUTE_BX + 24, y: chuteY(0),
    timer: 0, teeter: 1.0, tutWatch: true,
    wrapped: false, tilt: 0, spin: 0, gusted: false,
    path: null, seg: 0, p: 0, speed: 0, dropFloor: 0, ductFloor: 0,
  };
  pathTo(wrongGift, [{ x: MACH_CX, y: chuteY(0) }], 360);
  S.gifts.push(wrongGift);
  S.floorPulse[0] = 0.45;
  puff(CHUTE_CX, chuteY(0), '#FF3333', 8);
}

function tutFinish() {
  if (!S) return;
  S.tut = 0;
  S.tutBoxUp = false;
  S.tutTimer = 0;
  S.binPulse = 0;
  S.binShake = 0;
  S.binPops = [];
  S.gifts = [];
  if (S.elf) {
    S.elf.bag = [];
    S.elf.carrying = null;
    S.elf.climbing = false;
    S.elf.climbTo = null;
    S.elf.climbPause = 0;
    S.elf.floor = 0;
    S.elf.x = DROP_CX;
    S.elf.y = feetY(0);
    S.elf.facing = 1;
    S.elf.bob = 0;
  }
  S.cmd = null;
  S.queue = null;
  S.actionEdge = false;
  S.actionBuf = 0;
  S.actionHeld = false;
  clearKeys();
  syncCarry();
  S.inSleigh = 0;
  S.recycled = 0;
  S.waveRecycled = 0;
  S.missed = 0;
  S.misfiled = 0;
  S.combo = 0;
  S.score = 0;
  S.floorPulse = [0, 0, 0, 0, 0];
  S.beltPulse = [0, 0, 0, 0, 0];
  S.machFlash = [0, 0, 0, 0, 0];
  show('btnSkipTut', false);
  api.play('pd_player_level_up');
  startWave(0);
}

function tutDismissOk() {
  if (!S) return false;
  if (S.snowballBoxUp) {
    if ((S.snowballBoxLockT || 0) > 0) return false;
    S.snowballBoxUp = false;
    S.snowballBoxLockT = 0;
    api.play('pd_player_present_pickup');
    return true;
  }
  if (!S.tut || !S.tutBoxUp) return false;
  const st = TUT[S.tut - 1];
  if (!st) return false;
  api.play('pd_player_present_pickup');
  S.cmd = null;
  S.queue = null;
  S.actionEdge = false;
  S.actionBuf = 0;
  S.actionHeld = false;
  clearKeys();
  if (S.tut === 1) {
    S.tut = 2;
    S.tutBoxUp = false;
    S.tutTimer = 0;
    ensureTutGift(1, 0);
    ensureTutGift(0, 1);
    return true;
  }
  if (S.tut === 2) {
    S.tutBoxUp = false;
    S.tutTimer = 0;
    return true;
  }
  if (S.tut === 3) {
    if ((S.tutDemoLockT || 0) > 0) return false;
    tutFinish();
    return true;
  }
  return false;
}

function updateTutorial(dt) {
  if (!S || !S.tut) return;
  if (S.tut === 2) {
    const totalActiveOrDone = (S.inSleigh || 0) + S.elf.bag.length + S.gifts.filter(g => g.tutGift && g.state !== 'carried').length;
    if (totalActiveOrDone === 0) {
      ensureTutGift(1, 0);
      ensureTutGift(0, 1);
    }
  } else if (S.tut === 3) {
    S.tutTimer = (S.tutTimer || 0) + dt;
    if (S.tutDemoLockT > 0) {
      S.tutDemoLockT = Math.max(0, S.tutDemoLockT - dt);
    }
    const e = S.elf;
    const beltToy = S.gifts.find(g => g.tutWatch && g.belt === 1 && g.state === 'teeter');
    if (beltToy && S.tutTimer >= 0.14) {
      stepTo(e, 1, DROP_CX + 52, dt * 0.42);
    } else if (!e.climbing) {
      e.y = feetY(e.floor);
      e.bob = 0;
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
    if (S.takeoffLockT > 0) S.takeoffLockT = Math.max(0, S.takeoffLockT - dt);
    if (S.mode === 'takeoff' && S.takeoff >= 4.0) {
      finishWinGameOver();
    }
  } else if (S && S.mode === 'play') {
    S.uiT = (S.uiT || 0) + dt;
    if (S.snowballBoxUp && S.snowballBoxLockT > 0) {
      S.snowballBoxLockT = Math.max(0, S.snowballBoxLockT - dt);
    }
    const pausedByTutBox = Boolean((S.tut === 1 && S.tutBoxUp) || S.snowballBoxUp);
    if (!pausedByTutBox) {
      S.t += dt;
      if (!S.tut && S.relaxT <= 0) {
        S.sleighTimer = (S.sleighTimer || 0) + dt;
      }
      const beltMul = (S.breatheSlowT > 0 || S.relaxT > 0) ? 0.28 : 1.0;
      S.beltAnimT += dt * beltMul;
      processWaveQueue(dt);
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
    if (!pausedByTutBox && S.breatheCueT > 0) S.breatheCueT = Math.max(0, S.breatheCueT - dt);
    if (!pausedByTutBox && S.breatheSlowT > 0) S.breatheSlowT = Math.max(0, S.breatheSlowT - dt);
    if (S.binPulse > 0 && S.tut !== 3) S.binPulse = Math.max(0, S.binPulse - dt);
    if (S.binShake > 0) S.binShake = Math.max(0, S.binShake - dt * 1.4);
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
  if (!S) return;
  if (S.mode === 'takeoff') {
    if ((ev.key === ' ' || ev.code === 'Space' || ev.key === 'Enter' || ev.keyCode === 32) && !ev.repeat) {
      if ((S.takeoffLockT || 0) <= 0) finishWinGameOver();
      ev.preventDefault();
    }
    return;
  }
  if (S.mode !== 'play') return;
  const k = KEYMAP[ev.key];
  if (k) {
    const tutHasBeltGift = Boolean(S.tut === 2 && S.gifts.some(g => g.tutGift && (g.state === 'belt' || g.state === 'teeter')));
    if (S.snowballBoxUp || (S.tut && (isTutBlockingBox() || S.tut !== 2 || (S.elf.bag.length === 0 && !tutHasBeltGift)))) {
      ev.preventDefault();
      return;
    }
    if (S.tut && S.tutBoxUp && S.tut === 2) {
      S.tutBoxUp = false;
    }
    const wasDown = !!S.keys[k];
    S.keys[k] = true;
    if (k === 'left') S.beltIdleAfterGiftFloor = -1;
    if (!activeCommittedSnowball()) {
      S.cmd = null;
      S.queue = null;
      clearSnowballTaps();
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
    }
    ev.preventDefault();
    return;
  }
  if (ev.key === ' ' || ev.code === 'Space' || ev.key === 'Enter' || ev.keyCode === 32) {
    if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
      document.activeElement.blur();
      cv.focus({ preventScroll: true });
    }
    if (isTutBlockingBox() || S.snowballBoxUp) {
      if (!ev.repeat) tutDismissOk();
      ev.preventDefault();
      return;
    }
    if (S.tut && S.tutBoxUp && S.tut === 2) {
      S.tutBoxUp = false;
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

function resolveTapFloor(p) {
  const maxF = activeFloors() - 1;
  if (p.x < TAP_SPLIT && S && S.gifts) {
    let bestF = -1;
    let bestDist = 42;
    for (const g of S.gifts) {
      if (g.tutWatch || g.state === 'done' || g.state === 'carried' || g.belt > maxF) continue;
      if (g.state === 'belt' || g.state === 'teeter' || g.state === 'falling' || g.state === 'landed') {
        const d = Math.hypot(p.x - g.x, p.y - g.y);
        if (d < bestDist) {
          bestDist = d;
          bestF = g.belt;
        }
      }
    }
    if (bestF >= 0) return bestF;
    const bf = Math.floor((GROUND_Y - (p.y + 24)) / FLOOR_H);
    return Math.max(0, Math.min(4, bf));
  }
  return Math.max(0, Math.min(4, Math.floor((GROUND_Y - p.y) / FLOOR_H)));
}

function tapTarget(p) {
  if (S.snowballBoxUp) {
    if (!tutDismissOk()) return;
  }
  if (S.tut) {
    const st = TUT[S.tut - 1];
    if (!st) return;
    if (st.go === 'ok') {
      tutDismissOk();
      return;
    }
    if (S.tutBoxUp) {
      S.tutBoxUp = false;
    }
    const tf = resolveTapFloor(p);
    const side = p.x < TAP_SPLIT ? 'belt' : 'chute';
    if (st.go === 'play') {
      if (side === 'belt') {
        const hasToyHere = S.elf.bag.length < S.carryCap &&
          S.gifts.some(g => g.tutGift && g.belt === tf && (g.state === 'belt' || g.state === 'teeter'));
        if (!hasToyHere) return;
      } else if (side === 'chute') {
        if (!S.elf.bag.some(g => g.cat === tf)) return;
      }
    } else if (st.go === 'belt') {
      if (side !== 'belt' || tf !== st.f) return;
    } else if (st.go === 'chute') {
      if (side !== 'chute' || !S.elf.bag.some(g => g.cat === tf)) return;
    } else {
      return;
    }
  }

  const f = resolveTapFloor(p);
  if (f >= activeFloors()) return;
  const t = { type: p.x < TAP_SPLIT ? 'belt' : 'chute', floor: f };

  if (activeCommittedSnowball()) {
    if (t.type !== 'belt' || t.floor !== S.cmd.floor) {
      S.queue = t;
    }
    return;
  }

  clearSnowballTaps();
  if (t.type === 'belt') {
    S.beltIdleAfterGiftFloor = -1;
    const edgeSb = frontSnowballAtEdge(f);
    if (edgeSb) {
      edgeSb.tappedByPlayer = true;
      t.commitSnowballId = edgeSb.id;
    }
  }

  S.elf.climbTo = null;
  S.cmd = t;
  S.queue = null;
  clearKeys();
  if (!S.elf.climbing && S.elf.floor === f) {
    if (t.type === 'chute' && S.elf.x >= CHUTE_BX - 12 && S.elf.bag.length > 0) {
      releaseGift(false);
      S.cmd = null;
    } else if (t.type === 'belt' && t.commitSnowballId) {
      const sb = S.gifts.find(g => g.id === t.commitSnowballId && g.isSnowball && (g.state === 'belt' || g.state === 'teeter'));
      if (sb && S.elf.x <= TAP_SPLIT + 16 && (sb.state === 'teeter' || sb.x >= TEETER_X - 36)) {
        pickupSnowball(sb);
      }
    } else if (t.type === 'belt' && S.elf.bag.length < S.carryCap && catchable(false)) {
      doAction(false, false);
    }
  }
}

window.addEventListener('pointerdown', ev => {
  if (ev && ev.pointerType) setInputMode(ev.pointerType);
}, { passive: true });

cv.addEventListener('pointerdown', ev => {
  if (ev && ev.pointerType) setInputMode(ev.pointerType);
  if (!S) return;
  if (S.mode === 'takeoff') {
    if ((S.takeoffLockT || 0) <= 0) finishWinGameOver();
    ev.preventDefault();
    return;
  }
  if (S.mode !== 'play') return;
  window.focus();
  cv.focus({ preventScroll: true });
  tapTarget(toGame(ev));
  ev.preventDefault();
}, { passive: false });
cv.addEventListener('contextmenu', ev => ev.preventDefault());

const el = id => document.getElementById(id);
const show = (id, on) => { const node = el(id); if (node) node.classList.toggle('on', on); };
const say = m => { el('sr').textContent = m; };

function finishWinGameOver() {
  if (!S || S.mode === 'over') return;
  S.mode = 'over';
  unbindKeys();
  api.gameover();
}

function endRun(won) {
  if (S.mode === 'over' || S.mode === 'takeoff') return;
  S.won = won;
  show('btnSkipTut', false);
  reportScore();
  api.play('game_hurry_up_end');
  if (won) {
    S.mode = 'takeoff';
    S.takeoff = 0;
    S.takeoffLockT = 0.25;
    api.play('pd_player_level_up');
    api.play('qd_complete');
    api.play('music_start_scene');
  } else {
    S.mode = 'over';
    unbindKeys();
    api.play('music_ingame_gameover');
    api.play('pd_game_over');
    api.gameover();
  }
}

// Starts either at a specific wave (1..8) if waveNum > 0, or at Wave 1 with the tutorial.
function start(waveNum = 0) {
  fit();
  newGame();
  api.play('game_hurry_up_end');
  api.play('music_start_ingame');
  if (document.activeElement && document.activeElement !== cv && document.activeElement !== document.body) {
    document.activeElement.blur();
  }
  show('scrTitle', false);
  bindKeys();
  if (shortcutWin) {
    S.tut = 0;
    S.tutBoxUp = false;
    show('btnSkipTut', false);
    S.sleighsDone = WAVES.length;
    S.waveStars = Array.from({ length: SLEIGHS.length }, () => true);
    S.stars = SLEIGHS.length;
    S.score = 12800;
    say(_msg`elfexpress_sr_win`);
    endRun(true);
  } else if (waveNum >= 1 && waveNum <= WAVES.length) {
    S.tut = 0;
    S.tutBoxUp = false;
    show('btnSkipTut', false);
    startWave(waveNum - 1);
  } else {
    S.sleighsDone = 0;
    S.tut = 1;
    S.tutBoxUp = true;
    S.tutTimer = 0;
    S.elf.x = CHUTE_CX;
    S.elf.facing = -1;
    show('btnSkipTut', true);
    syncTunePanel();
  }
  last = 0;
  if (!raf) raf = requestAnimationFrame(frame);
}

if (el('btnSkipTut')) {
  el('btnSkipTut').addEventListener('pointerdown', ev => ev.stopPropagation());
  el('btnSkipTut').addEventListener('click', ev => {
    ev.stopPropagation();
    ev.currentTarget.blur();
    cv.focus({ preventScroll: true });
    if (S && S.mode === 'play' && S.tut > 0) {
      tutFinish();
    } else {
      show('btnSkipTut', false);
    }
  });
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
  shortcutWin = false;
  start(shortcutWave || 0);
});

api.addEventListener('data', ev => {
  const detail = ev && ev.detail;
  missFxMode = parseMissFx(detail);
  if (S) S.missFx = missFxMode;
  if (hasTuneFlag(detail)) initTunePanel();
  if (hasWinShortcut(detail)) {
    shortcutWin = true;
    start(0);
    return;
  }
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

missFxMode = parseMissFx(null);
shortcutWin = hasWinShortcut(null);
fit(); newGame(); S.mode = 'idle';
if (hasTuneFlag(null)) initTunePanel();
raf = requestAnimationFrame(frame);
api.ready(data => {
  fit();
  api.play('qd_load_sounds');
  missFxMode = parseMissFx(data);
  if (S) S.missFx = missFxMode;
  if (hasTuneFlag(data)) initTunePanel();
  shortcutWin = hasWinShortcut(data);
  shortcutWave = parseWaveShortcut(data);
  if (shortcutWin || shortcutWave) {
    start(shortcutWave);
  } else {
    show('scrTitle', true);
  }
  last = 0;
});
