/**
 * @constructor
 */
function SantaMap(el) {
  /**
   * HTML container for the map.
   * @private {Element}
   */
  this.el_ = el;
}


/**
 * Color of the water. *Should* be the same as whatever Maps defaults to.
 * Must be a hex color.
 *
 * @type {string}
 * @const
 * @private
 */
SantaMap.WATER_COLOR_ = '#f6efe2';


/**
 * Renders the map in the container.
 *
 * @type {string}
 * @const
 * @private
 */
SantaMap.prototype.createMap = function() {
  return new google.maps.Map(this.el_, {
    center: new google.maps.LatLng(0, 0),
    zoom: 1,
    disableDefaultUI: true,
    scrollwheel: false,
    draggable: false,
    disableDoubleClickZoom: true,
    backgroundColor: SantaMap.WATER_COLOR_,
    // It's important that we have map styles -- this prevents a call to
    // staticmap.
    styles: [{
      'stylers': [
        { 'visibility': 'off' }
      ]
    },{
      'featureType': 'water',
      'stylers': [
        { 'visibility': 'on' },
        { 'color': SantaMap.WATER_COLOR_ }
      ]
    },{
      'featureType': 'landscape',
      'stylers': [
        { 'visibility': 'on' },
        { 'lightness': 110 },
        { 'color': '#dfd7c5' }
      ]
    },{
      'featureType': 'administrative.country',
      'elementType': 'geometry.stroke',
      'stylers': [
        { 'visibility': 'on' },
        { 'invert_lightness': true },
        { 'gamma': 3.75 },
        { 'lightness': 70 },
        { 'weight': 1 }
      ]
    },{
      'featureType': 'water',
      'elementType': 'labels',
      'stylers': [
        { 'weight': 0.8 },
        { 'color': '#c5c6c4' },
        { 'lightness': 5 }
      ]
    },{
      'featureType': 'landscape.natural',
      'elementType': 'labels',
      'stylers': [
        { 'visibility': 'on' },
        { 'weight': 0.3 },
        { 'invert_lightness': true },
        { 'lightness': 40 }
      ]
    }]
  });
};


/**
 * Adds padding to the latlng bounds for a map area.
 * @return {!google.maps.LatLng}
 */
SantaMap.padBounds_ = function(bounds) {
  var width = bounds.toSpan().lng();
  var newSW = new google.maps.LatLng(
    bounds.getSouthWest().lat(),
    bounds.getSouthWest().lng() - width * .3);

  return bounds.extend(newSW);
};


