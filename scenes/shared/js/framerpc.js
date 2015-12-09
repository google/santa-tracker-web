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
 * @param {Window} target frame to send messages to.
 * @param {Object} api of methods available to other frame.
 * @constructor
 */
app.shared.FrameRPC = function(target, api) {
  var isChild = target === window.parent;
  this.targetWindow = target;
  this.api = api;
  this.buffered = [];
  this.isReady = isChild;

  if (!!window.postMessage) {
    window.addEventListener('message', this.onReceiveMessage.bind(this), false);

    if (isChild) {
      this.call('__ready');
    }
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
 *
 * @param {string} methodName rpc method to call.
 * @param {...*} args parameters for rpc method.
 **/
app.shared.FrameRPC.prototype.call = function(methodName, args) {
  var message = {
    method: methodName,
    args: Array.prototype.slice.call(arguments, 1)
  };

  if (this.isReady) {
    this.targetWindow.postMessage(message, '*');
  } else {
    this.buffered.push(message);
  }
};

/**
 * Callback for when we have received a message from the iframe.
 *
 * @param {Event} event post message event.
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

  if (method === '__ready') {
    this.ready_();
    return;
  }

  var isPrivate = method[method.length - 1] === '_';
  if (this.api.hasOwnProperty(method) && !isPrivate) {
    this.api[method].apply(this.api, event.data.args);
  }
};

/**
 * Mark the channel as ready and send any buffered messages.
 *
 * @private
 */
app.shared.FrameRPC.prototype.ready_ = function() {
  this.isReady = true;
  var message;
  while (message = this.buffered.shift()) {
    this.targetWindow.postMessage(message, '*');
  }
};
