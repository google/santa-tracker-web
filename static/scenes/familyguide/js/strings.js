import { _msg } from '../../../src/magic.js';

const models = [
  {
    id: 'code',
    heading: {
      title: _msg`familyguide_group_01_title`,
      body: _msg`familyguide_group_01_body`,
    },
    cards: [
      {
        title: _msg`scene_codelab`,
        body: _msg`familyguide_card_01_body`,
        image: '../../img/scenes/codelab_1x.png',
        href: 'codelab.html',
      },
      {
        title: _msg`scene_snowflake`,
        body: _msg`familyguide_card_02_body`,
        image: '../../img/scenes/snowflake_1x.png',
        href: 'snowflake.html',
      },
      {
        title: _msg`scene_codeboogie`,
        body: _msg`familyguide_card_03_body`,
        image: '../../img/scenes/codeboogie_1x.png',
        href: 'codeboogie.html',
      },
    ]
  },
  {
    id: 'celebrate',
    heading: {
      title: _msg`familyguide_group_02_title`,
      body: _msg`familyguide_group_02_body`,
    },
    cards: [
      {
        title: _msg`scene_traditions`,
        body: _msg`familyguide_card_04_body`,
        image: '../../img/scenes/traditions_1x.png',
        href: 'traditions.html',
      },
      {
        title: _msg`scene_translations`,
        body: _msg`familyguide_card_05_body`,
        image: '../../img/scenes/translations_1x.png',
        href: 'translations.html',
      },
      {
        title: _msg`scene_mercator`,
        body: _msg`familyguide_card_06_body`,
        image: '../../img/scenes/mercator_1x.png',
        href: 'mercator.html',
      },
      {
        title: _msg`scene_traditionsquiz`,
        body: _msg`familyguide_card_07_body`,
        image: '../../img/scenes/traditionsquiz_1x.png',
        href: 'https://earth.google.com/web/@43.129579,-112.010821,1838a,2269637d,35y,0.00000182h,0.4t,0r/data=CisSKRIgZDRkYTI4YTFkMmYwMTFlODk2YTFjZDc4YmJiZmMxYTkiBXNwbC0w',
        external: true,
      },
      /* TODO: Holding GOOGLE EARTH HOLIDAY FOODS card */
      // {
      //   title: _msg`scene_holidayfoods`,
      //   body: _msg`familyguide_card_08_body`,
      //   image: '',
      //   href: '#',
      // },
    ]
  },
  {
    id: 'create',
    heading: {
      title: _msg`familyguide_group_03_title`,
      body: _msg`familyguide_group_03_body`,
    },
    cards: [
      {
        title: _msg`scene_canvas`,
        body: _msg`familyguide_card_09_body`,
        image: '../../img/scenes/santascanvas_1x.png',
        href: 'santascanvas.html',
      },
      {
        title: _msg`scene_snowbox`,
        body: _msg`familyguide_card_10_body`,
        image: '../../img/scenes/snowbox_1x.png',
        href: 'snowbox.html',
      },
      {
        title: _msg`scene_elfmaker`,
        body: _msg`familyguide_card_11_body`,
        image: '../../img/scenes/elfmaker_1x.png',
        href: 'elfmaker.html',
      },
      {
        title: _msg`scene_santaselfie`,
        body: _msg`familyguide_card_12_body`,
        image: '../../img/scenes/santaselfie_1x.png',
        href: 'santaselfie.html',
      },
    ]
  },
  {
    id: 'family',
    heading: {
      title: _msg`familyguide_group_04_title`,
      body: _msg`familyguide_group_04_body`,
    },
    cards: [
      {
        title: _msg`scene_videoscene_museum`,
        body: _msg`familyguide_card_13_body`,
        image: '../../img/scenes/museum_1x.png',
        href: 'museum.html',
      },
      {
        title: _msg`scene_videoscene_carpool`,
        body: _msg`familyguide_card_14_body`,
        image: '../../img/scenes/carpool_1x.png',
        href: 'carpool.html',
      },
      {
        title: _msg`scene_videoscene_liftoff`,
        body: _msg`familyguide_card_15_body`,
        image: '../../img/scenes/takeoff_1x.png',
        href: 'liftoff.html',
      },
      /* TODO: Holding OLLIE UNDER THE SEA card */
      // {
      //   title: _msg`scene_ollieundersea`,
      //   body: _msg`familyguide_card_16_body`,
      //   image: '../../img/scenes/horatio_1x.png',
      //   href: '#',
      // },
    ]
  },
];

const cta = _msg`learn`

const ageLabel = _msg`familyguide_card_age`

export { models, cta, ageLabel };