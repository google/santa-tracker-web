/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

goog.provide('app.Instruments');

goog.require('app.Audio');

/**
 * @typedef {{beat: number}}
 */
app.InstrumentOptions;

/**
 * @param {number} index in Klang
 * @param {string} name of instrument
 * @param {!app.InstrumentOptions} options of instrument
 * @constructor
 */
app.Instrument = function(index, name, options) {
  this.name = name;
  this.el = this.elem.find('.Instrument-' + name.toLowerCase());
  this.container = this.el.closest('.InstrumentContainer');

  this.audio = new app.Audio(index, name, options.beat);

  this.el.on('dropped', (e, data) => {
    this.drop(data);
  });

  this.el.on('returned', this.reset.bind(this));
  this.el.on('dragging', this.drag.bind(this));
  this.el.on('mousedown.jamband touchstart.jamband', this.preview.bind(this));
};

/**
 * Preview this Instrument.
 */
app.Instrument.prototype.preview = function() {
  // Play preview sound if the instrument is in the drawer.
  if (this.el.parent().is(this.container)) {
    this.audio.preview();
  }
};

/**
 * Start this instrument playing.
 * @param {{pattern: number, volume: number}} data
 */
app.Instrument.prototype.play = function(data) {
  var onPlaying = (function() {
    // Check we are still on stage
    if (this.el.parent().hasClass('Stage')) {
      this.el.removeClass('playing-0 playing-1').addClass('playing playing-' + data.pattern);
      this.elem.trigger('playing');
    }

    this.countOnStage();
  }).bind(this);

  this.audio.play(data.pattern, data.volume, onPlaying);
};

/**
 * Called when this Instrument is being dragged.
 */
app.Instrument.prototype.drag = function() {
  this.container.removeClass('collapse');
  this.el.removeClass('Instrument--small');
};

/**
 * Called when this Instrument is dropped.
 * @param {{pattern: number, volume: number}} data
 */
app.Instrument.prototype.drop = function(data) {
  this.play(data);
  this.container.addClass('collapse');
  this.el.addClass('waiting');
};

/**
 * Reset this Instrument. Called as part of being removed from the stage.
 */
app.Instrument.prototype.reset = function() {
  this.audio.stop();
  this.el.addClass('Instrument--small');
  this.el.removeClass('waiting playing playing-0 playing-1');
  this.countOnStage();
};

/**
 * Places this Instrument on a specific stage.
 * @param {!jQuery} stage to place on
 */
app.Instrument.prototype.putOnStage = function(stage) {
  this.el.trigger('dragging');
  this.el.appendTo(stage);

  const raw = stage.data();
  const data = {
    pattern: +raw['pattern'],
    volume: +raw['volume'],
  };
  this.el.trigger('dropped', data);
};

/**
 * Return this Instrument to the drawer.
 */
app.Instrument.prototype.putInDrawer = function() {
  this.el.trigger('dragging');
  this.el.appendTo(this.container);
  this.el.trigger('returned');
};

/**
 * Trigger the stage count event, which informs listeners of how many
 * instruments are on the stage.
 */
app.Instrument.prototype.countOnStage = function() {
  var count = this.elem.find('.Stage .Instrument').length;
  this.elem.trigger('stagechanged.jamband', {count: count});
};

/**
 * Game instruments
 *
 * @param {!Element|!jQuery} elem A DOM element.
 * @constructor
 */
app.Instruments = function(elem) {
  this.elem = $(elem);
  app.Instrument.prototype.elem = elem;
  this.stages = elem.find('.Stage');

/*
        "Bass": "EPDs",
        "Drums": "QcJi",
        "Bell": "Du2o",
        "Boombox": "OSie",
        "Guitar": "Px11",
        "Rap": "QLAo",
        "Sax": "LdQ0",
        "Synth": "uARB",
        "Tamb": "Jdmw",
        "Xylo": "SdSp",
        "Vox": "Pej8",
*/
  this.instruments = [
    new app.Instrument(0, 'Bass', { beat: 32 }),
    new app.Instrument(1, 'Drums', { beat: 16 }),
    new app.Instrument(2, 'Bell', { beat: 16 }),
    new app.Instrument(3, 'Boombox', { beat: 32 }),
    new app.Instrument(4, 'Guitar', { beat: 32 }),
    new app.Instrument(5, 'Rap', { beat: 32 }),
    new app.Instrument(6, 'Sax', { beat: 32 }),
    new app.Instrument(7, 'Synth', { beat: 32 }),
    new app.Instrument(8, 'Tamb', { beat: 16 }),
    new app.Instrument(9, 'Xylo', { beat: 32 }),
  ];

  this.elem.on('dropped returned randomize reset restore', this.checkIfAllEmpty.bind(this));

  var random = elem.find('#drawer-button--random');
  random.on('mouseup.jamband touchend.jamband', this.randomize.bind(this));

  this.elem.trigger('reset');
};

/**
 * Show help arrows if no instruments on stage
 */
app.Instruments.prototype.checkIfAllEmpty = function() {
  var count = this.elem.find('.Stage .Instrument').length;
  this.elem.toggleClass('is-allEmpty', count === 0);
};

/**
 * Put a random selection of instruments on stage
 */
app.Instruments.prototype.randomize = function() {
  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
  }

  this.reset();

  var chosenInstruments = shuffle(this.instruments.slice()).slice(0, this.stages.length);

  this.stages.each(function(i, stage) {
    chosenInstruments[i].putOnStage($(stage));
  });

  this.elem.trigger('randomize');
};

/**
 * Remove all the instruments from the stage
 */
app.Instruments.prototype.reset = function() {
  this.instruments.forEach(function(instrument) {
    instrument.putInDrawer();
  });
};

/**
 * Save serializes the current configuration of instruments to a string.
 *
 * @return {string} serialized config of instruments
 */
app.Instruments.prototype.save = function() {
  var instruments = [];

  var instrumentElements = this.instruments.map(function(instrument) {
    return instrument.el[0];
  });

  this.stages.each(function(i, element) {
    var index = instrumentElements.indexOf($(element).find('.Instrument')[0]);
    instruments.push(index);
  });

  var noInstrumentsOnStage = instruments.every(function(i) {
    return i === -1;
  });

  if (noInstrumentsOnStage) {
    return '';
  }

  return instruments.join(',');
};

/**
 * Restores a previously serialized configuration of instruments.
 *
 * @param {string} instrumentString to restore
 */
app.Instruments.prototype.restore = function(instrumentString) {
  this.reset(); // clear stage

  var data = instrumentString.split(',').map(function(i) {
    return parseInt(i, 10);
  });

  var chosenInstruments = data.map(function(i) {
    return this.instruments[i];
  }, this);

  this.stages.each(function(i, element) {
    if (chosenInstruments[i]) {
      chosenInstruments[i].putOnStage($(element));
    }
  });

  this.elem.trigger('restore');
};
