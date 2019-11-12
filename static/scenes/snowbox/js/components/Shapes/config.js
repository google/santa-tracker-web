import GLOBAL_CONFIG from '../Scene/config.js'

export default {
  DEBUG: false,
  HIGHLIGHT_MATERIAL: new THREE.MeshPhongMaterial({
    color: GLOBAL_CONFIG.COLORS.HIGHLIGHT
  }),
  DEFAULT_MATERIAL: new THREE.MeshPhongMaterial({
    color: GLOBAL_CONFIG.COLORS.ICE
  }),
  GHOST_MATERIAL: new THREE.MeshPhongMaterial({
    color: GLOBAL_CONFIG.COLORS.GHOST
  }),
  WIREFRAME_COLOR: GLOBAL_CONFIG.COLORS.WIREFRAME,
  SCALE_FACTOR: 1.1,
  ROTATE_CIRCLE_MATERIAL: new THREE.MeshBasicMaterial({
    color: 0xffe14d,
    side: THREE.DoubleSide,
    depthTest: false,
    transparent: true,
    opacity: 0.4,
  }),
  HELPER_MATERIAL: new THREE.PointsMaterial({ visible: GLOBAL_CONFIG.DEBUG, color: 0xff000 }),
  Y_POS_LIMIT: -20,
}
