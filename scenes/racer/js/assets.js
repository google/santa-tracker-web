goog.provide('SB.Assets');

/**
 * Handles the asset loading for the game.
 * @param {string} componentDir path to the scene static files.
 */
SB.Assets.init = function(componentDir) {
  if (SB.Assets.manifest_ != null) {
    return;
  }
  var manifest = SB.Assets.manifest_ = {};
  manifest.santa = new Image();
  manifest.santa.src = componentDir + 'img/santa-sleigh.png';
  manifest.rudolf = new Image();
  manifest.rudolf.src = componentDir + 'img/rudolf.png';
  manifest.tree = new Image();
  manifest.tree.src = componentDir + 'img/tree.png';
  manifest.rock = new Image();
  manifest.rock.src = componentDir + 'img/rock.png';
  manifest.present = new Image();
  manifest.present.src = componentDir + 'img/present.png';
};

/**
 * Store all assets
 * @type {{}}
 * @private
 */
SB.Assets.manifest_ = null;


/**
 * Gets a reference to a loaded asset.
 * @param {string} name The name of the assets to retrieve.
 * @return {Image}
 */
SB.Assets.get = function(name) {
  return SB.Assets.manifest_[name];
};
