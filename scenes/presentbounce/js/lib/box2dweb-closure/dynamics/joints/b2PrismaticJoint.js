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
 
goog.provide('Box2D.Dynamics.Joints.b2PrismaticJoint');

goog.require('Box2D.Dynamics.Joints.b2Joint');
goog.require('Box2D.Common.Math.b2Vec2');
goog.require('Box2D.Common.Math.b2Vec3');
goog.require('Box2D.Common.Math.b2Mat22');
goog.require('Box2D.Common.Math.b2Mat33');
goog.require('Box2D.Common.b2Settings');
goog.require('Box2D.Common.Math.b2Math');

/**
 * @param {!Box2D.Dynamics.Joints.b2PrismaticJointDef} def
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.Joints.b2PrismaticJoint = function(def) {
    Box2D.Dynamics.Joints.b2Joint.call(this, def);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localXAxis1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localYAxis1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_axis = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_perp = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_K = new Box2D.Common.Math.b2Mat33();
    this.m_impulse = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.m_localAnchor1.SetV(def.localAnchorA);
    this.m_localAnchor2.SetV(def.localAnchorB);
    this.m_localXAxis1.SetV(def.localAxisA);
    this.m_localYAxis1.x = (-this.m_localXAxis1.y);
    this.m_localYAxis1.y = this.m_localXAxis1.x;
    this.m_refAngle = def.referenceAngle;
    this.m_impulse.SetZero();
    this.m_motorMass = 0.0;
    this.m_motorImpulse = 0.0;
    this.m_lowerTranslation = def.lowerTranslation;
    this.m_upperTranslation = def.upperTranslation;
    this.m_maxMotorForce = def.maxMotorForce;
    this.m_motorSpeed = def.motorSpeed;
    this.m_enableLimit = def.enableLimit;
    this.m_enableMotor = def.enableMotor;
    this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    this.m_axis.SetZero();
    this.m_perp.SetZero();
};
goog.inherits(Box2D.Dynamics.Joints.b2PrismaticJoint, Box2D.Dynamics.Joints.b2Joint);

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetAnchorA = function() {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetAnchorB = function() {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetReactionForce = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return Box2D.Common.Math.b2Vec2.Get(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x), inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y));
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetReactionTorque = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return inv_dt * this.m_impulse.y;
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetJointTranslation = function() {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var p1 = bA.GetWorldPoint(this.m_localAnchor1);
    var p2 = bB.GetWorldPoint(this.m_localAnchor2);
    var dX = p2.x - p1.x;
    var dY = p2.y - p1.y;
    Box2D.Common.Math.b2Vec2.Free(p1);
    Box2D.Common.Math.b2Vec2.Free(p2);
    var axis = bA.GetWorldVector(this.m_localXAxis1);
    var translation = axis.x * dX + axis.y * dY;
    Box2D.Common.Math.b2Vec2.Free(axis);
    return translation;
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetJointSpeed = function() {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    var tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
    r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
    r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
    r2X = tX;
    var p1X = bA.m_sweep.c.x + r1X;
    var p1Y = bA.m_sweep.c.y + r1Y;
    var p2X = bB.m_sweep.c.x + r2X;
    var p2Y = bB.m_sweep.c.y + r2Y;
    var dX = p2X - p1X;
    var dY = p2Y - p1Y;
    var axis = bA.GetWorldVector(this.m_localXAxis1);
    var v1 = bA.m_linearVelocity;
    var v2 = bB.m_linearVelocity;
    var w1 = bA.m_angularVelocity;
    var w2 = bB.m_angularVelocity;
    var speed = (dX * ((-w1 * axis.y)) + dY * (w1 * axis.x)) + (axis.x * (((v2.x + ((-w2 * r2Y))) - v1.x) - ((-w1 * r1Y))) + axis.y * (((v2.y + (w2 * r2X)) - v1.y) - (w1 * r1X)));
    Box2D.Common.Math.b2Vec2.Free(axis);
    return speed;
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.IsLimitEnabled = function() {
    return this.m_enableLimit;
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.EnableLimit = function(flag) {
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_enableLimit = flag;
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetLowerLimit = function() {
    return this.m_lowerTranslation;
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetUpperLimit = function() {
    return this.m_upperTranslation;
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SetLimits = function(lower, upper) {
    if (lower === undefined) lower = 0;
    if (upper === undefined) upper = 0;
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_lowerTranslation = lower;
    this.m_upperTranslation = upper;
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.IsMotorEnabled = function() {
    return this.m_enableMotor;
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.EnableMotor = function(flag) {
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_enableMotor = flag;
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SetMotorSpeed = function(speed) {
    if (speed === undefined) speed = 0;
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_motorSpeed = speed;
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetMotorSpeed = function() {
    return this.m_motorSpeed;
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SetMaxMotorForce = function(force) {
    if (force === undefined) force = 0;
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_maxMotorForce = force;
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetMotorForce = function() {
    return this.m_motorImpulse;
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.InitVelocityConstraints = function(step) {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var tX = 0;
    this.m_localCenterA.SetV(bA.GetLocalCenter());
    this.m_localCenterB.SetV(bB.GetLocalCenter());
    var xf1 = bA.GetTransform();
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
    var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
    tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
    r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
    var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
    tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
    r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
    r2X = tX;
    var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
    var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
    this.m_invMassA = bA.m_invMass;
    this.m_invMassB = bB.m_invMass;
    this.m_invIA = bA.m_invI;
    this.m_invIB = bB.m_invI;

    var newAxis = Box2D.Common.Math.b2Math.MulMV(xf1.R, this.m_localXAxis1);
    this.m_axis.SetV(newAxis);
    Box2D.Common.Math.b2Vec2.Free(newAxis);
    
    this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
    this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
    this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
    if (this.m_motorMass > Number.MIN_VALUE) this.m_motorMass = 1.0 / this.m_motorMass;

    var newPerp = Box2D.Common.Math.b2Math.MulMV(xf1.R, this.m_localYAxis1);
    this.m_perp.SetV(newPerp);
    Box2D.Common.Math.b2Vec2.Free(newPerp);
    
    this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
    this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
    var m1 = this.m_invMassA;
    var m2 = this.m_invMassB;
    var i1 = this.m_invIA;
    var i2 = this.m_invIB;
    this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
    this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = i1 + i2;
    this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
    this.m_K.col3.x = this.m_K.col1.z;
    this.m_K.col3.y = this.m_K.col2.z;
    this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;

    if (this.m_enableLimit) {
        var jointTransition = this.m_axis.x * dX + this.m_axis.y * dY;
        if (Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2.0 * Box2D.Common.b2Settings.b2_linearSlop) {
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_equalLimits;
        } else if (jointTransition <= this.m_lowerTranslation) {
            if (this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit) {
                this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit;
                this.m_impulse.z = 0.0;
            }
        } else if (jointTransition >= this.m_upperTranslation) {
            if (this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit) {
                this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit;
                this.m_impulse.z = 0.0;
            }
        } else {
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
            this.m_impulse.z = 0.0;
        }
    } else {
        this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    }
    if (this.m_enableMotor == false) {
        this.m_motorImpulse = 0.0;
    }
    if (step.warmStarting) {
        this.m_impulse.x *= step.dtRatio;
        this.m_impulse.y *= step.dtRatio;
        this.m_motorImpulse *= step.dtRatio;
        var PX = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x;
        var PY = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y;
        var L1 = this.m_impulse.x * this.m_s1 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a1;
        var L2 = this.m_impulse.x * this.m_s2 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a2;
        bA.m_linearVelocity.x -= this.m_invMassA * PX;
        bA.m_linearVelocity.y -= this.m_invMassA * PY;
        bA.m_angularVelocity -= this.m_invIA * L1;
        bB.m_linearVelocity.x += this.m_invMassB * PX;
        bB.m_linearVelocity.y += this.m_invMassB * PY;
        bB.m_angularVelocity += this.m_invIB * L2;
    } else {
        this.m_impulse.SetZero();
        this.m_motorImpulse = 0.0;
    }
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SolveVelocityConstraints = function(step) {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var v1 = bA.m_linearVelocity;
    var w1 = bA.m_angularVelocity;
    var v2 = bB.m_linearVelocity;
    var w2 = bB.m_angularVelocity;
    var PX = 0;
    var PY = 0;
    var L1 = 0;
    var L2 = 0;
    if (this.m_enableMotor && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_equalLimits) {
        var Cdot = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
        var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
        var oldImpulse = this.m_motorImpulse;
        var maxImpulse = step.dt * this.m_maxMotorForce;
        this.m_motorImpulse = Box2D.Common.Math.b2Math.Clamp(this.m_motorImpulse + impulse, (-maxImpulse), maxImpulse);
        impulse = this.m_motorImpulse - oldImpulse;
        PX = impulse * this.m_axis.x;
        PY = impulse * this.m_axis.y;
        L1 = impulse * this.m_a1;
        L2 = impulse * this.m_a2;
        v1.x -= this.m_invMassA * PX;
        v1.y -= this.m_invMassA * PY;
        w1 -= this.m_invIA * L1;
        v2.x += this.m_invMassB * PX;
        v2.y += this.m_invMassB * PY;
        w2 += this.m_invIB * L2;
    }
    var Cdot1X = this.m_perp.x * (v2.x - v1.x) + this.m_perp.y * (v2.y - v1.y) + this.m_s2 * w2 - this.m_s1 * w1;
    var Cdot1Y = w2 - w1;
    if (this.m_enableLimit && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit) {
        var Cdot2 = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
        var f1 = this.m_impulse.Copy();
        var df = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
        this.m_K.Solve33(df, (-Cdot1X), (-Cdot1Y), (-Cdot2));
        this.m_impulse.Add(df);
        if (this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit) {
            this.m_impulse.z = Math.max(this.m_impulse.z, 0.0);
        } else if (this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit) {
            this.m_impulse.z = Math.min(this.m_impulse.z, 0.0);
        }
        var bX = (-Cdot1X) - (this.m_impulse.z - f1.z) * this.m_K.col3.x;
        var bY = (-Cdot1Y) - (this.m_impulse.z - f1.z) * this.m_K.col3.y;
        var out = Box2D.Common.Math.b2Vec2.Get(0, 0);
        this.m_K.Solve22(out, bX, bY);
        
        out.x += f1.x;
        out.y += f1.y;
        this.m_impulse.x = out.x;
        this.m_impulse.y = out.y;
        Box2D.Common.Math.b2Vec2.Free(out);
        
        df.x = this.m_impulse.x - f1.x;
        df.y = this.m_impulse.y - f1.y;
        df.z = this.m_impulse.z - f1.z;
        PX = df.x * this.m_perp.x + df.z * this.m_axis.x;
        PY = df.x * this.m_perp.y + df.z * this.m_axis.y;
        L1 = df.x * this.m_s1 + df.y + df.z * this.m_a1;
        L2 = df.x * this.m_s2 + df.y + df.z * this.m_a2;
        Box2D.Common.Math.b2Vec3.Free(df);
        
        v1.x -= this.m_invMassA * PX;
        v1.y -= this.m_invMassA * PY;
        w1 -= this.m_invIA * L1;
        v2.x += this.m_invMassB * PX;
        v2.y += this.m_invMassB * PY;
        w2 += this.m_invIB * L2;
    } else {
        var df2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
        this.m_K.Solve22(df2, (-Cdot1X), (-Cdot1Y));
        this.m_impulse.x += df2.x;
        this.m_impulse.y += df2.y;
        PX = df2.x * this.m_perp.x;
        PY = df2.x * this.m_perp.y;
        L1 = df2.x * this.m_s1 + df2.y;
        L2 = df2.x * this.m_s2 + df2.y;
        Box2D.Common.Math.b2Vec2.Free(df2);
        v1.x -= this.m_invMassA * PX;
        v1.y -= this.m_invMassA * PY;
        w1 -= this.m_invIA * L1;
        v2.x += this.m_invMassB * PX;
        v2.y += this.m_invMassB * PY;
        w2 += this.m_invIB * L2;
    }
    bA.m_linearVelocity.SetV(v1);
    bA.m_angularVelocity = w1;
    bB.m_linearVelocity.SetV(v2);
    bB.m_angularVelocity = w2;
};

Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SolvePositionConstraints = function(baumgarte) {
    if (baumgarte === undefined) baumgarte = 0;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var c1 = bA.m_sweep.c;
    var a1 = bA.m_sweep.a;
    var c2 = bB.m_sweep.c;
    var a2 = bB.m_sweep.a;
    var tX = 0;
    var m1 = 0;
    var m2 = 0;
    var i1 = 0;
    var i2 = 0;
    var linearError = 0.0;
    var angularError = 0.0;
    var active = false;
    var C2 = 0.0;
    
    var R1 = Box2D.Common.Math.b2Mat22.FromAngle(a1);
    var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
    var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
    tX = (R1.col1.x * r1X + R1.col2.x * r1Y);
    r1Y = (R1.col1.y * r1X + R1.col2.y * r1Y);
    Box2D.Common.Math.b2Mat22.Free(R1);
    r1X = tX;
    
    var R2 = Box2D.Common.Math.b2Mat22.FromAngle(a2);
    var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
    var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
    tX = (R2.col1.x * r2X + R2.col2.x * r2Y);
    r2Y = (R2.col1.y * r2X + R2.col2.y * r2Y);
    Box2D.Common.Math.b2Mat22.Free(R2);
    r2X = tX;
    
    var dX = c2.x + r2X - c1.x - r1X;
    var dY = c2.y + r2Y - c1.y - r1Y;
    if (this.m_enableLimit) {
        Box2D.Common.Math.b2Vec2.Free(this.m_axis);
        this.m_axis = Box2D.Common.Math.b2Math.MulMV(R1, this.m_localXAxis1);
        this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
        this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
        var translation = this.m_axis.x * dX + this.m_axis.y * dY;
        if (Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2.0 * Box2D.Common.b2Settings.b2_linearSlop) {
            C2 = Box2D.Common.Math.b2Math.Clamp(translation, (-Box2D.Common.b2Settings.b2_maxLinearCorrection), Box2D.Common.b2Settings.b2_maxLinearCorrection);
            linearError = Math.abs(translation);
            active = true;
        } else if (translation <= this.m_lowerTranslation) {
            C2 = Box2D.Common.Math.b2Math.Clamp(translation - this.m_lowerTranslation + Box2D.Common.b2Settings.b2_linearSlop, (-Box2D.Common.b2Settings.b2_maxLinearCorrection), 0.0);
            linearError = this.m_lowerTranslation - translation;
            active = true;
        } else if (translation >= this.m_upperTranslation) {
            C2 = Box2D.Common.Math.b2Math.Clamp(translation - this.m_upperTranslation + Box2D.Common.b2Settings.b2_linearSlop, 0.0, Box2D.Common.b2Settings.b2_maxLinearCorrection);
            linearError = translation - this.m_upperTranslation;
            active = true;
        }
    }
    Box2D.Common.Math.b2Vec2.Free(this.m_perp);
    this.m_perp = Box2D.Common.Math.b2Math.MulMV(R1, this.m_localYAxis1);
    this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
    this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
    var impulse = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    var C1X = this.m_perp.x * dX + this.m_perp.y * dY;
    var C1Y = a2 - a1 - this.m_refAngle;
    linearError = Math.max(linearError, Math.abs(C1X));
    angularError = Math.abs(C1Y);
    if (active) {
        m1 = this.m_invMassA;
        m2 = this.m_invMassB;
        i1 = this.m_invIA;
        i2 = this.m_invIB;
        this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
        this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
        this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
        this.m_K.col2.x = this.m_K.col1.y;
        this.m_K.col2.y = i1 + i2;
        this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
        this.m_K.col3.x = this.m_K.col1.z;
        this.m_K.col3.y = this.m_K.col2.z;
        this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
        this.m_K.Solve33(impulse, (-C1X), (-C1Y), (-C2));
    } else {
        m1 = this.m_invMassA;
        m2 = this.m_invMassB;
        i1 = this.m_invIA;
        i2 = this.m_invIB;
        var k11 = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
        var k12 = i1 * this.m_s1 + i2 * this.m_s2;
        var k22 = i1 + i2;
        this.m_K.col1.Set(k11, k12, 0.0);
        this.m_K.col2.Set(k12, k22, 0.0);
        var impulse1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
        this.m_K.Solve22(impulse1, (-C1X), (-C1Y));
        impulse.x = impulse1.x;
        impulse.y = impulse1.y;
        Box2D.Common.Math.b2Vec2.Free(impulse1);
        impulse.z = 0.0;
    }
    var PX = impulse.x * this.m_perp.x + impulse.z * this.m_axis.x;
    var PY = impulse.x * this.m_perp.y + impulse.z * this.m_axis.y;
    var L1 = impulse.x * this.m_s1 + impulse.y + impulse.z * this.m_a1;
    var L2 = impulse.x * this.m_s2 + impulse.y + impulse.z * this.m_a2;
    Box2D.Common.Math.b2Vec3.Free(impulse);
    c1.x -= this.m_invMassA * PX;
    c1.y -= this.m_invMassA * PY;
    a1 -= this.m_invIA * L1;
    c2.x += this.m_invMassB * PX;
    c2.y += this.m_invMassB * PY;
    a2 += this.m_invIB * L2;
    bA.m_sweep.a = a1;
    bB.m_sweep.a = a2;
    bA.SynchronizeTransform();
    bB.SynchronizeTransform();
    return linearError <= Box2D.Common.b2Settings.b2_linearSlop && angularError <= Box2D.Common.b2Settings.b2_angularSlop;
};
