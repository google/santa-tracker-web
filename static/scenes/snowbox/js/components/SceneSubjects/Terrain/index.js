import Obj from '../../Object/index.js'

// Config
import CONFIG from './config.js'
import { randomIntFromInterval } from '../../../helpers.js'

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
    // this.initLevel()
    // this.initWalls()
  }

  initGround() {
    // Physics
    const shape = new CANNON.Plane()
    const body = new CANNON.Body({ mass: 0, shape })
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    body.position.set(0, 0, 0)
    this.world.addBody(body)
    this.bodies.push(body)

    // Graphics
    const geometry = new THREE.PlaneGeometry(CONFIG.PLANE_WIDTH, CONFIG.PLANE_DEPTH, 1, 1)
    const material = new THREE.MeshLambertMaterial({ color: 0xe94057, visible: true })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    this.scene.add(mesh)
    this.meshes.push(mesh)

    // GRID HELPER
    // const gridHelper = new THREE.GridHelper(CONFIG.PLANE_WIDTH, CONFIG.PLANE_WIDTH)
    // this.scene.add(gridHelper)

    const selectedGeometry = new THREE.PlaneGeometry(1, 1)
    const selectedMaterial = new THREE.MeshLambertMaterial({ color: 0xba3346 })
    this.selectedMesh = new THREE.Mesh(selectedGeometry, selectedMaterial)
  }

  initLevel() {
    const { LEVEL } = CONFIG

    const RADIUS = (Math.min(CONFIG.PLANE_WIDTH, CONFIG.PLANE_DEPTH) * LEVEL.RADIUS) / 2

    // 1. Create Physics
    const shape = new CANNON.Cylinder(RADIUS, RADIUS, LEVEL.HEIGHT, LEVEL.SEGMENTS)

    const quat = new CANNON.Quaternion()
    quat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    const translation = new CANNON.Vec3(0, 0, 0)
    shape.transformAllPoints(translation, quat)

    const position = new CANNON.Vec3(
      randomIntFromInterval(CONFIG.PLANE_WIDTH / -2 + RADIUS, CONFIG.PLANE_WIDTH / 2 - RADIUS),
      LEVEL.HEIGHT / 2,
      randomIntFromInterval(CONFIG.PLANE_DEPTH / -2 + RADIUS, CONFIG.PLANE_DEPTH / 2 - RADIUS)
    )

    const mass = 0

    const body = new CANNON.Body({
      mass,
      shape,
      position
    })
    this.world.addBody(body)
    this.bodies.push(body)

    // 2. Create Graphics
    const geometry = new THREE.CylinderGeometry(RADIUS, RADIUS, LEVEL.HEIGHT, LEVEL.SEGMENTS)
    const material = new THREE.MeshLambertMaterial({ color: 0xb03a4a })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    this.scene.add(mesh)
    this.meshes.push(mesh)
  }

  initWalls() {
    const shape = new CANNON.Box(
      new CANNON.Vec3(CONFIG.PLANE_WIDTH / 2, CONFIG.WALL_HEIGHT / 2, CONFIG.WALL_THICKNESS / 2)
    )
    const mass = 0

    const body1 = new CANNON.Body({
      shape,
      mass,
      position: new CANNON.Vec3(0, CONFIG.WALL_HEIGHT / 2, CONFIG.PLANE_DEPTH / -2)
    })

    const body2 = new CANNON.Body({
      shape,
      mass,
      position: new CANNON.Vec3(CONFIG.PLANE_DEPTH / -2, CONFIG.WALL_HEIGHT / 2, 0)
    })

    const body3 = new CANNON.Body({
      shape,
      mass,
      position: new CANNON.Vec3(CONFIG.PLANE_DEPTH / 2, CONFIG.WALL_HEIGHT / 2, 0)
    })

    body2.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / -2)
    body3.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / -2)

    this.world.addBody(body1)
    this.world.addBody(body2)
    this.world.addBody(body3)
    this.bodies.push(body1, body2, body3)

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2
    })

    const geometry = new THREE.BoxGeometry(CONFIG.PLANE_WIDTH, CONFIG.WALL_HEIGHT, CONFIG.WALL_THICKNESS, 2, 2)

    const mesh1 = new THREE.Mesh(geometry, material)
    const mesh2 = new THREE.Mesh(geometry, material)
    const mesh3 = new THREE.Mesh(geometry, material)

    this.scene.add(mesh1)
    this.scene.add(mesh2)
    this.scene.add(mesh3)
    this.meshes.push(mesh1, mesh2, mesh3)
  }

  update() {
    this.meshes.forEach((mesh, index) => {
      mesh.position.copy(this.bodies[index].position)
      mesh.quaternion.copy(this.bodies[index].quaternion)
    })
  }

  addPositionMarker(position) {
    let { x, z } = position

    x = Math.ceil(x) - 0.5
    z = Math.ceil(z) - 0.5

    this.selectedMesh.position.set(x, 0.01, z)
    this.selectedMesh.quaternion.copy(this.bodies[0].quaternion)
    this.scene.add(this.selectedMesh)
  }

  removePositionMarker() {
    this.scene.remove(this.selectedMesh)
  }

  movePositionMarker(x, z) {
    this.selectedMesh.position.set(x - 0.5, 0.01, z - 0.5)
  }
}

export default Terrain
