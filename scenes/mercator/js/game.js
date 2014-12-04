/*global google Modernizr */

goog.provide('app.Game');

goog.require('app.Constants');
goog.require('app.Country');
goog.require('app.levels');
goog.require('app.shared.Gameover');
goog.require('app.shared.LevelUp');
goog.require('app.shared.Scoreboard');
goog.require('app.shared.Tutorial');
goog.require('app.utils');

/**
 * Main game class
 * @param {Element} elem An DOM element which wraps the game.
 * @author aranja@aranja.com
 * @constructor
 * @export
 */
app.Game = function(elem) {
  this.elem = $(elem);
  this.sceneElem = this.elem.find('.scene');
  this.mapElem = this.elem.find('.map');
  this.bgElem = this.elem.find('.bg');
  this.countriesElem = this.elem.find('.countries');

  this.scoreboard = new app.shared.Scoreboard(this,
      this.elem.find('.board'), app.Constants.TOTAL_LEVELS);
  this.gameoverView = new app.shared.Gameover(this, this.elem.find('.gameover'));
  this.levelUp = new app.shared.LevelUp(this,
      this.elem.find('.levelup'), this.elem.find('.levelup--number'));
  this.tutorial = new Tutorial(this.elem, 'touch-mercator', 'mouse-mercator');

  this.debug = !!location.search.match(/[?&]debug=true/);
  this.mapReady = false;
  this.startOnReady = false;

  // For IE 10 that does not support pointer-event: none.
  if (Modernizr.pointerevents !== true && Modernizr.pointerevents != null) {
    this.bgElem.prependTo(this.sceneElem);
  }

  // Remove success messages on hide
  this.elem.on(utils.ANIMATION_END, '.country-match', function(event) {
    $(event.target).remove();
  });

  // Cache a bound functions
  this.onFrame = this.onFrame.bind(this);
  this.countryMatched_ = this.countryMatched_.bind(this);
  this.updateSize_ = this.updateSize_.bind(this);
  this.disableTutorial_ = this.disableTutorial_.bind(this);

  // Disable tutorial on click
  this.elem.on('click touchend', this.disableTutorial_);

  this.init_();
  this.initMap_();
};

/**
 * Disable the tutorial.
 * @private
 */
app.Game.prototype.disableTutorial_ = function() {
  this.tutorial.off('mouse-mercator');
  this.tutorial.off('touch-mercator');
};

/**
 * Start the game.
 */
app.Game.prototype.start = function() {
  // Wait for map to be ready
  if (!this.mapReady) {
    this.startOnReady = true;
    return;
  }

  this.restart();
  this.tutorial.start();
};

/**
 * Initialize the game.
 * @private
 */
app.Game.prototype.init_ = function() {
  this.updateSize_();
  $(window).on('resize.mercator', this.updateSize_);
  $(window).on('orientationchange.mercator', this.updateSize_);

  var match = location.search.match(/[?&]level=(\d+)/) || [];
  this.level = (+match[1] || 1) - 1;

  this.scoreboard.reset();
  this.scoreboard.setLevel(this.level);

  if (this.countries) {
    this.countries.forEach(function(country) {
      country.hide();
    });
  }
};

/**
 * Restart the game.
 */
app.Game.prototype.restart = function() {
  this.init_();
  this.startLevel_();
  this.unfreezeGame();

  window.santaApp.fire('analytics-track-game-start', {gameid: 'mercator'});
  window.santaApp.fire('sound-trigger', 'mercator_start');
};


/**
 * Freezes the game. Stops the onFrame loop and stops any CSS3 animations.
 * Used both for game over and pausing.
 * @param {bool} gameEnded Is the game over?
 */
app.Game.prototype.freezeGame = function(gameEnded) {
  this.isPlaying = false;
  if (!gameEnded) {
    this.elem.addClass('frozen');
  }
};

/**
 * Unfreezes the game, starting the game loop as well.
 */
app.Game.prototype.unfreezeGame = function() {
  if (!this.isPlaying) {
    this.elem.removeClass('frozen');

    this.isPlaying = true;
    this.lastFrame = +new Date() / 1000;
    this.requestId = utils.requestAnimFrame(this.onFrame);
  }
};

/**
 * Pauses/unpauses the game.
 */
app.Game.prototype.togglePause = function() {
  if (this.paused) {
    this.resume();
  // Only allow pausing if the game is playing (not game over).
  } else if (this.isPlaying) {
    this.pause();
  }
};

/**
 * Pause the game.
 */
app.Game.prototype.pause = function() {
  this.paused = true;
  this.freezeGame();
};

/**
 * Resume the game.
 */
app.Game.prototype.resume = function() {
  this.paused = false;
  this.unfreezeGame();
};


/**
 * Game loop. Runs every frame using requestAnimationFrame.
 */
app.Game.prototype.onFrame = function() {
  if (!this.isPlaying) {
    return;
  }

  // Calculate delta since last frame.
  var now = +new Date() / 1000;
  var delta = Math.min(1, now - this.lastFrame);
  this.lastFrame = now;

  this.levelElapsed += delta;
  this.scoreboard.onFrame(delta);

  // Request next frame
  this.requestId = utils.requestAnimFrame(this.onFrame);
};

/**
 * Go to next level or end the game.
 * @param {bool} won Is the game over?
 * @private
 */
app.Game.prototype.bumpLevel_ = function(won) {
  this.level++;
  this.scoreboard.setLevel(this.level);
  this.scoreboard.addTime(app.Constants.TIME_PER_LEVEL);
  this.countries.forEach(function(country) {
    country.hide();
  });
  if (won) {
    this.gameover();
    window.santaApp.fire('sound-trigger', 'mercator_game_over');
  } else {
    this.startLevel_();
    window.santaApp.fire('sound-trigger', 'mercator_nextLevel');
  }
};

/**
 * Setup the level. Create countries and set bounds.
 * @private
 */
app.Game.prototype.setupLevel_ = function() {
  var data = app.levels[this.level];
  this.countries = [];

  data.features.forEach(function(feature) {
    var country = new app.Country(this.map, feature);
    country.onMatched = this.countryMatched_;
    country.onDrag = this.disableTutorial_;
    this.countries.push(country);
  }.bind(this));

  this.mapBounds = new google.maps.LatLngBounds();
  this.mapBounds.extend(new google.maps.LatLng(data.bounds.s, data.bounds.w));
  this.mapBounds.extend(new google.maps.LatLng(data.bounds.n, data.bounds.e));
  this.map.fitBounds(this.mapBounds);

  if (this.debug) {
    this.mapBoundsRect && this.mapBoundsRect.setMap(null);
    this.mapBoundsRect = new google.maps.Rectangle({
      map: this.map,
      bounds: this.mapBounds,
      zIndex: 1
    });
  }

  // Show the whole world
  if (this.level === 9) {
    this.map.setZoom(2);
    this.map.setCenter(new google.maps.LatLng(45, 5));
  }
};

/**
 * Start a the level.
 * @private
 */
app.Game.prototype.startLevel_ = function() {
  this.setupLevel_();
  this.showCountries_();
  this.levelElapsed = 0;

  this.unfreezeGame();
};

/**
 * Show countries for current level in random places within the bounding box.
 * @private
 */
app.Game.prototype.showCountries_ = function() {
  var ne = app.utils.latLngToPoint(this.map, this.mapBounds.getNorthEast());
  var sw = app.utils.latLngToPoint(this.map, this.mapBounds.getSouthWest());
  var dX = sw.x - ne.x;
  var dY = sw.y - ne.y;

  // Don't place countries on the edges of the map
  dX -= ((app.Constants.MAP_BORDER) / 100) * dX;
  dY -= ((app.Constants.MAP_BORDER) / 100) * dY;
  ne.x += (app.Constants.MAP_BORDER / 100 / 2) * dX;
  ne.y += (app.Constants.MAP_BORDER / 100 / 2) * dY;

  var shown = 0;
  var total = this.level === 0 ? app.Constants.FIRST_LEVEL_VISIBLE_COUNTRIES :
      app.Constants.VISIBLE_COUNTRIES;
  while (shown < total) {
    var index = Math.floor(Math.random() * this.countries.length);
    var country = this.countries[index];

    if (!country.visible) {
      var x = (Math.random() * dX) + ne.x;
      var y = (Math.random() * dY) + ne.y;
      country.setPosition(new google.maps.Point(x, y));
      country.show(app.Constants.COUNTRY_COLORS[shown % app.Constants.COUNTRY_COLORS.length]);
      shown++;

      if (this.debug) {
        country.showBounds();
      }
    }
  }
};

/**
 * Calculate the score to give for a match.
 * @param {Number} time The number of seconds from the start of the game.
 * @return {number}
 */
app.Game.prototype.getScore = function(time) {
  var score = app.Constants.SCORE_PER_COUNTRY;
  var multipliers = app.Constants.SCORE_MULTIPLIERS;
  var multiply = 1;

  for (var i = 0; i < multipliers.length; i++) {
    if (time < multipliers[i][0]) {
      multiply = multipliers[i][1];
      break;
    }
  }

  return score * multiply;
};

/**
 * Event handler for when a country is matched.
 * @param {app.Country} country The country that was matched.
 * @private
 */
app.Game.prototype.countryMatched_ = function(country) {
  // Show the name of the country
  var point = app.utils.latLngToPoint(this.map, country.bounds.getCenter());
  var ne = app.utils.latLngToPoint(this.map, this.map.getBounds().getNorthEast());
  var sw = app.utils.latLngToPoint(this.map, this.map.getBounds().getSouthWest());

  // Show country name
  var offset = {
    left: (this.elem.width() - this.mapElem.width()) / 2,
    top: (this.elem.height() - this.mapElem.height()) / 2
  };
  var message = $(app.Constants.COUNTRY_MATCH_TEMPLATE).css({
    left: offset.left + point.x - sw.x,
    top: offset.top + point.y - ne.y
  });
  var name = this.countriesElem.find('[data-country="' + country.name + '"]').first().text();
  message.find('.country-match-text').text(name);
  message.find('.country-match-bg').css('background', country.color);
  this.sceneElem.append(message);

  // Get score for the match
  this.scoreboard.addScore(this.getScore(this.levelElapsed));

  // Go to next level?
  var levelOver = true;
  for (var i = 0; i < this.countries.length; i++) {
    if (this.countries[i].visible && !this.countries[i].matched) {
      levelOver = false;
    }
  }

  if (!levelOver) return;

  if (this.level === app.Constants.TOTAL_LEVELS - 1) {
    this.bumpLevel_(true);
  } else {
    this.isPlaying = false;
    window.setTimeout(function() {
      this.levelUp.show(this.level + 2, this.bumpLevel_.bind(this));
    }.bind(this), 1000);
  }
};

/**
 * Initialize Google Maps.
 * @private
 */
app.Game.prototype.initMap_ = function() {
  var mapElem = this.elem.find('.gmap');
  this.map = new google.maps.Map(mapElem[0], {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    draggable: Modernizr.touch,
    heading: 0,
    mapTypeControl: false,
    overviewMapControl: false,
    panControl: false,
    rotateControl: false,
    scaleControl: false,
    scrollwheel: false,
    streetViewControl: false,
    tilt: 1,
    zoomControl: false,
    disableDoubleClickZoom: true,
    styles: [{
        stylers: [{visibility: 'off'}]
      }, {
        featureType: 'administrative.country',
        elementType: 'geometry.stroke',
        stylers: [{visibility: 'on'}, {weight: 1}, {color: '#F6EFE2'}]
      }, {
        featureType: 'water',
        stylers: [{visibility: 'on'}, {color: '#F6EFE2'}]
      }, {
        featureType: 'landscape',
        stylers: [{visibility: 'on'}, {color: '#DFD7C5'}]
      }
    ]
  });

  google.maps.event.addListener(this.map, 'zoom_changed', function() {
    this.countries.forEach(function(country) {
      country.visible && country.updateHitbox();

      if (this.debug) {
        country.showBounds();
      }
    }.bind(this));
  }.bind(this));

  google.maps.event.addListenerOnce(this.map, 'idle', function() {
    this.setupLevel_();
    this.mapReady = true;
    if (this.startOnReady) {
      this.start();
    }
  }.bind(this));
};

/**
 * Update on screen size change.
 * @private
 */
app.Game.prototype.updateSize_ = function() {
  this.map && this.map.fitBounds(this.mapBounds);
};

/**
 * Stops the game as game over. Displays the game over screen as well.
 */
app.Game.prototype.gameover = function() {
  this.freezeGame(true);
  this.gameoverView.show();
  window.santaApp.fire('sound-trigger', 'mercator_game_over');
  window.santaApp.fire('analytics-track-game-over', {
    gameid: 'mercator',
    score: this.scoreboard.score,
    level: this.level,
    timePlayed: new Date - this.gameStartTime
  });
};

/**
 * Cleanup
 * @export
 */
app.Game.prototype.dispose = function() {
  if (this.isPlaying) {
    window.santaApp.fire('analytics-track-game-quit', {
      gameid: 'mercator',
      timePlayed: new Date - this.gameStartTime
    });
  }
  this.freezeGame();

  utils.cancelAnimFrame(this.requestId);
  $(window).off('.mercator');
  $(document).off('.mercator');

  this.tutorial.dispose();
};
