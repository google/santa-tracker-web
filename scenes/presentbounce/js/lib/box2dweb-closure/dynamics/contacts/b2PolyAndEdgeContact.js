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
 
goog.provide('Box2D.Dynamics.Contacts.b2PolyAndEdgeContact');

goog.require('Box2D.Dynamics.Contacts.b2Contact');
goog.require('Box2D.Collision.b2Collision');
goog.require('Box2D.Common.b2Settings');
goog.require('Box2D.Collision.Shapes.b2PolygonShape');
goog.require('Box2D.Collision.Shapes.b2EdgeShape');

/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 * @constructor
 * @extends {Box2D.Dynamics.Contacts.b2Contact}
 */
Box2D.Dynamics.Contacts.b2PolyAndEdgeContact = function(fixtureA, fixtureB) {
    Box2D.Common.b2Settings.b2Assert(fixtureA.GetShape() instanceof Box2D.Collision.Shapes.b2PolygonShape);
    Box2D.Common.b2Settings.b2Assert(fixtureB.GetShape() instanceof Box2D.Collision.Shapes.b2EdgeShape);
    Box2D.Dynamics.Contacts.b2Contact.call(this, fixtureA, fixtureB);
};
goog.inherits(Box2D.Dynamics.Contacts.b2PolyAndEdgeContact, Box2D.Dynamics.Contacts.b2Contact);

/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 */
Box2D.Dynamics.Contacts.b2PolyAndEdgeContact.prototype.Reset = function(fixtureA, fixtureB) {
    Box2D.Common.b2Settings.b2Assert(fixtureA.GetShape() instanceof Box2D.Collision.Shapes.b2PolygonShape);
    Box2D.Common.b2Settings.b2Assert(fixtureB.GetShape() instanceof Box2D.Collision.Shapes.b2EdgeShape);
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, fixtureA, fixtureB);
};

Box2D.Dynamics.Contacts.b2PolyAndEdgeContact.prototype.Evaluate = function() {
    this.b2CollidePolyAndEdge(this.m_manifold, this.m_fixtureA.GetShape(), this.m_fixtureA.GetBody().GetTransform(), this.m_fixtureB.GetShape(), this.m_fixtureB.GetBody().GetTransform());
};

Box2D.Dynamics.Contacts.b2PolyAndEdgeContact.prototype.b2CollidePolyAndEdge = function (manifold, polygon, xf1, edge, xf2) {};
