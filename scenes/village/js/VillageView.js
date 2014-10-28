/**
 * Renders Santa's village.
 *
 * @param {SantaService} santaService
 * @param {!Node|jQuery} el
 * @constructor
 */
function VillageView(santaService, el) {
  this.visible_ = false;
  this.soundsLoaded_ = false;
  this.santaService_ = santaService;
  this.container_ = $(el);
  this.initOnce_ = VillageUtils.once(this.init_.bind(this));

  this.updateScheduled_ = false;
  this.villageWidth_ = 12000;
  this.parallaxLayers_ = null;
  this.scrollContainer_ = null;

  this.animator_ = new Animator();

  /**
   * The current scroll animation, if any.
   * @type {Animation}
   * @private
   */
  this.scrollAnimation_ = null;

  this.randomBusTimeoutID_ = -1;

  // House events are added before the village is shown, so that the global nav
  // can get these events, too.
  this.addHouseEvents_();
}

/**
 * Time taken to scroll across entire village, in milliseconds.
 * @type {number}
 * @const
 * @private
 */
VillageView.SCROLL_TIME_ = 5000;

/**
 * @private
 */
VillageView.prototype.init_ = function() {
  this.scrollContainer_ = $('#village-parallax');
  this.addEvents_();
  this.addTrees_();
  this.addCounter_();

  // Between 6am and 6pm it's day time.
  // Note: Not scientifically correct but it makes children happier.
  var hour = new Date().getHours();
  if (6 <= hour && hour <= 18) {
    this.setTime('day');
  } else {
    this.setTime('night');
  }
  this.villageWidth_ = $('#village').width();
  this.parallaxLayers_ = $('.parallax-layer', this.container_);
  this.scheduleParallaxUpdate_();

  // Pan to the last melted house
  this.panToHouse($('#village #houses .melt').last(), 0);
  this.villageSnow_ = new VillageSnow();
  this.villageBus_ = new VillageBus();
  this.villageSnowMobile_ = new VillageSnowMobile();

  var onSoundsLoaded = this.playSounds_.bind(this);
  
  //TODO(bckenny): Hook up sounds
  /*window.santatracker.klangLoadPromise.done(function() {
    // Load all of the heavy assets 1 second later - should give the browser
    // a chance to start loading all of the images (which are more important).
    window.setTimeout(function() {
      Klang.triggerEvent('village_load_sounds', onSoundsLoaded, null, klangLoadFailed);
    }, 1000);
  });*/

  // No Android spaceship for iOS devices
  if (navigator.userAgent.match(/iPhone|iPod|iPad/i)) {
    $('#spaceship').remove();
  }
};

/**
 * Play sounds once they have loaded from Klang.
 * @private
 */
VillageView.prototype.playSounds_ = function() {
  if (!this.visible_ || this.soundsLoaded_) return;
  this.soundsLoaded_ = true;
  Klang.triggerEvent('village_start');
};

/**
 * @param {!ProgressGroup} progressGroup
 */
VillageView.prototype.preload = function(progressGroup) {
  var suffix = window.devicePixelRatio > 1.5 ? '_2x.png' : '.png';
  for (var i = 1; i <= 26; i++) {
    progressGroup.addImage(STATIC_DIR + '/images/house_' + i + suffix);
  }
  progressGroup.addImage(STATIC_DIR + '/images/menuicons' + suffix);
  progressGroup.addImage(STATIC_DIR + '/images/markers_sprite' + suffix);
};

VillageView.prototype.hide = function() {
  if (!this.visible_) return;
  window.console.log('village hide');
  this.visible_ = false;
  Klang.triggerEvent('village_end');
  $(this.container_).hide();
  this.villageSnow_.stop();
  this.villageBus_.stop();
  this.villageSnowMobile_.stop();
  if (this.countdown_) {
    this.countdown_.stop();
  }
};

VillageView.prototype.show = function() {
  if (this.visible_) return;
  window.console.log('village show');
  this.visible_ = true;
  if (this.soundsLoaded_) {
    Klang.triggerEvent('village_start');
  }
  $(this.container_).show();
  this.initOnce_();
  this.villageSnow_.start();
  this.villageBus_.start();
  this.villageSnowMobile_.start();
  if (this.countdown_) {
    this.countdown_.start();
  }
};

/**
 * @param {string} houseId
 */
VillageView.prototype.unlockHouse = function(houseId) {
  $('#' + houseId).removeClass('iced').addClass('melt');
  $('#calendar-' + houseId).removeClass('iced').addClass('melt');
};

/**
 * @param {jQuery} el
 * @param {number=} opt_time
 */
VillageView.prototype.panToHouse = function(el, opt_time) {
  var villageOffset = parseFloat($('#village').css('left'));
  var left = parseFloat(el.css('left'));
  var width = parseFloat($('.building', el).css('width'));
  this.panTo(left + width / 2 + villageOffset, opt_time || 0);
};

/**
 * @private
 */
VillageView.prototype.addCounter_ = function() {
  if (this.santaService_.now() < window.santatracker.COUNTDOWN_END_DATE) {
    // TODO(ebidel): Add Countdown

    /*var countdown = this.countdown_ = new Countdown(this.santaService_,
                                                    $('#counter'));

    countdown.start();

    VillageUtils.forwardEvent(countdown, 'finish', this, 'countdown_finished');

    var that = this;
    Events.addListener(countdown, 'finish', function(e) {
      countdown.stop();
      $('#countdown').addClass('finished');
      that.addPostLaunchHouseEvents_();
    });*/
  } else {
    $('#countdown').addClass('finished');
  }
};

/**
 *  @private
 */
VillageView.prototype.addPostLaunchHouseEvents_ = function() {
  $('#house3, #marker2').on('click', function() {
    window.location.hash = '/tracker/dashboard';
  });
};

/**
 * @private
 */
VillageView.prototype.addHouseEvents_ = function() {
  var that = this;
  // TODO: move to <a href>
  $(document.body).on('click', '[data-module]', function() {
    var target = $(this);

    // House is not melted so don't do anything
    if (!target.hasClass('melt')) return;

    var module = target.data('module');
    window.location.hash = '/village/' + module;
  });

  $('#snowman').on('click', function() {
    $(this).addClass('snowman-fall');
    Klang.triggerEvent('village_snowman_click');
    window.santatracker.analytics.trackEvent('village', 'click', 'snowman');

    // Lets be nice and bring the snowman back
    window.setTimeout(function() {
      $('#snowman').removeClass('snowman-fall');
    }, 20000);
  });

  $('#house10').on('click', this.takeoffBaloon_.bind(this));

  for (var i = 1; i < 4; i++) {
    $('#busstop' + i).on('click', this.sendBusToStop_.bind(this, i));
  }

  for (var i = 1; i < 4; i++) {
    $('#snowmobile' + i).on('click', this.driveSnowMobile_.bind(this, i));
  }
};

/**
 * @param {string} snowMobileId
 * @private
 */
VillageView.prototype.driveSnowMobile_ = function(snowMobileId) {
  window.santatracker.analytics.trackEvent('village', 'click',
    'snowmobile' + snowMobileId);

  this.villageSnowMobile_.driveSnowMobile(snowMobileId);
};

/**
 * @param {string} stopId
 * @private
 */
VillageView.prototype.sendBusToStop_ = function(stopId) {
  window.santatracker.analytics.trackEvent('village', 'click',
    'busstop' + stopId);
  this.villageBus_.sendBusToStop(stopId);
};

/**
 * @private
 */
VillageView.prototype.takeoffBaloon_ = function() {
  window.santatracker.analytics.trackEvent('village', 'click', 'balloon');
  var baloon = $('#house10');
  if (baloon.hasClass('flying')) {
    // If its already flying then do nothing.
    return;
  }

  Klang.triggerEvent('village_balloon_click');

  // The same amount of time we set in the css animation
  var ANIMATION_TIME = 55000;

  baloon.addClass('takeoff');
  $('#house10-ropes').show();

  $('#house10-elf1').hide();
  $('#house10-elf2').hide();

  var WAIT = 500; // Seems nice enough
  var timeout = 1000;
  window.setTimeout(function() {
    baloon.removeClass('takeoff').addClass('fly flying float');
  }, timeout);

  timeout += ANIMATION_TIME;
  window.setTimeout(function() {
    baloon.removeClass('flying float');
  }, timeout);

  timeout += WAIT;

  window.setTimeout(function() {
    baloon.removeClass('fly').addClass('takeoff');
  }, timeout);

  timeout += WAIT;
  window.setTimeout(function() {
    baloon.removeClass('takeoff');
    $('#house10-ropes').hide();
    $('#house10-elf1').show();
    $('#house10-elf2').show();

    Klang.triggerEvent('village_balloon_landing');
  }, timeout);
};

/**
 * @private
 */
VillageView.prototype.addEvents_ = function() {
  var that = this;
  $('#fakesun').on('click', function() {
    window.santatracker.analytics.trackEvent('village', 'click', 'sun');
    that.setTime('night');
  });

  $('#fakemoon').on('click', function() {
    window.santatracker.analytics.trackEvent('village', 'click', 'moon');
    that.setTime('day');
  });

  $('#onthego-nav').on('click', '.arrow, h2', function() {
    $('#onthego-nav').toggleClass('close').toggleClass('open');
  });

  // Use touch event support as a rough heuristic of when we shouldn't use
  // parallax.
  // TODO(bckenny): expand parallax support to touch devices like the Pixel
  if (!Modernizr.touch) {
    var parallaxScheduleFunction = this.scheduleParallaxUpdate_.bind(this);
    this.scrollContainer_.scroll(parallaxScheduleFunction);
  }
  $(window).resize(parallaxScheduleFunction);

  function polynomialEasing(t) {
    return t * t;
  }

  if (Modernizr.touch) {
    $('#hit-area-left').on('touchstart', function() {
      that.panTo(0, VillageView.SCROLL_TIME_, polynomialEasing);
    }).on('touchend', this.cancelScrollAnimation_.bind(this));

    $('#hit-area-right').on('touchstart', function() {
      that.panTo(/** @type {number} */(that.villageWidth_),
                 VillageView.SCROLL_TIME_, polynomialEasing);
    }).on('touchend', this.cancelScrollAnimation_,bind(this));
  } else {
    $('#hit-area-left').on('mouseenter', function() {
      that.panTo(0, VillageView.SCROLL_TIME_, polynomialEasing);
    }).on('mouseleave', this.cancelScrollAnimation_.bind(this));

    $('#hit-area-right').on('mouseenter', function() {
      that.panTo(/** @type {number} */(that.villageWidth_),
                 VillageView.SCROLL_TIME_, polynomialEasing);
    }).on('mouseleave', this.cancelScrollAnimation_.bind(this));
  }
};

/**
 * @private
 */
VillageView.prototype.addTrees_ = function() {
  var numTrees = Math.max(3, Math.ceil(Math.random() * 10));
  var width = parseFloat($('#trees', this.container_).css('width'));
  var left = 0;
  var minDistanceBetweenTrees = 2000;
  var maxDistanceBetweenTrees = width / numTrees;
  for (var i = 0; i < numTrees; i++) {
    var pos = Math.max(minDistanceBetweenTrees,
                       Math.random() * maxDistanceBetweenTrees);
    left += pos;
    if (left > width) return;
    $('#trees').append($('<div>').addClass('tree').css('left', left));
  }
};

/**
 * Sets the time of day: day or night.
 * @param {string} type The type of day.
 */
VillageView.prototype.setTime = function(type) {
  var day = type == 'day';

  if (day) {
    $('#sun').addClass('up go-up').removeClass('down go-down');
    $('#moon').removeClass('up go-up').addClass('down go-down');
    $('#fakesun').show();
    $('#fakemoon').hide();
    $('#sky-day').addClass('visible');
    $('#sky-night').removeClass('visible');
    $('#mountains-day').addClass('visible');
    $('#mountains-night').removeClass('visible');
    $('#rail').removeClass('night');
  } else {
    $('#sun').removeClass('up go-up').addClass('down go-down');
    $('#moon').addClass('up go-up').removeClass('down go-down');
    $('#fakesun').hide();
    $('#fakemoon').show();
    $('#sky-day').removeClass('visible');
    $('#sky-night').addClass('visible');
    $('#mountains-day').removeClass('visible');
    $('#mountains-night').addClass('visible');
    $('#rail').addClass('night');
  }

  // Remove animations so they don't play when village becomes visible.
  // TODO(bckenny): there may be a better, more centralized way to make sure
  // animations don't play every time we come back from display:none.
  window.setTimeout(function() {
    $('#sun').removeClass('go-up').removeClass('go-down');
    $('#moon').removeClass('go-up').removeClass('go-down');
  }, 1500);
};

/**
 * Centers the view on this position within the village (or as close as the
 * bounds of the view allow).
 * @param {number} value New center position, in pixels.
 */
VillageView.prototype.setPosition = function(value) {
  // put desired position at center of current view
  value -= this.scrollContainer_.width() / 2;
  this.scrollContainer_.scrollLeft(value);
};

/**
 * Animates the view to centers on this position within the village (or as
 * close as the bounds of the view allow).
 * @param {number} value New center position, in pixels.
 * @param {number=} opt_duration Duration of animation. Defaults to 600ms.
 * @param {Function=} opt_easing Animation easing function.
 */
VillageView.prototype.panTo = function(value, opt_duration, opt_easing) {
  this.cancelScrollAnimation_();

  var scrollee = this.scrollContainer_;
  var currentScroll = scrollee.scrollLeft();
  var targetScroll = value - scrollee.width() / 2;
  var duration = (opt_duration != null) ? opt_duration : 600;

  this.scrollAnimation_ = this.animator_.animate(function(t) {
    var scrollPos = currentScroll + t * (targetScroll - currentScroll);
    scrollee.scrollLeft(/** @type {number} */(scrollPos));
  }, duration, opt_easing);
};

/**
 * @private
 */
VillageView.prototype.cancelScrollAnimation_ = function() {
  if (this.scrollAnimation_) {
    this.scrollAnimation_.cancel();
    this.scrollAnimation_ = null;
  }
};

/**
 * Schedule a parallax update for next browser repaint.
 * @private
 */
VillageView.prototype.scheduleParallaxUpdate_ = function() {
  if (!this.visible_) return;

  if (!this.updateScheduled_) {
    this.updateScheduled_ = true;
    window.requestAnimationFrame(this.updateParallax_.bind(this));
  }
};

/**
 * Update the village layers in relation to village scroll.
 * @private
 */
VillageView.prototype.updateParallax_ = function() {
  this.updateScheduled_ = false;

  var scrollLeft = /** @type {number} */(this.scrollContainer_.scrollLeft());
  var viewWidth = /** @type {number} */(this.scrollContainer_.width());
  var villageWidth = /** @type {number} */(this.villageWidth_);

  this.parallaxLayers_.each(function() {
    VillageView.scrollLayer_(this, scrollLeft, viewWidth, villageWidth);
  });
};

/**
 * Scroll an element in the view relative to a reference width.
 * @param {!Element} el The element to translate.
 * @param {number} scrollLeft The reference element's current scrollLeft.
 * @param {number} viewWidth The width of the view of the element.
 * @param {number} refrenceWidth
 * @private
 */
VillageView.scrollLayer_ = function(el, scrollLeft, viewWidth, refrenceWidth) {
  var scrollScale = (el.offsetWidth - viewWidth) / (refrenceWidth - viewWidth);
  var translate = -scrollLeft * scrollScale;
  var translateStyle = 'translateX(' + translate + 'px)';
  el.style[VillageUtils.CSS_TRANSFORM] = translateStyle;
  el.style[VillageUtils.CSS_TRANSFORM] = 'translateZ(0) ' + translateStyle;
};
