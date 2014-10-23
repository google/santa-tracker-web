/* exported preloadImages */

/**
 * [preloadImages description]
 * @param {base-scene} scene
 * @param {!Array.<string>} imageUrls
 */
function preloadImages(scene, imageUrls) {
  var loadedCount = 0;
  var totalCount = imageUrls.length;
  console.log('progress: ' + scene.preloadProgress);
  if (totalCount === 0) {
    scene.preloadProgress = 100;
    scene.unhideScene();
    return;
  }
  console.log('progress: ' + scene.preloadProgress);

  // TODO(bckenny): timeout
  for (var i = 0; i < imageUrls.length; i++) {
    var img = new Image();
    img.onload = function() {
      loadedCount++;
      var progress = Math.min(100, Math.ceil(loadedCount / totalCount * 100));
      scene.preloadProgress = progress;
      console.log('progress: ' + scene.preloadProgress);
      if (progress === 100) {
        scene.unhideScene();
      }
    };
    img.src = scene.resolvePath(imageUrls[i]);
  }
  console.log('progress: ' + scene.preloadProgress);
}
