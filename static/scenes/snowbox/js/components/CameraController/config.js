export default {
  ANIMATE_SPEED: 100,
  BOX: 125,
  POSITION: {
    Y: 50,
    Z: 100
  },
  /*
   * ROTATE
   */
  ROTATE: {
    Y: 45,
    XZ: 45 / 2,
    XZ_MIN: 25,
    XZ_MAX: -46,
    SPEED: 800,
    FORCE_ON_WHEEL: 2,
    FORCE_ON_TOUCH: 2.2,
  },
  /*
   * ZOOM
   */
  ZOOM: {
    FOV: 0.6, // 0.6
    START: 2,
    STEPS: 4,
    MAX: 2.5,
    MIN: 0,
    SPEED: 800,
    FORCE: 30,
  },
  /*
   * MOVE ON EDGES
   */
  EDGES_SPEED: 0.15,
  /*
   * CONTROLS
   */
  CONTROLS: {
    MIN: 10,
    MAX: 500,
    MIN_ANGLE: 0,
    MAX_ANGLE: Math.PI,
    KEYS: false,
    PAN: true,
    ROTATE: false,
    DAMPING: true,
    DAMPING_FACTOR: 0.06,
    ZOOM: false
  },
  MOBILE_CONTROLS: {
    MIN: 20,
    MAX: 100,
    MIN_ANGLE: 0,
    MAX_ANGLE: Math.PI / 2 - 0.1,
    ROTATE: true,
    ZOOM: true
  }
}
