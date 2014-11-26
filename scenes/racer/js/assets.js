goog.provide('SB.Assets');

/**
 * Handles the asset loading for the game.
 * @namespace
 */
SB.Assets = (function() {
  // TODO: Fix me.
  //var staticDir = santatracker.getStaticDir('racer');
  var staticDir = '/scenes/racer';
  var manifest = {};
  manifest.santa = new Image();
  manifest.santa.src = staticDir + '/img/santa-sleigh.png';
  manifest.rudolf = new Image();
  manifest.rudolf.src = staticDir + '/img/rudolf.png';
  manifest.tree = new Image();
  manifest.tree.src = staticDir + '/img/tree.png';
  manifest.rock = new Image();
  manifest.rock.src = staticDir + '/img/rock.png';
  manifest.present = new Image();
  manifest.present.src = staticDir + '/img/present.png';

  return {
    /**
     * Gets a reference to a loaded asset.
     * @param {string} name The name of the assets to retrieve.
     */
    get: function(name) {
      return manifest[name];
    },
  };
})();
