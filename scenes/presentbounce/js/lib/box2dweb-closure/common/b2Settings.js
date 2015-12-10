/*
 * Copyright (c) 2006-2007 Erin Catto http://www.gphysics.com
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */
/*
 * Original Box2D created by Erin Catto
 * http://www.gphysics.com
 * http://box2d.org/
 * 
 * Box2D was converted to Flash by Boris the Brave, Matt Bush, and John Nesky as Box2DFlash
 * http://www.box2dflash.org/
 * 
 * Box2DFlash was converted from Flash to Javascript by Uli Hecht as box2Dweb
 * http://code.google.com/p/box2dweb/
 * 
 * box2Dweb was modified to utilize Google Closure, as well as other bug fixes, optimizations, and tweaks by Illandril
 * https://github.com/illandril/box2dweb-closure
 */
 
goog.provide('Box2D.Common.b2Settings');

Box2D.Common.b2Settings = {};

/**
 * @param {number} friction1
 * @param {number} friction2
 */
Box2D.Common.b2Settings.b2MixFriction = function (friction1, friction2) {
    return Math.sqrt(friction1 * friction2);
};

/**
 * @param {number} restitution1
 * @param {number} restitution2
 */
Box2D.Common.b2Settings.b2MixRestitution = function (restitution1, restitution2) {
    return restitution1 > restitution2 ? restitution1 : restitution2;
};

/**
 * @param {boolean} a
 */
Box2D.Common.b2Settings.b2Assert = function (a) {
    if (!a) {
        throw "Assertion Failed";
    }
};

/**
 * @const
 * @type {string}
 */
Box2D.Common.b2Settings.VERSION = "2.1alpha-illandril";

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.USHRT_MAX = 0x0000ffff;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_maxManifoldPoints = 2;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_aabbExtension = 0.1;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_aabbMultiplier = 2;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_polygonRadius = 2 * Box2D.Common.b2Settings.b2_linearSlop;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_linearSlop = 0.005;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_angularSlop = 2 / 180 * Math.PI;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_toiSlop = 8 * Box2D.Common.b2Settings.b2_linearSlop;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_maxTOIContactsPerIsland = 32;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_maxTOIJointsPerIsland = 32;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_velocityThreshold = 1;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_maxLinearCorrection = 0.2;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_maxAngularCorrection = 8 / 180 * Math.PI;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_maxTranslation = 2;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_maxTranslationSquared = Box2D.Common.b2Settings.b2_maxTranslation * Box2D.Common.b2Settings.b2_maxTranslation;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_maxRotation = 0.5 * Math.PI;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_maxRotationSquared = Box2D.Common.b2Settings.b2_maxRotation * Box2D.Common.b2Settings.b2_maxRotation;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_contactBaumgarte = 0.2;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_timeToSleep = 0.5;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_linearSleepTolerance = 0.01;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_linearSleepToleranceSquared = Box2D.Common.b2Settings.b2_linearSleepTolerance * Box2D.Common.b2Settings.b2_linearSleepTolerance;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_angularSleepTolerance = 2 / 180 * Math.PI;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.b2_angularSleepToleranceSquared = Box2D.Common.b2Settings.b2_angularSleepTolerance * Box2D.Common.b2Settings.b2_angularSleepTolerance;

/**
 * @const
 * @type {number}
 */
Box2D.Common.b2Settings.MIN_VALUE_SQUARED = Number.MIN_VALUE * Number.MIN_VALUE;
