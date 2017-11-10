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
'use strict';

goog.provide('app.GameController');
goog.require('app.config');
goog.require('app.EventEmitter');

goog.require('app.view.CardsView');
goog.require('app.view.GameView');
goog.require('app.view.DrawingCanvas');

goog.require('app.DrawingRecognitionController');
goog.require('app.Clock');
goog.require('app.GameRound');


app.GameController = function(container) {
  app.EventEmitter.call(this);

  this.recognitionController = new app.DrawingRecognitionController();
  this.clock = new app.Clock();

  //Views
  this.cardsView = new app.view.CardsView(container);
  this.gameView = new app.view.GameView(container);
  this.drawingCanvas = new app.view.DrawingCanvas(container);

  //Listeners
  this.drawingCanvas.addListener('DRAWING_UPDATED', function(data) {
    this.onDrawingUpdated(data);
  }.bind(this));
  this.gameView.addListener('CLEAR', function() {
    this.drawingCanvas.clearDrawingCanvas();
  }.bind(this));
  this.recognitionController.addListener('NEW_RECOGNITIONS', function(guesses) {
    this.onNewRecognitions(guesses);
  }.bind(this));
  this.clock.addListener('TIMES_UP', function() {
    this.roundTimesUp();
  }.bind(this));


  // Elem
  this.elem = container.find('.gameview');
  this.elem.hide();

  // Init
  this.resetGameRounds();
  this.newGuessesCounter = 0;
};


app.GameController.prototype = Object.create(app.EventEmitter.prototype);


app.GameController.prototype.prepareNewGame = function(callback) {
  console.log('GameController.prepareNewGame');
  if (!this.preparedChallenge) {
    this.fetchNewRound([], function (challenge) {
      if (callback) {
        callback(challenge);
      } else {
        this.preparedChallenge = challenge;
      };
    }.bind(this))
  } else {
    if (callback) {
      var w = Object.assign({}, this.preparedChallenge);
      this.preparedChallenge = undefined;
      callback(w);
    }
  }
};


app.GameController.prototype.resetGameRounds = function() {
  this.presentedWords = [];
  this.previousRounds = [];
};


app.GameController.prototype.showView = function() {
  this.elem.show();
};


app.GameController.prototype.onDrawingUpdated = function(data) {
  this.recognitionController.onDrawingUpdated(data);
};


app.GameController.prototype.onNewRecognitions = function(recognitions) {
  this.currentRound.recognitions = recognitions;

  if (this.recognitionController.isRecognizing) {
    // Check if the correct word has been recognized
    var correctRecognition = recognitions.find(function(recognition) {
      return recognition.word == this.currentRound.word && recognition.score < app.config.handwriting_recognition_threshold;
    }.bind(this));

    if (this.currentRound && correctRecognition) {
      this.roundRecognized(correctRecognition);
    } else if (this.currentRound) {
      console.log('not recognizing');
    }
  }
};


app.GameController.prototype.fetchNewRound = function(alreadyPresentedWords, callback) {
  // Only get words that didnt show up during game
  var words = app.config.words.filter(function(word) {
    return this.indexOf(word) < 0;
  }, alreadyPresentedWords);

  // Pick up a random word
  var word = app.config.words[Math.floor(Math.random() * app.config.words.length)];

  var data = {
    word: word
  };

  callback(data);
};


app.GameController.prototype.startNewGameWithChallenge = function(challenge, options) {
  console.log('GameController.startNewGameWithChallenge');
  var options = options || {
    onCardDismiss: function() {}
  };
  this.level = 1;
  this.completedLevels = 0;

  this.clock.reset();
  this.clock.startClock();

  this.startNewRoundWithChallenge(challenge, {
      onCardDismiss : options.onCardDismiss
  });
};


app.GameController.prototype.startNewRoundWithChallenge = function(challenge, options) {
  var options = options || {
    onCardDismiss: function() {}
  };

  // Stop the clock
  this.pauseGame();

  this.currentRound = new app.GameRound(challenge, this.level);
  this.currentRound.width = this.drawingCanvas.canvas.width;
  this.currentRound.height = this.drawingCanvas.canvas.height;

  this.presentedWords.push(this.currentRound.word);

  var startCb = function() {
    this.drawingCanvas.clearDrawingCanvas();
    // this.machineView.reset();
    this.recognitionController.start();

    //Start The Clock
    this.clock.reset();
    this.clock.startClock();
  }.bind(this);

  this.cardsView.showNewRoundCard({
    level: this.level,
    word: this.currentRound.presentationWord,
    onCardDismiss: function() {
      options.onCardDismiss();
      startCb();
    }
  });

};


app.GameController.prototype.roundRecognized = function(correctRecognition) {
  console.log('OH I RECOGNIZED, IT\'S' + this.currentRound.word);
  this.recognitionController.stop();
  this.pauseGame();

  setTimeout(function() {
    this.submitRoundResult({recognition: correctRecognition}, function(nextChallenge) {
      this.previousRounds.push(this.currentRound);
      this.completedLevels++;
      if (this.level < app.config.num_rounds) {
        this.level++;
        this.startNewRoundWithChallenge(nextChallenge);
      } else {
        this.endGame();
      }
    }.bind(this));
  }.bind(this), 1500);
};


app.GameController.prototype.roundTimesUp = function() {
  console.log('TIMES UP');
  this.recognitionController.stop();
  this.submitRoundResult({recognition:false}, function(nextChallenge) {
    this.previousRounds.push(this.currentRound);
    if (this.level < app.config.num_rounds) {
      this.level++;
      this.startNewRoundWithChallenge(nextChallenge);
    } else {
      this.endGame();
    }
  }.bind(this));
};


app.GameController.prototype.submitRoundResult = function(options, callback) {
  this.currentRound.drawing = this.drawingCanvas.getSegments();
  this.currentRound.recognized = options.recognition ? true : false;
  this.fetchNewRound(this.presentedWords, function(data) {
    if (callback) {
      callback(data);
    }
  });
};


app.GameController.prototype.pauseGame = function() {
  this.clock.pauseClock();
};


app.GameController.prototype.endGame = function() {
  console.log('end game', this.previousRounds);
  this.recognitionController.stop();
  this.clock.pauseClock();

  this.cardsView.showTimesUpCard(this.previousRounds, function(res) {
    if (res == 'NEW_GAME') {
      this.prepareNewGame(function(challenge) {
          this.startNewGameWithChallenge(challenge);
      }.bind(this));
    }
  }.bind(this));
};
