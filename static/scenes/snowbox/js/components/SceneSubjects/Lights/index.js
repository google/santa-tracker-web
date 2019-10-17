// import CONFIG from '../../SceneManager/config'

class Lights {
  constructor(scene) {
    const light = new THREE.SpotLight(0xffffff, 0.5, 0, 100)
    light.castShadow = true
    light.position.set(300, 200, -300)
    scene.add(light)

    scene.spotLight = light
    // if (CONFIG.SHOW_HELPERS) {
      // const helper = new THREE.SpotLightHelper(light, 5)
      // scene.add(helper)
    // }
    const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9)
    hemisphereLight.castShadow = true
    scene.add(hemisphereLight)
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    // directionalLight.position.set(0, 100, 0)
    // directionalLight.castShadow = true
    // scene.add(directionalLight)
  }

  update() {
    // update
  }
}

export default Lights
