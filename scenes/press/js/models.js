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
    'description': 'I am a brief description of this game. Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
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
    'description': 'I am a brief description of this game, video or experience. Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
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
    'description': 'I am a brief description of this game. Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
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
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
    'resources': [
    ]
  },
  {
    'key': 'santamapdive',
    'title': 'Santa Map Dive',
    'opens': '1',
    'ordinal': 'st',
    'type': 'Play',
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
    'resources': [
    ]
  },
  {
    'key': 'app',
    'title': 'Android App',
    'opens': '1',
    'ordinal': 'st',
    'type': 'Play',
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
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
    'description': 'I am a brief description of this video.  This is hopefully up to five lines tops.',
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
    'description': 'I am a brief description of this game. Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
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
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
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
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
    'resources': [
    ]
  },
  {
    'key': 'briefing',
    'title': 'Mrs. Claus\' Briefing',
    'opens': '5',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
    'resources': [
    ]
  },
  {
    'key': 'presentdrop',
    'title': 'Present Drop',
    'opens': '6',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
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
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
    'resources': [
    ]
  },
  {
    'key': 'windtunnel',
    'title': 'Windtunnel',
    'opens': '8',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
    'resources': [
    ]
  },
  {
    'key': 'racer',
    'title': 'Rudolph Racer',
    'opens': '9',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
    'resources': [
    ]
  },
  {
    'key': 'jamband',
    'title': 'Elf Jamband',
    'opens': '10',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
    'resources': [
    ]
  },
  {
    'key': 'gumball',
    'title': 'Gumball Tilt',
    'opens': '11',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
    'resources': [
    ]
  },
  {
    'key': 'postcard',
    'title': 'Santa Cards',
    'opens': '12',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
    'resources': [
    ]
  },
  {
    'key': 'jetpack',
    'title': 'Elf Jetpack',
    'opens': '13',
    'ordinal': 'th',
    'type': 'PLay',
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
    'resources': [
    ]
  },
  {
    'key': 'boatload',
    'title': 'Gift Slingshot',
    'opens': '14',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
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
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
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
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
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
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
    'resources': [
    ]
  },
  {
    'key': 'elf-car',
    'title': 'Elf Car',
    'opens': '18',
    'ordinal': 'th',
    'type': 'Watch',
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
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
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
    'resources': [
    ]
  },
  {
    'key': 'commandcentre',
    'title': 'Mission Control',
    'opens': '20',
    'ordinal': 'th',
    'type': 'Play',
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
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
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
    'resources': [
    ]
  },
  {
    'key': 'matching',
    'title': 'Memory Match',
    'opens': '22',
    'ordinal': 'nd',
    'type': 'Play',
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
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
    'description': 'Lorem ipsum dolor sit amet, co nsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. This is hopefully up to five lines tops.',
    'resources': [
    ]
  }
];
