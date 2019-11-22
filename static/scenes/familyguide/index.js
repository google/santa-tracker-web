import api from '../../src/scene/api.js';
import Accordion from './js/accordion.js';
import { rectify } from '../../src/scene/route.js';

api.ready(async () => {
  new Accordion(document.querySelector('[data-familyguide-accordion]'));
  rectify(document.body);
});