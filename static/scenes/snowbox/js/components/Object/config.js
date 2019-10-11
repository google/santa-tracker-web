export default {
  HIGHLIGHT_MATERIAL: new THREE.MeshLambertMaterial({ color: 0xc444c4 }),
  SELECTED_MATERIAL: new THREE.MeshLambertMaterial({ color: 0xff00ff }),
  GHOST_MATERIAL: new THREE.MeshPhongMaterial({
    color: 0xff00ff,
    opacity: 0.3,
    transparent: true
  })
}

