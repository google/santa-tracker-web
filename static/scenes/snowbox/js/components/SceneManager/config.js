export default {
  BACKGROUND_COLOR: 0x2c96ff,
  // Scene background color
  DEBUG: true,
  // Show Three.JS Helpers (grids, axis, arrows, etc.)
  COLORS: {
    ICE: 0xdcf3ff
  },
  SCENE_SIZE: 1000,
  TIMESTEP: 1 / 60,
  ELEVATE_SCALE: 1.001,
  CASE_SIZE: 1,
  // CANNON.JS
  SLIPPERY_MATERIAL: new CANNON.Material('SLIPPERY_MATERIAL'),
  NORMAL_MATERIAL: new CANNON.Material('NORMAL_MATERIAL'),
  EDGES_PERCENT_SIZE: 0.05, // 5% of screen
}
