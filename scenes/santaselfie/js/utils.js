goog.provide('app.utils');



app.utils = function() {
  var audioProxy = {};

  return {
    distance: function(x, y) {
      return Math.sqrt(x * x + y * y);
    },

    randomLoop: function(fn, minInterval, maxInterval) {
      var random = Math.max(minInterval, Math.random() * maxInterval);

      setTimeout(function() {
        fn();
        app.utils.randomLoop(fn, minInterval, maxInterval);
      }, random);
    },

    triggerStart: function(event) {
      if (!audioProxy[event]) {
        window.santaApp.fire('sound-trigger', event + '_start');
        audioProxy[event] = true;
      }
    },

    triggerStop: function(event) {
      if (audioProxy[event]) {
        window.santaApp.fire('sound-trigger', event + '_stop');
        audioProxy[event] = false;
      }
    },

    triggerOnce: function(event) {
      if (!audioProxy[event]) {
        window.santaApp.fire('sound-trigger', event);
        audioProxy[event] = true;
      }
    },

    triggerReset: function(event) {
      audioProxy[event] = false;
    }
  };
}();
