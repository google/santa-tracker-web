class Lights {
  constructor(scene) {
    const light = new THREE.SpotLight(0xbbbbbb, 0.2, 0, 100)
    // light.castShadow = true
    light.position.set(-250, 250, -300) // 300, 200, -300
    scene.add(light)

    scene.spotLight = light

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.85)
    scene.add(hemisphereLight)
  }
}

export default Lights
