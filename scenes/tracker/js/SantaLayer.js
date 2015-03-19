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

function createSantaLayerConstructor() {

  /**
   * @constructor
   * @param {PolymerElement} base
   * @param {Object.<string,*>} opt_opts
   */
  function SantaLayer(base, opt_opts) {
    this.base_ = base;
    this.container_ = $('<div>');
    this.set('type', 'sleigh');
    this.type_ = undefined;

    this.animationSync_ = null;

    this.trailLines_ = [];
    this.lastStop_ = null;
    this.bounds_ = new google.maps.LatLngBounds();

    this.activeTrail_ = new google.maps.Polyline({
      geodesic: true,
      strokeColor: this.TRAIL_COLOR_,
      strokeWeight: 2
    });

    this.activeTrail_.bindTo('map', this);

    this.setValues(opt_opts);

    this.container_.on('click', this.onSantaClick_.bind(this));
  }
  SantaLayer.prototype = new google.maps.OverlayView;

  /**
   * @private
   * @const
   * @type {number}
   */
  SantaLayer.prototype.SLEIGH_HEIGHT_ = 68;

  /**
   * @private
   * @const
   * @type {number}
   */
  SantaLayer.prototype.PRESENTS_HEIGHT_ = 144;

  SantaLayer.prototype.MAGIC_HEIGHT_ = 120;

  SantaLayer.prototype.TRAIL_COLOR_ = '#22a528';

  SantaLayer.prototype.ANIMATION_DURATION_ = 150;

  SantaLayer.prototype.NUM_SLEIGHS_ = 8;

  SantaLayer.prototype.NUM_DELIVERING_ = {
    presents: 8,
    magic: 16
  };

  SantaLayer.prototype.onSantaClick_ = function() {
    google.maps.event.trigger(this, 'santa_clicked');
  };

  SantaLayer.prototype.setPosition = function(latLng) {
    this.set('position', latLng);
    this.draw();
  };

  SantaLayer.prototype.hide = function() {
    this.stopAnimation_();
  };

  SantaLayer.prototype.getHeight = function() {
    var type = this.get('type');
    switch (type) {
      case 'sleigh':
        return this.SLEIGH_HEIGHT_;
        break;
      case 'presents':
        return this.PRESENTS_HEIGHT_;
        break;
      case 'magic':
        return this.MAGIC_HEIGHT_;
        break;
    }
    return 0;
  };

  SantaLayer.prototype['type_changed'] = function() {
    if (!this.container_) return;

    var type = this.get('type');

    if (type == this.type_) return;

    this.type_ = type;

    if (type == 'sleigh') {
      this.stopAnimation_();
      this.container_.removeClass().addClass('santa-sleigh');
      this.addNodesToContainer_(this.NUM_SLEIGHS_);
    } else {
      var deliverTypes = ['presents', 'magic'];
      var deliverType = deliverTypes[Math.floor(Math.random() *
                                                deliverTypes.length)];
      this.container_.removeClass().addClass('santa-' + deliverType);
      this.addNodesToContainer_(this.NUM_DELIVERING_[deliverType]);
      this.animate_();
    }
  };

  SantaLayer.prototype.animate_ = function() {
    var active = $('.active', this.container_);
    active.removeClass('active');

    var next = active.next();
    if (!next.length) {
      next = this.container_.children().first();
    }

    next.addClass('active');
    this.animationSync_ = this.base_.async(
        this.animate_.bind(this), true, this.ANIMATION_DURATION_);
  };

  SantaLayer.prototype.stopAnimation_ = function() {
    this.base_.cancelAsync(this.animationSync_);
  };

  SantaLayer.prototype.addNodesToContainer_ = function(num) {
    this.container_.empty();
    for (var i = 0; i < num; i++) {
      this.container_.append('<div></div>');
    }
  };

  SantaLayer.prototype['onAdd'] = function() {
    var panes = this.getPanes();
    panes.floatPane.appendChild(this.container_[0]);
  };

  SantaLayer.prototype['onRemove'] = function() {
    this.container_.remove();
  };

  SantaLayer.prototype['draw'] = function() {
    var projection = this.getProjection();
    var latLng = /** @type {google.maps.LatLng} */ (this.get('position'));

    if (!latLng || !projection) {
      return;
    }

    var pos = projection.fromLatLngToDivPixel(latLng);

    this.container_.css({
      top: pos.y,
      left: pos.x
    });
  };

  /**
   * @param {number} angle
   */
  SantaLayer.prototype.setHeading = function(angle) {
    var type = this.get('type');
    if (type != 'sleigh') return;

    angle = (angle + 360) % 360;

    var icons = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'n'];
    var buckets = 8;
    var index = Math.round((angle / 360) * buckets);

    if (this.container_.hasClass(icons[index])) return;
    this.container_.removeClass().addClass('santa-' + type +
        ' ' + icons[index]);
  };

  SantaLayer.prototype.updateTrail = function(state) {
    if (this.lastStop_ != state.prev) {
      // Last stop has changed so update the trail
      this.lastStop_ = state.prev;

      this.bounds_ = new google.maps.LatLngBounds();
      
      // Populate the trail with the last 8 locations
      var trail = [];
      var prev = state.prev;
      while (trail.length != 8) {
        trail.push(prev.location);
        this.bounds_.extend(mapsLatLng(prev.location));
        prev = prev.prev();
        if (!prev) break;
      }

      for (var i = 0; i < this.trailLines_.length; i++) {
        this.trailLines_[i].setMap(null);
      }

      this.trailLines_ = [];

      var opacitySteps = [.5, .5, .25, .25, .25, .15, .15, .08];


      // Update the trail
      for (var i = 0; i < trail.length - 1; i++) {
        var line = new google.maps.Polyline({
          path: [trail[i], trail[i+1]],
          geodesic: true,
          strokeColor: this.TRAIL_COLOR_,
          strokeWeight: 2,
          map: this.get('map'),
          strokeOpacity: opacitySteps[i]
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

  SantaLayer.prototype.getBounds = function() {
    return this.bounds_;
  };

  return SantaLayer;
}
