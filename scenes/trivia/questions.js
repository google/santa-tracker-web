var fs = require('fs');

var difficulties = ['beginner', 'medium', 'hard'];
var questionCount = [97, 100, 105];
var markup = '';

difficulties.forEach(function(difficulty, index) {
  markup += '<div class="quiz-' + difficulty + '">\n';
  for (var i = 1; i <= questionCount[index]; i++) {
    var msgid = 'trivia_' + difficulty + '_' + ('000' + i).slice(-3);
    markup += '\t<div class="question question--' + i + '">\n';
    markup += '\t\t<i18n-msg msgid="' + msgid + '">PLACEHOLDER_i18n</i18n-msg>\n';
    markup += '\t\t<div class="choices">\n';
    for (var x = 0; x < 3; x++) {
      markup += '\t\t<i18n-msg msgid="' + msgid + '_answer' + x + '">PLACEHOLDER_i18n</i18n-msg>\n';
    }
    markup += '\t\t</div>\n';
    markup += '\t</div>\n';
  }
  markup += '</div>\n';
});


fs.writeFileSync('quiz.html', markup);
