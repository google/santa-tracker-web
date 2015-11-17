console.log('Spacenav extension loading');


var initiateSpacenavHandlers = function() {

  var GUTTER = 180;

  var keyBindings = {
    'LEFT': 37,
    'UP': 38,
    'RIGHT': 39,
    'DOWN': 40
  };

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

  var buttonsDown = {'LEFT': false, 'UP': false, 'RIGHT': false, 'DOWN': false};

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

    if (spacenavY > GUTTER) move('UP');
    else stop('UP');
    if (spacenavY < -GUTTER) move('DOWN');
    else stop('DOWN');
    if (spacenavX > GUTTER) move('RIGHT');
    else stop('RIGHT');
    if (spacenavX < -GUTTER) move('LEFT');
    else stop('LEFT');
  });

  console.log('Spacenav handler loaded');
};

initiateSpacenavHandlers();
