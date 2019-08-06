import api from '../../src/scene/api.js';
import '../../src/elements/info-card.js';
import '../../src/elements/info-chooser.js';

import {html, render} from 'lit-html';
import {modelsTemplate} from '../_info/render.js';
import models from '../_info/models.js';


const eduModels = models.filter((model) => {
  return model.filter.split(/\s+/g).indexOf('education') !== -1;
});


const chooser = document.getElementById('chooser');
const template = modelsTemplate(eduModels, false);
render(template(), chooser);


async function setup() {
  await customElements.whenDefined('info-chooser');

  const educators = document.getElementById('educators-primary');
  const inner = educators.querySelector('.educators-primary-inner');
  const chooser = educators.querySelector('info-chooser');

  const langs = chooser.choicesArray();
  if (langs.indexOf(document.documentElement.lang) !== -1) {
    chooser.value = document.documentElement.lang;
  }

  const template = () => {
    const lang = chooser.value;
    const text = chooser.text;
    const lesson = (name) => `https://storage.googleapis.com/santa/lessonplans/${lang}/${name}`;
    return html`
<info-card src="img/lesson-plan-traditions.png">
  <h4>Christmas traditions around the world</h4>
  <p>
    Students will be able to compare, contrast, and reflect upon Christmas traditions in different countries.
  </p>
  <div class="card-links">
    <span class="card-title">Aligned with Common Core standards</span>
    <a data-id="traditions_k-2" rel="noopener" href="${lesson('ST-Lesson Plan-Grades K-2.pdf')}" target="_blank">Grades K-2 <span>(PDF, ${text})</span></a>
    <a data-id="traditions_3-5" rel="noopener" href="${lesson('ST-Lesson Plan-Grades 3-5.pdf')}" target="_blank">Grades 3-5 <span>(PDF, ${text})</span></a>
    <a data-id="traditions_6-8" rel="noopener" href="${lesson('ST-Lesson Plan-Grades 6-8.pdf')}" target="_blank">Grades 6-8 <span>(PDF, ${text})</span></a>
    <a data-id="traditions_9-10" rel="noopener" href="${lesson('ST-Lesson Plan-Grades 9-10.pdf')}" target="_blank">Grades 9-10 <span>(PDF, ${text})</span></a>
  </div>
</info-card>

<info-card src="img/lesson-plan-code.png">
  <h4>Practice coding with Santa's elves</h4>
  <p>
    Students will learn how to move elves and make snowflakes with code, experimenting with sequences and loops.
  </p>
  <div class="card-links">
    <span class="card-title">Aligned with ISTE standards</span>
    <a class="card-play" data-id="coding_youtube_k-2" href="https://youtu.be/t_tuZl-CfFs" rel="noopener">
      Grades K-2: Code Lab <span>(video tutorial)</span>
    </a>
    <a data-id="coding_k-2" href="${lesson('ST-Lesson Plan-Code Lab-Grades K-2.pdf')}" rel="noopener">Grades K-2: Code Lab <span>(PDF, ${text})</span></a>
    <a class="card-play" data-id="coding_youtube_3-5" href="https://youtu.be/BotTyMAw4ho" rel="noopener">
      Grades 3-5: Code Boogie <span>(video tutorial)</span>
    </a>
    <a data-id="coding_3-5" href="${lesson('ST-Lesson Plan-Code Boogie-Grades 3-5.pdf')}" rel="noopener">Grades 3-5: Code Boogie <span>(PDF, ${text})</span></a>
    <a class="card-play" data-id="coding_youtube_6-8" href="https://youtu.be/zUEQzwd4MnE" rel="noopener">
      Grades 3-5: Code a Snowflake <span>(video tutorial)</span>
    </a>
    <a data-id="coding_6-8" href="${lesson('ST-Lesson Plan-Code Snowflake-Grades 6-8.pdf')}" rel="noopener">Grades 6-8: Code a Snowflake <span>(PDF, ${text})</span></a>
  </div>
</info-card>
    `;
  };

  const updateWithLang = () => render(template(), inner);

  updateWithLang();
  chooser.addEventListener('change', updateWithLang);
}

const p = setup().catch((err) => {
  throw err;
});

api.preload.images(
  'img/bg-hero.png',
  'img/coding.png',
  'img/illust-teacher_2x.png',
  'img/lesson-plan-bg-full.png',
  'img/lesson-plan-code.png',
  'img/lesson-plan-traditions.png',
  'img/logo-code.png',
  'img/logo-donors-choose.png',
  'img/logo-khan.png',
  'img/logo-lwb.png',
  'img/logo-scratch.png',
  'img/logo-storyweaver.png',
  'img/title-bg-swirl_2x.png',
);
api.preload.wait(p);
