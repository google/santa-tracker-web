import api from '../../src/scene/api.js';
import Accordion from './js/accordion.js';
import { rectify } from '../../src/scene/route.js';

api.ready(async () => {
  rectify(document.body);  // nb. Accordion does this to itself
  new Accordion(document.querySelector('[data-familyguide-accordion]'));
});