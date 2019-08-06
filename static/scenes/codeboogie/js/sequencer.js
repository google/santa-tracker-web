goog.provide('app.Sequencer');

app.Sequencer = class {
  constructor(callback) {
    this._variant = 0;
    this._active = false;
    this._bpm = 0;
    this._playScheduled = false;
    this._callback = callback;

    this._beat = -1;
  }

  setTrack(track, bpm) {
    this._track = track;
    this._bpm = bpm;
    this._playScheduled = true;
  }

  setVariant(variant) {
    this._variant = variant;
    this._playScheduled = true;
  }

  start() {
    this._active = true;
    this._update();
    this.play();
  }

  play() {
    if (!this._playScheduled) {
      return;
    }

    window.santaApp.fire('sound-trigger', 'cb_fallback_start');  // nb. fires in Audio-tag, IE11 mode
    window.santaApp.fire('sound-transition', 'codeboogie_tracks', this._track * 2 + this._variant, this._bpm, 0, 0.2);

    this._playScheduled = false;
  }

  _update() {
    if (!this._active) {
      return;
    }

    const currPos = performance.now() / 1000;
    let beat = Math.floor(currPos / (60 / this._bpm));
    if (isNaN(beat)) {
      beat = -1;
    }

    if (this._beat !== beat) {
      this._beat = beat;
      this._callback(this._beat, this._bpm);

      this.play();
    }

    window.requestAnimationFrame(() => this._update());
  }

}