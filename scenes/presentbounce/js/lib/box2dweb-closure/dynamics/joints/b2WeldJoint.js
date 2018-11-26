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
 
goog.provide('Box2D.Dynamics.Joints.b2WeldJoint');

goog.require('Box2D.Dynamics.Joints.b2Joint');
goog.require('Box2D.Common.Math.b2Vec2');
goog.require('Box2D.Common.Math.b2Vec3');
goog.require('Box2D.Common.Math.b2Mat33');
goog.require('Box2D.Common.b2Settings');

/**
 * @param {!Box2D.Dynamics.Joints.b2WeldJointDef} def
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.Joints.b2WeldJoint = function(def) {
    Box2D.Dynamics.Joints.b2Joint.call(this, def);
    this.m_localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_impulse = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.m_mass = new Box2D.Common.Math.b2Mat33();
    this.m_localAnchorA.SetV(def.localAnchorA);
    this.m_localAnchorB.SetV(def.localAnchorB);
    this.m_referenceAngle = def.referenceAngle;
};
goog.inherits(Box2D.Dynamics.Joints.b2WeldJoint, Box2D.Dynamics.Joints.b2Joint);

Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetAnchorA = function() {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA);
};

Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetAnchorB = function() {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB);
};

/**
 * @param {number} inv_dt
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetReactionForce = function(inv_dt) {
    return Box2D.Common.Math.b2Vec2.Get(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y);
};

/**
 * @param {number} inv_dt
 * @return {number}
 */
Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetReactionTorque = function(inv_dt) {
    return inv_dt * this.m_impulse.z;
};

Box2D.Dynamics.Joints.b2WeldJoint.prototype.InitVelocityConstraints = function(step) {
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
    this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
    this.m_mass.col2.x = (-rAY * rAX * iA) - rBY * rBX * iB;
    this.m_mass.col3.x = (-rAY * iA) - rBY * iB;
    this.m_mass.col1.y = this.m_mass.col2.x;
    this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
    this.m_mass.col3.y = rAX * iA + rBX * iB;
    this.m_mass.col1.z = this.m_mass.col3.x;
    this.m_mass.col2.z = this.m_mass.col3.y;
    this.m_mass.col3.z = iA + iB;
    if (step.warmStarting) {
        this.m_impulse.x *= step.dtRatio;
        this.m_impulse.y *= step.dtRatio;
        this.m_impulse.z *= step.dtRatio;
        bA.m_linearVelocity.x -= mA * this.m_impulse.x;
        bA.m_linearVelocity.y -= mA * this.m_impulse.y;
        bA.m_angularVelocity -= iA * (rAX * this.m_impulse.y - rAY * this.m_impulse.x + this.m_impulse.z);
        bB.m_linearVelocity.x += mB * this.m_impulse.x;
        bB.m_linearVelocity.y += mB * this.m_impulse.y;
        bB.m_angularVelocity += iB * (rBX * this.m_impulse.y - rBY * this.m_impulse.x + this.m_impulse.z);
    } else {
        this.m_impulse.SetZero();
    }
};

Box2D.Dynamics.Joints.b2WeldJoint.prototype.SolveVelocityConstraints = function(step) {
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
    var Cdot1X = vB.x - wB * rBY - vA.x + wA * rAY;
    var Cdot1Y = vB.y + wB * rBX - vA.y - wA * rAX;
    var Cdot2 = wB - wA;
    var impulse = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.m_mass.Solve33(impulse, (-Cdot1X), (-Cdot1Y), (-Cdot2));
    this.m_impulse.Add(impulse);
    vA.x -= mA * impulse.x;
    vA.y -= mA * impulse.y;
    wA -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
    vB.x += mB * impulse.x;
    vB.y += mB * impulse.y;
    wB += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
    Box2D.Common.Math.b2Vec3.Free(impulse);
    bA.m_angularVelocity = wA;
    bB.m_angularVelocity = wB;
};

Box2D.Dynamics.Joints.b2WeldJoint.prototype.SolvePositionConstraints = function(baumgarte) {
    if (baumgarte === undefined) baumgarte = 0;
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
    var C1X = bB.m_sweep.c.x + rBX - bA.m_sweep.c.x - rAX;
    var C1Y = bB.m_sweep.c.y + rBY - bA.m_sweep.c.y - rAY;
    var C2 = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
    var k_allowedStretch = 10.0 * Box2D.Common.b2Settings.b2_linearSlop;
    var positionError = Math.sqrt(C1X * C1X + C1Y * C1Y);
    var angularError = Math.abs(C2);
    if (positionError > k_allowedStretch) {
        iA *= 1.0;
        iB *= 1.0;
    }
    this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
    this.m_mass.col2.x = (-rAY * rAX * iA) - rBY * rBX * iB;
    this.m_mass.col3.x = (-rAY * iA) - rBY * iB;
    this.m_mass.col1.y = this.m_mass.col2.x;
    this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
    this.m_mass.col3.y = rAX * iA + rBX * iB;
    this.m_mass.col1.z = this.m_mass.col3.x;
    this.m_mass.col2.z = this.m_mass.col3.y;
    this.m_mass.col3.z = iA + iB;
    var impulse = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.m_mass.Solve33(impulse, (-C1X), (-C1Y), (-C2));
    bA.m_sweep.c.x -= mA * impulse.x;
    bA.m_sweep.c.y -= mA * impulse.y;
    bA.m_sweep.a -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
    bB.m_sweep.c.x += mB * impulse.x;
    bB.m_sweep.c.y += mB * impulse.y;
    bB.m_sweep.a += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
    Box2D.Common.Math.b2Vec3.Free(impulse);
    bA.SynchronizeTransform();
    bB.SynchronizeTransform();
    return positionError <= Box2D.Common.b2Settings.b2_linearSlop && angularError <= Box2D.Common.b2Settings.b2_angularSlop;
};
