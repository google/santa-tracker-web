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
 
goog.provide('Box2D.Dynamics.Joints.b2FrictionJoint');

goog.require('Box2D.Dynamics.Joints.b2Joint');
goog.require('Box2D.Common.Math.b2Vec2');
goog.require('Box2D.Common.Math.b2Mat22');
goog.require('Box2D.Common.b2Settings');
goog.require('Box2D.Common.Math.b2Math');

/**
 * @param {!Box2D.Dynamics.Joints.b2FrictionJointDef} def
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.Joints.b2FrictionJoint = function(def) {
    Box2D.Dynamics.Joints.b2Joint.call(this, def);
    this.m_localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_linearMass = Box2D.Common.Math.b2Mat22.Get();
    this.m_linearImpulse = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchorA.SetV(def.localAnchorA);
    this.m_localAnchorB.SetV(def.localAnchorB);
    this.m_linearMass.SetZero();
    this.m_angularMass = 0.0;
    this.m_linearImpulse.SetZero();
    this.m_angularImpulse = 0.0;
    this.m_maxForce = def.maxForce;
    this.m_maxTorque = def.maxTorque;
};
goog.inherits(Box2D.Dynamics.Joints.b2FrictionJoint, Box2D.Dynamics.Joints.b2Joint);

Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetAnchorA = function() {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA);
};

Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetAnchorB = function() {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB);
};

Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetReactionForce = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return new Box2D.Common.Math.b2Vec2.Get(inv_dt * this.m_linearImpulse.x, inv_dt * this.m_linearImpulse.y);
};

Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetReactionTorque = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return inv_dt * this.m_angularImpulse;
};

Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SetMaxForce = function(force) {
    if (force === undefined) force = 0;
    this.m_maxForce = force;
};

Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetMaxForce = function() {
    return this.m_maxForce;
};

Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SetMaxTorque = function(torque) {
    if (torque === undefined) torque = 0;
    this.m_maxTorque = torque;
};

Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetMaxTorque = function() {
    return this.m_maxTorque;
};

Box2D.Dynamics.Joints.b2FrictionJoint.prototype.InitVelocityConstraints = function(step) {
    var tMat;
    var tX = 0;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    tMat = bA.m_xf.R;
    var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
    var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
    tX = (tMat.col1.x * rAX + tMat.col2.x * rAY);
    rAY = (tMat.col1.y * rAX + tMat.col2.y * rAY);
    rAX = tX;
    tMat = bB.m_xf.R;
    var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
    var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * rBX + tMat.col2.x * rBY);
    rBY = (tMat.col1.y * rBX + tMat.col2.y * rBY);
    rBX = tX;
    var mA = bA.m_invMass;
    var mB = bB.m_invMass;
    var iA = bA.m_invI;
    var iB = bB.m_invI;
    var K = new Box2D.Common.Math.b2Mat22();
    K.col1.x = mA + mB;
    K.col2.x = 0.0;
    K.col1.y = 0.0;
    K.col2.y = mA + mB;
    K.col1.x += iA * rAY * rAY;
    K.col2.x += (-iA * rAX * rAY);
    K.col1.y += (-iA * rAX * rAY);
    K.col2.y += iA * rAX * rAX;
    K.col1.x += iB * rBY * rBY;
    K.col2.x += (-iB * rBX * rBY);
    K.col1.y += (-iB * rBX * rBY);
    K.col2.y += iB * rBX * rBX;
    K.GetInverse(this.m_linearMass);
    this.m_angularMass = iA + iB;
    if (this.m_angularMass > 0.0) {
        this.m_angularMass = 1.0 / this.m_angularMass;
    }
    if (step.warmStarting) {
        this.m_linearImpulse.x *= step.dtRatio;
        this.m_linearImpulse.y *= step.dtRatio;
        this.m_angularImpulse *= step.dtRatio;
        var P = this.m_linearImpulse;
        bA.m_linearVelocity.x -= mA * P.x;
        bA.m_linearVelocity.y -= mA * P.y;
        bA.m_angularVelocity -= iA * (rAX * P.y - rAY * P.x + this.m_angularImpulse);
        bB.m_linearVelocity.x += mB * P.x;
        bB.m_linearVelocity.y += mB * P.y;
        bB.m_angularVelocity += iB * (rBX * P.y - rBY * P.x + this.m_angularImpulse);
    } else {
        this.m_linearImpulse.SetZero();
        this.m_angularImpulse = 0.0;
    }
};

Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SolveVelocityConstraints = function(step) {
    var tMat;
    var tX = 0;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var vA = bA.m_linearVelocity;
    var wA = bA.m_angularVelocity;
    var vB = bB.m_linearVelocity;
    var wB = bB.m_angularVelocity;
    var mA = bA.m_invMass;
    var mB = bB.m_invMass;
    var iA = bA.m_invI;
    var iB = bB.m_invI;
    tMat = bA.m_xf.R;
    var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
    var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
    tX = (tMat.col1.x * rAX + tMat.col2.x * rAY);
    rAY = (tMat.col1.y * rAX + tMat.col2.y * rAY);
    rAX = tX;
    tMat = bB.m_xf.R;
    var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
    var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * rBX + tMat.col2.x * rBY);
    rBY = (tMat.col1.y * rBX + tMat.col2.y * rBY);
    rBX = tX;
    var maxImpulse = 0;
    var Cdot = wB - wA;
    var impulse = (-this.m_angularMass * Cdot);
    var oldImpulse = this.m_angularImpulse;
    maxImpulse = step.dt * this.m_maxTorque;
    this.m_angularImpulse = Box2D.Common.Math.b2Math.Clamp(this.m_angularImpulse + impulse, (-maxImpulse), maxImpulse);
    impulse = this.m_angularImpulse - oldImpulse;
    wA -= iA * impulse;
    wB += iB * impulse;
    
    var CdotX = vB.x - wB * rBY - vA.x + wA * rAY;
    var CdotY = vB.y + wB * rBX - vA.y - wA * rAX;
    
    var impulseV = Box2D.Common.Math.b2Vec2.Get((-CdotX), (-CdotY));
    impulseV.MulM(this.m_linearMass);
    var oldImpulseV = this.m_linearImpulse.Copy();
    this.m_linearImpulse.Add(impulseV);
    Box2D.Common.Math.b2Vec2.Free(impulseV);
    maxImpulse = step.dt * this.m_maxForce;
    if (this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse) {
        this.m_linearImpulse.Normalize();
        this.m_linearImpulse.Multiply(maxImpulse);
    }
    impulseV = Box2D.Common.Math.b2Math.SubtractVV(this.m_linearImpulse, oldImpulseV);
    Box2D.Common.Math.b2Vec2.Free(oldImpulseV);
    vA.x -= mA * impulseV.x;
    vA.y -= mA * impulseV.y;
    wA -= iA * (rAX * impulseV.y - rAY * impulseV.x);
    vB.x += mB * impulseV.x;
    vB.y += mB * impulseV.y;
    wB += iB * (rBX * impulseV.y - rBY * impulseV.x);
    Box2D.Common.Math.b2Vec2.Free(impulseV);

    bA.m_angularVelocity = wA;
    bB.m_angularVelocity = wB;
};

Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SolvePositionConstraints = function(baumgarte) {
    return true;
};
