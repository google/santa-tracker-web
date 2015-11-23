console.log('Spacenav extension loading');

var spacenavInitiatedAlready = false;

var initiateSpacenavHandlers = function(gutters) {
  if (spacenavInitiatedAlready) {
    return;
  }
  spacenavInitiatedAlready = true;
  if (santaApp.mode != "portal") {
    console.log('Ignoring Spacenav extension.');
    return;
  }

  if (typeof(gutters) == 'undefined') {
    gutters = {};
  }
  var GUTTER = 180;

  var keyBindings = {
    'SPACE': 32,
    'LEFT': 37,
    'UP': 38,
    'RIGHT': 39,
    'DOWN': 40
  };
  this.gutters = gutters;
  this.gutters['LEFT'] = this.gutters['LEFT'] || GUTTER;
  this.gutters['UP'] = this.gutters['UP'] || GUTTER;
  this.gutters['RIGHT'] = this.gutters['RIGHT'] || GUTTER;
  this.gutters['DOWN'] = this.gutters['DOWN'] || GUTTER;
  this.gutters['SPACE'] = this.gutters['SPACE'] || GUTTER;

  var portalRos = new ROSLIB.Ros({
    url: 'wss://42-b:9090'
  });

  var navigatorListener = new ROSLIB.Topic({
    ros: portalRos,
      name: '/spacenav/twist',
      messageType: 'geometry_msgs/Twist',
      throttle_rate: 33
  });

  function keydown(which) {
    var e = new Event('keydown');
    e.which = which;
    e.keyCode = which;
    return e;
  }

  function keyup(which) {
    var e = new Event('keyup');
    e.which = which;
    e.keyCode = which;
    return e;
  }

  var buttonsDown = {'LEFT': false, 'UP': false, 'RIGHT': false, 'DOWN': false, 'SPACE': false};

  function move(direction) {
    if (buttonsDown[direction]) return;
    buttonsDown[direction] = true;

    var keyCode = keyBindings[direction];
    window.dispatchEvent(keydown(keyCode));
  };

  function stop(direction) {
    if (! buttonsDown[direction]) return;
    buttonsDown[direction] = false;

    var keyCode = keyBindings[direction];
    window.dispatchEvent(keyup(keyCode));
  };

  navigatorListener.subscribe(function(twist) {

    // use a combination of linear and angular values
    var spacenavX = -twist.linear.y + twist.angular.x;
    var spacenavY = twist.linear.x + twist.angular.y;

    if (spacenavY > this.gutters['UP']) move('UP');
    else stop('UP');
    if (spacenavY < -this.gutters['DOWN']) move('DOWN');
    else stop('DOWN');
    if (spacenavX > this.gutters['RIGHT']) move('RIGHT');
    else stop('RIGHT');
    if (spacenavX < -this.gutters['LEFT']) move('LEFT');
    else stop('LEFT');
    if (twist.linear.z <= -this.gutters['SPACE']) {
	  move('SPACE');
      setTimeout(function() {
        stop('SPACE');
      }, 10);
	}
  }.bind(this));

  console.log('Spacenav handler loaded');
};
