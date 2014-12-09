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
  // Get new question
  var index = this.questions[this.current.number];
  var questionElem = this.elem.querySelector('.quiz-' + this.difficulty + ' .question--' + index);

  // Update UI
  this.current.number++;
  this.current.question = questionElem.children[0].textContent;
  this.current.choices = Array.prototype.map.call(questionElem.children[1].children, function(el) {
    return el.textContent;
  });

  app.shared.Coordinator.after(app.Constants.QUESTION_READ_TIME, this.showChoices_.bind(this));
};

app.Quiz.prototype.showChoices_ = function() {
  this.scene.fire('show-choices');
};

app.Quiz.prototype.calculateScore = function(timeLeft) {
  var elapsed = app.Constants.INITIAL_COUNTDOWN - Math.ceil(timeLeft);
  return app.Constants.QUESTION_SCORE - (elapsed * app.Constants.SCORE_PENALTY_PER_SECOND);
};
