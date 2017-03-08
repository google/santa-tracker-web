/*
 * Copyright 2016 Google Inc. All rights reserved.
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

goog.provide('Snowflake.Storage');

goog.require('Blockly');

Snowflake.Storage.WORKSPACE_KEY = "snowflake-workspace"

/**
 * Storage class for Snowflake. Handles all interactions with sessionStorage.
 * @constructor
 * @export
 */
Snowflake.Storage = function() {
  /**
   * Whether sessionStorage is available. This is checked at construction and then cached.
   * @type {boolean}
   * @private
  */
  this.available_ = this.storageAvailable('sessionStorage');
};

/**
 * Determines whether or not storage is supported and available.
 * @param {String} type The type of storage to check for (e.g. sessionStorage).
 * @returns {boolean} whether or not storage is available.
 */
Snowflake.Storage.prototype.storageAvailable = function(type) {
  try {
    var storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch(e) {
    return false;
  }
};

/**
 * Serializes a workspace and stores it in sessionStorage if it is available.
 * @param {!Blockly.Workspace} workspace The workspace to serialize.
 * @returns whether or not workspace was stored.
 */
Snowflake.Storage.prototype.storeWorkspace = function(workspace) {
  if (!this.available_) {
    return false;
  }
  var xml = Blockly.Xml.workspaceToDom(workspace);
  var xmlText = Blockly.Xml.domToText(xml);
  sessionStorage.setItem(Snowflake.Storage.WORKSPACE_KEY, xmlText);
  return true;
};

/**
 * Loads a workspace from sessionStorage (if available) into the given workspace object.
 * @param {!Blockly.Workspace} workspace The workspace to populate.
 * @returns whether or not workspace was restored.
 */
Snowflake.Storage.prototype.restoreWorkspace = function(workspace) {
  if (!this.available_) {
    return false;
  }
  var xmlText = sessionStorage.getItem(Snowflake.Storage.WORKSPACE_KEY);
  if (!xmlText) {
    return false;
  }

  var xml = Blockly.Xml.textToDom(xmlText);
  if (!xml.firstElementChild || xml.firstElementChild.firstElementChild.nodeName == "parsererror") {
    return false;
  }
  workspace.clear();
  Blockly.Xml.domToWorkspace(xml, workspace);
  return true;
};