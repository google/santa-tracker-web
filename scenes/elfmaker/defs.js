
export const options = {
  'skin': ['skin0', 'skin1', 'skin2', 'skin3', 'skin4'],
  'color': ['red', 'orange', 'yellow', 'green', 'blue', 'cyan', 'indigo', 'purple', 'pink', 'brown'],
  'hair': ['blonde', 'copper', 'strawberry', 'h.red', 'burgundy', 'brunette', 'black'],
};

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


export function random(category) {
  const o = options[category] || [];
  const choice = ~~(Math.random() * o.length);
  return o[choice] || null;
}
