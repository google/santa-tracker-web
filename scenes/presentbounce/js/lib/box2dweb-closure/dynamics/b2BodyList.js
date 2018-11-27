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
 
goog.provide('Box2D.Dynamics.b2BodyList');

goog.require('Box2D.Dynamics.b2BodyListNode');
goog.require('UsageTracker');

goog.require('goog.array');

/**
 * @constructor
 */
Box2D.Dynamics.b2BodyList = function() {
    UsageTracker.get('Box2D.Dynamics.b2BodyList').trackCreate();
    
    /**
     * @private
     * @type {!Array.<Box2D.Dynamics.b2BodyListNode>}
     */
    this.bodyFirstNodes = [];
    for(var i = 0; i <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; i++) {
        this.bodyFirstNodes[i] = null;
    }
    
    /**
     * @private
     * @type {!Array.<Box2D.Dynamics.b2BodyListNode>}
     */
    this.bodyLastNodes = [];
    for(var i = 0; i <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; i++) {
        this.bodyLastNodes[i] = null;
    }
    
    /**
     * @private
     * @type {Object.<!Array.<Box2D.Dynamics.b2BodyListNode>>}
     */
    this.bodyNodeLookup = {};
    
    /**
     * @private
     * @type {number}
     */
    this.bodyCount = 0;
};

/**
 * @param {number} type
 * @return {Box2D.Dynamics.b2BodyListNode}
 */
Box2D.Dynamics.b2BodyList.prototype.GetFirstNode = function(type) {
    return this.bodyFirstNodes[type];
};

/**
 * @param {!Box2D.Dynamics.b2Body} body
 */
Box2D.Dynamics.b2BodyList.prototype.AddBody = function(body) {
    var bodyID = body.ID;
    if (this.bodyNodeLookup[bodyID] == null) {
        this.CreateNode(body, bodyID, Box2D.Dynamics.b2BodyList.TYPES.allBodies);
        this.UpdateBody(body);
        body.m_lists.push(this);
        this.bodyCount++;
    }
};

/**
 * @param {!Box2D.Dynamics.b2Body} body
 */
Box2D.Dynamics.b2BodyList.prototype.UpdateBody = function(body) {
    var type = body.GetType();
    var bodyID = body.ID;
    var awake = body.IsAwake();
    var active = body.IsActive();
    if (type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
        this.CreateNode(body, bodyID, Box2D.Dynamics.b2BodyList.TYPES.dynamicBodies);
    } else {
        this.RemoveNode(bodyID, Box2D.Dynamics.b2BodyList.TYPES.dynamicBodies);
    }
    if (type != Box2D.Dynamics.b2BodyDef.b2_staticBody) {
        this.CreateNode(body, bodyID, Box2D.Dynamics.b2BodyList.TYPES.nonStaticBodies);
    } else {
        this.RemoveNode(bodyID, Box2D.Dynamics.b2BodyList.TYPES.nonStaticBodies);
    }
    if (type != Box2D.Dynamics.b2BodyDef.b2_staticBody && active && awake) {
        this.CreateNode(body, bodyID, Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies);
    } else {
        this.RemoveNode(bodyID, Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies);
    }
    if (awake) {
        this.CreateNode(body, bodyID, Box2D.Dynamics.b2BodyList.TYPES.awakeBodies);
    } else {
        this.RemoveNode(bodyID, Box2D.Dynamics.b2BodyList.TYPES.awakeBodies);
    }
    if (active) {
        this.CreateNode(body, bodyID, Box2D.Dynamics.b2BodyList.TYPES.activeBodies);
    } else {
        this.RemoveNode(bodyID, Box2D.Dynamics.b2BodyList.TYPES.activeBodies);
    }
};

/**
 * @param {!Box2D.Dynamics.b2Body} body
 */
Box2D.Dynamics.b2BodyList.prototype.RemoveBody = function(body) {
    var bodyID = body.ID;
    if (this.bodyNodeLookup[bodyID] != null) {
        goog.array.remove(body.m_lists, this);
        for(var i = 0; i <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; i++) {
            this.RemoveNode(bodyID, i);
        }
        delete this.bodyNodeLookup[bodyID];
        this.bodyCount--;
    }
};

/**
 * @param {string} bodyID
 * @param {number} type
 */
Box2D.Dynamics.b2BodyList.prototype.RemoveNode = function(bodyID, type) {
    var nodeList = this.bodyNodeLookup[bodyID];
    if (nodeList == null) {
        return;
    }
    var node = nodeList[type];
    if (node == null) {
        return;
    }
    nodeList[type] = null;
    var prevNode = node.GetPreviousNode();
    var nextNode = node.GetNextNode();
    if (prevNode == null) {
        this.bodyFirstNodes[type] = nextNode;
    } else {
        prevNode.SetNextNode(nextNode);
    }
    if (nextNode == null) {
        this.bodyLastNodes[type] = prevNode;
    } else {
        nextNode.SetPreviousNode(prevNode);
    }
};

/**
 * @param {!Box2D.Dynamics.b2Body} body
 * @param {string} bodyID
 * @param {number} type
 */
Box2D.Dynamics.b2BodyList.prototype.CreateNode = function(body, bodyID, type) {
    var nodeList = this.bodyNodeLookup[bodyID];
    if (nodeList == null) {
        nodeList = [];
        for(var i = 0; i <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; i++) {
            nodeList[i] = null;
        }
        this.bodyNodeLookup[bodyID] = nodeList;
    }
    if (nodeList[type] == null) {
        nodeList[type] = new Box2D.Dynamics.b2BodyListNode(body);
        var prevNode = this.bodyLastNodes[type];
        if (prevNode != null) {
            prevNode.SetNextNode(nodeList[type]);
        } else {
            this.bodyFirstNodes[type] = nodeList[type];
        }
        nodeList[type].SetPreviousNode(prevNode);
        this.bodyLastNodes[type] = nodeList[type];
    }
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2BodyList.prototype.GetBodyCount = function() {
    return this.bodyCount;
};

/**
 * @enum {number}
 */
Box2D.Dynamics.b2BodyList.TYPES = {
    dynamicBodies: 0,
    nonStaticBodies: 1,
    activeBodies: 2,
    nonStaticActiveAwakeBodies: 3,
    awakeBodies: 4,
    allBodies: 5 // Assumed to be last by above code
};
