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
 
goog.provide('Box2D.Dynamics.b2Island');

goog.require('Box2D.Dynamics.b2ContactImpulse');
goog.require('Box2D.Dynamics.b2BodyDef');
goog.require('Box2D.Common.Math.b2Math');
goog.require('Box2D.Common.b2Settings');
goog.require('UsageTracker');

/**
 * @param {!Box2D.Dynamics.iContactListener} listener
 * @param {!Box2D.Dynamics.Contacts.b2ContactSolver} contactSolver
 * @constructor
 */
Box2D.Dynamics.b2Island = function(listener, contactSolver) {
    UsageTracker.get('Box2D.Dynamics.b2Island').trackCreate();
    
    /**
     * @private
     * @type {!Box2D.Dynamics.iContactListener}
     */
    this.m_listener = listener;
    
    /**
     * @private
     * @type {!Box2D.Dynamics.Contacts.b2ContactSolver}
     */
    this.m_contactSolver = contactSolver;
    
    /**
     * @private
     * @type {Array.<!Box2D.Dynamics.b2Body>}
     */
    this.m_bodies = [];
    
    /**
     * @private
     * @type {Array.<!Box2D.Dynamics.b2Body>}
     */
    this.m_dynamicBodies = [];
    
    /**
     * @private
     * @type {Array.<!Box2D.Dynamics.b2Body>}
     */
    this.m_nonStaticBodies = [];
    
    /**
     * @private
     * @type {Array.<!Box2D.Dynamics.Contacts.b2Contact>}
     */
    this.m_contacts = [];
    
    /**
     * @private
     * @type {Array.<!Box2D.Dynamics.Joints.b2Joint>}
     */
    this.m_joints = [];
    
    /**
     * @private
     * @type {!Box2D.Dynamics.b2ContactImpulse}
     * @const
     */
    this.impulse = new Box2D.Dynamics.b2ContactImpulse();
};

/**
 * @param {!Box2D.Dynamics.iContactListener} listener
 * @param {!Box2D.Dynamics.Contacts.b2ContactSolver} contactSolver
 */
Box2D.Dynamics.b2Island.prototype.Reset = function(listener, contactSolver) {
    this.m_listener = listener;
    this.m_contactSolver = contactSolver;
};

Box2D.Dynamics.b2Island.prototype.Clear = function() {
    this.m_bodies = [];
    this.m_dynamicBodies = [];
    this.m_nonStaticBodies = [];
    this.m_contacts = [];
    this.m_joints = [];
};

/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @param {!Box2D.Common.Math.b2Vec2} gravity
 * @param {boolean} allowSleep
 */
Box2D.Dynamics.b2Island.prototype.Solve = function(step, gravity, allowSleep) {
    this._InitializeVelocities(step, gravity);
    this.m_contactSolver.Initialize(step, this.m_contacts, this.m_contacts.length);
    this._SolveVelocityConstraints(step);
    this._SolveBodies(step);
    this._SolvePositionConstraints(step);
    this.Report(this.m_contactSolver.m_constraints);
    if (allowSleep) {
        this._SleepIfTired(step);
    }
};

/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @param {!Box2D.Common.Math.b2Vec2} gravity
 * @private
 */
Box2D.Dynamics.b2Island.prototype._InitializeVelocities = function(step, gravity) {
    for (var i = 0; i < this.m_dynamicBodies.length; i++) {
        var b = this.m_dynamicBodies[i];
        b.m_linearVelocity.x += step.dt * (gravity.x + b.m_invMass * b.m_force.x);
        b.m_linearVelocity.y += step.dt * (gravity.y + b.m_invMass * b.m_force.y);
        b.m_angularVelocity += step.dt * b.m_invI * b.m_torque;
        b.m_linearVelocity.Multiply(Box2D.Common.Math.b2Math.Clamp(1.0 - step.dt * b.m_linearDamping, 0.0, 1.0));
        b.m_angularVelocity *= Box2D.Common.Math.b2Math.Clamp(1.0 - step.dt * b.m_angularDamping, 0.0, 1.0);
    }
};

/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @private
 */
Box2D.Dynamics.b2Island.prototype._SolveVelocityConstraints = function(step) {
    this.m_contactSolver.InitVelocityConstraints(step);
    for (var jointInitIdx = 0; jointInitIdx < this.m_joints.length; jointInitIdx++) {
        this.m_joints[jointInitIdx].InitVelocityConstraints(step);
    }
    for (var velocityIterationCnt = 0; velocityIterationCnt < step.velocityIterations; velocityIterationCnt++) {
        for (var jointSolveIdx = 0; jointSolveIdx < this.m_joints.length; jointSolveIdx++) {
            this.m_joints[jointSolveIdx].SolveVelocityConstraints(step);
        }
        this.m_contactSolver.SolveVelocityConstraints();
    }
    for (var jointFinalizeIdx = 0; jointFinalizeIdx < this.m_joints.length; jointFinalizeIdx++) {
        this.m_joints[jointFinalizeIdx].FinalizeVelocityConstraints();
    }
    this.m_contactSolver.FinalizeVelocityConstraints();
};

/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @private
 */
Box2D.Dynamics.b2Island.prototype._SolveBodies = function(step) {
    for (var i = 0; i < this.m_nonStaticBodies.length; ++i) {
        var b = this.m_nonStaticBodies[i];
        var translationX = step.dt * b.m_linearVelocity.x;
        var translationY = step.dt * b.m_linearVelocity.y;
        if ((translationX * translationX + translationY * translationY) > Box2D.Common.b2Settings.b2_maxTranslationSquared) {
            b.m_linearVelocity.Normalize();
            b.m_linearVelocity.x *= Box2D.Common.b2Settings.b2_maxTranslation * step.inv_dt;
            b.m_linearVelocity.y *= Box2D.Common.b2Settings.b2_maxTranslation * step.inv_dt;
        }
        var rotation = step.dt * b.m_angularVelocity;
        if (rotation * rotation > Box2D.Common.b2Settings.b2_maxRotationSquared) {
            if (b.m_angularVelocity < 0.0) {
                b.m_angularVelocity = -Box2D.Common.b2Settings.b2_maxRotation * step.inv_dt;
            } else {
                b.m_angularVelocity = Box2D.Common.b2Settings.b2_maxRotation * step.inv_dt;
            }
        }
        b.m_sweep.c0.SetV(b.m_sweep.c);
        b.m_sweep.a0 = b.m_sweep.a;
        b.m_sweep.c.x += step.dt * b.m_linearVelocity.x;
        b.m_sweep.c.y += step.dt * b.m_linearVelocity.y;
        b.m_sweep.a += step.dt * b.m_angularVelocity;
        b.SynchronizeTransform();
    }
};

/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @private
 */
Box2D.Dynamics.b2Island.prototype._SolvePositionConstraints = function(step) {
    for (var i = 0; i < step.positionIterations; i++) {
        var contactsOkay = this.m_contactSolver.SolvePositionConstraints(Box2D.Common.b2Settings.b2_contactBaumgarte);
        var jointsOkay = true;
        for (var j = 0; j < this.m_joints.length; j++) {
            var jointOkay = this.m_joints[j].SolvePositionConstraints(Box2D.Common.b2Settings.b2_contactBaumgarte);
            jointsOkay = jointsOkay && jointOkay;
        }
        if (contactsOkay && jointsOkay) {
            break;
        }
    }
};

/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @private
 */
Box2D.Dynamics.b2Island.prototype._SleepIfTired = function(step) {
    var minSleepTime = Number.MAX_VALUE;
    for (var nonstaticBodyIdx = 0; nonstaticBodyIdx < this.m_nonStaticBodies.length; nonstaticBodyIdx++) {
        var b = this.m_nonStaticBodies[nonstaticBodyIdx];
        if (!b.m_allowSleep || Math.abs(b.m_angularVelocity) > Box2D.Common.b2Settings.b2_angularSleepTolerance || Box2D.Common.Math.b2Math.Dot(b.m_linearVelocity, b.m_linearVelocity) > Box2D.Common.b2Settings.b2_linearSleepToleranceSquared) {
            b.m_sleepTime = 0.0;
            minSleepTime = 0.0;
        } else {
            b.m_sleepTime += step.dt;
            minSleepTime = Math.min(minSleepTime, b.m_sleepTime);
        }
    }
    if (minSleepTime >= Box2D.Common.b2Settings.b2_timeToSleep) {
        for (var bodyIdx = 0; bodyIdx < this.m_bodies.length; bodyIdx++) {
            this.m_bodies[bodyIdx].SetAwake(false);
        }
    }
};

/**
 * @param {!Box2D.Dynamics.b2TimeStep} subStep
 */
Box2D.Dynamics.b2Island.prototype.SolveTOI = function(subStep) {
    var i = 0;
    var j = 0;
    this.m_contactSolver.Initialize(subStep, this.m_contacts, this.m_contacts.length);
    var contactSolver = this.m_contactSolver;
    for (i = 0; i < this.m_joints.length; ++i) {
        this.m_joints[i].InitVelocityConstraints(subStep);
    }
    for (i = 0; i < subStep.velocityIterations; ++i) {
        contactSolver.SolveVelocityConstraints();
        for (j = 0; j < this.m_joints.length; ++j) {
            this.m_joints[j].SolveVelocityConstraints(subStep);
        }
    }
    for (i = 0; i < this.m_nonStaticBodies.length; ++i) {
        var b = this.m_nonStaticBodies[i];
        var translationX = subStep.dt * b.m_linearVelocity.x;
        var translationY = subStep.dt * b.m_linearVelocity.y;
        if ((translationX * translationX + translationY * translationY) > Box2D.Common.b2Settings.b2_maxTranslationSquared) {
            b.m_linearVelocity.Normalize();
            b.m_linearVelocity.x *= Box2D.Common.b2Settings.b2_maxTranslation * subStep.inv_dt;
            b.m_linearVelocity.y *= Box2D.Common.b2Settings.b2_maxTranslation * subStep.inv_dt;
        }
        var rotation = subStep.dt * b.m_angularVelocity;
        if (rotation * rotation > Box2D.Common.b2Settings.b2_maxRotationSquared) {
            if (b.m_angularVelocity < 0.0) {
                b.m_angularVelocity = (-Box2D.Common.b2Settings.b2_maxRotation * subStep.inv_dt);
            } else {
                b.m_angularVelocity = Box2D.Common.b2Settings.b2_maxRotation * subStep.inv_dt;
            }
        }
        b.m_sweep.c0.SetV(b.m_sweep.c);
        b.m_sweep.a0 = b.m_sweep.a;
        b.m_sweep.c.x += subStep.dt * b.m_linearVelocity.x;
        b.m_sweep.c.y += subStep.dt * b.m_linearVelocity.y;
        b.m_sweep.a += subStep.dt * b.m_angularVelocity;
        b.SynchronizeTransform();
    }
    var k_toiBaumgarte = 0.75;
    for (i = 0; i < subStep.positionIterations; ++i) {
        var contactsOkay = contactSolver.SolvePositionConstraints(k_toiBaumgarte);
        var jointsOkay = true;
        for (j = 0; j < this.m_joints.length; ++j) {
            var jointOkay = this.m_joints[j].SolvePositionConstraints(Box2D.Common.b2Settings.b2_contactBaumgarte);
            jointsOkay = jointsOkay && jointOkay;
        }
        if (contactsOkay && jointsOkay) {
            break;
        }
    }
    this.Report(contactSolver.m_constraints);
};

/**
 * @param {Array.<!Box2D.Dynamics.Contacts.b2ContactConstraint>} constraints
 */
Box2D.Dynamics.b2Island.prototype.Report = function(constraints) {
    if (this.m_listener == null) {
        return;
    }
    for (var i = 0; i < this.m_contacts.length; ++i) {
        var c = this.m_contacts[i];
        var cc = constraints[i];
        this.impulse.Reset();
        for (var j = 0; j < cc.pointCount; ++j) {
            this.impulse.normalImpulses[j] = cc.points[j].normalImpulse;
            this.impulse.tangentImpulses[j] = cc.points[j].tangentImpulse;
        }
        this.m_listener.PostSolve(c, this.impulse);
    }
};

/**
 * @param {!Box2D.Dynamics.b2Body} body
 */
Box2D.Dynamics.b2Island.prototype.AddBody = function(body) {
    this.m_bodies.push(body);
    if (body.GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody) {
        this.m_nonStaticBodies.push(body);
        if (body.GetType() == Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
            this.m_dynamicBodies.push(body);
        }
    }
};

/**
 * @param {!Box2D.Dynamics.Contacts.b2Contact} contact
 */
Box2D.Dynamics.b2Island.prototype.AddContact = function(contact) {
    this.m_contacts.push(contact);
};

/**
 * @param {!Box2D.Dynamics.Joints.b2Joint} joint
 */
Box2D.Dynamics.b2Island.prototype.AddJoint = function(joint) {
    this.m_joints.push(joint);
};
