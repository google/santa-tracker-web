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
 * @constructor
 */
function Traditions(el, componentDir) {
  /**
   * @private {!Element}
   */
  this.el_ = el;
  this.componentDir = componentDir;

  /**
   * @private {String}
   */
  this.currentId_ = null;

  /**
   * @private {!Object}
   */
  this.markers_ = {};

  this.setup();
}

/**
 * Color of the water. *Should* be the same as whatever Maps defaults to.
 * Must be a hex color.
 *
 * @type {string}
 * @const
 * @private
 */
Traditions.WATER_COLOR_ = '#f6efe2';

Traditions.prototype.setup = function() {
  /**
   * @type {google.maps.Icon}
   * @private
   */
  this.SMALL_PIN_ = {
    anchor: new google.maps.Point(12, 12),
    scaledSize: new google.maps.Size(540, 53),
    size: new google.maps.Size(54, 53),
    url: this.componentDir + 'img/pins_small_2x.png'
  };

  /**
   * @type {google.maps.Icon}
   * @private
   */
  this.BIG_PIN_ = {
    anchor: new google.maps.Point(24, 24),
    scaledSize: new google.maps.Size(1080, 106),
    size: new google.maps.Size(107, 106),
    url: this.componentDir + 'img/pins_large_2x.png'
  };

  /**
   * @private {google.maps.LatLngBounds}
   */
  this.markerBounds_ = null;

  if (document.documentElement.lang.indexOf('en') == 0) {
    this.el_.querySelector('#lessons-popup').hidden = false;
  }
};

/**
 * Show this scene. Must be paired with a later call to onHide.
 */
Traditions.prototype.onShow = function() {
  this.map_ = new google.maps.Map(this.el_.querySelector('#traditions-map'), {
    center: new google.maps.LatLng(0, 0),
    zoom: 1,
    disableDefaultUI: true,
    scrollwheel: false,
    draggable: false,
    disableDoubleClickZoom: true,
    backgroundColor: Traditions.WATER_COLOR_,
    // It's important that we have map styles -- this prevents a call to
    // staticmap.
    styles: mapstyles.styles
  });

  this.markerBounds_ = new google.maps.LatLngBounds()
  this.addCountryMarkers_();

  $(window).on('resize.traditions', this.handleResize_.bind(this));
};

/**
 * @type {number}
 * @private
 */
Traditions.SMALL_PIN_OFFSET_ = 54;

/**
 * @type {number}
 * @private
 */
Traditions.BIG_PIN_OFFSET_ = 107;

/**
 * @type {number}
 * @private
 */
Traditions.NUM_PINS_ = 10;

/**
 * Display the previous country.
 */
Traditions.prototype.prevCountry = function() {
  var active = $('.tradition-active', this.el_);
  var id;
  if (active.length) {
    id = active.prev().data('id');
  }

  if (!id) {
    id = $('.traditions-tradition', this.el_).last().data('id');
  }

  this.show(id);
  return false;
};

/**
 * Display the next country.
 */
Traditions.prototype.nextCountry = function() {
  var active = $('.tradition-active', this.el_);
  var id;
  if (active.length) {
    id = active.next().data('id');
  }

  if (!id) {
    id = $('.traditions-tradition', this.el_).first().data('id');
  }

  this.show(id);
  return false;
};

/**
 * Add each supported country's marker to the map.
 * @private
 */
Traditions.prototype.addCountryMarkers_ = function() {
  Traditions.COUNTRIES_.forEach(function(country, i) {
    var offset = (i % Traditions.NUM_PINS_) * Traditions.SMALL_PIN_OFFSET_;
    var smallIcon = {
      anchor: this.SMALL_PIN_.anchor,
      scaledSize: this.SMALL_PIN_.scaledSize,
      size: this.SMALL_PIN_.size,
      url: this.SMALL_PIN_.url,
      origin: new google.maps.Point(offset, 0)
    };

    var marker = new google.maps.Marker({
      position: country.geometry.location,
      map: this.map_,
      icon: smallIcon
    });

    this.markerBounds_.extend(marker.getPosition());

    offset = (i % Traditions.NUM_PINS_) * Traditions.BIG_PIN_OFFSET_;
    var bigIcon = {
      anchor: this.BIG_PIN_.anchor,
      scaledSize: this.BIG_PIN_.scaledSize,
      size: this.BIG_PIN_.size,
      url: this.BIG_PIN_.url,
      origin: new google.maps.Point(offset, 0)
    };

    this.markers_[country.country_key] = {
      marker: marker,
      info: country,
      smallIcon: smallIcon,
      bigIcon: bigIcon
    };

    var handler = this.show.bind(this, country.country_key);
    google.maps.event.addListener(marker, 'click', handler);
  }, this);

  this.map_.fitBounds(this.markerBounds_);
};

/**
 * @private
 */
Traditions.prototype.handleResize_ = function() {
  if (this.currentId_) {
    this.verticalAlignText_();

    var country = this.markers_[this.currentId_];

    var viewport = new google.maps.LatLngBounds(
      new google.maps.LatLng(country.info.geometry.viewport.southwest.lat,
                             country.info.geometry.viewport.southwest.lng),
      new google.maps.LatLng(country.info.geometry.viewport.northeast.lat,
                             country.info.geometry.viewport.northeast.lng)
    );
    this.map_.fitBounds(this.padBounds_(viewport));
  }
};

/**
 * @private
 */
Traditions.prototype.verticalAlignText_ = function() {
  var text = $('.tradition-active', this.el_);
  text.css('margin-top', -text.height() / 2);
};

/**
 * Show the entire Earth and all countries (the default).
 */
Traditions.prototype.showWorld = function() {
  $('#tradition-img', this.el_).removeClass();
  if (this.currentId_) {
    var marker = this.markers_[this.currentId_].marker;
    marker.setIcon(this.markers_[this.currentId_].smallIcon);
    this.getCountryEl_(this.currentId_).removeClass('tradition-active');
  }

  this.currentId_ = null;
  this.map_.fitBounds(this.markerBounds_);
};

/**
 * Hides this scene.
 */
Traditions.prototype.onHide = function() {
  if (this.currentId_) {
    var marker = this.markers_[this.currentId_].marker;
    marker.setIcon(this.markers_[this.currentId_].smallIcon);
    this.getCountryEl_(this.currentId_).removeClass('tradition-active');
  }

  $('#tradition-img', this.el_).removeClass();

  this.currentId_ = null;

  $(window).off('resize.traditions');
};

/**
 * Switch to showing the specified country.
 * @param {string} id country code
 */
Traditions.prototype.show = function(id) {
  if (id === this.currentId_) {
    return;
  }
  var countryEl = this.getCountryEl_(id);

  if (this.currentId_) {
    var marker = this.markers_[this.currentId_].marker;
    marker.setIcon(this.markers_[this.currentId_].smallIcon);
    this.getCountryEl_(this.currentId_).removeClass('tradition-active');
  }

  if (!id || !countryEl.length) {
    this.showWorld();
    return;
  }

  this.currentId_ = id;
  countryEl.addClass('tradition-active');
  this.verticalAlignText_();

  $('#tradition-img', this.el_).removeClass().addClass('active').addClass(id);

  $(this.el_).find('img.feature').show().attr('src',
      this.componentDir + '/img/' + id + '.png');

  var country = this.markers_[id];
  country.marker.setIcon(this.markers_[this.currentId_].bigIcon);
  this.handleResize_();
};

/**
 * Adds padding to a bounds for each country.
 *
 * @private
 * @param {!google.maps.LatLngBounds} bounds to grow
 * @return {!google.maps.LatLngBounds}
 */
Traditions.prototype.padBounds_ = function(bounds) {
  var width = bounds.toSpan().lng();
  var newSW = new google.maps.LatLng(
    bounds.getSouthWest().lat(),
    bounds.getSouthWest().lng() - width * .3);

  return bounds.extend(newSW);
};

/**
 * @private
 * @param {string} id country to find
 * @return {!jQuery} jQuery object containing country element
 */
Traditions.prototype.getCountryEl_ = function(id) {
  return $(this.el_).find('[data-id=' + id + ']');
};

/**
 * @private
 * @type {!Array.<!Object>}
 */
Traditions.COUNTRIES_ = [{
    'country_key': 'us',
    'geometry': {
      'location': {
        'lat': 38.9,
        'lng': -77
      },
      'viewport': {
        'northeast': {
          'lat': 49.38,
          'lng': -66.94
        },
        'southwest': {
          'lat': 25.82,
          'lng': -124.39
        }
      }
    }
  }, {
    'country_key': 'mx',
    'geometry': {
      'location': {
        'lat': 19.42,
        'lng': -99.13
      },
      'viewport': {
        'northeast': {
          'lat': 32.7187629,
          'lng': -86.7105711
        },
        'southwest': {
          'lat': 14.5345485,
          'lng': -118.3644301
        }
      }
    }
  }, {
    'country_key': 'gt',
    'geometry': {
      'location': {
        'lat': 14.62,
        'lng': -90.52
      },
      'viewport': {
        'northeast': {
          'lat': 17.8157113,
          'lng': -88.2256151
        },
        'southwest': {
          'lat': 13.7400214,
          'lng': -92.2318358
        }
      }
    }
  }, {
    'country_key': 'ca',
    'geometry': {
      'location': {
        'lat': 45.423,
        'lng': -75.70
      },
      'viewport': {
        'northeast': {
          'lat': 68,
          'lng': -62
        },
        'southwest': {
          'lat': 48,
          'lng': -128
        }
      }
    }
  }, {
    'country_key': 'ar',
    'geometry': {
      'location': {
        'lat': -34.60,
        'lng': -58.38
      },
      'viewport': {
        'northeast': {
          'lat': -21.7808136,
          'lng': -53.637481
        },
        'southwest': {
          'lat': -55.0577146,
          'lng': -73.5603601
        }
      }
    }
  }, {
    'country_key': 'br',
    'geometry': {
      'location': {
        'lat': -15.79,
        'lng': -47.89
      },
      'viewport': {
        'northeast': {
          'lat': 5.271602,
          'lng': -32.3783765
        },
        'southwest': {
          'lat': -33.7517484,
          'lng': -73.982817
        }
      }
    }
  }, {
    'country_key': 'is',
    'geometry': {
      'location': {
        'lat': 64.134,
        'lng': -21.89
      },
      'viewport': {
        'northeast': {
          'lat': 66.5663182,
          'lng': -13.4958154
        },
        'southwest': {
          'lat': 63.2961021,
          'lng': -24.546524
        }
      }
    }
  }, {
    'country_key': 'uk',
    'geometry': {
      'location': {
        'lat': 51.50,
        'lng': -0.11
      },
      'viewport': {
        'northeast': {
          'lat': 60.856553,
          'lng': 1.7627096
        },
        'southwest': {
          'lat': 49.8700191,
          'lng': -8.6493573
        }
      }
    }
  }, {
    'country_key': 'gh',
    'geometry': {
      'location': {
        'lat': 5.56,
        'lng': -0.18
      },
      'viewport': {
        'northeast': {
          'lat': 11.1666675,
          'lng': 1.1993625
        },
        'southwest': {
          'lat': 4.73887379,
          'lng': -3.260786
        }
      }
    }
  }, {
    'country_key': 'fr',
    'geometry': {
      'location': {
        'lat': 48.85,
        'lng': 2.35
      },
      'viewport': {
        'northeast': {
          'lat': 51.0891663,
          'lng': 9.5597934
        },
        'southwest': {
          'lat': 41.3423276,
          'lng': -5.140402
        }
      }
    }
  }, {
    'country_key': 'de',
    'geometry': {
      'location': {
        'lat': 52.51,
        'lng': 13.4
      },
      'viewport': {
        'northeast': {
          'lat': 55.058347,
          'lng': 15.0418961
        },
        'southwest': {
          'lat': 47.2701114,
          'lng': 5.8663425
        }
      }
    }
  }, {
    'country_key': 'gr',
    'geometry': {
      'location': {
        'lat': 37.98,
        'lng': 23.72
      },
      'viewport': {
        'northeast': {
          'lat': 41.804,
          'lng': 26.806
        },
        'southwest': {
          'lat': 35.8534,
          'lng': 19.4458
        }
      }
    }
  }, {
    'country_key': 'kg',
    'geometry': {
      'location': {
        'lat': 42.875,
        'lng': 74.59
      },
      'viewport': {
        'northeast': {
          'lat': 43.2653569,
          'lng': 80.2265592
        },
        'southwest': {
          'lat': 39.180254,
          'lng': 69.250998
        }
      }
    }
  }, {
    'country_key': 'ru',
    'geometry': {
      'location': {
        'lat': 55.74,
        'lng': 37.62
      },
      'viewport': {
        'northeast': {
          'lat': 73,
          'lng': 74
        },
        'southwest': {
          'lat': 48,
          'lng': 30
        }
      }
    }
  }, {
    'country_key': 'ph',
    'geometry': {
      'location': {
        'lat': 14.59,
        'lng': 120.98
      },
      'viewport': {
        'northeast': {
          'lat': 19.574024,
          'lng': 126.6043837
        },
        'southwest': {
          'lat': 4.61344429,
          'lng': 116.7031626
        }
      }
    }
  }, {
    'country_key': 'au',
    'geometry': {
      'location': {
        'lat': -35.28,
        'lng': 149.12
      },
      'viewport': {
        'northeast': {
          'lat': -9.22572229,
          'lng': 153.6386739
        },
        'southwest': {
          'lat': -43.658327,
          'lng': 112.9239721
        }
      }
    }
  }, {
    'country_key': 'nz',
    'geometry': {
      'location': {
        'lat': -41.29,
        'lng': 174.77
      },
      'viewport': {
        'northeast': {
          'lat': -34.1295577,
          'lng': 179.0625356
       },
       'southwest': {
          'lat': -47.76811,
          'lng': 166.426136
       }
    }
  }
}];
