goog.provide('app.Constants');
goog.provide('Constants');



app.Constants = {
  INITIAL_COUNTDOWN: 10, // in seconds
  COUNTDOWN_TRACK_LENGTH: 10, // in seconds
  COUNTDOWN_FLASH: 2, // seconds left when countdown starts flashing

  QUESTIONS_PER_LEVEL: 10,
  TOTAL_LEVELS: 3,
  QUESTION_READ_TIME: 3, // seconds to read the question before choices are shown
  PAUSE_BETWEEN_QUESTIONS: 1,
  PAUSE_AFTER_ANSWER: 1,

  QUESTION_SCORE: 100,
  SCORE_PENALTY_PER_SECOND: 5,
  SCORE_LIMIT: {
    1: 500,  // Level: Score
    2: 1000
  },

  QUESTION_COUNT: {
    beginner: 97,
    medium: 100,
    hard: 105
  }
};

// For scoreboard
Constants = app.Constants;