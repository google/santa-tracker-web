goog.provide('app.WaveMotion');



/**
 * Main WaveMotion class - creates a wave like motion to simulate wind
 * @author david@14islands.com (David Lindkvist - 14islands.com)
 * @param {Element} polygons An SVG element representing the WaveMotion.
 * @constructor
 */
app.WaveMotion = function(polygons) {
  this.offsetY_min = 1; // movement in y-axis closest to flagpole
  this.offsetY_max = 5; // movement in y-axis furthest from flagpole
  this.offsetX = 2;     // movement in x-axis
  this.durationX = 800; // time to complete wave in X-axis
  this.durationY = 300; // time to complete wave in Y-axis
  this.wavePeriod = Math.PI * 1.5; // how many visible waves

  this.minY = -1;
  this.maxY = -1;
  this.minX = -1;
  this.maxX = -1;
  this.deltaY = -1;
  this.deltaX = -1;

  this.polygons = polygons;
  this.orgPolygons = this.polygons.clone();

  this.findMinMax_();
};

app.WaveMotion.prototype = {
  findMinMaxPolygon_: function(polygon) {
    var n, p, points, x, y, results;
    points = polygon.points;
    results = [];
    for (n = 0; n < points.numberOfItems; n++) {
      p = points.getItem(n);
      x = parseFloat(p.x);
      y = parseFloat(p.y);
      if (this.minY === -1 || y < this.minY) {
        this.minY = y;
      }
      if (this.maxY === -1 || y > this.maxY) {
        this.maxY = y;
      }
      if (this.minX === -1 || x < this.minX) {
        this.minX = x;
      }
      if (this.maxX === -1 || x > this.maxX) {
        results.push(_this.maxX = x);
      } else {
        results.push(void 0);
      }
    }
    return results;
  },

  /**
   * Finds min/max X,Y coordinates on the set of polygons
   * @private
   */
  findMinMax_: function() {
    this.polygons.each(this.findMinMaxPolygon_.bind(this));
    this.deltaY = this.maxY - this.minY;
    this.deltaX = this.maxX - this.minX;
  },

  /**
   * Get interpolated value of provided scale based on specified normalized value
   * @param {Number} normalizedValue Value between 0 and 1
   * @param {Number} minimum Minimum value on the scale
   * @param {Number} maximum Maximum value on the scale
   * @return {Number} interpolated value on the scale
   * @private
   */
  interpolate_: function(normalizedValue, minimum, maximum) {
    return minimum + ((maximum - minimum) * normalizedValue);
  },

  /**
   * Normalize Y value (value between 0 and 1)
   * @param {Number} y value between min and max to normalize
   * @return {Number} normalized Y value
   * @private
   */
  normY_: function(y) {
    return (y - this.minY) / this.deltaY;
  },

  /**
   * Normalize X value (value between 0 and 1)
   * @param {Number} y value between min and max to normalize
   * @return {Number} normalized X value
   * @private
   */
  normX_: function(x) {
    return (x - this.minX) / this.deltaX;
  },

  /**
   * Updates SVG polygons to represent the wave motion at the time passed in
   * @param {Number} time Elapsed time in milliseconds since wave motion started
   * @public
   */
  update: function(time) {
    var deltaX, deltaY;
    deltaX = time % this.durationX / this.durationX;
    deltaY = time % this.durationY / this.durationY;
    this.orgPolygons.each((function(_this) {
      return function(polygon, i) {
        var n, newPoints, offsetY, p, points, wavePosition, x, y, _i, _ref;
        points = polygon.points;
        newPoints = [];
        for (n = 0; n < points.numberOfItems; n++) {
          p = points.getItem(n);
          x = parseFloat(p.x);
          y = parseFloat(p.y);

          // Adjust x value based on secondary wave motion in X-axis
          x = x + _this.offsetX * Math.cos(deltaX * Math.PI * 2) * _this.normY_(y);

          // Distance from flagpole in X-axis determines where we are in the wave period
          wavePosition = _this.normX_(x) * _this.wavePeriod;

          // Distance from flagpole in X-axis determines how much we move in Y-axis
          offsetY = _this.interpolate_(_this.normX_(x), _this.offsetY_min, _this.offsetY_max);

          y = y + offsetY * Math.sin(deltaY * Math.PI * 2 + wavePosition);
          newPoints.push(x);
          newPoints.push(y);
        }
        return _this.polygons.eq(i).attr({
          points: newPoints
        });
      };
    })(this));
  }

};
