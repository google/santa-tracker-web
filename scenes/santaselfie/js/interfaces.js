/* These objects are only used for documentation */



/**
 * @constructor
 * @param {!jQuery} $elem The container element
 */
app.GameObject = function($elem) {};


/**
 * Start will be called when the DOM elements have been created.
 * This is a good place to hook up events such as mouse handling.
 */
app.GameObject.prototype.start = function() {};


/**
 * Respond to mouse and touch events.
 * @param {!app.Mouse} mouse Global game mouse object
 */
app.GameObject.prototype.mouseChanged = function(mouse) {};
