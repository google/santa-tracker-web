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
 * These are gameplay and UI related constants used by the code.
 * Please tweak them to improve gameplay and game balance.
 */
/*var Cards = ['airport', 'racer', 'trailer', 'app', 'santaselfie', 'boatload',
          'briefing', 'matching', 'presentdrop', 'streetview', 'jamband',
          'codelab', 'translations', 'carpool', 'mercator', 'commandcentre',
          'playground', 'seasonofgiving', 'jetpack', 'factory', 'postcard', 'traditions',
          'windtunnel', 'gumball', 'citylights', 'liftoff'];*/

var Cards = [
  {
    'key': 'traditions',
    'title': 'Holiday Traditions',
    'opens': '1',
    'ordinal': 'st',
    'type': 'Learn',
    'education': true,
    'description': 'From wearing a toque in Canada to sporting swim trunks in Australia, click the map pins to learn about holiday traditions around the globe',
    'resources': [
      {
        'title': 'Still Screenshot',
        'url': 'http://google.com',
        'type': 'PNG file',
        'class': 'press-card-dl'
      },
      {
        'title': 'Video',
        'url': 'http://google.com',
        'type': 'YouTube Link',
        'class': 'press-card-play'
      }
    ]
  },
  {
    'key': 'codelab',
    'title': 'Code Lab',
    'opens': '1',
    'ordinal': 'st',
    'type': 'Learn',
    'education': true,
    'description': 'Use coding fundamentals to navigate the elf through the forest to find dropped presents.',
    'resources': [
      {
        'title': 'Still Screenshot',
        'url': 'http://google.com',
        'type': 'PNG file',
        'class': 'press-card-dl'
      },
      {
        'title': 'Animation',
        'url': 'http://google.com',
        'type': 'GIF file',
        'class': 'press-card-dl'
      },
      {
        'title': 'Video',
        'url': 'http://google.com',
        'type': 'YouTube Link',
        'class': 'press-card-play'
      }
    ]
  },
  {
    'key': 'airport',
    'title': 'North Pole Airport',
    'opens': '1',
    'ordinal': 'st',
    'type': 'Play',
    'description': 'It\'s arrival time! Elves land at the North Pole Airport (ELV) - check out the conveyor belt for surprises.',
    'resources': [
      {
        'title': 'Still Screenshot',
        'url': 'http://google.com',
        'type': 'PNG file',
        'class': 'press-card-dl'
      },
      {
        'title': 'Animation',
        'url': 'http://google.com',
        'type': 'GIF file',
        'class': 'press-card-dl'
      }
    ]
  },
  {
    'key': 'seasonofgiving',
    'title': 'Season of Giving',
    'opens': '1',
    'ordinal': 'st',
    'type': 'Learn',
    'education': true,
    'description': 'Google\'s Santa Tracker partnered with Google.org to connect kids of all ages with charities around the world. Decorate an ornament to print out and hang on your tree to show your support for SolarAid, the Jane Goodall Foundation, WWF, and many more.',
    'resources': [
    ]
  },
  {
    'key': 'santamapdive',
    'title': 'Santa Map Dive',
    'opens': '1',
    'ordinal': 'st',
    'type': 'Play',
    'description': 'Skydive with Santa as he navigates his way to drop off presents.',
    'resources': [
    ]
  },
  {
    'key': 'app',
    'title': 'Android App',
    'opens': '1',
    'ordinal': 'st',
    'type': 'Play',
    'description': 'Need Santa on the go?  Download the Santa Tracker App for Android.',
    'resources': [
    ]
  },
  {
    'key': 'santasback',
    'title': 'Santa\'s Back',
    'opens': '2',
    'ordinal': 'nd',
    'type': 'Watch',
    'new': true,
    'description': 'Rudolph\'s ready and the elves are hard at work. One problem - where\'s Santa? ',
    'resources': [
      {
        'title': 'Still Screenshot',
        'url': 'http://google.com',
        'type': 'PNG file',
        'class': 'press-card-dl'
      },
      {
        'title': 'Animation',
        'url': 'http://google.com',
        'type': 'GIF file',
        'class': 'press-card-dl'
      },
      {
        'title': 'Video',
        'url': 'http://google.com',
        'type': 'YouTube Link',
        'class': 'press-card-play'
      }
    ]
  },
  {
    'key': 'santaselfie',
    'title': 'Santa Selfie',
    'opens': '3',
    'ordinal': 'rd',
    'type': 'Play',
    'description': 'Give Santa a makeover by trimming, coloring, and decorating Santa\'s beard. Don\'t forget to take a selfie and share with friends when you\'re done!',
    'resources': [
      {
        'title': 'Still Screenshot',
        'url': 'http://google.com',
        'type': 'PNG file',
        'class': 'press-card-dl'
      },
      {
        'title': 'Animation',
        'url': 'http://google.com',
        'type': 'GIF file',
        'class': 'press-card-dl'
      },
      {
        'title': 'Animation 2',
        'url': 'http://google.com',
        'type': 'GIF file',
        'class': 'press-card-dl'
      },
      {
        'title': 'Video',
        'url': 'http://google.com',
        'type': 'YouTube Link',
        'class': 'press-card-play'
      }
    ]
  },
  {
    'key': 'translations',
    'title': 'Translations',
    'opens': '4',
    'ordinal': 'th',
    'type': 'Learn',
    'education': true,
    'description': 'From Happy New Year in Elvish to Дед Мороз, learn the Santa lingo from around the world.',
    'resources': [
      {
        'title': 'Still Screenshot',
        'url': 'http://google.com',
        'type': 'PNG file',
        'class': 'press-card-dl'
      },
      {
        'title': 'Animation',
        'url': 'http://google.com',
        'type': 'GIF file',
        'class': 'press-card-dl'
      },
      {
        'title': 'Video',
        'url': 'http://google.com',
        'type': 'YouTube Link',
        'class': 'press-card-play'
      }
    ]
  },
  {
    'key': 'callfromsanta',
    'title': 'Call from Santa',
    'opens': '5',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'Santa\'s spreading the holiday cheer - pick from a variety of options to send a call to a friend from Santa.',
    'resources': [
    ]
  },
  {
    'key': 'briefing',
    'title': 'Mrs. Claus\' Briefing',
    'opens': '5',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'Mrs. Claus briefs Santa and the team as they prepare for the big day.',
    'resources': [
    ]
  },
  {
    'key': 'presentdrop',
    'title': 'Present Drop',
    'opens': '6',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'It\'s target practice time! Position the elf to hit presents so they make it down the chimney.',
    'resources': [
    ]
  },
  {
    'key': 'santasearch',
    'title': 'Santa Search',
    'opens': '7',
    'ordinal': 'th',
    'type': 'Play',
    'new': true,
    'description': 'Santa\'s wandering about, but the elves need him back in the North Pole. Can you help find him?',
    'resources': [
    ]
  },
  {
    'key': 'windtunnel',
    'title': 'Windtunnel',
    'opens': '8',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'You never know what the weather conditions will be. Rudolph and the elves simulate what the team will face on the big day.',
    'resources': [
    ]
  },
  {
    'key': 'racer',
    'title': 'Rudolph Racer',
    'opens': '9',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'On your marks, get set, go! Race with Rudolph through the forest to collect presents the elves have dropped.',
    'resources': [
    ]
  },
  {
    'key': 'jamband',
    'title': 'Elf Jamband',
    'opens': '10',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'Drag and drop musical elfs on stage to create your own unique holiday jam.',
    'resources': [
    ]
  },
  {
    'key': 'gumball',
    'title': 'Gumball Tilt',
    'opens': '11',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'Need your holidays to be a bit sweeter? Tilt the candycanes to make the gumballs fall into the machine.',
    'resources': [
    ]
  },
  {
    'key': 'postcard',
    'title': 'Santa Cards',
    'opens': '12',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'Nothing says "Happy Holidays" like Rudolph on the beach. Create your own holiday card by selecting one of many backgrounds and characters to send to friends.',
    'resources': [
    ]
  },
  {
    'key': 'jetpack',
    'title': 'Elf Jetpack',
    'opens': '13',
    'ordinal': 'th',
    'type': 'PLay',
    'description': 'Fly the elf through the air to collect fallling presents - who knows, it might be yours.',
    'resources': [
    ]
  },
  {
    'key': 'boatload',
    'title': 'Gift Slingshot',
    'opens': '14',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'Slingshot presents into boats as the elves transport the gifts through the North Pole.',
    'resources': [
    ]
  },
  {
    'key': 'mapquiz',
    'title': 'Map Quiz',
    'opens': '15',
    'ordinal': 'th',
    'type': 'Learn',
    'education': true,
    'description': 'Santa\'s got a lot of places to go. Match the outline of a country to the map in this geography game.',
    'resources': [
    ]
  },
  {
    'key': 'presentbounce',
    'title': 'Present Bounce',
    'opens': '16',
    'ordinal': 'th',
    'type': 'Play',
    'new': true,
    'description': 'Get presents from A to B using springs, conveyer belts, and the laws of motion and energy.',
    'resources': [
    ]
  },
  {
    'key': 'codeboogie',
    'title': 'Code Boogie',
    'opens': '17',
    'ordinal': 'th',
    'type': 'Play',
    'new': true,
    'description': 'The elves are back to coding practice, but mixing in their dancing skills. Use code to choreograph the elves dances - but watch out, as you get better, the dances get harder!',
    'resources': [
    ]
  },
  {
    'key': 'elf-car',
    'title': 'Elf Car',
    'opens': '18',
    'ordinal': 'th',
    'type': 'Watch',
    'description': 'A small car zooms through the village, arriving at the factory. One elf gets out, then another, then another...',
    'resources': [
    ]
  },
  {
    'key': 'citylights',
    'title': 'City Lights',
    'opens': '19',
    'ordinal': 'th',
    'type': 'Learn',
    'education': true,
    'description': 'Cycle through Street View from around the world to witness how other cities celebrate the holidays.',
    'resources': [
    ]
  },
  {
    'key': 'commandcentre',
    'title': 'Mission Control',
    'opens': '20',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'It\'s almost go time. The elves are hard at work preparing the every team is ready for the big day.',
    'resources': [
    ]
  },
  {
    'key': 'seasonofcaring',
    'title': 'Season of Caring',
    'opens': '21',
    'ordinal': 'st',
    'type': 'Play',
    'new': true,
    'description': 'This holiday season, we partnered with Google.org to showcase how certain organizations are helping kids with special needs.',
    'resources': [
    ]
  },
  {
    'key': 'matching',
    'title': 'Memory Match',
    'opens': '22',
    'ordinal': 'nd',
    'type': 'Play',
    'description': 'Where\'d that tree go? Test your memory skills in this holiday game.',
    'resources': [
    ]
  },
  {
    'key': 'liftoff',
    'title': 'Santa\'s Takeoff',
    'opens': '23',
    'ordinal': 'rd',
    'type': 'Watch',
    'new': true,
    'description': 'It\'s almost C-day! Santa and team make the final preparations for the big night - but something always goes wrong at the last minute.',
    'resources': [
    ]
  }
];
