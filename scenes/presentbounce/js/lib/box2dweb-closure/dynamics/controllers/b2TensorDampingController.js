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
 
goog.provide('Box2D.Dynamics.Controllers.b2TensorDampingController');

goog.require('Box2D.Dynamics.Controllers.b2Controller');
goog.require('Box2D.Common.Math.b2Mat22');
goog.require('Box2D.Common.Math.b2Math');
goog.require('Box2D.Common.Math.b2Vec2');

/**
 * @constructor
 * @extends {Box2D.Dynamics.Controllers.b2Controller}
 */
Box2D.Dynamics.Controllers.b2TensorDampingController = function() {
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.T = Box2D.Common.Math.b2Mat22.Get();
    this.maxTimestep = 0;
};
goog.inherits(Box2D.Dynamics.Controllers.b2TensorDampingController, Box2D.Dynamics.Controllers.b2Controller);

/**
 * @param {number} xDamping
 * @param {number} yDamping
 */
Box2D.Dynamics.Controllers.b2TensorDampingController.prototype.SetAxisAligned = function(xDamping, yDamping) {
    this.T.col1.x = (-xDamping);
    this.T.col1.y = 0;
    this.T.col2.x = 0;
    this.T.col2.y = (-yDamping);
    if (xDamping > 0 || yDamping > 0) {
        this.maxTimestep = 1 / Math.max(xDamping, yDamping);
    } else {
        this.maxTimestep = 0;
    }
};

Box2D.Dynamics.Controllers.b2TensorDampingController.prototype.Step = function(step) {
    var timestep = step.dt;
    if (timestep <= Number.MIN_VALUE) return;
    if (timestep > this.maxTimestep && this.maxTimestep > 0) timestep = this.maxTimestep;
    for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.awakeBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
        var body = bodyNode.body;
        var lV = body.GetLocalVector(body.GetLinearVelocity());
        var tV = Box2D.Common.Math.b2Math.MulMV(this.T, lV);
        Box2D.Common.Math.b2Vec2.Free(lV);
        var damping = body.GetWorldVector(tV);
        Box2D.Common.Math.b2Vec2.Free(tV);
        var newV = Box2D.Common.Math.b2Vec2.Get(body.GetLinearVelocity().x + damping.x * timestep, body.GetLinearVelocity().y + damping.y * timestep);
        Box2D.Common.Math.b2Vec2.Free(damping);
        body.SetLinearVelocity(newV);
        Box2D.Common.Math.b2Vec2.Free(newV);
    }
};
