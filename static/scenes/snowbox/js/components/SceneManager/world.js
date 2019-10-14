import CONFIG from './config.js'

const world = new CANNON.World()
world.gravity.set(0, -10, 0)
world.broadphase = new CANNON.NaiveBroadphase()
world.solver.iterations = 10

const NORMAL_NORMAL_CM = new CANNON.ContactMaterial(CONFIG.NORMAL_MATERIAL, CONFIG.NORMAL_MATERIAL, {
  friction: 0.4,
  restitution: 0.3,
  contactEquationStiffness: 1e8,
  contactEquationRelaxation: 3,
  frictionEquationStiffness: 1e8,
  frictionEquationRegularizationTime: 3
})
world.addContactMaterial(NORMAL_NORMAL_CM)

const SLIPPERY_NORMAL_CM = new CANNON.ContactMaterial(CONFIG.NORMAL_MATERIAL, CONFIG.SLIPPERY_MATERIAL, {
  friction: 0,
  restitution: 0.3,
  contactEquationStiffness: 1e8,
  contactEquationRelaxation: 3
})
world.addContactMaterial(SLIPPERY_NORMAL_CM)

export { world, NORMAL_NORMAL_CM, SLIPPERY_NORMAL_CM }
