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
import {
  ELVES, PROPS, ENDING, TUNE, SLEIGHS, GUST, CATS, CAT_UPPER,
  OPENS_AT_LABELS, HINT_CATCH, HINT_CHUTE, REVEAL_BANNER, TUT_FOOTERS,
  W, H, FLOOR_H, BUILD_X0, BUILD_X1, GROUND_Y, TAP_SPLIT, TEETER_X,
  DROP_X0, DROP_X1, CHUTE_BX, CHUTE_BW, CHUTE_BH, MACH_CX, MACH_W, MACH_H,
  MACH_L, MACH_R, BIN_X, BIN_Y, SLEIGH_X, SLEIGH_Y, DEER_X, GEAR,
  ELF_H, GIFT_R, BOX_X, BOX_Y, BOX_W, BOX_H, PAD_TOP, PAD_BOT, PAD_SIDE,
  feetY, beltY, chuteY, carryY, STARS_BG, HILLS_BG,
  PXS, CWS, CHS, GYS, PXC, SPR_SLEIGH, SPR_DEER_A, SPR_DEER_B,
  CITY_FAR, CITY, MOON_X, MOON_Y, MOON_R, takeoffPath, TUT, tutHole,
} from './constants.js';

export const cv = document.getElementById('game');
cv.setAttribute('aria-label', _msg`scene_elfexpress`);
export const cx = cv.getContext('2d');

for (const k in PROPS) {
  const p = PROPS[k];
  p.img = new Image();
  p.img.src = p.file;
}

export const ELF_IMG = ELVES.map(d => {
  const f = new Image();
  f.src = d.front.src;
  const s = new Image();
  s.src = d.side.src;
  return { front: f, side: s };
});

const BG = new Image();
let bgReady = false;
BG.onload = () => { bgReady = true; };
BG.src = 'img/workshop-bg.svg';

let scale = 1, offsetX = 0, offsetY = 0;
export let viewX0 = 0, viewY0 = 0, viewX1 = W, viewY1 = H;

const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
export let reduceMotion = mqReduce.matches;
if (mqReduce.addEventListener) {
  mqReduce.addEventListener('change', e => { reduceMotion = e.matches; });
}

export function fit() {
  const stg = document.getElementById('stage');
  const vw = (stg && stg.clientWidth) || window.innerWidth || W;
  const vh = (stg && stg.clientHeight) || window.innerHeight || H;
  const availW = Math.max(120, vw - PAD_SIDE * 2);
  const availH = Math.max(120, vh - PAD_TOP - PAD_BOT);
  scale = Math.min(availW / BOX_W, availH / BOX_H);
  offsetX = Math.round((vw - BOX_W * scale) / 2 - BOX_X * scale);
  offsetY = Math.round(PAD_TOP + (availH - BOX_H * scale) / 2 - BOX_Y * scale);
  viewX0 = -offsetX / scale;
  viewY0 = -offsetY / scale;
  viewX1 = (vw - offsetX) / scale;
  viewY1 = (vh - offsetY) / scale;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(vw * dpr);
  cv.height = Math.round(vh * dpr);
  cv.style.width = vw + 'px';
  cv.style.height = vh + 'px';
  cx.setTransform(scale * dpr, 0, 0, scale * dpr, offsetX * dpr, offsetY * dpr);
  const dir = document.documentElement.dir || document.dir || 'inherit';
  if (cx.direction !== dir) cx.direction = dir;
}

export function toGame(ev) {
  const r = cv.getBoundingClientRect();
  return {
    x: (ev.clientX - r.left - offsetX) / scale,
    y: (ev.clientY - r.top - offsetY) / scale,
  };
}

const GRAD = {};
const grad = (k, make) => (GRAD[k] || (GRAD[k] = make()));
const wrapGrad = t => grad('w' + t, () => {
  const g = cx.createLinearGradient(-15, -14, 15, 14);
  g.addColorStop(0, t);
  g.addColorStop(1, '#3A068D');
  return g;
});

const has = (S, k) => S.tutGear || S.sleighsDone >= GEAR[k];
const gustFront = S => -160 + (W + 320) * Math.min(1, (GUST.dur - S.gustT) / GUST.front);

function drawBackdrop(g2) {
  const x0 = viewX0 - 40, y0 = viewY0 - 40;
  const x1 = viewX1 + 40, y1 = viewY1 + 40;
  const skyR = Math.max(650, (x1 - x0) * 0.55, (y1 - y0) * 0.72);
  const sky = g2.createRadialGradient(W * 0.5, H * 0.28, 0, W * 0.5, H * 0.28, skyR);
  sky.addColorStop(0, '#E3F4FF');
  sky.addColorStop(1, '#2B7FD9');
  g2.fillStyle = sky;
  g2.fillRect(x0, y0, x1 - x0, y1 - y0);
  g2.save();
  g2.fillStyle = '#FFFFFF';
  g2.globalAlpha = 0.9;
  for (const [sx, sy, sr] of STARS_BG) {
    g2.beginPath(); g2.arc(sx, sy, sr, 0, Math.PI * 2); g2.fill();
  }
  g2.restore();
  g2.fillStyle = '#FFFFFF';
  for (const [hx, hy, hr] of HILLS_BG) {
    g2.beginPath(); g2.arc(hx, hy, hr, 0, Math.PI * 2); g2.fill();
  }
  const groundH = Math.max(H - GROUND_Y, y1 - GROUND_Y);
  g2.fillRect(x0, GROUND_Y, x1 - x0, groundH);
  g2.fillStyle = '#C1E8ED';
  g2.fillRect(x0, GROUND_Y, x1 - x0, 7);
  g2.fillStyle = '#FFFFFF';
  g2.fillRect(x0, GROUND_Y, x1 - x0, 3);
}

function drawDrift(g2, x0, x1, y, depth, lumpy) {
  if (depth < 0.04) return;
  const h = 3 + depth * 24;
  g2.save();
  g2.beginPath();
  g2.moveTo(x0, y + 3);
  if (lumpy) {
    const n = Math.max(3, Math.round((x1 - x0) / 78));
    let lx = x0, ly = y - h * 0.55;
    g2.lineTo(lx, ly);
    for (let i = 1; i <= n; i++) {
      const t = i / n, xx = x0 + (x1 - x0) * t;
      const yy = y - h * (0.5 + 0.5 * Math.abs(Math.sin(i * 2.3 + 0.7)));
      g2.quadraticCurveTo((lx + xx) / 2, Math.min(ly, yy) - h * 0.3, xx, yy);
      lx = xx; ly = yy;
    }
  } else {
    const r = Math.min(h * 0.85, (x1 - x0) / 2.2);
    g2.lineTo(x0, y - h + r);
    g2.quadraticCurveTo(x0, y - h, x0 + r, y - h);
    g2.lineTo(x1 - r, y - h);
    g2.quadraticCurveTo(x1, y - h, x1, y - h + r);
  }
  g2.lineTo(x1, y + 3);
  g2.closePath();
  g2.fillStyle = '#FFFFFF'; g2.globalAlpha = 0.94; g2.fill();
  g2.globalAlpha = 0.28; g2.fillStyle = '#6BB4FD';
  g2.fill();
  g2.restore();
}

function gearC(g2, S) {
  const t = S.t, pulse = 0.75 + 0.25 * Math.sin(t * 5);
  g2.save(); g2.lineCap = 'round';
  if (!has(S, 'sneakers')) for (const x of [76, 227.6, 95.6, 207.5]) {
    g2.fillStyle = '#5B3A1E'; g2.beginPath(); g2.roundRect(x - 10, 350, 20, 16, 5); g2.fill();
  }
  if (has(S, 'sneakers')) for (const [x, far] of [[76, 1], [227.6, 1], [95.6, 0], [207.5, 0]]) {
    g2.shadowColor = '#22D3EE'; g2.shadowBlur = 10 * pulse;
    g2.fillStyle = far ? '#D61F45' : '#FF2D55';
    g2.beginPath(); g2.roundRect(x - 13, 312, 28, 44, 9); g2.fill();
    g2.beginPath(); g2.roundRect(x - 32, 336, 47, 24, 12); g2.fill();
    g2.shadowBlur = 0; g2.fillStyle = '#FFFFFF';
    g2.beginPath(); g2.ellipse(x - 25, 350, 10, 9, 0, 0, 7); g2.fill();
    g2.beginPath(); g2.roundRect(x - 35, 356, 53, 12, 6); g2.fill();
    g2.strokeStyle = '#22D3EE'; g2.lineWidth = 3;
    g2.beginPath(); g2.moveTo(x - 31, 362); g2.lineTo(x + 14, 362); g2.stroke();
    g2.strokeStyle = '#FFFFFF'; g2.lineWidth = 3;
    for (let y = 318; y < 340; y += 8) {
      g2.beginPath(); g2.moveTo(x - 9, y); g2.lineTo(x - 1, y + 6);
      g2.moveTo(x - 1, y); g2.lineTo(x - 9, y + 6); g2.stroke();
    }
    g2.fillStyle = '#FFFFFF'; g2.beginPath(); g2.arc(x + 7, 330, 6, 0, 7); g2.fill();
    g2.fillStyle = '#FF2D55'; g2.beginPath(); g2.arc(x + 7, 330, 2.5, 0, 7); g2.fill();
  }
  g2.restore();
}

function gearD(g2, S) {
  const pulse = 0.75 + 0.25 * Math.sin(S.t * 5);
  g2.save();
  if (has(S, 'blanket')) {
    g2.shadowColor = '#39FF88'; g2.shadowBlur = 14 * pulse;
    g2.fillStyle = '#16A34A'; g2.strokeStyle = '#FDE047'; g2.lineWidth = 6;
    g2.beginPath(); g2.moveTo(110, 172); g2.lineTo(214, 172); g2.lineTo(214, 228);
    for (let x = 214; x > 110; x -= 13) g2.quadraticCurveTo(x - 6.5, 242, x - 13, 228);
    g2.closePath(); g2.fill(); g2.stroke();
    g2.shadowBlur = 0; g2.fillStyle = '#FFFFFF'; g2.fillRect(110, 193, 104, 16);
    g2.fillStyle = '#FF2D55';
    for (let x = 118; x < 212; x += 16) {
      g2.beginPath(); g2.moveTo(x, 201); g2.lineTo(x + 5, 195);
      g2.lineTo(x + 10, 201); g2.lineTo(x + 5, 207); g2.closePath(); g2.fill();
    }
    g2.shadowColor = '#FDE047'; g2.shadowBlur = 10; g2.fillStyle = '#FDE047';
    for (const x of [110, 214]) {
      g2.beginPath(); g2.arc(x, 232, 6, 0, 7); g2.fill();
      g2.fillRect(x - 3, 232, 6, 16);
    }
  }
  g2.restore();
}

function gearA(g2, S) {
  const t = S.t, gust = S.gustT > 0, pulse = 0.75 + 0.25 * Math.sin(t * 5);
  gearC(g2, S); gearD(g2, S);
  g2.save(); g2.shadowBlur = 12 * pulse;
  if (!has(S, 'blanket') && S.snowDepth > 0.3) {
    g2.globalAlpha = Math.min(1, (S.snowDepth - 0.3) * 2); g2.fillStyle = '#F1F5F9';
    g2.beginPath(); g2.ellipse(160, 177, 45, 9, 0, 0, 7); g2.fill(); g2.globalAlpha = 1;
  }
  if (has(S, 'scarf')) {
    const f = (gust ? 3.2 : 1) * Math.sin(t * (gust ? 11 : 3)) * 5;
    g2.shadowColor = '#FF3B5C'; g2.fillStyle = '#FF2D55';
    g2.beginPath(); g2.roundRect(50, 140, 52, 22, 10); g2.fill();
    g2.beginPath(); g2.moveTo(95, 144); g2.quadraticCurveTo(125, 142 + f, 150, 127 + f * 2);
    g2.quadraticCurveTo(128, 160 + f, 95, 160); g2.closePath(); g2.fill();
    g2.fillStyle = '#FFFFFF'; for (const x of [64, 84]) g2.fillRect(x, 140, 6, 22);
  }
  if (has(S, 'bells')) {
    const s = Math.sin(t * (gust ? 9 : 2.4)) * 3;
    g2.shadowColor = '#FDE047'; g2.fillStyle = '#FF2D55'; g2.fillRect(54, 172, 46, 8);
    g2.shadowBlur = 20 * pulse; g2.fillStyle = '#FDE047';
    g2.beginPath(); g2.arc(60 + s, 191, 12, 0, 7); g2.fill();
    g2.shadowBlur = 0; g2.fillStyle = '#FFFFFF';
    g2.beginPath(); g2.arc(56 + s, 187, 3.5, 0, 7); g2.fill();
  }
  g2.restore();
}

function gearB(g2, S) {
  const t = S.t;
  g2.save();
  if (has(S, 'goggles')) {
    g2.strokeStyle = '#FDE047'; g2.lineWidth = 8;
    g2.beginPath(); g2.moveTo(40, 106); g2.lineTo(97, 103); g2.stroke();
    g2.shadowColor = '#22D3EE'; g2.shadowBlur = 14;
    g2.fillStyle = '#22D3EE'; g2.strokeStyle = '#FDE047'; g2.lineWidth = 5;
    g2.beginPath(); g2.ellipse(52, 110, 15, 13, 0, 0, 7); g2.fill(); g2.stroke();
    g2.shadowBlur = 0; g2.fillStyle = '#FFFFFF';
    g2.beginPath(); g2.ellipse(47, 105, 5, 3.5, 0, 0, 7); g2.fill();
  }
  if (has(S, 'lights')) {
    const tw = 0.75 + 0.25 * Math.abs(Math.sin(t * 4));
    [[60, 3, '#FF2D55'], [82, 7, '#39FF88']].forEach(([x, y, c]) => {
      g2.shadowColor = c; g2.shadowBlur = 22 * tw;
      g2.fillStyle = '#9CA3AF'; g2.fillRect(x - 5, y - 2, 10, 8);
      g2.fillStyle = c; g2.beginPath(); g2.ellipse(x, y - 13, 12, 14, 0, 0, 7); g2.fill();
      g2.shadowBlur = 0; g2.fillStyle = '#FFFFFF';
      g2.beginPath(); g2.arc(x - 4, y - 18, 4, 0, 7); g2.fill();
    });
  }
  if (has(S, 'hat')) {
    g2.shadowColor = '#FF3B5C'; g2.shadowBlur = 12; g2.fillStyle = '#FF2D55';
    g2.beginPath(); g2.moveTo(60, 94); g2.lineTo(92, 50); g2.lineTo(100, 96); g2.closePath(); g2.fill();
    g2.shadowColor = '#FFFFFF'; g2.fillStyle = '#FFFFFF';
    g2.beginPath(); g2.roundRect(56, 88, 48, 12, 6); g2.fill();
    g2.beginPath(); g2.arc(92, 48, 9, 0, 7); g2.fill();
  }
  if (has(S, 'nose')) {
    const p = 0.6 + 0.4 * Math.abs(Math.sin(t * 4));
    g2.shadowBlur = 0;
    g2.fillStyle = 'rgba(255,45,85,' + (0.6 * p) + ')';
    g2.beginPath(); g2.arc(10, 125, 40 * p, 0, 7); g2.fill();
    g2.fillStyle = 'rgba(255,255,255,.9)';
    g2.beginPath(); g2.arc(6, 121, 4, 0, 7); g2.fill();
  }
  g2.restore();
}

function drawReindeer(g2, S) {
  if (!has(S, 'appear')) return;
  const r = PROPS.rudolph;
  if (!r.img.complete) return;
  const h = 90, k = h / r.h, w = r.w * k;
  const gy = SLEIGH_Y + 36, cxPos = DEER_X + 12;
  g2.save();
  g2.strokeStyle = 'rgba(201,138,70,.6)'; g2.lineWidth = 2;
  g2.setLineDash([5, 4]); g2.lineCap = 'round';
  g2.beginPath(); g2.moveTo(SLEIGH_X + 54, SLEIGH_Y - 17); g2.lineTo(cxPos - 10, gy - h * 0.45); g2.stroke();
  g2.setLineDash([]);
  g2.translate(cxPos, gy + Math.sin(S.t * 1.6) * 0.6);
  g2.scale(-1, 1); g2.translate(-w / 2, -h); g2.scale(k, k);
  g2.lineCap = 'round'; g2.lineJoin = 'round';
  g2.drawImage(r.img, 0, 0, r.w, r.h);
  gearA(g2, S); gearB(g2, S);
  g2.restore();
}

function drawIcon(g2, cat, x, y, s, v = 0) {
  g2.save(); g2.translate(x, y); g2.scale(s, s);
  g2.lineWidth = 2.2; g2.lineJoin = 'round'; g2.lineCap = 'round';
  if (cat === 0) {
    if (v === 0) {
      g2.fillStyle = '#03B4C9'; g2.strokeStyle = '#FFF';
      g2.beginPath(); g2.arc(0, 0, 13, 0, 7); g2.fill(); g2.stroke();
      g2.strokeStyle = 'rgba(255,255,255,.85)'; g2.lineWidth = 1.8;
      g2.beginPath(); g2.moveTo(-13, -3); g2.quadraticCurveTo(0, -9, 13, -3); g2.stroke();
      g2.beginPath(); g2.moveTo(-13, 4); g2.quadraticCurveTo(0, 10, 13, 4); g2.stroke();
    } else {
      g2.save();
      g2.beginPath(); g2.arc(0, 0, 13, 0, 7);
      g2.fillStyle = '#FFFFFF'; g2.fill();
      g2.clip();
      g2.fillStyle = '#0F172A'; g2.strokeStyle = '#0F172A'; g2.lineWidth = 1.5;
      g2.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
        const px = Math.cos(a) * 5.2, py = Math.sin(a) * 5.2;
        if (i === 0) g2.moveTo(px, py); else g2.lineTo(px, py);
      }
      g2.closePath(); g2.fill();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
        g2.beginPath();
        g2.moveTo(Math.cos(a) * 4.8, Math.sin(a) * 4.8);
        g2.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
        g2.stroke();
        g2.beginPath();
        g2.arc(Math.cos(a) * 13.4, Math.sin(a) * 13.4, 3.8, 0, 7);
        g2.fill();
      }
      g2.restore();
      g2.strokeStyle = '#03B4C9'; g2.lineWidth = 2.0;
      g2.beginPath(); g2.arc(0, 0, 13, 0, 7); g2.stroke();
    }
  } else if (cat === 1) {
    if (v === 0) {
      g2.fillStyle = '#FFE14D'; g2.strokeStyle = '#FFF';
      g2.beginPath();
      g2.moveTo(-15, 5); g2.lineTo(-15, -1); g2.lineTo(-8, -1); g2.lineTo(-2, -9);
      g2.lineTo(8, -9); g2.lineTo(12, -1); g2.lineTo(16, -1); g2.lineTo(16, 5);
      g2.closePath(); g2.fill(); g2.stroke();
      for (const wx of [-8, 9]) {
        g2.fillStyle = '#41474C'; g2.beginPath(); g2.arc(wx, 6.5, 4.5, 0, 7); g2.fill();
        g2.strokeStyle = '#3399FF'; g2.lineWidth = 1.5; g2.stroke();
      }
    } else {
      g2.fillStyle = '#FFE14D'; g2.strokeStyle = '#FFF'; g2.lineWidth = 2;
      g2.beginPath();
      g2.moveTo(-14, 5); g2.lineTo(-14, -9); g2.lineTo(-4, -9); g2.lineTo(-4, -3);
      g2.lineTo(5, -3); g2.lineTo(5, -11); g2.lineTo(10, -11); g2.lineTo(10, -3);
      g2.lineTo(13, -3); g2.lineTo(15, 5); g2.closePath();
      g2.fill(); g2.stroke();
      g2.fillStyle = '#3399FF';
      g2.fillRect(-11.5, -6.5, 5, 4.5);
      for (const wx of [-9.5, -1, 7.5]) {
        g2.fillStyle = '#41474C'; g2.beginPath(); g2.arc(wx, 6.8, 3.6, 0, 7); g2.fill();
        g2.strokeStyle = '#3399FF'; g2.lineWidth = 1.3; g2.stroke();
      }
    }
  } else if (cat === 2) {
    if (v === 0) {
      g2.lineWidth = 7.5; g2.strokeStyle = '#FF3333';
      g2.beginPath(); g2.moveTo(-5, 13); g2.lineTo(-5, -3);
      g2.quadraticCurveTo(-5, -13, 4, -13); g2.quadraticCurveTo(12, -13, 8, -4); g2.stroke();
      g2.strokeStyle = '#FFF'; g2.setLineDash([3.5, 6.5]); g2.stroke(); g2.setLineDash([]);
    } else {
      g2.fillStyle = '#FFE14D'; g2.strokeStyle = '#FFF'; g2.lineWidth = 1.8;
      g2.beginPath();
      g2.moveTo(-10, 2); g2.lineTo(10, 2); g2.lineTo(7.5, 12.5); g2.lineTo(-7.5, 12.5);
      g2.closePath(); g2.fill(); g2.stroke();
      g2.strokeStyle = '#D97706'; g2.lineWidth = 1.3;
      g2.beginPath(); g2.moveTo(-3.5, 3.5); g2.lineTo(-2.5, 11); g2.stroke();
      g2.beginPath(); g2.moveTo(3.5, 3.5); g2.lineTo(2.5, 11); g2.stroke();
      g2.fillStyle = '#FFFFFF'; g2.strokeStyle = '#FF3333'; g2.lineWidth = 2;
      g2.beginPath();
      g2.moveTo(-11, 2.5);
      g2.arc(-6.5, -1, 4.8, Math.PI * 0.9, Math.PI * 1.85);
      g2.arc(0, -3.5, 5.5, Math.PI * 1.1, Math.PI * 1.9);
      g2.arc(6.5, -1, 4.8, Math.PI * 1.15, Math.PI * 0.1);
      g2.closePath(); g2.fill(); g2.stroke();
      g2.fillStyle = '#FF3333'; g2.strokeStyle = '#FFF'; g2.lineWidth = 1.5;
      g2.beginPath(); g2.arc(0, -10.5, 3.5, 0, 7); g2.fill(); g2.stroke();
    }
  } else if (cat === 3) {
    if (v === 0) {
      g2.fillStyle = '#4802B8'; g2.strokeStyle = '#FFF';
      g2.beginPath(); g2.rect(-14, 0, 28, 9); g2.fill(); g2.stroke();
      g2.fillStyle = '#6F00FF';
      g2.beginPath(); g2.rect(-11, -9, 24, 9); g2.fill(); g2.stroke();
      g2.strokeStyle = '#3399FF'; g2.lineWidth = 1.6;
      g2.beginPath(); g2.moveTo(-7, -4.5); g2.lineTo(7, -4.5); g2.stroke();
      g2.beginPath(); g2.moveTo(-9, 4.5); g2.lineTo(9, 4.5); g2.stroke();
    } else {
      g2.fillStyle = '#6F00FF'; g2.strokeStyle = '#FFF'; g2.lineWidth = 2;
      g2.beginPath();
      g2.moveTo(0, -7.5);
      g2.quadraticCurveTo(-7, -11.5, -14.5, -9);
      g2.lineTo(-14.5, 8.5);
      g2.quadraticCurveTo(-7, 6.5, 0, 10.5);
      g2.quadraticCurveTo(7, 6.5, 14.5, 8.5);
      g2.lineTo(14.5, -9);
      g2.quadraticCurveTo(7, -11.5, 0, -7.5);
      g2.closePath(); g2.fill(); g2.stroke();
      g2.strokeStyle = '#FFFFFF'; g2.lineWidth = 2;
      g2.beginPath(); g2.moveTo(0, -7.5); g2.lineTo(0, 10); g2.stroke();
      g2.strokeStyle = '#3399FF'; g2.lineWidth = 1.6;
      for (const py of [-3, 1.5]) {
        g2.beginPath(); g2.moveTo(-10.5, py - 1); g2.lineTo(-3.5, py); g2.stroke();
        g2.beginPath(); g2.moveTo(3.5, py); g2.lineTo(10.5, py - 1); g2.stroke();
      }
    }
  } else {
    if (v === 0) {
      g2.fillStyle = '#17A167'; g2.strokeStyle = '#FFF';
      for (const ex of [-9, 9]) { g2.beginPath(); g2.arc(ex, -9, 5.2, 0, 7); g2.fill(); }
      g2.fillStyle = '#32A658'; g2.beginPath(); g2.arc(0, 1, 12.5, 0, 7); g2.fill();
      g2.fillStyle = '#1D1D1D';
      for (const ex of [-4.5, 4.5]) { g2.beginPath(); g2.arc(ex, -2, 1.8, 0, 7); g2.fill(); }
      g2.fillStyle = '#FFF'; g2.beginPath(); g2.ellipse(0, 6, 5.2, 4, 0, 0, 7); g2.fill();
      g2.fillStyle = '#1D1D1D'; g2.beginPath(); g2.arc(0, 4.5, 1.8, 0, 7); g2.fill();
    } else {
      g2.fillStyle = '#17A167'; g2.strokeStyle = '#FFF'; g2.lineWidth = 1.8;
      g2.beginPath(); g2.moveTo(-10.5, -2); g2.lineTo(-12, -14); g2.lineTo(-3, -4); g2.closePath(); g2.fill(); g2.stroke();
      g2.beginPath(); g2.moveTo(10.5, -2); g2.lineTo(12, -14); g2.lineTo(3, -4); g2.closePath(); g2.fill(); g2.stroke();
      g2.fillStyle = '#32A658'; g2.strokeStyle = '#FFF'; g2.lineWidth = 1.8;
      g2.beginPath(); g2.roundRect(-11.5, -5.5, 23, 17.5, 6); g2.fill(); g2.stroke();
      g2.fillStyle = '#1D1D1D';
      for (const ex of [-5.2, 5.2]) { g2.beginPath(); g2.arc(ex, 0.5, 1.9, 0, 7); g2.fill(); }
      g2.fillStyle = '#FFFFFF';
      g2.beginPath(); g2.arc(-2.6, 6.2, 3.8, 0, 7); g2.arc(2.6, 6.2, 3.8, 0, 7); g2.fill();
      g2.fillStyle = '#1D1D1D';
      g2.beginPath(); g2.arc(0, 3.8, 2.0, 0, 7); g2.fill();
    }
  }
  g2.restore();
}

function drawWrapped(g2, x, y, s, tint) {
  g2.save(); g2.translate(x, y); g2.scale(s, s);
  g2.fillStyle = wrapGrad(tint || '#6F00FF');
  g2.strokeStyle = '#FFF'; g2.lineWidth = 2; g2.lineJoin = 'round';
  g2.beginPath(); g2.roundRect(-15, -14, 30, 28, 4); g2.fill(); g2.stroke();
  g2.strokeStyle = '#FFE14D'; g2.lineWidth = 4;
  g2.beginPath(); g2.moveTo(0, -14); g2.lineTo(0, 14); g2.stroke();
  g2.beginPath(); g2.moveTo(-15, 0); g2.lineTo(15, 0); g2.stroke();
  g2.fillStyle = '#FFE14D'; g2.strokeStyle = '#FFF'; g2.lineWidth = 1.5;
  g2.beginPath(); g2.arc(-4, -16, 4.5, 0, 7); g2.fill(); g2.stroke();
  g2.beginPath(); g2.arc(4, -16, 4.5, 0, 7); g2.fill(); g2.stroke();
  g2.restore();
}

function drawIconBadge(g2, cat, x, y, s, v = 0) {
  const c = CATS[cat];
  g2.save(); g2.translate(x, y); g2.scale(s, s);
  g2.fillStyle = c.glow;
  g2.beginPath(); g2.arc(0, 0, GIFT_R + 7, 0, 7); g2.fill();
  g2.fillStyle = 'rgba(15,23,42,.85)';
  g2.beginPath(); g2.arc(0, 0, GIFT_R + 2, 0, 7); g2.fill();
  g2.strokeStyle = c.color; g2.lineWidth = 2.4;
  g2.beginPath(); g2.arc(0, 0, GIFT_R + 2, 0, 7); g2.stroke();
  g2.restore();
  drawIcon(g2, cat, x, y, 1.02 * s, v);
}

function drawGift(g2, g) {
  g2.save();
  if (g.state === 'belt' && g.x < 44) { g2.beginPath(); g2.rect(18, 0, W, H); g2.clip(); }
  g2.translate(g.x, g.y);
  if (g.tilt) g2.rotate(g.tilt);
  if (g.spin && (g.state === 'toBin' || g.state === 'landed')) g2.rotate(Math.sin(g.spin) * 0.28);
  if (g.wrapped) drawWrapped(g2, 0, 0, 0.92, CATS[g.cat].color);
  else {
    const c = CATS[g.cat];
    g2.fillStyle = c.glow; g2.beginPath(); g2.arc(0, 0, GIFT_R + 7, 0, 7); g2.fill();
    g2.fillStyle = 'rgba(15,23,42,.85)'; g2.beginPath(); g2.arc(0, 0, GIFT_R + 2, 0, 7); g2.fill();
    g2.strokeStyle = c.color; g2.lineWidth = 2.4;
    g2.beginPath(); g2.arc(0, 0, GIFT_R + 2, 0, 7); g2.stroke();
    drawIcon(g2, g.cat, 0, 0, 1.02, g.v || 0);
  }
  g2.restore();
}

function drawElf(g2, e, elfChoice) {
  const d = ELVES[elfChoice] || ELVES[0];
  const pics = ELF_IMG[elfChoice] || ELF_IMG[0];
  const moving = e.bob !== 0 || e.climbing;
  const im = moving ? pics.side : pics.front;
  if (!im.complete || !im.naturalWidth) return;
  const v = moving ? d.side : d.front;
  const k = Math.min(ELF_H / d.front.h, 50 / d.front.w);
  const w = v.w * k, h = v.h * k;
  const hop = e.climbing ? -Math.abs(Math.sin(e.bob)) * 2 : (moving ? -Math.abs(Math.sin(e.bob)) * 3 : 0);
  g2.save();
  g2.translate(e.x, e.y + hop);
  if (moving && e.facing < 0) g2.scale(-1, 1);
  g2.drawImage(im, -w / 2, -h, w, h);
  g2.restore();
}

function drawPadlock(g2, x, y, s) {
  g2.save(); g2.translate(x, y); g2.scale(s, s);
  g2.strokeStyle = '#74797E'; g2.lineWidth = 2.6; g2.lineCap = 'round';
  g2.beginPath(); g2.arc(0, -4, 5.5, Math.PI, 0); g2.stroke();
  g2.fillStyle = '#B9BDC3'; g2.strokeStyle = '#74797E'; g2.lineWidth = 1.6;
  g2.beginPath(); g2.roundRect(-8, -4, 16, 13, 2.5); g2.fill(); g2.stroke();
  g2.restore();
}

function drawFloorBelt(g2, S, f) {
  const by = beltY(f);
  g2.fillStyle = '#D8DDE2';
  const shift = (S.t * 58) % 32;
  for (let bx = BUILD_X0 - 26 + shift; bx < TEETER_X + 8; bx += 32) {
    if (bx < BUILD_X0 - 24) continue;
    g2.beginPath(); g2.arc(bx, by + 10, 4, 0, 7); g2.fill();
  }
}

function drawSorter(g2, S, f, live) {
  const cy = chuteY(f);
  const fl = S.machFlash[f], ok = S.machOk[f];
  const hot = fl > 0;
  const T = cy - MACH_H / 2;

  g2.save();
  if (hot) {
    g2.fillStyle = ok ? 'rgba(43,127,217,.94)' : 'rgba(229,28,35,.94)';
    g2.strokeStyle = '#FFFFFF'; g2.lineWidth = 2.4;
    g2.beginPath(); g2.roundRect(MACH_L, T, MACH_W, MACH_H, 9); g2.fill(); g2.stroke();
  }
  drawWrapped(g2, MACH_CX, cy, 0.5, (hot && ok) ? '#FFFFFF' : '#9D87F5');

  g2.lineCap = 'round'; g2.lineJoin = 'round'; g2.lineWidth = 2.6;
  g2.strokeStyle = (hot && ok) ? '#FFFFFF' : 'rgba(255,255,255,.75)';
  g2.beginPath();
  g2.moveTo(MACH_R + 6, cy - 5); g2.lineTo(MACH_R + 12, cy); g2.lineTo(MACH_R + 6, cy + 5);
  g2.stroke();
  g2.strokeStyle = (hot && !ok) ? '#FFFFFF' : 'rgba(229,28,35,.6)';
  g2.beginPath();
  g2.moveTo(MACH_CX - 5, T + MACH_H + 5); g2.lineTo(MACH_CX, T + MACH_H + 11);
  g2.lineTo(MACH_CX + 5, T + MACH_H + 5);
  g2.stroke();

  if (!live) {
    g2.fillStyle = 'rgba(185,189,195,.72)';
    g2.fillRect(MACH_L - 20, T - 8, 128, MACH_H + 16);
  }
  g2.restore();
}

const FIT_CACHE = new Map();
function drawFitText(g2, txt, x, y, maxW, baseSize, minSize = 9) {
  const mw = Math.round(maxW);
  const key = txt + '|' + mw + '|' + baseSize + '|' + minSize;
  let entry = FIT_CACHE.get(key);
  if (!entry) {
    let sz = baseSize;
    let font = 'bold ' + sz + "px 'Google Sans',sans-serif";
    g2.font = font;
    while (sz > minSize && g2.measureText(txt).width > mw) {
      sz -= 0.5;
      font = 'bold ' + sz + "px 'Google Sans',sans-serif";
      g2.font = font;
    }
    const clamp = g2.measureText(txt).width > mw;
    entry = { font, clamp };
    FIT_CACHE.set(key, entry);
  } else {
    g2.font = entry.font;
  }
  if (entry.clamp) g2.fillText(txt, x, y, mw);
  else g2.fillText(txt, x, y);
}

const WRAP_CACHE = new Map();
function wrapText(g2, txt, maxW) {
  if (!txt) return [];
  const key = g2.font + '|' + maxW + '|' + txt;
  const cached = WRAP_CACHE.get(key);
  if (cached) return cached;
  if (g2.measureText(txt).width <= maxW) {
    const res = [txt];
    WRAP_CACHE.set(key, res);
    return res;
  }
  const words = txt.split(' ');
  let bestIdx = -1, bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const l1 = words.slice(0, i).join(' '), l2 = words.slice(i).join(' ');
    const w1 = g2.measureText(l1).width, w2 = g2.measureText(l2).width;
    if (w1 <= maxW && w2 <= maxW && Math.abs(w1 - w2) < bestDiff) {
      bestDiff = Math.abs(w1 - w2); bestIdx = i;
    }
  }
  if (bestIdx > 0) {
    const res = [words.slice(0, bestIdx).join(' '), words.slice(bestIdx).join(' ')];
    WRAP_CACHE.set(key, res);
    return res;
  }
  const lines = []; let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (cur && g2.measureText(next).width > maxW) { lines.push(cur); cur = w; }
    else cur = next;
  }
  if (cur) lines.push(cur);
  WRAP_CACHE.set(key, lines);
  return lines;
}

function drawWorkshop(g2, S, floors) {
  if (S.snowDepth > 0.01) {
    g2.save(); g2.globalAlpha = 0.95;
    g2.strokeStyle = '#FFFFFF'; g2.lineWidth = 8 + S.snowDepth * 15;
    g2.lineJoin = 'round'; g2.lineCap = 'round';
    g2.beginPath();
    g2.moveTo(BUILD_X0 - 22, feetY(4) - FLOOR_H);
    g2.lineTo((BUILD_X0 + BUILD_X1) / 2, feetY(4) - FLOOR_H - 48);
    g2.lineTo(BUILD_X1 + 22, feetY(4) - FLOOR_H);
    g2.stroke(); g2.restore();
  }

  const carrying = !!S.elf.carrying;

  for (let f = 0; f < 5; f++) {
    const y = feetY(f), open = f < floors;

    if (!open) {
      g2.fillStyle = 'rgba(185,189,195,.58)';
      g2.fillRect(BUILD_X0 + 2, y - FLOOR_H + 2, BUILD_X1 - BUILD_X0 - 4, FLOOR_H - 4);
      const lby = chuteY(f) - CHUTE_BH / 2;
      g2.fillStyle = '#FFFFFF'; g2.strokeStyle = '#74797E'; g2.lineWidth = 2;
      g2.beginPath(); g2.roundRect(CHUTE_BX, lby, CHUTE_BW, CHUTE_BH, 13); g2.fill(); g2.stroke();
      drawPadlock(g2, CHUTE_BX + 28, lby + CHUTE_BH / 2, 1.1);
      g2.fillStyle = '#1D1D1D'; g2.textAlign = 'left';
      drawFitText(g2, OPENS_AT_LABELS[f], CHUTE_BX + 50, lby + CHUTE_BH / 2 + 4, 146, 12, 9);
      continue;
    }

    const beltSel = S.cmd && S.cmd.type === 'belt' && S.cmd.floor === f;
    const beltQ = S.queue && S.queue.type === 'belt' && S.queue.floor === f;
    const liveHere = !carrying && S.gifts.some(g => g.belt === f &&
      (g.state === 'belt' || g.state === 'teeter' || g.state === 'falling'));
    if (beltSel || S.beltPulse[f] > 0) {
      g2.fillStyle = beltSel ? 'rgba(43,127,217,.16)' : 'rgba(42,157,92,.16)';
      g2.beginPath(); g2.roundRect(BUILD_X0 + 6, y - FLOOR_H + 6, TAP_SPLIT - BUILD_X0 - 14, FLOOR_H - 12, 10);
      g2.fill();
    }
    if (beltSel || (liveHere && !carrying)) {
      g2.strokeStyle = beltSel ? '#3399FF'
        : 'rgba(43,127,217,' + (reduceMotion ? 0.55 : (0.32 + 0.38 * Math.abs(Math.sin(S.t * 3.5)))) + ')';
      g2.lineWidth = beltSel ? 3 : 2.4;
      g2.beginPath(); g2.roundRect(BUILD_X0 + 6, y - FLOOR_H + 6, TAP_SPLIT - BUILD_X0 - 14, FLOOR_H - 12, 10);
      g2.stroke();
    }
    if (beltQ) {
      g2.strokeStyle = '#32A658'; g2.lineWidth = 2.6; g2.setLineDash([8, 6]);
      g2.beginPath(); g2.roundRect(BUILD_X0 + 4, y - FLOOR_H + 4, TAP_SPLIT - BUILD_X0 - 10, FLOOR_H - 8, 12);
      g2.stroke(); g2.setLineDash([]);
    }

    drawFloorBelt(g2, S, f);

    const liveDrop = S.gifts.some(g => g.belt === f && (g.state === 'teeter' || g.state === 'falling'));
    if (liveDrop) {
      g2.strokeStyle = '#1B69C1';
      g2.lineWidth = 2.6;
      g2.setLineDash([6, 5]);
      g2.strokeRect(DROP_X0, y - 56, DROP_X1 - DROP_X0, 56);
      g2.setLineDash([]);
    }

    const sel = S.cmd && S.cmd.type === 'chute' && S.cmd.floor === f;
    const match = S.revealed && carrying && S.elf.carrying.cat === f;
    const hi = sel || match;
    const q = S.queue && S.queue.type === 'chute' && S.queue.floor === f;
    const cyy = chuteY(f), by2 = cyy - CHUTE_BH / 2;
    const cat = CATS[f], pulse = S.floorPulse[f];
    const popT = S.catPop ? S.catPop[f] : 0;
    const popDur = S.tut ? 1.4 : 2.6;
    const popElapsed = Math.max(0, popDur - popT);
    const blink = !reduceMotion && popT > 0 && Math.sin(popElapsed * Math.PI * 3.5) > 0;

    if ((!carrying || (S.revealed && !match)) && !hi && pulse <= 0 && popT <= 0) {
      g2.fillStyle = 'rgba(255,255,255,.18)';
      g2.beginPath(); g2.roundRect(CHUTE_BX, by2, CHUTE_BW, CHUTE_BH, 13); g2.fill();
    }
    if (hi || pulse > 0 || popT > 0) {
      g2.fillStyle = popT > 0 ? (reduceMotion ? 'rgba(255,255,255,.45)' : (blink ? 'rgba(255,225,77,.45)' : 'rgba(255,255,255,.55)'))
        : (hi ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.45)');
      g2.beginPath(); g2.roundRect(CHUTE_BX, by2, CHUTE_BW, CHUTE_BH, 13); g2.fill();
    }
    g2.strokeStyle = popT > 0 ? ((reduceMotion || blink) ? '#FFE14D' : '#FFFFFF')
      : ((hi || pulse > 0) ? '#FFFFFF' : 'rgba(29,29,29,.24)');
    g2.lineWidth = (hi || popT > 0) ? 3.5 : 2;
    g2.beginPath(); g2.roundRect(CHUTE_BX, by2, CHUTE_BW, CHUTE_BH, 13); g2.stroke();

    if (q) {
      g2.strokeStyle = '#32A658'; g2.lineWidth = 2.8; g2.setLineDash([8, 6]);
      g2.beginPath(); g2.roundRect(CHUTE_BX - 3, by2 - 3, CHUTE_BW + 6, CHUTE_BH + 6, 15);
      g2.stroke(); g2.setLineDash([]);
    }
    if (match || (!S.revealed && carrying && !S.cmd)) {
      g2.strokeStyle = 'rgba(255,255,255,' + (reduceMotion ? 0.75 : (0.4 + 0.5 * Math.abs(Math.sin(S.t * 3.5)))) + ')';
      g2.lineWidth = 3;
      g2.beginPath(); g2.roundRect(CHUTE_BX - 3, by2 - 3, CHUTE_BW + 6, CHUTE_BH + 6, 15); g2.stroke();
    }

    g2.save(); g2.globalAlpha = 1;
    const iconY = by2 + CHUTE_BH / 2;
    if (S.catDual && S.catDual[f]) {
      const prog = (popT > 0 && !reduceMotion) ? Math.min(1, popElapsed / 1.4) : 1;
      const slide = Math.min(1, prog / 0.28);
      const ease = 1 - Math.pow(1 - slide, 3);
      const x0 = CHUTE_BX + 32 - 9 * ease;
      const s0 = 0.90 - 0.12 * ease;
      const x1 = CHUTE_BX + 32 + 24 * ease;
      const s1 = prog < 0.24 ? (0.2 + (prog / 0.24) * 0.88)
        : prog < 0.65 ? (0.78 + 0.30 * Math.abs(Math.cos((prog - 0.24) / 0.41 * Math.PI))) : 0.78;
      drawIconBadge(g2, f, x0, iconY, s0, 0);
      if (popT > 0) {
        g2.strokeStyle = (reduceMotion || blink) ? '#FFE14D' : '#FFFFFF';
        g2.lineWidth = 3;
        g2.beginPath(); g2.arc(x1, iconY, (GIFT_R + 5) * s1, 0, 7); g2.stroke();
      }
      drawIconBadge(g2, f, x1, iconY, s1, 1);
      g2.restore();
      g2.fillStyle = cat.ink; g2.textAlign = 'left';
      drawFitText(g2, CAT_UPPER[f], CHUTE_BX + 62 + 16 * ease, cyy + 5, 134 - 16 * ease, 14, 9);
    } else {
      drawIconBadge(g2, f, CHUTE_BX + 32, iconY, 0.9, 0);
      g2.restore();
      g2.fillStyle = cat.ink; g2.textAlign = 'left';
      drawFitText(g2, CAT_UPPER[f], CHUTE_BX + 62, cyy + 5, 134, 14, 9);
    }
  }
}

function drawLines(g2, S, floors, sleighTargetVal) {
  g2.lineCap = 'round'; g2.lineJoin = 'round';
  for (let f = 4; f >= 0; f--) drawSorter(g2, S, f, f < floors);

  drawDrift(g2, BIN_X - 37, BIN_X + 37, BIN_Y - 18, S.snowDepth * 0.85, false);
  g2.strokeStyle = '#FFFFFF'; g2.lineWidth = 2.6; g2.lineCap = 'round';
  g2.beginPath(); g2.moveTo(BIN_X - 9, BIN_Y + 2); g2.lineTo(BIN_X, BIN_Y - 7);
  g2.lineTo(BIN_X + 9, BIN_Y + 2); g2.stroke();
  g2.beginPath(); g2.moveTo(BIN_X, BIN_Y - 7); g2.lineTo(BIN_X, BIN_Y + 9); g2.stroke();

  const frac = Math.min(1, S.recycled / TUNE.recycleLimit);
  const fw = 84, fh = 9, fx = BIN_X - fw / 2, fy = BIN_Y - 38;
  g2.fillStyle = 'rgba(255,255,255,.9)'; g2.beginPath(); g2.roundRect(fx, fy, fw, fh, 5); g2.fill();
  g2.fillStyle = frac > 0.75 ? '#FF3333' : frac > 0.5 ? '#FF7733' : '#32A658';
  g2.beginPath(); g2.roundRect(fx, fy, Math.max(3, fw * frac), fh, 5); g2.fill();
  g2.font = "bold 13px 'Google Sans',sans-serif"; g2.textAlign = 'center';
  g2.strokeStyle = 'rgba(15,23,42,.75)'; g2.lineWidth = 3;
  g2.strokeText(S.recycled + ' / ' + TUNE.recycleLimit, BIN_X, BIN_Y + 22);
  g2.fillStyle = '#FFFFFF';
  g2.fillText(S.recycled + ' / ' + TUNE.recycleLimit, BIN_X, BIN_Y + 22);

  const SK = 1.1, sw = PROPS.sleigh.w * SK, sh = PROPS.sleigh.h * SK;
  const sx = SLEIGH_X - sw / 2, sy = SLEIGH_Y + 36 - sh;
  if (S.mode === 'hitch' && PROPS.santa.img.complete) g2.drawImage(PROPS.santa.img, sx, sy, sw, sh);
  for (let i = 0; i < Math.min(S.inSleigh, 12); i++) {
    drawWrapped(g2, SLEIGH_X - 22 + (i % 4) * 20, SLEIGH_Y - 12 - Math.floor(i / 4) * 14, 0.38, CATS[i % 5].color);
  }
  if (PROPS.sleigh.img.complete) g2.drawImage(PROPS.sleigh.img, sx, sy, sw, sh);

  g2.fillStyle = 'rgba(255,255,255,.96)'; g2.strokeStyle = '#D92626';
  g2.lineWidth = 1.8;
  g2.beginPath(); g2.roundRect(SLEIGH_X - 25, SLEIGH_Y + 3, 50, 18, 9);
  g2.fill(); g2.stroke();
  g2.textAlign = 'center'; g2.fillStyle = '#1D1D1D';
  g2.font = "bold 13px 'Google Sans',sans-serif";
  g2.fillText(S.inSleigh + ' / ' + sleighTargetVal, SLEIGH_X, SLEIGH_Y + 16);
  const m = Math.min(1 + Math.floor(S.combo / TUNE.comboStep), TUNE.comboMax);
  if (m > 1) {
    g2.fillStyle = 'rgba(255,255,255,.96)'; g2.strokeStyle = '#E7AD03';
    g2.lineWidth = 1.8;
    g2.beginPath(); g2.roundRect(SLEIGH_X - 25, SLEIGH_Y + 24, 50, 18, 9);
    g2.fill(); g2.stroke();
    g2.fillStyle = '#E7AD03'; g2.font = "bold 12px 'Google Sans',sans-serif";
    g2.fillText('✨ x' + m, SLEIGH_X, SLEIGH_Y + 37);
  }
  g2.textAlign = 'left';
  drawReindeer(g2, S);
}

function drawSnow(g2, S) {
  if (S.snowAmt < 0.01) return;
  g2.save();
  const n = Math.min(S.snow.length, Math.round(S.snow.length * (0.12 + S.snowAmt * 0.36)));
  for (let i = 0; i < n; i++) {
    const s = S.snow[i];
    const alpha = Math.min(1, s.a * (0.55 + S.snowAmt * 0.45));
    g2.globalAlpha = alpha;
    if (s.crystal && s.r > 2.2) {
      g2.strokeStyle = '#FFFFFF';
      g2.lineWidth = 1.3;
      g2.lineCap = 'round';
      g2.beginPath();
      g2.moveTo(s.x - s.r, s.y); g2.lineTo(s.x + s.r, s.y);
      g2.moveTo(s.x, s.y - s.r); g2.lineTo(s.x, s.y + s.r);
      const d = s.r * 0.65;
      g2.moveTo(s.x - d, s.y - d); g2.lineTo(s.x + d, s.y + d);
      g2.moveTo(s.x - d, s.y + d); g2.lineTo(s.x + d, s.y - d);
      g2.stroke();
    } else if (s.large) {
      g2.fillStyle = 'rgba(224,242,254,0.45)';
      g2.beginPath(); g2.arc(s.x, s.y, s.r + 1.8, 0, 7); g2.fill();
      g2.fillStyle = '#FFFFFF';
      g2.beginPath(); g2.arc(s.x, s.y, s.r, 0, 7); g2.fill();
    } else {
      g2.fillStyle = '#FFFFFF';
      g2.beginPath(); g2.arc(s.x, s.y, s.r, 0, 7); g2.fill();
    }
  }
  g2.restore();
}

function drawWind(g2, S, g) {
  if (g.state === 'belt' && g.x < 18) return;
  const k = 1 - Math.abs(S.gustT / GUST.dur - 0.5) * 2;
  g2.save(); g2.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const off = (i - 3) * 6.5;
    const ph = (S.t * 2.4 + i * 0.31) % 1;
    const taper = 1 - Math.abs(off) / 22;
    const len = (14 + 34 * taper) * (0.6 + 0.4 * Math.sin(S.t * 9 + i));
    const x = g.x - 20 - ph * 20;
    g2.globalAlpha = 0.85 * k * taper * (1 - ph * 0.55);
    g2.strokeStyle = i % 3 ? '#C1E8ED' : '#FFFFFF';
    g2.lineWidth = 1 + 2 * taper;
    g2.beginPath();
    g2.moveTo(x - len, g.y + off + Math.sin(S.t * 7 + i * 1.4) * 2);
    g2.lineTo(x, g.y + off * 0.75);
    g2.stroke();
  }
  g2.fillStyle = '#FFFFFF';
  for (let i = 0; i < 6; i++) {
    const ph = (S.t * 1.9 + i * 0.17) % 1;
    g2.globalAlpha = k * (1 - ph) * 0.95;
    g2.beginPath();
    g2.arc(g.x - 46 + ph * 58, g.y - 15 + i * 6 + Math.sin(S.t * 8 + i * 2) * 4,
      1.5 + (i % 2), 0, 7);
    g2.fill();
  }
  g2.restore();
}

function drawGust(g2, S) {
  if (S.gustT <= 0 || reduceMotion) return;
  const front = gustFront(S);
  const k = Math.min(1, S.gustT / (GUST.dur * 0.4));
  g2.save(); g2.lineCap = 'round';
  for (let i = 0; i < 64; i++) {
    const y = (i * 149) % (H - 20) + 10;
    const len = 60 + (i % 5) * 44;
    const x = ((S.t * 800 + i * 97) % (W + 520)) - 260;
    if (x > front) continue;
    const near = Math.max(0, 1 - (front - x) / 400);
    g2.globalAlpha = 0.85 * k * (0.2 + near * 0.8);
    g2.strokeStyle = i % 4 ? '#C1E8ED' : '#FFFFFF';
    g2.lineWidth = 2 + (i % 3) * 1.4;
    g2.beginPath(); g2.moveTo(x - len, y); g2.lineTo(x, y + 2); g2.stroke();
  }
  if (front < W + 60) {
    const gl = g2.createLinearGradient(front - 100, 0, front + 8, 0);
    gl.addColorStop(0, 'rgba(224,242,254,0)');
    gl.addColorStop(1, 'rgba(255,255,255,.7)');
    g2.globalAlpha = 0.55 * k;
    g2.fillStyle = gl; g2.fillRect(front - 100, 0, 108, H);
  }
  g2.globalAlpha = 0.12 * k; g2.fillStyle = '#BFDBFE';
  g2.fillRect(viewX0 - 40, viewY0 - 40, (viewX1 - viewX0) + 80, (viewY1 - viewY0) + 80);
  g2.restore();
}

function pxs(g2, x, y, w, h, c) {
  g2.fillStyle = c;
  g2.fillRect(Math.round(x) * PXS, Math.round(y) * PXS, Math.round(w) * PXS, Math.round(h) * PXS);
}

function sprite(g2, grid, ox, oy, z) {
  for (let j = 0; j < grid.length; j++) {
    const row = grid[j];
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch !== '.') pxs(g2, ox + i * z, oy + j * z, z, z, PXC[ch]);
    }
  }
}

function drawTakeoff(g2, S, t) {
  const tx0 = viewX0 - 40, ty0 = viewY0 - 40, tw = (viewX1 - viewX0) + 80, th = (viewY1 - viewY0) + 80;
  g2.fillStyle = '#3A068D'; g2.fillRect(tx0, ty0, tw, th);
  g2.fillStyle = '#4802B8'; g2.fillRect(tx0, 380, tw, 150);
  g2.fillStyle = '#2A56AD'; g2.fillRect(tx0, 530, tw, Math.max(170, viewY1 + 40 - 530));

  for (let i = 0; i < 150; i++) {
    const x = (i * 47 + 13) % CWS, y = (i * 29 + 7) % 150;
    if (i % 7 === 0) {
      const twk = Math.sin(t * 3 + i) > 0.2;
      if (!twk) continue;
      pxs(g2, x, y, 1, 1, '#FFFFFF');
    } else pxs(g2, x, y, 1, 1, i % 4 ? '#FFFFFF' : '#9FCEFF');
  }

  for (let dy = -MOON_R; dy <= MOON_R; dy++) {
    const w = Math.floor(Math.sqrt(MOON_R * MOON_R - dy * dy));
    pxs(g2, MOON_X - w, MOON_Y + dy, 2 * w, 1, '#FFF8BD');
  }
  pxs(g2, MOON_X - 6, MOON_Y - 5, 4, 3, '#F9D231');
  pxs(g2, MOON_X + 3, MOON_Y + 4, 3, 2, '#F9D231');
  pxs(g2, MOON_X + 1, MOON_Y - 8, 2, 2, '#F9D231');
  const SPK = [[-19,-11],[17,-14],[21,7],[-16,10],[2,-20],[-6,19]];
  for (let i = 0; i < SPK.length; i++) {
    const ph = Math.sin(t * 2.4 + i * 1.7);
    if (ph < 0.1) continue;
    const arm = 1 + Math.round(ph * 2.4);
    const sx = MOON_X + SPK[i][0], sy = MOON_Y + SPK[i][1];
    const c = i % 2 ? '#FFFFFF' : '#FFF8BD';
    pxs(g2, sx - arm, sy, arm * 2 + 1, 1, c);
    pxs(g2, sx, sy - arm, 1, arm * 2 + 1, c);
  }

  for (let i = 0; i < CITY_FAR.length; i++) {
    const b = CITY_FAR[i];
    pxs(g2, b[0], GYS - b[2], b[1], b[2], '#4802B8');
    pxs(g2, b[0], GYS - b[2], b[1], 1, '#7A037E');
  }
  for (let i = 0; i < CITY.length; i++) {
    const x = CITY[i][0], w = CITY[i][1], h = CITY[i][2], col = CITY[i][3];
    const y = GYS - h;
    pxs(g2, x, y, w, h, col);
    pxs(g2, x, y, w, 2, '#FFFFFF');
    for (let ry = y + 5; ry < GYS - 4; ry += 7) {
      for (let rx = x + 3; rx < x + w - 3; rx += 6) {
        const lit = ((rx * 7 + ry * 13 + i) % 5) !== 0;
        pxs(g2, rx, ry, 2, 2, lit ? '#FFE14D' : '#4802B8');
      }
    }
  }
  pxs(g2, 48, GYS - 72, 4, 10, '#B71C1C'); pxs(g2, 49, GYS - 76, 2, 4, '#FFE14D');
  pxs(g2, 130, GYS - 74, 6, 8, '#048490'); pxs(g2, 132, GYS - 78, 2, 4, '#FF3333');

  g2.fillStyle = '#FFFFFF'; g2.fillRect(tx0, GYS * PXS, tw, Math.max((CHS - GYS) * PXS, viewY1 + 40 - GYS * PXS));
  g2.fillStyle = '#C1E8ED'; g2.fillRect(tx0, GYS * PXS, tw, PXS);
  const PINES = [[10,9],[40,6],[74,10],[112,7],[150,11],[188,6],[222,9],[258,7],[288,10]];
  for (let i = 0; i < PINES.length; i++) {
    const tx = PINES[i][0], th = PINES[i][1];
    for (let r = 0; r < th; r++) pxs(g2, tx - r, GYS + 4 + r, 1 + r * 2, 1, '#0A7749');
    pxs(g2, tx, GYS + 4 + th, 1, 3, '#584539');
  }
  for (let i = 0; i < 7; i++) {
    const mx = 4 + i * 44;
    pxs(g2, mx, CHS - 10, 30, 10, '#FFFFFF');
    pxs(g2, mx + 4, CHS - 12, 22, 2, '#FFFFFF');
  }

  if (!reduceMotion) {
    for (let i = 0; i < 130; i++) {
      const sp = 1 + (i % 3) * 0.5;
      const x = Math.floor((i * 53 + 11 + t * 4 * sp) % CWS);
      const y = Math.floor((i * 37 + 19 + t * 26 * sp) % CHS);
      pxs(g2, x, y, 1, 1, i % 5 ? '#FFFFFF' : '#9FCEFF');
    }
  }

  const k = Math.min(t / 3.4, 1);
  const p = takeoffPath(k);
  for (let i = 1; i < 30; i++) {
    const q = takeoffPath(k - i * 0.028);
    if (q.x <= 6) break;
    pxs(g2, q.x - 2, q.y + 30 + Math.round(Math.sin(i * 0.6 + t * 4) * 3), 1, 1,
      i % 3 ? '#FFE14D' : '#FFFFFF');
  }
  const gallop = (!reduceMotion && Math.floor(t * 9) % 2) ? SPR_DEER_B : SPR_DEER_A;
  const TEAM = [[54,-14],[88,-32],[122,-50]];
  for (let i = 0; i < TEAM.length; i++) {
    sprite(g2, gallop, p.x + TEAM[i][0], p.y + TEAM[i][1], 2);
  }
  for (let i = 0; i < 60; i++) {
    pxs(g2, p.x + 46 + i, p.y + 16 - Math.round(i * 0.52), 1, 1, '#7C5539');
  }
  sprite(g2, SPR_SLEIGH, p.x, p.y, 2);

  if (t > 2.2) {
    const on = reduceMotion || Math.floor(t * 2.5) % 2 === 0 || t > 3.4;
    if (on) {
      const stars = Math.max(1, Math.min(3, (S && S.stars) || 3));
      const starStr = '★★★☆☆'.slice(3 - stars, 6 - stars).split('').join(' ');
      g2.textAlign = 'center';
      g2.font = "400 64px Lobster, 'Google Sans', cursive";
      g2.lineJoin = 'round';
      g2.strokeStyle = '#1D1D1D'; g2.lineWidth = 14;
      g2.strokeText(ENDING.big, W / 2, H * 0.60, 820);
      g2.fillStyle = '#FFE14D';
      g2.fillText(ENDING.big, W / 2, H * 0.60, 820);
      g2.font = "bold 20px 'Google Sans',sans-serif";
      g2.strokeStyle = '#1D1D1D'; g2.lineWidth = 7;
      g2.strokeText(ENDING.small, W / 2, H * 0.60 + 34, 820);
      g2.fillStyle = '#FFFFFF';
      g2.fillText(ENDING.small, W / 2, H * 0.60 + 34, 820);
      g2.font = "bold 36px 'Google Sans',sans-serif";
      g2.strokeStyle = '#1D1D1D'; g2.lineWidth = 9;
      g2.strokeText(starStr, W / 2, H * 0.60 + 78);
      g2.fillStyle = '#FF7733';
      g2.fillText(starStr, W / 2, H * 0.60 + 78);
      g2.textAlign = 'left';
    }
  }
}

function drawTutorial(g2, S) {
  const st = TUT[S.tut - 1]; if (!st) return;
  const r = tutHole(st.hole), pulse = reduceMotion ? 1 : (0.5 + 0.5 * Math.sin(S.t * 3.5));
  g2.save();
  g2.fillStyle = 'rgba(2,6,23,.66)'; g2.beginPath();
  g2.rect(viewX0 - 40, viewY0 - 40, (viewX1 - viewX0) + 80, (viewY1 - viewY0) + 80);
  if (r) g2.roundRect(r[0], r[1], r[2], r[3], 14);
  g2.fill('evenodd');
  if (r) {
    g2.strokeStyle = '#FDE047'; g2.lineWidth = 3 + 2 * pulse;
    g2.beginPath(); g2.roundRect(r[0], r[1], r[2], r[3], 14); g2.stroke();
  }
  const bw = 620, maxW = bw - 44;
  const tFont = st.t && st.t.length > 38 ? "bold 22px 'Google Sans',sans-serif" : "bold 25px 'Google Sans',sans-serif";
  g2.font = tFont;
  const tLines = st.t ? wrapText(g2, st.t, maxW) : [];
  const bFont = "18.5px 'Google Sans',sans-serif";
  g2.font = bFont;
  const bLines = [];
  for (const ln of (st.b || [])) { if (ln) bLines.push(...wrapText(g2, ln, maxW)); }
  const fTxt = TUT_FOOTERS[st.go] || '';
  const bStep = bLines.length > 3 ? 22 : 25;
  let contentH = tLines.length * 28;
  if (st.treats) contentH += (tLines.length ? 10 : 0) + 52;
  if (bLines.length) contentH += ((tLines.length || st.treats) ? 12 : 0) + bLines.length * bStep;
  if (fTxt) contentH += ((tLines.length || st.treats || bLines.length) ? 14 : 0) + 18;
  const padY = (bLines.length > 3 || (st.treats && tLines.length > 1)) ? 14 : 20;
  const bh = Math.max(76, contentH + padY * 2);
  let by = st.treats ? 48 : Math.max(52, Math.round(135 - bh / 2));
  if (r && r[1] > 250 && by + bh > r[1] - 34) by = Math.max(12, r[1] - 34 - bh);
  g2.fillStyle = 'rgba(15,23,42,.96)'; g2.strokeStyle = '#38BDF8'; g2.lineWidth = 2;
  g2.beginPath(); g2.roundRect(W / 2 - bw / 2, by, bw, bh, 18); g2.fill(); g2.stroke();
  g2.textAlign = 'center';
  let cy = by + (bh - contentH) / 2;
  if (tLines.length) {
    g2.fillStyle = '#FDE047'; g2.font = tFont;
    for (const ln of tLines) { g2.fillText(ln, W / 2, cy + 21); cy += 28; }
  }
  if (st.treats) {
    if (tLines.length) cy += 10;
    drawIconBadge(g2, 2, W / 2 - 34, cy + 26, 1.2, 0);
    drawIconBadge(g2, 2, W / 2 + 34, cy + 26, 1.2, 1);
    cy += 52;
  }
  if (bLines.length) {
    if (tLines.length || st.treats) cy += 12;
    g2.fillStyle = '#F8FAFC'; g2.font = bFont;
    for (const ln of bLines) { g2.fillText(ln, W / 2, cy + 18); cy += bStep; }
  }
  if (fTxt) {
    if (tLines.length || st.treats || bLines.length) cy += 14;
    g2.fillStyle = '#7DD3FC'; g2.font = "bold 14px 'Google Sans',sans-serif";
    g2.globalAlpha = 0.6 + 0.4 * pulse;
    g2.fillText(fTxt, W / 2, cy + 14);
    g2.globalAlpha = 1;
  }
  if (r && r[1] > 250) {
    const ax = r[0] + r[2] / 2, ay = r[1] - 12 - 8 * (reduceMotion ? 0.5 : pulse);
    g2.fillStyle = '#FDE047';
    g2.beginPath(); g2.moveTo(ax - 14, ay - 18); g2.lineTo(ax + 14, ay - 18); g2.lineTo(ax, ay); g2.closePath();
    g2.fill();
  }
  g2.restore(); g2.textAlign = 'left';
}

export function renderScene(S, elfChoice, floors, sleighTargetVal, canCatch) {
  if (S.mode === 'takeoff' || (S.mode === 'over' && S.won)) {
    drawTakeoff(cx, S, S.takeoff);
    return;
  }

  cx.save();
  if (S.shake > 0 && !reduceMotion) {
    cx.translate((Math.random() - 0.5) * S.shake * 14, (Math.random() - 0.5) * S.shake * 14);
  }

  drawBackdrop(cx);
  if (bgReady) cx.drawImage(BG, 0, 0, W, H);

  drawDrift(cx, viewX0 - 20, viewX1 + 20, GROUND_Y + 8, S.snowDepth, true);
  drawLines(cx, S, floors, sleighTargetVal);
  drawWorkshop(cx, S, floors);

  const front = gustFront(S);
  for (const g of S.gifts) {
    if (g.state === 'carried') continue;
    if (S.gustT > 0 && g.state === 'belt' && g.x < front) drawWind(cx, S, g);
    drawGift(cx, g);
  }
  drawElf(cx, S.elf, elfChoice);
  if (S.elf.carrying) drawGift(cx, S.elf.carrying);

  if (!S.elf.carrying && canCatch && S.catchFlash <= 0) {
    const r = 26 + (reduceMotion ? 4 : Math.abs(Math.sin(S.t * 3.5)) * 8);
    cx.strokeStyle = '#FF7733'; cx.lineWidth = 4;
    cx.beginPath(); cx.arc(S.elf.x, carryY(S.elf.floor), r, 0, 7); cx.stroke();
  }
  if (S.catchFlash > 0) {
    cx.strokeStyle = 'rgba(245,166,35,' + S.catchFlash * 2.5 + ')'; cx.lineWidth = 5;
    cx.beginPath();
    cx.arc(S.elf.x, carryY(S.elf.floor), 26 + (0.3 - S.catchFlash) * 85, 0, 7); cx.stroke();
  }

  for (const p of S.fx) {
    cx.globalAlpha = Math.max(0, 1 - p.age / p.life); cx.fillStyle = p.color;
    if (p.star) {
      const z = p.r * 1.6;
      cx.beginPath();
      cx.moveTo(p.x, p.y - z); cx.lineTo(p.x + z * 0.3, p.y); cx.lineTo(p.x + z, p.y);
      cx.lineTo(p.x + z * 0.3, p.y + z * 0.3); cx.lineTo(p.x, p.y + z);
      cx.lineTo(p.x - z * 0.3, p.y + z * 0.3); cx.lineTo(p.x - z, p.y);
      cx.lineTo(p.x - z * 0.3, p.y);
      cx.closePath(); cx.fill();
    } else {
      cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fill();
    }
  }
  cx.globalAlpha = 1;

  drawSnow(cx, S);
  drawGust(cx, S);

  if (S.hint > 0) {
    cx.globalAlpha = Math.min(1, S.hint / 2);
    cx.textAlign = 'center';
    cx.font = "bold 14px 'Google Sans',sans-serif";
    const hy = GROUND_Y - 92 - (reduceMotion ? 0 : Math.abs(Math.sin(S.t * 3)) * 6);
    const htxt = S.elf.carrying ? HINT_CHUTE : HINT_CATCH;
    const hLines = wrapText(cx, htxt, 380);
    cx.strokeStyle = '#FFFFFF'; cx.lineWidth = 4; cx.lineJoin = 'round';
    cx.fillStyle = '#D92626';
    for (let i = 0; i < hLines.length; i++) {
      const ly = hy - (hLines.length - 1 - i) * 18;
      cx.strokeText(hLines[i], 300, ly);
      cx.fillText(hLines[i], 300, ly);
    }
    cx.textAlign = 'left'; cx.globalAlpha = 1;
  }

  drawTutorial(cx, S);
  cx.restore();
}
