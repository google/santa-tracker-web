/**
 * @type {Object}
 */
var VillageUtils = {};

/**
 * Re-triggers a given event on one object to another.
 *
 * @param {Object} origin the object where the event originates.
 * @param {string} eventName the event name.
 * @param {Object} target the object to trigger the event.
 * @param {string=} newEventName the event name to trigger on target.
 * @return {SantaEventListener}
 */
VillageUtils.forwardEvent = function(origin, eventName, target, newEventName) {
  if (!newEventName) {
    newEventName = eventName;
  }
  return Events.addListener(origin, eventName,
      _.bind(Events.trigger, window, target, newEventName));
};

/**
 * Transform CSS property name, with vendor prefix if required.
 * @type {string}
 * @const
 */
VillageUtils.CSS_TRANSFORM = Modernizr.csstransforms ?
    /** @type {string}  */ (Modernizr.prefixed('transform')) : 'transform';

/**
 * True if transitions are supported by this browser.
 * @type {boolean}
 * @const
 */
VillageUtils.TRANSITIONS_SUPPORTED = Modernizr.csstransitions;
