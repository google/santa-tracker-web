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
 
goog.provide('Box2D.Common.Math.b2Math');

goog.require('Box2D.Common.Math.b2Mat22');
goog.require('Box2D.Common.Math.b2Vec2');

Box2D.Common.Math.b2Math = {};

/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {!Box2D.Common.Math.b2Vec2} b
 * @return {number}
 */
Box2D.Common.Math.b2Math.Dot = function (a, b) {
  return a.x * b.x + a.y * b.y;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {!Box2D.Common.Math.b2Vec2} b
 * @return {number}
 */
Box2D.Common.Math.b2Math.CrossVV = function (a, b) {
  return a.x * b.y - a.y * b.x;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {number} s
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.CrossVF = function (a, s) {
  return Box2D.Common.Math.b2Vec2.Get(s * a.y, (-s * a.x));
};

/**
 * @param {number} s
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.CrossFV = function (s, a) {
  return Box2D.Common.Math.b2Vec2.Get((-s * a.y), s * a.x);
};

/**
 * @param {!Box2D.Common.Math.b2Mat22} A
 * @param {!Box2D.Common.Math.b2Vec2} v
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.MulMV = function (A, v) {
  return Box2D.Common.Math.b2Vec2.Get(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
};

/**
 * @param {!Box2D.Common.Math.b2Mat22} A
 * @param {!Box2D.Common.Math.b2Vec2} v
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.MulTMV = function (A, v) {
  return Box2D.Common.Math.b2Vec2.Get(Box2D.Common.Math.b2Math.Dot(v, A.col1), Box2D.Common.Math.b2Math.Dot(v, A.col2));
};

/**
 * @param {!Box2D.Common.Math.b2Transform} T
 * @param {!Box2D.Common.Math.b2Vec2} v
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.MulX = function (T, v) {
  var a = Box2D.Common.Math.b2Math.MulMV(T.R, v);
  a.x += T.position.x;
  a.y += T.position.y;
  return a;
};

/**
 * @param {!Box2D.Common.Math.b2Transform} T
 * @param {!Box2D.Common.Math.b2Vec2} v
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.MulXT = function (T, v) {
  var a = Box2D.Common.Math.b2Math.SubtractVV(v, T.position);
  var tX = (a.x * T.R.col1.x + a.y * T.R.col1.y);
  a.y = (a.x * T.R.col2.x + a.y * T.R.col2.y);
  a.x = tX;
  return a;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {!Box2D.Common.Math.b2Vec2} b
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.AddVV = function (a, b) {
  return Box2D.Common.Math.b2Vec2.Get(a.x + b.x, a.y + b.y);
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {!Box2D.Common.Math.b2Vec2} b
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.SubtractVV = function (a, b) {
  return Box2D.Common.Math.b2Vec2.Get(a.x - b.x, a.y - b.y);
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {!Box2D.Common.Math.b2Vec2} b
 * @return {number}
 */
Box2D.Common.Math.b2Math.Distance = function (a, b) {
  return Math.sqrt(Box2D.Common.Math.b2Math.DistanceSquared(a,b));
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {!Box2D.Common.Math.b2Vec2} b
 * @return {number}
 */
Box2D.Common.Math.b2Math.DistanceSquared = function (a, b) {
  var cX = a.x - b.x;
  var cY = a.y - b.y;
  return (cX * cX + cY * cY);
};

/**
 * @param {number} s
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.MulFV = function (s, a) {
  return Box2D.Common.Math.b2Vec2.Get(s * a.x, s * a.y);
};

/**
 * @param {!Box2D.Common.Math.b2Mat22} A
 * @param {!Box2D.Common.Math.b2Mat22} B
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Math.AddMM = function (A, B) {
  var v1 = Box2D.Common.Math.b2Math.AddVV(A.col1, B.col1);
  var v2 = Box2D.Common.Math.b2Math.AddVV(A.col2, B.col2);
  var m = Box2D.Common.Math.b2Mat22.FromVV(v1, v2);
  Box2D.Common.Math.b2Vec2.Free(v1);
  Box2D.Common.Math.b2Vec2.Free(v2);
  return m;
};

/**
 * @param {!Box2D.Common.Math.b2Mat22} A
 * @param {!Box2D.Common.Math.b2Mat22} B
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Math.MulMM = function (A, B) {
  var v1 = Box2D.Common.Math.b2Math.MulMV(A, B.col1);
  var v2 = Box2D.Common.Math.b2Math.MulMV(A, B.col2);
  var m = Box2D.Common.Math.b2Mat22.FromVV(v1, v2);
  Box2D.Common.Math.b2Vec2.Free(v1);
  Box2D.Common.Math.b2Vec2.Free(v2);
  return m;
};

/**
 * @param {!Box2D.Common.Math.b2Mat22} A
 * @param {!Box2D.Common.Math.b2Mat22} B
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Math.MulTMM = function (A, B) {
  var c1 = Box2D.Common.Math.b2Vec2.Get(Box2D.Common.Math.b2Math.Dot(A.col1, B.col1), Box2D.Common.Math.b2Math.Dot(A.col2, B.col1));
  var c2 = Box2D.Common.Math.b2Vec2.Get(Box2D.Common.Math.b2Math.Dot(A.col1, B.col2), Box2D.Common.Math.b2Math.Dot(A.col2, B.col2));
  var m = Box2D.Common.Math.b2Mat22.FromVV(c1, c2);
  Box2D.Common.Math.b2Vec2.Free(c1);
  Box2D.Common.Math.b2Vec2.Free(c2);
  return m;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.AbsV = function (a) {
  return Box2D.Common.Math.b2Vec2.Get(Math.abs(a.x), Math.abs(a.y));
};

/**
 * @param {!Box2D.Common.Math.b2Mat22} A
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Math.AbsM = function (A) {
  var v1 = Box2D.Common.Math.b2Math.AbsV(A.col1);
  var v2 = Box2D.Common.Math.b2Math.AbsV(A.col2)
  var m = Box2D.Common.Math.b2Mat22.FromVV(v1, v2);
  Box2D.Common.Math.b2Vec2.Free(v1);
  Box2D.Common.Math.b2Vec2.Free(v2);
  return m;
};

/**
 * @param {number} a
 * @param {number} low
 * @param {number} high
 * @return {number}
 */
Box2D.Common.Math.b2Math.Clamp = function (a, low, high) {
  return a < low ? low : a > high ? high : a;
};

/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {!Box2D.Common.Math.b2Vec2} low
 * @param {!Box2D.Common.Math.b2Vec2} high
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.ClampV = function (a, low, high) {
  var x = Box2D.Common.Math.b2Math.Clamp(a.x, low.x, high.x);
  var y = Box2D.Common.Math.b2Math.Clamp(a.y, low.y, high.y);
  return Box2D.Common.Math.b2Vec2.Get(x, y);
};
