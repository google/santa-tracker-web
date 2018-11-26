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
 
goog.provide('Box2D.Dynamics.b2Body');

goog.require('Box2D.Common.b2Settings');
goog.require('Box2D.Common.Math.b2Transform');
goog.require('Box2D.Common.Math.b2Sweep');
goog.require('Box2D.Common.Math.b2Vec2');
goog.require('Box2D.Common.Math.b2Math');
goog.require('Box2D.Dynamics.Contacts.b2ContactList');
goog.require('Box2D.Dynamics.b2BodyDef');
goog.require('Box2D.Dynamics.b2Fixture');
goog.require('Box2D.Dynamics.b2FixtureDef');
goog.require('Box2D.Dynamics.b2FixtureList');
goog.require('Box2D.Dynamics.Controllers.b2ControllerList');
goog.require('UsageTracker');

/**
 * @param {!Box2D.Dynamics.b2BodyDef} bd
 * @param {!Box2D.Dynamics.b2World} world
 * @constructor
 */
Box2D.Dynamics.b2Body = function(bd, world) {
    UsageTracker.get('Box2D.Dynamics.b2Body').trackCreate();
    
    /**
     * @const
     * @private
     * @type {string}
     */
    this.ID = "Body" + Box2D.Dynamics.b2Body.NEXT_ID++;
    
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Transform}
     */
    this.m_xf = new Box2D.Common.Math.b2Transform();
    this.m_xf.position.SetV(bd.position);
    this.m_xf.R.Set(bd.angle);

    /**
     * @private
     * @type {!Box2D.Common.Math.b2Sweep}
     */
    this.m_sweep = new Box2D.Common.Math.b2Sweep();
    this.m_sweep.localCenter.SetZero();
    this.m_sweep.t0 = 1.0;
    this.m_sweep.a0 = this.m_sweep.a = bd.angle;
    this.m_sweep.c.x = (this.m_xf.R.col1.x * this.m_sweep.localCenter.x + this.m_xf.R.col2.x * this.m_sweep.localCenter.y);
    this.m_sweep.c.y = (this.m_xf.R.col1.y * this.m_sweep.localCenter.x + this.m_xf.R.col2.y * this.m_sweep.localCenter.y);
    this.m_sweep.c.x += this.m_xf.position.x;
    this.m_sweep.c.y += this.m_xf.position.y;
    this.m_sweep.c0.SetV(this.m_sweep.c);
    
    /**
      * @private
      * @type {!Box2D.Common.Math.b2Vec2}
      */
    this.m_linearVelocity = bd.linearVelocity.Copy();
    
    /**
      * @private
      * @type {!Box2D.Common.Math.b2Vec2}
      */
    this.m_force = Box2D.Common.Math.b2Vec2.Get(0, 0);
    
    /**
     * @private
     * @type {boolean}
     */
    this.m_bullet = bd.bullet;
    
    /**
     * @private
     * @type {boolean}
     */
    this.m_fixedRotation = bd.fixedRotation;
    
    /**
     * @private
     * @type {boolean}
     */
    this.m_allowSleep = bd.allowSleep;
    
    /**
     * @private
     * @type {boolean}
     */
    this.m_awake = bd.awake;
    
    /**
     * @private
     * @type {boolean}
     */
    this.m_active = bd.active;
    
    /**
     * @private
     * @type {!Box2D.Dynamics.b2World}
     */
    this.m_world = world;
    
    /**
     * @private
     * @type {Box2D.Dynamics.Joints.b2Joint}
     */
    this.m_jointList = null;
    
    /**
     * @private
     * @type {!Box2D.Dynamics.Contacts.b2ContactList}
     */
     this.contactList = new Box2D.Dynamics.Contacts.b2ContactList();
    
    /**
     * @private
     * @type {!Box2D.Dynamics.Controllers.b2ControllerList}
     */
    this.controllerList = new Box2D.Dynamics.Controllers.b2ControllerList();
    
    /**
     * @private
     * @type {number}
     */
    this.m_controllerCount = 0;
    
    /**
     * @private
     * @type {number}
     */
    this.m_angularVelocity = bd.angularVelocity;
    
    /**
     * @private
     * @type {number}
     */
    this.m_linearDamping = bd.linearDamping;
    
    /**
     * @private
     * @type {number}
     */
    this.m_angularDamping = bd.angularDamping;
    
    /**
     * @private
     * @type {number}
     */
    this.m_torque = 0;
    
    /**
     * @private
     * @type {number}
     */
    this.m_sleepTime = 0;
    
    /**
     * @private
     * @type {number}
     */
    this.m_type = bd.type;
    
    /**
     * @private
     * @type {number}
     */
    this.m_mass = this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody ? 1 : 0;
    
    /**
     * @private
     * @type {number}
     */
    this.m_invMass = this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody ? 1 : 0;
    
    /**
     * @private
     * @type {number}
     */
    this.m_I = 0;
    
    /**
     * @private
     * @type {number}
     */
    this.m_invI = 0;
    
    /**
     * @private
     * @type {number}
     */
    this.m_inertiaScale = bd.inertiaScale;
    
    /**
     * @private
     * @type {!Box2D.Dynamics.b2FixtureList}
     */
    this.fixtureList = new Box2D.Dynamics.b2FixtureList();
    
    /**
     * @private
     * @type {Array.<!Box2D.Dynamics.b2BodyList>}
     */
     this.m_lists = [];
};

/**
 * @param {!Box2D.Dynamics.b2FixtureDef} def
 * @return {!Box2D.Dynamics.b2Fixture}
 */
Box2D.Dynamics.b2Body.prototype.CreateFixture = function(def) {
    Box2D.Common.b2Settings.b2Assert(!this.m_world.IsLocked());
    var fixture = new Box2D.Dynamics.b2Fixture(this, this.m_xf, def);
    if (this.m_active) {
        var broadPhase = this.m_world.m_contactManager.m_broadPhase;
        fixture.CreateProxy(broadPhase, this.m_xf);
    }
    this.fixtureList.AddFixture(fixture);
    fixture.m_body = this;
    if (fixture.m_density > 0.0) {
        this.ResetMassData();
    }
    this.m_world.m_newFixture = true;
    return fixture;
};

/**
 * @param {!Box2D.Collision.Shapes.b2Shape} shape
 * @param {number} density
 * @return {!Box2D.Dynamics.b2Fixture}
 */
Box2D.Dynamics.b2Body.prototype.CreateFixture2 = function(shape, density) {
    var def = new Box2D.Dynamics.b2FixtureDef();
    def.shape = shape;
    def.density = density;
    return this.CreateFixture(def);
};

Box2D.Dynamics.b2Body.prototype.Destroy = function() {
    // These should also be freed
    //this.m_xf = new Box2D.Common.Math.b2Transform();
    //this.m_sweep = new Box2D.Common.Math.b2Sweep();
    Box2D.Common.Math.b2Vec2.Free(this.m_linearVelocity);
    Box2D.Common.Math.b2Vec2.Free(this.m_force);
};

/**
 * @param {!Box2D.Dynamics.b2Fixture} fixture
 */
Box2D.Dynamics.b2Body.prototype.DestroyFixture = function(fixture) {
    Box2D.Common.b2Settings.b2Assert(!this.m_world.IsLocked());
    this.fixtureList.RemoveFixture(fixture);
    var thisBody = this;
    this.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts, function(contact){
        if (fixture == contact.GetFixtureA() || fixture == contact.GetFixtureB()) {
            thisBody.m_world.m_contactManager.Destroy(contact);
        }
    });
    if (this.m_active) {
        var broadPhase = this.m_world.m_contactManager.m_broadPhase;
        fixture.DestroyProxy(broadPhase);
    }
    fixture.Destroy();
    this.ResetMassData();
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} position
 * @param {number} angle
 */
Box2D.Dynamics.b2Body.prototype.SetPositionAndAngle = function(position, angle) {
    Box2D.Common.b2Settings.b2Assert(!this.m_world.IsLocked());
    this.m_xf.R.Set(angle);
    this.m_xf.position.SetV(position);
    var tMat = this.m_xf.R;
    var tVec = this.m_sweep.localCenter;
    this.m_sweep.c.x = (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    this.m_sweep.c.y = (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    this.m_sweep.c.x += this.m_xf.position.x;
    this.m_sweep.c.y += this.m_xf.position.y;
    this.m_sweep.c0.SetV(this.m_sweep.c);
    this.m_sweep.a0 = this.m_sweep.a = angle;
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    
    for (var node = this.fixtureList.GetFirstNode(); node; node = node.GetNextNode()) {
        node.fixture.Synchronize(broadPhase, this.m_xf, this.m_xf);
    }
    this.m_world.m_contactManager.FindNewContacts();
};

/**
 * @param {!Box2D.Common.Math.b2Transform} xf
 */
Box2D.Dynamics.b2Body.prototype.SetTransform = function(xf) {
    this.SetPositionAndAngle(xf.position, xf.GetAngle());
};

/**
 * @return {!Box2D.Common.Math.b2Transform}
 */
Box2D.Dynamics.b2Body.prototype.GetTransform = function() {
    return this.m_xf;
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Dynamics.b2Body.prototype.GetPosition = function() {
    return this.m_xf.position;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} position
 */
Box2D.Dynamics.b2Body.prototype.SetPosition = function(position) {
    this.SetPositionAndAngle(position, this.GetAngle());
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2Body.prototype.GetAngle = function() {
    return this.m_sweep.a;
};

/**
 * @param {number} angle
 */
Box2D.Dynamics.b2Body.prototype.SetCalculatedAngle = function(angle) {
    this.m_sweep.a = angle;
};

/**
 * @param {number} angle
 */
Box2D.Dynamics.b2Body.prototype.SetAngle = function(angle) {
    this.SetPositionAndAngle(this.GetPosition(), angle);
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Dynamics.b2Body.prototype.GetWorldCenter = function() {
    return this.m_sweep.c;
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Dynamics.b2Body.prototype.GetLocalCenter = function() {
    return this.m_sweep.localCenter;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} v
 */
Box2D.Dynamics.b2Body.prototype.SetLinearVelocity = function(v) {
    if (this.m_type == Box2D.Dynamics.b2BodyDef.b2_staticBody) {
        return;
    }
    this.m_linearVelocity.SetV(v);
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Dynamics.b2Body.prototype.GetLinearVelocity = function() {
    return this.m_linearVelocity;
};

/**
 * @param {number} omega
 */
Box2D.Dynamics.b2Body.prototype.SetAngularVelocity = function(omega) {
    if (this.m_type == Box2D.Dynamics.b2BodyDef.b2_staticBody) {
        return;
    }
    this.m_angularVelocity = omega;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2Body.prototype.GetAngularVelocity = function() {
    return this.m_angularVelocity;
};

/**
 * @return {!Box2D.Dynamics.b2BodyDef}
 */
Box2D.Dynamics.b2Body.prototype.GetDefinition = function() {
    var bd = new Box2D.Dynamics.b2BodyDef();
    bd.type = this.GetType();
    bd.allowSleep = this.m_allowSleep;
    bd.angle = this.GetAngle();
    bd.angularDamping = this.m_angularDamping;
    bd.angularVelocity = this.m_angularVelocity;
    bd.fixedRotation = this.m_fixedRotation;
    bd.bullet = this.m_bullet;
    bd.active = this.m_active;
    bd.awake = this.m_awake;
    bd.linearDamping = this.m_linearDamping;
    bd.linearVelocity.SetV(this.GetLinearVelocity());
    bd.position.SetV(this.GetPosition());
    return bd;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} force
 * @param {!Box2D.Common.Math.b2Vec2} point
 */
Box2D.Dynamics.b2Body.prototype.ApplyForce = function(force, point) {
    if (this.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
        return;
    }
    this.SetAwake(true);
    
    this.m_force.x += force.x;
    this.m_force.y += force.y;
    this.m_torque += ((point.x - this.m_sweep.c.x) * force.y - (point.y - this.m_sweep.c.y) * force.x);
};

/**
 * @param {number} torque
 */
Box2D.Dynamics.b2Body.prototype.ApplyTorque = function(torque) {
    if (this.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
        return;
    }
    this.SetAwake(true);
    this.m_torque += torque;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} impulse
 * @param {!Box2D.Common.Math.b2Vec2} point
 */
Box2D.Dynamics.b2Body.prototype.ApplyImpulse = function(impulse, point) {
    if (this.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
        return;
    }
    this.SetAwake(true);
    
    this.m_linearVelocity.x += this.m_invMass * impulse.x;
    this.m_linearVelocity.y += this.m_invMass * impulse.y;
    this.m_angularVelocity += this.m_invI * ((point.x - this.m_sweep.c.x) * impulse.y - (point.y - this.m_sweep.c.y) * impulse.x);
};

/**
 * @param {function(!Box2D.Dynamics.b2Fixture):boolean} callback
 * @return {!Box2D.Dynamics.b2Body}
 */
Box2D.Dynamics.b2Body.prototype.Split = function(callback) {
    var linearVelocity = this.GetLinearVelocity().Copy();
    var angularVelocity = this.GetAngularVelocity();
    var center = this.GetWorldCenter();
    var body1 = this;
    var body2 = this.m_world.CreateBody(this.GetDefinition());
    for (var node = body1.fixtureList.GetFirstNode(); node; node = node.GetNextNode()) {
        var f = node.fixture;
        if (callback(f)) {
            body1.fixtureList.RemoveFixture(f);
            body2.fixtureList.AddFixture(f);
        }
    }
    body1.ResetMassData();
    body2.ResetMassData();
    var center1 = body1.GetWorldCenter();
    var center2 = body2.GetWorldCenter();
    var center1Diff = Box2D.Common.Math.b2Math.SubtractVV(center1, center);
    var center1Cross = Box2D.Common.Math.b2Math.CrossFV(angularVelocity, center1Diff);
    Box2D.Common.Math.b2Vec2.Free(center1Diff);
    var velocity1 = Box2D.Common.Math.b2Math.AddVV(linearVelocity, center1Cross);
    Box2D.Common.Math.b2Vec2.Free(center1Cross);
    body1.SetLinearVelocity(velocity1);
    Box2D.Common.Math.b2Vec2.Free(velocity1);
    
    var center2Diff = Box2D.Common.Math.b2Math.SubtractVV(center2, center);
    var center2Cross = Box2D.Common.Math.b2Math.CrossFV(angularVelocity, center2Diff);
    Box2D.Common.Math.b2Vec2.Free(center2Diff);
    var velocity2 = Box2D.Common.Math.b2Math.AddVV(linearVelocity, center2Cross);
    Box2D.Common.Math.b2Vec2.Free(center2Cross);
    body2.SetLinearVelocity(velocity2);
    Box2D.Common.Math.b2Vec2.Free(velocity2);
    Box2D.Common.Math.b2Vec2.Free(linearVelocity);
    
    body1.SetAngularVelocity(angularVelocity);
    body2.SetAngularVelocity(angularVelocity);
    body1.SynchronizeFixtures();
    body2.SynchronizeFixtures();
    return body2;
};

/**
 * @param {!Box2D.Dynamics.b2Body} other
 */
Box2D.Dynamics.b2Body.prototype.Merge = function(other) {
    for (var node = other.fixtureList.GetFirstNode(); node; node = node.GetNextNode()) {
        this.fixtureList.AddFixture(node.fixture);
        other.fixtureList.RemoveFixture(node.fixture);
    }
    other.ResetMassData();
    this.ResetMassData();
    this.SynchronizeFixtures();
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2Body.prototype.GetMass = function() {
    return this.m_mass;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2Body.prototype.GetInverseMass = function() {
    return this.m_invMass;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2Body.prototype.GetInertia = function() {
    return this.m_I;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2Body.prototype.GetInverseInertia = function() {
    return this.m_invI;
};

/**
 * @param {Box2D.Collision.Shapes.b2MassData=} massData
 * @return {!Box2D.Collision.Shapes.b2MassData}
 */
Box2D.Dynamics.b2Body.prototype.GetMassData = function(massData) {
    if (!massData) {
        massData = Box2D.Collision.Shapes.b2MassData.Get();
    }
    massData.mass = this.m_mass;
    massData.I = this.m_I;
    massData.center.SetV(this.m_sweep.localCenter);
    return massData;
};

/**
 * @param {!Box2D.Collision.Shapes.b2MassData} massData
 */
Box2D.Dynamics.b2Body.prototype.SetMassData = function(massData) {
    Box2D.Common.b2Settings.b2Assert(!this.m_world.IsLocked());
    if (this.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
        return;
    }
    this.m_invMass = 0.0;
    this.m_I = 0.0;
    this.m_invI = 0.0;
    this.m_mass = massData.mass;
    if (this.m_mass <= 0.0) {
        this.m_mass = 1.0;
    }
    this.m_invMass = 1.0 / this.m_mass;
    if (massData.I > 0.0 && !this.m_fixedRotation) {
        this.m_I = massData.I - this.m_mass * (massData.center.x * massData.center.x + massData.center.y * massData.center.y);
        this.m_invI = 1.0 / this.m_I;
    }
    var oldCenter = this.m_sweep.c.Copy();
    this.m_sweep.localCenter.SetV(massData.center);
    this.m_sweep.c0.SetV(Box2D.Common.Math.b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
    this.m_sweep.c.SetV(this.m_sweep.c0);
    this.m_linearVelocity.x += this.m_angularVelocity * (-(this.m_sweep.c.y - oldCenter.y));
    this.m_linearVelocity.y += this.m_angularVelocity * (+(this.m_sweep.c.x - oldCenter.x));
    Box2D.Common.Math.b2Vec2.Free(oldCenter);
};

Box2D.Dynamics.b2Body.prototype.ResetMassData = function() {
    this.m_mass = 0.0;
    this.m_invMass = 0.0;
    this.m_I = 0.0;
    this.m_invI = 0.0;
    this.m_sweep.localCenter.SetZero();
    if (this.m_type == Box2D.Dynamics.b2BodyDef.b2_staticBody || this.m_type == Box2D.Dynamics.b2BodyDef.b2_kinematicBody) {
        return;
    }
    var center = Box2D.Common.Math.b2Vec2.Get(0, 0);
    for (var node = this.fixtureList.GetFirstNode(); node; node = node.GetNextNode()) {
        var f = node.fixture;
        if (f.m_density == 0.0) {
            continue;
        }
        var massData = f.GetMassData();
        this.m_mass += massData.mass;
        center.x += massData.center.x * massData.mass;
        center.y += massData.center.y * massData.mass;
        this.m_I += massData.I;
    }
    if (this.m_mass > 0.0) {
        this.m_invMass = 1.0 / this.m_mass;
        center.x *= this.m_invMass;
        center.y *= this.m_invMass;
    } else {
        this.m_mass = 1.0;
        this.m_invMass = 1.0;
    }
    if (this.m_I > 0.0 && !this.m_fixedRotation) {
        this.m_I -= this.m_mass * (center.x * center.x + center.y * center.y);
        this.m_I *= this.m_inertiaScale;
        Box2D.Common.b2Settings.b2Assert(this.m_I > 0);
        this.m_invI = 1.0 / this.m_I;
    } else {
        this.m_I = 0.0;
        this.m_invI = 0.0;
    }
    var oldCenter = this.m_sweep.c.Copy();
    this.m_sweep.localCenter.SetV(center);
    this.m_sweep.c0.SetV(Box2D.Common.Math.b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
    this.m_sweep.c.SetV(this.m_sweep.c0);
    this.m_linearVelocity.x += this.m_angularVelocity * (-(this.m_sweep.c.y - oldCenter.y));
    this.m_linearVelocity.y += this.m_angularVelocity * (+(this.m_sweep.c.x - oldCenter.x));
    Box2D.Common.Math.b2Vec2.Free(center);
    Box2D.Common.Math.b2Vec2.Free(oldCenter);
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} localPoint
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Dynamics.b2Body.prototype.GetWorldPoint = function(localPoint) {
    var A = this.m_xf.R;
    var u = Box2D.Common.Math.b2Vec2.Get(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * localPoint.y);
    u.x += this.m_xf.position.x;
    u.y += this.m_xf.position.y;
    return u;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} localVector
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Dynamics.b2Body.prototype.GetWorldVector = function(localVector) {
    return Box2D.Common.Math.b2Math.MulMV(this.m_xf.R, localVector);
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} worldPoint
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Dynamics.b2Body.prototype.GetLocalPoint = function(worldPoint) {
    return Box2D.Common.Math.b2Math.MulXT(this.m_xf, worldPoint);
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} worldVector
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Dynamics.b2Body.prototype.GetLocalVector = function(worldVector) {
    return Box2D.Common.Math.b2Math.MulTMV(this.m_xf.R, worldVector);
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} worldPoint
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Dynamics.b2Body.prototype.GetLinearVelocityFromWorldPoint = function(worldPoint) {
    return Box2D.Common.Math.b2Vec2.Get(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (worldPoint.x - this.m_sweep.c.x));
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} localPoint
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Dynamics.b2Body.prototype.GetLinearVelocityFromLocalPoint = function(localPoint) {
    var A = this.m_xf.R;
    var worldPoint = Box2D.Common.Math.b2Vec2.Get(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * localPoint.y);
    worldPoint.x += this.m_xf.position.x;
    worldPoint.y += this.m_xf.position.y;
    var velocity = Box2D.Common.Math.b2Vec2.Get(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (worldPoint.x - this.m_sweep.c.x));
    Box2D.Common.Math.b2Vec2.Free(worldPoint);
    return velocity;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2Body.prototype.GetLinearDamping = function() {
    return this.m_linearDamping;
};

/**
 * @param {number} linearDamping
 */
Box2D.Dynamics.b2Body.prototype.SetLinearDamping = function(linearDamping) {
    this.m_linearDamping = linearDamping;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2Body.prototype.GetAngularDamping = function() {
    return this.m_angularDamping;
};

/**
 * @param {number} angularDamping
 */
Box2D.Dynamics.b2Body.prototype.SetAngularDamping = function(angularDamping) {
    this.m_angularDamping = angularDamping;
};

/**
 * @param {number} type
 */
Box2D.Dynamics.b2Body.prototype.SetType = function(type) {
    if (this.m_type == type) {
        return;
    }
    this.m_type = type;
    this.ResetMassData();
    if (this.m_type == Box2D.Dynamics.b2BodyDef.b2_staticBody) {
        this.m_linearVelocity.SetZero();
        this.m_angularVelocity = 0.0;
    }
    this.SetAwake(true);
    this.m_force.SetZero();
    this.m_torque = 0.0;
    this.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts, function(contact){
        contact.FlagForFiltering();
    });
    for (var i = 0; i < this.m_lists.length; i++) {
        this.m_lists[i].UpdateBody(this);
    }
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2Body.prototype.GetType = function() {
    return this.m_type;
};

/**
 * @param {boolean} flag
 */
Box2D.Dynamics.b2Body.prototype.SetBullet = function(flag) {
    this.m_bullet = flag;
};

/**
 * @return {boolean}
 */
Box2D.Dynamics.b2Body.prototype.IsBullet = function() {
    return this.m_bullet;
};

/**
 * @param {boolean} flag
 */
Box2D.Dynamics.b2Body.prototype.SetSleepingAllowed = function(flag) {
    this.m_allowSleep = flag;
    if (!flag) {
        this.SetAwake(true);
    }
};

/**
 * @param {boolean} flag
 */
Box2D.Dynamics.b2Body.prototype.SetAwake = function(flag) {
    if (this.m_awake != flag) {
        this.m_awake = flag;
        this.m_sleepTime = 0;
        if (!flag) {
            this.m_linearVelocity.SetZero();
            this.m_angularVelocity = 0.0;
            this.m_force.SetZero();
            this.m_torque = 0.0;
        }
        for (var i = 0; i < this.m_lists.length; i++) {
            this.m_lists[i].UpdateBody(this);
        }
    }
};

/**
 * @return {boolean}
 */
Box2D.Dynamics.b2Body.prototype.IsAwake = function() {
    return this.m_awake;
};

/**
 * @param {boolean} fixed
 */
Box2D.Dynamics.b2Body.prototype.SetFixedRotation = function(fixed) {
    this.m_fixedRotation = fixed;
    this.ResetMassData();
};

/**
 * @return {boolean}
 */
Box2D.Dynamics.b2Body.prototype.IsFixedRotation = function() {
    return this.m_fixedRotation;
};

/**
 * @param {boolean} flag
 */
Box2D.Dynamics.b2Body.prototype.SetActive = function(flag) {
    if (flag == this.m_active) {
        return;
    }
    if (flag) {
        this.m_active = true;
        var broadPhase = this.m_world.m_contactManager.m_broadPhase;
        for (var node = this.fixtureList.GetFirstNode(); node; node = node.GetNextNode()) {
            node.fixture.CreateProxy(broadPhase, this.m_xf);
        }
    } else {
        this.m_active = false;
        var broadPhase = this.m_world.m_contactManager.m_broadPhase;
        for (var node = this.fixtureList.GetFirstNode(); node; node = node.GetNextNode()) {
            node.fixture.DestroyProxy(broadPhase);
        }
        var thisBody = this;
        this.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts, function(contact){
            thisBody.m_world.m_contactManager.Destroy(contact);
        });
    }
    for (var i = 0; i < this.m_lists.length; i++) {
        this.m_lists[i].UpdateBody(this);
    }
};

/**
 * @return {boolean}
 */
Box2D.Dynamics.b2Body.prototype.IsActive = function() {
    return this.m_active;
};

/**
 * @return {boolean}
 */
Box2D.Dynamics.b2Body.prototype.IsSleepingAllowed = function() {
    return this.m_allowSleep;
};

/**
 * @return {!Box2D.Dynamics.b2FixtureList}
 */
Box2D.Dynamics.b2Body.prototype.GetFixtureList = function() {
    return this.fixtureList;
};

/**
 * @return {Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.b2Body.prototype.GetJointList = function() {
    return this.m_jointList;
};

/**
 * @return {!Box2D.Dynamics.Controllers.b2ControllerList}
 */
Box2D.Dynamics.b2Body.prototype.GetControllerList = function() {
    return this.controllerList;
};

/**
 * @param {!Box2D.Dynamics.Controllers.b2Controller} controller
 */
Box2D.Dynamics.b2Body.prototype.AddController = function(controller) {
    this.controllerList.AddController(controller);
};

/**
 * @param {!Box2D.Dynamics.Controllers.b2Controller} controller
 */
Box2D.Dynamics.b2Body.prototype.RemoveController = function(controller) {
    this.controllerList.RemoveController(controller);
};

/**
 * @return {!Box2D.Dynamics.Contacts.b2ContactList}
 */
Box2D.Dynamics.b2Body.prototype.GetContactList = function() {
    return this.contactList;
};

/**
 * @return {!Box2D.Dynamics.b2World}
 */
Box2D.Dynamics.b2Body.prototype.GetWorld = function() {
    return this.m_world;
};

Box2D.Dynamics.b2Body.prototype.SynchronizeFixtures = function() {
    var xf1 = Box2D.Dynamics.b2Body.s_xf1;
    xf1.R.Set(this.m_sweep.a0);
    var tMat = xf1.R;
    var tVec = this.m_sweep.localCenter;
    xf1.position.x = this.m_sweep.c0.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    xf1.position.y = this.m_sweep.c0.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    for (var node = this.fixtureList.GetFirstNode(); node; node = node.GetNextNode()) {
        node.fixture.Synchronize(broadPhase, xf1, this.m_xf);
    }
};

Box2D.Dynamics.b2Body.prototype.SynchronizeTransform = function() {
    this.m_xf.R.Set(this.m_sweep.a);
    var tMat = this.m_xf.R;
    var tVec = this.m_sweep.localCenter;
    this.m_xf.position.x = this.m_sweep.c.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    this.m_xf.position.y = this.m_sweep.c.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
};

/**
 * @param {!Box2D.Dynamics.b2Body} other
 * @return {boolean}
 */
Box2D.Dynamics.b2Body.prototype.ShouldCollide = function(other) {
    if (this.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody && other.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
        return false;
    }
    for (var jn = this.m_jointList; jn; jn = jn.next) {
        if (jn.other == other) if (jn.joint.m_collideConnected == false) {
            return false;
        }
    }
    return true;
};

/**
 * @param {number} t
 */
Box2D.Dynamics.b2Body.prototype.Advance = function(t) {
    this.m_sweep.Advance(t);
    this.m_sweep.c.SetV(this.m_sweep.c0);
    this.m_sweep.a = this.m_sweep.a0;
    this.SynchronizeTransform();
};

/**
 * @type {number}
 * @private
 */
Box2D.Dynamics.b2Body.NEXT_ID = 0;

/**
 * @type {!Box2D.Common.Math.b2Transform}
 */
Box2D.Dynamics.b2Body.s_xf1 = new Box2D.Common.Math.b2Transform();
