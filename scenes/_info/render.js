import {html, render} from 'lit-html';
import {repeat} from 'lit-html/directives/repeat';
import {ifDefined} from 'lit-html/directives/if-defined';

import * as route from '../../src/route.js';

const root = _root`img/`;

const renderModel = (model, showResources) => {
  let links = '';
  
  if (showResources && model.resources && model.resources.length) {
    links = html`
<div class="card-links">
<span class="card-title">Press Resources</span>
${repeat(model.resources, (r) => r.url, (r) => {
  const extMatch = /\.(\w+)$/.exec(r.url);
  const ext = extMatch && extMatch[1] || '';
  const title = ext === 'gif' ? 'Animation': 'Screenshot';
  return html`<a class="card-dl" href="${r.url}" rel="noopener">${title} <span ?hidden=${!ext}>(${ext.toUpperCase()})</span></a>`;
})}
</div>`;
  }

  const sceneName = model.key;
  const isAndroid = sceneName[0] === '_';
  const imageSrc = root +
      (isAndroid ? `app/${sceneName.substr(1)}.png` : `scenes/${sceneName}_2x.png`);

  const href = isAndroid ? undefined : `./${sceneName}.html`;

  return html`
<info-card
    filter="${model.filter || ''}"
    src=${imageSrc}
    href=${ifDefined(route.href(href))}>
<h4>${model.title}</h4>
<h5>${model.type}</h5>
<p>${model.description}</p>
${links}
</info-card>
`;
};

export function modelsTemplate(models, showResources=true) {
  const r = repeat(models, (model) => model.key, (model) => renderModel(model, showResources));
  return () => html`${r}`;
}
