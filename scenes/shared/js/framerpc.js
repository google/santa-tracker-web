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

goog.provide('app.shared.FrameRPC');

/**
 * Simple RPC channel for communicating between frames using postMessage.
 *
 * @param {Element} target frame to send messages to.
 * @param {object} api of methods available to other frame.
 * @constructor
 */
app.shared.FrameRPC = function(target, api) {
  this.targetWindow = target;
  this.api = api;

  if (!!window.postMessage) {
    window.addEventListener('message', this.onReceiveMessage.bind(this), false);
  }
};

/**
 * Removes the event listeners from this module.
 */
app.shared.FrameRPC.prototype.dispose = function() {
  if (!!window.postMessage) {
    window.removeEventListener('message', this.onReceiveMessage, false);
  }
};

/**
 * Posts a message to the iframe
 **/
app.shared.FrameRPC.prototype.call = function(methodName/*, ...args */) {
  var message = {
    method: methodName,
    args: Array.prototype.slice.call(arguments, 1)
  };
  this.targetWindow.postMessage(message, '*');
};

/**
 * Callback for when we have received a message from the iframe.
 */
app.shared.FrameRPC.prototype.onReceiveMessage = function(event) {
  // Only process messages from our iframe.
  if (event.source !== this.targetWindow) {
    return;
  }
  var method = event.data.method;
  if (!method) {
    return;
  }

  var isPrivate = method[method.length - 1] === '_';
  if (this.api.hasOwnProperty(method) && !isPrivate) {
    this.api[method].apply(this.api, event.data.args);
  }
};
