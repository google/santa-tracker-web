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
 
goog.provide('Box2D.Dynamics.b2DebugDraw');

goog.require('UsageTracker');

/**
 * @constructor
 */
Box2D.Dynamics.b2DebugDraw = function() {
    UsageTracker.get('Box2D.Dynamics.b2DebugDraw').trackCreate();
    
    /**
     * @private
     * @type {number}
     */
    this.m_drawScale = 1;
    
    /**
     * @private
     * @type {number}
     */
    this.m_lineThickness = 1;
    
    /**
     * @private
     * @type {number}
     */
    this.m_alpha = 1;
    
    /**
     * @private
     * @type {number}
     */
    this.m_fillAlpha = 1;
    
    /**
     * @private
     * @type {number}
     */
    this.m_xformScale = 1;
    
    /**
     * @private
     * @type {number}
     */
    this.m_drawFlags = 0;
    
    /**
     * @private
     * @type {CanvasRenderingContext2D}
     */
    this.m_ctx = null;
};

Box2D.Dynamics.b2DebugDraw.prototype.Clear = function() {
    this.m_ctx.clearRect(0, 0, this.m_ctx.canvas.width, this.m_ctx.canvas.height)
};

/**
 * @private
 * @param {number} color
 * @param {number} alpha
 * @return {string}
 */
Box2D.Dynamics.b2DebugDraw.prototype._color = function (color, alpha) {
    return "rgba(" + ((color & 0xFF0000) >> 16) + "," + ((color & 0xFF00) >> 8) + "," + (color & 0xFF) + "," + alpha + ")";
};

/**
 * @param {number} flags
 */
Box2D.Dynamics.b2DebugDraw.prototype.SetFlags = function (flags) {
    this.m_drawFlags = flags;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2DebugDraw.prototype.GetFlags = function () {
    return this.m_drawFlags
};

/**
 * @param {number} flags
 */
Box2D.Dynamics.b2DebugDraw.prototype.AppendFlags = function (flags) {
    this.m_drawFlags |= flags;
};

/**
 * @param {number} flags
 */
Box2D.Dynamics.b2DebugDraw.prototype.ClearFlags = function (flags) {
    this.m_drawFlags &= ~flags;
};

/**
 * @param {CanvasRenderingContext2D} sprite
 */
Box2D.Dynamics.b2DebugDraw.prototype.SetSprite = function (sprite) {
    this.m_ctx = sprite;
};

/**
 * @return {CanvasRenderingContext2D}
 */
Box2D.Dynamics.b2DebugDraw.prototype.GetSprite = function () {
    return this.m_ctx;
};

/**
 * @param {number} drawScale
 */
Box2D.Dynamics.b2DebugDraw.prototype.SetDrawScale = function (drawScale) {
    this.m_drawScale = drawScale;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2DebugDraw.prototype.GetDrawScale = function () {
    return this.m_drawScale;
};

/**
 * @param {number} lineThickness
 */
Box2D.Dynamics.b2DebugDraw.prototype.SetLineThickness = function (lineThickness) {
    this.m_lineThickness = lineThickness;
    this.m_ctx.strokeWidth = lineThickness;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2DebugDraw.prototype.GetLineThickness = function () {
    return this.m_lineThickness;
};

/**
 * @param {number} alpha
 */
Box2D.Dynamics.b2DebugDraw.prototype.SetAlpha = function (alpha) {
    this.m_alpha = alpha;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2DebugDraw.prototype.GetAlpha = function () {
    return this.m_alpha;
};

/**
 * @param {number} alpha
 */
Box2D.Dynamics.b2DebugDraw.prototype.SetFillAlpha = function (alpha) {
    this.m_fillAlpha = alpha;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2DebugDraw.prototype.GetFillAlpha = function () {
    return this.m_fillAlpha;
};

/**
 * @param {number} scale
 */
Box2D.Dynamics.b2DebugDraw.prototype.SetXFormScale = function (scale) {
    this.m_xformScale = scale;
};

/**
 * @return {number}
 */
Box2D.Dynamics.b2DebugDraw.prototype.GetXFormScale = function () {
    return this.m_xformScale;
};

(function (b2DebugDraw) {
   b2DebugDraw.prototype.DrawPolygon = function (vertices, vertexCount, color) {
      if (!vertexCount) return;
      var s = this.m_ctx;
      var drawScale = this.m_drawScale;
      s.beginPath();
      s.strokeStyle = this._color(color.GetColor(), this.m_alpha);
      s.moveTo(vertices[0].x * drawScale, vertices[0].y * drawScale);
      for (var i = 1; i < vertexCount; i++) {
         s.lineTo(vertices[i].x * drawScale, vertices[i].y * drawScale);
      }
      s.lineTo(vertices[0].x * drawScale, vertices[0].y * drawScale);
      s.closePath();
      s.stroke();
   };
   b2DebugDraw.prototype.DrawSolidPolygon = function (vertices, vertexCount, color) {
      if (!vertexCount) return;
      var s = this.m_ctx;
      var drawScale = this.m_drawScale;
      s.beginPath();
      s.strokeStyle = this._color(color.GetColor(), this.m_alpha);
      s.fillStyle = this._color(color.GetColor(), this.m_fillAlpha);
      s.moveTo(vertices[0].x * drawScale, vertices[0].y * drawScale);
      for (var i = 1; i < vertexCount; i++) {
         s.lineTo(vertices[i].x * drawScale, vertices[i].y * drawScale);
      }
      s.lineTo(vertices[0].x * drawScale, vertices[0].y * drawScale);
      s.closePath();
      s.fill();
      s.stroke();
   };
   b2DebugDraw.prototype.DrawCircle = function (center, radius, color) {
      if (!radius) return;
      var s = this.m_ctx;
      var drawScale = this.m_drawScale;
      s.beginPath();
      s.strokeStyle = this._color(color.GetColor(), this.m_alpha);
      s.arc(center.x * drawScale, center.y * drawScale, radius * drawScale, 0, Math.PI * 2, true);
      s.closePath();
      s.stroke();
   };
   b2DebugDraw.prototype.DrawSolidCircle = function (center, radius, axis, color) {
      if (!radius) return;
      var s = this.m_ctx,
         drawScale = this.m_drawScale,
         cx = center.x * drawScale,
         cy = center.y * drawScale;
      s.moveTo(0, 0);
      s.beginPath();
      s.strokeStyle = this._color(color.GetColor(), this.m_alpha);
      s.fillStyle = this._color(color.GetColor(), this.m_fillAlpha);
      s.arc(cx, cy, radius * drawScale, 0, Math.PI * 2, true);
      s.moveTo(cx, cy);
      s.lineTo((center.x + axis.x * radius) * drawScale, (center.y + axis.y * radius) * drawScale);
      s.closePath();
      s.fill();
      s.stroke();
   };
   b2DebugDraw.prototype.DrawSegment = function (p1, p2, color) {
      var s = this.m_ctx,
         drawScale = this.m_drawScale;
      s.strokeStyle = this._color(color.GetColor(), this.m_alpha);
      s.beginPath();
      s.moveTo(p1.x * drawScale, p1.y * drawScale);
      s.lineTo(p2.x * drawScale, p2.y * drawScale);
      s.closePath();
      s.stroke();
   };
   b2DebugDraw.prototype.DrawTransform = function (xf) {
      var s = this.m_ctx,
         drawScale = this.m_drawScale;
      s.beginPath();
      s.strokeStyle = this._color(0xff0000, this.m_alpha);
      s.moveTo(xf.position.x * drawScale, xf.position.y * drawScale);
      s.lineTo((xf.position.x + this.m_xformScale * xf.R.col1.x) * drawScale, (xf.position.y + this.m_xformScale * xf.R.col1.y) * drawScale);

      s.strokeStyle = this._color(0xff00, this.m_alpha);
      s.moveTo(xf.position.x * drawScale, xf.position.y * drawScale);
      s.lineTo((xf.position.x + this.m_xformScale * xf.R.col2.x) * drawScale, (xf.position.y + this.m_xformScale * xf.R.col2.y) * drawScale);
      s.closePath();
      s.stroke();
   };

})(Box2D.Dynamics.b2DebugDraw);

/**
 * @const
 * @type {number}
 */
Box2D.Dynamics.b2DebugDraw.e_shapeBit = 0x0001;

/**
 * @const
 * @type {number}
 */
Box2D.Dynamics.b2DebugDraw.e_jointBit = 0x0002;

/**
 * @const
 * @type {number}
 */
Box2D.Dynamics.b2DebugDraw.e_aabbBit = 0x0004;

/**
 * @const
 * @type {number}
 */
Box2D.Dynamics.b2DebugDraw.e_pairBit = 0x0008;

/**
 * @const
 * @type {number}
 */
Box2D.Dynamics.b2DebugDraw.e_centerOfMassBit = 0x0010;

/**
 * @const
 * @type {number}
 */
Box2D.Dynamics.b2DebugDraw.e_controllerBit = 0x0020;
