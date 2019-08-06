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
 
goog.provide('Box2D.Dynamics.Controllers.b2BuoyancyController');

goog.require('Box2D.Dynamics.Controllers.b2Controller');
goog.require('Box2D.Common.Math.b2Vec2');
goog.require('Box2D.Common.b2Color');

/**
 * @constructor
 * @extends {Box2D.Dynamics.Controllers.b2Controller}
 */
Box2D.Dynamics.Controllers.b2BuoyancyController = function() {
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.normal = Box2D.Common.Math.b2Vec2.Get(0, -1);
    this.offset = 0;
    this.density = 0;
    this.velocity = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.linearDrag = 2;
    this.angularDrag = 1;
    this.useDensity = false;
    this.useWorldGravity = true;
    this.gravity = null;
};
goog.inherits(Box2D.Dynamics.Controllers.b2BuoyancyController, Box2D.Dynamics.Controllers.b2Controller);

Box2D.Dynamics.Controllers.b2BuoyancyController.prototype.Step = function(step) {
    if (this.useWorldGravity) {
        this.gravity = this.m_world.GetGravity();
    }
    var areac = Box2D.Common.Math.b2Vec2.Get(0, 0);
    var massc = Box2D.Common.Math.b2Vec2.Get(0, 0);
    var sc = Box2D.Common.Math.b2Vec2.Get(0, 0);
    for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.awakeBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
        massc.Set(0, 0);
        areac.Set(0, 0);
        var body = bodyNode.body;
        var area = 0.0;
        var mass = 0.0;
        for (var fixtureNode = body.GetFixtureList().GetFirstNode(); fixtureNode; fixtureNode = fixtureNode.GetNextNode()) {
            sc.Set(0,0);
            var sarea = fixtureNode.fixture.GetShape().ComputeSubmergedArea(this.normal, this.offset, body.GetTransform(), sc);
            area += sarea;
            areac.x += sarea * sc.x;
            areac.y += sarea * sc.y;
            var shapeDensity = 0;
            if (this.useDensity) {
                shapeDensity = 1;
            } else {
                shapeDensity = 1;
            }
            mass += sarea * shapeDensity;
            massc.x += sarea * sc.x * shapeDensity;
            massc.y += sarea * sc.y * shapeDensity;
        }
        if (area < Number.MIN_VALUE) {
            continue;
        }
        areac.x /= area;
        areac.y /= area;
        massc.x /= mass;
        massc.y /= mass;
        var buoyancyForce = this.gravity.GetNegative();
        buoyancyForce.Multiply(this.density * area);
        body.ApplyForce(buoyancyForce, massc);
        Box2D.Common.Math.b2Vec2.Free(buoyancyForce);
        var dragForce = body.GetLinearVelocityFromWorldPoint(areac);
        dragForce.Subtract(this.velocity);
        dragForce.Multiply((-this.linearDrag * area));
        body.ApplyForce(dragForce, areac);
        Box2D.Common.Math.b2Vec2.Free(dragForce);
        body.ApplyTorque((-body.GetInertia() / body.GetMass() * area * body.GetAngularVelocity() * this.angularDrag));
    }
    Box2D.Common.Math.b2Vec2.Free(sc)
    Box2D.Common.Math.b2Vec2.Free(massc);
    Box2D.Common.Math.b2Vec2.Free(areac);
};

Box2D.Dynamics.Controllers.b2BuoyancyController.prototype.Draw = function(debugDraw) {
    var r = 1000;
    var p1 = Box2D.Common.Math.b2Vec2.Get(this.normal.x * this.offset + this.normal.y * r, this.normal.y * this.offset - this.normal.x * r);
    var p2 = Box2D.Common.Math.b2Vec2.Get(this.normal.x * this.offset - this.normal.y * r, this.normal.y * this.offset + this.normal.x * r);
    debugDraw.DrawSegment(p1, p2, Box2D.Dynamics.Controllers.b2BuoyancyController.color);
    Box2D.Common.Math.b2Vec2.Free(p1);
    Box2D.Common.Math.b2Vec2.Free(p2);
};

/**
 * @type {!Box2D.Common.b2Color}
 * @const
 */
Box2D.Dynamics.Controllers.b2BuoyancyController.color = new Box2D.Common.b2Color(0, 0, 1);