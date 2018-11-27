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
 
goog.provide('Box2D.Common.Math.b2Sweep');

goog.require('Box2D.Common.Math.b2Vec2');
goog.require('UsageTracker');

/**
 * @constructor
 */
Box2D.Common.Math.b2Sweep = function() {
    UsageTracker.get('Box2D.Common.Math.b2Sweep').trackCreate();
    
    this.localCenter = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.c0 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.c = Box2D.Common.Math.b2Vec2.Get(0, 0);
	this.a0 = null;
	this.a = null;
	this.t0 = null;
};

Box2D.Common.Math.b2Sweep.prototype.Set = function(other) {
    this.localCenter.SetV(other.localCenter);
    this.c0.SetV(other.c0);
    this.c.SetV(other.c);
    this.a0 = other.a0;
    this.a = other.a;
    this.t0 = other.t0;
};

Box2D.Common.Math.b2Sweep.prototype.Copy = function() {
    var copy = new Box2D.Common.Math.b2Sweep();
    copy.localCenter.SetV(this.localCenter);
    copy.c0.SetV(this.c0);
    copy.c.SetV(this.c);
    copy.a0 = this.a0;
    copy.a = this.a;
    copy.t0 = this.t0;
    return copy;
};

Box2D.Common.Math.b2Sweep.prototype.GetTransform = function(xf, alpha) {
    if (alpha === undefined) alpha = 0;
    xf.position.x = (1.0 - alpha) * this.c0.x + alpha * this.c.x;
    xf.position.y = (1.0 - alpha) * this.c0.y + alpha * this.c.y;
    var angle = (1.0 - alpha) * this.a0 + alpha * this.a;
    xf.R.Set(angle);
    var tMat = xf.R;
    xf.position.x -= (tMat.col1.x * this.localCenter.x + tMat.col2.x * this.localCenter.y);
    xf.position.y -= (tMat.col1.y * this.localCenter.x + tMat.col2.y * this.localCenter.y);
};

Box2D.Common.Math.b2Sweep.prototype.Advance = function(t) {
    if (t === undefined) t = 0;
    if (this.t0 < t && 1.0 - this.t0 > Number.MIN_VALUE) {
        var alpha = (t - this.t0) / (1.0 - this.t0);
        this.c0.x = (1.0 - alpha) * this.c0.x + alpha * this.c.x;
        this.c0.y = (1.0 - alpha) * this.c0.y + alpha * this.c.y;
        this.a0 = (1.0 - alpha) * this.a0 + alpha * this.a;
        this.t0 = t;
    }
};
