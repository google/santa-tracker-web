// import CONFIG from '../../SceneManager/config'

class Lights {
  constructor(scene) {
    // const light = new THREE.SpotLight(0xffffff, 2.0, 0, 100)
    // light.castShadow = true
    // light.position.set(0, 200, 200)
    // scene.add(light)
    // if (CONFIG.SHOW_HELPERS) {
    //   const helper = new THREE.SpotLightHelper(light, 5)
    //   scene.add(helper)
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
