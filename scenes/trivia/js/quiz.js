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

goog.provide('app.Quiz');

goog.require('app.Constants');
goog.require('app.shared.Coordinator');



app.Quiz = function(scene, elem, current) {
  this.scene = scene;
  this.elem = elem;
  this.current = current;
};

/**
 * Set the difficulty of the questions.
 * @param {string} difficulty Can be beginner, medium or hard.
 */
app.Quiz.prototype.setDifficulty = function(difficulty) {
  this.difficulty = difficulty;
  this.pickQuestions_();
};

app.Quiz.prototype.pickQuestions_ = function() {
  var total = app.Constants.QUESTION_COUNT[this.difficulty];
  var questions = [];
  for (var i = 1; i <= total; i++) {
    questions.push(i);
  }

  // Fisher-Yates to randomize list
  var index, temp;
  i = total;
  while (--i) {
    index = Math.floor(Math.random() * (i + 1));
    temp = questions[i];
    questions[i] = questions[index];
    questions[index] = temp;
  }

  this.questions = questions.slice(0, app.Constants.QUESTIONS_PER_LEVEL * app.Constants.TOTAL_LEVELS);
};

app.Quiz.prototype.levelUp = function() {
  this.questions = this.questions.slice(app.Constants.QUESTIONS_PER_LEVEL);
};

app.Quiz.prototype.nextQuestion = function() {
  if (this.questions.length === 0) return;

  // Get new question
  var index = this.questions[this.current.number];
  var questionElem = this.elem.querySelector('.quiz-' + this.difficulty + ' .question--' + index);

  // Update UI
  this.current.number++;
  this.current.question = questionElem.querySelector('.question-text').textContent;
  this.current.choices = Array.prototype.map.call(questionElem.querySelectorAll('.question-choices > div'), function(el) {
    return el.textContent;
  });
  this.current.answer = questionElem.getAttribute('data-answer');

  app.shared.Coordinator.after(app.Constants.QUESTION_READ_TIME, this.showChoices_.bind(this));
};

app.Quiz.prototype.showChoices_ = function() {
  this.scene.fire('show-choices');
};

app.Quiz.prototype.calculateScore = function(timeLeft) {
  var elapsed = app.Constants.INITIAL_COUNTDOWN - Math.ceil(timeLeft);
  return app.Constants.QUESTION_SCORE - (elapsed * app.Constants.SCORE_PENALTY_PER_SECOND);
};
