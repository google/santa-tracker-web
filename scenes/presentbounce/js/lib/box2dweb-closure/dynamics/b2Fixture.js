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
 
goog.provide('Box2D.Dynamics.b2Fixture');

goog.require('Box2D.Common.Math.b2Math');
goog.require('Box2D.Dynamics.b2FilterData');
goog.require('Box2D.Collision.b2AABB');
goog.require('Box2D.Collision.Shapes.b2MassData');
goog.require('UsageTracker');

/**
 * @param {!Box2D.Dynamics.b2Body} body
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {!Box2D.Dynamics.b2FixtureDef} def
 * @constructor
 */
Box2D.Dynamics.b2Fixture = function(body, xf, def) {
    UsageTracker.get('Box2D.Dynamics.b2Fixture').trackCreate();
    
    /**
     * @const
     * @private
     * @type {string}
     */
    this.ID = "Fixture" + Box2D.Dynamics.b2Fixture.NEXT_ID++;
    
    /**
     * @private
     * @type {!Box2D.Dynamics.b2FilterData}
     */
    this.m_filter = def.filter.Copy();

    /**
     * @private
     * @type {!Box2D.Collision.b2AABB}
     */
    this.m_aabb = Box2D.Collision.b2AABB.Get();
    
    /**
     * @private
     * @type {!Box2D.Collision.b2AABB}
     */
    this.m_aabb_temp = Box2D.Collision.b2AABB.Get();
    
    /**
     * @private
     * @type {!Box2D.Dynamics.b2Body}
     */
    this.m_body = body;
    
    /**
     * @private
     * @type {!Box2D.Collision.Shapes.b2Shape}
     */
    this.m_shape = def.shape.Copy();
    
    /**
     * @private
     * @type {number}
     */
    this.m_density = def.density;
    
    /**
     * @private
     * @type {number}
     */
    this.m_friction = def.friction;
    
    /**
     * @private
     * @type {number}
     */
    this.m_restitution = def.restitution;
    
    /**
     * @private
     * @type {boolean}
     */
    this.m_isSensor = def.isSensor;
    
    /**
     * @type {Box2D.Collision.b2DynamicTreeNode}
     */
     this.m_proxy = null;
};

/**
 * @return {!Box2D.Collision.Shapes.b2Shape}
 */
Box2D.Dynamics.b2Fixture.prototype.GetShape = function() {
    return this.m_shape;
};

/**
 * @param {boolean} sensor
 */
Box2D.Dynamics.b2Fixture.prototype.SetSensor = function(sensor) {
    if (this.m_isSensor == sensor) {
        return;
    }
    this.m_isSensor = sensor;
    if (this.m_body == null) {
        return;
    }
    var thisFixture = this;
    this.m_body.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts, function(contact){
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        if (fixtureA == thisFixture || fixtureB == thisFixture) {
            contact.SetSensor(fixtureA.IsSensor() || fixtureB.IsSensor());
        }
    });
};

/**
 * @return {boolean}
 */
Box2D.Dynamics.b2Fixture.prototype.IsSensor = function() {
    return this.m_isSensor;
};

/**
 * @param {!Box2D.Dynamics.b2FilterData} filter
 */
Box2D.Dynamics.b2Fixture.prototype.SetFilterData = function(filter) {
    this.m_filter = filter.Copy();
    if (this.m_body == null) {
        return;
    }
    var thisFixture = this;
    this.m_body.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts, function(contact){
        if (contact.GetFixtureA() == thisFixture || contact.GetFixtureB() == thisFixture) {
            contact.FlagForFiltering();
        }
    });
};

/**
 * @return {!Box2D.Dynamics.b2FilterData}
 */
Box2D.Dynamics.b2Fixture.prototype.GetFilterData = function() {
    return this.m_filter;
};

/**
 * @return {!Box2D.Dynamics.b2Body}
 */
Box2D.Dynamics.b2Fixture.prototype.GetBody = function() {
    return this.m_body;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} p
 * @return {boolean}
 */
Box2D.Dynamics.b2Fixture.prototype.TestPoint = function(p) {
    return this.m_shape.TestPoint(this.m_body.GetTransform(), p);
};

/**
 * @param {!Box2D.Collision.b2RayCastOutput} output
 * @param {!Box2D.Collision.b2RayCastInput} input
 * @return {boolean}
 */
Box2D.Dynamics.b2Fixture.prototype.RayCast = function(output, input) {
    return this.m_shape.RayCast(output, input, this.m_body.GetTransform());
};

/**
 * @param {Box2D.Collision.Shapes.b2MassData=} massData
 * @return {!Box2D.Collision.Shapes.b2MassData}
 */
Box2D.Dynamics.b2Fixture.prototype.GetMassData = function(massData) {
    if (!massData) {
        massData = Box2D.Collision.Shapes.b2MassData.Get();
    }
    this.m_shape.ComputeMass(massData, this.m_density);
    return massData;
};

/**
 * @param {number} density
 */
Box2D.Dynamics.b2Fixture.prototype.SetDensity = function(density) {
    this.m_density = density;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2Fixture.prototype.GetDensity = function() {
    return this.m_density;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2Fixture.prototype.GetFriction = function() {
    return this.m_friction;
};

/**
 * @param {number} friction
 */
Box2D.Dynamics.b2Fixture.prototype.SetFriction = function(friction) {
    this.m_friction = friction;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2Fixture.prototype.GetRestitution = function() {
    return this.m_restitution;
};

/**
 * @param {number} restitution
 */
Box2D.Dynamics.b2Fixture.prototype.SetRestitution = function(restitution) {
    this.m_restitution = restitution;
};

/**
 * @return {!Box2D.Collision.b2AABB}
 */
Box2D.Dynamics.b2Fixture.prototype.GetAABB = function() {
    return this.m_aabb;
};

Box2D.Dynamics.b2Fixture.prototype.Destroy = function() {
    Box2D.Collision.b2AABB.Free(this.m_aabb);
};

/**
 * @param {!Box2D.Collision.b2DynamicTreeBroadPhase} broadPhase
 * @param {!Box2D.Common.Math.b2Transform} xf
 */
Box2D.Dynamics.b2Fixture.prototype.CreateProxy = function(broadPhase, xf) {
    this.m_shape.ComputeAABB(this.m_aabb, xf);
    this.m_proxy = broadPhase.CreateProxy(this.m_aabb, this);
};

/**
 * @param {!Box2D.Collision.b2DynamicTreeBroadPhase} broadPhase
 */
Box2D.Dynamics.b2Fixture.prototype.DestroyProxy = function(broadPhase) {
    if (this.m_proxy == null) {
        return;
    }
    broadPhase.DestroyProxy(this.m_proxy);
    this.m_proxy = null;
};

/**
 * @param {!Box2D.Collision.b2DynamicTreeBroadPhase} broadPhase
 * @param {!Box2D.Common.Math.b2Transform} transform1
 * @param {!Box2D.Common.Math.b2Transform} transform2
 */
Box2D.Dynamics.b2Fixture.prototype.Synchronize = function(broadPhase, transform1, transform2) {
    if (!this.m_proxy) return;
    
    this.m_shape.ComputeAABB(this.m_aabb, transform1);
    this.m_shape.ComputeAABB(this.m_aabb_temp, transform2);
    this.m_aabb.Combine(this.m_aabb, this.m_aabb_temp);
    
    var displacement = Box2D.Common.Math.b2Math.SubtractVV(transform2.position, transform1.position);
    broadPhase.MoveProxy(this.m_proxy, this.m_aabb, displacement);
    Box2D.Common.Math.b2Vec2.Free(displacement);
};

/**
 * @type {number}
 * @private
 */
Box2D.Dynamics.b2Fixture.NEXT_ID = 0;
