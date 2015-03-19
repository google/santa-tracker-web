/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

goog.require('Box2D');

goog.provide('b2');

/**
 * "shortcuts" to used Box2D classes.
 */
b2.Vec2 = Box2D.Common.Math.b2Vec2;
b2.Transform = Box2D.Common.Math.b2Transform;
b2.Math = Box2D.Common.Math.b2Math;
b2.BodyDef = Box2D.Dynamics.b2BodyDef;
b2.Body = Box2D.Dynamics.b2Body;
b2.FixtureDef = Box2D.Dynamics.b2FixtureDef;
b2.Fixture = Box2D.Dynamics.b2Fixture;
b2.World = Box2D.Dynamics.b2World;
b2.MassData = Box2D.Collision.Shapes.b2MassData;
b2.PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
b2.CircleShape = Box2D.Collision.Shapes.b2CircleShape;
b2.DebugDraw = Box2D.Dynamics.b2DebugDraw;
