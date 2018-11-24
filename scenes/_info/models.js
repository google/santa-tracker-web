const models = [
  {
    'key': 'wrapbattle',
    'title': 'Wrap Battle',
    'opens': 1,
    'type': 'Play',
    'filter': '',
    'description': 'Use your phone or computer with rhythm to keep Santa\'s elves\' \"wrapping\"!',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/wrapbattle-screenshot.png'
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/wrapbattle-animation.gif',
      }
    ]
  },
  {
    'key': 'traditions',
    'title': 'Holiday Traditions',
    'opens': 1,
    'type': 'Learn',
    'filter': 'education socialstudies geography',
    'description': 'From wearing a toque in Canada to sporting swim trunks in Australia, click the map pins to learn about holiday traditions around the globe.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/santa-tracker-tradtions.png',

      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/DEC1-traditions-full.gif',
      }
    ]
  },
  {
    'key': 'codelab',
    'title': 'Code Lab',
    'opens': 1,
    'type': 'Learn',
    'filter': 'education computerscience',
    'description': 'Use coding fundamentals to navigate the elf through the forest to find dropped presents.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/santa-tracker-codelab.png',
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/DEC1-codelab-full.gif',
      }
    ]
  },
  {
    'key': 'airport',
    'title': 'North Pole Airport',
    'opens': 1,
    'type': 'Play',
    'filter': '',
    'description': 'It\'s arrival time! Elves land at the North Pole Airport (ELV) - check out the conveyor belt for surprises.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/santa/scenes/airport.png',
      },
      {
        'url': 'https://storage.googleapis.com/santa/scenes/airport.gif',
      }
    ]
  },
  {
    'key': 'snowflake',
    'title': 'Code a Snowflake',
    'opens': 2,
    'type': 'Play',
    'filter': 'education computerscience',
    'description': 'Nothing says "Happy Holidays" like Rudolph on the beach. Create your own holiday card by programming your own snowflake, selecting one of many backgrounds, and share with your friends.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/snowflake-screenshot.png',
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/snowflake-animation.gif',
      }
    ]
  },
  {
    'key': 'translations',
    'title': 'Translations',
    'opens': 3,
    'type': 'Learn',
    'filter': 'education language',
    'description': 'From Happy New Year in Elvish to Дед Мороз, learn the Santa lingo from around the world.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/translations-screenshot.png',
      },
      {
        'title': 'Animation',
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/translations-animation.gif',
      }
    ]
  },
  {
    'key': 'museum',
    'title': 'A Day at the Museum',
    'opens': 4,
    'type': 'Watch',
    'filter': '',
    'description': 'Santa needs to get ready to deliver presents again this year!',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/santa/scenes/museum.png',
      },
      {
        'url': 'https://storage.googleapis.com/santa/scenes/museum.gif',
      },
    ],
  },
  {
    'key': 'santascanvas',
    'title': 'Santa\'s Canvas',
    'opens': 5,
    'type': 'Play',
    'filter': 'new',
    'description': 'Draw, color, paint, create. Santa\'s Canvas is Santa\'s very own creative suite. A blank canvas for everyone to get creative. Each tool, brush, and sticker has a custom sound, making this an audio and visual experience.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/santa/scenes/santascanvas.png',
      },
      {
        'url': 'https://storage.googleapis.com/santa/scenes/santascanvas.gif',
      },
    ],
  },
  {
    'key': 'codeboogie',
    'title': 'Code Boogie',
    'opens': 6,
    'type': 'Play',
    'filter': 'education computerscience',
    'description': 'The elves are back to coding practice, while mixing in their dancing skills. Use code to choreograph the elves\' dances - but watch out, as you get better, the dances get harder!',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/santa/scenes/codeboogie.png',
      },
      {
        'url': 'https://storage.googleapis.com/santa/scenes/codeboogie.gif',
      }
    ]
  },
  {
    'key': 'presentbounce',
    'title': 'Present Bounce',
    'opens': 7,
    'type': 'Play',
    'filter': '',
    'description': 'Get presents from A to B using springs, conveyer belts, and the laws of motion and energy.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/santa-tracker-present-bounce.png',
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/DEC16-presentbounce-full.gif',
      }
    ]
  },
  {
    'key': 'penguindash',
    'title': 'Penguin Dash',
    'opens': 8,
    'type': 'Play',
    'filter': '',
    'description': 'Help a penguin 🐧 slide, jump and navigate icebergs to collect presents. But watch out and don\'t fall in the icy water!',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/penguindash-screenshot.png',
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/penguindash-animation.gif',
      }
    ]
  },
  {
    'key': 'seasonofgiving',
    'title': 'Season of Giving',
    'opens': 9,
    'type': 'Learn',
    'filter': 'education socialstudies',
    'description': 'Google\'s Santa Tracker partnered with Google.org to connect kids of all ages with charities around the world. Decorate an ornament to print out and hang on your tree to show your support for Libraries Without Borders, Khan Academy, Code.org, and more.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/seasonofgiving-screenshot.png',
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/seasonofgiving-animation.gif',
      }
    ]
  },
  {
    'key': 'gumball',
    'title': 'Gumball Tilt',
    'opens': 10,
    'type': 'Play',
    'filter': '',
    'description': 'Need your holidays to be a bit sweeter? Tilt the candy canes to make the gumballs fall into the machine.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/santa-tracker-gumball-tilt.png',
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/DEC11-gumballtilt-full.gif',
      }
    ]
  },
  {
    'key': 'jamband',
    'title': 'Elf Jamband',
    'opens': 11,
    'type': 'Play',
    'filter': '',
    'description': 'Drag and drop musical elves on stage to create your own unique holiday jam.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/jamband-screenshot.png',
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/jamband-animation.gif',
      }
    ]
  },
  {
    'key': 'speedsketch',
    'title': 'Speed Sketch',
    'opens': 12,
    'type': 'Play',
    'filter': 'new',
    'description': 'A Santa-fied version of Google\'s popular "Quick, Draw!" where you help teach Santa\'s robot "Tensor" how to recognize holiday-themed doodles.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/santa/scenes/speedsketch.png',
      },
      {
        'url': 'https://storage.googleapis.com/santa/scenes/speedsketch.gif',
      },
    ],
  },
  {
    'key': 'santaselfie',
    'title': 'Santa Selfie',
    'opens': 13,
    'type': 'Play',
    'filter': '',
    'description': 'Give Santa a makeover by trimming, coloring, and decorating Santa\'s beard. Don\'t forget to take a selfie and share with friends when you\'re done!',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/santa-tracker-santa-selfie.png',
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/DEC3-santaselfie-full.gif',
      }
    ]
  },
  {
    'key': 'santasearch',
    'title': 'Santa Search',
    'opens': 14,
    'type': 'Play',
    'filter': '',
    'description': 'Santa\'s wandering about, but the elves need him back in the North Pole. Can you help find him?',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/santasearch-screenshot.png',
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/santasearch-animation.gif',
      }
    ]
  },
  {
    'key': 'carpool',
    'title': 'Elf Car',
    'opens': 15,
    'type': 'Watch',
    'filter': '',
    'description': 'A small car zooms through the village, arriving at the factory. One elf gets out, then another, then another...',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/santa-tracker-elf-car.png',
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/DECX-carpool-full.gif',
      }
    ]
  },
  {
    'key': 'elfski',
    'title': 'Elf Ski',
    'opens': 16,
    'type': 'Play',
    'filter': 'new',
    'description': 'On your marks, get set, go! See how far you can get down the hill, collecting presents that have been hidden along the way.',
    'resources': [
      // TODO(samthor): resources
    ]
  },
  {
    'key': 'boatload',
    'title': 'Gift Slingshot',
    'opens': 17,
    'type': 'Play',
    'filter': '',
    'description': 'Slingshot presents into boats as the elves transport the gifts through the North Pole.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/boatload-screenshot.png',
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/DEC14-gifslingshot-full.gif',
      }
    ]
  },
  {
    'key': 'jetpack',
    'title': 'Elf Jetpack',
    'opens': 18,
    'type': 'Play',
    'filter': '',
    'description': 'Fly the elf through the air to collect falling presents - who knows, it might be yours.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/santa-tracker-elf-jetpack.png',
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/DEC13-elfjetpack-full.gif',
      }
    ]
  },
  {
    'key': 'runner',
    'title': 'Reindeer Runner',
    'opens': 19,
    'type': 'Play',
    'filter': '',
    'description': 'Help an elf and their trusty companion collect lost presents around the village.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/runner-screenshot.png',
      }
    ]
  },
  {
    'key': 'mercator',
    'title': 'Map Quiz',
    'opens': 20,
    'type': 'Learn',
    'filter': 'education geography',
    'description': 'Santa\'s got a lot of places to go. Match the outline of a country to the map in this geography game.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/santa-tracker-map-quiz.png',
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/DEC15-mapquiz-full.gif',
      }
    ]
  },
  {
    'key': 'snowball',
    'title': 'Snowball Storm',
    'opens': 21,
    'type': 'Play',
    'filter': 'new',
    'description': 'Participate in a traditional snowball fight with other elves!',
    'resources': [
      // TODO(samthor): resources
    ]
  },
  {
    'key': 'presentdrop',
    'title': 'Present Drop',
    'opens': 22,
    'type': 'Play',
    'filter': '',
    'description': 'It\'s target practice time! Position the elf to hit presents so they make it down the chimney.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/santa-tracker-present-drop.png',
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/DEC6-presentdrop-full.gif',
      }
    ]
  },
  {
    'key': 'liftoff',
    'title': 'Santa\'s Takeoff',
    'opens': 23,
    'type': 'Watch',
    'filter': '',
    'description': 'It\'s almost C-day! Santa and team make the final preparations for the big night - but something always goes wrong at the last minute.',
    'resources': [
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/santa-tracker-santas-takeoff.png',
      },
      {
        'url': 'https://storage.googleapis.com/mapsdevsite/santa-2015/DEC23-takeoff-full.gif',
      }
    ]
  },
  // Android scenes below here, with _ prefix
  {
    'key': '_santasnap',
    'title': 'Santa Snap',
    'opens': 0,
    'type': 'Android',
    'filter': 'android',
    'description': 'Fly Santa\'s elf throughout the world\'s largest cities in 3D! Capture photos of famous landmarks, collect presents, and much more.',
  },
  {
    'key': '_presentquest',
    'title': 'Present Quest',
    'opens': 0,
    'type': 'Android',
    'filter': 'android',
    'description': 'Oh no! Presents have fallen off the sleighs on their way to the North Pole. Santa needs your help to recover presents with your phone out in the real world.',
  },
  {
    'key': '_cityquiz',
    'title': 'City Quiz',
    'opens': 0,
    'type': 'Android',
    'filter': 'android',
    'description': 'Show off your globe trotting status by recognizing cities around the world by using scenic photos.',
  },
  {
    'key': '_penguinswim',
    'title': 'Penguin Swim',
    'opens': 0,
    'type': 'Android',
    'filter': 'android',
    'description': 'Penguins are some of the best swimmers in the north pole! Help Santa\'s favorite penguin swim through the ice filled waters and see how far you can get.',
  },
  {
    'key': '_snowball',
    'title': 'Snowball Run',
    'opens': 0,
    'type': 'Android',
    'filter': 'android',
    'description': 'Did you know elves have to train to get in shape for the big day? See if you can outpace Santa\'s helpers while also avoiding a rolling snowball.',
  },
];

export default models;