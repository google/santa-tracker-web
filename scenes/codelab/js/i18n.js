goog.provide('app.I18n');

/**
 * A simple cache of translations.
 * @type {Object.<string>}
 * @private
 */
app.I18n.CACHE_ = {};

app.I18n.COUNT = 0;

/**
 * Gets the message with the given key from the document.
 * @param {string} key The key of the document element.
 * @return {string} The textContent of the specified element,
 *     or an error message if the element was not found.
 */
app.I18n.getMsg = function(key) {
  var msg = app.I18n.getMsgOrNull(key);
  return msg === null ? '[Unknown message: ' + key + ']' : msg;
};

/**
 * Gets the message with the given key from the document.
 * @param {string} key The key of the document element.
 * @return {string} The textContent of the specified element,
 *     or null if the element was not found.
 */
app.I18n.getMsgOrNull = function(key) {
  if (!(key in app.I18n.CACHE_)) {
    var element = document.getElementById(key);
    if (element) {
      var text = element.textContent;
      // Convert newline sequences.
      text = text.replace(/\\n/g, '\n');
      return text;
      //app.I18n.CACHE_[key] = text;
    } else {
      app.I18n.CACHE_[key] = null;
    }
  }
  return app.I18n.CACHE_[key];
};
