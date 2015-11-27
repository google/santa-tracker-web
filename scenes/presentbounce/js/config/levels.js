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
goog.require('app.world.CircleBall');
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
      style: app.config.Styles.presentCircle,
      objectType: app.world.CircleBall,
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
      relX: 0.75,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.6,
        relY: 0.75,
        rotation: 90
      }
    ],
    conveyorBelts: [
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt,
        relX: 0.27,
        relY: 0.5,
        rotation: 10,
        beltDirection: 1
      },
      {
        material: app.config.Materials.conveyorBelt,
        style: app.config.Styles.conveyorBelt,
        relX: 0.72,
        relY: 0.5,
        rotation: 0,
        beltDirection: 1
      }
    ],
    springs: [
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring,
        relX: 0.50,
        relY: 0.9,
        rotation: 0
      },
      {
        material: app.config.Materials.spring,
        style: app.config.Styles.spring,
        relX: 0.93,
        relY: 0.8,
        rotation: -40
      }
    ]
  },

  // level 2
  {
    ball: {
      material: app.config.Materials.present,
      style: app.config.Styles.presentCircle,
      objectType: app.world.CircleBall,
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
      relX: 0.75,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.5,
        relY: 0.25,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.6,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.35,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .15,
        relY: .75,
        rotation: 0
      }
    ],
    conveyorBelts: [],
    springs: []
  },

  // level 3
  {
    ball: {
      material: app.config.Materials.present,
      style: app.config.Styles.presentCircle,
      objectType: app.world.CircleBall,
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
      relX: 0.75,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.5,
        relY: 0.25,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .8,
        relY: .2,
        rotation: 180
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.75,
        relY: 0.6,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.6,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.35,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .15,
        relY: .75,
        rotation: 0
      }
    ],
    conveyorBelts: [],
    springs: []
  },

  // level 4
  {
    ball: {
      material: app.config.Materials.present,
      style: app.config.Styles.presentCircle,
      objectType: app.world.CircleBall,
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
      relX: 0.75,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.5,
        relY: 0.25,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .8,
        relY: .2,
        rotation: 180
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.75,
        relY: 0.6,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.6,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.35,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .15,
        relY: .75,
        rotation: 0
      }
    ],
    conveyorBelts: [],
    springs: []
  },

  // level 5
  {
    ball: {
      material: app.config.Materials.snowGlobe,
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
      relX: 0.75,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.5,
        relY: 0.25,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .8,
        relY: .2,
        rotation: 180
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.75,
        relY: 0.6,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.6,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.35,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .15,
        relY: .75,
        rotation: 0
      }
    ],
    conveyorBelts: [],
    springs: []
  },

  // level 6
  {
    ball: {
      material: app.config.Materials.snowGlobe,
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
      relX: 0.75,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.5,
        relY: 0.25,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .8,
        relY: .2,
        rotation: 180
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.75,
        relY: 0.6,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.6,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.35,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .15,
        relY: .75,
        rotation: 0
      }
    ],
    conveyorBelts: [],
    springs: []
  },

  // level 7
  {
    ball: {
      material: app.config.Materials.snowGlobe,
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
      relX: 0.75,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.5,
        relY: 0.25,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .8,
        relY: .2,
        rotation: 180
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.75,
        relY: 0.6,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.6,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.35,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .15,
        relY: .75,
        rotation: 0
      }
    ],
    conveyorBelts: [],
    springs: []
  },

  // level 8
  {
    ball: {
      material: app.config.Materials.snowGlobe,
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
      relX: 0.75,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.5,
        relY: 0.25,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .8,
        relY: .2,
        rotation: 180
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.75,
        relY: 0.6,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.6,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.35,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .15,
        relY: .75,
        rotation: 0
      }
    ],
    conveyorBelts: [],
    springs: []
  },

  // level 9
  {
    ball: {
      material: app.config.Materials.snowGlobe,
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
      relX: 0.75,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.5,
        relY: 0.25,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .8,
        relY: .2,
        rotation: 180
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.75,
        relY: 0.6,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.6,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.35,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .15,
        relY: .75,
        rotation: 0
      }
    ],
    conveyorBelts: [],
    springs: []
  },

  // level 10
  {
    ball: {
      material: app.config.Materials.snowGlobe,
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
      relX: 0.75,
      relY: 0.9
    },
    fixedObjects: [
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.5,
        relY: 0.25,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .8,
        relY: .2,
        rotation: 180
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.75,
        relY: 0.6,
        rotation: 0
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.6,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.straightBeam,
        relX: 0.35,
        relY: 0.75,
        rotation: 90
      },
      {
        material: app.config.Materials.fixedObject,
        style: app.config.Styles.angledBeam,
        relX: .15,
        relY: .75,
        rotation: 0
      }
    ],
    conveyorBelts: [],
    springs: []
  }


];