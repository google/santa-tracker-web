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
 
goog.provide('Box2D.Dynamics.Contacts.b2ContactList');

goog.require('Box2D.Dynamics.Contacts.b2ContactListNode');

goog.require('goog.array');

/**
 * @constructor
 */
Box2D.Dynamics.Contacts.b2ContactList = function() {
    
    /**
     * @private
     * @type {Array.<Box2D.Dynamics.Contacts.b2ContactListNode>}
     */
    this.contactFirstNodes = [];
    for(var i = 0; i <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; i++) {
        this.contactFirstNodes[i] = null;
    }
    
    /**
     * @private
     * @type {Array.<Box2D.Dynamics.Contacts.b2ContactListNode>}
     */
    this.contactLastNodes = [];
    for(var i = 0; i <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; i++) {
        this.contactLastNodes[i] = null;
    }
    
    /**
     * @private
     * @type {Object.<Array.<Box2D.Dynamics.Contacts.b2ContactListNode>>}
     */
    this.contactNodeLookup = {};
    
    /**
     * @private
     * @type {number}
     */
    this.contactCount = 0;
};

/**
 * @param {number} type
 * @param {function(!Box2D.Dynamics.Contacts.b2Contact)} fn
 */
Box2D.Dynamics.Contacts.b2ContactList.prototype.ForEachContact = function(type, fn) {
    var nextNode = this.contactFirstNodes[type];
    var thisNode;
    while(nextNode !== null) {
        thisNode = nextNode;
        nextNode = thisNode.GetNextNode();
        if(fn(thisNode.contact)===true){
            break;
        }
    }
};

/**
 * @param {!Box2D.Dynamics.Contacts.b2Contact} contact
 */
Box2D.Dynamics.Contacts.b2ContactList.prototype.AddContact = function(contact) {
    var contactID = contact.ID;
    if (this.contactNodeLookup[contactID] == null) {
        this.contactNodeLookup[contactID] = [];
        for(var i = 0; i <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; i++) {
            this.contactNodeLookup[contactID][i] = null;
        }
        this.CreateNode(contact, contactID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts);
        this.contactCount++;
    }
};

/**
 * @param {!Box2D.Dynamics.Contacts.b2Contact} contact
 */
Box2D.Dynamics.Contacts.b2ContactList.prototype.UpdateContact = function(contact, nonSensorEnabledTouching, nonSensorEnabledContinuous) {
    if (nonSensorEnabledTouching) {
        this.CreateNode(contact, contact.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts);
    } else {
        this.RemoveNode(contact.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts);
    }
    if (nonSensorEnabledContinuous) {
        this.CreateNode(contact, contact.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledContinuousContacts);
    } else {
        this.RemoveNode(contact.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledContinuousContacts);
    }
};

/**
 * @param {!Box2D.Dynamics.Contacts.b2Contact} contact
 */
Box2D.Dynamics.Contacts.b2ContactList.prototype.RemoveContact = function(contact) {
    var contactID = contact.ID;
    if (this.contactNodeLookup[contactID] != null) {
        for(var i = 0; i <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; i++) {
            this.RemoveNode(contactID, i);
        }
        delete this.contactNodeLookup[contactID];
        this.contactCount--;
    }
};

/**
 * @param {string} contactID
 * @param {number} type
 */
Box2D.Dynamics.Contacts.b2ContactList.prototype.RemoveNode = function(contactID, type) {
    var nodeList = this.contactNodeLookup[contactID];
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
        this.contactFirstNodes[type] = nextNode;
    } else {
        prevNode.SetNextNode(nextNode);
    }
    if (nextNode == null) {
        this.contactLastNodes[type] = prevNode;
    } else {
        nextNode.SetPreviousNode(prevNode);
    }
    Box2D.Dynamics.Contacts.b2ContactListNode.FreeNode(node);
};

/**
 * @param {!Box2D.Dynamics.Contacts.b2Contact} contact
 * @param {string} contactID
 * @param {number} type
 */
Box2D.Dynamics.Contacts.b2ContactList.prototype.CreateNode = function(contact, contactID, type) {
    var nodeList = this.contactNodeLookup[contactID];
    if (nodeList[type] == null) {
        nodeList[type] = Box2D.Dynamics.Contacts.b2ContactListNode.GetNode(contact);
        var prevNode = this.contactLastNodes[type];
        if (prevNode != null) {
            prevNode.SetNextNode(nodeList[type]);
            nodeList[type].SetPreviousNode(prevNode);
        } else {
            this.contactFirstNodes[type] = nodeList[type];
        }
        this.contactLastNodes[type] = nodeList[type];
    }
};

/**
 * @return {number}
 */
Box2D.Dynamics.Contacts.b2ContactList.prototype.GetContactCount = function() {
    return this.contactCount;
};

/**
 * @enum {number}
 */
Box2D.Dynamics.Contacts.b2ContactList.TYPES = {
    nonSensorEnabledTouchingContacts: 0,
    nonSensorEnabledContinuousContacts: 1,
    allContacts: 2 // Assumed to be last by above code
};
