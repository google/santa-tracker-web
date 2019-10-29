export default {
  ANIMATE_SPEED: 100,
  POSITION: {
    Y: 40,
    Z: 50
  },
  /*
   * ROTATE
   */
  ROTATE: {
    Y: 45,
    XZ: 45 / 2,
    XZ_MIN: 45,
    XZ_MAX: -46,
    SPEED: 800
  },
  /*
   * ZOOM
   */
  ZOOM: {
    START: 1,
    STEPS: [1.2, 0.8, 0.6, 0.5, 0.4],
    MAX: 2.5,
    MIN: 0,
    SPEED: 800
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
    KEYS: false,
    PAN: true,
    ROTATE: false,
    DAMPING: true,
    DAMPING_FACTOR: 0.06,
    ZOOM: false
  },
  MOBILE_CONTROLS: {
    ROTATE: true,
    ZOOM: true
  }
}
