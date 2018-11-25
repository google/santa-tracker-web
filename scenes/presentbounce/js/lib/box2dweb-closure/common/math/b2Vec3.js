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
 
goog.provide('Box2D.Common.Math.b2Vec3');

goog.require('UsageTracker');

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @constructor
 * @private
 */
Box2D.Common.Math.b2Vec3 = function(x, y, z) {
    UsageTracker.get('Box2D.Common.Math.b2Vec3').trackCreate();
    
    this.x = x;
    this.y = y;
    this.z = z;
};

/**
 * @private
 * @type {Array.<!Box2D.Common.Math.b2Vec3>}
 */
Box2D.Common.Math.b2Vec3._freeCache = [];

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @return {!Box2D.Common.Math.b2Vec3}
 */
Box2D.Common.Math.b2Vec3.Get = function(x, y, z) {
    UsageTracker.get('Box2D.Common.Math.b2Vec3').trackGet();
    if (Box2D.Common.Math.b2Vec3._freeCache.length > 0) {
        var vec = Box2D.Common.Math.b2Vec3._freeCache.pop();
        vec.Set(x, y, z);
        return vec;
    }
    return new Box2D.Common.Math.b2Vec3(x, y, z);
};

/**
 * @param {!Box2D.Common.Math.b2Vec3} vec
 */
Box2D.Common.Math.b2Vec3.Free = function(vec) {
    if (vec != null) {
        UsageTracker.get('Box2D.Common.Math.b2Vec3').trackFree();
        Box2D.Common.Math.b2Vec3._freeCache.push(vec);
    }
};

Box2D.Common.Math.b2Vec3.prototype.SetZero = function() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
Box2D.Common.Math.b2Vec3.prototype.Set = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

/**
 * @param {!Box2D.Common.Math.b2Vec3} v
 */
Box2D.Common.Math.b2Vec3.prototype.SetV = function(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
};

/**
 * @return {!Box2D.Common.Math.b2Vec3}
 */
Box2D.Common.Math.b2Vec3.prototype.GetNegative = function() {
    return Box2D.Common.Math.b2Vec3.Get((-this.x), (-this.y), (-this.z));
};

Box2D.Common.Math.b2Vec3.prototype.NegativeSelf = function() {
    this.x = (-this.x);
    this.y = (-this.y);
    this.z = (-this.z);
};

/**
 * @return {!Box2D.Common.Math.b2Vec3}
 */
Box2D.Common.Math.b2Vec3.prototype.Copy = function() {
    return Box2D.Common.Math.b2Vec3.Get(this.x, this.y, this.z);
};

/**
 * @param {!Box2D.Common.Math.b2Vec3} v
 */
Box2D.Common.Math.b2Vec3.prototype.Add = function(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
};

/**
 * @param {!Box2D.Common.Math.b2Vec3} v
 */
Box2D.Common.Math.b2Vec3.prototype.Subtract = function(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
};

/**
 * @param {number} a
 */
Box2D.Common.Math.b2Vec3.prototype.Multiply = function(a) {
    this.x *= a;
    this.y *= a;
    this.z *= a;
};
