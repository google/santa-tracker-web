goog.provide('app.Constants');

/**
 * Briefing Slidehow constants
 *
 * @const
 * @author  14islands (14islands.com)
 */
app.Constants = {

  SLIDE_SIZE: 393,

  RANDOM_DELAY_POOL_MS: [
    3504,
    7008,
    10512,
    14016,
    17520,
    21024
  ],

  LAST_SLIDE_INDEX: 3,


  // Duration for when the door opens
  ELEVATOR_UNTIL_DOOR_OPENS_MS: 2000,
  ELEVATOR_DOOR_OPENED_MS: 2200,
  ELEVATOR_UNTIL_DOOR_CLOSES_MS: 5000,

  // Note: this MUST match the total duration
  // of it's child elements keyframes animations
  ELEVATOR_ANIMATION_DURATION_MS: 8000,

  SCREEN_SLIDE_DURATION_MS: 2000,

  SLEEPING_ELVES_LIMIT: 3,

  CLASS_INCOMING_ELEVATOR: 'elevator--incoming',
  CLASS_OPENED_ELEVATOR: 'elevator--opened',
  CLASS_ACTIVE_BUTTON: 'elevator__panel__button--active',
  CLASS_ACTIVE_CHARACTER: 'elevator__character--active',

  LAST_SET_INDEX: 3,
  NUM_OF_CHARACTERS: 3

};
