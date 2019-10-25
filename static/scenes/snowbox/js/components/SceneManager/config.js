export default {
  BACKGROUND_COLOR: 0x2c96ff,
  // Scene background color
  DEBUG: false,
  // Show Three.JS Helpers (grids, axis, arrows, etc.)
  COLORS: {
    ICE: 0x56b8e1,
    TERRAIN: 0xd2d2d2,
    GHOST: 0xf0f0f0,
    HIGHLIGHT: 0x239dc5,
    WIREFRAME: 0xff8702
  },
  MODEL_UNIT: 198.8005,
  SCENE_SIZE: 1000,
  TIMESTEP: 1 / 60,
  ELEVATE_SCALE: 0.05,
  CASE_SIZE: 1,
  // CANNON.JS
  SLIPPERY_MATERIAL: new CANNON.Material('SLIPPERY_MATERIAL'),
  NORMAL_MATERIAL: new CANNON.Material('NORMAL_MATERIAL'),
  EDGES_PERCENT_SIZE: 0.05 // 5% of screen
}
