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
 
goog.provide('Box2D.Collision.b2WorldManifold');

goog.require('Box2D.Collision.b2Manifold');
goog.require('Box2D.Common.b2Settings');
goog.require('Box2D.Common.Math.b2Vec2');
goog.require('UsageTracker');

/**
 * @constructor
 */
Box2D.Collision.b2WorldManifold = function() {
    UsageTracker.get('Box2D.Collision.b2WorldManifold').trackCreate();
    
    /**
     * @private
     * @type  {!Box2D.Common.Math.b2Vec2}
     */
    this.m_normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    
    /**
     * @private
     * @type {Array.<!Box2D.Common.Math.b2Vec2>}
     */
    this.m_points = [];
    
    /**
     * @private
     * @type {number}
     */
    this.m_pointCount = 0;
    
    for (var i = 0; i < Box2D.Common.b2Settings.b2_maxManifoldPoints; i++) {
        this.m_points[i] = Box2D.Common.Math.b2Vec2.Get(0, 0);
    }
};

/**
 * @param {!Box2D.Collision.b2Manifold} manifold
 * @param {!Box2D.Common.Math.b2Transform} xfA
 * @param {number} radiusA
 * @param {!Box2D.Common.Math.b2Transform} xfB
 * @param {number} radiusB
 */
Box2D.Collision.b2WorldManifold.prototype.Initialize = function(manifold, xfA, radiusA, xfB, radiusB) {
    if (manifold.m_pointCount == 0) {
        return;
    }
    var i = 0;
    var tVec;
    var tMat;
    var normalX = 0;
    var normalY = 0;
    var planePointX = 0;
    var planePointY = 0;
    var clipPointX = 0;
    var clipPointY = 0;
    switch (manifold.m_type) {
        case Box2D.Collision.b2Manifold.e_circles:
            tMat = xfA.R;
            tVec = manifold.m_localPoint;
            var pointAX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            var pointAY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tMat = xfB.R;
            tVec = manifold.m_points[0].m_localPoint;
            var pointBX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            var pointBY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            var dX = pointBX - pointAX;
            var dY = pointBY - pointAY;
            var d2 = dX * dX + dY * dY;
            if (d2 > Box2D.Common.b2Settings.MIN_VALUE_SQUARED) {
                var d = Math.sqrt(d2);
                this.m_normal.x = dX / d;
                this.m_normal.y = dY / d;
            } else {
                this.m_normal.x = 1;
                this.m_normal.y = 0;
            }
            var cAX = pointAX + radiusA * this.m_normal.x;
            var cAY = pointAY + radiusA * this.m_normal.y;
            var cBX = pointBX - radiusB * this.m_normal.x;
            var cBY = pointBY - radiusB * this.m_normal.y;
            this.m_points[0].x = 0.5 * (cAX + cBX);
            this.m_points[0].y = 0.5 * (cAY + cBY);
            break;
        case Box2D.Collision.b2Manifold.e_faceA:
            tMat = xfA.R;
            tVec = manifold.m_localPlaneNormal;
            normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tMat = xfA.R;
            tVec = manifold.m_localPoint;
            planePointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            planePointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            this.m_normal.x = normalX;
            this.m_normal.y = normalY;
            for (i = 0; i < manifold.m_pointCount; i++) {
                tMat = xfB.R;
                tVec = manifold.m_points[i].m_localPoint;
                clipPointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                clipPointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                this.m_points[i].x = clipPointX + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalX;
                this.m_points[i].y = clipPointY + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalY;
            }
            break;
        case Box2D.Collision.b2Manifold.e_faceB:
            tMat = xfB.R;
            tVec = manifold.m_localPlaneNormal;
            normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tMat = xfB.R;
            tVec = manifold.m_localPoint;
            planePointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            planePointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            this.m_normal.x = (-normalX);
            this.m_normal.y = (-normalY);
            for (i = 0; i < manifold.m_pointCount; i++) {
                tMat = xfA.R;
                tVec = manifold.m_points[i].m_localPoint;
                clipPointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                clipPointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                this.m_points[i].x = clipPointX + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalX;
                this.m_points[i].y = clipPointY + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalY;
            }
            break;
    }
};
