goog.require('app.Belt');

santatracker.onModuleLoad('airport', function() {
  var animationHelper, imagePreloader, belt;

  return {
    onPreload: function(preloader) {
      preloader.addKlang('airport_load_sounds', 30);
      imagePreloader = new ImagePreloader('airport', preloader, [
        'img/logo.svg',
        'img/sign1.png',
        'img/sign2.png',
        'img/bigplane.png',
        'img/plane-departing.png',
        'img/plane-flying.png',
        'img/escalator.png',
        'img/closet.png',
        'img/baskets.png'
      ]);
    },
    onShow: function(div) {
      Klang.triggerEvent('airport_start');
      animationHelper = new CSSAnimationHelper(div);
      belt = new app.Belt(div);

      if (imagePreloader) {
        imagePreloader.dispose();
        imagePreloader = null;
      }
    },
    onHide: function() {
      animationHelper.destroy();
      animationHelper = null;
      belt.destroy();
      belt = null;
      Klang.triggerEvent('airport_end');
    }
  };
});
