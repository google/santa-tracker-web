export default {
  HIGHLIGHT_MATERIAL: new THREE.MeshLambertMaterial({ color: 0xb3f5ff }),
  SELECTED_MATERIAL: new THREE.MeshLambertMaterial({ color: 0x86edfc }),
  GHOST_MATERIAL: new THREE.MeshPhongMaterial({
    color: 0x86edfc,
    opacity: 0.3,
    transparent: true
  })
}
