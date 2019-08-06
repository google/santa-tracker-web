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

goog.provide('app.SVGUtils');


var SVGUtils = function() {
};

SVGUtils.prototype.createSvgFromSegments = function(segments, w, h, options) {
  options = options || {};
  options.order = options.order || 0;
  options.color = options.color || '#000000';

  var _segments = [];
  if (options.order == 1) {
    // Flip the order of the segments array
    for (var i = 0; i < segments.length; i++) {
      var a = [[], []];
      for (var j = 0; j < segments[i].length; j++) {
        a[0].push(segments[i][j][0]);
        a[1].push(segments[i][j][1]);
      }
      _segments.push(a);
    }
  } else if (segments) {
    _segments = segments;
  }

  w -= options.padding * 2;
  h -= options.padding * 2;
  var svg = this.createSvg(w, h);

  var bounding = this.calculateBoundingBox(_segments);
  var aspect = w / h;
  var offset = [bounding.x, bounding.y];
  var scale;

  if( bounding.w / bounding.h > aspect) {
      scale = w / bounding.w;
      offset[1] -= 0.5 * (h / scale - bounding.h);
  } else {
      scale = h / bounding.h;
      offset[0] -= 0.5 * (w / scale - bounding.w);
  }

  var strokeWidth = 2 * w / 140;

  for (var i = 0; i < _segments.length; i++) {
    svg.appendChild(this.createLinePath(_segments[i], offset, scale, strokeWidth, options.color));
  }

  return svg;
};


SVGUtils.prototype.createSvg = function(w, h) {
  var aSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  aSvg.setAttribute('width', w);
  aSvg.setAttribute('height', h);
  aSvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  return aSvg;
};


SVGUtils.prototype.calculateBoundingBox = function(segments) {
  var minX = -1;
  var maxX = -1;
  var minY = -1;
  var maxY = -1;

  for (var i = 0; i < segments.length; i++) {
    for (var j = 0; j < segments[i][0].length ; j++) {
        if (minX == -1 || minX > segments[i][0][j]) {
            minX = segments[i][0][j];
        }
        if (maxX == -1 || maxX < segments[i][0][j]) {
            maxX = segments[i][0][j];
        }
        if (minY == -1 || minY > segments[i][1][j]) {
            minY = segments[i][1][j];
        }
        if (maxY == -1 || maxY < segments[i][1][j]) {
            maxY = segments[i][1][j];
        }
    }
  }

  return {
    x: minX - 5,
    y: minY - 5,
    w: maxX - minX + 10,
    h: maxY - minY + 10
  };
};

SVGUtils.prototype.createLinePath = function(segments, offset, scale, strokeWidth, color) {
  if (segments.length == 0 || segments[0].length == 0) {
    return;
  }

  var t = function(p, axis) {
      return (p - offset[axis]) * scale;
  };

  var aLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  var d = 'M' + t(segments[0][0], 0) + ' ' + t(segments[1][0], 1);

  for (var i = 1; i < segments[0].length; i++) {
      d += ' L' + t(segments[0][i], 0) + ' ' + t(segments[1][i], 1);
  }

  aLine.setAttribute('d', d);
  aLine.setAttribute('stroke', color);
  aLine.setAttribute('stroke-width', strokeWidth);
  aLine.setAttribute('stroke-linecap', 'round');
  aLine.setAttribute('fill', 'none');

  return aLine;
};

app.SVGUtils = new SVGUtils();
