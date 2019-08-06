/**
 * @fileoverview Added to the page for embed scenes, so they can play sound directly.
 */

import * as sc from './soundcontroller.js'

sc.installGestureResume(document, true);

document.body.addEventListener('_klang', (ev) => {
  const args = ev.detail;
  const command = args.shift();
  switch (command) {
    case 'fire':
      sc.fire(args[0]);
      break;
    case 'ambient':
      sc.ambient(args[0], args[1]);
      break;
    case 'play':
      sc.play(args[0], args[1]);
      break;
    case 'transition':
      sc.transition(...args);
      break;
  }
});
