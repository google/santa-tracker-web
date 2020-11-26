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

goog.provide('app.Constants');
// Required to make the scoreboard work. But doesn't actually provide anything.
goog.provide('Constants');

/**
 * Scene constants
 * @const
*/
app.Constants = {

  TTS_DOMAIN: 'https://translate.googleapis.com/translate_tts',
  TTS_QUERY: '?ie=UTF-8&client=santa-tracker&tl={TL}&q={Q}',
  
  PHRASES: {
    'Santa Claus': {
      'ar': 'بَابَا نُوِيل',
      'zh-CN': '圣诞老人',
      'zh-TW': '聖誕老人',
      'cs': 'Santa Klaus',
      'da': 'Julemanden',
      'nl': 'Kerstman',
      'en': 'Santa Claus',
      'fr': 'Père Noël',
      'de': 'Weihnachtsmann',
      'el': 'Άγιος Βασίλης',
      'hi': 'सांता क्लॉज़',
      'hu': 'Mikulás',
      'it': 'Babbo Natale',
      'ja': 'サンタクロース',
      'ko': '산타 클로스',
      'no': 'julenissen',
      'pl': 'Święty Mikołaj',
      'pt': 'Papai Noel',
      'ru': 'Дед Мороз',
      'sk': 'Santa Claus',
      'es': 'Papá Noel',
      'sv': 'Jultomten',
      'th': 'ซานตาคลอส',
      'tr': 'Noel Baba'
    },
    'Happy New Year': {
      'ar': 'كل عام وأنتم بخير',
      'zh-CN': '新年快乐',
      'zh-TW': '新年快樂',
      'cs': 'Šťastný Nový Rok',
      'da': 'Godt Nytår',
      'nl': 'Gelukkig Nieuwjaar',
      'en': 'Happy New Year',
      'fr': 'Bonne année',
      'de': 'Frohes neues Jahr',
      'el': 'Ευτυχισμένο το Νέο Έτος',
      'hi': 'नया साल मुबारक हो',
      'hu': 'Boldog új évet!',
      'it': 'Buon anno',
      'ja': '明けましておめでとうございます',
      'ko': '새해 복 많이 받으세요',
      'no': 'Godt nytt år',
      'pl': 'Szczęśliwego Nowego Roku',
      'pt': 'Feliz Ano Novo',
      'ru': 'С Новым годом',
      'sk': 'Šťastný Nový Rok',
      'es': 'Feliz Año Nuevo',
      'sv': 'Gott Nytt År',
      'th': 'สวัสดีปีใหม่',
      'tr': 'Mutlu Yıllar'
    },
    'Season\'s Greetings': {
      'ar': 'تهاني الموسم',
      'zh-CN': '节日问候',
      'zh-TW': '節慶祝賀',
      'cs': 'Šťastné svátky',
      'da': 'Glædelig jul',
      'nl': 'Prettige kerstdagen',
      'en': 'Season\'s Greetings',
      'fr': 'Bonnes fêtes',
      'de': 'Frohes Fest',
      'el': 'Θερμές ευχές',
      'hi': 'नवऋतु की शुभकामनाएं',
      'hu': 'Karácsonyi üdvözlet',
      'it': 'Auguri',
      'ja': '季節のご挨拶',
      'ko': '즐거운 성탄절',
      'no': 'God jul og godt nytt år',
      'pl': 'Wesołych Świąt i szczęśliwego Nowego Roku',
      'pt': 'Saudações festivas',
      'ru': 'С Новым годом и Рождеством',
      'sk': 'Šťastné sviatky',
      'es': '¡Felices Fiestas!',
      'sv': 'God Jul och Gott Nytt År',
      'th': 'ส่งความสุขช่วงเทศกาล',
      'tr': 'Tatil Kutlamaları'
    }
  },

  // TODO(jez): Replace these placeholder colors
  COLORS: [
    '#841c3f', // Pinkish
    '#3c4577', // Blue
    'rgb(158, 36, 36)', // Green
    'rgb(222, 156, 0)', // Yellow

    'rgb(29, 146, 158)', // Cyan
    'rgb(224, 112, 56)', // Orange
    'rgb(82, 82, 82)', // Grey
    '#4a1c52', // Purple-ish
  ]
};