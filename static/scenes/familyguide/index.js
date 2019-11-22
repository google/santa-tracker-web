import api from '../../src/scene/api.js';
import Accordion from './js/accordion.js';

api.ready(async () => {
  new Accordion(document.querySelector('[data-familyguide-accordion]'));
});