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
 
goog.provide('Box2D.Dynamics.Controllers.b2ConstantAccelController');

goog.require('Box2D.Dynamics.Controllers.b2Controller');
goog.require('Box2D.Common.Math.b2Vec2');

/**
 * @constructor
 * @extends {Box2D.Dynamics.Controllers.b2Controller}
 */
Box2D.Dynamics.Controllers.b2ConstantAccelController = function() {
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.A = Box2D.Common.Math.b2Vec2.Get(0, 0);
};
goog.inherits(Box2D.Dynamics.Controllers.b2ConstantAccelController, Box2D.Dynamics.Controllers.b2Controller);

Box2D.Dynamics.Controllers.b2ConstantAccelController.prototype.Step = function(step) {
    var smallA = Box2D.Common.Math.b2Vec2.Get(this.A.x * step.dt, this.A.y * step.dt);
    for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.awakeBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
        var body = bodyNode.body;
        var oldVelocity = body.GetLinearVelocity();
        var newVelocity = Box2D.Common.Math.b2Vec2.Get(oldVelocity.x + smallA.x, oldVelocity.y + smallA.y);
        body.SetLinearVelocity(newVelocity);
        Box2D.Common.Math.b2Vec2.Free(newVelocity);
    }
    Box2D.Common.Math.b2Vec2.Free(smallA);
};
