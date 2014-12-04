goog.provide('app.Audio');


app.Audio = function(name, beat) {
  this.name = name;
  this.beat = beat;
  this.audiosources = Klang.$(name);

  Klang.getCoreInstance();

  this.beatSync16th = 4;
  this.beatduration = 60 / Klang.$('jamband_sequencer')._bpm;
  this.beatsPerSecond = 1 / this.beatduration;
};


/**
 * Play the provided pattern. The callback is called when the pattern starts playing.
 */
app.Audio.prototype.play = function(pattern, volume, callback) {
  if (!(pattern === 0 || pattern === 1)) {
    console.log('There are only two patterns. You should pass 0 or 1');
    pattern = 0;
  }

  this.audiosources.output.gain.value = volume;

  var audiosource = this.audiosources.content[pattern];
  audiosource.loop = true;

  if (this.currentAudiosource !== audiosource) {
    this.playNext(audiosource, callback);

    if (this.currentAudiosource) {
      this.stopNext(this.currentAudiosource);
    }

    this.currentAudiosource = audiosource;
    this.isPlaying = true;
  }
};


/**
 * Stop the currently playing audio
 */
app.Audio.prototype.stop = function() {
  if (this.currentAudiosource) {
    var when = 0;
    this.currentAudiosource.fadeOutAndStop(0.5, when);
    this.isPlaying = false;
    this.currentAudiosource = null;
  }
};


/**
 * Start playing the provided audiosource at the start of the next bar
 */
app.Audio.prototype.playNext = function(audiosource, callback) {
  var when = Klang.$('jamband_sequencer').getBeatTime(this.beatSync16th);
  var deltaWhen = when - Klang.context.currentTime;
  var beat = Math.floor(Klang.$('jamband_sequencer').currentStep);
  var scheduleBeat = (beat + Math.floor(deltaWhen * this.beatsPerSecond)) % this.beat;
  var offset = scheduleBeat * this.beatduration;

  audiosource.play(when, offset);
  Klang.schedule(when, callback);
};


/**
 * Stop the provided audiosource at the start of the next bar
 */
app.Audio.prototype.stopNext = function(audiosource) {
  var when = Klang.$('jamband_sequencer').getBeatTime(this.beatSync16th);
  audiosource.fadeOutAndStop(0.5, when);
};


/**
 * Play a preview of the instrument
 */
app.Audio.prototype.preview = function() {
  window.santaApp.fire('sound-trigger', {
    name: 'preview_instrument',
    args: [this.name.toLowerCase()]
  });
};


/**
 * Test for web audio support
 */
app.Audio.isSupported = function() {
  return !!(window.webkitAudioContext || window.AudioContext);
};
