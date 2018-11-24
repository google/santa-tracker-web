import api from '../../src/scene/api.js';
import '../../src/elements/info-card.js';
import '../../src/elements/info-chooser.js';

import {html, render} from 'lit-html';
import {repeat} from 'lit-html/directives/repeat';

import models from '../_info/models.js';

const chooser = document.getElementById('chooser');


const root = _root`img/`;
const imageForScene = (sceneName) => {
  if (sceneName[0] === '_') {
    return `${root}app/${sceneName.substr(1)}.png`;
  }
  return `${root}scenes/${sceneName}_2x.png`;
};

const renderModel = (model) => {
  const links = model.resources && model.resources.length ? html`
<div class="card-links">
<span class="card-title">Press Resources</span>
${repeat(model.resources, (r) => r.url, (r) => {
  const extMatch = /\.(\w+)$/.exec(r.url);
  const ext = extMatch && extMatch[1] || '';
  const title = ext === 'gif' ? 'Animation': 'Screenshot';
  return html`<a class="card-dl" href="${r.url}" rel="noopener">${title} <span ?hidden=${!ext}>(${ext.toUpperCase()})</span></a>`;
})}
</div>
  ` : '';

  return html`
<info-card filter="${model.filter || ''}" src=${imageForScene(model.key)}>
<div slot="title">${model.title}</div>
<p>${model.description}</p>
${links}
</info-card>
`;
};

const r = repeat(models, (model) => model.key, renderModel);
const template = () => html`${r}`;
render(template(), chooser);



api.preload.images(
  'img/bg-press-page-hero.png',
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
