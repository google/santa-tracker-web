/**
 * Bubble allows to pierce holes in a canvas overlay.
 *
 * @contructor
 * @param {number} x Bubble's location along x axis.
 * @param {number} y Bubble's location along y axis.
 * @param {Element} overlay A <bubble-overlay> Polymer element.
 */
function Bubble(x, y, overlay) {
  if (overlay.tagName !== 'BUBBLE-OVERLAY') {
    console.warn('Overlay has to be a <bubble-overlay> element.');
  }
  this.x = x;
  this.y = y;
  this.originX = x;
  this.originY = y;
  this.radius = 0;
  this.scale = 1;
  this.overlay = overlay;
  this.animationDuration = 300;
  this.eventTarget_ = this.createEventTarget_();
  this.updateEventTarget_();
  document.body.appendChild(this.eventTarget_);
  this.overlay.registerBubble(this);

  if (!this.overlay.bubbles) {
    this.overlay.bubbles = [];
  }
  this.overlay.bubbles.push(this);
};


Bubble.EventType = {
  UPDATE: 'bubble-update',
  RESIZE: 'bubble-resize'
};

/**
 * Easing function for bubble animations.
 * @param {number} t current frame index.
 * @param {number} b start value.
 * @param {number} b end value.
 * @param {number} d number of frames.
 */
Bubble.easeOutQuad = function(t, b, c, d) {
  t /= d/2;
  if (t < 1) return c / 2 * t * t + b;
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
};


Bubble.prototype.createEventTarget_ = function() {
  var eventTarget = document.createElement('div');
  eventTarget.style.borderRadius = '50%';
  eventTarget.style.position = 'absolute';
  eventTarget.style.zIndex = 4;
  return eventTarget;
};


Bubble.prototype.updateEventTarget_ = function() {
  this.eventTarget_.style.width = 2 * this.radius + 'px';
  this.eventTarget_.style.height = 2 * this.radius + 'px';
  this.eventTarget_.style.left = this.x - this.radius + 'px';
  this.eventTarget_.style.top = this.y - this.radius + 'px';
};

Bubble.prototype.createEvent_ = function(eventType) {
  var event = document.createEvent('CustomEvent');
  event.initCustomEvent(eventType, true, true, null);
  return event;
}

/**
 * Changes bubble's radius.
 * @param {number} radius A new radius.
 * @param {Function} callback To be called after opening is finished.
 */
Bubble.prototype.open = function(radius, callback) {
  this.eventTarget_.dispatchEvent(this.createEvent_('openstart'));

  function animate(radius) {
    this.move(this.x, this.y, radius);
    this.updateEventTarget_();
    this.eventTarget_.dispatchEvent(this.createEvent_(Bubble.EventType.RESIZE));
    a++;
    if (frames[a] !== undefined) {
      requestAnimationFrame(animate.bind(this, frames[a]));
    } else {
      if (callback) {
          this.eventTarget_.dispatchEvent(this.createEvent_('openend'));
        callback();
      }
    }
  }

  // Pre-calculate frames to save time during rendering.
  var framesNo = Math.floor(this.animationDuration/(1000/60)); // 60fps.
  var frames = [];
  var diffRadius = radius - this.radius;
  for (var t = 0; t <= framesNo; t++) {
    frames.push(
      Math.round(Bubble.easeOutQuad(t, this.radius, diffRadius, framesNo)));
  }
  var a = 0;
  requestAnimationFrame(
      animate.bind(this, frames[a]));
};

/**
 * Changes bubble's location and/or radius.
 *
 * @param {number} x A new location along x axis.
 * @param {number} y A new location along y axis.
 * @param {number} radius A new radius.
 * @param {Function} callback To be called after opening is finished.
 */
Bubble.prototype.translate = function(x, y, radius, callback) {
  if (!this.radius) {
    console.log("Can't translate unopened bubble, sorry.");
    return;
  }
  this.eventTarget_.dispatchEvent(this.createEvent_('translatestart'));
  radius = radius || this.radius;
  x = x || this.x;
  y = y || this.y;

  // Set a reference scale if not present yet.
  if (!this.originRadius) {
    this.originRadius = this.radius;
  }
  if (!this.referenceRadius) {
    this.referenceRadius = this.radius;
  }
  // Cache current scale components.
  var initialScale = this.scale;
  var initialRadius = this.radius;

  function animate(frame) {
    var x = frame[0];
    var y = frame[1];
    var radius = frame[2];

    this.move(x, y, radius);
    this.scale = initialScale*(this.radius/initialRadius);
    this.updateEventTarget_();
    this.eventTarget_.dispatchEvent(this.createEvent_('translate'));
    a++;
    if (frames[a] !== undefined) {
      requestAnimationFrame(animate.bind(this, frames[a]));
    } else {
      if (callback) {
        this.eventTarget_.dispatchEvent(this.createEvent_('translateend'));
        callback();
      }
    }
  }

  // Pre-calculate frames to save time during rendering.
  var framesNo = Math.floor(this.animationDuration/(1000/60)); // 60fps.
  var frames = [];
  var diffX = x - this.x;
  var diffY = y - this.y;
  var diffRadius = radius - this.radius;
  for (var t = 0; t <= framesNo; t++) {
    frames.push([
      Math.round(Bubble.easeOutQuad(t, this.x, diffX, framesNo)),
      Math.round(Bubble.easeOutQuad(t, this.y, diffY, framesNo)),
      Math.round(Bubble.easeOutQuad(t, this.radius, diffRadius, framesNo))
    ]);
  }
  var a = 0;
  requestAnimationFrame(animate.bind(this, frames[a]));
};


/**
 * Adds event listener to bubble.
 * @param {string} eventType Event type.
 * @param {Function} handler Handler for the event.
 * @param {boolean} useCapture Whether to handle in the capture phase.
 */
Bubble.prototype.addEventListener = function(eventType, handler, useCapture) {
  this.eventTarget_.addEventListener(eventType, function(e) {
    // TODO: improve this to be a real EventTarget.
    handler.bind(this, e)();
  }.bind(this), useCapture);
};

/**
 * Cleanup on destroy.
 */
Bubble.prototype.destroy = function() {
  this.eventTarget_.parentNode.removeChild(this.eventTarget_);
};

/**
 * Cut out the bubble in the overlay.
 */
Bubble.prototype.cutout = function() {
  var ctx = this.overlay.ctx;
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
};

/**
 * Changes bubble's location and optionally radius.
 * @param {number} x A new location along x axis.
 * @param {number} y A new location along y axis.
 * @param {number} radius A new radius.
 */
Bubble.prototype.move = function(x, y, radius) {
  var ctx = this.overlay.ctx;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillRect(this.x - this.radius - 1,
               this.y - this.radius - 1,
               this.radius*2+2,
               this.radius*2+2);
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.eventTarget_.dispatchEvent(this.createEvent_(Bubble.EventType.UPDATE));
};
