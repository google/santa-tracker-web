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
 
goog.provide('Box2D.Collision.Shapes.b2Shape');

goog.require('Box2D.Collision.b2Distance');
goog.require('Box2D.Collision.b2DistanceInput');
goog.require('Box2D.Collision.b2DistanceOutput');
goog.require('Box2D.Collision.b2DistanceProxy');
goog.require('Box2D.Collision.b2SimplexCache');
goog.require('UsageTracker');

/**
 * @constructor
 */
Box2D.Collision.Shapes.b2Shape = function() {
    UsageTracker.get('Box2D.Collision.Shapes.b2Shape').trackCreate();
    
    /**
     * @protected
     * @type {number}
     */
    this.m_radius = Box2D.Common.b2Settings.b2_linearSlop;
};

/**
 * @return {string}
 */
Box2D.Collision.Shapes.b2Shape.prototype.GetTypeName = goog.abstractMethod;

/**
 * @return {!Box2D.Collision.Shapes.b2Shape}
 */
Box2D.Collision.Shapes.b2Shape.prototype.Copy = goog.abstractMethod;

/**
 * @param {!Box2D.Collision.Shapes.b2Shape} other
 */
Box2D.Collision.Shapes.b2Shape.prototype.Set = function(other) {
    this.m_radius = other.m_radius;
};

/**
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {!Box2D.Common.Math.b2Vec2} p
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2Shape.prototype.TestPoint = goog.abstractMethod;

/**
 * @param {!Box2D.Collision.b2RayCastOutput} output
 * @param {!Box2D.Collision.b2RayCastInput} input
 * @param {!Box2D.Common.Math.b2Transform} transform
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2Shape.prototype.RayCast = goog.abstractMethod;

/**
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {!Box2D.Common.Math.b2Transform} transform
 */
Box2D.Collision.Shapes.b2Shape.prototype.ComputeAABB = goog.abstractMethod;

/**
 * @param {!Box2D.Collision.Shapes.b2MassData} massData
 * @param {number} density
 */
Box2D.Collision.Shapes.b2Shape.prototype.ComputeMass = goog.abstractMethod;

/**
 * @param {!Box2D.Common.Math.b2Vec2} normal
 * @param {number} offset
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {!Box2D.Common.Math.b2Vec2} c
 * @return {number}
 */
Box2D.Collision.Shapes.b2Shape.prototype.ComputeSubmergedArea = goog.abstractMethod;

/**
 * @param {!Box2D.Collision.b2DistanceProxy} proxy
 */
Box2D.Collision.Shapes.b2Shape.prototype.SetDistanceProxy = goog.abstractMethod;

/**
 * @param {!Box2D.Collision.Shapes.b2Shape} shape1
 * @param {!Box2D.Common.Math.b2Transform} transform1
 * @param {!Box2D.Collision.Shapes.b2Shape} shape2
 * @param {!Box2D.Common.Math.b2Transform} transform2
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2Shape.TestOverlap = function(shape1, transform1, shape2, transform2) {
    var input = new Box2D.Collision.b2DistanceInput();
    input.proxyA = new Box2D.Collision.b2DistanceProxy();
    input.proxyA.Set(shape1);
    input.proxyB = new Box2D.Collision.b2DistanceProxy();
    input.proxyB.Set(shape2);
    input.transformA = transform1;
    input.transformB = transform2;
    input.useRadii = true;
    var simplexCache = new Box2D.Collision.b2SimplexCache();
    simplexCache.count = 0;
    var output = new Box2D.Collision.b2DistanceOutput();
    Box2D.Collision.b2Distance.Distance(output, simplexCache, input);
    Box2D.Common.Math.b2Vec2.Free(output.pointA);
    Box2D.Common.Math.b2Vec2.Free(output.pointB);
    return output.distance < 10.0 * Number.MIN_VALUE;
};

/**
 * @return {number}
 */
Box2D.Collision.Shapes.b2Shape.prototype.GetRadius = function() {
    return this.m_radius;
};

/**
 * @const
 * @type {number}
 */
Box2D.Collision.Shapes.b2Shape.e_startsInsideCollide = -1;

/**
 * @const
 * @type {number}
 */
Box2D.Collision.Shapes.b2Shape.e_missCollide = 0;

/**
 * @const
 * @type {number}
 */
Box2D.Collision.Shapes.b2Shape.e_hitCollide = 1;
