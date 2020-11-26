/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Allocatable } from './allocatable.js';

const { Vector2 } = self.THREE;


export class AbstractShape {
  get type() {
    return 'abstract';
  }

  contains(other) {
    const tests = containmentTests[this.type];
    const test = tests && tests[other.type];

    if (test != null) {
      return test(this, other);
    }

    console.warn('Containment test attempted between two unsupported types:',
        this, other);
    return false;

  }

  intersects(other) {
    const tests = intersectionTests[this.type];
    const test = tests && tests[other.type];

    if (test != null) {
      return test(this, other);
    }

    console.warn('Intersection test attempted between two unsupported types:',
        this, other);
    return false;
  }
};


/**
 * @constructor
 * @extends {AbstractShape}
 * @implements {AllocatableInterface}
 */
const AllocatableAbstractShape = Allocatable(AbstractShape);

export class Point extends AllocatableAbstractShape {
  get type() {
    return 'point';
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get width() {
    return 1;
  }

  get height() {
    return 1;
  }

  onAllocated(position) {
    this.position = position;
  }

  onFreed() {
    this.position = null;
  }
};


export class Line extends AllocatableAbstractShape {
  get type() {
    return 'line';
  }

  get x() {
    return this.midpoint.x;
  }

  get y() {
    return this.midpoint.y;
  }

  get width() {
    return Math.abs(this.a.x - this.b.x);
  }

  get height() {
    return Math.abs(this.a.y - this.b.y);
  }

  constructor() {
    super();
    this.midpoint = new Vector2();
  }

  onAllocated(a, b) {
    this.a = a;
    this.b = b;
    this.midpoint.set((this.a.x + this.b.x) / 2, (this.a.y + this.b.y) / 2);
  }

  onFreed() {
    this.a = null;
    this.b = null;
  }
};


export class Circle extends AllocatableAbstractShape {
  get type() {
    return 'circle';
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get width() {
    return this.radius * 2;
  }

  get height() {
    return this.width;
  }

  onAllocated(radius, position) {
    this.radius = radius;
    this.position = position;
    this.radiusSquared = radius * radius;
  }

  onFreed() {
    this.radius = 0;
    this.position = null;
    this.radiusSquared = 0;
  }
};


export class Rectangle extends AllocatableAbstractShape {
  get type() {
    return 'rectangle';
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get left() {
    return this.position.x - this.halfWidth;
  }

  get right() {
    return this.position.x + this.halfWidth;
  }

  get top() {
    return this.position.y + this.halfHeight;
  }

  get bottom() {
    return this.position.y - this.halfHeight;
  }

  constructor() {
    super();
  }

  onAllocated(width, height, position = new Vector2()) {
    this.width = width;
    this.height = height;
    this.position = position;

    this.halfWidth = width / 2;
    this.halfHeight = height / 2;
  }

  onFreed() {
    this.width = 0;
    this.height = 0;
    this.position = null;

    this.halfWidth = 0;
    this.halfHeight = 0;
  }
};


// @see https://www.gamedev.net/articles/programming/math-and-physics/diy-2d-vector-physics-r4106/
export const lineIntersectsLine = (() => {
  const u0 = new Vector2();
  const u1 = new Vector2();
  const v0 = new Vector2();
  const v1 = new Vector2();

  return (a, b) => {
    v0.subVectors(a.b, a.a);
    v1.subVectors(a.a, b.a);
    u0.subVectors(b.b, b.a);
    u1.subVectors(a.b, b.b);

    const d = u0[0] * v0[1] - u0[1] * v0[0];
    const r = (v1.y * v0.x - v1.x * v0.y) / d;
    const s = (v1.y * u0.x - v1.x * u0.y) / d;

    return 0 <= r && r <= 1 && 0 <= s && s <= 1;
  };
})();

export const circleIntersectsCircle = (() => {
  const delta = new Vector2();

  return (a, b) => {
    const proximity = delta.subVectors(a.position, b.position).length();
    const tangentDistance = a.radius + b.radius;

    return proximity < tangentDistance;
  };
})();

export const rectangleIntersectsRectangle = (() => {
  return (a, b) => {
    if (b.left > a.right ||
        b.right < a.left ||
        b.top < a.bottom ||
        b.bottom > a.top) {
      return false;
    }

    return true;
  };

  return (a, b) => {
    if ((a.x + a.width) < b.x ||
        (b.x + b.width) < a.x ||
        (a.y + a.height) < b.y ||
        (b.y + b.height) < a.y) {
      return false
    }

    return true;
  };
})();

// @see https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection#402010
export const circleIntersectsRectangle = (() => {
  const circleDistance = new Vector2();

  return (circle, rectangle) => {
    circleDistance.subVectors(circle.position, rectangle.position);
    circleDistance.x = Math.abs(circleDistance.x);
    circleDistance.y = Math.abs(circleDistance.y);

    if (circleDistance.x > (rectangle.halfWidth + circle.radius)) {
      return false;
    }

    if (circleDistance.y > (rectangle.halfHeight + circle.radius)) {
      return false;
    }

    if (circleDistance.x <= rectangle.halfWidth ||
        circleDistance.y <= rectangle.halfHeight) {
      return true;
    }

    const cornerDistanceSquared =
        Math.pow(circleDistance.x - rectangle.halfWidth, 2) +
        Math.pow(circleDistance.y - rectangle.halfHeight, 2);

    return cornerDistanceSquared <= circle.radiusSquared;
  };
})();

export const pointIntersectsCircle = (() => {
  const delta = new Vector2();

  return (point, circle) => {
    const distance = delta.subVectors(point.position, circle.position).length();
    return distance <= circle.radius;
  };
})();

export const pointIntersectsRectangle = (() => {
  return (point, rectangle) => {
    if (point.x < (rectangle.x - rectangle.halfWidth) ||
        point.x > (rectangle.x + rectangle.halfHeight) ||
        point.y < (rectangle.y - rectangle.halfHeight) ||
        point.y > (rectangle.y + rectangle.halfHeight)) {
      return false;
    }

    return true;
  };
})();

// @see https://www.gamedev.net/articles/programming/math-and-physics/diy-2d-vector-physics-r4106/
export const lineIntersectsRectangle = (() => {
  const intermediateLine = new Line();

  return (line, rectangle) => {
    let intersects = false;

    for (let i = 0, v0 = rectangle.bl; i < rectangle.vertices.length; ++i) {
      let v1 = rectangle.vertices[i];

      intermediateLine.onAllocated(v0, v1);

      if (lineIntersectsLine(line, intermediateLine)) {
        intersects = true;
        break;
      }

      v0 = v1;
    }

    intermediateLine.onFreed();
    return false;
  };
})();


export const intersectionTests = {
  point: {
    point: (point, other) => point.x === other.x && point.y === other.y,
    rectangle: (point, rectangle) =>
        pointIntersectsRectangle(point, rectangle),
    circle: (point, circle) => pointIntersectsCircle(point, circle)
  },
  line: {
    rectangle: (line, rectangle) => lineIntersectsRectangle(line, rectangle),
    line: (line, other) => lineIntersectsLine(line, other)
  },
  circle: {
    circle: (circle, other) => circleIntersectsCircle(circle, other),
    rectangle: (circle, rectangle) =>
        circleIntersectsRectangle(circle, rectangle),
    point: (circle, point) => pointIntersectsCircle(point, circle)
  },
  rectangle: {
    point: (rectangle, point) => pointIntersectsRectangle(point, rectangle),
    line: (rectangle, line) => lineIntersectsRectangle(line, rectangle),
    circle: (rectangle, circle) => circleIntersectsRectangle(circle, rectangle),
    rectangle: (rectangle, other) =>
        rectangleIntersectsRectangle(rectangle, other)
  }
};


export const rectangleContainsPoint = (rectangle, point) => {
  if (point.x < rectangle.left || point.x > rectangle.right ||
      point.y < rectangle.bottom || point.y > rectangle.top) {
    return false;
  }

  return true;
};

export const rectangleContainsRectangle = (() => {
  const point = new Vector2();

  return (rectangle, other) => {
    point.set(other.left, other.top);

    if (!rectangleContainsPoint(rectangle, point)) {
      return false;
    }

    point.set(other.right, other.bottom);

    if (!rectangleContainsPoint(rectangle, point)) {
      return false;
    }

    return true;
  };
})();

export const rectangleContainsCircle = (rectangle, circle) => {
  if ((circle.x - circle.radius) < rectangle.left ||
      (circle.x + circle.radius) > rectangle.right ||
      (circle.y - circle.radius) > rectangle.top ||
      (circle.y + circle.radius) < rectangle.bottom) {
    return false;
  }

  return true;
};

export const circleContainsPoint = (circle, point) => {
  return circle.position.distanceTo(point.position) <= circle.radius;
};

export const containmentTests = {
  circle: {
    point: circleContainsPoint,
  },

  rectangle: {
    point: rectangleContainsPoint,
    rectangle: rectangleContainsRectangle,
    circle: rectangleContainsCircle
  }
};
