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
 
goog.provide('Box2D.Collision.b2AABB');

goog.require('Box2D.Common.Math.b2Vec2');

/**
 * @private
 * @constructor
 */
Box2D.Collision.b2AABB = function() {
    UsageTracker.get('Box2D.Collision.b2AABB').trackCreate();
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.lowerBound = Box2D.Common.Math.b2Vec2.Get(0, 0);
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.upperBound = Box2D.Common.Math.b2Vec2.Get(0, 0);
};

/**
 * @private
 * @type {Array.<!Box2D.Collision.b2AABB>}
 */
Box2D.Collision.b2AABB._freeCache = [];

/**
 * @return {!Box2D.Collision.b2AABB}
 */
Box2D.Collision.b2AABB.Get = function() {
    UsageTracker.get('Box2D.Collision.b2AABB').trackGet();
    if (Box2D.Collision.b2AABB._freeCache.length > 0) {
        var aabb = Box2D.Collision.b2AABB._freeCache.pop();
        aabb.SetZero();
        return aabb;
    }
    return new Box2D.Collision.b2AABB();
};

/**
 * @param {!Box2D.Collision.b2AABB} aabb
 */
Box2D.Collision.b2AABB.Free = function(aabb) {
    if (aabb != null) {
        UsageTracker.get('Box2D.Collision.b2AABB').trackFree();
        Box2D.Collision.b2AABB._freeCache.push(aabb);
    }
};

/**
 * @param {number} lowerX
 * @param {number} lowerY
 * @param {number} upperX
 * @param {number} upperY
 */
Box2D.Collision.b2AABB.prototype.Set = function(lowerX, lowerY, upperX, upperY) {
    this.lowerBound.Set(lowerX, lowerY);
    this.upperBound.Set(upperX, upperY);
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} lowerBound
 * @param {!Box2D.Common.Math.b2Vec2} upperBound
 */
Box2D.Collision.b2AABB.prototype.SetVV = function(lowerBound, upperBound) {
    this.lowerBound.SetV(lowerBound);
    this.upperBound.SetV(upperBound);
};

Box2D.Collision.b2AABB.prototype.SetZero = function() {
    this.lowerBound.Set(0, 0);
    this.upperBound.Set(0, 0);
};

/**
 * @return {boolean}
 */
Box2D.Collision.b2AABB.prototype.IsValid = function() {
    var dX = this.upperBound.x - this.lowerBound.x;
    if (dX < 0) {
        return false;
    }
    var dY = this.upperBound.y - this.lowerBound.y;
    if (dY < 0) {
        return false;
    }
    return this.lowerBound.IsValid() && this.upperBound.IsValid();
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.b2AABB.prototype.GetCenter = function() {
    return Box2D.Common.Math.b2Vec2.Get((this.lowerBound.x + this.upperBound.x) / 2, (this.lowerBound.y + this.upperBound.y) / 2);
};


/**
 * @param {!Box2D.Common.Math.b2Vec2} newCenter
 */
Box2D.Collision.b2AABB.prototype.SetCenter = function(newCenter) {
    var oldCenter = this.GetCenter();
    this.lowerBound.Subtract(oldCenter);
    this.upperBound.Subtract(oldCenter);
    this.lowerBound.Add(newCenter);
    this.upperBound.Add(newCenter);
    Box2D.Common.Math.b2Vec2.Free(oldCenter);
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.b2AABB.prototype.GetExtents = function() {
    return Box2D.Common.Math.b2Vec2.Get((this.upperBound.x - this.lowerBound.x) / 2, (this.upperBound.y - this.lowerBound.y) / 2);
};

/**
 * @param {!Box2D.Collision.b2AABB} aabb
 * @return {boolean}
 */
Box2D.Collision.b2AABB.prototype.Contains = function(aabb) {
    var result = true;
    result = result && this.lowerBound.x <= aabb.lowerBound.x;
    result = result && this.lowerBound.y <= aabb.lowerBound.y;
    result = result && aabb.upperBound.x <= this.upperBound.x;
    result = result && aabb.upperBound.y <= this.upperBound.y;
    return result;
};

/**
 * @param {!Box2D.Collision.b2RayCastOutput} output
 * @param {!Box2D.Collision.b2RayCastInput} input
 * @return {boolean}
 */
Box2D.Collision.b2AABB.prototype.RayCast = function(output, input) {
    var tmin = (-Number.MAX_VALUE);
    var tmax = Number.MAX_VALUE;
    
    var dX = input.p2.x - input.p1.x;
    var absDX = Math.abs(dX);
    if (absDX < Number.MIN_VALUE) {
        if (input.p1.x < this.lowerBound.x || this.upperBound.x < input.p1.x) {
            return false;
        }
    } else {
        var inv_d = 1.0 / dX;
        var t1 = (this.lowerBound.x - input.p1.x) * inv_d;
        var t2 = (this.upperBound.x - input.p1.x) * inv_d;
        var s = (-1.0);
        if (t1 > t2) {
            var t3 = t1;
            t1 = t2;
            t2 = t3;
            s = 1.0;
        }
        if (t1 > tmin) {
            output.normal.x = s;
            output.normal.y = 0;
            tmin = t1;
        }
        tmax = Math.min(tmax, t2);
        if (tmin > tmax) return false;
    }
    
    var dY = input.p2.y - input.p1.y;
    var absDY = Math.abs(dY);
    if (absDY < Number.MIN_VALUE) {
        if (input.p1.y < this.lowerBound.y || this.upperBound.y < input.p1.y) {
            return false;
        }
    } else {
        var inv_d = 1.0 / dY;
        var t1 = (this.lowerBound.y - input.p1.y) * inv_d;
        var t2 = (this.upperBound.y - input.p1.y) * inv_d;
        var s = (-1.0);
        if (t1 > t2) {
            var t3 = t1;
            t1 = t2;
            t2 = t3;
            s = 1.0;
        }
        if (t1 > tmin) {
            output.normal.y = s;
            output.normal.x = 0;
            tmin = t1;
        }
        tmax = Math.min(tmax, t2);
        if (tmin > tmax) {
            return false;
        }
    }
    output.fraction = tmin;
    return true;
};

/**
 * @param {!Box2D.Collision.b2AABB} other
 * @return {boolean}
 */
Box2D.Collision.b2AABB.prototype.TestOverlap = function(other) {
    if ( other.lowerBound.x - this.upperBound.x > 0 ) { return false; }
    if ( other.lowerBound.y - this.upperBound.y > 0 ) { return false; }
    if ( this.lowerBound.x - other.upperBound.x > 0 ) { return false; }
    if ( this.lowerBound.y - other.upperBound.y > 0 ) { return false; }
    return true;
};

/**
 * @param {!Box2D.Collision.b2AABB} aabb1
 * @param {!Box2D.Collision.b2AABB} aabb2
 * @return {!Box2D.Collision.b2AABB}
 */
Box2D.Collision.b2AABB.Combine = function(aabb1, aabb2) {
    var aabb = Box2D.Collision.b2AABB.Get();
    aabb.Combine(aabb1, aabb2);
    return aabb;
};

/**
 * @param {!Box2D.Collision.b2AABB} aabb1
 * @param {!Box2D.Collision.b2AABB} aabb2
 */
Box2D.Collision.b2AABB.prototype.Combine = function(aabb1, aabb2) {
    this.lowerBound.x = Math.min(aabb1.lowerBound.x, aabb2.lowerBound.x);
    this.lowerBound.y = Math.min(aabb1.lowerBound.y, aabb2.lowerBound.y);
    this.upperBound.x = Math.max(aabb1.upperBound.x, aabb2.upperBound.x);
    this.upperBound.y = Math.max(aabb1.upperBound.y, aabb2.upperBound.y);
};

/**
 * @return {number}
 */
Box2D.Collision.b2AABB.prototype.GetMinX = function() {
    return this.lowerBound.x;
};

/**
 * @return {number}
 */
Box2D.Collision.b2AABB.prototype.GetMaxX = function() {
    return this.upperBound.x;
};

/**
 * @return {number}
 */
Box2D.Collision.b2AABB.prototype.GetMinY = function() {
    return this.lowerBound.y;
};

/**
 * @return {number}
 */
Box2D.Collision.b2AABB.prototype.GetMaxY = function() {
    return this.upperBound.y;
};
