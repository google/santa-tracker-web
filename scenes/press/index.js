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


/*
        <template is="dom-repeat" items="[[androidCards]]" as="card">

          <info-card filter$="[[card.filter]]"
              image="[[_computeInfoCardImage(card.key, 'app')]]"
              opens="[[card.opens]]"
              type="[[card.type]]">
            <div slot="title">[[card.title]]</div>
            <p>[[card.description]]</p>
            <div class="card-links" hidden$="[[!card.screenshotUrl]]">
              <span class="card-title">Press resources</span>
              <a href="[[card.screenshotUrl]]" rel="noopener">
                Still Screenshot <span>(PNG file)</span>
              </a>
            </div>
          </info-card>

        </template>
*/