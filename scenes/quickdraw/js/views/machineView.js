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

goog.provide('app.view.MachineView');
goog.require('app.SpeechController');


app.view.MachineView = function(container) {
  this.container = container;
  this.elem = container.find('.machineview');
  this.elemA = this.elem.find('.machineview__primary');
  this.elemB = this.elem.find('.machineview__secondary');

  this.speech = new app.SpeechController();
}


app.view.MachineView.prototype.reset = function() {
  this.setText('...');
  this.guessesQueue = [];
  this.mentionedWords = {};
  this.talkingGuesses = false;
  this.recentMentionedWords = [];
};


app.view.MachineView.prototype.setText = function(textA, textB) {
  var textA = textA || '';
  var textB = textB || '';
  this.elemA.text(textA);
  this.elemB.text(textB);
  //this.resetTextAfterDelay();
};


app.view.MachineView.prototype.setResultWord = function(word) {
  var word = word;
  this.guessesQueue = [];
  this.speakAndWrite(app.Utils.getTranslation(this.container, 'quickdraw-machine-know', 'word', word));
  setTimeout(function() {
    if (this.guessesQueue.length == 0) {
        this.setText('...');
    }
  }.bind(this), 3000);
};


app.view.MachineView.prototype.speakAndWrite = function(textA, textB, callback) {
  var textB = textB || '';
  this.setText(textA, textB);
  var text = textA + textB;
  this.speak(text, callback);
};

app.view.MachineView.prototype.speak = function(text, callback) {
  this.talking = true;
  this.speech.speak(text, function() {
    this.talking = false;
    if (callback) {
      callback();
    }
  }.bind(this));
};

app.view.MachineView.prototype.setGuesses = function(words) {
  this.guessesQueue = words.filter(function(word) {
    return !this.mentionedWords.hasOwnProperty(word);
  }.bind(this));

  if (!this.talkingGuesses && this.guessesQueue.length > 0) {
    this.readNextGuess(true);
  }

  return this.guessesQueue.length;
};

app.view.MachineView.prototype.readNextGuess = function(first) {
  this.talkingGuesses = true;
  if (this.guessesQueue.length == 0) {
    this.talkingGuesses = false;
    return;
  }

  if (first) {
    this.recentMentionedWords = [];
  }

  var next = this.guessesQueue.shift();

  //Set text
  var textSentenceA = app.Utils.getTranslation(this.container, 'quickdraw-machine-see');
  var textSentenceB = next;
  this.setText(textSentenceA, textSentenceB);

  //Set speaking text and speak
  var speakSentence = app.Utils.getTranslation(this.container, 'quickdraw-machine-or') + ' ' + next;
  if (first) {
    speakSentence = app.Utils.getTranslation(this.container, 'quickdraw-machine-see') + ' ' + next;
  }
  this.speak(speakSentence, function() {
    this.readNextGuess();
  }.bind(this));

  this.recentMentionedWords.push(next);
  this.mentionedWords[next] = 1;
};
