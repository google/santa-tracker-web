
goog.provide('app.Platform');
goog.require('app.Constants');
goog.require('app.shared.pools');

/**
 * A Platform
 * @param {app.Board} board The board object.
 * @constructor
 */
app.Platform = function(board) {
  this.board = board;
  this.elem = $('<div class="platform"></div>');
  this.caneElem = $('<div class="platform-cane">' +
      '<div class="platform-cane-hook"></div>' +
      '</div>').appendTo(this.elem);
  this.shadowElem = $('<div class="platform-shadow">' +
      '<div class="platform-shadow-hook"></div>' +
      '</div>').appendTo(this.elem);
};

app.shared.pools.mixin(app.Platform);

/**
 * Initialization of platform.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} angle
 * @param {bool} mirrorX
 */
app.Platform.prototype.onInit = function(x, y, width, angle, mirrorX) {
  this.createStick2(x, y, width, angle, mirrorX);
  var scaleX = mirrorX ? -1 : 1;
  this.caneElem.css('transform', 'scaleX(' + scaleX + ') rotate(' + angle + 'deg)');
  this.shadowElem.css('transform', 'translate(2px, 8px) scaleX(' + scaleX + ') rotate(' + angle + 'deg)');
  this.elem.css({
    transform: 'translate(' + (x - width / 2) + 'px, ' + y + 'px)',
    width: width
  }).appendTo(this.board.elem);
};

app.Platform.prototype.onDispose = function() {
  this.elem.remove();
};

/**
 * Creates a box2d body for a stick with the specified metadata.
 * @param {number} x is pixel position of center part of the stick, relative to board center.
 * @param {number} y is pixel position of center part of the stick ignoring the hook, relative to board center.
 * @param {number} width is the full pixel width of the stick.
 * @param {number} angle is the rotation of the stick around the center of the stick, ignoring the hook.
 * @param {boolean} mirrorX mirrors the stick horizontally.
 */
app.Platform.prototype.createStick2 = function(x, y, width, angle, mirrorX) {
  // Some constants
  var SCALE = app.Constants.PHYSICS_SCALE;
  var DEG2RAD = 1 / 180 * Math.PI;
  var STICK_HALFTHICKNESS = 8 * SCALE;
  var HOOK_RADIUS = 35 * SCALE;

  // Is the hook angled downwards.
  var circleHook = angle > 90 && angle < 270;

  // Convert to physics units.
  x *= SCALE;
  y *= SCALE;
  width *= SCALE;
  angle *= DEG2RAD;
  if (mirrorX) { angle *= -1; }

  // Transformation matrix for converting local coordinates to world coordinates.
  var transform = new b2.Transform();
  transform.position = new b2.Vec2(x, y);
  transform.R.Set(mirrorX ? -angle : angle);
  if (mirrorX) {
    transform.R.col1.x *= -1;
    transform.R.col2.x *= -1;
  }

  // Specify shapes in local coordinates where 0,0 is center of base stick.
  var stick = new b2.Vec2(0, 0);
  var halfw = width / 2;

  // Cut the base stick a bit if we have a circular hook.
  if (circleHook) {
    var hookDelta = HOOK_RADIUS / 2;
    stick.x += hookDelta;
    halfw -= hookDelta;
  }
  stick = b2.Math.MulX(transform, stick);

  // Create the base stick.
  var shape = new b2.PolygonShape();
  shape.SetAsOrientedBox(halfw, STICK_HALFTHICKNESS, stick, angle);
  this.board.boardBody.CreateFixture2(shape).SetUserData('cone');

  if (circleHook) {
    var circle = new b2.Vec2(-width / 2 + HOOK_RADIUS, -HOOK_RADIUS + STICK_HALFTHICKNESS);
    circle = b2.Math.MulX(transform, circle);

    shape = new b2.CircleShape(HOOK_RADIUS);
    shape.SetLocalPosition(circle);
    this.board.boardBody.CreateFixture2(shape).SetUserData('cone');
  } else {
    var leftStick = new b2.Vec2(-width / 2 + STICK_HALFTHICKNESS, -HOOK_RADIUS);
    leftStick = b2.Math.MulX(transform, leftStick);
    shape.SetAsOrientedBox(STICK_HALFTHICKNESS, HOOK_RADIUS - STICK_HALFTHICKNESS, leftStick, angle);
    this.board.boardBody.CreateFixture2(shape).SetUserData('cone');

    var topStick = new b2.Vec2(-width / 2 + STICK_HALFTHICKNESS * 2 + HOOK_RADIUS / 2,
        -HOOK_RADIUS * 2 + STICK_HALFTHICKNESS * 2 - SCALE);
    topStick = b2.Math.MulX(transform, topStick);
    shape.SetAsOrientedBox(HOOK_RADIUS / 2, STICK_HALFTHICKNESS, topStick, angle);
    this.board.boardBody.CreateFixture2(shape).SetUserData('cone');
  }
};
