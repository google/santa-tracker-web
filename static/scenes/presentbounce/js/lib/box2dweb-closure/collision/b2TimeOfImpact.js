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
 
goog.provide('Box2D.Collision.b2TimeOfImpact');

goog.require('Box2D.Collision.b2SimplexCache');
goog.require('Box2D.Collision.b2DistanceInput');
goog.require('Box2D.Collision.b2DistanceOutput');
goog.require('Box2D.Collision.b2SeparationFunction');
goog.require('Box2D.Common.Math.b2Transform');
goog.require('Box2D.Common.b2Settings');
goog.require('Box2D.Collision.b2Distance');

Box2D.Collision.b2TimeOfImpact = {};

/**
 * @param {!Box2D.Collision.b2TOIInput} input
 * @return {number}
 */
Box2D.Collision.b2TimeOfImpact.TimeOfImpact = function(input) {
    Box2D.Collision.b2TimeOfImpact.b2_toiCalls++;
    var proxyA = input.proxyA;
    var proxyB = input.proxyB;
    var sweepA = input.sweepA;
    var sweepB = input.sweepB;
    Box2D.Common.b2Settings.b2Assert(sweepA.t0 == sweepB.t0);
    Box2D.Common.b2Settings.b2Assert(1.0 - sweepA.t0 > Number.MIN_VALUE);
    var radius = proxyA.m_radius + proxyB.m_radius;
    var tolerance = input.tolerance;
    var alpha = 0.0;
    var k_maxIterations = 1000;
    var iter = 0;
    var target = 0.0;
    Box2D.Collision.b2TimeOfImpact.s_cache.count = 0;
    Box2D.Collision.b2TimeOfImpact.s_distanceInput.useRadii = false;
    for (;;) {
        sweepA.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfA, alpha);
        sweepB.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfB, alpha);
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.proxyA = proxyA;
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.proxyB = proxyB;
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.transformA = Box2D.Collision.b2TimeOfImpact.s_xfA;
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.transformB = Box2D.Collision.b2TimeOfImpact.s_xfB;
        Box2D.Collision.b2Distance.Distance(Box2D.Collision.b2TimeOfImpact.s_distanceOutput, Box2D.Collision.b2TimeOfImpact.s_cache, Box2D.Collision.b2TimeOfImpact.s_distanceInput);
        if (Box2D.Collision.b2TimeOfImpact.s_distanceOutput.distance <= 0.0) {
            alpha = 1.0;
            break;
        }
        Box2D.Collision.b2TimeOfImpact.s_fcn.Initialize(Box2D.Collision.b2TimeOfImpact.s_cache, proxyA, Box2D.Collision.b2TimeOfImpact.s_xfA, proxyB, Box2D.Collision.b2TimeOfImpact.s_xfB);
        var separation = Box2D.Collision.b2TimeOfImpact.s_fcn.Evaluate(Box2D.Collision.b2TimeOfImpact.s_xfA, Box2D.Collision.b2TimeOfImpact.s_xfB);
        if (separation <= 0.0) {
            alpha = 1.0;
            break;
        }
        if (iter == 0) {
            if (separation > radius) {
                target = Math.max(radius - tolerance, 0.75 * radius);
            } else {
                target = Math.max(separation - tolerance, 0.02 * radius);
            }
        }
        if (separation - target < 0.5 * tolerance) {
            if (iter == 0) {
                alpha = 1.0;
                break;
            }
            break;
        }
        var newAlpha = alpha; {
            var x1 = alpha;
            var x2 = 1.0;
            var f1 = separation;
            sweepA.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfA, x2);
            sweepB.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfB, x2);
            var f2 = Box2D.Collision.b2TimeOfImpact.s_fcn.Evaluate(Box2D.Collision.b2TimeOfImpact.s_xfA, Box2D.Collision.b2TimeOfImpact.s_xfB);
            if (f2 >= target) {
                alpha = 1.0;
                break;
            }
            var rootIterCount = 0;
            for (;;) {
                var x = 0;
                if (rootIterCount & 1) {
                    x = x1 + (target - f1) * (x2 - x1) / (f2 - f1);
                } else {
                    x = 0.5 * (x1 + x2);
                }
                sweepA.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfA, x);
                sweepB.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfB, x);
                var f = Box2D.Collision.b2TimeOfImpact.s_fcn.Evaluate(Box2D.Collision.b2TimeOfImpact.s_xfA, Box2D.Collision.b2TimeOfImpact.s_xfB);
                if (Math.abs(f - target) < 0.025 * tolerance) {
                    newAlpha = x;
                    break;
                }
                if (f > target) {
                    x1 = x;
                    f1 = f;
                } else {
                    x2 = x;
                    f2 = f;
                }
                rootIterCount++;
                Box2D.Collision.b2TimeOfImpact.b2_toiRootIters++;
                if (rootIterCount == 50) {
                    break;
                }
            }
            Box2D.Collision.b2TimeOfImpact.b2_toiMaxRootIters = Math.max(Box2D.Collision.b2TimeOfImpact.b2_toiMaxRootIters, rootIterCount);
        }
        if (newAlpha < (1.0 + 100.0 * Number.MIN_VALUE) * alpha) {
            break;
        }
        alpha = newAlpha;
        iter++;
        Box2D.Collision.b2TimeOfImpact.b2_toiIters++;
        if (iter == k_maxIterations) {
            break;
        }
    }
    Box2D.Collision.b2TimeOfImpact.b2_toiMaxIters = Math.max(Box2D.Collision.b2TimeOfImpact.b2_toiMaxIters, iter);
    return alpha;
};

/**
 * @private
 * @type {number}
 */
Box2D.Collision.b2TimeOfImpact.b2_toiCalls = 0;

/**
 * @private
 * @type {number}
 */
Box2D.Collision.b2TimeOfImpact.b2_toiIters = 0;

/**
 * @private
 * @type {number}
 */
Box2D.Collision.b2TimeOfImpact.b2_toiMaxIters = 0;

/**
 * @private
 * @type {number}
 */
Box2D.Collision.b2TimeOfImpact.b2_toiRootIters = 0;

/**
 * @private
 * @type {number}
 */
Box2D.Collision.b2TimeOfImpact.b2_toiMaxRootIters = 0;

/**
 * @private
 * @type {!Box2D.Collision.b2SimplexCache}
 */
Box2D.Collision.b2TimeOfImpact.s_cache = new Box2D.Collision.b2SimplexCache();

/**
 * @private
 * @type {!Box2D.Collision.b2DistanceInput}
 */
Box2D.Collision.b2TimeOfImpact.s_distanceInput = new Box2D.Collision.b2DistanceInput();

/**
 * @private
 * @type {!Box2D.Common.Math.b2Transform}
 */
Box2D.Collision.b2TimeOfImpact.s_xfA = new Box2D.Common.Math.b2Transform();

/**
 * @private
 * @type {!Box2D.Common.Math.b2Transform}
 */
Box2D.Collision.b2TimeOfImpact.s_xfB = new Box2D.Common.Math.b2Transform();

/**
 * @private
 * @type {!Box2D.Collision.b2SeparationFunction}
 */
Box2D.Collision.b2TimeOfImpact.s_fcn = new Box2D.Collision.b2SeparationFunction();

/**
 * @private
 * @type {!Box2D.Collision.b2DistanceOutput}
 */
Box2D.Collision.b2TimeOfImpact.s_distanceOutput = new Box2D.Collision.b2DistanceOutput();
