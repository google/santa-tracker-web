/*
 * Copyright 2017 Google Inc. All rights reserved.
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

goog.provide('app.ImageItemBow');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Bow image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemBow = function() {
  app.SVGImage.call(this);

  this.width = 86;
  this.height = 63;
};
app.ImageItemBow.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemBow.prototype.getSVGString = function(color) {
  var colors = app.Constants.SVG_COLOR_MATRIX[color];
  var data = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 86.01 63.03" width="86.01" height="63.03"><defs><style>.cls-1{fill:' + colors.primary + ';}.cls-2{fill:' + colors.medium + ';}.cls-3{fill:' + colors.highlight + ';}.cls-4{fill:' + colors.dark + ';}</style></defs><path class="cls-1" d="M40.86,31.43l-1.2-6.08h0l-.57.56.14,5.63S34,45.75,15.78,55.21h0L15.22,63C37.35,50.12,40.86,31.43,40.86,31.43Z"/><path class="cls-2" d="M39.66,25.35l-.44,6.2S34,45.75,15.78,55.21v.22L16,52.85,4,48.66S29.57,35.41,39.66,25.35"/><path class="cls-1" d="M39.82,21.39S30.24,4.8,14,.26c0,0-3.28-1.5-5.62,2.69A18.92,18.92,0,0,0,7.15,5.6h0c-1.64,0-4.61.29-5.43,3.4C.17,14.92-1.09,23.94,1.45,37.41c0,0,.57,5.74,7.5,3.69,6.16-1.82,29.32-10.24,29.32-10.24Zm-1.31-.33h0ZM7.63,5.63Zm.63.08L8,5.67c.12-.24.24-.48.37-.72C10.7.76,14,2.26,14,2.26,25.91,5.59,34.23,15.4,37.82,20.39,34.53,17.25,22.64,6.9,8.26,5.71Z"/><path class="cls-2" d="M8.26,5.71C22.65,6.9,34.53,17.25,37.82,20.39,34.23,15.4,25.91,5.59,14,2.26,14,2.26,10.7.76,8.36,5c-.13.24-.25.48-.37.72Z"/><path class="cls-3" d="M14,34a102.58,102.58,0,0,1,14.51.28l0,.07,9.75-3.46c-20.49,6-28.45-14.37-17.93-20.56A40.64,40.64,0,0,0,10.13,7.43a4.7,4.7,0,0,0-.64,1.39C8,14.35,7.46,26.33,14.08,34Z"/><path class="cls-4" d="M1.45,37.41S2,43.15,9,41.1c3.49-1,12.85-4.33,20-6.87l-.37,0C6.45,32.44,1.37,37,1.45,37.41Z"/><path class="cls-1" d="M45.15,31.43l1.2-6.08h0l.57.56-.14,5.63s5.26,14.2,23.44,23.66h0L70.79,63C48.66,50.12,45.15,31.43,45.15,31.43Z"/><path class="cls-2" d="M46.35,25.35l.44,6.2s5.26,14.2,23.44,23.66v.22l-.18-2.58,12-4.19S56.44,35.41,46.35,25.35"/><path class="cls-1" d="M47.74,30.86S70.9,39.28,77.06,41.1c6.93,2,7.5-3.69,7.5-3.69C87.1,23.94,85.84,14.92,84.28,9c-.82-3.11-3.79-3.45-5.43-3.4h0A18.92,18.92,0,0,0,77.65,3C75.31-1.24,72,.26,72,.26,55.77,4.8,46.2,21.39,46.2,21.39Zm-.23-9.81h0ZM78.38,5.63ZM48.19,20.39C51.78,15.4,60.1,5.59,72,2.26c0,0,3.28-1.5,5.62,2.69.13.24.25.48.37.72l-.27,0C63.37,6.9,51.49,17.25,48.19,20.39Z"/><path class="cls-2" d="M77.75,5.71C63.37,6.9,51.48,17.25,48.19,20.39,51.78,15.4,60.1,5.59,72,2.26c0,0,3.28-1.5,5.62,2.69.13.24.25.48.37.72Z"/><path class="cls-3" d="M72,34a102.58,102.58,0,0,0-14.51.28l0,.07-9.75-3.46c20.49,6,28.45-14.37,17.93-20.56A40.76,40.76,0,0,1,75.88,7.43a4.7,4.7,0,0,1,.64,1.39c1.45,5.53,2,17.51-4.59,25.15Z"/><path class="cls-4" d="M84.56,37.41s-.57,5.74-7.5,3.69c-3.49-1-12.85-4.33-20-6.87l.37,0C79.56,32.44,84.65,37,84.56,37.41Z"/><path class="cls-2" d="M54.1,24.37c.42-2,5.78-3.52,3.49-5.61S46.31,25.2,46.31,25.2H39.82s-9-8.54-11.28-6.44,3.07,3.6,3.49,5.61-6-.33-6,1.68,6.12,7.86,15.42,1.5a4.11,4.11,0,0,1,3.12,0c9.31,6.36,15.43.52,15.43-1.5S53.68,26.39,54.1,24.37Z"/><rect class="cls-1" x="37.81" y="20.38" width="10.38" height="14.34" rx="2.27" ry="2.27"/><path class="cls-3" d="M37.81,26.39s.61,1.16,5.2,1.16,5.19-1.16,5.19-1.16V22.78H37.81Z"/><path class="cls-2" d="M44.36,32.77H41.65a7.11,7.11,0,0,1-3.84-1.12v.8a2.27,2.27,0,0,0,2.27,2.27h5.85a2.27,2.27,0,0,0,2.27-2.27v-.8A7.08,7.08,0,0,1,44.36,32.77Z"/></svg>';
  return data;
};
