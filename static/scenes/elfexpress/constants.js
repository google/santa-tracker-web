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

// Core player movement, teeter window, fail threshold, and scoring constants.
export const TUNE = {
  runSpeed: 1200,
  climbSpeed: 700,
  teeterTime: 2.40,
  fallTime: 0.34,
  recycleLimit: 15,
  basePoints: 100,
  sleighBonus: 400,
  comboStep: 4,
  comboMax: 5,
  starGood: 4,
  starOk: 9,
};

// Gifts needed to fill and launch each of the 9 sleighs (sleighsDone 0..8).
export const SLEIGHS = [4, 5, 6, 7, 8, 9, 10, 11, 12];

// Snowfall intensity by sleighsDone (0..8): stays calm across Sleighs 1-3 (0.10-0.26),
// jumps noticeably at Sleigh 4 (at: 3 -> 0.90) when the 5th floor opens, then climbs to 2.40.
export const SNOW = [
  { at: 0, fall: 0.10 },
  { at: 1, fall: 0.18 },
  { at: 2, fall: 0.26 },
  { at: 3, fall: 0.90 },
  { at: 4, fall: 1.15 },
  { at: 5, fall: 1.45 },
  { at: 6, fall: 1.75 },
  { at: 7, fall: 2.10 },
  { at: 8, fall: 2.40 },
];
export const SNOW_PILE = 0.048;

// Wind gusts begin at Sleigh 6 (sleighsDone 5), one sleigh after the Sleigh 5 second-icon reveal,
// and grow more frequent toward Sleigh 9.
export const GUST = {
  fromSleigh: 5,
  gapEarly: [5.5, 9.0],
  gapLate: [3.0, 5.5],
  dur: 2.4,
  front: 0.8,
  beltMul: 1.7,
  teeterBonus: 0.80,
};

// Per-sleigh wave tuning (sleighsDone 0..8): opens one new floor/category per sleigh on Sleighs 2-4
// (reaching all 5 floors on Sleigh 4), while spawn intervals step down ~5.3% per sleigh from 2.40s
// on Sleigh 1 to 1.55s on Sleigh 9 (above the ~1.475s expected 5-floor round trip).
export const WAVES = [
  { interval: 2.40, floors: 2, weights: [50, 50, 0, 0, 0] },
  { interval: 2.27, floors: 3, weights: [36, 34, 30, 0, 0] },
  { interval: 2.15, floors: 4, weights: [26, 26, 25, 23, 0] },
  { interval: 2.04, floors: 5, weights: [20, 20, 20, 20, 20] },
  { interval: 1.93, floors: 5, weights: [20, 20, 20, 20, 20] },
  { interval: 1.83, floors: 5, weights: [19, 20, 20, 20, 21] },
  { interval: 1.73, floors: 5, weights: [17, 19, 20, 22, 22] },
  { interval: 1.64, floors: 5, weights: [15, 18, 20, 23, 24] },
  { interval: 1.55, floors: 5, weights: [14, 17, 20, 23, 26] },
];

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
  appear: 1, scarf: 2, goggles: 3, sneakers: 4,
  bells: 5, blanket: 6, lights: 7, hat: 8, nose: 9,
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
  for (let i = 0; i < WAVES.length; i++) if (WAVES[i].floors > f) return i + 1;
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

export const TUT = [
  { go: 'tap', hole: null, t: _msg`elfexpress_tut_1_t`, b: [_msg`elfexpress_tut_1_b1`, _msg`elfexpress_tut_1_b2`] },
  { go: 'belt', f: 0, hole: 'belt', t: _msg`elfexpress_tut_2_t`, b: [_msg`elfexpress_tut_2_b1`, _msg`elfexpress_tut_2_b2`] },
  { go: 'chute', f: 1, hole: 'chute1', t: _msg`elfexpress_tut_3_t`, b: [_msg`elfexpress_tut_3_b1`, _msg`elfexpress_tut_3_b2`] },
  { go: 'sleigh', hole: 'sleigh', t: _msg`elfexpress_tut_4_t`, b: [_msg`elfexpress_tut_4_b1`, _msg`elfexpress_tut_4_b2`] },
  { go: 'belt', f: 0, hole: 'belt', spawn: 0, t: _msg`elfexpress_tut_5_t`, b: [_msg`elfexpress_tut_5_b1`, _msg`elfexpress_tut_5_b2`] },
  { go: 'chute', f: 1, hole: 'chute1', t: _msg`elfexpress_tut_6_t`, b: [_msg`elfexpress_tut_6_b1`, _msg`elfexpress_tut_6_b2`] },
  { go: 'bin', hole: 'bin', t: _msg`elfexpress_tut_7_t`, b: [_msg`elfexpress_tut_7_b1`, _msg`elfexpress_tut_7_b2`] },
  { go: 'tap', hole: 'bin', t: '', b: [_msg`elfexpress_tut_8_b1`] },
  { go: 'belt', f: 0, hole: 'belt', spawn: 0, t: _msg`elfexpress_tut_9_t`, b: [_msg`elfexpress_tut_9_b1`] },
  { go: 'chute', f: 0, hole: 'chute0', t: '', b: [_msg`elfexpress_tut_10_b1`] },
  { go: 'done', hole: 'sleigh', t: _msg`elfexpress_tut_11_t`, b: [] },
  { go: 'tap', hole: 'reindeer', t: _msg`elfexpress_tut_12_t`, b: [_msg`elfexpress_tut_12_b1`, _msg`elfexpress_tut_12_b2`] },
  { go: 'tap', hole: 'reindeer', gear: true, t: _msg`elfexpress_tut_13_t`, b: [_msg`elfexpress_tut_13_b1`] },
  { go: 'tap', hole: 'chute2', treats: true, t: _msg`elfexpress_tut_14_t`, b: [_msg`elfexpress_tut_14_b1`] },
  { go: 'tap', hole: null, gust: true, t: _msg`elfexpress_tut_15_t`, b: [_msg`elfexpress_tut_15_b1`, _msg`elfexpress_tut_15_b2`] },
];

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
