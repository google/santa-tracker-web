import GLOBAL_CONFIG from '../Scene/config.js'
import { DEBUG_MODE } from '../../constants/index.js'


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
  SCALE_FACTOR: 1.1,
  ROTATE_CIRCLE_MATERIAL: new THREE.MeshBasicMaterial({
    color: 0xFFCF51,
    side: THREE.DoubleSide,
    depthTest: false,
    transparent: true,
    opacity: 0.4,
  }),
  HELPER_MATERIAL: new THREE.PointsMaterial({ visible: DEBUG_MODE, color: 0xff000 }),
  Y_POS_LIMIT: -20,
}
