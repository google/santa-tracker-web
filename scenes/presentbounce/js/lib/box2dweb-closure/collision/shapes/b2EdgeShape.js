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
 
goog.provide('Box2D.Collision.Shapes.b2EdgeShape');

goog.require('Box2D.Collision.Shapes.b2Shape');
goog.require('Box2D.Common.b2Settings');
goog.require('Box2D.Common.Math.b2Math');
goog.require('Box2D.Common.Math.b2Vec2');
goog.require('UsageTracker');

/**
 * @param {!Box2D.Common.Math.b2Vec2} v1
 * @param {!Box2D.Common.Math.b2Vec2} v2
 * @constructor
 * @extends {Box2D.Collision.Shapes.b2Shape}
 */
Box2D.Collision.Shapes.b2EdgeShape = function(v1, v2) {
    UsageTracker.get('Box2D.Collision.Shapes.b2EdgeShape').trackCreate();
    
    Box2D.Collision.Shapes.b2Shape.call(this);
    
    /**
     * @private
     * @type {Box2D.Collision.Shapes.b2EdgeShape}
     */
    this.m_prevEdge = null;
    
    /**
     * @private
     * @type {Box2D.Collision.Shapes.b2EdgeShape}
     */
    this.m_nextEdge = null;
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.m_v1 = v1;
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.m_v2 = v2;
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.m_direction = Box2D.Common.Math.b2Vec2.Get(this.m_v2.x - this.m_v1.x, this.m_v2.y - this.m_v1.y);
    
    /**
     * @private
     * @type {number}
     */
    this.m_length = this.m_direction.Normalize();
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.m_normal = Box2D.Common.Math.b2Vec2.Get(this.m_direction.y, -this.m_direction.x);
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.m_coreV1 = Box2D.Common.Math.b2Vec2.Get((-Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.x - this.m_direction.x)) + this.m_v1.x, (-Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.y - this.m_direction.y)) + this.m_v1.y);
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.m_coreV2 = Box2D.Common.Math.b2Vec2.Get((-Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.x + this.m_direction.x)) + this.m_v2.x, (-Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.y + this.m_direction.y)) + this.m_v2.y);
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.m_cornerDir1 = this.m_normal;
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.m_cornerDir2 = Box2D.Common.Math.b2Vec2.Get(-this.m_normal.x, -this.m_normal.y);
    
    /**
     * @private
     * @type {boolean}
     */
    this.m_cornerConvex1 = false;
    
    /**
     * @private
     * @type {boolean}
     */
    this.m_cornerConvex2 = false;
};
goog.inherits(Box2D.Collision.Shapes.b2EdgeShape, Box2D.Collision.Shapes.b2Shape);

/**
 * @return {string}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetTypeName = function() {
    return Box2D.Collision.Shapes.b2EdgeShape.NAME;
};

/**
 * @param {!Box2D.Common.Math.b2Transform} transform
 * @param {!Box2D.Common.Math.b2Vec2} p
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.TestPoint = function(transform, p) {
    return false;
};

/**
 * @param {!Box2D.Collision.b2RayCastOutput} output
 * @param {!Box2D.Collision.b2RayCastInput} input
 * @param {!Box2D.Common.Math.b2Transform} transform
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.RayCast = function(output, input, transform) {
    var rX = input.p2.x - input.p1.x;
    var rY = input.p2.y - input.p1.y;
    var tMat = transform.R;
    var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
    var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
    var nX = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y) - v1Y;
    var nY = (-(transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y) - v1X));
    var k_slop = 100.0 * Number.MIN_VALUE;
    var denom = (-(rX * nX + rY * nY));
    if (denom > k_slop) {
        var bX = input.p1.x - v1X;
        var bY = input.p1.y - v1Y;
        var a = (bX * nX + bY * nY);
        if (0.0 <= a && a <= input.maxFraction * denom) {
            var mu2 = (-rX * bY) + rY * bX;
            if ((-k_slop * denom) <= mu2 && mu2 <= denom * (1.0 + k_slop)) {
                a /= denom;
                output.fraction = a;
                var nLen = Math.sqrt(nX * nX + nY * nY);
                output.normal.x = nX / nLen;
                output.normal.y = nY / nLen;
                return true;
            }
        }
    }
    return false;
};

/**
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {!Box2D.Common.Math.b2Transform} transform
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.ComputeAABB = function(aabb, transform) {
    var tMat = transform.R;
    var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
    var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
    var v2X = transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y);
    var v2Y = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y);
    if (v1X < v2X) {
        aabb.lowerBound.x = v1X;
        aabb.upperBound.x = v2X;
    } else {
        aabb.lowerBound.x = v2X;
        aabb.upperBound.x = v1X;
    }
    if (v1Y < v2Y) {
        aabb.lowerBound.y = v1Y;
        aabb.upperBound.y = v2Y;
    } else {
        aabb.lowerBound.y = v2Y;
        aabb.upperBound.y = v1Y;
    }
};

/**
 * @param {!Box2D.Collision.Shapes.b2MassData} massData
 * @param {number} density
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.ComputeMass = function(massData, density) {
    massData.mass = 0;
    massData.center.SetV(this.m_v1);
    massData.I = 0;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} normal
 * @param {number} offset
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {!Box2D.Common.Math.b2Vec2} c
 * @return {number}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
    if (offset === undefined) offset = 0;
    var v0 = Box2D.Common.Math.b2Vec2.Get(normal.x * offset, normal.y * offset);
    var v1 = Box2D.Common.Math.b2Math.MulX(xf, this.m_v1);
    var v2 = Box2D.Common.Math.b2Math.MulX(xf, this.m_v2);
    var d1 = Box2D.Common.Math.b2Math.Dot(normal, v1) - offset;
    var d2 = Box2D.Common.Math.b2Math.Dot(normal, v2) - offset;
    if (d1 > 0) {
        if (d2 > 0) {
            return 0;
        } else {
            v1.x = (-d2 / (d1 - d2) * v1.x) + d1 / (d1 - d2) * v2.x;
            v1.y = (-d2 / (d1 - d2) * v1.y) + d1 / (d1 - d2) * v2.y;
        }
    } else {
        if (d2 > 0) {
            v2.x = (-d2 / (d1 - d2) * v1.x) + d1 / (d1 - d2) * v2.x;
            v2.y = (-d2 / (d1 - d2) * v1.y) + d1 / (d1 - d2) * v2.y;
        }
    }
    c.x = (v0.x + v1.x + v2.x) / 3;
    c.y = (v0.y + v1.y + v2.y) / 3;
    return 0.5 * ((v1.x - v0.x) * (v2.y - v0.y) - (v1.y - v0.y) * (v2.x - v0.x));
};

/**
 * @return {number}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetLength = function() {
    return this.m_length;
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetVertex1 = function() {
    return this.m_v1;
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetVertex2 = function() {
    return this.m_v2;
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCoreVertex1 = function() {
    return this.m_coreV1;
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCoreVertex2 = function() {
    return this.m_coreV2;
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetNormalVector = function() {
    return this.m_normal;
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetDirectionVector = function() {
    return this.m_direction;
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCorner1Vector = function() {
    return this.m_cornerDir1;
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCorner2Vector = function() {
    return this.m_cornerDir2;
};

/**
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.Corner1IsConvex = function() {
    return this.m_cornerConvex1;
};

/**
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.Corner2IsConvex = function() {
    return this.m_cornerConvex2;
};

/**
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetFirstVertex = function(xf) {
    var tMat = xf.R;
    return Box2D.Common.Math.b2Vec2.Get(xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y), xf.position.y + (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y));
};

/**
 * @return {Box2D.Collision.Shapes.b2EdgeShape}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetNextEdge = function() {
    return this.m_nextEdge;
};

/**
 * @return {Box2D.Collision.Shapes.b2EdgeShape}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetPrevEdge = function() {
    return this.m_prevEdge;
};

/**
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {number} dX
 * @param {number} dY
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.Support = function(xf, dX, dY) {
    var tMat = xf.R;
    var v1X = xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y);
    var v1Y = xf.position.y + (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y);
    var v2X = xf.position.x + (tMat.col1.x * this.m_coreV2.x + tMat.col2.x * this.m_coreV2.y);
    var v2Y = xf.position.y + (tMat.col1.y * this.m_coreV2.x + tMat.col2.y * this.m_coreV2.y);
    if ((v1X * dX + v1Y * dY) > (v2X * dX + v2Y * dY)) {
        return Box2D.Common.Math.b2Vec2.Get(v1X, v1Y);
    } else {
        return Box2D.Common.Math.b2Vec2.Get(v2X, v2Y);
    }
};

/**
 * @param {Box2D.Collision.Shapes.b2EdgeShape} edge
 * @param {!Box2D.Common.Math.b2Vec2} core
 * @param {!Box2D.Common.Math.b2Vec2} cornerDir
 * @param {boolean} convex
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.SetPrevEdge = function(edge, core, cornerDir, convex) {
    this.m_prevEdge = edge;
    this.m_coreV1 = core;
    this.m_cornerDir1 = cornerDir;
    this.m_cornerConvex1 = convex;
};

/**
 * @param {Box2D.Collision.Shapes.b2EdgeShape} edge
 * @param {!Box2D.Common.Math.b2Vec2} core
 * @param {!Box2D.Common.Math.b2Vec2} cornerDir
 * @param {boolean} convex
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.SetNextEdge = function(edge, core, cornerDir, convex) {
    this.m_nextEdge = edge;
    this.m_coreV2 = core;
    this.m_cornerDir2 = cornerDir;
    this.m_cornerConvex2 = convex;
};

/**
 * @const
 * @type {string}
 */
Box2D.Collision.Shapes.b2EdgeShape.NAME = 'b2EdgeShape';
