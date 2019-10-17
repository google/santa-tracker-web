import GLOBAL_CONFIG from '../SceneManager/config.js'

export default {
  HIGHLIGHT_MATERIAL: new THREE.MeshBasicMaterial({ color: GLOBAL_CONFIG.COLORS.ICE }),
  SELECTED_MATERIAL: new THREE.MeshBasicMaterial({ color: GLOBAL_CONFIG.COLORS.ICE }),
  GHOST_MATERIAL: new THREE.MeshPhongMaterial({
    color: GLOBAL_CONFIG.COLORS.ICE,
    opacity: 0.3,
    transparent: true
  })
}
