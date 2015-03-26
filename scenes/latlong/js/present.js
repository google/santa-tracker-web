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

goog.provide('app.Present');

goog.require('app.shared.pools');
goog.require('app.shared.utils');


app.Present = function(options) {
  // Unique color/number combination.
  this.color = options.color;
  this.number = options.number;
  this.rotation = Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1);

  // Prepare DOM.
  this.el = options.presentTemplate.clone().removeAttr('id');
  this.el.addClass('Present--' + this.color);
  this.el.find('.Present-tag').text(this.number);
  this.el.find('.Present-box').css({
    transform: 'rotate(' + this.rotation + 'deg)'
  });
  this.parentEl = options.parentEl;
  this.elfTemplate = options.elfTemplate;

  // Is present still active for pickup?
  this.active = true;

  // State for when presents are being delivered.
  this.delivering = false;
  this.deliverMarker = null;
  this.deliverCallback = null;

  // Position and velocity
  this.x = 0;
  this.right = 0;
  this.velocityX = 0;

  // Create dummy AnimationPlayer.
  var dummy = new Animation(document.body, [], 0);
  this.player = document.timeline.play(dummy);
};

pools.mixin(app.Present, {fixed: true});


app.Present.prototype.onInit = function(x, velocityX) {
  this.setX(x);
  this.velocityX = velocityX;

  // Reset state.
  this.active = true;
  this.delivering = false;
  this.deliverMarker = null;
  this.deliverCallback = null;

  // Add us to the dom.
  this.parentEl.append(this.el);
};


app.Present.prototype.onDispose = function() {
  this.el.remove();

  // Clear running animations.
  this.el.
      css('transform-origin', '').
      find('.Elf').
        remove();

  this.player.cancel();
};


app.Present.prototype.setX = function(x) {
  this.x = x;
  this.right = x + Constants.PRESENT_WIDTH;
  this.el.css('left', x);
};


app.Present.prototype.deliver = function(marker, deliverCallback) {
  var presentRect = this.el[0].getBoundingClientRect();
  var markerRect = marker[0].getBoundingClientRect();
  var speed = Math.abs(this.velocityX);
  var animationDuration = 2500 - 900 * speed / 100; // animation speeds up with the belt
  var beltMovedOffset = speed * animationDuration / 1000;

  var targetX = markerRect.left - presentRect.left + markerRect.width / 2;
  var targetY = markerRect.top - presentRect.top + markerRect.height / 2;
  var point = {
    x: targetX + beltMovedOffset,
    y: targetY
  };

  var elf = this.elfTemplate.clone().removeAttr('id');
  elf.addClass('Elf--' + this.color);
  elf.appendTo(this.el);

  var elfElement = elf[0];
  var presentElement = this.el[0];

  var pickUpPresentAnimation = new Animation(elfElement,
    [
      { 'transform': 'translate3d(0, 144px, 0) scale(2)' },
      { 'transform': 'translate3d(0, 0px, 0) scale(2)' }
    ], {
      duration: Math.round(animationDuration * 0.2), // bad things happen in polyfill with floats.
      easing: 'ease'
    }
  );

  var deliverPresentAnimation = new Animation(presentElement,
    [
      {
        'transform': 'translateZ(0) scale(1) rotate(0deg)'
      },
      {
        'transform': 'translateZ(0) scale(0) rotate(' + -point.x / point.y * 45 + 'deg)'
      }
    ], {
      duration: Math.round(animationDuration * 0.8), // bad things happen in polyfill with floats.
      easing: 'cubic-bezier(.35,.16,.22,1)',
      fill: 'forwards'
    }
  );

  var animationSequence = new AnimationSequence([
    pickUpPresentAnimation,
    deliverPresentAnimation
  ]);

  this.el.css('transform-origin', point.x + 'px ' + point.y + 'px');

  marker.addClass('Grid-marker--correct');
  this.player.cancel();
  this.player = document.timeline.play(animationSequence);
  app.shared.utils.onWebAnimationFinished(this.player, this.onFinishDelivery_.bind(this));
  this.delivering = true;
  this.deliverMarker = marker;
  this.deliverCallback = deliverCallback;

  window.santaApp.fire('sound-trigger', 'latlong_jetpack');
};


app.Present.prototype.onPause = function() {
  if (this.delivering) {
    this.player.pause();
  }
};


app.Present.prototype.onResume = function() {
  if (this.delivering) {
    this.player.play();
  }
};


app.Present.prototype.onFinishDelivery_ = function() {
  if (!this.delivering) {
    return;
  }
  this.delivering = false;
  this.deliverMarker.removeClass('Grid-marker--correct');
  this.deliverCallback(this);
};
