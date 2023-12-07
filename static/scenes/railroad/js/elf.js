goog.provide('app.isElf');

/**
 * @param {THREE.Object3D} object An object in the scene.
 * @returns {boolean}
 */
app.isElf = (object) =>
  (
    object instanceof THREE.Sprite &&
    object.userData &&
    object.userData.clickable &&
    object.userData.clickable.type === 'elf' &&
    object.userData.assetUrl !== undefined
  )
