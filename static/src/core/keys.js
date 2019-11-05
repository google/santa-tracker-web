
/**
 * Configures key and gamepad handlers for the host frame.
 */
export default function configureCustomKeys() {
  const keycodeMap = {
    ' ': 32,
    'PageUp': 33,
    'PageDown': 34,
    'End': 35,
    'Home': 36,
    'Left': 37,
    'Up': 38,
    'Right': 39,
    'Down': 40,
    'ArrowLeft': 37,
    'ArrowUp': 38,
    'ArrowRight': 39,
    'ArrowDown': 40,
  };

  document.body.addEventListener('keydown', (ev) => {
    // Steal gameplay key events from the host frame and focus on the loader. Dispatch a fake event
    // to the scene so that the keyboard feels fluid.
    const code = keycodeMap[ev.key];
    if (!code) {
      return false;  // not part of map, just ignore
    }

    const {control} = global.getState();
    if (control) {
      control.send({type: 'keydown', payload: {key: ev.key, keyCode: code}});
    }
    ev.preventDefault();
    loaderElement.focus();
  });

  // These are vague estimates (in ms) for gamepad emulation. We can't get the system's repeat rate
  // config, short of stealing it when a user presses a key.
  const initialRepeat = 400;
  const followingRepeat = 50;

  const gamepads = {};
  const buttonsActive = {};
  let lastTimestamp = 0;

  /**
   * Queued to trigger repeat keystrokes. Queues another stroke if the control is still active.
   *
   * @param {string} key to repeat send
   */
  function repeatKey(key) {
    const {control, hidden} = global.getState();
    if (!control || hidden) {
      return false;
    }

    // TODO: could be combined with a rAF.
    buttonsActive[key] = window.setTimeout(() => repeatKey(key), followingRepeat);
    const payload = {
      key,
      keyCode: keycodeMap[key],
      repeat: true,
    };
    control.send({type: 'keydown', payload});
  }

  function gamepadLoop() {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3] || null;
    if (!gp) {
      return;
    }
    window.requestAnimationFrame(gamepadLoop);

    // TODO(samthor): We only look at the 1st gamepad. What if we have multiplayer games?
    if (gp.timestamp === lastTimestamp) {
      return;
    }
    lastTimestamp = gp.timestamp;

    const buttonsDown = {};

    const buttonPressed = (index) => (gp.buttons[index] && gp.buttons[index].pressed);
    const enableIfPressed = (index, key) => {
      if (buttonPressed(index)) {
        buttonsDown[key] = true;
      }
    };

    const {control, hidden} = global.getState();
    if (control && !hidden) {
      const threshold = 0.2;

      // ... only look for events if there's something to control and page is visible
      const leftright = gp.axes[0];
      if (leftright < -threshold) {
        buttonsDown['ArrowLeft'] = true;
      } else if (leftright > +threshold) {
        buttonsDown['ArrowRight'] = true;
      }
      const updown = gp.axes[1];
      if (updown < -threshold) {
        buttonsDown['ArrowUp'] = true;
      } else if (updown > +threshold) {
        buttonsDown['ArrowDown'] = true;
      }

      enableIfPressed(0, ' ');
      enableIfPressed(12, 'ArrowUp');
      enableIfPressed(13, 'ArrowDown');
      enableIfPressed(14, 'ArrowLeft');
      enableIfPressed(15, 'ArrowRight');
    }

    for (const key in buttonsDown) {
      if (!(key in buttonsActive)) {
        // Wasn't previously pressed, dispatch keydown.
        const keyCode = keycodeMap[key] || 0;
        control && control.send({type: 'keydown', payload: {key, keyCode, repeat: false}});

        // ... and enqueue repeat
        buttonsActive[key] = window.setTimeout(() => repeatKey(key), initialRepeat);
      }
    }
    for (const key in buttonsActive) {
      if (key in buttonsDown) {
        continue;
      }
      // Was previously pressed, dispatch keyup!
      const keyCode = keycodeMap[key] || 0;
      control && control.send({type: 'keyup', payload: {key, keyCode, repeat: true}});

      // ... and clear repeat timer
      window.clearTimeout(buttonsActive[key]);
      delete buttonsActive[key];
    }
  }

  function gamepadHandler(event) {
    const connecting = event.type === 'gamepadconnected';
    const gamepad = event.gamepad;

    const count = Object.keys(gamepads).length;
    if (connecting) {
      gamepads[gamepad.index] = gamepad;
      if (count === 0) {
        gamepadLoop();  // kick off listener if there are any gamepads
      }
    } else {
      delete gamepads[gamepad.index];
    }
  }

  window.addEventListener('gamepadconnected', gamepadHandler);
  window.addEventListener('gamepaddisconnected', gamepadHandler);
}