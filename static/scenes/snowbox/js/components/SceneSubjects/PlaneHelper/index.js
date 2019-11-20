import GLOBAL_CONFIG from '../../Scene/config.js'

export default class PlaneHelper {
  constructor(scene) {
    // Help moving object with the mouse always in the center of the object
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.2, visible: GLOBAL_CONFIG.DEBUG })
    const geometry = new THREE.PlaneGeometry(50, 50, 1, 1)

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.y = 1
    this.mesh.rotation.x = -Math.PI / 2

    scene.add(this.mesh)
  }
}
