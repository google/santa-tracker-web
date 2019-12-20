import api from '../../src/scene/api.js';
import Storybook from './js/storybook.js';

api.preload.sounds('storybook_load_sounds');
if (window.innerWidth > 768) {
	api.preload.images(
		'img/desktop/chapter-1.svg',
		'img/desktop/chapter-2.svg',
		'img/desktop/chapter-3.svg',
		'img/desktop/chapter-4.svg',
		'img/desktop/chapter-5.svg',
		'img/desktop/chapter-6.svg',
		'img/desktop/chapter-7.svg',
		'img/desktop/chapter-8.svg',
		'img/desktop/chapter-9.svg',
		'img/desktop/chapter-10.svg',
		'img/desktop/chapter-11.svg',
		'img/desktop/chapter-12.svg',
		'img/desktop/chapter-13.svg',
		'img/desktop/chapter-14.svg',
		'img/desktop/chapter-15.svg',
		'img/desktop/chapter-16.svg',
		'img/desktop/chapter-17.svg',
		'img/desktop/chapter-18.svg',
		'img/desktop/chapter-19.svg',
		'img/desktop/chapter-20.svg',
		'img/desktop/chapter-21.svg',
		'img/desktop/chapter-22.svg',
	);
} else {
	api.preload.images(
		'img/mobile/chapter-1.svg',
		'img/mobile/chapter-2.svg',
		'img/mobile/chapter-3.svg',
		'img/mobile/chapter-4.svg',
		'img/mobile/chapter-5.svg',
		'img/mobile/chapter-6.svg',
		'img/mobile/chapter-7.svg',
		'img/mobile/chapter-8.svg',
		'img/mobile/chapter-9.svg',
		'img/mobile/chapter-10.svg',
		'img/mobile/chapter-11.svg',
		'img/mobile/chapter-12.svg',
		'img/mobile/chapter-13.svg',
		'img/mobile/chapter-14.svg',
		'img/mobile/chapter-15.svg',
		'img/mobile/chapter-16.svg',
		'img/mobile/chapter-17.svg',
		'img/mobile/chapter-18.svg',
		'img/mobile/chapter-19.svg',
		'img/mobile/chapter-20.svg',
		'img/mobile/chapter-21.svg',
		'img/mobile/chapter-22.svg',
	);
}

api.config({
	sound: ['storybook_start'],
});

api.ready(async () => {
  new Storybook(document.getElementById('module-storybook'));
})
