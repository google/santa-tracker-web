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
 
goog.provide('Box2D.Common.Math.b2Mat22');

goog.require('Box2D.Common.Math.b2Vec2');
goog.require('UsageTracker');

/**
 * @constructor
 * @private
 */
Box2D.Common.Math.b2Mat22 = function() {
    UsageTracker.get('Box2D.Common.Math.b2Mat22').trackCreate();
    
    this.col1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.col2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.SetIdentity();
};

/**
 * @private
 * @type {Array.<!Box2D.Common.Math.b2Mat22>}
 */
Box2D.Common.Math.b2Mat22._freeCache = [];

/**
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Mat22.Get = function() {
    UsageTracker.get('Box2D.Common.Math.b2Mat22').trackGet();
    if (Box2D.Common.Math.b2Mat22._freeCache.length > 0) {
        var mat = Box2D.Common.Math.b2Mat22._freeCache.pop();
        mat.SetZero();
        return mat;
    }
    return new Box2D.Common.Math.b2Mat22();
};

/**
 * @param {!Box2D.Common.Math.b2Mat22} mat
 */
Box2D.Common.Math.b2Mat22.Free = function(mat) {
    if (mat != null) {
        UsageTracker.get('Box2D.Common.Math.b2Mat22').trackFree();
        Box2D.Common.Math.b2Mat22._freeCache.push(mat);
    }
};

/**
 * @param {number} angle
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Mat22.FromAngle = function(angle) {
    var mat = Box2D.Common.Math.b2Mat22.Get();
    mat.Set(angle);
    return mat;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} c1
 * @param {!Box2D.Common.Math.b2Vec2} c2
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Mat22.FromVV = function(c1, c2) {
    var mat = Box2D.Common.Math.b2Mat22.Get();
    mat.SetVV(c1, c2);
    return mat;
};

/**
 * @param {number} angle
 */
Box2D.Common.Math.b2Mat22.prototype.Set = function(angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    this.col1.Set(c, s);
    this.col2.Set(-s, c);
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} c1
 * @param {!Box2D.Common.Math.b2Vec2} c2
 */
Box2D.Common.Math.b2Mat22.prototype.SetVV = function(c1, c2) {
    this.col1.SetV(c1);
    this.col2.SetV(c2);
};

/**
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Mat22.prototype.Copy = function() {
    var mat = Box2D.Common.Math.b2Mat22.Get();
    mat.SetM(this);
    return mat;
};

/**
 * @param {!Box2D.Common.Math.b2Mat22} m
 */
Box2D.Common.Math.b2Mat22.prototype.SetM = function(m) {
    this.col1.SetV(m.col1);
    this.col2.SetV(m.col2);
};

/**
 * @param {!Box2D.Common.Math.b2Mat22} m
 */
Box2D.Common.Math.b2Mat22.prototype.AddM = function(m) {
    this.col1.Add(m.col1);
    this.col2.Add(m.col2);
};

Box2D.Common.Math.b2Mat22.prototype.SetIdentity = function() {
    this.col1.Set(1, 0);
    this.col2.Set(0, 1);
};

Box2D.Common.Math.b2Mat22.prototype.SetZero = function() {
    this.col1.Set(0, 0);
    this.col2.Set(0, 0);
};

/**
 * @return {number}
 */
Box2D.Common.Math.b2Mat22.prototype.GetAngle = function() {
    return Math.atan2(this.col1.y, this.col1.x);
};

/**
 * @param {!Box2D.Common.Math.b2Mat22} out
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Mat22.prototype.GetInverse = function(out) {
    var det = this.col1.x * this.col2.y - this.col2.x * this.col1.y;
    if (det !== 0) {
        det = 1 / det;
    }
    out.col1.x = det * this.col2.y;
    out.col2.x = -det * this.col2.x;
    out.col1.y = -det * this.col1.y;
    out.col2.y = det * this.col1.x;
    return out;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} out
 * @param {number} bX
 * @param {number} bY
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Mat22.prototype.Solve = function(out, bX, bY) {
    var det = this.col1.x * this.col2.y - this.col2.x * this.col1.y;
    if (det !== 0) {
        det = 1 / det;
    }
    out.x = det * (this.col2.y * bX - this.col2.x * bY);
    out.y = det * (this.col1.x * bY - this.col1.y * bX);
    return out;
};

Box2D.Common.Math.b2Mat22.prototype.Abs = function() {
    this.col1.Abs();
    this.col2.Abs();
};
