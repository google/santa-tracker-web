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
 
goog.provide('Box2D.Collision.b2DynamicTreeNode');

goog.require('Box2D.Collision.b2AABB');
goog.require('UsageTracker');

/**
 * @private
 * @param {Box2D.Dynamics.b2Fixture} fixture
 * @constructor
 */
Box2D.Collision.b2DynamicTreeNode = function(fixture) {
    UsageTracker.get('Box2D.Collision.b2DynamicTreeNode').trackCreate();
    
    /**
     * @private
     * @type {!Box2D.Collision.b2AABB}
     */
    this.aabb = Box2D.Collision.b2AABB.Get();
    
    /**
     * @private
     * @type {Box2D.Collision.b2DynamicTreeNode}
     */
    this.child1 = null;
    
    /**
     * @private
     * @type {Box2D.Collision.b2DynamicTreeNode}
     */
    this.child2 = null;
    
    /**
     * @private
     * @type {Box2D.Collision.b2DynamicTreeNode}
     */
    this.parent = null;
    
    /**
     * @private
     * @type {Box2D.Dynamics.b2Fixture}
     */
    this.fixture = fixture;
};

/**
 * @private
 * @type {Array.<!Box2D.Collision.b2DynamicTreeNode>}
 */
Box2D.Collision.b2DynamicTreeNode._freeCache = [];

/**
 * @param {Box2D.Dynamics.b2Fixture=} fixture
 * @return {!Box2D.Collision.b2DynamicTreeNode}
 */
Box2D.Collision.b2DynamicTreeNode.Get = function(fixture) {
    if (typeof(fixture) == "undefined") {
        fixture = null;
    }
    if (Box2D.Collision.b2DynamicTreeNode._freeCache.length > 0) {
        var node = Box2D.Collision.b2DynamicTreeNode._freeCache.pop();
        node.fixture = fixture;
        node.aabb.SetZero();
        return node;
    }
    return new Box2D.Collision.b2DynamicTreeNode(fixture);
};

Box2D.Collision.b2DynamicTreeNode.prototype.Destroy = function() {
    this.child1 = null;
    this.child2 = null;
    this.parent = null;
    this.fixture = null;
    Box2D.Collision.b2DynamicTreeNode._freeCache.push(this);
};

/**
 * @return boolean
 */
Box2D.Collision.b2DynamicTreeNode.prototype.IsLeaf = function () {
    return this.child1 === null;
};

/**
 * @param {Box2D.Collision.b2DynamicTreeNode} child
 */
Box2D.Collision.b2DynamicTreeNode.prototype.SetChild1 = function(child) {
    this.child1 = child;
};

/**
 * @return {Box2D.Collision.b2DynamicTreeNode}
 */
Box2D.Collision.b2DynamicTreeNode.prototype.GetChild1 = function() {
    return this.child1;
};

/**
 * @param {Box2D.Collision.b2DynamicTreeNode} child
 */
Box2D.Collision.b2DynamicTreeNode.prototype.SetChild2 = function(child) {
    this.child2 = child;
};

/**
 * @return {Box2D.Collision.b2DynamicTreeNode}
 */
Box2D.Collision.b2DynamicTreeNode.prototype.GetChild2 = function() {
    return this.child2;
};

/**
 * @param {Box2D.Collision.b2DynamicTreeNode} parent
 */
Box2D.Collision.b2DynamicTreeNode.prototype.SetParent = function(parent) {
    this.parent = parent;
};

/**
 * @return {Box2D.Collision.b2DynamicTreeNode}
 */
Box2D.Collision.b2DynamicTreeNode.prototype.GetParent = function() {
    return this.parent;
};

/**
 * @return {!Box2D.Collision.b2AABB}
 */
Box2D.Collision.b2DynamicTreeNode.prototype.GetAABB = function() {
    return this.aabb;
};

/**
 * @return {Box2D.Dynamics.b2Fixture}
 */
Box2D.Collision.b2DynamicTreeNode.prototype.GetFixture = function() {
    return this.fixture;
};
