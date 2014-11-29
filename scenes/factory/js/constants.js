goog.provide('app.Constants');

/**
 * Scene constants
 * @const
*/
app.Constants = {
  // truck animation durations
  DELAY_MS: 1000,
  DRIVE_MS: 7000,
  LOAD_MS: 2000,
  DROP_MS: 300,

  // color machine animation durations
  PULL_MS: 400,
  LOOKUP_MS: 300,
  BALLDROP_MS: 1500,
  SWALLOW_MS: 400,
  BELLY_MS: 300,
  PUSH_MS: 200,

  EASE_IN_OUT_QUAD: 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
  EASE_IN_QUAD: 'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
  EASE_OUT_QUAD: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  EASE_OUT_QUINT: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)'
};
