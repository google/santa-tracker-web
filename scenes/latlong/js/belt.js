/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

goog.provide('app.Belt');
goog.require('app.Present');
goog.require('app.shared.utils');



app.Belt = function(elem, onLevelComplete, addScore, missedPresent, matchedPresent) {
  this.elem = elem.find('.Belt');
  this.grid = elem.find('.Grid');

  this.onLevelCompleteCallback = onLevelComplete;
  this.addScoreCallback = addScore;
  this.missedPresentCallback = missedPresent;
  this.matchedPresentCallback = matchedPresent;
  this.presentTemplate = elem.find('#present-template');
  this.elfTemplate = elem.find('#elf-template');

  this.presents = [];

  this.grid.on('mouseup.latlong touchend.latlong', this.onGridClick.bind(this));

  this.grid.find('.Grid-marker').on('mouseenter.latlong', function() {
    window.santaApp.fire('sound-trigger', 'latlong_over');
  });

  this.onDeliver_ = this.onDeliver_.bind(this);

  this.rescale();
  this.generatePresents_();
};


app.Belt.prototype.rescale = function() {
  this.beltWidth = this.elem.width();
  this.visibleWidth = this.beltWidth - Constants.BELT_CYCLE_DISTANCE;

  if (this.presents.length === 2) {
    for (var i = 0; i < this.presents.length; i++) {
      this.presents[i].setX(this.getMidpoint_() + i * Constants.PRESENT_SPAWN_WIDTH);
    }
  }
};


app.Belt.prototype.getMidpoint_ = function() {
  return this.visibleWidth / 2 - this.targetCount * Constants.PRESENT_SPAWN_WIDTH / 2;
};


app.Belt.prototype.reset = function() {
  this.presents.forEach(function(present) {
    present.remove();
  });
  this.presents = [];

  this.grid.find('.Grid-marker')
      .removeClass('Grid-marker--correct');

  this.beltDistance = 0;
  this.beltSpeed = 0;
  this.correctCount = 0;
};


app.Belt.prototype.generatePresents_ = function(numberOfPresents) {
  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
  }

  var colors = app.Constants.COLORS;
  var numbers = app.Constants.NUMBERS;

  for (var i = 0; i < colors.length; i++) {
    for (var j = 0; j < numbers.length; j++) {
      app.Present.pool({
        color: colors[i],
        number: numbers[j],
        parentEl: this.elem,
        presentTemplate: this.presentTemplate,
        elfTemplate: this.elfTemplate
      });
    }
  }
};


app.Belt.prototype.onFrame = function(delta) {
  this.beltDistance += delta * this.beltSpeed;

  // Cycle belt graphic and manage past/future presents every now and then.
  if (this.beltDistance > Constants.BELT_CYCLE_DISTANCE) {
    this.cycleBelt();
  }

  this.elem.css({
    transform: 'translate3d(' + (-this.beltDistance) + 'px, 0, 0)'
  });

  this.checkDeadPresents();
};

app.Belt.prototype.checkDeadPresents = function() {
  var visibleStart = this.beltDistance;

  for (var i = 0, present; present = this.presents[i]; i++) {
    if (present.right < visibleStart) {
      if (present.active) {
        this.markPresentAndCheckLevel(present);
        this.missedPresentCallback(present);
      }
    } else {
      // Exit early if we're up to visible presents.
      return;
    }
  }
};


app.Belt.prototype.onLevel = function(levelNumber) {
  this.reset();

  this.targetCount = app.Constants.PRESENTS_PER_LEVEL[levelNumber - 1];
  this.remainingPresents = this.targetCount;
  this.spawnCount = 0;
  this.beltSpeed = app.Constants.BELT_SPEED_PER_LEVEL[levelNumber - 1];
  window.santaApp.fire('sound-trigger', {
    name: 'latlong_conveyor_speed',
    args: [this.beltSpeed / Math.max.apply(Math, app.Constants.BELT_SPEED_PER_LEVEL)]
  });

  this.cycleBelt();
};


/**
 * Resets the belt, moving still visible presents accordingly and generates
 * more presents as needed.
 */
app.Belt.prototype.cycleBelt = function() {
  // Roll the belt back.
  var cycleDistance = Math.min(Constants.BELT_CYCLE_DISTANCE, this.beltDistance);
  this.beltDistance -= cycleDistance;

  // Move presents back on the belt and remove those who are visually off it.
  this.presents = this.presents.filter(function(present) {
    var newX = present.x - cycleDistance;

    if (newX + Constants.PRESENT_WIDTH < 0 && !present.delivering) {
      present.remove();
      return false;
    } else {
      present.setX(newX);
      return true;
    }
  });

  // Figure out where on the belt to start spawning presents from.
  var spawnX;
  if (this.presents.length) {
    // End of last present.
    spawnX = this.presents[this.presents.length - 1].x + Constants.PRESENT_SPAWN_WIDTH;
  } else if (this.beltSpeed) {
    // End of belt.
    spawnX = this.visibleWidth;
  } else {
    // Arranged in middle of belt for static levels.
    spawnX = this.getMidpoint_();
  }

  var present;
  while (this.spawnCount < this.targetCount && spawnX < this.beltWidth) {
    present = app.Present.popRandom(null, spawnX, -this.beltSpeed);

    if (!present) {
      // All 25 presents in use!
      break;
    }
    this.presents.push(present);

    spawnX += Constants.PRESENT_SPAWN_WIDTH;
    this.spawnCount++;
  }
};


app.Belt.prototype.onGridClick = function(e) {
  var target = $(e.target);
  var marker = target.closest('.Grid-marker');

  if (marker.length > 0) {
    var color = marker.closest('.Grid-longitude').data('color');
    var number = marker.closest('.Grid-latitude').data('number');

    var present = this.matchesAny(color, number);

    if (present) {
      this.onCorrect(present, marker);
    } else {
      this.onIncorrect(marker);
    }
  }
};


app.Belt.prototype.matchesAny = function(color, number) {
  var visibleStart = this.beltDistance;
  var visibleEnd = visibleStart + this.visibleWidth;
  for (var i = 0, present; present = this.presents[i]; i++) {
    var onScreen = present.right > visibleStart && present.x < visibleEnd;
    var matches = present.color === color && present.number === number;

    if (onScreen && matches && present.active) {
      return present;
    }
  }

  return false;
};


app.Belt.prototype.onCorrect = function(present, marker) {
  window.santaApp.fire('sound-trigger', 'latlong_success');

  this.addScoreCallback(app.Constants.PRESENT_SCORE);

  present.active = false;
  present.deliver(marker, this.onDeliver_);
  this.matchedPresentCallback(present);
};


app.Belt.prototype.onIncorrect = function(marker) {
  window.santaApp.fire('sound-trigger', 'latlong_failure');
  app.shared.utils.animWithClass(marker, 'Grid-marker--incorrect')
}


app.Belt.prototype.onDeliver_ = function(present) {
  this.markPresentAndCheckLevel(present);
};


/**
 * Marks a present finished and checks if the level is finished.
 * @param {app.Present} present
 */
app.Belt.prototype.markPresentAndCheckLevel = function(present) {
  this.remainingPresents--;
  present.active = false;
  if (this.remainingPresents === 0) {
    this.onLevelCompleteCallback();
  }
};


app.Belt.prototype.onPause = function() {
  this.presents.forEach(function(present) {
    present.onPause();
  });
};


app.Belt.prototype.onResume = function() {
  this.presents.forEach(function(present) {
    present.onResume();
  });
};
