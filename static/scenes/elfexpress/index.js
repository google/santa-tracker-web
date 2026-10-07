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
  ELF_LABELS, msgSleighAway, REVEAL_BANNER, W, H, FLOOR_H, BUILD_X0, BUILD_X1,
  GROUND_Y, LADDER_CX, TAP_SPLIT, TEETER_X, DROP_X0, DROP_X1, DROP_CX,
  CHUTE_BX, CHUTE_CX, MACH_CX, SPINE_X, WRAP_X, LINE_SPEED, BIN_X, BIN_Y,
  SLEIGH_X, SLEIGH_Y, ELF_MIN_X, ELF_MAX_X, CARRY_OFF, GIFT_R,
  feetY, beltY, chuteY, carryY, TUT, KEYMAP,
} from './constants.js';
import {
  cv, fit, toGame, reduceMotion, viewX0, viewY0, viewX1, viewY1, renderScene,
} from './renderer.js';

api.preload.sounds('pd_load_sounds', 'qd_load_sounds');

let S = null;
let elfChoice = 0;

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
          ev.preventDefault(); b.blur(); start();
        }
      });
      box.appendChild(b);
    });
  });
}

function makeSnow() {
  return Array.from({ length: 450 }, (_, i) => {
    const isLarge = i % 8 === 0;
    const isCrystal = i % 18 === 0;
    const r = isLarge ? 2.6 + Math.random() * 2.4 : 1.2 + Math.random() * 1.8;
    return {
      x: -300 + Math.random() * (W + 600),
      y: -80 + Math.random() * (H + 160),
      r,
      vy: 52 + r * 28 + Math.random() * 28,
      sw: 0.8 + Math.random() * 1.8,
      ph: Math.random() * 6.28,
      a: 0.5 + Math.random() * 0.5,
      crystal: isCrystal,
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
  S = {
    mode: 'play', t: 0, score: 0, combo: 0,
    sleighsDone: 0, inSleigh: 0, recycled: 0, missed: 0, misfiled: 0,
    spawnTimer: 1.0, gifts: [], fx: [], nextId: 1, recent: [],
    shake: 0, catchFlash: 0,
    machFlash: [0, 0, 0, 0, 0], machOk: [false, false, false, false, false],
    snow: makeSnow(), snowAmt: 0, snowDepth: 0,
    gustT: 0, gustX: 0, gustTimer: 3.0,
    hint: 0, floorPulse: [0, 0, 0, 0, 0], beltPulse: [0, 0, 0, 0, 0],
    catDual: [false, false, false, false, false], catPop: [0, 0, 0, 0, 0],
    revealT: 0, revealed: false,
    actionEdge: false, actionHeld: false, actionBuf: 0,
    skin: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
    elf: { x: DROP_CX, y: GROUND_Y, floor: 0, climbing: false, climbTo: null, climbPause: 0, facing: 1, carrying: null, bob: 0 },
    cmd: null, queue: null, keys: {},
    takeoff: 0, hitchT: 0, stars: 0, won: false,
    sky: Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.5, a: Math.random() * 0.5 + 0.2, s: Math.random() * 2 + 1,
    })),
  };
  reportScore();
}

const wave = () => WAVES[Math.min(S.sleighsDone, WAVES.length - 1)];
const activeFloors = () => S.tut ? (S.tutTreats ? 3 : 2) : wave().floors;
const interval = () => wave().interval;
const teeterLen = g => S.tut ? 1e9 : TUNE.teeterTime + (g && g.gusted ? GUST.teeterBonus : 0);
const sleighTarget = () => S.tut ? 2 : SLEIGHS[Math.min(S.sleighsDone, SLEIGHS.length - 1)];
const isFinale = () => S.sleighsDone === SLEIGHS.length - 1;
const gustFront = () => -160 + (W + 320) * Math.min(1, (GUST.dur - S.gustT) / GUST.front);

function gustGap() {
  const span = (SLEIGHS.length - 1) - GUST.fromSleigh;
  const t = span > 0 ? Math.min(1, Math.max(0, (S.sleighsDone - GUST.fromSleigh) / span)) : 1;
  const lo = GUST.gapEarly[0] + (GUST.gapLate[0] - GUST.gapEarly[0]) * t;
  const hi = GUST.gapEarly[1] + (GUST.gapLate[1] - GUST.gapEarly[1]) * t;
  return lo + Math.random() * (hi - lo);
}

function snowTarget() {
  let a = 0;
  for (const s of SNOW) if (S.sleighsDone >= s.at) a = s.fall;
  return a;
}

function pickCategory() {
  const base = wave().weights;
  const w = base.slice(), h = S.recent, n = h.length;
  for (let i = 0; i < w.length; i++) {
    if (!w[i]) continue;
    if (n >= 2 && h[n - 1] === i && h[n - 2] === i) w[i] *= 0.10;
    else if (n >= 1 && h[n - 1] === i) w[i] *= 0.45;
  }
  let tot = 0;
  for (const v of w) tot += v;
  if (tot <= 0) return base.findIndex(v => v > 0);
  let r = Math.random() * tot;
  for (let i = 0; i < w.length; i++) {
    r -= w[i];
    if (r <= 0) return i;
  }
  return 0;
}

function spawnGift() {
  if (S.tut) return;
  const cat = pickCategory();
  S.recent.push(cat);
  if (S.recent.length > 4) S.recent.shift();
  const n = activeFloors();
  const belt = Math.floor(Math.random() * n);
  const v = (S.revealed && Math.random() < 0.5) ? 1 : 0;
  S.gifts.push({
    id: S.nextId++, cat, v, belt, state: 'belt',
    x: -30, y: beltY(belt) - GIFT_R,
    timer: 0, wrapped: false, tilt: 0, spin: 0, gusted: false,
    path: null, seg: 0, p: 0, speed: 0, dropFloor: -1, ductFloor: -1,
  });
}

function updateGifts(dt) {
  const teetering = [];
  for (const g of S.gifts) if (g.state === 'teeter') teetering[g.belt] = g;

  for (const g of S.gifts) {
    switch (g.state) {
      case 'belt': {
        let limit = teetering[g.belt] ? TEETER_X - 40 : TEETER_X;
        for (const o of S.gifts) {
          if (o !== g && o.belt === g.belt && (o.state === 'belt' || o.state === 'teeter') &&
            o.x > g.x && o.x - g.x < 200) limit = Math.min(limit, o.x - 40);
        }
        const blown = S.gustT > 0 && g.x < gustFront();
        if (blown) g.gusted = true;
        g.tilt = blown ? 0.16 : 0;
        g.x = Math.min(g.x + 165 * (blown ? GUST.beltMul : 1) * dt, limit);
        if (!teetering[g.belt] && g.x >= TEETER_X - 0.5) {
          g.state = 'teeter'; g.timer = 0; teetering[g.belt] = g;
        }
        break;
      }
      case 'teeter': {
        g.timer += dt;
        const len = teeterLen(g), k = Math.min(g.timer / len, 1);
        g.tilt = reduceMotion ? 0
          : Math.sin(g.timer * (3 + 11 * k * k) * Math.PI) * (0.06 + 0.30 * k * k);
        if (g.timer >= len) { g.state = 'falling'; g.timer = 0; g.tilt = 0; }
        break;
      }
      case 'falling': {
        g.timer += dt;
        const k = g.timer / TUNE.fallTime;
        const y0 = beltY(g.belt) - GIFT_R, y1 = carryY(g.belt);
        g.x = TEETER_X + 16 * k;
        g.y = y0 + (y1 - y0) * k * k;
        if (g.timer >= TUNE.fallTime) {
          g.state = 'landed'; g.y = feetY(g.belt) - 14;
          S.missed++; breakCombo();
          api.play('pd_item_miss');
        }
        break;
      }
      case 'carried': {
        const e = S.elf;
        g.x = e.x + e.facing * 18;
        g.y = e.y - CARRY_OFF + Math.sin(e.bob) * 2;
        break;
      }
      case 'landed': {
        g.x += 230 * dt; g.spin += dt * 5;
        if (g.x >= BUILD_X1 - 14) {
          g.state = 'toStation'; g.spin = 0;
          g.ductFloor = g.belt; g.dropFloor = -1;
          pathTo(g, [{ x: MACH_CX, y: chuteY(g.belt) }], LINE_SPEED * 0.85);
        }
        break;
      }
      default:
        updateTransit(g, dt);
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

function updateTransit(g, dt) {
  if (g.state === 'wrapping' || g.state === 'rejecting') {
    g.timer += dt;
    const hold = g.state === 'wrapping' ? 0.40 : 0.26;
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
          { x: BIN_X + (Math.random() * 16 - 8), y: BIN_Y - 6 },
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
    g.state = 'done'; landInSleigh();
  } else if (g.state === 'toBin') {
    g.state = 'done'; S.recycled++;
    if (tutGo() === 'bin') tutNext();
    puff(BIN_X, BIN_Y - 10, '#FF3333', 10);
    checkLoss();
  }
}

function catchable(forgiving) {
  const e = S.elf;
  if (e.carrying || e.climbing) return null;
  const minX = forgiving ? BUILD_X0 : DROP_X0 - 28;
  const maxX = forgiving ? LADDER_CX + 16 : DROP_X1 + 32;
  if (e.x < minX || e.x > maxX) return null;
  return S.gifts.find(g => g.belt === e.floor &&
    (g.state === 'teeter' || g.state === 'falling' ||
      (g.state === 'belt' && g.x >= (forgiving ? BUILD_X0 + 10 : TEETER_X - 45)) ||
      (g.state === 'landed' && (forgiving ? g.x <= BUILD_X1 - 24 : Math.abs(g.x - e.x) <= 56)))) || null;
}

const atChute = () => !S.elf.climbing && S.elf.x >= LADDER_CX - 16;

function doAction(edge, manual) {
  if (!S || (S.mode !== 'play' && S.mode !== 'hitch')) return;
  const e = S.elf;
  if (e.carrying) {
    if (atChute()) {
      if (e.x < CHUTE_BX - 18) { e.x = CHUTE_BX - 12; e.facing = 1; }
      if (releaseGift()) { S.actionBuf = 0; S.actionHeld = false; }
    } else if (edge && manual && !e.climbing && !S.keys.left) {
      if (!S.tut || (tutGo() === 'chute' && e.floor === (TUT[S.tut - 1] || {}).f)) {
        S.cmd = { type: 'chute', floor: e.floor }; S.queue = null; S.actionBuf = 0;
      }
    }
    return;
  }
  if (S.tut && tutGo() !== 'belt') return;
  const g = catchable(manual);
  if (!g) {
    if (edge && manual && !e.climbing && e.x > DROP_X1 + 24 && !S.keys.right) {
      if (!S.tut || (tutGo() === 'belt' && e.floor === (TUT[S.tut - 1] || {}).f)) {
        S.cmd = { type: 'belt', floor: e.floor }; S.queue = null; S.actionBuf = 0;
      }
    }
    return;
  }
  if (manual && (e.x < DROP_X0 || e.x > DROP_X1)) {
    e.x = Math.max(DROP_X0, Math.min(DROP_X1, e.x));
  }
  g.state = 'carried'; g.tilt = 0; g.timer = 0; g.spin = 0;
  e.carrying = g;
  S.actionBuf = 0; S.actionHeld = false;
  api.play('pd_player_present_pickup');
  if (tutGo() === 'belt') tutNext();
  S.cmd = S.queue || null; S.queue = null;
  S.catchFlash = 0.3;
  S.beltPulse[e.floor] = 0.5;
  puff(e.x, carryY(e.floor), '#FF7733', 10);
}

function releaseGift() {
  const e = S.elf;
  if (!e.carrying || e.climbing || e.x < LADDER_CX - 16) return false;
  if (S.tut && (tutGo() !== 'chute' || e.floor !== (TUT[S.tut - 1] || {}).f)) return false;
  const g = e.carrying;
  e.carrying = null;
  g.dropFloor = e.floor; g.ductFloor = e.floor;
  g.state = 'toStation'; g.tilt = 0; g.spin = 0;
  const cy = chuteY(e.floor);
  pathTo(g, [{ x: Math.max(g.x, CHUTE_CX), y: cy }, { x: MACH_CX, y: cy }], LINE_SPEED);
  if (e.floor === g.cat) {
    api.play('pd_player_present_pickup');
    S.combo++;
    const m = Math.min(1 + Math.floor(S.combo / TUNE.comboStep), TUNE.comboMax);
    S.score += TUNE.basePoints * m;
    reportScore();
    S.floorPulse[e.floor] = 0.5;
    puff(CHUTE_CX, chuteY(e.floor), CATS[e.floor].color, 10);
  } else {
    api.play('pd_item_miss');
    S.misfiled++; breakCombo();
    puff(CHUTE_CX, chuteY(e.floor), '#FF3333', 8);
  }
  if (tutGo() === 'chute') tutNext();
  return true;
}

function landInSleigh() {
  if (S.mode !== 'play') return;
  if (tutGo() === 'sleigh') tutNext();
  S.inSleigh++;
  if (S.inSleigh < sleighTarget()) return;
  S.inSleigh = 0; S.sleighsDone++;
  api.play('pd_player_level_up');
  if (tutGo() === 'done') tutNext();
  S.score += TUNE.sleighBonus * S.sleighsDone;
  reportScore();
  if (!reduceMotion) S.shake = 0.32;
  puff(SLEIGH_X, SLEIGH_Y - 18, '#FFE14D', 22);
  puff(SLEIGH_X, SLEIGH_Y - 18, '#32A658', 18);
  say(msgSleighAway(S.sleighsDone, SLEIGHS.length));
  if (S.sleighsDone === 4 && !S.revealed && !S.tut) {
    S.revealed = true;
    S.revealT = 2.6;
    S.actionHeld = false; S.actionEdge = false; S.actionBuf = 0;
    say(REVEAL_BANNER);
    for (let i = 0; i < 5; i++) {
      S.catDual[i] = true;
      S.catPop[i] = 2.6;
      S.floorPulse[i] = 2.6;
      puff(CHUTE_BX + 56, chuteY(i), CATS[i].color, 14);
    }
  }
  if (S.sleighsDone >= SLEIGHS.length) {
    api.play('game_hurry_up_end');
    S.mode = 'hitch'; S.hitchT = 0;
    say(_msg`elfexpress_sr_all_sleighs`);
  } else if (isFinale()) {
    api.play('game_hurry_up');
    say(_msg`elfexpress_sr_last_sleigh`);
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

function stepTo(e, tf, tx, dt) {
  if (e.climbing || e.floor !== tf) {
    const wantY = feetY(tf);
    if (!e.climbing && Math.abs(e.x - LADDER_CX) > 4) { moveX(e, LADDER_CX, dt); return false; }
    e.climbing = true;
    e.x += (LADDER_CX - e.x) * Math.min(1, dt * 16);
    const dir = e.y > wantY ? -1 : 1;
    e.y += dir * TUNE.climbSpeed * dt;
    e.bob += dt * 14;
    if ((dir < 0 && e.y <= wantY) || (dir > 0 && e.y >= wantY)) {
      e.y = wantY; e.floor = tf; e.climbing = false;
    }
    return false;
  }
  e.y = feetY(tf);
  if (Math.abs(e.x - tx) > 5) { moveX(e, tx, dt); return false; }
  e.bob = 0;
  return true;
}

function updateElf(dt) {
  if (S.tut && tutGo() !== 'belt' && tutGo() !== 'chute') clearKeys();
  const e = S.elf, k = S.keys, maxF = activeFloors() - 1;
  if (e.climbPause > 0) e.climbPause = Math.max(0, e.climbPause - dt);
  let mx = 0, my = 0;
  if (k.left) mx--; if (k.right) mx++; if (k.up) my--; if (k.down) my++;

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

  if (my && e.climbTo === null && !e.climbing && !(e.climbPause > 0)) {
    const dir = my < 0 ? 1 : -1;
    const nextF = Math.max(0, Math.min(maxF, e.floor + dir));
    if (nextF !== e.floor) e.climbTo = nextF;
  }

  if (e.climbTo !== null) {
    const tf = Math.max(0, Math.min(maxF, e.climbTo));
    e.climbTo = tf;
    if (tf === e.floor && !e.climbing) {
      e.climbTo = null;
    } else {
      if (!e.climbing) {
        if (Math.abs(e.x - LADDER_CX) > 4) {
          moveX(e, LADDER_CX, dt);
          return;
        }
        e.x = LADDER_CX;
        e.climbing = true;
      }
      if (!my && mx && Math.abs(e.y - feetY(e.climbTo)) <= 20) {
        e.y = feetY(e.climbTo);
        e.floor = e.climbTo;
        e.climbing = false;
        e.climbTo = null;
        e.climbPause = 0;
        moveX(e, e.x + mx * 1000, dt);
        if (!e.carrying) doAction(false, false);
        else if (mx > 0 && e.x >= CHUTE_BX + 18) releaseGift();
        return;
      }
      e.x += (LADDER_CX - e.x) * Math.min(1, dt * 16);
      let rem = TUNE.climbSpeed * dt;
      while (rem > 0 && e.climbing) {
        const wantY = feetY(e.climbTo);
        const dy = wantY - e.y;
        if (Math.abs(dy) <= rem) {
          rem -= Math.abs(dy);
          e.y = wantY;
          e.floor = e.climbTo;
          e.climbing = false;
          e.climbTo = null;
          e.climbPause = 0.11;
        } else {
          e.y += Math.sign(dy) * rem;
          rem = 0;
        }
      }
      e.bob += dt * 14;
      if (!e.climbing && mx) {
        e.climbPause = 0;
        moveX(e, e.x + mx * 1000, dt);
        if (!e.carrying) doAction(false, false);
        else if (mx > 0 && e.x >= CHUTE_BX + 18) releaseGift();
      }
      return;
    }
  }

  if (mx) {
    e.y = feetY(e.floor);
    e.climbPause = 0;
    moveX(e, e.x + mx * 1000, dt);
    if (!e.carrying) doAction(false, false);
    else if (mx > 0 && e.x >= CHUTE_BX + 18) releaseGift();
    return;
  }

  const idleCatch = () => { if (!e.carrying) doAction(false, false); };

  if (S.cmd) {
    if (S.cmd.floor >= activeFloors()) { S.cmd = null; return; }
    const tx = S.cmd.type === 'belt' ? DROP_CX : CHUTE_CX;
    if (stepTo(e, S.cmd.floor, tx, dt)) {
      if (S.cmd.type === 'chute') {
        if (e.carrying) releaseGift();
        S.cmd = S.queue || null; S.queue = null;
      } else {
        idleCatch();
      }
    }
    return;
  }
  e.bob = 0;
  idleCatch();
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

  if (S.gustT > 0) {
    S.gustT -= dt;
    S.gustX += (W + 420) / GUST.dur * dt;
  } else if (S.sleighsDone >= GUST.fromSleigh) {
    S.gustTimer -= dt;
    if (S.gustTimer <= 0) {
      S.gustT = GUST.dur; S.gustX = -220;
      S.gustTimer = gustGap();
      if (!reduceMotion) S.shake = Math.max(S.shake, 0.18);
      say(_msg`elfexpress_sr_gust`);
    }
  }

  if (S.snowAmt < 0.01 || reduceMotion) return;
  const gust = S.gustT > 0 ? 300 : 0;
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

const tutGo = () => (TUT[S.tut - 1] || {}).go;
function tutNext() {
  S.tut++;
  const st = TUT[S.tut - 1];
  if (!st) { start(); return; }
  if (st.spawn !== undefined) tutGift(st.spawn);
  if (st.gear) S.tutGear = true;
  if (st.treats) {
    S.tutTreats = true;
    S.catDual[2] = true;
    S.catPop[2] = 1.4;
    puff(CHUTE_BX + 56, chuteY(2), CATS[2].color, 12);
  }
  if (st.gust) { S.gustT = GUST.dur; S.gustX = -220; S.snowAmt = 1.2; }
}

let last = 0, raf = 0;
function frame(now) {
  raf = requestAnimationFrame(frame);
  if (!last) last = now;
  let dt = (now - last) / 1000; last = now;
  if (dt > 0.05) dt = 0.05;

  if (S && S.mode === 'takeoff') {
    S.takeoff += dt;
    if (S.takeoff > 5.0) endRun(true);
  } else if (S && S.mode === 'hitch') {
    S.t += dt; S.hitchT += dt;
    updateGifts(dt); updateFx(dt); updateSnow(dt);
    if (S.shake > 0) S.shake = Math.max(0, S.shake - dt * 2.2);
    for (let i = 0; i < 5; i++) if (S.catPop[i] > 0) S.catPop[i] = Math.max(0, S.catPop[i] - dt);
    if (S.hitchT > 1.6) startTakeoff();
  } else if (S && S.mode === 'play') {
    if (S.revealT > 0) {
      S.revealT = Math.max(0, S.revealT - dt);
      S.actionEdge = false; S.actionBuf = 0;
      updateFx(dt); updateSnow(dt);
      if (S.shake > 0) S.shake = Math.max(0, S.shake - dt * 2.2);
      for (let i = 0; i < 5; i++) {
        if (S.floorPulse[i] > 0) S.floorPulse[i] = Math.max(0, S.floorPulse[i] - dt);
        if (S.beltPulse[i] > 0) S.beltPulse[i] = Math.max(0, S.beltPulse[i] - dt * 1.6);
        if (S.machFlash[i] > 0) S.machFlash[i] = Math.max(0, S.machFlash[i] - dt * 2.4);
        if (S.catPop[i] > 0) S.catPop[i] = Math.max(0, S.catPop[i] - dt);
      }
    } else {
      S.t += dt;
      S.spawnTimer -= dt;
      if (S.spawnTimer <= 0) { spawnGift(); S.spawnTimer = interval(); }
      updateElf(dt);
      if (S.tut && tutGo() === 'belt' && S.elf.carrying) tutNext();
      if (S.actionBuf > 0) S.actionBuf = Math.max(0, S.actionBuf - dt);
      if (S.actionEdge || S.actionBuf > 0) doAction(S.actionEdge, true);
      else if (S.actionHeld) doAction(false, true);
      S.actionEdge = false;
      updateGifts(dt); updateFx(dt); updateSnow(dt);
      if (S.shake > 0) S.shake = Math.max(0, S.shake - dt * 2.2);
      if (S.catchFlash > 0) S.catchFlash = Math.max(0, S.catchFlash - dt * 1.4);
      if (S.hint > 0 && (S.sleighsDone > 0 || S.t > 9)) S.hint = Math.max(0, S.hint - dt * 2);
      for (let i = 0; i < 5; i++) {
        if (S.floorPulse[i] > 0) S.floorPulse[i] = Math.max(0, S.floorPulse[i] - dt * 1.6);
        if (S.beltPulse[i] > 0) S.beltPulse[i] = Math.max(0, S.beltPulse[i] - dt * 1.6);
        if (S.machFlash[i] > 0) S.machFlash[i] = Math.max(0, S.machFlash[i] - dt * 2.4);
        if (S.catPop[i] > 0) S.catPop[i] = Math.max(0, S.catPop[i] - dt);
      }
    }
  }
  if (S) {
    renderScene(S, elfChoice, activeFloors(), sleighTarget(), !!catchable(true));
  }
}

const clearKeys = () => { if (S) S.keys.left = S.keys.right = S.keys.up = S.keys.down = false; };

let keysBound = false;
function onKeyDown(ev) {
  if (!S || (S.mode !== 'play' && S.mode !== 'hitch')) return;
  const k = KEYMAP[ev.key];
  if (k) {
    const wasDown = !!S.keys[k];
    S.keys[k] = true;
    S.cmd = null;
    S.queue = null;
    if (S.revealT <= 0 && !ev.repeat && !wasDown) {
      const e = S.elf, maxF = activeFloors() - 1;
      if (k === 'up' || k === 'down') {
        const dir = k === 'up' ? 1 : -1;
        if (!S.tut || tutGo() === 'belt' || tutGo() === 'chute') {
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
  if (S.revealT > 0) return;
  if (ev.key === ' ' || ev.code === 'Space' || ev.key === 'Enter' || ev.keyCode === 32) {
    if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
      document.activeElement.blur();
      cv.focus({ preventScroll: true });
    }
    if (S.tut && tutGo() === 'tap') {
      if (!ev.repeat) tutNext();
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
  if (S.revealT > 0) return;
  if (S.tut) {
    const st = TUT[S.tut - 1];
    if (!st) return;
    if (st.go === 'tap') { tutNext(); return; }
    const tf = Math.max(0, Math.min(4, Math.floor((GROUND_Y - p.y) / FLOOR_H)));
    const side = p.x < TAP_SPLIT ? 'belt' : 'chute';
    if (!((st.go === 'belt' || st.go === 'chute') && side === st.go && tf === st.f)) return;
  }
  let f = Math.floor((GROUND_Y - p.y) / FLOOR_H);
  f = Math.max(0, Math.min(4, f));
  if (f >= activeFloors()) return;
  const t = { type: p.x < TAP_SPLIT ? 'belt' : 'chute', floor: f };

  const carrying = !!S.elf.carrying;
  const busy = !!S.cmd;
  S.elf.climbTo = null;
  if (busy && carrying && t.type === 'belt' && S.cmd.type === 'chute') {
    S.queue = t; clearKeys(); return;
  }
  if (busy && !carrying && t.type === 'chute' && S.cmd.type === 'belt') {
    S.queue = t; clearKeys(); return;
  }
  S.cmd = t; S.queue = null; clearKeys();
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
const show = (id, on) => el(id).classList.toggle('on', on);
const say = m => { el('sr').textContent = m; };

function startTakeoff() {
  S.mode = 'takeoff'; S.takeoff = 0;
  S.stars = S.recycled <= TUNE.starGood ? 3 : S.recycled <= TUNE.starOk ? 2 : 1;
  api.play('pd_player_level_up');
  say(_msg`elfexpress_sr_win`);
}

function endRun(won) {
  if (S.mode === 'over') return;
  S.mode = 'over';
  S.won = won;
  unbindKeys();
  reportScore();
  api.play('game_hurry_up_end');
  if (won) {
    api.play('qd_complete');
    api.play('music_start_scene');
  } else {
    api.play('music_ingame_gameover');
    api.play('pd_game_over');
  }
  api.gameover();
}

function start() {
  newGame();
  api.play('game_hurry_up_end');
  api.play('music_start_ingame');
  if (document.activeElement && document.activeElement !== cv && document.activeElement !== document.body) {
    document.activeElement.blur();
  }
  show('scrTitle', false);
  show('btnSkipTut', false);
  bindKeys();
  last = 0;
  if (!raf) raf = requestAnimationFrame(frame);
}

function tutGift(cat) {
  S.gifts.push({
    id: S.nextId++, cat, v: 0, belt: 0, state: 'belt',
    x: -30, y: beltY(0) - GIFT_R,
    timer: 0, wrapped: false, tilt: 0, spin: 0, gusted: false,
    path: null, seg: 0, p: 0, speed: 0, dropFloor: -1, ductFloor: -1,
  });
}

function startTutorial() {
  newGame(); S.tut = 0; S.hint = 0;
  api.play('game_hurry_up_end');
  api.play('music_start_ingame');
  S.elf.x = CHUTE_CX; S.elf.facing = -1;
  tutGift(1);
  if (document.activeElement && document.activeElement !== cv && document.activeElement !== document.body) {
    document.activeElement.blur();
  }
  show('scrTitle', false);
  show('btnSkipTut', true);
  bindKeys();
  tutNext();
  last = 0;
  if (!raf) raf = requestAnimationFrame(frame);
}

el('btnTut').addEventListener('click', ev => { ev.currentTarget.blur(); startTutorial(); });
el('btnSkipTut').addEventListener('click', ev => { ev.currentTarget.blur(); start(); });
buildElfPicker();
el('btnStart').addEventListener('click', ev => { ev.currentTarget.blur(); start(); });

api.config({
  pause: true,
  orientation: 'landscape',
});

api.addEventListener('pause', () => {
  if (!S) return;
  unbindKeys();
  if (S.mode === 'play' || S.mode === 'hitch' || S.mode === 'takeoff') {
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
  start();
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
raf = requestAnimationFrame(frame);
api.ready(() => {
  api.play('qd_load_sounds');
  show('scrTitle', true);
  last = 0;
});
