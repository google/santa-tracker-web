/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        id: 'codelab',
        title: _msg`scene_codelab`,
        body: _msg`familyguide_card_01_body`,
      },
      // TODO(samthor): Restore once snowflake game is back.
      // {
      //   id: 'snowflake',
      //   title: _msg`scene_snowflake`,
      //   body: _msg`familyguide_card_02_body`,
      // },
      {
        id: 'codeboogie',
        title: _msg`scene_codeboogie`,
        body: _msg`familyguide_card_03_body`,
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
        id: 'traditions',
        title: _msg`scene_traditions`,
        body: _msg`familyguide_card_04_body`,
      },
      {
        id: 'translations',
        title: _msg`scene_translations`,
        body: _msg`familyguide_card_05_body`,
      },
      {
        id: 'mercator',
        title: _msg`scene_mercator`,
        body: _msg`familyguide_card_06_body`,
      },
      {
        id: 'traditionsquiz',
        title: _msg`scene_traditionsquiz`,
        body: _msg`familyguide_card_07_body`,
        href: 'https://earth.google.com/web/@43.129579,-112.010821,1838a,2269637d,35y,0.00000182h,0.4t,0r/data=CisSKRIgZDRkYTI4YTFkMmYwMTFlODk2YTFjZDc4YmJiZmMxYTkiBXNwbC0w',
      },
      /* TODO: Holding GOOGLE EARTH HOLIDAY FOODS card */
      // {
      //   id: 'holdiayfoods',
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
        id: 'santascanvas',
        title: _msg`scene_canvas`,
        body: _msg`familyguide_card_09_body`,
      },
      {
        id: 'snowbox',
        title: _msg`scene_snowbox`,
        body: _msg`familyguide_card_10_body`,
      },
      {
        id: 'elfmaker',
        title: _msg`scene_elfmaker`,
        body: _msg`familyguide_card_11_body`,
      },
      {
        id: 'santaselfie',
        title: _msg`scene_santaselfie`,
        body: _msg`familyguide_card_12_body`,
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
        id: 'storybook',
        title: _msg`scene_ollieundersea`,
        body: _msg`familyguide_card_16_body`,
      },
      {
        id: 'museum',
        title: _msg`scene_videoscene_museum`,
        body: _msg`familyguide_card_13_body`,
      },
      {
        id: 'carpool',
        title: _msg`scene_videoscene_carpool`,
        body: _msg`familyguide_card_14_body`,
      },
      {
        id: 'liftoff',
        title: _msg`scene_videoscene_liftoff`,
        body: _msg`familyguide_card_15_body`,
      },
    ]
  },
];

const cta = _msg`learn`

const ageLabel = _msg`familyguide_card_age`

export { models, cta, ageLabel };