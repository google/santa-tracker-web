/**
 * @fileoverview Added to the page for embed scenes, so they can play sound directly.
 */

import * as sc from './soundcontroller.js'

sc.installGestureResume(document, true);

document.body.addEventListener('_klang', (ev) => {
  const args = ev.detail;
  switch (args[0]) {
    case 'fire':
      sc.fire(args[1]);
      break;
    case 'ambient':
      sc.ambient(args[1], args[2]);
      break;
    case 'play':
      sc.play(args[1]);
      break;
  }
});
