/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

goog.provide('app.Models');

/**
 * List of scenes and the associated data the press might need.
 */

app.Models = [
  {
    'key': 'elfmaker',
    'title': 'Elf Maker',
    'type': 'Play',
    'filter': 'new',
    'description': 'Build your own elf from head to toe and make sure it looks elftastic for the many holiday soirées happening on the North Pole.',
    'resources': [
      'https://storage.googleapis.com/santa/press/elfmaker.png',
    ],
  },
  {
    'key': 'wrapbattle',
    'title': 'Wrap Battle',
    'type': 'Play',
    'filter': '',
    'description': 'Use your phone or computer with rhythm to keep Santa\'s elves\' \"wrapping\"!',
    'resources': [
      'https://storage.googleapis.com/santa/press/wrapbattle.png',
      'https://storage.googleapis.com/santa/press/wrapbattle.gif',
    ],
  },
  {
    'key': 'traditions',
    'title': 'Holiday Traditions',
    'type': 'Learn',
    'filter': 'education socialstudies geography',
    'description': 'From wearing a toque in Canada to sporting swim trunks in Australia, click the map pins to learn about holiday traditions around the globe.',
    'resources': [
      'https://storage.googleapis.com/santa/press/traditions.png',
      'https://storage.googleapis.com/santa/press/traditions.gif',
    ],
  },
  {
    'key': 'codelab',
    'title': 'Code Lab',
    'type': 'Learn',
    'filter': 'education computerscience',
    'description': 'Use coding fundamentals to navigate the elf through the forest to find dropped presents.',
    'resources': [
      'https://storage.googleapis.com/santa/press/codelab.png',
      'https://storage.googleapis.com/santa/press/codelab.gif',
    ],
  },
  {
    'key': 'snowflake',
    'title': 'Code a Snowflake',
    'type': 'Play',
    'filter': 'education computerscience',
    'description': 'Nothing says "Happy Holidays" like Rudolph on the beach. Create your own holiday card by programming your own snowflake, selecting one of many backgrounds, and share with your friends.',
    'resources': [
      'https://storage.googleapis.com/santa/press/snowflake.png',
      'https://storage.googleapis.com/santa/press/snowflake.gif',
    ],
  },
  {
    'key': 'translations',
    'title': 'Translations',
    'type': 'Learn',
    'filter': 'education language',
    'description': 'From Happy New Year in Elvish to Дед Мороз, learn the Santa lingo from around the world.',
    'resources': [
      'https://storage.googleapis.com/santa/press/translations.png',
      'https://storage.googleapis.com/santa/press/translations.gif',
    ],
  },
  {
    'key': 'museum',
    'title': 'A Day at the Museum',
    'type': 'Watch',
    'filter': 'watch',
    'description': 'Santa needs to get ready to deliver presents again this year!',
    'resources': [
      'https://storage.googleapis.com/santa/press/museum.png',
      'https://storage.googleapis.com/santa/press/museum.gif',
    ],
  },
  {
    'key': 'santascanvas',
    'title': 'Santa\'s Canvas',
    'type': 'Play',
    'filter': 'education',
    'description': 'Draw, color, paint, create. Santa\'s Canvas is Santa\'s very own creative suite. A blank canvas for everyone to get creative. Each tool, brush, and sticker has a custom sound, making this an audio and visual experience.',
    'resources': [
      'https://storage.googleapis.com/santa/press/santascanvas.png',
      'https://storage.googleapis.com/santa/press/santascanvas.gif',
    ],
  },
  {
    'key': 'codeboogie',
    'title': 'Code Boogie',
    'type': 'Play',
    'filter': 'education computerscience',
    'description': 'The elves are back to coding practice, while mixing in their dancing skills. Use code to choreograph the elves\' dances - but watch out, as you get better, the dances get harder!',
    'resources': [
      'https://storage.googleapis.com/santa/press/codeboogie.png',
      'https://storage.googleapis.com/santa/press/codeboogie.gif',
    ],
  },
  {
    'key': 'presentbounce',
    'title': 'Present Bounce',
    'type': 'Play',
    'filter': '',
    'description': 'Get presents from A to B using springs, conveyer belts, and the laws of motion and energy.',
    'resources': [
      'https://storage.googleapis.com/santa/press/presentbounce.png',
      'https://storage.googleapis.com/santa/press/presentbounce.gif',
    ],
  },
  {
    'key': 'penguindash',
    'title': 'Penguin Dash',
    'type': 'Play',
    'filter': '',
    'description': 'Help a penguin 🐧 slide, jump and navigate icebergs to collect presents. But watch out and don\'t fall in the icy water!',
    'resources': [
      'https://storage.googleapis.com/santa/press/penguindash.png',
      'https://storage.googleapis.com/santa/press/penguindash.gif',
    ],
  },
  {
    'key': 'seasonofgiving',
    'title': 'Season of Giving',
    'type': 'Learn',
    'filter': 'education socialstudies',
    'description': 'Google\'s Santa Tracker partnered with Google.org to connect kids of all ages with charities around the world. Decorate an ornament to print out and hang on your tree to show your support for Libraries Without Borders, Khan Academy, Code.org, and more.',
    'resources': [
      'https://storage.googleapis.com/santa/press/seasonofgiving.png',
      'https://storage.googleapis.com/santa/press/seasonofgiving.gif',
    ],
  },
  {
    'key': 'gumball',
    'title': 'Gumball Tilt',
    'type': 'Play',
    'filter': '',
    'description': 'Need your holidays to be a bit sweeter? Tilt the candy canes to make the gumballs fall into the machine.',
    'resources': [
      'https://storage.googleapis.com/santa/press/gumball.png',
      'https://storage.googleapis.com/santa/press/gumball.gif',
    ],
  },
  {
    'key': 'jamband',
    'title': 'Elf Jamband',
    'type': 'Play',
    'filter': '',
    'description': 'Drag and drop musical elves on stage to create your own unique holiday jam.',
    'resources': [
      'https://storage.googleapis.com/santa/press/jamband.png',
      'https://storage.googleapis.com/santa/press/jamband.gif',
    ],
  },
  {
    'key': 'speedsketch',
    'title': 'Speed Sketch',
    'type': 'Play',
    'filter': '',
    'description': 'A Santa-fied version of Google\'s popular "Quick, Draw!" where you help teach Santa\'s robot "Tensor" how to recognize holiday-themed doodles.',
    'resources': [
      'https://storage.googleapis.com/santa/press/speedsketch.png',
      'https://storage.googleapis.com/santa/press/speedsketch.gif',
    ],
  },
  {
    'key': 'santaselfie',
    'title': 'Santa Selfie',
    'type': 'Play',
    'filter': '',
    'description': 'Give Santa a makeover by trimming, coloring, and decorating Santa\'s beard. Don\'t forget to take a selfie and share with friends when you\'re done!',
    'resources': [
      'https://storage.googleapis.com/santa/press/santaselfie.png',
      'https://storage.googleapis.com/santa/press/santaselfie.gif',
    ],
  },
  {
    'key': 'santasearch',
    'title': 'Santa Search',
    'type': 'Play',
    'filter': '',
    'description': 'Santa\'s wandering about, but the elves need him back in the North Pole. Can you help find him?',
    'resources': [
      'https://storage.googleapis.com/santa/press/santasearch.png',
      'https://storage.googleapis.com/santa/press/santasearch.gif',
    ],
  },
  {
    'key': 'carpool',
    'title': 'Elf Car',
    'type': 'Watch',
    'filter': 'watch',
    'description': 'A small car zooms through the village, arriving at the factory. One elf gets out, then another, then another...',
    'resources': [
      'https://storage.googleapis.com/santa/press/carpool.png',
      'https://storage.googleapis.com/santa/press/carpool.gif',
    ],
  },
  {
    'key': 'elfski',
    'title': 'Elf Ski',
    'type': 'Play',
    'filter': '',
    'description': 'On your marks, get set, go! See how far you can get down the hill, collecting presents that have been hidden along the way.',
    'resources': [
      'https://storage.googleapis.com/santa/press/elfski.png',
   ],
  },
  {
    'key': 'boatload',
    'title': 'Gift Slingshot',
    'type': 'Play',
    'filter': '',
    'description': 'Slingshot presents into boats as the elves transport the gifts through the North Pole.',
    'resources': [
      'https://storage.googleapis.com/santa/press/boatload.png',
      'https://storage.googleapis.com/santa/press/boatload.gif',
    ],
  },
  {
    'key': 'jetpack',
    'title': 'Elf Jetpack',
    'type': 'Play',
    'filter': '',
    'description': 'Fly the elf through the air to collect falling presents - who knows, it might be yours.',
    'resources': [
      'https://storage.googleapis.com/santa/press/jetpack.png',
      'https://storage.googleapis.com/santa/press/jetpack.gif',
    ],
  },
  {
    'key': 'runner',
    'title': 'Reindeer Runner',
    'type': 'Play',
    'filter': '',
    'description': 'Help an elf and their trusty companion collect lost presents around the village.',
    'resources': [
      'https://storage.googleapis.com/santa/press/runner.png',
    ],
  },
  {
    'key': 'mercator',
    'title': 'Map Quiz',
    'type': 'Learn',
    'filter': 'education geography',
    'description': 'Santa\'s got a lot of places to go. Match the outline of a country to the map in this geography game.',
    'resources': [
      'https://storage.googleapis.com/santa/press/mercator.png',
      'https://storage.googleapis.com/santa/press/mercator.gif',
    ],
  },
  {
    'key': 'snowball',
    'title': 'Snowball Storm',
    'type': 'Play',
    'filter': '',
    'description': 'Participate in a traditional snowball fight with other elves!',
    'resources': [
      'https://storage.googleapis.com/santa/press/snowball.png',
    ],
  },
  {
    'key': 'presentdrop',
    'title': 'Present Drop',
    'type': 'Play',
    'filter': '',
    'description': 'It\'s target practice time! Position the elf to hit presents so they make it down the chimney.',
    'resources': [
      'https://storage.googleapis.com/santa/press/presentdrop.png',
      'https://storage.googleapis.com/santa/press/presentdrop.gif',
    ],
  },
  {
    'key': 'liftoff',
    'title': 'Santa\'s Takeoff',
    'type': 'Watch',
    'filter': 'watch',
    'description': 'It\'s almost C-day! Santa and team make the final preparations for the big night - but something always goes wrong at the last minute.',
    'resources': [
      'https://storage.googleapis.com/santa/press/liftoff.png',
      'https://storage.googleapis.com/santa/press/liftoff.gif',
    ],
  },
  // Android scenes below here, with _ prefix
  {
    'key': '_cityquiz',
    'title': 'City Quiz',
    'type': 'Android',
    'filter': 'android',
    'description': 'Show off your globe trotting status by recognizing cities around the world by using scenic photos.',
  },
  {
    'key': '_penguinswim',
    'title': 'Penguin Swim',
    'type': 'Android',
    'filter': 'android',
    'description': 'Penguins are some of the best swimmers in the north pole! Help Santa\'s favorite penguin swim through the ice filled waters and see how far you can get.',
  },
  {
    'key': '_snowball',
    'title': 'Snowball Run',
    'type': 'Android',
    'filter': 'android',
    'description': 'Did you know elves have to train to get in shape for the big day? See if you can outpace Santa\'s helpers while also avoiding a rolling snowball.',
  },
];