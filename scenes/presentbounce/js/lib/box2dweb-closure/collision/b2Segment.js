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
 
goog.provide('Box2D.Collision.b2Segment');

goog.require('Box2D.Common.Math.b2Vec2');
goog.require('UsageTracker');

/**
 * @constructor
 */
Box2D.Collision.b2Segment = function() {
    UsageTracker.get('Box2D.Collision.b2Segment').trackCreate();
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.p1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.p2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
};

/**
 * @param {Array.<number>} lambda
 * @param {!Box2D.Common.Math.b2Vec2} normal
 * @param {!Box2D.Collision.b2Segment} segment
 * @param {number} maxLambda
 * @return {boolean}
 */
Box2D.Collision.b2Segment.prototype.TestSegment = function(lambda, normal, segment, maxLambda) {
    var s = segment.p1;
    var rX = segment.p2.x - s.x;
    var rY = segment.p2.y - s.y;
    var dX = this.p2.x - this.p1.x;
    var dY = this.p2.y - this.p1.y;
    var nX = dY;
    var nY = (-dX);
    var k_slop = 100.0 * Number.MIN_VALUE;
    var denom = (-(rX * nX + rY * nY));
    if (denom > k_slop) {
        var bX = s.x - this.p1.x;
        var bY = s.y - this.p1.y;
        var a = (bX * nX + bY * nY);
        if (0.0 <= a && a <= maxLambda * denom) {
            var mu2 = (-rX * bY) + rY * bX;
            if ((-k_slop * denom) <= mu2 && mu2 <= denom * (1.0 + k_slop)) {
                a /= denom;
                var nLen = Math.sqrt(nX * nX + nY * nY);
                nX /= nLen;
                nY /= nLen;
                lambda[0] = a;
                normal.Set(nX, nY);
                return true;
            }
        }
    }
    return false;
};

/**
 * @param {!Box2D.Collision.b2AABB} aabb
 */
Box2D.Collision.b2Segment.prototype.Extend = function(aabb) {
    this.ExtendForward(aabb);
    this.ExtendBackward(aabb);
};

/**
 * @param {!Box2D.Collision.b2AABB} aabb
 */
Box2D.Collision.b2Segment.prototype.ExtendForward = function(aabb) {
    var dX = this.p2.x - this.p1.x;
    var dY = this.p2.y - this.p1.y;
    var lambda = Math.min(dX > 0 ? (aabb.upperBound.x - this.p1.x) / dX : dX < 0 ? (aabb.lowerBound.x - this.p1.x) / dX : Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound.y - this.p1.y) / dY : dY < 0 ? (aabb.lowerBound.y - this.p1.y) / dY : Number.POSITIVE_INFINITY);
    this.p2.x = this.p1.x + dX * lambda;
    this.p2.y = this.p1.y + dY * lambda;
};

/**
 * @param {!Box2D.Collision.b2AABB} aabb
 */
Box2D.Collision.b2Segment.prototype.ExtendBackward = function(aabb) {
    var dX = (-this.p2.x) + this.p1.x;
    var dY = (-this.p2.y) + this.p1.y;
    var lambda = Math.min(dX > 0 ? (aabb.upperBound.x - this.p2.x) / dX : dX < 0 ? (aabb.lowerBound.x - this.p2.x) / dX : Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound.y - this.p2.y) / dY : dY < 0 ? (aabb.lowerBound.y - this.p2.y) / dY : Number.POSITIVE_INFINITY);
    this.p1.x = this.p2.x + dX * lambda;
    this.p1.y = this.p2.y + dY * lambda;
};