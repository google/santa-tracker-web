(function() {

window.santatracker = {};

window.santatracker.setup = function() {
  window.santatracker.addErrorHandler();
};

window.santatracker.addErrorHandler = function() {
  // Track and log any errors to analytics
  window.onerror = function(message, file, lineNumber) {
    // We don't want to trigger any errors inside window.onerror otherwise
    // things will get real bad, real quick.
    try {
      window.santaApp.fire('analytics-track-event', {
          category: 'error', action: file + ':' + lineNumber,
          label: '' + message});
    } catch (e){}
  };
};

window.santaApp = document.querySelector('santa-app');

if (window.DEV) {
  // Polyfill needs I18nMsg to exist before setting the lang. Timing is fine for native :(
  document.addEventListener('HTMLImportsLoaded', function() {
    I18nMsg.lang = document.documentElement.lang || 'en'; // Set locale for entire site (e.g. i18n-msg elements).
  });
}

window.santatracker.setup();
})();
