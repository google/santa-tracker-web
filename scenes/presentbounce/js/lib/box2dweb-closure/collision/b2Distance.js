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
 
goog.provide('Box2D.Collision.b2Distance');

goog.require('Box2D.Common.b2Settings');
goog.require('Box2D.Common.Math.b2Math');
goog.require('Box2D.Common.Math.b2Vec2');
goog.require('Box2D.Collision.b2Simplex');

Box2D.Collision.b2Distance = {};

/**
 * @param {!Box2D.Collision.b2DistanceOutput} output
 * @param {!Box2D.Collision.b2SimplexCache} cache
 * @param {!Box2D.Collision.b2DistanceInput} input
 */
Box2D.Collision.b2Distance.Distance = function(output, cache, input) {
    var s_simplex = Box2D.Collision.b2Simplex.Get();
    s_simplex.ReadCache(cache, input.proxyA, input.transformA, input.proxyB, input.transformB);
    if (s_simplex.m_count < 1 || s_simplex.m_count > 3) {
        Box2D.Common.b2Settings.b2Assert(false);
    }
    var iter = 0;
    while (iter < 20) {
        var save = [];
        for (var i = 0; i < s_simplex.m_count; i++) {
            save[i] = {};
            save[i].indexA = s_simplex.m_vertices[i].indexA;
            save[i].indexB = s_simplex.m_vertices[i].indexB;
        }
        if (s_simplex.m_count == 2) {
            s_simplex.Solve2();
        } else if (s_simplex.m_count == 3) {
            s_simplex.Solve3();
        }
        if (s_simplex.m_count == 3) {
            // m_count can be changed by s_simplex.Solve3/Solve2
            break;
        }
        var d = s_simplex.GetSearchDirection();
        if (d.LengthSquared() < Box2D.Common.b2Settings.MIN_VALUE_SQUARED) {
            Box2D.Common.Math.b2Vec2.Free(d);
            break;
        }
        Box2D.Common.Math.b2Vec2.Free(s_simplex.m_vertices[s_simplex.m_count].wA);
        Box2D.Common.Math.b2Vec2.Free(s_simplex.m_vertices[s_simplex.m_count].wB);
        Box2D.Common.Math.b2Vec2.Free(s_simplex.m_vertices[s_simplex.m_count].w);
        var negD = d.GetNegative();
        var aNegD = Box2D.Common.Math.b2Math.MulTMV(input.transformA.R, negD);
        Box2D.Common.Math.b2Vec2.Free(negD);
        s_simplex.m_vertices[s_simplex.m_count].indexA = input.proxyA.GetSupport(aNegD);
        Box2D.Common.Math.b2Vec2.Free(aNegD);
        s_simplex.m_vertices[s_simplex.m_count].wA = Box2D.Common.Math.b2Math.MulX(input.transformA, input.proxyA.GetVertex(s_simplex.m_vertices[s_simplex.m_count].indexA));
        var bD = Box2D.Common.Math.b2Math.MulTMV(input.transformB.R, d);
        Box2D.Common.Math.b2Vec2.Free(d);
        s_simplex.m_vertices[s_simplex.m_count].indexB = input.proxyB.GetSupport(bD);
        Box2D.Common.Math.b2Vec2.Free(bD);
        s_simplex.m_vertices[s_simplex.m_count].wB = Box2D.Common.Math.b2Math.MulX(input.transformB, input.proxyB.GetVertex(s_simplex.m_vertices[s_simplex.m_count].indexB));
        s_simplex.m_vertices[s_simplex.m_count].w = Box2D.Common.Math.b2Math.SubtractVV(s_simplex.m_vertices[s_simplex.m_count].wB, s_simplex.m_vertices[s_simplex.m_count].wA);
        
        iter++;
        var duplicate = false;
        for (var i = 0; i < save.length; i++) {
            if (s_simplex.m_vertices[s_simplex.m_count].indexA == save[i].indexA && s_simplex.m_vertices[s_simplex.m_count].indexB == save[i].indexB) {
                duplicate = true;
                break;
            }
        }
        if (duplicate) {
            break;
        }
        s_simplex.m_count++;
    }
    s_simplex.GetWitnessPoints(output.pointA, output.pointB);
    var distanceV = Box2D.Common.Math.b2Math.SubtractVV(output.pointA, output.pointB);
    output.distance = distanceV.Length();
    Box2D.Common.Math.b2Vec2.Free(distanceV);
    s_simplex.WriteCache(cache);
    Box2D.Collision.b2Simplex.Free(s_simplex);
    if (input.useRadii) {
        var rA = input.proxyA.GetRadius();
        var rB = input.proxyB.GetRadius();
        if (output.distance > rA + rB && output.distance > Number.MIN_VALUE) {
            output.distance -= rA + rB;
            var normal = Box2D.Common.Math.b2Math.SubtractVV(output.pointB, output.pointA);
            normal.Normalize();
            output.pointA.x += rA * normal.x;
            output.pointA.y += rA * normal.y;
            output.pointB.x -= rB * normal.x;
            output.pointB.y -= rB * normal.y;
            Box2D.Common.Math.b2Vec2.Free(normal);
        } else {
            var p = Box2D.Common.Math.b2Vec2.Get(0, 0);
            p.x = 0.5 * (output.pointA.x + output.pointB.x);
            p.y = 0.5 * (output.pointA.y + output.pointB.y);
            output.pointA.x = output.pointB.x = p.x;
            output.pointA.y = output.pointB.y = p.y;
            output.distance = 0.0;
            Box2D.Common.Math.b2Vec2.Free(p);
        }
    }
};
