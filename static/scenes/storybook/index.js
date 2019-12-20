import api from '../../src/scene/api.js';
import Storybook from './js/storybook.js';

api.preload.sounds('storybook_load_sounds');

const touchEnabled = function() {
  if ('standalone' in navigator) {
    return true;  // iOS devices
  }
  const hasCoarse = window.matchMedia('(pointer: coarse)').matches;
  if (hasCoarse) {
    return true;  // true-ish
  }
  const hasPointer = window.matchMedia('(pointer: fine)').matches;
  if (hasPointer) {
    return false;  // prioritize mouse control
  }

  // Otherwise, fall-back to older style mechanisms.
  return ('ontouchstart' in window) ||
      window.DocumentTouch && document instanceof window.DocumentTouch;
}

const generateImages = function(device, ext, size) {
  const images = [];

  for (let i = 1; i < size + 1; i++) {
    images.push(`img/${device}/chapter-${i}.${ext}`);
  }

  return images;
}

let images

if (touchEnabled()) {
  // preload svgs
  if (window.innerWidth > 768) {
    images = generateImages('desktop', 'svg', 22);
  } else {
    images = generateImages('mobile', 'svg', 22);
  }
} else {
  // preload images for canvas
  images = generateImages('desktop', 'jpg', 22);
}

api.preload.images(...images);

api.config({
  sound: ['storybook_start'],
});

api.ready(async () => {
  new Storybook(document.getElementById('module-storybook'), touchEnabled);
});
