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
 
goog.provide('Box2D.Collision.b2DynamicTreeBroadPhase');

goog.require('Box2D.Collision.b2DynamicTree');
goog.require('Box2D.Collision.b2DynamicTreePair');
goog.require('Box2D.Collision.IBroadPhase');
goog.require('UsageTracker');

goog.require('goog.array');

/**
 * @constructor
 */
Box2D.Collision.b2DynamicTreeBroadPhase = function() {
    UsageTracker.get('Box2D.Collision.b2DynamicTreeBroadPhase').trackCreate();
    
    /**
     * @private
     * @type {!Box2D.Collision.b2DynamicTree}
     */
    this.m_tree = new Box2D.Collision.b2DynamicTree();
    
    /**
     * @private
     * @type {Array.<!Box2D.Collision.b2DynamicTreeNode>}
     */
    this.m_moveBuffer = [];
    
    /**
     * @private
     * @type {Box2D.Dynamics.b2Fixture}
     */
    this.lastQueryFixtureA = null;
    
    /**
     * @private
     * @type {Box2D.Dynamics.b2Fixture}
     */
    this.lastQueryFixtureB = null;

    /**
     * @private
     * @type {?function(!Box2D.Dynamics.b2Fixture, !Box2D.Dynamics.b2Fixture): boolean}
     */
    this.updatePairsCallback = null;
    
    /**
     * @private
     * @type {Box2D.Collision.b2DynamicTreeNode}
     */
    this.queryProxy = null;

};

/**
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {Box2D.Dynamics.b2Fixture} fixture
 * @return {!Box2D.Collision.b2DynamicTreeNode}
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.CreateProxy = function(aabb, fixture) {
    var proxy = this.m_tree.CreateProxy(aabb, fixture);
    this.BufferMove(proxy);
    return proxy;
};

/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxy
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.DestroyProxy = function(proxy) {
    this.UnBufferMove(proxy);
    this.m_tree.DestroyProxy(proxy);
};

/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxy
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {!Box2D.Common.Math.b2Vec2} displacement
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.MoveProxy = function(proxy, aabb, displacement) {
    var buffer = this.m_tree.MoveProxy(proxy, aabb, displacement);
    if (buffer) {
        this.BufferMove(proxy);
    }
};

/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxyA
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxyB
 * @return {boolean}
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.TestOverlap = function(proxyA, proxyB) {
    var aabbA = this.m_tree.GetFatAABB(proxyA);
    var aabbB = this.m_tree.GetFatAABB(proxyB);
    return aabbA.TestOverlap(aabbB);
};

/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxy
 * @return {!Box2D.Collision.b2AABB}
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.GetFatAABB = function(proxy) {
    return this.m_tree.GetFatAABB(proxy);
};

/**
 * @param {function(!Box2D.Dynamics.b2Fixture, !Box2D.Dynamics.b2Fixture)} callback
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.UpdatePairs = function(callback) {
    this.lastQueryFixtureA = null;
    this.lastQueryFixtureB = null;
    this.updatePairsCallback = callback;
    while (this.m_moveBuffer.length > 0) {
        this.queryProxy = this.m_moveBuffer.pop();
        this.m_tree.Query(this.QueryCallback, this.m_tree.GetFatAABB(this.queryProxy), this);
    }
    this.lastQueryFixtureA = null;
    this.lastQueryFixtureB = null;
    this.updatePairsCallback = null;
    this.queryProxy = null;
};

/**
 * @param {!Box2D.Dynamics.b2Fixture} fixture
 * @return {boolean}
 * @private
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.QueryCallback = function(fixture) {
    if (fixture != this.queryProxy.fixture) {
        if ( !(this.queryProxy.fixture == this.lastQueryFixtureA && fixture == this.lastQueryFixtureB)
             && !(this.queryProxy.fixture == this.lastQueryFixtureB && fixture == this.lastQueryFixtureA) ) {
            this.updatePairsCallback(this.queryProxy.fixture, fixture);
            this.lastQueryFixtureA = this.queryProxy.fixture;
            this.lastQueryFixtureB = fixture;
        }
    }
    return true;
};

/**
 * @param {function(!Box2D.Dynamics.b2Fixture): boolean} callback
 * @param {!Box2D.Collision.b2AABB} aabb
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.Query = function(callback, aabb) {
    this.m_tree.Query(callback, aabb);
};

/**
 * @param {function(!Box2D.Collision.b2RayCastInput, !Box2D.Dynamics.b2Fixture): number} callback
 * @param {!Box2D.Collision.b2RayCastInput} input
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.RayCast = function(callback, input) {
    this.m_tree.RayCast(callback, input);
};

/**
 * @param {number} iterations
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.Rebalance = function(iterations) {
    this.m_tree.Rebalance(iterations);
};

Box2D.Collision.b2DynamicTreeBroadPhase.prototype.BufferMove = function(proxy) {
    this.m_moveBuffer.push(proxy);
};

Box2D.Collision.b2DynamicTreeBroadPhase.prototype.UnBufferMove = function(proxy) {
    goog.array.remove(this.m_moveBuffer, proxy);
};

Box2D.Collision.b2DynamicTreeBroadPhase.__implements = {};
Box2D.Collision.b2DynamicTreeBroadPhase.__implements[Box2D.Collision.IBroadPhase] = true;
