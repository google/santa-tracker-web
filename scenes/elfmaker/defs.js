import {svg} from '@polymer/lit-element';


export const baseSvgStyle = `
.high1 {fill: #332e2e;}
.high2 {fill: #f9ce1d;}
.eyes {fill: #332e2e;}
.white {fill: #fff;}
.limb {
  fill: none;
  stroke-linecap: round;
  stroke-miterlimit: 10;
  stroke-width: 20px;
}
`;


export const options = {
  'skin': ['skin0', 'skin1', 'skin2', 'skin3', 'skin4'],
  'color': ['red', 'orange', 'yellow', 'green', 'blue', 'cyan', 'indigo', 'purple', 'pink', 'brown'],
  'hair': ['blonde', 'copper', 'strawberry', 'h.red', 'burgundy', 'brunette', 'black'],
};


/**
 * Choose a color from a valid option category.
 *
 * @param {string} category
 * @return {?string}
 */
export function random(category) {
  const o = options[category] || [];
  const choice = ~~(Math.random() * o.length);
  return o[choice] || null;
}


export const colors = {
  // general colors
  'red': ['#FF3333', '#E53935', '#B71C1C', '#F09084'],
  'orange': ['#FF7733', '#FF5107', '#E5420A', '#FBE58C'],
  'yellow': ['#FFE14D', '#F9CE1D', '#F6BE1A', '#FFFE9C'],
  'green': ['#32A658', '#2B994A', '#2A8C4A', '#C6F4CD'],
  'blue': ['#3399FF', '#1976D2', '#1565C0', '#8CB0F9'],
  'cyan': ['#00ACC1', '#008FA1', '#00838F', '#B2EBF2'],
  'indigo': ['#6F00FF', '#5B00EA', '#4C00C4', '#AC8DF8'],
  'purple': ['#AD00AD', '#8E24AA', '#8F0093', '#DC88F5'],
  'pink': ['#EC407A', '#E13059', '#B52C61', '#EE88AA'],
  'brown': ['#5D4037', '#8D6E63', '#8D6E63', '#8D6E63'],

  // skin tones
  'skin0': ['#FADCBC'],
  'skin1': ['#E0BB95'],
  'skin2': ['#BF8F68'],
  'skin3': ['#9B643D'],
  'skin4': ['#584539'],

  // hair colors
  'blonde': ['#F6BE1A', '#F2A33A'],
  'copper': ['#F57C00', '#DF732C' ],
  'strawberry': ['#F47455', '#ED6237' ],
  'h.red': ['#A14343', '#8E3636'],
  'burgundy': ['#843F4A', '#72333F'],
  'brunette': ['#764C2E', '#684127'],
  'black': ['#332E2E', '#211E1E'],
};


export const head = svg`
  <path class="skin" d="M161.48,148.65l-21.81,21.8a11.29,11.29,0,1,0,16,16C169.25,172.79,161.48,148.65,161.48,148.65Z"/>
  <path class="skin" d="M70.33,170.45l-21.81-21.8s-7.77,24.14,5.85,37.76a11.29,11.29,0,1,0,16-16Z"/>
  <circle class="skin" cx="105" cy="178.43" r="42.65"/>
  <path class="eyes" d="M96.39,166.2a8.62,8.62,0,1,1-8.62-8.61A8.63,8.63,0,0,1,96.39,166.2Z"/>
  <path class="white" d="M130.85,183.43a25.85,25.85,0,1,1-51.69,0Z"/>
  <path class="eyes" d="M130.85,166.2a8.62,8.62,0,1,1-8.62-8.61A8.63,8.63,0,0,1,130.85,166.2Z"/>
`;


export const hats = [
  '',
  svg`
<circle class="white" cx="105" cy="57.59" r="14.84"/>
<polygon class="hats" points="147.65 157.59 105 72.43 62.35 157.59 147.65 157.59"/>
<path class="white" d="M145.71,178.2a12.5,12.5,0,0,1-11.92-8.78,30.17,30.17,0,0,0-57.57,0A12.5,12.5,0,0,1,52.36,162a55.17,55.17,0,0,1,105.29,0,12.53,12.53,0,0,1-11.94,16.24Z"/>
`,
svg`
<g transform="translate(0, 6)">
  <path class="hats1" d="M138.8,146.14c0-27.58-16-43.69-33.8-43.69s-33.8,16.11-33.8,43.69Z"/>
  <circle class="white" cx="105" cy="87.61" r="14.84"/>
  <ellipse class="hats" cx="105" cy="165.92" rx="70.33" ry="55.17"/>
</g>
  `,
svg`
<path class="hats" d="M150,169.19c0-37.52-13.66-63-45-63s-45,25.45-45,63Z"/>
<path class="white" d="M145.71,178.21a12.5,12.5,0,0,1-11.92-8.77,30.17,30.17,0,0,0-57.57,0A12.5,12.5,0,1,1,52.36,162a55.17,55.17,0,0,1,105.29,0,12.5,12.5,0,0,1-8.2,15.66A12.77,12.77,0,0,1,145.71,178.21Z"/>
<circle class="white" cx="105" cy="91.38" r="14.84"/>
`,
];
