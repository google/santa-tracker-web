goog.provide('app.Constants');


/**
 * Scene constants
 * @const
 */
app.Constants = {
  DEFAULT_SCREEN: 'map',

  // WINDSOCK_SCREEN_SELECTOR: '.windsock-screen',

  PRESENTS_SCREEN_SELECTOR: '.presents-screen',
  PRESENTS_PRELOAD_AMOUNT: 6, // items to preload on belt
  PRESENTS_BELT_DURATION: 12, // s
  PRESENTS_ROTATION_DURATION: 0.6, // s
  PRESENTS_DROP_DURATION: 0.6,  // s
  PRESENTS_MARGIN_MIN: 50,    // px
  PRESENTS_MARGIN_MAX: 100,   // px
  PRESENTS_DROP_ROTATION_MIN: 140, // deg
  PRESENTS_DROP_ROTATION_MAX: 180, // deg

  SLEIGH_SCREEN_SELECTOR: '.sleigh-screen',
  SLEIGH_SHIMMER_DELAY_MIN: 3000,
  SLEIGH_SHIMMER_DELAY_MAX: 9000,
  SLEIGH_HAMMER_DELAY_MIN: 100,
  SLEIGH_HAMMER_DELAY_MAX: 1000
};
