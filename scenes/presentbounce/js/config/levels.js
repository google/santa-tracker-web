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


goog.provide('app.config.Levels');

goog.require('app.config.Materials');
goog.require('app.config.Styles');
goog.require('app.world.SnowGlobe');
goog.require('app.world.PresentBall');
goog.require('app.world.PresentSquare');

/**
 * Level configuration - specifies type of textures and positions only
 * @const
 */
app.config.Levels = [
  // level 1
  {
    ball: {
      material: app.config.Materials.present,
      style: app.config.Styles.presentBall,
      objectType: app.world.PresentBall,
      relX: 0.25,
      relY: 0
    },
    dropper: {
      material: app.config.Materials.fixedObject,
      style: app.config.Styles.dropper,
      relX: 0.3,
      relY: 0.07
    },
    target: {
      material: app.config.Materials.target,
      style: app.config.Styles.target,
      relX: 0.5,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.8,
        relY: 0.4,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeamInvertedShadow,
        relX: 0.4,
        relY: 0.8,
        rotation: 90 + 180 // flip to have proper shadow
      }
    ],
    conveyorBelts: [
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      }
    ],
    springs: []
  },

  // level 2
  {
    ball: {
      material: app.config.Materials.present,
      style: app.config.Styles.presentBall,
      objectType: app.world.PresentBall,
      relX: 0.2,
      relY: 0.15
    },
    dropper: {
      material: app.config.Materials.fixedObject,
      style: app.config.Styles.dropper,
      relX: 0.25,
      relY: 0.1
    },
    target: {
      material: app.config.Materials.target,
      style: app.config.Styles.target,
      relX: 0.75,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.55,
        relY: 0.25,
        rotation: 45
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeamInvertedShadow,
        relX: 0.6,
        relY: 0.75,
        rotation: 90 + 180 // flip to have proper shadow
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeamInvertedShadow,
        relX: 0.35,
        relY: 0.7,
        rotation: 90 + 180 // flip to have proper shadow
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .15,
        relY: .75,
        rotation: 0
      }
    ],
    conveyorBelts: [
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      },
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      }
    ],
    springs: [
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      }
    ]
  },

  // level 3
  {
    ball: {
      material: app.config.Materials.present,
      style: app.config.Styles.presentBall,
      objectType: app.world.PresentBall,
      relX: 0.35,
      relY: 0.15
    },
    dropper: {
      material: app.config.Materials.fixedObject,
      style: app.config.Styles.dropper,
      relX: 0.4,
      relY: 0.1
    },
    target: {
      material: app.config.Materials.target,
      style: app.config.Styles.target,
      relX: 0.75,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeamInvertedShadow,
        relX: .15,
        relY: .85,
        rotation: 180
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeamInvertedShadow,
        relX: 0.42,
        relY: 0.38,
        rotation: -45
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeamInvertedShadow,
        relX: 0.49,
        relY: 0.72,
        rotation: -45
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeamInvertedShadow,
        relX: 0.8,
        relY: 0.6,
        rotation: 45 + 180 // flip to have proper shadow
      }
    ],
    conveyorBelts: [
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      },
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      }
    ],
    springs: [
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      },
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      }
    ]
  },

  // level 4
  {
    ball: {
      material: app.config.Materials.present,
      style: app.config.Styles.presentBall,
      objectType: app.world.PresentBall,
      relX: 0.75,
      relY: 0
    },
    dropper: {
      material: app.config.Materials.fixedObject,
      style: app.config.Styles.dropper,
      relX: 0.8,
      relY: 0.07
    },
    target: {
      material: app.config.Materials.target,
      style: app.config.Styles.target,
      relX: 0.25,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.7,
        relY: 0.8,
        rotation: 35
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.54,
        relY: 0.60,
        rotation: 35
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.28,
        relY: 0.3,
        rotation: 35
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeamInvertedShadow2,
        relX: .10,
        relY: .25,
        rotation: -90
      }
    ],
    conveyorBelts: [
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      }
    ],
    springs: [
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      },
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      }
    ]
  },

  // level 5
  {
    ball: {
      material: app.config.Materials.present,
      style: app.config.Styles.presentBall,
      objectType: app.world.PresentBall,
      relX: 0.30,
      relY: 0.15
    },
    dropper: {
      material: app.config.Materials.fixedObject,
      style: app.config.Styles.dropper,
      relX: 0.35,
      relY: 0.1
    },
    target: {
      material: app.config.Materials.target,
      style: app.config.Styles.target,
      relX: 0.75,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeamInvertedShadow,
        relX: 0.18,
        relY: 0.6,
        rotation: 180
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeamInvertedShadow,
        relX: 0.5,
        relY: 0.25,
        rotation: 90 + 180 // flip to have proper shadow
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeamInvertedShadow,
        relX: 0.5,
        relY: 0.75,
        rotation: 90 + 180 // flip to have proper shadow
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .8,
        relY: .65,
        rotation: 0
      }
    ],
    conveyorBelts: [
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      }
    ],
    springs: [
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      }
    ]
  },

  // level 6
  {
    ball: {
      material: app.config.Materials.present,
      style: app.config.Styles.presentBall,
      objectType: app.world.PresentBall,
      relX: 0.75,
      relY: 0.15
    },
    dropper: {
      material: app.config.Materials.fixedObject,
      style: app.config.Styles.dropper,
      relX: 0.8,
      relY: 0.1
    },
    target: {
      material: app.config.Materials.target,
      style: app.config.Styles.target,
      relX: 0.2,
      relY: 0.55
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.7,
        relY: 0.6,
        rotation: 135 + 180 // flip to have proper shadow
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.5,
        relY: 0.45,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.5,
        relY: 0.85,
        rotation: 0
      }
    ],
    conveyorBelts: [
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      },
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      }
    ],
    springs: [
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      },
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      }
    ]
  },

  // level 7
  {
    ball: {
      material: app.config.Materials.present,
      style: app.config.Styles.presentSquare,
      objectType: app.world.PresentSquare,
      relX: 0.25,
      relY: 0.15
    },
    dropper: {
      material: app.config.Materials.fixedObject,
      style: app.config.Styles.dropper,
      relX: 0.3,
      relY: 0.1
    },
    target: {
      material: app.config.Materials.target,
      style: app.config.Styles.target,
      relX: 0.25,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.2,
        relY: 0.7,
        rotation: 135 + 180 // flip to have proper shadow
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.4,
        relY: 0.6,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeamInvertedShadow,
        relX: 0.8,
        relY: 0.3,
        rotation: 180
      }
    ],
    conveyorBelts: [
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      },
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      }
    ],
    springs: [
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      },
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      }
    ]
  },

  // level 8
  {
    ball: {
      material: app.config.Materials.present,
      style: app.config.Styles.presentSquare,
      objectType: app.world.PresentSquare,
      relX: 0.15,
      relY: 0.15
    },
    dropper: {
      material: app.config.Materials.fixedObject,
      style: app.config.Styles.dropper,
      relX: 0.2,
      relY: 0.1
    },
    target: {
      material: app.config.Materials.target,
      style: app.config.Styles.target,
      relX: 0.45,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.35,
        relY: 0.2,
        rotation: 135 + 180 // flip to have proper shadow
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.4,
        relY: 0.6,
        rotation: 135 + 180 // flip to have proper shadow
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeamInvertedShadow,
        relX: 0.25,
        relY: 0.8,
        rotation: 90 + 180 // flip to have proper shadow
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.6,
        relY: 0.45,
        rotation: 0
      },
    ],
    conveyorBelts: [
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      },
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      }
    ],
    springs: [
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      },
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      }
    ]
  },

  // level 9
  {
    ball: {
      material: app.config.Materials.present,
      style: app.config.Styles.presentSquare,
      objectType: app.world.PresentSquare,
      relX: 0.5,
      relY: 0.15
    },
    dropper: {
      material: app.config.Materials.fixedObject,
      style: app.config.Styles.dropper,
      relX: 0.55,
      relY: 0.1
    },
    target: {
      material: app.config.Materials.target,
      style: app.config.Styles.target,
      relX: 0.2,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeamInvertedShadow,
        relX: 0.35,
        relY: 0.4,
        rotation: 90 + 180 // flip to have proper shadow
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.5,
        relY: 0.6,
        rotation: 0
      }
    ],
    conveyorBelts: [
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      },
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      }
    ],
    springs: [
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      },
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      }
    ]
  },

  // level 10
  {
    ball: {
      material: app.config.Materials.present,
      style: app.config.Styles.presentSquare,
      objectType: app.world.PresentSquare,
      relX: 0.25,
      relY: 0
    },
    dropper: {
      material: app.config.Materials.fixedObject,
      style: app.config.Styles.dropper,
      relX: 0.3,
      relY: 0.3
    },
    target: {
      material: app.config.Materials.target,
      style: app.config.Styles.target,
      relX: 0.8,
      relY: 0.5
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.25,
        relY: 0.8,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeamInvertedShadow,
        relX: 0.6,
        relY: 0.5,
        rotation: 90 + 180 // flip to have proper shadow
      }
    ],
    conveyorBelts: [
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      },
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt
      }
    ],
    springs: [
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      },
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring
      }
    ]
  }

];