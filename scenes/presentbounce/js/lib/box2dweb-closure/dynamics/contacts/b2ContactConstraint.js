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
 
goog.provide('Box2D.Dynamics.Contacts.b2ContactConstraint');

goog.require('Box2D.Common.Math.b2Vec2');
goog.require('Box2D.Common.Math.b2Mat22');
goog.require('Box2D.Dynamics.Contacts.b2ContactConstraintPoint');
goog.require('UsageTracker');

/**
 * @constructor
 */
Box2D.Dynamics.Contacts.b2ContactConstraint = function() {
    UsageTracker.get('Box2D.Dynamics.Contacts.b2ContactConstraint').trackCreate();
    
    /**
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.localPlaneNormal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    
    /**
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
    
    /**
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    
    /**
     * @type {!Box2D.Common.Math.b2Mat22}
     */
    this.normalMass = Box2D.Common.Math.b2Mat22.Get();
    
    /**
     * @type {!Box2D.Common.Math.b2Mat22}
     */
    this.K = Box2D.Common.Math.b2Mat22.Get();
    
    /**
     * @type {!Array.<!Box2D.Dynamics.Contacts.b2ContactConstraintPoint>}
     */
    this.points = [];
    for (var i = 0; i < Box2D.Common.b2Settings.b2_maxManifoldPoints; i++) {
        this.points[i] = new Box2D.Dynamics.Contacts.b2ContactConstraintPoint();
    }
};
