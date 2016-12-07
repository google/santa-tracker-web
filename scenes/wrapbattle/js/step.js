
goog.provide('app.Step');

/**
 * Dance step constants.
 * @enum {Object}
 */
app.Step = {
  IDLE_1: {
    key: 'IDLE_1',
    back: 'idle_1'
  },
  IDLE_2: {
    key: 'IDLE_2',
    back: 'idle_2'
  },
  FAIL: {
    key: 'FAIL',
    back: 'fail'
  },
  WRAP_BLUE: {
    color: 'blue',
    key: 'WRAP_BLUE',
    back: 'wrap_back_blue',
    front: 'wrap_front_blue'
  },
  WRAP_GREEN: {
    color: 'green',
    key: 'WRAP_GREEN',
    back: 'wrap_back_green',
    front: 'wrap_front_green'
  },
  WRAP_RED: {
    color: 'red',
    key: 'WRAP_RED',
    back: 'wrap_back_red',
    front: 'wrap_front_red'
  },
};
