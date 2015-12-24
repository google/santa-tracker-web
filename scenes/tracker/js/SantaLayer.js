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

/**
 * Function used to create the SantaLayer class after the Maps API has loaded,
 * since class extends google.maps.OverlayView.
 * @return {!SantaLayer}
 */
function createSantaLayerConstructor() {
  /**
   * Class for drawing Santa, his sleigh, and his path over the Tracker map.
   * @constructor
   * @param {!Object<string>} options
   */
  function SantaLayer(options) {
    this.container_ = document.createElement('div');
    this.set('type', 'sleigh');
    this.prevType_ = undefined;

    this.animationHandle_ = null;

    this.trailLines_ = [];
    this.lastStop_ = null;
    this.bounds_ = new google.maps.LatLngBounds();

    this.activeTrail_ = new google.maps.Polyline({
      geodesic: true,
      strokeColor: this.TRAIL_COLOR_,
      strokeWeight: 2
    });
    this.activeTrail_.bindTo('map', this);

    this.setValues(options);

    this.container_.addEventListener('click', this.onSantaClick_.bind(this));
  }
  SantaLayer.prototype = new google.maps.OverlayView;

  /**
   * @const
   * @private {number}
   */
  SantaLayer.prototype.SLEIGH_HEIGHT_ = 68;

  /**
   * @const
   * @private {number}
   */
  SantaLayer.prototype.PRESENTS_HEIGHT_ = 144;

  /**
   * @const
   * @private {string}
   */
  SantaLayer.prototype.TRAIL_COLOR_ = '#22a528';

  /**
   * @const
   * @private {number}
   */
  SantaLayer.prototype.TRAIL_LENGTH_ = 8;

  /**
   * @const
   * @private {!Array<number>}
   */
  SantaLayer.prototype.TRAIL_OPACITY_ = [0.5, 0.5, 0.25, 0.25, 0.25, 0.15, 0.15,
      0.08];

  /**
   * @const
   * @private {number}
   */
  SantaLayer.prototype.ANIMATION_DURATION_ = 150;

  /**
   * @const
   * @private {!Array<string>}
   */
  SantaLayer.prototype.SLEIGH_POSITIONS_ = ['n', 'ne', 'e', 'se', 's', 'sw',
      'w', 'nw'];

  /**
   * @private
   * @enum {number}
   */
  SantaLayer.prototype.NUM_DELIVERING_ = {
    presents: 8,
    magic: 16
  };

  SantaLayer.prototype.onSantaClick_ = function() {
    google.maps.event.trigger(this, 'santa_clicked');
  };

  /**
   * Maps API OverlayView lifecycle method, called when content panes are ready.
   */
  SantaLayer.prototype.onAdd = function() {
    var panes = this.getPanes();
    panes.floatPane.appendChild(this.container_);
  };

  /**
   * Maps API OverlayView lifecycle method, called when content must be torn
   * down.
   */
  SantaLayer.prototype.onRemove = function() {
    // NOTE: never called since SantaLayer's map is never nulled.
    this.container_.parentNode.removeChild(this.container_);
  };

  /**
   * Maps API OverlayView lifecycle method, called when content must be
   * repositioned.
   */
  SantaLayer.prototype.draw = function() {
    var projection = this.getProjection();
    var latLng = /** @type {google.maps.LatLng} */ (this.get('position'));

    if (!latLng || !projection) {
      return;
    }

    var pos = projection.fromLatLngToDivPixel(latLng);
    this.container_.style.transform = 'translate(' + pos.x + 'px, ' + pos.y +
      'px)';
  };

  SantaLayer.prototype.getBounds = function() {
    return this.bounds_;
  };

  SantaLayer.prototype.hide = function() {
    this.stopAnimation_();
  };

  SantaLayer.prototype.getHeight = function() {
    var type = this.get('type');
    switch (type) {
      case 'sleigh':
        return this.SLEIGH_HEIGHT_;
      case 'presents':
        return this.PRESENTS_HEIGHT_;
    }
    return 0;
  };

  /**
   * Update SantaLayer's state to latest SantaState.
   * @param {!SantaState} state
   */
  SantaLayer.prototype.update = function(state) {
    var loc = mapsLatLng(state.position);
    this.setPosition_(loc);

    this.set('type', state.stopover ? 'presents' : 'sleigh');
    this.setHeading_(state.heading);
    this.updateTrail_(state);
  };

  /**
   * @private
   * @param {!LatLng} latLng
   */
  SantaLayer.prototype.setPosition_ = function(latLng) {
    this.set('position', latLng);
    this.draw();
  };

  /**
   * Handler for when Santa animation state changes. Possible types are 'sleigh'
   * and 'presents'.
   */
  SantaLayer.prototype.type_changed = function() {
    if (!this.container_) {
      return;
    }

    var type = this.get('type');

    if (type === this.prevType_) {
      return;
    }
    this.prevType_ = type;

    if (type === 'sleigh') {
      this.stopAnimation_();
      this.container_.className = 'santa-sleigh';
      this.addNodesToContainer_(3);
    } else {
      var deliverTypes = ['presents', 'magic'];
      var deliverType = deliverTypes[Math.floor(Math.random() *
                                                deliverTypes.length)];
      this.container_.className = 'santa-' + deliverType;
      this.addNodesToContainer_(this.NUM_DELIVERING_[deliverType]);
      this.animate_();
    }
  };

  SantaLayer.prototype.animate_ = function() {
    var active = this.container_.querySelector('.active');
    var next;
    if (active) {
      active.classList.remove('active');
      next = active.nextElementSibling;
    }
    if (!next) {
      next = this.container_.firstElementChild;
    }

    next.classList.add('active');
    this.animationHandle_ = window.setTimeout(
        this.animate_.bind(this), this.ANIMATION_DURATION_);
  };

  SantaLayer.prototype.stopAnimation_ = function() {
    window.clearTimeout(this.animationHandle_);
  };

  SantaLayer.prototype.addNodesToContainer_ = function(num) {
    this.container_.innerHTML = '';
    for (var i = 0; i < num; i++) {
      var div = document.createElement('div');
      this.container_.appendChild(div);
    }
  };

  /**
   * @private
   * @param {number} angle
   */
  SantaLayer.prototype.setHeading_ = function(angle) {
    var type = this.get('type');
    if (type !== 'sleigh') {
      return;
    }

    var halfBucket = 360 / this.SLEIGH_POSITIONS_.length / 2;
    angle = (angle + 360 + halfBucket) % 360;
    var index = Math.floor(angle / 360 * this.SLEIGH_POSITIONS_.length);

    if (this.container_.classList.contains(this.SLEIGH_POSITIONS_[index])) {
      return;
    }
    this.container_.className = 'santa-' + type + ' ' +
        this.SLEIGH_POSITIONS_[index];
  };

  /**
   * @private
   * @param {SantaState} state
   */
  SantaLayer.prototype.updateTrail_ = function(state) {
    if (this.lastStop_ !== state.prev) {
      // Last stop has changed so update the trail
      this.lastStop_ = state.prev;

      this.bounds_ = new google.maps.LatLngBounds();

      // Populate the trail with the last 8 locations
      var trail = [];
      var prev = state.prev;
      while (trail.length !== this.TRAIL_LENGTH_) {
        trail.push(prev.location);
        this.bounds_.extend(mapsLatLng(prev.location));
        prev = prev.prev();
        if (!prev) {
          break;
        }
      }

      // Erase old traillines.
      for (var i = 0; i < this.trailLines_.length; i++) {
        this.trailLines_[i].setMap(null);
      }
      this.trailLines_ = [];

      // Create new traillines with decreasing opacity.
      for (var i = 0; i < trail.length - 1; i++) {
        var line = new google.maps.Polyline({
          path: [trail[i], trail[i+1]],
          geodesic: true,
          strokeColor: this.TRAIL_COLOR_,
          strokeWeight: 2,
          map: this.get('map'),
          strokeOpacity: this.TRAIL_OPACITY_[i]
        });

        this.trailLines_.push(line);
      }
    }

    // Update flight trail from Santa to the last location
    this.activeTrail_.setPath([
      this.lastStop_.location,
      this.get('position')
    ]);
    this.bounds_.extend(this.get('position'));
  };

  return SantaLayer;
}
