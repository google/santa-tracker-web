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

goog.provide('app.Utils');


/**
 * @constructor
 */
var Utils = function() {
  this.lang = $('html').attr('lang') || 'en';
  this.isEnglish = (this.lang.split('-')[0] === 'en');;
};

Utils.CACHE_ = {};

Utils.prototype.capitalize = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

Utils.prototype.hasItemTranslation = function(container, item) {
  var key = 'speedsketch_item_' + item.replace(/\s+/g, '-');
  var msg = this.getMsgOrNull(container, key);
  return Boolean(msg);
};

Utils.prototype.getItemTranslation = function(container, item) {
  var key = 'speedsketch_item_' + item.replace(/\s+/g, '-');
  var msg = this.getMsgOrNull(container, key);

  if (!msg && this.isEnglish) {
    return item;
  }

  return msg;
};

Utils.prototype.getTranslation = function(container, key, variable, varValue) {
  variable = variable || null;
  varValue = varValue || null;
  var msg = this.getMsgOrNull(container, key, variable, varValue);

  return msg === null ? '[Unknown message: ' + key + ']' : msg;
};

Utils.prototype.getMsgOrNull = function(container, key, variable, varValue) {
  var text = null;

  // Get translated String
  if (!(key in Utils.CACHE_)) {
    var element = container.find('#' + key);
    if (element.length > 0) {
      text = element.text();
      Utils.CACHE_[key] = text;
    }
  } else {
    text = Utils.CACHE_[key];
  }

  // Replace value
  if (text && variable && varValue) {
    text = this.replaceVarWithValue(text, variable, varValue);
  }

  // Return it
  return text;
};

Utils.prototype.getInterpolatedTranslation = function(message, variable, varValue) {
  return this.replaceVarWithValue(message, variable, varValue);
};

Utils.prototype.replaceVarWithValue = function(messageString, variable, varValue) {
  varValue = String(varValue);
  var toBeReplacedString = '{{' + variable + '}}';
  return messageString.replace(toBeReplacedString, varValue);
};

app.Utils = new Utils();
