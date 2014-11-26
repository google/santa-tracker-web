goog.provide('app.shared.FrameRPC');

app.shared.FrameRPC = function(options, api) {
  this.targetWindow = options;
  this.api = api;

  if(!!window.postMessage) {
    window.addEventListener('message', this.onReceiveMessage.bind(this), false);
  }
};

/**
 * Removes the event listeners from this module.
 */
app.shared.FrameRPC.prototype.dispose = function() {
  if(!!window.postMessage) {
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
