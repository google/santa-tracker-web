function createSantaMarkerConstructor() {

  /**
   * @constructor
   * @param {Object.<string,*>} opt_opts
   */
  function SantaMarker(opt_opts) {
    this.container_ = $('<div>');
    this.set('type', 'sleigh');
    this.type_ = null;

    this.trail_ = [];
    this.trailLines_ = [];
    this.lastStop_ = null;

    this.activeTrail_ = new google.maps.Polyline({
      geodesic: true,
      strokeColor: this.TRAIL_COLOR_,
      strokeWeight: 2
    });

    this.activeTrail_.bindTo('map', this);

    this.setValues(opt_opts);
  }
  SantaMarker.prototype = new google.maps.OverlayView;

  /**
   * @private
   * @const
   * @type {number}
   */
  SantaMarker.prototype.SLEIGH_HEIGHT_ = 77;

  /**
   * @private
   * @const
   * @type {number}
   */
  SantaMarker.prototype.PRESENTS_HEIGHT_ = 142;

  SantaMarker.prototype.TRAIL_COLOR_ = '#22a528';

  SantaMarker.prototype.setPosition = function(latLng) {
    this.set('position', latLng);
    this.draw();
  };

  SantaMarker.prototype.getHeight = function() {
    var type = this.get('type');
    return type == 'sleigh' ? this.SLEIGH_HEIGHT_ : this.PRESENTS_HEIGHT_;
  };

  SantaMarker.prototype['type_changed'] = function() {
    if (!this.container_) return;

    var type = this.get('type');

    if (type == this.type_) return;

    this.type_ = type;

    if (type == 'sleigh') {
      this.container_.removeClass().addClass('santa-' + type);
    } else {
      var deliverTypes = ['presents', 'magic'];
      var deliverType = deliverTypes[Math.floor(Math.random() *
                                                deliverTypes.length)];
      this.container_.removeClass().addClass('santa-' + deliverType);
    }
  };

  SantaMarker.prototype['onAdd'] = function() {
    var panes = this.getPanes();
    panes.floatPane.appendChild(this.container_[0]);
  };

  SantaMarker.prototype['onRemove'] = function() {
    this.container_.remove();
  };

  SantaMarker.prototype['draw'] = function() {
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
  SantaMarker.prototype.setHeading = function(angle) {
    var type = this.get('type');
    if (type != 'sleigh') return;

    angle = (angle + 360) % 360;

    var icons = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'n'];
    var buckets = 8;
    var index = Math.round((angle / 360) * buckets);
    this.container_.removeClass().addClass('santa-' + type +
        ' ' + icons[index]);
  };

  SantaMarker.prototype.updateTrail = function(state) {
    if (this.lastStop_ != state.prev) {
      // Last stop has changed so update the trail
      this.lastStop_ = state.prev;

      if (this.trail_.length == 0) {
        // Populate the trail with the last 8 locations
        var prev = state.prev;
        while(this.trail_.length != 8) {
          this.trail_.push(prev.location);
          prev = prev.prev();
        }
      } else {
        this.trail_.pop();
        this.trail_.unshift(this.lastStop_.location);
      }

      for (var i = 0; i < this.trailLines_; i++) {
        this.trailLines_[i].setMap(null);
      }

      this.trailLines_ = [];

      var opacitySteps = [.5, .5, .25, .25, .25, .15, .15, .08];

      // Update the trail
      for (var i = 0; i < this.trail_.length - 1; i++) {
        var line = new google.maps.Polyline({
          path: [this.trail_[i], this.trail_[i+1]],
          geodesic: true,
          strokeColor: this.TRAIL_COLOR_,
          strokeWeight: 2,
          map: this.get('map'),
          strokeOpacity: opacitySteps[i]
        });
      }
    }

    // Update flight trail from Santa to the last location
    this.activeTrail_.setPath([
      this.lastStop_.location,
      this.get('position')
    ]);
  };

  SantaMarker.prototype.getBounds = function() {
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(this.get('position'));
    for (var i = 0; i < this.trail_.length - 1; i++) {
      bounds.extend(mapsLatLng(this.trail_[i]));
    }

    // Might need to add some padding

    return bounds;
  };

  return SantaMarker;
}
