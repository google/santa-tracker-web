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
 
goog.provide('Box2D.Collision.b2DistanceProxy');

goog.require('Box2D.Common.b2Settings');
goog.require('UsageTracker');

/**
 * @constructor
 */
Box2D.Collision.b2DistanceProxy = function() {
    UsageTracker.get('Box2D.Collision.b2DistanceProxy').trackCreate();
    
    /**
     * @private
     * @type {number}
     */
    this.m_count = 0;
    
    /**
     * @private
     * @type {number}
     */
    this.m_radius = 0;
    
    /**
     * @private
     * @type {Array.<!Box2D.Common.Math.b2Vec2>}
     */
    this.m_vertices = [];
};

/**
 * @param {number} count
 * @param {number} radius
 * @param {!Array.<!Box2D.Common.Math.b2Vec2>} vertices
 */
Box2D.Collision.b2DistanceProxy.prototype.SetValues = function (count, radius, vertices) {
    this.m_count = count;
    this.m_radius = radius;
    this.m_vertices = vertices;
};

/**
 * @param {!Box2D.Collision.Shapes.b2Shape} shape
 */
Box2D.Collision.b2DistanceProxy.prototype.Set = function (shape) {
    shape.SetDistanceProxy(this);
};

Box2D.Collision.b2DistanceProxy.prototype.GetSupport = function (d) {
    var bestIndex = 0;
    var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
    for (var i = 1; i < this.m_count; i++) {
        var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
        if (value > bestValue) {
            bestIndex = i;
            bestValue = value;
        }
    }
    return bestIndex;
};

Box2D.Collision.b2DistanceProxy.prototype.GetSupportVertex = function (d) {
    return this.m_vertices[this.GetSupport(d)];
};

Box2D.Collision.b2DistanceProxy.prototype.GetVertexCount = function () {
    return this.m_count;
};

Box2D.Collision.b2DistanceProxy.prototype.GetVertex = function (index) {
    if (index === undefined) index = 0;
    Box2D.Common.b2Settings.b2Assert(0 <= index && index < this.m_count);
    return this.m_vertices[index];
};

Box2D.Collision.b2DistanceProxy.prototype.GetRadius = function() {
    return this.m_radius;
};
