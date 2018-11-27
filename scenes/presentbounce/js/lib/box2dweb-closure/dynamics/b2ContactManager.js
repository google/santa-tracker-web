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
 
goog.provide('Box2D.Dynamics.b2ContactManager');

goog.require('Box2D.Collision.b2ContactPoint');
goog.require('Box2D.Collision.b2DynamicTreeBroadPhase');
goog.require('Box2D.Dynamics.b2ContactFilter');
goog.require('Box2D.Dynamics.b2ContactListener');
goog.require('Box2D.Dynamics.Contacts.b2ContactFactory');
goog.require('UsageTracker');

/**
 * @param {!Box2D.Dynamics.b2World} world
 * @constructor
 */
Box2D.Dynamics.b2ContactManager = function(world) {
    UsageTracker.get('Box2D.Dynamics.b2ContactManager').trackCreate();
    
    /**
     * @private
     * @const
     * @type {!Box2D.Dynamics.b2World}
     */
    this.m_world = world;
    
    /**
     * @private
     * @type {!Box2D.Dynamics.iContactFilter}
     */
    this.m_contactFilter = Box2D.Dynamics.b2ContactFilter.b2_defaultFilter;
    
    /**
     * @private
     * @type {!Box2D.Dynamics.iContactListener}
     */
    this.m_contactListener = Box2D.Dynamics.b2ContactListener.b2_defaultListener;
    
    /**
     * @private
     * @const
     * @type {!Box2D.Dynamics.Contacts.b2ContactFactory}
     */
    this.m_contactFactory = new Box2D.Dynamics.Contacts.b2ContactFactory();
    
    /**
     * @private
     * @type {!Box2D.Collision.b2DynamicTreeBroadPhase}
     */
    this.m_broadPhase = new Box2D.Collision.b2DynamicTreeBroadPhase();
};

/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 */
Box2D.Dynamics.b2ContactManager.prototype.AddPair = function (fixtureA, fixtureB) {
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();
  if (bodyA == bodyB) {
      return;
  }
  if (!bodyB.ShouldCollide(bodyA)) {
     return;
  }
  if (!this.m_contactFilter.ShouldCollide(fixtureA, fixtureB)) {
     return;
  }
  var hasContact = false;
  bodyB.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts, function(contact){
    var fA = contact.GetFixtureA();
    if (fA == fixtureA) {
        var fB = contact.GetFixtureB();
        if (fB == fixtureB) {
            hasContact = true;
            return true;
        }
    } else if (fA == fixtureB) {
        var fB = contact.GetFixtureB();
        if (fB == fixtureA) {
            hasContact = true;
            return true;
        }
    }
  });
  if(hasContact){
      return;
  }
  var c = this.m_contactFactory.Create(fixtureA, fixtureB);
};

Box2D.Dynamics.b2ContactManager.prototype.FindNewContacts = function () {
    var self = this;
    /** @type {function(!Box2D.Dynamics.b2Fixture, !Box2D.Dynamics.b2Fixture)} */
    var addPairCallback = function(fixtureA, fixtureB) {
        self.AddPair(fixtureA, fixtureB)
    };
    this.m_broadPhase.UpdatePairs(addPairCallback);
};

/**
 * @param {!Box2D.Dynamics.Contacts.b2Contact} c
 */
Box2D.Dynamics.b2ContactManager.prototype.Destroy = function (c) {
    var fixtureA = c.GetFixtureA();
    var fixtureB = c.GetFixtureB();
    var bodyA = fixtureA.GetBody();
    var bodyB = fixtureB.GetBody();
    if (c.IsTouching()) {
        this.m_contactListener.EndContact(c);
    }
    if (c.m_manifold.m_pointCount > 0) {
        bodyA.SetAwake(true);
        bodyB.SetAwake(true);
    }
    c.RemoveFromLists();
    this.m_contactFactory.Destroy(c);
};

Box2D.Dynamics.b2ContactManager.prototype.Collide = function() {
    var thisCM = this;
    this.m_world.contactList.ForEachContact(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts, function(c){
        var fixtureA = c.GetFixtureA();
        var fixtureB = c.GetFixtureB();
        var bodyA = fixtureA.GetBody();
        var bodyB = fixtureB.GetBody();
        if (!bodyA.IsAwake() && !bodyB.IsAwake()) {
            return;
        }
        if (c.IsFiltering()) {
            if (!bodyB.ShouldCollide(bodyA)) {
                thisCM.Destroy(c);
                return;
            }
            if (!thisCM.m_contactFilter.ShouldCollide(fixtureA, fixtureB)) {
                thisCM.Destroy(c);
                return;
            }
            c.ClearFiltering();
        }
        var proxyA = fixtureA.m_proxy;
        var proxyB = fixtureB.m_proxy;
        var overlap = thisCM.m_broadPhase.TestOverlap(proxyA, proxyB);
        if (!overlap) {
            thisCM.Destroy(c);
            return;
        }
        c.Update(thisCM.m_contactListener);
    });
};

/**
 * @private
 * @const
 * @type {!Box2D.Collision.b2ContactPoint}
 */
Box2D.Dynamics.b2ContactManager.s_evalCP = new Box2D.Collision.b2ContactPoint();
