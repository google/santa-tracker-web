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
 
goog.provide('Box2D.Collision.Shapes.b2CircleShape');

goog.require('Box2D.Collision.Shapes.b2Shape');
goog.require('Box2D.Common.Math.b2Vec2');
goog.require('Box2D.Common.Math.b2Math');
goog.require('UsageTracker');

/**
 * @param {number} radius
 * @constructor
 * @extends {Box2D.Collision.Shapes.b2Shape}
 */
Box2D.Collision.Shapes.b2CircleShape = function(radius) {
    UsageTracker.get('Box2D.Collision.Shapes.b2CircleShape').trackCreate();
    
    Box2D.Collision.Shapes.b2Shape.call(this);
    
    this.m_radius = radius;
    
    /**
     * @private
     * @type {number}
     */
    this.m_radiusSquared = radius * radius;
    
    /**
     * @const
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.m_p = Box2D.Common.Math.b2Vec2.Get(0, 0);
    
    /**
     * Used to minimize the creation of arrays for SetDistanceProxy only
     * @private
     * @const
     * @type {!Array.<!Box2D.Common.Math.b2Vec2>}
     */
    this.m_vertices = [this.m_p];
};
goog.inherits(Box2D.Collision.Shapes.b2CircleShape, Box2D.Collision.Shapes.b2Shape);

/**
 * @return {string}
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.GetTypeName = function() {
    return Box2D.Collision.Shapes.b2CircleShape.NAME;
};

/**
 * @return {!Box2D.Collision.Shapes.b2CircleShape}
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.Copy = function() {
    var s = new Box2D.Collision.Shapes.b2CircleShape(this.m_radius);
    s.Set(this);
    return s;
};

/**
 * @param {!Box2D.Collision.Shapes.b2Shape} other
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.Set = function(other) {
    Box2D.Collision.Shapes.b2Shape.prototype.Set.call(this, other);
    if (other instanceof Box2D.Collision.Shapes.b2CircleShape) {
        this.m_p.SetV(other.m_p);
    }
};

/**
 * @param {!Box2D.Common.Math.b2Transform} transform
 * @param {!Box2D.Common.Math.b2Vec2} p
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.TestPoint = function(transform, p) {
    var dX = p.x - (transform.position.x + (transform.R.col1.x * this.m_p.x + transform.R.col2.x * this.m_p.y));
    var dY = p.y - (transform.position.y + (transform.R.col1.y * this.m_p.x + transform.R.col2.y * this.m_p.y));
    return (dX * dX + dY * dY) <= this.m_radiusSquared;
};

/**
 * @param {!Box2D.Collision.b2RayCastOutput} output
 * @param {!Box2D.Collision.b2RayCastInput} input
 * @param {!Box2D.Common.Math.b2Transform} transform
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.RayCast = function(output, input, transform) {
    var tMat = transform.R;
    var positionX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
    var positionY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
    var sX = input.p1.x - positionX;
    var sY = input.p1.y - positionY;
    var b = (sX * sX + sY * sY) - this.m_radiusSquared;
    var rX = input.p2.x - input.p1.x;
    var rY = input.p2.y - input.p1.y;
    var c = (sX * rX + sY * rY);
    var rr = (rX * rX + rY * rY);
    var sigma = c * c - rr * b;
    if (sigma < 0.0 || rr < Number.MIN_VALUE) {
        return false;
    }
    var a = (-(c + Math.sqrt(sigma)));
    if (0.0 <= a && a <= input.maxFraction * rr) {
        a /= rr;
        output.fraction = a;
        output.normal.x = sX + a * rX;
        output.normal.y = sY + a * rY;
        output.normal.Normalize();
        return true;
    }
    return false;
};

/**
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {!Box2D.Common.Math.b2Transform} transform
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.ComputeAABB = function(aabb, transform) {
    var tMat = transform.R;
    var pX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
    var pY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
    aabb.lowerBound.Set(pX - this.m_radius, pY - this.m_radius);
    aabb.upperBound.Set(pX + this.m_radius, pY + this.m_radius);
};

/**
 * @param {!Box2D.Collision.Shapes.b2MassData} massData
 * @param {number} density
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.ComputeMass = function(massData, density) {
    var mass = density * Math.PI * this.m_radiusSquared;
    massData.SetV(mass, this.m_p, mass * (0.5 * this.m_radiusSquared + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y)));
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} normal
 * @param {number} offset
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {!Box2D.Common.Math.b2Vec2} c
 * @return {number}
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
    var p = Box2D.Common.Math.b2Math.MulX(xf, this.m_p);
    var l = (-(Box2D.Common.Math.b2Math.Dot(normal, p) - offset));
    if (l < (-this.m_radius) + Number.MIN_VALUE) {
        Box2D.Common.Math.b2Vec2.Free(p);
        return 0;
    }
    if (l > this.m_radius) {
        Box2D.Common.Math.b2Vec2.Free(p);
        c.SetV(p);
        return Math.PI * this.m_radiusSquared;
    }
    var l2 = l * l;
    var area = this.m_radiusSquared * (Math.asin(l / this.m_radius) + Math.PI / 2) + l * Math.sqrt(this.m_radiusSquared - l2);
    var com = (-2 / 3 * Math.pow(this.m_radiusSquared - l2, 1.5) / area);
    c.x = p.x + normal.x * com;
    c.y = p.y + normal.y * com;
    Box2D.Common.Math.b2Vec2.Free(p);
    return area;
};

/**
 * @param {!Box2D.Collision.b2DistanceProxy} proxy
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.SetDistanceProxy = function(proxy) {
    proxy.SetValues(1, this.m_radius, this.m_vertices);
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.GetLocalPosition = function() {
    return this.m_p;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} position
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.SetLocalPosition = function(position) {
    this.m_p.SetV(position);
};

/**
 * @return {number}
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.GetRadius = function() {
    return this.m_radius;
};

/**
 * @param {number} radius
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.SetRadius = function(radius) {
    this.m_radius = radius;
    this.m_radiusSquared = radius * radius;
};

/**
 * @const
 * @type {string}
 */
Box2D.Collision.Shapes.b2CircleShape.NAME = 'b2CircleShape';
