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
 
goog.provide('Box2D.Dynamics.b2World');

goog.require('goog.structs.Queue');

goog.require('Box2D.Collision.b2AABB');
goog.require('Box2D.Collision.b2RayCastInput');
goog.require('Box2D.Collision.b2RayCastOutput');
goog.require('Box2D.Collision.Shapes.b2Shape');
goog.require('Box2D.Collision.Shapes.b2EdgeShape');
goog.require('Box2D.Common.b2Color');
goog.require('Box2D.Common.Math.b2Math');
goog.require('Box2D.Common.Math.b2Sweep');
goog.require('Box2D.Common.Math.b2Transform');
goog.require('Box2D.Common.Math.b2Vec2');
goog.require('Box2D.Dynamics.b2Body');
goog.require('Box2D.Dynamics.b2BodyDef');
goog.require('Box2D.Dynamics.b2BodyList');
goog.require('Box2D.Dynamics.b2ContactManager');
goog.require('Box2D.Dynamics.b2DebugDraw');
goog.require('Box2D.Dynamics.b2Island');
goog.require('Box2D.Dynamics.b2TimeStep');
goog.require('Box2D.Dynamics.Contacts.b2ContactList');
goog.require('Box2D.Dynamics.Contacts.b2ContactSolver');
goog.require('Box2D.Dynamics.Controllers.b2ControllerList');
goog.require('Box2D.Dynamics.Joints.b2Joint');
goog.require('Box2D.Dynamics.Joints.b2DistanceJoint');
goog.require('Box2D.Dynamics.Joints.b2MouseJoint');
goog.require('Box2D.Dynamics.Joints.b2PulleyJoint');

/**
 * @param {!Box2D.Common.Math.b2Vec2} gravity
 * @param {boolean} doSleep
 * @constructor
 */
Box2D.Dynamics.b2World = function(gravity, doSleep) {
    
    /**
     * @private
     * @type {!Box2D.Dynamics.b2ContactManager}
     */
    this.m_contactManager = new Box2D.Dynamics.b2ContactManager(this);

    /**
     * @private
     * @type {!Box2D.Dynamics.Contacts.b2ContactSolver}
     */
    this.m_contactSolver = new Box2D.Dynamics.Contacts.b2ContactSolver();

    /**
     * @private
     * @type {boolean}
     */
    this.m_isLocked = false;

    /**
     * @private
     * @type {boolean}
     */
    this.m_newFixture = false;

    /**
     * @private
     * @type {Box2D.Dynamics.b2DestructionListener}
     */
    this.m_destructionListener = null;

    /**
     * @private
     * @type {Box2D.Dynamics.b2DebugDraw}
     */
    this.m_debugDraw = null;

    /**
     * @private
     * @type {!Box2D.Dynamics.b2BodyList}
     */
    this.bodyList = new Box2D.Dynamics.b2BodyList();
    
    /**
     * @private
     * @type {!Box2D.Dynamics.Contacts.b2ContactList}
     */
     this.contactList = new Box2D.Dynamics.Contacts.b2ContactList();

    /**
     * @private
     * @type {Box2D.Dynamics.Joints.b2Joint}
     */
    this.m_jointList = null;

    /**
     * @private
     * @type {!Box2D.Dynamics.Controllers.b2ControllerList}
     */
    this.controllerList = new Box2D.Dynamics.Controllers.b2ControllerList();
    
    /**
     * @private
     * @type {number}
     */
    this.m_jointCount = 0;

    /**
     * @private
     * @type {boolean}
     */
    this.m_warmStarting = true;

    /**
     * @private
     * @type {boolean}
     */
    this.m_continuousPhysics = true;

    /**
     * @private
     * @type {boolean}
     */
    this.m_allowSleep = doSleep;

    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.m_gravity = gravity;

    /**
     * @private
     * @type {number}
     */
    this.m_inv_dt0 = 0.0;

    /**
     * @private
     * @type {!Box2D.Dynamics.b2Body}
     */
    this.m_groundBody = this.CreateBody(new Box2D.Dynamics.b2BodyDef());
    
    /**
     * @private
     * @type {!Box2D.Dynamics.b2TimeStep}
     * @const
     */
    this.mainTimeStep = new Box2D.Dynamics.b2TimeStep(0, 0, 0, 0, this.m_warmStarting);
     
    /**
     * @private
     * @type {!Box2D.Dynamics.b2TimeStep}
     * @const
     */
    this.islandTimeStep = new Box2D.Dynamics.b2TimeStep(0, 0, 0, 0, this.m_warmStarting);
    
    /**
     * @private
     * @type {!Box2D.Dynamics.b2Island}
     * @const
     */
     this.island = new Box2D.Dynamics.b2Island(this.m_contactManager.m_contactListener, this.m_contactSolver);
};

/**
 * @const
 * @type {number}
 */
Box2D.Dynamics.b2World.MAX_TOI = 1.0 - 100.0 * Number.MIN_VALUE;

/**
 * @param {!Box2D.Dynamics.b2DestructionListener} listener
 */
Box2D.Dynamics.b2World.prototype.SetDestructionListener = function(listener) {
    this.m_destructionListener = listener;
};

/**
 * @param {!Box2D.Dynamics.iContactFilter} filter
 */
Box2D.Dynamics.b2World.prototype.SetContactFilter = function(filter) {
    this.m_contactManager.m_contactFilter = filter;
};

/**
 * @param {!Box2D.Dynamics.iContactListener} listener
 */
Box2D.Dynamics.b2World.prototype.SetContactListener = function(listener) {
    this.m_contactManager.m_contactListener = listener;
};

/**
 * @param {!Box2D.Dynamics.b2DebugDraw} debugDraw
 */
Box2D.Dynamics.b2World.prototype.SetDebugDraw = function(debugDraw) {
    this.m_debugDraw = debugDraw;
};

/**
 * @param {!Box2D.Collision.b2DynamicTreeBroadPhase} broadPhase
 */
Box2D.Dynamics.b2World.prototype.SetBroadPhase = function(broadPhase) {
    var oldBroadPhase = this.m_contactManager.m_broadPhase;
    this.m_contactManager.m_broadPhase = broadPhase;
    for (var node = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); node; node = node.GetNextNode()) {
        for (var fixtureNode = node.body.GetFixtureList().GetFirstNode(); fixtureNode; fixtureNode = fixtureNode.GetNextNode()) {
            var f = fixtureNode.fixture;
            f.m_proxy = broadPhase.CreateProxy(oldBroadPhase.GetFatAABB(f.m_proxy), f);
        }
    }
};

/**
 * @param {!Box2D.Dynamics.b2BodyDef} def
 * @return {!Box2D.Dynamics.b2Body}
 */
Box2D.Dynamics.b2World.prototype.CreateBody = function(def) {
    Box2D.Common.b2Settings.b2Assert(!this.IsLocked());
    var b = new Box2D.Dynamics.b2Body(def, this);
    this.bodyList.AddBody(b);
    return b;
};

/**
 * @param {!Box2D.Dynamics.b2Body} b
 */
Box2D.Dynamics.b2World.prototype.DestroyBody = function(b) {
    Box2D.Common.b2Settings.b2Assert(!this.IsLocked());
    var jn = b.m_jointList;
    while (jn) {
        var jn0 = jn;
        jn = jn.next;
        if (this.m_destructionListener) {
            this.m_destructionListener.SayGoodbyeJoint(jn0.joint);
        }
        this.DestroyJoint(jn0.joint);
    }
    for (var node = b.GetControllerList().GetFirstNode(); node; node = node.GetNextNode()) {
        node.controller.RemoveBody(b);
    }
    var thisWorld = this;
    b.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts, function(contact){
        thisWorld.m_contactManager.Destroy(contact);
    });
    for (var fixtureNode = b.GetFixtureList().GetFirstNode(); fixtureNode; fixtureNode = fixtureNode.GetNextNode()) {
        // Why doesn't this happen in body.DestroyFixture?
        if (this.m_destructionListener) {
            this.m_destructionListener.SayGoodbyeFixture(fixtureNode.fixture);
        }
        b.DestroyFixture(fixtureNode.fixture);
    }
    b.Destroy();
    this.bodyList.RemoveBody(b);
};

/**
 * @param {!Box2D.Dynamics.Joints.b2JointDef} def
 * @return {!Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.b2World.prototype.CreateJoint = function(def) {
    var j = Box2D.Dynamics.Joints.b2Joint.Create(def);
    j.m_prev = null;
    j.m_next = this.m_jointList;
    if (this.m_jointList) {
        this.m_jointList.m_prev = j;
    }
    this.m_jointList = j;
    this.m_jointCount++;
    j.m_edgeA.joint = j;
    j.m_edgeA.other = j.m_bodyB;
    j.m_edgeA.prev = null;
    j.m_edgeA.next = j.m_bodyA.m_jointList;
    if (j.m_bodyA.m_jointList) {
        j.m_bodyA.m_jointList.prev = j.m_edgeA;
    }
    j.m_bodyA.m_jointList = j.m_edgeA;
    j.m_edgeB.joint = j;
    j.m_edgeB.other = j.m_bodyA;
    j.m_edgeB.prev = null;
    j.m_edgeB.next = j.m_bodyB.m_jointList;
    if (j.m_bodyB.m_jointList) {
        j.m_bodyB.m_jointList.prev = j.m_edgeB;
    }
    j.m_bodyB.m_jointList = j.m_edgeB;
    var bodyA = def.bodyA;
    var bodyB = def.bodyB;
    if (!def.collideConnected) {
        bodyB.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts, function(contact){
            if (contact.GetOther(bodyB) == bodyA) {
                contact.FlagForFiltering();
            }
        });
    }
    return j;
};

/**
 * @param {!Box2D.Dynamics.Joints.b2Joint} j
 */
Box2D.Dynamics.b2World.prototype.DestroyJoint = function(j) {
    var collideConnected = j.m_collideConnected;
    if (j.m_prev) {
        j.m_prev.m_next = j.m_next;
    }
    if (j.m_next) {
        j.m_next.m_prev = j.m_prev;
    }
    if (j == this.m_jointList) {
        this.m_jointList = j.m_next;
    }
    
    j.m_next = null;
    j.m_prev = null;
    
    var bodyA = j.m_bodyA;
    var bodyB = j.m_bodyB;
    bodyA.SetAwake(true);
    bodyB.SetAwake(true);
    if (j.m_edgeA.prev) {
        j.m_edgeA.prev.next = j.m_edgeA.next;
    }
    if (j.m_edgeA.next) {
        j.m_edgeA.next.prev = j.m_edgeA.prev;
    }
    if (j.m_edgeA == bodyA.m_jointList) {
        bodyA.m_jointList = j.m_edgeA.next;
    }
    j.m_edgeA.prev = null;
    j.m_edgeA.next = null;
    if (j.m_edgeB.prev) {
        j.m_edgeB.prev.next = j.m_edgeB.next;
    }
    if (j.m_edgeB.next) {
        j.m_edgeB.next.prev = j.m_edgeB.prev;
    }
    if (j.m_edgeB == bodyB.m_jointList) {
        bodyB.m_jointList = j.m_edgeB.next;
    }
    j.m_edgeB.prev = null;
    j.m_edgeB.next = null;
    this.m_jointCount--;
    if (!collideConnected) {
        bodyB.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts, function(contact){
            if (contact.GetOther(bodyB) == bodyA) {
                contact.FlagForFiltering();
            }
        });
    }
};

/**
 * @return {!Box2D.Dynamics.Controllers.b2ControllerList}
 */
Box2D.Dynamics.b2World.prototype.GetControllerList = function() {
    return this.controllerList;
};

/**
 * @param {!Box2D.Dynamics.Controllers.b2Controller} c
 * @return {!Box2D.Dynamics.Controllers.b2Controller}
 */
Box2D.Dynamics.b2World.prototype.AddController = function(c) {
    if (c.m_world !== null && c.m_world != this) {
        throw new Error("Controller can only be a member of one world");
    }
    this.controllerList.AddController(c);
    c.m_world = this;
    return c;
};

/**
 * @param {!Box2D.Dynamics.Controllers.b2Controller} c
 */
Box2D.Dynamics.b2World.prototype.RemoveController = function(c) {
    this.controllerList.RemoveController(c);
    c.m_world = null;
    c.Clear();
};

/**
 * @param {!Box2D.Dynamics.Controllers.b2Controller} controller
 * @return {!Box2D.Dynamics.Controllers.b2Controller}
 */
Box2D.Dynamics.b2World.prototype.CreateController = function(controller) {
    return this.AddController(controller);
};

/**
 * @param {!Box2D.Dynamics.Controllers.b2Controller} controller
 */
Box2D.Dynamics.b2World.prototype.DestroyController = function(controller) {
    this.RemoveController(controller);
};

/**
 * @param {boolean} flag
 */
Box2D.Dynamics.b2World.prototype.SetWarmStarting = function(flag) {
    this.m_warmStarting = flag;
};

/**
 * @param {boolean} flag
 */
Box2D.Dynamics.b2World.prototype.SetContinuousPhysics = function(flag) {
    this.m_continuousPhysics = flag;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2World.prototype.GetBodyCount = function() {
    return this.bodyList.GetBodyCount();
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2World.prototype.GetJointCount = function() {
    return this.m_jointCount;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2World.prototype.GetContactCount = function() {
    return this.contactList.GetContactCount();
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} gravity
 */
Box2D.Dynamics.b2World.prototype.SetGravity = function(gravity) {
    this.m_gravity = gravity;
};

/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Dynamics.b2World.prototype.GetGravity = function() {
    return this.m_gravity;
};

/**
 * @return {!Box2D.Dynamics.b2Body}
 */
Box2D.Dynamics.b2World.prototype.GetGroundBody = function() {
    return this.m_groundBody;
};

/**
 * @param {number} dt
 * @param {number} velocityIterations
 * @param {number} positionIterations
 */
Box2D.Dynamics.b2World.prototype.Step = function(dt, velocityIterations, positionIterations) {
    if (this.m_newFixture) {
        this.m_contactManager.FindNewContacts();
        this.m_newFixture = false;
    }
    this.m_isLocked = true;
    this.mainTimeStep.Reset(dt, this.m_inv_dt0 * dt /* dtRatio */, velocityIterations, positionIterations, this.m_warmStarting);
    this.m_contactManager.Collide();
    if (this.mainTimeStep.dt > 0.0) {
        this.Solve(this.mainTimeStep);
        if (this.m_continuousPhysics) {
            this.SolveTOI(this.mainTimeStep);
        }
        this.m_inv_dt0 = this.mainTimeStep.inv_dt;
    }
    this.m_isLocked = false;
};

Box2D.Dynamics.b2World.prototype.ClearForces = function() {
    for (var node = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.dynamicBodies); node; node = node.GetNextNode()) {
        node.body.m_force.SetZero();
        node.body.m_torque = 0.0;
    }
};

Box2D.Dynamics.b2World.prototype.DrawDebugData = function() {
    if (this.m_debugDraw === null) {
        return;
    }
    this.m_debugDraw.Clear();
    var flags = this.m_debugDraw.GetFlags();
    if (flags & Box2D.Dynamics.b2DebugDraw.e_shapeBit) {
        var color_inactive = Box2D.Dynamics.b2World.s_color_inactive;
        var color_static = Box2D.Dynamics.b2World.s_color_static;
        var color_kinematic = Box2D.Dynamics.b2World.s_color_kinematic;
        var color_dynamic_sleeping = Box2D.Dynamics.b2World.s_color_dynamic_sleeping;
        var color_dynamic_awake = Box2D.Dynamics.b2World.s_color_dynamic_awake;
        for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
            var b = bodyNode.body;
            for (var fixtureNode = b.GetFixtureList().GetFirstNode(); fixtureNode; fixtureNode = fixtureNode.GetNextNode()) {
                var f = fixtureNode.fixture;
                var s = f.GetShape();
                if (!b.IsActive()) {
                    this.DrawShape(s, b.m_xf, color_inactive);
                } else if (b.GetType() == Box2D.Dynamics.b2BodyDef.b2_staticBody) {
                    this.DrawShape(s, b.m_xf, color_static);
                } else if (b.GetType() == Box2D.Dynamics.b2BodyDef.b2_kinematicBody) {
                    this.DrawShape(s, b.m_xf, color_kinematic);
                } else if (!b.IsAwake()) {
                    this.DrawShape(s, b.m_xf, color_dynamic_sleeping);
                } else {
                    this.DrawShape(s, b.m_xf, color_dynamic_awake);
                }
            }
        }
    }
    if (flags & Box2D.Dynamics.b2DebugDraw.e_jointBit) {
        for (var j = this.m_jointList; j; j = j.m_next) {
            this.DrawJoint(j);
        }
    }
    if (flags & Box2D.Dynamics.b2DebugDraw.e_controllerBit) {
        for (var controllerNode = this.controllerList.GetFirstNode(); controllerNode; controllerNode = controllerNode.GetNextNode()) {
            controllerNode.controller.Draw(this.m_debugDraw);
        }
    }
    if (flags & Box2D.Dynamics.b2DebugDraw.e_pairBit) {
        var pairColor = Box2D.Dynamics.b2World.s_pairColor;
        var thisWorld = this;
        this.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts,function(contact){
            var fixtureA = contact.GetFixtureA();
            var fixtureB = contact.GetFixtureB();
            var cA = fixtureA.GetAABB().GetCenter();
            var cB = fixtureB.GetAABB().GetCenter();
            thisWorld.m_debugDraw.DrawSegment(cA, cB, pairColor);
            Box2D.Common.Math.b2Vec2.Free(cA);
            Box2D.Common.Math.b2Vec2.Free(cB);
        });
    }
    if (flags & Box2D.Dynamics.b2DebugDraw.e_aabbBit) {
        var aabbColor = Box2D.Dynamics.b2World.s_aabbColor;
        for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.activeBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
            var b = bodyNode.body;
            for (var fixtureNode = b.GetFixtureList().GetFirstNode(); fixtureNode; fixtureNode = fixtureNode.GetNextNode()) {
                var f = fixtureNode.fixture;
                var aabb = this.m_contactManager.m_broadPhase.GetFatAABB(f.m_proxy);
                var vs = [Box2D.Common.Math.b2Vec2.Get(aabb.lowerBound.x, aabb.lowerBound.y),
                          Box2D.Common.Math.b2Vec2.Get(aabb.upperBound.x, aabb.lowerBound.y),
                          Box2D.Common.Math.b2Vec2.Get(aabb.upperBound.x, aabb.upperBound.y),
                          Box2D.Common.Math.b2Vec2.Get(aabb.lowerBound.x, aabb.upperBound.y)];
                this.m_debugDraw.DrawPolygon(vs, 4, aabbColor);
                Box2D.Common.Math.b2Vec2.Free(vs[0]);
                Box2D.Common.Math.b2Vec2.Free(vs[1]);
                Box2D.Common.Math.b2Vec2.Free(vs[2]);
                Box2D.Common.Math.b2Vec2.Free(vs[3]);
            }
        }
    }
    if (flags & Box2D.Dynamics.b2DebugDraw.e_centerOfMassBit) {
        for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
            var b = bodyNode.body;
            Box2D.Dynamics.b2World.s_xf.R = b.m_xf.R;
            Box2D.Dynamics.b2World.s_xf.position = b.GetWorldCenter();
            this.m_debugDraw.DrawTransform(Box2D.Dynamics.b2World.s_xf);
        }
    }
};

/**
 * @param {function(!Box2D.Dynamics.b2Fixture):boolean} callback
 * @param {!Box2D.Collision.b2AABB} aabb
 */
Box2D.Dynamics.b2World.prototype.QueryAABB = function(callback, aabb) {
    this.m_contactManager.m_broadPhase.Query(callback, aabb);
};

/**
 * @param {function(!Box2D.Dynamics.b2Fixture): boolean} callback
 * @param {!Box2D.Common.Math.b2Vec2} p
 */
Box2D.Dynamics.b2World.prototype.QueryPoint = function(callback, p) {
    /** @type {function(!Box2D.Dynamics.b2Fixture): boolean} */
    var WorldQueryWrapper = function(fixture) {
        if (fixture.TestPoint(p)) {
            return callback(fixture);
        } else {
            return true;
        }
    };
    var aabb = Box2D.Collision.b2AABB.Get();
    aabb.lowerBound.Set(p.x - Box2D.Common.b2Settings.b2_linearSlop, p.y - Box2D.Common.b2Settings.b2_linearSlop);
    aabb.upperBound.Set(p.x + Box2D.Common.b2Settings.b2_linearSlop, p.y + Box2D.Common.b2Settings.b2_linearSlop);
    this.m_contactManager.m_broadPhase.Query(WorldQueryWrapper, aabb);
    Box2D.Collision.b2AABB.Free(aabb);
};

/**
 * @param {function(!Box2D.Dynamics.b2Fixture, !Box2D.Common.Math.b2Vec2, !Box2D.Common.Math.b2Vec2, number): number} callback
 * @param {!Box2D.Common.Math.b2Vec2} point1
 * @param {!Box2D.Common.Math.b2Vec2} point2
 */
Box2D.Dynamics.b2World.prototype.RayCast = function(callback, point1, point2) {
    var broadPhase = this.m_contactManager.m_broadPhase;
    var output = new Box2D.Collision.b2RayCastOutput();

    /**
     * @param {!Box2D.Collision.b2RayCastInput} input
     * @param {!Box2D.Dynamics.b2Fixture} fixture
     */
    var RayCastWrapper = function(input, fixture) {
            var hit = fixture.RayCast(output, input);
            if (hit) {
                var flipFrac = 1 - output.fraction;
                var point = Box2D.Common.Math.b2Vec2.Get(flipFrac * point1.x + output.fraction * point2.x, flipFrac * point1.y + output.fraction * point2.y);
                var retVal = callback(fixture, point, output.normal, output.fraction);
                Box2D.Common.Math.b2Vec2.Free(point);
                return retVal;
            } else {
                return input.maxFraction;
            }
        };
    var input = new Box2D.Collision.b2RayCastInput(point1, point2, 1 /* maxFraction */ );
    broadPhase.RayCast(RayCastWrapper, input);
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} point1
 * @param {!Box2D.Common.Math.b2Vec2} point2
 * @return {Box2D.Dynamics.b2Fixture}
 */
Box2D.Dynamics.b2World.prototype.RayCastOne = function(point1, point2) {
    var result = null;
    /**
     * @param {!Box2D.Dynamics.b2Fixture} fixture
     * @param {!Box2D.Common.Math.b2Vec2} point
     * @param {!Box2D.Common.Math.b2Vec2} normal
     * @param {number} fraction
     * @return {number}
     */
    var RayCastOneWrapper = function(fixture, point, normal, fraction) {
        result = fixture;
        return fraction;
    };
    this.RayCast(RayCastOneWrapper, point1, point2);
    return result;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} point1
 * @param {!Box2D.Common.Math.b2Vec2} point2
 * @return {Array.<Box2D.Dynamics.b2Fixture>}
 */
Box2D.Dynamics.b2World.prototype.RayCastAll = function(point1, point2) {
    var result = [];

    /**
     * @param {!Box2D.Dynamics.b2Fixture} fixture
     * @param {!Box2D.Common.Math.b2Vec2} point
     * @param {!Box2D.Common.Math.b2Vec2} normal
     * @param {number} fraction
     * @return {number}
     */
    var RayCastAllWrapper = function(fixture, point, normal, fraction) {
        result.push(fixture);
        return 1;
    };
    this.RayCast(RayCastAllWrapper, point1, point2);
    return result;
};

/**
 * @return {!Box2D.Dynamics.b2BodyList}
 */
Box2D.Dynamics.b2World.prototype.GetBodyList = function() {
    return this.bodyList;
};

/**
 * @return {Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.b2World.prototype.GetJointList = function() {
    return this.m_jointList;
};

/**
 * @return {!Box2D.Dynamics.Contacts.b2ContactList}
 */
Box2D.Dynamics.b2World.prototype.GetContactList = function() {
    return this.contactList;
};

/**
 * @return {boolean}
 */
Box2D.Dynamics.b2World.prototype.IsLocked = function() {
    return this.m_isLocked;
};

/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 */
Box2D.Dynamics.b2World.prototype.Solve = function(step) {
    for (var controllerNode = this.controllerList.GetFirstNode(); controllerNode; controllerNode = controllerNode.GetNextNode()) {
        controllerNode.controller.Step(step);
    }
    
    var m_island = this.island;
    m_island.Reset(this.m_contactManager.m_contactListener, this.m_contactSolver);
    
    for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
        bodyNode.body.m_islandFlag = false;
    }
    this.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts, function(contact){
        contact.m_islandFlag = false;
    });
    for (var j = this.m_jointList; j; j = j.m_next) {
        j.m_islandFlag = false;
    }
    
    for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
        var seed = bodyNode.body;
        if (seed.m_islandFlag) {
            continue;
        }
        m_island.Clear();
        var stack = [];
        stack.push(seed);
        seed.m_islandFlag = true;
        while (stack.length > 0) {
            var b = stack.pop();
            m_island.AddBody(b);
            if (!b.IsAwake()) {
                b.SetAwake(true);
            }
            if (b.GetType() == Box2D.Dynamics.b2BodyDef.b2_staticBody) {
                continue;
            }
            b.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts, function(contact){
                if (!contact.m_islandFlag) {
                    m_island.AddContact(contact);
                    contact.m_islandFlag = true;
                    var other = contact.GetOther(b);
                    if (!other.m_islandFlag) {
                        stack.push(other);
                        other.m_islandFlag = true;
                    }
                }
            });
            for (var jn = b.m_jointList; jn; jn = jn.next) {
                if (jn.joint.m_islandFlag || !jn.other.IsActive()) {
                    continue;
                }
                m_island.AddJoint(jn.joint);
                jn.joint.m_islandFlag = true;
                if (jn.other.m_islandFlag) {
                    continue;
                }
                stack.push(jn.other);
                jn.other.m_islandFlag = true;
            }
        }
        m_island.Solve(step, this.m_gravity, this.m_allowSleep);
    }
    for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
        bodyNode.body.SynchronizeFixtures();
    }
    this.m_contactManager.FindNewContacts();
};

/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 */
Box2D.Dynamics.b2World.prototype.SolveTOI = function(step) {
    var m_island = this.island;
    m_island.Reset(this.m_contactManager.m_contactListener, this.m_contactSolver);
    
    for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
        var b = bodyNode.body;
        b.m_islandFlag = false;
        b.m_sweep.t0 = 0.0;
    }
    this.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts, function(contact){
        contact.m_islandFlag = false;
        contact.m_toi = null;
    });
    for (var j = this.m_jointList; j; j = j.m_next) {
        j.m_islandFlag = false;
    }
    while (true) {
        var toi2 = this._SolveTOI2(step);
        var minContact = toi2.minContact;
        var minTOI = toi2.minTOI;
        if (minContact === null || Box2D.Dynamics.b2World.MAX_TOI < minTOI) {
            break;
        }
        var fixtureABody = minContact.m_fixtureA.GetBody();
        var fixtureBBody =  minContact.m_fixtureB.GetBody();
        Box2D.Dynamics.b2World.s_backupA.Set(fixtureABody.m_sweep);
        Box2D.Dynamics.b2World.s_backupB.Set(fixtureBBody.m_sweep);
        fixtureABody.Advance(minTOI);
        fixtureBBody.Advance(minTOI);
        minContact.Update(this.m_contactManager.m_contactListener);
        minContact.m_toi = null;
        if (minContact.IsSensor() || !minContact.IsEnabled()) {
            fixtureABody.m_sweep.Set(Box2D.Dynamics.b2World.s_backupA);
            fixtureBBody.m_sweep.Set(Box2D.Dynamics.b2World.s_backupB);
            fixtureABody.SynchronizeTransform();
            fixtureBBody.SynchronizeTransform();
            continue;
        }
        if (!minContact.IsTouching()) {
            continue;
        }
        var seed = fixtureABody;
        if (seed.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
            seed = fixtureBBody;
        }
        m_island.Clear();
        var queue = new goog.structs.Queue();
        queue.enqueue(seed);
        seed.m_islandFlag = true;
        while (queue.size > 0) {
            
            var b = /** @type {!Box2D.Dynamics.b2Body} */(queue.dequeue());
            m_island.AddBody(b);
            if (!b.IsAwake()) {
                b.SetAwake(true);
            }
            if (b.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
                continue;
            }
            b.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts, function(contact){
                if (m_island.m_contacts.length == Box2D.Common.b2Settings.b2_maxTOIContactsPerIsland) {
                    return true;
                }
                if (contact.m_islandFlag) {
                    return;
                }
                m_island.AddContact(contact);
                contact.m_islandFlag = true;
                
                var other = contact.GetOther(b);
                if (other.m_islandFlag) {
                    return;
                }
                if (other.GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody) {
                    other.Advance(minTOI);
                    other.SetAwake(true);
                    queue.enqueue(other);
                }
                other.m_islandFlag = true;
            });
            for (var jEdge = b.m_jointList; jEdge; jEdge = jEdge.next) {
                if (m_island.m_jointCount == Box2D.Common.b2Settings.b2_maxTOIJointsPerIsland) {
                    continue;
                }
                if (jEdge.joint.m_islandFlag || !jEdge.other.IsActive()) {
                    continue;
                }
                m_island.AddJoint(jEdge.joint);
                jEdge.joint.m_islandFlag = true;
                if (jEdge.other.m_islandFlag) {
                    continue;
                }
                if (jEdge.other.GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody) {
                    jEdge.other.Advance(minTOI);
                    jEdge.other.SetAwake(true);
                    queue.enqueue(jEdge.other);
                }
                jEdge.other.m_islandFlag = true;
            }
        }
        this.islandTimeStep.Reset((1.0 - minTOI) * step.dt /* dt */, 0 /* dtRatio */, step.velocityIterations, step.positionIterations, false /* warmStarting */);
        m_island.SolveTOI(this.islandTimeStep);

        for (var i = 0; i < m_island.m_bodies.length; i++) {
            m_island.m_bodies[i].m_islandFlag = false;
            if (!m_island.m_bodies[i].IsAwake() || m_island.m_bodies[i].GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
                continue;
            }
            m_island.m_bodies[i].SynchronizeFixtures();
            m_island.m_bodies[i].contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts, function(contact){
                contact.m_toi = null;
            });
        }
        for (var i = 0; i < m_island.m_contactCount; i++) {
            m_island.m_contacts[i].m_islandFlag = false;
            m_island.m_contacts[i].m_toi = null;
        }
        for (var i = 0; i < m_island.m_jointCount; i++) {
            m_island.m_joints[i].m_islandFlag = false;
        }
        this.m_contactManager.FindNewContacts();
    }
};

/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @return {{minContact: Box2D.Dynamics.Contacts.b2Contact, minTOI: number}}
 */
Box2D.Dynamics.b2World.prototype._SolveTOI2 = function(step) {
    var minContact = null;
    var minTOI = 1.0;
    var thisWorld = this;
    this.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledContinuousContacts, function(c){
        if (thisWorld._SolveTOI2SkipContact(step, c)) {
            return;
        }
        var toi = 1.0;
        if (c.m_toi != null) {
            toi = c.m_toi;
        } else if (c.IsTouching()) {
            toi = 1;
            c.m_toi = toi;
        } else {
            var fixtureABody = c.m_fixtureA.GetBody();
            var fixtureBBody = c.m_fixtureB.GetBody();
            var t0 = fixtureABody.m_sweep.t0;
            if (fixtureABody.m_sweep.t0 < fixtureBBody.m_sweep.t0) {
                t0 = fixtureBBody.m_sweep.t0;
                fixtureABody.m_sweep.Advance(t0);
            } else if (fixtureBBody.m_sweep.t0 < fixtureABody.m_sweep.t0) {
                t0 = fixtureABody.m_sweep.t0;
                fixtureBBody.m_sweep.Advance(t0);
            }
            toi = c.ComputeTOI(fixtureABody.m_sweep, fixtureBBody.m_sweep);
            Box2D.Common.b2Settings.b2Assert(0.0 <= toi && toi <= 1.0);
            if (toi > 0.0 && toi < 1.0) {
                toi = (1.0 - toi) * t0 + toi;
            }
            c.m_toi = toi;
        }
        if (Number.MIN_VALUE < toi && toi < minTOI) {
            minContact = c;
            minTOI = toi;
        }
    });
    return {
        minContact: minContact,
        minTOI: minTOI
    };
};

/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @param {!Box2D.Dynamics.Contacts.b2Contact} c
 * @return {boolean}
 */
Box2D.Dynamics.b2World.prototype._SolveTOI2SkipContact = function(step, c) {
    var fixtureABody = c.m_fixtureA.GetBody();
    var fixtureBBody = c.m_fixtureB.GetBody();
    if ((fixtureABody.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || !fixtureABody.IsAwake()) && (fixtureBBody.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || !fixtureBBody.IsAwake())) {
        return true;
    }
    return false;
};

/**
 * @param {!Box2D.Dynamics.Joints.b2Joint} joint
 */
Box2D.Dynamics.b2World.prototype.DrawJoint = function(joint) {
    if (joint instanceof Box2D.Dynamics.Joints.b2DistanceJoint || joint instanceof Box2D.Dynamics.Joints.b2MouseJoint) {
        var anchorA = joint.GetAnchorA();
        var anchorB = joint.GetAnchorB();
        this.m_debugDraw.DrawSegment(anchorA, anchorB, Box2D.Dynamics.b2World.s_jointColor);
        Box2D.Common.Math.b2Vec2.Free(anchorA);
        Box2D.Common.Math.b2Vec2.Free(anchorB);
    } else if (joint instanceof Box2D.Dynamics.Joints.b2PulleyJoint) {
        var anchorA = joint.GetAnchorA();
        var anchorB = joint.GetAnchorB();
        var groundA = joint.GetGroundAnchorA();
        var groundB = joint.GetGroundAnchorB();
        this.m_debugDraw.DrawSegment(groundA, anchorA, Box2D.Dynamics.b2World.s_jointColor);
        this.m_debugDraw.DrawSegment(groundB, anchorB, Box2D.Dynamics.b2World.s_jointColor);
        this.m_debugDraw.DrawSegment(groundA, groundB, Box2D.Dynamics.b2World.s_jointColor);
        Box2D.Common.Math.b2Vec2.Free(anchorA);
        Box2D.Common.Math.b2Vec2.Free(anchorB);
        Box2D.Common.Math.b2Vec2.Free(groundA);
        Box2D.Common.Math.b2Vec2.Free(groundB);
    } else {
        var anchorA = joint.GetAnchorA();
        var anchorB = joint.GetAnchorB();
        if (joint.GetBodyA() != this.m_groundBody) {
            this.m_debugDraw.DrawSegment(joint.GetBodyA().m_xf.position, anchorA, Box2D.Dynamics.b2World.s_jointColor);
        }
        this.m_debugDraw.DrawSegment(anchorA, anchorB, Box2D.Dynamics.b2World.s_jointColor);
        if (joint.GetBodyB() != this.m_groundBody) {
            this.m_debugDraw.DrawSegment(joint.GetBodyB().m_xf.position, anchorB, Box2D.Dynamics.b2World.s_jointColor);
        }
        Box2D.Common.Math.b2Vec2.Free(anchorA);
        Box2D.Common.Math.b2Vec2.Free(anchorB);
    }
};

/**
 * @param {!Box2D.Collision.Shapes.b2Shape} shape
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {!Box2D.Common.b2Color} color
 */
Box2D.Dynamics.b2World.prototype.DrawShape = function(shape, xf, color) {
    if (shape instanceof Box2D.Collision.Shapes.b2CircleShape) {
        var circle = shape;
        var center = Box2D.Common.Math.b2Math.MulX(xf, circle.m_p);
        var radius = circle.m_radius;
        var axis = xf.R.col1;
        this.m_debugDraw.DrawSolidCircle(center, radius, axis, color);
        Box2D.Common.Math.b2Vec2.Free(center);
    } else if (shape instanceof Box2D.Collision.Shapes.b2PolygonShape) {
        var i = 0;
        var poly = shape;
        var vertexCount = poly.GetVertexCount();
        var localVertices = poly.GetVertices();
        var vertices = [];
        for (i = 0; i < vertexCount; i++) {
            vertices[i] = Box2D.Common.Math.b2Math.MulX(xf, localVertices[i]);
        }
        this.m_debugDraw.DrawSolidPolygon(vertices, vertexCount, color);
        for (i = 0; i < vertexCount; i++) {
            Box2D.Common.Math.b2Vec2.Free(vertices[i]);
        }
    } else if (shape instanceof Box2D.Collision.Shapes.b2EdgeShape) {
        var edge = shape;
        var v1 = Box2D.Common.Math.b2Math.MulX(xf, edge.GetVertex1());
        var v2 = Box2D.Common.Math.b2Math.MulX(xf, edge.GetVertex2())
        this.m_debugDraw.DrawSegment(v1, v2, color);
        Box2D.Common.Math.b2Vec2.Free(v1);
        Box2D.Common.Math.b2Vec2.Free(v2);
    }
};

/** @type {!Box2D.Common.Math.b2Transform} */
Box2D.Dynamics.b2World.s_xf = new Box2D.Common.Math.b2Transform();

/** @type {!Box2D.Common.Math.b2Sweep} */
Box2D.Dynamics.b2World.s_backupA = new Box2D.Common.Math.b2Sweep();

/** @type {!Box2D.Common.Math.b2Sweep} */
Box2D.Dynamics.b2World.s_backupB = new Box2D.Common.Math.b2Sweep();

/**
 * @type {!Box2D.Common.b2Color}
 * @const
 */
Box2D.Dynamics.b2World.s_jointColor = new Box2D.Common.b2Color(0.5, 0.8, 0.8);

/**
 * @type {!Box2D.Common.b2Color}
 * @const
 */
Box2D.Dynamics.b2World.s_color_inactive = new Box2D.Common.b2Color(0.5, 0.5, 0.3);

/**
 * @type {!Box2D.Common.b2Color}
 * @const
 */
Box2D.Dynamics.b2World.s_color_static = new Box2D.Common.b2Color(0.5, 0.9, 0.5);

/**
 * @type {!Box2D.Common.b2Color}
 * @const
 */
Box2D.Dynamics.b2World.s_color_kinematic = new Box2D.Common.b2Color(0.5, 0.5, 0.9);

/**
 * @type {!Box2D.Common.b2Color}
 * @const
 */
Box2D.Dynamics.b2World.s_color_dynamic_sleeping = new Box2D.Common.b2Color(0.6, 0.6, 0.6);

/**
 * @type {!Box2D.Common.b2Color}
 * @const
 */
Box2D.Dynamics.b2World.s_color_dynamic_awake = new Box2D.Common.b2Color(0.9, 0.7, 0.7);

/**
 * @type {!Box2D.Common.b2Color}
 * @const
 */
Box2D.Dynamics.b2World.s_pairColor = new Box2D.Common.b2Color(0.3, 0.9, 0.9);

/**
 * @type {!Box2D.Common.b2Color}
 * @const
 */
Box2D.Dynamics.b2World.s_aabbColor = new Box2D.Common.b2Color(0.0, 0.0, 0.8);
