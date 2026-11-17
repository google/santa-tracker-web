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
  beltSpeed: 49,           // Conveyor belt speed (px/s, placeholder from test version D)
  snowballSlowTime: 2.5,   // Duration elf stays snow-covered and moves at half speed when catching a snowball (s)
  snowballSlowMul: 0.50,   // Exact half speed multiplier while snow-covered
  snowballRadius: 21,      // Snowball radius on belt (~gift size)
  teeterTime: 2.35,        // Default teeter time fallback (s)
  mouseTimeMul: 1.15,      // Mouse gets ~15% more time (spawn gaps and teeter times x1.15); touch is baseline (1.0)
  fallTime: 0.34,          // Fall duration from belt edge to floor (s)
  humanTimePerGift: 0.60,  // Playable check: 0.6s per gift to see toy, choose chute, and tap twice
  reactionTime: 0.30,      // 0.30s per tap x 2 taps = 0.60s per gift
  minSpareByWave: [0.60, 0.60, 0.60, 0.60, 0.60, 0.60, 0.60, 0.60], // Minimum spare time per gift (0.60s rule)
  recycleLimit: 10,        // Recycled gifts per sleigh before Game Over (resets to 0 each sleigh)
  relaxTime: 3.0,          // 3s break between levels after a sleigh fills (with "Phew!" cue)
  sleighFlyTime: 1.8,      // Sleigh + reindeer takeoff & glide-back duration during the 3s break (s)
  dualToysFromWave: 3,     // Sleigh (1-8) that introduces second toys at level start (Sleigh 3)
  hurryMusicFromWave: 8,   // Sleigh (1-8) that starts game_hurry_up music at level start (Sleigh 8 only)
  snowBigFlakesFromWave: 6, // Sleigh (1-8) where big snowflakes and snow covering gifts turn on
  basePoints: 100,
  sleighBonus: 400,
  comboStep: 4,
  comboMax: 5,
  starGood: 4,
  starOk: 9,
};

export const GUST = {
  warnTime: 1.00,          // 1s snow-streak warning sweeping in from the left before each gust (s)
  dur: 2.40,               // Active wind gust duration so its effect is clearly visible (s)
  front: 0.55,             // Time for wind front to sweep across the workshop (s)
  beltMul: 1.95,           // Belt speed multiplier so a gusted gift catches up to form a pair
};

// 8 sleighs. High volume from Sleigh 1 (3-4 toys visible at once, rising to 7-9 in Sleigh 8).
// Early sleighs are easy because toys come in runs of the same category on belts 0-1 floor from their chute.
// Each sleigh spreads toys out more (more chutes 3-4 floors from their belt, and pairs needing two different chutes)
// while gifts per minute strictly rises every sleigh with a sawtooth gap curve.
export const WAVES = [
  {
    wave: 1,
    floors: 2,
    startFloors: 2,
    pulses: 1,
    flowCount: 4,
    flowGap: 1.73,
    speedUpCount: 3,
    speedUpGap: 1.55,
    burstSize: 1,
    burstGap: 1.48,
    pairs: 2,
    snowballs: 0,
    gusts: 0,
    gustMul: 1,
    sameCatProb: 0.69,
    fullSpreadPairRatio: 0,
    splitPairProb: 0,
    preseedCount: 2,
    breathe: 3,
    teeter: 2.1,
    gustOnBurst: false,
    peakSize: 3,
    farPairRatio: 0,
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
    flowCount: 5,
    flowGap: 1.55,
    speedUpCount: 4,
    speedUpGap: 1.37,
    burstSize: 2,
    burstGap: 1.29,
    pairs: 3,
    snowballs: 0,
    gusts: 0,
    gustMul: 1,
    sameCatProb: 0.62,
    fullSpreadPairRatio: 0,
    splitPairProb: 0,
    preseedCount: 3,
    breathe: 3,
    teeter: 2,
    gustOnBurst: false,
    peakSize: 3,
    farPairRatio: 0,
  },
  {
    wave: 3,
    floors: 5,
    startFloors: 5,
    pulses: 1,
    flowCount: 7,
    flowGap: 1.36,
    speedUpCount: 5,
    speedUpGap: 1.22,
    burstSize: 3,
    burstGap: 1.14,
    pairs: 4,
    snowballs: 1,
    gusts: 1,
    gustMul: 1.36,
    sameCatProb: 0.39,
    fullSpreadPairRatio: 0,
    splitPairProb: 0.24,
    preseedCount: 3,
    breathe: 3,
    teeter: 1.9,
    gustOnBurst: false,
    peakSize: 3,
    farPairRatio: 0.86,
  },
  {
    wave: 4,
    floors: 5,
    startFloors: 5,
    pulses: 1,
    flowCount: 10,
    flowGap: 1.21,
    speedUpCount: 7,
    speedUpGap: 1.09,
    burstSize: 4,
    burstGap: 1.01,
    pairs: 10,
    snowballs: 2,
    gusts: 2,
    gustMul: 1.51,
    sameCatProb: 0.26,
    fullSpreadPairRatio: 0,
    splitPairProb: 0.3,
    preseedCount: 3,
    breathe: 3,
    teeter: 1.83,
    gustOnBurst: false,
    peakSize: 3,
    farPairRatio: 0.86,
  },
  {
    wave: 5,
    floors: 5,
    startFloors: 5,
    pulses: 1,
    flowCount: 10,
    flowGap: 1.11,
    speedUpCount: 9,
    speedUpGap: 1.02,
    burstSize: 4,
    burstGap: 0.93,
    pairs: 11,
    snowballs: 2,
    gusts: 2,
    gustMul: 1.66,
    sameCatProb: 0.17,
    fullSpreadPairRatio: 0.21,
    splitPairProb: 0.43,
    preseedCount: 4,
    breathe: 3,
    teeter: 1.76,
    gustOnBurst: false,
    peakSize: 4,
    farPairRatio: 0.86,
  },
  {
    wave: 6,
    floors: 5,
    startFloors: 5,
    pulses: 1,
    flowCount: 10,
    flowGap: 1.02,
    speedUpCount: 10,
    speedUpGap: 0.94,
    burstSize: 4,
    burstGap: 0.86,
    pairs: 12,
    snowballs: 3,
    gusts: 3,
    gustMul: 1.81,
    sameCatProb: 0.1,
    fullSpreadPairRatio: 0.39,
    splitPairProb: 0.46,
    preseedCount: 4,
    breathe: 3,
    teeter: 1.7,
    gustOnBurst: false,
    peakSize: 4,
    farPairRatio: 0.86,
  },
  {
    wave: 7,
    floors: 5,
    startFloors: 5,
    pulses: 1,
    flowCount: 11,
    flowGap: 0.94,
    speedUpCount: 11,
    speedUpGap: 0.86,
    burstSize: 4,
    burstGap: 0.79,
    pairs: 13,
    snowballs: 3,
    gusts: 3,
    gustMul: 1.96,
    sameCatProb: 0.04,
    fullSpreadPairRatio: 0.55,
    splitPairProb: 0.61,
    preseedCount: 5,
    breathe: 3,
    teeter: 1.66,
    gustOnBurst: false,
    peakSize: 4,
    farPairRatio: 0.86,
  },
  {
    wave: 8,
    floors: 5,
    startFloors: 5,
    pulses: 1,
    flowCount: 12,
    flowGap: 0.87,
    speedUpCount: 12,
    speedUpGap: 0.79,
    burstSize: 5,
    burstGap: 0.72,
    pairs: 15,
    snowballs: 4,
    gusts: 4,
    gustMul: 2.11,
    sameCatProb: 0,
    fullSpreadPairRatio: 0.75,
    splitPairProb: 0.75,
    preseedCount: 5,
    breathe: 3,
    teeter: 1.62,
    gustOnBurst: false,
    peakSize: 4,
    farPairRatio: 0.86,
  },
];

// Sleigh capacity per level equals that level's total gifts
export const SLEIGHS = WAVES.map(w => w.flowCount + (w.speedUpCount || 0) + w.burstSize);

// Snowfall intensity spread over the 8 sleighs (sleighsDone 0..7):
// Sleigh 1 has no snow; light flurries start in Sleigh 2 and grow denser each sleigh,
// with bigger flakes from Sleigh 5 on and heaviest in Sleigh 8.
export const SNOW = [
  { at: 0, fall: 0.00, label: 'None' },
  { at: 1, fall: 0.22, label: 'Light flurries' },
  { at: 2, fall: 0.45, label: 'Light snow' },
  { at: 3, fall: 0.72, label: 'Steady snow' },
  { at: 4, fall: 1.02, label: 'Big flakes' },
  { at: 5, fall: 1.36, label: 'Heavy snow' },
  { at: 6, fall: 1.75, label: 'Blustery snow' },
  { at: 7, fall: 2.20, label: 'Heaviest blizzard' },
];
export const SNOW_PILE = 0.048;
export const SNOW_BIG_FLAKES_FROM_WAVE = 6;
export const SNOW_MAX_GIFT_COVER = 0.32;

// ============================================================================
// ASSETS, LAYOUT & SCENE CONSTANTS
// ============================================================================

export const ELVES = [
  { id: 'elf1', front: { w: 267.2, h: 560.6, pad: 16.25, src: 'img/elf-1-front.svg' }, side: { w: 173.6, h: 522.8, pad: 16.25, src: 'img/elf-1-side.svg' } },
  { id: 'elf2', front: { w: 236.6, h: 404.0, pad: 14.89, src: 'img/elf-2-front.svg' }, side: { w: 150.2, h: 382.4, pad: 14.96, src: 'img/elf-2-side.svg' } },
  { id: 'elf3', front: { w: 234.8, h: 405.8, pad: 16.04, src: 'img/elf-3-front.svg' }, side: { w: 150.2, h: 369.8, pad: 16.04, src: 'img/elf-3-side.svg' } },
  { id: 'elf4', front: { w: 265.4, h: 558.8, pad: 14.70, src: 'img/elf-4-front.svg' }, side: { w: 155.6, h: 535.4, pad: 14.70, src: 'img/elf-4-side.svg' } },
  { id: 'elf5', front: { w: 270.8, h: 486.8, pad: 15.55, src: 'img/elf-5-front.svg' }, side: { w: 184.4, h: 456.2, pad: 15.16, src: 'img/elf-5-side.svg' } },
  { id: 'elf6', front: { w: 270.8, h: 427.4, pad: 14.81, src: 'img/elf-6-front.svg' }, side: { w: 186.2, h: 389.6, pad: 14.78, src: 'img/elf-6-side.svg' } },
];

export const PROPS = {
  sleigh: { w: 125.9, h: 103, file: 'img/sleigh-empty.svg' },
  rudolph: { w: 260.65, h: 365.5, file: 'img/rudolph.svg' },
  snowball: { w: 64, h: 64, file: 'img/snowball.png' },
};

export const PRESENTS = ['img/present-a.svg', 'img/present-b.svg'];

export const TOY_ICONS = [
  [
    { w: 64, h: 64, size: 32, src: 'img/icon-sports-football.svg' },
    { w: 64, h: 64, size: 32, src: 'img/icon-sports-skate.svg' },
  ],
  [
    { w: 64, h: 64, size: 32, src: 'img/icon-vehicles-car.svg' },
    { w: 64, h: 64, size: 32, src: 'img/icon-vehicles-train.svg' },
  ],
  [
    { w: 64, h: 64, size: 32, src: 'img/icon-treats-candy-cane.svg' },
    { w: 56, h: 34, size: 27, src: 'img/icon-treats-candy.svg' },
  ],
  [
    { w: 64, h: 64, size: 32, src: 'img/icon-books-stack.svg' },
    { w: 64, h: 64, size: 32, src: 'img/icon-books-storybook.svg' },
  ],
  [
    { w: 64, h: 64, size: 32, src: 'img/icon-plush-bear.svg' },
    { w: 64, h: 64, size: 32, src: 'img/icon-plush-frenchie.svg' },
  ],
];

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

export const msgSleighAway = (done, total) => _msg`elfexpress_sr_sleigh_away`.replace('{done}', done).replace('{total}', total);

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
  lights: 5,
  hat: 6,
  nose: 7,
};

export const ELF_MIN_X = 72, ELF_MAX_X = 598;
export const ELF_H = 94;
export const ELF_SCALE = ELF_H / ELVES[0].front.h;
export const CARRY_OFF = 54;
export const GIFT_R = 17;

export const BOX_X = 14, BOX_Y = 2, BOX_W = 874, BOX_H = 692;
export const PAD_TOP = 8, PAD_BOT = 4, PAD_SIDE = 4;

export const feetY = f => GROUND_Y - f * FLOOR_H;
export const beltY = f => feetY(f) - 88;
export const chuteY = f => feetY(f) - 30;
export const elfCarryOff = (elfIdx = 0) =>
  Math.round(CARRY_OFF * ((ELVES[elfIdx] || ELVES[0]).front.h / ELVES[0].front.h));
export const carryY = (f, elfIdx = 0) => feetY(f) - elfCarryOff(elfIdx);

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
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '.......................G',
  '......................GG',
  '.....................GG.',
  '......TTTT..GGGG....RR..',
  '......TTTT.GGGGGG..RR...',
  '..NNNNTTTT.GGGGGG.RR....',
  'T.NNNNTTTT.GGGGG..RR....',
  'TTNNNNTTTTRRRRRRRRR.....',
  'TTNN.RRRRRRRRRRRRRR.....',
  'RRRRRRRRRRRRRRRRRRR.....',
  'RRRRRRRRRRRRRRRRRRR.....',
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

// Diner Dash style 6-step tutorial at the start of Wave 1:
// 1. "Help the elves sort the toys so they can be wrapped!" (OK)
// 2. "Tap the conveyor to catch the toy." (continues when caught, arrow on belt 0)
// 3. "You can carry two! Catch another one." (second gift on belt 1; continues when caught)
// 4. "Now drop each toy in its matching chute so it gets the right wrapping." (continues when both are delivered)
// 5. "Be careful! Sometimes you can't catch them all." (one toy teeters and falls on purpose; OK)
// 6. "Missed toys go to the recycler. You can miss up to <recycleLimit> per sleigh and still load it." (OK -> wave starts)
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
    ok: true,
    text: 'Tap the conveyor to catch the toy.',
  },
  {
    step: 3,
    go: 'belt',
    f: 1,
    ok: true,
    text: 'You can carry two! Catch another one.',
  },
  {
    step: 4,
    go: 'chute',
    ok: true,
    text: 'Now drop each toy in its matching chute so it gets the right wrapping.',
  },
  {
    step: 5,
    go: 'ok',
    ok: true,
    text: "Be careful! Sometimes you can't catch them all.",
  },
  {
    step: 6,
    go: 'ok',
    ok: true,
    get text() {
      return `Missed toys go to the recycler. You can miss up to ${TUNE.recycleLimit} per sleigh and still load it.`;
    },
  },
];

export const SNOWBALL_TUT_BOX = {
  ok: true,
  text: 'Watch out for snowballs! They slow you down.',
};

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

