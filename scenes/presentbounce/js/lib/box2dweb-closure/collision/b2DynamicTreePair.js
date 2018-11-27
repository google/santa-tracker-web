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
 
goog.provide('Box2D.Collision.b2DynamicTreePair');

goog.require('UsageTracker');

/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 * @constructor
 */
Box2D.Collision.b2DynamicTreePair = function(fixtureA, fixtureB) {
    UsageTracker.get('Box2D.Collision.b2DynamicTreePair').trackCreate();
    
    /**
     * @private
     * @type {!Box2D.Dynamics.b2Fixture}
     */
    this.fixtureA = fixtureA;
    
    /**
     * @private
     * @type {!Box2D.Dynamics.b2Fixture}
     */
    this.fixtureB = fixtureB;
};

/**
 * @private
 * @type {Array.<!Box2D.Collision.b2DynamicTreePair>}
 */
Box2D.Collision.b2DynamicTreePair._freeCache = [];

/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 * @return {!Box2D.Collision.b2DynamicTreePair}
 */
Box2D.Collision.b2DynamicTreePair.Get = function(fixtureA, fixtureB) {
    UsageTracker.get('Box2D.Collision.b2DynamicTreePair').trackGet();
    if (Box2D.Collision.b2DynamicTreePair._freeCache.length > 0) {
        var pair = Box2D.Collision.b2DynamicTreePair._freeCache.pop();
        pair.fixtureA = fixtureA;
        pair.fixtureB = fixtureB;
        return pair;
    }
    return new Box2D.Collision.b2DynamicTreePair(fixtureA, fixtureB);
};

/**
 * @param {!Box2D.Collision.b2DynamicTreePair} pair
 */
Box2D.Collision.b2DynamicTreePair.Free = function(pair) {
    if (pair != null) {
        UsageTracker.get('Box2D.Collision.b2DynamicTreePair').trackFree();
        Box2D.Collision.b2DynamicTreePair._freeCache.push(pair);
    }
};

