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
 
goog.provide('Box2D.Common.Math.b2Mat33');

goog.require('Box2D.Common.Math.b2Vec3');
goog.require('UsageTracker');

/**
 * @param {!Box2D.Common.Math.b2Vec3=} c1
 * @param {!Box2D.Common.Math.b2Vec3=} c2
 * @param {!Box2D.Common.Math.b2Vec3=} c3
 * @constructor
 */
Box2D.Common.Math.b2Mat33 = function(c1, c2, c3) {
    UsageTracker.get('Box2D.Common.Math.b2Mat33').trackCreate();
    
    this.col1 = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.col2 = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.col3 = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    if (c1) {
        this.col1.SetV(c1);
    }
    if (c2) {
        this.col2.SetV(c2);
    }
    if (c3) {
        this.col3.SetV(c3);
    }
};

/**
 * @param {!Box2D.Common.Math.b2Vec3} c1
 * @param {!Box2D.Common.Math.b2Vec3} c2
 * @param {!Box2D.Common.Math.b2Vec3} c3
 */
Box2D.Common.Math.b2Mat33.prototype.SetVVV = function(c1, c2, c3) {
    this.col1.SetV(c1);
    this.col2.SetV(c2);
    this.col3.SetV(c3);
};

/**
 * @return {!Box2D.Common.Math.b2Mat33}
 */
Box2D.Common.Math.b2Mat33.prototype.Copy = function() {
    return new Box2D.Common.Math.b2Mat33(this.col1, this.col2, this.col3);
};

/**
 * @param {!Box2D.Common.Math.b2Mat33} m
 */
Box2D.Common.Math.b2Mat33.prototype.SetM = function(m) {
    this.col1.SetV(m.col1);
    this.col2.SetV(m.col2);
    this.col3.SetV(m.col3);
};

/**
 * @param {!Box2D.Common.Math.b2Mat33} m
 */
Box2D.Common.Math.b2Mat33.prototype.AddM = function(m) {
    this.col1.x += m.col1.x;
    this.col1.y += m.col1.y;
    this.col1.z += m.col1.z;
    this.col2.x += m.col2.x;
    this.col2.y += m.col2.y;
    this.col2.z += m.col2.z;
    this.col3.x += m.col3.x;
    this.col3.y += m.col3.y;
    this.col3.z += m.col3.z;
};

Box2D.Common.Math.b2Mat33.prototype.SetIdentity = function() {
    this.col1.Set(1,0,0);
    this.col2.Set(0,1,0);
    this.col3.Set(0,0,1);
};

Box2D.Common.Math.b2Mat33.prototype.SetZero = function() {
    this.col1.Set(0,0,0);
    this.col2.Set(0,0,0);
    this.col3.Set(0,0,0);
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} out
 * @param {number} bX
 * @param {number} bY
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Mat33.prototype.Solve22 = function(out, bX, bY) {
    var a11 = this.col1.x;
    var a12 = this.col2.x;
    var a21 = this.col1.y;
    var a22 = this.col2.y;
    var det = a11 * a22 - a12 * a21;
    if (det != 0.0) {
        det = 1.0 / det;
    }
    out.x = det * (a22 * bX - a12 * bY);
    out.y = det * (a11 * bY - a21 * bX);
    return out;
};

/**
 * @param {!Box2D.Common.Math.b2Vec3} out
 * @param {number} bX
 * @param {number} bY
 * @param {number} bZ
 * @return {!Box2D.Common.Math.b2Vec3}
 */
Box2D.Common.Math.b2Mat33.prototype.Solve33 = function(out, bX, bY, bZ) {
    var a11 = this.col1.x;
    var a21 = this.col1.y;
    var a31 = this.col1.z;
    var a12 = this.col2.x;
    var a22 = this.col2.y;
    var a32 = this.col2.z;
    var a13 = this.col3.x;
    var a23 = this.col3.y;
    var a33 = this.col3.z;
    var det = a11 * (a22 * a33 - a32 * a23) + a21 * (a32 * a13 - a12 * a33) + a31 * (a12 * a23 - a22 * a13);
    if (det != 0.0) {
        det = 1.0 / det;
    }
    out.x = det * (bX * (a22 * a33 - a32 * a23) + bY * (a32 * a13 - a12 * a33) + bZ * (a12 * a23 - a22 * a13));
    out.y = det * (a11 * (bY * a33 - bZ * a23) + a21 * (bZ * a13 - bX * a33) + a31 * (bX * a23 - bY * a13));
    out.z = det * (a11 * (a22 * bZ - a32 * bY) + a21 * (a32 * bX - a12 * bZ) + a31 * (a12 * bY - a22 * bX));
    return out;
}
