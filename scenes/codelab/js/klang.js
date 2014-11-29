goog.provide('Klang');

/**
 * A simple Klang stub which can be piped to the parent frame.
 */
Klang = {
  handler_: function() {},

  triggerEvent: function() {
    Klang.handler_.apply(null, arguments);
  },

  setEventListener: function(handler) {
    Klang.handler_ = handler;
  }
};
