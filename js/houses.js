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

// Note: launch dates need to be parsed in 'Dec 1, 2014' formatted.
// Date('yyyy-mm-dd') produces a UTC date. We want local dates.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#Differences_in_assumed_time-zone

window.HOUSES = [{
  module: "airport",
  iced: true,
  launchDate: new Date('Dec 1, 2014'),
  category: "play",
  cast: true,
  disabled: false,
  elves: {
    melt: [
    "elf-green",
    "elf-orange",
    "elf-blue",
    "elf-red-girl"
    ],
    snow: [
    "elf-green-snow-hide",
    "elf-orange-snow",
    "elf-blue-snow",
    "elf-red-girl-snow-left"
    ]
  }
}, {
  module: "racer",
  iced: true,
  launchDate: new Date('Dec 1, 2014'),
  category: "play",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-blue-girl-right",
    "elf-red",
    "elf-orange",
    "elf-purple"
    ],
    snow: [
    "elf-blue-girl-snow-right",
    "elf-red-snow",
    "elf-orange-snow-hide",
    "elf-purple"
    ]
  }
}, {
  module: "traditions",
  iced: true,
  launchDate: new Date('Dec 1, 2014'),
  category: "learn",
  cast: true,
  disabled: false,
  elves: {
    melt: [
    "elf-red",
    "elf-blue",
    "elf-orange-girl-left",
    "elf-red"
    ],
    snow: [
    "elf-red-snow",
    "elf-blue",
    "elf-orange-girl-snow-left",
    "elf-red-snow"
    ]
  }
}, {
  module: "app",
  iced: true,
  launchDate: new Date('Dec 1, 2014'),
  category: "play",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-purple-right",
    "elf-red",
    "elf-blue"
    ],
    snow: [
    "elf-purple-snow-right",
    "elf-red-snow",
    "elf-blue-snow-hide"
    ]
  },
  link: 'https://play.google.com/store/apps/details?id=com.google.android.apps.santatracker'
}, {
  module: "trailer",
  iced: true,
  launchDate: new Date('Dec 2, 2014'),
  category: "watch",
  cast: true,
  disabled: false,
  elves: {
    melt: [
    "elf-purple-right",
    "elf-red",
    "elf-green",
    "elf-blue-left"
    ],
    snow: [
    "elf-purple-right",
    "elf-red-snow-hide",
    "elf-green-snow",
    "elf-blue-left"
    ]
  }
}, {
  module: "boatload",
  iced: true,
  category: "play",
  launchDate: new Date('Dec 3, 2014'),
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-blue-girl-right",
    "elf-orange",
    "elf-green-right",
    ],
    snow: [
    "elf-blue-girl-snow-right",
    "elf-orange-snow-hide",
    "elf-green-snow-right"
    ]
  }
}, {
  module: "briefing",
  iced: true,
  launchDate: new Date('Dec 4, 2014'),
  category: "play",
  cast: true,
  disabled: false,
  elves: {
    melt: [
    "elf-orange",
    "elf-red",
    "elf-purple-girl-left"
    ],
    snow: [
    "elf-orange-snow",
    "elf-red-snow-hide",
    "elf-purple-girl-snow-left"
    ]
  }
}, {
  module: "matching",
  iced: true,
  launchDate: new Date('Dec 5, 2014'),
  category: "play",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-purple",
    "elf-green",
    "elf-orange-girl-left",
    "elf-red"
    ],
    snow: [
    "elf-purple-snow",
    "elf-green-snow-hide",
    "elf-orange-girl-snow-left",
    "elf-red-snow"
    ]
  }
}, {
  module: "presentdrop",
  iced: true,
  launchDate: new Date('Dec 6, 2014'),
  category: "play",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-red",
    "elf-purple",
    "elf-red-girl-left",
    "elf-blue-right"
    ],
    snow: [
    "elf-red",
    "elf-purple-snow-hide",
    "elf-red-girl-snow-left",
    "elf-blue-snow-right"
    ]
  }
}, {
  module: "gumball",
  iced: true,
  launchDate: new Date('Dec 7, 2014'),
  category: "play",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-red-girl-left",
    "elf-orange",
    "elf-orange-right",
    "elf-blue"
    ],
    snow: [
    "elf-red-girl-snow-left",
    "elf-orange",
    "elf-orange-snow-right",
    "elf-blue-snow"
    ]
  }
}, {
  module: "jetpack",
  iced: true,
  launchDate: new Date('Dec 8, 2014'),
  category: "play",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-green",
    "elf-green-girl-left",
    "elf-orange",
    "elf-red-girl-right"
    ],
    snow: [
    "elf-green",
    "elf-green-girl-snow-left",
    "elf-orange-snow",
    "elf-red-snow-left"
    ]
  }
}, {
  module: "codelab",
  iced: true,
  launchDate: new Date('Dec 9, 2014'),
  category: "learn",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-green-girl-left",
    "elf-blue",
    "elf-green-right",
    "elf-red"
    ],
    snow: [
    "elf-green-girl-snow-left",
    "elf-blue-snow",
    "elf-green-snow-right",
    "elf-red-snow-hide"
    ]
  }
}, {
  module: "mercator",
  iced: true,
  launchDate: new Date('Dec 10, 2014'),
  category: "learn",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-red-girl-right",
    "elf-green",
    "elf-blue-right",
    "elf-orange"
    ],
    snow: [
    "elf-reg-girl-snow-right",
    "elf-green-snow-hide",
    "elf-blue-snow-right",
    "elf-orange-snow"
    ]
  }
}, {
  module: "jamband",
  iced: true,
  launchDate: new Date('Dec 11, 2014'),
  category: "play",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-red",
    "elf-purple",
    "elf-orange-left",
    "elf-blue"
    ],
    snow: [
    "elf-red",
    "elf-purple",
    "elf-orange-snow-left",
    "elf-blue-snow-hide"
    ]
  }
}, {
  module: "santaselfie",
  iced: true,
  category: "play",
  launchDate: new Date('Dec 12, 2014'),
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-green",
    "elf-purple",
    "elf-orange-left",
    "elf-red-girl-right"
    ],
    snow: [
    "elf-green-snow-hide",
    "elf-purple-snow",
    "elf-orange-left",
    "elf-red-girl-snow-right"
    ]
  }
}, {
  module: "commandcentre",
  iced: true,
  launchDate: new Date('Dec 13, 2014'),
  category: "play",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-red-left",
    "elf-green",
    "elf-blue",
    "elf-blue-right"
    ],
    snow: [
    "elf-red-snow-left",
    "elf-green",
    "elf-blue-snow",
    "elf-blue"
    ]
  }
}, {
  module: "playground",
  iced: true,
  launchDate: new Date('Dec 14, 2014'),
  category: "play",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-red",
    "elf-orange-girl-left",
    "elf-blue",
    "elf-purple"
    ],
    snow: [
    "elf-red",
    "elf-orange-girl-snow-left",
    "elf-blue-snow-hide",
    "elf-purple-snow"
    ]
  }
}, {
  module: "windtunnel",
  iced: true,
  launchDate: new Date('Dec 15, 2014'),
  category: "play",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-blue-left",
    "elf-green",
    "elf-red-right",
    "elf-blue"
    ],
    snow: [
    "elf-blue-snow-left",
    "elf-green-snow-hide",
    "elf-red-snow-right",
    "elf-blue"
    ]
  }
}, {
  module: "carpool",
  iced: true,
  launchDate: new Date('Dec 16, 2014'),
  category: "watch",
  cast: true,
  disabled: false,
  elves: {
    melt: [
    "elf-green-girl-right",
    "elf-red",
    "elf-purple-left",
    "elf-purple"
    ],
    snow: [
    "elf-green-girl-right",
    "elf-red-snow",
    "elf-purple-snow-left",
    "elf-purple-snow"
    ]
  }
}, {
  module: "factory",
  iced: true,
  launchDate: new Date('Dec 17, 2014'),
  category: "play",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-red-girl-right",
    "elf-orange",
    "elf-blue-right",
    "elf-red"
    ],
    snow: [
    "elf-red-girl-snow-right",
    "elf-orange-snow-hide",
    "elf-blue-snow-right",
    "elf-red-snow"
    ]
  }
}, {
  module: "postcard",
  iced: true,
  launchDate: new Date('Dec 18, 2014'),
  category: "play",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-green",
    "elf-orange",
    "elf-blue-girl-right",
    "elf-purple"
    ],
    snow: [
    "elf-green",
    "elf-orange-snow-hide",
    "elf-blue-girl-snow-right",
    "elf-purple-snow"
    ]
  }
}, {
  module: "streetview",
  iced: true,
  launchDate: new Date('Dec 19, 2014'),
  category: "play",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-orange-girl-right",
    "elf-blue",
    "elf-red-girl-left",
    "elf-green"
    ],
    snow: [
    "elf-orange-girl-snow-right",
    "elf-blue-snow",
    "elf-red-girl-snow-left",
    "elf-green"
    ]
  }
}, {
  module: "callfromsanta",
  iced: true,
  launchDate: new Date('Dec 19, 2014'),
  category: "play",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-orange-girl-right",
    "elf-blue",
    "elf-red-girl-left",
    "elf-green"
    ],
    snow: [
    "elf-orange-girl-snow-right",
    "elf-blue-snow",
    "elf-red-girl-snow-left",
    "elf-green"
    ]
  }
}, {
  module: "translations",
  iced: true,
  launchDate: new Date('Dec 20, 2014'),
  category: "learn",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-green",
    "elf-blue",
    "elf-orange-girl-left",
    "elf-red",
    "elf-purple-right"
    ],
    snow: [
    "elf-gree",
    "elf-blue",
    "elf-orange-girl-snow-left",
    "elf-red-snow-hide",
    "elf-purple-snow-right"
    ]
  }
}, {
  module: "seasonofgiving",
  iced: true,
  launchDate: new Date('Dec 21, 2014'),
  category: "learn",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-green-girl-left",
    "elf-red",
    "elf-purple-right",
    "elf-purple"
    ],
    snow: [
    "elf-green-girl-snow-left",
    "elf-red-snow",
    "elf-purple-snow-right",
    "elf-purple"
    ]
  }
}, {
  module: "citylights",
  iced: true,
  launchDate: new Date('Dec 22, 2014'),
  category: "learn",
  cast: false,
  disabled: false,
  elves: {
    melt: [
    "elf-green-girl-right",
    "elf-blue",
    "elf-red-left",
    "elf-purple"
    ],
    snow: [
    "elf-green-girl-snow-right",
    "elf-blue-snow",
    "elf-red-snow-left",
    "elf-purple-snow"
    ]
  }
}, {
  module: "liftoff",
  iced: true,
  launchDate: new Date('Dec 23, 2014'),
  category: "watch",
  cast: true,
  disabled: false,
  elves: {
    melt: [
    "elf-purple-right",
    "elf-red",
    "elf-purple-left",
    "elf-blue"
    ],
    snow: [
    "elf-purple-snow-right",
    "elf-red-snow-hide",
    "elf-purple-snow-left",
    "elf-blue-snow-hide"
    ]
  }
}];
