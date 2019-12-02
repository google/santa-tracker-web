import 'custom-event-polyfill';

try {
  new Event('blah');
} catch (e) {
  window.Event = window.CustomEvent;
}
