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

goog.provide('app.ImageItemCandyGumdrop');
goog.require('app.Constants');
goog.require('app.SVGImage');


/**
 * Candy gumdrop image
 * @constructor
 * @extends {app.SVGImage}
 */
app.ImageItemCandyGumdrop = function() {
  app.SVGImage.call(this);

  this.width = 46.1;
  this.height = 50.3;
};
app.ImageItemCandyGumdrop.prototype = Object.create(app.SVGImage.prototype);


app.ImageItemCandyGumdrop.prototype.getSVGString = function(color) {
  var data = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 25.63 27.9" width="25.63" height="27.9"><defs><style>.cls-2{fill:' + color + ';}.cls-3{opacity:0.2;}.cls-5{opacity:0.5;}.cls-6{fill:#fff;}.cls-7{opacity:0.75;}</style></defs><path class="cls-2" d="M25.53,21.75,22,4.12a5.14,5.14,0,0,0-5-4.12H8.69a5.15,5.15,0,0,0-5,4.12L.1,21.75a5.14,5.14,0,0,0,5,6.15H20.49A5.14,5.14,0,0,0,25.53,21.75Z" transform="translate(0 0)"/><g class="cls-3"><path d="M25.53,21.75,22,4.12A5.12,5.12,0,0,0,19,.43a5.89,5.89,0,0,1,.33,1l3.55,17.63a5.14,5.14,0,0,1-5,6.15H2.48a5.11,5.11,0,0,1-2-.42A5.13,5.13,0,0,0,5.14,27.9H20.49A5.14,5.14,0,0,0,25.53,21.75Z" transform="translate(0 0)"/></g><g class="cls-4"><g class="cls-5"><path class="cls-6" d="M6.53,25.23a.62.62,0,0,1-.51-.7H6a.62.62,0,0,1,.7-.52h0a.6.6,0,0,1,.51.69h0a.6.6,0,0,1-.6.52h-.1Zm7.27-7.62a.62.62,0,0,1-.54-.68h0a.62.62,0,0,1,.68-.54h0a.61.61,0,0,1,.54.68h0a.62.62,0,0,1-.61.55H13.8Zm-4.87-6a.62.62,0,0,1-.59-.64h0A.61.61,0,0,1,9,10.35H9a.62.62,0,0,1,.59.64h0a.61.61,0,0,1-.61.58h0ZM3.17,18.23a.62.62,0,0,1-.59-.64h0A.61.61,0,0,1,3.22,17h0a.62.62,0,0,1,.59.64h0a.61.61,0,0,1-.61.58h0ZM9,7.12a.61.61,0,0,1,.57-.65h0a.6.6,0,0,1,.65.57h0a.61.61,0,0,1-.57.65h0A.61.61,0,0,1,9,7.12Zm11.32.47a.61.61,0,0,1-.19-.84h0a.61.61,0,0,1,.85-.19h0a.61.61,0,0,1,.19.84h0a.61.61,0,0,1-.52.29h0A.6.6,0,0,1,20.28,7.59Zm-16-1.87A.61.61,0,0,1,4,4.88H4a.61.61,0,0,1,.84-.2h0a.62.62,0,0,1,.2.85h0a.64.64,0,0,1-.52.29h0A.58.58,0,0,1,4.23,5.72Z" transform="translate(0 0)"/></g><g class="cls-7"><path class="cls-6" d="M15.65,25.83a.59.59,0,0,1-.2-.83h0a.61.61,0,0,1,.84-.21h0a.6.6,0,0,1,.2.84h0a.58.58,0,0,1-.52.29h0A.54.54,0,0,1,15.65,25.83Zm6.7,0a.59.59,0,0,1-.2-.83h0a.61.61,0,0,1,.84-.21h0a.6.6,0,0,1,.2.84h0a.58.58,0,0,1-.52.29h0A.54.54,0,0,1,22.35,25.83Zm-2.9-4.59h0a.6.6,0,0,1,.46-.73h0a.62.62,0,0,1,.73.47h0a.61.61,0,0,1-.46.73H20A.6.6,0,0,1,19.45,21.24ZM2.71,22.94a.62.62,0,0,1-.12-.86h0A.62.62,0,0,1,3.45,22h0a.61.61,0,0,1,.12.86h0a.6.6,0,0,1-.49.24h0A.63.63,0,0,1,2.71,22.94Zm8.14-1.22a.61.61,0,0,1-.66-.56h0a.61.61,0,0,1,.56-.66h0a.61.61,0,0,1,.66.55h0a.62.62,0,0,1-.56.67Zm4.39-.15a.62.62,0,0,1-.48-.73h0a.61.61,0,0,1,.72-.48h0a.61.61,0,0,1,.48.72h0a.63.63,0,0,1-.6.5h-.12Zm5.69-8.79h0a.62.62,0,0,1,.17-.85h0a.61.61,0,0,1,.85.17h0a.61.61,0,0,1-.16.85h0a.65.65,0,0,1-.34.11h0A.64.64,0,0,1,20.93,12.78Zm-3.69-.64a.61.61,0,0,1,.41-.76h0a.6.6,0,0,1,.76.4h0a.61.61,0,0,1-.4.77h0l-.18,0h0A.61.61,0,0,1,17.24,12.14Zm-4.46,1a.61.61,0,0,1-.31-.81h0a.6.6,0,0,1,.8-.31h0a.61.61,0,0,1,.32.81h0a.61.61,0,0,1-.56.36h0A.7.7,0,0,1,12.78,13.15ZM4.71,11.91a.61.61,0,0,1-.31-.81h0a.6.6,0,0,1,.8-.31h0a.61.61,0,0,1,.32.81h0A.61.61,0,0,1,5,12H5A.7.7,0,0,1,4.71,11.91Zm3.23,4.85a.6.6,0,0,1-.31-.8h0a.6.6,0,0,1,.8-.32h0a.62.62,0,0,1,.32.82h0a.62.62,0,0,1-.56.35h0A.53.53,0,0,1,7.94,16.76Zm6.83-7.43a.6.6,0,0,1,.46-.73h0a.6.6,0,0,1,.73.46h0a.61.61,0,0,1-.46.73h0l-.14,0h0A.61.61,0,0,1,14.77,9.33Zm1.77-3.65h0A.62.62,0,0,1,16,5h0a.6.6,0,0,1,.64-.57h0a.61.61,0,0,1,.57.65h0a.61.61,0,0,1-.61.57h0Zm2.47,12h0a.62.62,0,0,1-.58-.65h0a.6.6,0,0,1,.64-.57h0a.61.61,0,0,1,.57.65h0a.61.61,0,0,1-.61.57h0ZM10.68,3.64A.61.61,0,0,1,11,2.85h0a.61.61,0,0,1,.79.36h0a.61.61,0,0,1-.36.79h0a.52.52,0,0,1-.21,0h0A.61.61,0,0,1,10.68,3.64Zm-4.55.22a.61.61,0,0,1-.55-.66h0a.61.61,0,0,1,.66-.56h0a.62.62,0,0,1,.56.67h0a.63.63,0,0,1-.61.56H6.13Z" transform="translate(0 0)"/></g></g></svg>';
  return data;
};
