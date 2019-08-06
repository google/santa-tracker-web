import EventTarget from 'event-target';  // explicitly include minified version which effects global scope

// this is itself if polyfill isn't required
self.EventTarget = EventTarget;