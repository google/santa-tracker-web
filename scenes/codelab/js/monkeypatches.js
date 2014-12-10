goog.provide('app.monkeypatches');

goog.require('goog.dom.vendor');

/**
 * Returns the JS vendor prefix used in CSS properties. Different vendors
 * use different methods of changing the case of the property names.
 *
 * PATCH: To coexist with web-animations-js polyfill in Safari, the prefixes
 *    must match them by starting lowercase.
 *
 * @return {?string} The JS vendor prefix or null if there is none.
 */
goog.dom.vendor.getVendorJsPrefix = function() {
  if (goog.userAgent.WEBKIT) {
    return 'webkit';
  } else if (goog.userAgent.GECKO) {
    return 'moz';
  } else if (goog.userAgent.IE) {
    return 'ms';
  } else if (goog.userAgent.OPERA) {
    return 'O';
  }

  return null;
};
