goog.provide('app.encoding');


/**
 * Provides run length encoding functions
 * @return {encode: {function}, decode: {function}} Functions to encode and decode strings
 */
app.encoding = {
  encode: function(data) {
    var current = data[0];
    var encoded = '';
    var counter = 1;

    for (var i = 0; i < data.length; i++) {
      var next = data[i + 1];

      if (current === next) {
        counter++;
      } else {
        encoded += counter;
        encoded += current;

        current = data[i + 1];
        counter = 1;
      }
    }

    return encoded;
  },

  decode: function(encoded) {
    var runLengthMatcher = new RegExp('([0-9]+)', 'g');
    var charMatcher = new RegExp('([A-Za-z])', 'g');

    var runLengths = encoded.match(runLengthMatcher);
    var chars = encoded.match(charMatcher);

    var decoded = '';

    for (var i = 0; i < chars.length; i++) {
      var current = chars[i];
      var counter = runLengths[i];

      while (counter--) {
        decoded += current;
      }
    }

    return decoded;
  }
};
