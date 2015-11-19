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
 
goog.provide('Box2D.Collision.Shapes.b2PolygonShape');

goog.require('Box2D.Collision.Shapes.b2MassData');
goog.require('Box2D.Collision.Shapes.b2Shape');
goog.require('Box2D.Common.b2Settings');
goog.require('Box2D.Common.Math.b2Mat22');
goog.require('Box2D.Common.Math.b2Math');
goog.require('Box2D.Common.Math.b2Transform');
goog.require('Box2D.Common.Math.b2Vec2');
goog.require('UsageTracker');

/**
 * @constructor
 * @extends {Box2D.Collision.Shapes.b2Shape}
 */
Box2D.Collision.Shapes.b2PolygonShape = function() {
    UsageTracker.get('Box2D.Collision.Shapes.b2PolygonShape').trackCreate();
    
    Box2D.Collision.Shapes.b2Shape.call(this);
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.m_centroid = Box2D.Common.Math.b2Vec2.Get(0, 0);
    
    /**
     * @private
     * @type {!Array.<!Box2D.Common.Math.b2Vec2>}
     */
    this.m_vertices = [];
    
    /**
     * @private
     * @type {!Array.<!Box2D.Common.Math.b2Vec2>}
     */
    this.m_normals = [];
};
goog.inherits(Box2D.Collision.Shapes.b2PolygonShape, Box2D.Collision.Shapes.b2Shape);

/**
 * @return {string}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetTypeName = function() {
    return Box2D.Collision.Shapes.b2PolygonShape.NAME;
};

/**
 * @return {!Box2D.Collision.Shapes.b2PolygonShape}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.Copy = function() {
    var s = new Box2D.Collision.Shapes.b2PolygonShape();
    s.Set(this);
    return s;
};

/**
 * @param {!Box2D.Collision.Shapes.b2Shape} other
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.Set = function(other) {
    Box2D.Collision.Shapes.b2Shape.prototype.Set.call(this, other);
    if (other instanceof Box2D.Collision.Shapes.b2PolygonShape) {
        this.m_centroid.SetV(other.m_centroid);
        this.m_vertexCount = other.m_vertexCount;
        this.Reserve(this.m_vertexCount);
        for (var i = 0; i < this.m_vertexCount; i++) {
            this.m_vertices[i].SetV(other.m_vertices[i]);
            this.m_normals[i].SetV(other.m_normals[i]);
        }
    }
};

/**
 * @param {Array.<Box2D.Common.Math.b2Vec2>} vertices
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsArray = function(vertices) {
    this.SetAsVector(vertices);
};

/**
 * @param {Array.<Box2D.Common.Math.b2Vec2>} vertices
 * @return {!Box2D.Collision.Shapes.b2PolygonShape}
 */
Box2D.Collision.Shapes.b2PolygonShape.AsArray = function(vertices) {
    var polygonShape = new Box2D.Collision.Shapes.b2PolygonShape();
    polygonShape.SetAsArray(vertices);
    return polygonShape;
};

/**
 * @param {Array.<!Box2D.Common.Math.b2Vec2>} vertices
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsVector = function(vertices) {
    var vertexCount = vertices.length;
    Box2D.Common.b2Settings.b2Assert(2 <= vertexCount);
    this.m_vertexCount = vertexCount;
    this.Reserve(vertexCount);
    var i = 0;
    for (i = 0; i < this.m_vertexCount; i++) {
        this.m_vertices[i].SetV(vertices[i]);
    }
    for (i = 0; i < this.m_vertexCount; ++i) {
        var i1 = i;
        var i2 = i + 1 < this.m_vertexCount ? i + 1 : 0;
        var edge = Box2D.Common.Math.b2Math.SubtractVV(this.m_vertices[i2], this.m_vertices[i1]);
        Box2D.Common.b2Settings.b2Assert(edge.LengthSquared() > Number.MIN_VALUE);
        var edgeCross = Box2D.Common.Math.b2Math.CrossVF(edge, 1.0);
        Box2D.Common.Math.b2Vec2.Free(edge);
        this.m_normals[i].SetV(edgeCross);
        Box2D.Common.Math.b2Vec2.Free(edgeCross);
        this.m_normals[i].Normalize();
    }
    this.m_centroid = Box2D.Collision.Shapes.b2PolygonShape.ComputeCentroid(this.m_vertices, this.m_vertexCount);
};

/**
 * @param {Array.<Box2D.Common.Math.b2Vec2>} vertices
 * @return {!Box2D.Collision.Shapes.b2PolygonShape}
 */
Box2D.Collision.Shapes.b2PolygonShape.AsVector = function(vertices) {
    var polygonShape = new Box2D.Collision.Shapes.b2PolygonShape();
    polygonShape.SetAsVector(vertices);
    return polygonShape;
};

/**
 * @param {number} hx
 * @param {number} hy
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsBox = function(hx, hy) {
    this.m_vertexCount = 4;
    this.Reserve(4);
    this.m_vertices[0].Set((-hx), (-hy));
    this.m_vertices[1].Set(hx, (-hy));
    this.m_vertices[2].Set(hx, hy);
    this.m_vertices[3].Set((-hx), hy);
    this.m_normals[0].Set(0.0, (-1.0));
    this.m_normals[1].Set(1.0, 0.0);
    this.m_normals[2].Set(0.0, 1.0);
    this.m_normals[3].Set((-1.0), 0.0);
    this.m_centroid.SetZero();
};

/**
 * @param {number} hx
 * @param {number} hy
 * @return {!Box2D.Collision.Shapes.b2PolygonShape}
 */
Box2D.Collision.Shapes.b2PolygonShape.AsBox = function(hx, hy) {
    var polygonShape = new Box2D.Collision.Shapes.b2PolygonShape();
    polygonShape.SetAsBox(hx, hy);
    return polygonShape;
};

/**
 * @param {number} hx
 * @param {number} hy
 * @param {!Box2D.Common.Math.b2Vec2} center
 * @param {number} angle
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsOrientedBox = function(hx, hy, center, angle) {
    this.m_vertexCount = 4;
    this.Reserve(4);
    this.m_vertices[0].Set((-hx), (-hy));
    this.m_vertices[1].Set(hx, (-hy));
    this.m_vertices[2].Set(hx, hy);
    this.m_vertices[3].Set((-hx), hy);
    this.m_normals[0].Set(0.0, (-1.0));
    this.m_normals[1].Set(1.0, 0.0);
    this.m_normals[2].Set(0.0, 1.0);
    this.m_normals[3].Set((-1.0), 0.0);
    this.m_centroid = center;
    var mat = Box2D.Common.Math.b2Mat22.Get();
    mat.Set(angle);
    var xf = new Box2D.Common.Math.b2Transform(center, mat);
    for (var i = 0; i < this.m_vertexCount; ++i) {
        this.m_vertices[i] = Box2D.Common.Math.b2Math.MulX(xf, this.m_vertices[i]);
        this.m_normals[i] = Box2D.Common.Math.b2Math.MulMV(xf.R, this.m_normals[i]);
    }
};

/**
 * @param {number} hx
 * @param {number} hy
 * @param {!Box2D.Common.Math.b2Vec2} center
 * @param {number} angle
 * @return {!Box2D.Collision.Shapes.b2PolygonShape}
 */
Box2D.Collision.Shapes.b2PolygonShape.AsOrientedBox = function(hx, hy, center, angle) {
    var polygonShape = new Box2D.Collision.Shapes.b2PolygonShape();
    polygonShape.SetAsOrientedBox(hx, hy, center, angle);
    return polygonShape;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} v1
 * @param {!Box2D.Common.Math.b2Vec2} v2
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsEdge = function(v1, v2) {
    this.m_vertexCount = 2;
    this.Reserve(2);
    this.m_vertices[0].SetV(v1);
    this.m_vertices[1].SetV(v2);
    this.m_centroid.x = 0.5 * (v1.x + v2.x);
    this.m_centroid.y = 0.5 * (v1.y + v2.y);
    var d = Box2D.Common.Math.b2Math.SubtractVV(v2, v1);
    var crossD = Box2D.Common.Math.b2Math.CrossVF(d, 1.0)
    Box2D.Common.Math.b2Vec2.Free(d);
    this.m_normals[0] = crossD;
    this.m_normals[0].Normalize();
    this.m_normals[1].x = (-this.m_normals[0].x);
    this.m_normals[1].y = (-this.m_normals[0].y);
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} v1
 * @param {!Box2D.Common.Math.b2Vec2} v2
 * @return {!Box2D.Collision.Shapes.b2PolygonShape}
 */
Box2D.Collision.Shapes.b2PolygonShape.AsEdge = function(v1, v2) {
    var polygonShape = new Box2D.Collision.Shapes.b2PolygonShape();
    polygonShape.SetAsEdge(v1, v2);
    return polygonShape;
};

/**
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {!Box2D.Common.Math.b2Vec2} p
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.TestPoint = function(xf, p) {
    var tVec;
    var tMat = xf.R;
    var tX = p.x - xf.position.x;
    var tY = p.y - xf.position.y;
    var pLocalX = (tX * tMat.col1.x + tY * tMat.col1.y);
    var pLocalY = (tX * tMat.col2.x + tY * tMat.col2.y);
    for (var i = 0; i < this.m_vertexCount; ++i) {
        tVec = this.m_vertices[i];
        tX = pLocalX - tVec.x;
        tY = pLocalY - tVec.y;
        tVec = this.m_normals[i];
        var dot = (tVec.x * tX + tVec.y * tY);
        if (dot > 0.0) {
            return false;
        }
    }
    return true;
};

/**
 * @param {!Box2D.Collision.b2RayCastOutput} output
 * @param {!Box2D.Collision.b2RayCastInput} input
 * @param {!Box2D.Common.Math.b2Transform} transform
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.RayCast = function(output, input, transform) {
    var lower = 0.0;
    var upper = input.maxFraction;
    var tX = 0;
    var tY = 0;
    var tMat;
    var tVec;
    tX = input.p1.x - transform.position.x;
    tY = input.p1.y - transform.position.y;
    tMat = transform.R;
    var p1X = (tX * tMat.col1.x + tY * tMat.col1.y);
    var p1Y = (tX * tMat.col2.x + tY * tMat.col2.y);
    tX = input.p2.x - transform.position.x;
    tY = input.p2.y - transform.position.y;
    tMat = transform.R;
    var p2X = (tX * tMat.col1.x + tY * tMat.col1.y);
    var p2Y = (tX * tMat.col2.x + tY * tMat.col2.y);
    var dX = p2X - p1X;
    var dY = p2Y - p1Y;
    var index = -1;
    for (var i = 0; i < this.m_vertexCount; ++i) {
        tVec = this.m_vertices[i];
        tX = tVec.x - p1X;
        tY = tVec.y - p1Y;
        tVec = this.m_normals[i];
        var numerator = (tVec.x * tX + tVec.y * tY);
        var denominator = (tVec.x * dX + tVec.y * dY);
        if (denominator == 0.0) {
            if (numerator < 0.0) {
                return false;
            }
        } else {
            if (denominator < 0.0 && numerator < lower * denominator) {
                lower = numerator / denominator;
                index = i;
            } else if (denominator > 0.0 && numerator < upper * denominator) {
                upper = numerator / denominator;
            }
        }
        if (upper < lower - Number.MIN_VALUE) {
            return false;
        }
    }
    if (index >= 0) {
        output.fraction = lower;
        tMat = transform.R;
        tVec = this.m_normals[index];
        output.normal.x = (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        output.normal.y = (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        return true;
    }
    return false;
};

/**
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {!Box2D.Common.Math.b2Transform} xf
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.ComputeAABB = function(aabb, xf) {
    var tMat = xf.R;
    var tVec = this.m_vertices[0];
    var lowerX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var lowerY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    var upperX = lowerX;
    var upperY = lowerY;
    for (var i = 1; i < this.m_vertexCount; ++i) {
        tVec = this.m_vertices[i];
        var vX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        var vY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        lowerX = lowerX < vX ? lowerX : vX;
        lowerY = lowerY < vY ? lowerY : vY;
        upperX = upperX > vX ? upperX : vX;
        upperY = upperY > vY ? upperY : vY;
    }
    aabb.lowerBound.x = lowerX - this.m_radius;
    aabb.lowerBound.y = lowerY - this.m_radius;
    aabb.upperBound.x = upperX + this.m_radius;
    aabb.upperBound.y = upperY + this.m_radius;
};

/**
 * @param {!Box2D.Collision.Shapes.b2MassData} massData
 * @param {number} density
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.ComputeMass = function(massData, density) {
    if (this.m_vertexCount == 2) {
        massData.center.x = 0.5 * (this.m_vertices[0].x + this.m_vertices[1].x);
        massData.center.y = 0.5 * (this.m_vertices[0].y + this.m_vertices[1].y);
        massData.mass = 0.0;
        massData.I = 0.0;
        return;
    }
    var centerX = 0.0;
    var centerY = 0.0;
    var area = 0.0;
    var I = 0.0;
    var p1X = 0.0;
    var p1Y = 0.0;
    var k_inv3 = 1.0 / 3.0;
    for (var i = 0; i < this.m_vertexCount; ++i) {
        var p2 = this.m_vertices[i];
        var p3 = i + 1 < this.m_vertexCount ? this.m_vertices[i + 1] : this.m_vertices[0];
        var e1X = p2.x - p1X;
        var e1Y = p2.y - p1Y;
        var e2X = p3.x - p1X;
        var e2Y = p3.y - p1Y;
        var D = e1X * e2Y - e1Y * e2X;
        var triangleArea = 0.5 * D;
        area += triangleArea;
        centerX += triangleArea * k_inv3 * (p1X + p2.x + p3.x);
        centerY += triangleArea * k_inv3 * (p1Y + p2.y + p3.y);
        var px = p1X;
        var py = p1Y;
        var ex1 = e1X;
        var ey1 = e1Y;
        var ex2 = e2X;
        var ey2 = e2Y;
        var intx2 = k_inv3 * (0.25 * (ex1 * ex1 + ex2 * ex1 + ex2 * ex2) + (px * ex1 + px * ex2)) + 0.5 * px * px;
        var inty2 = k_inv3 * (0.25 * (ey1 * ey1 + ey2 * ey1 + ey2 * ey2) + (py * ey1 + py * ey2)) + 0.5 * py * py;
        I += D * (intx2 + inty2);
    }
    centerX *= 1.0 / area;
    centerY *= 1.0 / area;
    massData.Set(density * area, centerX, centerY, density * I);
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} normal
 * @param {number} offset
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {!Box2D.Common.Math.b2Vec2} c
 * @return {number}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
    var normalL = Box2D.Common.Math.b2Math.MulTMV(xf.R, normal);
    var offsetL = offset - Box2D.Common.Math.b2Math.Dot(normal, xf.position);
    var depths = [];
    var diveCount = 0;
    var intoIndex = -1;
    var outoIndex = -1;
    var lastSubmerged = false;
    var i = 0;
    for (i = 0; i < this.m_vertexCount; ++i) {
        depths[i] = Box2D.Common.Math.b2Math.Dot(normalL, this.m_vertices[i]) - offsetL;
        var isSubmerged = depths[i] < (-Number.MIN_VALUE);
        if (i > 0) {
            if (isSubmerged) {
                if (!lastSubmerged) {
                    intoIndex = i - 1;
                    diveCount++;
                }
            } else {
                if (lastSubmerged) {
                    outoIndex = i - 1;
                    diveCount++;
                }
            }
        }
        lastSubmerged = isSubmerged;
    }
    Box2D.Common.Math.b2Vec2.Free(normalL);
    switch (diveCount) {
    case 0:
        if (lastSubmerged) {
            var md = Box2D.Collision.Shapes.b2MassData.Get();
            this.ComputeMass(md, 1);
            var newV = Box2D.Common.Math.b2Math.MulX(xf, md.center);
            c.SetV(newV);
            Box2D.Common.Math.b2Vec2.Free(newV);
            var mass = md.mass;
            Box2D.Collision.Shapes.b2MassData.Free(md);
            return mass;
        } else {
            return 0;
        }
        break;
    case 1:
        if (intoIndex == (-1)) {
            intoIndex = this.m_vertexCount - 1;
        } else {
            outoIndex = this.m_vertexCount - 1;
        }
        break;
    }
    var intoIndex2 = ((intoIndex + 1) % this.m_vertexCount);
    var outoIndex2 = ((outoIndex + 1) % this.m_vertexCount);
    var intoLamdda = (0 - depths[intoIndex]) / (depths[intoIndex2] - depths[intoIndex]);
    var outoLamdda = (0 - depths[outoIndex]) / (depths[outoIndex2] - depths[outoIndex]);
    var intoVec = Box2D.Common.Math.b2Vec2.Get(this.m_vertices[intoIndex].x * (1 - intoLamdda) + this.m_vertices[intoIndex2].x * intoLamdda,
                                               this.m_vertices[intoIndex].y * (1 - intoLamdda) + this.m_vertices[intoIndex2].y * intoLamdda);
    var outoVec = Box2D.Common.Math.b2Vec2.Get(this.m_vertices[outoIndex].x * (1 - outoLamdda) + this.m_vertices[outoIndex2].x * outoLamdda,
                                               this.m_vertices[outoIndex].y * (1 - outoLamdda) + this.m_vertices[outoIndex2].y * outoLamdda);
    var area = 0;
    var center = Box2D.Common.Math.b2Vec2.Get(0, 0);
    var p2 = this.m_vertices[intoIndex2];
    var p3;
    i = intoIndex2;
    while (i != outoIndex2) {
        i = (i + 1) % this.m_vertexCount;
        if (i == outoIndex2) p3 = outoVec;
        else p3 = this.m_vertices[i];
        var triangleArea = 0.5 * ((p2.x - intoVec.x) * (p3.y - intoVec.y) - (p2.y - intoVec.y) * (p3.x - intoVec.x));
        area += triangleArea;
        center.x += triangleArea * (intoVec.x + p2.x + p3.x) / 3;
        center.y += triangleArea * (intoVec.y + p2.y + p3.y) / 3;
        p2 = p3;
    }
    Box2D.Common.Math.b2Vec2.Free(intoVec);
    Box2D.Common.Math.b2Vec2.Free(outoVec);
    center.Multiply(1 / area);
    var newV = Box2D.Common.Math.b2Math.MulX(xf, center);
    Box2D.Common.Math.b2Vec2.Free(center);
    c.SetV(newV);
    Box2D.Common.Math.b2Vec2.Free(newV);
    return area;
};

/**
 * @param {!Box2D.Collision.b2DistanceProxy} proxy
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetDistanceProxy = function(proxy) {
    proxy.SetValues(this.m_vertexCount, this.m_radius, this.m_vertices);
};

/**
 * @return {number}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetVertexCount = function() {
    return this.m_vertexCount;
};

/**
 * @return {Array.<!Box2D.Common.Math.b2Vec2>}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetVertices = function() {
    return this.m_vertices;
};

/**
 * @param {number} edge
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetVertex = function(edge) {
    return this.m_vertices[edge];
};

/**
 * @return {Array.<!Box2D.Common.Math.b2Vec2>}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetNormals = function() {
    return this.m_normals;
};

/**
 * @param {number} edge
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetNormal = function(edge) {
    return this.m_normals[edge];
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetCentroid = function() {
    return this.m_centroid;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} d
 * return {number}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetSupport = function(d) {
    var bestIndex = 0;
    var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
    for (var i = 1; i < this.m_vertexCount; ++i) {
        var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
        if (value > bestValue) {
            bestIndex = i;
            bestValue = value;
        }
    }
    return bestIndex;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} d
 * return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetSupportVertex = function(d) {
    var bestIndex = 0;
    var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
    for (var i = 1; i < this.m_vertexCount; ++i) {
        var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
        if (value > bestValue) {
            bestIndex = i;
            bestValue = value;
        }
    }
    return this.m_vertices[bestIndex];
};

/**
 * @param {number} count
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.Reserve = function(count) {
    for (var i = 0; i < this.m_vertices.length; i++) {
        Box2D.Common.Math.b2Vec2.Free(this.m_vertices[i])
        Box2D.Common.Math.b2Vec2.Free(this.m_normals[i])
    }
    this.m_vertices = [];
    this.m_normals = [];
    for (var i = 0; i < count; i++) {
        this.m_vertices[i] = Box2D.Common.Math.b2Vec2.Get(0, 0);
        this.m_normals[i] = Box2D.Common.Math.b2Vec2.Get(0, 0);
    }
};

/**
 * @param {Array.<!Box2D.Common.Math.b2Vec2>} vs
 * @param {number} count
 * return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2PolygonShape.ComputeCentroid = function(vs, count) {
    var c = Box2D.Common.Math.b2Vec2.Get(0, 0);
    var area = 0.0;
    var p1X = 0.0;
    var p1Y = 0.0;
    var inv3 = 1.0 / 3.0;
    for (var i = 0; i < count; ++i) {
        var p2 = vs[i];
        var p3 = i + 1 < count ? vs[i + 1] : vs[0];
        var e1X = p2.x - p1X;
        var e1Y = p2.y - p1Y;
        var e2X = p3.x - p1X;
        var e2Y = p3.y - p1Y;
        var D = (e1X * e2Y - e1Y * e2X);
        var triangleArea = 0.5 * D;
        area += triangleArea;
        c.x += triangleArea * inv3 * (p1X + p2.x + p3.x);
        c.y += triangleArea * inv3 * (p1Y + p2.y + p3.y);
    }
    c.x *= 1.0 / area;
    c.y *= 1.0 / area;
    return c;
};

/** @type {!Box2D.Common.Math.b2Mat22} */
Box2D.Collision.Shapes.b2PolygonShape.s_mat = Box2D.Common.Math.b2Mat22.Get();

/**
 * @const
 * @type {string}
 */
Box2D.Collision.Shapes.b2PolygonShape.NAME = 'b2PolygonShape';
