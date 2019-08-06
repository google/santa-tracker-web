import api from '../../src/scene/api.js';
import '../../src/elements/info-card.js';
import '../../src/elements/info-chooser.js';

import {html, render} from 'lit-html';

import {modelsTemplate} from '../_info/render.js';
import models from '../_info/models.js';


const chooser = document.getElementById('chooser');
const template = modelsTemplate(models);
render(template(), chooser);



api.preload.images(
  'img/bg-hero.png',
  'img/card-tracker.png',
  'img/card-village.png',
  'img/illust-chromecast_2x.png',
  'img/illust-educational_2x.png',
  'img/illust-embed_2x.png',
  'img/illust-google-maps_2x.png',
  'img/illust-google-search_2x.png',
  'img/illust-mobile-app_2x.png',
  'img/illust-new_2x.png',
  'img/illust-reporter_2x.png',
  'img/illust-wear_2x.png',
  'img/illust-web-cardboard_2x.png',
  'img/illust-web-googlehome_2x.png',
  'img/illust-web-optimized_2x.png',
  'img/title-bg-swirl_2x.png',
);

api.preload.wait(customElements.whenDefined('info-chooser'));
