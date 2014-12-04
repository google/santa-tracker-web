goog.provide('app.Quiz');

goog.require('app.shared.Coordinator');



app.Quiz = function(game, elem, current) {
  this.game = game;
  this.elem = elem;
  this.current = current;
  this.difficulty = 'beginner'; // beginner || medium || hard
};

app.Quiz.prototype.setDifficulty = function(difficulty) {
  this.difficulty = difficulty;
};

/*app.Quiz.prototype.onFrame = function(delta) {
  //
};*/

app.Quiz.prototype.nextQuestion = function() {
  // Get new question
  var index = Math.ceil(Math.random() * 97);
  var questionElem = this.elem.querySelector('.quiz-' + this.difficulty + ' .question--' + index);

  // Update UI
  this.current.number++;
  this.current.question = questionElem.children[0].textContent;
  this.nextChoices = Array.prototype.map.call(questionElem.children[1].children, function(el) {
    return el.textContent;
  });

  app.shared.Coordinator.after(app.Constants.QUESTION_READ_TIME, this.showChoices_.bind(this));
};

app.Quiz.prototype.showChoices_ = function() {
  this.current.choices = this.nextChoices;
  this.game.countdownActive = true;
};
