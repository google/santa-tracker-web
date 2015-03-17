goog.provide('app.utils');



app.utils = {
  debounce: function(func, threshold) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var delayed = function() {
        timeout = null;
        func.apply(context, args);
      };
      if (timeout) {
        window.clearTimeout(timeout);
      }
      timeout = window.setTimeout(delayed, threshold);
    }
  }
};
