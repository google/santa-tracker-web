import Obj from '../../Object/index.js'

// Config
import GLOBAL_CONFIG from '../../SceneManager/config.js'
import CONFIG from './config.js'
import { randomIntFromInterval } from '../../../utils/math.js'

class Terrain extends Obj {
  constructor(scene, world) {
    super()
    this.scene = scene
    this.world = world
    this.selectable = CONFIG.SELECTABLE
    this.bodies = []
    this.meshes = []
    this.init()
  }

  init() {
    this.initGround()
  }

  initGround() {
    // Physics
    const shape = new CANNON.Cylinder(CONFIG.PLANE_WIDTH, CONFIG.PLANE_WIDTH * 1.3, 30, 30)
    const body = new CANNON.Body({ mass: 0, shape, material: GLOBAL_CONFIG.NORMAL_MATERIAL })
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    body.position.set(0, -15, 0)
    this.world.addBody(body)
    this.bodies.push(body)

    // Graphics
    const geometry = new THREE.PlaneGeometry(CONFIG.PLANE_WIDTH, CONFIG.PLANE_DEPTH, 1, 1)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color1: {
          value: new THREE.Color(0xffffff)
        },
        color2: {
          value: new THREE.Color(0xc5c5c5)
        }
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;

        varying vec2 vUv;

        void main() {

          gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
        }
      `
    })
    const mesh = new THREE.Mesh(geometry, material)
    material.visible = false
    mesh.castShadow = true
    mesh.receiveShadow = true
    this.scene.add(mesh)
    this.meshes.push(mesh)
    this.mesh = mesh

    // GRID HELPER
    // const gridHelper = new THREE.GridHelper(CONFIG.PLANE_WIDTH, CONFIG.PLANE_WIDTH)
    // this.scene.add(gridHelper)

    const selectedGeometry = new THREE.PlaneGeometry(1, 1)
    const selectedMaterial = new THREE.MeshLambertMaterial({ color: 0x8cf0ff })
    this.selectedMesh = new THREE.Mesh(selectedGeometry, selectedMaterial)
  }

  update() {
    this.meshes.forEach((mesh, index) => {
      mesh.position.copy(this.bodies[index].position)
      mesh.quaternion.copy(this.bodies[index].quaternion)
    })
  }

  addPositionMarker(position) {
    let { x, z } = position

    this.selectedMesh.position.set(x, 0.01, z)
    this.selectedMesh.quaternion.copy(this.bodies[0].quaternion)
    this.scene.add(this.selectedMesh)
  }

  removePositionMarker() {
    this.scene.remove(this.selectedMesh)
  }

  movePositionMarker(x, z) {
    this.selectedMesh.position.set(x, 0.01, z)
  }
}

export default Terrain
