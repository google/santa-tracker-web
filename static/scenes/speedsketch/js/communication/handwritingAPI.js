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
'use strict';

goog.provide('app.HandwritingAPI');
goog.require('app.Constants');


app.HandwritingAPI = function() {
};


app.HandwritingAPI.prototype.processSegments = function(segments, width, height) {
  return this.sendRequest(segments, {
    width: width,
    height: height
  });
};


app.HandwritingAPI.prototype.getSimilarDrawings = function(segments, width, height) {
  return this.sendRequest(segments, {
    similar_drawings: true,
    width: width,
    height: height
  });
};


app.HandwritingAPI.prototype.sendRequest = function(segments, options) {
  var request = {
    'recognizer_name': options.similar_drawings ? 'recognizers/santaquickdraw-ink' : 'recognizers/santaquickdraw',
    'inks': [],
    'request_options': {
      'allow_retain_log': false
    },
    'client_info': {
      'browser_info': {
	'user_agent': navigator.userAgent
      },
      'app_version': 1
    }
  };
  
  var ink = {};
  
  if (options.width) {
    ink['context'] = {
      'writing_area': {
	'width': options.width,
	'height': options.height
      }
    };
  }
  
  if (segments) {
    var strokes = [];
    for (var segment of segments) {
      var points = [];
      for (var i = 0; i < segment[0].length; i++) {
	points.push(
	  {
	    'x': segment[0][i],
	    'y': segment[1][i],
	    't': (segment[2][i] / 1000).toFixed(9) + 's'
	  }
	);
      }
      strokes.push({'points': points});
    }
    ink['strokes'] = strokes;
    request['inks'] = [ink];
  }
  
  return $.post({
    url: app.Constants.HANDWRITING_URL,
    data: JSON.stringify(request),
    contentType: 'application/json',
  });
};


app.HandwritingAPI.prototype.parseResponse = function(data) {
  var candidates = data['results'][0]['candidates'];
  var id = data['results'][0]['labeledInkName'].replace('labeledInks/', '');
  
  return candidates.map(function(s) {
    var label;
    var drawing = null;
    if (s['language'] === 'santaquickdraw-ink') {
      var parsed = JSON.parse(s['label']);
      label = parsed[0];
      drawing = parsed[1];
    } else {
      label = s['label'];
    }
    return {
      'word': label,
      'score': s['score'],
      'id': id,
      'neighbor': drawing
    }
  });
};
