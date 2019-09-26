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
goog.require('app.Constants');
goog.require('app.Utils');
goog.require('app.EventEmitter');

goog.require('app.view.CardsView');
goog.require('app.view.GameView');
goog.require('app.view.MachineView');
goog.require('app.view.DrawingCanvas');

goog.require('app.DrawingRecognitionController');
goog.require('app.Clock');
goog.require('app.GameRound');
goog.require('app.shared.Scoreboard');


/**
 * @constructor
 */
app.GameController = function(container, importPath) {
  app.EventEmitter.call(this);
  this.container = container;
  this.recognitionController = new app.DrawingRecognitionController();
  this.clock = new app.Clock();
  this.scoreboard = new app.shared.Scoreboard(this, container.find('.board'), app.Constants.TOTAL_LEVELS);

  //Views
  this.cardsView = new app.view.CardsView(container, importPath);
  this.gameView = new app.view.GameView(container);
  this.machineView = new app.view.MachineView(container);
  this.drawingCanvas = new app.view.DrawingCanvas(container);

  //Listeners
  this.drawingUntouched = true;
  this.drawingCanvas.addListener('DRAWING_UPDATED', function(data) {
    this.onDrawingUpdated(data);
  }.bind(this));
  this.gameView.addListener('CLEAR', function() {
    this.drawingCanvas.clearDrawingCanvas();
    window.santaApp.fire('sound-trigger', 'qd_clear');
  }.bind(this));
  this.recognitionController.addListener('NEW_RECOGNITIONS', function(guesses) {
    this.onNewRecognitions(guesses);
  }.bind(this));
  this.clock.addListener('TIMES_UP', function() {
    this.roundTimesUp();
  }.bind(this));
  this.clock.addListener('TIME_DOWN', function() {
    this.scoreboard.onFrame(1);
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
  this.drawingCanvas.resizeCanvas();
};


app.GameController.prototype.onDrawingUpdated = function(data) {
  this.recognitionController.onDrawingUpdated(data);
  if (this.drawingUntouched) {
      this.drawingUntouched = false;
      this.machineView.setText('...');
  }
};


app.GameController.prototype.onNewRecognitions = function(recognitions) {
  this.currentRound.recognitions = recognitions;

  if (this.recognitionController.isRecognizing) {
    // Check if the correct word has been recognized
    var correctRecognition = recognitions.filter(function(recognition) {
      return recognition.word == this.currentRound.word && recognition.score < app.Constants.HANDWRITING_RECOGNITION_THRESHOLD;
    }.bind(this))[0];

    if (this.currentRound && correctRecognition) {
      this.roundRecognized(correctRecognition);
    } else if (this.currentRound) {
      recognitions = recognitions.filter(function(r) {
        return r.word != this.currentRound.word;
      }.bind(this));

      var guesses = recognitions.map(function(r) {
        return r.word;
      }).filter((word) => {
        // Filter out words that we just don't have translations to.
        return app.Utils.hasItemTranslation(this.container, word);
      });

      var queueLength = this.machineView.setGuesses(guesses);
      if (queueLength == 0) {
        this.newGuessesCounter++;
      } else {
        this.newGuessesCounter = 0;
      }
      if (this.newGuessesCounter > 2) {
        this.newGuessesCounter = 0;
        var noNewGuess = app.Utils.getTranslation(this.container, 'quickdraw-round-no-new-guess');
        this.machineView.speakAndWrite(noNewGuess);
      }
    }
  }
};


app.GameController.prototype.fetchNewRound = function(alreadyPresentedWords, callback) {
  // Only get words that didnt show up during game
  var words = app.Constants.WORDS.filter(function(word) {
    return this.indexOf(word) < 0;
  }, alreadyPresentedWords);

  // Pick up a random word
  var word = words[Math.floor(Math.random() * words.length)];

  var data = {
    word: word
  };

  callback(data);
};


app.GameController.prototype.startNewGameWithChallenge = function(challenge, options) {
  options = options || {
    onCardDismiss: function() {}
  };

  this.resetGameRounds();
  this.scoreboard.reset();
  this.scoreboard.score = undefined;

  this.level = 1;
  this.completedLevels = 0;

  this.clock.reset();
  this.clock.startClock();

  this.startNewRoundWithChallenge(challenge, {
      onCardDismiss : options.onCardDismiss
  });

  this.gameView.addListener('CLEAR', function() {
    this.machineView.reset();
  }.bind(this));
};


app.GameController.prototype.startNewRoundWithChallenge = function(challenge, options) {
  options = options || {
    onCardDismiss: function() {}
  };

  // Stop the clock
  this.pauseGame();
  this.drawingUntouched = true;

  this.currentRound = new app.GameRound(challenge, this.level);
  this.currentRound.width = this.drawingCanvas.canvas.width;
  this.currentRound.height = this.drawingCanvas.canvas.height;

  this.presentedWords.push(this.currentRound.word);

  var startCb = function() {

    this.gameView.setCurrentWord(this.currentRound.word);
    this.drawingCanvas.clearDrawingCanvas();
    this.machineView.reset();
    this.recognitionController.start();

    //Start The Clock
    this.clock.reset();
    this.clock.startClock();

    window.santaApp.fire('sound-trigger', 'generic_button_click');
    window.santaApp.fire('sound-ambient', 'music_start_ingame');

  }.bind(this);

  this.scoreboard.setLevel(this.level - 1);

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
  this.recognitionController.stop();
  this.pauseGame();

  this.machineView.setResultWord(this.currentRound.word);

  setTimeout(function() {
    this.submitRoundResult({recognition: correctRecognition}, function(nextChallenge) {
      this.previousRounds.push(this.currentRound);
      this.completedLevels++;
      if (this.level < app.Constants.TOTAL_LEVELS) {
        this.level++;
        this.startNewRoundWithChallenge(nextChallenge);
        window.santaApp.fire('sound-trigger', 'qd_level_up');
      } else {
        this.endGame();
        window.santaApp.fire('sound-trigger', 'qd_complete');
      }
    }.bind(this));
  }.bind(this), 1500);
};


app.GameController.prototype.roundTimesUp = function() {
  this.recognitionController.stop();

  setTimeout(function() {
    this.machineView.speakAndWrite(
      app.Utils.getTranslation(this.container, 'quickdraw-round-timesup'),
      app.Utils.getTranslation(this.container, 'quickdraw-round-sorry'));
  }.bind(this), 500);

  this.submitRoundResult({recognition:false}, function(nextChallenge) {
    this.previousRounds.push(this.currentRound);
    if (this.level < app.Constants.TOTAL_LEVELS) {
      this.machineView.reset();
      this.level++;
      this.startNewRoundWithChallenge(nextChallenge);
    } else {
      this.endGame();
    }
  }.bind(this));
};


app.GameController.prototype.submitRoundResult = function(options, callback) {
  this.scoreboard.restart();
  window.santaApp.fire('sound-ambient', 'music_start_ingame');
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
  this.recognitionController.stop();
  this.clock.pauseClock();
  this.machineView.reset();
  window.santaApp.fire('sound-ambient', 'music_start_scene');
  this.cardsView.showTimesUpCard(this.previousRounds, function(res) {
    if (res == 'NEW_GAME') {
      this.prepareNewGame(function(challenge) {
          this.startNewGameWithChallenge(challenge);
      }.bind(this));
    }
  }.bind(this));
};


app.GameController.prototype.exitGame = function() {
  this.pauseGame();
  this.recognitionController.stop();
  this.machineView.setGuesses([]);
  this.currentRound = undefined;
  this.clock.pauseClock();
  this.drawingCanvas.stopListening();
};


app.GameController.prototype.prepareGame = function() {
  this.drawingCanvas.startListening();
};
