goog.provide('app.Constants');

/**
 * Scene constants
 * @const
*/
app.Constants = {

  TTS_DOMAIN: 'https://translate.googleapis.com/translate_tts',
  TTS_QUERY: '?ie=UTF-8&client=santa-tracker&tl={TL}&q={Q}',
  
  PHRASES: [
    {
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
    {
      'ar': 'هو هو هو',
      'zh-CN': '嗬嗬嗬',
      'zh-TW': '嗬嗬嗬',
      'cs': 'Ho Ho Ho',
      'da': 'Ho Ho Ho',
      'nl': 'Ho Ho Ho',
      'en': 'Ho Ho Ho',
      'fr': 'Ho Ho Ho',
      'de': 'Ho Ho Ho',
      'el': 'Χο χο χο',
      'hi': 'हो हो हो',
      'hu': 'Ho Ho Ho',
      'it': 'Ho Ho Ho',
      'ja': 'ホーホーホー',
      'ko': '호 호 호',
      'no': 'Ho Ho Ho',
      'pl': 'Ho Ho Ho',
      'pt': 'Ho Ho Ho',
      'ru': 'Хо-хо-хо',
      'sk': 'Ho Ho Ho',
      'es': 'Ho Ho Ho',
      'sv': 'Ho ho ho',
      'th': 'โฮ โฮ โฮ',
      'tr': 'Ho Ho Ho'
    },
    {
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
    {
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
  ],

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