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
    'key': 'trailer',
    'title': 'Trailer',
    'opens': '1',
    'ordinal': 'st',
    'type': 'Game',
    'new': true,
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
    'key': 'app',
    'title': 'App',
    'opens': '1',
    'ordinal': 'st',
    'type': 'Game',
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
    'key': 'app',
    'title': 'App',
    'opens': '1',
    'ordinal': 'st',
    'type': 'Game',
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
    'key': 'app',
    'title': 'App',
    'opens': '1',
    'ordinal': 'st',
    'type': 'Game',
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
    'key': 'app',
    'title': 'App',
    'opens': '1',
    'ordinal': 'st',
    'type': 'Game',
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

];
