goog.provide('app.Fallback');



app.Fallback = function(name) {
    this.klangEventName = 'jamband_fb_play_' + name.toLowerCase();
};


app.Fallback.prototype.preview = function() {
  window.santaApp.fire('sound-trigger', this.klangEventName);
};


app.Fallback.prototype.play = function(pattern, volume, onPlaying) {
  // Start the animations.
  onPlaying();
  app.Fallback.play();
};

app.Fallback.play = function() {
  if (!app.Fallback.playing) {
    // play the tune.
    window.santaApp.fire('sound-ambient', 'jamband_fb_loop_start');
  }

  app.Fallback.playing = true;
};

app.Fallback.stop = function() {
  window.santaApp.fire('sound-ambient', 'jamband_fb_loop_stop');
  app.Fallback.playing = false;
};
