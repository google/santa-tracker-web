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
 
goog.provide('Box2D.Collision.b2DynamicTree');

goog.require('Box2D.Collision.b2RayCastInput');
goog.require('Box2D.Collision.b2AABB');
goog.require('Box2D.Collision.b2DynamicTreeNode');
goog.require('Box2D.Common.b2Settings');
goog.require('Box2D.Common.Math.b2Math');
goog.require('UsageTracker');

/**
 * @constructor
 */
Box2D.Collision.b2DynamicTree = function() {
    UsageTracker.get('Box2D.Collision.b2DynamicTree').trackCreate();
    
    /**
     * @private
     * @type {Box2D.Collision.b2DynamicTreeNode}
     */
    this.m_root = null;
    
    /**
     * @private
     * @type {number}
     */
    this.m_path = 0;
};

/**
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {Box2D.Dynamics.b2Fixture} fixture
 * @return {!Box2D.Collision.b2DynamicTreeNode}
 */
Box2D.Collision.b2DynamicTree.prototype.CreateProxy = function(aabb, fixture) {
    var node = Box2D.Collision.b2DynamicTreeNode.Get(fixture);
    var extendX = Box2D.Common.b2Settings.b2_aabbExtension;
    var extendY = Box2D.Common.b2Settings.b2_aabbExtension;
    node.GetAABB().Set(aabb.GetMinX() - extendX, aabb.GetMinY() - extendY,
                       aabb.GetMaxX() + extendX, aabb.GetMaxY() + extendY);
    this.InsertLeaf(node);
    return node;
};

/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxy
 */
Box2D.Collision.b2DynamicTree.prototype.DestroyProxy = function(proxy) {
    this.RemoveLeaf(proxy);
    proxy.Destroy();
};

/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxy
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {!Box2D.Common.Math.b2Vec2} displacement
 * @return {boolean}
 */
Box2D.Collision.b2DynamicTree.prototype.MoveProxy = function(proxy, aabb, displacement) {
    Box2D.Common.b2Settings.b2Assert(proxy.IsLeaf());
    if (proxy.GetAABB().Contains(aabb)) {
        return false;
    }
    this.RemoveLeaf(proxy);
    var extendX = Box2D.Common.b2Settings.b2_aabbExtension + Box2D.Common.b2Settings.b2_aabbMultiplier * Math.abs(displacement.x);
    var extendY = Box2D.Common.b2Settings.b2_aabbExtension + Box2D.Common.b2Settings.b2_aabbMultiplier * Math.abs(displacement.y);
    proxy.GetAABB().Set(aabb.GetMinX() - extendX, aabb.GetMinY() - extendY,
                        aabb.GetMaxX() + extendX, aabb.GetMaxY() + extendY);
    this.InsertLeaf(proxy);
    return true;
};

/**
 * @param {number} iterations
 */
Box2D.Collision.b2DynamicTree.prototype.Rebalance = function(iterations) {
    if (this.m_root !== null) {
        for (var i = 0; i < iterations; i++) {
            var node = this.m_root;
            var bit = 0;
            while (!node.IsLeaf()) {
                node = (this.m_path >> bit) & 1 ? node.GetChild2() : node.GetChild1();
                bit = (bit + 1) & 31;
            }
            this.m_path++;
            this.RemoveLeaf(node);
            this.InsertLeaf(node);
        }
    }
};

/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxy
 * @return {!Box2D.Collision.b2AABB}
 */
Box2D.Collision.b2DynamicTree.prototype.GetFatAABB = function(proxy) {
    return proxy.GetAABB();
};

/**
 * @param {function(!Box2D.Dynamics.b2Fixture): boolean} callback
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {!Object=} callbackObject
 */
Box2D.Collision.b2DynamicTree.prototype.Query = function(callback, aabb, callbackObject) {
    if (this.m_root !== null) {
        var stack = [];
        stack.push(this.m_root);
        while (stack.length > 0) {
            var node = stack.pop();
            if (node.GetAABB().TestOverlap(aabb)) {
                if (node.IsLeaf()) {
                    if (!callback.call(callbackObject, node.fixture)) {
                        return;
                    }
                } else {
                    stack.push(node.GetChild1());
                    stack.push(node.GetChild2());
                }
            }
        }
    }
};

/**
 * @param {function(!Box2D.Collision.b2RayCastInput, !Box2D.Dynamics.b2Fixture): number} callback
 * @param {!Box2D.Collision.b2RayCastInput} input
 */
Box2D.Collision.b2DynamicTree.prototype.RayCast = function(callback, input) {
    if (this.m_root === null) {
        return;
    }
    
    var r = Box2D.Common.Math.b2Math.SubtractVV(input.p1, input.p2);
    r.Normalize();
    var v = Box2D.Common.Math.b2Math.CrossFV(1.0, r);
    Box2D.Common.Math.b2Vec2.Free(r);
    var abs_v = Box2D.Common.Math.b2Math.AbsV(v);
    var maxFraction = input.maxFraction;
    var tX = input.p1.x + maxFraction * (input.p2.x - input.p1.x);
    var tY = input.p1.y + maxFraction * (input.p2.y - input.p1.y);
    
    var segmentAABB = Box2D.Collision.b2AABB.Get();
    segmentAABB.Set(Math.min(input.p1.x, tX), Math.min(input.p1.y, tY),
                    Math.max(input.p1.x, tX), Math.max(input.p1.y, tY));
    
    var stack = [];
    stack.push(this.m_root);
    while (stack.length > 0) {
        var node = stack.pop();
        if (!node.GetAABB().TestOverlap(segmentAABB)) {
            continue;
        }
        var c = node.GetAABB().GetCenter();
        var h = node.GetAABB().GetExtents();
        var separation = Math.abs(v.x * (input.p1.x - c.x) + v.y * (input.p1.y - c.y)) - abs_v.x * h.x - abs_v.y * h.y;
        Box2D.Common.Math.b2Vec2.Free(c);
        Box2D.Common.Math.b2Vec2.Free(h);
        if (separation > 0.0) {
            continue;
        }
        if (node.IsLeaf()) {
            var subInput = new Box2D.Collision.b2RayCastInput(input.p1, input.p2, input.maxFraction);
            maxFraction = callback(input, node.GetFixture());
            if (maxFraction == 0.0) {
                break;
            }
            if (maxFraction > 0.0) {
                tX = input.p1.x + maxFraction * (input.p2.x - input.p1.x);
                tY = input.p1.y + maxFraction * (input.p2.y - input.p1.y);
                segmentAABB.Set(Math.min(input.p1.x, tX), Math.min(input.p1.y, tY),
                                Math.max(input.p1.x, tX), Math.max(input.p1.y, tY));
            }
        } else {
            stack.push(node.GetChild1());
            stack.push(node.GetChild2());
        }
    }
    Box2D.Common.Math.b2Vec2.Free(v);
    Box2D.Common.Math.b2Vec2.Free(abs_v);
    Box2D.Collision.b2AABB.Free(segmentAABB);
};

/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} leaf
 */
Box2D.Collision.b2DynamicTree.prototype.InsertLeaf = function(leaf) {
    if (this.m_root === null) {
        this.m_root = leaf;
        this.m_root.SetParent(null);
        return;
    }
    var sibling = this.GetBestSibling(leaf);
    
    var parent = sibling.GetParent();
    var node2 = Box2D.Collision.b2DynamicTreeNode.Get();
    node2.SetParent(parent);
    node2.GetAABB().Combine(leaf.GetAABB(), sibling.GetAABB());
    if (parent) {
        if (sibling.GetParent().GetChild1() == sibling) {
            parent.SetChild1(node2);
        } else {
            parent.SetChild2(node2);
        }
        node2.SetChild1(sibling);
        node2.SetChild2(leaf);
        sibling.SetParent(node2);
        leaf.SetParent(node2);
        while (parent) {
            if (parent.GetAABB().Contains(node2.GetAABB())) {
                break;
            }
            parent.GetAABB().Combine(parent.GetChild1().GetAABB(), parent.GetChild2().GetAABB());
            node2 = parent;
            parent = parent.GetParent();
        }
    } else {
        node2.SetChild1(sibling);
        node2.SetChild2(leaf);
        sibling.SetParent(node2);
        leaf.SetParent(node2);
        this.m_root = node2;
    }
};

/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} leaf
 * @return {!Box2D.Collision.b2DynamicTreeNode}
 */
Box2D.Collision.b2DynamicTree.prototype.GetBestSibling = function(leaf) {
    var center = leaf.GetAABB().GetCenter();
    var sibling = this.m_root;
    while(!sibling.IsLeaf()) {
        var child1 = sibling.GetChild1();
        var child2 = sibling.GetChild2();
        var norm1 = Math.abs((child1.GetAABB().GetMinX() + child1.GetAABB().GetMaxX()) / 2 - center.x) + Math.abs((child1.GetAABB().GetMinY() + child1.GetAABB().GetMaxY()) / 2 - center.y);
        var norm2 = Math.abs((child2.GetAABB().GetMinX() + child2.GetAABB().GetMaxX()) / 2 - center.x) + Math.abs((child2.GetAABB().GetMinY() + child2.GetAABB().GetMaxY()) / 2 - center.y);
        if (norm1 < norm2) {
            sibling = child1; 
        } else {
            sibling = child2;
        }
    }
    Box2D.Common.Math.b2Vec2.Free(center);
    return sibling;
};

/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} leaf
 */
Box2D.Collision.b2DynamicTree.prototype.RemoveLeaf = function(leaf) {
    if (leaf == this.m_root) {
        this.m_root = null;
        return;
    }
    var node2 = leaf.GetParent();
    var node1 = node2.GetParent();
    var sibling;
    if (node2.GetChild1() == leaf) {
        sibling = node2.GetChild2();
    } else {
        sibling = node2.GetChild1();
    }
    if (node1) {
        if (node1.GetChild1() == node2) {
            node1.SetChild1(sibling);
        } else {
            node1.SetChild2(sibling);
        }
        sibling.SetParent(node1);
        while (node1) {
            var oldAABB = node1.GetAABB();
            node1.GetAABB().Combine(node1.GetChild1().GetAABB(), node1.GetChild2().GetAABB());
            if (oldAABB.Contains(node1.GetAABB())) {
                break;
            }
            node1 = node1.GetParent();
        }
    } else {
        this.m_root = sibling;
        sibling.SetParent(null);
    }
    node2.Destroy();
};
