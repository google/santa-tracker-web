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
 
goog.provide('Box2D.Collision.b2SeparationFunction');

goog.require('Box2D.Common.b2Settings');
goog.require('Box2D.Common.Math.b2Vec2');
goog.require('Box2D.Common.Math.b2Math');
goog.require('UsageTracker');

/**
 * @constructor
 */
Box2D.Collision.b2SeparationFunction = function() {
    UsageTracker.get('Box2D.Collision.b2SeparationFunction').trackCreate();
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.m_localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.m_axis = Box2D.Common.Math.b2Vec2.Get(0, 0);
    
    /**
     * @private
     * @type {Box2D.Collision.b2DistanceProxy}
     */
    this.m_proxyA = null;
    
    /**
     * @private
     * @type {Box2D.Collision.b2DistanceProxy}
     */
    this.m_proxyB = null;
};

/**
 * @param {!Box2D.Collision.b2SimplexCache} cache
 * @param {!Box2D.Collision.b2DistanceProxy} proxyA
 * @param {!Box2D.Common.Math.b2Transform} transformA
 * @param {!Box2D.Collision.b2DistanceProxy} proxyB
 * @param {!Box2D.Common.Math.b2Transform} transformB
 */
Box2D.Collision.b2SeparationFunction.prototype.Initialize = function(cache, proxyA, transformA, proxyB, transformB) {
    this.m_proxyA = proxyA;
    this.m_proxyB = proxyB;
    var count = cache.count;
    Box2D.Common.b2Settings.b2Assert(0 < count && count < 3);
    var localPointA;
    var localPointA1;
    var localPointA2;
    var localPointB;
    var localPointB1;
    var localPointB2;
    var pointAX = 0;
    var pointAY = 0;
    var pointBX = 0;
    var pointBY = 0;
    var normalX = 0;
    var normalY = 0;
    var tMat;
    var tVec;
    var s = 0;
    var sgn = 0;
    if (count == 1) {
        this.m_type = Box2D.Collision.b2SeparationFunction.e_points;
        localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
        localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
        tVec = localPointA;
        tMat = transformA.R;
        pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        tVec = localPointB;
        tMat = transformB.R;
        pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        this.m_axis.x = pointBX - pointAX;
        this.m_axis.y = pointBY - pointAY;
        this.m_axis.Normalize();
    } else if (cache.indexB[0] == cache.indexB[1]) {
        this.m_type = Box2D.Collision.b2SeparationFunction.e_faceA;
        localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
        localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
        localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
        this.m_localPoint.x = 0.5 * (localPointA1.x + localPointA2.x);
        this.m_localPoint.y = 0.5 * (localPointA1.y + localPointA2.y);
        var tempVec = Box2D.Common.Math.b2Math.SubtractVV(localPointA2, localPointA1);
        Box2D.Common.Math.b2Vec2.Free(this.m_axis);
        this.m_axis = Box2D.Common.Math.b2Math.CrossVF(tempVec, 1.0);
        Box2D.Common.Math.b2Vec2.Free(tempVec);
        this.m_axis.Normalize();
        tVec = this.m_axis;
        tMat = transformA.R;
        normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        tVec = this.m_localPoint;
        tMat = transformA.R;
        pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        tVec = localPointB;
        tMat = transformB.R;
        pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        s = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;
        if (s < 0.0) {
            this.m_axis.NegativeSelf();
        }
    } else if (cache.indexA[0] == cache.indexA[0]) {
        this.m_type = Box2D.Collision.b2SeparationFunction.e_faceB;
        localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
        localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
        localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
        this.m_localPoint.x = 0.5 * (localPointB1.x + localPointB2.x);
        this.m_localPoint.y = 0.5 * (localPointB1.y + localPointB2.y);
        var tempVec = Box2D.Common.Math.b2Math.SubtractVV(localPointB2, localPointB1);
        Box2D.Common.Math.b2Vec2.Free(this.m_axis);
        this.m_axis = Box2D.Common.Math.b2Math.CrossVF(tempVec, 1.0);
        Box2D.Common.Math.b2Vec2.Free(tempVec);
        this.m_axis.Normalize();
        tVec = this.m_axis;
        tMat = transformB.R;
        normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        tVec = this.m_localPoint;
        tMat = transformB.R;
        pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        tVec = localPointA;
        tMat = transformA.R;
        pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        s = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;
        if (s < 0.0) {
            this.m_axis.NegativeSelf();
        }
    } else {
        localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
        localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
        localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
        localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
        var tempVec = Box2D.Common.Math.b2Math.SubtractVV(localPointA2,localPointA1);
        var dA = Box2D.Common.Math.b2Math.MulMV(transformA.R, tempVec);
        Box2D.Common.Math.b2Vec2.Free(tempVec);
        tempVec = Box2D.Common.Math.b2Math.SubtractVV(localPointB2, localPointB1);
        var dB = Box2D.Common.Math.b2Math.MulMV(transformB.R, tempVec);
        Box2D.Common.Math.b2Vec2.Free(tempVec);
        var a = dA.x * dA.x + dA.y * dA.y;
        var e = dB.x * dB.x + dB.y * dB.y;
        var r = Box2D.Common.Math.b2Math.SubtractVV(dB, dA);
        var c = dA.x * r.x + dA.y * r.y;
        var f = dB.x * r.x + dB.y * r.y;
        Box2D.Common.Math.b2Vec2.Free(r);
        var b = dA.x * dB.x + dA.y * dB.y;
        var denom = a * e - b * b;
        s = 0.0;
        if (denom != 0.0) {
            s = Box2D.Common.Math.b2Math.Clamp((b * f - c * e) / denom, 0.0, 1.0);
        }
        var t = (b * s + f) / e;
        if (t < 0.0) {
            t = 0.0;
            s = Box2D.Common.Math.b2Math.Clamp((b - c) / a, 0.0, 1.0);
        }
        localPointA = Box2D.Common.Math.b2Vec2.Get(0, 0);
        localPointA.x = localPointA1.x + s * (localPointA2.x - localPointA1.x);
        localPointA.y = localPointA1.y + s * (localPointA2.y - localPointA1.y);
        localPointB = Box2D.Common.Math.b2Vec2.Get(0, 0);
        localPointB.x = localPointB1.x + s * (localPointB2.x - localPointB1.x);
        localPointB.y = localPointB1.y + s * (localPointB2.y - localPointB1.y);
        if (s == 0.0 || s == 1.0) {
            this.m_type = Box2D.Collision.b2SeparationFunction.e_faceB;
            tempVec = Box2D.Common.Math.b2Math.SubtractVV(localPointB2, localPointB1);
            Box2D.Common.Math.b2Vec2.Free(this.m_axis);
            this.m_axis = Box2D.Common.Math.b2Math.CrossVF(tempVec, 1.0);
            Box2D.Common.Math.b2Vec2.Free(tempVec);
            this.m_axis.Normalize();
            this.m_localPoint = localPointB;
            tVec = this.m_axis;
            tMat = transformB.R;
            normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tVec = this.m_localPoint;
            tMat = transformB.R;
            pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
            pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
            tVec = localPointA;
            tMat = transformA.R;
            pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
            pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
            sgn = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;
            if (s < 0.0) {
                this.m_axis.NegativeSelf();
            }
        } else {
            this.m_type = Box2D.Collision.b2SeparationFunction.e_faceA;
            tempVec = Box2D.Common.Math.b2Math.SubtractVV(localPointA2, localPointA1);
            Box2D.Common.Math.b2Vec2.Free(this.m_axis);
            this.m_axis = Box2D.Common.Math.b2Math.CrossVF(tempVec, 1.0);
            Box2D.Common.Math.b2Vec2.Free(tempVec);
            this.m_localPoint = localPointA;
            tVec = this.m_axis;
            tMat = transformA.R;
            normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tVec = this.m_localPoint;
            tMat = transformA.R;
            pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
            pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
            tVec = localPointB;
            tMat = transformB.R;
            pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
            pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
            sgn = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;
            if (s < 0.0) {
                this.m_axis.NegativeSelf();
            }
        }
        Box2D.Common.Math.b2Vec2.Free(localPointA);
        Box2D.Common.Math.b2Vec2.Free(localPointB);
    }
};

/**
 * @param {!Box2D.Common.Math.b2Transform} transformA
 * @param {!Box2D.Common.Math.b2Transform} transformB
 * @return {number}
 */
Box2D.Collision.b2SeparationFunction.prototype.Evaluate = function(transformA, transformB) {
    var seperation = 0;
    switch (this.m_type) {
    case Box2D.Collision.b2SeparationFunction.e_points:
        var axisA = Box2D.Common.Math.b2Math.MulTMV(transformA.R, this.m_axis);
        var negMAxis = this.m_axis.GetNegative();
        var axisB = Box2D.Common.Math.b2Math.MulTMV(transformB.R, negMAxis);
        Box2D.Common.Math.b2Vec2.Free(negMAxis);
        var localPointA = this.m_proxyA.GetSupportVertex(axisA);
        Box2D.Common.Math.b2Vec2.Free(axisA)
        var localPointB = this.m_proxyB.GetSupportVertex(axisB);
        Box2D.Common.Math.b2Vec2.Free(axisB)
        var pointA = Box2D.Common.Math.b2Math.MulX(transformA, localPointA);
        var pointB = Box2D.Common.Math.b2Math.MulX(transformB, localPointB);
        seperation = (pointB.x - pointA.x) * this.m_axis.x + (pointB.y - pointA.y) * this.m_axis.y;
        Box2D.Common.Math.b2Vec2.Free(pointA)
        Box2D.Common.Math.b2Vec2.Free(pointB)
        break;
    case Box2D.Collision.b2SeparationFunction.e_faceA:
        var normal = Box2D.Common.Math.b2Math.MulMV(transformA.R, this.m_axis);
        var negNormal = normal.GetNegative();
        var axisB = Box2D.Common.Math.b2Math.MulTMV(transformB.R, negNormal);
        Box2D.Common.Math.b2Vec2.Free(negNormal)
        var localPointB = this.m_proxyB.GetSupportVertex(axisB);
        Box2D.Common.Math.b2Vec2.Free(axisB)
        var pointA = Box2D.Common.Math.b2Math.MulX(transformA, this.m_localPoint);
        var pointB = Box2D.Common.Math.b2Math.MulX(transformB, localPointB);
        seperation = (pointB.x - pointA.x) * normal.x + (pointB.y - pointA.y) * normal.y;
        Box2D.Common.Math.b2Vec2.Free(normal)
        Box2D.Common.Math.b2Vec2.Free(pointA)
        Box2D.Common.Math.b2Vec2.Free(pointB)
        break;
    case Box2D.Collision.b2SeparationFunction.e_faceB:
        var normal = Box2D.Common.Math.b2Math.MulMV(transformB.R, this.m_axis);
        var negNormal = normal.GetNegative();
        var axisA = Box2D.Common.Math.b2Math.MulTMV(transformA.R, negNormal);
        Box2D.Common.Math.b2Vec2.Free(negNormal)
        var localPointA = this.m_proxyA.GetSupportVertex(axisA);
        Box2D.Common.Math.b2Vec2.Free(axisA)
        var pointA = Box2D.Common.Math.b2Math.MulX(transformA, localPointA);
        var pointB = Box2D.Common.Math.b2Math.MulX(transformB, this.m_localPoint);
        seperation = (pointA.x - pointB.x) * normal.x + (pointA.y - pointB.y) * normal.y;
        Box2D.Common.Math.b2Vec2.Free(normal)
        Box2D.Common.Math.b2Vec2.Free(pointA)
        Box2D.Common.Math.b2Vec2.Free(pointB)
        break;
    default:
        Box2D.Common.b2Settings.b2Assert(false);
        break;
    }
    return seperation;
};

/**
 * @const
 * @type {number}
 */
Box2D.Collision.b2SeparationFunction.e_points = 0x01;

/**
 * @const
 * @type {number}
 */
Box2D.Collision.b2SeparationFunction.e_faceA = 0x02;

/**
 * @const
 * @type {number}
 */
Box2D.Collision.b2SeparationFunction.e_faceB = 0x04;
