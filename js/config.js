window.SANTA_CONFIG = window.SANTA_CONFIG || {
  "CLIENT_ID": location.host.match("santatracker.google.com") ? "google-santa-tracker" : null,
  "COUNTDOWN_END_DATE": 1419415200000, // Dec 24, 2014
  "FLIGHT_FINISHED": 1419415200000 + 25 * 60 * 60 * 1000
};
