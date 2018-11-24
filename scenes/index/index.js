import api from '../../src/scene/api.js';
import '../../src/elements/santa-weather.js';
import '../../src/elements/santa-image-mask.js';
import './elements/village-countdown.js';

const offset = {x: 0, y: 0};
let previousPointer = null;

const container = document.getElementById('village-container');
const scroll = document.getElementById('village-scroll');

function updateOffset(delta) {
  const scrollSize = scroll.getBoundingClientRect();
  const containerSize = container.getBoundingClientRect();

  if (delta) {
    const factor = 2.2;
    offset.x += delta.x / factor;
    offset.y += delta.y / factor;
  }

  const allowed = {
    x: (scrollSize.width - containerSize.width) >> 1,
    y: (scrollSize.height - containerSize.height) >> 1,
  };
  if (Math.abs(offset.x) > allowed.x) {
    offset.x = Math.sign(offset.x) * allowed.x;
  }
  if (Math.abs(offset.y) > allowed.y) {
    offset.y = Math.sign(offset.y) * allowed.y;
  }

  scroll.style.transform = `translate(-50%, -50%) translate(${~~offset.x}px, ${~~offset.y}px)`;
}

function resetPointer() {
  previousPointer = null;
}

scroll.addEventListener('pointermove', (ev) => {
  if (ev.buttons !== 1) {
    return;
  }

  const heldPointer = previousPointer;
  previousPointer = {x: ev.screenX, y: ev.screenY};

  if (heldPointer) {
    const delta = {x: ev.screenX - heldPointer.x, y: ev.screenY - heldPointer.y};
    updateOffset(delta);
  }
});
['pointerup', 'pointerout', 'pointerleave'].forEach((eventName) => {
  scroll.addEventListener(eventName, resetPointer);
});

window.addEventListener('resize', (ev) => updateOffset());

import {Adapter} from '@polymer/broadway/lib/adapter';
import {SANTA_TRACKER_CONTROLLER_URL} from '../../src/app/common.js';

const countdown = document.getElementById('countdown');
const adapter = new Adapter(SANTA_TRACKER_CONTROLLER_URL);

const initialUpdatePromise = new Promise((resolve) => {
  adapter.subscribe((state) => {
    const {api} = state;
    if (!api) {
      return;
    }
    const now = api.now + (+new Date - api.at);
    countdown.time = api.range.start - now;
  });
  resolve();
});


api.preload.wait(initialUpdatePromise);
