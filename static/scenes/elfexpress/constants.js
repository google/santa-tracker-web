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

import '../../src/magic.js';
import { _msg } from '../../src/magic.js';

// ============================================================================
// GAMEPLAY & WAVE SETTINGS (Tune all difficulty, timing, and wave numbers here)
// ============================================================================

export const TUNE = {
  baseRunSpeed: 1200,      // Original 100% elf horizontal run speed (px/s)
  baseClimbSpeed: 700,     // Original 100% elf ladder climb speed (px/s)
  speedPct: 100,           // Current elf speed as % of base (100%)
  runSpeed: 1200,          // Elf horizontal run speed at 100% (px/s)
  climbSpeed: 700,         // Elf ladder climb speed at 100% (px/s)
  teeterTime: 2.40,        // Default teeter time fallback (s)
  fallTime: 0.34,          // Fall duration from belt edge to floor (s)
  humanTimePerGift: 0.60,  // Playable check: 0.6s per gift to see toy, choose chute, and tap twice
  reactionTime: 0.30,      // 0.30s per tap x 2 taps = 0.60s per gift
  minSpareByWave: [0.60, 0.60, 0.60, 0.60, 0.60, 0.60, 0.60], // Minimum spare time per gift (0.60s rule)
  recycleLimit: 15,        // Recycled gifts before Game Over — unchanged
  relaxTime: 3.0,          // 3s break between levels after a sleigh fills (with "Phew!" cue)
  sleighFlyTime: 1.8,      // Sleigh + reindeer takeoff & glide-back duration during the 3s break (s)
  dualToysFromWave: 4,     // Sleigh (1-7) that introduces second toys at level start (Sleigh 4)
  twoHands: true,          // Feature flag: two-hand carrying (enabled from Sleigh 6)
  sackFromWave: 6,         // Sleigh (1-7) where two-hand carrying starts (Sleigh 6)
  hurryMusicFromWave: 7,   // Sleigh (1-7) that starts game_hurry_up music at level start (Sleigh 7 only)
  basePoints: 100,
  sleighBonus: 400,
  comboStep: 4,
  comboMax: 5,
  starGood: 4,
  starOk: 9,
};

export const GUST = {
  warnTime: 0.85,          // Short visual warning duration before a wind gust hits (s)
  dur: 1.50,               // Active wind gust duration (s)
  front: 0.45,             // Time for wind front to sweep across the workshop (s)
  beltMul: 1.70,           // Belt speed multiplier when a gust pushes gifts
};

// 7 sleighs (~3 minutes total). Each level is steady flow -> speed-up -> burst until sleigh is full -> 3s break.
export const WAVES = [
  {
    wave: 1,
    floors: 2,
    startFloors: 2,
    pulses: 1,
    flowCount: 4,
    flowGap: 2.40,
    speedUpCount: 0,
    speedUpGap: 2.40,
    burstSize: 0,
    burstGap: 2.40,
    breathe: 3.0,
    teeter: 2.40,
    gustOnBurst: false,
  },
  {
    wave: 2,
    floors: 5,
    startFloors: 2,
    progressiveFloors: [
      { atGift: 0, floors: 3 },
      { atGift: 2, floors: 4 },
      { atGift: 4, floors: 5 },
    ],
    pulses: 1,
    flowCount: 3,
    flowGap: 2.60,
    speedUpCount: 3,
    speedUpGap: 2.20,
    burstSize: 2,
    burstGap: 1.80,
    breathe: 3.0,
    teeter: 2.35,
    gustOnBurst: false,
  },
  {
    wave: 3,
    floors: 5,
    startFloors: 5,
    pulses: 1,
    flowCount: 3,
    flowGap: 2.40,
    speedUpCount: 3,
    speedUpGap: 2.00,
    burstSize: 3,
    burstGap: 1.50,
    breathe: 3.0,
    teeter: 2.30,
    gustOnBurst: false,
  },
  {
    wave: 4,
    floors: 5,
    startFloors: 5,
    pulses: 1,
    flowCount: 4,
    flowGap: 2.20,
    speedUpCount: 3,
    speedUpGap: 1.80,
    burstSize: 3,
    burstGap: 1.40,
    breathe: 3.0,
    teeter: 2.20,
    gustOnBurst: false,
  },
  {
    wave: 5,
    floors: 5,
    startFloors: 5,
    pulses: 1,
    flowCount: 4,
    flowGap: 2.10,
    speedUpCount: 4,
    speedUpGap: 1.70,
    burstSize: 3,
    burstGap: 1.30,
    breathe: 3.0,
    teeter: 2.15,
    gustOnBurst: false,
  },
  {
    wave: 6,
    floors: 5,
    startFloors: 5,
    pulses: 1,
    flowCount: 4,
    flowGap: 2.10,
    speedUpCount: 4,
    speedUpGap: 1.70,
    burstSize: 4,
    burstGap: 1.30,
    breathe: 3.0,
    teeter: 2.10,
    gustOnBurst: true,
  },
  {
    wave: 7,
    floors: 5,
    startFloors: 5,
    pulses: 1,
    flowCount: 5,
    flowGap: 1.90,
    speedUpCount: 4,
    speedUpGap: 1.50,
    burstSize: 4,
    burstGap: 1.10,
    breathe: 3.0,
    teeter: 2.00,
    gustOnBurst: true,
  },
];

// Sleigh capacity per level equals that level's total gifts: [4, 8, 9, 10, 11, 12, 13]
export const SLEIGHS = WAVES.map(w => w.flowCount + (w.speedUpCount || 0) + w.burstSize);

// Snowfall intensity spread over the 7 sleighs (sleighsDone 0..6)
export const SNOW = [
  { at: 0, fall: 0.10 },
  { at: 1, fall: 0.25 },
  { at: 2, fall: 0.45 },
  { at: 3, fall: 0.75 },
  { at: 4, fall: 1.15 },
  { at: 5, fall: 1.65 },
  { at: 6, fall: 2.20 },
];
export const SNOW_PILE = 0.048;

// ============================================================================
// ASSETS, LAYOUT & SCENE CONSTANTS
// ============================================================================

export const ELVES = [
  { id: 'elf1', front: { w: 267.2, h: 560.6, src: 'img/elf-1-front.svg' }, side: { w: 173.6, h: 522.8, src: 'img/elf-1-side.svg' } },
  { id: 'elf2', front: { w: 236.6, h: 404.0, src: 'img/elf-2-front.svg' }, side: { w: 150.2, h: 382.4, src: 'img/elf-2-side.svg' } },
  { id: 'elf3', front: { w: 234.8, h: 405.8, src: 'img/elf-3-front.svg' }, side: { w: 150.2, h: 369.8, src: 'img/elf-3-side.svg' } },
  { id: 'elf4', front: { w: 265.4, h: 558.8, src: 'img/elf-4-front.svg' }, side: { w: 155.6, h: 535.4, src: 'img/elf-4-side.svg' } },
  { id: 'elf5', front: { w: 270.8, h: 486.8, src: 'img/elf-5-front.svg' }, side: { w: 184.4, h: 456.2, src: 'img/elf-5-side.svg' } },
  { id: 'elf6', front: { w: 270.8, h: 427.4, src: 'img/elf-6-front.svg' }, side: { w: 186.2, h: 389.6, src: 'img/elf-6-side.svg' } },
];

export const PROPS = {
  sleigh: { w: 125.9, h: 103, file: 'img/sleigh.svg' },
  santa: { w: 125.9, h: 103, file: 'img/santa.svg' },
  rudolph: { w: 260.65, h: 365.5, file: 'img/rudolph.svg' },
};

export const ENDING = {
  big: _msg`elfexpress_win_big`,
  small: _msg`elfexpress_win_small`,
};

export const SKIN_TONES = ['#FADCBC', '#E0BB95', '#BF8F68', '#9B643D', '#584539'];

export const CATS = [
  { label: _msg`elfexpress_cat_sports`, color: '#03B4C9', glow: 'rgba(3,180,201,.45)', ink: '#1D1D1D' },
  { label: _msg`elfexpress_cat_vehicles`, color: '#FFE14D', glow: 'rgba(255,225,77,.45)', ink: '#1D1D1D' },
  { label: _msg`elfexpress_cat_treats`, color: '#FF3333', glow: 'rgba(255,51,51,.45)', ink: '#1D1D1D' },
  { label: _msg`elfexpress_cat_books`, color: '#6F00FF', glow: 'rgba(111,0,255,.45)', ink: '#FFFFFF' },
  { label: _msg`elfexpress_cat_plush`, color: '#32A658', glow: 'rgba(50,166,88,.45)', ink: '#1D1D1D' },
];
export const CAT_UPPER = CATS.map(c => c.label.toUpperCase());

export const ELF_LABELS = [
  _msg`elfexpress_elf_orange`,
  _msg`elfexpress_elf_purple`,
  _msg`elfexpress_elf_red`,
  _msg`elfexpress_elf_green`,
  _msg`elfexpress_elf_blue`,
  _msg`elfexpress_elf_yellow`,
];

export const msgOpensAtSleigh = n => _msg`elfexpress_opens_at_sleigh`.replace('{sleigh}', n);
export const msgSleighAway = (done, total) => _msg`elfexpress_sr_sleigh_away`.replace('{done}', done).replace('{total}', total);
export const HINT_CATCH = _msg`elfexpress_hint_catch`;
export const HINT_CHUTE = _msg`elfexpress_hint_chute`;
export const REVEAL_BANNER = _msg`elfexpress_new_gifts_banner`;
export const TUT_FOOTERS = {
  tap: _msg`elfexpress_tut_footer_tap`,
  belt: _msg`elfexpress_tut_footer_belt`,
  chute: _msg`elfexpress_tut_footer_chute`,
};

export const W = 900, H = 700;
export const FLOOR_H = 112;
export const BUILD_X0 = 44, BUILD_X1 = 624;
export const GROUND_Y = 620;
export const LADDER_CX = 372, LADDER_HALF = 34;
export const TAP_SPLIT = 336;
export const TEETER_X = 200;
export const DROP_X0 = 156, DROP_X1 = 250;
export const DROP_CX = (DROP_X0 + DROP_X1) / 2;
export const CHUTE_BX = 410, CHUTE_BW = 204, CHUTE_BH = 58;
export const CHUTE_CX = 512;

export const MACH_CX = 664, MACH_W = 64, MACH_H = 40;
export const MACH_L = MACH_CX - MACH_W / 2, MACH_R = MACH_CX + MACH_W / 2;
export const SPINE_X = MACH_CX;
export const WRAP_X = 730;
export const LINE_SPEED = 620;
export const BIN_X = 664, BIN_Y = 664;
export const SLEIGH_X = 760, SLEIGH_Y = 596;
export const DEER_X = 848, DEER_Y = 605, DEER_S = 1.55;
export const GEAR = {
  appear: 0,
  scarf: 0,
  goggles: 1,
  sneakers: 2,
  bells: 3,
  blanket: 4,
  lights: 4,
  hat: 5,
  nose: 6,
};

export const ELF_MIN_X = 72, ELF_MAX_X = 598;
export const ELF_H = 94;
export const CARRY_OFF = 54;
export const GIFT_R = 17;

export const BOX_X = 14, BOX_Y = 2, BOX_W = 874, BOX_H = 692;
export const PAD_TOP = 8, PAD_BOT = 4, PAD_SIDE = 4;

export const feetY = f => GROUND_Y - f * FLOOR_H;
export const beltY = f => feetY(f) - 88;
export const chuteY = f => feetY(f) - 30;
export const carryY = f => feetY(f) - CARRY_OFF;

export function unlockSleigh(f) {
  for (let i = 0; i < WAVES.length; i++) if ((WAVES[i].floors || 2) > f) return i + 1;
  return WAVES.length;
}
export const OPENS_AT_LABELS = [0, 1, 2, 3, 4].map(f => msgOpensAtSleigh(unlockSleigh(f)));

export const STARS_BG = [
  [60,90,3],[120,180,2],[210,64,2],[690,80,3],[762,150,2],[830,70,2],
  [872,210,3],[700,244,2],[58,300,2],[132,360,3],[30,190,2],[792,300,2],
  [860,362,2],[662,178,2],[750,58,2],[40,424,2],[880,120,2],[722,332,3],
  [-90,110,2],[-180,220,3],[-260,85,2],[-140,340,2],[-320,180,2],[-410,290,3],
  [970,105,2],[1060,230,3],[1150,90,2],[1020,350,2],[1220,175,3],[1310,280,2],
];
export const HILLS_BG = [
  [-360,760,145],[-200,766,135],[-30,756,150],[712,762,140],[866,748,126],
  [1010,758,142],[1170,764,136],[1330,754,148],
];

export const PXS = 3, CWS = 300, CHS = 233, GYS = 206;
export const PXC = {
  R: '#FF3333', r: '#D92626', q: '#9C0F0A', W: '#FFFFFF', S: '#FADCBC',
  G: '#FFE14D', K: '#1D1D1D', P: '#FF7373', T: '#03B4C9', N: '#32A658',
  D: '#E0BB95', d: '#BF8F68', A: '#74797E',
};

export const SPR_SLEIGH = [
  '............WW..........',
  '...........WWWW.........',
  '..........RRRRW.........',
  '.........RRRRRRW........',
  '........WWWWWWWWW.......',
  '........SSSSSSSS.......G',
  '.......GKKSKKSG.......GG',
  '......WWWSPSSWWW.....GG.',
  '......WWWWWWWWWW....RR..',
  '.....WWWWWWWWWWWW..RR...',
  '.....WWWWWWWWWWWW.RR....',
  'T.N..WWWWWWWWWWW..RR....',
  'TTNN..WWWWWWWWWRRRR.....',
  'TTNN.RRWWWWWWWRRRRR.....',
  'RRRRRRRKKKKKRRRRRRR.....',
  'RRRRRRRKGGGKRRRRRRR.....',
  'rRRRRRRRRRRRRRRRRr......',
  '.rrrrrrrrrrrrrrrr.......',
  'GGGGGGGGGGGGGGGGGG......',
  '.G...............G......',
];

export const SPR_DEER_A = [
  '.........A..A...',
  '.........A.AA...',
  '..........AAA...',
  '..........DDD...',
  '.........DKDDD..',
  '..DDDDDDDDDDDR..',
  '.DDDDDDDDDDDW...',
  '.DDDDDDDDDDD....',
  '.DDDDDDDDDDD....',
  '.dD.....DD.d....',
  '.d......dD.d....',
  '.d......d..d....',
  '.d......d..d....',
];

export const SPR_DEER_B = [
  '.........A..A...',
  '.........A.AA...',
  '..........AAA...',
  '..........DDD...',
  '.........DKDDD..',
  '..DDDDDDDDDDDR..',
  '.DDDDDDDDDDDW...',
  '.DDDDDDDDDDD....',
  '.DDDDDDDDDDD....',
  '..dD....DDd.d...',
  'd.......d.D..d..',
  'd.......d....d..',
  'd.......d....d..',
];

export const CITY_FAR = [
  [0,20,26],[24,16,18],[44,24,34],[72,18,22],[96,22,30],[122,16,20],
  [142,26,38],[172,18,24],[194,22,28],[220,16,18],[240,24,32],
  [268,20,24],[292,12,20],
];
export const CITY = [
  [2,18,44,'#046C76'],[22,14,30,'#7A037E'],[38,24,62,'#B71C1C'],
  [64,16,34,'#1B69C1'],[82,20,48,'#148B59'],[104,14,28,'#4802B8'],
  [120,26,66,'#048490'],[148,16,36,'#9C0F0A'],[166,18,46,'#7A037E'],
  [186,14,30,'#1B69C1'],[202,22,54,'#148B59'],[226,16,34,'#B71C1C'],
  [244,20,46,'#046C76'],[266,16,32,'#4802B8'],[284,16,42,'#048490'],
];
export const MOON_X = 206, MOON_Y = 58, MOON_R = 13;

export function takeoffPath(k) {
  const e = 1 - Math.pow(1 - Math.min(Math.max(k, 0), 1), 2.2);
  return { x: 6 + e * 236, y: 168 - e * 150 };
}

// Diner Dash style 5-step tutorial at the start of Wave 1:
// 1. Intro box (OK)
// 2. First toy teeters -> "Tap the conveyor to catch the toy." (continues when caught, arrow on belt)
// 3. "Now drop it in the matching chute so it gets the right wrapping." (continues when delivered, arrow on chute)
// 4. One toy teeters and falls on purpose -> "Be careful! Sometimes you can't catch them all." (OK)
// 5. Toy goes to recycler & recycler flashes -> "Missed toys go to the recycler. You can miss up to 15 and still load the sleighs." (OK -> wave starts)
export const TUT = [
  {
    step: 1,
    go: 'ok',
    ok: true,
    text: 'Help the elves sort the toys so they can be wrapped!',
  },
  {
    step: 2,
    go: 'belt',
    f: 0,
    ok: false,
    text: 'Tap the conveyor to catch the toy.',
  },
  {
    step: 3,
    go: 'chute',
    f: 1,
    ok: false,
    text: 'Now drop it in the matching chute so it gets the right wrapping.',
  },
  {
    step: 4,
    go: 'ok',
    ok: true,
    text: "Be careful! Sometimes you can't catch them all.",
  },
  {
    step: 5,
    go: 'ok',
    ok: true,
    get text() {
      return `Missed toys go to the recycler. You can miss up to ${TUNE.recycleLimit} and still load the sleighs.`;
    },
  },
];

export const TWO_HANDS_TEXT = 'Now you can carry two toys!';

export function tutHole(h) {
  if (h === 'belt') return [BUILD_X0, feetY(0) - FLOOR_H, TAP_SPLIT - BUILD_X0, FLOOR_H];
  if (h === 'chute2' || h === 'chute1' || h === 'chute0') {
    const f = h === 'chute2' ? 2 : (h === 'chute1' ? 1 : 0);
    return [CHUTE_BX - 8, chuteY(f) - CHUTE_BH / 2 - 8, CHUTE_BW + 16, CHUTE_BH + 16];
  }
  if (h === 'sleigh') return [MACH_L - 12, chuteY(1) - 34, 264, 200];
  if (h === 'bin') return [BIN_X - 52, BIN_Y - 50, 104, 86];
  if (h === 'reindeer') return [DEER_X - 26, SLEIGH_Y - 76, 76, 120];
  return null;
}

export const KEYMAP = {
  ArrowLeft: 'left', Left: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', Right: 'right', d: 'right', D: 'right',
  ArrowUp: 'up', Up: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', Down: 'down', s: 'down', S: 'down',
};
